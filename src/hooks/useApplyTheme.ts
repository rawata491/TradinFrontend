import { useEffect } from 'react'
import { useThemeStore } from '@/store/useThemeStore'

export const PUBLIC_ROUTES = new Set([
  '/welcome',
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/terms',
  '/privacy',
  '/pricing',
])

export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.has(pathname)
}

/** Sync html.dark class with persisted theme preference. */
export function useApplyTheme() {
  const theme = useThemeStore((s) => s.theme)

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') root.classList.add('dark')
    else root.classList.remove('dark')
  }, [theme])
}
