import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, Coins } from 'lucide-react'
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback'
import { useSearch } from '@/hooks/useCoins'
import { CoinAvatar } from '@/components/CoinAvatar'
import { formatPrice, formatChange, getChangeColor, getCoinSymbol } from '@/utils/formatters'
import type { Product } from '@/types'

export function TokenSearchBar() {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const { results, isSearching, search } = useSearch()

  const debouncedSearch = useDebouncedCallback((q: string) => {
    if (q.trim()) search(q)
  }, 300)

  const handleInput = useCallback(
    (value: string) => {
      setQuery(value)
      setActiveIndex(-1)
      setIsOpen(true)

      if (value.trim()) {
        debouncedSearch(value)
      }
    },
    [debouncedSearch],
  )

  const navigateToProduct = (productId: string) => {
    setQuery('')
    setIsOpen(false)
    setActiveIndex(-1)
    navigate(`/coin/${productId}`)
  }

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

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, -1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (activeIndex >= 0 && results[activeIndex]) {
        navigateToProduct(results[activeIndex].product_id)
      } else if (query.trim() && results[0]) {
        navigateToProduct(results[0].product_id)
      } else if (query.trim()) {
        search(query)
      }
    }
  }

  const showDropdown = isOpen && query.length > 0

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      <div className="relative flex items-center">
        <button
          type="button"
          onClick={() => query.trim() && search(query)}
          disabled={!query.trim()}
          aria-label="Search markets"
          className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-dark-400 hover:text-brand-400 hover:bg-dark-800 disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          <Search className="h-4 w-4" />
        </button>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search BTC, ETH, SOL… (press /)"
          className="w-full bg-dark-900 border border-dark-700 rounded-xl pl-11 pr-10 py-2.5
                     text-sm text-dark-50 placeholder-dark-500
                     focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500
                     transition-colors duration-150"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('')
              setIsOpen(false)
              setActiveIndex(-1)
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {showDropdown && (
        <div className="absolute top-full mt-1.5 w-full min-w-[360px] bg-dark-900 border border-dark-700 rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in">
          <div className="px-3 py-2 border-b border-dark-800">
            <span className="text-[10px] uppercase tracking-wide text-dark-500 font-medium flex items-center gap-1">
              <Coins className="h-3 w-3" /> CEX Markets
            </span>
          </div>

          {isSearching && results.length === 0 ? (
            <p className="px-4 py-6 text-sm text-dark-500 text-center">Searching…</p>
          ) : results.length === 0 ? (
            <p className="px-4 py-6 text-sm text-dark-500 text-center">No markets found</p>
          ) : (
            <ul className="max-h-72 overflow-y-auto divide-y divide-dark-800/50">
              {results.slice(0, 10).map((product: Product, index) => {
                const symbol = getCoinSymbol(product.product_id)
                const isActive = index === activeIndex
                return (
                  <li key={product.product_id}>
                    <button
                      type="button"
                      onClick={() => navigateToProduct(product.product_id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 transition-colors text-left ${
                        isActive ? 'bg-dark-800' : 'hover:bg-dark-800'
                      }`}
                    >
                      <CoinAvatar symbol={symbol} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-dark-50">{symbol}</p>
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
                )
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
