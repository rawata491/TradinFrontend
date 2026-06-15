export interface User {
  id: number
  username: string
  role: 'admin' | 'user'
  telegram_number?: string | null
  is_active: boolean
  created_at: string
  last_login_at?: string | null
}

export interface LoginResponse {
  access_token: string
  token_type: string
  user: User
}

export interface ActivityLog {
  id: number
  user_id?: number | null
  username?: string | null
  action: string
  action_label?: string | null
  resource_type?: string | null
  resource_id?: string | null
  detail?: string | null
  metadata?: Record<string, unknown> | null
  ip_address?: string | null
  user_agent?: string | null
  created_at: string
}

export interface ActivityFilterOptions {
  actions: string[]
  action_labels: Record<string, string>
  resource_types: string[]
  users: { id: number; username: string }[]
  action_prefixes: string[]
}

export interface ActivityLogFilters {
  user_id?: number
  username?: string
  action?: string
  action_prefix?: string
  resource_type?: string
  resource_id?: string
  search?: string
  date_from?: string
  date_to?: string
  page?: number
  page_size?: number
}

export interface ActivityListResponse {
  items: ActivityLog[]
  total: number
  page: number
  page_size: number
  pages: number
}
