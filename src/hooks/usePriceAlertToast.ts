import { useEffect, useState } from 'react'
import { useWebSocket } from '@/hooks/useWebSocket'
import type { PriceAlertWSData } from '@/types/alert'

export function usePriceAlertToast() {
  const { lastMessage } = useWebSocket()
  const [toast, setToast] = useState<PriceAlertWSData | null>(null)

  useEffect(() => {
    if (lastMessage?.type === 'price_alert' && lastMessage.data) {
      setToast(lastMessage.data as unknown as PriceAlertWSData)
      const t = setTimeout(() => setToast(null), 8000)
      return () => clearTimeout(t)
    }
  }, [lastMessage])

  return toast
}
