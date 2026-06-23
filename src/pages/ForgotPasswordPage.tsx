import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail } from 'lucide-react'
import { authApi } from '@/services/authApi'
import { AuthPageLayout } from '@/components/auth/AuthPageLayout'
import { authErrorClass, inputClass, linkClass } from '@/pages/authStyles'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await authApi.forgotPassword(email.trim())
      setMessage(res.message)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthPageLayout
      panelTitle="Reset your password"
      panelSubtitle="We'll send a secure link to your email so you can get back to your research."
      authLink={{ to: '/login', label: 'Sign in' }}
    >
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-dark-50">Forgot password</h2>
        {message ? (
          <p className="text-sm text-dark-400">{message}</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <label htmlFor="forgot-email" className="block space-y-1">
              <span className="text-xs font-medium text-dark-400">Email</span>
              <input id="forgot-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass} placeholder="you@example.com" />
            </label>
            {error && <p role="alert" className={authErrorClass}>{error}</p>}
            <button type="submit" disabled={loading} className="w-full btn-primary flex items-center justify-center gap-2 py-3">
              <Mail className="h-4 w-4" />
              {loading ? 'Sending…' : 'Send reset link'}
            </button>
          </form>
        )}
        <p className="text-center text-sm text-dark-400">
          <Link to="/login" className={linkClass}>Back to sign in</Link>
        </p>
      </div>
    </AuthPageLayout>
  )
}
