import { useEffect, useState } from 'react'
import { FlaskConical, Settings2, BarChart2, List } from 'lucide-react'
import { usePaperTrading } from '@/hooks/usePaperTrading'
import { useWebSocket } from '@/hooks/useWebSocket'
import { PracticeExplainer, PracticeSummaryBar } from '@/components/practice/PracticeSummaryBar'
import { PracticeOrderForm } from '@/components/practice/PracticeOrderForm'
import { PracticePositions } from '@/components/practice/PracticePositions'
import { PracticeHistory } from '@/components/practice/PracticeHistory'
import { PracticeJournalAnalytics } from '@/components/practice/PracticeJournalAnalytics'

type PracticeTab = 'positions' | 'journal' | 'analytics'

export function PracticeTradingPage() {
  const [tab, setTab] = useState<PracticeTab>('positions')
  const {
    openPositionViews,
    openProductIds,
    closedPositions,
    summary,
    isLoading,
    closeTrade,
    closeTradePartial,
    deleteTrade,
    clearClosed,
    startingBalance,
    setStartingBalance,
    feePct,
    setFeePct,
  } = usePaperTrading()

  const { subscribe, unsubscribe } = useWebSocket()

  useEffect(() => {
    if (!openProductIds.length) return
    subscribe(openProductIds)
    return () => unsubscribe(openProductIds)
  }, [openProductIds, subscribe, unsubscribe])

  const tabs: { id: PracticeTab; label: string; icon: typeof List }[] = [
    { id: 'positions', label: 'Positions', icon: List },
    { id: 'journal', label: 'Journal', icon: FlaskConical },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
  ]

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-50 flex items-center gap-2">
            <FlaskConical className="h-6 w-6 text-brand-500" />
            Practice trading
          </h1>
          <div className="mt-2 max-w-2xl">
            <PracticeExplainer />
          </div>
        </div>
      </div>

      <PracticeSummaryBar summary={summary} />

      <div className="flex gap-1 bg-dark-900 border border-dark-800 rounded-xl p-1 overflow-x-auto">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              tab === id
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-dark-400 hover:text-dark-100 hover:bg-dark-800'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {tab === 'analytics' ? (
        <PracticeJournalAnalytics />
      ) : (
        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-6">
            {tab === 'positions' && (
              <PracticePositions
                views={openPositionViews}
                isLoading={isLoading}
                onClose={closeTrade}
                onPartialClose={closeTradePartial}
              />
            )}
            {tab === 'journal' && (
              <PracticeHistory
                trades={closedPositions}
                onDelete={deleteTrade}
                onClear={clearClosed}
              />
            )}
          </div>
          <div className="lg:col-span-2 space-y-4">
            {tab === 'positions' && <PracticeOrderForm />}
            <details className="card p-4 group">
              <summary className="text-sm font-semibold text-dark-300 cursor-pointer flex items-center gap-2 list-none">
                <Settings2 className="h-4 w-4" />
                Account settings
              </summary>
              <div className="mt-4 space-y-3 pt-3 border-t border-dark-800">
                <label className="block space-y-1">
                  <span className="text-xs text-dark-400">Starting balance ($)</span>
                  <input
                    type="number"
                    value={startingBalance}
                    onChange={(e) => setStartingBalance(Number(e.target.value) || 0)}
                    min={1000}
                    step={1000}
                    className="w-full bg-dark-950 border border-dark-700 rounded-lg px-3 py-2 text-sm font-mono"
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-xs text-dark-400">Fee per side (%)</span>
                  <input
                    type="number"
                    value={(feePct * 100).toFixed(3)}
                    onChange={(e) => setFeePct(Number(e.target.value) / 100)}
                    min={0}
                    max={2}
                    step={0.01}
                    className="w-full bg-dark-950 border border-dark-700 rounded-lg px-3 py-2 text-sm font-mono"
                  />
                </label>
                <p className="text-[10px] text-dark-600">
                  Starting balance is for display only — equity = start + realized + open P&amp;L.
                </p>
              </div>
            </details>
          </div>
        </div>
      )}
    </div>
  )
}
