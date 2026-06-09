const CHAIN_COLORS: Record<string, string> = {
  ethereum: 'bg-blue-500/20 text-blue-400',
  base: 'bg-indigo-500/20 text-indigo-400',
  solana: 'bg-purple-500/20 text-purple-400',
  bsc: 'bg-yellow-500/20 text-yellow-400',
  arbitrum: 'bg-cyan-500/20 text-cyan-400',
  polygon: 'bg-violet-500/20 text-violet-400',
  avalanche: 'bg-red-500/20 text-red-400',
}

const CHAIN_LABELS: Record<string, string> = {
  ethereum: 'ETH',
  base: 'Base',
  solana: 'SOL',
  bsc: 'BSC',
  arbitrum: 'ARB',
  polygon: 'MATIC',
  avalanche: 'AVAX',
}

interface ChainBadgeProps {
  chain: string
  compact?: boolean
}

export function ChainBadge({ chain, compact = false }: ChainBadgeProps) {
  const key = chain.toLowerCase()
  const colors = CHAIN_COLORS[key] || 'bg-dark-700 text-dark-300'
  const label = CHAIN_LABELS[key] || chain.toUpperCase().slice(0, 4)

  return (
    <span
      className={`inline-flex items-center rounded font-medium ${colors} ${
        compact ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5'
      }`}
    >
      {label}
    </span>
  )
}
