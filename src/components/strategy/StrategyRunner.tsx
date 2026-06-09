import { useCallback, useState, useEffect } from 'react'
import { Play, BarChart2, Settings, ChevronDown } from 'lucide-react'
import { useEditorStore } from '@/store/useEditorStore'
import { useStrategyStore } from '@/store/useStrategyStore'
import { scriptApi } from '@/services/scriptApi'
import { useTimeframes } from '@/hooks/useTimeframes'
const SYMBOLS = ['BTC-USD', 'ETH-USD', 'SOL-USD', 'BNB-USD', 'AVAX-USD', 'DOGE-USD'] as const

// ─────────────────────────── Settings panel ──────────────────────────────────

function SettingsPanel({ open }: { open: boolean }) {
  const capital = useEditorStore(s => s.initialCapital)
  const feePct  = useEditorStore(s => s.feePct)
  const setCapital = useEditorStore(s => s.setCapital)
  const setFeePct  = useEditorStore(s => s.setFeePct)
  const broadcastTelegram = useEditorStore(s => s.broadcastTelegram)
  const setBroadcastTelegram = useEditorStore(s => s.setBroadcastTelegram)

  if (!open) return null

  return (
    <div className="grid grid-cols-2 gap-3 p-3 card mt-2">
      <label className="space-y-1">
        <span className="text-xs text-dark-400">Initial Capital ($)</span>
        <input
          type="number"
          value={capital}
          onChange={e => setCapital(Number(e.target.value))}
          className="w-full bg-dark-950 text-dark-50 text-sm rounded-lg px-2.5 py-1.5 border border-dark-700 focus:border-brand-500 outline-none transition-colors"
          min={100}
          step={1000}
        />
      </label>
      <label className="space-y-1">
        <span className="text-xs text-dark-400">Fee % (per side)</span>
        <input
          type="number"
          value={feePct * 100}
          onChange={e => setFeePct(Number(e.target.value) / 100)}
          className="w-full bg-dark-950 text-dark-50 text-sm rounded-lg px-2.5 py-1.5 border border-dark-700 focus:border-brand-500 outline-none transition-colors"
          min={0}
          max={5}
          step={0.01}
        />
      </label>
      <label className="col-span-2 flex items-center gap-2 text-xs text-dark-300 pt-1">
        <input
          type="checkbox"
          checked={broadcastTelegram}
          onChange={e => setBroadcastTelegram(e.target.checked)}
          className="rounded border-dark-600"
        />
        Send Telegram alert when latest bar has a BUY/SELL/EXIT signal
      </label>
    </div>
  )
}

// ─────────────────────────── Runner bar ──────────────────────────────────────

