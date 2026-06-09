import { useRef, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Star, TrendingUp, TrendingDown, ArrowUpDown } from 'lucide-react'
import { CoinAvatar } from './CoinAvatar'
import { useWatchlistStore } from '@/store/useWatchlistStore'
import { useMarketStore } from '@/store/useMarketStore'
import type { Product } from '@/types'
import {
  formatPrice,
  formatChange,
  formatVolume,
  getChangeColor,
  getCoinSymbol,
} from '@/utils/formatters'
import { SkeletonRow } from './Loader'

type SortKey = 'price' | 'change' | 'volume'
type SortDir = 'asc' | 'desc'

interface MarketTableProps {
  products: Product[]
  isLoading?: boolean
  showRank?: boolean
}

function PriceCell({ productId, fallbackPrice }: { productId: string; fallbackPrice: string }) {
  const liveTicker = useMarketStore((s) => s.tickers[productId])
  const price = liveTicker?.price ?? fallbackPrice
  const prevRef = useRef(price)
  const [flash, setFlash] = useState<'up' | 'down' | null>(null)

  useEffect(() => {
    if (prevRef.current !== price) {
      setFlash(parseFloat(price) > parseFloat(prevRef.current) ? 'up' : 'down')
      prevRef.current = price
      const t = setTimeout(() => setFlash(null), 700)
      return () => clearTimeout(t)
    }
  }, [price])

  return (
    <span
      className={`font-mono font-semibold transition-colors duration-300 ${
        flash === 'up'
          ? 'text-positive'
          : flash === 'down'
            ? 'text-negative'
            : 'text-dark-50'
      }`}
    >
      {formatPrice(price)}
    </span>
  )
}

export function MarketTable({ products, isLoading = false, showRank = true }: MarketTableProps) {
  const toggleItem = useWatchlistStore((s) => s.toggleItem)
  const isWatched = useWatchlistStore((s) => s.isWatched)
  const tickers = useMarketStore((s) => s.tickers)

  const [sortKey, setSortKey] = useState<SortKey>('volume')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const sorted = [...products].sort((a, b) => {
    const tickerA = tickers[a.product_id]
    const tickerB = tickers[b.product_id]

    let valA = 0
    let valB = 0
    if (sortKey === 'price') {
      valA = parseFloat(tickerA?.price ?? a.price)
      valB = parseFloat(tickerB?.price ?? b.price)
    } else if (sortKey === 'change') {
      valA = parseFloat(tickerA?.price_percent_chg_24_h ?? a.price_percentage_change_24h)
      valB = parseFloat(tickerB?.price_percent_chg_24_h ?? b.price_percentage_change_24h)
    } else {
      valA = parseFloat(tickerA?.volume_24_h ?? a.volume_24h)
      valB = parseFloat(tickerB?.volume_24_h ?? b.volume_24h)
    }
    return sortDir === 'desc' ? valB - valA : valA - valB
  })

  const SortButton = ({
    label,
    sortK,
  }: {
    label: string
    sortK: SortKey
  }) => (
    <button
      onClick={() => handleSort(sortK)}
      className="flex items-center gap-1 text-dark-400 hover:text-dark-50 transition-colors text-xs font-medium uppercase tracking-wider"
    >
      {label}
      <ArrowUpDown className="h-3 w-3" />
    </button>
  )

  if (isLoading) {
    return (
      <div className="card overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonRow key={i} />
        ))}
      </div>
    )
  }

  return (
    <div className="card overflow-hidden">
      {/* Table header */}
      <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 items-center px-4 py-3 border-b border-dark-800 text-xs font-medium text-dark-400 uppercase tracking-wider">
        <div className="w-8" />
        <span>Asset</span>
        <SortButton label="Price" sortK="price" />
        <SortButton label="24h Change" sortK="change" />
        <SortButton label="Volume" sortK="volume" />
        <div className="w-8" />
      </div>

      {/* Rows */}
      <ul className="divide-y divide-dark-800/50">
        {sorted.map((product, idx) => {
          const symbol = getCoinSymbol(product.product_id)
          const ticker = tickers[product.product_id]
          const change = ticker?.price_percent_chg_24_h ?? product.price_percentage_change_24h
          const volume = ticker?.volume_24_h ?? product.volume_24h
          const watched = isWatched(product.product_id)

          return (
            <li key={product.product_id} className="group hover:bg-dark-800/30 transition-colors">
              <Link
                to={`/coin/${product.product_id}`}
                className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 items-center px-4 py-3.5"
              >
                {/* Rank */}
                <span className="w-8 text-xs text-dark-500 font-mono text-right">
                  {showRank ? idx + 1 : ''}
                </span>

                {/* Asset */}
                <div className="flex items-center gap-3 min-w-0">
                  <CoinAvatar symbol={symbol} size="sm" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-dark-50">{symbol}</p>
                    <p className="text-xs text-dark-400 truncate">{product.base_name}</p>
                  </div>
                </div>

                {/* Price */}
                <div className="text-right">
                  <PriceCell
                    productId={product.product_id}
                    fallbackPrice={product.price}
                  />
                </div>

                {/* Change */}
                <div className="text-right min-w-[80px]">
                  <span
                    className={`flex items-center justify-end gap-1 text-sm font-medium ${getChangeColor(change)}`}
                  >
                    {parseFloat(change) >= 0 ? (
                      <TrendingUp className="h-3.5 w-3.5" />
                    ) : (
                      <TrendingDown className="h-3.5 w-3.5" />
                    )}
                    {formatChange(change)}
                  </span>
                </div>

                {/* Volume */}
                <div className="text-right min-w-[90px]">
                  <span className="text-sm text-dark-300">{formatVolume(volume)}</span>
                </div>

                {/* Watchlist */}
                <div className="w-8 flex justify-end">
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      toggleItem(product.product_id)
                    }}
                    className={`p-1.5 rounded-lg transition-all duration-150 opacity-0 group-hover:opacity-100 ${
                      watched
                        ? 'opacity-100 text-yellow-400'
                        : 'text-dark-600 hover:text-yellow-400'
                    }`}
                  >
                    <Star className={`h-3.5 w-3.5 ${watched ? 'fill-yellow-400' : ''}`} />
                  </button>
                </div>
              </Link>
            </li>
          )
        })}
      </ul>

      {sorted.length === 0 && (
        <div className="py-12 text-center text-dark-400 text-sm">No markets found</div>
      )}
    </div>
  )
}
