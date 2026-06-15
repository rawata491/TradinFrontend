import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Navbar } from '@/components/Navbar'
import { Dashboard } from '@/pages/Dashboard'
import { CoinDetail } from '@/pages/CoinDetail'
import { WatchlistPage } from '@/pages/WatchlistPage'
import { StrategyPage } from '@/pages/StrategyPage'
import { BroadcastPage } from '@/pages/BroadcastPage'
import { OnchainDashboard } from '@/pages/onchain/OnchainDashboard'
import { useWebSocket } from '@/hooks/useWebSocket'
import { useThemeStore } from '@/store/useThemeStore'
import { useBroadcastStore } from '@/store/useBroadcastStore'
import { useOnchainStore } from '@/store/useOnchainStore'
import { TokenDetailPage } from '@/pages/token/TokenDetailPage'
import { DiscoverPage } from '@/pages/Discover'
import { usePriceAlertToast } from '@/hooks/usePriceAlertToast'
import { PriceAlertToast } from '@/components/alerts/PriceAlertToast'
import { isBroadcastQueued, isOnchainSignal, isOnchainWhale } from '@/types/ws'

function AppLayout() {
  const { status, lastMessage } = useWebSocket()
  const theme = useThemeStore((s) => s.theme)
  const addRealtimeMessage = useBroadcastStore((s) => s.addRealtimeMessage)
  const addRealtimeSignal = useOnchainStore((s) => s.addRealtimeSignal)
  const addRealtimeWhale = useOnchainStore((s) => s.addRealtimeWhale)
  const alertToast = usePriceAlertToast()

  // Sync .dark class on <html> whenever theme changes
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [theme])

  // Forward broadcast_queued WS events to broadcast store
  useEffect(() => {
    if (!lastMessage) return
    if (isBroadcastQueued(lastMessage)) {
      addRealtimeMessage(lastMessage.data)
    }
    if (isOnchainSignal(lastMessage)) {
      addRealtimeSignal(lastMessage.data)
    }
    if (isOnchainWhale(lastMessage)) {
      addRealtimeWhale(lastMessage.data)
    }
  }, [lastMessage, addRealtimeMessage, addRealtimeSignal, addRealtimeWhale])

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar wsStatus={status} />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/coin/:productId" element={<CoinDetail />} />
          <Route path="/watchlist" element={<WatchlistPage />} />
          <Route path="/strategy" element={<StrategyPage />} />
          <Route path="/broadcast" element={<BroadcastPage />} />
          <Route path="/token/:chain/:address" element={<TokenDetailPage />} />
          <Route path="/discover" element={<DiscoverPage />} />
          <Route path="/onchain" element={<OnchainDashboard />} />
          <Route path="/onchain/*" element={<Navigate to="/onchain" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="border-t border-dark-800 py-4 px-6 text-center text-xs text-dark-600">
        Tradin — Market data via{' '}
        <a
          href="https://docs.cdp.coinbase.com/advanced-trade/docs/welcome"
          target="_blank"
          rel="noopener noreferrer"
          className="text-dark-500 hover:text-dark-300 transition-colors underline"
        >
          Coinbase Advanced Trade API
        </a>
        . Not a trading platform.
      </footer>
      <PriceAlertToast toast={alertToast} />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppLayout />
    </BrowserRouter>
  )
}
