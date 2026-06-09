import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react'

interface MarketDriversProps {
  positiveFactors: string[]
  negativeFactors: string[]
  loading?: boolean
}

function DriverItem({ text, type }: { text: string; type: 'positive' | 'negative' }) {
  const isPositive = type === 'positive'
  return (
    <li className="flex items-start gap-2 text-sm">
      <span
        className={`mt-0.5 flex-shrink-0 ${
          isPositive ? 'text-emerald-400' : 'text-red-400'
        }`}
      >
        {isPositive ? (
          <TrendingUp className="h-3.5 w-3.5" />
        ) : (
          <TrendingDown className="h-3.5 w-3.5" />
        )}
      </span>
      <span className="text-dark-200 leading-snug">{text}</span>
    </li>
  )
}

function DriverSkeleton() {
  return (
    <li className="flex items-start gap-2">
      <div className="mt-0.5 h-3.5 w-3.5 rounded bg-dark-700 animate-pulse flex-shrink-0" />
      <div className="h-4 w-3/4 rounded bg-dark-700 animate-pulse" />
    </li>
  )
}

export function MarketDrivers({
  positiveFactors,
  negativeFactors,
  loading = false,
}: MarketDriversProps) {
  const hasData = positiveFactors.length > 0 || negativeFactors.length > 0

  if (!loading && !hasData) {
    return (
      <div className="flex items-center gap-2 text-sm text-dark-400 py-3">
        <AlertCircle className="h-4 w-4" />
        <span>No market drivers identified yet.</span>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Positive drivers */}
      <div>
        <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <TrendingUp className="h-3.5 w-3.5" />
          Catalysts
        </h4>
        <ul className="space-y-2">
          {loading ? (
            Array.from({ length: 2 }).map((_, i) => <DriverSkeleton key={i} />)
          ) : positiveFactors.length > 0 ? (
            positiveFactors.map((f, i) => (
              <DriverItem key={i} text={f} type="positive" />
            ))
          ) : (
            <li className="text-sm text-dark-500 italic">None identified</li>
          )}
        </ul>
      </div>

      {/* Negative drivers */}
      <div>
        <h4 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <TrendingDown className="h-3.5 w-3.5" />
          Risk Factors
        </h4>
        <ul className="space-y-2">
          {loading ? (
            Array.from({ length: 2 }).map((_, i) => <DriverSkeleton key={i} />)
          ) : negativeFactors.length > 0 ? (
            negativeFactors.map((f, i) => (
              <DriverItem key={i} text={f} type="negative" />
            ))
          ) : (
            <li className="text-sm text-dark-500 italic">None identified</li>
          )}
        </ul>
      </div>
    </div>
  )
}
