interface LoaderProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Loader({ size = 'md', className = '' }: LoaderProps) {
  const sizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3',
  }
  return (
    <div
      className={`animate-spin rounded-full border-dark-700 border-t-brand-500 ${sizes[size]} ${className}`}
      role="status"
      aria-label="Loading"
    />
  )
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-4">
        <Loader size="lg" />
        <p className="text-dark-400 text-sm">Loading market data…</p>
      </div>
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="card p-4 space-y-3 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="skeleton h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-24 rounded" />
          <div className="skeleton h-3 w-16 rounded" />
        </div>
        <div className="skeleton h-5 w-16 rounded" />
      </div>
      <div className="flex justify-between">
        <div className="skeleton h-6 w-28 rounded" />
        <div className="skeleton h-5 w-14 rounded-full" />
      </div>
    </div>
  )
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-4 py-3 animate-pulse">
      <div className="skeleton h-8 w-8 rounded-full" />
      <div className="flex-1 space-y-1">
        <div className="skeleton h-4 w-20 rounded" />
        <div className="skeleton h-3 w-14 rounded" />
      </div>
      <div className="skeleton h-4 w-24 rounded" />
      <div className="skeleton h-4 w-16 rounded-full" />
      <div className="skeleton h-4 w-20 rounded" />
    </div>
  )
}
