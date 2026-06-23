import http from '@/services/httpClient'
import type {
  CheckoutResponse,
  PlansResponse,
  SubscriptionInfo,
  UsageResponse,
} from '@/types/billing'

export const billingApi = {
  getPlans: async (country?: string): Promise<PlansResponse> => {
    const { data } = await http.get('/api/billing/plans', {
      params: country ? { country } : undefined,
    })
    return data
  },

  getSubscription: async (): Promise<SubscriptionInfo> => {
    const { data } = await http.get('/api/billing/subscription')
    return data
  },

  getUsage: async (): Promise<UsageResponse> => {
    const { data } = await http.get('/api/billing/usage')
    return data
  },

  createCheckout: async (plan: 'starter' | 'pro', country?: string): Promise<CheckoutResponse> => {
    const { data } = await http.post('/api/billing/checkout', { plan, country })
    return data
  },

  createPortal: async (): Promise<{ url: string }> => {
    const { data } = await http.post('/api/billing/portal')
    return data
  },
}
