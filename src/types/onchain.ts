export type OnchainChain = 'ethereum' | 'base' | 'bsc' | 'solana'

export const ONCHAIN_SUPPORTED_CHAINS: readonly OnchainChain[] = ['ethereum', 'base', 'bsc', 'solana']

export function isOnchainSupportedChain(chain: string): chain is OnchainChain {
  return (ONCHAIN_SUPPORTED_CHAINS as readonly string[]).includes(chain)
}

export interface TokenRef {
  chain: OnchainChain
  token_address: string
}

export interface OnchainTrade {
  id: number
  chain: string
  token_address: string
  wallet: string
  side: 'BUY' | 'SELL'
  amount: number
  usd_value: number
  price_usd?: number | null
  timestamp: string
  dex: string
  tx_hash: string
  block_number?: number | null
  raw_source: string
}

export interface WalletStat {
  chain: string
  wallet: string
  total_trades: number
  buy_count: number
  sell_count: number
  total_volume_usd: number
  realized_pnl_usd: number
  win_rate: number
  avg_roi_pct: number
  trade_accuracy: number
  smart_money_score: number
  is_whale: boolean
  is_smart_money: boolean
  is_sniper: boolean
  first_seen_at?: string | null
  last_active_at?: string | null
}

export interface HolderSnapshot {
  chain: string
  token_address: string
  holder_count: number
  top10_pct: number
  top50_pct: number
  snapshot_at: string
  metadata?: Record<string, unknown>
}

export interface LiquidityEvent {
  id: number
  chain: string
  token_address: string
  pool_address: string
  event_type: 'ADD' | 'REMOVE' | 'SWAP'
  wallet: string
  token_amount: number
  usd_value: number
  liquidity_usd: number
  timestamp: string
  tx_hash: string
  dex: string
}

export interface WhaleEvent {
  id?: number | null
  chain: string
  wallet: string
  token_address: string
  event_type: string
  usd_value: number
  description: string
  tx_hash: string
  detected_at: string
  metadata?: Record<string, unknown>
}

export interface SmartMoneyWallet {
  chain: string
  wallet: string
  token_address: string
  score: number
  win_rate: number
  avg_roi_pct: number
  trade_accuracy: number
  total_volume_usd: number
  last_trade_at?: string | null
}

export interface TokenMetrics {
  chain: string
  token_address: string
  buy_volume_usd: number
  sell_volume_usd: number
  net_flow_usd: number
  unique_wallets: number
  unique_buyers: number
  unique_sellers: number
  whale_buy_volume_usd: number
  whale_sell_volume_usd: number
  smart_money_score_avg: number
  holder_count: number
  holder_growth_pct: number
  liquidity_usd: number
  liquidity_change_pct: number
  early_buyer_count: number
  sniper_count: number
  period_start: string
  period_end: string
  computed_at: string
  data_source?: string
  total_volume_usd?: number
  price_open_usd?: number
  price_close_usd?: number
  price_high_usd?: number
  price_low_usd?: number
  price_change_pct?: number
  candle_count?: number
}

export interface OnchainSignal {
  signal_type: string
  severity: string
  title: string
  description: string
  usd_value?: number
  wallet?: string
  metadata?: Record<string, unknown>
  created_at?: string
}

export interface TokenOverview {
  chain: string
  token_address: string
  metrics?: TokenMetrics | null
  recent_signals: OnchainSignal[]
  ai_insight?: string | null
  data_source?: string
  ohlcv_candle_count?: number
}

export interface OhlcvCandle {
  timestamp: string
  open_usd: number
  high_usd: number
  low_usd: number
  close_usd: number
  volume_usd: number
  timeframe: string
  aggregate: number
}

export interface OhlcvResponse {
  chain: string
  token_address: string
  period_start: string
  period_end: string
  candle_count: number
  data_source: string
  candles: OhlcvCandle[]
}

export interface PaginatedTrades {
  items: OnchainTrade[]
  total: number
  page: number
  page_size: number
  has_more: boolean
}

export interface PaginatedWhales {
  items: WhaleEvent[]
  total: number
  page: number
  page_size: number
}

export interface OnchainChartMarker {
  time: number
  position: 'aboveBar' | 'belowBar'
  color: string
  shape: 'circle' | 'arrowUp' | 'arrowDown'
  text: string
}

export interface OnchainDateRange {
  startDate: string | null  // YYYY-MM-DD
  endDate: string | null
}

export interface CompleteOnchainDateRange {
  startDate: string
  endDate: string
}

export interface OnchainQueryParams {
  chain?: OnchainChain
  page?: number
  page_size?: number
  side?: 'BUY' | 'SELL'
  min_usd?: number
  hours?: number
  start_date?: string
  end_date?: string
  min_score?: number
  limit?: number
}

export interface HeatmapBucket {
  label: string
  buy_usd: number
  sell_usd: number
  total_usd: number
}

export interface TradeHeatmapData {
  chain: string
  token_address: string
  period_start: string
  period_end: string
  bucket_mode: 'hourly' | 'six_hourly' | 'daily' | string
  bucket_count: number
  active_buckets: number
  trade_count: number
  data_source?: string
  buckets: HeatmapBucket[]
}
