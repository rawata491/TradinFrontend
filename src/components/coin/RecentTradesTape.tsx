import { Activity } from 'lucide-react'
import { formatPrice } from '@/utils/formatters'
import type { MarketTrade } from '@/types'

export function RecentTradesTape({
  trades,
  limit = 8,
  compact = false,
}: {
  trades: MarketTrade[]
  limit?: number
  compact?: boolean
}) {
  if (!trades.length) {
    return <p className="text-xs text-dark-500 py-2">No recent trades</p>
  }

  return (
    <div>
      {!compact && (
        <div className="flex items-center gap-2 mb-2">
          <Activity className="h-3.5 w-3.5 text-brand-400" />
          <span className="text-xs font-semibold text-dark-200">Recent trades</span>
          <span className="ml-auto flex items-center gap-1 text-[10px] text-positive">
            <span className="h-1.5 w-1.5 rounded-full bg-positive animate-pulse" />
            Live
          </span>
        </div>
      )}
      <div className={compact ? 'space-y-0.5 max-h-40 overflow-y-auto' : 'overflow-x-auto'}>
        {compact ? (
          trades.slice(0, limit).map((trade) => (
            <div
              key={trade.trade_id}
              className="flex justify-between text-[11px] font-mono py-0.5"
            >
              <span className={trade.side === 'BUY' ? 'text-positive' : 'text-negative'}>
                {trade.side}
              </span>
              <span className="text-dark-200">{formatPrice(trade.price)}</span>
              <span className="text-dark-500">{parseFloat(trade.size).toFixed(4)}</span>
            </div>
          ))
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-dark-400 border-b border-dark-800">
                <th className="px-2 py-1.5 text-left font-medium">Side</th>
                <th className="px-2 py-1.5 text-right font-medium">Price</th>
                <th className="px-2 py-1.5 text-right font-medium">Size</th>
                <th className="px-2 py-1.5 text-right font-medium">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-800/50">
              {trades.slice(0, limit).map((trade) => (
                <tr key={trade.trade_id}>
                  <td className="px-2 py-1.5">
                    <span
                      className={`text-xs font-semibold ${
                        trade.side === 'BUY' ? 'text-positive' : 'text-negative'
                      }`}
                    >
                      {trade.side}
                    </span>
                  </td>
                  <td className="px-2 py-1.5 text-right font-mono text-dark-50">
                    {formatPrice(trade.price)}
                  </td>
                  <td className="px-2 py-1.5 text-right font-mono text-dark-400">
                    {parseFloat(trade.size).toFixed(6)}
                  </td>
                  <td className="px-2 py-1.5 text-right text-dark-500 text-[10px]">
                    {new Date(trade.time).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
