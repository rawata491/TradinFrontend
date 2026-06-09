import type { OnchainTrade } from '@/types/onchain'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { formatDistanceToNow } from '@/utils/formatters'

interface DEXFlowPanelProps {
  trades: OnchainTrade[]
  buyVolume?: number
  sellVolume?: number
  showTrades?: boolean
  tradesLabel?: string
}

function truncateAddr(addr: string): string {
  if (addr.length <= 12) return addr
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

export function DEXFlowPanel({
  trades,
  buyVolume = 0,
  sellVolume = 0,
  showTrades = true,
  tradesLabel = 'Recent trades',
}: DEXFlowPanelProps) {
  const total = buyVolume + sellVolume || 1
  const buyPct = (buyVolume / total) * 100

  return (
    <div className="space-y-4">
      <div>
        <div className="flex justify-between text-xs text-dark-400 mb-1.5">
          <span className="text-positive">Buy ${buyVolume.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          <span className="text-negative">Sell ${sellVolume.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
        </div>
        <div className="h-2.5 rounded-full overflow-hidden flex bg-dark-800">
          <div className="bg-positive transition-all" style={{ width: `${buyPct}%` }} />
          <div className="bg-negative flex-1" />
        </div>
        <p className="text-xs text-dark-500 mt-1 text-center">
          Net flow:{' '}
          <span className={buyVolume >= sellVolume ? 'text-positive' : 'text-negative'}>
            ${(buyVolume - sellVolume).toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
        </p>
      </div>

      {showTrades && (
        <>
          <p className="text-xs font-medium text-dark-400">{tradesLabel}</p>
          <div className="space-y-1.5 max-h-64 overflow-y-auto">
            {trades.slice(0, 20).map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-dark-900/50 text-xs"
              >
                {t.side === 'BUY' ? (
                  <TrendingUp className="h-3.5 w-3.5 text-positive flex-shrink-0" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5 text-negative flex-shrink-0" />
                )}
                <span className="font-mono text-dark-400">{truncateAddr(t.wallet)}</span>
                <span className="text-dark-500">{t.dex || 'DEX'}</span>
                <span className="ml-auto font-mono text-dark-300">
                  ${t.usd_value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
                <span className="text-dark-600 w-12 text-right">{formatDistanceToNow(t.timestamp)}</span>
              </div>
            ))}
            {trades.length === 0 && (
              <p className="text-dark-500 text-center py-4">No live trades available for this period.</p>
            )}
          </div>
        </>
      )}
    </div>
  )
}
