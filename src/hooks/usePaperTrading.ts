import { useCallback, useEffect, useMemo } from 'react'
import { paperTradingApi } from '@/services/paperTradingApi'
import { usePaperTradingStore } from '@/store/usePaperTradingStore'
import { useAuthStore } from '@/store/useAuthStore'
import { useMarketStore } from '@/store/useMarketStore'
import type { OpenPositionView, PaperSide, PaperSource } from '@/types/paperTrade'
import {
  buildPracticeSummary,
  computeUnrealizedPnl,
  tradeNotional,
  usdToQuantity,
} from '@/utils/paperTrading'

function livePrice(productId: string, tickers: Record<string, { price?: string }>): number | null {
  const p = parseFloat(tickers[productId]?.price ?? '')
  return Number.isFinite(p) && p > 0 ? p : null
}

export function usePaperTrading() {
  const token = useAuthStore((s) => s.token)
  const tickers = useMarketStore((s) => s.tickers)
  const trades = usePaperTradingStore((s) => s.trades)
  const stats = usePaperTradingStore((s) => s.stats)
  const startingBalance = usePaperTradingStore((s) => s.startingBalance)
  const defaultTradeUsd = usePaperTradingStore((s) => s.defaultTradeUsd)
  const feePct = usePaperTradingStore((s) => s.feePct)
  const isLoading = usePaperTradingStore((s) => s.isLoading)
  const error = usePaperTradingStore((s) => s.error)
  const setTrades = usePaperTradingStore((s) => s.setTrades)
  const upsertTrade = usePaperTradingStore((s) => s.upsertTrade)
  const removeTradeById = usePaperTradingStore((s) => s.removeTradeById)
  const setLoading = usePaperTradingStore((s) => s.setLoading)
  const setError = usePaperTradingStore((s) => s.setError)
  const setStartingBalance = usePaperTradingStore((s) => s.setStartingBalance)
  const setDefaultTradeUsd = usePaperTradingStore((s) => s.setDefaultTradeUsd)
  const setFeePct = usePaperTradingStore((s) => s.setFeePct)
  const reset = usePaperTradingStore((s) => s.reset)

  const refresh = useCallback(async () => {
    if (!token) {
      reset()
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await paperTradingApi.list('all')
      setTrades(data.items, data.stats)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load practice trades')
    } finally {
      setLoading(false)
    }
  }, [token, setTrades, setLoading, setError, reset])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const syncList = useCallback(async () => {
    const data = await paperTradingApi.list('all')
    setTrades(data.items, data.stats)
  }, [setTrades])

  const openTrade = useCallback(
    async (params: {
      product_id: string
      side: PaperSide
      entry_price: number
      quantity: number
      source?: PaperSource
      notes?: string
      order_type?: 'market' | 'limit'
      limit_price?: number
      stop_loss?: number
      take_profit?: number
      script_id?: number
    }) => {
      if (!token) throw new Error('Log in to practice trade')
      setError(null)
      const trade = await paperTradingApi.open({
        product_id: params.product_id.toUpperCase(),
        side: params.side,
        entry_price: params.entry_price,
        quantity: params.quantity,
        fee_pct: feePct,
        source: params.source ?? 'manual',
        notes: params.notes,
        order_type: params.order_type ?? 'market',
        limit_price: params.limit_price,
        stop_loss: params.stop_loss,
        take_profit: params.take_profit,
        script_id: params.script_id,
      })
      upsertTrade(trade)
      await syncList()
      return trade
    },
    [token, feePct, upsertTrade, syncList, setError],
  )

  const openTradeUsd = useCallback(
    async (params: {
      product_id: string
      side: PaperSide
      usd: number
      price: number
      source?: PaperSource
      notes?: string
      order_type?: 'market' | 'limit'
      limit_price?: number
      stop_loss?: number
      take_profit?: number
      script_id?: number
    }) => {
      const fillPrice =
        params.order_type === 'limit' && params.limit_price ? params.limit_price : params.price
      const quantity = usdToQuantity(params.usd, fillPrice)
      if (quantity <= 0) throw new Error('Invalid trade size or price')
      return openTrade({
        product_id: params.product_id,
        side: params.side,
        entry_price: params.price,
        quantity,
        source: params.source,
        notes: params.notes,
        order_type: params.order_type,
        limit_price: params.limit_price,
        stop_loss: params.stop_loss,
        take_profit: params.take_profit,
        script_id: params.script_id,
      })
    },
    [openTrade],
  )

  const closeTrade = useCallback(
    async (id: number, exitPrice: number) => {
      if (!token) throw new Error('Log in to practice trade')
      setError(null)
      const trade = await paperTradingApi.close(id, exitPrice)
      upsertTrade(trade)
      await syncList()
      return trade
    },
    [token, upsertTrade, syncList, setError],
  )

  const closeTradePartial = useCallback(
    async (id: number, exitPrice: number, pct: number) => {
      if (!token) throw new Error('Log in to practice trade')
      const existing = trades.find((t) => t.id === id)
      if (!existing) throw new Error('Trade not found')
      const qty = existing.quantity * (pct / 100)
      setError(null)
      const trade = await paperTradingApi.close(id, exitPrice, qty)
      await syncList()
      return trade
    },
    [token, trades, syncList, setError],
  )

  const deleteTrade = useCallback(
    async (id: number) => {
      await paperTradingApi.delete(id)
      removeTradeById(id)
      await syncList()
    },
    [removeTradeById, syncList],
  )

  const clearClosed = useCallback(async () => {
    await paperTradingApi.clearClosed()
    await syncList()
  }, [syncList])

  const openPositions = useMemo(
    () => trades.filter((t) => !t.closed_at && !t.is_pending),
    [trades],
  )
  const closedPositions = useMemo(
    () => trades.filter((t) => t.closed_at),
    [trades],
  )

  const openPositionViews: OpenPositionView[] = useMemo(
    () =>
      openPositions.map((trade) => {
        const currentPrice = livePrice(trade.product_id, tickers)
        const unrealized =
          currentPrice != null
            ? computeUnrealizedPnl(
                trade.side,
                trade.entry_price,
                currentPrice,
                trade.quantity,
                trade.fee_pct,
              )
            : null
        return {
          trade,
          currentPrice,
          notionalUsd: tradeNotional(trade),
          unrealized,
        }
      }),
    [openPositions, tickers],
  )

  const totalUnrealizedPnl = useMemo(
    () => openPositionViews.reduce((sum, p) => sum + (p.unrealized?.pnl ?? 0), 0),
    [openPositionViews],
  )

  const summary = useMemo(
    () => buildPracticeSummary(stats, totalUnrealizedPnl, startingBalance),
    [stats, totalUnrealizedPnl, startingBalance],
  )

  const openProductIds = useMemo(
    () => [...new Set(openPositions.map((t) => t.product_id))],
    [openPositions],
  )

  return {
    trades,
    openPositions,
    closedPositions,
    openPositionViews,
    openProductIds,
    stats,
    summary,
    startingBalance,
    defaultTradeUsd,
    feePct,
    isLoading,
    error,
    refresh,
    openTrade,
    openTradeUsd,
    closeTrade,
    closeTradePartial,
    deleteTrade,
    clearClosed,
    setStartingBalance,
    setDefaultTradeUsd,
    setFeePct,
  }
}
