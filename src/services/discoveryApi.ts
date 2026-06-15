import http from '@/services/httpClient'
import { buildQueryString } from '@/utils/queryString'
import type {
  DiscoveryCategory,
  DiscoveryOverview,
  DiscoveryResponse,
} from '@/types/discovery'

type QueryParams = Record<string, string | number | undefined>

function toQuery(params: {
  chain?: string
  limit?: number
  min_score?: number
  min_volume_change?: number
  refresh?: boolean
  category?: DiscoveryCategory
}): QueryParams {
  return {
    category: params.category,
    chain: params.chain,
    limit: params.limit,
    min_score: params.min_score,
    min_volume_change: params.min_volume_change,
    refresh: params.refresh ? 1 : undefined,
  }
}

export const discoveryApi = {
  get: async (
    category: DiscoveryCategory,
    params: {
      chain?: string
      limit?: number
      min_score?: number
      min_volume_change?: number
      refresh?: boolean
    } = {},
  ): Promise<DiscoveryResponse> => {
    const { data } = await http.get(
      `/api/discover${buildQueryString(toQuery({ category, ...params }))}`,
      { timeout: 30000 },
    )
    return data
  },

  getNewDex: async (params: { chain?: string; limit?: number; refresh?: boolean } = {}) => {
    const { data } = await http.get(`/api/discover/new${buildQueryString(toQuery(params))}`, { timeout: 30000 })
    return data as DiscoveryResponse
  },

  getNewCex: async (params: { limit?: number; refresh?: boolean } = {}) => {
    const { data } = await http.get(`/api/discover/cex-new${buildQueryString(toQuery(params))}`, { timeout: 30000 })
    return data as DiscoveryResponse
  },

  getSurging: async (params: { chain?: string; limit?: number; refresh?: boolean } = {}) => {
    const { data } = await http.get(`/api/discover/surging${buildQueryString(toQuery(params))}`, { timeout: 30000 })
    return data as DiscoveryResponse
  },

  getTrending: async (params: { chain?: string; limit?: number; refresh?: boolean } = {}) => {
    const { data } = await http.get(`/api/discover/trending${buildQueryString(toQuery(params))}`, { timeout: 30000 })
    return data as DiscoveryResponse
  },

  getOverview: async (): Promise<DiscoveryOverview> => {
    const { data } = await http.get('/api/discover/overview', { timeout: 30000 })
    return data
  },

  /** Run a full discovery scan (all categories). Daily scan also runs automatically. */
  runScan: async (): Promise<void> => {
    await http.post('/api/discover/scan', undefined, { timeout: 120000 })
  },
}

export function discoveryTokenToPath(token: { chain: string; contract_address: string; product_id?: string; source_type?: string }): string {
  if (token.source_type === 'cex' && token.product_id) {
    return `/coin/${encodeURIComponent(token.product_id)}`
  }
  if (token.chain && token.contract_address) {
    return `/token/${token.chain}/${encodeURIComponent(token.contract_address)}`
  }
  return '/discover'
}
