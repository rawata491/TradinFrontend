import { useState } from 'react'
import {
  CandlestickChart,
  LineChart,
  AreaChart,
  Maximize2,
  Minimize2,
  ZoomIn,
  ChevronDown,
  TrendingUp,
  Minus,
  GitBranch,
  Trash2,
  BarChart3,
  Eye,
  EyeOff,
  Bell,
} from 'lucide-react'
import {
  useChartStore,
  type ChartType,
  type DrawingTool,
  type BuiltinIndicatorId,
} from '@/store/useChartStore'
import { BUILTIN_INDICATOR_META } from './useChartInstance'
import { OVERLAY_COLORS, INDICATOR_COLORS } from '@/utils/constants'

interface ChartToolbarProps {
  onFitContent: () => void
  onScrollToRealtime: () => void
  onClearDrawings: () => void
  overlayNames?: string[]
  fullscreenTargetRef: React.RefObject<HTMLElement | null>
  enablePriceAlerts?: boolean
  horizontalAlertPrice?: number | null
  onCreateAlertAtLine?: () => void
}

const CHART_TYPES: { id: ChartType; label: string; icon: typeof CandlestickChart }[] = [
  { id: 'candlestick', label: 'Candles', icon: CandlestickChart },
  { id: 'line', label: 'Line', icon: LineChart },
  { id: 'area', label: 'Area', icon: AreaChart },
]

const DRAWING_TOOLS: { id: DrawingTool; label: string; icon: typeof TrendingUp }[] = [
  { id: 'trendline', label: 'Trend Line', icon: TrendingUp },
  { id: 'horizontal', label: 'Horizontal', icon: Minus },
  { id: 'fib', label: 'Fibonacci', icon: GitBranch },
]

const INDICATOR_IDS: BuiltinIndicatorId[] = [
  'ema9', 'ema21', 'sma20', 'sma50', 'rsi', 'macd', 'bb', 'vwap', 'stoch', 'atr',
]

const PARAM_FIELDS: Partial<Record<BuiltinIndicatorId, { key: string; label: string }>> = {
  ema9: { key: 'ema9', label: 'Period' },
  ema21: { key: 'ema21', label: 'Period' },
  sma20: { key: 'sma20', label: 'Period' },
  sma50: { key: 'sma50', label: 'Period' },
  rsi: { key: 'rsi', label: 'Period' },
  bb: { key: 'bbPeriod', label: 'BB Period' },
  stoch: { key: 'stochK', label: 'K' },
  atr: { key: 'atr', label: 'Period' },
}

