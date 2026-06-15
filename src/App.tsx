import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Navbar } from '@/components/Navbar'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Dashboard } from '@/pages/Dashboard'
import { CoinDetail } from '@/pages/CoinDetail'
import { WatchlistPage } from '@/pages/WatchlistPage'
import { StrategyPage } from '@/pages/StrategyPage'
import { BroadcastPage } from '@/pages/BroadcastPage'
import { OnchainDashboard } from '@/pages/onchain/OnchainDashboard'
import { useWebSocket } from '@/hooks/useWebSocket'
import { useThemeStore } from '@/store/useThemeStore'
import { useAuthStore } from '@/store/useAuthStore'
import { useBroadcastStore } from '@/store/useBroadcastStore'
import { useOnchainStore } from '@/store/useOnchainStore'
import { TokenDetailPage } from '@/pages/token/TokenDetailPage'
import { DiscoverPage } from '@/pages/Discover'
import { PortfolioPage } from '@/pages/PortfolioPage'
import { PracticeTradingPage } from '@/pages/PracticeTradingPage'
import { AlertsPage } from '@/pages/AlertsPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { AnalyticsPage } from '@/pages/AnalyticsPage'
import { LoginPage } from '@/pages/LoginPage'
import { AdminPage } from '@/pages/AdminPage'
import { MobileNav } from '@/components/MobileNav'
import { usePriceAlertToast } from '@/hooks/usePriceAlertToast'
import { useUserDataSync } from '@/hooks/useUserDataSync'
import { useBrowserNotifications } from '@/hooks/useBrowserNotifications'
import { PriceAlertToast } from '@/components/alerts/PriceAlertToast'
import { isBroadcastQueued, isOnchainSignal, isOnchainWhale, isStrategySignal } from '@/types/ws'

function AppLayout() {
  const { status, lastMessage } = useWebSocket()
  const theme = useThemeStore((s) => s.theme)
  const token = useAuthStore((s) => s.token)
  const restoreSession = useAuthStore((s) => s.restoreSession)
  const addRealtimeMessage = useBroadcastStore((s) => s.addRealtimeMessage)
  const addRealtimeSignal = useOnchainStore((s) => s.addRealtimeSignal)
  const addRealtimeWhale = useOnchainStore((s) => s.addRealtimeWhale)
  const alertToast = usePriceAlertToast()
  const { notifyPriceAlert, notifyStrategySignal, requestPermission } = useBrowserNotifications()
  useUserDataSync()

  useEffect(() => {
    void restoreSession()
  }, [restoreSession])

  useEffect(() => {
    void requestPermission()
  }, [requestPermission])

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [theme])

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
    if (lastMessage.type === 'price_alert') {
      notifyPriceAlert(lastMessage.data)
    }
    if (isStrategySignal(lastMessage)) {
      notifyStrategySignal(lastMessage.data)
    }
  }, [lastMessage, addRealtimeMessage, addRealtimeSignal, addRealtimeWhale, notifyPriceAlert, notifyStrategySignal])

  return (
    <div className="min-h-screen flex flex-col pb-16 md:pb-0">
      {token && <Navbar wsStatus={status} />}
      <main className="flex-1">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/coin/:productId" element={<ProtectedRoute><CoinDetail /></ProtectedRoute>} />
          <Route path="/watchlist" element={<ProtectedRoute><WatchlistPage /></ProtectedRoute>} />
          <Route path="/strategy" element={<ProtectedRoute><StrategyPage /></ProtectedRoute>} />
          <Route path="/broadcast" element={<ProtectedRoute adminOnly><BroadcastPage /></ProtectedRoute>} />
          <Route path="/token/:chain/:address" element={<ProtectedRoute><TokenDetailPage /></ProtectedRoute>} />
          <Route path="/portfolio" element={<ProtectedRoute><PortfolioPage /></ProtectedRoute>} />
          <Route path="/practice" element={<ProtectedRoute><PracticeTradingPage /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
          <Route path="/discover" element={<ProtectedRoute><DiscoverPage /></ProtectedRoute>} />
          <Route path="/onchain" element={<ProtectedRoute><OnchainDashboard /></ProtectedRoute>} />
          <Route path="/alerts" element={<ProtectedRoute><AlertsPage /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>} />
          <Route path="/onchain/*" element={<Navigate to="/onchain" replace />} />
          <Route path="*" element={<ProtectedRoute><NotFoundPage /></ProtectedRoute>} />
        </Routes>
      </main>
      {token && <MobileNav />}
      {token && (
        <footer className="border-t border-dark-800 py-4 px-6 text-center text-xs text-dark-600">
          Tradin — Market data via{' '}
          <a
            href="https://www.gate.io/docs/developers/apiv4/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-dark-500 hover:text-dark-300 transition-colors underline"
          >
            Gate.io API
          </a>
          . Not a trading platform.
        </footer>
      )}
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
