export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'
export const WS_URL = import.meta.env.VITE_WS_URL ?? 'ws://localhost:8000/ws'
export const APP_NAME = import.meta.env.VITE_APP_NAME ?? 'Tradin'

export const TIMEFRAMES = ['1m', '5m', '15m', '1H', '4H', '1D', '1W', '1M'] as const
// Fallback mirror of GET /api/candles/timeframes — prefer useTimeframes() hook.

export const TIMEFRAME_LABELS: Record<string, string> = {
  '1m': '1 Minute',
  '5m': '5 Minutes',
  '15m': '15 Minutes',
  '1H': '1 Hour',
  '4H': '4 Hours',
  '1D': '1 Day',
  '1W': '1 Week',
  '1M': '1 Month',
}

export const DEFAULT_WATCHLIST = ['BTC-USD', 'ETH-USD', 'SOL-USD']

export const POPULAR_COINS = [
  'BTC-USD',
  'ETH-USD',
  'SOL-USD',
  'XRP-USD',
  'DOGE-USD',
  'ADA-USD',
  'AVAX-USD',
  'DOT-USD',
  'LINK-USD',
  'MATIC-USD',
]

export const WS_RECONNECT_DELAY = 3000   // 3s initial
export const WS_MAX_RECONNECT_DELAY = 60000  // 60s max
export const WS_RECONNECT_BACKOFF = 1.5

export const WATCHLIST_STORAGE_KEY = 'tradin_watchlist'

export const OVERLAY_COLORS = [
  '#3B82F6', '#F59E0B', '#EC4899', '#8B5CF6',
  '#14B8A6', '#F97316', '#EF4444', '#22C55E',
]

export const TIMEFRAME_SECONDS: Record<string, number> = {
  '1m': 60,
  '5m': 300,
  '15m': 900,
  '1H': 3600,
  '4H': 14400,
  '1D': 86400,
  '1W': 604800,
  '1M': 2592000,
}

export const DEFAULT_INDICATOR_PARAMS: Record<string, number> = {
  ema9: 9,
  ema21: 21,
  sma20: 20,
  sma50: 50,
  rsi: 14,
  macdFast: 12,
  macdSlow: 26,
  macdSignal: 9,
  bbPeriod: 20,
  bbMult: 2,
  stochK: 14,
  stochD: 3,
  atr: 14,
}

export const INDICATOR_COLORS: Record<string, string> = {
  ema9: '#3B82F6',
  ema21: '#F59E0B',
  sma20: '#8B5CF6',
  sma50: '#EC4899',
  rsi: '#14B8A6',
  macd: '#2962FF',
  macdSignal: '#FF6D00',
  macdHist: '#26A69A',
  bbUpper: '#8B5CF6',
  bbMid: '#64748b',
  bbLower: '#8B5CF6',
  vwap: '#F97316',
  stochK: '#3B82F6',
  stochD: '#F59E0B',
  atr: '#EC4899',
}