export function ChartToolbar({
  onFitContent,
  onScrollToRealtime,
  onClearDrawings,
  overlayNames = [],
  fullscreenTargetRef,
  enablePriceAlerts = false,
  horizontalAlertPrice = null,
  onCreateAlertAtLine,
}: ChartToolbarProps) {
  const chartType = useChartStore((s) => s.chartType)
  const showVolume = useChartStore((s) => s.showVolume)
  const showLegend = useChartStore((s) => s.showLegend)
  const activeIndicators = useChartStore((s) => s.activeIndicators)
  const indicatorParams = useChartStore((s) => s.indicatorParams)
  const setIndicatorParam = useChartStore((s) => s.setIndicatorParam)
  const drawingTool = useChartStore((s) => s.drawingTool)
  const setChartType = useChartStore((s) => s.setChartType)
  const setShowVolume = useChartStore((s) => s.setShowVolume)
  const setShowLegend = useChartStore((s) => s.setShowLegend)
  const toggleIndicator = useChartStore((s) => s.toggleIndicator)
  const setDrawingTool = useChartStore((s) => s.setDrawingTool)
  const resetDrawingTool = useChartStore((s) => s.resetDrawingTool)

  const [indicatorsOpen, setIndicatorsOpen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const toggleDrawingTool = (tool: DrawingTool) => {
    if (drawingTool === tool) {
      resetDrawingTool()
    } else {
      setDrawingTool(tool)
    }
  }

  const toggleFullscreen = async () => {
    const el = fullscreenTargetRef.current
    if (!el) return
    if (!document.fullscreenElement) {
      await el.requestFullscreen()
      setIsFullscreen(true)
    } else {
      await document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const legendItems = [
    ...overlayNames.map((name, i) => ({
      key: name,
      label: name,
      color: OVERLAY_COLORS[i % OVERLAY_COLORS.length],
    })),
    ...activeIndicators.map((id) => {
      const meta = BUILTIN_INDICATOR_META[id]
      const pk = meta.paramKey ?? id
      const period = indicatorParams[pk]
      const label = period && meta.paramKey ? `${meta.label}(${period})` : meta.label
      return {
        key: id,
        label,
        color: (INDICATOR_COLORS as Record<string, string>)[id] ?? '#3B82F6',
      }
    }),
  ]

  return (
    <div className="px-4 py-2 border-b border-dark-800 bg-dark-950/80 space-y-2">
      <div className="flex items-center gap-1 flex-wrap">
        {/* Chart type */}
        <div className="flex items-center gap-0.5 bg-dark-800 rounded-lg p-0.5 mr-1">
          {CHART_TYPES.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              title={label}
              onClick={() => setChartType(id)}
              className={`p-1.5 rounded-md transition-colors ${
                chartType === id
                  ? 'bg-brand-600 text-white'
                  : 'text-dark-400 hover:text-dark-100 hover:bg-dark-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
            </button>
          ))}
        </div>

        {/* Drawing tools */}
        <div className="flex items-center gap-0.5 bg-dark-800 rounded-lg p-0.5 mr-1">
          {DRAWING_TOOLS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              title={label}
              onClick={() => toggleDrawingTool(id)}
              className={`p-1.5 rounded-md transition-colors ${
                drawingTool === id
                  ? 'bg-brand-600 text-white'
                  : 'text-dark-400 hover:text-dark-100 hover:bg-dark-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
            </button>
          ))}
          <button
            type="button"
            title="Clear drawings"
            onClick={onClearDrawings}
            className="p-1.5 rounded-md text-dark-400 hover:text-negative hover:bg-dark-700 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {enablePriceAlerts && horizontalAlertPrice != null && onCreateAlertAtLine && (
          <button
            type="button"
            title={`Create price alert at $${horizontalAlertPrice.toLocaleString()}`}
            onClick={onCreateAlertAtLine}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-lg bg-brand-600/20 text-brand-300 border border-brand-700 hover:bg-brand-600/30 transition-colors mr-1"
          >
            <Bell className="w-3.5 h-3.5" />
            Alert @ ${horizontalAlertPrice >= 1000
              ? horizontalAlertPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })
              : horizontalAlertPrice.toFixed(4)}
          </button>
        )}

        {/* Indicators dropdown */}
        <div className="relative mr-1">
          <button
            type="button"
            onClick={() => setIndicatorsOpen((v) => !v)}
            className="flex items-center gap-1 px-2 py-1.5 text-xs rounded-lg bg-dark-800 text-dark-300 hover:text-dark-100 hover:bg-dark-700 transition-colors"
          >
            Indicators
            <ChevronDown className="w-3 h-3" />
          </button>
          {indicatorsOpen && (
            <div className="absolute top-full left-0 mt-1 z-30 min-w-[200px] card py-1 shadow-xl">
              {INDICATOR_IDS.map((id) => {
                const meta = BUILTIN_INDICATOR_META[id]
                const paramField = PARAM_FIELDS[id]
                const period = paramField ? indicatorParams[paramField.key] : undefined
                const label = paramField && period
                  ? `${meta.label} (${period})`
                  : meta.label
                return (
                  <div key={id} className="px-3 py-1.5 hover:bg-dark-800">
                    <button
                      type="button"
                      onClick={() => toggleIndicator(id)}
                      className={`w-full text-left text-xs transition-colors ${
                        activeIndicators.includes(id) ? 'text-brand-400' : 'text-dark-300'
                      }`}
                    >
                      {label}
                    </button>
                    {paramField && activeIndicators.includes(id) && (
                      <input
                        type="number"
                        min={2}
                        max={200}
                        value={indicatorParams[paramField.key]}
                        onChange={(e) =>
                          setIndicatorParam(paramField.key, Number(e.target.value) || 2)
                        }
                        className="mt-1 w-full bg-dark-950 text-dark-100 text-[10px] rounded px-2 py-1 border border-dark-700"
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Volume toggle */}
        <button
          type="button"
          title="Toggle volume"
          onClick={() => setShowVolume(!showVolume)}
          className={`p-1.5 rounded-md transition-colors ${
            showVolume ? 'bg-dark-700 text-brand-400' : 'text-dark-400 hover:text-dark-100 hover:bg-dark-700'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
        </button>

        {/* Legend toggle */}
        <button
          type="button"
          title="Toggle legend"
          onClick={() => setShowLegend(!showLegend)}
          className={`p-1.5 rounded-md transition-colors ${
            showLegend ? 'text-dark-200 hover:bg-dark-700' : 'text-dark-500 hover:bg-dark-700'
          }`}
        >
          {showLegend ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
        </button>

        <div className="flex-1" />

        {/* Zoom / fullscreen */}
        <button
          type="button"
          title="Reset zoom"
          onClick={onFitContent}
          className="p-1.5 rounded-md text-dark-400 hover:text-dark-100 hover:bg-dark-700 transition-colors"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          title="Scroll to latest"
          onClick={onScrollToRealtime}
          className="px-2 py-1 text-xs rounded-md text-dark-400 hover:text-dark-100 hover:bg-dark-700 transition-colors"
        >
          Latest
        </button>
        <button
          type="button"
          title="Fullscreen"
          onClick={toggleFullscreen}
          className="p-1.5 rounded-md text-dark-400 hover:text-dark-100 hover:bg-dark-700 transition-colors"
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
      </div>

      {showLegend && legendItems.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {legendItems.map((item) => (
            <span
              key={item.key}
              className="inline-flex items-center gap-1.5 text-[10px] font-mono text-dark-400 bg-dark-800/60 px-2 py-0.5 rounded-full"
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              {item.label}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
