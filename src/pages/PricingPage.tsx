import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check } from 'lucide-react'
import { billingApi } from '@/services/billingApi'
import { useAuthStore } from '@/store/useAuthStore'
import { PublicPageLayout } from '@/components/public/PublicPageLayout'
import type { PlanInfo } from '@/types/billing'

const TIER_RANK: Record<string, number> = { free: 0, starter: 1, pro: 2 }

function formatPrice(plan: PlanInfo): string {
  if (plan.price === 0) return 'Free'
  if (plan.currency === 'inr') return `₹${plan.price.toLocaleString('en-IN')}`
  return `$${plan.price}`
}

function PricingSkeleton() {
  return (
    <div className="grid md:grid-cols-3 gap-6" aria-hidden>
      {[0, 1, 2].map((i) => (
        <div key={i} className="rounded-2xl border border-dark-800 bg-dark-900 p-8 space-y-4 animate-pulse">
          <div className="h-5 w-24 bg-dark-800 rounded" />
          <div className="h-10 w-32 bg-dark-800 rounded" />
          <div className="space-y-2 pt-4">
            {[0, 1, 2, 3].map((j) => (
              <div key={j} className="h-3 bg-dark-800 rounded" />
            ))}
          </div>
          <div className="h-10 bg-dark-800 rounded-xl mt-6" />
        </div>
      ))}
    </div>
  )
}

export function PricingPage() {
  const navigate = useNavigate()
  const token = useAuthStore((s) => s.token)
  const userTier = useAuthStore((s) => s.user?.subscription_tier || 'free')
  const [plans, setPlans] = useState<PlanInfo[]>([])
  const [currency, setCurrency] = useState('usd')
  const [provider, setProvider] = useState('stripe')
  const [loading, setLoading] = useState(true)
  const [checkoutPlan, setCheckoutPlan] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const country = navigator.language.toUpperCase().includes('IN') ? 'IN' : undefined
    billingApi
      .getPlans(country)
      .then((res) => {
        setPlans(res.plans)
        setCurrency(res.currency)
        setProvider(res.provider)
      })
      .catch(() => setError('Unable to load plans'))
      .finally(() => setLoading(false))
  }, [])

  const handleSelect = async (planId: PlanInfo['id']) => {
    if (planId === 'free') {
      navigate(token ? '/' : '/signup')
      return
    }
    if (!token) {
      navigate('/signup')
      return
    }
    setCheckoutPlan(planId)
    setError(null)
    try {
      const country = currency === 'inr' ? 'IN' : undefined
      const { url } = await billingApi.createCheckout(planId, country)
      window.location.href = url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout unavailable')
      setCheckoutPlan(null)
    }
  }

  const ctaLabel = (plan: PlanInfo): string => {
    const rank = TIER_RANK[plan.id] ?? 0
    const current = TIER_RANK[userTier] ?? 0
    if (rank === current && token) return 'Current plan'
    if (rank < current && token) return 'Included in your plan'
    if (plan.id === 'free') return token ? 'Go to dashboard' : 'Get started free'
    return token ? `Upgrade to ${plan.name}` : 'Sign up to subscribe'
  }

  const ctaDisabled = (plan: PlanInfo): boolean => {
    if (!token) return false
    const rank = TIER_RANK[plan.id] ?? 0
    const current = TIER_RANK[userTier] ?? 0
    return rank <= current
  }

  return (
    <PublicPageLayout withBackdrop showFooter>
      <div className="max-w-6xl mx-auto px-6 py-16 w-full">
        <div className="text-center mb-12 space-y-3">
          <h1 className="text-4xl font-bold text-dark-50">Simple pricing for researchers</h1>
          <p className="text-dark-400 max-w-xl mx-auto">
            Start free. Upgrade when you need more AI insights, backtests, and alerts.
            {currency === 'inr' && (
              <span className="block text-xs mt-2 text-dark-400">Prices in INR · exclusive of GST · billed via Razorpay</span>
            )}
            {currency === 'usd' && provider === 'stripe' && (
              <span className="block text-xs mt-2 text-dark-400">Prices in USD · billed via Stripe</span>
            )}
          </p>
        </div>

        {error && (
          <p role="alert" className="text-center text-sm text-negative bg-negative/10 rounded-lg px-4 py-2 mb-8 max-w-md mx-auto">
            {error}
          </p>
        )}

        {loading ? (
          <PricingSkeleton />
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const highlighted = plan.id === 'starter'
              return (
                <div
                  key={plan.id}
                  className={`rounded-2xl border p-8 flex flex-col ${
                    highlighted
                      ? 'border-brand-500/50 bg-dark-900 shadow-lg shadow-brand-500/10 md:scale-[1.02]'
                      : 'border-dark-800 bg-dark-900/80'
                  }`}
                >
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold capitalize text-dark-50">{plan.name}</h2>
                    <p className="mt-2 text-3xl font-bold font-mono text-dark-50">
                      {formatPrice(plan)}
                      {plan.price > 0 && <span className="text-sm font-normal text-dark-400"> /mo</span>}
                    </p>
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-dark-300">
                        <Check className="h-4 w-4 text-brand-500 shrink-0 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    disabled={ctaDisabled(plan) || checkoutPlan === plan.id || !plan.available}
                    onClick={() => handleSelect(plan.id)}
                    className={`w-full py-3 rounded-xl font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      highlighted
                        ? 'btn-marketing-primary'
                        : 'border border-dark-700 text-dark-100 hover:bg-dark-800'
                    }`}
                  >
                    {checkoutPlan === plan.id ? 'Redirecting…' : ctaLabel(plan)}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </PublicPageLayout>
  )
}
