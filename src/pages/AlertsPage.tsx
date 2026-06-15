import { Link } from 'react-router-dom'
import { Bell, Trash2, Loader2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { alertApi } from '@/services/alertApi'
import { ErrorState } from '@/components/ErrorState'
import { EmptyState } from '@/components/ErrorState'
import type { PriceAlert } from '@/types/alert'
import { getCoinSymbol } from '@/utils/formatters'

export function AlertsPage() {
  const [alerts, setAlerts] = useState<PriceAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await alertApi.list()
      setAlerts(data.filter((a) => a.is_active))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load alerts')
      setAlerts([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fade-in pb-20 md:pb-6">
      <div>
        <h1 className="text-2xl font-bold text-dark-50 flex items-center gap-2">
          <Bell className="h-6 w-6 text-brand-500" />
          Price Alerts
        </h1>
        <p className="text-sm text-dark-400 mt-1">
          All active alerts across your tracked coins. Create alerts from any coin&apos;s chart page.
        </p>
      </div>

      {loading && (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
        </div>
      )}

      {error && !loading && (
        <ErrorState message={error} onRetry={load} />
      )}

      {!loading && !error && alerts.length === 0 && (
        <EmptyState message="No active alerts. Open a coin chart and set a target price." />
      )}

      {!loading && !error && alerts.length > 0 && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-dark-500 border-b border-dark-800">
                <th className="px-4 py-3 font-medium">Coin</th>
                <th className="px-4 py-3 font-medium">Target</th>
                <th className="px-4 py-3 font-medium">Direction</th>
                <th className="px-4 py-3 font-medium">Telegram</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {alerts.map((a) => (
                <tr key={a.id} className="border-b border-dark-800/50 hover:bg-dark-900/40">
                  <td className="px-4 py-3">
                    <Link to={`/coin/${a.product_id}`} className="font-semibold text-brand-400 hover:underline">
                      {getCoinSymbol(a.product_id)}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-mono">${a.target_price.toLocaleString()}</td>
                  <td className="px-4 py-3 capitalize">{a.direction}</td>
                  <td className="px-4 py-3">{a.notify_telegram ? 'Yes' : '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={async () => {
                        await alertApi.remove(a.id)
                        void load()
                      }}
                      className="p-1.5 text-dark-500 hover:text-negative"
                      aria-label="Delete alert"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
