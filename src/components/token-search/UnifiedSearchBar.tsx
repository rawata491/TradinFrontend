import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, Coins, Layers } from 'lucide-react'
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback'
import { useSearch } from '@/hooks/useCoins'
import { useTokenSearchStore } from '@/store/useTokenSearchStore'
import { CoinAvatar } from '@/components/CoinAvatar'
import { SearchSuggestions } from '@/components/token-search/SearchSuggestions'
import { TrendingTokens } from '@/components/token-search/TrendingTokens'
import { RecentSearches } from '@/components/token-search/RecentSearches'
import { formatPrice, formatChange, getChangeColor, getCoinSymbol } from '@/utils/formatters'
import type { Product } from '@/types'
import type { DiscoveredToken } from '@/types/tokenSearch'

type SearchMode = 'all' | 'cex' | 'dex'

export function UnifiedSearchBar() {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [mode, setMode] = useState<SearchMode>('all')

  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const { results: cexResults, isSearching: cexSearching, search: cexSearch } = useSearch()
  const {
    results: dexResults,
    trending,
    recentLocal,
    isSearching: dexSearching,
    isLoadingTrending,
    search: dexSearch,
    fetchTrending,
    selectToken,
    lastTookMs,
  } = useTokenSearchStore()

  const debouncedCex = useDebouncedCallback((q: string) => cexSearch(q), 300)
  const debouncedDex = useDebouncedCallback((q: string) => dexSearch(q), 350)

  const handleInput = useCallback(
    (value: string) => {
      setQuery(value)
      setActiveIndex(-1)
      setIsOpen(true)
      if (value.trim()) {
        if (mode !== 'dex') debouncedCex(value)
        if (mode !== 'cex') debouncedDex(value)
      }
    },
    [debouncedCex, debouncedDex, mode],
  )

  useEffect(() => {
    if (isOpen && !query) void fetchTrending()
  }, [isOpen, query, fetchTrending])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault()
        inputRef.current?.focus()
      }
      if (e.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const navigateToProduct = (productId: string) => {
    setQuery('')
    setIsOpen(false)
    navigate(`/coin/${productId}`)
  }

  const navigateToToken = async (token: DiscoveredToken) => {
    await selectToken(token)
    setQuery('')
    setIsOpen(false)
    navigate(`/token/${token.chain}/${token.contract_address}`)
  }

  const showCex = mode === 'all' || mode === 'cex'
  const showDex = mode === 'all' || mode === 'dex'
  const showDropdown = isOpen && (query.length > 0 || trending.length > 0 || recentLocal.length > 0)

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      <div className="relative flex items-center">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-500 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder="Search CEX + DEX tokens… (press /)"
          className="w-full bg-dark-900 border border-dark-700 rounded-xl pl-10 pr-10 py-2.5 text-sm text-dark-50 placeholder-dark-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(''); setIsOpen(false) }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {showDropdown && (
        <div className="absolute top-full mt-1.5 w-full min-w-[400px] bg-dark-900 border border-dark-700 rounded-xl shadow-2xl overflow-hidden z-50">
          <div className="flex border-b border-dark-800">
            {(['all', 'cex', 'dex'] as SearchMode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`flex-1 py-2 text-xs font-medium uppercase tracking-wide ${
                  mode === m ? 'text-brand-400 bg-dark-800/50' : 'text-dark-500 hover:text-dark-300'
                }`}
              >
                {m === 'all' ? 'All' : m === 'cex' ? 'CEX' : 'DEX'}
              </button>
            ))}
          </div>

          {!query && (
            <>
              <RecentSearches
                items={recentLocal}
                onSelect={(r) => navigateToToken({
                  chain: r.chain,
                  contract_address: r.contract_address,
                  symbol: r.symbol,
                  token_name: r.symbol,
                  price_usd: 0,
                  liquidity: 0,
                  volume_24h: 0,
                  price_change_24h: 0,
                  dex: '',
                  pair_address: '',
                  logo_url: '',
                  verified: false,
                  rank_score: 0,
                  source: 'recent',
                  market_cap: 0,
                })}
              />
              <TrendingTokens
                tokens={trending}
                isLoading={isLoadingTrending}
                onSelect={(token) => navigateToToken({
                  chain: token.chain,
                  contract_address: token.contract_address,
                  symbol: token.symbol,
                  token_name: token.token_name,
                  price_usd: 0,
                  liquidity: token.liquidity,
                  volume_24h: token.volume_24h,
                  price_change_24h: 0,
                  dex: token.dex,
                  pair_address: '',
                  logo_url: token.logo_url,
                  verified: token.verified,
                  rank_score: token.trend_score,
                  source: 'trending',
                  market_cap: token.market_cap,
                })}
              />
            </>
          )}

          {query && showCex && (
            <div>
              <div className="px-3 py-2 border-b border-dark-800">
                <span className="text-[10px] uppercase tracking-wide text-dark-500 font-medium flex items-center gap-1">
                  <Coins className="h-3 w-3" /> CEX Markets
                </span>
              </div>
              {cexSearching && cexResults.length === 0 ? (
                <p className="px-4 py-4 text-sm text-dark-500 text-center">Searching CEX…</p>
              ) : cexResults.length === 0 ? (
                <p className="px-4 py-3 text-xs text-dark-500">No CEX markets</p>
              ) : (
                <ul className="max-h-48 overflow-y-auto divide-y divide-dark-800/50">
                  {cexResults.slice(0, 8).map((product: Product) => (
                    <li key={product.product_id}>
                      <button
                        type="button"
                        onClick={() => navigateToProduct(product.product_id)}
                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-dark-800 text-left"
                      >
                        <CoinAvatar symbol={getCoinSymbol(product.product_id)} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-dark-50">{getCoinSymbol(product.product_id)}</p>
                          <p className="text-xs text-dark-400 truncate">{product.display_name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-mono">{formatPrice(product.price)}</p>
                          <p className={`text-xs ${getChangeColor(product.price_percentage_change_24h)}`}>
                            {formatChange(product.price_percentage_change_24h)}
                          </p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {query && showDex && (
            <div>
              <div className="px-3 py-2 border-b border-dark-800 flex items-center gap-1">
                <Layers className="h-3 w-3 text-dark-500" />
                <span className="text-[10px] uppercase tracking-wide text-dark-500 font-medium">On-Chain</span>
              </div>
              <SearchSuggestions
                results={dexResults}
                activeIndex={activeIndex}
                onSelect={(token) => navigateToToken(token)}
                isSearching={dexSearching}
                query={query}
                tookMs={lastTookMs}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/** @deprecated Use UnifiedSearchBar */
export const TokenSearchBar = UnifiedSearchBar
