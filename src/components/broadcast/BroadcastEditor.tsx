import { useState, useCallback } from 'react'
import { Send, Calendar, FileText, Hash, Eye, EyeOff } from 'lucide-react'
import { useTelegramStore } from '@/store/useTelegramStore'
import { useBroadcastStore } from '@/store/useBroadcastStore'
import type { BroadcastSendRequest, BroadcastScheduleRequest, ParseMode } from '@/types/broadcast'
import { localDateTimeToUTCIso } from '@/utils/formatters'

const EMOJI_QUICK = ['🚀', '🔴', '📈', '📉', '⚡', '💰', '🤖', '⚠️', '✅', '🔔', '💡', '🎯']

interface BroadcastEditorProps {
  onSent?: () => void
}

export function BroadcastEditor({ onSent }: BroadcastEditorProps) {
  const { channels } = useTelegramStore()
  const { templates, sending, sendBroadcast, scheduleBroadcast, error } = useBroadcastStore()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [parseMode, setParseMode] = useState<ParseMode>('Markdown')
  const [selectedChannels, setSelectedChannels] = useState<number[]>([])
  const [templateId, setTemplateId] = useState<number | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduleTime, setScheduleTime] = useState('')
  const [isScheduling, setIsScheduling] = useState(false)

  const charCount = content.length
  const isOverLimit = charCount > 4096

  const insertEmoji = (emoji: string) => {
    setContent((prev) => prev + emoji)
  }

  const insertTemplate = (id: number) => {
    const tpl = templates.find((t) => t.id === id)
    if (tpl) {
      setContent(tpl.content)
      setTemplateId(id)
      setParseMode(tpl.parse_mode as ParseMode)
    }
  }

  const toggleChannel = (id: number) => {
    setSelectedChannels((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    )
  }

  const handleSend = useCallback(async () => {
    if (!content.trim() || isOverLimit) return

    const payload: BroadcastSendRequest = {
      content: content.trim(),
      title: title.trim() || undefined,
      parse_mode: parseMode,
      channel_ids: selectedChannels.length > 0 ? selectedChannels : undefined,
      template_id: templateId ?? undefined,
    }

    if (isScheduling && scheduleDate && scheduleTime) {
      const isoDate = localDateTimeToUTCIso(scheduleDate, scheduleTime)
      await scheduleBroadcast({ ...payload, scheduled_at: isoDate } as BroadcastScheduleRequest)
    } else {
      await sendBroadcast(payload)
    }

    setTitle('')
    setContent('')
    setSelectedChannels([])
    setTemplateId(null)
    setScheduleDate('')
    setScheduleTime('')
    setIsScheduling(false)
    onSent?.()
  }, [content, title, parseMode, selectedChannels, templateId, isScheduling, scheduleDate, scheduleTime, sendBroadcast, scheduleBroadcast, isOverLimit, onSent])

  return (
    <div className="bg-dark-900 border border-dark-700 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-dark-700 bg-dark-950">
        <h3 className="text-sm font-semibold text-dark-100 flex items-center gap-2">
          <Send className="h-4 w-4 text-brand-400" />
          Compose Broadcast
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview((p) => !p)}
            className="flex items-center gap-1.5 text-xs text-dark-400 hover:text-dark-200 transition-colors"
          >
            {showPreview ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {showPreview ? 'Edit' : 'Preview'}
          </button>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-medium text-dark-400 mb-1.5">
            Title <span className="text-dark-600">(optional)</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Broadcast title..."
            className="w-full bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 text-sm text-dark-100 placeholder-dark-500 focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>

        {/* Template selector */}
        {templates.length > 0 && (
          <div>
            <label className="block text-xs font-medium text-dark-400 mb-1.5 flex items-center gap-1">
              <FileText className="h-3.5 w-3.5" />
              Load Template
            </label>
            <select
              value={templateId ?? ''}
              onChange={(e) => e.target.value && insertTemplate(Number(e.target.value))}
              className="w-full bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 text-sm text-dark-100 focus:outline-none focus:border-brand-500 transition-colors"
            >
              <option value="">— Select a template —</option>
              {templates.map((tpl) => (
                <option key={tpl.id} value={tpl.id}>
                  [{tpl.category}] {tpl.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Content editor / preview */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium text-dark-400">Message Content</label>
            <span
              className={`text-xs font-mono ${isOverLimit ? 'text-red-400' : charCount > 3500 ? 'text-yellow-400' : 'text-dark-500'}`}
            >
              {charCount} / 4096
            </span>
          </div>

          {showPreview ? (
            <div className="bg-dark-800 border border-dark-600 rounded-lg p-4 min-h-[160px] text-sm text-dark-200 whitespace-pre-wrap font-mono leading-relaxed">
              {content || <span className="text-dark-600">Nothing to preview…</span>}
            </div>
          ) : (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Type your message… Supports *bold*, _italic_, `code` Markdown"
              rows={7}
              className="w-full bg-dark-800 border border-dark-600 rounded-lg px-3 py-2.5 text-sm text-dark-100 placeholder-dark-500 focus:outline-none focus:border-brand-500 transition-colors resize-none font-mono leading-relaxed"
            />
          )}

          {/* Emoji bar */}
          <div className="flex items-center gap-1 mt-2 flex-wrap">
            {EMOJI_QUICK.map((e) => (
              <button
                key={e}
                onClick={() => insertEmoji(e)}
                className="text-base hover:scale-125 transition-transform leading-none"
                title={`Insert ${e}`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* Parse mode */}
        <div className="flex items-center gap-4">
          <label className="text-xs font-medium text-dark-400">Format:</label>
          {(['Markdown', 'HTML'] as ParseMode[]).map((mode) => (
            <label key={mode} className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                checked={parseMode === mode}
                onChange={() => setParseMode(mode)}
                className="accent-brand-500"
              />
              <span className="text-xs text-dark-300">{mode}</span>
            </label>
          ))}
        </div>

        {/* Channel selector */}
        <div>
          <label className="block text-xs font-medium text-dark-400 mb-2 flex items-center gap-1">
            <Hash className="h-3.5 w-3.5" />
            Target Channels
            <span className="text-dark-600 ml-1">(empty = all active channels)</span>
          </label>
          {channels.length === 0 ? (
            <p className="text-xs text-dark-500 italic">No channels configured yet.</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {channels.map((ch) => (
                <label
                  key={ch.id}
                  className={`flex items-center gap-2 cursor-pointer p-2 rounded-lg border text-xs transition-colors ${
                    selectedChannels.includes(ch.id)
                      ? 'border-brand-500 bg-brand-500/10 text-dark-100'
                      : 'border-dark-600 bg-dark-800 text-dark-400 hover:border-dark-400'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedChannels.includes(ch.id)}
                    onChange={() => toggleChannel(ch.id)}
                    className="accent-brand-500"
                  />
                  <span className="truncate">{ch.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Schedule toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsScheduling((p) => !p)}
            className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
              isScheduling ? 'text-brand-400' : 'text-dark-500 hover:text-dark-300'
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            {isScheduling ? 'Scheduling enabled' : 'Schedule for later'}
          </button>
        </div>

        {isScheduling && (
          <div className="space-y-1.5">
            <div className="flex gap-3">
              <input
                type="date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                className="flex-1 bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 text-sm text-dark-100 focus:outline-none focus:border-brand-500"
              />
              <input
                type="time"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                className="flex-1 bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 text-sm text-dark-100 focus:outline-none focus:border-brand-500"
              />
            </div>
            <p className="text-[10px] text-dark-500">Time is in IST (Asia/Kolkata, UTC+05:30)</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-xs text-red-400 bg-red-900/20 border border-red-900/40 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={sending || !content.trim() || isOverLimit}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-brand-600 hover:bg-brand-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
        >
          {sending ? (
            <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          {sending ? 'Sending…' : isScheduling ? 'Schedule Broadcast' : 'Send Broadcast'}
        </button>
      </div>
    </div>
  )
}
