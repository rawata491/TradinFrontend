import { useEffect, useCallback, useState } from 'react'
import { useMarketStore } from '@/store/useMarketStore'
import { useAuthStore } from '@/store/useAuthStore'
import { buildWsUrl, WS_RECONNECT_DELAY, WS_MAX_RECONNECT_DELAY, WS_RECONNECT_BACKOFF } from '@/utils/constants'
import type { WSMessage, TickerData } from '@/types'

type WSStatus = 'connecting' | 'connected' | 'disconnected' | 'error'

interface UseWebSocketReturn {
  status: WSStatus
  subscribe: (productIds: string[]) => void
  unsubscribe: (productIds: string[]) => void
  lastMessage: WSMessage | null
}

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
  currentToken: string | null
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
  currentToken: null,
}

function _broadcastStatus(status: WSStatus) {
  _shared.status = status
  _shared.statusListeners.forEach((fn) => fn(status))
}

function _disconnect() {
  _shared.intentionalClose = true
  if (_shared.reconnectTimer) {
    clearTimeout(_shared.reconnectTimer)
    _shared.reconnectTimer = null
  }
  _shared.ws?.close()
  _shared.ws = null
  _broadcastStatus('disconnected')
}

function _connect(token: string) {
  if (
    _shared.ws?.readyState === WebSocket.OPEN ||
    _shared.ws?.readyState === WebSocket.CONNECTING
  ) {
    return
  }

  _shared.intentionalClose = false
  _shared.currentToken = token
  _broadcastStatus('connecting')
  const ws = new WebSocket(buildWsUrl(token))
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
      _shared.messageListeners.forEach((fn) => fn(msg))
    } catch {
      // Ignore malformed messages
    }
  }

  ws.onclose = () => {
    _broadcastStatus('disconnected')
    _shared.ws = null

    if (!_shared.intentionalClose && _shared.currentToken) {
      _shared.reconnectTimer = setTimeout(() => {
        _shared.reconnectDelay = Math.min(
          _shared.reconnectDelay * WS_RECONNECT_BACKOFF,
          WS_MAX_RECONNECT_DELAY
        )
        if (_shared.currentToken) _connect(_shared.currentToken)
      }, _shared.reconnectDelay)
    }
  }

  ws.onerror = () => {
    _broadcastStatus('error')
    ws.close()
  }
}

export function useWebSocket(): UseWebSocketReturn {
  const [status, setStatus] = useState<WSStatus>(_shared.status)
  const [lastMessage, setLastMessage] = useState<WSMessage | null>(null)
  const updateTicker = useMarketStore((s) => s.updateTicker)
  const token = useAuthStore((s) => s.token)

  useEffect(() => {
    _shared.updateTicker = updateTicker
  }, [updateTicker])

  useEffect(() => {
    const listener = (s: WSStatus) => setStatus(s)
    _shared.statusListeners.add(listener)
    setStatus(_shared.status)
    return () => {
      _shared.statusListeners.delete(listener)
    }
  }, [])

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

  useEffect(() => {
    if (!token) {
      _disconnect()
      _shared.currentToken = null
      return
    }
    if (_shared.currentToken !== token) {
      _disconnect()
      _shared.intentionalClose = false
    }
    _connect(token)
  }, [token])

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
