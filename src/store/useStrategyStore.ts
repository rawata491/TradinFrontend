import { create } from 'zustand'
import type { RunResponse } from '@/types/signal'
import type { BacktestResult } from '@/types/backtest'

type RunStatus = 'idle' | 'running' | 'success' | 'error'

interface StrategyStore {
  runStatus: RunStatus
  runResult: RunResponse | null
  backtestStatus: RunStatus
  backtestResult: BacktestResult | null
  executionLog: string[]
  activeTab: 'editor' | 'backtest' | 'signals' | 'logs' | 'chart'
  selectedTradeIndex: number | null

  setRunStatus: (s: RunStatus) => void
  setRunResult: (r: RunResponse | null) => void
  setBacktestStatus: (s: RunStatus) => void
  setBacktestResult: (r: BacktestResult | null) => void
  setSelectedTradeIndex: (idx: number | null) => void
  addLog: (msg: string) => void
  clearLogs: () => void
  setActiveTab: (tab: StrategyStore['activeTab']) => void
  reset: () => void
}

export const useStrategyStore = create<StrategyStore>((set) => ({
  runStatus: 'idle',
  runResult: null,
  backtestStatus: 'idle',
  backtestResult: null,
  executionLog: [],
  activeTab: 'editor',
  selectedTradeIndex: null,

  setRunStatus: (s) => set({ runStatus: s }),
  setRunResult: (r) => set({ runResult: r }),
  setBacktestStatus: (s) => set({ backtestStatus: s }),
  setBacktestResult: (r) => set({ backtestResult: r }),
  setSelectedTradeIndex: (idx) => set({ selectedTradeIndex: idx }),
  addLog: (msg) =>
    set(s => ({
      executionLog: [
        `[${new Date().toLocaleTimeString()}] ${msg}`,
        ...s.executionLog.slice(0, 199),
      ],
    })),
  clearLogs: () => set({ executionLog: [] }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  reset: () =>
    set({
      runStatus: 'idle',
      runResult: null,
      backtestStatus: 'idle',
      backtestResult: null,
      selectedTradeIndex: null,
    }),
}))
