import { Clock } from 'lucide-react'
import { ChainBadge } from './ChainBadge'
import type { RecentSearch } from '@/types/tokenSearch'

interface RecentSearchesProps {
  items: RecentSearch[]
  onSelect?: (item: RecentSearch) => void
}

export function RecentSearches({ items, onSelect }: RecentSearchesProps) {
  if (items.length === 0) return null

  return (
    <div>
      <div className="px-3 py-2 border-b border-dark-800 flex items-center gap-1.5">
        <Clock className="h-3.5 w-3.5 text-dark-500" />
        <span className="text-[10px] uppercase tracking-wide text-dark-500 font-medium">
          Recent
        </span>
      </div>
      <ul className="divide-y divide-dark-800/50">
        {items.slice(0, 8).map((item) => (
          <li key={`${item.chain}:${item.contract_address}:${item.searched_at}`}>
            <button
              type="button"
              onClick={() => onSelect?.(item)}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-dark-800/60 text-left transition-colors"
            >
              <span className="text-sm font-medium text-dark-200">{item.symbol || item.query}</span>
              {item.chain && <ChainBadge chain={item.chain} compact />}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
