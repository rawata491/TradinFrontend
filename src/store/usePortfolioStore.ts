import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { PORTFOLIO_STORAGE_KEY, normalizeProductId } from '@/utils/constants'

export interface PortfolioHolding {
  product_id: string
  quantity: number
  avg_cost: number
  added_at: string
}

interface PortfolioState {
  holdings: PortfolioHolding[]
  addHolding: (holding: Omit<PortfolioHolding, 'added_at'>) => void
  updateHolding: (productId: string, updates: Partial<PortfolioHolding>) => void
  removeHolding: (productId: string) => void
  clearAll: () => void
  setHoldings: (holdings: PortfolioHolding[]) => void
}

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set) => ({
      holdings: [],
      addHolding: (holding) =>
        set((s) => {
          const productId = normalizeProductId(holding.product_id)
          const existing = s.holdings.find((h) => h.product_id === productId)
          if (existing) {
            const totalQty = existing.quantity + holding.quantity
            const avgCost =
              (existing.avg_cost * existing.quantity + holding.avg_cost * holding.quantity) / totalQty
            return {
              holdings: s.holdings.map((h) =>
                h.product_id === productId
                  ? { ...h, quantity: totalQty, avg_cost: avgCost }
                  : h,
              ),
            }
          }
          return {
            holdings: [
              ...s.holdings,
              { ...holding, product_id: productId, added_at: new Date().toISOString() },
            ],
          }
        }),
      updateHolding: (productId, updates) => {
        const id = normalizeProductId(productId)
        set((s) => ({
          holdings: s.holdings.map((h) =>
            h.product_id === id ? { ...h, ...updates } : h,
          ),
        }))
      },
      removeHolding: (productId) => {
        const id = normalizeProductId(productId)
        set((s) => ({ holdings: s.holdings.filter((h) => h.product_id !== id) }))
      },
      clearAll: () => set({ holdings: [] }),
      setHoldings: (holdings) =>
        set({
          holdings: holdings.map((h) => ({
            ...h,
            product_id: normalizeProductId(h.product_id),
          })),
        }),
    }),
    { name: PORTFOLIO_STORAGE_KEY },
  ),
)
