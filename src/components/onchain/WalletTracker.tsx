import type { WalletStat } from '@/types/onchain'
import { Wallet, Target, TrendingUp, Zap } from 'lucide-react'

interface WalletTrackerProps {
  wallet: WalletStat | null
  address?: string
}

function truncateAddr(addr: string): string {
  if (addr.length <= 16) return addr
  return `${addr.slice(0, 8)}…${addr.slice(-6)}`
}

export function WalletTracker({ wallet, address }: WalletTrackerProps) {
  if (!wallet && !address) {
    return (
      <div className="text-sm text-dark-500 py-6 text-center">
        Enter a wallet address to view stats.
      </div>
    )
  }

  if (!wallet) {
    return (
      <div className="text-sm text-dark-500 py-6 text-center">
        Loading wallet {address ? truncateAddr(address) : ''}…
      </div>
    )
  }

  const badges = [
    wallet.is_whale && { label: 'Whale', color: 'bg-blue-500/20 text-blue-400' },
    wallet.is_smart_money && { label: 'Smart Money', color: 'bg-brand-500/20 text-brand-400' },
    wallet.is_sniper && { label: 'Sniper', color: 'bg-yellow-500/20 text-yellow-400' },
  ].filter(Boolean) as { label: string; color: string }[]

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-dark-800 rounded-lg">
          <Wallet className="h-5 w-5 text-dark-300" />
        </div>
        <div>
          <p className="font-mono text-sm text-dark-100">{truncateAddr(wallet.wallet)}</p>
          <div className="flex gap-1.5 mt-1">
            {badges.map((b) => (
              <span key={b.label} className={`text-[10px] px-1.5 py-0.5 rounded ${b.color}`}>
                {b.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={Target} label="Smart Score" value={wallet.smart_money_score.toFixed(1)} />
        <StatCard icon={TrendingUp} label="Win Rate" value={`${(wallet.win_rate * 100).toFixed(1)}%`} />
        <StatCard icon={Zap} label="Avg ROI" value={`${wallet.avg_roi_pct >= 0 ? '+' : ''}${wallet.avg_roi_pct.toFixed(1)}%`} />
        <StatCard icon={Wallet} label="Volume" value={`$${wallet.total_volume_usd.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} />
      </div>

      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="p-2 bg-dark-900 rounded-lg">
          <p className="text-dark-500">Trades</p>
          <p className="font-mono text-dark-200 mt-0.5">{wallet.total_trades}</p>
        </div>
        <div className="p-2 bg-dark-900 rounded-lg">
          <p className="text-dark-500">Buys</p>
          <p className="font-mono text-positive mt-0.5">{wallet.buy_count}</p>
        </div>
        <div className="p-2 bg-dark-900 rounded-lg">
          <p className="text-dark-500">Sells</p>
          <p className="font-mono text-negative mt-0.5">{wallet.sell_count}</p>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Target
  label: string
  value: string
}) {
  return (
    <div className="p-3 bg-dark-900 rounded-lg border border-dark-800">
      <div className="flex items-center gap-1.5 text-dark-500 mb-1">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-xs">{label}</span>
      </div>
      <p className="stat-value text-lg">{value}</p>
    </div>
  )
}
