import http from '@/services/httpClient'
import type {
  PaperJournalAnalytics,
  PaperMarkToMarketItem,
  PaperOrderType,
  PaperSide,
  PaperSource,
  PaperTrade,
  PaperTradeListResponse,
} from '@/types/paperTrade'

export const paperTradingApi = {
  list: async (status: 'all' | 'open' | 'closed' | 'pending' = 'all'): Promise<PaperTradeListResponse> => {
    const { data } = await http.get('/api/paper-trades', { params: { status } })
    return data
  },

  markToMarket: async (): Promise<{ items: PaperMarkToMarketItem[]; total_unrealized_pnl: number }> => {
    const { data } = await http.get('/api/paper-trades/mark-to-market')
    return data
  },

  journal: async (): Promise<PaperJournalAnalytics> => {
    const { data } = await http.get('/api/paper-trades/journal')
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
    order_type?: PaperOrderType
    limit_price?: number
    stop_loss?: number
    take_profit?: number
    script_id?: number
  }): Promise<PaperTrade> => {
    const { data } = await http.post('/api/paper-trades', payload)
    return data
  },

  close: async (id: number, exit_price: number, quantity?: number): Promise<PaperTrade> => {
    const { data } = await http.post(`/api/paper-trades/${id}/close`, {
      exit_price,
      ...(quantity != null ? { quantity } : {}),
    })
    return data
  },

  delete: async (id: number): Promise<void> => {
    await http.delete(`/api/paper-trades/${id}`)
  },

  clearClosed: async (): Promise<void> => {
    await http.delete('/api/paper-trades/history/closed')
  },
}
