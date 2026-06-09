import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { OhlcvCandle } from '@/types/onchain'

interface VolumeTimelineChartProps {
  candles: OhlcvCandle[]
  height?: number
}

function formatLabel(ts: string, spanDays: number): string {
  const d = new Date(ts)
  if (spanDays > 14) {
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  }
  return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric' })
}

export function VolumeTimelineChart({ candles, height = 260 }: VolumeTimelineChartProps) {
  if (!candles.length) {
    return (
      <div className="flex items-center justify-center text-sm text-dark-500" style={{ height }}>
        No volume data for this range.
      </div>
    )
  }

  const spanDays = Math.max(
    1,
    Math.ceil(
      (new Date(candles[candles.length - 1].timestamp).getTime() -
        new Date(candles[0].timestamp).getTime()) /
        86400000,
    ),
  )

  const data = candles.map((c) => ({
    time: formatLabel(c.timestamp, spanDays),
    volume: c.volume_usd,
  }))

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} interval="preserveStartEnd" />
        <YAxis
          tick={{ fontSize: 10, fill: '#64748b' }}
          tickLine={false}
          width={48}
          tickFormatter={(v: number) => (v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v.toFixed(0)}`)}
        />
        <Tooltip
          contentStyle={{
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: 8,
            fontSize: 12,
          }}
          formatter={(value) => [`$${Number(value ?? 0).toLocaleString()}`, 'Volume']}
        />
        <Bar dataKey="volume" fill="#6366f1" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
