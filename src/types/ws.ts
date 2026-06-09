import type { TickerData } from '@/types'
import type { OnchainSignal, WhaleEvent } from '@/types/onchain'
import type { BroadcastQueuedEvent } from '@/types/broadcast'

export interface PriceAlertWSData {
  alert_id: number
  product_id: string
  target_price: number
  direction: string
  current_price: number
  message: string
}

export interface StrategySignalWSData {
  symbol: string
  signal_type: string
  strategy: string
  timeframe: string
  price?: number
  label?: string
  direction?: string
  bar_index?: number
  script_id?: number | null
}

export type WSMessage =
  | { type: 'connected'; client_id?: string }
  | { type: 'subscribed'; product_ids?: string[] }
  | { type: 'ticker'; data: TickerData }
  | { type: 'pong' }
  | { type: 'error'; message?: string }
  | { type: 'strategy_signal'; data: StrategySignalWSData }
  | BroadcastQueuedEvent
  | { type: 'price_alert'; data: PriceAlertWSData }
  | { type: 'onchain_signal'; data: OnchainSignal }
  | { type: 'onchain_whale'; data: WhaleEvent }
  | { type: 'onchain_trade'; data: Record<string, unknown> }

export function isBroadcastQueued(msg: WSMessage): msg is BroadcastQueuedEvent {
  return msg.type === 'broadcast_queued'
}

export function isOnchainSignal(msg: WSMessage): msg is { type: 'onchain_signal'; data: OnchainSignal } {
  return msg.type === 'onchain_signal'
}

export function isOnchainWhale(msg: WSMessage): msg is { type: 'onchain_whale'; data: WhaleEvent } {
  return msg.type === 'onchain_whale'
}
