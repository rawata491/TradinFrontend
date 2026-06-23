import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FlaskConical } from 'lucide-react'
import {
  Briefcase, Plus, Trash2, TrendingUp, TrendingDown,
} from 'lucide-react'
import { usePortfolioStore } from '@/store/usePortfolioStore'
import { useMarketStore } from '@/store/useMarketStore'
import { useWatchlistStore } from '@/store/useWatchlistStore'
import { useWebSocket } from '@/hooks/useWebSocket'
import { formatPrice, getChangeColor, formatChange } from '@/utils/formatters'
import { CoinAvatar } from '@/components/CoinAvatar'
import { EmptyState } from '@/components/ErrorState'
import { MarketPicker } from '@/components/MarketPicker'

export function PortfolioPage() {
  const { holdings, addHolding, removeHolding, clearAll } = usePortfolioStore()
  const tickers = useMarketStore((s) => s.tickers)
  const watchlistItems = useWatchlistStore((s) => s.items)
  const { subscribe, unsubscribe } = useWebSocket()

  const [productId, setProductId] = useState('BTC-USD')
  const [quantity, setQuantity] = useState('')
  const [avgCost, setAvgCost] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    const ids = holdings.map((h) => h.product_id)
    if (ids.length) subscribe(ids)
    return () => { if (ids.length) unsubscribe(ids) }
  }, [holdings, subscribe, unsubscribe])

  const rows = holdings.map((h) => {
    const ticker = tickers[h.product_id]
    const price = parseFloat(ticker?.price ?? '0') || h.avg_cost
    const value = price * h.quantity
    const cost = h.avg_cost * h.quantity
    const pnl = value - cost
    const pnlPct = cost > 0 ? (pnl / cost) * 100 : 0
    return { ...h, price, value, cost, pnl, pnlPct }
  })

  const totalValue = rows.reduce((s, r) => s + r.value, 0)
  const totalCost = rows.reduce((s, r) => s + r.cost, 0)
  const totalPnl = totalValue - totalCost
  const totalPnlPct = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0

  const handleAdd = () => {
    const qty = parseFloat(quantity)
    const cost = parseFloat(avgCost)
    if (!productId.trim()) {
      setFormError('Enter a product ID (e.g. BTC-USD)')
      return
    }
    if (Number.isNaN(qty) || qty <= 0) {
      setFormError('Quantity must be greater than 0')
      return
    }
    if (Number.isNaN(cost) || cost <= 0) {
      setFormError('Average cost must be greater than 0')
      return
    }
    setFormError(null)
    addHolding({ product_id: productId.toUpperCase(), quantity: qty, avg_cost: cost })
    setQuantity('')
    setAvgCost('')
  }

  const importFromWatchlist = () => {
    if (!watchlistItems.length) {
      setFormError('Your watchlist is empty — star coins on the dashboard first')
      return
    }
    const existing = new Set(holdings.map((h) => h.product_id))
    let added = 0
    for (const id of watchlistItems) {
      if (existing.has(id)) continue
      const price = parseFloat(tickers[id]?.price ?? '0')
      addHolding({
        product_id: id,
        quantity: 1,
        avg_cost: price > 0 ? price : 1,
      })
      added++
    }
    setFormError(added ? null : 'All watchlist coins are already in your portfolio')
  }

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-50 flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-brand-500" />
            Portfolio
          </h1>
          <p className="text-sm text-dark-400 mt-1">
            Manual holdings tracker — separate from your{' '}
            <Link to="/practice" className="text-brand-400 hover:underline">practice trading account</Link>
          </p>
        </div>
        {holdings.length > 0 && (
          <button type="button" onClick={clearAll} className="text-xs text-dark-500 hover:text-negative">
            Clear all
          </button>
        )}
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="card p-4">
          <p className="stat-label">Total Value</p>
          <p className="text-2xl font-bold font-mono text-dark-50">${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
        </div>
        <div className="card p-4">
          <p className="stat-label">Unrealized PnL</p>
          <p className={`text-2xl font-bold font-mono flex items-center gap-1 ${totalPnl >= 0 ? 'text-positive' : 'text-negative'}`}>
            {totalPnl >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
            {totalPnl >= 0 ? '+' : ''}${totalPnl.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
          <p className={`text-xs mt-1 ${getChangeColor(String(totalPnlPct))}`}>{formatChange(String(totalPnlPct))}</p>
        </div>
        <div className="card p-4">
          <p className="stat-label">Holdings</p>
          <p className="text-2xl font-bold text-dark-50">{holdings.length}</p>
        </div>
      </div>

      <div className="card p-4">
        <h2 className="text-sm font-semibold text-dark-200 mb-3">Add Position</h2>
        <div className="flex flex-wrap gap-2 items-end">
          <label className="space-y-1 flex-1 min-w-[180px]">
            <span className="text-xs text-dark-400">Product</span>
            <MarketPicker value={productId} onChange={setProductId} />
          </label>
          <label className="space-y-1">
            <span className="text-xs text-dark-400">Quantity</span>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="bg-dark-950 border border-dark-700 rounded-lg px-3 py-2 text-sm text-dark-100 w-28"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs text-dark-400">Avg cost ($)</span>
            <input
              type="number"
              value={avgCost}
              onChange={(e) => setAvgCost(e.target.value)}
              className="bg-dark-950 border border-dark-700 rounded-lg px-3 py-2 text-sm text-dark-100 w-32"
            />
          </label>
          <button type="button" onClick={handleAdd} className="btn-primary flex items-center gap-1.5 text-sm px-4 py-2">
            <Plus className="h-4 w-4" /> Add
          </button>
          <button type="button" onClick={importFromWatchlist} className="btn-ghost text-sm px-4 py-2">
            Import watchlist
          </button>
        </div>
        {formError && (
          <p className="text-xs text-negative mt-2">{formError}</p>
        )}
      </div>

      {rows.length === 0 ? (
        <EmptyState message="No holdings yet. Add a position above or import from your watchlist." />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-dark-500 border-b border-dark-800">
                <th className="px-4 py-3 font-medium">Asset</th>
                <th className="px-4 py-3 font-medium">Qty</th>
                <th className="px-4 py-3 font-medium">Avg Cost</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Value</th>
                <th className="px-4 py-3 font-medium">PnL</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const sym = r.product_id.split('-')[0]
                return (
                  <tr key={r.product_id} className="border-b border-dark-800/50 hover:bg-dark-900/40">
                    <td className="px-4 py-3">
                      <Link to={`/coin/${r.product_id}`} className="flex items-center gap-2 hover:text-brand-400">
                        <CoinAvatar symbol={sym} size="sm" />
                        <span className="font-semibold">{sym}</span>
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-mono">{r.quantity}</td>
                    <td className="px-4 py-3 font-mono">{formatPrice(String(r.avg_cost))}</td>
                    <td className="px-4 py-3 font-mono">{formatPrice(String(r.price))}</td>
                    <td className="px-4 py-3 font-mono">${r.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                    <td className={`px-4 py-3 font-mono ${r.pnl >= 0 ? 'text-positive' : 'text-negative'}`}>
                      {r.pnl >= 0 ? '+' : ''}${r.pnl.toFixed(2)} ({r.pnlPct.toFixed(1)}%)
                    </td>
                    <td className="px-4 py-3">
                      <button type="button" onClick={() => removeHolding(r.product_id)} className="text-dark-500 hover:text-negative">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {totalValue > 0 && (
        <div className="card p-4">
          <h2 className="text-sm font-semibold text-dark-200 mb-3">Allocation</h2>
          <div className="space-y-2">
            {rows.map((r) => {
              const pct = (r.value / totalValue) * 100
              const sym = r.product_id.split('-')[0]
              return (
                <div key={r.product_id} className="flex items-center gap-3">
                  <span className="text-xs w-12 text-dark-400">{sym}</span>
                  <div className="flex-1 h-2 bg-dark-800 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs font-mono text-dark-400 w-12 text-right">{pct.toFixed(1)}%</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <Link
        to="/practice"
        className="card p-4 flex items-center gap-4 hover:border-brand-500/40 transition-colors group"
      >
        <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-400 group-hover:bg-brand-500/20">
          <FlaskConical className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-dark-100">Practice trading</p>
          <p className="text-xs text-dark-500 mt-0.5">
            Simulated buy/short with virtual money — separate from holdings above.
          </p>
        </div>
        <span className="text-xs text-brand-400 font-medium">Open →</span>
      </Link>
    </div>
  )
}
