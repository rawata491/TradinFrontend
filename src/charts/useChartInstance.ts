import { useCallback, useEffect, useRef, useState } from 'react'
import {
  createChart,
  CrosshairMode,
  LineSeries,
  TickMarkType,
  createSeriesMarkers,
  type IChartApi,
  type ISeriesApi,
  type ISeriesMarkersPluginApi,
  type SeriesMarker,
  type Time,
  type UTCTimestamp,
} from 'lightweight-charts'
import type { Candle, TickerData } from '@/types'
import type { Signal } from '@/types/signal'
import type { ChartType, BuiltinIndicatorId } from '@/store/useChartStore'
import {
  parseCandles,
  computeEMA,
  computeSMA,
  computeBollinger,
  computeVWAP,
  valuesToLineData,
  type ParsedCandle,
} from './indicators'
import { applyLiveTick } from './liveCandles'
import {
  createMainSeries,
  setMainSeriesData,
  updateMainSeriesLast,
  type MainSeriesBundle,
} from './chartTypes'
import {
  attachVolumeSeries,
  updateVolumeLast,
  resetPriceScaleMargins,
} from './volumePane'
import {
  createIndicatorPanes,
  resizeIndicatorPanes,
  type IndicatorPaneHandles,
} from './indicatorPanes'
import { DrawingManager } from './drawingTools'
import { buildTradeMarkers, TradeOverlayRenderer, focusTradeRange } from './tradeOverlays'
import { OVERLAY_COLORS, INDICATOR_COLORS } from '@/utils/constants'
import type { Trade } from '@/types/backtest'

export interface ChartColors {
  grid: string
  border: string
  text: string
  crosshair: string
  labelBg: string
}

export function getChartColors(isDark: boolean): ChartColors {
  return isDark
    ? {
        grid: '#1e293b',
        border: '#1e293b',
        text: '#64748b',
        crosshair: '#334155',
        labelBg: '#1e293b',
      }
    : {
        grid: '#e2e8f0',
        border: '#e2e8f0',
        text: '#64748b',
        crosshair: '#cbd5e1',
        labelBg: '#f1f5f9',
      }
}

export interface CrosshairOHLCV {
  open?: number
  high?: number
  low?: number
  close?: number
  volume?: number
}

export interface ChartInstanceRefs {
  chart: IChartApi | null
  mainSeries: MainSeriesBundle | null
  fitContent: () => void
  scrollToRealtime: () => void
  clearDrawings: () => void
}

interface UseChartInstanceOptions {
  containerRef: React.RefObject<HTMLDivElement | null>
  rsiContainerRef: React.RefObject<HTMLDivElement | null>
  macdContainerRef: React.RefObject<HTMLDivElement | null>
  stochContainerRef: React.RefObject<HTMLDivElement | null>
  atrContainerRef: React.RefObject<HTMLDivElement | null>
  drawingContainerRef: React.RefObject<HTMLDivElement | null>
  isDark: boolean
  candles: Candle[]
  chartType: ChartType
  showVolume: boolean
  activeIndicators: BuiltinIndicatorId[]
  indicatorParams: Record<string, number>
  drawingTool: import('@/store/useChartStore').DrawingTool
  productId: string
  timeframe: string
  signals: Signal[]
  trades?: Trade[]
  selectedTradeIndex?: number | null
  indicatorOverlays: Record<string, (number | null)[]>
  onchainMarkers?: import('@/types/onchain').OnchainChartMarker[]
  liveTicker?: TickerData | null
  onCrosshairChange: (data: CrosshairOHLCV | null) => void
  onHorizontalAlertPrice?: (price: number | null) => void
}

const BUILTIN_INDICATOR_META: Record<
  BuiltinIndicatorId,
  { label: string; period?: number; paramKey?: string; kind: string }