export function StrategyRunner({ lockSymbol }: { lockSymbol?: string }) {
  const { timeframes } = useTimeframes()
  const source      = useEditorStore(s => s.source)
  const symbol      = useEditorStore(s => s.selectedSymbol)
  const timeframe   = useEditorStore(s => s.selectedTimeframe)
  const capital     = useEditorStore(s => s.initialCapital)
  const feePct      = useEditorStore(s => s.feePct)
  const broadcastTelegram = useEditorStore(s => s.broadcastTelegram)
  const setSymbol   = useEditorStore(s => s.setSymbol)
  const setTimeframe = useEditorStore(s => s.setTimeframe)
  const compilerErrors = useEditorStore(s => s.compilerErrors)

  const runSymbol = lockSymbol?.toUpperCase() ?? symbol

  useEffect(() => {
    if (lockSymbol) {
      setSymbol(lockSymbol.toUpperCase())
    }
  }, [lockSymbol, setSymbol])

  const runStatus       = useStrategyStore(s => s.runStatus)
  const backtestStatus  = useStrategyStore(s => s.backtestStatus)
  const setRunStatus    = useStrategyStore(s => s.setRunStatus)
  const setRunResult    = useStrategyStore(s => s.setRunResult)
  const setBacktestStatus  = useStrategyStore(s => s.setBacktestStatus)
  const setBacktestResult  = useStrategyStore(s => s.setBacktestResult)
  const setActiveTab    = useStrategyStore(s => s.setActiveTab)
  const addLog          = useStrategyStore(s => s.addLog)

  const [showSettings, setShowSettings] = useState(false)

  const hasErrors  = compilerErrors.some(e => e.severity === 'error')
  const isRunning  = runStatus     === 'running'
  const isBacking  = backtestStatus === 'running'
  const disabled   = !source.trim() || hasErrors

  const handleRun = useCallback(async () => {
    if (disabled || isRunning) return
    setRunStatus('running')
    setActiveTab('chart')
    addLog(`Running "${runSymbol}" (${timeframe})…`)
    try {
      const result = await scriptApi.run(runSymbol, {
        source, timeframe, limit: 300,
        initial_capital: capital, fee_pct: feePct,
        broadcast_telegram: broadcastTelegram,
      })
      setRunResult(result)
      setRunStatus(result.success ? 'success' : 'error')
      addLog(result.success
        ? `✓ Done — ${result.signals.length} signal(s) in ${result.execution_ms}ms${broadcastTelegram ? ' · Telegram queued for latest bar' : ''}`
        : `✗ Error: ${result.errors[0] ?? 'Unknown error'}`
      )
    } catch (err) {
      setRunStatus('error')
      addLog(`✗ Network error: ${err}`)
    }
  }, [source, runSymbol, timeframe, capital, feePct, broadcastTelegram, disabled, isRunning, setRunStatus, setActiveTab, addLog, setRunResult])

  const handleBacktest = useCallback(async () => {
    if (disabled || isBacking) return
    setBacktestStatus('running')
    setActiveTab('backtest')
    addLog(`Backtesting "${runSymbol}" (${timeframe}, $${capital.toLocaleString()})…`)
    try {
      const result = await scriptApi.backtest(runSymbol, {
        source, timeframe, limit: 500,
        initial_capital: capital, fee_pct: feePct,
      })
      setBacktestResult(result)
      setBacktestStatus(result.success ? 'success' : 'error')
      if (result.success) setActiveTab('chart')
      addLog(result.success
        ? `✓ Backtest done — ${result.total_trades} trades, ${result.net_profit_pct.toFixed(2)}% P&L, win rate ${result.win_rate_pct.toFixed(1)}%`
        : `✗ Backtest failed: ${result.errors[0] ?? 'Unknown'}`
      )
    } catch (err) {
      setBacktestStatus('error')
      addLog(`✗ Network error: ${err}`)
    }
  }, [source, runSymbol, timeframe, capital, feePct, disabled, isBacking, setBacktestStatus, setActiveTab, addLog, setBacktestResult])

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 flex-wrap">

        {/* Symbol selector */}
        {lockSymbol ? (
          <span className="bg-dark-900 text-dark-100 text-sm rounded-lg px-3 py-2 border border-dark-700 font-mono">
            {runSymbol}
          </span>
        ) : (
          <div className="relative">
            <select
              value={symbol}
              onChange={e => setSymbol(e.target.value)}
              className="appearance-none bg-dark-900 text-dark-100 text-sm rounded-lg px-3 py-2 pr-8
                         border border-dark-700 focus:border-brand-500 outline-none cursor-pointer
                         hover:border-dark-600 transition-colors"
            >
              {SYMBOLS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-dark-400 pointer-events-none" />
          </div>
        )}

        {/* Timeframe pills */}
        <div className="flex gap-1 bg-dark-900 rounded-lg p-1 border border-dark-800">
          {timeframes.map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              style={timeframe === tf ? { color: '#ffffff' } : undefined}
            className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-all ${
                timeframe === tf
                  ? 'bg-brand-600 shadow-sm'
                  : 'text-dark-400 hover:text-dark-100 hover:bg-dark-800'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {/* Settings */}
        <button
          onClick={() => setShowSettings(v => !v)}
          className={`btn-ghost flex items-center gap-1.5 px-3 py-2 text-sm ${
            showSettings ? 'bg-dark-800 text-dark-50' : ''
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Settings</span>
        </button>

        {/* Backtest */}
        <button
          onClick={handleBacktest}
          disabled={disabled || isBacking}
          style={!(disabled || isBacking) ? { color: '#ffffff' } : undefined}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            disabled || isBacking
              ? 'bg-dark-800 text-dark-500 cursor-not-allowed'
              : 'bg-purple-600 hover:bg-purple-500 shadow-sm'
          }`}
        >
          {isBacking
            ? <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            : <BarChart2 className="w-3.5 h-3.5" />
          }
          Backtest
        </button>

        {/* Run */}
        <button
          onClick={handleRun}
          disabled={disabled || isRunning}
          style={!(disabled || isRunning) ? { color: '#ffffff' } : undefined}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            disabled || isRunning
              ? 'bg-dark-800 text-dark-500 cursor-not-allowed'
              : 'bg-positive hover:bg-green-500 shadow-sm'
          }`}
        >
          {isRunning
            ? <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            : <Play className="w-3.5 h-3.5" />
          }
          Run
        </button>
      </div>

      <SettingsPanel open={showSettings} />

      {hasErrors && (
        <p className="text-xs text-red-500 px-0.5">
          Fix compiler errors before running.
        </p>
      )}
    </div>
  )
}
