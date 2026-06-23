import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle, Loader2, XCircle } from 'lucide-react'
import { authApi } from '@/services/authApi'
import { AuthPageLayout } from '@/components/auth/AuthPageLayout'
import { linkClass } from '@/pages/authStyles'

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const verifyStarted = useRef(false)

  useEffect(() => {
    if (verifyStarted.current) return
    verifyStarted.current = true

    if (!token) {
      setStatus('error')
      setMessage('Missing verification token')
      return
    }
    authApi.verifyEmail(token)
      .then((res) => {
        setStatus('success')
        setMessage(res.message)
      })
      .catch((err) => {
        setStatus('error')
        setMessage(err instanceof Error ? err.message : 'Verification failed')
      })
  }, [token])

  return (
    <AuthPageLayout
      panelTitle="Email verification"
      panelSubtitle="One last step before you can access your full research dashboard."
      authLink={{ to: '/login', label: 'Sign in' }}
    >
      <div className="text-center space-y-5 py-4">
        {status === 'loading' && (
          <>
            <Loader2 className="h-10 w-10 text-brand-500 mx-auto animate-spin" />
            <p className="text-dark-400">Verifying your email…</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle className="h-12 w-12 text-signal mx-auto" />
            <p className="text-dark-200">{message}</p>
            <Link to="/login" className="btn-primary inline-block w-full py-3">Sign in to dashboard</Link>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle className="h-12 w-12 text-negative mx-auto" />
            <p className="text-dark-200">{message}</p>
            <Link to="/login" className={linkClass}>Back to sign in</Link>
          </>
        )}
      </div>
    </AuthPageLayout>
  )
}
