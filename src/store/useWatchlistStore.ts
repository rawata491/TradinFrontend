import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { WATCHLIST_STORAGE_KEY, DEFAULT_WATCHLIST } from '@/utils/constants'

interface WatchlistState {
  items: string[]
  addItem: (productId: string) => void
  removeItem: (productId: string) => void
  toggleItem: (productId: string) => void
  isWatched: (productId: string) => boolean
  clearAll: () => void
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      items: DEFAULT_WATCHLIST,

      addItem: (productId) =>
        set((state) => ({
          items: state.items.includes(productId)
            ? state.items
            : [...state.items, productId],
        })),

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((id) => id !== productId),
        })),

      toggleItem: (productId) => {
        const { items } = get()
        if (items.includes(productId)) {
          set({ items: items.filter((id) => id !== productId) })
        } else {
          set({ items: [...items, productId] })
        }
      },

      isWatched: (productId) => get().items.includes(productId),

      clearAll: () => set({ items: [] }),
    }),
    {
      name: WATCHLIST_STORAGE_KEY,
    }
  )
)
