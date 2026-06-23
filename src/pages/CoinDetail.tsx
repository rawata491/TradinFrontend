import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  Star,
  TrendingUp,
  TrendingDown,
  Activity,
  RefreshCw,
  LineChart,
  Brain,
  Code2,
} from 'lucide-react'
import { TradingChart } from '@/charts/TradingChart'
import { PriceAlertsPanel } from '@/components/alerts/PriceAlertsPanel'
import { PracticeTradeButton } from '@/components/practice/PracticeTradeSheet'
import { CoinTraderWorkspace } from '@/components/coin/CoinTraderWorkspace'
import { StrategyWorkspace } from '@/components/strategy/StrategyWorkspace'
import { CoinAvatar } from '@/components/CoinAvatar'
import { PageLoader } from '@/components/Loader'
import { ErrorState } from '@/components/ErrorState'
import { AIInsightCard } from '@/components/AIInsightCard'
import { AISummaryPanel } from '@/components/AISummaryPanel'
import { NewsFeed } from '@/components/NewsFeed'
import { MarketDrivers } from '@/components/MarketDrivers'
import { useCoinDetail } from '@/hooks/useCoinDetail'
import { useWebSocket } from '@/hooks/useWebSocket'
import { useWatchlistStore } from '@/store/useWatchlistStore'
import { useMarketStore } from '@/store/useMarketStore'
import { useAIInsights } from '@/hooks/useAIInsights'
import { useNews } from '@/hooks/useNews'
import { useEditorStore } from '@/store/useEditorStore'
import {
  formatPrice,
  formatChange,
  formatVolume,
  getChangeColor,
  getCoinSymbol,
} from '@/utils/formatters'
import type { Timeframe } from '@/types'
import { RecentTradesTape } from '@/components/coin/RecentTradesTape'

type CoinTab = 'chart' | 'intel' | 'strategy'

const COIN_TABS: { id: CoinTab; label: string; icon: typeof LineChart }[] = [
  { id: 'chart', label: 'Chart', icon: LineChart },
  { id: 'intel', label: 'Intel', icon: Brain },
  { id: 'strategy', label: 'Strategy', icon: Code2 },
]

