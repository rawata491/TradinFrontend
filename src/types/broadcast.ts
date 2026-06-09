// ── Telegram Channel ──────────────────────────────────────────────────────────

export type ChannelType = 'group' | 'channel' | 'private' | 'supergroup'

export interface TelegramChannel {
  id: number
  name: string
  chat_id: string
  channel_type: ChannelType
  description: string | null
  is_active: boolean
  send_signals: boolean
  send_ai: boolean
  send_news: boolean
  cooldown_sec: number | null
  created_at: string
  updated_at: string
}

export interface TelegramChannelCreate {
  chat_id: string
  name: string
  channel_type: ChannelType
  description?: string
  send_signals: boolean
  send_ai: boolean
  send_news: boolean
  cooldown_sec?: number
}

export interface TelegramChannelUpdate {
  name?: string
  channel_type?: ChannelType
  description?: string
  is_active?: boolean
  send_signals?: boolean
  send_ai?: boolean
  send_news?: boolean
  cooldown_sec?: number
}

export interface ChannelValidationResult {
  valid: boolean
  chat_id: string
  type?: string
  title?: string
  member_count?: number
  error?: string
}

// ── Broadcast Template ────────────────────────────────────────────────────────

export type TemplateCategory = 'signal' | 'ai_insight' | 'news' | 'custom' | 'alert'

export interface BroadcastTemplate {
  id: number
  name: string
  category: TemplateCategory
  content: string
  variables: string[]
  parse_mode: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface TemplateCreate {
  name: string
  content: string
  category: TemplateCategory
  variables: string[]
  parse_mode: string
}

export interface TemplateUpdate {
  name?: string
  content?: string
  category?: TemplateCategory
  variables?: string[]
  parse_mode?: string
  is_active?: boolean
}

// ── Broadcast Message ─────────────────────────────────────────────────────────

export type MessageType = 'manual' | 'signal' | 'ai_insight' | 'news' | 'scheduled'
export type MessageStatus = 'pending' | 'queued' | 'sent' | 'partial' | 'failed' | 'cancelled'

export interface BroadcastMessage {
  id: number
  title: string | null
  content: string
  parse_mode: string
  message_type: MessageType
  status: MessageStatus
  template_id: number | null
  target_channel_ids: number[] | null
  attempt_count: number
  max_attempts: number
  last_error: string | null
  scheduled_at: string | null
  sent_at: string | null
  created_at: string
  updated_at: string
}

export interface BroadcastLog {
  id: number
  channel_id: number
  status: string
  telegram_msg_id: number | null
  attempt_count: number
  error_message: string | null
  sent_at: string | null
  created_at: string
}

// ── Request payloads ──────────────────────────────────────────────────────────

export interface BroadcastSendRequest {
  content: string
  title?: string
  parse_mode?: string
  channel_ids?: number[]
  template_id?: number
  template_variables?: Record<string, string>
}

export interface BroadcastScheduleRequest extends BroadcastSendRequest {
  scheduled_at: string  // ISO datetime
}

export interface SignalBroadcastRequest {
  symbol: string
  signal_type: 'BUY' | 'SELL' | 'EXIT'
  strategy: string
  timeframe: string
  price?: number
  reason?: string
  sentiment?: string
  ai_commentary?: string
}

// ── Pagination ────────────────────────────────────────────────────────────────

export interface PaginatedBroadcasts {
  items: BroadcastMessage[]
  total: number
  page: number
  page_size: number
  pages: number
}

// ── WebSocket broadcast events ────────────────────────────────────────────────

export interface BroadcastQueuedEvent {
  type: 'broadcast_queued'
  data: {
    id: number
    status: MessageStatus
    title: string | null
  }
}

// ── UI state helpers ──────────────────────────────────────────────────────────

export interface BroadcastFilters {
  message_type?: MessageType
  status?: MessageStatus
  page: number
  page_size: number
}

export type ParseMode = 'Markdown' | 'HTML' | 'MarkdownV2'
