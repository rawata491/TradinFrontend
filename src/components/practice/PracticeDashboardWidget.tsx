import { Link } from 'react-router-dom'
import { FlaskConical, ArrowRight } from 'lucide-react'
import { usePaperTrading } from '@/hooks/usePaperTrading'
import { formatPnl } from '@/utils/paperTrading'

export function PracticeDashboardWidget() {
  const { summary, closedPositions, isLoading } = usePaperTrading()
  const recent = closedPositions.slice(0, 3)

  if (isLoading && !closedPositions.length && summary.openCount === 0) {
    return null
  }

  return (
    <section className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-dark-50 flex items-center gap-2">
          <FlaskConical className="h-4 w-4 text-brand-400" />
          Practice account
        </h2>
        <Link to="/practice" className="text-xs text-brand-400 hover:underline flex items-center gap-1">
          Open <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <p className="stat-label">Equity</p>
          <p className="text-lg font-bold font-mono text-dark-50">${summary.equity.toFixed(0)}</p>
        </div>
        <div>
          <p className="stat-label">Open</p>
          <p className="text-lg font-bold font-mono">{summary.openCount}</p>
        </div>
        <div>
          <p className="stat-label">Win rate</p>
          <p className="text-lg font-bold font-mono">{summary.winRatePct.toFixed(0)}%</p>
        </div>
      </div>
      {recent.length > 0 && (
        <div className="border-t border-dark-800 pt-3 space-y-2">
          <p className="text-[10px] uppercase text-dark-500 tracking-wide">Recent closed</p>
          {recent.map((t) => (
            <div key={t.id} className="flex justify-between text-xs font-mono">
              <Link to={`/coin/${t.product_id}`} className="text-dark-300 hover:text-brand-400">
                {t.product_id}
              </Link>
              <span className={(t.pnl ?? 0) >= 0 ? 'text-positive' : 'text-negative'}>
                {formatPnl(t.pnl ?? 0)}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
