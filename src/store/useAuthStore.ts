import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi } from '@/services/authApi'
import type { User } from '@/types/auth'

interface AuthState {
  token: string | null
  refreshToken: string | null
  user: User | null
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  loginWithGoogle: (idToken: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<string>
  logout: () => Promise<void>
  restoreSession: () => Promise<void>
  refreshUser: () => Promise<void>
  refreshAccessToken: () => Promise<boolean>
  isAdmin: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      refreshToken: null,
      user: null,
      isLoading: true,

      login: async (username, password) => {
        const res = await authApi.login(username, password)
        set({
          token: res.access_token,
          refreshToken: res.refresh_token,
          user: res.user,
          isLoading: false,
        })
      },

      loginWithGoogle: async (idToken) => {
        const res = await authApi.googleLogin(idToken)
        set({
          token: res.access_token,
          refreshToken: res.refresh_token,
          user: res.user,
          isLoading: false,
        })
      },

      register: async (username, email, password) => {
        const res = await authApi.register(username, email, password)
        return res.message
      },

      logout: async () => {
        const { refreshToken } = get()
        if (refreshToken) {
          try {
            await authApi.logout(refreshToken)
          } catch {
            // ignore logout errors
          }
        }
        set({ token: null, refreshToken: null, user: null, isLoading: false })
      },

      refreshAccessToken: async () => {
        const { refreshToken } = get()
        if (!refreshToken) return false
        try {
          const res = await authApi.refresh(refreshToken)
          set({
            token: res.access_token,
            refreshToken: res.refresh_token,
            user: res.user,
          })
          return true
        } catch {
          set({ token: null, refreshToken: null, user: null })
          return false
        }
      },

      restoreSession: async () => {
        const { token, refreshAccessToken } = get()
        if (!token) {
          set({ isLoading: false })
          return
        }
        try {
          const user = await authApi.me()
          set({ user, isLoading: false })
        } catch {
          const refreshed = await refreshAccessToken()
          if (!refreshed) {
            set({ token: null, refreshToken: null, user: null, isLoading: false })
          } else {
            set({ isLoading: false })
          }
        }
      },

      refreshUser: async () => {
        const { token, refreshAccessToken } = get()
        if (!token) return
        try {
          const user = await authApi.me()
          set({ user })
        } catch {
          await refreshAccessToken()
        }
      },

      isAdmin: () => get().user?.role === 'admin',
    }),
    {
      name: 'tradin_auth',
      partialize: (s) => ({ token: s.token, refreshToken: s.refreshToken, user: s.user }),
    },
  ),
)
