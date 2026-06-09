import { useMarketStore } from '@/store/useMarketStore'
import { useWatchlistStore } from '@/store/useWatchlistStore'
import type { Product } from '@/types'

export function useWatchlist() {
  const watchlistItems = useWatchlistStore((s) => s.items)
  const addItem = useWatchlistStore((s) => s.addItem)
  const removeItem = useWatchlistStore((s) => s.removeItem)
  const toggleItem = useWatchlistStore((s) => s.toggleItem)
  const isWatched = useWatchlistStore((s) => s.isWatched)

  const products = useMarketStore((s) => s.products)
  const tickers = useMarketStore((s) => s.tickers)

  const watchlistProducts: Product[] = watchlistItems
    .map((id) => {
      const product = products.find((p) => p.product_id === id)
      if (!product) return null
      const ticker = tickers[id]
      if (ticker) {
        return {
          ...product,
          price: ticker.price || product.price,
          price_percentage_change_24h:
            ticker.price_percent_chg_24_h || product.price_percentage_change_24h,
          volume_24h: ticker.volume_24_h || product.volume_24h,
        }
      }
      return product
    })
    .filter(Boolean) as Product[]

  return {
    watchlistItems,
    watchlistProducts,
    addItem,
    removeItem,
    toggleItem,
    isWatched,
    count: watchlistItems.length,
  }
}
