import { AlertTriangle, RefreshCw, WifiOff } from 'lucide-react'

interface ErrorStateProps {
  message?: string
  onRetry?: () => void
  variant?: 'general' | 'network' | 'notFound'
}

export function ErrorState({
  message = 'Something went wrong',
  onRetry,
  variant = 'general',
}: ErrorStateProps) {
  const Icon = variant === 'network' ? WifiOff : AlertTriangle

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="p-4 bg-negative/10 rounded-full mb-4">
        <Icon className="h-8 w-8 text-negative" />
      </div>
      <h3 className="text-lg font-semibold text-dark-50 mb-2">
        {variant === 'network'
          ? 'Connection Failed'
          : variant === 'notFound'
            ? 'Not Found'
            : 'Error'}
      </h3>
      <p className="text-dark-400 text-sm max-w-sm mb-6">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-primary flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Try again
        </button>
      )}
    </div>
  )
}

export function EmptyState({ message = 'No data available' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="text-5xl mb-4">📊</div>
      <p className="text-dark-400 text-sm">{message}</p>
    </div>
  )
}
