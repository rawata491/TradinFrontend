import { useEffect, useCallback, useState } from 'react'
import { useMarketStore } from '@/store/useMarketStore'
import { WS_URL, WS_RECONNECT_DELAY, WS_MAX_RECONNECT_DELAY, WS_RECONNECT_BACKOFF } from '@/utils/constants'
import type { WSMessage, TickerData } from '@/types'

type WSStatus = 'connecting' | 'connected' | 'disconnected' | 'error'

interface UseWebSocketReturn {
  status: WSStatus
  subscribe: (productIds: string[]) => void
  unsubscribe: (productIds: string[]) => void
  lastMessage: WSMessage | null
}

// ---------------------------------------------------------------------------
// Module-level singleton — one WS connection shared across all hook instances.
// This prevents duplicate connections when multiple components call useWebSocket()
// and avoids the "closed before established" error from React StrictMode's
// double-invocation of effects.
// ---------------------------------------------------------------------------

interface SharedState {
  ws: WebSocket | null
  status: WSStatus
  reconnectTimer: ReturnType<typeof setTimeout> | null
  reconnectDelay: number
  intentionalClose: boolean
  pendingSubscriptions: string[]
  updateTicker: ((ticker: TickerData) => void) | null
  statusListeners: Set<(s: WSStatus) => void>
  messageListeners: Set<(msg: WSMessage) => void>
}

const _shared: SharedState = {
  ws: null,
  status: 'disconnected',
  reconnectTimer: null,
  reconnectDelay: WS_RECONNECT_DELAY,
  intentionalClose: false,
  pendingSubscriptions: [],
  updateTicker: null,
  statusListeners: new Set(),
  messageListeners: new Set(),
}

function _broadcastStatus(status: WSStatus) {
  _shared.status = status
  _shared.statusListeners.forEach((fn) => fn(status))
}

function _connect() {
  // Guard: do not open a second connection while one is open or connecting.
  if (
    _shared.ws?.readyState === WebSocket.OPEN ||
    _shared.ws?.readyState === WebSocket.CONNECTING
  ) {
    return
  }

  _broadcastStatus('connecting')
  const ws = new WebSocket(WS_URL)
  _shared.ws = ws

  ws.onopen = () => {
    _broadcastStatus('connected')
    _shared.reconnectDelay = WS_RECONNECT_DELAY

    if (_shared.pendingSubscriptions.length > 0) {
      ws.send(
        JSON.stringify({ action: 'subscribe', product_ids: _shared.pendingSubscriptions })
      )
      _shared.pendingSubscriptions = []
    }
  }

  ws.onmessage = (event: MessageEvent<string>) => {
    try {
      const msg = JSON.parse(event.data) as WSMessage
      if (msg.type === 'ticker' && msg.data) {
        _shared.updateTicker?.(msg.data as TickerData)
      }
      // Fan out all messages to registered listeners (e.g. broadcast events)
      _shared.messageListeners.forEach((fn) => fn(msg))
    } catch {
      // Ignore malformed messages
    }
  }

  ws.onclose = () => {
    _broadcastStatus('disconnected')
    _shared.ws = null

    if (!_shared.intentionalClose) {
      _shared.reconnectTimer = setTimeout(() => {
        _shared.reconnectDelay = Math.min(
          _shared.reconnectDelay * WS_RECONNECT_BACKOFF,
          WS_MAX_RECONNECT_DELAY
        )
        _connect()
      }, _shared.reconnectDelay)
    }
  }

  ws.onerror = () => {
    _broadcastStatus('error')
    ws.close()
  }
}

// ---------------------------------------------------------------------------
// Hook — thin consumer of the singleton above.
// ---------------------------------------------------------------------------

export function useWebSocket(): UseWebSocketReturn {
  const [status, setStatus] = useState<WSStatus>(_shared.status)
  const [lastMessage, setLastMessage] = useState<WSMessage | null>(null)
  const updateTicker = useMarketStore((s) => s.updateTicker)

  // Keep the shared updateTicker ref in sync with the store's current function.
  useEffect(() => {
    _shared.updateTicker = updateTicker
  }, [updateTicker])

  // Register status listener.
  useEffect(() => {
    const listener = (s: WSStatus) => setStatus(s)
    _shared.statusListeners.add(listener)
    setStatus(_shared.status)
    return () => {
      _shared.statusListeners.delete(listener)
    }
  }, [])

  // Register message listener for non-ticker events.
  useEffect(() => {
    const listener = (msg: WSMessage) => {
      if (msg.type !== 'ticker') {
        setLastMessage(msg)
      }
    }
    _shared.messageListeners.add(listener)
    return () => {
      _shared.messageListeners.delete(listener)
    }
  }, [])

  // Ensure the connection is started. _connect() is a no-op if already
  // open/connecting, so React StrictMode's double-invoke is harmless.
  useEffect(() => {
    _shared.intentionalClose = false
    _connect()
    // Intentionally no cleanup close — the singleton WS lives for the whole
    // session. Individual components unmounting should not tear down the
    // shared connection that other mounted components are still using.
  }, [])

  const subscribe = useCallback((productIds: string[]) => {
    if (_shared.ws?.readyState === WebSocket.OPEN) {
      _shared.ws.send(JSON.stringify({ action: 'subscribe', product_ids: productIds }))
    } else {
      _shared.pendingSubscriptions = [
        ...new Set([..._shared.pendingSubscriptions, ...productIds]),
      ]
    }
  }, [])

  const unsubscribe = useCallback((productIds: string[]) => {
    if (_shared.ws?.readyState === WebSocket.OPEN) {
      _shared.ws.send(JSON.stringify({ action: 'unsubscribe', product_ids: productIds }))
    }
  }, [])

  return { status, subscribe, unsubscribe, lastMessage }
}
