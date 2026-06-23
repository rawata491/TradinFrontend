import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, CreditCard, LogOut, User } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { ThemeToggle } from '@/components/ThemeToggle'

export function UserMenu() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  useEffect(() => {
    if (!open) return
    const onPointer = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onPointer)
    return () => document.removeEventListener('mousedown', onPointer)
  }, [open])

  const initial = user?.username?.charAt(0).toUpperCase() ?? '?'

  const handleSignOut = () => {
    setOpen(false)
    logout()
    navigate('/welcome')
  }

  return (
    <div ref={ref} className="relative hidden sm:block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-lg hover:bg-dark-800/60 transition-colors"
      >
        <span className="h-7 w-7 rounded-full bg-dark-800 border border-dark-700 flex items-center justify-center text-xs font-semibold text-dark-200">
          {initial}
        </span>
        <ChevronDown className={`h-3.5 w-3.5 text-dark-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-1.5 w-52 rounded-xl border border-dark-700 bg-dark-900 shadow-xl py-2 z-50"
        >
          <div className="px-3 pb-2 mb-1 border-b border-dark-800">
            <p className="text-sm font-medium text-dark-100 truncate flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-dark-500 shrink-0" />
              {user?.username}
            </p>
            {user?.role === 'admin' && (
              <p className="text-[10px] text-brand-400 uppercase tracking-wide mt-0.5 ml-5">Admin</p>
            )}
          </div>
          <div className="px-3 py-2 flex items-center justify-between">
            <span className="text-xs text-dark-400">Theme</span>
            <ThemeToggle variant="switch" />
          </div>
          <button
            type="button"
            role="menuitem"
            onClick={() => { setOpen(false); navigate('/account') }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-dark-300 hover:bg-dark-800/60 transition-colors"
          >
            <User className="h-4 w-4" />
            Account
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => { setOpen(false); navigate('/pricing') }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-dark-300 hover:bg-dark-800/60 transition-colors"
          >
            <CreditCard className="h-4 w-4" />
            Pricing
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-dark-300 hover:bg-dark-800/60 hover:text-negative transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}
