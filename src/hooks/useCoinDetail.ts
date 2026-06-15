import { useState, useEffect, useCallback, useRef } from 'react'
import { productApi, candleApi } from '@/services/api'
import { useMarketStore } from '@/store/useMarketStore'
import type { Product, Candle, MarketTradesResponse } from '@/types'
import type { Timeframe } from '@/types'

interface UseCoinDetailReturn {
  product: Product | null
  candles: Candle[]
  trades: MarketTradesResponse | null
  isLoadingProduct: boolean
  isLoadingCandles: boolean
  candleError: string | null
  error: string | null
  timeframe: Timeframe
  setTimeframe: (tf: Timeframe) => void
  refresh: () => void
}

export function useCoinDetail(productId: string): UseCoinDetailReturn {
  const normalizedId = productId.toUpperCase()
  const [product, setProduct] = useState<Product | null>(null)
  const [candles, setCandles] = useState<Candle[]>([])
  const [trades, setTrades] = useState<MarketTradesResponse | null>(null)
  const [isLoadingProduct, setIsLoadingProduct] = useState(true)
  const [isLoadingCandles, setIsLoadingCandles] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeframe, setTimeframe] = useState<Timeframe>('1D')

  // Throttle trade refreshes — at most once per 5 s regardless of tick rate
  const lastTradesFetchRef = useRef(0)

  const tickers = useMarketStore((s) => s.tickers)
  const storeProduct = useMarketStore((s) => s.getProduct(normalizedId))

  const fetchProduct = useCallback(async () => {
    if (!normalizedId) return
    setIsLoadingProduct(true)
    try {
      const data = await productApi.get(normalizedId)
      setProduct(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load product')
    } finally {
      setIsLoadingProduct(false)
    }
  }, [normalizedId])

  const [candleError, setCandleError] = useState<string | null>(null)

  const fetchCandles = useCallback(async () => {
    if (!normalizedId) return
    setIsLoadingCandles(true)
    setCandleError(null)
    try {
      const data = await candleApi.get(normalizedId, timeframe)
      setCandles(data.candles)
    } catch (err) {
      setCandles([])
      setCandleError(err instanceof Error ? err.message : 'Failed to load chart data')
    } finally {
      setIsLoadingCandles(false)
    }
  }, [normalizedId, timeframe])

  const fetchTrades = useCallback(async () => {
    if (!normalizedId) return
    try {
      const data = await productApi.getTrades(normalizedId, 10)
      setTrades(data)
    } catch {
      // Non-critical
    }
  }, [normalizedId])

  useEffect(() => {
    fetchProduct()
    fetchTrades()
  }, [fetchProduct, fetchTrades])

  useEffect(() => {
    fetchCandles()
  }, [fetchCandles])

  // Re-fetch trades whenever a live ticker update arrives for this product,
  // but throttled to at most once every 5 seconds.
  const liveTickerPrice = tickers[normalizedId]?.price
  useEffect(() => {
    if (!liveTickerPrice) return
    const now = Date.now()
    if (now - lastTradesFetchRef.current < 5000) return
    lastTradesFetchRef.current = now
    fetchTrades()
  }, [liveTickerPrice, fetchTrades])

  const liveTicker = tickers[normalizedId]

  // Merge live ticker data into the product
  const mergedProduct: Product | null = product
    ? {
        ...product,
        price: liveTicker?.price ?? product.price,
        price_percentage_change_24h:
          liveTicker?.price_percent_chg_24_h ?? product.price_percentage_change_24h,
        volume_24h: liveTicker?.volume_24_h ?? product.volume_24h,
      }
    : storeProduct ?? null

  return {
    product: mergedProduct,
    candles,
    trades,
    isLoadingProduct,
    isLoadingCandles,
    candleError,
    error,
    timeframe,
    setTimeframe,
    refresh: () => {
      fetchProduct()
      fetchCandles()
      fetchTrades()
    },
  }
}
