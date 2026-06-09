import { create } from 'zustand'
import { telegramApi } from '@/services/telegramApi'
import type {
  TelegramChannel,
  TelegramChannelCreate,
  TelegramChannelUpdate,
  ChannelValidationResult,
} from '@/types/broadcast'

interface TelegramState {
  channels: TelegramChannel[]
  loading: boolean
  error: string | null
  botInfo: { ok: boolean; bot_username?: string; bot_name?: string; bot_id?: number } | null
  botTesting: boolean

  // Actions
  fetchChannels: (activeOnly?: boolean) => Promise<void>
  createChannel: (payload: TelegramChannelCreate) => Promise<TelegramChannel>
  updateChannel: (id: number, payload: TelegramChannelUpdate) => Promise<void>
  deleteChannel: (id: number) => Promise<void>
  testBot: () => Promise<void>
  validateChat: (chatId: string) => Promise<ChannelValidationResult>
  sendTestMessage: (chatId: string, text?: string) => Promise<{ ok: boolean; error?: string }>
  clearError: () => void
}

export const useTelegramStore = create<TelegramState>((set) => ({
  channels: [],
  loading: false,
  error: null,
  botInfo: null,
  botTesting: false,

  fetchChannels: async (activeOnly = true) => {
    set({ loading: true, error: null })
    try {
      const channels = await telegramApi.listChannels(activeOnly)
      set({ channels, loading: false })
    } catch (err) {
      set({ loading: false, error: (err as Error).message })
    }
  },

  createChannel: async (payload) => {
    const channel = await telegramApi.createChannel(payload)
    set((s) => ({ channels: [channel, ...s.channels] }))
    return channel
  },

  updateChannel: async (id, payload) => {
    const updated = await telegramApi.updateChannel(id, payload)
    set((s) => ({
      channels: s.channels.map((c) => (c.id === id ? updated : c)),
    }))
  },

  deleteChannel: async (id) => {
    await telegramApi.deleteChannel(id)
    set((s) => ({ channels: s.channels.filter((c) => c.id !== id) }))
  },

  testBot: async () => {
    set({ botTesting: true })
    try {
      const result = await telegramApi.testConnection()
      set({ botInfo: result, botTesting: false })
    } catch (err) {
      set({ botInfo: { ok: false }, botTesting: false, error: (err as Error).message })
    }
  },

  validateChat: async (chatId) => {
    return await telegramApi.validateChat(chatId)
  },

  sendTestMessage: async (chatId, text) => {
    return await telegramApi.sendTestMessage(chatId, text)
  },

  clearError: () => set({ error: null }),
}))
