import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { SkipLink } from '@/components/SkipLink'
import { Navbar } from '@/components/Navbar'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { AppFooter } from '@/components/AppFooter'
import { CookieConsent } from '@/components/CookieConsent'
import { useApplyTheme } from '@/hooks/useApplyTheme'
import { Dashboard } from '@/pages/Dashboard'
import { CoinDetail } from '@/pages/CoinDetail'
import { WatchlistPage } from '@/pages/WatchlistPage'
import { StrategyPage } from '@/pages/StrategyPage'
import { BroadcastPage } from '@/pages/BroadcastPage'
import { OnchainDashboard } from '@/pages/onchain/OnchainDashboard'
import { useWebSocket } from '@/hooks/useWebSocket'
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
import { SignupPage } from '@/pages/SignupPage'
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage'
import { ResetPasswordPage } from '@/pages/ResetPasswordPage'
import { VerifyEmailPage } from '@/pages/VerifyEmailPage'
import { AccountSettingsPage } from '@/pages/AccountSettingsPage'
import { LandingPage } from '@/pages/LandingPage'
import { PricingPage } from '@/pages/PricingPage'
import { TermsPage } from '@/pages/TermsPage'
import { PrivacyPage } from '@/pages/PrivacyPage'
import { AdminPage } from '@/pages/AdminPage'
import { MobileNav } from '@/components/MobileNav'
import { usePriceAlertToast } from '@/hooks/usePriceAlertToast'
import { useUserDataSync } from '@/hooks/useUserDataSync'
import { useBrowserNotifications } from '@/hooks/useBrowserNotifications'
import { PriceAlertToast } from '@/components/alerts/PriceAlertToast'
import { isBroadcastQueued, isOnchainSignal, isOnchainWhale, isStrategySignal } from '@/types/ws'

function AppLayout() {
  const { status, lastMessage } = useWebSocket()
  const token = useAuthStore((s) => s.token)
  const restoreSession = useAuthStore((s) => s.restoreSession)
  const addRealtimeMessage = useBroadcastStore((s) => s.addRealtimeMessage)
  const addRealtimeSignal = useOnchainStore((s) => s.addRealtimeSignal)
  const addRealtimeWhale = useOnchainStore((s) => s.addRealtimeWhale)
  const alertToast = usePriceAlertToast()
  const { notifyPriceAlert, notifyStrategySignal, requestPermission } = useBrowserNotifications()
  useUserDataSync()
  useApplyTheme()

  useEffect(() => {
    void restoreSession()
  }, [restoreSession])

  useEffect(() => {
    void requestPermission()
  }, [requestPermission])

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
    <div className="min-h-screen flex flex-col pb-16 md:pb-0 public-app-root">
      <SkipLink />
      {token && <Navbar wsStatus={status} />}
      <main id="main-content" className="flex-1">
        <Routes>
          <Route path="/welcome" element={<LandingPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
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
          <Route path="/account" element={<ProtectedRoute><AccountSettingsPage /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>} />
          <Route path="/onchain/*" element={<Navigate to="/onchain" replace />} />
          <Route path="*" element={<ProtectedRoute><NotFoundPage /></ProtectedRoute>} />
        </Routes>
      </main>
      {token && <MobileNav />}
      {token ? <AppFooter /> : null}
      <CookieConsent />
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
