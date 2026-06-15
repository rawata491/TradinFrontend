import { useCallback, useEffect, useMemo, useState } from 'react'
import { ChevronDown, ChevronRight, Filter, Loader2, RefreshCw, Search } from 'lucide-react'
import { adminApi } from '@/services/authApi'
import type { ActivityFilterOptions, ActivityLog, ActivityLogFilters } from '@/types/auth'
import { ErrorState } from '@/components/ErrorState'

const PAGE_SIZES = [25, 50, 100] as const

const EMPTY_FILTERS: ActivityLogFilters = {
  user_id: undefined,
  action: undefined,
  action_prefix: undefined,
  resource_type: undefined,
  search: undefined,
  date_from: undefined,
  date_to: undefined,
  page: 1,
  page_size: 50,
}

function MetadataBlock({ data }: { data: Record<string, unknown> | null | undefined }) {
  if (!data || Object.keys(data).length === 0) return null
  return (
    <pre className="text-xs text-dark-400 bg-dark-950 rounded-lg p-3 overflow-x-auto max-h-48">
      {JSON.stringify(data, null, 2)}
    </pre>
  )
}

function ActivityRow({ entry }: { entry: ActivityLog }) {
  const [open, setOpen] = useState(false)
  const hasExtra = Boolean(
    entry.metadata && Object.keys(entry.metadata).length > 0,
  ) || Boolean(entry.user_agent) || Boolean(entry.resource_type)

  return (
    <>
      <tr
        className={`border-b border-dark-800/50 hover:bg-dark-900/40 ${hasExtra ? 'cursor-pointer' : ''}`}
        onClick={() => hasExtra && setOpen((v) => !v)}
      >
        <td className="px-3 py-2.5 text-xs text-dark-500 whitespace-nowrap align-top">
          {new Date(entry.created_at).toLocaleString()}
        </td>
        <td className="px-3 py-2.5 text-dark-200 align-top whitespace-nowrap">
          {entry.username || '—'}
        </td>
        <td className="px-3 py-2.5 align-top">
          <span className="font-mono text-[11px] text-brand-400 block">{entry.action}</span>
          {entry.action_label && entry.action_label !== entry.action && (
            <span className="text-xs text-dark-500">{entry.action_label}</span>
          )}
        </td>
        <td className="px-3 py-2.5 text-dark-300 text-xs align-top max-w-xs">
          {entry.detail || '—'}
        </td>
        <td className="px-3 py-2.5 text-xs text-dark-500 align-top whitespace-nowrap">
          {entry.resource_type ? (
            <>
              <span className="text-dark-400">{entry.resource_type}</span>
              {entry.resource_id && (
                <span className="block font-mono text-[10px] text-dark-600 truncate max-w-[120px]" title={entry.resource_id}>
                  {entry.resource_id}
                </span>
              )}
            </>
          ) : '—'}
        </td>
        <td className="px-3 py-2.5 text-xs text-dark-600 align-top whitespace-nowrap">
          {entry.ip_address || '—'}
        </td>
        <td className="px-3 py-2.5 align-top w-8">
          {hasExtra && (
            open ? <ChevronDown className="h-4 w-4 text-dark-500" /> : <ChevronRight className="h-4 w-4 text-dark-500" />
          )}
        </td>
      </tr>
      {open && hasExtra && (
        <tr className="border-b border-dark-800/50 bg-dark-950/50">
          <td colSpan={7} className="px-4 py-3 space-y-2">
            {entry.user_agent && (
              <p className="text-xs text-dark-500">
                <span className="text-dark-400 font-medium">User agent:</span> {entry.user_agent}
              </p>
            )}
            <MetadataBlock data={entry.metadata ?? null} />
          </td>
        </tr>
      )}
    </>
  )
}

