import { useEffect, useRef } from 'react'
import { useAuthStore } from '@/store/useAuthStore'
import { usePortfolioStore } from '@/store/usePortfolioStore'
import { useWatchlistStore } from '@/store/useWatchlistStore'
import { userDataApi } from '@/services/userDataApi'
import { DEFAULT_WATCHLIST } from '@/utils/constants'

const DEBOUNCE_MS = 600

function sameItems(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((id, i) => id === b[i])
}

function isDefaultWatchlist(items: string[]): boolean {
  return sameItems(items, DEFAULT_WATCHLIST)
}

/** Sync watchlist + portfolio with the backend API when logged in. */
export function useUserDataSync() {
  const token = useAuthStore((s) => s.token)
  const isLoading = useAuthStore((s) => s.isLoading)
  const skipPushRef = useRef(true)
  const watchlistTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const portfolioTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (isLoading) return

    if (!token) {
      skipPushRef.current = true
      return
    }

    let cancelled = false

    const pullFromServer = async () => {
      skipPushRef.current = true
      try {
        const [serverWatchlist, serverPortfolio] = await Promise.all([
          userDataApi.getWatchlist(),
          userDataApi.getPortfolio(),
        ])
        if (cancelled) return

        const localWatchlist = useWatchlistStore.getState().items
        const localHoldings = usePortfolioStore.getState().holdings

        if (serverWatchlist.length === 0 && localWatchlist.length > 0 && !isDefaultWatchlist(localWatchlist)) {
          await userDataApi.replaceWatchlist(localWatchlist)
        } else {
          useWatchlistStore.getState().setItems(serverWatchlist)
        }

        if (serverPortfolio.length === 0 && localHoldings.length > 0) {
          await userDataApi.replacePortfolio(localHoldings)
        } else {
          usePortfolioStore.getState().setHoldings(
            serverPortfolio.map((h) => ({
              product_id: h.product_id,
              quantity: h.quantity,
              avg_cost: h.avg_cost,
              added_at: h.added_at,
            })),
          )
        }
      } catch (err) {
        console.warn('User data sync skipped:', err)
      } finally {
        if (!cancelled) {
          skipPushRef.current = false
        }
      }
    }

    void pullFromServer()

    const unsubWatchlist = useWatchlistStore.subscribe((state, prev) => {
      if (skipPushRef.current || state.items === prev.items) return
      if (watchlistTimer.current) clearTimeout(watchlistTimer.current)
      watchlistTimer.current = setTimeout(() => {
        void userDataApi.replaceWatchlist(state.items).catch((err) => {
          console.warn('Watchlist sync failed:', err)
        })
      }, DEBOUNCE_MS)
    })

    const unsubPortfolio = usePortfolioStore.subscribe((state, prev) => {
      if (skipPushRef.current || state.holdings === prev.holdings) return
      if (portfolioTimer.current) clearTimeout(portfolioTimer.current)
      portfolioTimer.current = setTimeout(() => {
        void userDataApi.replacePortfolio(state.holdings).catch((err) => {
          console.warn('Portfolio sync failed:', err)
        })
      }, DEBOUNCE_MS)
    })

    return () => {
      cancelled = true
      unsubWatchlist()
      unsubPortfolio()
      if (watchlistTimer.current) clearTimeout(watchlistTimer.current)
      if (portfolioTimer.current) clearTimeout(portfolioTimer.current)
    }
  }, [token, isLoading])
}
