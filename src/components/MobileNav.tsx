import { Link, useLocation, useNavigate } from 'react-router-dom'
import { CreditCard, LogOut, Menu, User } from 'lucide-react'
import { useState, useMemo } from 'react'
import { useAuthStore } from '@/store/useAuthStore'
import { ThemeToggle } from '@/components/ThemeToggle'
import { PRIMARY_NAV, visibleSecondaryNav } from '@/config/navigation'

export function MobileNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const [moreOpen, setMoreOpen] = useState(false)
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const isAdmin = user?.role === 'admin'

  const moreLinks = useMemo(() => visibleSecondaryNav(isAdmin), [isAdmin])

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

  const moreActive = moreLinks.some((m) => isActive(m.to))

  const handleSignOut = async () => {
    setMoreOpen(false)
    await logout()
    navigate('/welcome')
  }

  return (
    <>
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-dark-950/95 backdrop-blur-md border-t border-dark-800 pb-[env(safe-area-inset-bottom)]"
        aria-label="Mobile navigation"
      >
        <div className="grid grid-cols-5 h-14">
          {PRIMARY_NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              aria-label={label}
              aria-current={isActive(to) ? 'page' : undefined}
              className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors ${
                isActive(to) ? 'text-brand-400' : 'text-dark-500'
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          ))}
          <button
            type="button"
            aria-label="More navigation"
            aria-expanded={moreOpen}
            onClick={() => setMoreOpen((v) => !v)}
            className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors ${
              moreActive || moreOpen ? 'text-brand-400' : 'text-dark-500'
            }`}
          >
            <Menu className="h-5 w-5" />
            More
          </button>
        </div>
      </nav>

      {moreOpen && (
        <>
          <button
            type="button"
            className="md:hidden fixed inset-0 z-40 bg-black/40"
            aria-label="Close menu"
            onClick={() => setMoreOpen(false)}
          />
          <div className="md:hidden fixed bottom-14 inset-x-0 z-50 mx-3 mb-2 rounded-xl border border-dark-700 bg-dark-900 shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-dark-800">
              <span className="text-xs text-dark-400">Theme</span>
              <ThemeToggle variant="pill" />
            </div>
            {moreLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMoreOpen(false)}
                className={`block px-4 py-3 text-sm border-b border-dark-800 last:border-0 ${
                  isActive(to) ? 'text-brand-400 bg-dark-800/50' : 'text-dark-200 hover:bg-dark-800/30'
                }`}
              >
                {label}
              </Link>
            ))}
            <Link
              to="/pricing"
              onClick={() => setMoreOpen(false)}
              className={`flex items-center gap-2 px-4 py-3 text-sm border-b border-dark-800 ${
                isActive('/pricing') ? 'text-brand-400 bg-dark-800/50' : 'text-dark-200 hover:bg-dark-800/30'
              }`}
            >
              <CreditCard className="h-4 w-4" />
              Pricing
            </Link>
            <Link
              to="/account"
              onClick={() => setMoreOpen(false)}
              className={`flex items-center gap-2 px-4 py-3 text-sm border-b border-dark-800 ${
                isActive('/account') ? 'text-brand-400 bg-dark-800/50' : 'text-dark-200 hover:bg-dark-800/30'
              }`}
            >
              <User className="h-4 w-4" />
              Account
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="flex w-full items-center gap-2 px-4 py-3 text-sm text-dark-200 hover:bg-dark-800/30"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </>
      )}
    </>
  )
}
