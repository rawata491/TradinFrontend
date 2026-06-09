import { useCallback, useEffect, useRef, useState } from 'react'
import { Loader } from '@/components/Loader'
import { useThemeStore } from '@/store/useThemeStore'
import { useChartStore } from '@/store/useChartStore'
import type { Candle, Timeframe, TickerData } from '@/types'
import type { Signal } from '@/types/signal'
import type { Trade } from '@/types/backtest'
import { useTimeframes } from '@/hooks/useTimeframes'
import { ChartToolbar } from './ChartToolbar'
import { useChartInstance, type CrosshairOHLCV } from './useChartInstance'

/** Stable empty defaults — inline `[]` / `{}` in param defaults create new refs every render. */
export const EMPTY_CHART_SIGNALS: Signal[] = []
export const EMPTY_CHART_TRADES: Trade[] = []
export const EMPTY_INDICATOR_OVERLAYS: Record<string, (number | null)[]> = {}

function crosshairEqual(a: CrosshairOHLCV | null, b: CrosshairOHLCV | null): boolean {
  if (a === b) return true
  if (a === null || b === null) return false
  return (
    a.open === b.open &&
    a.high === b.high &&
    a.low === b.low &&
    a.close === b.close &&
    a.volume === b.volume
  )
}

interface TradingChartProps {
  candles: Candle[]
  isLoading: boolean
  timeframe: Timeframe
  onTimeframeChange?: (tf: Timeframe) => void
  productId: string
  liveTicker?: TickerData | null
  signals?: Signal[]
  trades?: Trade[]
  selectedTradeIndex?: number | null
  indicatorOverlays?: Record<string, (number | null)[]>
  onchainMarkers?: import('@/types/onchain').OnchainChartMarker[]
  showTimeframeSelector?: boolean
  compact?: boolean
  enablePriceAlerts?: boolean
  onAlertPricePreset?: (price: number) => void
}

