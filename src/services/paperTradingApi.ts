import http from '@/services/httpClient'
import type { PaperSide, PaperSource, PaperTrade, PaperTradeListResponse } from '@/types/paperTrade'

export const paperTradingApi = {
  list: async (status: 'all' | 'open' | 'closed' = 'all'): Promise<PaperTradeListResponse> => {
    const { data } = await http.get('/api/paper-trades', { params: { status } })
    return data
  },

  open: async (payload: {
    product_id: string
    side: PaperSide
    entry_price: number
    quantity: number
    fee_pct?: number
    notes?: string
    source?: PaperSource
  }): Promise<PaperTrade> => {
    const { data } = await http.post('/api/paper-trades', payload)
    return data
  },

  close: async (id: number, exit_price: number): Promise<PaperTrade> => {
    const { data } = await http.post(`/api/paper-trades/${id}/close`, { exit_price })
    return data
  },

  delete: async (id: number): Promise<void> => {
    await http.delete(`/api/paper-trades/${id}`)
  },

  clearClosed: async (): Promise<void> => {
    await http.delete('/api/paper-trades/history/closed')
  },
}
