import { useCallback, useEffect, useState } from 'react'
import { Bell, Trash2, Plus, Loader2 } from 'lucide-react'
import { alertApi } from '@/services/alertApi'
import type { AlertDirection, PriceAlert } from '@/types/alert'

interface PriceAlertsPanelProps {
  productId: string
  currentPrice?: number
  presetPrice?: number | null
  onPresetConsumed?: () => void
}

export function PriceAlertsPanel({
  productId,
  currentPrice,
  presetPrice,
  onPresetConsumed,
}: PriceAlertsPanelProps) {
  const [alerts, setAlerts] = useState<PriceAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [targetPrice, setTargetPrice] = useState('')
  const [direction, setDirection] = useState<AlertDirection>('above')
  const [notifyTelegram, setNotifyTelegram] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await alertApi.list(productId)
      setAlerts(data.filter((a) => a.is_active))
    } catch {
      setAlerts([])
    } finally {
      setLoading(false)
    }
  }, [productId])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (presetPrice != null) {
      setTargetPrice(String(presetPrice))
      if (currentPrice != null) {
        setDirection(currentPrice < presetPrice ? 'above' : 'below')
      }
      setNotifyTelegram(true)
      onPresetConsumed?.()
    }
  }, [presetPrice, currentPrice, onPresetConsumed])

  const handleCreate = async () => {
    const price = parseFloat(targetPrice)
    if (Number.isNaN(price) || price <= 0) return
    setSaving(true)
    try {
      await alertApi.create({
        product_id: productId,
        target_price: price,
        direction,
        notify_telegram: notifyTelegram,
      })
      setTargetPrice('')
      await load()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-dark-800">
        <Bell className="w-4 h-4 text-brand-500" />
        <h3 className="text-sm font-semibold text-dark-50">Price Alerts</h3>
        {currentPrice != null && (
          <span className="text-xs text-dark-400 ml-auto font-mono">
            Now ${currentPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </span>
        )}
      </div>

      <div className="p-4 space-y-3">
        <div className="flex flex-wrap gap-2 items-end">
          <label className="flex-1 min-w-[120px] space-y-1">
            <span className="text-xs text-dark-400">Target price</span>
            <input
              type="number"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              placeholder="0.00"
              className="w-full bg-dark-950 text-dark-100 text-sm rounded-lg px-3 py-2 border border-dark-700 focus:border-brand-500 outline-none"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs text-dark-400">When</span>
            <select
              value={direction}
              onChange={(e) => setDirection(e.target.value as AlertDirection)}
              className="bg-dark-950 text-dark-100 text-sm rounded-lg px-3 py-2 border border-dark-700 focus:border-brand-500 outline-none"
            >
              <option value="above">Crosses above</option>
              <option value="below">Crosses below</option>
            </select>
          </label>
          <label className="flex items-center gap-2 text-xs text-dark-400 pb-2">
            <input
              type="checkbox"
              checked={notifyTelegram}
              onChange={(e) => setNotifyTelegram(e.target.checked)}
              className="rounded border-dark-600"
            />
            Telegram
          </label>
          <button
            type="button"
            onClick={handleCreate}
            disabled={saving || !targetPrice}
            className="btn-primary flex items-center gap-1.5 text-sm px-3 py-2"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            Add
          </button>
        </div>

        {loading ? (
          <p className="text-xs text-dark-500 text-center py-4">Loading alerts…</p>
        ) : alerts.length === 0 ? (
          <p className="text-xs text-dark-500 text-center py-2">No active alerts for this coin.</p>
        ) : (
          <ul className="divide-y divide-dark-800">
            {alerts.map((a) => (
              <li key={a.id} className="flex items-center gap-3 py-2 text-xs">
                <span className="font-mono text-dark-100">
                  {a.direction === 'above' ? '↑' : '↓'} ${a.target_price.toLocaleString()}
                </span>
                {a.notify_telegram && (
                  <span className="text-[10px] text-brand-400 bg-brand-900/30 px-1.5 py-0.5 rounded">TG</span>
                )}
                <button
                  type="button"
                  onClick={async () => {
                    await alertApi.remove(a.id)
                    load()
                  }}
                  className="ml-auto p-1 text-dark-500 hover:text-negative transition-colors"
                  title="Delete alert"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
