interface GrowthBadgeProps {
  score: number
  compact?: boolean
}

function scoreColor(score: number): string {
  if (score >= 75) return 'bg-positive/20 text-positive border-positive/30'
  if (score >= 50) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
  return 'bg-dark-700 text-dark-300 border-dark-600'
}

export function GrowthBadge({ score, compact = false }: GrowthBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded border font-semibold ${scoreColor(score)} ${
        compact ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5'
      }`}
      title="Growth potential score (heuristic, not financial advice)"
    >
      {compact ? score : `Score ${score}`}
    </span>
  )
}
