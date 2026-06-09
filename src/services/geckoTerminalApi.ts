/**
 * Direct GeckoTerminal API client (free, no API key, CORS-enabled).
 * Fetches live from the browser — no backend sync required.
 */

import type { OhlcvCandle, OnchainChain, OnchainTrade } from '@/types/onchain'
import type { OnchainAnalysis } from '@/types/onchainAnalysis'
import { candlesToHeatmap, candlesToMetrics } from '@/utils/onchainAnalytics'

const GECKO_BASE = 'https://api.geckoterminal.com/api/v2'
const HEADERS = { Accept: 'application/json;version=20230203' }

const CHAIN_NETWORK: Record<OnchainChain, string> = {
  ethereum: 'eth',
  base: 'base',
  bsc: 'bsc',
  solana: 'solana',
}

const MAX_RANGE_DAYS = 180
const MIN_CALL_INTERVAL_MS = 1600
let lastCallAt = 0

function normalizeTokenAddress(chain: OnchainChain, address: string): string {
  return chain === 'solana' ? address : address.toLowerCase()
}

function isEvmAddress(address: string): boolean {
  return address.startsWith('0x')
}

function addressesMatch(a: string, b: string): boolean {
  if (isEvmAddress(a) || isEvmAddress(b)) {
    return a.toLowerCase() === b.toLowerCase()
  }
  return a === b
}

async function geckoFetch<T>(path: string, params: Record<string, string | number> = {}, attempt = 0): Promise<T> {
  const now = Date.now()
  const wait = MIN_CALL_INTERVAL_MS - (now - lastCallAt)
  if (wait > 0) await new Promise((r) => setTimeout(r, wait))
  lastCallAt = Date.now()

  const qs = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) qs.set(k, String(v))

  const url = `${GECKO_BASE}${path}${qs.size ? `?${qs}` : ''}`
  let resp: Response
  try {
    resp = await fetch(url, { headers: HEADERS })
  } catch (err) {
    if (attempt < 3) {
      await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)))
      return geckoFetch(path, params, attempt + 1)
    }
    throw err
  }

  const body = (await resp.json()) as T & {
    status?: { error_code?: number; error_message?: string }
  }

  const apiError = body?.status?.error_code
  if (apiError) {
    if (apiError === 429 && attempt < 3) {
      await new Promise((r) => setTimeout(r, 3500 * (attempt + 1)))
      return geckoFetch(path, params, attempt + 1)
    }
    throw new Error(body.status?.error_message || `GeckoTerminal error ${apiError}`)
  }

  if (resp.status === 429 && attempt < 3) {
    await new Promise((r) => setTimeout(r, 3500 * (attempt + 1)))
    return geckoFetch(path, params, attempt + 1)
  }
  if (resp.status === 404) {
    throw new Error('Token or pool not found on GeckoTerminal for this chain.')
  }
  if (!resp.ok) throw new Error(`GeckoTerminal error ${resp.status}`)

  return body as T
}

interface TxnWindow {
  buys: number
  sells: number
  buyers: number
  sellers: number
}

interface PoolAttrs {
  address: string
  reserve_in_usd: string
  token_price_usd: string
  volume_usd: { m5?: string; h1?: string; h6?: string; h24: string }
  transactions: {
    m5?: TxnWindow
    h1?: TxnWindow
    h6?: TxnWindow
    h24: TxnWindow
  }
}

