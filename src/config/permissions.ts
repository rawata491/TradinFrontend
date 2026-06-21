/** Mirrors backend role rules — use for nav and UI gating. */

export type Role = 'admin' | 'user'

export function isAdmin(role?: string | null): boolean {
  return role === 'admin'
}

/** Routes visible only to admins in navigation. */
export const ADMIN_ROUTES = ['/broadcast', '/admin'] as const

/** UI capabilities gated by role. */
export const permissions = {
  /** Full broadcast console + Telegram channel setup */
  broadcast: (role?: string | null) => isAdmin(role),
  /** Manual discovery scan trigger */
  discoverScan: (role?: string | null) => isAdmin(role),
  /** Manual whale scan trigger */
  whaleScan: (role?: string | null) => isAdmin(role),
  /** Token detail → Telegram alert button */
  tokenBroadcast: (role?: string | null) => isAdmin(role),
  /** Strategy runner → send signals to Telegram */
  strategyTelegram: (role?: string | null) => isAdmin(role),
  /** User management + activity log */
  adminPanel: (role?: string | null) => isAdmin(role),
} as const
