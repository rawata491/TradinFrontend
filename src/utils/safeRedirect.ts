/** Sanitize post-login redirect to same-origin paths only. */
export function safeRedirectPath(next: string | null | undefined, fallback = '/'): string {
  if (!next || !next.startsWith('/') || next.startsWith('//')) return fallback
  if (next.startsWith('/login') || next.startsWith('/signup') || next.startsWith('/welcome')) return fallback
  return next
}
