import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Code2,
  BarChart2,
  Signal,
  Terminal,
  BookOpen,
  Save,
  FolderOpen,
  Trash2,
  Loader2,
  LineChart,
  ExternalLink,
} from 'lucide-react'
import { useScriptStore } from '@/store/useScriptStore'
import type { Script } from '@/types/script'
import { PineEditor } from '@/components/strategy/PineEditor'
import { StrategyRunner } from '@/components/strategy/StrategyRunner'
import { CompilerErrors } from '@/components/strategy/CompilerErrors'
import { SignalOverlay } from '@/components/strategy/SignalOverlay'
import { BacktestDashboard } from '@/components/strategy/BacktestDashboard'
import { ExecutionLogs } from '@/components/strategy/ExecutionLogs'
import { StrategyChartPanel } from '@/components/strategy/StrategyChartPanel'
import { useStrategyStore } from '@/store/useStrategyStore'
import { useEditorStore } from '@/store/useEditorStore'
import { scriptApi } from '@/services/scriptApi'

const EXAMPLES = [
  {
    name: 'EMA Crossover',
    source: `strategy("EMA Crossover")

fast = ta.ema(close, 10)
slow = ta.ema(close, 30)

if ta.crossover(fast, slow)
    strategy.entry("LONG")

if ta.crossunder(fast, slow)
    strategy.exit("LONG")
`,
  },
  {
    name: 'RSI Oversold Bounce',
    source: `strategy("RSI Oversold")

rsi = ta.rsi(close, 14)

if rsi < 30
    strategy.entry("BUY")

if rsi > 70
    strategy.exit("SELL")
`,
  },
  {
    name: 'Bollinger Band Reversion',
    source: `strategy("BB Reversion")

upper = ta.bb(close, 20, 2.0)
mid   = ta.sma(close, 20)

if close < mid
    strategy.entry("LONG")

if close > upper
    strategy.exit("LONG")
`,
  },
  {
    name: 'EMA + RSI Combo',
    source: `strategy("EMA + RSI")

fast    = ta.ema(close, 12)
slow    = ta.ema(close, 26)
rsi_val = ta.rsi(close, 14)

if ta.crossover(fast, slow) and rsi_val > 50
    strategy.entry("LONG")

if ta.crossunder(fast, slow)
    strategy.exit("LONG")
`,
  },
]

