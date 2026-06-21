import { create } from 'zustand'
import { discoveryApi } from '@/services/discoveryApi'
import { whaleScanApi } from '@/services/whaleScanApi'
import type { DiscoveryCategory, DiscoveryOverview, DiscoveryToken } from '@/types/discovery'
import type { WhaleScanHit, WhaleScanOverview, WhaleScanRunStatus } from '@/types/whaleScan'

interface DiscoveryState {
  activeTab: DiscoveryCategory
  chainFilter: string
  minScore: number
  items: DiscoveryToken[]
  whaleHits: WhaleScanHit[]
  overview: DiscoveryOverview | null
  whaleOverview: WhaleScanOverview | null
  whaleRunStatus: WhaleScanRunStatus | null
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
  runWhaleScan: () => Promise<void>
  pollWhaleRunStatus: () => Promise<void>
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
  whaleHits: [],
  overview: null,
  whaleOverview: null,
  whaleRunStatus: null,
  sourcesUsed: [],
  scannedAt: '',
  cached: false,
  isLoading: false,
  isRefreshing: false,
  error: null,

  setActiveTab: (tab) => {
    set({ activeTab: tab, items: [], whaleHits: [], error: null })
    get().fetchDiscovery()
  },

  setChainFilter: (chain) => {
    set({ chainFilter: chain })
    get().fetchDiscovery()
  },

  setMinScore: (score) => {
    set({ minScore: score })
    if (get().activeTab !== 'whale_scan') {
      get().fetchDiscovery()
    }
  },

  fetchDiscovery: async () => {
    const { activeTab, chainFilter, minScore, isLoading, isRefreshing } = get()
    if (isLoading || isRefreshing) return

    set({ isLoading: true, error: null })

    try {
      if (activeTab === 'whale_scan') {
        const [hitsResult, whaleOverview] = await Promise.all([
          whaleScanApi.getHits({ chain: chainFilter || undefined, page_size: 50 }),
          whaleScanApi.getOverview().catch(() => null),
        ])
        set({
          whaleHits: hitsResult.items,
          whaleOverview: whaleOverview ?? get().whaleOverview,
          items: [],
          sourcesUsed: [],
          scannedAt: hitsResult.scanned_at,
          cached: false,
          isLoading: false,
          error: null,
        })
        return
      }

      const result = await fetchByCategory(activeTab, chainFilter, minScore)
      set({
        items: result.items,
        whaleHits: [],
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
    if (activeTab === 'whale_scan') return

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

  runWhaleScan: async () => {
    set({ isRefreshing: true, error: null })
    try {
      await whaleScanApi.runScan({ limit: 15 })
      await get().pollWhaleRunStatus()
    } catch (err) {
      set({
        isRefreshing: false,
        error: err instanceof Error ? err.message : 'Whale scan failed to start',
      })
    }
  },

  pollWhaleRunStatus: async () => {
    try {
      const status = await whaleScanApi.getRunStatus()
      set({ whaleRunStatus: status })

      if (!status.is_running) {
        set({ isRefreshing: false })
        if (status.status === 'failed' && status.error) {
          set({ error: status.error })
        } else if (status.status === 'ok') {
          set({ error: null })
        }
        if (status.status === 'ok' || status.status === 'failed') {
          await Promise.all([get().fetchDiscovery(), get().fetchOverview()])
        }
      } else {
        set({ isRefreshing: true })
      }
    } catch {
      // ignore transient poll errors while scan runs
    }
  },

  fetchOverview: async () => {
    try {
      const [overview, whaleOverview] = await Promise.all([
        discoveryApi.getOverview(),
        whaleScanApi.getOverview().catch(() => null),
      ])
      set({
        overview,
        whaleOverview,
      })
    } catch {
      // overview is optional
    }
  },
}))
