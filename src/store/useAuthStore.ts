import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi } from '@/services/authApi'
import type { User } from '@/types/auth'

interface AuthState {
  token: string | null
  user: User | null
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  restoreSession: () => Promise<void>
  isAdmin: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isLoading: true,

      login: async (username, password) => {
        const res = await authApi.login(username, password)
        set({ token: res.access_token, user: res.user, isLoading: false })
      },

      logout: () => {
        set({ token: null, user: null, isLoading: false })
      },

      restoreSession: async () => {
        const { token } = get()
        if (!token) {
          set({ isLoading: false })
          return
        }
        try {
          const user = await authApi.me()
          set({ user, isLoading: false })
        } catch {
          set({ token: null, user: null, isLoading: false })
        }
      },

      isAdmin: () => get().user?.role === 'admin',
    }),
    {
      name: 'tradin_auth',
      partialize: (s) => ({ token: s.token, user: s.user }),
    },
  ),
)
