import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Gauge } from 'lucide-react'
import { analyticsApi } from '@/services/analyticsApi'

export function FearGreedWidget() {
  const [value, setValue] = useState<number | null>(null)
  const [label, setLabel] = useState('')
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setLoading(true)
    setFailed(false)
    analyticsApi.fearGreed(1)
      .then((data) => {
        const current = data.current
        if (current) {
          setValue(current.value)
          setLabel(current.classification)
        } else {
          setFailed(true)
        }
      })
      .catch(() => setFailed(true))
      .finally(() => setLoading(false))
  }, [])

  const color =
    value == null
      ? 'text-dark-400'
      : value <= 25
        ? 'text-negative'
        : value <= 45
          ? 'text-yellow-400'
          : value <= 55
            ? 'text-dark-300'
            : value <= 75
              ? 'text-positive'
              : 'text-emerald-400'

  return (
    <Link
      to="/analytics?tab=fear-greed"
      className="card p-4 flex items-center gap-4 hover:border-brand-500/50 transition-colors group min-h-[88px]"
    >
      <div className="p-2 rounded-lg bg-dark-800 group-hover:bg-dark-700">
        <Gauge className={`h-5 w-5 ${color}`} />
      </div>
      <div>
        <p className="stat-label">Fear & Greed</p>
        {loading ? (
          <>
            <div className="h-8 w-12 bg-dark-800 rounded animate-pulse mt-1" />
            <div className="h-3 w-20 bg-dark-800 rounded animate-pulse mt-1" />
          </>
        ) : failed || value == null ? (
          <>
            <p className="text-2xl font-bold font-mono text-dark-500">—</p>
            <p className="text-xs text-dark-500">View in Analytics →</p>
          </>
        ) : (
          <>
            <p className={`text-2xl font-bold font-mono ${color}`}>{value}</p>
            <p className="text-xs text-dark-500">{label}</p>
          </>
        )}
      </div>
    </Link>
  )
}
