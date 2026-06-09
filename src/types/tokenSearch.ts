export type TokenChain =
  | 'ethereum'
  | 'base'
  | 'solana'
  | 'bsc'
  | 'arbitrum'
  | 'polygon'
  | 'avalanche'

export interface DiscoveredToken {
  token_name: string
  symbol: string
  chain: TokenChain | string
  contract_address: string
  logo_url: string
  market_cap: number
  liquidity: number
  volume_24h: number
  price_usd: number
  price_change_24h: number
  verified: boolean
  dex: string
  pair_address: string
  rank_score: number
  source: string
  ai_summary?: string | null
}

export interface TokenSearchResponse {
  query: string
  total: number
  items: DiscoveredToken[]
  sources_used: string[]
  cached: boolean
  took_ms: number
}

export interface TrendingToken {
  token_name: string
  symbol: string
  chain: string
  contract_address: string
  logo_url: string
  volume_24h: number
  liquidity: number
  market_cap: number
  search_count: number
  trend_score: number
  dex: string
  verified: boolean
}

export interface RecentSearch {
  query: string
  chain: string
  contract_address: string
  symbol: string
  searched_at: string
}

export interface TokenDetailResponse {
  token: DiscoveredToken
  ai_summary?: string | null
  onchain_url: string
}
