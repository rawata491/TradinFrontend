/**
 * MTF Trending Fibonacci Strategy (fixed version for on-chain OHLCV).
 *
 * Fixes vs original Pine Script:
 * - Long SL at HTF low (not HTF close above entry)
 * - Short SL at HTF high (not HTF close below entry)
 * - Take profit at configurable R:R
 * - Exit when HTF trend invalidates
 * - One entry per completed HTF bar
 * - Uses prior completed HTF bar only (no repaint)
 */

import type { ParsedCandle } from '@/charts/indicators'
import type { Trade } from '@/types/backtest'
import type { Signal } from '@/types/signal'

export type HtfAnchor = 'D' | 'W'

export interface MtfFibParams {
  htfAnchor: HtfAnchor
  fibLowPct: number
  fibHighPct: number
  bodyThreshold: number
  atrPeriod: number
  atrRangeMin: number
  rewardRiskRatio: number
  slBufferPct: number
}

export const DEFAULT_MTF_FIB_PARAMS: MtfFibParams = {
  htfAnchor: 'D',
  fibLowPct: 0.5,
  fibHighPct: 0.7,
  bodyThreshold: 0.5,
  atrPeriod: 14,
  atrRangeMin: 0.8,
  rewardRiskRatio: 2,
  slBufferPct: 0.001,
}

export interface MtfFibStats {
  totalTrades: number
  winningTrades: number
  losingTrades: number
  winRatePct: number
  netProfitPct: number
  profitFactor: number
  maxDrawdownPct: number
}

export interface MtfFibResult {
  signals: Signal[]
  trades: Trade[]
  indicatorOverlays: Record<string, (number | null)[]>
  stats: MtfFibStats
  activeTrend: 'bull' | 'bear' | 'none'
  zones: {
    buyUpper: number | null
    buyLower: number | null
    sellUpper: number | null
    sellLower: number | null
    longSl: number | null
    shortSl: number | null
  }
}

interface HtfBar {
  time: number
  periodKey: string
  open: number
  high: number
  low: number
  close: number
  volume: number
  atr: number
  trendingGreen: boolean
  trendingRed: boolean
}

function periodKey(ts: number, anchor: HtfAnchor): string {
  const d = new Date(ts * 1000)
  if (anchor === 'D') return d.toISOString().slice(0, 10)
  const day = d.getUTCDay()
  const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), diff))
  return monday.toISOString().slice(0, 10)
}

function periodStartTs(key: string): number {
  return Math.floor(new Date(`${key}T00:00:00Z`).getTime() / 1000)
}

function aggregateHtf(candles: ParsedCandle[], anchor: HtfAnchor): HtfBar[] {
  const buckets = new Map<string, HtfBar>()

  for (const c of candles) {
    const key = periodKey(c.time, anchor)
    const existing = buckets.get(key)
    if (!existing) {
      buckets.set(key, {
        time: periodStartTs(key),
        periodKey: key,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
        volume: c.volume,
        atr: 0,
        trendingGreen: false,
        trendingRed: false,
      })
    } else {
      existing.high = Math.max(existing.high, c.high)
      existing.low = Math.min(existing.low, c.low)
      existing.close = c.close
      existing.volume += c.volume
    }
  }

  const bars = [...buckets.values()].sort((a, b) => a.time - b.time)
  return bars
}

function enrichHtfTrend(bars: HtfBar[], params: MtfFibParams): HtfBar[] {
  return bars.map((bar, i) => {
    const range = bar.high - bar.low
    const body = Math.abs(bar.close - bar.open)
    const atrSlice = bars.slice(Math.max(0, i - params.atrPeriod + 1), i + 1)
    const atr =
      atrSlice.length > 0
        ? atrSlice.reduce((sum, b) => sum + (b.high - b.low), 0) / atrSlice.length
        : range
    bar.atr = atr

    const isBodyDominant = range > 0 && body >= range * params.bodyThreshold
    const isRangeExpanding = range > atr * params.atrRangeMin
    bar.trendingGreen = bar.close > bar.open && isBodyDominant && isRangeExpanding
    bar.trendingRed = bar.close < bar.open && isBodyDominant && isRangeExpanding
    return bar
  })
}

function priorHtfBar(ltfTime: number, htfBars: HtfBar[], anchor: HtfAnchor): HtfBar | null {
  const currentStart = periodStartTs(periodKey(ltfTime, anchor))
  for (let i = htfBars.length - 1; i >= 0; i--) {
    if (htfBars[i].time < currentStart) return htfBars[i]
  }
  return null
}