export function CoinDetail() {
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const alertsPanelRef = useRef<HTMLDivElement>(null)
  const [alertPresetPrice, setAlertPresetPrice] = useState<number | null>(null)

  const tabParam = searchParams.get('tab')
  const activeTab: CoinTab =
    tabParam === 'intel' || tabParam === 'strategy' ? tabParam : 'chart'

  const setEditorSymbol = useEditorStore((s) => s.setSymbol)

  const {
    product,
    candles,
    trades,
    isLoadingProduct,
    isLoadingCandles,
    candleError,
    error,
    timeframe,
    setTimeframe,
    refresh,
  } = useCoinDetail(productId ?? '')

  const { subscribe } = useWebSocket()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const handleRefresh = () => {
    setIsRefreshing(true)
    refresh()
    window.setTimeout(() => setIsRefreshing(false), 800)
  }

  const normalizedProductId = productId?.toUpperCase() ?? ''
  const isWatched = useWatchlistStore((s) => s.isWatched(normalizedProductId))
  // Live ticker for the current product — drives real-time chart updates
  const liveTicker = useMarketStore((s) => s.tickers[normalizedProductId] ?? null)
  const toggleItem = useWatchlistStore((s) => s.toggleItem)

  // Derive symbol early so AI/news hooks receive a stable value.
  // When productId is absent the hooks receive null and do nothing.
  const symbol = productId ? getCoinSymbol(productId) : null

  const {
    insight,
    loading: aiLoading,
    error: aiError,
    refetch: refetchAI,
  } = useAIInsights(symbol)

  const {
    articles,
    total: newsTotal,
    loading: newsLoading,
    error: newsError,
    page: newsPage,
    setPage: setNewsPage,
  } = useNews(symbol)

  useEffect(() => {
    if (normalizedProductId) subscribe([normalizedProductId])
  }, [normalizedProductId, subscribe])

  useEffect(() => {
    if (normalizedProductId) {
      setEditorSymbol(normalizedProductId)
    }
  }, [normalizedProductId, setEditorSymbol])

  useEffect(() => {
    if (!productId) navigate('/')
  }, [productId, navigate])

  const handleAlertPricePreset = (price: number) => {
    setAlertPresetPrice(price)
    alertsPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }

  const setTab = (tab: CoinTab) => {
    setSearchParams(tab === 'chart' ? {} : { tab }, { replace: true })
  }

  // ── Early returns (after ALL hooks) ────────────────────────────────────────
  if (!productId) {
    return null
  }

  if (error && !product) {
    const notFound = /not found/i.test(error)
    return (
      <div className="max-w-screen-xl mx-auto px-4 py-12">
        <ErrorState message={error} onRetry={refresh} variant={notFound ? 'notFound' : 'general'} />
      </div>
    )
  }

  if (isLoadingProduct && !product) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 py-12">
        <PageLoader />
      </div>
    )
  }

  const isPositive = parseFloat(product?.price_percentage_change_24h ?? '0') >= 0
  const symbolStr = symbol as string
  const livePriceNum = (() => {
    const fromTicker = liveTicker?.price ? parseFloat(liveTicker.price) : NaN
    if (Number.isFinite(fromTicker) && fromTicker > 0) return fromTicker
    const fromProduct = parseFloat(product?.price ?? '')
    return Number.isFinite(fromProduct) && fromProduct > 0 ? fromProduct : null
  })()

  return (
    <div
      className={`mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fade-in ${
        activeTab === 'strategy' ? 'max-w-screen-2xl' : 'max-w-screen-2xl'
      }`}
    >
      {/* Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="btn-ghost flex items-center gap-1.5"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <span className="text-dark-600">/</span>
        <Link to="/" className="text-dark-400 hover:text-dark-50 text-sm transition-colors">
          Dashboard
        </Link>
        <span className="text-dark-600">/</span>
        <span className="text-sm text-dark-50 font-medium">{symbolStr}</span>
      </div>

      {/* Hero section */}
      <div className="card p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          {/* Left: Identity */}
          <div className="flex items-center gap-4">
            <CoinAvatar symbol={symbolStr} size="xl" />
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-dark-50">{symbolStr}</h1>
                <span className="bg-dark-800 text-dark-300 text-xs px-2.5 py-1 rounded-full font-medium">
                  {productId}
                </span>
                {product?.status && (
                  <span className="bg-positive/10 text-positive text-xs px-2.5 py-1 rounded-full font-medium capitalize">
                    {product.status}
                  </span>
                )}
              </div>
              <p className="text-dark-400 mt-1">{product?.base_name}</p>
            </div>
          </div>

          {/* Right: Price + actions */}
          <div className="flex flex-col items-start md:items-end gap-2">
            <p className="text-4xl font-bold font-mono text-dark-50">
              {formatPrice(product?.price)}
            </p>
            <div className="flex items-center gap-2">
              <span
                className={`flex items-center gap-1.5 text-sm font-semibold ${getChangeColor(product?.price_percentage_change_24h)}`}
              >
                {isPositive ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                {formatChange(product?.price_percentage_change_24h)} (24h)
              </span>
            </div>
            <PracticeTradeButton productId={normalizedProductId} marketPrice={livePriceNum} />
            <div className="flex items-center gap-2 mt-1">
              <button
                onClick={() => setTab('strategy')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 border border-dark-700 text-dark-300 hover:text-dark-50 hover:border-brand-500/50"
              >
                <Code2 className="h-4 w-4" />
                Strategy
              </button>
              <button
                onClick={() => toggleItem(normalizedProductId)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 border ${
                  isWatched
                    ? 'bg-yellow-400/10 border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/20'
                    : 'border-dark-700 text-dark-300 hover:text-dark-50 hover:border-dark-500'
                }`}
              >
                <Star className={`h-4 w-4 ${isWatched ? 'fill-yellow-400' : ''}`} />
                {isWatched ? 'Watching' : 'Watch'}
              </button>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing || isLoadingProduct || isLoadingCandles}
                className="btn-ghost flex items-center gap-1.5 text-sm disabled:opacity-50"
                title="Refresh data"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* 24H stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-dark-800">
          <StatItem label="24h High" value={formatPrice(liveTicker?.high_24_h)} highlight="positive" />
          <StatItem label="24h Low" value={formatPrice(liveTicker?.low_24_h)} />
          <StatItem label="24h Volume" value={formatVolume(product?.volume_24h)} />
          <StatItem
            label="Vol Change 24h"
            value={formatChange(product?.volume_percentage_change_24h)}
            highlight={
              parseFloat(product?.volume_percentage_change_24h ?? '0') >= 0
                ? 'positive'
                : 'negative'
            }
          />
        </div>

        {/* Best bid/ask */}
        {(trades?.best_bid || trades?.best_ask) && (
          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-dark-800">
            <div>
              <p className="stat-label">Best Bid</p>
              <p className="stat-value text-positive">{formatPrice(trades.best_bid)}</p>
            </div>
            <div>
              <p className="stat-label">Best Ask</p>
              <p className="stat-value text-negative">{formatPrice(trades.best_ask)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Page tabs */}
      <div className="flex gap-1 bg-dark-900 border border-dark-800 rounded-xl p-1 overflow-x-auto">
        {COIN_TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === id
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-dark-400 hover:text-dark-100 hover:bg-dark-800'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'chart' && (
        <div className="flex gap-4 items-start">
          <div className="flex-1 min-w-0 space-y-4">
            {candleError && (
              <div className="rounded-lg border border-negative/30 bg-negative/10 px-4 py-3 flex items-center justify-between gap-3">
                <p className="text-sm text-negative">{candleError}</p>
                <button type="button" onClick={handleRefresh} className="text-xs text-brand-400 hover:underline">
                  Retry
                </button>
              </div>
            )}
            <TradingChart
              candles={candles}
              isLoading={isLoadingCandles}
              timeframe={timeframe}
              onTimeframeChange={(tf: Timeframe) => setTimeframe(tf)}
              productId={normalizedProductId}
              liveTicker={liveTicker}
              enablePriceAlerts
              onAlertPricePreset={handleAlertPricePreset}
            />

            <div ref={alertsPanelRef}>
              <PriceAlertsPanel
                productId={normalizedProductId}
                currentPrice={
                  liveTicker
                    ? parseFloat(liveTicker.price)
                    : product
                      ? parseFloat(product.price)
                      : undefined
                }
                presetPrice={alertPresetPrice}
                onPresetConsumed={() => setAlertPresetPrice(null)}
              />
            </div>

            {trades && trades.trades && trades.trades.length > 0 && (
              <div className="card overflow-hidden lg:hidden">
                <div className="px-4 py-3 border-b border-dark-800 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-brand-400" />
                  <h3 className="text-sm font-semibold text-dark-50">Recent Trades</h3>
                  <span className="ml-auto flex items-center gap-1 text-xs text-positive">
                    <span className="h-1.5 w-1.5 rounded-full bg-positive animate-pulse" />
                    Live
                  </span>
                </div>
                <div className="overflow-x-auto p-3">
                  <RecentTradesTape trades={trades.trades} limit={10} />
                </div>
              </div>
            )}
          </div>

          <CoinTraderWorkspace
            productId={normalizedProductId}
            marketPrice={livePriceNum}
            trades={trades}
          />
        </div>
      )}

      {activeTab === 'intel' && (
        <>
      {/* ── AI Market Intelligence ── */}
      <section>
        <h2 className="text-base font-semibold text-dark-50 mb-4 flex items-center gap-2">
          <span className="h-4 w-1 rounded bg-brand-500" />
          AI Market Intelligence
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Full AI insight card */}
          <AIInsightCard insight={insight} loading={aiLoading} error={aiError} />

          {/* AI summary + impact panel */}
          <AISummaryPanel
            insight={insight}
            loading={aiLoading}
            error={aiError}
            onRefresh={refetchAI}
          />
        </div>

        {/* Market drivers full-width row */}
        {(aiLoading || (insight && (insight.positive_factors.length > 0 || insight.negative_factors.length > 0))) && (
          <div className="card p-5 mt-5">
            <h3 className="text-sm font-semibold text-dark-50 mb-4">Market Drivers</h3>
            <MarketDrivers
              positiveFactors={insight?.positive_factors ?? []}
              negativeFactors={insight?.negative_factors ?? []}
              loading={aiLoading}
            />
          </div>
        )}
      </section>

      {/* ── Latest News ── */}
      <section>
        <h2 className="text-base font-semibold text-dark-50 mb-4 flex items-center gap-2">
          <span className="h-4 w-1 rounded bg-brand-500" />
          Latest News
        </h2>
        <NewsFeed
          articles={articles}
          total={newsTotal}
          page={newsPage}
          pageSize={10}
          loading={newsLoading}
          error={newsError}
          onPageChange={setNewsPage}
        />
      </section>
        </>
      )}

      {activeTab === 'strategy' && (
        <div className="card overflow-hidden p-0">
          <StrategyWorkspace
            lockSymbol={normalizedProductId}
            embedded
            showHeader
            editorHeight="380px"
          />
        </div>
      )}
    </div>
  )
}

function StatItem({
  label,
  value,
  highlight,
}: {
  label: string
  value: string
  highlight?: 'positive' | 'negative'
}) {
  return (
    <div>
      <p className="stat-label">{label}</p>
      <p
        className={`stat-value mt-1 ${
          highlight === 'positive'
            ? 'text-positive'
            : highlight === 'negative'
              ? 'text-negative'
              : ''
        }`}
      >
        {value}
      </p>
    </div>
  )
}
