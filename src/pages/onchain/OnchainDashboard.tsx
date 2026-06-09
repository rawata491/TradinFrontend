import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Activity, Fish, ArrowLeftRight, Droplets, RefreshCw, Users, LineChart } from 'lucide-react'
import { useOnchainStore } from '@/store/useOnchainStore'
import { tradesToWhales } from '@/utils/whaleDetection'
import { OnchainMetrics } from '@/components/onchain/OnchainMetrics'
import { OnchainPriceChart } from '@/components/onchain/OnchainPriceChart'
import { WhaleActivityFeed } from '@/components/onchain/WhaleActivityFeed'
import { DEXFlowPanel } from '@/components/onchain/DEXFlowPanel'
import { TradeHeatmap } from '@/components/onchain/TradeHeatmap'
import { OnchainDateRangePicker } from '@/components/onchain/OnchainDateRangePicker'
import { PoolSummaryCard } from '@/components/onchain/PoolSummaryCard'
import { PoolActivityPanel } from '@/components/onchain/PoolActivityPanel'
import { VolumeTimelineChart } from '@/components/onchain/VolumeTimelineChart'
import { MtfFibStrategyPanel } from '@/components/onchain/MtfFibStrategyPanel'
import { ErrorState } from '@/components/ErrorState'
import { rangeLabel, dateRangeKey } from '@/utils/onchainDateRange'
import {
  DEFAULT_ONCHAIN_TOKEN,
  findTrackedTokenByChainAddress,
  findTrackedTokenById,
  ONCHAIN_TRACKED_TOKENS,
  type TrackedOnchainToken,
} from '@/constants/onchainTokens'

const TABS = [
  { id: 'overview', label: 'Overview', icon: Activity },
  { id: 'flow', label: 'DEX Flow', icon: ArrowLeftRight },
  { id: 'whales', label: 'Whales', icon: Fish },
  { id: 'activity', label: 'Activity', icon: Users },
  { id: 'liquidity', label: 'Liquidity', icon: Droplets },
  { id: 'strategy', label: 'MTF Fib', icon: LineChart },
] as const

type TabId = (typeof TABS)[number]['id']

function resolveTokenFromParams(
  tokenId: string | null,
  paramChain: string | null,
  paramAddress: string | null,
): TrackedOnchainToken {
  if (tokenId) return findTrackedTokenById(tokenId) ?? DEFAULT_ONCHAIN_TOKEN
  if (paramChain && paramAddress) {
    return findTrackedTokenByChainAddress(paramChain, paramAddress) ?? DEFAULT_ONCHAIN_TOKEN
  }
  return DEFAULT_ONCHAIN_TOKEN
}

function addressEquals(a: string, b: string): boolean {
  return a.startsWith('0x') ? a.toLowerCase() === b.toLowerCase() : a === b
}

