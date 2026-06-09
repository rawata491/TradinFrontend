import type { OhlcvCandle, TokenMetrics, TradeHeatmapData } from '@/types/onchain'

function splitVolume(open: number, close: number, volume: number): [number, number] {
  if (volume <= 0) return [0, 0]
  let buyRatio = 0.5
  if (close > open) buyRatio = 0.55 + Math.min((close - open) / Math.max(open, 1e-9), 1) * 0.15
  else if (close < open) buyRatio = 0.45 - Math.min((open - close) / Math.max(open, 1e-9), 1) * 0.15
  const buy = volume * buyRatio
  return [buy, volume - buy]
}

export function candlesToMetrics(
  candles: OhlcvCandle[],
  opts: {
    startDate: string
    endDate: string
    chain: string
    tokenAddress: string
    liquidityUsd: number
    buyersH24: number
  },
): TokenMetrics | null {
  if (!candles.length) return null

  let buyVol = 0
  let sellVol = 0
  let totalVol = 0
  const first = candles[0]
  const last = candles[candles.length - 1]
  let high = 0
  let low = Infinity

  for (const c of candles) {
    const [buy, sell] = splitVolume(c.open_usd, c.close_usd, c.volume_usd)
    buyVol += buy
    sellVol += sell
    totalVol += c.volume_usd
    high = Math.max(high, c.high_usd)
    low = Math.min(low, c.low_usd)
  }

  const priceChange = first.open_usd > 0 ? ((last.close_usd - first.open_usd) / first.open_usd) * 100 : 0

  return {
    chain: opts.chain,
    token_address: opts.tokenAddress,
    buy_volume_usd: Math.round(buyVol * 100) / 100,
    sell_volume_usd: Math.round(sellVol * 100) / 100,
    net_flow_usd: Math.round((buyVol - sellVol) * 100) / 100,
    total_volume_usd: Math.round(totalVol * 100) / 100,
    unique_wallets: 0,
    unique_buyers: 0,
    unique_sellers: 0,
    whale_buy_volume_usd: 0,
    whale_sell_volume_usd: 0,
    smart_money_score_avg: 0,
    holder_count: 0,
    holder_growth_pct: 0,
    liquidity_usd: opts.liquidityUsd,
    liquidity_change_pct: 0,
    early_buyer_count: opts.buyersH24,
    sniper_count: 0,
    price_open_usd: first.open_usd,
    price_close_usd: last.close_usd,
    price_high_usd: high,
    price_low_usd: low === Infinity ? 0 : low,
    price_change_pct: Math.round(priceChange * 100) / 100,
    candle_count: candles.length,
    data_source: 'geckoterminal',
    period_start: `${opts.startDate}T00:00:00`,
    period_end: `${opts.endDate}T23:59:59`,
    computed_at: new Date().toISOString(),
  }
}

export function candlesToHeatmap(
  candles: OhlcvCandle[],
  startDate: string,
  endDate: string,
  chain: string,
  tokenAddress: string,
): TradeHeatmapData {
  const since = new Date(`${startDate}T00:00:00Z`).getTime()
  const until = new Date(`${endDate}T23:59:59Z`).getTime()
  const spanDays = Math.max(1, Math.ceil((until - since) / 86400000))

  let bucketCount = spanDays
  let mode: TradeHeatmapData['bucket_mode'] = 'daily'
  if (spanDays <= 2) {
    bucketCount = Math.min(spanDays * 24, 48)
    mode = 'hourly'
  } else if (spanDays <= 14) {
    bucketCount = Math.min(spanDays * 4, 56)
    mode = 'six_hourly'
  }

  const span = until - since || 1
  const bucketMs = span / bucketCount

  const buckets = Array.from({ length: bucketCount }, (_, i) => ({
    label: new Date(since + (span * i) / bucketCount).toISOString(),
    buy_usd: 0,
    sell_usd: 0,
    total_usd: 0,
  }))

  for (const c of candles) {
    const ts = new Date(c.timestamp).getTime()
    const idx = Math.min(Math.floor((ts - since) / bucketMs), bucketCount - 1)
    const [buy, sell] = splitVolume(c.open_usd, c.close_usd, c.volume_usd)
    buckets[idx].buy_usd += buy
    buckets[idx].sell_usd += sell
    buckets[idx].total_usd += c.volume_usd
  }

  for (const b of buckets) {
    b.buy_usd = Math.round(b.buy_usd * 100) / 100
    b.sell_usd = Math.round(b.sell_usd * 100) / 100
    b.total_usd = Math.round(b.total_usd * 100) / 100
  }

  return {
    chain,
    token_address: tokenAddress,
    period_start: `${startDate}T00:00:00`,
    period_end: `${endDate}T23:59:59`,
    bucket_mode: mode,
    bucket_count: bucketCount,
    active_buckets: buckets.filter((b) => b.total_usd > 0).length,
    trade_count: candles.length,
    data_source: 'geckoterminal',
    buckets,
  }
}
