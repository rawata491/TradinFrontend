import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { tokenSearchApi } from '@/services/tokenSearchApi'
import type { DiscoveredToken, RecentSearch, TrendingToken } from '@/types/tokenSearch'

const SESSION_KEY = 'tradin_search_session'

function getSessionId(): string {
  let id = localStorage.getItem(SESSION_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(SESSION_KEY, id)
  }
  return id
}

interface TokenSearchState {
  query: string
  results: DiscoveredToken[]
  trending: TrendingToken[]
  recentLocal: RecentSearch[]
  selectedToken: DiscoveredToken | null
  isSearching: boolean
  isLoadingTrending: boolean
  error: string | null
  lastTookMs: number

  setQuery: (q: string) => void
  search: (q: string, chain?: string) => Promise<void>
  fetchTrending: (chain?: string) => Promise<void>
  fetchRecent: () => Promise<void>
  selectToken: (token: DiscoveredToken) => Promise<void>
  addLocalRecent: (token: DiscoveredToken, query: string) => void
  clearResults: () => void
}

export const useTokenSearchStore = create<TokenSearchState>()(
  persist(
    (set, get) => ({
      query: '',
      results: [],
      trending: [],
      recentLocal: [],
      selectedToken: null,
      isSearching: false,
      isLoadingTrending: false,
      error: null,
      lastTookMs: 0,

      setQuery: (q) => set({ query: q }),

      search: async (q, chain) => {
        const trimmed = q.trim()
        if (!trimmed) {
          set({ results: [], query: '' })
          return
        }
        set({ isSearching: true, error: null, query: trimmed })
        try {
          const result = await tokenSearchApi.search(trimmed, { chain, limit: 25 })
          set({
            results: result.items,
            isSearching: false,
            lastTookMs: result.took_ms,
          })
        } catch (err) {
          set({ isSearching: false, error: (err as Error).message, results: [] })
        }
      },

      fetchTrending: async (chain) => {
        set({ isLoadingTrending: true })
        try {
          const trending = await tokenSearchApi.getTrending(chain)
          set({ trending, isLoadingTrending: false })
        } catch (err) {
          set({ isLoadingTrending: false, error: (err as Error).message })
        }
      },

      fetchRecent: async () => {
        try {
          const recent = await tokenSearchApi.getRecentSearches(getSessionId())
          set({ recentLocal: recent })
        } catch {
          // keep local persisted recents
        }
      },

      selectToken: async (token) => {
        set({ selectedToken: token })
        get().addLocalRecent(token, get().query)
        try {
          await tokenSearchApi.recordSearch({
            query: get().query || token.symbol,
            session_id: getSessionId(),
            chain: token.chain,
            contract_address: token.contract_address,
            symbol: token.symbol,
          })
        } catch {
          // non-blocking
        }
      },

      addLocalRecent: (token, query) =>
        set((s) => {
          const entry: RecentSearch = {
            query: query || token.symbol,
            chain: token.chain,
            contract_address: token.contract_address,
            symbol: token.symbol,
            searched_at: new Date().toISOString(),
          }
          const filtered = s.recentLocal.filter(
            (r) => r.contract_address !== token.contract_address || r.chain !== token.chain,
          )
          return { recentLocal: [entry, ...filtered].slice(0, 20) }
        }),

      clearResults: () => set({ results: [], query: '', error: null }),
    }),
    {
      name: 'tradin_token_search',
      partialize: (s) => ({ recentLocal: s.recentLocal }),
    },
  ),
)