async function resolvePool(chain: OnchainChain, tokenAddress: string) {
  const network = CHAIN_NETWORK[chain]
  const normalized = normalizeTokenAddress(chain, tokenAddress)
  const data = await geckoFetch<{ data: Array<{ attributes: PoolAttrs; relationships: { dex: { data: { id: string } } } }> }>(
    `/networks/${network}/tokens/${normalized}/pools`,
  )

  const pools = data.data ?? []
  if (!pools.length) return null

  const best = pools.reduce((a, b) => {
    const scoreA = parseFloat(a.attributes.reserve_in_usd || '0') * 0.6 + parseFloat(a.attributes.volume_usd?.h24 || '0') * 0.4
    const scoreB = parseFloat(b.attributes.reserve_in_usd || '0') * 0.6 + parseFloat(b.attributes.volume_usd?.h24 || '0') * 0.4
    return scoreB > scoreA ? b : a
  })

  const attrs = best.attributes
  const dexId = best.relationships?.dex?.data?.id ?? ''

  const txns = attrs.transactions ?? {}

  return {
    address: attrs.address,
    dex: dexId.replace(/-/g, ' '),
    liquidity_usd: parseFloat(attrs.reserve_in_usd || '0'),
    volume_h24_usd: parseFloat(attrs.volume_usd?.h24 || '0'),
    volume_h6_usd: parseFloat(attrs.volume_usd?.h6 || '0'),
    volume_h1_usd: parseFloat(attrs.volume_usd?.h1 || '0'),
    price_usd: parseFloat(attrs.token_price_usd || '0'),
    buyers_h24: txns.h24?.buyers ?? 0,
    sellers_h24: txns.h24?.sellers ?? 0,
    buys_h24: txns.h24?.buys ?? 0,
    sells_h24: txns.h24?.sells ?? 0,
    transactions: {
      h1: txns.h1 ?? { buys: 0, sells: 0, buyers: 0, sellers: 0 },
      h6: txns.h6 ?? { buys: 0, sells: 0, buyers: 0, sellers: 0 },
      h24: txns.h24 ?? { buys: 0, sells: 0, buyers: 0, sellers: 0 },
    },
  }
}

function pickTimeframe(spanDays: number): { timeframe: string; aggregate: number } {
  if (spanDays <= 7) return { timeframe: 'hour', aggregate: 1 }
  if (spanDays <= 90) return { timeframe: 'hour', aggregate: 4 }
  return { timeframe: 'day', aggregate: 1 }
}

function parseCandles(rows: number[][]): OhlcvCandle[] {
  return rows
    .filter((r) => r.length >= 6)
    .map((r) => ({
      timestamp: new Date(r[0] * 1000).toISOString(),
      open_usd: r[1],
      high_usd: r[2],
      low_usd: r[3],
      close_usd: r[4],
      volume_usd: r[5],
      timeframe: '',
      aggregate: 1,
    }))
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
}

async function fetchOhlcv(
  chain: OnchainChain,
  poolAddress: string,
  startDate: string,
  endDate: string,
): Promise<OhlcvCandle[]> {
  const start = new Date(`${startDate}T00:00:00Z`)
  let end = new Date(`${endDate}T23:59:59Z`)
  const spanDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86400000))

  if (spanDays > MAX_RANGE_DAYS) {
    start.setTime(end.getTime() - MAX_RANGE_DAYS * 86400000)
  }

  const { timeframe, aggregate } = pickTimeframe(spanDays)
  const network = CHAIN_NETWORK[chain]
  const limit =
    timeframe === 'day'
      ? Math.min(spanDays + 5, 1000)
      : Math.min(Math.ceil((spanDays * 24) / aggregate) + 8, 1000)

  const data = await geckoFetch<{ data: { attributes: { ohlcv_list: number[][] } } }>(
    `/networks/${network}/pools/${poolAddress}/ohlcv/${timeframe}`,
    { aggregate, limit, before_timestamp: Math.floor(end.getTime() / 1000) + 86400 },
  )

  const rows = data.data?.attributes?.ohlcv_list ?? []
  const startTs = start.getTime()
  const endTs = end.getTime()

  return parseCandles(rows).filter((c) => {
    const ts = new Date(c.timestamp).getTime()
    return ts >= startTs && ts <= endTs
  }).map((c) => ({ ...c, timeframe, aggregate }))
}

