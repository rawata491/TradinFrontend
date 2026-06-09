import http from '@/services/httpClient'
import type {
  TelegramChannel,
  TelegramChannelCreate,
  TelegramChannelUpdate,
  ChannelValidationResult,
} from '@/types/broadcast'

export const telegramApi = {
  listChannels: async (activeOnly = true): Promise<TelegramChannel[]> => {
    const { data } = await http.get('/api/telegram/channels', {
      params: { active_only: activeOnly },
    })
    return data
  },

  createChannel: async (payload: TelegramChannelCreate): Promise<TelegramChannel> => {
    const { data } = await http.post('/api/telegram/channels', payload)
    return data
  },

  updateChannel: async (id: number, payload: TelegramChannelUpdate): Promise<TelegramChannel> => {
    const { data } = await http.put(`/api/telegram/channels/${id}`, payload)
    return data
  },

  deleteChannel: async (id: number): Promise<void> => {
    await http.delete(`/api/telegram/channels/${id}`)
  },

  testConnection: async (): Promise<{
    ok: boolean
    bot_username?: string
    bot_name?: string
    bot_id?: number
    error?: string
  }> => {
    const { data } = await http.post('/api/telegram/test')
    return data
  },

  validateChat: async (chatId: string): Promise<ChannelValidationResult> => {
    const { data } = await http.post('/api/telegram/validate', { chat_id: chatId })
    return data
  },

  sendTestMessage: async (chatId: string, text?: string): Promise<{ ok: boolean; message_id?: number; error?: string }> => {
    const { data } = await http.post('/api/telegram/send-test', {
      chat_id: chatId,
      text: text ?? '🤖 Test message from Tradin broadcast system.',
    })
    return data
  },

  discoverChats: async (): Promise<{
    ok: boolean
    chats: Array<{
      chat_id: string
      title: string
      type: string
      username?: string
      already_added: boolean
    }>
    total: number
    hint?: string
    error?: string
  }> => {
    const { data } = await http.get('/api/telegram/discover')
    return data
  },
}
