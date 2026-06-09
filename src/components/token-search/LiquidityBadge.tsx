interface LiquidityBadgeProps {
  liquidity: number
  compact?: boolean
}

export function LiquidityBadge({ liquidity, compact = false }: LiquidityBadgeProps) {
  let label = 'Low Liq'
  let colors = 'bg-negative/10 text-negative'

  if (liquidity >= 1_000_000) {
    label = 'High Liq'
    colors = 'bg-positive/10 text-positive'
  } else if (liquidity >= 100_000) {
    label = 'Med Liq'
    colors = 'bg-yellow-500/10 text-yellow-400'
  } else if (liquidity >= 10_000) {
    label = 'Low Liq'
    colors = 'bg-orange-500/10 text-orange-400'
  } else if (liquidity === 0) {
    label = 'No Liq'
    colors = 'bg-dark-700 text-dark-500'
  }

  if (!compact && liquidity > 0) {
    const formatted =
      liquidity >= 1e6
        ? `$${(liquidity / 1e6).toFixed(1)}M`
        : liquidity >= 1e3
          ? `$${(liquidity / 1e3).toFixed(0)}K`
          : `$${liquidity.toFixed(0)}`
    label = formatted
  }

  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${colors}`}>{label}</span>
  )
}
