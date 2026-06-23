import http from '@/services/httpClient'
import type { LoginResponse, MessageResponse, User } from '@/types/auth'

export const authApi = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const { data } = await http.post('/api/auth/login', { username, password })
    return data
  },

  googleLogin: async (idToken: string): Promise<LoginResponse> => {
    const { data } = await http.post('/api/auth/google', { id_token: idToken }, { timeout: 30000 })
    return data
  },

  googleConfig: async (): Promise<{ enabled: boolean; client_id: string }> => {
    const { data } = await http.get('/api/auth/google/config')
    return data
  },

  register: async (username: string, email: string, password: string): Promise<MessageResponse> => {
    const { data } = await http.post('/api/auth/register', { username, email, password }, { timeout: 30000 })
    return data
  },

  refresh: async (refreshToken: string): Promise<LoginResponse> => {
    const { data } = await http.post('/api/auth/refresh', { refresh_token: refreshToken })
    return data
  },

  logout: async (refreshToken: string): Promise<void> => {
    await http.post('/api/auth/logout', { refresh_token: refreshToken })
  },

  me: async (): Promise<User> => {
    const { data } = await http.get('/api/auth/me')
    return data
  },

  verifyEmail: async (token: string): Promise<MessageResponse> => {
    const { data } = await http.post('/api/auth/verify-email', { token })
    return data
  },

  forgotPassword: async (email: string): Promise<MessageResponse> => {
    const { data } = await http.post('/api/auth/forgot-password', { email }, { timeout: 30000 })
    return data
  },

  resetPassword: async (token: string, password: string): Promise<MessageResponse> => {
    const { data } = await http.post('/api/auth/reset-password', { token, password })
    return data
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<MessageResponse> => {
    const { data } = await http.post('/api/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    })
    return data
  },

  deleteAccount: async (): Promise<MessageResponse> => {
    const { data } = await http.delete('/api/auth/account')
    return data
  },
}

export const adminApi = {
  listUsers: async () => {
    const { data } = await http.get('/api/admin/users')
    return data as { users: User[]; total: number }
  },

  createUser: async (payload: {
    username: string
    password: string
    telegram_number?: string
  }) => {
    const { data } = await http.post('/api/admin/users', payload)
    return data as User
  },

  updateUser: async (
    userId: number,
    payload: { telegram_number?: string; is_active?: boolean; password?: string },
  ) => {
    const { data } = await http.patch(`/api/admin/users/${userId}`, payload)
    return data as User
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
