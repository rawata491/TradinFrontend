import type { TokenMetrics } from '@/types/onchain'
import { Activity, TrendingUp, Droplets, BarChart3, DollarSign } from 'lucide-react'

interface OnchainMetricsProps {
  metrics: TokenMetrics | null | undefined
  dataSource?: string
}

export function OnchainMetrics({ metrics, dataSource }: OnchainMetricsProps) {
  if (!metrics) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="card p-4 skeleton h-20" />
        ))}
      </div>
    )
  }

  const isOhlcv = dataSource === 'geckoterminal' || metrics.data_source === 'geckoterminal'
  const totalVol = metrics.total_volume_usd ?? metrics.buy_volume_usd + metrics.sell_volume_usd

  const items = isOhlcv
    ? [
        {
          icon: BarChart3,
          label: 'Total Volume',
          value: `$${totalVol.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
        },
        {
          icon: TrendingUp,
          label: 'Price Change',
          value: `${metrics.price_change_pct != null && metrics.price_change_pct >= 0 ? '+' : ''}${(metrics.price_change_pct ?? 0).toFixed(2)}%`,
          positive: (metrics.price_change_pct ?? 0) >= 0,
        },
        {
          icon: DollarSign,
          label: 'Close Price',
          value: `$${(metrics.price_close_usd ?? 0).toFixed(metrics.price_close_usd != null && metrics.price_close_usd < 1 ? 6 : 4)}`,
        },
        {
          icon: Activity,
          label: 'Net Flow (est.)',
          value: `$${metrics.net_flow_usd.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
          positive: metrics.net_flow_usd >= 0,
        },
        {
          icon: Droplets,
          label: 'Pool Liquidity',
          value: `$${metrics.liquidity_usd.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
        },
      ]
    : [
        {
          icon: Activity,
          label: 'Net Flow',
          value: `$${metrics.net_flow_usd.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
          positive: metrics.net_flow_usd >= 0,
        },
        {
          icon: BarChart3,
          label: 'Buy Volume',
          value: `$${metrics.buy_volume_usd.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
        },
        {
          icon: BarChart3,
          label: 'Sell Volume',
          value: `$${metrics.sell_volume_usd.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
        },
        {
          icon: Droplets,
          label: 'Pool Liquidity',
          value: `$${metrics.liquidity_usd.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
        },
        {
          icon: TrendingUp,
          label: 'Unique Wallets',
          value: metrics.unique_wallets.toLocaleString(),
        },
      ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {items.map(({ icon: Icon, label, value, positive }) => (
        <div key={label} className="card p-4">
          <div className="flex items-center gap-1.5 text-dark-500 mb-1">
            <Icon className="h-3.5 w-3.5" />
            <span className="stat-label">{label}</span>
          </div>
          <p
            className={`stat-value text-lg ${
              positive === true ? 'text-positive' : positive === false ? 'text-negative' : ''
            }`}
          >
            {value}
          </p>
        </div>
      ))}
    </div>
  )
}
