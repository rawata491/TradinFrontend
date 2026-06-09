import type { OhlcvCandle, OnchainTrade, TokenMetrics, TradeHeatmapData } from '@/types/onchain'

export interface PoolTxnWindow {
  buys: number
  sells: number
  buyers: number
  sellers: number
}

export interface OnchainAnalysis {
  chain: string
  token_address: string
  period_start: string
  period_end: string
  data_source: string
  error?: string | null
  pool?: {
    address?: string | null
    dex?: string | null
    liquidity_usd: number
    volume_h24_usd: number
    volume_h6_usd?: number
    volume_h1_usd?: number
    price_usd: number
    buyers_h24?: number
    sellers_h24?: number
    buys_h24?: number
    sells_h24?: number
    transactions?: {
      h1: PoolTxnWindow
      h6: PoolTxnWindow
      h24: PoolTxnWindow
    }
  } | null
  metrics?: TokenMetrics | null
  candles: OhlcvCandle[]
  heatmap?: TradeHeatmapData | null
  live_trades: OnchainTrade[]
  warnings?: string[]
}
