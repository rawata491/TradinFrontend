import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import type { NavItem } from '@/config/navigation'

interface NavDropdownProps {
  label: string
  items: NavItem[]
  badgeCounts?: Record<string, number>
  isActive: (path: string) => boolean
}

export function NavDropdown({ label, items, badgeCounts, isActive }: NavDropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const location = useLocation()

  const anyActive = items.some((item) => isActive(item.to))

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!open) return
    const onPointer = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onPointer)
    return () => document.removeEventListener('mousedown', onPointer)
  }, [open])

  if (items.length === 0) return null

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
          anyActive || open
            ? 'bg-dark-800 text-dark-50'
            : 'text-dark-400 hover:text-dark-100 hover:bg-dark-800/60'
        }`}
      >
        {label}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-1.5 min-w-[11rem] rounded-xl border border-dark-700 bg-dark-900 shadow-xl py-1 z-50"
        >
          {items.map(({ to, label: itemLabel, icon: Icon, badgeKey }) => {
            const badge = badgeKey ? badgeCounts?.[badgeKey] : undefined
            return (
              <Link
                key={to}
                to={to}
                role="menuitem"
                className={`flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors ${
                  isActive(to)
                    ? 'bg-dark-800 text-brand-400'
                    : 'text-dark-200 hover:bg-dark-800/60 hover:text-dark-50'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0 opacity-70" />
                <span className="flex-1">{itemLabel}</span>
                {badge !== undefined && badge > 0 && (
                  <span className="text-[10px] font-bold bg-brand-600 text-white px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">
                    {badge > 99 ? '99+' : badge}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
