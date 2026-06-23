import { useEffect, useState } from 'react'
import { useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { AuthPageLayout } from '@/components/auth/AuthPageLayout'
import { AuthDivider } from '@/components/auth/AuthDivider'
import { GoogleSignInButton, isGoogleSignInEnabled } from '@/components/auth/GoogleSignInButton'
import { authErrorClass, inputClass, linkClass } from '@/pages/authStyles'
import { safeRedirectPath } from '@/utils/safeRedirect'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const login = useAuthStore((s) => s.login)
  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle)
  const token = useAuthStore((s) => s.token)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const showGoogle = isGoogleSignInEnabled()

  const fromState = (location.state as { from?: string } | null)?.from
  const from = safeRedirectPath(searchParams.get('next') || fromState)

  useEffect(() => {
    if (token) navigate(from, { replace: true })
  }, [token, from, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await login(username.trim(), password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = async (idToken: string) => {
    setLoading(true)
    setError(null)
    try {
      await loginWithGoogle(idToken)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthPageLayout
      panelTitle="Welcome back"
      panelSubtitle="Sign in to access live charts, AI insights, alerts, and your paper trading portfolio."
      authLink={{ to: '/signup', label: 'Create account' }}
    >
      <div className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-dark-50">Sign in</h2>
          <p className="text-sm text-dark-400">
            New here?{' '}
            <Link to="/signup" className={linkClass}>Create a free account</Link>
          </p>
        </div>

        {showGoogle && (
          <>
            <GoogleSignInButton
              disabled={loading}
              onSuccess={handleGoogleSuccess}
              onError={(msg) => setError(msg)}
            />
            <AuthDivider />
          </>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label htmlFor="login-username" className="block space-y-1">
            <span className="text-xs font-medium text-dark-400">Username or email</span>
            <input id="login-username" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" required className={inputClass} placeholder="username or you@example.com" />
          </label>
          <label htmlFor="login-password" className="block space-y-1">
            <span className="text-xs font-medium text-dark-400">Password</span>
            <input id="login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required minLength={6} className={inputClass} placeholder="••••••••" />
          </label>
          {error && <p role="alert" className={authErrorClass}>{error}</p>}
          <div className="text-right">
            <Link to="/forgot-password" className={`text-xs ${linkClass}`}>Forgot password?</Link>
          </div>
          <button type="submit" disabled={loading} className="w-full btn-primary flex items-center justify-center gap-2 py-3 disabled:opacity-50">
            <LogIn className="h-4 w-4" />
            {loading ? 'Signing in…' : 'Sign in with password'}
          </button>
        </form>

        <p className="text-center text-xs text-dark-500 pt-2 border-t border-dark-800">
          Research only — Tradin is not a broker or exchange.
        </p>
      </div>
    </AuthPageLayout>
  )
}
