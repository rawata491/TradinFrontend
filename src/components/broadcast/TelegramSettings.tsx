import { useState } from 'react'
import { Bot, CheckCircle, XCircle, Settings, Loader2, RefreshCw } from 'lucide-react'
import { useTelegramStore } from '@/store/useTelegramStore'
import { formatDateIST } from '@/utils/formatters'

export function TelegramSettings() {
  const { botInfo, botTesting, testBot } = useTelegramStore()
  const [lastTested, setLastTested] = useState<Date | null>(null)

  const handleTest = async () => {
    await testBot()
    setLastTested(new Date())
  }

  return (
    <div className="bg-dark-900 border border-dark-700 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3 border-b border-dark-700 bg-dark-950">
        <Settings className="h-4 w-4 text-dark-400" />
        <h3 className="text-sm font-semibold text-dark-100">Telegram Bot Status</h3>
      </div>

      <div className="p-5 space-y-4">
        {/* Bot connection status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${botInfo?.ok ? 'bg-green-900/20' : 'bg-dark-800'}`}>
              <Bot className={`h-5 w-5 ${botInfo?.ok ? 'text-green-400' : 'text-dark-500'}`} />
            </div>
            <div>
              {botInfo?.ok ? (
                <>
                  <p className="text-sm font-semibold text-dark-100">
                    @{botInfo.bot_username}
                  </p>
                  <p className="text-xs text-dark-400">{botInfo.bot_name} • ID: {botInfo.bot_id}</p>
                </>
              ) : botInfo && !botInfo.ok ? (
                <p className="text-sm text-red-400">Bot connection failed</p>
              ) : (
                <p className="text-sm text-dark-400">Not tested yet</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {botInfo && (
              <div className={`flex items-center gap-1.5 text-xs font-medium ${botInfo.ok ? 'text-green-400' : 'text-red-400'}`}>
                {botInfo.ok ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                {botInfo.ok ? 'Connected' : 'Failed'}
              </div>
            )}
            <button
              onClick={handleTest}
              disabled={botTesting}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-dark-800 border border-dark-600 hover:border-dark-400 text-dark-300 hover:text-dark-100 rounded-lg transition-colors disabled:opacity-40"
            >
              {botTesting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
              Test Connection
            </button>
          </div>
        </div>

        {lastTested && (
          <p className="text-[11px] text-dark-600">
            Last tested: {formatDateIST(lastTested)}
          </p>
        )}

        {/* Configuration guide */}
        <div className="bg-dark-800 rounded-xl p-4 space-y-2">
          <h4 className="text-xs font-semibold text-dark-300">Setup Guide</h4>
          <ol className="text-xs text-dark-400 space-y-1.5 list-none">
            <li className="flex gap-2">
              <span className="text-brand-400 font-bold flex-shrink-0">1.</span>
              Message <span className="text-brand-400 font-mono">@BotFather</span> on Telegram and create a bot
            </li>
            <li className="flex gap-2">
              <span className="text-brand-400 font-bold flex-shrink-0">2.</span>
              Copy the token to <span className="font-mono text-dark-200">TELEGRAM_BOT_TOKEN</span> in <span className="font-mono text-dark-200">.env</span>
            </li>
            <li className="flex gap-2">
              <span className="text-brand-400 font-bold flex-shrink-0">3.</span>
              Add the bot to your Telegram group or channel as an admin
            </li>
            <li className="flex gap-2">
              <span className="text-brand-400 font-bold flex-shrink-0">4.</span>
              Click "Add Channel" in Channel Manager and enter the chat ID or <span className="font-mono text-dark-200">@username</span>
            </li>
            <li className="flex gap-2">
              <span className="text-brand-400 font-bold flex-shrink-0">5.</span>
              Restart the backend server to apply the token
            </li>
          </ol>
        </div>

        {/* Environment variables reference */}
        <div className="bg-dark-800 rounded-xl p-4">
          <h4 className="text-xs font-semibold text-dark-300 mb-3">Environment Variables</h4>
          <div className="space-y-1.5 font-mono text-xs">
            {[
              ['TELEGRAM_BOT_TOKEN', 'Your bot token from @BotFather'],
              ['BROADCAST_COOLDOWN_SECONDS', 'Min gap between messages (default: 30)'],
              ['ENABLE_SIGNAL_BROADCAST', 'Auto-broadcast signals (true/false)'],
              ['ENABLE_AI_BROADCAST', 'Auto-broadcast AI insights (true/false)'],
            ].map(([key, desc]) => (
              <div key={key} className="flex gap-3">
                <span className="text-brand-400 flex-shrink-0">{key}</span>
                <span className="text-dark-500">{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
