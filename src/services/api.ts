import http, { aiHttp } from '@/services/httpClient'
import type {
  Product,
  CandleResponse,
  ProductListResponse,
  MarketTradesResponse,
  AIInsight,
  NewsListResponse,
  NewsArticle,
  BatchSentiment,
} from '@/types'
import type { AISummarySchema } from '@/types/ai'

export const productApi = {
  list: async (limit = 50, offset = 0): Promise<ProductListResponse> => {
    const { data } = await http.get('/api/products', { params: { limit, offset } })
    return data
  },

  search: async (query: string): Promise<{ products: Product[]; total: number; query: string }> => {
    const { data } = await http.get('/api/products/search', { params: { q: query } })
    return data
  },

  get: async (productId: string): Promise<Product> => {
    const { data } = await http.get(`/api/products/${productId}`)
    return data
  },

  getTrades: async (productId: string, limit = 25): Promise<MarketTradesResponse> => {
    const { data } = await http.get(`/api/products/${productId}/trades`, { params: { limit } })
    return data
  },
}

export const candleApi = {
  get: async (productId: string, timeframe = '1D', limit?: number): Promise<CandleResponse> => {
    const { data } = await http.get(`/api/candles/${productId}`, {
      params: { timeframe, ...(limit != null ? { limit } : {}) },
    })
    return data
  },

  getTimeframes: async (): Promise<Record<string, { granularity: string; interval_seconds: number; default_bars: number }>> => {
    const { data } = await http.get('/api/candles/timeframes')
    return data.timeframes
  },
}

export const aiApi = {
  getInsights: async (symbol: string): Promise<AIInsight> => {
    const { data } = await aiHttp.get(`/api/ai/insights/${symbol}`)
    return data
  },

  getSummary: async (symbol: string): Promise<{ symbol: string; summary: string | null; last_updated: string | null; is_stale: boolean }> => {
    const { data } = await http.get(`/api/ai/summary/${symbol}`)
    return data
  },

  getSentiment: async (symbol: string): Promise<{ symbol: string; sentiment: string; confidence: number; updated_at: string }> => {
    const { data } = await http.get(`/api/ai/sentiment/${symbol}`)
    return data
  },

  getBatchSentiment: async (symbols: string[]): Promise<BatchSentiment[]> => {
    const { data } = await http.get('/api/ai/batch/sentiment', {
      params: { symbols: symbols.join(',') },
    })
    return data
  },

  getHistory: async (symbol: string, limit = 10): Promise<AISummarySchema[]> => {
    const { data } = await http.get(`/api/ai/history/${symbol}`, { params: { limit } })
    return data
  },
}

export const newsApi = {
  getNews: async (symbol: string, page = 1, pageSize = 10): Promise<NewsListResponse> => {
    const { data } = await http.get(`/api/news/${symbol}`, {
      params: { page, page_size: pageSize },
    })
    return data
  },

  getLatest: async (symbol: string, limit = 5): Promise<NewsArticle[]> => {
    const { data } = await http.get(`/api/news/${symbol}/latest`, {
      params: { limit },
    })
    return data
  },
}

export default http
