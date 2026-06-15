import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { PracticeOrderForm } from '@/components/practice/PracticeOrderForm'

export function PracticeTradeSheet({
  open,
  onClose,
  productId,
  marketPrice,
}: {
  open: boolean
  onClose: () => void
  productId: string
  marketPrice: number | null
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close"
      />
      <div className="relative w-full max-w-md h-full bg-dark-950 border-l border-dark-800 shadow-xl overflow-y-auto">
        <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b border-dark-800 bg-dark-950/95 backdrop-blur">
          <h2 className="text-sm font-semibold text-dark-100">Practice trade</h2>
          <button type="button" onClick={onClose} className="p-2 text-dark-400 hover:text-dark-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4">
          <PracticeOrderForm
            productId={productId}
            marketPrice={marketPrice}
            compact
            onSuccess={onClose}
          />
        </div>
      </div>
    </div>
  )
}

/** Compact entry point on coin pages. */
export function PracticeTradeButton({
  productId,
  marketPrice,
}: {
  productId: string
  marketPrice: number | null
}) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={marketPrice == null}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border border-brand-500/40 text-brand-400 hover:bg-brand-500/10 disabled:opacity-40"
      >
        Practice trade
      </button>
      <PracticeTradeSheet
        open={open}
        onClose={() => setOpen(false)}
        productId={productId}
        marketPrice={marketPrice}
      />
    </>
  )
}
