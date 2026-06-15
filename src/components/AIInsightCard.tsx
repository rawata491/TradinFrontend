import { Brain, TrendingUp, TrendingDown, Minus, AlertCircle } from 'lucide-react'
import { SentimentBadge } from './SentimentBadge'
import { MarketDrivers } from './MarketDrivers'
import type { AIInsight } from '@/types'

interface AIInsightCardProps {
  insight: AIInsight | null
  loading?: boolean
  error?: string | null
}

function CardSkeleton() {
  return (
    <div className="card p-5 space-y-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-dark-700" />
        <div className="space-y-1.5">
          <div className="h-4 w-32 rounded bg-dark-700" />
          <div className="h-3 w-20 rounded bg-dark-700" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3.5 w-full rounded bg-dark-700" />
        <div className="h-3.5 w-4/5 rounded bg-dark-700" />
        <div className="h-3.5 w-2/3 rounded bg-dark-700" />
      </div>
      <div className="grid grid-cols-2 gap-4 pt-1">
        <div className="space-y-2">
          <div className="h-3 w-20 rounded bg-dark-700" />
          <div className="h-3 w-full rounded bg-dark-700" />
          <div className="h-3 w-4/5 rounded bg-dark-700" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-20 rounded bg-dark-700" />
          <div className="h-3 w-full rounded bg-dark-700" />
          <div className="h-3 w-4/5 rounded bg-dark-700" />
        </div>
      </div>
    </div>
  )
}

function SentimentMeter({ sentiment, confidence }: { sentiment: string; confidence: number }) {
  const color =
    sentiment === 'bullish'
      ? 'bg-emerald-500'
      : sentiment === 'bearish'
      ? 'bg-red-500'
      : 'bg-yellow-500'

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs text-dark-400">
        <span>Confidence</span>
        <span className="font-medium text-dark-200">{confidence}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-dark-700 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${confidence}%` }}
        />
      </div>
    </div>
  )
}

export function AIInsightCard({ insight, loading = false, error = null }: AIInsightCardProps) {
  if (loading) return <CardSkeleton />

  if (error || !insight) {
    return (
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-lg bg-dark-800">
            <Brain className="h-4 w-4 text-dark-400" />
          </div>
          <h3 className="text-sm font-semibold text-dark-50">AI Market Insights</h3>
        </div>
        <div className="flex items-start gap-2 text-sm text-dark-400 bg-dark-800/60 rounded-lg p-3">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>
            {error ?? 'AI insights are not yet available for this asset. Check back after the next scheduled analysis.'}
          </span>
        </div>
      </div>
    )
  }

  const SentimentIcon =
    insight.sentiment === 'bullish'
      ? TrendingUp
      : insight.sentiment === 'bearish'
      ? TrendingDown
      : Minus

  return (
    <div className="card p-5 space-y-5">
      {insight.is_stale && (
        <p className="text-xs text-yellow-400/90 bg-yellow-500/10 rounded-lg px-3 py-2 mb-3">
          Cached or fallback analysis — configure OPENAI_API_KEY for live AI insights.
        </p>
      )}

      {/* Header row */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-brand-500/20">
            <Brain className="h-4 w-4 text-brand-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-dark-50 leading-tight">AI Market Insights</h3>
            {insight.articles_processed > 0 && (
              <p className="text-xs text-dark-500 mt-0.5">
                {insight.articles_processed} articles analysed
              </p>
            )}
          </div>
        </div>
        <SentimentBadge sentiment={insight.sentiment} confidence={insight.confidence} size="md" />
      </div>

      {/* Confidence meter */}
      <SentimentMeter sentiment={insight.sentiment} confidence={insight.confidence} />

      {/* Summary text */}
      {insight.summary && (
        <div className="bg-dark-800/40 rounded-lg p-3.5 border border-dark-700/50">
          <div className="flex items-center gap-1.5 mb-2">
            <SentimentIcon className="h-3.5 w-3.5 text-brand-400" />
            <span className="text-xs font-medium text-brand-400 uppercase tracking-wider">
              Analysis
            </span>
          </div>
          <p className="text-sm text-dark-200 leading-relaxed">{insight.summary}</p>
        </div>
      )}

      {/* Drivers */}
      <div>
        <h4 className="text-xs text-dark-400 uppercase tracking-wider font-medium mb-3">
          Key Market Drivers
        </h4>
        <MarketDrivers
          positiveFactors={insight.positive_factors}
          negativeFactors={insight.negative_factors}
        />
      </div>

      {/* Market impact */}
      {insight.market_impact && (
        <div className="border-l-2 border-yellow-500/40 pl-3 py-0.5">
          <p className="text-xs font-medium text-yellow-400 mb-1 uppercase tracking-wider">
            Impact Assessment
          </p>
          <p className="text-sm text-dark-300 leading-relaxed">{insight.market_impact}</p>
        </div>
      )}

      <p className="text-xs text-dark-600 border-t border-dark-800 pt-3">
        AI-generated. Not financial advice.
      </p>
    </div>
  )
}
