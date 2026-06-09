import {
  createChart,
  LineSeries,
  HistogramSeries,
  CrosshairMode,
  type IChartApi,
  type UTCTimestamp,
} from 'lightweight-charts'
import type { ChartColors } from './useChartInstance'
import {
  computeRSI,
  computeMACD,
  computeStochastic,
  computeATR,
  valuesToLineData,
  type ParsedCandle,
} from './indicators'
import { INDICATOR_COLORS } from '@/utils/constants'

export interface IndicatorPaneOptions {
  rsiPeriod?: number
  macdFast?: number
  macdSlow?: number
  macdSignal?: number
  stochK?: number
  stochD?: number
  atrPeriod?: number
}

export interface IndicatorPaneHandles {
  rsiChart: IChartApi | null
  macdChart: IChartApi | null
  stochChart: IChartApi | null
  atrChart: IChartApi | null
  cleanup: () => void
  syncFromMain: (range: { from: number; to: number } | null) => void
}

function baseChartOptions(colors: ChartColors, height: number) {
  return {
    height,
    layout: {
      background: { color: 'transparent' },
      textColor: colors.text,
      fontSize: 11,
      fontFamily: 'JetBrains Mono, monospace',
    },
    grid: {
      vertLines: { color: colors.grid, style: 1 as const },
      horzLines: { color: colors.grid, style: 1 as const },
    },
    crosshair: {
      mode: CrosshairMode.Normal,
      vertLine: { color: colors.crosshair, labelBackgroundColor: colors.labelBg },
      horzLine: { color: colors.crosshair, labelBackgroundColor: colors.labelBg },
    },
    rightPriceScale: { borderColor: colors.border },
    timeScale: {
      borderColor: colors.border,
      visible: false,
      fixLeftEdge: false,
      fixRightEdge: false,
    },
    handleScroll: false,
    handleScale: false,
  }
}

export function createIndicatorPanes(
  containers: {
    rsi: HTMLDivElement | null
    macd: HTMLDivElement | null
    stoch: HTMLDivElement | null
    atr: HTMLDivElement | null
  },
  candles: ParsedCandle[],
  flags: { rsi: boolean; macd: boolean; stoch: boolean; atr: boolean },
  colors: ChartColors,
  width: number,
  opts: IndicatorPaneOptions = {},
): IndicatorPaneHandles {
  let rsiChart: IChartApi | null = null
  let macdChart: IChartApi | null = null
  let stochChart: IChartApi | null = null
  let atrChart: IChartApi | null = null
  let syncing = false

  const times = candles.map((c) => c.time)
  const closes = candles.map((c) => c.close)
  const rsiPeriod = opts.rsiPeriod ?? 14
  const macdFast = opts.macdFast ?? 12
  const macdSlow = opts.macdSlow ?? 26
  const macdSignal = opts.macdSignal ?? 9
  const stochKPeriod = opts.stochK ?? 14
  const stochDPeriod = opts.stochD ?? 3
  const atrPeriod = opts.atrPeriod ?? 14

  if (flags.rsi && containers.rsi) {
    rsiChart = createChart(containers.rsi, { ...baseChartOptions(colors, 100), width })
    const rsiSeries = rsiChart.addSeries(LineSeries, {
      color: INDICATOR_COLORS.rsi,
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: true,
    })
    rsiSeries.setData(
      valuesToLineData(times, computeRSI(closes, rsiPeriod)).map((d) => ({
        time: d.time as UTCTimestamp,
        value: d.value,
      })),
    )
    rsiSeries.createPriceLine({ price: 70, color: '#64748b', lineWidth: 1, lineStyle: 2, axisLabelVisible: false })
    rsiSeries.createPriceLine({ price: 30, color: '#64748b', lineWidth: 1, lineStyle: 2, axisLabelVisible: false })
  }

  if (flags.macd && containers.macd) {
    macdChart = createChart(containers.macd, { ...baseChartOptions(colors, 110), width })
    const { macd, signal, histogram } = computeMACD(closes, macdFast, macdSlow, macdSignal)
    const histSeries = macdChart.addSeries(HistogramSeries, {
      priceLineVisible: false,
      lastValueVisible: false,
    })
    histSeries.setData(
      valuesToLineData(times, histogram).map((d) => ({
        time: d.time as UTCTimestamp,
        value: d.value,
        color: d.value >= 0 ? 'rgba(38, 166, 154, 0.6)' : 'rgba(239, 83, 80, 0.6)',
      })),
    )
    macdChart.addSeries(LineSeries, {
      color: INDICATOR_COLORS.macd,
      lineWidth: 1,
      priceLineVisible: false,
    }).setData(
      valuesToLineData(times, macd).map((d) => ({
        time: d.time as UTCTimestamp,
        value: d.value,
      })),
    )
    macdChart.addSeries(LineSeries, {
      color: INDICATOR_COLORS.macdSignal,
      lineWidth: 1,
      priceLineVisible: false,
    }).setData(
      valuesToLineData(times, signal).map((d) => ({
        time: d.time as UTCTimestamp,
        value: d.value,
      })),
    )
  }

  if (flags.stoch && containers.stoch) {
    stochChart = createChart(containers.stoch, { ...baseChartOptions(colors, 100), width })
    const { k, d } = computeStochastic(candles, stochKPeriod, stochDPeriod)
    stochChart.addSeries(LineSeries, {
      color: INDICATOR_COLORS.stochK,
      lineWidth: 1,
      priceLineVisible: false,
    }).setData(
      valuesToLineData(times, k).map((pt) => ({
        time: pt.time as UTCTimestamp,
        value: pt.value,
      })),
    )
    stochChart.addSeries(LineSeries, {
      color: INDICATOR_COLORS.stochD,
      lineWidth: 1,
      priceLineVisible: false,
    }).setData(
      valuesToLineData(times, d).map((pt) => ({
        time: pt.time as UTCTimestamp,
        value: pt.value,
      })),
    )
  }

  if (flags.atr && containers.atr) {
    atrChart = createChart(containers.atr, { ...baseChartOptions(colors, 90), width })
    atrChart.addSeries(LineSeries, {
      color: INDICATOR_COLORS.atr,
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: true,
    }).setData(
      valuesToLineData(times, computeATR(candles, atrPeriod)).map((d) => ({
        time: d.time as UTCTimestamp,
        value: d.value,
      })),
    )
  }

  const syncFromMain = (range: { from: number; to: number } | null) => {
    if (!range || syncing) return
    syncing = true
    try {
      rsiChart?.timeScale().setVisibleLogicalRange(range)
      macdChart?.timeScale().setVisibleLogicalRange(range)
      stochChart?.timeScale().setVisibleLogicalRange(range)
      atrChart?.timeScale().setVisibleLogicalRange(range)
    } finally {
      syncing = false
    }
  }

  const cleanup = () => {
    rsiChart?.remove()
    macdChart?.remove()
    stochChart?.remove()
    atrChart?.remove()
    rsiChart = macdChart = stochChart = atrChart = null
  }

  return { rsiChart, macdChart, stochChart, atrChart, cleanup, syncFromMain }
}

export function resizeIndicatorPanes(handles: IndicatorPaneHandles, width: number): void {
  handles.rsiChart?.applyOptions({ width })
  handles.macdChart?.applyOptions({ width })
  handles.stochChart?.applyOptions({ width })
  handles.atrChart?.applyOptions({ width })
}
