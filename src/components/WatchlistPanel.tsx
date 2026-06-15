import { Link } from 'react-router-dom'
import { Star, Trash2, TrendingUp, TrendingDown } from 'lucide-react'
import { CoinAvatar } from './CoinAvatar'
import { useWatchlist } from '@/hooks/useWatchlist'
import { useMarketStore } from '@/store/useMarketStore'
import {
  formatPrice,
  formatChange,
  getChangeColor,
  getCoinSymbol,
} from '@/utils/formatters'

export function WatchlistPanel() {
  const { watchlistItems, toggleItem } = useWatchlist()
  const products = useMarketStore((s) => s.products)
  const tickers = useMarketStore((s) => s.tickers)

  const watchlistData = watchlistItems.map((id) => {
    const product = products.find((p) => p.product_id === id)
    const ticker = tickers[id]
    return { id, product, ticker }
  })

  if (watchlistItems.length === 0) {
    return (
      <div className="card p-6 text-center">
        <div className="p-3 bg-dark-800 rounded-full inline-flex mb-3">
          <Star className="h-5 w-5 text-dark-400" />
        </div>
        <p className="text-sm text-dark-300 font-medium mb-1">Watchlist is empty</p>
        <p className="text-xs text-dark-500">
          Click the star icon on any coin to add it here
        </p>
      </div>
    )
  }

  return (
    <div className="card overflow-hidden">
      <div className="px-4 py-3 border-b border-dark-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
          <span className="text-sm font-semibold text-dark-50">Watchlist</span>
          <span className="bg-dark-800 text-dark-300 text-xs px-2 py-0.5 rounded-full">
            {watchlistItems.length}
          </span>
        </div>
      </div>

      <ul className="divide-y divide-dark-800/50">
        {watchlistData.map(({ id, product, ticker }) => {
          const symbol = getCoinSymbol(id)
          const price = ticker?.price ?? product?.price ?? '—'
          const change = ticker?.price_percent_chg_24_h ?? product?.price_percentage_change_24h ?? '0'

          return (
            <li
              key={id}
              className="group flex items-center gap-3 px-4 py-3 hover:bg-dark-800/30 transition-colors"
            >
              <Link
                to={`/coin/${id}`}
                className="flex items-center gap-3 flex-1 min-w-0"
              >
                <CoinAvatar symbol={symbol} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-dark-50">{symbol}</p>
                  {product && (
                    <p className="text-xs text-dark-400 truncate">{product.base_name}</p>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-mono font-semibold text-dark-50">
                    {formatPrice(price)}
                  </p>
                  <p className={`text-xs flex items-center justify-end gap-0.5 ${getChangeColor(change)}`}>
                    {parseFloat(change) >= 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {formatChange(change)}
                  </p>
                </div>
              </Link>
              <button
                onClick={() => toggleItem(id)}
                className="p-1.5 text-dark-600 hover:text-negative rounded-lg hover:bg-negative/10 
                           opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-150"
                title="Remove from watchlist"
                aria-label="Remove from watchlist"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
