import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import type { OpenPositionView } from '@/types/paperTrade'
import { formatPrice } from '@/utils/formatters'
import { formatPnl, formatPnlPct, sideLabel } from '@/utils/paperTrading'
import { CoinAvatar } from '@/components/CoinAvatar'

function PositionCard({
  view,
  onClose,
}: {
  view: OpenPositionView
  onClose: (id: number, price: number) => Promise<unknown>
}) {
  const { trade, currentPrice, notionalUsd, unrealized } = view
  const [closing, setClosing] = useState(false)
  const sym = trade.product_id.split('-')[0]

  const handleClose = async () => {
    if (currentPrice == null) return
    setClosing(true)
    try {
      await onClose(trade.id, currentPrice)
    } finally {
      setClosing(false)
    }
  }

  return (
    <div className="card p-4 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <CoinAvatar symbol={sym} size="md" />
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              to={`/coin/${trade.product_id}`}
              className="font-mono font-bold text-dark-50 hover:text-brand-400"
            >
              {trade.product_id}
            </Link>
            <span
              className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full ${
                trade.side === 'long'
                  ? 'bg-positive/15 text-positive'
                  : 'bg-negative/15 text-negative'
              }`}
            >
              {sideLabel(trade.side)}
            </span>
          </div>
          <p className="text-xs text-dark-500 mt-1">
            ${notionalUsd.toFixed(0)} size · Entry {formatPrice(String(trade.entry_price))}
            {currentPrice != null && <> · Now {formatPrice(String(currentPrice))}</>}
          </p>
          <p className="text-[10px] text-dark-600 mt-0.5">
            {trade.quantity.toFixed(6)} {sym} · opened{' '}
            {new Date(trade.opened_at).toLocaleString(undefined, {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 sm:flex-col sm:items-end">
        {unrealized ? (
          <div className="text-right">
            <p
              className={`text-lg font-bold font-mono ${
                unrealized.pnl >= 0 ? 'text-positive' : 'text-negative'
              }`}
            >
              {formatPnl(unrealized.pnl)}
            </p>
            <p
              className={`text-xs font-mono ${
                unrealized.pnl >= 0 ? 'text-positive' : 'text-negative'
              }`}
            >
              {formatPnlPct(unrealized.pnlPct)}
            </p>
          </div>
        ) : (
          <p className="text-xs text-dark-500">Price loading…</p>
        )}
        <button
          type="button"
          disabled={closing || currentPrice == null}
          onClick={() => void handleClose()}
          className="btn-ghost text-sm px-4 py-2 border border-dark-700 whitespace-nowrap disabled:opacity-40"
        >
          {closing ? 'Closing…' : 'Close @ market'}
        </button>
      </div>
    </div>
  )
}

export function PracticePositions({
  views,
  isLoading,
  onClose,
}: {
  views: OpenPositionView[]
  isLoading: boolean
  onClose: (id: number, price: number) => Promise<unknown>
}) {
  if (isLoading && views.length === 0) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-7 w-7 animate-spin text-brand-500" />
      </div>
    )
  }

  if (views.length === 0) {
    return (
      <div className="card p-8 text-center">
        <p className="text-dark-300 font-medium">No open positions</p>
        <p className="text-sm text-dark-500 mt-1 max-w-md mx-auto">
          Place a buy or short below, or open a chart and tap Practice trade.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-dark-200">Open positions ({views.length})</h2>
      {views.map((view) => (
        <PositionCard key={view.trade.id} view={view} onClose={onClose} />
      ))}
    </div>
  )
}
