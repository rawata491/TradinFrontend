import type { Candle } from '@/types'

export interface ParsedCandle {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export function parseCandles(candles: Candle[]): ParsedCandle[] {
  return candles
    .map((c) => ({
      time: parseInt(c.start, 10),
      open: parseFloat(c.open),
      high: parseFloat(c.high),
      low: parseFloat(c.low),
      close: parseFloat(c.close),
      volume: parseFloat(c.volume),
    }))
    .filter((c) => !Number.isNaN(c.time) && !Number.isNaN(c.close))
    .sort((a, b) => a.time - b.time)
}

function sma(values: number[], period: number): (number | null)[] {
  const out: (number | null)[] = new Array(values.length).fill(null)
  for (let i = period - 1; i < values.length; i++) {
    let sum = 0
    for (let j = i - period + 1; j <= i; j++) sum += values[j]
    out[i] = sum / period
  }
  return out
}

function ema(values: number[], period: number): (number | null)[] {
  const out: (number | null)[] = new Array(values.length).fill(null)
  if (values.length < period) return out
  let seed = 0
  for (let i = 0; i < period; i++) seed += values[i]
  seed /= period
  out[period - 1] = seed
  const k = 2 / (period + 1)
  for (let i = period; i < values.length; i++) {
    out[i] = values[i] * k + (out[i - 1] as number) * (1 - k)
  }
  return out
}

function rma(values: number[], period: number): (number | null)[] {
  const out: (number | null)[] = new Array(values.length).fill(null)
  if (values.length < period) return out
  let seed = 0
  for (let i = 0; i < period; i++) seed += values[i]
  seed /= period
  out[period - 1] = seed
  const alpha = 1 / period
  for (let i = period; i < values.length; i++) {
    out[i] = values[i] * alpha + (out[i - 1] as number) * (1 - alpha)
  }
  return out
}

export function computeSMA(closes: number[], period: number): (number | null)[] {
  return sma(closes, period)
}

export function computeEMA(closes: number[], period: number): (number | null)[] {
  return ema(closes, period)
}

export function computeRSI(closes: number[], period = 14): (number | null)[] {
  const out: (number | null)[] = new Array(closes.length).fill(null)
  if (closes.length < period + 1) return out

  const gains: number[] = []
  const losses: number[] = []
  for (let i = 1; i < closes.length; i++) {
    const delta = closes[i] - closes[i - 1]
    gains.push(delta > 0 ? delta : 0)
    losses.push(delta < 0 ? -delta : 0)
  }

  const avgGain = rma(gains, period)
  const avgLoss = rma(losses, period)

  for (let i = period; i < closes.length; i++) {
    const g = avgGain[i - 1]
    const l = avgLoss[i - 1]
    if (g == null || l == null) continue
    if (l === 0) {
      out[i] = 100
    } else {
      const rs = g / l
      out[i] = 100 - 100 / (1 + rs)
    }
  }
  return out
}

export interface MacdResult {
  macd: (number | null)[]
  signal: (number | null)[]
  histogram: (number | null)[]
}

export function computeMACD(
  closes: number[],
  fast = 12,
  slow = 26,
  signalPeriod = 9,
): MacdResult {
  const fastEma = ema(closes, fast)
  const slowEma = ema(closes, slow)
  const macdLine: (number | null)[] = closes.map((_, i) => {
    if (fastEma[i] == null || slowEma[i] == null) return null
    return (fastEma[i] as number) - (slowEma[i] as number)
  })

  const macdNumeric = macdLine.map((v) => (v == null ? 0 : v))
  const signalLine = ema(macdNumeric, signalPeriod)
  const histogram = macdLine.map((v, i) => {
    if (v == null || signalLine[i] == null) return null
    return v - (signalLine[i] as number)
  })

  return { macd: macdLine, signal: signalLine, histogram }
}

export interface BollingerResult {
  upper: (number | null)[]
  middle: (number | null)[]
  lower: (number | null)[]
}

export function computeBollinger(
  closes: number[],
  period = 20,
  mult = 2,
): BollingerResult {
  const middle = sma(closes, period)
  const upper: (number | null)[] = new Array(closes.length).fill(null)
  const lower: (number | null)[] = new Array(closes.length).fill(null)
  for (let i = period - 1; i < closes.length; i++) {
    if (middle[i] == null) continue
    let sumSq = 0
    for (let j = i - period + 1; j <= i; j++) {
      const d = closes[j] - (middle[i] as number)
      sumSq += d * d
    }
    const std = Math.sqrt(sumSq / period)
    upper[i] = (middle[i] as number) + mult * std
    lower[i] = (middle[i] as number) - mult * std
  }
  return { upper, middle, lower }
}

export function computeVWAP(candles: ParsedCandle[]): (number | null)[] {
  const out: (number | null)[] = new Array(candles.length).fill(null)
  let cumTpVol = 0
  let cumVol = 0
  for (let i = 0; i < candles.length; i++) {
    const c = candles[i]
    const tp = (c.high + c.low + c.close) / 3
    cumTpVol += tp * c.volume
    cumVol += c.volume
    out[i] = cumVol > 0 ? cumTpVol / cumVol : null
  }
  return out
}

export function computeStochastic(
  candles: ParsedCandle[],
  kPeriod = 14,
  dPeriod = 3,
): { k: (number | null)[]; d: (number | null)[] } {
  const k: (number | null)[] = new Array(candles.length).fill(null)
  for (let i = kPeriod - 1; i < candles.length; i++) {
    let hi = -Infinity
    let lo = Infinity
    for (let j = i - kPeriod + 1; j <= i; j++) {
      hi = Math.max(hi, candles[j].high)
      lo = Math.min(lo, candles[j].low)
    }
    k[i] = hi === lo ? 50 : (100 * (candles[i].close - lo)) / (hi - lo)
  }
  const kNumeric = k.map((v) => (v == null ? 0 : v))
  const d = sma(kNumeric, dPeriod)
  return { k, d }
}

export function computeATR(candles: ParsedCandle[], period = 14): (number | null)[] {
  const tr: number[] = new Array(candles.length).fill(0)
  for (let i = 0; i < candles.length; i++) {
    if (i === 0) {
      tr[i] = candles[i].high - candles[i].low
    } else {
      const hl = candles[i].high - candles[i].low
      const hc = Math.abs(candles[i].high - candles[i - 1].close)
      const lc = Math.abs(candles[i].low - candles[i - 1].close)
      tr[i] = Math.max(hl, hc, lc)
    }
  }
  return rma(tr, period)
}

export function valuesToLineData(
  times: number[],
  values: (number | null)[],
): { time: number; value: number }[] {
  return values
    .map((v, i) => (v == null || Number.isNaN(v) ? null : { time: times[i], value: v }))
    .filter((d): d is { time: number; value: number } => d != null)
}
