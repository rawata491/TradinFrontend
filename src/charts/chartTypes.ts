import type { IChartApi, ISeriesApi, UTCTimestamp } from 'lightweight-charts'
import {
  CandlestickSeries,
  LineSeries,
  AreaSeries,
  type CandlestickData,
  type LineData,
  type AreaData,
} from 'lightweight-charts'
import type { ChartType } from '@/store/useChartStore'
import type { ParsedCandle } from './indicators'

export interface MainSeriesBundle {
  series: ISeriesApi<'Candlestick'> | ISeriesApi<'Line'> | ISeriesApi<'Area'>
  kind: ChartType
}

export function toCandleData(candles: ParsedCandle[]): CandlestickData<UTCTimestamp>[] {
  return candles.map((c) => ({
    time: c.time as UTCTimestamp,
    open: c.open,
    high: c.high,
    low: c.low,
    close: c.close,
  }))
}

export function toLineData(candles: ParsedCandle[]): LineData<UTCTimestamp>[] {
  return candles.map((c) => ({
    time: c.time as UTCTimestamp,
    value: c.close,
  }))
}

export function toAreaData(candles: ParsedCandle[]): AreaData<UTCTimestamp>[] {
  return candles.map((c) => ({
    time: c.time as UTCTimestamp,
    value: c.close,
  }))
}

export function createMainSeries(
  chart: IChartApi,
  chartType: ChartType,
): MainSeriesBundle {
  if (chartType === 'line') {
    const series = chart.addSeries(LineSeries, {
      color: '#3B82F6',
      lineWidth: 2,
      crosshairMarkerVisible: true,
      lastValueVisible: true,
      priceLineVisible: false,
    })
    return { series, kind: 'line' }
  }

  if (chartType === 'area') {
    const series = chart.addSeries(AreaSeries, {
      lineColor: '#3B82F6',
      topColor: 'rgba(59, 130, 246, 0.35)',
      bottomColor: 'rgba(59, 130, 246, 0.02)',
      lineWidth: 2,
      crosshairMarkerVisible: true,
      lastValueVisible: true,
      priceLineVisible: false,
    })
    return { series, kind: 'area' }
  }

  const series = chart.addSeries(CandlestickSeries, {
    upColor: '#22c55e',
    downColor: '#ef4444',
    borderVisible: false,
    wickUpColor: '#22c55e',
    wickDownColor: '#ef4444',
    lastValueVisible: true,
    priceLineVisible: true,
  })
  return { series, kind: 'candlestick' }
}

export function setMainSeriesData(
  bundle: MainSeriesBundle,
  candles: ParsedCandle[],
): void {
  if (bundle.kind === 'candlestick') {
    ;(bundle.series as ISeriesApi<'Candlestick'>).setData(toCandleData(candles))
    return
  }
  if (bundle.kind === 'line') {
    ;(bundle.series as ISeriesApi<'Line'>).setData(toLineData(candles))
    return
  }
  ;(bundle.series as ISeriesApi<'Area'>).setData(toAreaData(candles))
}

export function updateMainSeriesLast(
  bundle: MainSeriesBundle,
  candle: ParsedCandle,
): void {
  const time = candle.time as UTCTimestamp
  if (bundle.kind === 'candlestick') {
    ;(bundle.series as ISeriesApi<'Candlestick'>).update({
      time,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
    })
    return
  }
  if (bundle.kind === 'line') {
    ;(bundle.series as ISeriesApi<'Line'>).update({ time, value: candle.close })
    return
  }
  ;(bundle.series as ISeriesApi<'Area'>).update({ time, value: candle.close })
}
