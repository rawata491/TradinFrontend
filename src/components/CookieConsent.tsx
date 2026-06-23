import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { isPublicRoute } from '@/hooks/useApplyTheme'

const CONSENT_KEY = 'tradin_cookie_consent'

export function CookieConsent() {
  const [visible, setVisible] = useState(false)
  const { pathname } = useLocation()
  const isPublic = isPublicRoute(pathname)

  useEffect(() => {
    if (!localStorage.getItem(CONSENT_KEY)) {
      setVisible(true)
    }
  }, [])

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, 'accepted')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4 md:p-6">
      <div
        className={
          isPublic
            ? 'max-w-3xl mx-auto rounded-2xl border border-dark-800 bg-dark-900/95 backdrop-blur-xl p-4 flex flex-col md:flex-row md:items-center gap-4 shadow-xl'
            : 'max-w-3xl mx-auto card p-4 flex flex-col md:flex-row md:items-center gap-4 shadow-xl border-dark-700'
        }
      >
        <p className={`text-sm flex-1 ${isPublic ? 'text-dark-300' : 'text-dark-300'}`}>
          We use essential cookies and local storage for authentication and preferences.
          See our <Link to="/privacy" className="text-brand-400 underline">Privacy Policy</Link>.
        </p>
        <button type="button" onClick={accept} className="btn-primary text-sm px-4 py-2 shrink-0">
          Accept
        </button>
      </div>
    </div>
  )
}
