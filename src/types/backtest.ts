import { Signal } from './signal'

export interface Trade {
  entry_bar: number
  exit_bar: number
  entry_price: number
  exit_price: number
  label: string
  pnl_pct: number
  entry_timestamp: string
  exit_timestamp: string
}

export interface BacktestRequest {
  source: string
  timeframe?: string
  limit?: number
  initial_capital?: number
  fee_pct?: number
}

export interface BacktestResult {
  success: boolean
  strategy_name: string
  symbol: string
  timeframe: string

  // Capital
  initial_capital: number
  final_capital: number
  net_profit_pct: number
  gross_profit_pct: number
  gross_loss_pct: number

  // Trade stats
  total_trades: number
  winning_trades: number
  losing_trades: number
  win_rate_pct: number
  avg_win_pct: number
  avg_loss_pct: number
  profit_factor: number
  max_consecutive_wins: number
  max_consecutive_losses: number

  // Risk
  max_drawdown_pct: number
  sharpe_ratio: number
  sortino_ratio: number
  calmar_ratio: number

  // History
  trades: Trade[]
  signals: Signal[]
  indicator_overlays: Record<string, (number | null)[]>
  equity_curve: number[]

  bars_tested: number
  execution_ms: number
  errors: string[]
}
