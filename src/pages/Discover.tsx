import { useEffect } from 'react'
import { RefreshCw, Sparkles, AlertTriangle } from 'lucide-react'
import { DiscoveryTabs } from '@/components/discovery/DiscoveryTabs'
import { DiscoveryCard } from '@/components/discovery/DiscoveryCard'
import { ErrorState } from '@/components/ErrorState'
import { useDiscoveryStore } from '@/store/useDiscoveryStore'
import { formatDistanceToNow } from '@/utils/formatters'
import type { DiscoveryCategory } from '@/types/discovery'

const CHAIN_OPTIONS = [
  { value: '', label: 'All chains' },
  { value: 'ethereum', label: 'Ethereum' },
  { value: 'base', label: 'Base' },
  { value: 'solana', label: 'Solana' },
  { value: 'bsc', label: 'BSC' },
  { value: 'arbitrum', label: 'Arbitrum' },
]

export function DiscoverPage() {
  const activeTab = useDiscoveryStore((s) => s.activeTab)
  const chainFilter = useDiscoveryStore((s) => s.chainFilter)
  const minScore = useDiscoveryStore((s) => s.minScore)
  const items = useDiscoveryStore((s) => s.items)
  const overview = useDiscoveryStore((s) => s.overview)
  const sourcesUsed = useDiscoveryStore((s) => s.sourcesUsed)
  const scannedAt = useDiscoveryStore((s) => s.scannedAt)
  const cached = useDiscoveryStore((s) => s.cached)
  const isLoading = useDiscoveryStore((s) => s.isLoading)
  const isRefreshing = useDiscoveryStore((s) => s.isRefreshing)
  const error = useDiscoveryStore((s) => s.error)
  const setActiveTab = useDiscoveryStore((s) => s.setActiveTab)
  const setChainFilter = useDiscoveryStore((s) => s.setChainFilter)
  const setMinScore = useDiscoveryStore((s) => s.setMinScore)
  const fetchDiscovery = useDiscoveryStore((s) => s.fetchDiscovery)
  const runFullScan = useDiscoveryStore((s) => s.runFullScan)
  const fetchOverview = useDiscoveryStore((s) => s.fetchOverview)

  useEffect(() => {
    fetchDiscovery()
    fetchOverview()
  }, [fetchDiscovery, fetchOverview])

  const tabDescription = {
    new_dex: 'Fresh DEX pools from GeckoTerminal with active liquidity and volume.',
    new_cex: 'Recently listed trading pairs on your configured CEX (Coinbase / Gate).',
    surging: 'Tokens with volume or price momentum spikes vs prior snapshots.',
    trending: 'Trending pools and tokens from GeckoTerminal, DexScreener, and CoinGecko.',
  }[activeTab]

  const overviewCounts = overview
    ? {
        new_dex: overview.new_dex_count,
        new_cex: overview.new_cex_count,
        surging: overview.surging_count,
        trending: overview.trending_count,
      }
    : undefined

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-6 w-6 text-brand-500" />
            <h1 className="text-2xl font-bold text-dark-50">Discover</h1>
          </div>
          <p className="text-sm text-dark-400">
            Find newly tradable cryptos with growth potential. Scans run once daily — use Refresh to scan now.
          </p>
        </div>

        <button
          type="button"
          onClick={() => runFullScan()}
          disabled={isRefreshing}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 text-white hover:bg-brand-500 transition-colors text-sm font-medium disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Scanning…' : 'Scan now'}
        </button>
      </div>

      {/* Risk disclaimer */}
      <div className="flex items-start gap-3 rounded-lg border border-yellow-500/20 bg-yellow-500/5 px-4 py-3">
        <AlertTriangle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-dark-400 leading-relaxed">
          Discovery scores are heuristic signals, not financial advice. DEX tokens carry high rug-pull
          risk — always DYOR. Data from GeckoTerminal, DexScreener, CoinGecko (free tiers).
        </p>
      </div>

      {/* Tabs */}
      <DiscoveryTabs
        active={activeTab}
        counts={overviewCounts}
        onChange={(tab: DiscoveryCategory) => setActiveTab(tab)}
      />

      <p className="text-sm text-dark-500">{tabDescription}</p>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {activeTab !== 'new_cex' && (
          <select
            value={chainFilter}
            onChange={(e) => setChainFilter(e.target.value)}
            className="rounded-lg bg-dark-800 border border-dark-700 text-sm text-dark-200 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            {CHAIN_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )}

        <select
          value={minScore}
          onChange={(e) => setMinScore(Number(e.target.value))}
          className="rounded-lg bg-dark-800 border border-dark-700 text-sm text-dark-200 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-brand-500"
        >
          <option value={0}>Any score</option>
          <option value={40}>Score ≥ 40</option>
          <option value={60}>Score ≥ 60</option>
          <option value={75}>Score ≥ 75</option>
        </select>

        {(scannedAt || sourcesUsed.length > 0) && (
          <p className="text-xs text-dark-600 ml-auto">
            {scannedAt && <>Updated {formatDistanceToNow(scannedAt)}</>}
            {cached && ' · cached'}
            {sourcesUsed.length > 0 && <> · {sourcesUsed.join(', ')}</>}
          </p>
        )}
      </div>

      {/* Content */}
      {error && !isLoading && (
        <ErrorState message={error} onRetry={() => runFullScan()} />
      )}

      {isLoading && items.length === 0 && (
        <div className="grid gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-dark-800/60 animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && !error && items.length === 0 && (
        <div className="text-center py-16 text-dark-500">
          <Sparkles className="h-10 w-10 mx-auto mb-3 opacity-40" />
          {!scannedAt ? (
            <>
              <p className="text-sm">No scan results yet.</p>
              <p className="text-xs mt-1">
                Click <strong className="text-dark-300">Scan now</strong> to run a discovery scan, or wait for the daily automatic scan.
              </p>
            </>
          ) : (
            <>
              <p className="text-sm">No tokens match your filters.</p>
              <p className="text-xs mt-1">Try lowering the min score or changing the chain filter.</p>
            </>
          )}
        </div>
      )}

      {items.length > 0 && (
        <div className="grid gap-3">
          {items.map((token) => (
            <DiscoveryCard
              key={
                token.source_type === 'cex'
                  ? `cex:${token.product_id}`
                  : `${token.chain}:${token.contract_address}`
              }
              token={token}
            />
          ))}
        </div>
      )}
    </div>
  )
}
