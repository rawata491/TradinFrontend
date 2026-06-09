import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Star, Trash2, TrendingUp, TrendingDown, Plus } from 'lucide-react'
import { CoinAvatar } from '@/components/CoinAvatar'
import { TokenSearchBar } from '@/components/token-search/TokenSearchBar'
import { useWatchlist } from '@/hooks/useWatchlist'
import { useWebSocket } from '@/hooks/useWebSocket'
import { useMarketStore } from '@/store/useMarketStore'
import { useWatchlistStore } from '@/store/useWatchlistStore'
import {
  formatPrice,
  formatChange,
  formatVolume,
  getChangeColor,
  getCoinSymbol,
} from '@/utils/formatters'

export function WatchlistPage() {
  const { watchlistItems, watchlistProducts, toggleItem } = useWatchlist()
  const { subscribe } = useWebSocket()
  const tickers = useMarketStore((s) => s.tickers)
  const clearAll = useWatchlistStore((s) => s.clearAll)

  useEffect(() => {
    if (watchlistItems.length > 0) {
      subscribe(watchlistItems)
    }
  }, [watchlistItems, subscribe])

  return (
    <div className="watchlist-layout max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Star className="h-6 w-6 text-yellow-400 fill-yellow-400" />
            <h1 className="text-2xl font-bold text-dark-50">Watchlist</h1>
            {watchlistItems.length > 0 && (
              <span className="bg-dark-800 text-dark-300 text-sm px-2.5 py-0.5 rounded-full">
                {watchlistItems.length}
              </span>
            )}
          </div>
          <p className="text-dark-400 text-sm">
            Track your favourite cryptocurrencies in real time
          </p>
        </div>
        {watchlistItems.length > 0 && (
          <button
            onClick={() => {
              if (window.confirm('Remove all coins from your watchlist?')) clearAll()
            }}
            className="flex items-center gap-1.5 text-sm text-dark-400 hover:text-negative transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Clear all
          </button>
        )}
      </div>

      {/* Search to add */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <Plus className="h-4 w-4 text-brand-400" />
          <span className="text-sm font-medium text-dark-300">Add a coin</span>
        </div>
        <TokenSearchBar />
      </div>

      {watchlistItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="p-5 bg-dark-900 rounded-full mb-5 border border-dark-800">
            <Star className="h-10 w-10 text-dark-600" />
          </div>
          <h2 className="text-lg font-semibold text-dark-50 mb-2">No coins watched yet</h2>
          <p className="text-dark-400 text-sm max-w-sm mb-6">
            Search for coins above or click the star icon on any coin in the dashboard
          </p>
          <Link to="/" className="btn-primary">
            Browse markets
          </Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 items-center px-4 py-3 border-b border-dark-800 text-xs font-medium text-dark-400 uppercase tracking-wider">
            <div className="w-8" />
            <span>Asset</span>
            <span className="text-right">Price</span>
            <span className="text-right">24h Change</span>
            <span className="text-right">Volume</span>
            <div className="w-8" />
          </div>

          <ul className="divide-y divide-dark-800/50">
            {watchlistItems.map((id) => {
              const product = watchlistProducts.find((p) => p.product_id === id)
              const ticker = tickers[id]
              const symbol = getCoinSymbol(id)
              const price = ticker?.price ?? product?.price ?? '—'
              const change =
                ticker?.price_percent_chg_24_h ??
                product?.price_percentage_change_24h ??
                '0'
              const volume = ticker?.volume_24_h ?? product?.volume_24h ?? '0'

              return (
                <li key={id} className="group hover:bg-dark-800/30 transition-colors">
                  <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 items-center px-4 py-3.5">
                    <div className="w-8" />

                    <Link
                      to={`/coin/${id}`}
                      className="flex items-center gap-3 min-w-0"
                    >
                      <CoinAvatar symbol={symbol} size="sm" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-dark-50">{symbol}</p>
                        <p className="text-xs text-dark-400 truncate">
                          {product?.base_name ?? id}
                        </p>
                      </div>
                    </Link>

                    <div className="text-right">
                      <span className="font-mono font-semibold text-dark-50">
                        {formatPrice(price)}
                      </span>
                    </div>

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

                    <div className="text-right min-w-[90px]">
                      <span className="text-sm text-dark-300">{formatVolume(volume)}</span>
                    </div>

                    <div className="w-8 flex justify-end">
                      <button
                        onClick={() => toggleItem(id)}
                        className="p-1.5 text-yellow-400 hover:text-negative rounded-lg hover:bg-negative/10 
                                   transition-all duration-150 opacity-0 group-hover:opacity-100"
                        title="Remove from watchlist"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
