import { Link } from 'react-router-dom'
import { ArrowRight, BarChart2 } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'
import { useAuthStore } from '@/store/useAuthStore'

interface PublicHeaderProps {
  /** minimal = logo + theme + optional auth links */
  variant?: 'marketing' | 'minimal'
  maxWidth?: '5xl' | '7xl'
  /** Shown in minimal variant — e.g. Sign up on login page */
  authLink?: { to: string; label: string }
}

export function PublicHeader({ variant = 'marketing', maxWidth = '7xl', authLink }: PublicHeaderProps) {
  const token = useAuthStore((s) => s.token)
  const widthClass = maxWidth === '5xl' ? 'max-w-5xl' : 'max-w-7xl'

  return (
    <header className="relative z-20 w-full border-b border-dark-800/60 bg-dark-950/70 backdrop-blur-md dark:border-white/5 dark:bg-dark-950/80">
      <div className={`${widthClass} mx-auto px-6 h-16 flex items-center justify-between gap-4`}>
        <Link to="/welcome" className="flex items-center gap-2.5 group shrink-0">
          <div className="p-2 rounded-xl bg-brand-600/15 border border-brand-500/25 group-hover:bg-brand-600/25 transition-colors">
            <BarChart2 className="h-5 w-5 text-brand-500" />
          </div>
          <span className="font-bold text-xl leading-none tracking-tight text-dark-50">Tradin</span>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-3 shrink-0">
          <ThemeToggle variant="pill" className="self-center" />
          {variant === 'minimal' && (
            <>
              <Link to="/pricing" className="hidden sm:inline-flex items-center h-10 text-sm text-dark-400 hover:text-dark-50 px-3 transition-colors">
                Pricing
              </Link>
              {authLink && (
                <Link to={authLink.to} className="hidden sm:inline-flex items-center h-10 text-sm text-dark-400 hover:text-dark-50 px-3 transition-colors">
                  {authLink.label}
                </Link>
              )}
              <Link to="/welcome" className="text-sm text-dark-400 hover:text-dark-50 px-2 hidden md:inline">
                Home
              </Link>
            </>
          )}
          {variant === 'marketing' && (
            <>
              <Link to="/pricing" className="hidden sm:inline-flex items-center h-10 text-sm text-dark-400 hover:text-dark-50 px-3 transition-colors">
                Pricing
              </Link>
              {!token && (
                <Link to="/login" className="hidden sm:inline-flex items-center h-10 text-sm text-dark-400 hover:text-dark-50 px-3 transition-colors">
                  Sign in
                </Link>
              )}
              <Link
                to={token ? '/' : '/signup'}
                className="btn-marketing-primary inline-flex items-center gap-2 h-10 text-sm px-5 shrink-0"
              >
                {token ? 'Dashboard' : 'Get started free'}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
