import type { Candle } from '@/types'
import type { OhlcvCandle } from '@/types/onchain'
import type { ParsedCandle } from '@/charts/indicators'

export function ohlcvToParsed(candles: OhlcvCandle[]): ParsedCandle[] {
  return candles
    .map((c) => ({
      time: Math.floor(new Date(c.timestamp).getTime() / 1000),
      open: c.open_usd,
      high: c.high_usd,
      low: c.low_usd,
      close: c.close_usd,
      volume: c.volume_usd,
    }))
    .filter((c) => !Number.isNaN(c.time) && c.close > 0)
    .sort((a, b) => a.time - b.time)
}

export function ohlcvToChartCandles(candles: OhlcvCandle[]): Candle[] {
  return ohlcvToParsed(candles).map((c) => ({
    start: String(c.time),
    open: String(c.open),
    high: String(c.high),
    low: String(c.low),
    close: String(c.close),
    volume: String(c.volume),
  }))
}

export function inferChartTimeframe(candles: OhlcvCandle[]): import('@/types').Timeframe {
  if (!candles.length) return '1H'
  const tf = candles[0].timeframe
  const agg = candles[0].aggregate ?? 1
  if (tf === 'day') return '1D'
  if (tf === 'hour' && agg >= 4) return '4H'
  if (tf === 'hour') return '1H'
  return '1H'
}
