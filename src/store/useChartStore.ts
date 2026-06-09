import { create } from 'zustand'
import { DEFAULT_INDICATOR_PARAMS } from '@/utils/constants'

export type ChartType = 'candlestick' | 'line' | 'area'
export type DrawingTool = 'none' | 'trendline' | 'horizontal' | 'fib'

export type BuiltinIndicatorId =
  | 'ema9'
  | 'ema21'
  | 'sma20'
  | 'sma50'
  | 'rsi'
  | 'macd'
  | 'bb'
  | 'vwap'
  | 'stoch'
  | 'atr'

interface ChartStore {
  chartType: ChartType
  showVolume: boolean
  showLegend: boolean
  activeIndicators: BuiltinIndicatorId[]
  indicatorParams: Record<string, number>
  drawingTool: DrawingTool

  setChartType: (t: ChartType) => void
  setShowVolume: (v: boolean) => void
  setShowLegend: (v: boolean) => void
  toggleIndicator: (id: BuiltinIndicatorId) => void
  setIndicatorParam: (key: string, value: number) => void
  setDrawingTool: (tool: DrawingTool) => void
  resetDrawingTool: () => void
}

export const useChartStore = create<ChartStore>((set) => ({
  chartType: 'candlestick',
  showVolume: true,
  showLegend: true,
  activeIndicators: [],
  indicatorParams: { ...DEFAULT_INDICATOR_PARAMS },
  drawingTool: 'none',

  setChartType: (chartType) => set({ chartType }),
  setShowVolume: (showVolume) => set({ showVolume }),
  setShowLegend: (showLegend) => set({ showLegend }),
  toggleIndicator: (id) =>
    set((s) => ({
      activeIndicators: s.activeIndicators.includes(id)
        ? s.activeIndicators.filter((x) => x !== id)
        : [...s.activeIndicators, id],
    })),
  setIndicatorParam: (key, value) =>
    set((s) => ({
      indicatorParams: { ...s.indicatorParams, [key]: value },
    })),
  setDrawingTool: (drawingTool) => set({ drawingTool }),
  resetDrawingTool: () => set({ drawingTool: 'none' }),
}))
