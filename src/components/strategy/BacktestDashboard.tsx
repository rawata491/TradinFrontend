import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, BarChart, Bar, Cell,
} from 'recharts'
import { useStrategyStore } from '@/store/useStrategyStore'
import { useThemeStore } from '@/store/useThemeStore'
import { Download } from 'lucide-react'
import type { Trade } from '@/types/backtest'

// ─────────────────────────── Theme-aware chart colours ───────────────────────

function useChartColors() {
  const theme = useThemeStore(s => s.theme)
  const isDark = theme === 'dark'
  return {
    grid:        isDark ? '#1e293b' : '#e2e8f0',
    axisText:    isDark ? '#64748b' : '#94a3b8',
    tooltipBg:   isDark ? '#0f172a' : '#ffffff',
    tooltipBorder: isDark ? '#334155' : '#e2e8f0',
    tooltipText: isDark ? '#94a3b8' : '#64748b',
    refLine:     isDark ? '#334155' : '#d1d5db',
  }
}

// ─────────────────────────── Stat card ───────────────────────────────────────

function StatCard({
  label, value, sub, positive, negative,
}: {
  label: string
  value: string
  sub?: string
  positive?: boolean
  negative?: boolean
}) {
  const valueColor = positive
    ? 'text-positive'
    : negative
    ? 'text-negative'
    : 'text-dark-50'

  return (
    <div className="card p-4 space-y-1">
      <p className="stat-label">{label}</p>
      <p className={`text-xl font-bold font-mono ${valueColor}`}>{value}</p>
      {sub && <p className="text-xs text-dark-400">{sub}</p>}
    </div>
  )
}

// ─────────────────────────── Equity chart ────────────────────────────────────

function EquityChart({ curve, initialCapital }: { curve: number[]; initialCapital: number }) {
  const c = useChartColors()
  const data = curve.map((v, i) => ({ bar: i, equity: v }))
  const final = curve[curve.length - 1] ?? initialCapital
  const color = final >= initialCapital ? '#10B981' : '#EF4444'

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0}   />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={c.grid} />
          <XAxis dataKey="bar" tick={{ fontSize: 10, fill: c.axisText }} tickLine={false} />
          <YAxis
            tick={{ fontSize: 10, fill: c.axisText }}
            tickLine={false}
            tickFormatter={v => `$${(v / 1000).toFixed(1)}k`}
            width={52}
          />
          <Tooltip
            contentStyle={{
              background: c.tooltipBg,
              border: `1px solid ${c.tooltipBorder}`,
              borderRadius: 8,
              fontSize: 12,
            }}
            labelStyle={{ color: c.tooltipText }}
            formatter={(v) => [`$${Number(v).toLocaleString(undefined, { maximumFractionDigits: 2 })}`, 'Equity']}
          />
          <ReferenceLine y={initialCapital} stroke={c.refLine} strokeDasharray="4 4" />
          <Area
            type="monotone"
            dataKey="equity"
            stroke={color}
            strokeWidth={2}
            fill="url(#equityGrad)"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// ─────────────────────────── Trade PnL chart ─────────────────────────────────

