export type PaperSide = 'long' | 'short'
export type PaperSource = 'manual' | 'coin_detail' | 'strategy'
export type PaperOrderType = 'market' | 'limit'

export interface PaperTrade {
  id: number
  product_id: string
  side: PaperSide
  entry_price: number
  exit_price?: number | null
  quantity: number
  fee_pct: number
  pnl?: number | null
  pnl_pct?: number | null
  notes?: string | null
  source?: string | null
  order_type?: PaperOrderType
  limit_price?: number | null
  stop_loss?: number | null
  take_profit?: number | null
  script_id?: number | null
  is_pending?: boolean
  opened_at: string
  closed_at?: string | null
}

export interface PaperTradeStats {
  open_count: number
  closed_count: number
  pending_count?: number
  total_realized_pnl: number
  win_count: number
  loss_count: number
  win_rate_pct: number
}

export interface PaperTradeListResponse {
  items: PaperTrade[]
  total: number
  stats: PaperTradeStats
}

export interface OpenPositionView {
  trade: PaperTrade
  currentPrice: number | null
  notionalUsd: number
  unrealized: { pnl: number; pnlPct: number } | null
}

export interface PracticeSummary {
  startingBalance: number
  realizedPnl: number
  unrealizedPnl: number
  equity: number
  openCount: number
  closedCount: number
  winRatePct: number
}

export interface PaperJournalPoint {
  date: string
  cumulative_pnl: number
  equity: number
}

export interface PaperJournalAnalytics {
  equity_curve: PaperJournalPoint[]
  by_symbol: Record<string, number>
  by_source: Record<string, number>
  max_drawdown_pct: number
  total_realized_pnl: number
  win_rate_pct: number
  trade_count: number
}

export interface PaperMarkToMarketItem {
  id: number
  product_id: string
  side: PaperSide
  quantity: number
  entry_price: number
  current_price: number
  unrealized_pnl: number
  unrealized_pnl_pct: number
}
