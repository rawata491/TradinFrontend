import http from '@/services/httpClient'
import type { LoginResponse, User } from '@/types/auth'

export const authApi = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const { data } = await http.post('/api/auth/login', { username, password })
    return data
  },

  me: async (): Promise<User> => {
    const { data } = await http.get('/api/auth/me')
    return data
  },
}

export const adminApi = {
  listUsers: async () => {
    const { data } = await http.get('/api/admin/users')
    return data as { users: import('@/types/auth').User[]; total: number }
  },

  createUser: async (payload: {
    username: string
    password: string
    telegram_number?: string
  }) => {
    const { data } = await http.post('/api/admin/users', payload)
    return data as import('@/types/auth').User
  },

  updateUser: async (
    userId: number,
    payload: { telegram_number?: string; is_active?: boolean; password?: string },
  ) => {
    const { data } = await http.patch(`/api/admin/users/${userId}`, payload)
    return data as import('@/types/auth').User
  },

  listActivity: async (params?: import('@/types/auth').ActivityLogFilters) => {
    const { data } = await http.get('/api/admin/activity', { params })
    return data as import('@/types/auth').ActivityListResponse
  },

  activityFilters: async () => {
    const { data } = await http.get('/api/admin/activity/filters')
    return data as import('@/types/auth').ActivityFilterOptions
  },
}