async function fetchLiveTrades(
  chain: OnchainChain,
  poolAddress: string,
  tokenAddress: string,
  dex: string,
): Promise<OnchainTrade[]> {
  const network = CHAIN_NETWORK[chain]
  const data = await geckoFetch<{ data: Array<{ attributes: Record<string, unknown> }> }>(
    `/networks/${network}/pools/${poolAddress}/trades`,
    { limit: 300 },
  )

  const trades: OnchainTrade[] = []

  for (const item of data.data ?? []) {
    const a = item.attributes
    const kind = String(a.kind ?? '').toLowerCase()
    let side: 'BUY' | 'SELL' = kind === 'buy' ? 'BUY' : 'SELL'
    const toAddr = String(a.to_token_address ?? '')
    const fromAddr = String(a.from_token_address ?? '')

    if (side === 'BUY' && !addressesMatch(toAddr, tokenAddress)) {
      if (addressesMatch(fromAddr, tokenAddress)) side = 'SELL'
      else continue
    }

    const usdValue = parseFloat(String(a.volume_in_usd ?? '0'))
    if (usdValue <= 0) continue

    trades.push({
      id: trades.length + 1,
      chain,
      token_address: tokenAddress,
      wallet: String(a.tx_from_address ?? 'unknown'),
      side,
      amount: parseFloat(String(a.to_token_amount ?? a.from_token_amount ?? '0')),
      usd_value: usdValue,
      price_usd: parseFloat(String(a.price_to_in_usd ?? a.price_from_in_usd ?? '0')),
      timestamp: String(a.block_timestamp ?? new Date().toISOString()),
      dex,
      tx_hash: String(a.tx_hash ?? ''),
      raw_source: 'geckoterminal',
    })
  }

  return trades.sort((a, b) => b.usd_value - a.usd_value)
}

export async function analyzeTokenLive(
  chain: OnchainChain,
  tokenAddress: string,
  startDate: string,
  endDate: string,
): Promise<OnchainAnalysis> {
  const pool = await resolvePool(chain, tokenAddress)

  if (!pool) {
    return {
      chain,
      token_address: tokenAddress,
      period_start: startDate,
      period_end: endDate,
      data_source: 'none',
      error: 'No DEX pool found for this token on GeckoTerminal.',
      pool: null,
      metrics: null,
      candles: [],
      heatmap: null,
      live_trades: [],
    }
  }

  const warnings: string[] = []
  let liveTrades: OnchainTrade[] = []

  // Fetch trades right after pool resolve — before OHLCV — so rate limits don't skip whale data.
  try {
    liveTrades = await fetchLiveTrades(chain, pool.address, tokenAddress, pool.dex)
  } catch (err) {
    warnings.push(
      err instanceof Error
        ? `Whale trades unavailable: ${err.message}`
        : 'Whale trades unavailable — try Refresh in a few seconds.',
    )
  }

  const candles = await fetchOhlcv(chain, pool.address, startDate, endDate)

  const metrics = candlesToMetrics(candles, {
    startDate,
    endDate,
    chain,
    tokenAddress,
    liquidityUsd: pool.liquidity_usd,
    buyersH24: pool.buyers_h24,
  })

  const heatmap = candlesToHeatmap(candles, startDate, endDate, chain, tokenAddress)

  return {
    chain,
    token_address: tokenAddress,
    period_start: startDate,
    period_end: endDate,
    data_source: candles.length ? 'geckoterminal' : 'none',
    error: candles.length ? null : 'No OHLCV data for this date range.',
    warnings,
    pool: {
      address: pool.address,
      dex: pool.dex,
      liquidity_usd: pool.liquidity_usd,
      volume_h24_usd: pool.volume_h24_usd,
      volume_h6_usd: pool.volume_h6_usd,
      volume_h1_usd: pool.volume_h1_usd,
      price_usd: pool.price_usd,
      buyers_h24: pool.buyers_h24,
      sellers_h24: pool.sellers_h24,
      buys_h24: pool.buys_h24,
      sells_h24: pool.sells_h24,
      transactions: pool.transactions,
    },
    metrics,
    candles,
    heatmap,
    live_trades: liveTrades,
  }
}
