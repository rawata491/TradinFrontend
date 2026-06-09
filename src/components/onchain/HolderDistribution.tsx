import type { HolderSnapshot } from '@/types/onchain'

interface HolderDistributionProps {
  snapshots: HolderSnapshot[]
}

export function HolderDistribution({ snapshots }: HolderDistributionProps) {
  const latest = snapshots[0]
  if (!latest) {
    return (
      <div className="text-sm text-dark-500 py-6 text-center">No holder data available.</div>
    )
  }

  const top10 = latest.top10_pct
  const top50Rest = Math.max(latest.top50_pct - top10, 0)
  const retail = Math.max(100 - latest.top50_pct, 0)

  const segments = [
    { label: 'Top 10', pct: top10, color: 'bg-brand-500' },
    { label: 'Top 11–50', pct: top50Rest, color: 'bg-brand-400/70' },
    { label: 'Retail', pct: retail, color: 'bg-dark-700' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <span className="stat-label">Total Holders</span>
        <span className="stat-value">{latest.holder_count.toLocaleString()}</span>
      </div>

      <div className="h-4 rounded-full overflow-hidden flex bg-dark-800">
        {segments.map((s) =>
          s.pct > 0 ? (
            <div
              key={s.label}
              className={`${s.color} transition-all`}
              style={{ width: `${s.pct}%` }}
              title={`${s.label}: ${s.pct.toFixed(1)}%`}
            />
          ) : null,
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-sm ${s.color}`} />
            <div>
              <p className="text-dark-400">{s.label}</p>
              <p className="font-mono text-dark-200">{s.pct.toFixed(1)}%</p>
            </div>
          </div>
        ))}
      </div>

      {snapshots.length > 1 && (
        <div className="pt-2 border-t border-dark-800">
          <p className="text-xs text-dark-500 mb-2">Holder history</p>
          <div className="flex items-end gap-1 h-12">
            {snapshots
              .slice()
              .reverse()
              .slice(-20)
              .map((s, i) => {
                const max = Math.max(...snapshots.map((x) => x.holder_count), 1)
                const h = (s.holder_count / max) * 100
                return (
                  <div
                    key={i}
                    className="flex-1 bg-brand-500/40 rounded-t hover:bg-brand-500/60 transition-colors"
                    style={{ height: `${Math.max(h, 4)}%` }}
                    title={`${s.holder_count} holders`}
                  />
                )
              })}
          </div>
        </div>
      )}
    </div>
  )
}
