import { useEffect, useState } from 'react'
import { Plus, Trash2, CheckCircle, XCircle, ToggleLeft, ToggleRight, Send, Loader2, Search, RefreshCw, Info } from 'lucide-react'
import { useTelegramStore } from '@/store/useTelegramStore'
import { telegramApi } from '@/services/telegramApi'
import type { TelegramChannelCreate, ChannelType } from '@/types/broadcast'

const CHANNEL_TYPE_LABELS: Record<ChannelType, string> = {
  group: '👥 Group',
  channel: '📢 Channel',
  private: '🔒 Private',
  supergroup: '🏢 Supergroup',
}

type AddMode = 'discover' | 'manual'

interface DiscoveredChat {
  chat_id: string
  title: string
  type: string
  username?: string
  already_added: boolean
}

const BLANK_FORM: TelegramChannelCreate = {
  chat_id: '',
  name: '',
  channel_type: 'group',
  description: '',
  send_signals: true,
  send_ai: true,
  send_news: false,
}

export function ChannelSelector() {
  const { channels, loading, fetchChannels, createChannel, updateChannel, deleteChannel } =
    useTelegramStore()

  const [showAdd, setShowAdd] = useState(false)
  const [addMode, setAddMode] = useState<AddMode>('discover')

  // ── Discover mode state ────────────────────────────────────────────────────
  const [discovering, setDiscovering] = useState(false)
  const [discovered, setDiscovered] = useState<DiscoveredChat[] | null>(null)
  const [discoverHint, setDiscoverHint] = useState<string | null>(null)
  const [discoverError, setDiscoverError] = useState<string | null>(null)
  const [addingChatId, setAddingChatId] = useState<string | null>(null)

  // ── Manual mode state ──────────────────────────────────────────────────────
  const [form, setForm] = useState<TelegramChannelCreate>(BLANK_FORM)
  const [validating, setValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<null | {
    valid: boolean; title?: string; type?: string; member_count?: number; error?: string
  }>(null)
  const [adding, setAdding] = useState(false)

  // ── Channel list actions ───────────────────────────────────────────────────
  const [testingId, setTestingId] = useState<number | null>(null)

  useEffect(() => {
    fetchChannels(false)
  }, [fetchChannels])

  // ── Discover ───────────────────────────────────────────────────────────────

  const handleDiscover = async () => {
    setDiscovering(true)
    setDiscoverError(null)
    setDiscoverHint(null)
    try {
      const result = await telegramApi.discoverChats()
      if (result.ok) {
        setDiscovered(result.chats)
        setDiscoverHint(result.hint ?? null)
      } else {
        setDiscoverError(result.error ?? 'Discovery failed')
      }
    } catch (e) {
      setDiscoverError((e as Error).message)
    } finally {
      setDiscovering(false)
    }
  }

  const handleQuickAdd = async (chat: DiscoveredChat) => {
    setAddingChatId(chat.chat_id)
    try {
      await createChannel({
        chat_id: chat.chat_id,
        name: chat.title,
        channel_type: (chat.type as ChannelType) ?? 'group',
        send_signals: true,
        send_ai: true,
        send_news: false,
      })
      // Refresh discovered list to mark as added
      setDiscovered((prev) =>
        prev ? prev.map((c) => c.chat_id === chat.chat_id ? { ...c, already_added: true } : c) : prev
      )
    } catch (e) {
      alert((e as Error).message)
    } finally {
      setAddingChatId(null)
    }
  }

  // ── Manual validate + add ──────────────────────────────────────────────────

  const handleValidate = async () => {
    const raw = form.chat_id.trim()
    if (!raw) return
    // Auto-prepend @ for plain usernames
    const normalized =
      raw.startsWith('@') || raw.startsWith('-') || /^\d+$/.test(raw) ? raw : `@${raw}`
    if (normalized !== form.chat_id) setForm((p) => ({ ...p, chat_id: normalized }))

    setValidating(true)
    try {
      const result = await telegramApi.validateChat(normalized)
      setValidationResult(result)
      if (result.valid && result.title) {
        setForm((p) => ({
          ...p,
          name: p.name || result.title || '',
          channel_type: (result.type as ChannelType) ?? p.channel_type,
        }))
      }
    } catch (e) {
      setValidationResult({ valid: false, error: (e as Error).message })
    } finally {
      setValidating(false)
    }
  }

  const handleManualAdd = async () => {
    if (!form.chat_id || !form.name) return
    if (validationResult && !validationResult.valid) return
    setAdding(true)
    try {
      await createChannel({ ...form, description: form.description || undefined })
      setShowAdd(false)
      setForm(BLANK_FORM)
      setValidationResult(null)
    } catch (e) {
      alert((e as Error).message)
    } finally {
      setAdding(false)
    }
  }

  const handleTest = async (channel: typeof channels[0]) => {
    setTestingId(channel.id)
    try {
      const result = await telegramApi.sendTestMessage(channel.chat_id)
      if (result.ok) {
        alert(`✅ Test message sent! (msg_id: ${result.message_id})`)
      } else {
        alert(`❌ Telegram error:\n${result.error ?? 'Unknown error'}\n\nMake sure the bot is an admin of this chat.`)
      }
    } catch (e) {
      alert(`❌ ${(e as Error).message}`)
    } finally {
      setTestingId(null)
    }
  }

  const resetAdd = () => {
    setShowAdd(false)
    setForm(BLANK_FORM)
    setValidationResult(null)
    setDiscovered(null)
    setDiscoverError(null)
    setDiscoverHint(null)
  }

  return (
    <div className="space-y-4">
      {/* Channel list */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-dark-500" />
        </div>
      ) : channels.length === 0 && !showAdd ? (
        <div className="text-center py-6 text-dark-500 text-sm">
          No channels added yet.
        </div>
      ) : (
        <div className="space-y-2">
          {channels.map((ch) => (
            <div key={ch.id} className="flex items-start justify-between p-3.5 bg-dark-800 border border-dark-700 rounded-xl hover:border-dark-500 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-dark-100">{ch.name}</span>
                  <span className="text-[10px] text-dark-500 font-mono bg-dark-700 px-1.5 py-0.5 rounded">{ch.chat_id}</span>
                  <span className="text-[10px] text-dark-400">{CHANNEL_TYPE_LABELS[ch.channel_type]}</span>
                  {!ch.is_active && <span className="text-[10px] text-dark-500 bg-dark-700 px-1.5 rounded">Inactive</span>}
                </div>
                <div className="flex gap-3 mt-2 text-[11px]">
                  <span className={ch.send_signals ? 'text-green-400' : 'text-dark-600'}>📊 Signals</span>
                  <span className={ch.send_ai ? 'text-green-400' : 'text-dark-600'}>🧠 AI</span>
                  <span className={ch.send_news ? 'text-green-400' : 'text-dark-600'}>📰 News</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 ml-3 flex-shrink-0">
                <button
                  onClick={() => updateChannel(ch.id, { is_active: !ch.is_active })}
                  className={`p-1.5 rounded-lg transition-colors ${ch.is_active ? 'text-green-400 hover:bg-green-900/20' : 'text-dark-500 hover:bg-dark-700'}`}
                  title={ch.is_active ? 'Deactivate' : 'Activate'}
                >
                  {ch.is_active ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => handleTest(ch)}
                  disabled={testingId === ch.id}
                  className="p-1.5 rounded-lg text-dark-400 hover:text-brand-400 hover:bg-brand-900/20 transition-colors disabled:opacity-40"
                  title="Send test message"
                >
                  {testingId === ch.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => { if (confirm(`Remove "${ch.name}"?`)) deleteChannel(ch.id) }}
                  className="p-1.5 rounded-lg text-dark-500 hover:text-red-400 hover:bg-red-900/20 transition-colors"
                  title="Remove channel"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add panel */}
      {showAdd ? (
        <div className="bg-dark-800 border border-dark-600 rounded-xl overflow-hidden">
          {/* Mode tabs */}
          <div className="flex border-b border-dark-700">
            <button
              onClick={() => setAddMode('discover')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-medium transition-colors ${
                addMode === 'discover' ? 'bg-dark-700 text-dark-100' : 'text-dark-500 hover:text-dark-300'
              }`}
            >
              <Search className="h-3.5 w-3.5" />
              Discover Chats
            </button>
            <button
              onClick={() => setAddMode('manual')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-medium transition-colors ${
                addMode === 'manual' ? 'bg-dark-700 text-dark-100' : 'text-dark-500 hover:text-dark-300'
              }`}
            >
              <Plus className="h-3.5 w-3.5" />
              Manual Entry
            </button>
          </div>

          <div className="p-4">
            {/* ── DISCOVER MODE ──────────────────────────────────────────── */}
            {addMode === 'discover' && (
              <div className="space-y-3">
                {/* How-to banner */}
                <div className="flex gap-2.5 bg-brand-900/20 border border-brand-800/50 rounded-xl p-3">
                  <Info className="h-4 w-4 text-brand-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-dark-300 space-y-1 leading-relaxed">
                    <p className="font-semibold text-brand-300">How to connect a group or channel:</p>
                    <ol className="list-none space-y-0.5 text-dark-400">
                      <li><span className="text-brand-400 font-bold">1.</span> Add your bot to the Telegram group or channel</li>
                      <li><span className="text-brand-400 font-bold">2.</span> Promote the bot to <span className="text-yellow-400 font-medium">Admin</span> (so it can post messages)</li>
                      <li><span className="text-brand-400 font-bold">3.</span> <span className="text-white">Send any message</span> in that chat (e.g. "hello")</li>
                      <li><span className="text-brand-400 font-bold">4.</span> Click <span className="text-white">Discover</span> below — it will appear in the list</li>
                    </ol>
                  </div>
                </div>

                <button
                  onClick={handleDiscover}
                  disabled={discovering}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-dark-700 hover:bg-dark-600 border border-dark-500 text-sm text-dark-100 font-medium rounded-lg transition-colors disabled:opacity-40"
                >
                  {discovering
                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Scanning Telegram…</>
                    : <><RefreshCw className="h-4 w-4" /> {discovered ? 'Refresh' : 'Discover Chats'}</>
                  }
                </button>

                {discoverError && (
                  <p className="text-xs text-red-400 bg-red-900/20 border border-red-900/30 rounded-lg px-3 py-2">{discoverError}</p>
                )}

                {discovered !== null && discovered.length === 0 && (
                  <div className="text-xs text-dark-400 bg-dark-900 border border-dark-700 rounded-xl p-4 leading-relaxed">
                    <p className="font-semibold text-dark-300 mb-2">No chats found yet.</p>
                    {discoverHint && <p>{discoverHint}</p>}
                    <p className="mt-2">If you just added the bot, make sure to <span className="text-white">send a message in the group</span> first, then click Refresh.</p>
                  </div>
                )}

                {discovered && discovered.length > 0 && (
                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {discovered.map((chat) => (
                      <div key={chat.chat_id} className="flex items-center justify-between p-3 bg-dark-900 border border-dark-700 rounded-xl">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-dark-100">{chat.title}</span>
                            <span className="text-[10px] text-dark-500">{chat.type}</span>
                            {chat.username && (
                              <span className="text-[10px] font-mono text-brand-400">@{chat.username}</span>
                            )}
                          </div>
                          <span className="text-[11px] font-mono text-dark-500">{chat.chat_id}</span>
                        </div>
                        {chat.already_added ? (
                          <span className="text-xs text-green-400 flex items-center gap-1 flex-shrink-0 ml-3">
                            <CheckCircle className="h-3.5 w-3.5" /> Added
                          </span>
                        ) : (
                          <button
                            onClick={() => handleQuickAdd(chat)}
                            disabled={addingChatId === chat.chat_id}
                            className="ml-3 flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-brand-600 hover:bg-brand-500 text-white rounded-lg transition-colors disabled:opacity-40"
                          >
                            {addingChatId === chat.chat_id
                              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              : <Plus className="h-3.5 w-3.5" />
                            }
                            Add
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── MANUAL MODE ────────────────────────────────────────────── */}
            {addMode === 'manual' && (
              <div className="space-y-3">
                <div className="text-[11px] text-dark-500 bg-dark-900 rounded-lg px-3 py-2 leading-relaxed">
                  <span className="font-mono text-dark-300">@username</span> for public channels/groups
                  &nbsp;·&nbsp;
                  <span className="font-mono text-dark-300">-100…</span> numeric ID for private groups
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.chat_id}
                    onChange={(e) => { setForm((p) => ({ ...p, chat_id: e.target.value })); setValidationResult(null) }}
                    placeholder="@MyChannel or -1001234567890"
                    className="flex-1 bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-sm text-dark-100 placeholder-dark-500 focus:outline-none focus:border-brand-500 font-mono"
                  />
                  <button
                    onClick={handleValidate}
                    disabled={validating || !form.chat_id.trim()}
                    className="px-3 py-2 text-xs bg-dark-700 border border-dark-600 rounded-lg text-dark-300 hover:text-dark-100 hover:border-dark-400 disabled:opacity-40 transition-colors"
                  >
                    {validating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Validate'}
                  </button>
                </div>

                {validationResult && (
                  <div className={`flex items-start gap-2 text-xs px-3 py-2 rounded-lg border ${
                    validationResult.valid
                      ? 'bg-green-900/20 border-green-900 text-green-400'
                      : 'bg-red-900/20 border-red-900 text-red-400'
                  }`}>
                    {validationResult.valid
                      ? <CheckCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                      : <XCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                    }
                    <div>
                      {validationResult.valid
                        ? `${validationResult.title} • ${validationResult.type} • ${validationResult.member_count} members`
                        : <>
                            <p>{validationResult.error}</p>
                            <p className="mt-1 text-red-300">
                              Use <span className="font-mono">Discover Chats</span> tab to find the correct numeric ID automatically.
                            </p>
                          </>
                      }
                    </div>
                  </div>
                )}

                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Display name"
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-sm text-dark-100 placeholder-dark-500 focus:outline-none focus:border-brand-500"
                />

                <select
                  value={form.channel_type}
                  onChange={(e) => setForm((p) => ({ ...p, channel_type: e.target.value as ChannelType }))}
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-sm text-dark-100 focus:outline-none focus:border-brand-500"
                >
                  {(Object.keys(CHANNEL_TYPE_LABELS) as ChannelType[]).map((t) => (
                    <option key={t} value={t}>{CHANNEL_TYPE_LABELS[t]}</option>
                  ))}
                </select>

                <div className="flex gap-4">
                  {(['send_signals', 'send_ai', 'send_news'] as const).map((field) => (
                    <label key={field} className="flex items-center gap-2 cursor-pointer text-xs text-dark-300">
                      <input
                        type="checkbox"
                        checked={form[field]}
                        onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.checked }))}
                        className="accent-brand-500"
                      />
                      {field === 'send_signals' ? 'Signals' : field === 'send_ai' ? 'AI' : 'News'}
                    </label>
                  ))}
                </div>

                <button
                  onClick={handleManualAdd}
                  disabled={adding || !form.chat_id || !form.name || (validationResult !== null && !validationResult.valid)}
                  className="w-full py-2 text-sm font-medium bg-brand-600 hover:bg-brand-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  {adding ? 'Adding…' : 'Add Channel'}
                </button>
              </div>
            )}

            <button
              onClick={resetAdd}
              className="w-full mt-3 py-1.5 text-xs text-dark-500 hover:text-dark-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAdd(true)}
          className="w-full flex items-center justify-center gap-2 py-2.5 border border-dashed border-dark-600 rounded-xl text-sm text-dark-400 hover:text-dark-200 hover:border-dark-400 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Channel
        </button>
      )}
    </div>
  )
}
