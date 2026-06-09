import http from '@/services/httpClient'
import { buildQueryString } from '@/utils/queryString'
import { normalizeSearchQuery } from '@/utils/searchQuery'
import type {
  DiscoveredToken,
  RecentSearch,
  TokenDetailResponse,
  TokenSearchResponse,
  TrendingToken,
  TokenChain,
} from '@/types/tokenSearch'

export const tokenSearchApi = {
  search: async (
    q: string,
    params: { chain?: string; limit?: number } = {},
  ): Promise<TokenSearchResponse> => {
    const normalized = normalizeSearchQuery(q)
    const { data } = await http.get(
      `/api/token/search${buildQueryString({ q: normalized, chain: params.chain, limit: params.limit })}`,
      { timeout: 20000 },
    )
    return data
  },

  resolve: async (
    symbol: string,
    chain?: string,
    limit = 10,
  ): Promise<TokenSearchResponse> => {
    const { data } = await http.get(
      `/api/token/resolve/${encodeURIComponent(symbol)}${buildQueryString({ chain, limit })}`,
    )
    return data
  },

  getTrending: async (chain?: string, limit = 20): Promise<TrendingToken[]> => {
    const { data } = await http.get(`/api/token/trending${buildQueryString({ chain, limit })}`)
    return data
  },

  getDetail: async (
    contractAddress: string,
    chain: TokenChain,
    includeAi = true,
  ): Promise<TokenDetailResponse> => {
    const { data } = await http.get(
      `/api/token/${encodeURIComponent(contractAddress)}${buildQueryString({ chain, include_ai: includeAi ? 1 : 0 })}`,
    )
    return data
  },

  getRecentSearches: async (sessionId: string, limit = 10): Promise<RecentSearch[]> => {
    const { data } = await http.get(
      `/api/token/recent-searches${buildQueryString({ session_id: sessionId, limit })}`,
    )
    return data
  },

  recordSearch: async (payload: {
    query: string
    session_id: string
    chain?: string
    contract_address?: string
    symbol?: string
  }): Promise<void> => {
    await http.post('/api/token/record-search', payload)
  },

  broadcastToken: async (payload: {
    chain: string
    contract_address: string
    message?: string
  }): Promise<void> => {
    await http.post('/api/token/broadcast', payload)
  },
}

export function tokenToPath(token: DiscoveredToken): string {
  return `/token/${token.chain}/${encodeURIComponent(token.contract_address)}`
}
