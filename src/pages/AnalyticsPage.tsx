import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { analyticsApi } from '@/services/analyticsApi'
import { formatPrice, getChangeColor, formatChange } from '@/utils/formatters'
import { PageLoader } from '@/components/Loader'
import { ErrorState } from '@/components/ErrorState'
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback'
import {
  ANALYTICS_SECTIONS,
  getAnalyticsTabMeta,
  resolveAnalyticsTab,
  type AnalyticsTabId,
} from '@/config/analyticsSections'
import { TabIntro } from '@/components/analytics/TabIntro'
import { OrderBookPanel } from '@/components/analytics/OrderBookPanel'
import { MarketPicker } from '@/components/MarketPicker'

const SLOW_TABS: Partial<Record<AnalyticsTabId, string>> = {
  overview: 'Loading market dashboard…',
  funding: 'Fetching funding rates & open interest — may take up to 45s',
  bridges: 'Loading cross-chain TVL flows — may take up to 45s',
  correlation: 'Building correlation matrix from historical candles…',
}

export function AnalyticsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = resolveAnalyticsTab(searchParams.get('tab'))
  const tabMeta = getAnalyticsTabMeta(tab)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<Record<string, unknown>>({})

  const [productId, setProductId] = useState('BTC-USD')
  const [symbol, setSymbol] = useState('BTC')
  const [safetyChain, setSafetyChain] = useState(() => searchParams.get('chain') || 'ethereum')
  const [safetyAddress, setSafetyAddress] = useState(() => searchParams.get('address') || '')
  const [screenerMinVol, setScreenerMinVol] = useState('1000000')
  const [screenerMinChange, setScreenerMinChange] = useState('5')
  const [screenerVolApplied, setScreenerVolApplied] = useState('1000000')
  const [screenerChangeApplied, setScreenerChangeApplied] = useState('5')

  useEffect(() => {
    const chain = searchParams.get('chain')
    const address = searchParams.get('address')
    if (chain) setSafetyChain(chain)
    if (address) setSafetyAddress(address)
  }, [searchParams])

  const applyScreenerFilters = useDebouncedCallback(() => {
    setScreenerVolApplied(screenerMinVol)
    setScreenerChangeApplied(screenerMinChange)
  }, 500)

  const setTab = (id: AnalyticsTabId) => setSearchParams({ tab: id })

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        let result: unknown
        switch (tab) {
          case 'overview': {
            const [global, fearGreed] = await Promise.all([
              analyticsApi.global(),
              analyticsApi.fearGreed(30),
            ])
            result = { global, fearGreed }
            break
          }
          case 'fear-greed':
            result = await analyticsApi.fearGreed(30)
            break
          case 'funding':
            result = await analyticsApi.funding()
            break
          case 'correlation':
            result = await analyticsApi.correlation()
            break
          case 'orderbook':
            result = await analyticsApi.orderbook(productId)
            break
          case 'liquidations':
            result = await analyticsApi.liquidations(productId)
            break
          case 'mtf':
            result = await analyticsApi.mtf(productId)
            break
          case 'compare':
            result = await analyticsApi.compare(symbol)
            break
          case 'volatility':
            result = await analyticsApi.volatility()
            break
          case 'screener':
            result = await analyticsApi.screener({
              min_volume_24h: parseFloat(screenerVolApplied) || undefined,
              min_change_24h: parseFloat(screenerChangeApplied) || undefined,
              sort_by: 'volume_24h',
              limit: 50,
            })
            break
          case 'events':
            result = await analyticsApi.events()
            break
          case 'bridges':
            result = await analyticsApi.bridges()
            break
          case 'safety':
            if (safetyAddress.trim()) {
              result = await analyticsApi.safety(safetyChain, safetyAddress.trim())
            } else {
              result = null
            }
            break
          default:
            result = null
        }
        if (!cancelled) setData({ [tab]: result })
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => { cancelled = true }
  }, [tab, productId, symbol, safetyChain, safetyAddress, screenerVolApplied, screenerChangeApplied])

  useEffect(() => {
    if (tab === 'screener') applyScreenerFilters()
  }, [tab, screenerMinVol, screenerMinChange, applyScreenerFilters])

  const scanSafety = () => {
    if (safetyAddress.trim()) {
      setSearchParams({ tab: 'safety' })
      setData({})
    }
  }

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-dark-50">Market Research</h1>
        <p className="text-sm text-dark-400 mt-1 max-w-2xl">
          Sentiment, derivatives data, screeners, and token checks — organized by what you are trying to learn.
          Start with the dashboard, then open a tool below.
        </p>
      </div>

      <div className="space-y-3">
        {ANALYTICS_SECTIONS.map((section) => (
          <div key={section.title}>
            <p className="text-[10px] uppercase tracking-wider text-dark-600 mb-1.5 px-1">{section.title}</p>
            <div className="flex gap-1 overflow-x-auto pb-1">
              {section.tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    tab === id ? 'bg-dark-800 text-dark-50' : 'text-dark-400 hover:text-dark-200 hover:bg-dark-800/50'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {(tab === 'orderbook' || tab === 'liquidations' || tab === 'mtf') && (
        <div className="flex gap-2 items-center">
          <label className="text-xs text-dark-400">Product</label>
          <MarketPicker
            value={productId}
            onChange={setProductId}
            className="w-48"
          />
        </div>
      )}

      {tab === 'compare' && (
        <div className="flex gap-2 items-center">
          <label className="text-xs text-dark-400">Symbol</label>
          <input
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            className="bg-dark-900 border border-dark-700 rounded-lg px-3 py-1.5 text-sm text-dark-100 w-24"
          />
        </div>
      )}

      {tab === 'screener' && (
        <div className="flex flex-wrap gap-2 items-center">
          <input
            value={screenerMinVol}
            onChange={(e) => setScreenerMinVol(e.target.value)}
            placeholder="Min volume"
            className="bg-dark-900 border border-dark-700 rounded-lg px-3 py-1.5 text-sm w-32"
          />
          <input
            value={screenerMinChange}
            onChange={(e) => setScreenerMinChange(e.target.value)}
            placeholder="Min change %"
            className="bg-dark-900 border border-dark-700 rounded-lg px-3 py-1.5 text-sm w-32"
          />
        </div>
      )}

      {tab === 'safety' && (
        <div className="flex flex-wrap gap-2 items-end">
          <select
            value={safetyChain}
            onChange={(e) => setSafetyChain(e.target.value)}
            className="bg-dark-900 border border-dark-700 rounded-lg px-3 py-2 text-sm"
          >
            <option value="ethereum">Ethereum</option>
            <option value="base">Base</option>
            <option value="solana">Solana</option>
            <option value="bsc">BSC</option>
          </select>
          <input
            value={safetyAddress}
            onChange={(e) => setSafetyAddress(e.target.value)}
            placeholder="Contract address"
            className="bg-dark-900 border border-dark-700 rounded-lg px-3 py-2 text-sm flex-1 min-w-[200px]"
          />
          <button type="button" onClick={scanSafety} className="btn-primary text-sm px-4 py-2">
            Scan
          </button>
        </div>
      )}

      {loading && tab !== 'safety' ? (
        <PageLoader message={SLOW_TABS[tab] ?? 'Loading…'} />
      ) : error ? (
        <ErrorState message={error} onRetry={() => setSearchParams({ tab })} />
      ) : (
        <div className="space-y-4">
          {tab !== 'overview' && <TabIntro tab={tabMeta} />}

          {tab === 'overview' && (
            <OverviewPanel
              data={data.overview as { global?: Record<string, unknown>; fearGreed?: Record<string, unknown> }}
              onNavigate={setTab}
            />
          )}
          {tab === 'fear-greed' && <FearGreedPanel data={data['fear-greed'] as Record<string, unknown>} />}
          {tab === 'funding' && <FundingPanel data={data.funding as { items: Array<Record<string, unknown>>; source?: string }} />}
          {tab === 'correlation' && <CorrelationPanel data={data.correlation as { symbols: string[]; matrix: number[][]; pairs: Array<Record<string, unknown>> }} />}
          {tab === 'orderbook' && <OrderBookPanel data={data.orderbook as Record<string, unknown>} />}
          {tab === 'liquidations' && <LiquidationsPanel data={data.liquidations as Record<string, unknown>} />}
          {tab === 'mtf' && <MtfPanel data={data.mtf as Record<string, unknown>} />}
          {tab === 'compare' && <ComparePanel data={data.compare as Record<string, unknown>} />}
          {tab === 'volatility' && <VolatilityPanel data={data.volatility as { items: Array<Record<string, unknown>> }} />}
          {tab === 'screener' && <ScreenerPanel data={data.screener as { items: Array<Record<string, unknown>> }} />}
          {tab === 'events' && <EventsPanel data={data.events as { items: Array<Record<string, unknown>> }} />}
          {tab === 'bridges' && <BridgesPanel data={data.bridges as Record<string, unknown>} />}
          {tab === 'safety' && (
            <>
              <TabIntro tab={tabMeta} />
              <SafetyPanel data={data.safety as Record<string, unknown> | null} />
            </>
          )}
        </div>
      )}
    </div>
  )
}

function ApiSource({ source }: { source?: string }) {
  if (!source) return null
  return <p className="text-[11px] text-dark-600 mb-3">Source: {source}</p>
}

function OverviewPanel({
  data,
  onNavigate,
}: {
  data?: { global?: Record<string, unknown>; fearGreed?: Record<string, unknown> }
  onNavigate: (id: AnalyticsTabId) => void
}) {
  const global = data?.global
  const fg = data?.fearGreed
  const current = fg?.current as { value: number; classification: string } | undefined
  const fgColor = (v: number) =>
    v <= 25 ? 'text-negative' : v <= 45 ? 'text-yellow-400' : v <= 55 ? 'text-dark-300' : v <= 75 ? 'text-positive' : 'text-emerald-400'

  const quickTools = ANALYTICS_SECTIONS.flatMap((s) => s.tabs).filter((t) => t.id !== 'overview')

  return (
    <div className="space-y-6">
      <TabIntro tab={getAnalyticsTabMeta('overview')} />

      {global && (
        <div className="space-y-2">
          <ApiSource source={String(global.source ?? '')} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card p-4">
              <p className="stat-label">Total market cap</p>
              <p className="text-xl font-bold font-mono">
                ${Number(global.total_market_cap_usd ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div className="card p-4">
              <p className="stat-label">24h volume</p>
              <p className="text-xl font-bold font-mono">
                ${Number(global.total_volume_24h_usd ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div className="card p-4">
              <p className="stat-label">BTC dominance</p>
              <p className="text-xl font-bold font-mono">{Number(global.btc_dominance_pct ?? 0).toFixed(1)}%</p>
            </div>
            <div className="card p-4">
              <p className="stat-label">24h cap change</p>
              <p className={`text-xl font-bold font-mono ${Number(global.market_cap_change_24h_pct ?? 0) >= 0 ? 'text-positive' : 'text-negative'}`}>
                {formatChange(String(global.market_cap_change_24h_pct ?? 0))}
              </p>
            </div>
          </div>
        </div>
      )}

      {current && (
        <div className="card p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="stat-label">Fear & Greed today</p>
            <p className={`text-3xl font-bold font-mono ${fgColor(current.value)}`}>{current.value}</p>
            <p className="text-sm text-dark-400 mt-1">{current.classification}</p>
          </div>
          <button type="button" onClick={() => onNavigate('fear-greed')} className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1">
            View 30-day history <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold text-dark-200 mb-3">Research tools</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {quickTools.map((tool) => {
            const Icon = tool.icon
            return (
              <button
                key={tool.id}
                type="button"
                onClick={() => onNavigate(tool.id)}
                className="card p-4 text-left hover:border-brand-500/30 transition-colors group"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="h-4 w-4 text-brand-500" />
                  <span className="text-sm font-medium text-dark-100">{tool.label}</span>
                </div>
                <p className="text-xs text-dark-500 line-clamp-2">{tool.description}</p>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function FearGreedPanel({ data }: { data?: Record<string, unknown> }) {
  const current = data?.current as { value: number; classification: string } | undefined
  const history = (data?.history as Array<{ value: number; classification: string; timestamp?: string }>) ?? []
  const color = (v: number) =>
    v <= 25 ? 'text-negative' : v <= 45 ? 'text-yellow-400' : v <= 55 ? 'text-dark-300' : v <= 75 ? 'text-positive' : 'text-emerald-400'

  return (
    <div className="space-y-4">
      <ApiSource source={String(data?.source ?? 'alternative.me')} />
      {current && (
        <div className="card p-6 text-center max-w-sm">
          <p className="stat-label">Today</p>
          <p className={`text-5xl font-bold font-mono ${color(current.value)}`}>{current.value}</p>
          <p className="text-sm text-dark-400 mt-2">{current.classification}</p>
        </div>
      )}
      <div className="card p-4">
        <h3 className="text-sm font-semibold text-dark-200 mb-3">30-Day History</h3>
        <div className="flex items-end gap-1 h-24">
          {[...history].reverse().map((h, i) => (
            <div
              key={i}
              className={`flex-1 rounded-t ${h.value <= 25 ? 'bg-negative/60' : h.value <= 45 ? 'bg-yellow-500/50' : h.value <= 55 ? 'bg-dark-600' : h.value <= 75 ? 'bg-positive/50' : 'bg-emerald-500/50'}`}
              style={{ height: `${Math.max(h.value, 5)}%` }}
              title={`${h.value} — ${h.classification}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function FundingPanel({ data }: { data?: { items: Array<Record<string, unknown>>; source?: string } }) {
  if (!data?.items?.length) return <p className="text-dark-500 text-sm">No funding data available.</p>
  return (
    <div className="card overflow-hidden">
      <div className="px-4 pt-3"><ApiSource source={data.source} /></div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-dark-500 border-b border-dark-800">
            <th className="px-4 py-3 text-left">Symbol</th>
            <th className="px-4 py-3 text-right">Funding Rate</th>
            <th className="px-4 py-3 text-right">Mark Price</th>
            <th className="px-4 py-3 text-right">OI (USD)</th>
            <th className="px-4 py-3 text-right">Alt Rate</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item) => (
            <tr key={String(item.symbol)} className="border-b border-dark-800/50">
              <td className="px-4 py-3 font-semibold">{String(item.symbol)}</td>
              <td className={`px-4 py-3 text-right font-mono ${Number(item.funding_rate_pct) >= 0 ? 'text-positive' : 'text-negative'}`}>
                {Number(item.funding_rate_pct).toFixed(4)}%
              </td>
              <td className="px-4 py-3 text-right font-mono">{formatPrice(String(item.mark_price ?? 0))}</td>
              <td className="px-4 py-3 text-right font-mono">
                ${Number(item.open_interest_usd ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </td>
              <td className="px-4 py-3 text-right font-mono text-dark-400 text-xs">
                {item.secondary_funding_rate_pct != null
                  ? `${Number(item.secondary_funding_rate_pct).toFixed(4)}% (${String(item.secondary_source)})`
                  : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function CorrelationPanel({ data }: { data?: { symbols: string[]; matrix: number[][]; pairs: Array<Record<string, unknown>> } }) {
  if (!data?.symbols?.length) return <p className="text-dark-500 text-sm">Insufficient data for correlation.</p>
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="card p-4 overflow-x-auto">
        <h3 className="text-sm font-semibold text-dark-200 mb-3">Matrix (30d)</h3>
        <table className="text-xs">
          <thead>
            <tr>
              <th />
              {data.symbols.map((s) => <th key={s} className="px-2 py-1 text-dark-400">{s}</th>)}
            </tr>
          </thead>
          <tbody>
            {data.matrix.map((row, i) => (
              <tr key={data.symbols[i]}>
                <td className="px-2 py-1 font-medium text-dark-300">{data.symbols[i]}</td>
                {row.map((v, j) => (
                  <td key={j} className={`px-2 py-1 font-mono text-center ${v > 0.7 ? 'text-positive' : v < 0.3 ? 'text-dark-500' : 'text-dark-300'}`}>
                    {v.toFixed(2)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="card p-4">
        <h3 className="text-sm font-semibold text-dark-200 mb-3">Top Pairs</h3>
        <ul className="space-y-2 text-sm">
          {data.pairs.slice(0, 10).map((p) => (
            <li key={`${p.symbol_a}-${p.symbol_b}`} className="flex justify-between">
              <span className="text-dark-300">{String(p.symbol_a)}/{String(p.symbol_b)}</span>
              <span className="font-mono">{Number(p.correlation).toFixed(3)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function LiquidationsPanel({ data }: { data?: Record<string, unknown> }) {
  const levels = (data?.levels as Array<Record<string, unknown>>) ?? []
  return (
    <div className="card p-4">
      <ApiSource source={String(data?.source ?? '')} />
      <p className="text-xs text-dark-500 mb-2">{String(data?.note ?? '')}</p>
      <p className="text-sm text-dark-300 mb-1">Current: {formatPrice(String(data?.current_price ?? 0))}</p>
      {data?.open_interest_usd != null && (
        <p className="text-xs text-dark-500 mb-3">Gate.io OI: ${Number(data.open_interest_usd).toLocaleString()}</p>
      )}
      <div className="grid sm:grid-cols-2 gap-2 max-h-96 overflow-y-auto">
        {levels.map((l, i) => (
          <div key={i} className={`flex justify-between text-xs font-mono p-2 rounded ${l.side === 'long' ? 'bg-negative/10' : 'bg-positive/10'}`}>
            <span>{String(l.side).toUpperCase()} {Number(l.leverage)}x</span>
            <span>{formatPrice(String(l.price))}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function MtfPanel({ data }: { data?: Record<string, unknown> }) {
  const signals = (data?.signals as Array<Record<string, unknown>>) ?? []
  const bias = String(data?.bias ?? 'neutral')
  return (
    <div className="space-y-4">
      <div className="card p-4 flex items-center gap-6">
        <div>
          <p className="stat-label">Overall Bias</p>
          <p className={`text-xl font-bold capitalize ${bias === 'bullish' ? 'text-positive' : bias === 'bearish' ? 'text-negative' : 'text-dark-300'}`}>{bias}</p>
        </div>
        <div>
          <p className="stat-label">Confluence</p>
          <p className="text-xl font-bold font-mono">{Number(data?.confluence_pct).toFixed(0)}%</p>
        </div>
        <div>
          <p className="stat-label">Score</p>
          <p className="text-xl font-bold font-mono">{Number(data?.overall_score)}</p>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {signals.map((s) => (
          <div key={String(s.timeframe)} className="card p-4">
            <p className="text-sm font-semibold text-dark-200">{String(s.timeframe)}</p>
            <p className={`text-xs capitalize mt-1 ${String(s.trend) === 'bullish' ? 'text-positive' : String(s.trend) === 'bearish' ? 'text-negative' : 'text-dark-400'}`}>{String(s.trend)}</p>
            <p className="text-xs text-dark-500 mt-2">RSI {Number(s.rsi).toFixed(0)}</p>
            <p className="text-xs text-dark-500">EMA: {String(s.ema_cross)}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function ComparePanel({ data }: { data?: Record<string, unknown> }) {
  const items = (data?.items as Array<Record<string, unknown>>) ?? []
  return (
    <div className="card p-4">
      <div className="flex items-center gap-4 mb-4">
        <span className={`text-sm px-2 py-1 rounded ${data?.arb_opportunity ? 'bg-positive/20 text-positive' : 'bg-dark-800 text-dark-400'}`}>
          Spread {Number(data?.spread_pct).toFixed(3)}% {data?.arb_opportunity ? '— Arb opportunity' : ''}
        </span>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {items.map((item) => (
          <div key={String(item.exchange)} className="border border-dark-800 rounded-lg p-4">
            <p className="text-xs text-dark-500 capitalize">{String(item.exchange)}</p>
            <p className="text-xl font-mono font-bold mt-1">{formatPrice(String(item.price))}</p>
            {item.change_24h_pct != null && (
              <p className={`text-sm ${getChangeColor(String(item.change_24h_pct))}`}>{formatChange(String(item.change_24h_pct))}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function VolatilityPanel({ data }: { data?: { items: Array<Record<string, unknown>> } }) {
  return (
    <div className="card overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-dark-500 border-b border-dark-800">
            <th className="px-4 py-3 text-left">Asset</th>
            <th className="px-4 py-3 text-right">ATR %</th>
            <th className="px-4 py-3 text-right">Realized Vol</th>
            <th className="px-4 py-3 text-right">Regime</th>
          </tr>
        </thead>
        <tbody>
          {(data?.items ?? []).map((item) => (
            <tr key={String(item.product_id)} className="border-b border-dark-800/50">
              <td className="px-4 py-3">
                <Link to={`/coin/${item.product_id}`} className="hover:text-brand-400">{String(item.product_id)}</Link>
              </td>
              <td className="px-4 py-3 text-right font-mono">{Number(item.atr_pct).toFixed(2)}%</td>
              <td className="px-4 py-3 text-right font-mono">{Number(item.realized_vol_30d).toFixed(1)}%</td>
              <td className="px-4 py-3 text-right capitalize">{String(item.regime)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ScreenerPanel({ data }: { data?: { items: Array<Record<string, unknown>> } }) {
  return (
    <div className="card overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-dark-500 border-b border-dark-800">
            <th className="px-4 py-3 text-left">Asset</th>
            <th className="px-4 py-3 text-right">Price</th>
            <th className="px-4 py-3 text-right">24h %</th>
            <th className="px-4 py-3 text-right">Volume</th>
          </tr>
        </thead>
        <tbody>
          {(data?.items ?? []).map((item) => (
            <tr key={String(item.product_id)} className="border-b border-dark-800/50 hover:bg-dark-900/40">
              <td className="px-4 py-3">
                <Link to={`/coin/${item.product_id}`} className="font-semibold hover:text-brand-400">{String(item.product_id)}</Link>
              </td>
              <td className="px-4 py-3 text-right font-mono">{formatPrice(String(item.price))}</td>
              <td className={`px-4 py-3 text-right font-mono ${getChangeColor(String(item.change_24h_pct))}`}>
                {formatChange(String(item.change_24h_pct))}
              </td>
              <td className="px-4 py-3 text-right font-mono">${Number(item.volume_24h).toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function EventsPanel({ data }: { data?: { items: Array<Record<string, unknown>>; source?: string } }) {
  return (
    <div className="space-y-3">
      <ApiSource source={data?.source} />
      {(data?.items ?? []).map((e) => (
        <div key={String(e.id)} className="card p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-semibold text-dark-100">{String(e.title)}</p>
              <p className="text-xs text-dark-500 mt-1">{String(e.date)} · {String(e.symbol)} · {String(e.event_type)}</p>
              <p className="text-sm text-dark-400 mt-2">{String(e.description)}</p>
            </div>
            <span className={`text-[10px] uppercase px-2 py-0.5 rounded shrink-0 ${
              e.impact === 'high' ? 'bg-negative/20 text-negative' : e.impact === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-dark-800 text-dark-400'
            }`}>{String(e.impact)}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function BridgesPanel({ data }: { data?: Record<string, unknown> }) {
  const items = (data?.items as Array<Record<string, unknown>>) ?? []
  return (
    <div className="space-y-4">
      <ApiSource source={String(data?.source ?? '')} />
      <p className="text-xs text-dark-500">{String(data?.note ?? '')}</p>
      {data?.stablecoin_supply_usd != null && (
        <p className="text-sm text-dark-400">
          Total stablecoin supply: ${Number(data.stablecoin_supply_usd).toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </p>
      )}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <div key={String(item.chain)} className="card p-4">
            <p className="text-sm font-semibold capitalize">{String(item.chain)}</p>
            <p className="text-xs text-dark-500">{String(item.bridge)}</p>
            <p className={`text-sm font-mono mt-2 ${Number(item.net_flow_usd) >= 0 ? 'text-positive' : 'text-negative'}`}>
              Net ${Number(item.net_flow_usd).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
            {item.tvl_usd != null && (
              <p className="text-xs text-dark-500 mt-1">TVL ${Number(item.tvl_usd).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function SafetyPanel({ data }: { data?: Record<string, unknown> | null }) {
  if (!data) return <p className="text-dark-500 text-sm">Enter a contract address and click Scan.</p>
  const risk = String(data.risk_level)
  return (
    <div className="card p-6 max-w-lg">
      <div className="flex items-center gap-4 mb-4">
        <div className={`text-3xl font-bold ${risk === 'low' ? 'text-positive' : risk === 'critical' ? 'text-negative' : 'text-yellow-400'}`}>
          {Number(data.score)}/100
        </div>
        <div>
          <p className="font-semibold text-dark-100">{String(data.symbol)}</p>
          <p className="text-xs capitalize text-dark-500">{risk} risk</p>
        </div>
      </div>
      {(data.flags as string[])?.length > 0 && (
        <ul className="text-sm text-dark-400 space-y-1 mb-4">
          {(data.flags as string[]).map((f) => <li key={f}>⚠ {f}</li>)}
        </ul>
      )}
      <ul className="text-xs text-dark-500 space-y-1">
        {(data.recommendations as string[])?.map((r) => <li key={r}>• {r}</li>)}
      </ul>
    </div>
  )
}
