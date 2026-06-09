import { useState, useEffect, useCallback } from 'react'
import { productApi } from '@/services/api'
import { useMarketStore } from '@/store/useMarketStore'
import type { Product } from '@/types'

interface UseCoinsReturn {
  products: Product[]
  isLoading: boolean
  error: string | null
  refresh: () => void
}

export function useCoins(limit = 50): UseCoinsReturn {
  const setProducts = useMarketStore((s) => s.setProducts)
  const setLoading = useMarketStore((s) => s.setLoading)
  const setError = useMarketStore((s) => s.setError)
  const products = useMarketStore((s) => s.products)
  const isLoading = useMarketStore((s) => s.isLoading)
  const error = useMarketStore((s) => s.error)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const data = await productApi.list(limit)
      setProducts(data.products)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products')
    }
  }, [limit, setLoading, setProducts, setError])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  return { products, isLoading, error, refresh: fetchProducts }
}

interface UseSearchReturn {
  results: Product[]
  isSearching: boolean
  search: (query: string) => void
}

export function useSearch(): UseSearchReturn {
  const [results, setResults] = useState<Product[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const products = useMarketStore((s) => s.products)

  const search = useCallback(
    (query: string) => {
      if (!query.trim()) {
        setResults([])
        return
      }

      setIsSearching(true)

      // Show locally-loaded coins immediately while the full API search runs
      const q = query.toLowerCase()
      const local = products.filter(
        (p) =>
          p.product_id.toLowerCase().includes(q) ||
          p.base_name.toLowerCase().includes(q) ||
          p.base_currency_id.toLowerCase().includes(q) ||
          p.display_name.toLowerCase().includes(q)
      )
      if (local.length > 0) setResults(local)

      // Always call the API — it searches the full Gate.io catalog (no cap)
      productApi
        .search(query)
        .then((data) => {
          const apiIds = new Set(data.products.map((p: Product) => p.product_id))
          const merged = [
            ...data.products,
            ...local.filter((p) => !apiIds.has(p.product_id)),
          ]
          setResults(merged)
        })
        .catch(() => {
          if (local.length === 0) setResults([])
        })
        .finally(() => setIsSearching(false))
    },
    [products]
  )

  return { results, isSearching, search }
}
