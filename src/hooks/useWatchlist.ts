import { useEffect, useRef, useState } from 'react'
import { useMarketStore } from '@/store/useMarketStore'
import { useWatchlistStore } from '@/store/useWatchlistStore'
import { productApi } from '@/services/api'
import type { Product } from '@/types'

/** Watchlist with backfilled product details for coins outside the dashboard top-N. */
export function useWatchlist() {
  const watchlistItems = useWatchlistStore((s) => s.items)
  const addItem = useWatchlistStore((s) => s.addItem)
  const removeItem = useWatchlistStore((s) => s.removeItem)
  const toggleItem = useWatchlistStore((s) => s.toggleItem)
  const isWatched = useWatchlistStore((s) => s.isWatched)

  const products = useMarketStore((s) => s.products)
  const tickers = useMarketStore((s) => s.tickers)
  const [extraProducts, setExtraProducts] = useState<Record<string, Product>>({})
  const fetchedRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    const missing = watchlistItems.filter(
      (id) =>
        !products.some((p) => p.product_id === id) &&
        !fetchedRef.current.has(id),
    )
    if (!missing.length) return

    let cancelled = false
    for (const id of missing) fetchedRef.current.add(id)

    void Promise.all(
      missing.map(async (id) => {
        try {
          const p = await productApi.get(id)
          return [id, p] as const
        } catch {
          return null
        }
      }),
    ).then((rows) => {
      if (cancelled) return
      const next: Record<string, Product> = {}
      for (const row of rows) {
        if (row) next[row[0]] = row[1]
      }
      if (Object.keys(next).length) {
        setExtraProducts((prev) => ({ ...prev, ...next }))
      }
    })
    return () => { cancelled = true }
  }, [watchlistItems, products])

  const watchlistProducts: Product[] = watchlistItems
    .map((id) => {
      const product = products.find((p) => p.product_id === id) ?? extraProducts[id]
      if (!product) return null
      const ticker = tickers[id]
      if (ticker) {
        return {
          ...product,
          price: ticker.price || product.price,
          price_percentage_change_24h:
            ticker.price_percent_chg_24_h || product.price_percentage_change_24h,
          volume_24h: ticker.volume_24_h || product.volume_24h,
        }
      }
      return product
    })
    .filter(Boolean) as Product[]

  return {
    watchlistItems,
    watchlistProducts,
    addItem,
    removeItem,
    toggleItem,
    isWatched,
    count: watchlistItems.length,
  }
}
