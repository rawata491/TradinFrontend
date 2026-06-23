import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { analyticsApi } from '@/services/analyticsApi'
import { OrderBookPanel } from '@/components/analytics/OrderBookPanel'
import { RecentTradesTape } from '@/components/coin/RecentTradesTape'
import { PracticeOrderForm } from '@/components/practice/PracticeOrderForm'
import { PracticePositions } from '@/components/practice/PracticePositions'
import { usePaperTrading } from '@/hooks/usePaperTrading'
import type { MarketTradesResponse } from '@/types'

const STORAGE_KEY = 'tradin.coinWorkspaceOpen'

export function CoinTraderWorkspace({
  productId,
  marketPrice,
  trades,
}: {
  productId: string
  marketPrice: number | null
  trades: MarketTradesResponse | null
}) {
  const [open, setOpen] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) !== 'false'
    } catch {
      return true
    }
  })
  const [orderBook, setOrderBook] = useState<Awaited<ReturnType<typeof analyticsApi.orderbook>> | null>(
    null,
  )
  const [bookLoading, setBookLoading] = useState(false)
  const { openPositionViews, isLoading, closeTrade, closeTradePartial } = usePaperTrading()

  const symbolViews = openPositionViews.filter((v) => v.trade.product_id === productId)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(open))
    } catch {
      /* ignore */
    }
  }, [open])

  useEffect(() => {
    if (!open || !productId) return
    let cancelled = false
    setBookLoading(true)
    void analyticsApi
      .orderbook(productId, 15)
      .then((data) => {
        if (!cancelled) setOrderBook(data)
      })
      .catch(() => {
        if (!cancelled) setOrderBook(null)
      })
      .finally(() => {
        if (!cancelled) setBookLoading(false)
      })
    const interval = window.setInterval(() => {
      void analyticsApi.orderbook(productId, 15).then(setOrderBook).catch(() => {})
    }, 15000)
    return () => {
      cancelled = true
      window.clearInterval(interval)
    }
  }, [open, productId])

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden lg:flex fixed right-0 top-1/2 -translate-y-1/2 z-20 items-center gap-1 bg-dark-900 border border-dark-700 border-r-0 rounded-l-lg px-2 py-3 text-xs text-dark-300 hover:text-brand-400 shadow-lg"
        title="Show trader panel"
      >
        <ChevronLeft className="h-4 w-4" />
        Trade
      </button>
    )
  }

  return (
    <aside className="hidden lg:block w-[300px] shrink-0">
      <div className="sticky top-24 space-y-3 max-h-[calc(100vh-7rem)] overflow-y-auto pr-1">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold text-dark-300 uppercase tracking-wide">Trader panel</h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="btn-ghost p-1 text-dark-500 hover:text-dark-200"
            title="Hide panel"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="card p-3">
          <h3 className="text-xs font-semibold text-dark-200 mb-2">Order book</h3>
          {bookLoading && !orderBook ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-brand-500" />
            </div>
          ) : (
            <OrderBookPanel data={orderBook ?? undefined} compact />
          )}
        </div>

        {trades?.trades?.length ? (
          <div className="card p-3">
            <RecentTradesTape trades={trades.trades} limit={8} compact />
          </div>
        ) : null}

        <div className="card p-3">
          <PracticeOrderForm
            productId={productId}
            marketPrice={marketPrice}
            compact
          />
        </div>

        {symbolViews.length > 0 || isLoading ? (
          <div className="space-y-2">
            <PracticePositions
              views={symbolViews}
              isLoading={isLoading}
              onClose={closeTrade}
              onPartialClose={closeTradePartial}
              compact
            />
          </div>
        ) : null}
      </div>
    </aside>
  )
}