> = {
  ema9: { label: 'EMA', paramKey: 'ema9', kind: 'ema' },
  ema21: { label: 'EMA', paramKey: 'ema21', kind: 'ema' },
  sma20: { label: 'SMA', paramKey: 'sma20', kind: 'sma' },
  sma50: { label: 'SMA', paramKey: 'sma50', kind: 'sma' },
  rsi: { label: 'RSI', paramKey: 'rsi', kind: 'rsi' },
  macd: { label: 'MACD', kind: 'macd' },
  bb: { label: 'Bollinger', kind: 'bb' },
  vwap: { label: 'VWAP', kind: 'vwap' },
  stoch: { label: 'Stochastic', kind: 'stoch' },
  atr: { label: 'ATR', paramKey: 'atr', kind: 'atr' },
}

export function useChartInstance(opts: UseChartInstanceOptions): ChartInstanceRefs {
  const chartRef = useRef<IChartApi | null>(null)
  const mainSeriesRef = useRef<MainSeriesBundle | null>(null)
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null)
  const overlaySeriesRef = useRef<ISeriesApi<'Line'>[]>([])
  const builtinSeriesRef = useRef<ISeriesApi<'Line'>[]>([])
  const indicatorPanesRef = useRef<IndicatorPaneHandles | null>(null)
  const drawingManagerRef = useRef<DrawingManager | null>(null)
  const tradeOverlayRef = useRef<TradeOverlayRenderer | null>(null)
  const markersPluginRef = useRef<ISeriesMarkersPluginApi<Time> | null>(null)
  const lastCandleRef = useRef<ParsedCandle | null>(null)
  const parsedRef = useRef<ParsedCandle[]>([])
  const [, setChartReady] = useState(0)

  const {
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
    trades = [],
    selectedTradeIndex = null,
    indicatorOverlays,
    onchainMarkers = [],
    liveTicker,
    onCrosshairChange,
    onHorizontalAlertPrice,
  } = opts

  const candlesLiveRef = useRef<Candle[]>(candles)
  candlesLiveRef.current = candles

  const buildChartOptions = useCallback(
    (width: number, height: number, colors: ChartColors) => ({
      width,
      height,
      layout: {
        background: { color: 'transparent' },
        textColor: colors.text,
        fontSize: 12,
        fontFamily: 'JetBrains Mono, monospace',
      },
      grid: {
        vertLines: { color: colors.grid, style: 1 as const },
        horzLines: { color: colors.grid, style: 1 as const },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: colors.crosshair,
          labelBackgroundColor: colors.labelBg,
        },
        horzLine: {
          color: colors.crosshair,
          labelBackgroundColor: colors.labelBg,
        },
      },
      rightPriceScale: {
        borderColor: colors.border,
        scaleMargins: { top: 0.08, bottom: showVolume ? 0.28 : 0.08 },
      },
      timeScale: {
        borderColor: colors.border,
        timeVisible: true,
        secondsVisible: false,
        fixLeftEdge: false,
        fixRightEdge: false,
        tickMarkFormatter: (time: UTCTimestamp, tickMarkType: TickMarkType) => {
          const d = new Date(time * 1000)
          if (tickMarkType === TickMarkType.Time || tickMarkType === TickMarkType.TimeWithSeconds) {
            return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
          if (tickMarkType === TickMarkType.DayOfMonth) {
            return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
          }
          if (tickMarkType === TickMarkType.Month) {
            return d.toLocaleDateString([], { month: 'short' })
          }
          return d.toLocaleDateString([], { year: 'numeric' })
        },
      },
      handleScroll: { mouseWheel: true, pressedMouseMove: true },
      handleScale: { mouseWheel: true, pinch: true },
    }),
    [showVolume],
  )

  const initChart = useCallback(() => {
    const container = containerRef.current
    if (!container) return

    chartRef.current?.remove()
    indicatorPanesRef.current?.cleanup()
    drawingManagerRef.current?.destroy()
    tradeOverlayRef.current?.destroy()

    const colors = getChartColors(isDark)
    const chart = createChart(
      container,
      buildChartOptions(container.clientWidth, container.clientHeight || 420, colors),
    )
    chartRef.current = chart

    const mainSeries = createMainSeries(chart, chartType)
    mainSeriesRef.current = mainSeries
    markersPluginRef.current = createSeriesMarkers(mainSeries.series)

    chart.subscribeCrosshairMove((param) => {
      if (!param.time || !mainSeriesRef.current) {
        onCrosshairChange(null)
        return
      }
      const data = param.seriesData.get(mainSeriesRef.current.series)
      if (!data) {
        onCrosshairChange(null)
        return
      }
      if ('open' in data) {
        const idx = parsedRef.current.findIndex((c) => c.time === param.time)
        onCrosshairChange({
          open: data.open,
          high: data.high,
          low: data.low,
          close: data.close,
          volume: idx >= 0 ? parsedRef.current[idx]?.volume : undefined,
        })
      } else if ('value' in data) {
        onCrosshairChange({ close: data.value })
      }
    })

    chart.timeScale().subscribeVisibleLogicalRangeChange((range) => {
      indicatorPanesRef.current?.syncFromMain(range)
    })

    if (drawingContainerRef.current) {
      const dm = new DrawingManager(drawingContainerRef.current, chart, mainSeries.series)
      dm.init(productId, timeframe)
      dm.setTool(drawingTool)
      if (onHorizontalAlertPrice) {
        dm.setOnHorizontalPriceChange(onHorizontalAlertPrice)
      }
      drawingManagerRef.current = dm

      const tor = new TradeOverlayRenderer(drawingContainerRef.current, chart, mainSeries.series)
      tradeOverlayRef.current = tor
    }

    setChartReady((n) => n + 1)
  }, [
    containerRef,
    drawingContainerRef,
    isDark,
    chartType,
    buildChartOptions,
    productId,
    timeframe,
    drawingTool,
    onCrosshairChange,
    onHorizontalAlertPrice,
  ])

  useEffect(() => {
    initChart()
    const container = containerRef.current
    if (!container) return

    const handleResize = () => {
      if (!chartRef.current || !container) return
      chartRef.current.applyOptions({ width: container.clientWidth })
      indicatorPanesRef.current &&
        resizeIndicatorPanes(indicatorPanesRef.current, container.clientWidth)
      drawingManagerRef.current?.render()
      tradeOverlayRef.current?.render()
    }

    const ro = new ResizeObserver(handleResize)
    ro.observe(container)

    return () => {
      ro.disconnect()
      indicatorPanesRef.current?.cleanup()
      drawingManagerRef.current?.destroy()
      tradeOverlayRef.current?.destroy()
      chartRef.current?.remove()
      chartRef.current = null
      mainSeriesRef.current = null
      volumeSeriesRef.current = null
      overlaySeriesRef.current = []
      builtinSeriesRef.current = []
    }
  }, [initChart, containerRef])

  // Candle data
  useEffect(() => {
    const chart = chartRef.current
    const mainSeries = mainSeriesRef.current
    if (!chart || !mainSeries || candles.length === 0) return

    const parsed = parseCandles(candles)
    parsedRef.current = parsed
    candlesLiveRef.current = candles
    setMainSeriesData(mainSeries, parsed)
    chart.timeScale().fitContent()
    lastCandleRef.current = parsed[parsed.length - 1] ?? null

    // Volume
    if (volumeSeriesRef.current) {
      chart.removeSeries(volumeSeriesRef.current)
    }
    volumeSeriesRef.current = null
    resetPriceScaleMargins(chart, showVolume)
    if (showVolume) {
      volumeSeriesRef.current = attachVolumeSeries(chart, parsed)
    }

    // Pine overlays
    overlaySeriesRef.current.forEach((s) => {
      try { chart.removeSeries(s) } catch { /* empty */ }
    })
    overlaySeriesRef.current = []
    const times = parsed.map((c) => c.time)
    Object.entries(indicatorOverlays).forEach(([key, values], idx) => {
      if (!values?.length) return
      const lineSeries = chart.addSeries(LineSeries, {
        color: OVERLAY_COLORS[idx % OVERLAY_COLORS.length],
        lineWidth: 1,
        lastValueVisible: true,
        priceLineVisible: false,
        title: key,
      })
      lineSeries.setData(
        valuesToLineData(times, values).map((d) => ({
          time: d.time as UTCTimestamp,
          value: d.value,
        })),
      )
      overlaySeriesRef.current.push(lineSeries)
    })

    // Built-in price overlays
    builtinSeriesRef.current.forEach((s) => {
      try { chart.removeSeries(s) } catch { /* empty */ }
    })
    builtinSeriesRef.current = []
    const closes = parsed.map((c) => c.close)
    activeIndicators
      .filter((id) => {
        const k = BUILTIN_INDICATOR_META[id].kind
        return k === 'ema' || k === 'sma'
      })
      .forEach((id) => {
        const meta = BUILTIN_INDICATOR_META[id]
        const period = indicatorParams[meta.paramKey ?? id] ?? 20
        const values =
          meta.kind === 'ema'
            ? computeEMA(closes, period)
            : computeSMA(closes, period)
        const lineSeries = chart.addSeries(LineSeries, {
          color: INDICATOR_COLORS[id] ?? '#3B82F6',
          lineWidth: 1,
          lastValueVisible: false,
          priceLineVisible: false,
          title: `${meta.label}(${period})`,
        })
        lineSeries.setData(
          valuesToLineData(times, values).map((d) => ({
            time: d.time as UTCTimestamp,
            value: d.value,
          })),
        )
        builtinSeriesRef.current.push(lineSeries)
      })

    if (activeIndicators.includes('bb')) {
      const period = indicatorParams.bbPeriod ?? 20
      const mult = indicatorParams.bbMult ?? 2
      const { upper, middle, lower } = computeBollinger(closes, period, mult)
      for (const [key, values, color] of [
        ['BB Upper', upper, INDICATOR_COLORS.bbUpper],
        ['BB Mid', middle, INDICATOR_COLORS.bbMid],
        ['BB Lower', lower, INDICATOR_COLORS.bbLower],
      ] as const) {
        const s = chart.addSeries(LineSeries, {
          color,
          lineWidth: 1,
          lastValueVisible: false,
          priceLineVisible: false,
          title: `${key}(${period})`,
        })
        s.setData(
          valuesToLineData(times, values).map((d) => ({
            time: d.time as UTCTimestamp,
            value: d.value,
          })),
        )
        builtinSeriesRef.current.push(s)
      }
    }

    if (activeIndicators.includes('vwap')) {
      const vwapValues = computeVWAP(parsed)
      const s = chart.addSeries(LineSeries, {
        color: INDICATOR_COLORS.vwap,
        lineWidth: 1,
        lastValueVisible: false,
        priceLineVisible: false,
        title: 'VWAP',
      })
      s.setData(
        valuesToLineData(times, vwapValues).map((d) => ({
          time: d.time as UTCTimestamp,
          value: d.value,
        })),
      )
      builtinSeriesRef.current.push(s)
    }

    // Markers: trades take priority over signals
    if (markersPluginRef.current) {
      let markers: SeriesMarker<Time>[] = []
      if (trades.length > 0) {
        markers = buildTradeMarkers(trades, times)
        tradeOverlayRef.current?.setData(trades, times)
      } else if (mainSeries.kind === 'candlestick' && signals.length > 0) {
        markers = signals
          .map((sig) => {
            if (sig.bar_index < 0 || sig.bar_index >= times.length) return null
            const isBuy = sig.direction === 'buy'
            return {
              time: times[sig.bar_index] as UTCTimestamp,
              position: isBuy ? 'belowBar' : 'aboveBar',
              color: isBuy ? '#10B981' : '#EF4444',
              shape: isBuy ? 'arrowUp' : 'arrowDown',
              text: sig.label,
              size: 1,
            } as SeriesMarker<Time>
          })
          .filter((m): m is SeriesMarker<Time> => m !== null)
          .sort((a, b) => (a.time as number) - (b.time as number))
        tradeOverlayRef.current?.setData([], times)
      } else {
        tradeOverlayRef.current?.setData([], times)
      }

      // Merge on-chain whale/swap markers
      if (onchainMarkers.length > 0) {
        const onchainSeriesMarkers = onchainMarkers.map((m) => ({
          time: m.time as UTCTimestamp,
          position: m.position,
          color: m.color,
          shape: m.shape,
          text: m.text,
          size: 1,
        })) as SeriesMarker<Time>[]
        markers = [...markers, ...onchainSeriesMarkers].sort(
          (a, b) => (a.time as number) - (b.time as number),
        )
      }

      markersPluginRef.current.setMarkers(markers)
    }

    // Indicator panes
    indicatorPanesRef.current?.cleanup()
    indicatorPanesRef.current = createIndicatorPanes(
      {
        rsi: rsiContainerRef.current,
        macd: macdContainerRef.current,
        stoch: stochContainerRef.current,
        atr: atrContainerRef.current,
      },
      parsed,
      {
        rsi: activeIndicators.includes('rsi'),
        macd: activeIndicators.includes('macd'),
        stoch: activeIndicators.includes('stoch'),
        atr: activeIndicators.includes('atr'),
      },
      getChartColors(isDark),
      containerRef.current?.clientWidth ?? 600,
      {
        rsiPeriod: indicatorParams.rsi,
        macdFast: indicatorParams.macdFast,
        macdSlow: indicatorParams.macdSlow,
        macdSignal: indicatorParams.macdSignal,
        stochK: indicatorParams.stochK,
        stochD: indicatorParams.stochD,
        atrPeriod: indicatorParams.atr,
      },
    )
    const range = chart.timeScale().getVisibleLogicalRange()
    indicatorPanesRef.current.syncFromMain(range)
  }, [
    candles,
    chartType,
    showVolume,
    indicatorOverlays,
    signals,
    trades,
    onchainMarkers,
    activeIndicators,
    indicatorParams,
    isDark,
    rsiContainerRef,
    macdContainerRef,
    stochContainerRef,
    atrContainerRef,
    containerRef,
  ])

  // Live ticker with bar roll-forward
  useEffect(() => {
    const mainSeries = mainSeriesRef.current
    if (!mainSeries || !liveTicker?.price) return
    const livePrice = parseFloat(liveTicker.price)
    if (Number.isNaN(livePrice) || livePrice <= 0) return

    const tickResult = applyLiveTick(candlesLiveRef.current, liveTicker, timeframe)
    if (tickResult) {
      candlesLiveRef.current = tickResult.candles
      const parsed = parseCandles(tickResult.candles)
      parsedRef.current = parsed
      setMainSeriesData(mainSeries, parsed)
      lastCandleRef.current = tickResult.updated
      if (volumeSeriesRef.current && chartRef.current) {
        chartRef.current.removeSeries(volumeSeriesRef.current)
        volumeSeriesRef.current = showVolume ? attachVolumeSeries(chartRef.current, parsed) : null
      }
      tradeOverlayRef.current?.setData(trades, parsed.map((c) => c.time))
      return
    }

    const last = lastCandleRef.current
    if (!last) return
    const updated: ParsedCandle = {
      ...last,
      high: Math.max(last.high, livePrice),
      low: Math.min(last.low, livePrice),
      close: livePrice,
    }
    lastCandleRef.current = updated
    updateMainSeriesLast(mainSeries, updated)
    if (volumeSeriesRef.current) updateVolumeLast(volumeSeriesRef.current, updated)
  }, [liveTicker?.price, timeframe, showVolume, trades])

  useEffect(() => {
    const chart = chartRef.current
    if (!chart || selectedTradeIndex == null || !trades[selectedTradeIndex]) return
    focusTradeRange(chart, trades[selectedTradeIndex], parsedRef.current.length)
  }, [selectedTradeIndex, trades])

  useEffect(() => {
    drawingManagerRef.current?.setTool(drawingTool)
  }, [drawingTool])

  useEffect(() => {
    drawingManagerRef.current?.init(productId, timeframe)
    if (onHorizontalAlertPrice) {
      drawingManagerRef.current?.setOnHorizontalPriceChange(onHorizontalAlertPrice)
    }
  }, [productId, timeframe, onHorizontalAlertPrice])

  const fitContent = useCallback(() => {
    chartRef.current?.timeScale().fitContent()
  }, [])

  const scrollToRealtime = useCallback(() => {
    const chart = chartRef.current
    if (!chart) return
    chart.timeScale().scrollToRealTime()
  }, [])

  const clearDrawings = useCallback(() => {
    drawingManagerRef.current?.clearAll()
  }, [])

  return {
    chart: chartRef.current,
    mainSeries: mainSeriesRef.current,
    fitContent,
    scrollToRealtime,
    clearDrawings,
  }
}

export { BUILTIN_INDICATOR_META }
