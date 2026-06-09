import type { BroadcastMessage } from '@/types/broadcast'
import { formatIST } from '@/utils/formatters'

const STATUS_STYLES: Record<string, string> = {
  pending:   'bg-yellow-900/30 text-yellow-400 border-yellow-800',
  queued:    'bg-blue-900/30 text-blue-400 border-blue-800',
  sent:      'bg-green-900/30 text-green-400 border-green-800',
  partial:   'bg-orange-900/30 text-orange-400 border-orange-800',
  failed:    'bg-red-900/30 text-red-400 border-red-800',
  cancelled: 'bg-dark-700 text-dark-400 border-dark-600',
}

const TYPE_LABEL: Record<string, string> = {
  manual:     '✍️ Manual',
  signal:     '📊 Signal',
  ai_insight: '🧠 AI Insight',
  news:       '📰 News',
  scheduled:  '📅 Scheduled',
}

interface MessagePreviewProps {
  message: BroadcastMessage
  compact?: boolean
}

export function MessagePreview({ message, compact = false }: MessagePreviewProps) {
  const statusClass = STATUS_STYLES[message.status] ?? STATUS_STYLES.pending

  if (compact) {
    return (
      <div className="flex items-start gap-3 p-3 bg-dark-800 rounded-lg border border-dark-700 hover:border-dark-500 transition-colors">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs text-dark-400">{TYPE_LABEL[message.message_type] ?? message.message_type}</span>
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${statusClass}`}>
              {message.status.toUpperCase()}
            </span>
          </div>
          {message.title && (
            <p className="text-xs font-semibold text-dark-200 truncate">{message.title}</p>
          )}
          <p className="text-xs text-dark-400 line-clamp-2 mt-0.5 font-mono">{message.content}</p>
          <p className="text-[10px] text-dark-600 mt-1">
            {formatIST(message.created_at)}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-dark-900 border border-dark-700 rounded-xl overflow-hidden">
      {/* Meta bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-dark-950 border-b border-dark-700">
        <div className="flex items-center gap-3">
          <span className="text-xs text-dark-400">{TYPE_LABEL[message.message_type] ?? message.message_type}</span>
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded border ${statusClass}`}>
            {message.status.toUpperCase()}
          </span>
        </div>
        <span className="text-[10px] text-dark-500 font-mono">#{message.id}</span>
      </div>

      {/* Content */}
      <div className="p-4">
        {message.title && (
          <h4 className="text-sm font-semibold text-dark-100 mb-2">{message.title}</h4>
        )}
        <div className="bg-dark-800 rounded-lg p-3">
          <pre className="text-xs text-dark-300 whitespace-pre-wrap font-mono leading-relaxed">
            {message.content}
          </pre>
        </div>

        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-[11px] text-dark-500">
          <span>Created: {formatIST(message.created_at)}</span>
          {message.sent_at && (
            <span className="text-green-400">Sent: {formatIST(message.sent_at)}</span>
          )}
          {message.scheduled_at && !message.sent_at && (
            <span className="text-yellow-400">
              Scheduled: {formatIST(message.scheduled_at)}
            </span>
          )}
          <span>Attempts: {message.attempt_count}/{message.max_attempts}</span>
          {message.target_channel_ids && message.target_channel_ids.length > 0 && (
            <span>Channels: {message.target_channel_ids.join(', ')}</span>
          )}
        </div>

        {message.last_error && (
          <div className="mt-2 text-xs text-red-400 bg-red-900/20 border border-red-900/30 rounded p-2">
            Error: {message.last_error}
          </div>
        )}
      </div>
    </div>
  )
}
