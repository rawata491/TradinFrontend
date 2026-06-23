import { Trash2 } from 'lucide-react'
import type { PaperTrade } from '@/types/paperTrade'
import { formatPrice } from '@/utils/formatters'
import { formatPnl, formatPnlPct, sideLabel } from '@/utils/paperTrading'

export function PracticeHistory({
  trades,
  onDelete,
  onClear,
}: {
  trades: PaperTrade[]
  onDelete: (id: number) => Promise<unknown>
  onClear: () => Promise<unknown>
}) {
  if (!trades.length) {
    return (
      <div className="card p-6 text-center text-sm text-dark-500">
        Closed trades will appear here as your practice journal.
      </div>
    )
  }

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-dark-800 bg-dark-900/40">
        <h2 className="text-sm font-semibold text-dark-200">Journal ({trades.length})</h2>
        <button
          type="button"
          onClick={() => void onClear()}
          className="text-xs text-dark-500 hover:text-negative"
        >
          Clear history
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-dark-500 border-b border-dark-800 text-xs">
              <th className="text-left px-4 py-2 font-medium">When</th>
              <th className="text-left px-4 py-2 font-medium">Asset</th>
              <th className="text-left px-4 py-2 font-medium">Side</th>
              <th className="text-left px-4 py-2 font-medium">Source</th>
              <th className="text-right px-4 py-2 font-medium">Entry</th>
              <th className="text-right px-4 py-2 font-medium">Exit</th>
              <th className="text-right px-4 py-2 font-medium">P&amp;L</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {trades.map((t) => (
              <tr key={t.id} className="border-b border-dark-800/50 hover:bg-dark-900/30">
                <td className="px-4 py-2.5 text-xs text-dark-500 whitespace-nowrap">
                  {t.closed_at
                    ? new Date(t.closed_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })
                    : '—'}
                </td>
                <td className="px-4 py-2.5 font-mono font-medium">{t.product_id}</td>
                <td className="px-4 py-2.5">
                  <span
                    className={`text-xs font-semibold ${
                      t.side === 'long' ? 'text-positive' : 'text-negative'
                    }`}
                  >
                    {sideLabel(t.side)}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-xs text-dark-500 capitalize">
                  {t.source?.replace('_', ' ') ?? 'manual'}
                </td>
                <td className="px-4 py-2.5 text-right font-mono text-dark-300">
                  {formatPrice(String(t.entry_price))}
                </td>
                <td className="px-4 py-2.5 text-right font-mono text-dark-300">
                  {formatPrice(String(t.exit_price ?? 0))}
                </td>
                <td
                  className={`px-4 py-2.5 text-right font-mono font-semibold ${
                    (t.pnl ?? 0) >= 0 ? 'text-positive' : 'text-negative'
                  }`}
                >
                  {formatPnl(t.pnl ?? 0)}
                  <span className="block text-[10px] font-normal opacity-80">
                    {formatPnlPct(t.pnl_pct ?? 0)}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-right">
                  <button
                    type="button"
                    onClick={() => void onDelete(t.id)}
                    className="text-dark-500 hover:text-negative p-1"
                    title="Remove from journal"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
