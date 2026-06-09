export interface Script {
  id: number
  name: string
  description: string | null
  source: string
  language: string
  is_active: boolean
  is_public: boolean
  strategy_name: string | null
  indicators_used: string[] | null
  overlay: boolean
  created_at: string
  updated_at: string
}

export interface ScriptCreate {
  name?: string
  description?: string
  source: string
  overlay?: boolean
  is_public?: boolean
}

export interface ScriptUpdate {
  name?: string
  description?: string
  source?: string
  overlay?: boolean
  is_active?: boolean
  is_public?: boolean
}

export interface ScriptListResponse {
  scripts: Script[]
  total: number
  page: number
  page_size: number
}
