import { useRef, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Star } from 'lucide-react'
import { CoinAvatar } from './CoinAvatar'
import { useWatchlistStore } from '@/store/useWatchlistStore'
import { useMarketStore } from '@/store/useMarketStore'
import type { Product } from '@/types'
import {
  formatPrice,
  formatChange,
  formatVolume,
  getCoinSymbol,
} from '@/utils/formatters'

interface CoinCardProps {
  product: Product
}

export function CoinCard({ product }: CoinCardProps) {
  const isWatched = useWatchlistStore((s) => s.isWatched(product.product_id))
  const toggleItem = useWatchlistStore((s) => s.toggleItem)
  const liveTicker = useMarketStore((s) => s.tickers[product.product_id])

  const livePrice = liveTicker?.price ?? product.price
  const liveChange =
    liveTicker?.price_percent_chg_24_h ?? product.price_percentage_change_24h
  const liveVolume = liveTicker?.volume_24_h ?? product.volume_24h

  const symbol = getCoinSymbol(product.product_id)
  const isPositive = parseFloat(liveChange) >= 0

  // Flash animation on price change
  const prevPriceRef = useRef(livePrice)
  const [flash, setFlash] = useState<'up' | 'down' | null>(null)

  useEffect(() => {
    if (prevPriceRef.current !== livePrice) {
      const direction =
        parseFloat(livePrice) > parseFloat(prevPriceRef.current) ? 'up' : 'down'
      setFlash(direction)
      prevPriceRef.current = livePrice
      const timer = setTimeout(() => setFlash(null), 700)
      return () => clearTimeout(timer)
    }
  }, [livePrice])

  return (
    <div
      className={`card-hover p-4 group cursor-pointer relative overflow-hidden transition-all duration-200 ${
        flash === 'up' ? 'price-flash-up' : flash === 'down' ? 'price-flash-down' : ''
      }`}
    >
      <Link to={`/coin/${product.product_id}`} className="block">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <CoinAvatar symbol={symbol} size="md" />
            <div>
              <p className="font-semibold text-dark-50 text-sm">{symbol}</p>
              <p className="text-xs text-dark-400 truncate max-w-[100px]">
                {product.base_name || symbol}
              </p>
            </div>
          </div>
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              isPositive ? 'badge-positive' : 'badge-negative'
            }`}
          >
            {formatChange(liveChange)}
          </span>
        </div>

        {/* Price */}
        <div className="mb-2">
          <p className="text-xl font-bold font-mono text-dark-50">{formatPrice(livePrice)}</p>
        </div>

        {/* Volume */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-dark-500">Vol 24h</p>
            <p className="text-xs text-dark-300 font-medium">{formatVolume(liveVolume)}</p>
          </div>
        </div>
      </Link>

      {/* Watchlist toggle */}
      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          toggleItem(product.product_id)
        }}
        className={`absolute top-3 right-3 p-1.5 rounded-lg transition-all duration-150 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 ${
          isWatched
            ? 'text-yellow-400 bg-yellow-400/10 hover:bg-yellow-400/20'
            : 'text-dark-500 hover:text-yellow-400 hover:bg-dark-700'
        }`}
        title={isWatched ? 'Remove from watchlist' : 'Add to watchlist'}
        aria-label={isWatched ? 'Remove from watchlist' : 'Add to watchlist'}
      >
        <Star className={`h-3.5 w-3.5 ${isWatched ? 'fill-yellow-400' : ''}`} />
      </button>
    </div>
  )
}
