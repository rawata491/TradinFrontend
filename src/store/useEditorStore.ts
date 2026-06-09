import { create } from 'zustand'
import type { CompilerError, ValidationResult } from '@/types/compiler'

interface EditorStore {
  source: string
  isDirty: boolean
  isValidating: boolean
  validationResult: ValidationResult | null
  compilerErrors: CompilerError[]
  selectedSymbol: string
  selectedTimeframe: string
  initialCapital: number
  feePct: number
  broadcastTelegram: boolean

  setSource: (src: string) => void
  setValidationResult: (result: ValidationResult | null) => void
  setValidating: (v: boolean) => void
  setSymbol: (symbol: string) => void
  setTimeframe: (tf: string) => void
  setCapital: (v: number) => void
  setFeePct: (v: number) => void
  setBroadcastTelegram: (v: boolean) => void
  markClean: () => void
}

export const useEditorStore = create<EditorStore>((set) => ({
  source: `//@version=5
strategy("EMA Crossover", overlay=true)

fastLen = input.int(10, "Fast EMA")
slowLen = input.int(30, "Slow EMA")

fast = ta.ema(close, fastLen)
slow = ta.ema(close, slowLen)

plot(fast, "Fast EMA")
plot(slow, "Slow EMA")

if ta.crossover(fast, slow)
    strategy.entry("Long", strategy.long)

if ta.crossunder(fast, slow)
    strategy.close("Long")
`,
  isDirty: false,
  isValidating: false,
  validationResult: null,
  compilerErrors: [],
  selectedSymbol: 'BTC-USD',
  selectedTimeframe: '1D',
  initialCapital: 10000,
  feePct: 0.001,
  broadcastTelegram: true,

  setSource: (src) => set({ source: src, isDirty: true }),
  setValidationResult: (result) =>
    set({
      validationResult: result,
      compilerErrors: result ? [...result.errors, ...result.warnings] : [],
    }),
  setValidating: (v) => set({ isValidating: v }),
  setSymbol: (symbol) => set({ selectedSymbol: symbol }),
  setTimeframe: (tf) => set({ selectedTimeframe: tf }),
  setCapital: (v) => set({ initialCapital: v }),
  setFeePct: (v) => set({ feePct: v }),
  setBroadcastTelegram: (v) => set({ broadcastTelegram: v }),
  markClean: () => set({ isDirty: false }),
}))
