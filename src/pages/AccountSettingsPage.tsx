import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CreditCard, Trash2, User } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import { authApi } from '@/services/authApi'
import { billingApi } from '@/services/billingApi'
import type { SubscriptionInfo, UsageResponse } from '@/types/billing'

const TIER_RANK: Record<string, number> = { free: 0, starter: 1, pro: 2 }

export function AccountSettingsPage() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const refreshUser = useAuthStore((s) => s.refreshUser)
  const [searchParams] = useSearchParams()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null)
  const [usage, setUsage] = useState<UsageResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [checkoutPlan, setCheckoutPlan] = useState<string | null>(null)

  const loadBilling = async () => {
    try {
      const [sub, usageData] = await Promise.all([
        billingApi.getSubscription(),
        billingApi.getUsage(),
      ])
      setSubscription(sub)
      setUsage(usageData)
    } catch {
      /* billing optional */
    }
  }

  useEffect(() => {
    void loadBilling()
  }, [])

  useEffect(() => {
    const billing = searchParams.get('billing')
    if (billing === 'success') {
      setMessage('Subscription updated successfully')
      void refreshUser()
      void loadBilling()
    } else if (billing === 'cancel') {
      setMessage('Checkout was cancelled')
    } else if (billing === 'manage') {
      setMessage('Contact support or your payment provider to manage Razorpay subscriptions.')
    }
  }, [searchParams, refreshUser])

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)
    try {
      const res = await authApi.changePassword(currentPassword, newPassword)
      setMessage(res.message)
      setCurrentPassword('')
      setNewPassword('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async (plan: 'starter' | 'pro') => {
    setCheckoutPlan(plan)
    setError(null)
    try {
      const country = subscription?.currency === 'inr' ? 'IN' : undefined
      const { url } = await billingApi.createCheckout(plan, country)
      window.location.href = url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout unavailable')
      setCheckoutPlan(null)
    }
  }

  const handleManageBilling = async () => {
    try {
      const { url } = await billingApi.createPortal()
      window.location.href = url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Billing portal unavailable')
    }
  }

  const handleDeleteAccount = async () => {
    if (!window.confirm('Delete your account permanently? This cannot be undone.')) return
    try {
      await authApi.deleteAccount()
      logout()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account')
    }
  }

  const currentTier = subscription?.plan_id || user?.subscription_tier || 'free'
  const currentRank = TIER_RANK[currentTier] ?? 0

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center gap-3">
        <User className="h-8 w-8 text-brand-400" />
        <div>
          <h1 className="text-2xl font-bold text-dark-50">Account settings</h1>
          <p className="text-sm text-dark-400">{user?.username} · {user?.email}</p>
        </div>
      </div>

      {message && <p className="text-sm text-positive bg-positive/10 rounded-lg px-3 py-2">{message}</p>}
      {error && <p className="text-sm text-negative bg-negative/10 rounded-lg px-3 py-2">{error}</p>}

      <section className="card p-6 space-y-4">
        <h2 className="font-semibold text-dark-100">Change password</h2>
        {user?.has_password === false ? (
          <p className="text-sm text-dark-400">
            You signed in with Google. Use{' '}
            <Link to="/forgot-password" className="text-brand-400 hover:underline">forgot password</Link>
            {' '}to set a password for email sign-in.
          </p>
        ) : (
          <form onSubmit={handleChangePassword} className="space-y-3">
            <input type="password" placeholder="Current password" value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)} required
              className="w-full bg-dark-950 border border-dark-700 rounded-lg px-3 py-2 text-sm" />
            <input type="password" placeholder="New password" value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)} required minLength={6}
              className="w-full bg-dark-950 border border-dark-700 rounded-lg px-3 py-2 text-sm" />
            <button type="submit" disabled={loading} className="btn-primary text-sm px-4 py-2">
              Update password
            </button>
          </form>
        )}
      </section>

      {subscription && (
        <section className="card p-6 space-y-4">
          <h2 className="font-semibold text-dark-100 flex items-center gap-2">
            <CreditCard className="h-5 w-5" /> Subscription
          </h2>
          <div className="text-sm text-dark-400 space-y-1">
            <p>
              Plan: <span className="text-dark-200 capitalize">{subscription.plan_id}</span>
              {' '}({subscription.status})
            </p>
            {subscription.payment_provider && (
              <p>
                Billing via: <span className="text-dark-200 capitalize">{subscription.payment_provider}</span>
              </p>
            )}
            {subscription.current_period_end && (
              <p>
                Renews:{' '}
                <span className="text-dark-200">
                  {new Date(subscription.current_period_end).toLocaleDateString()}
                </span>
              </p>
            )}
          </div>

          {usage && (
            <div className="space-y-2 pt-2 border-t border-dark-800">
              <p className="text-xs font-medium text-dark-300 uppercase tracking-wide">Today&apos;s usage</p>
              {Object.entries(usage.quotas).map(([key, q]) => (
                <div key={key} className="flex justify-between text-sm text-dark-400">
                  <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                  <span className="font-mono text-dark-200">{q.used} / {q.limit}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-2">
            {subscription.billing_configured && currentRank < TIER_RANK.starter && (
              <button
                type="button"
                disabled={checkoutPlan === 'starter'}
                onClick={() => handleUpgrade('starter')}
                className="btn-primary text-sm px-4 py-2"
              >
                {checkoutPlan === 'starter' ? 'Redirecting…' : 'Upgrade to Starter'}
              </button>
            )}
            {subscription.billing_configured && currentRank < TIER_RANK.pro && (
              <button
                type="button"
                disabled={checkoutPlan === 'pro'}
                onClick={() => handleUpgrade('pro')}
                className="btn-primary text-sm px-4 py-2"
              >
                {checkoutPlan === 'pro' ? 'Redirecting…' : 'Upgrade to Pro'}
              </button>
            )}
            {subscription.payment_provider && currentRank > 0 && (
              <button type="button" onClick={handleManageBilling} className="text-sm border border-dark-700 rounded-lg px-4 py-2 hover:bg-dark-800">
                Manage billing
              </button>
            )}
            <Link to="/pricing" className="text-sm text-brand-400 hover:text-brand-300 px-2 py-2">
              View all plans
            </Link>
          </div>
        </section>
      )}

      <section className="card p-6 space-y-4 border-negative/30">
        <h2 className="font-semibold text-negative flex items-center gap-2">
          <Trash2 className="h-5 w-5" /> Delete account
        </h2>
        <p className="text-sm text-dark-400">
          Permanently delete your account and all associated data (GDPR right to erasure).
        </p>
        <button type="button" onClick={handleDeleteAccount} className="text-sm text-negative border border-negative/40 rounded-lg px-4 py-2 hover:bg-negative/10">
          Delete my account
        </button>
      </section>
    </div>
  )
}