export function ActivityLogPanel() {
  const [filters, setFilters] = useState<ActivityLogFilters>(EMPTY_FILTERS)
  const [draft, setDraft] = useState({ search: '', date_from: '', date_to: '' })
  const [filterOptions, setFilterOptions] = useState<ActivityFilterOptions | null>(null)
  const [items, setItems] = useState<ActivityLog[]>([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadFilters = useCallback(async () => {
    try {
      const opts = await adminApi.activityFilters()
      setFilterOptions(opts)
    } catch {
      /* non-fatal */
    }
  }, [])

  const loadActivity = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await adminApi.listActivity(filters)
      setItems(data.items)
      setTotal(data.total)
      setPages(data.pages)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load activity')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    void loadFilters()
  }, [loadFilters])

  useEffect(() => {
    void loadActivity()
  }, [loadActivity])

  const applyDraft = () => {
    setFilters((f) => ({
      ...f,
      search: draft.search.trim() || undefined,
      date_from: draft.date_from || undefined,
      date_to: draft.date_to || undefined,
      page: 1,
    }))
  }

  const resetFilters = () => {
    setDraft({ search: '', date_from: '', date_to: '' })
    setFilters(EMPTY_FILTERS)
  }

  const actionOptions = useMemo(() => {
    if (!filterOptions) return []
    return filterOptions.actions.map((a) => ({
      value: a,
      label: filterOptions.action_labels[a] ?? a,
    }))
  }, [filterOptions])

  return (
    <div className="space-y-4">
      <div className="card p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-dark-200">
          <Filter className="h-4 w-4 text-brand-500" />
          Filters
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <label className="space-y-1">
            <span className="text-xs text-dark-400">User</span>
            <select
              value={filters.user_id ?? ''}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  user_id: e.target.value ? Number(e.target.value) : undefined,
                  page: 1,
                }))
              }
              className="w-full bg-dark-950 border border-dark-700 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">All users</option>
              {filterOptions?.users.map((u) => (
                <option key={u.id} value={u.id}>{u.username}</option>
              ))}
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-xs text-dark-400">Category</span>
            <select
              value={filters.action_prefix ?? ''}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  action_prefix: e.target.value || undefined,
                  action: undefined,
                  page: 1,
                }))
              }
              className="w-full bg-dark-950 border border-dark-700 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">All categories</option>
              {filterOptions?.action_prefixes.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-xs text-dark-400">Action</span>
            <select
              value={filters.action ?? ''}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  action: e.target.value || undefined,
                  action_prefix: undefined,
                  page: 1,
                }))
              }
              className="w-full bg-dark-950 border border-dark-700 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">All actions</option>
              {actionOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-xs text-dark-400">Resource type</span>
            <select
              value={filters.resource_type ?? ''}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  resource_type: e.target.value || undefined,
                  page: 1,
                }))
              }
              className="w-full bg-dark-950 border border-dark-700 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">All types</option>
              {filterOptions?.resource_types.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-xs text-dark-400">From date</span>
            <input
              type="date"
              value={draft.date_from}
              onChange={(e) => setDraft((d) => ({ ...d, date_from: e.target.value }))}
              className="w-full bg-dark-950 border border-dark-700 rounded-lg px-3 py-2 text-sm"
            />
          </label>

          <label className="space-y-1">
            <span className="text-xs text-dark-400">To date</span>
            <input
              type="date"
              value={draft.date_to}
              onChange={(e) => setDraft((d) => ({ ...d, date_to: e.target.value }))}
              className="w-full bg-dark-950 border border-dark-700 rounded-lg px-3 py-2 text-sm"
            />
          </label>

          <label className="space-y-1 sm:col-span-2">
            <span className="text-xs text-dark-400">Search</span>
            <div className="flex gap-2">
              <input
                type="search"
                value={draft.search}
                onChange={(e) => setDraft((d) => ({ ...d, search: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && applyDraft()}
                placeholder="Detail, username, action, resource…"
                className="flex-1 bg-dark-950 border border-dark-700 rounded-lg px-3 py-2 text-sm"
              />
              <button type="button" onClick={applyDraft} className="btn-primary px-3 py-2 text-sm">
                <Search className="h-4 w-4" />
              </button>
            </div>
          </label>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          <button type="button" onClick={applyDraft} className="btn-primary text-xs px-3 py-1.5">
            Apply filters
          </button>
          <button type="button" onClick={resetFilters} className="btn-ghost text-xs px-3 py-1.5">
            Reset
          </button>
          <button type="button" onClick={() => void loadActivity()} className="btn-ghost text-xs px-3 py-1.5 flex items-center gap-1">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
          <span className="text-xs text-dark-500 ml-auto self-center">
            {total.toLocaleString()} event{total === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      {error && !loading && <ErrorState message={error} onRetry={loadActivity} />}

      {loading && (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="card overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr className="text-left text-dark-500 border-b border-dark-800">
                  <th className="px-3 py-3 font-medium">Time</th>
                  <th className="px-3 py-3 font-medium">User</th>
                  <th className="px-3 py-3 font-medium">Action</th>
                  <th className="px-3 py-3 font-medium">Detail</th>
                  <th className="px-3 py-3 font-medium">Resource</th>
                  <th className="px-3 py-3 font-medium">IP</th>
                  <th className="px-3 py-3 w-8" />
                </tr>
              </thead>
              <tbody>
                {items.map((a) => (
                  <ActivityRow key={a.id} entry={a} />
                ))}
              </tbody>
            </table>
            {items.length === 0 && (
              <p className="text-center text-dark-500 py-12 text-sm">No activity matches your filters.</p>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <label className="flex items-center gap-2 text-dark-400">
              Per page
              <select
                value={filters.page_size ?? 50}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, page_size: Number(e.target.value), page: 1 }))
                }
                className="bg-dark-950 border border-dark-700 rounded-lg px-2 py-1 text-sm"
              >
                {PAGE_SIZES.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </label>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={(filters.page ?? 1) <= 1}
                onClick={() => setFilters((f) => ({ ...f, page: Math.max(1, (f.page ?? 1) - 1) }))}
                className="btn-ghost text-xs px-3 py-1.5 disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-dark-500 text-xs">
                Page {filters.page ?? 1} of {pages}
              </span>
              <button
                type="button"
                disabled={(filters.page ?? 1) >= pages}
                onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) + 1 }))}
                className="btn-ghost text-xs px-3 py-1.5 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
