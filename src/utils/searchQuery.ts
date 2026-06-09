/** Normalize pair-style queries: TROLL/USD → TROLL */
export function normalizeSearchQuery(query: string): string {
  const trimmed = query.trim()
  if (!trimmed) return trimmed

  const pairMatch = trimmed.match(/^([^/\-_\s]+)\s*[/\-_]\s*([^/\-_\s]+)$/i)
  if (pairMatch?.[1]) {
    return pairMatch[1].trim()
  }

  return trimmed
}
