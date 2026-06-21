import { useEffect, useState } from 'react'
import { Fish, RefreshCw, Sparkles, AlertTriangle } from 'lucide-react'
import { DiscoveryTabs } from '@/components/discovery/DiscoveryTabs'
import { DiscoveryCard } from '@/components/discovery/DiscoveryCard'
import { WhaleScanCard } from '@/components/discovery/WhaleScanCard'
import { WhaleScanDetailModal } from '@/components/discovery/WhaleScanDetailModal'
import { ErrorState } from '@/components/ErrorState'
import { useDiscoveryStore } from '@/store/useDiscoveryStore'
import { useAuthStore } from '@/store/useAuthStore'
import { permissions } from '@/config/permissions'
import { formatDistanceToNow, formatVolume } from '@/utils/formatters'
import type { DiscoveryCategory } from '@/types/discovery'
import type { WhaleScanHit } from '@/types/whaleScan'

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
  const whaleHits = useDiscoveryStore((s) => s.whaleHits)
  const overview = useDiscoveryStore((s) => s.overview)
  const whaleOverview = useDiscoveryStore((s) => s.whaleOverview)
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
  const runWhaleScan = useDiscoveryStore((s) => s.runWhaleScan)
  const pollWhaleRunStatus = useDiscoveryStore((s) => s.pollWhaleRunStatus)
  const whaleRunStatus = useDiscoveryStore((s) => s.whaleRunStatus)
  const user = useAuthStore((s) => s.user)
  const canScan = permissions.discoverScan(user?.role)
  const canWhaleScan = permissions.whaleScan(user?.role)
  const fetchOverview = useDiscoveryStore((s) => s.fetchOverview)

  const isWhaleTab = activeTab === 'whale_scan'
  const [selectedWhaleHit, setSelectedWhaleHit] = useState<WhaleScanHit | null>(null)

  useEffect(() => {
    fetchDiscovery()
    fetchOverview()
  }, [fetchDiscovery, fetchOverview])

  useEffect(() => {
    if (!isWhaleTab) return
    void pollWhaleRunStatus()
  }, [isWhaleTab, pollWhaleRunStatus])

  useEffect(() => {
    if (!whaleRunStatus?.is_running) return
    const id = window.setInterval(() => {
      void pollWhaleRunStatus()
    }, 2000)
    return () => window.clearInterval(id)
  }, [whaleRunStatus?.is_running, pollWhaleRunStatus])

  const whaleScanRunning = Boolean(whaleRunStatus?.is_running || (isWhaleTab && isRefreshing))

  const tabDescription = {
    new_dex: 'Fresh DEX pools from GeckoTerminal with active liquidity and volume.',
    new_cex: 'Recently listed trading pairs on your configured CEX (Gate.io).',
    surging: 'Tokens with volume or price momentum spikes vs prior snapshots.',
    trending: 'Trending pools and tokens from GeckoTerminal, DexScreener, and CoinGecko.',
    whale_scan: whaleOverview
      ? `New tokens (≤${whaleOverview.max_age_days}d) with whale activity in the last ${whaleOverview.lookback_hours}h. Threshold ${formatVolume(whaleOverview.threshold_usd)}.`
      : 'New tokens with recent whale activity detected by the daily whale scanner.',
  }[activeTab]

  const overviewCounts = overview
    ? {
        new_dex: overview.new_dex_count,
        new_cex: overview.new_cex_count,
        surging: overview.surging_count,
        trending: overview.trending_count,
        whale_scan: whaleOverview?.hits_count ?? 0,
      }
    : whaleOverview
      ? { whale_scan: whaleOverview.hits_count }
      : undefined

  const displayCount = isWhaleTab ? whaleHits.length : items.length

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <WhaleScanDetailModal
        open={selectedWhaleHit !== null}
        hit={selectedWhaleHit}
        onClose={() => setSelectedWhaleHit(null)}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {isWhaleTab ? (
              <Fish className="h-6 w-6 text-brand-500" />
            ) : (
              <Sparkles className="h-6 w-6 text-brand-500" />
            )}
            <h1 className="text-2xl font-bold text-dark-50">Discover</h1>
          </div>
          <p className="text-sm text-dark-400">
            {isWhaleTab
              ? 'Tokens flagged by the daily whale scanner — large buys, accumulation, and coordinated activity.'
              : 'Find newly tradable cryptos with growth potential.'}
            {!isWhaleTab && (
              canScan
                ? ' Scans run once daily — use Scan now to refresh.'
                : ' Results refresh on the daily automatic scan.'
            )}
          </p>
        </div>

        {canScan && !isWhaleTab && (
        <button
          type="button"
          onClick={() => runFullScan()}
          disabled={isRefreshing}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 text-white hover:bg-brand-500 transition-colors text-sm font-medium disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Scanning…' : 'Scan now'}
        </button>
        )}

        {canWhaleScan && isWhaleTab && (
        <button
          type="button"
          onClick={() => runWhaleScan()}
          disabled={whaleScanRunning}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 text-white hover:bg-brand-500 transition-colors text-sm font-medium disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${whaleScanRunning ? 'animate-spin' : ''}`} />
          {whaleScanRunning ? 'Scanning…' : 'Run whale scan'}
        </button>
        )}
      </div>

      {/* Risk disclaimer */}
      <div className="flex items-start gap-3 rounded-lg border border-yellow-500/20 bg-yellow-500/5 px-4 py-3">
        <AlertTriangle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-dark-400 leading-relaxed">
          {isWhaleTab
            ? 'Whale activity is a heuristic signal, not financial advice. Large trades on new tokens carry extreme risk — always DYOR.'
            : 'Discovery scores are heuristic signals, not financial advice. DEX tokens carry high rug-pull risk — always DYOR. Data from GeckoTerminal, DexScreener, CoinGecko (free tiers).'}
        </p>
      </div>

      {/* Whale scan progress */}
      {isWhaleTab && whaleRunStatus && (whaleRunStatus.is_running || whaleRunStatus.status === 'failed') && (
        <div className="rounded-lg border border-dark-800 bg-dark-900/60 px-4 py-4 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-dark-200">{whaleRunStatus.phase_label || 'Whale scan in progress…'}</p>
            <span className="text-xs font-mono text-dark-500">{whaleRunStatus.percent}%</span>
          </div>
          <div className="h-2 rounded-full bg-dark-800 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${whaleRunStatus.status === 'failed' ? 'bg-negative' : 'bg-brand-500'}`}
              style={{ width: `${Math.max(whaleRunStatus.percent, whaleRunStatus.is_running ? 8 : 0)}%` }}
            />
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-dark-500">
            {whaleRunStatus.candidates_found > 0 && (
              <span>Candidates: {whaleRunStatus.candidates_found}</span>
            )}
            {whaleRunStatus.total > 0 && (
              <span>Scanned: {whaleRunStatus.completed}/{whaleRunStatus.total}</span>
            )}
            {whaleRunStatus.whales_detected > 0 && (
              <span className="text-positive">Whales: {whaleRunStatus.whales_detected}</span>
            )}
            {whaleRunStatus.current_token && (
              <span className="truncate">Current: {whaleRunStatus.current_token}</span>
            )}
          </div>
          {whaleRunStatus.error && (
            <p className="text-xs text-negative">{whaleRunStatus.error}</p>
          )}
        </div>
      )}

      {/* Whale scan stats */}
      {isWhaleTab && whaleOverview && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-lg border border-dark-800 bg-dark-900/50 px-4 py-3">
            <p className="text-xs text-dark-500">Hits</p>
            <p className="text-lg font-semibold text-dark-50">{whaleOverview.hits_count}</p>
          </div>
          <div className="rounded-lg border border-dark-800 bg-dark-900/50 px-4 py-3">
            <p className="text-xs text-dark-500">Tokens scanned</p>
            <p className="text-lg font-semibold text-dark-50">{whaleOverview.tokens_scanned}</p>
          </div>
          <div className="rounded-lg border border-dark-800 bg-dark-900/50 px-4 py-3">
            <p className="text-xs text-dark-500">Whales detected</p>
            <p className="text-lg font-semibold text-dark-50">{whaleOverview.whales_detected}</p>
          </div>
          <div className="rounded-lg border border-dark-800 bg-dark-900/50 px-4 py-3">
            <p className="text-xs text-dark-500">Last scan</p>
            <p className="text-sm font-medium text-dark-100 truncate">
              {whaleOverview.last_run_at
                ? formatDistanceToNow(whaleOverview.last_run_at)
                : 'Never'}
            </p>
          </div>
        </div>
      )}

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

        {!isWhaleTab && (
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
        )}

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
        <ErrorState message={error} onRetry={() => fetchDiscovery()} />
      )}

      {isLoading && displayCount === 0 && (
        <div className="grid gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-dark-800/60 animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && !error && displayCount === 0 && (
        <div className="text-center py-16 text-dark-500">
          {isWhaleTab ? (
            <Fish className="h-10 w-10 mx-auto mb-3 opacity-40" />
          ) : (
            <Sparkles className="h-10 w-10 mx-auto mb-3 opacity-40" />
          )}
          {isWhaleTab ? (
            <>
              <p className="text-sm">No whale activity detected in the latest scan.</p>
              <p className="text-xs mt-1">
                The whale scanner runs daily — check back after the next scan completes.
              </p>
            </>
          ) : !scannedAt ? (
            <>
              <p className="text-sm">No scan results yet.</p>
              <p className="text-xs mt-1">
                {canScan ? (
                  <>
                    Click <strong className="text-dark-300">Scan now</strong> to run a discovery scan, or wait for the daily automatic scan.
                  </>
                ) : (
                  'Waiting for the daily automatic scan — check back later.'
                )}
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

      {!isWhaleTab && items.length > 0 && (
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

      {isWhaleTab && whaleHits.length > 0 && (
        <div className="grid gap-3">
          {whaleHits.map((hit) => (
            <WhaleScanCard
              key={`${hit.chain}:${hit.contract_address}`}
              hit={hit}
              onOpenDetails={setSelectedWhaleHit}
            />
          ))}
        </div>
      )}
    </div>
  )
}