function TradePnlChart({ trades }: { trades: Trade[] }) {
  const c = useChartColors()
  const data = trades.map((t, i) => ({ n: i + 1, pnl: t.pnl_pct }))

  return (
    <div className="h-40">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={c.grid} />
          <XAxis dataKey="n" tick={{ fontSize: 10, fill: c.axisText }} tickLine={false} />
          <YAxis
            tick={{ fontSize: 10, fill: c.axisText }}
            tickLine={false}
            tickFormatter={v => `${v.toFixed(1)}%`}
            width={46}
          />
          <Tooltip
            contentStyle={{
              background: c.tooltipBg,
              border: `1px solid ${c.tooltipBorder}`,
              borderRadius: 8,
              fontSize: 12,
            }}
            labelStyle={{ color: c.tooltipText }}
            formatter={(v) => [`${Number(v).toFixed(2)}%`, 'P&L']}
          />
          <ReferenceLine y={0} stroke={c.refLine} />
          <Bar dataKey="pnl" radius={[2, 2, 0, 0]}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.pnl >= 0 ? '#10B981' : '#EF4444'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ─────────────────────────── Trade list ──────────────────────────────────────

function TradeList({ trades }: { trades: Trade[] }) {
  const setSelectedTradeIndex = useStrategyStore((s) => s.setSelectedTradeIndex)
  const setActiveTab = useStrategyStore((s) => s.setActiveTab)
  const selectedTradeIndex = useStrategyStore((s) => s.selectedTradeIndex)

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-dark-800 text-dark-400">
            <th className="py-2 px-3 text-left font-medium">#</th>
            <th className="py-2 px-3 text-left font-medium">Label</th>
            <th className="py-2 px-3 text-right font-medium">Entry</th>
            <th className="py-2 px-3 text-right font-medium">Exit</th>
            <th className="py-2 px-3 text-right font-medium">P&L</th>
          </tr>
        </thead>
        <tbody>
          {trades.slice(0, 50).map((t, i) => (
            <tr
              key={i}
              onClick={() => {
                setSelectedTradeIndex(i)
                setActiveTab('chart')
              }}
              className={`border-b border-dark-800 hover:bg-dark-800/40 transition-colors cursor-pointer ${
                selectedTradeIndex === i ? 'bg-brand-900/20' : ''
              }`}
            >
              <td className="py-1.5 px-3 text-dark-400">{i + 1}</td>
              <td className="py-1.5 px-3 font-mono text-dark-300">{t.label}</td>
              <td className="py-1.5 px-3 text-right font-mono text-dark-300">
                ${t.entry_price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </td>
              <td className="py-1.5 px-3 text-right font-mono text-dark-300">
                ${t.exit_price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </td>
              <td className={`py-1.5 px-3 text-right font-mono font-medium ${
                t.pnl_pct >= 0 ? 'text-positive' : 'text-negative'
              }`}>
                {t.pnl_pct >= 0 ? '+' : ''}{t.pnl_pct.toFixed(2)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {trades.length > 50 && (
        <p className="text-xs text-dark-400 text-center py-2">
          Showing 50 of {trades.length} trades
        </p>
      )}
    </div>
  )
}

// ─────────────────────────── Main dashboard ──────────────────────────────────

export function BacktestDashboard() {
  const backtestStatus = useStrategyStore(s => s.backtestStatus)
  const result = useStrategyStore(s => s.backtestResult)

  if (backtestStatus === 'running') {
    return (
      <div className="flex items-center justify-center h-64 text-dark-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Running backtest…</span>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="flex items-center justify-center h-64 text-dark-400 text-sm">
        No backtest results yet. Configure and run a backtest.
      </div>
    )
  }

  if (!result.success) {
    return (
      <div className="p-4 space-y-2">
        <p className="text-negative text-sm font-medium">Backtest failed</p>
        {result.errors.map((e, i) => (
          <p key={i} className="text-xs text-dark-400 font-mono bg-dark-950 rounded p-2">{e}</p>
        ))}
      </div>
    )
  }

  const isProfit = result.net_profit_pct >= 0

  const exportCsv = () => {
    const headers = ['entry_timestamp', 'exit_timestamp', 'label', 'entry_price', 'exit_price', 'pnl_pct']
    const rows = result.trades.map((t: Trade) => [
      t.entry_timestamp, t.exit_timestamp, t.label, t.entry_price, t.exit_price, t.pnl_pct,
    ])
    const summary = [
      [],
      ['metric', 'value'],
      ['net_profit_pct', result.net_profit_pct],
      ['win_rate_pct', result.win_rate_pct],
      ['max_drawdown_pct', result.max_drawdown_pct],
      ['sharpe_ratio', result.sharpe_ratio],
      ['profit_factor', result.profit_factor],
    ]
    const csv = [headers, ...rows, ...summary].map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `backtest-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-4 space-y-6">
      {/* Strategy header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-sm font-semibold text-dark-50">{result.strategy_name}</h3>
          <p className="text-xs text-dark-400 mt-0.5">
            {result.symbol} · {result.timeframe} · {result.bars_tested} bars · {result.execution_ms}ms
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={exportCsv} className="btn-secondary text-xs flex items-center gap-1.5 px-3 py-1.5">
            <Download className="h-3.5 w-3.5" /> Export CSV
          </button>
          <span className={`text-2xl font-bold font-mono ${isProfit ? 'text-positive' : 'text-negative'}`}>
            {isProfit ? '+' : ''}{result.net_profit_pct.toFixed(2)}%
          </span>
        </div>
      </div>

      {/* Key stats — row 1 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="Net Profit"
          value={`${isProfit ? '+' : ''}${result.net_profit_pct.toFixed(2)}%`}
          sub={`$${result.initial_capital.toLocaleString()} → $${result.final_capital.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          positive={isProfit}
          negative={!isProfit}
        />
        <StatCard
          label="Win Rate"
          value={`${result.win_rate_pct.toFixed(1)}%`}
          sub={`${result.winning_trades}W / ${result.losing_trades}L`}
          positive={result.win_rate_pct > 50}
        />
        <StatCard
          label="Max Drawdown"
          value={`-${result.max_drawdown_pct.toFixed(2)}%`}
          negative={result.max_drawdown_pct > 10}
        />
        <StatCard
          label="Sharpe"
          value={result.sharpe_ratio.toFixed(2)}
          positive={result.sharpe_ratio > 1}
          negative={result.sharpe_ratio < 0}
        />
      </div>

      {/* Key stats — row 2 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="Profit Factor"
          value={isFinite(result.profit_factor) ? result.profit_factor.toFixed(2) : '∞'}
          positive={result.profit_factor > 1.5}
        />
        <StatCard
          label="Sortino"
          value={result.sortino_ratio.toFixed(2)}
          positive={result.sortino_ratio > 1}
        />
        <StatCard
          label="Avg Win"
          value={`+${result.avg_win_pct.toFixed(2)}%`}
          positive
        />
        <StatCard
          label="Avg Loss"
          value={`${result.avg_loss_pct.toFixed(2)}%`}
          negative={result.avg_loss_pct < 0}
        />
      </div>

      {/* Equity curve */}
      <div>
        <p className="stat-label mb-3">Equity Curve</p>
        <EquityChart curve={result.equity_curve} initialCapital={result.initial_capital} />
      </div>

      {/* Trade P&L distribution */}
      {result.trades.length > 0 && (
        <div>
          <p className="stat-label mb-3">Trade P&L Distribution</p>
          <TradePnlChart trades={result.trades} />
        </div>
      )}

      {/* Trade history */}
      {result.trades.length > 0 && (
        <div>
          <p className="stat-label mb-3">Trade History ({result.trades.length})</p>
          <div className="card overflow-hidden">
            <TradeList trades={result.trades} />
          </div>
        </div>
      )}

      <div className="card p-4 border border-dark-800 bg-dark-900/40">
        <p className="stat-label mb-2">Backtest assumptions</p>
        <ul className="text-xs text-dark-500 space-y-1 list-disc list-inside">
          <li>Fills at bar close price unless strategy.exit stop/limit triggers intra-bar</li>
          <li>Single open position at a time — no pyramiding</li>
          <li>Round-trip fees applied per your fee % setting</li>
          <li>No slippage or spread model — results may overstate edge on illiquid pairs</li>
          <li>Sharpe/Sortino annualized from per-trade returns (√252 scaling)</li>
        </ul>
      </div>
    </div>
  )
}
