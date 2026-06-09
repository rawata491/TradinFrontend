import type { Candle, Timeframe, TickerData } from '@/types'
import { TIMEFRAME_SECONDS } from '@/utils/constants'
import { parseCandles, type ParsedCandle } from './indicators'

export function getBarOpenTime(timestampSec: number, timeframe: Timeframe | string): number {
  const interval = TIMEFRAME_SECONDS[timeframe] ?? 86400
  return Math.floor(timestampSec / interval) * interval
}

export function applyLiveTick(
  candles: Candle[],
  tick: TickerData,
  timeframe: Timeframe | string,
): { candles: Candle[]; updated: ParsedCandle } | null {
  const price = parseFloat(tick.price)
  if (Number.isNaN(price) || price <= 0) return null

  const now = Math.floor(Date.now() / 1000)
  const barTime = getBarOpenTime(now, timeframe)
  const parsed = parseCandles(candles)
  if (parsed.length === 0) return null

  const last = parsed[parsed.length - 1]
  let updated: ParsedCandle

  if (last.time === barTime) {
    updated = {
      ...last,
      high: Math.max(last.high, price),
      low: Math.min(last.low, price),
      close: price,
    }
    const next = [...candles]
    const idx = next.length - 1
    next[idx] = {
      start: String(updated.time),
      open: String(updated.open),
      high: String(updated.high),
      low: String(updated.low),
      close: String(updated.close),
      volume: String(updated.volume),
    }
    return { candles: next, updated }
  }

  if (barTime > last.time) {
    updated = {
      time: barTime,
      open: price,
      high: price,
      low: price,
      close: price,
      volume: 0,
    }
    const next = [
      ...candles,
      {
        start: String(barTime),
        open: String(price),
        high: String(price),
        low: String(price),
        close: String(price),
        volume: '0',
      },
    ]
    const maxBars = 500
    return {
      candles: next.length > maxBars ? next.slice(-maxBars) : next,
      updated,
    }
  }

  return null
}