export function OnchainDashboard() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = (searchParams.get('tab') as TabId) || 'overview'
  const activeToken = resolveTokenFromParams(
    searchParams.get('token'),
    searchParams.get('chain'),
    searchParams.get('address'),
  )

  const {
    metrics,
    ohlcvCandles,
    heatmap,
    trades,
    dataSource,
    analysisError,
    warnings,
    poolInfo,
    isLoading,
    error,
    dateRange,
    setDateRange,
    setSelectedToken,
    loadAnalysis,
    lastLoadedAt,
    loadedFor,
  } = useOnchainStore()

  const whaleResult = tradesToWhales(trades, poolInfo?.volume_h24_usd)
  const { whales, thresholdUsd, usedFallback } = whaleResult
  const rangeText = rangeLabel(dateRange)

  useEffect(() => {
    const token = resolveTokenFromParams(
      searchParams.get('token'),
      searchParams.get('chain'),
      searchParams.get('address'),
    )

    const tokenParam = searchParams.get('token')
    if (tokenParam !== token.id) {
      setSearchParams(
        { token: token.id, tab: searchParams.get('tab') || 'overview' },
        { replace: true },
      )
      return
    }

    setSelectedToken(token.chain, token.address)
  }, [searchParams, setSelectedToken, setSearchParams])

  const currentRangeKey = dateRangeKey(dateRange)
  const dataMatchesSelection =
    loadedFor?.chain === activeToken.chain &&
    addressEquals(loadedFor.address, activeToken.address) &&
    loadedFor.rangeKey === currentRangeKey

  const hasData =
    dataMatchesSelection &&
    (ohlcvCandles.length > 0 || (metrics?.total_volume_usd ?? 0) > 0)
  const displayError = dataMatchesSelection ? error || analysisError : null

  const handleTokenChange = (id: string) => {
    const token = findTrackedTokenById(id) ?? DEFAULT_ONCHAIN_TOKEN
    setSearchParams({ token: token.id, tab })
  }

  const handleRefresh = () => {
    void loadAnalysis(activeToken.chain, activeToken.address)
  }

  const setTab = (id: TabId) => {
    setSearchParams({ token: activeToken.id, tab: id })
  }

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-dark-50">On-Chain Analysis</h1>
        <p className="text-sm text-dark-400 mt-1">
          DEX price, volume, and activity for tracked tokens — powered by GeckoTerminal
        </p>
      </div>

      <div className="card p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label htmlFor="onchain-token" className="block text-xs font-medium text-dark-400 mb-1.5">
              Token
            </label>
            <select
              id="onchain-token"
              value={activeToken.id}
              onChange={(e) => handleTokenChange(e.target.value)}
              disabled={isLoading}
              className="w-full px-3 py-2.5 bg-dark-900 border border-dark-700 rounded-lg text-sm text-dark-100 focus:outline-none focus:border-brand-500"
            >
              {ONCHAIN_TRACKED_TOKENS.map((token) => (
                <option key={token.id} value={token.id}>
                  {token.name} ({token.symbol}) — {token.chain}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isLoading}
              className="btn-primary px-6 flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Loading…' : 'Refresh'}
            </button>
          </div>
        </div>

        <OnchainDateRangePicker value={dateRange} onChange={setDateRange} disabled={isLoading} />

        <p className="text-[11px] text-dark-500">
          {activeToken.name} · {rangeText}
          {lastLoadedAt && hasData && (
            <span className="text-dark-400">
              {' '}
              · {ohlcvCandles.length} candles · {dataSource}
              {poolInfo?.dex ? ` · ${poolInfo.dex}` : ''}
            </span>
          )}
        </p>
      </div>

      {displayError && !hasData && (
        <ErrorState message={displayError} onRetry={handleRefresh} />
      )}

      {analysisError && hasData && (
        <p className="text-xs text-amber-500/90">{analysisError}</p>
      )}

      {warnings.length > 0 && hasData && (
        <p className="text-xs text-dark-500">{warnings.join(' ')}</p>
      )}

      <div className="flex gap-1 overflow-x-auto pb-1">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              tab === id
                ? 'bg-dark-800 text-dark-50'
                : 'text-dark-400 hover:text-dark-200 hover:bg-dark-800/50'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {isLoading && !hasData ? (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="card p-4 skeleton h-20" />
          ))}
        </div>
      ) : (
        <>
          {(tab === 'overview' || tab === 'flow') && (
            <OnchainMetrics metrics={metrics} dataSource={dataSource} />
          )}

          {tab === 'overview' && (
            <>
              <PoolSummaryCard pool={poolInfo} tokenName={activeToken.name} />
              <div className="card p-4">
                <h2 className="text-sm font-semibold text-dark-200 mb-3">Price & Volume · {rangeText}</h2>
                <OnchainPriceChart candles={ohlcvCandles} height={300} />
              </div>
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="card p-4">
                  <h2 className="text-sm font-semibold text-dark-200 mb-3">Volume Heatmap · {rangeText}</h2>
                  <TradeHeatmap data={heatmap} />
                </div>
                <div className="card p-4">
                  <h2 className="text-sm font-semibold text-dark-200 mb-3">Large Trades (24h live)</h2>
                  {trades.length === 0 ? (
                    <p className="text-sm text-dark-500">
                      No live trades loaded. Whale detection needs recent pool trades from GeckoTerminal — click Refresh.
                    </p>
                  ) : (
                    <>
                      {usedFallback && (
                        <p className="text-xs text-dark-500 mb-2">
                          No trades ≥ ${thresholdUsd.toLocaleString()} — showing largest recent trades (≥ $500).
                        </p>
                      )}
                      <WhaleActivityFeed whales={whales} signals={[]} compact />
                    </>
                  )}
                </div>
              </div>
            </>
          )}

          {tab === 'flow' && (
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="card p-4">
                <h2 className="text-sm font-semibold text-dark-200 mb-1">Buy/Sell Flow · {rangeText}</h2>
                <p className="text-xs text-dark-500 mb-3">Estimated from OHLCV candles for the selected range.</p>
                <DEXFlowPanel
                  trades={trades}
                  buyVolume={metrics?.buy_volume_usd}
                  sellVolume={metrics?.sell_volume_usd}
                  showTrades={trades.length > 0}
                  tradesLabel="Recent trades (24h live)"
                />
              </div>
              <div className="card p-4">
                <h2 className="text-sm font-semibold text-dark-200 mb-3">Volume Heatmap · {rangeText}</h2>
                <TradeHeatmap data={heatmap} />
              </div>
            </div>
          )}

          {tab === 'whales' && (
            <div className="card p-4">
              <h2 className="text-sm font-semibold text-dark-200 mb-1">Whale Trades (24h live)</h2>
              <p className="text-xs text-dark-500 mb-4">
                Trades ≥ ${thresholdUsd.toLocaleString()} from the primary pool (GeckoTerminal live feed, up to 300 recent trades).
              </p>
              {trades.length === 0 ? (
                <p className="text-sm text-dark-500">
                  No live trades loaded. Wait a few seconds and click Refresh — GeckoTerminal rate limits can block the trades request.
                </p>
              ) : (
                <>
                  {usedFallback && (
                    <p className="text-xs text-amber-500/90 mb-3">
                      No trades met the whale threshold — showing the {whales.length} largest recent trades instead.
                    </p>
                  )}
                  <WhaleActivityFeed whales={whales} signals={[]} />
                </>
              )}
            </div>
          )}

          {tab === 'activity' && (
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="card p-4">
                <h2 className="text-sm font-semibold text-dark-200 mb-4">DEX Activity (live)</h2>
                <PoolActivityPanel pool={poolInfo} />
              </div>
              <div className="card p-4">
                <h2 className="text-sm font-semibold text-dark-200 mb-3">24h Pool Stats</h2>
                {poolInfo ? (
                  <dl className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-dark-400">Buy transactions</dt>
                      <dd className="font-mono text-positive">{poolInfo.buys_h24 ?? '—'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-dark-400">Sell transactions</dt>
                      <dd className="font-mono text-negative">{poolInfo.sells_h24 ?? '—'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-dark-400">Unique buyers</dt>
                      <dd className="font-mono text-dark-100">{poolInfo.buyers_h24 ?? '—'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-dark-400">Unique sellers</dt>
                      <dd className="font-mono text-dark-100">{poolInfo.sellers_h24 ?? '—'}</dd>
                    </div>
                    <div className="flex justify-between border-t border-dark-800 pt-3">
                      <dt className="text-dark-400">6h volume</dt>
                      <dd className="font-mono text-dark-100">
                        ${(poolInfo.volume_h6_usd ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-dark-400">1h volume</dt>
                      <dd className="font-mono text-dark-100">
                        ${(poolInfo.volume_h1_usd ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </dd>
                    </div>
                  </dl>
                ) : (
                  <p className="text-dark-500 text-sm">No pool data available.</p>
                )}
              </div>
            </div>
          )}

          {tab === 'liquidity' && (
            <div className="space-y-6">
              <PoolSummaryCard pool={poolInfo} tokenName={activeToken.name} />
              <div className="card p-4">
                <h2 className="text-sm font-semibold text-dark-200 mb-3">Volume Over Time · {rangeText}</h2>
                <VolumeTimelineChart candles={ohlcvCandles} height={280} />
              </div>
              <div className="card p-4 max-w-lg">
                <h2 className="text-sm font-semibold text-dark-200 mb-4">Pool Details</h2>
                {poolInfo ? (
                  <dl className="space-y-3 text-sm">
                    <div className="flex justify-between gap-4">
                      <dt className="text-dark-400 shrink-0">Pool address</dt>
                      <dd className="font-mono text-dark-300 text-xs truncate">{poolInfo.address ?? '—'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-dark-400">Liquidity</dt>
                      <dd className="font-mono text-dark-100">
                        ${(poolInfo.liquidity_usd ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-dark-400">24h Volume</dt>
                      <dd className="font-mono text-dark-100">
                        ${(poolInfo.volume_h24_usd ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-dark-400">DEX</dt>
                      <dd className="text-dark-200">{poolInfo.dex ?? '—'}</dd>
                    </div>
                  </dl>
                ) : (
                  <p className="text-dark-500 text-sm">No pool data available.</p>
                )}
              </div>
            </div>
          )}

          {tab === 'strategy' && (
            <MtfFibStrategyPanel
              candles={dataMatchesSelection ? ohlcvCandles : []}
              tokenName={activeToken.name}
              isLoading={isLoading}
            />
          )}
        </>
      )}
    </div>
  )
}
