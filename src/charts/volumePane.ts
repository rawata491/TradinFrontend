import type { IChartApi, ISeriesApi, UTCTimestamp } from 'lightweight-charts'
import { HistogramSeries } from 'lightweight-charts'
import type { ParsedCandle } from './indicators'

export function attachVolumeSeries(
  chart: IChartApi,
  candles: ParsedCandle[],
): ISeriesApi<'Histogram'> {
  chart.priceScale('right').applyOptions({
    scaleMargins: { top: 0.08, bottom: 0.28 },
  })

  const volumeSeries = chart.addSeries(HistogramSeries, {
    priceFormat: { type: 'volume' },
    priceScaleId: 'volume',
    lastValueVisible: false,
    priceLineVisible: false,
  })

  chart.priceScale('volume').applyOptions({
    scaleMargins: { top: 0.78, bottom: 0 },
  })

  volumeSeries.setData(
    candles.map((c) => ({
      time: c.time as UTCTimestamp,
      value: c.volume,
      color: c.close >= c.open ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)',
    })),
  )

  return volumeSeries
}

export function updateVolumeLast(
  series: ISeriesApi<'Histogram'>,
  candle: ParsedCandle,
): void {
  series.update({
    time: candle.time as UTCTimestamp,
    value: candle.volume,
    color: candle.close >= candle.open ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)',
  })
}

export function resetPriceScaleMargins(chart: IChartApi, withVolume: boolean): void {
  chart.priceScale('right').applyOptions({
    scaleMargins: withVolume
      ? { top: 0.08, bottom: 0.28 }
      : { top: 0.08, bottom: 0.08 },
  })
}
