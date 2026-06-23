import { useEffect } from 'react'
import { TrendingUp, TrendingDown, Activity, BarChart2 } from 'lucide-react'
import { CoinCard } from '@/components/CoinCard'
import { MarketTable } from '@/components/MarketTable'
import { WatchlistPanel } from '@/components/WatchlistPanel'
import { SkeletonCard } from '@/components/Loader'
import { ErrorState } from '@/components/ErrorState'
import { useCoins } from '@/hooks/useCoins'
import { useWebSocket } from '@/hooks/useWebSocket'
import { useWatchlistStore } from '@/store/useWatchlistStore'
import { useMarketStore } from '@/store/useMarketStore'
import { formatVolume, formatChange, getChangeColor } from '@/utils/formatters'
import { FearGreedWidget } from '@/components/analytics/FearGreedWidget'
import { PracticeDashboardWidget } from '@/components/practice/PracticeDashboardWidget'

export function Dashboard() {
  const { products, isLoading, error, refresh } = useCoins(50)
  const { subscribe, status: wsStatus } = useWebSocket()
  const watchlistItems = useWatchlistStore((s) => s.items)
  const tickers = useMarketStore((s) => s.tickers)

  // Subscribe to all loaded products + watchlist via WebSocket
  useEffect(() => {
    if (products.length > 0) {
      const ids = products.map((p) => p.product_id)
      subscribe(ids)
    }
  }, [products, subscribe])

  useEffect(() => {
    if (watchlistItems.length > 0) {
      subscribe(watchlistItems)
    }
  }, [watchlistItems, subscribe])

  if (error) {
    return <ErrorState message={error} onRetry={refresh} />
  }

  // Top movers: top 4 gainers and top 4 losers
  const sortedByChange = [...products].sort(
    (a, b) =>
      parseFloat(tickers[b.product_id]?.price_percent_chg_24_h ?? b.price_percentage_change_24h) -
      parseFloat(tickers[a.product_id]?.price_percent_chg_24_h ?? a.price_percentage_change_24h)
  )
  const gainers = sortedByChange.slice(0, 4)
  const losers = sortedByChange.slice(-4).reverse()

  const totalVolume = products.reduce(
    (sum, p) => sum + parseFloat(tickers[p.product_id]?.volume_24_h ?? p.volume_24h ?? '0'),
    0
  )
  const avgChange =
    products.length > 0
      ? products.reduce(
          (sum, p) =>
            sum +
            parseFloat(
              tickers[p.product_id]?.price_percent_chg_24_h ?? p.price_percentage_change_24h ?? '0'
            ),
          0
        ) / products.length
      : 0

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-fade-in">
      {/* Hero: search + stats */}
      <section>
        <div className="text-center mb-6 space-y-2">
          <h1 className="text-3xl font-bold text-dark-50">Crypto Market Dashboard</h1>
          <p className="text-dark-400">Real-time prices powered by Gate.io — search any market above</p>
        </div>

        {/* Market overview stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard
            icon={<BarChart2 className="h-5 w-5 text-brand-400" />}
            label="Markets Tracked"
            value={isLoading ? '…' : products.length.toString()}
            sub="SPOT USD pairs"
            loading={isLoading}
          />
          <StatCard
            icon={<Activity className="h-5 w-5 text-purple-400" />}
            label="24h Volume"
            value={isLoading ? '…' : formatVolume(totalVolume)}
            sub="Across all pairs"
            loading={isLoading}
          />
          <StatCard
            icon={<TrendingUp className="h-5 w-5 text-positive" />}
            label="Avg 24h Change"
            value={isLoading ? '…' : formatChange(avgChange)}
            valueClass={getChangeColor(avgChange)}
            sub="All tracked coins"
            loading={isLoading}
          />
          <StatCard
            icon={<Activity className="h-5 w-5 text-yellow-400" />}
            label="Live Updates"
            value={wsStatus === 'connected' ? 'Active' : 'Connecting…'}
            valueClass={wsStatus === 'connected' ? 'text-positive' : 'text-yellow-400'}
            sub="WebSocket stream"
          />
          <FearGreedWidget />
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-8">
        <div className="space-y-8">
          {/* Top Gainers */}
          <section>
            <SectionHeader
              icon={<TrendingUp className="h-4 w-4 text-positive" />}
              title="Top Gainers"
              sub="24h"
            />
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {gainers.map((p) => <CoinCard key={p.product_id} product={p} />)}
              </div>
            )}
          </section>

          {/* Top Losers */}
          <section>
            <SectionHeader
              icon={<TrendingDown className="h-4 w-4 text-negative" />}
              title="Top Losers"
              sub="24h"
            />
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {losers.map((p) => <CoinCard key={p.product_id} product={p} />)}
              </div>
            )}
          </section>

          {/* All Markets Table */}
          <section>
            <SectionHeader
              icon={<BarChart2 className="h-4 w-4 text-brand-400" />}
              title="All Markets"
              sub={`${products.length} pairs`}
            />
            <MarketTable products={products} isLoading={isLoading} showRank />
          </section>
        </div>

        {/* Sidebar: Watchlist + Practice */}
        <aside className="space-y-6">
          <div className="sticky top-24 space-y-6">
            <PracticeDashboardWidget />
            <WatchlistPanel />
          </div>
        </aside>
      </div>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  sub,
  valueClass = 'text-dark-50',
  loading = false,
}: {
  icon: React.ReactNode
  label: string
  value: string
  sub: string
  valueClass?: string
  loading?: boolean
}) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="stat-label">{label}</span>
      </div>
      {loading ? (
        <div className="h-7 w-24 bg-dark-800 rounded animate-pulse" />
      ) : (
        <p className={`text-xl font-bold font-mono ${valueClass}`}>{value}</p>
      )}
      <p className="text-xs text-dark-500 mt-1">{sub}</p>
    </div>
  )
}

function SectionHeader({
  icon,
  title,
  sub,
}: {
  icon: React.ReactNode
  title: string
  sub: string
}) {
  return (
    <div className="flex items-center gap-2 mb-4">
      {icon}
      <h2 className="text-base font-semibold text-dark-50">{title}</h2>
      <span className="text-xs text-dark-500">{sub}</span>
    </div>
  )
}
