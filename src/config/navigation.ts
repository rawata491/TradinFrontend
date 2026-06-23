import type { LucideIcon } from 'lucide-react'
import {
  Home,
  Sparkles,
  LineChart,
  Briefcase,
  FlaskConical,
  Star,
  Bell,
  Code2,
  Layers,
  Send,
  Shield,
} from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  /** When set, Navbar reads badge count from watchlist store. */
  badgeKey?: 'watchlist'
  adminOnly?: boolean
}

/** Always visible in the header (desktop) and bottom bar (mobile). */
export const PRIMARY_NAV: NavItem[] = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/discover', label: 'Discover', icon: Sparkles },
  { to: '/analytics', label: 'Analytics', icon: LineChart },
  { to: '/portfolio', label: 'Portfolio', icon: Briefcase },
]

/** Grouped under "More" on desktop; overflow menu on mobile. */
export const SECONDARY_NAV: NavItem[] = [
  { to: '/watchlist', label: 'Watchlist', icon: Star, badgeKey: 'watchlist' },
  { to: '/practice', label: 'Practice', icon: FlaskConical },
  { to: '/alerts', label: 'Alerts', icon: Bell },
  { to: '/strategy', label: 'Strategy', icon: Code2 },
  { to: '/onchain', label: 'On-Chain', icon: Layers },
  { to: '/broadcast', label: 'Broadcast', icon: Send, adminOnly: true },
  { to: '/admin', label: 'Admin', icon: Shield, adminOnly: true },
]

export function visibleSecondaryNav(isAdmin: boolean): NavItem[] {
  return SECONDARY_NAV.filter((item) => !item.adminOnly || isAdmin)
}
