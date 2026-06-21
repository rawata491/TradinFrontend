import http from '@/services/httpClient'
import { buildQueryString } from '@/utils/queryString'
import type { WhaleScanDetail, WhaleScanHitsResponse, WhaleScanOverview, WhaleScanRunStatus } from '@/types/whaleScan'

export const whaleScanApi = {
  getOverview: async (hours?: number): Promise<WhaleScanOverview> => {
    const { data } = await http.get(
      `/api/whale-scan/overview${buildQueryString({ hours })}`,
      { timeout: 30000 },
    )
    return data
  },

  getHits: async (params: {
    chain?: string
    page?: number
    page_size?: number
    hours?: number
  } = {}): Promise<WhaleScanHitsResponse> => {
    const { data } = await http.get(
      `/api/whale-scan/hits${buildQueryString(params)}`,
      { timeout: 30000 },
    )
    return data
  },

  getDetail: async (
    chain: string,
    address: string,
    params: { page?: number; page_size?: number; hours?: number } = {},
  ): Promise<WhaleScanDetail> => {
    const { data } = await http.get(
      `/api/whale-scan/${encodeURIComponent(chain)}/${encodeURIComponent(address)}${buildQueryString(params)}`,
      { timeout: 30000 },
    )
    return data
  },

  getRunStatus: async (): Promise<WhaleScanRunStatus> => {
    const { data } = await http.get('/api/whale-scan/run/status', { timeout: 15000 })
    return data
  },

  runScan: async (params: { limit?: number; dry_run?: boolean } = {}): Promise<void> => {
    await http.post(
      `/api/whale-scan/scan${buildQueryString({
        limit: params.limit,
        dry_run: params.dry_run ? 1 : undefined,
      })}`,
      undefined,
      { timeout: 30000 },
    )
  },
}

export function whaleScanHitToPath(hit: { chain: string; contract_address: string }): string {
  return `/token/${hit.chain}/${encodeURIComponent(hit.contract_address)}`
}
