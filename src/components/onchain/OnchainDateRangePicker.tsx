import { useEffect, useState } from 'react'
import { Calendar } from 'lucide-react'
import type { OnchainDateRange } from '@/types/onchain'
import {
  dateRangeKey,
  defaultDateRange,
  normalizeDateRange,
  todayDateInput,
} from '@/utils/onchainDateRange'

const PRESETS = [
  { id: '24h', label: '24h', days: 1 },
  { id: '7d', label: '7 days', days: 7 },
  { id: '30d', label: '30 days', days: 30 },
  { id: '90d', label: '90 days', days: 90 },
] as const

interface OnchainDateRangePickerProps {
  value: OnchainDateRange
  onChange: (range: OnchainDateRange) => void
  disabled?: boolean
}

export function OnchainDateRangePicker({
  value,
  onChange,
  disabled,
}: OnchainDateRangePickerProps) {
  const [draftStart, setDraftStart] = useState(value.startDate ?? '')
  const [draftEnd, setDraftEnd] = useState(value.endDate ?? '')

  useEffect(() => {
    setDraftStart(value.startDate ?? '')
    setDraftEnd(value.endDate ?? '')
  }, [value.startDate, value.endDate])

  const applyPreset = (days: number) => {
    onChange(defaultDateRange(days))
  }

  const applyCustomRange = (start: string, end: string) => {
    const normalized = normalizeDateRange({
      startDate: start || null,
      endDate: end || null,
    })
    if (!normalized) return
    onChange(normalized)
  }

  const handleStartChange = (start: string) => {
    setDraftStart(start)
    if (start && draftEnd) applyCustomRange(start, draftEnd)
  }

  const handleEndChange = (end: string) => {
    setDraftEnd(end)
    if (draftStart && end) applyCustomRange(draftStart, end)
  }

  const draftKey = `${draftStart}:${draftEnd}`
  const appliedKey = dateRangeKey(value)
  const draftDirty = draftKey !== appliedKey && draftStart && draftEnd

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-2 text-xs text-dark-400 shrink-0">
          <Calendar className="h-4 w-4" />
          <span>Date range</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => {
            const presetRange = defaultDateRange(preset.days)
            const active =
              value.startDate === presetRange.startDate &&
              value.endDate === presetRange.endDate
            return (
              <button
                key={preset.id}
                type="button"
                disabled={disabled}
                onClick={() => applyPreset(preset.days)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
                  active
                    ? 'bg-brand-600/20 text-brand-300 border border-brand-500/40'
                    : 'bg-dark-800 text-dark-300 hover:bg-dark-700 border border-dark-700'
                }`}
              >
                {preset.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          type="date"
          value={draftStart}
          max={draftEnd || todayDateInput()}
          disabled={disabled}
          onChange={(e) => handleStartChange(e.target.value)}
          className="px-3 py-1.5 bg-dark-900 border border-dark-700 rounded-lg text-xs text-dark-100 focus:outline-none focus:border-brand-500"
        />
        <span className="text-dark-600 text-xs">to</span>
        <input
          type="date"
          value={draftEnd}
          min={draftStart || undefined}
          max={todayDateInput()}
          disabled={disabled}
          onChange={(e) => handleEndChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && draftStart && draftEnd && applyCustomRange(draftStart, draftEnd)}
          className="px-3 py-1.5 bg-dark-900 border border-dark-700 rounded-lg text-xs text-dark-100 focus:outline-none focus:border-brand-500"
        />
        <button
          type="button"
          disabled={disabled || !draftDirty}
          onClick={() => applyCustomRange(draftStart, draftEnd)}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-brand-600 text-white hover:bg-brand-500 disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          Apply
        </button>
        {draftDirty && (
          <span className="text-[10px] text-dark-500">Updating range…</span>
        )}
      </div>
    </div>
  )
}
