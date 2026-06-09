import { useState, useEffect, useCallback } from 'react'
import { newsApi } from '@/services/api'
import type { NewsArticle, NewsListResponse } from '@/types'

interface UseNewsReturn {
  articles: NewsArticle[]
  total: number
  loading: boolean
  error: string | null
  page: number
  setPage: (p: number) => void
  refetch: () => void
}

export function useNews(symbol: string | null, pageSize = 10): UseNewsReturn {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  const fetch = useCallback(async () => {
    if (!symbol) return
    setLoading(true)
    setError(null)
    try {
      const data: NewsListResponse = await newsApi.getNews(symbol, page, pageSize)
      setArticles(data.articles)
      setTotal(data.total)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load news')
    } finally {
      setLoading(false)
    }
  }, [symbol, page, pageSize])

  useEffect(() => {
    fetch()
  }, [fetch])

  // Reset to page 1 when symbol changes
  useEffect(() => {
    setPage(1)
  }, [symbol])

  return { articles, total, loading, error, page, setPage, refetch: fetch }
}

interface UseLatestNewsReturn {
  articles: NewsArticle[]
  loading: boolean
  error: string | null
}

export function useLatestNews(symbol: string | null, limit = 5): UseLatestNewsReturn {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!symbol) return
    let cancelled = false
    setLoading(true)
    newsApi
      .getLatest(symbol, limit)
      .then((data) => { if (!cancelled) setArticles(data) })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load news')
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [symbol, limit])

  return { articles, loading, error }
}
