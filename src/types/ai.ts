/** AI summary history record — mirrors backend AISummarySchema. */
export interface AISummarySchema {
  id: number
  symbol: string
  summary: string | null
  sentiment: string | null
  confidence: number
  positive_factors: string[]
  negative_factors: string[]
  market_impact: string | null
  key_events: string[]
  articles_processed: number
  model_used: string | null
  created_at: string
  expires_at: string | null
}

export interface AISummaryOnlyResponse {
  symbol: string
  summary: string | null
  last_updated: string | null
  is_stale: boolean
}
