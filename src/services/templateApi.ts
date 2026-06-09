import http from '@/services/httpClient'
import type {
  BroadcastTemplate,
  TemplateCreate,
  TemplateUpdate,
} from '@/types/broadcast'

export const templateApi = {
  list: async (category?: string): Promise<BroadcastTemplate[]> => {
    const { data } = await http.get('/api/broadcast/templates', {
      params: category ? { category } : {},
    })
    return data
  },

  create: async (payload: TemplateCreate): Promise<BroadcastTemplate> => {
    const { data } = await http.post('/api/broadcast/templates', payload)
    return data
  },

  update: async (id: number, payload: TemplateUpdate): Promise<BroadcastTemplate> => {
    const { data } = await http.put(`/api/broadcast/templates/${id}`, payload)
    return data
  },

  delete: async (id: number): Promise<void> => {
    await http.delete(`/api/broadcast/templates/${id}`)
  },

  render: async (content: string, variables: Record<string, string>): Promise<{ rendered: string }> => {
    const { data } = await http.post('/api/broadcast/templates/render', { content, variables })
    return data
  },
}
