import http from '@/services/httpClient'
import type { PortfolioHolding } from '@/store/usePortfolioStore'

export interface ServerPortfolioHolding {
  product_id: string
  quantity: number
  avg_cost: number
  added_at: string
}

export const userDataApi = {
  getWatchlist: async (): Promise<string[]> => {
    const { data } = await http.get<{ items: string[] }>('/api/user/watchlist')
    return data.items
  },

  replaceWatchlist: async (items: string[]): Promise<string[]> => {
    const { data } = await http.put<{ items: string[] }>('/api/user/watchlist', { items })
    return data.items
  },

  getPortfolio: async (): Promise<ServerPortfolioHolding[]> => {
    const { data } = await http.get<{ holdings: ServerPortfolioHolding[] }>('/api/user/portfolio')
    return data.holdings
  },

  replacePortfolio: async (holdings: PortfolioHolding[]): Promise<ServerPortfolioHolding[]> => {
    const { data } = await http.put<{ holdings: ServerPortfolioHolding[] }>('/api/user/portfolio', {
      holdings: holdings.map((h) => ({
        product_id: h.product_id,
        quantity: h.quantity,
        avg_cost: h.avg_cost,
        added_at: h.added_at,
      })),
    })
    return data.holdings
  },
}
