import { useEffect, useState } from 'react'
import { RefreshCw, ChevronLeft, ChevronRight, Filter, Loader2, X, ExternalLink } from 'lucide-react'
import { useBroadcastStore } from '@/store/useBroadcastStore'
import { MessagePreview } from './MessagePreview'
import type { MessageType, MessageStatus } from '@/types/broadcast'

const STATUS_OPTIONS: MessageStatus[] = ['pending', 'queued', 'sent', 'partial', 'failed', 'cancelled']
const TYPE_OPTIONS: MessageType[] = ['manual', 'signal', 'ai_insight', 'scheduled']

interface BroadcastHistoryProps {
  compact?: boolean
}

export function BroadcastHistory({ compact = false }: BroadcastHistoryProps) {
  const { history, historyLoading, fetchHistory, cancelBroadcast, fetchLogs, activeLogs } =
    useBroadcastStore()

  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [filterType, setFilterType] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<string>('')

  useEffect(() => {
    fetchHistory({ page: 1 })
  }, [fetchHistory])

  const handleViewLogs = async (id: number) => {
    setSelectedId(id)
    await fetchLogs(id)
  }

  const applyFilters = () => {
    fetchHistory({
      page: 1,
      message_type: filterType as MessageType | undefined,
      status: filterStatus as MessageStatus | undefined,
    })
    setShowFilters(false)
  }

  const clearFilters = () => {
    setFilterType('')
    setFilterStatus('')
    fetchHistory({ page: 1, message_type: undefined, status: undefined })
  }

  const goToPage = (p: number) => fetchHistory({ page: p })

  if (compact) {
    return (
      <div className="space-y-2">
        {historyLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-dark-500" />
          </div>
        ) : (history?.items ?? []).length === 0 ? (
          <p className="text-center text-xs text-dark-500 py-4">No broadcasts yet.</p>
        ) : (
          (history?.items ?? []).slice(0, 8).map((msg) => (
            <MessagePreview key={msg.id} message={msg} compact />
          ))
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters((p) => !p)}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors ${
              showFilters || filterType || filterStatus
                ? 'border-brand-500 text-brand-400 bg-brand-900/20'
                : 'border-dark-600 text-dark-400 hover:border-dark-400 hover:text-dark-200'
            }`}
          >
            <Filter className="h-3.5 w-3.5" />
            Filters
            {(filterType || filterStatus) && (
              <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
            )}
          </button>
          {(filterType || filterStatus) && (
            <button onClick={clearFilters} className="text-xs text-dark-500 hover:text-dark-300">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <button
          onClick={() => fetchHistory()}
          className="p-1.5 text-dark-400 hover:text-dark-200 transition-colors"
          title="Refresh"
        >
          <RefreshCw className={`h-4 w-4 ${historyLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-4 flex gap-4 flex-wrap">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-dark-500">Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-dark-700 border border-dark-600 rounded-lg px-2 py-1.5 text-sm text-dark-200 focus:outline-none"
            >
              <option value="">All types</option>
              {TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-dark-500">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-dark-700 border border-dark-600 rounded-lg px-2 py-1.5 text-sm text-dark-200 focus:outline-none"
            >
              <option value="">All statuses</option>
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={applyFilters}
              className="px-4 py-1.5 text-sm bg-brand-600 hover:bg-brand-500 text-white rounded-lg transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      )}

      {/* Message list */}
      {historyLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-dark-500" />
        </div>
      ) : (history?.items ?? []).length === 0 ? (
        <div className="text-center py-12 text-dark-500 text-sm">No broadcasts found.</div>
      ) : (
        <div className="space-y-2">
          {(history?.items ?? []).map((msg) => (
            <div key={msg.id}>
              <MessagePreview message={msg} compact />
              <div className="flex gap-2 mt-1 ml-1">
                <button
                  onClick={() => handleViewLogs(msg.id)}
                  className="text-[11px] text-dark-500 hover:text-brand-400 flex items-center gap-1 transition-colors"
                >
                  <ExternalLink className="h-3 w-3" />
                  Delivery logs
                </button>
                {(msg.status === 'pending' || msg.status === 'queued') && (
                  <button
                    onClick={() => {
                      if (confirm('Cancel this broadcast?')) cancelBroadcast(msg.id)
                    }}
                    className="text-[11px] text-dark-500 hover:text-red-400 transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>

              {/* Inline logs panel */}
              {selectedId === msg.id && (
                <div className="mt-2 ml-2 bg-dark-900 border border-dark-700 rounded-lg p-3 space-y-1.5">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-xs font-semibold text-dark-300">Delivery Logs</h5>
                    <button onClick={() => setSelectedId(null)} className="text-dark-500 hover:text-dark-300">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  {activeLogs.length === 0 ? (
                    <p className="text-xs text-dark-500">No logs yet.</p>
                  ) : (
                    activeLogs.map((log) => (
                      <div key={log.id} className="flex items-center gap-3 text-xs">
                        <span className={`font-medium ${log.status === 'sent' ? 'text-green-400' : log.status === 'failed' ? 'text-red-400' : 'text-dark-400'}`}>
                          {log.status.toUpperCase()}
                        </span>
                        <span className="text-dark-500">ch={log.channel_id}</span>
                        {log.telegram_msg_id && (
                          <span className="text-dark-600 font-mono">tg={log.telegram_msg_id}</span>
                        )}
                        {log.error_message && (
                          <span className="text-red-400 truncate max-w-[200px]">{log.error_message}</span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {history && history.pages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-2">
          <button
            onClick={() => goToPage(history.page - 1)}
            disabled={history.page <= 1}
            className="p-1.5 text-dark-400 hover:text-dark-200 disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-xs text-dark-400">
            Page {history.page} of {history.pages}
            <span className="ml-2 text-dark-600">({history.total} total)</span>
          </span>
          <button
            onClick={() => goToPage(history.page + 1)}
            disabled={history.page >= history.pages}
            className="p-1.5 text-dark-400 hover:text-dark-200 disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}
