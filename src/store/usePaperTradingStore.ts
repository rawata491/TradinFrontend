import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PaperTrade, PaperTradeStats } from '@/types/paperTrade'
import { DEFAULT_STARTING_BALANCE, DEFAULT_TRADE_USD } from '@/utils/paperTrading'

const DEFAULT_STATS: PaperTradeStats = {
  open_count: 0,
  closed_count: 0,
  total_realized_pnl: 0,
  win_count: 0,
  loss_count: 0,
  win_rate_pct: 0,
}

interface PaperTradingState {
  trades: PaperTrade[]
  stats: PaperTradeStats
  startingBalance: number
  defaultTradeUsd: number
  feePct: number
  isLoading: boolean
  error: string | null
  setTrades: (trades: PaperTrade[], stats?: PaperTradeStats) => void
  upsertTrade: (trade: PaperTrade) => void
  removeTradeById: (id: number) => void
  setLoading: (v: boolean) => void
  setError: (msg: string | null) => void
  setStartingBalance: (v: number) => void
  setDefaultTradeUsd: (v: number) => void
  setFeePct: (v: number) => void
  reset: () => void
}

export const usePaperTradingStore = create<PaperTradingState>()(
  persist(
    (set) => ({
      trades: [],
      stats: DEFAULT_STATS,
      startingBalance: DEFAULT_STARTING_BALANCE,
      defaultTradeUsd: DEFAULT_TRADE_USD,
      feePct: 0.001,
      isLoading: false,
      error: null,
      setTrades: (trades, stats) =>
        set({
          trades,
          stats: stats ?? DEFAULT_STATS,
          error: null,
        }),
      upsertTrade: (trade) =>
        set((s) => {
          const idx = s.trades.findIndex((t) => t.id === trade.id)
          const trades =
            idx >= 0
              ? s.trades.map((t) => (t.id === trade.id ? trade : t))
              : [trade, ...s.trades]
          return { trades }
        }),
      removeTradeById: (id) =>
        set((s) => ({ trades: s.trades.filter((t) => t.id !== id) })),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      setStartingBalance: (startingBalance) => set({ startingBalance }),
      setDefaultTradeUsd: (defaultTradeUsd) => set({ defaultTradeUsd }),
      setFeePct: (feePct) => set({ feePct }),
      reset: () => set({ trades: [], stats: DEFAULT_STATS, error: null }),
    }),
    {
      name: 'tradin_paper_settings',
      partialize: (s) => ({
        startingBalance: s.startingBalance,
        defaultTradeUsd: s.defaultTradeUsd,
        feePct: s.feePct,
      }),
    },
  ),
)
