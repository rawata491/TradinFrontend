import { useEffect, useState } from 'react'
import { Send, Hash, History, FileText, Zap, Activity } from 'lucide-react'
import { BroadcastEditor } from '@/components/broadcast/BroadcastEditor'
import { ChannelSelector } from '@/components/broadcast/ChannelSelector'
import { BroadcastHistory } from '@/components/broadcast/BroadcastHistory'
import { TemplateManager } from '@/components/broadcast/TemplateManager'
import { SignalBroadcastPanel } from '@/components/broadcast/SignalBroadcastPanel'
import { TelegramSettings } from '@/components/broadcast/TelegramSettings'
import { useBroadcastStore } from '@/store/useBroadcastStore'
import { useTelegramStore } from '@/store/useTelegramStore'

type Tab = 'compose' | 'channels' | 'history' | 'templates' | 'signals' | 'settings'

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'compose',   label: 'Compose',   icon: Send },
  { id: 'channels',  label: 'Channels',  icon: Hash },
  { id: 'history',   label: 'History',   icon: History },
  { id: 'templates', label: 'Templates', icon: FileText },
  { id: 'signals',   label: 'Signals',   icon: Zap },
  { id: 'settings',  label: 'Settings',  icon: Activity },
]

export function BroadcastPage() {
  const [activeTab, setActiveTab] = useState<Tab>('compose')
  const { history, fetchHistory, fetchTemplates } = useBroadcastStore()
  const { channels, botInfo, fetchChannels, testBot } = useTelegramStore()

  useEffect(() => {
    fetchHistory({ page: 1 })
    fetchTemplates()
    fetchChannels(false)
    testBot()
  }, [fetchHistory, fetchTemplates, fetchChannels, testBot])

  const stats = {
    totalSent: (history?.items ?? []).filter((m) => m.status === 'sent' || m.status === 'partial').length,
    totalFailed: (history?.items ?? []).filter((m) => m.status === 'failed').length,
    activeChannels: channels.filter((c) => c.is_active).length,
    totalBroadcasts: history?.total ?? 0,
  }

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Page header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 bg-brand-600/20 rounded-lg">
            <Send className="h-5 w-5 text-brand-400" />
          </div>
          <h1 className="text-2xl font-bold text-dark-50">Broadcast Center</h1>
          {botInfo?.ok && (
            <div className="flex items-center gap-1.5 text-xs text-green-400 bg-green-900/20 border border-green-900 px-2.5 py-1 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
              </span>
              @{botInfo.bot_username}
            </div>
          )}
        </div>
        <p className="text-sm text-dark-400 ml-14">
          Send real-time signals, AI insights, and custom messages to Telegram channels
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Broadcasts', value: stats.totalBroadcasts, color: 'text-dark-100' },
          { label: 'Successfully Sent', value: stats.totalSent, color: 'text-green-400' },
          { label: 'Failed', value: stats.totalFailed, color: stats.totalFailed > 0 ? 'text-red-400' : 'text-dark-400' },
          { label: 'Active Channels', value: stats.activeChannels, color: 'text-brand-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-dark-900 border border-dark-700 rounded-xl p-4">
            <p className="text-xs text-dark-500 mb-1">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-dark-900 border border-dark-700 rounded-xl p-1 mb-6 overflow-x-auto">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
              activeTab === id
                ? 'bg-dark-700 text-dark-50'
                : 'text-dark-400 hover:text-dark-200 hover:bg-dark-800'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'compose' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <BroadcastEditor onSent={() => setActiveTab('history')} />
            </div>
            <div className="space-y-4">
              <div className="bg-dark-900 border border-dark-700 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-dark-200 mb-3 flex items-center gap-2">
                  <History className="h-4 w-4 text-dark-400" />
                  Recent Broadcasts
                </h3>
                <BroadcastHistory compact />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'channels' && (
          <div className="max-w-2xl">
            <div className="bg-dark-900 border border-dark-700 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-dark-100 mb-4 flex items-center gap-2">
                <Hash className="h-4 w-4 text-dark-400" />
                Telegram Channels & Groups
              </h3>
              <ChannelSelector />
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div>
            <BroadcastHistory />
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="max-w-2xl">
            <div className="bg-dark-900 border border-dark-700 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-dark-100 mb-4 flex items-center gap-2">
                <FileText className="h-4 w-4 text-dark-400" />
                Message Templates
              </h3>
              <TemplateManager />
            </div>
          </div>
        )}

        {activeTab === 'signals' && (
          <div className="max-w-lg">
            <SignalBroadcastPanel />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-2xl space-y-4">
            <TelegramSettings />
          </div>
        )}
      </div>
    </div>
  )
}
