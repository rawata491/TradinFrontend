import { TokenResultCard } from './TokenResultCard'
import type { DiscoveredToken } from '@/types/tokenSearch'

interface SearchSuggestionsProps {
  results: DiscoveredToken[]
  activeIndex: number
  onSelect: (token: DiscoveredToken, index: number) => void
  isSearching: boolean
  query: string
  tookMs?: number
}

export function SearchSuggestions({
  results,
  activeIndex,
  onSelect,
  isSearching,
  query,
  tookMs,
}: SearchSuggestionsProps) {
  if (isSearching) {
    return (
      <div className="px-4 py-8 text-center text-dark-400 text-sm animate-pulse">
        Discovering tokens…
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-dark-400 text-sm">
        No DEX tokens found for &ldquo;{query}&rdquo;
      </div>
    )
  }

  return (
    <div>
      <div className="px-3 py-2 border-b border-dark-800 flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-wide text-dark-500 font-medium">
          On-Chain Tokens
        </span>
        {tookMs !== undefined && tookMs > 0 && (
          <span className="text-[10px] text-dark-600">{tookMs.toFixed(0)}ms</span>
        )}
      </div>
      <ul className="max-h-80 overflow-y-auto divide-y divide-dark-800/50">
        {results.map((token, i) => (
          <li key={`${token.chain}:${token.contract_address}`}>
            <TokenResultCard
              token={token}
              active={i === activeIndex}
              onClick={() => onSelect(token, i)}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}
