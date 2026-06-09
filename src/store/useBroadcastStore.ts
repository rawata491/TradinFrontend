import { create } from 'zustand'
import { broadcastApi } from '@/services/broadcastApi'
import { templateApi } from '@/services/templateApi'
import type {
  BroadcastMessage,
  BroadcastTemplate,
  BroadcastFilters,
  BroadcastSendRequest,
  BroadcastScheduleRequest,
  SignalBroadcastRequest,
  TemplateCreate,
  TemplateUpdate,
  PaginatedBroadcasts,
  BroadcastLog,
} from '@/types/broadcast'

interface BroadcastState {
  // History
  history: PaginatedBroadcasts | null
  historyLoading: boolean
  historyFilters: BroadcastFilters

  // Active message detail
  activeLogs: BroadcastLog[]
  logsLoading: boolean

  // Templates
  templates: BroadcastTemplate[]
  templatesLoading: boolean

  // Sending state
  sending: boolean
  lastSent: BroadcastMessage | null

  // Queue size (from WS or polling)
  queueSize: number

  // Error
  error: string | null

  // Actions
  fetchHistory: (filters?: Partial<BroadcastFilters>) => Promise<void>
  fetchLogs: (messageId: number) => Promise<void>
  sendBroadcast: (payload: BroadcastSendRequest) => Promise<BroadcastMessage>
  scheduleBroadcast: (payload: BroadcastScheduleRequest) => Promise<BroadcastMessage>
  cancelBroadcast: (id: number) => Promise<void>
  sendSignal: (payload: SignalBroadcastRequest) => Promise<void>
  fetchTemplates: (category?: string) => Promise<void>
  createTemplate: (payload: TemplateCreate) => Promise<BroadcastTemplate>
  updateTemplate: (id: number, payload: TemplateUpdate) => Promise<void>
  deleteTemplate: (id: number) => Promise<void>
  renderTemplate: (content: string, variables: Record<string, string>) => Promise<string>
  setFilters: (filters: Partial<BroadcastFilters>) => void
  addRealtimeMessage: (msg: { id: number; status: string; title: string | null }) => void
  clearError: () => void
}

const DEFAULT_FILTERS: BroadcastFilters = {
  page: 1,
  page_size: 20,
}

export const useBroadcastStore = create<BroadcastState>((set, get) => ({
  history: null,
  historyLoading: false,
  historyFilters: DEFAULT_FILTERS,
  activeLogs: [],
  logsLoading: false,
  templates: [],
  templatesLoading: false,
  sending: false,
  lastSent: null,
  queueSize: 0,
  error: null,

  fetchHistory: async (filters) => {
    const merged: BroadcastFilters = { ...get().historyFilters, ...filters }
    set({ historyLoading: true, error: null, historyFilters: merged })
    try {
      const result = await broadcastApi.getHistory(merged)
      set({ history: result, historyLoading: false })
    } catch (err) {
      set({ historyLoading: false, error: (err as Error).message })
    }
  },

  fetchLogs: async (messageId) => {
    set({ logsLoading: true })
    try {
      const logs = await broadcastApi.getLogs(messageId)
      set({ activeLogs: logs, logsLoading: false })
    } catch (err) {
      set({ logsLoading: false, error: (err as Error).message })
    }
  },

  sendBroadcast: async (payload) => {
    set({ sending: true, error: null })
    try {
      const message = await broadcastApi.send(payload)
      set({ sending: false, lastSent: message })
      // Refresh history
      await get().fetchHistory()
      return message
    } catch (err) {
      set({ sending: false, error: (err as Error).message })
      throw err
    }
  },

  scheduleBroadcast: async (payload) => {
    set({ sending: true, error: null })
    try {
      const message = await broadcastApi.schedule(payload)
      set({ sending: false, lastSent: message })
      await get().fetchHistory()
      return message
    } catch (err) {
      set({ sending: false, error: (err as Error).message })
      throw err
    }
  },

  cancelBroadcast: async (id) => {
    await broadcastApi.cancelMessage(id)
    set((s) => ({
      history: s.history
        ? {
            ...s.history,
            items: s.history.items.map((m) =>
              m.id === id ? { ...m, status: 'cancelled' as const } : m,
            ),
          }
        : null,
    }))
  },

  sendSignal: async (payload) => {
    await broadcastApi.sendSignal(payload)
  },

  fetchTemplates: async (category) => {
    set({ templatesLoading: true })
    try {
      const templates = await templateApi.list(category)
      set({ templates, templatesLoading: false })
    } catch (err) {
      set({ templatesLoading: false, error: (err as Error).message })
    }
  },

  createTemplate: async (payload) => {
    const tpl = await templateApi.create(payload)
    set((s) => ({ templates: [...s.templates, tpl] }))
    return tpl
  },

  updateTemplate: async (id, payload) => {
    const updated = await templateApi.update(id, payload)
    set((s) => ({
      templates: s.templates.map((t) => (t.id === id ? updated : t)),
    }))
  },

  deleteTemplate: async (id) => {
    await templateApi.delete(id)
    set((s) => ({ templates: s.templates.filter((t) => t.id !== id) }))
  },

  renderTemplate: async (content, variables) => {
    const { rendered } = await templateApi.render(content, variables)
    return rendered
  },

  setFilters: (filters) =>
    set((s) => ({ historyFilters: { ...s.historyFilters, ...filters } })),

  addRealtimeMessage: (msg) => {
    set((s) => {
      if (!s.history) return s
      const exists = s.history.items.find((m) => m.id === msg.id)
      if (exists) {
        return {
          history: {
            ...s.history,
            items: s.history.items.map((m) =>
              m.id === msg.id ? { ...m, status: msg.status as any } : m,
            ),
          },
        }
      }
      return s
    })
  },

  clearError: () => set({ error: null }),
}))
