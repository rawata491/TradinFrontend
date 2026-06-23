import type { OrderBookData } from '@/services/analyticsApi'

export function OrderBookPanel({
  data,
  compact = false,
}: {
  data?: OrderBookData | Record<string, unknown>
  compact?: boolean
}) {
  if (!data) return null
  const bids = (data.bids as Array<{ price: number; size: number }>) ?? []
  const asks = (data.asks as Array<{ price: number; size: number }>) ?? []
  const imbalance = Number(data.imbalance ?? 0)
  const depth = compact ? 8 : 10

  if (compact) {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <h3 className="text-[10px] uppercase tracking-wide text-positive mb-1.5">Bids</h3>
            {bids.slice(0, depth).map((b, i) => (
              <div key={i} className="flex justify-between text-[11px] font-mono py-0.5">
                <span className="text-positive">{b.price.toFixed(2)}</span>
                <span className="text-dark-500">{b.size.toFixed(4)}</span>
              </div>
            ))}
          </div>
          <div>
            <h3 className="text-[10px] uppercase tracking-wide text-negative mb-1.5">Asks</h3>
            {asks.slice(0, depth).map((a, i) => (
              <div key={i} className="flex justify-between text-[11px] font-mono py-0.5">
                <span className="text-negative">{a.price.toFixed(2)}</span>
                <span className="text-dark-500">{a.size.toFixed(4)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div>
            <p className="stat-label text-[10px]">Spread</p>
            <p className="font-mono text-dark-200">{Number(data.spread_pct).toFixed(4)}%</p>
          </div>
          <div>
            <p className="stat-label text-[10px]">Imbalance</p>
            <p
              className={`font-mono ${
                imbalance > 0 ? 'text-positive' : imbalance < 0 ? 'text-negative' : 'text-dark-300'
              }`}
            >
              {(imbalance * 100).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <div className="card p-4 lg:col-span-2 grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-xs text-positive mb-2">Bids</h3>
          {bids.slice(0, depth).map((b, i) => (
            <div key={i} className="flex justify-between text-xs font-mono py-0.5">
              <span className="text-positive">{b.price.toFixed(2)}</span>
              <span className="text-dark-400">{b.size.toFixed(4)}</span>
            </div>
          ))}
        </div>
        <div>
          <h3 className="text-xs text-negative mb-2">Asks</h3>
          {asks.slice(0, depth).map((a, i) => (
            <div key={i} className="flex justify-between text-xs font-mono py-0.5">
              <span className="text-negative">{a.price.toFixed(2)}</span>
              <span className="text-dark-400">{a.size.toFixed(4)}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="card p-4 space-y-3">
        <div>
          <p className="stat-label">Spread</p>
          <p className="font-mono">{Number(data.spread_pct).toFixed(4)}%</p>
        </div>
        <div>
          <p className="stat-label">Bid Depth</p>
          <p className="font-mono">${Number(data.bid_depth_usd).toLocaleString()}</p>
        </div>
        <div>
          <p className="stat-label">Ask Depth</p>
          <p className="font-mono">${Number(data.ask_depth_usd).toLocaleString()}</p>
        </div>
        <div>
          <p className="stat-label">Imbalance</p>
          <p
            className={`font-mono ${
              imbalance > 0 ? 'text-positive' : imbalance < 0 ? 'text-negative' : ''
            }`}
          >
            {(imbalance * 100).toFixed(1)}%{' '}
            {imbalance > 0 ? 'bid-heavy' : imbalance < 0 ? 'ask-heavy' : 'balanced'}
          </p>
        </div>
      </div>
    </div>
  )
}
