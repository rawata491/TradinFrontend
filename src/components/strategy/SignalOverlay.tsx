import { useStrategyStore } from '@/store/useStrategyStore'
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import type { Signal } from '@/types/signal'

function SignalRow({ signal }: { signal: Signal }) {
  const isBuy = signal.direction === 'buy'

  return (
    <div className="flex items-center gap-3 px-3 py-2.5 border-b border-dark-800 last:border-0 hover:bg-dark-800/30 transition-colors">
      {/* Direction badge */}
      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
        isBuy
          ? 'bg-positive/15 text-positive'
          : 'bg-negative/15 text-negative'
      }`}>
        {isBuy
          ? <ArrowUpRight className="w-4 h-4" />
          : <ArrowDownRight className="w-4 h-4" />
        }
      </div>

      {/* Label + bar */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold uppercase tracking-wide ${
            isBuy ? 'text-positive' : 'text-negative'
          }`}>
            {signal.label}
          </span>
          <span className="badge-positive text-[10px] px-1.5 py-0"
            style={{ background: isBuy ? undefined : undefined }}>
            Bar {signal.bar_index}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-dark-100 font-mono">
            ${signal.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </span>
          {signal.metadata?.pnl_pct !== undefined && (
            <span className={`text-xs font-mono ${
              (signal.metadata.pnl_pct as number) >= 0 ? 'text-positive' : 'text-negative'
            }`}>
              {(signal.metadata.pnl_pct as number) >= 0 ? '+' : ''}
              {(signal.metadata.pnl_pct as number).toFixed(2)}%
            </span>
          )}
        </div>
      </div>

      {/* Timestamp */}
      <span className="text-xs text-dark-500 font-mono shrink-0">
        {signal.timestamp
          ? new Date(signal.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
          : '—'
        }
      </span>
    </div>
  )
}

export function SignalOverlay() {
  const result    = useStrategyStore(s => s.runResult)
  const runStatus = useStrategyStore(s => s.runStatus)

  if (runStatus === 'running') {
    return (
      <div className="flex items-center justify-center h-40 text-dark-400">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-positive border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Running strategy…</span>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center h-40 gap-3 text-dark-400">
        <TrendingUp className="w-8 h-8 opacity-30" />
        <span className="text-sm">Run a strategy to see signals.</span>
      </div>
    )
  }

  if (!result.success) {
    return (
      <div className="p-4 space-y-2">
        <p className="text-negative text-sm font-medium">Execution failed</p>
        {result.errors.map((e, i) => (
          <p key={i} className="text-xs text-dark-400 font-mono bg-dark-950 rounded p-2">{e}</p>
        ))}
      </div>
    )
  }

  const { signals } = result
  const entries = signals.filter(s => s.signal_type === 'entry')
  const exits   = signals.filter(s => s.signal_type === 'exit')
  const overlayKeys = Object.keys(result.indicator_overlays)

  return (
    <div className="flex flex-col">
      {/* Summary bar */}
      <div className="flex items-center gap-5 px-4 py-2.5 border-b border-dark-800 bg-dark-950">
        <div className="flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-positive" />
          <span className="text-xs text-dark-300">{entries.length} entries</span>
        </div>
        <div className="flex items-center gap-1.5">
          <TrendingDown className="w-3.5 h-3.5 text-negative" />
          <span className="text-xs text-dark-300">{exits.length} exits</span>
        </div>
        <span className="text-xs text-dark-500 ml-auto">
          {result.bars_executed} bars · {result.execution_ms}ms
        </span>
      </div>

      {/* Indicator overlays pills */}
      {overlayKeys.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-4 py-2 border-b border-dark-800 bg-dark-900">
          <span className="text-xs text-dark-500 mr-1 self-center">Overlays:</span>
          {overlayKeys.map(key => (
            <span
              key={key}
              className="text-[10px] font-mono bg-dark-800 text-dark-300 border border-dark-700 px-2 py-0.5 rounded-full"
            >
              {key}
            </span>
          ))}
        </div>
      )}

      {/* Signal list */}
      {signals.length === 0 ? (
        <div className="flex items-center justify-center h-24 text-dark-400 text-sm">
          No signals generated.
        </div>
      ) : (
        <div className="overflow-y-auto">
          {signals.map((sig, i) => <SignalRow key={i} signal={sig} />)}
        </div>
      )}
    </div>
  )
}
