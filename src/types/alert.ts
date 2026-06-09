export type AlertDirection = 'above' | 'below'

export interface PriceAlert {
  id: number
  product_id: string
  target_price: number
  direction: AlertDirection
  message: string | null
  is_active: boolean
  notify_telegram: boolean
  channel_id: number | null
  triggered_at: string | null
  created_at: string
}

export interface PriceAlertCreate {
  product_id: string
  target_price: number
  direction: AlertDirection
  message?: string
  notify_telegram?: boolean
  channel_id?: number | null
}

export interface PriceAlertWSData {
  alert_id: number
  product_id: string
  target_price: number
  direction: AlertDirection
  current_price: number
  message: string
}
