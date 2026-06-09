import { useMemo, useState } from 'react'
import { TrendingUp, TrendingDown, Target, Shield } from 'lucide-react'
import type { OhlcvCandle } from '@/types/onchain'
import type { Signal } from '@/types/signal'
import { TradingChart } from '@/charts/TradingChart'
import {
  DEFAULT_MTF_FIB_PARAMS,
  runMtfFibStrategy,
  type HtfAnchor,
  type MtfFibParams,
} from '@/strategies/mtfFibStrategy'
import { inferChartTimeframe, ohlcvToChartCandles, ohlcvToParsed } from '@/utils/ohlcvAdapters'

interface MtfFibStrategyPanelProps {
  candles: OhlcvCandle[]
  tokenName: string
  isLoading: boolean
}

function StatCard({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return (
    <div className="card p-3">
      <p className="text-[10px] uppercase tracking-wide text-dark-500 mb-0.5">{label}</p>
      <p
        className={`font-mono text-sm ${
          positive === true ? 'text-positive' : positive === false ? 'text-negative' : 'text-dark-100'
        }`}
      >
        {value}
      </p>
    </div>
  )
}

function SignalRow({ signal }: { signal: Signal }) {
  const isBuy = signal.direction === 'buy'
  const pnl = signal.metadata?.pnl_pct as number | undefined

  return (
    <div className="flex items-center gap-3 py-2 px-2 border-b border-dark-800 last:border-0 text-xs">
      <div className={`p-1.5 rounded ${isBuy ? 'bg-positive/10' : 'bg-negative/10'}`}>
        {isBuy ? (
          <TrendingUp className="h-3.5 w-3.5 text-positive" />
        ) : (
          <TrendingDown className="h-3.5 w-3.5 text-negative" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-dark-200">{signal.label}</p>
        <p className="text-dark-500 font-mono">
          ${signal.price.toLocaleString(undefined, { maximumFractionDigits: 6 })}
          {signal.metadata?.stop_loss != null && (
            <span className="ml-2">SL ${Number(signal.metadata.stop_loss).toFixed(6)}</span>
          )}
          {signal.metadata?.take_profit != null && (
            <span className="ml-2">TP ${Number(signal.metadata.take_profit).toFixed(6)}</span>
          )}
        </p>
      </div>
      {pnl != null && (
        <span className={`font-mono ${pnl >= 0 ? 'text-positive' : 'text-negative'}`}>
          {pnl >= 0 ? '+' : ''}
          {pnl.toFixed(2)}%
        </span>
      )}
    </div>
  )
}

export function MtfFibStrategyPanel({ candles, tokenName, isLoading }: MtfFibStrategyPanelProps) {
  const [params, setParams] = useState<MtfFibParams>(DEFAULT_MTF_FIB_PARAMS)

  const chartCandles = useMemo(() => ohlcvToChartCandles(candles), [candles])
  const timeframe = useMemo(() => inferChartTimeframe(candles), [candles])

  const result = useMemo(() => {
    const parsed = ohlcvToParsed(candles)
    return runMtfFibStrategy(parsed, params)
  }, [candles, params])

  const entrySignals = result.signals.filter((s) => s.signal_type === 'entry')

  if (!isLoading && candles.length === 0) {
    return (
      <p className="text-sm text-dark-500 py-8 text-center">
        Load OHLCV data first — pick a token and date range, then open this tab.
      </p>
    )
  }

  return (
    <div className="space-y-6">
      <div className="card p-4 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-dark-100">MTF Trending Fibonacci Strategy</h2>
          <p className="text-xs text-dark-500 mt-1">
            {tokenName} · HTF trend filter + 50–70% Fib pullback entries · fixed SL/TP & trend invalidation
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <label className="block text-xs text-dark-400">
            HTF Anchor
            <select
              value={params.htfAnchor}
              onChange={(e) => setParams((p) => ({ ...p, htfAnchor: e.target.value as HtfAnchor }))}
              className="mt-1 w-full px-2 py-1.5 bg-dark-900 border border-dark-700 rounded-lg text-sm text-dark-100"
            >
              <option value="D">Daily</option>
              <option value="W">Weekly</option>
            </select>
          </label>
          <label className="block text-xs text-dark-400">
            Fib low ({Math.round(params.fibLowPct * 100)}%)
            <input
              type="range"
              min={30}
              max={60}
              value={params.fibLowPct * 100}
              onChange={(e) => setParams((p) => ({ ...p, fibLowPct: Number(e.target.value) / 100 }))}
              className="mt-2 w-full"
            />
          </label>
          <label className="block text-xs text-dark-400">
            Fib high ({Math.round(params.fibHighPct * 100)}%)
            <input
              type="range"
              min={50}
              max={80}
              value={params.fibHighPct * 100}
              onChange={(e) => setParams((p) => ({ ...p, fibHighPct: Number(e.target.value) / 100 }))}
              className="mt-2 w-full"
            />
          </label>
          <label className="block text-xs text-dark-400">
            R:R target ({params.rewardRiskRatio}:1)
            <input
              type="range"
              min={1}
              max={4}
              step={0.5}
              value={params.rewardRiskRatio}
              onChange={(e) => setParams((p) => ({ ...p, rewardRiskRatio: Number(e.target.value) }))}
              className="mt-2 w-full"
            />
          </label>
        </div>

        <div className="flex flex-wrap gap-4 text-xs text-dark-500">
          <span className="flex items-center gap-1">
            <Target className="h-3.5 w-3.5" />
            Trend:{' '}
            <strong className={result.activeTrend === 'bull' ? 'text-positive' : result.activeTrend === 'bear' ? 'text-negative' : 'text-dark-400'}>
              {result.activeTrend === 'bull' ? 'Bullish HTF' : result.activeTrend === 'bear' ? 'Bearish HTF' : 'No trend'}
            </strong>
          </span>
          {result.zones.buyLower != null && (
            <span>
              Buy zone: ${result.zones.buyLower.toFixed(6)} – ${result.zones.buyUpper?.toFixed(6)}
            </span>
          )}
          {result.zones.sellLower != null && (
            <span>
              Sell zone: ${result.zones.sellLower.toFixed(6)} – ${result.zones.sellUpper?.toFixed(6)}
            </span>
          )}
          {result.zones.longSl != null && (
            <span className="flex items-center gap-1">
              <Shield className="h-3.5 w-3.5" /> Long SL: ${result.zones.longSl.toFixed(6)}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="Trades" value={String(result.stats.totalTrades)} />
        <StatCard
          label="Win rate"
          value={`${result.stats.winRatePct.toFixed(1)}%`}
          positive={result.stats.winRatePct >= 50 ? true : result.stats.winRatePct > 0 ? false : undefined}
        />
        <StatCard
          label="Net P&L"
          value={`${result.stats.netProfitPct >= 0 ? '+' : ''}${result.stats.netProfitPct.toFixed(2)}%`}
          positive={result.stats.netProfitPct >= 0 ? true : false}
        />
        <StatCard label="Profit factor" value={result.stats.profitFactor === Infinity ? '∞' : result.stats.profitFactor.toFixed(2)} />
        <StatCard label="Max DD" value={`${result.stats.maxDrawdownPct.toFixed(2)}%`} positive={false} />
        <StatCard label="Signals" value={String(entrySignals.length)} />
      </div>

      <div className="card overflow-hidden" style={{ height: 420 }}>
        <TradingChart
          candles={chartCandles}
          isLoading={isLoading}
          timeframe={timeframe}
          productId={tokenName}
          signals={result.signals}
          trades={result.trades}
          indicatorOverlays={result.indicatorOverlays}
          showTimeframeSelector={false}
          compact
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-4">
          <h3 className="text-sm font-semibold text-dark-200 mb-3">Strategy Signals</h3>
          <div className="max-h-72 overflow-y-auto">
            {result.signals.length === 0 ? (
              <p className="text-sm text-dark-500 py-4 text-center">
                No signals in this range. Needs a trending HTF candle + pullback into the Fib zone.
              </p>
            ) : (
              result.signals.map((s, i) => <SignalRow key={`${s.bar_index}-${s.label}-${i}`} signal={s} />)
            )}
          </div>
        </div>

        <div className="card p-4">
          <h3 className="text-sm font-semibold text-dark-200 mb-3">Fixes vs original Pine script</h3>
          <ul className="text-xs text-dark-400 space-y-2 list-disc pl-4">
            <li>Long stop at <strong className="text-dark-300">HTF low</strong> (not HTF close above entry)</li>
            <li>Short stop at <strong className="text-dark-300">HTF high</strong> (not HTF close below entry)</li>
            <li>Take profit at configurable <strong className="text-dark-300">R:R</strong> (default 2:1)</li>
            <li>Exit when HTF trend invalidates (not only stop cross)</li>
            <li>One entry per completed HTF bar</li>
            <li>Prior completed HTF bar only — no repaint</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