function ExamplesMenu({ onLoad }: { onLoad: (src: string) => void }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="btn-ghost flex items-center gap-1.5 px-3 py-2 text-sm"
      >
        <BookOpen className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Examples</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="absolute left-0 top-full mt-1 z-50 bg-dark-900 border border-dark-700 rounded-xl w-56"
            style={{ boxShadow: 'var(--shadow-dropdown)' }}
          >
            <p className="text-xs text-dark-500 px-3 pt-2.5 pb-1 font-medium uppercase tracking-wide">
              Example Strategies
            </p>
            <div className="p-1.5 space-y-0.5">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex.name}
                  type="button"
                  onClick={() => {
                    onLoad(ex.source)
                    setOpen(false)
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-dark-200 hover:text-dark-50 hover:bg-dark-800 rounded-lg transition-colors"
                >
                  {ex.name}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function MyScriptsMenu({
  onLoad,
  onNameChange,
}: {
  onLoad: (src: string) => void
  onNameChange: (name: string) => void
}) {
  const [open, setOpen] = useState(false)
  const { scripts, loading, error, loadScripts, deleteScript } = useScriptStore()

  useEffect(() => {
    if (open) loadScripts()
  }, [open, loadScripts])

  const handleLoad = (script: Script) => {
    onLoad(script.source)
    onNameChange(script.name)
    setOpen(false)
  }

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation()
    if (!window.confirm('Delete this script?')) return
    await deleteScript(id)
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="btn-ghost flex items-center gap-1.5 px-3 py-2 text-sm"
      >
        <FolderOpen className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">My Scripts</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="absolute left-0 top-full mt-1 z-50 bg-dark-900 border border-dark-700 rounded-xl w-64"
            style={{ boxShadow: 'var(--shadow-dropdown)' }}
          >
            <p className="text-xs text-dark-500 px-3 pt-2.5 pb-1 font-medium uppercase tracking-wide">
              Saved Strategies
            </p>
            <div className="p-1.5 space-y-0.5 max-h-72 overflow-y-auto">
              {loading && (
                <div className="flex items-center justify-center py-6 gap-2 text-dark-400 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading…
                </div>
              )}
              {!loading && error && (
                <p className="text-xs text-negative px-3 py-2">{error}</p>
              )}
              {!loading && !error && scripts.length === 0 && (
                <p className="text-xs text-dark-500 px-3 py-4 text-center">
                  No saved scripts yet.
                </p>
              )}
              {!loading &&
                scripts.map((sc) => (
                  <div
                    key={sc.id}
                    className="group flex items-center gap-1 px-1 rounded-lg hover:bg-dark-800/40 transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => handleLoad(sc)}
                      className="flex-1 text-left px-2 py-2 text-sm text-dark-200 hover:text-dark-50 transition-colors truncate"
                      title={sc.name}
                    >
                      {sc.name}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDelete(e, sc.id)}
                      className="p-1.5 text-dark-600 hover:text-negative rounded-md opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                      title="Delete script"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

const RESULT_TABS = [
  { id: 'chart', label: 'Chart', icon: LineChart },
  { id: 'signals', label: 'Signals', icon: Signal },
  { id: 'backtest', label: 'Backtest', icon: BarChart2 },
  { id: 'logs', label: 'Logs', icon: Terminal },
] as const

type ResultTab = (typeof RESULT_TABS)[number]['id']

export interface StrategyWorkspaceProps {
  /** Lock strategy runs to this product (e.g. BTC-USD from coin page). */
  lockSymbol?: string
  /** Compact layout for embedding inside Coin Detail. */
  embedded?: boolean
  /** Show the page header with save/examples controls. */
  showHeader?: boolean
  /** Custom editor height CSS value. */
  editorHeight?: string
}

export function StrategyWorkspace({
  lockSymbol,
  embedded = false,
  showHeader = true,
  editorHeight,
}: StrategyWorkspaceProps) {
  const setSource = useEditorStore((s) => s.setSource)
  const setSymbol = useEditorStore((s) => s.setSymbol)
  const addLog = useStrategyStore((s) => s.addLog)

  const [scriptName, setScriptName] = useState('Untitled Strategy')
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<ResultTab>('chart')

  const storeTab = useStrategyStore((s) => s.activeTab)
  const setStoreTab = useStrategyStore((s) => s.setActiveTab)

  useEffect(() => {
    if (lockSymbol) {
      setSymbol(lockSymbol.toUpperCase())
    }
  }, [lockSymbol, setSymbol])

  const resolvedTab: ResultTab =
    storeTab === 'chart'
      ? 'chart'
      : storeTab === 'signals'
        ? 'signals'
        : storeTab === 'backtest'
          ? 'backtest'
          : storeTab === 'logs'
            ? 'logs'
            : activeTab

  const handleTabClick = (id: ResultTab) => {
    setActiveTab(id)
    setStoreTab(id)
  }

  const handleSave = async () => {
    if (saving) return
    setSaving(true)
    try {
      await scriptApi.create({ name: scriptName, source: useEditorStore.getState().source })
      addLog(`✓ Script "${scriptName}" saved`)
    } catch {
      addLog('✗ Failed to save script')
    } finally {
      setSaving(false)
    }
  }

  const resolvedEditorHeight =
    editorHeight ?? (embedded ? '420px' : 'calc(100vh - 330px)')

  return (
    <div
      className={`strategy-layout flex flex-col ${embedded ? '' : ''}`}
      style={embedded ? undefined : { minHeight: 'calc(100vh - 4rem)' }}
    >
      {showHeader && (
        <div
          className={`border-b border-dark-800 bg-dark-900 px-4 sm:px-6 py-4 ${embedded ? 'rounded-t-xl' : ''}`}
          style={{ boxShadow: 'var(--shadow-card)' }}
        >
          <div
            className={`flex items-center justify-between flex-wrap gap-4 ${embedded ? '' : 'max-w-screen-2xl mx-auto'}`}
          >
            <div>
              <div className="flex items-center gap-2.5">
                <Code2 className="w-5 h-5 text-brand-500" />
                <h2 className="text-base font-semibold text-dark-50">
                  {embedded && lockSymbol ? `Strategy · ${lockSymbol}` : 'Strategy Engine'}
                </h2>
              </div>
              <p className="text-xs text-dark-500 mt-0.5 ml-7.5">
                Pine Script · Backtest · Signals
                {lockSymbol && embedded && ' · synced to this coin'}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <ExamplesMenu onLoad={setSource} />
              <MyScriptsMenu onLoad={setSource} onNameChange={setScriptName} />

              <input
                value={scriptName}
                onChange={(e) => setScriptName(e.target.value)}
                placeholder="Strategy name"
                className="bg-dark-950 text-dark-100 text-sm rounded-lg px-3 py-2 border border-dark-700 focus:border-brand-500 outline-none hover:border-dark-600 transition-colors w-44"
              />

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="btn-primary flex items-center gap-1.5 text-sm"
              >
                <Save className="w-3.5 h-3.5" />
                {saving ? 'Saving…' : 'Save'}
              </button>

              {embedded && lockSymbol && (
                <Link
                  to={`/strategy?symbol=${encodeURIComponent(lockSymbol)}`}
                  className="btn-ghost flex items-center gap-1.5 text-sm"
                  title="Open full-screen strategy IDE"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Full IDE</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      <div
        className={`flex flex-1 flex-col ${embedded ? 'xl:flex-row' : 'lg:flex-row'} overflow-hidden ${embedded ? '' : 'max-w-screen-2xl mx-auto w-full'}`}
      >
        <div
          className={`flex flex-col w-full ${embedded ? 'xl:w-[55%]' : 'lg:w-[58%] xl:w-[62%]'} border-r border-dark-800`}
        >
          <div className="px-4 py-3 border-b border-dark-800 bg-dark-900/60">
            <StrategyRunner lockSymbol={lockSymbol} />
          </div>

          <div className="flex border-b border-dark-800 bg-dark-950">
            <div className="flex items-center gap-1.5 px-4 py-2.5 text-sm border-b-2 border-brand-500 text-dark-50 font-medium">
              <Code2 className="w-3.5 h-3.5" />
              Script Editor
            </div>
          </div>

          <div className="flex-1 flex flex-col p-4 gap-3 overflow-hidden bg-dark-950">
            <PineEditor height={resolvedEditorHeight} />

            <div className="card overflow-hidden">
              <div className="px-3 py-1.5 border-b border-dark-800 bg-dark-950">
                <span className="text-xs font-medium text-dark-400 uppercase tracking-wide">
                  Diagnostics
                </span>
              </div>
              <CompilerErrors />
            </div>
          </div>
        </div>

        <div className={`flex flex-col w-full ${embedded ? 'xl:w-[45%]' : 'lg:w-[42%] xl:w-[38%]'}`}>
          <div className="flex border-b border-dark-800 bg-dark-950 overflow-x-auto">
            {RESULT_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabClick(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm border-b-2 transition-colors whitespace-nowrap ${
                  resolvedTab === tab.id
                    ? 'border-brand-500 text-dark-50 font-medium'
                    : 'border-transparent text-dark-400 hover:text-dark-200 hover:bg-dark-900/40'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto bg-dark-950 min-h-[320px]">
            {resolvedTab === 'chart' && <StrategyChartPanel />}
            {resolvedTab === 'signals' && <SignalOverlay />}
            {resolvedTab === 'backtest' && <BacktestDashboard />}
            {resolvedTab === 'logs' && (
              <div className="h-full min-h-64">
                <ExecutionLogs />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
