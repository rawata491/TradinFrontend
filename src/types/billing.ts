export interface PlanInfo {
  id: 'free' | 'starter' | 'pro'
  name: string
  price: number
  currency: 'usd' | 'inr'
  interval: string
  features: string[]
  available: boolean
}

export interface PlansResponse {
  plans: PlanInfo[]
  currency: string
  provider: 'stripe' | 'razorpay'
  billing_configured: boolean
  stripe_enabled: boolean
  razorpay_enabled: boolean
}

export interface SubscriptionInfo {
  tier: string
  plan_id: string
  status: string
  payment_provider: string | null
  currency: string | null
  current_period_end: string | null
  billing_configured: boolean
}

export interface QuotaUsage {
  used: number
  limit: number
  remaining: number
}

export interface UsageResponse {
  tier: string
  next_tier: string | null
  quotas: Record<string, QuotaUsage>
}

export interface CheckoutResponse {
  url: string
  provider: string
}
