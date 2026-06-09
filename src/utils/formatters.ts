/**
 * Number and string formatters for market data display.
 */

export function formatPrice(value: string | number | undefined): string {
  const num = parseFloat(String(value ?? '0'))
  if (isNaN(num)) return '—'

  if (num >= 1000) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num)
  }
  if (num >= 1) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(num)
  }
  // Very small values (e.g., SHIB)
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 6,
    maximumFractionDigits: 8,
  }).format(num)
}

export function formatPriceCompact(value: string | number | undefined): string {
  const num = parseFloat(String(value ?? '0'))
  if (isNaN(num)) return '—'
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`
  if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`
  return formatPrice(num)
}

export function formatVolume(value: string | number | undefined): string {
  const num = parseFloat(String(value ?? '0'))
  if (isNaN(num)) return '—'
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`
  if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`
  return `$${num.toFixed(2)}`
}

export function formatChange(value: string | number | undefined): string {
  const num = parseFloat(String(value ?? '0'))
  if (isNaN(num)) return '0.00%'
  const sign = num >= 0 ? '+' : ''
  return `${sign}${num.toFixed(2)}%`
}

export function formatNumber(value: string | number | undefined, decimals = 2): string {
  const num = parseFloat(String(value ?? '0'))
  if (isNaN(num)) return '—'
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num)
}

export function isPositive(value: string | number | undefined): boolean {
  return parseFloat(String(value ?? '0')) >= 0
}

export function getChangeColor(value: string | number | undefined): string {
  return isPositive(value) ? 'text-positive' : 'text-negative'
}

export function getChangeBadgeClass(value: string | number | undefined): string {
  return isPositive(value) ? 'badge-positive' : 'badge-negative'
}

export function getCoinSymbol(productId: string): string {
  return productId.split('-')[0] ?? productId
}

export function getCoinName(product: { base_name?: string; product_id: string }): string {
  return product.base_name || getCoinSymbol(product.product_id)
}

/** Deterministic color from a string (for coin avatars) */
export function getCoinColor(symbol: string): string {
  const COLORS = [
    '#f97316', // orange
    '#8b5cf6', // violet
    '#3b82f6', // blue
    '#22c55e', // green
    '#ec4899', // pink
    '#14b8a6', // teal
    '#f59e0b', // amber
    '#6366f1', // indigo
    '#ef4444', // red
    '#84cc16', // lime
  ]
  let hash = 0
  for (let i = 0; i < symbol.length; i++) {
    hash = symbol.charCodeAt(i) + ((hash << 5) - hash)
  }
  return COLORS[Math.abs(hash) % COLORS.length]
}

export function formatTimestamp(ts: number): string {
  return new Date(ts * 1000).toLocaleString()
}

/** Relative time e.g. "5 minutes ago" */
export function formatDistanceToNow(iso: string | null | undefined): string {
  if (!iso) return '—'
  const then = new Date(iso).getTime()
  const now = Date.now()
  const diffSec = Math.round((now - then) / 1000)
  if (diffSec < 60) return `${diffSec}s ago`
  const diffMin = Math.round(diffSec / 60)
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.round(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  const diffDay = Math.round(diffHr / 24)
  return `${diffDay}d ago`
}

const IST_OPTS: Intl.DateTimeFormatOptions = {
  timeZone: 'Asia/Kolkata',
  year: 'numeric',
  month: 'short',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: true,
}

/** Format any ISO/UTC date string as IST (Asia/Kolkata). */
export function formatIST(iso: string | null | undefined): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-IN', IST_OPTS)
}

/** Format a Date object as IST. */
export function formatDateIST(d: Date): string {
  return d.toLocaleString('en-IN', IST_OPTS)
}

/**
 * Build a UTC ISO string from a local date+time picker pair,
 * treating the input values as IST (Asia/Kolkata, UTC+05:30).
 */
export function localDateTimeToUTCIso(dateStr: string, timeStr: string): string {
  return new Date(`${dateStr}T${timeStr}:00+05:30`).toISOString()
}
