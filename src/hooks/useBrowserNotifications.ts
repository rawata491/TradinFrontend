import { useEffect, useRef } from 'react'
import type { PriceAlertWSData } from '@/types/ws'
import type { StrategySignalWSData } from '@/types/ws'

export function useBrowserNotifications() {
  const permissionRef = useRef<NotificationPermission>('default')

  useEffect(() => {
    if ('Notification' in window) {
      permissionRef.current = Notification.permission
    }
  }, [])

  const requestPermission = async () => {
    if (!('Notification' in window)) return false
    const result = await Notification.requestPermission()
    permissionRef.current = result
    return result === 'granted'
  }

  const notify = (title: string, body: string, tag?: string) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return
    try {
      new Notification(title, { body, tag, icon: '/favicon.ico' })
    } catch {
      // ignore
    }
  }

  const notifyPriceAlert = (data: PriceAlertWSData) => {
    notify(
      `Price Alert: ${data.product_id}`,
      data.message || `${data.product_id} hit $${data.target_price}`,
      `alert-${data.alert_id}`,
    )
  }

  const notifyStrategySignal = (data: StrategySignalWSData) => {
    notify(
      `Strategy Signal: ${data.symbol}`,
      `${data.signal_type} on ${data.timeframe} — ${data.strategy}`,
      `signal-${data.symbol}-${data.timeframe}`,
    )
  }

  return { requestPermission, notify, notifyPriceAlert, notifyStrategySignal }
}
