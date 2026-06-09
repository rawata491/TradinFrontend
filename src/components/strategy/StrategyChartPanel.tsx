import { useEffect, useState } from 'react'
import {
  TradingChart,
  EMPTY_CHART_SIGNALS,
  EMPTY_CHART_TRADES,
  EMPTY_INDICATOR_OVERLAYS,
} from '@/charts/TradingChart'
import { candleApi } from '@/services/api'
import { useEditorStore } from '@/store/useEditorStore'
import { useStrategyStore } from '@/store/useStrategyStore'
import type { Candle, Timeframe } from '@/types'

export function StrategyChartPanel() {
  const runResult = useStrategyStore((s) => s.runResult)
  const backtestResult = useStrategyStore((s) => s.backtestResult)
  const selectedTradeIndex = useStrategyStore((s) => s.selectedTradeIndex)
  const editorSymbol = useEditorStore((s) => s.selectedSymbol)
  const editorTimeframe = useEditorStore((s) => s.selectedTimeframe)

  const activeResult =
    backtestResult?.success ? backtestResult : runResult

  const symbol = activeResult?.symbol ?? editorSymbol
  const timeframe = (activeResult?.timeframe ?? editorTimeframe) as Timeframe
  const candleLimit =
    backtestResult?.success
      ? backtestResult.bars_tested
      : runResult
        ? 300
        : undefined

  const [candles, setCandles] = useState<Candle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)

    candleApi
      .get(symbol, timeframe, candleLimit)
      .then((res) => {
        if (!cancelled) setCandles(res.candles)
      })
      .catch((err) => {
        if (!cancelled) {
          setCandles([])
          setError(err instanceof Error ? err.message : 'Failed to load chart data')
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [
    symbol,
    timeframe,
    candleLimit,
    runResult?.bars_executed,
    backtestResult?.bars_tested,
  ])

  if (error && candles.length === 0) {
    return (
      <div className="p-6 text-center text-sm text-dark-400">
        {error}
      </div>
    )
  }

  const trades = backtestResult?.success ? backtestResult.trades : EMPTY_CHART_TRADES
  const signals =
    trades.length === 0 && activeResult && 'signals' in activeResult
      ? activeResult.signals
      : EMPTY_CHART_SIGNALS
  const indicatorOverlays =
    activeResult && 'indicator_overlays' in activeResult
      ? activeResult.indicator_overlays
      : EMPTY_INDICATOR_OVERLAYS

  return (
    <div className="p-3">
      <TradingChart
        candles={candles}
        isLoading={isLoading}
        timeframe={timeframe}
        productId={symbol}
        signals={signals}
        trades={trades}
        selectedTradeIndex={selectedTradeIndex}
        indicatorOverlays={indicatorOverlays}
        showTimeframeSelector={false}
        compact
      />
      {!activeResult && !isLoading && (
        <p className="text-xs text-dark-500 text-center mt-2">
          Run a strategy or backtest to overlay signals and trades.
        </p>
      )}
    </div>
  )
}
