import http from '@/services/httpClient'
import { buildQueryString } from '@/utils/queryString'
import type {
  HolderSnapshot,
  LiquidityEvent,
  OhlcvResponse,
  OnchainChain,
  OnchainQueryParams,
  PaginatedTrades,
  PaginatedWhales,
  SmartMoneyWallet,
  TokenMetrics,
  TokenOverview,
  TradeHeatmapData,
  WalletStat,
} from '@/types/onchain'
import type { OnchainAnalysis } from '@/types/onchainAnalysis'

function rangeParams(params: OnchainQueryParams = {}) {
  if (params.start_date && params.end_date) {
    return {
      start_date: params.start_date,
      end_date: params.end_date,
    }
  }
  return {
    hours: params.hours ?? 24,
    start_date: params.start_date,
    end_date: params.end_date,
  }
}

export const onchainApi = {
  /** Live analysis — single call, no sync required (GeckoTerminal free API). */
  analyze: async (
    address: string,
    params: OnchainQueryParams = {},
  ): Promise<OnchainAnalysis> => {
    const { data } = await http.get(
      `/api/onchain/analyze/${encodeURIComponent(address)}${buildQueryString({
        chain: params.chain,
        ...rangeParams(params),
      })}`,
      { timeout: 60000 },
    )
    return data
  },

  getTokenOverview: async (
    address: string,
    params: OnchainQueryParams = {},
  ): Promise<TokenOverview> => {
    const { data } = await http.get(
      `/api/onchain/token/${encodeURIComponent(address)}${buildQueryString({
        chain: params.chain,
        ...rangeParams(params),
      })}`,
    )
    return data
  },

  getTrades: async (
    address: string,
    params: OnchainQueryParams = {},
  ): Promise<PaginatedTrades> => {
    const { data } = await http.get(
      `/api/onchain/trades/${encodeURIComponent(address)}${buildQueryString({
        chain: params.chain,
        page: params.page,
        page_size: params.page_size,
        side: params.side,
        min_usd: params.min_usd,
        ...rangeParams(params),
      })}`,
    )
    return data
  },

  getHolders: async (
    address: string,
    chain: OnchainChain = 'ethereum',
    params: Pick<OnchainQueryParams, 'limit' | 'start_date' | 'end_date'> = {},
  ): Promise<HolderSnapshot[]> => {
    const { data } = await http.get(
      `/api/onchain/holders/${encodeURIComponent(address)}${buildQueryString({
        chain,
        limit: params.limit ?? 30,
        start_date: params.start_date,
        end_date: params.end_date,
      })}`,
    )
    return data
  },

  getWhales: async (
    address: string,
    params: OnchainQueryParams = {},
  ): Promise<PaginatedWhales> => {
    const { data } = await http.get(
      `/api/onchain/whales/${encodeURIComponent(address)}${buildQueryString({
        chain: params.chain,
        page: params.page,
        page_size: params.page_size,
        ...rangeParams(params),
      })}`,
    )
    return data
  },

  getLiquidity: async (
    address: string,
    params: OnchainQueryParams = {},
  ): Promise<LiquidityEvent[]> => {
    const { data } = await http.get(
      `/api/onchain/liquidity/${encodeURIComponent(address)}${buildQueryString({
        chain: params.chain,
        limit: params.limit,
        ...rangeParams(params),
      })}`,
    )
    return data
  },

  getSmartMoney: async (
    address: string,
    params: OnchainQueryParams = {},
  ): Promise<SmartMoneyWallet[]> => {
    const { data } = await http.get(
      `/api/onchain/smart-money/${encodeURIComponent(address)}${buildQueryString({
        chain: params.chain,
        min_score: params.min_score,
        limit: params.limit,
      })}`,
    )
    return data
  },

  getMetrics: async (
    address: string,
    chain: OnchainChain = 'ethereum',
    limit = 30,
  ): Promise<TokenMetrics[]> => {
    const { data } = await http.get(
      `/api/onchain/metrics/${encodeURIComponent(address)}${buildQueryString({ chain, limit })}`,
    )
    return data
  },

  getWalletStats: async (
    wallet: string,
    chain: OnchainChain = 'ethereum',
  ): Promise<WalletStat> => {
    const { data } = await http.get(
      `/api/onchain/wallet/${encodeURIComponent(wallet)}${buildQueryString({ chain })}`,
    )
    return data
  },

  getTradeHeatmap: async (
    address: string,
    params: OnchainQueryParams = {},
  ): Promise<TradeHeatmapData> => {
    const { data } = await http.get(
      `/api/onchain/heatmap/${encodeURIComponent(address)}${buildQueryString({
        chain: params.chain,
        ...rangeParams(params),
      })}`,
    )
    return data
  },

  getOhlcv: async (
    address: string,
    params: OnchainQueryParams = {},
  ): Promise<OhlcvResponse> => {
    const { data } = await http.get(
      `/api/onchain/ohlcv/${encodeURIComponent(address)}${buildQueryString({
        chain: params.chain,
        limit: params.limit ?? 1000,
        ...rangeParams(params),
      })}`,
    )
    return data
  },

  /** Trigger GeckoTerminal OHLCV sync + live trades for the selected date range */
  syncToken: async (
    address: string,
    chain: OnchainChain = 'ethereum',
    params: Pick<OnchainQueryParams, 'start_date' | 'end_date'> = {},
  ): Promise<Record<string, unknown>> => {
    const { data } = await http.post(
      `/api/onchain/sync/${encodeURIComponent(address)}${buildQueryString({
        chain,
        start_date: params.start_date,
        end_date: params.end_date,
      })}`,
      {},
      { timeout: 180000 },
    )
    return data
  },
}
