import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { WATCHLIST_STORAGE_KEY, DEFAULT_WATCHLIST, normalizeProductId } from '@/utils/constants'

interface WatchlistState {
  items: string[]
  addItem: (productId: string) => void
  removeItem: (productId: string) => void
  toggleItem: (productId: string) => void
  isWatched: (productId: string) => boolean
  clearAll: () => void
  setItems: (items: string[]) => void
}

function normalizeItems(items: string[]): string[] {
  const seen = new Set<string>()
  const normalized: string[] = []
  for (const raw of items) {
    const id = normalizeProductId(raw)
    if (!id || seen.has(id)) continue
    seen.add(id)
    normalized.push(id)
  }
  return normalized
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      items: DEFAULT_WATCHLIST,

      addItem: (productId) => {
        const id = normalizeProductId(productId)
        set((state) => ({
          items: state.items.includes(id) ? state.items : [...state.items, id],
        }))
      },

      removeItem: (productId) => {
        const id = normalizeProductId(productId)
        set((state) => ({
          items: state.items.filter((item) => item !== id),
        }))
      },

      toggleItem: (productId) => {
        const id = normalizeProductId(productId)
        const { items } = get()
        if (items.includes(id)) {
          set({ items: items.filter((item) => item !== id) })
        } else {
          set({ items: [...items, id] })
        }
      },

      isWatched: (productId) => get().items.includes(normalizeProductId(productId)),

      clearAll: () => set({ items: [] }),

      setItems: (items) => set({ items: normalizeItems(items) }),
    }),
    {
      name: WATCHLIST_STORAGE_KEY,
    },
  ),
)
