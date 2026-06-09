import http from '@/services/httpClient'
import type { PriceAlert, PriceAlertCreate } from '@/types/alert'

export const alertApi = {
  list: async (productId?: string): Promise<PriceAlert[]> => {
    const { data } = await http.get('/api/alerts', {
      params: productId ? { product_id: productId } : {},
    })
    return data
  },

  create: async (payload: PriceAlertCreate): Promise<PriceAlert> => {
    const { data } = await http.post('/api/alerts', payload)
    return data
  },

  toggle: async (id: number, isActive: boolean): Promise<PriceAlert> => {
    const { data } = await http.patch(`/api/alerts/${id}`, { is_active: isActive })
    return data
  },

  remove: async (id: number): Promise<void> => {
    await http.delete(`/api/alerts/${id}`)
  },
}
