import { Navigate, useLocation } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { PageLoader } from '@/components/Loader'

export function ProtectedRoute({
  children,
  adminOnly = false,
  guestRedirect = 'login',
}: {
  children: React.ReactNode
  adminOnly?: boolean
  /** Where to send unauthenticated users. Use "welcome" for the home route. */
  guestRedirect?: 'login' | 'welcome'
}) {
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)
  const isLoading = useAuthStore((s) => s.isLoading)
  const location = useLocation()

  if (isLoading) {
    return <PageLoader message="Checking session…" />
  }

  if (!token || !user) {
    if (guestRedirect === 'welcome') {
      return <Navigate to="/welcome" replace />
    }
    const next = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?next=${next}`} replace />
  }

  if (adminOnly && user.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <ShieldAlert className="h-12 w-12 mx-auto text-dark-500" />
        <h1 className="text-lg font-semibold text-dark-100">Admin access required</h1>
        <p className="text-sm text-dark-400">
          This feature is restricted to administrators. Contact your admin if you need access.
        </p>
        <button
          type="button"
          onClick={() => window.history.back()}
          className="link-brand text-sm"
        >
          Go back
        </button>
      </div>
    )
  }

  return <>{children}</>
}
