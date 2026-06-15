import { analyticsHttp } from '@/services/httpClient'
import { buildQueryString } from '@/utils/queryString'

export interface FundingRateItem {
  symbol: string
  product_id: string
  funding_rate: number
  funding_rate_pct: number
  mark_price?: number
  open_interest_usd?: number
}

export interface CorrelationMatrix {
  symbols: string[]
  matrix: number[][]
  pairs: { symbol_a: string; symbol_b: string; correlation: number }[]
}

export interface OrderBookData {
  product_id: string
  bids: { price: number; size: number }[]
  asks: { price: number; size: number }[]
  spread: number
  spread_pct: number
  bid_depth_usd: number
  ask_depth_usd: number
  imbalance: number
  mid_price: number
}

export interface MtfConfluence {
  product_id: string
  signals: { timeframe: string; trend: string; rsi: number; ema_cross: string; score: number }[]
  overall_score: number
  bias: string
  confluence_pct: number
}

export interface ScreenerItem {
  product_id: string
  base_name: string
  price: number
  change_24h_pct: number
  volume_24h: number
}

export const analyticsApi = {
  funding: async (symbols?: string) => {
    const { data } = await analyticsHttp.get(`/api/analytics/funding${buildQueryString({ symbols })}`)
    return data as { items: FundingRateItem[]; updated_at: string }
  },

  correlation: async (symbols?: string, periodDays = 30) => {
    const { data } = await analyticsHttp.get(
      `/api/analytics/correlation${buildQueryString({ symbols, period_days: periodDays })}`,
    )
    return data as CorrelationMatrix
  },

  orderbook: async (productId: string, depth = 20) => {
    const { data } = await analyticsHttp.get(
      `/api/analytics/orderbook/${encodeURIComponent(productId)}${buildQueryString({ depth })}`,
    )
    return data as OrderBookData
  },

  liquidations: async (productId: string) => {
    const { data } = await analyticsHttp.get(`/api/analytics/liquidations/${encodeURIComponent(productId)}`)
    return data
  },

  mtf: async (productId: string) => {
    const { data } = await analyticsHttp.get(`/api/analytics/mtf/${encodeURIComponent(productId)}`)
    return data as MtfConfluence
  },

  compare: async (symbol: string) => {
    const { data } = await analyticsHttp.get(`/api/analytics/compare/${encodeURIComponent(symbol)}`)
    return data
  },

  safety: async (chain: string, address: string) => {
    const { data } = await analyticsHttp.get(
      `/api/analytics/safety/${encodeURIComponent(chain)}/${encodeURIComponent(address)}`,
    )
    return data
  },

  volatility: async (symbols?: string) => {
    const { data } = await analyticsHttp.get(`/api/analytics/volatility${buildQueryString({ symbols })}`)
    return data
  },

  events: async (symbol?: string) => {
    const { data } = await analyticsHttp.get(`/api/analytics/events${buildQueryString({ symbol })}`)
    return data
  },

  screener: async (params: Record<string, string | number | undefined>) => {
    const { data } = await analyticsHttp.get(`/api/analytics/screener${buildQueryString(params)}`)
    return data as { total: number; items: ScreenerItem[] }
  },

  bridges: async () => {
    const { data } = await analyticsHttp.get('/api/analytics/bridges')
    return data
  },

  fearGreed: async (limit = 30) => {
    const { data } = await analyticsHttp.get(`/api/analytics/fear-greed${buildQueryString({ limit })}`)
    return data
  },

  global: async () => {
    const { data } = await analyticsHttp.get('/api/analytics/global')
    return data
  },
}
