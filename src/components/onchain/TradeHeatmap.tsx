import type { TradeHeatmapData } from '@/types/onchain'

interface TradeHeatmapProps {
  data: TradeHeatmapData | null
  isLoading?: boolean
}

function formatBucketLabel(iso: string, mode: string): string {
  const date = new Date(iso)
  if (mode === 'daily') {
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  }
  if (mode === 'six_hourly') {
    return date.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric' })
  }
  return date.toLocaleTimeString(undefined, { hour: 'numeric' })
}

function tickIndices(count: number): number[] {
  if (count <= 1) return [0]
  const maxTicks = 5
  const step = Math.max(1, Math.floor((count - 1) / (maxTicks - 1)))
  const ticks: number[] = []
  for (let i = 0; i < count; i += step) ticks.push(i)
  if (ticks[ticks.length - 1] !== count - 1) ticks.push(count - 1)
  return ticks
}

export function TradeHeatmap({ data, isLoading }: TradeHeatmapProps) {
  if (isLoading) {
    return <div className="h-28 skeleton rounded-lg" />
  }

  const buckets = data?.buckets ?? []
  if (buckets.length === 0) {
    return (
      <p className="text-[10px] text-dark-500">
        No volume data for this range.
      </p>
    )
  }

  const maxTotal = Math.max(...buckets.map((b) => b.total_usd), 1)
  const ticks = tickIndices(buckets.length)
  const mode = data?.bucket_mode ?? 'six_hourly'

  return (
    <div className="space-y-2">
      <div className="flex items-end gap-px h-28">
        {buckets.map((b, i) => {
          const intensity = b.total_usd / maxTotal
          const buyRatio = b.total_usd > 0 ? b.buy_usd / b.total_usd : 0.5
          const r = buyRatio < 0.5 ? Math.round(239 * (1 - buyRatio * 2)) : 34
          const g = buyRatio >= 0.5 ? Math.round(197 * buyRatio * 2) : 34
          const hasData = b.total_usd > 0
          const label = formatBucketLabel(b.label, mode)
          return (
            <div
              key={i}
              className={`flex-1 rounded-sm min-w-[2px] transition-opacity ${
                hasData ? 'opacity-90 hover:opacity-100' : 'opacity-20'
              }`}
              style={{
                height: hasData ? `${Math.max(intensity * 100, 8)}%` : '2px',
                backgroundColor: hasData
                  ? `rgba(${r}, ${g}, 100, ${0.35 + intensity * 0.65})`
                  : 'rgba(100, 116, 139, 0.25)',
              }}
              title={
                hasData
                  ? `${label}: $${b.total_usd.toFixed(0)} (${b.buy_usd.toFixed(0)} buy / ${b.sell_usd.toFixed(0)} sell est.)`
                  : `${label}: no activity`
              }
            />
          )
        })}
      </div>
      <div className="relative h-4">
        {ticks.map((idx) => {
          const pct = buckets.length <= 1 ? 0 : (idx / (buckets.length - 1)) * 100
          return (
            <span
              key={idx}
              className="absolute text-[10px] text-dark-600 -translate-x-1/2 whitespace-nowrap"
              style={{ left: `${pct}%` }}
            >
              {formatBucketLabel(buckets[idx].label, mode)}
            </span>
          )
        })}
      </div>
      {data && data.trade_count > 0 && (
        <p className="text-[10px] text-dark-600">
          {data.trade_count} periods · {data.active_buckets} active · {data.data_source ?? 'geckoterminal'}
        </p>
      )}
    </div>
  )
}