export function TradingChart({
  candles,
  isLoading,
  timeframe,
  onTimeframeChange,
  productId,
  liveTicker = null,
  signals = EMPTY_CHART_SIGNALS,
  trades = EMPTY_CHART_TRADES,
  selectedTradeIndex = null,
  indicatorOverlays = EMPTY_INDICATOR_OVERLAYS,
  onchainMarkers = [],
  showTimeframeSelector = true,
  compact = false,
  enablePriceAlerts = false,
  onAlertPricePreset,
}: TradingChartProps) {
  const { timeframes } = useTimeframes()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const drawingContainerRef = useRef<HTMLDivElement>(null)
  const rsiContainerRef = useRef<HTMLDivElement>(null)
  const macdContainerRef = useRef<HTMLDivElement>(null)

  const stochContainerRef = useRef<HTMLDivElement>(null)
  const atrContainerRef = useRef<HTMLDivElement>(null)

  const [crosshairData, setCrosshairData] = useState<CrosshairOHLCV | null>(null)
  const [isLive, setIsLive] = useState(false)
  const [horizontalAlertPrice, setHorizontalAlertPrice] = useState<number | null>(null)

  const theme = useThemeStore((s) => s.theme)
  const isDark = theme === 'dark'

  const chartType = useChartStore((s) => s.chartType)
  const showVolume = useChartStore((s) => s.showVolume)
  const activeIndicators = useChartStore((s) => s.activeIndicators)
  const indicatorParams = useChartStore((s) => s.indicatorParams)
  const drawingTool = useChartStore((s) => s.drawingTool)

  const onCrosshairChange = useCallback((data: CrosshairOHLCV | null) => {
    setCrosshairData((prev) => (crosshairEqual(prev, data) ? prev : data))
  }, [])

  const onHorizontalAlertPrice = useCallback((price: number | null) => {
    setHorizontalAlertPrice(price)
  }, [])

  const { fitContent, scrollToRealtime, clearDrawings } = useChartInstance({
    containerRef,
    rsiContainerRef,
    macdContainerRef,
    stochContainerRef,
    atrContainerRef,
    drawingContainerRef,
    isDark,
    candles,
    chartType,
    showVolume,
    activeIndicators,
    indicatorParams,
    drawingTool,
    productId,
    timeframe,
    signals,
    trades,
    selectedTradeIndex,
    indicatorOverlays,
    onchainMarkers,
    liveTicker,
    onCrosshairChange,
    onHorizontalAlertPrice: enablePriceAlerts ? onHorizontalAlertPrice : undefined,
  })

  const handleCreateAlertAtLine = () => {
    if (horizontalAlertPrice != null && onAlertPricePreset) {
      onAlertPricePreset(horizontalAlertPrice)
    }
  }

  const handleClearDrawings = () => {
    clearDrawings()
  }

  useEffect(() => {
    if (liveTicker?.price) {
      setIsLive(true)
      const t = setTimeout(() => setIsLive(false), 1500)
      return () => clearTimeout(t)
    }
  }, [liveTicker?.price])

  const overlayNames = Object.keys(indicatorOverlays)
  const showRsi = activeIndicators.includes('rsi')
  const showMacd = activeIndicators.includes('macd')
  const showStoch = activeIndicators.includes('stoch')
  const showAtr = activeIndicators.includes('atr')
  const mainHeight = compact ? 280 : 420

  const fmtPrice = (v?: number) =>
    v !== undefined
      ? v >= 1000
        ? `$${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : `$${v.toFixed(v >= 1 ? 4 : 8)}`
      : '—'

  const fmtVolume = (v?: number) =>
    v !== undefined
      ? v >= 1_000_000
        ? `${(v / 1_000_000).toFixed(2)}M`
        : v >= 1_000
          ? `${(v / 1_000).toFixed(2)}K`
          : v.toFixed(2)
      : '—'

  const lastCandle = candles.length > 0 ? candles[candles.length - 1] : null
  const liveClose = liveTicker?.price ? parseFloat(liveTicker.price) : NaN
  const lastBarData: CrosshairOHLCV | null = lastCandle
    ? {
        open: parseFloat(lastCandle.open),
        high: parseFloat(lastCandle.high),
        low: parseFloat(lastCandle.low),
        close: !Number.isNaN(liveClose) ? liveClose : parseFloat(lastCandle.close),
        volume: parseFloat(lastCandle.volume),
      }
    : null
  const headerData = crosshairData ?? lastBarData

  return (
    <div ref={wrapperRef} className="card overflow-hidden">
      {/* Chart header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2 flex-wrap gap-2">
        <div className="flex items-center gap-4 min-h-[28px] flex-wrap">
          {headerData ? (
            <div className="flex items-center gap-3 text-xs font-mono flex-wrap">
              {headerData.open != null && (
                <span className="text-dark-400">
                  O: <span className="text-dark-100">{fmtPrice(headerData.open)}</span>
                </span>
              )}
              {headerData.high != null && (
                <span className="text-dark-400">
                  H: <span className="text-positive">{fmtPrice(headerData.high)}</span>
                </span>
              )}
              {headerData.low != null && (
                <span className="text-dark-400">
                  L: <span className="text-negative">{fmtPrice(headerData.low)}</span>
                </span>
              )}
              {headerData.close != null && (
                <span className="text-dark-400">
                  C: <span className="text-dark-100">{fmtPrice(headerData.close)}</span>
                </span>
              )}
              {headerData.volume != null && showVolume && (
                <span className="text-dark-400">
                  V: <span className="text-dark-100">{fmtVolume(headerData.volume)}</span>
                </span>
              )}
              {!crosshairData && isLive && liveTicker && (
                <span className="w-2 h-2 rounded-full bg-positive animate-pulse" title="Live" />
              )}
            </div>
          ) : (
            <p className="text-sm text-dark-400">
              {productId} · {timeframe} Chart
            </p>
          )}
        </div>

        {showTimeframeSelector && onTimeframeChange && (
          <div className="flex items-center gap-1 bg-dark-800 rounded-lg p-1 flex-wrap">
            {timeframes.map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => onTimeframeChange(tf as Timeframe)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all duration-150 ${
                  timeframe === tf
                    ? 'bg-brand-600 shadow-sm'
                    : 'text-dark-400 hover:text-dark-100 hover:bg-dark-700'
                }`}
                style={timeframe === tf ? { color: '#ffffff' } : {}}
              >
                {tf}
              </button>
            ))}
          </div>
        )}
      </div>

      <ChartToolbar
        onFitContent={fitContent}
        onScrollToRealtime={scrollToRealtime}
        onClearDrawings={handleClearDrawings}
        overlayNames={overlayNames}
        fullscreenTargetRef={wrapperRef}
        enablePriceAlerts={enablePriceAlerts}
        horizontalAlertPrice={horizontalAlertPrice}
        onCreateAlertAtLine={handleCreateAlertAtLine}
      />

      {/* Main chart stack */}
      <div className="relative" style={{ minHeight: mainHeight }}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-dark-900/70 z-10">
            <Loader size="lg" />
          </div>
        )}
        <div ref={drawingContainerRef} className="relative w-full" style={{ height: mainHeight }}>
          <div ref={containerRef} className="w-full h-full" />
        </div>
        {showRsi && (
          <div className="border-t border-dark-800">
            <div className="px-4 py-0.5 text-[10px] text-dark-500 font-mono">RSI ({indicatorParams.rsi})</div>
            <div ref={rsiContainerRef} className="w-full h-[100px]" />
          </div>
        )}
        {showMacd && (
          <div className="border-t border-dark-800">
            <div className="px-4 py-0.5 text-[10px] text-dark-500 font-mono">
              MACD ({indicatorParams.macdFast}/{indicatorParams.macdSlow}/{indicatorParams.macdSignal})
            </div>
            <div ref={macdContainerRef} className="w-full h-[110px]" />
          </div>
        )}
        {showStoch && (
          <div className="border-t border-dark-800">
            <div className="px-4 py-0.5 text-[10px] text-dark-500 font-mono">
              Stoch ({indicatorParams.stochK}/{indicatorParams.stochD})
            </div>
            <div ref={stochContainerRef} className="w-full h-[100px]" />
          </div>
        )}
        {showAtr && (
          <div className="border-t border-dark-800">
            <div className="px-4 py-0.5 text-[10px] text-dark-500 font-mono">ATR ({indicatorParams.atr})</div>
            <div ref={atrContainerRef} className="w-full h-[90px]" />
          </div>
        )}
      </div>
    </div>
  )
}
