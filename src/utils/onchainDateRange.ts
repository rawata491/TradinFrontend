import type { OnchainDateRange, CompleteOnchainDateRange } from '@/types/onchain'

/** Format as YYYY-MM-DD in local timezone (matches <input type="date">). */
export function formatDateInput(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function defaultDateRange(days = 7): CompleteOnchainDateRange {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - (days - 1))
  return {
    startDate: formatDateInput(start),
    endDate: formatDateInput(end),
  }
}

export function isCompleteDateRange(range: OnchainDateRange): boolean {
  return Boolean(range.startDate && range.endDate)
}

/** Swap inverted dates; return null if either date missing. */
export function normalizeDateRange(range: OnchainDateRange): CompleteOnchainDateRange | null {
  if (!range.startDate || !range.endDate) return null
  if (range.startDate <= range.endDate) {
    return { startDate: range.startDate, endDate: range.endDate }
  }
  return { startDate: range.endDate, endDate: range.startDate }
}

export function dateRangeQuery(range: OnchainDateRange): {
  start_date: string
  end_date: string
} | Record<string, never> {
  const normalized = normalizeDateRange(range)
  if (!normalized) return {}
  return {
    start_date: normalized.startDate,
    end_date: normalized.endDate,
  }
}

export function dateRangeKey(range: OnchainDateRange): string {
  const normalized = normalizeDateRange(range)
  if (!normalized) return ''
  return `${normalized.startDate}:${normalized.endDate}`
}

export function rangeLabel(range: OnchainDateRange): string {
  const normalized = normalizeDateRange(range)
  if (normalized) {
    return `${normalized.startDate} → ${normalized.endDate}`
  }
  return 'Select a date range'
}

export function daysInRange(range: OnchainDateRange): number {
  const normalized = normalizeDateRange(range)
  if (!normalized) return 1
  const start = new Date(`${normalized.startDate}T00:00:00`).getTime()
  const end = new Date(`${normalized.endDate}T23:59:59`).getTime()
  return Math.max(1, Math.ceil((end - start) / 86400000))
}

export function todayDateInput(): string {
  return formatDateInput(new Date())
}

/** True when the selected range ends before yesterday — wallet/whale tabs are live-only. */
export function isLiveOnlyRange(range: OnchainDateRange): boolean {
  const normalized = normalizeDateRange(range)
  if (!normalized) return false
  const end = new Date(`${normalized.endDate}T23:59:59`)
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  yesterday.setHours(0, 0, 0, 0)
  return end < yesterday
}
