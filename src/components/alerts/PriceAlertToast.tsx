import type { PriceAlertWSData } from '@/types/alert'

export function PriceAlertToast({ toast }: { toast: PriceAlertWSData | null }) {
  if (!toast) return null
  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm card p-4 shadow-xl border border-brand-700/50">
      <p className="text-xs font-semibold text-brand-400 mb-1">Price Alert</p>
      <p className="text-sm text-dark-100">{toast.message}</p>
      <p className="text-xs text-dark-400 mt-1 font-mono">{toast.product_id}</p>
    </div>
  )
}
