import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { KeyRound } from 'lucide-react'
import { authApi } from '@/services/authApi'
import { AuthPageLayout } from '@/components/auth/AuthPageLayout'
import { authErrorClass, inputClass, linkClass } from '@/pages/authStyles'

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token') || ''
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) {
      setError('Missing reset token')
      return
    }
    setLoading(true)
    setError(null)
    try {
      await authApi.resetPassword(token, password)
      navigate('/login', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reset failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthPageLayout
      panelTitle="Choose a new password"
      panelSubtitle="Use a strong password you don't use elsewhere."
      authLink={{ to: '/login', label: 'Sign in' }}
    >
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-dark-50">Set new password</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label htmlFor="reset-password" className="block space-y-1">
            <span className="text-xs font-medium text-dark-400">New password</span>
            <input id="reset-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className={inputClass} placeholder="Min. 6 characters" />
          </label>
          {error && <p role="alert" className={authErrorClass}>{error}</p>}
          <button type="submit" disabled={loading || !token} className="w-full btn-primary flex items-center justify-center gap-2 py-3">
            <KeyRound className="h-4 w-4" />
            {loading ? 'Saving…' : 'Update password'}
          </button>
        </form>
        <p className="text-center text-sm text-dark-400">
          <Link to="/login" className={linkClass}>Back to sign in</Link>
        </p>
      </div>
    </AuthPageLayout>
  )
}