function fibZones(htf: HtfBar, params: MtfFibParams) {
  const range = htf.high - htf.low
  if (range <= 0) {
    return { buyUpper: null, buyLower: null, sellUpper: null, sellLower: null }
  }

  return {
    buyUpper: htf.trendingGreen ? htf.high - range * params.fibLowPct : null,
    buyLower: htf.trendingGreen ? htf.high - range * params.fibHighPct : null,
    sellLower: htf.trendingRed ? htf.low + range * params.fibLowPct : null,
    sellUpper: htf.trendingRed ? htf.low + range * params.fibHighPct : null,
  }
}

function tsIso(unix: number): string {
  return new Date(unix * 1000).toISOString()
}

export function runMtfFibStrategy(
  candles: ParsedCandle[],
  params: MtfFibParams = DEFAULT_MTF_FIB_PARAMS,
): MtfFibResult {
  const empty: MtfFibResult = {
    signals: [],
    trades: [],
    indicatorOverlays: {},
    stats: {
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      winRatePct: 0,
      netProfitPct: 0,
      profitFactor: 0,
      maxDrawdownPct: 0,
    },
    activeTrend: 'none',
    zones: {
      buyUpper: null,
      buyLower: null,
      sellUpper: null,
      sellLower: null,
      longSl: null,
      shortSl: null,
    },
  }

  if (candles.length < params.atrPeriod + 2) return empty

  const htfBars = enrichHtfTrend(aggregateHtf(candles, params.htfAnchor), params)
  const n = candles.length

  const buyUpper: (number | null)[] = new Array(n).fill(null)
  const buyLower: (number | null)[] = new Array(n).fill(null)
  const sellUpper: (number | null)[] = new Array(n).fill(null)
  const sellLower: (number | null)[] = new Array(n).fill(null)
  const longSlLine: (number | null)[] = new Array(n).fill(null)
  const shortSlLine: (number | null)[] = new Array(n).fill(null)

  const signals: Signal[] = []
  const trades: Trade[] = []

  let position: 'long' | 'short' | null = null
  let entryBar = -1
  let entryPrice = 0
  let stopLoss = 0
  let takeProfit = 0
  let entryLabel = ''
  let lastEntryHtfKey: string | null = null

  let equity = 100
  let peak = 100
  let maxDd = 0
  let grossWin = 0
  let grossLoss = 0

  for (let i = 0; i < n; i++) {
    const c = candles[i]
    const htf = priorHtfBar(c.time, htfBars, params.htfAnchor)
    const zones = htf ? fibZones(htf, params) : {
      buyUpper: null,
      buyLower: null,
      sellUpper: null,
      sellLower: null,
    }

    buyUpper[i] = zones.buyUpper
    buyLower[i] = zones.buyLower
    sellUpper[i] = zones.sellUpper
    sellLower[i] = zones.sellLower

    if (htf?.trendingGreen) {
      longSlLine[i] = htf.low * (1 - params.slBufferPct)
    }
    if (htf?.trendingRed) {
      shortSlLine[i] = htf.high * (1 + params.slBufferPct)
    }

    const localGreen = c.close > c.open
    const localRed = c.close < c.open

    const trendStillValid =
      position === 'long'
        ? htf?.trendingGreen === true
        : position === 'short'
          ? htf?.trendingRed === true
          : false

    // --- Manage open position ---
    if (position === 'long') {
      const hitSl = c.low <= stopLoss
      const hitTp = c.high >= takeProfit
      const trendExit = !trendStillValid

      if (hitSl || hitTp || trendExit) {
        const exitPrice = hitSl ? stopLoss : hitTp ? takeProfit : c.close
        const pnlPct = ((exitPrice - entryPrice) / entryPrice) * 100
        const reason = hitSl ? 'SL' : hitTp ? 'TP' : 'Trend Exit'

        signals.push({
          bar_index: i,
          timestamp: tsIso(c.time),
          signal_type: 'exit',
          label: `Long ${reason}`,
          price: exitPrice,
          direction: 'sell',
          metadata: { pnl_pct: pnlPct, reason },
        })

        trades.push({
          entry_bar: entryBar,
          exit_bar: i,
          entry_price: entryPrice,
          exit_price: exitPrice,
          label: entryLabel,
          pnl_pct: pnlPct,
          entry_timestamp: tsIso(candles[entryBar].time),
          exit_timestamp: tsIso(c.time),
        })

        equity *= 1 + pnlPct / 100
        peak = Math.max(peak, equity)
        maxDd = Math.max(maxDd, ((peak - equity) / peak) * 100)
        if (pnlPct >= 0) grossWin += pnlPct
        else grossLoss += Math.abs(pnlPct)

        position = null
        lastEntryHtfKey = null
      }
    } else if (position === 'short') {
      const hitSl = c.high >= stopLoss
      const hitTp = c.low <= takeProfit
      const trendExit = !trendStillValid

      if (hitSl || hitTp || trendExit) {
        const exitPrice = hitSl ? stopLoss : hitTp ? takeProfit : c.close
        const pnlPct = ((entryPrice - exitPrice) / entryPrice) * 100
        const reason = hitSl ? 'SL' : hitTp ? 'TP' : 'Trend Exit'

        signals.push({
          bar_index: i,
          timestamp: tsIso(c.time),
          signal_type: 'exit',
          label: `Short ${reason}`,
          price: exitPrice,
          direction: 'buy',
          metadata: { pnl_pct: pnlPct, reason },
        })

        trades.push({
          entry_bar: entryBar,
          exit_bar: i,
          entry_price: entryPrice,
          exit_price: exitPrice,
          label: entryLabel,
          pnl_pct: pnlPct,
          entry_timestamp: tsIso(candles[entryBar].time),
          exit_timestamp: tsIso(c.time),
        })

        equity *= 1 + pnlPct / 100
        peak = Math.max(peak, equity)
        maxDd = Math.max(maxDd, ((peak - equity) / peak) * 100)
        if (pnlPct >= 0) grossWin += pnlPct
        else grossLoss += Math.abs(pnlPct)

        position = null
        lastEntryHtfKey = null
      }
    }

    // --- New entries (flat only) ---
    if (position !== null || !htf) continue

    const htfKey = htf.periodKey
    if (lastEntryHtfKey === htfKey) continue

    const inBuyZone =
      zones.buyLower != null &&
      zones.buyUpper != null &&
      c.close >= zones.buyLower &&
      c.close <= zones.buyUpper

    const inSellZone =
      zones.sellLower != null &&
      zones.sellUpper != null &&
      c.close >= zones.sellLower &&
      c.close <= zones.sellUpper

    if (htf.trendingGreen && inBuyZone && localGreen) {
      const sl = htf.low * (1 - params.slBufferPct)
      const risk = c.close - sl
      if (risk <= 0) continue

      entryPrice = c.close
      stopLoss = sl
      takeProfit = c.close + risk * params.rewardRiskRatio
      entryBar = i
      entryLabel = 'MTF Fib Long'
      position = 'long'
      lastEntryHtfKey = htfKey

      signals.push({
        bar_index: i,
        timestamp: tsIso(c.time),
        signal_type: 'entry',
        label: entryLabel,
        price: entryPrice,
        direction: 'buy',
        metadata: { stop_loss: stopLoss, take_profit: takeProfit, htf: htfKey },
      })
    } else if (htf.trendingRed && inSellZone && localRed) {
      const sl = htf.high * (1 + params.slBufferPct)
      const risk = sl - c.close
      if (risk <= 0) continue

      entryPrice = c.close
      stopLoss = sl
      takeProfit = c.close - risk * params.rewardRiskRatio
      entryBar = i
      entryLabel = 'MTF Fib Short'
      position = 'short'
      lastEntryHtfKey = htfKey

      signals.push({
        bar_index: i,
        timestamp: tsIso(c.time),
        signal_type: 'entry',
        label: entryLabel,
        price: entryPrice,
        direction: 'sell',
        metadata: { stop_loss: stopLoss, take_profit: takeProfit, htf: htfKey },
      })
    }
  }

  const lastHtf = htfBars[htfBars.length - 1]
  const lastZones = lastHtf ? fibZones(lastHtf, params) : empty.zones

  const winningTrades = trades.filter((t) => t.pnl_pct > 0).length
  const losingTrades = trades.filter((t) => t.pnl_pct <= 0).length

  return {
    signals,
    trades,
    indicatorOverlays: {
      'Buy Zone 50%': buyUpper,
      'Buy Zone 70%': buyLower,
      'Sell Zone 50%': sellLower,
      'Sell Zone 70%': sellUpper,
      'Long SL (HTF Low)': longSlLine,
      'Short SL (HTF High)': shortSlLine,
    },
    stats: {
      totalTrades: trades.length,
      winningTrades,
      losingTrades,
      winRatePct: trades.length ? (winningTrades / trades.length) * 100 : 0,
      netProfitPct: equity - 100,
      profitFactor: grossLoss > 0 ? grossWin / grossLoss : grossWin > 0 ? Infinity : 0,
      maxDrawdownPct: maxDd,
    },
    activeTrend: lastHtf?.trendingGreen ? 'bull' : lastHtf?.trendingRed ? 'bear' : 'none',
    zones: {
      buyUpper: lastZones.buyUpper,
      buyLower: lastZones.buyLower,
      sellUpper: lastZones.sellUpper,
      sellLower: lastZones.sellLower,
      longSl: lastHtf?.trendingGreen ? lastHtf.low * (1 - params.slBufferPct) : null,
      shortSl: lastHtf?.trendingRed ? lastHtf.high * (1 + params.slBufferPct) : null,
    },
  }
}
