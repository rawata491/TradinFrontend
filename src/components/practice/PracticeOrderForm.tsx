import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { usePaperTrading } from '@/hooks/usePaperTrading'
import { formatPrice } from '@/utils/formatters'
import {
  quantityToUsd,
  sideHint,
  sideLabel,
  usdToQuantity,
} from '@/utils/paperTrading'
import type { PaperOrderType, PaperSide } from '@/types/paperTrade'
import { CoinAvatar } from '@/components/CoinAvatar'
import { MarketPicker } from '@/components/MarketPicker'

interface PracticeOrderFormProps {
  productId?: string
  marketPrice?: number | null
  onSuccess?: () => void
  compact?: boolean
}

export function PracticeOrderForm({
  productId: initialProductId = 'BTC-USD',
  marketPrice: externalPrice,
  onSuccess,
  compact = false,
}: PracticeOrderFormProps) {
  const {
    openTradeUsd,
    defaultTradeUsd,
    setDefaultTradeUsd,
    startingBalance,
    summary,
    error,
  } = usePaperTrading()

  const [productId, setProductId] = useState(initialProductId.toUpperCase())
  const [side, setSide] = useState<PaperSide>('long')
  const [orderType, setOrderType] = useState<PaperOrderType>('market')
  const [usd, setUsd] = useState(String(defaultTradeUsd))
  const [limitPrice, setLimitPrice] = useState('')
  const [stopLoss, setStopLoss] = useState('')
  const [takeProfit, setTakeProfit] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    setProductId(initialProductId.toUpperCase())
  }, [initialProductId])

  useEffect(() => {
    setUsd(String(defaultTradeUsd))
  }, [defaultTradeUsd])

  const price = externalPrice ?? null
  const usdNum = parseFloat(usd)
  const effectivePrice =
    orderType === 'limit' && limitPrice ? parseFloat(limitPrice) : price
  const qty =
    effectivePrice != null && effectivePrice > 0 ? usdToQuantity(usdNum, effectivePrice) : 0
  const canAfford = Number.isFinite(usdNum) && usdNum > 0 && usdNum <= summary.equity

  const preset = (amount: number) => setUsd(String(amount))

  const handleSubmit = async () => {
    if (orderType === 'market' && (price == null || price <= 0)) {
      setFormError('Live price unavailable — wait for ticker or use a limit order')
      return
    }
    const limitNum = parseFloat(limitPrice)
    if (orderType === 'limit' && (!Number.isFinite(limitNum) || limitNum <= 0)) {
      setFormError('Enter a valid limit price')
      return
    }
    if (!Number.isFinite(usdNum) || usdNum <= 0) {
      setFormError('Enter a valid USD amount')
      return
    }
    if (usdNum > summary.equity) {
      setFormError(`Not enough virtual balance ($${summary.equity.toFixed(0)} available)`)
      return
    }
    setFormError(null)
    setSubmitting(true)
    try {
      setDefaultTradeUsd(usdNum)
      const sl = parseFloat(stopLoss)
      const tp = parseFloat(takeProfit)
      await openTradeUsd({
        product_id: productId,
        side,
        usd: usdNum,
        price: orderType === 'limit' ? limitNum : (price as number),
        source: compact ? 'coin_detail' : 'manual',
        order_type: orderType,
        limit_price: orderType === 'limit' ? limitNum : undefined,
        stop_loss: Number.isFinite(sl) && sl > 0 ? sl : undefined,
        take_profit: Number.isFinite(tp) && tp > 0 ? tp : undefined,
      })
      onSuccess?.()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Order failed')
    } finally {
      setSubmitting(false)
    }
  }

  const sym = productId.split('-')[0]

  return (
    <div className={`space-y-4 ${compact ? '' : 'card p-4'}`}>
      {!compact && <h2 className="text-sm font-semibold text-dark-200">New practice order</h2>}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setSide('long')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold border transition-colors ${
            side === 'long'
              ? 'bg-positive/15 border-positive/40 text-positive'
              : 'border-dark-700 text-dark-400 hover:border-dark-500'
          }`}
        >
          Buy
        </button>
        <button
          type="button"
          onClick={() => setSide('short')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold border transition-colors ${
            side === 'short'
              ? 'bg-negative/15 border-negative/40 text-negative'
              : 'border-dark-700 text-dark-400 hover:border-dark-500'
          }`}
        >
          Short
        </button>
      </div>
      <p className="text-xs text-dark-500 -mt-2">{sideHint(side)}</p>

      <div className="flex gap-2">
        {(['market', 'limit'] as PaperOrderType[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setOrderType(t)}
            className={`flex-1 py-1.5 rounded-md text-xs font-medium border capitalize ${
              orderType === t
                ? 'border-brand-500/50 bg-brand-500/10 text-brand-300'
                : 'border-dark-700 text-dark-500'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {!compact && (
        <label className="block space-y-1">
          <span className="text-xs text-dark-400">Asset</span>
          <MarketPicker value={productId} onChange={setProductId} />
        </label>
      )}

      {compact && (
        <div className="flex items-center gap-2">
          <CoinAvatar symbol={sym} size="sm" />
          <span className="font-mono font-semibold text-dark-100">{productId}</span>
        </div>
      )}

      {orderType === 'limit' && (
        <label className="block space-y-1">
          <span className="text-xs text-dark-400">Limit price</span>
          <input
            type="number"
            value={limitPrice}
            onChange={(e) => setLimitPrice(e.target.value)}
            step="any"
            className="w-full bg-dark-950 border border-dark-700 rounded-lg px-3 py-2 text-sm font-mono"
            placeholder={price != null ? String(price) : '0.00'}
          />
        </label>
      )}

      <label className="block space-y-1">
        <span className="text-xs text-dark-400">Size (USD)</span>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500 text-sm">$</span>
          <input
            type="number"
            value={usd}
            onChange={(e) => setUsd(e.target.value)}
            min={1}
            step={1}
            className="w-full bg-dark-950 border border-dark-700 rounded-lg pl-7 pr-3 py-2.5 text-sm font-mono"
          />
        </div>
      </label>

      <div className="grid grid-cols-2 gap-2">
        <label className="block space-y-1">
          <span className="text-xs text-dark-400">Stop loss</span>
          <input
            type="number"
            value={stopLoss}
            onChange={(e) => setStopLoss(e.target.value)}
            step="any"
            placeholder="Optional"
            className="w-full bg-dark-950 border border-dark-700 rounded-lg px-3 py-2 text-xs font-mono"
          />
        </label>
        <label className="block space-y-1">
          <span className="text-xs text-dark-400">Take profit</span>
          <input
            type="number"
            value={takeProfit}
            onChange={(e) => setTakeProfit(e.target.value)}
            step="any"
            placeholder="Optional"
            className="w-full bg-dark-950 border border-dark-700 rounded-lg px-3 py-2 text-xs font-mono"
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        {[100, 250, 500, 1000].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => preset(n)}
            className="text-xs px-2.5 py-1 rounded-md border border-dark-700 text-dark-400 hover:text-dark-200 hover:border-dark-500"
          >
            ${n}
          </button>
        ))}
        <button
          type="button"
          onClick={() => preset(Math.floor(summary.equity * 0.25))}
          className="text-xs px-2.5 py-1 rounded-md border border-dark-700 text-dark-400 hover:text-dark-200"
        >
          25% equity
        </button>
      </div>

      {effectivePrice != null && effectivePrice > 0 ? (
        <div className="rounded-lg bg-dark-900/60 border border-dark-800 px-3 py-2 text-xs text-dark-400 space-y-0.5">
          <p>
            {orderType === 'limit' ? 'Limit' : 'Market'}:{' '}
            <span className="font-mono text-dark-200">{formatPrice(String(effectivePrice))}</span>
          </p>
          {qty > 0 && (
            <p>
              ≈ {qty.toFixed(6)} {sym} · {sideLabel(side).toLowerCase()} ~$
              {quantityToUsd(qty, effectivePrice).toFixed(2)}
            </p>
          )}
        </div>
      ) : (
        <p className="text-xs text-dark-500">
          {orderType === 'limit'
            ? 'Set a limit price to place a pending order.'
            : (
              <>
                Waiting for live price…{' '}
                <Link to={`/coin/${productId}`} className="text-brand-400 hover:underline">
                  Open chart
                </Link>
              </>
            )}
        </p>
      )}

      <button
        type="button"
        disabled={
          submitting ||
          !canAfford ||
          (orderType === 'market' && (price == null || price <= 0))
        }
        onClick={() => void handleSubmit()}
        className={`w-full py-2.5 rounded-lg text-sm font-semibold disabled:opacity-40 ${
          side === 'long' ? 'btn-primary bg-positive hover:bg-positive/90' : 'bg-negative hover:bg-negative/90 text-white'
        }`}
      >
        {submitting ? (
          <Loader2 className="h-4 w-4 animate-spin mx-auto" />
        ) : (
          `${sideLabel(side)} $${Number.isFinite(usdNum) ? usdNum.toLocaleString() : '—'} @ ${orderType}`
        )}
      </button>

      {(formError || error) && (
        <p className="text-xs text-negative">{formError ?? error}</p>
      )}
      {!compact && (
        <p className="text-[10px] text-dark-600">
          Virtual balance ${startingBalance.toLocaleString()} · SL/TP auto-close on live price
        </p>
      )}
    </div>
  )
}
