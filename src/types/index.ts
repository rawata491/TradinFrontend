export interface Product {
  product_id: string
  price: string
  price_percentage_change_24h: string
  volume_24h: string
  volume_percentage_change_24h: string
  base_increment: string
  quote_increment: string
  base_min_size: string
  base_max_size: string
  base_name: string
  quote_name: string
  is_disabled: boolean
  new: boolean
  status: string
  cancel_only: boolean
  limit_only: boolean
  post_only: boolean
  trading_disabled: boolean
  auction_mode: boolean
  product_type: string
  quote_currency_id: string
  base_currency_id: string
  mid_market_price: string
  base_display_symbol: string
  quote_display_symbol: string
  display_name: string
  approximate_quote_24h_volume: string
}

export interface Candle {
  start: string
  low: string
  high: string
  open: string
  close: string
  volume: string
}

export interface CandleResponse {
  product_id: string
  timeframe: string
  granularity?: string
  candles: Candle[]
  count: number
}

export interface TickerData {
  product_id: string
  price: string
  volume_24_h: string
  low_24_h: string
  high_24_h: string
  low_52_w: string
  high_52_w: string
  price_percent_chg_24_h: string
  best_bid?: string
  best_ask?: string
  best_bid_quantity?: string
  best_ask_quantity?: string
}

export type { WSMessage } from '@/types/ws'

export type Timeframe = '1m' | '5m' | '15m' | '1H' | '4H' | '1D' | '1W' | '1M'

export interface MarketTrade {
  trade_id: string
  product_id: string
  price: string
  size: string
  side: 'BUY' | 'SELL'
  time: string
}

export interface MarketTradesResponse {
  trades: MarketTrade[]
  best_bid: string
  best_ask: string
}

export interface ProductListResponse {
  products: Product[]
  total: number
  limit: number
  offset: number
}

// ── AI / News Types ───────────────────────────────────────────────────────────

export type SentimentType = 'bullish' | 'bearish' | 'neutral'

export interface AIInsight {
  symbol: string
  summary: string | null
  sentiment: SentimentType
  confidence: number
  positive_factors: string[]
  negative_factors: string[]
  market_impact: string | null
  key_events: string[]
  articles_processed: number
  last_updated: string | null
  cache_expires: string | null
  is_stale: boolean
}

export interface NewsArticle {
  id: number
  external_id: string
  title: string
  description: string | null
  url: string
  image_url: string | null
  published_at: string
  source_name: string | null
  source_domain: string | null
  kind: string
  symbols: string[]
  votes_positive: number
  votes_negative: number
  panic_score: number
}

export interface NewsListResponse {
  symbol: string
  articles: NewsArticle[]
  total: number
  page: number
  page_size: number
}

export interface BatchSentiment {
  symbol: string
  sentiment: SentimentType
  confidence: number
  updated_at: string | null
}
