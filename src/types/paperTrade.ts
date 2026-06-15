export type PaperSide = 'long' | 'short'
export type PaperSource = 'manual' | 'coin_detail' | 'strategy'

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
  opened_at: string
  closed_at?: string | null
}

export interface PaperTradeStats {
  open_count: number
  closed_count: number
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
