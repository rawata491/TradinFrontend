import { Link, useLocation } from 'react-router-dom'
import { BarChart2, WifiOff } from 'lucide-react'
import { useWatchlistStore } from '@/store/useWatchlistStore'
import { useAuthStore } from '@/store/useAuthStore'
import { UnifiedSearchBar } from '@/components/token-search/UnifiedSearchBar'
import { NavDropdown } from '@/components/NavDropdown'
import { UserMenu } from '@/components/UserMenu'
import { ThemeToggle } from '@/components/ThemeToggle'
import { APP_NAME } from '@/utils/constants'
import { PRIMARY_NAV, visibleSecondaryNav } from '@/config/navigation'

interface NavbarProps {
  wsStatus: 'connecting' | 'connected' | 'disconnected' | 'error'
}

export function Navbar({ wsStatus }: NavbarProps) {
  const location = useLocation()
  const user = useAuthStore((s) => s.user)
  const watchlistCount = useWatchlistStore((s) => s.items.length)
  const isAdmin = user?.role === 'admin'

  const secondaryItems = visibleSecondaryNav(isAdmin)

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

  return (
    <header className="sticky top-0 z-50 bg-dark-950/90 backdrop-blur-md border-b border-dark-800">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-14 gap-3">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 group flex-shrink-0"
            aria-label={`${APP_NAME} home`}
          >
            <div className="p-1.5 bg-brand-600 rounded-lg group-hover:bg-brand-500 transition-colors">
              <BarChart2 className="h-4 w-4" style={{ color: '#ffffff' }} />
            </div>
            <span className="text-lg font-bold tracking-tight text-dark-50 hidden lg:inline">
              {APP_NAME}
            </span>
          </Link>

          {/* Primary nav — tablet+ */}
          <nav className="hidden md:flex items-center gap-0.5 flex-shrink-0" aria-label="Main">
            {PRIMARY_NAV.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                aria-label={label}
                aria-current={isActive(to) ? 'page' : undefined}
                className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive(to)
                    ? 'bg-dark-800 text-dark-50'
                    : 'text-dark-400 hover:text-dark-100 hover:bg-dark-800/60'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden lg:inline">{label}</span>
              </Link>
            ))}
            <NavDropdown
              label="More"
              items={secondaryItems}
              badgeCounts={{ watchlist: watchlistCount }}
              isActive={isActive}
            />
          </nav>

          {/* Search — grows to fill middle space */}
          <div className="flex-1 min-w-0 max-w-md mx-auto">
            <UnifiedSearchBar />
          </div>

          {/* Right cluster */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="text-xs" title={wsStatus === 'connected' ? 'Live market data' : wsStatus}>
              {wsStatus === 'connected' ? (
                <span className="flex items-center gap-1 text-positive">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-positive opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-positive" />
                  </span>
                  <span className="hidden xl:inline">Live</span>
                </span>
              ) : wsStatus === 'connecting' ? (
                <span className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse" title="Connecting…" />
              ) : (
                <span title={wsStatus}>
                  <WifiOff className="h-3.5 w-3.5 text-dark-500" />
                </span>
              )}
            </div>
            <ThemeToggle variant="pill" />
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  )
}
