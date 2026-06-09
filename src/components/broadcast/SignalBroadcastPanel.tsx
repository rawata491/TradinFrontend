import { useState } from 'react'
import { Zap, TrendingUp, TrendingDown, LogOut, Loader2, Send } from 'lucide-react'
import { useBroadcastStore } from '@/store/useBroadcastStore'
import type { SignalBroadcastRequest } from '@/types/broadcast'

const SIGNAL_TYPES = [
  { value: 'BUY', label: 'BUY', icon: TrendingUp, color: 'text-green-400 border-green-700 bg-green-900/20' },
  { value: 'SELL', label: 'SELL', icon: TrendingDown, color: 'text-red-400 border-red-700 bg-red-900/20' },
  { value: 'EXIT', label: 'EXIT', icon: LogOut, color: 'text-yellow-400 border-yellow-700 bg-yellow-900/20' },
] as const

const TIMEFRAMES = ['1m', '5m', '15m', '30m', '1H', '4H', '1D', '1W']
const SENTIMENTS = ['Bullish', 'Bearish', 'Neutral', 'Very Bullish', 'Very Bearish']

export function SignalBroadcastPanel() {
  const { sending, sendSignal, error } = useBroadcastStore()

  const [form, setForm] = useState<SignalBroadcastRequest>({
    symbol: 'BTC-USD',
    signal_type: 'BUY',
    strategy: '',
    timeframe: '15m',
    price: undefined,
    reason: '',
    sentiment: '',
    ai_commentary: '',
  })
  const [success, setSuccess] = useState(false)

  const handleSend = async () => {
    if (!form.strategy.trim()) return
    try {
      await sendSignal({
        ...form,
        price: form.price || undefined,
        reason: form.reason || undefined,
        sentiment: form.sentiment || undefined,
        ai_commentary: form.ai_commentary || undefined,
      })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (_) {}
  }

  return (
    <div className="bg-dark-900 border border-dark-700 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3 border-b border-dark-700 bg-dark-950">
        <Zap className="h-4 w-4 text-yellow-400" />
        <h3 className="text-sm font-semibold text-dark-100">Signal Broadcast</h3>
        <span className="text-xs text-dark-500 ml-auto">Manual trigger</span>
      </div>

      <div className="p-5 space-y-4">
        {/* Signal type selector */}
        <div>
          <label className="text-xs font-medium text-dark-400 mb-2 block">Signal Type</label>
          <div className="flex gap-2">
            {SIGNAL_TYPES.map(({ value, label, icon: Icon, color }) => (
              <button
                key={value}
                onClick={() => setForm((p) => ({ ...p, signal_type: value }))}
                className={`flex items-center gap-1.5 flex-1 justify-center py-2.5 text-sm font-bold rounded-lg border transition-all ${
                  form.signal_type === value
                    ? color
                    : 'text-dark-500 border-dark-700 bg-dark-800 hover:border-dark-500'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Symbol + price */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-dark-400 mb-1 block">Symbol</label>
            <input
              type="text"
              value={form.symbol}
              onChange={(e) => setForm((p) => ({ ...p, symbol: e.target.value.toUpperCase() }))}
              placeholder="BTC-USD"
              className="w-full bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 text-sm text-dark-100 placeholder-dark-500 focus:outline-none focus:border-brand-500 font-mono"
            />
          </div>
          <div>
            <label className="text-xs text-dark-400 mb-1 block">Entry Price</label>
            <input
              type="number"
              value={form.price ?? ''}
              onChange={(e) => setForm((p) => ({ ...p, price: e.target.value ? Number(e.target.value) : undefined }))}
              placeholder="109240.00"
              className="w-full bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 text-sm text-dark-100 placeholder-dark-500 focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        {/* Strategy + timeframe */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-dark-400 mb-1 block">Strategy Name</label>
            <input
              type="text"
              value={form.strategy}
              onChange={(e) => setForm((p) => ({ ...p, strategy: e.target.value }))}
              placeholder="EMA Cross"
              className="w-full bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 text-sm text-dark-100 placeholder-dark-500 focus:outline-none focus:border-brand-500"
            />
          </div>
          <div>
            <label className="text-xs text-dark-400 mb-1 block">Timeframe</label>
            <select
              value={form.timeframe}
              onChange={(e) => setForm((p) => ({ ...p, timeframe: e.target.value }))}
              className="w-full bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 text-sm text-dark-100 focus:outline-none focus:border-brand-500"
            >
              {TIMEFRAMES.map((tf) => <option key={tf} value={tf}>{tf}</option>)}
            </select>
          </div>
        </div>

        {/* Reason */}
        <div>
          <label className="text-xs text-dark-400 mb-1 block">Reason / Signal Logic</label>
          <textarea
            value={form.reason ?? ''}
            onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))}
            placeholder="EMA20 crossed above EMA50…"
            rows={2}
            className="w-full bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 text-sm text-dark-100 placeholder-dark-500 focus:outline-none focus:border-brand-500 resize-none"
          />
        </div>

        {/* Sentiment + AI commentary */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-dark-400 mb-1 block">AI Sentiment</label>
            <select
              value={form.sentiment ?? ''}
              onChange={(e) => setForm((p) => ({ ...p, sentiment: e.target.value || undefined }))}
              className="w-full bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 text-sm text-dark-100 focus:outline-none focus:border-brand-500"
            >
              <option value="">— None —</option>
              {SENTIMENTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-dark-400 mb-1 block">AI Commentary</label>
            <input
              type="text"
              value={form.ai_commentary ?? ''}
              onChange={(e) => setForm((p) => ({ ...p, ai_commentary: e.target.value || undefined }))}
              placeholder="Breakout on ETF inflow…"
              className="w-full bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 text-sm text-dark-100 placeholder-dark-500 focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        {error && (
          <p className="text-xs text-red-400 bg-red-900/20 border border-red-900/40 rounded px-3 py-2">
            {error}
          </p>
        )}
        {success && (
          <p className="text-xs text-green-400 bg-green-900/20 border border-green-900/40 rounded px-3 py-2">
            ✅ Signal broadcast queued successfully!
          </p>
        )}

        <button
          onClick={handleSend}
          disabled={sending || !form.strategy.trim()}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-yellow-600 hover:bg-yellow-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {sending ? 'Broadcasting…' : `Broadcast ${form.signal_type} Signal`}
        </button>
      </div>
    </div>
  )
}
