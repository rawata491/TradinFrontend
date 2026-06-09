import http from '@/services/httpClient'
import type {
  BroadcastMessage,
  BroadcastLog,
  BroadcastSendRequest,
  BroadcastScheduleRequest,
  SignalBroadcastRequest,
  PaginatedBroadcasts,
  BroadcastFilters,
} from '@/types/broadcast'

export const broadcastApi = {
  send: async (payload: BroadcastSendRequest): Promise<BroadcastMessage> => {
    const { data } = await http.post('/api/broadcast/send', payload)
    return data
  },

  schedule: async (payload: BroadcastScheduleRequest): Promise<BroadcastMessage> => {
    const { data } = await http.post('/api/broadcast/schedule', payload)
    return data
  },

  getHistory: async (filters: BroadcastFilters): Promise<PaginatedBroadcasts> => {
    const { data } = await http.get('/api/broadcast/history', {
      params: {
        page: filters.page,
        page_size: filters.page_size,
        ...(filters.message_type && { message_type: filters.message_type }),
        ...(filters.status && { status: filters.status }),
      },
    })
    return data
  },

  getLogs: async (messageId: number): Promise<BroadcastLog[]> => {
    const { data } = await http.get(`/api/broadcast/history/${messageId}/logs`)
    return data
  },

  cancelMessage: async (id: number): Promise<void> => {
    await http.delete(`/api/broadcast/${id}`)
  },

  sendSignal: async (payload: SignalBroadcastRequest): Promise<{ ok: boolean; message_id?: number; status?: string; detail?: string }> => {
    const { data } = await http.post('/api/signals/broadcast', payload)
    return data
  },
}

// Re-export for backward compatibility during migration
export { telegramApi } from '@/services/telegramApi'
export { templateApi } from '@/services/templateApi'
