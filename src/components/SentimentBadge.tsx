import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { SentimentType } from '@/types'

interface SentimentBadgeProps {
  sentiment: SentimentType
  confidence?: number
  size?: 'sm' | 'md' | 'lg'
  showConfidence?: boolean
}

const CONFIG = {
  bullish: {
    label: 'Bullish',
    icon: TrendingUp,
    classes: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    dot: 'bg-emerald-400',
  },
  bearish: {
    label: 'Bearish',
    icon: TrendingDown,
    classes: 'bg-red-500/15 text-red-400 border border-red-500/30',
    dot: 'bg-red-400',
  },
  neutral: {
    label: 'Neutral',
    icon: Minus,
    classes: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30',
    dot: 'bg-yellow-400',
  },
}

const SIZE = {
  sm: { badge: 'px-2 py-0.5 text-xs gap-1', icon: 'h-3 w-3' },
  md: { badge: 'px-2.5 py-1 text-xs gap-1.5', icon: 'h-3.5 w-3.5' },
  lg: { badge: 'px-3 py-1.5 text-sm gap-2', icon: 'h-4 w-4' },
}

export function SentimentBadge({
  sentiment,
  confidence,
  size = 'md',
  showConfidence = true,
}: SentimentBadgeProps) {
  const cfg = CONFIG[sentiment] ?? CONFIG.neutral
  const sz = SIZE[size]
  const Icon = cfg.icon

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full ${cfg.classes} ${sz.badge}`}
    >
      <Icon className={sz.icon} />
      {cfg.label}
      {showConfidence && confidence !== undefined && confidence > 0 && (
        <span className="opacity-70 font-normal ml-0.5">{confidence}%</span>
      )}
    </span>
  )
}
