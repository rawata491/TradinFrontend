import type { AnalyticsTab } from '@/config/analyticsSections'

export function TabIntro({ tab }: { tab: AnalyticsTab }) {
  return (
    <div className="rounded-xl border border-dark-800 bg-dark-900/40 px-4 py-3 space-y-1">
      <h2 className="text-sm font-semibold text-dark-100">{tab.title}</h2>
      <p className="text-sm text-dark-400 leading-relaxed">{tab.description}</p>
      {tab.tip && (
        <p className="text-xs text-dark-500 pt-1">
          <span className="text-dark-400 font-medium">Tip:</span> {tab.tip}
        </p>
      )}
    </div>
  )
}
