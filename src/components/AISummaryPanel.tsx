import { Sparkles, RefreshCw, Clock, AlertCircle } from 'lucide-react'
import { SentimentBadge } from './SentimentBadge'
import type { AIInsight } from '@/types'

interface AISummaryPanelProps {
  insight: AIInsight | null
  loading?: boolean
  error?: string | null
  onRefresh?: () => void
}

function SummarySkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="h-4 w-2/3 rounded bg-dark-700" />
      <div className="h-4 w-full rounded bg-dark-700" />
      <div className="h-4 w-5/6 rounded bg-dark-700" />
      <div className="h-4 w-3/4 rounded bg-dark-700" />
    </div>
  )
}

function timeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export function AISummaryPanel({
  insight,
  loading = false,
  error = null,
  onRefresh,
}: AISummaryPanelProps) {
  return (
    <div className="card p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-brand-500/20">
            <Sparkles className="h-4 w-4 text-brand-400" />
          </div>
          <h3 className="text-sm font-semibold text-dark-50">AI Market Summary</h3>
          {insight?.is_stale && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-500/15 text-yellow-400 border border-yellow-500/30">
              Stale
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {insight?.last_updated && (
            <span className="flex items-center gap-1 text-xs text-dark-500">
              <Clock className="h-3 w-3" />
              {timeAgo(insight.last_updated)}
            </span>
          )}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={loading}
              className="p-1 rounded text-dark-400 hover:text-dark-100 transition-colors disabled:opacity-50"
              title="Refresh AI analysis"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {error ? (
        <div className="flex items-start gap-2 text-sm text-red-400 bg-red-500/10 rounded-lg p-3">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>AI analysis unavailable. Showing cached data if available.</span>
        </div>
      ) : loading ? (
        <SummarySkeleton />
      ) : insight ? (
        <>
          <div className="flex items-center gap-3">
            <SentimentBadge
              sentiment={insight.sentiment}
              confidence={insight.confidence}
              size="lg"
            />
            {insight.articles_processed > 0 && (
              <span className="text-xs text-dark-500">
                Based on {insight.articles_processed} article
                {insight.articles_processed !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {insight.summary && (
            <p className="text-sm text-dark-200 leading-relaxed">{insight.summary}</p>
          )}

          {insight.market_impact && (
            <div className="border-l-2 border-brand-500/40 pl-3">
              <p className="text-xs font-medium text-brand-400 mb-1">Market Impact</p>
              <p className="text-sm text-dark-300 leading-relaxed">{insight.market_impact}</p>
            </div>
          )}

          {insight.key_events.length > 0 && (
            <div>
              <p className="text-xs font-medium text-dark-400 uppercase tracking-wider mb-2">
                Key Events
              </p>
              <ul className="space-y-1">
                {insight.key_events.slice(0, 3).map((evt, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-dark-300">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-brand-500 flex-shrink-0" />
                    {evt}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      ) : (
        <p className="text-sm text-dark-400 italic">
          AI analysis will appear here after news data is collected.
        </p>
      )}

      {/* Disclaimer */}
      <p className="text-xs text-dark-600 border-t border-dark-800 pt-3">
        AI-generated market intelligence. Not financial advice.
      </p>
    </div>
  )
}
