import { useEffect, useRef, useState } from 'react'
import { Search, Loader2 } from 'lucide-react'
import { productApi } from '@/services/api'
import { CoinAvatar } from '@/components/CoinAvatar'
import { getCoinSymbol } from '@/utils/formatters'
import type { Product } from '@/types'
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback'

interface MarketPickerProps {
  value: string
  onChange: (productId: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  recentKey?: string
}

function loadRecent(key: string): string[] {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

function saveRecent(key: string, productId: string) {
  try {
    const list = [productId, ...loadRecent(key).filter((id) => id !== productId)].slice(0, 8)
    localStorage.setItem(key, JSON.stringify(list))
  } catch {
    /* ignore */
  }
}

export function MarketPicker({
  value,
  onChange,
  placeholder = 'Search markets (e.g. BTC)',
  disabled = false,
  className = '',
  recentKey = 'tradin.recentMarkets',
}: MarketPickerProps) {
  const [query, setQuery] = useState(value)
  const [open, setOpen] = useState(false)
  const [results, setResults] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setQuery(value)
  }, [value])

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const search = useDebouncedCallback(async (q: string) => {
    if (q.trim().length < 1) {
      setResults([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const res = await productApi.search(q.trim())
      setResults(res.products.slice(0, 12))
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, 250)

  const handleInput = (next: string) => {
    setQuery(next)
    setOpen(true)
    void search(next)
  }

  const select = (product: Product) => {
    onChange(product.product_id)
    setQuery(product.product_id)
    saveRecent(recentKey, product.product_id)
    setOpen(false)
  }

  const recent = loadRecent(recentKey)
  const showRecent = open && !query.trim() && recent.length > 0

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-500" />
        <input
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          onFocus={() => setOpen(true)}
          disabled={disabled}
          placeholder={placeholder}
          className="w-full bg-dark-950 border border-dark-700 rounded-lg pl-9 pr-9 py-2 text-sm font-mono focus:border-brand-500 outline-none"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-dark-500" />
        )}
      </div>
      {open && (showRecent || results.length > 0 || (query.trim() && !loading)) && (
        <ul className="absolute z-30 mt-1 w-full max-h-64 overflow-y-auto rounded-lg border border-dark-700 bg-dark-950 shadow-xl">
          {showRecent && (
            <>
              <li className="px-3 py-1.5 text-[10px] uppercase text-dark-500 tracking-wide">Recent</li>
              {recent.map((id) => (
                <li key={`r-${id}`}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(id)
                      setQuery(id)
                      setOpen(false)
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-dark-800"
                  >
                    <CoinAvatar symbol={getCoinSymbol(id)} size="sm" />
                    <span className="font-mono text-dark-100">{id}</span>
                  </button>
                </li>
              ))}
            </>
          )}
          {results.map((p) => (
            <li key={p.product_id}>
              <button
                type="button"
                onClick={() => select(p)}
                className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-dark-800"
              >
                <CoinAvatar symbol={getCoinSymbol(p.product_id)} size="sm" />
                <div className="min-w-0">
                  <p className="font-mono text-dark-100">{p.product_id}</p>
                  <p className="text-[10px] text-dark-500 truncate">{p.base_name}</p>
                </div>
              </button>
            </li>
          ))}
          {!loading && query.trim() && results.length === 0 && !showRecent && (
            <li className="px-3 py-3 text-xs text-dark-500">No markets found</li>
          )}
        </ul>
      )}
    </div>
  )
}
