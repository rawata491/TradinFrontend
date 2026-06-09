import { TrendingUp } from 'lucide-react'
import { ChainBadge } from './ChainBadge'
import type { TrendingToken } from '@/types/tokenSearch'

interface TrendingTokensProps {
  tokens: TrendingToken[]
  isLoading?: boolean
  onSelect?: (token: TrendingToken) => void
  compact?: boolean
}

export function TrendingTokens({
  tokens,
  isLoading = false,
  onSelect,
  compact = false,
}: TrendingTokensProps) {
  if (isLoading) {
    return (
      <div className="px-3 py-4 text-xs text-dark-500 animate-pulse">Loading trending…</div>
    )
  }

  if (tokens.length === 0) {
    return null
  }

  return (
    <div>
      <div className="px-3 py-2 border-b border-dark-800 flex items-center gap-1.5">
        <TrendingUp className="h-3.5 w-3.5 text-brand-400" />
        <span className="text-[10px] uppercase tracking-wide text-dark-500 font-medium">
          Trending
        </span>
      </div>
      <div className={`flex ${compact ? 'flex-wrap gap-1.5 p-2' : 'flex-col divide-y divide-dark-800/50'}`}>
        {tokens.slice(0, compact ? 8 : 10).map((token) =>
          compact ? (
            <button
              key={`${token.chain}:${token.contract_address}`}
              type="button"
              onClick={() => onSelect?.(token)}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-dark-800/60 hover:bg-dark-800 text-xs transition-colors"
            >
              <span className="font-semibold text-dark-200">{token.symbol}</span>
              <ChainBadge chain={token.chain} compact />
            </button>
          ) : (
            <button
              key={`${token.chain}:${token.contract_address}`}
              type="button"
              onClick={() => onSelect?.(token)}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-dark-800/60 text-left transition-colors"
            >
              {token.logo_url ? (
                <img src={token.logo_url} alt="" className="w-6 h-6 rounded-full bg-dark-800" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-dark-800 flex items-center justify-center text-[10px] font-bold text-dark-400">
                  {token.symbol.slice(0, 2)}
                </div>
              )}
              <span className="text-sm font-medium text-dark-100">{token.symbol}</span>
              <ChainBadge chain={token.chain} compact />
              {token.search_count > 0 && (
                <span className="ml-auto text-[10px] text-dark-600">{token.search_count} searches</span>
              )}
            </button>
          ),
        )}
      </div>
    </div>
  )
}
