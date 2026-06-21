export interface WhaleScanEventSummary {
  event_type: string
  count: number
}

export interface WhaleScanHit {
  chain: string
  contract_address: string
  symbol?: string | null
  token_name?: string | null
  dex?: string | null
  liquidity_usd: number
  volume_24h: number
  age_hours: number
  last_scanned_at?: string | null
  max_usd: number
  score: number
  event_summary: WhaleScanEventSummary[]
  notified_at?: string | null
}

export interface WhaleScanOverview {
  last_run_at: string
  last_run_status: string
  tokens_scanned: number
  whales_detected: number
  hits_count: number
  threshold_usd: number
  lookback_hours: number
  max_age_days: number
}

export interface WhaleScanRunStatus {
  run_id?: number | null
  status: string
  phase: string
  phase_label: string
  total: number
  completed: number
  percent: number
  is_running: boolean
  candidates_found: number
  tokens_scanned: number
  whales_detected: number
  messages_sent: number
  current_token: string
  started_at: string
  finished_at: string
  error?: string | null
}

export interface WhaleScanHitsResponse {
  total: number
  items: WhaleScanHit[]
  scanned_at: string
  page: number
  page_size: number
}

export interface WhaleScanDetail {
  chain: string
  contract_address: string
  symbol?: string | null
  token_name?: string | null
  dex?: string | null
  liquidity_usd: number
  volume_24h: number
  age_hours: number
  last_scanned_at?: string | null
  max_usd: number
  score: number
  event_summary: WhaleScanEventSummary[]
  events: Array<{
    id?: number | null
    chain: string
    wallet: string
    token_address: string
    event_type: string
    usd_value: number
    description: string
    tx_hash?: string
    detected_at: string
    metadata?: Record<string, unknown>
  }>
  total_events: number
  page: number
  page_size: number
  threshold_usd: number
  lookback_hours: number
}
