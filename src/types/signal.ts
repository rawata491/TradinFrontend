export type SignalType = 'entry' | 'exit' | 'close'
export type SignalDirection = 'buy' | 'sell' | 'neutral'

export interface Signal {
  bar_index: number
  timestamp: string
  signal_type: SignalType
  label: string
  price: number
  direction: SignalDirection
  metadata: Record<string, unknown>
}

export interface RunRequest {
  source: string
  timeframe?: string
  limit?: number
  initial_capital?: number
  fee_pct?: number
  broadcast_telegram?: boolean
}

export interface RunResponse {
  success: boolean
  strategy_name: string
  symbol: string
  timeframe: string
  signals: Signal[]
  indicator_overlays: Record<string, (number | null)[]>
  bars_executed: number
  execution_ms: number
  errors: string[]
}

export interface StrategySignalWSMessage {
  type: 'strategy_signal'
  data: Signal & { symbol: string; script_id?: number }
}
