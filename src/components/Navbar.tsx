import { Link, useLocation } from 'react-router-dom'
import { BarChart2, Star, Home, WifiOff, Code2, Send, Layers, Sparkles } from 'lucide-react'
import { useWatchlistStore } from '@/store/useWatchlistStore'
import { ThemeToggle } from './ThemeToggle'
import { TokenSearchBar } from '@/components/token-search/TokenSearchBar'
import { APP_NAME } from '@/utils/constants'

interface NavbarProps {
  wsStatus: 'connecting' | 'connected' | 'disconnected' | 'error'
}

export function Navbar({ wsStatus }: NavbarProps) {
  const location = useLocation()
  const watchlistCount = useWatchlistStore((s) => s.items.length)

  const navItems = [
    { to: '/', label: 'Dashboard', icon: Home },
    { to: '/watchlist', label: 'Watchlist', icon: Star, badge: watchlistCount },
    { to: '/strategy', label: 'Strategy', icon: Code2 },
    { to: '/discover', label: 'Discover', icon: Sparkles },
    { to: '/onchain', label: 'On-Chain', icon: Layers },
    { to: '/broadcast', label: 'Broadcast', icon: Send },
  ]

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

  return (
    <header className="sticky top-0 z-50 bg-dark-950/90 backdrop-blur-md border-b border-dark-800">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="p-1.5 bg-brand-600 rounded-lg group-hover:bg-brand-500 transition-colors">
              {/* Always white icon on brand-600 background */}
              <BarChart2 className="h-5 w-5" style={{ color: '#ffffff' }} />
            </div>
            <span className="text-xl font-bold tracking-tight text-dark-50">
              {APP_NAME}
            </span>
          </Link>

          {/* Universal market search */}
          <div className="hidden md:block flex-1 max-w-xl mx-4">
            <TokenSearchBar />
          </div>

          {/* Nav links */}
          <nav className="flex items-center gap-1">
            {navItems.map(({ to, label, icon: Icon, badge }) => (
              <Link
                key={to}
                to={to}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                  isActive(to)
                    ? 'bg-dark-800 text-dark-50'
                    : 'text-dark-400 hover:text-dark-100 hover:bg-dark-800/60'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
                {badge !== undefined && badge > 0 && (
                  <span
                    className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center
                               bg-brand-600 text-[10px] font-bold rounded-full"
                    style={{ color: '#ffffff' }}
                  >
                    {badge > 99 ? '99+' : badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* Right section: WS status + theme toggle */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* WS status */}
            <div className="text-xs">
              {wsStatus === 'connected' ? (
                <span className="flex items-center gap-1.5 text-positive">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-positive opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-positive" />
                  </span>
                  <span className="hidden sm:inline">Live</span>
                </span>
              ) : wsStatus === 'connecting' ? (
                <span className="flex items-center gap-1.5 text-yellow-400">
                  <span className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse" />
                  <span className="hidden sm:inline">Connecting…</span>
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-dark-500">
                  <WifiOff className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Offline</span>
                </span>
              )}
            </div>

            {/* Theme toggle */}
            <ThemeToggle variant="switch" />
          </div>
        </div>
      </div>
    </header>
  )
}
