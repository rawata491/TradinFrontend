import type { TokenChain } from '@/types/tokenSearch'

export type DiscoveryCategory = 'new_dex' | 'new_cex' | 'surging' | 'trending' | 'whale_scan'
export type RiskLevel = 'low' | 'medium' | 'high'
export type SourceType = 'dex' | 'cex'

export interface DiscoveryToken {
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
  source: string
  growth_score: number
  discovery_category: DiscoveryCategory | string
  age_hours: number
  volume_change_pct: number
  source_type: SourceType
  product_id: string
  risk_level: RiskLevel
  pool_created_at?: string | null
  buy_sell_ratio: number
  tx_count_24h: number
  score_breakdown: Record<string, number>
  metadata?: Record<string, unknown>
}

export interface DiscoveryResponse {
  category: string
  total: number
  items: DiscoveryToken[]
  sources_used: string[]
  scanned_at: string
  cached: boolean
}

export interface DiscoveryOverview {
  new_dex_count: number
  new_cex_count: number
  surging_count: number
  trending_count: number
  last_scanned_at: string
}

export const DISCOVERY_TABS: { id: DiscoveryCategory; label: string; description: string }[] = [
  { id: 'new_dex', label: 'New DEX', description: 'Freshly created pools with active trading' },
  { id: 'new_cex', label: 'New CEX', description: 'Recently listed on Coinbase / Gate' },
  { id: 'surging', label: 'Surging', description: 'Volume or price momentum spikes' },
  { id: 'trending', label: 'Trending', description: 'Trending across DEX and market data' },
  { id: 'whale_scan', label: 'Whale Scan', description: 'New tokens with recent whale activity' },
]
