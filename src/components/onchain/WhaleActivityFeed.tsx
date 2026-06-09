import { formatDistanceToNow } from '@/utils/formatters'
import type { WhaleEvent, OnchainSignal } from '@/types/onchain'
import { Fish, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'

interface WhaleActivityFeedProps {
  whales: WhaleEvent[]
  signals?: OnchainSignal[]
  compact?: boolean
  emptyMessage?: string
}

function truncateAddr(addr: string): string {
  if (addr.length <= 12) return addr
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

export function WhaleActivityFeed({
  whales = [],
  signals = [],
  compact = false,
  emptyMessage = 'No whale activity detected in the selected period.',
}: WhaleActivityFeedProps) {
  const items = [
    ...whales.map((w) => ({
      id: `whale-${w.id ?? w.tx_hash ?? w.wallet}`,
      type: w.event_type,
      title: w.event_type.replace(/_/g, ' '),
      description: w.description,
      usd_value: w.usd_value,
      wallet: w.wallet,
      time: w.detected_at,
      isBuy: w.event_type.includes('BUY') || w.event_type === 'ACCUMULATION',
    })),
    ...signals
      .filter((s) => s.signal_type.includes('WHALE') || s.signal_type.includes('LARGE'))
      .map((s, i) => ({
        id: `signal-${i}`,
        type: s.signal_type,
        title: s.title,
        description: s.description,
        usd_value: s.usd_value ?? 0,
        wallet: s.wallet ?? '',
        time: s.created_at ?? new Date().toISOString(),
        isBuy: s.signal_type.includes('BUY') || s.signal_type === 'ACCUMULATION',
      })),
  ].slice(0, compact ? 5 : 50)

  if (items.length === 0) {
    return (
      <div className="text-sm text-dark-500 py-8 text-center">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-start gap-3 p-3 rounded-lg bg-dark-900/50 border border-dark-800 hover:border-dark-700 transition-colors"
        >
          <div
            className={`p-2 rounded-lg flex-shrink-0 ${
              item.isBuy ? 'bg-positive/10' : 'bg-negative/10'
            }`}
          >
            {item.isBuy ? (
              <TrendingUp className="h-4 w-4 text-positive" />
            ) : item.type.includes('COORDINATED') ? (
              <AlertTriangle className="h-4 w-4 text-yellow-400" />
            ) : (
              <TrendingDown className="h-4 w-4 text-negative" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Fish className="h-3.5 w-3.5 text-dark-500 flex-shrink-0" />
              <span className="text-sm font-medium text-dark-100 truncate">{item.title}</span>
              {item.usd_value > 0 && (
                <span className="text-xs font-mono text-dark-400 ml-auto flex-shrink-0">
                  ${item.usd_value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              )}
            </div>
            <p className="text-xs text-dark-400 mt-0.5 line-clamp-2">{item.description}</p>
            <div className="flex items-center gap-2 mt-1 text-xs text-dark-600">
              {item.wallet && item.wallet !== 'coordinated' && (
                <span className="font-mono">{truncateAddr(item.wallet)}</span>
              )}
              <span>{formatDistanceToNow(item.time)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
