import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import type { LiquidityEvent } from '@/types/onchain'

interface LiquidityChartProps {
  events: LiquidityEvent[]
  height?: number
}

export function LiquidityChart({ events, height = 240 }: LiquidityChartProps) {
  const data = events
    .slice()
    .reverse()
    .reduce<{ time: string; liquidity: number; adds: number; removes: number }[]>((acc, evt) => {
      const prev = acc.length > 0 ? acc[acc.length - 1].liquidity : 0
      const delta = evt.event_type === 'ADD' ? evt.usd_value : -evt.usd_value
      const next = Math.max(prev + delta, 0)
      acc.push({
        time: new Date(evt.timestamp).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
        }),
        liquidity: next,
        adds: evt.event_type === 'ADD' ? evt.usd_value : 0,
        removes: evt.event_type === 'REMOVE' ? evt.usd_value : 0,
      })
      return acc
    }, [])

  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-sm text-dark-500"
        style={{ height }}
      >
        No liquidity events recorded.
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="liqGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} />
        <YAxis
          tick={{ fontSize: 10, fill: '#64748b' }}
          tickLine={false}
          tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip
          contentStyle={{
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: 8,
            fontSize: 12,
          }}
          formatter={(value) => [
            `$${Number(value ?? 0).toLocaleString()}`,
            'Liquidity',
          ]}
        />
        <ReferenceLine y={0} stroke="#334155" />
        <Area
          type="monotone"
          dataKey="liquidity"
          stroke="#6366f1"
          fill="url(#liqGrad)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
