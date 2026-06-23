import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CheckCircle, UserPlus } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { AuthPageLayout } from '@/components/auth/AuthPageLayout'
import { AuthDivider } from '@/components/auth/AuthDivider'
import { GoogleSignInButton, isGoogleSignInEnabled } from '@/components/auth/GoogleSignInButton'
import { authErrorClass, inputClass, linkClass } from '@/pages/authStyles'

export function SignupPage() {
  const navigate = useNavigate()
  const register = useAuthStore((s) => s.register)
  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const showGoogle = isGoogleSignInEnabled()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const msg = await register(username.trim(), email.trim(), password)
      setMessage(msg)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = async (idToken: string) => {
    setLoading(true)
    setError(null)
    try {
      await loginWithGoogle(idToken)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed')
    } finally {
      setLoading(false)
    }
  }

  if (message) {
    return (
      <AuthPageLayout
        panelTitle="Almost there"
        panelSubtitle="Verify your email to unlock the full research dashboard."
        authLink={{ to: '/login', label: 'Sign in' }}
      >
        <div className="text-center space-y-5 py-4">
          <div className="inline-flex p-4 rounded-full bg-signal/10 border border-signal/20">
            <CheckCircle className="h-10 w-10 text-signal" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-dark-50">Check your email</h2>
            <p className="text-sm text-dark-400">{message}</p>
          </div>
          <button type="button" onClick={() => navigate('/login')} className="btn-primary w-full py-3">
            Go to sign in
          </button>
        </div>
      </AuthPageLayout>
    )
  }

  return (
    <AuthPageLayout
      panelTitle="Start researching for free"
      panelSubtitle="Create an account in seconds. No credit card, no exchange connection — just market intelligence."
      authLink={{ to: '/login', label: 'Sign in' }}
    >
      <div className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-dark-50">Create account</h2>
          <p className="text-sm text-dark-400">
            Already have an account?{' '}
            <Link to="/login" className={linkClass}>Sign in</Link>
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
          <label htmlFor="signup-username" className="block space-y-1">
            <span className="text-xs font-medium text-dark-400">Username</span>
            <input id="signup-username" value={username} onChange={(e) => setUsername(e.target.value)} required minLength={2} className={inputClass} placeholder="pick_a_username" />
          </label>
          <label htmlFor="signup-email" className="block space-y-1">
            <span className="text-xs font-medium text-dark-400">Email</span>
            <input id="signup-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass} placeholder="you@example.com" />
          </label>
          <label htmlFor="signup-password" className="block space-y-1">
            <span className="text-xs font-medium text-dark-400">Password</span>
            <input id="signup-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className={inputClass} placeholder="Min. 6 characters" />
          </label>
          <p className="text-xs text-dark-400">
            By signing up you agree to our <Link to="/terms" className={linkClass}>Terms</Link> and{' '}
            <Link to="/privacy" className={linkClass}>Privacy Policy</Link>.
          </p>
          {error && <p role="alert" className={authErrorClass}>{error}</p>}
          <button type="submit" disabled={loading} className="w-full btn-primary flex items-center justify-center gap-2 py-3 disabled:opacity-50">
            <UserPlus className="h-4 w-4" />
            {loading ? 'Creating account…' : 'Create free account'}
          </button>
        </form>

        <div className="rounded-xl border border-dark-800 bg-dark-950/50 px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]">
          <p className="text-xs text-dark-400 text-center">
            Free plan includes live charts, paper trading, and daily AI insights.
            {' '}
            <Link to="/pricing" className={linkClass}>See all plans</Link>
          </p>
        </div>
      </div>
    </AuthPageLayout>
  )
}
