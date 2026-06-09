import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { OhlcvCandle } from '@/types/onchain'

interface OnchainPriceChartProps {
  candles: OhlcvCandle[]
  height?: number
}

function formatTime(ts: string): string {
  const d = new Date(ts)
  if (Number.isNaN(d.getTime())) return ts
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function OnchainPriceChart({ candles, height = 280 }: OnchainPriceChartProps) {
  const data = candles.map((c) => ({
    time: formatTime(c.timestamp),
    price: c.close_usd,
    volume: c.volume_usd,
    high: c.high_usd,
    low: c.low_usd,
  }))

  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-sm text-dark-500"
        style={{ height }}
      >
        No OHLCV data for this range — try a shorter period or click Refresh.
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} />
        <YAxis
          yAxisId="price"
          tick={{ fontSize: 10, fill: '#64748b' }}
          tickLine={false}
          width={48}
          domain={['auto', 'auto']}
          tickFormatter={(v: number) => `$${v < 1 ? v.toFixed(4) : v.toFixed(2)}`}
        />
        <YAxis
          yAxisId="volume"
          orientation="right"
          tick={{ fontSize: 10, fill: '#64748b' }}
          tickLine={false}
          width={40}
          tickFormatter={(v: number) =>
            v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v.toFixed(0)}`
          }
        />
        <Tooltip
          contentStyle={{
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: 8,
            fontSize: 12,
          }}
          formatter={(value, name) => {
            const num = typeof value === 'number' ? value : Number(value ?? 0)
            if (name === 'price') return [`$${num.toFixed(6)}`, 'Close']
            if (name === 'volume') return [`$${num.toLocaleString()}`, 'Volume']
            return [String(value ?? ''), String(name)]
          }}
        />
        <Bar yAxisId="volume" dataKey="volume" fill="#6366f1" opacity={0.25} barSize={6} />
        <Line
          yAxisId="price"
          type="monotone"
          dataKey="price"
          stroke="#22c55e"
          strokeWidth={2}
          dot={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
