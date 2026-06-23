import { useEffect, useState } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { Loader2 } from 'lucide-react'
import { paperTradingApi } from '@/services/paperTradingApi'
import type { PaperJournalAnalytics } from '@/types/paperTrade'
import { formatPnl } from '@/utils/paperTrading'

export function PracticeJournalAnalytics() {
  const [data, setData] = useState<PaperJournalAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void paperTradingApi
      .journal()
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load analytics'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    )
  }

  if (error || !data) {
    return <p className="text-sm text-negative text-center py-8">{error ?? 'No data'}</p>
  }

  const chartData = data.equity_curve.map((p) => ({
    date: p.date,
    equity: p.equity,
    pnl: p.cumulative_pnl,
  }))

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <p className="stat-label">Realized P&amp;L</p>
          <p className={`text-xl font-bold font-mono ${data.total_realized_pnl >= 0 ? 'text-positive' : 'text-negative'}`}>
            {formatPnl(data.total_realized_pnl)}
          </p>
        </div>
        <div className="card p-4">
          <p className="stat-label">Win rate</p>
          <p className="text-xl font-bold font-mono">{data.win_rate_pct.toFixed(1)}%</p>
        </div>
        <div className="card p-4">
          <p className="stat-label">Trades</p>
          <p className="text-xl font-bold font-mono">{data.trade_count}</p>
        </div>
        <div className="card p-4">
          <p className="stat-label">Max drawdown</p>
          <p className="text-xl font-bold font-mono text-negative">{data.max_drawdown_pct.toFixed(1)}%</p>
        </div>
      </div>

      {chartData.length > 0 && (
        <div className="card p-4">
          <h3 className="text-sm font-semibold text-dark-200 mb-4">Equity curve</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} width={60} />
                <Tooltip />
                <Area type="monotone" dataKey="equity" stroke="#6366f1" fill="#6366f133" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <div className="card p-4">
          <h3 className="text-sm font-semibold text-dark-200 mb-3">P&amp;L by symbol</h3>
          <ul className="space-y-2 text-sm">
            {Object.entries(data.by_symbol).map(([sym, pnl]) => (
              <li key={sym} className="flex justify-between font-mono">
                <span className="text-dark-400">{sym}</span>
                <span className={pnl >= 0 ? 'text-positive' : 'text-negative'}>{formatPnl(pnl)}</span>
              </li>
            ))}
            {!Object.keys(data.by_symbol).length && (
              <li className="text-dark-500 text-xs">No closed trades yet</li>
            )}
          </ul>
        </div>
        <div className="card p-4">
          <h3 className="text-sm font-semibold text-dark-200 mb-3">P&amp;L by source</h3>
          <ul className="space-y-2 text-sm">
            {Object.entries(data.by_source).map(([src, pnl]) => (
              <li key={src} className="flex justify-between font-mono capitalize">
                <span className="text-dark-400">{src.replace('_', ' ')}</span>
                <span className={pnl >= 0 ? 'text-positive' : 'text-negative'}>{formatPnl(pnl)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
