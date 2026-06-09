import { create } from 'zustand'
import type { Product, TickerData } from '@/types'

interface MarketState {
  products: Product[]
  tickers: Record<string, TickerData>
  isLoading: boolean
  error: string | null
  lastUpdated: number | null

  setProducts: (products: Product[]) => void
  updateTicker: (ticker: TickerData) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  getProduct: (productId: string) => Product | undefined
  getLivePriceOrFallback: (productId: string) => string
}

export const useMarketStore = create<MarketState>((set, get) => ({
  products: [],
  tickers: {},
  isLoading: false,
  error: null,
  lastUpdated: null,

  setProducts: (products) =>
    set({ products, isLoading: false, error: null, lastUpdated: Date.now() }),

  updateTicker: (ticker) =>
    set((state) => ({
      tickers: { ...state.tickers, [ticker.product_id]: ticker },
      lastUpdated: Date.now(),
    })),

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),

  getProduct: (productId) =>
    get().products.find((p) => p.product_id === productId),

  getLivePriceOrFallback: (productId) => {
    const ticker = get().tickers[productId]
    if (ticker?.price) return ticker.price
    const product = get().products.find((p) => p.product_id === productId)
    return product?.price ?? '0'
  },
}))
