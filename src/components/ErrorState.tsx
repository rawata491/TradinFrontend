import type { LucideIcon } from 'lucide-react'
import { AlertTriangle, BarChart2, RefreshCw, WifiOff } from 'lucide-react'

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
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center" role="alert">
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
        <button type="button" onClick={onRetry} className="btn-primary flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Try again
        </button>
      )}
    </div>
  )
}

interface EmptyStateProps {
  message?: string
  title?: string
  icon?: LucideIcon
  action?: { label: string; onClick: () => void } | { label: string; href: string }
}

export function EmptyState({
  message = 'No data available',
  title,
  icon: Icon = BarChart2,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="p-4 rounded-full bg-dark-800 border border-dark-700 mb-4">
        <Icon className="h-8 w-8 text-dark-400" />
      </div>
      {title && <h3 className="text-base font-semibold text-dark-100 mb-1">{title}</h3>}
      <p className="text-dark-400 text-sm max-w-sm">{message}</p>
      {action && (
        'href' in action ? (
          <a href={action.href} className="btn-primary mt-6 text-sm px-4 py-2">
            {action.label}
          </a>
        ) : (
          <button type="button" onClick={action.onClick} className="btn-primary mt-6 text-sm px-4 py-2">
            {action.label}
          </button>
        )
      )}
    </div>
  )
}
