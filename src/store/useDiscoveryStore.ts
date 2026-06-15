import { create } from 'zustand'
import { discoveryApi } from '@/services/discoveryApi'
import type { DiscoveryCategory, DiscoveryOverview, DiscoveryToken } from '@/types/discovery'

interface DiscoveryState {
  activeTab: DiscoveryCategory
  chainFilter: string
  minScore: number
  items: DiscoveryToken[]
  overview: DiscoveryOverview | null
  sourcesUsed: string[]
  scannedAt: string
  cached: boolean
  isLoading: boolean
  isRefreshing: boolean
  error: string | null

  setActiveTab: (tab: DiscoveryCategory) => void
  setChainFilter: (chain: string) => void
  setMinScore: (score: number) => void
  fetchDiscovery: (refresh?: boolean) => Promise<void>
  runFullScan: () => Promise<void>
  fetchOverview: () => Promise<void>
}

async function fetchByCategory(
  category: DiscoveryCategory,
  chain: string,
  minScore: number,
) {
  const params = {
    chain: chain || undefined,
    min_score: minScore || undefined,
    limit: 50,
  }

  switch (category) {
    case 'new_dex':
      return discoveryApi.getNewDex(params)
    case 'new_cex':
      return discoveryApi.getNewCex({ limit: 50 })
    case 'surging':
      return discoveryApi.getSurging(params)
    case 'trending':
      return discoveryApi.getTrending(params)
    default:
      return discoveryApi.get(category, params)
  }
}

export const useDiscoveryStore = create<DiscoveryState>((set, get) => ({
  activeTab: 'new_dex',
  chainFilter: '',
  minScore: 0,
  items: [],
  overview: null,
  sourcesUsed: [],
  scannedAt: '',
  cached: false,
  isLoading: false,
  isRefreshing: false,
  error: null,

  setActiveTab: (tab) => {
    set({ activeTab: tab, items: [], error: null })
    get().fetchDiscovery()
  },

  setChainFilter: (chain) => {
    set({ chainFilter: chain })
    get().fetchDiscovery()
  },

  setMinScore: (score) => {
    set({ minScore: score })
    get().fetchDiscovery()
  },

  fetchDiscovery: async () => {
    const { activeTab, chainFilter, minScore, isLoading, isRefreshing } = get()
    if (isLoading || isRefreshing) return

    set({ isLoading: true, error: null })

    try {
      const result = await fetchByCategory(activeTab, chainFilter, minScore)
      set({
        items: result.items,
        sourcesUsed: result.sources_used,
        scannedAt: result.scanned_at,
        cached: result.cached,
        isLoading: false,
        error: null,
      })
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to load discovery data',
      })
    }
  },

  runFullScan: async () => {
    const { activeTab, chainFilter, minScore } = get()
    set({ isRefreshing: true, error: null })
    try {
      await discoveryApi.runScan()
      const [overview, result] = await Promise.all([
        discoveryApi.getOverview(),
        fetchByCategory(activeTab, chainFilter, minScore),
      ])
      set({
        overview,
        items: result.items,
        sourcesUsed: result.sources_used,
        scannedAt: result.scanned_at,
        cached: result.cached,
        isRefreshing: false,
        error: result.items.length === 0 && !result.scanned_at
          ? 'Scan finished but no tokens matched filters. Try lowering the min score.'
          : null,
      })
    } catch (err) {
      // Scan may have completed server-side — still try loading cache
      try {
        const result = await fetchByCategory(activeTab, chainFilter, minScore)
        if (result.items.length > 0) {
          set({
            items: result.items,
            sourcesUsed: result.sources_used,
            scannedAt: result.scanned_at,
            cached: result.cached,
            isRefreshing: false,
            error: null,
          })
          return
        }
      } catch {
        // fall through
      }
      set({
        isRefreshing: false,
        error: err instanceof Error ? err.message : 'Discovery scan failed',
      })
    }
  },

  fetchOverview: async () => {
    try {
      const overview = await discoveryApi.getOverview()
      set({ overview })
    } catch {
      // overview is optional
    }
  },
}))
