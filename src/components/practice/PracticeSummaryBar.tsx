import { Link } from 'react-router-dom'
import { TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import type { PracticeSummary } from '@/types/paperTrade'
import { formatPnl, formatPnlPct } from '@/utils/paperTrading'

export function PracticeSummaryBar({ summary }: { summary: PracticeSummary }) {
  const equityUp = summary.equity >= summary.startingBalance

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <div className="card p-4">
        <p className="stat-label flex items-center gap-1.5">
          <Wallet className="h-3.5 w-3.5" />
          Account equity
        </p>
        <p className="text-2xl font-bold font-mono text-dark-50">
          ${summary.equity.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </p>
        <p className="text-xs text-dark-500 mt-1">
          Started with ${summary.startingBalance.toLocaleString()}
        </p>
      </div>

      <div className="card p-4">
        <p className="stat-label">Open P&amp;L</p>
        <p
          className={`text-2xl font-bold font-mono flex items-center gap-1 ${
            summary.unrealizedPnl >= 0 ? 'text-positive' : 'text-negative'
          }`}
        >
          {summary.unrealizedPnl >= 0 ? (
            <TrendingUp className="h-5 w-5" />
          ) : (
            <TrendingDown className="h-5 w-5" />
          )}
          {formatPnl(summary.unrealizedPnl)}
        </p>
        <p className="text-xs text-dark-500 mt-1">{summary.openCount} open position{summary.openCount === 1 ? '' : 's'}</p>
      </div>

      <div className="card p-4">
        <p className="stat-label">Realized P&amp;L</p>
        <p
          className={`text-2xl font-bold font-mono ${
            summary.realizedPnl >= 0 ? 'text-positive' : 'text-negative'
          }`}
        >
          {formatPnl(summary.realizedPnl)}
        </p>
        <p className="text-xs text-dark-500 mt-1">
          {summary.closedCount} closed · {summary.winRatePct.toFixed(0)}% win rate
        </p>
      </div>

      <div className="card p-4">
        <p className="stat-label">Net vs start</p>
        <p className={`text-2xl font-bold font-mono ${equityUp ? 'text-positive' : 'text-negative'}`}>
          {formatPnl(summary.equity - summary.startingBalance)}
        </p>
        <p className="text-xs text-dark-500 mt-1">
          {formatPnlPct(((summary.equity - summary.startingBalance) / summary.startingBalance) * 100)}
        </p>
      </div>
    </div>
  )
}

export function PracticeExplainer() {
  return (
    <p className="text-sm text-dark-400 leading-relaxed">
      Practice with virtual money — no real funds. Pick an amount in USD, buy or short at the live
      price, and track P&amp;L like a real account.{' '}
      <Link to="/portfolio" className="text-brand-400 hover:underline">
        Portfolio
      </Link>{' '}
      is for tracking actual holdings separately.
    </p>
  )
}
