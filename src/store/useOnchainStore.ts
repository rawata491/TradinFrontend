import { create } from 'zustand'
import { analyzeTokenLive } from '@/services/geckoTerminalApi'
import { onchainApi } from '@/services/onchainApi'
import { DEFAULT_ONCHAIN_TOKEN } from '@/constants/onchainTokens'
import { dateRangeKey, defaultDateRange, isCompleteDateRange, normalizeDateRange } from '@/utils/onchainDateRange'
import type { OhlcvCandle, OnchainChain, OnchainDateRange, OnchainSignal, OnchainTrade, TokenMetrics, TradeHeatmapData, WhaleEvent } from '@/types/onchain'
import type { OnchainAnalysis } from '@/types/onchainAnalysis'

interface OnchainState {
  selectedChain: OnchainChain
  selectedToken: string
  dateRange: OnchainDateRange
  loadedFor: { chain: OnchainChain; address: string; rangeKey: string } | null
  metrics: TokenMetrics | null
  ohlcvCandles: OhlcvCandle[]
  heatmap: TradeHeatmapData | null
  trades: OnchainTrade[]
  dataSource: string
  analysisError: string | null
  warnings: string[]
  poolInfo: OnchainAnalysis['pool']
  isLoading: boolean
  error: string | null
  lastLoadedAt: number | null
  realtimeSignals: OnchainSignal[]
  realtimeWhales: WhaleEvent[]

  setSelectedToken: (chain: OnchainChain, address: string) => void
  setDateRange: (range: OnchainDateRange) => void
  loadAnalysis: (chain?: OnchainChain, address?: string) => Promise<void>
  addRealtimeSignal: (signal: OnchainSignal) => void
  addRealtimeWhale: (event: WhaleEvent) => void
}

let fetchGeneration = 0

function tokenKey(chain: OnchainChain, address: string): string {
  const normalized = address.startsWith('0x') ? address.toLowerCase() : address
  return `${chain}:${normalized}`
}

function emptyAnalysisState() {
  return {
    metrics: null,
    ohlcvCandles: [],
    heatmap: null,
    trades: [],
    dataSource: 'none',
    poolInfo: null,
    loadedFor: null,
    lastLoadedAt: null,
  }
}

function applyAnalysis(
  data: OnchainAnalysis,
  rangeKey: string,
  warnings: string[] = [],
) {
  return {
    ...emptyAnalysisState(),
    metrics: data.metrics ?? null,
    ohlcvCandles: data.candles ?? [],
    heatmap: data.heatmap ?? null,
    trades: data.live_trades ?? [],
    dataSource: data.data_source ?? 'none',
    analysisError: data.error ?? null,
    warnings,
    poolInfo: data.pool ?? null,
    error: data.error ?? null,
    loadedFor: {
      chain: data.chain as OnchainChain,
      address: data.token_address,
      rangeKey,
    },
    lastLoadedAt: Date.now(),
  }
}

export const useOnchainStore = create<OnchainState>((set, get) => ({
  selectedChain: DEFAULT_ONCHAIN_TOKEN.chain,
  selectedToken: DEFAULT_ONCHAIN_TOKEN.address,
  dateRange: defaultDateRange(7),
  loadedFor: null,
  metrics: null,
  ohlcvCandles: [],
  heatmap: null,
  trades: [],
  dataSource: 'none',
  analysisError: null,
  warnings: [],
  poolInfo: null,
  isLoading: false,
  error: null,
  lastLoadedAt: null,
  realtimeSignals: [],
  realtimeWhales: [],

  setSelectedToken: (chain, address) => {
    const current = get()
    const sameToken = tokenKey(current.selectedChain, current.selectedToken) === tokenKey(chain, address)
    set({ selectedChain: chain, selectedToken: address })
    if (!sameToken || !current.loadedFor) {
      void get().loadAnalysis(chain, address)
    }
  },

  setDateRange: (range) => {
    const normalized = normalizeDateRange(range)
    if (!normalized) return
    const prevKey = dateRangeKey(get().dateRange)
    const nextKey = dateRangeKey(normalized)
    if (prevKey === nextKey) return
    set({ dateRange: normalized })
    void get().loadAnalysis()
  },

  loadAnalysis: async (chain?, address?) => {
    const selectedChain = chain ?? get().selectedChain
    const selectedToken = address ?? get().selectedToken
    const dateRange = get().dateRange

    if (!isCompleteDateRange(dateRange)) return

    const generation = ++fetchGeneration
    const rangeKey = dateRangeKey(dateRange)

    set({
      selectedChain,
      selectedToken,
      isLoading: true,
      error: null,
      analysisError: null,
      warnings: [],
      ...emptyAnalysisState(),
    })

    try {
      const normalized = normalizeDateRange(dateRange)!
      let data: OnchainAnalysis
      try {
        data = await onchainApi.analyze(selectedToken, {
          chain: selectedChain,
          start_date: normalized.startDate,
          end_date: normalized.endDate,
        })
      } catch {
        data = await analyzeTokenLive(
          selectedChain,
          selectedToken,
          normalized.startDate,
          normalized.endDate,
        )
      }

      if (generation !== fetchGeneration || dateRangeKey(get().dateRange) !== rangeKey) return

      set({ ...applyAnalysis(data, rangeKey, data.warnings ?? []), isLoading: false })
    } catch (err) {
      if (generation !== fetchGeneration) return
      if (dateRangeKey(get().dateRange) !== rangeKey) return
      if (tokenKey(get().selectedChain, get().selectedToken) !== tokenKey(selectedChain, selectedToken)) return

      const message = err instanceof Error ? err.message : 'Failed to load analysis'
      set({
        isLoading: false,
        error: message,
        analysisError: message,
        warnings: [],
        ...emptyAnalysisState(),
      })
    }
  },

  addRealtimeSignal: (signal) =>
    set((s) => ({
      realtimeSignals: [signal, ...s.realtimeSignals].slice(0, 50),
    })),

  addRealtimeWhale: (event) =>
    set((s) => ({
      realtimeWhales: [event, ...s.realtimeWhales].slice(0, 50),
      trades: event.token_address === s.selectedToken
        ? [{
            id: Date.now(),
            chain: event.chain,
            token_address: event.token_address,
            wallet: event.wallet,
            side: event.event_type.includes('BUY') ? 'BUY' as const : 'SELL' as const,
            amount: 0,
            usd_value: event.usd_value,
            timestamp: new Date().toISOString(),
            dex: '',
            tx_hash: '',
            raw_source: 'ws',
          }, ...s.trades].slice(0, 300)
        : s.trades,
    })),
}))
