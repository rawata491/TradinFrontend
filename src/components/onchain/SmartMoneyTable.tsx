import type { SmartMoneyWallet } from '@/types/onchain'
import { Brain, Trophy } from 'lucide-react'

interface SmartMoneyTableProps {
  wallets: SmartMoneyWallet[]
}

function truncateAddr(addr: string): string {
  if (addr.length <= 12) return addr
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

export function SmartMoneyTable({ wallets }: SmartMoneyTableProps) {
  if (wallets.length === 0) {
    return (
      <div className="text-sm text-dark-500 py-8 text-center">
        No smart money wallets tracked for this token yet.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-dark-500 border-b border-dark-800">
            <th className="pb-2 font-medium">Wallet</th>
            <th className="pb-2 font-medium">Score</th>
            <th className="pb-2 font-medium">Win Rate</th>
            <th className="pb-2 font-medium">Avg ROI</th>
            <th className="pb-2 font-medium">Volume</th>
          </tr>
        </thead>
        <tbody>
          {wallets.map((w) => (
            <tr
              key={w.wallet}
              className="border-b border-dark-800/50 hover:bg-dark-900/40 transition-colors"
            >
              <td className="py-2.5">
                <div className="flex items-center gap-2">
                  {w.score >= 90 ? (
                    <Trophy className="h-3.5 w-3.5 text-yellow-400 flex-shrink-0" />
                  ) : (
                    <Brain className="h-3.5 w-3.5 text-brand-400 flex-shrink-0" />
                  )}
                  <span className="font-mono text-dark-200">{truncateAddr(w.wallet)}</span>
                </div>
              </td>
              <td className="py-2.5">
                <span
                  className={`font-mono font-semibold ${
                    w.score >= 80 ? 'text-positive' : 'text-dark-300'
                  }`}
                >
                  {w.score.toFixed(1)}
                </span>
              </td>
              <td className="py-2.5 font-mono text-dark-300">
                {(w.win_rate * 100).toFixed(1)}%
              </td>
              <td className="py-2.5 font-mono text-dark-300">
                {w.avg_roi_pct >= 0 ? '+' : ''}
                {w.avg_roi_pct.toFixed(1)}%
              </td>
              <td className="py-2.5 font-mono text-dark-400">
                ${w.total_volume_usd.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
