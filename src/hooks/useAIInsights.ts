import { useState, useEffect, useCallback } from 'react'
import { aiApi } from '@/services/api'
import type { AIInsight } from '@/types'

interface UseAIInsightsReturn {
  insight: AIInsight | null
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useAIInsights(symbol: string | null): UseAIInsightsReturn {
  const [insight, setInsight] = useState<AIInsight | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    if (!symbol) return
    setLoading(true)
    setError(null)
    try {
      const data = await aiApi.getInsights(symbol)
      setInsight(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load AI insights')
    } finally {
      setLoading(false)
    }
  }, [symbol])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { insight, loading, error, refetch: fetch }
}
