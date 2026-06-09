import { AlertTriangle, XCircle, Info } from 'lucide-react'
import { useEditorStore } from '@/store/useEditorStore'
import type { CompilerError } from '@/types/compiler'

function ErrorRow({ err }: { err: CompilerError }) {
  const Icon =
    err.severity === 'error'   ? XCircle :
    err.severity === 'warning' ? AlertTriangle : Info

  const iconColor =
    err.severity === 'error'   ? 'text-red-500' :
    err.severity === 'warning' ? 'text-yellow-500' : 'text-brand-400'

  const lineColor =
    err.severity === 'error'   ? 'text-red-500' :
    err.severity === 'warning' ? 'text-yellow-500' : 'text-brand-400'

  return (
    <div className="flex items-start gap-2 px-3 py-2 text-xs border-b border-dark-800 last:border-0 hover:bg-dark-800/30 transition-colors">
      <Icon className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${iconColor}`} />
      <div className="flex-1 min-w-0">
        {err.line > 0 && (
          <span className={`font-medium ${lineColor}`}>
            Line {err.line}:{err.col}{' '}
          </span>
        )}
        <span className="text-dark-300">{err.message}</span>
      </div>
      <span className="text-dark-500 text-[10px] font-mono shrink-0">{err.source}</span>
    </div>
  )
}

export function CompilerErrors() {
  const errors = useEditorStore(s => s.compilerErrors)
  const isValidating = useEditorStore(s => s.isValidating)

  if (isValidating) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-xs text-dark-400">
        <div className="w-3 h-3 border border-dark-500 border-t-transparent rounded-full animate-spin" />
        Validating…
      </div>
    )
  }

  if (!errors.length) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-xs text-positive">
        <span className="w-2 h-2 rounded-full bg-positive" />
        No issues found
      </div>
    )
  }

  const errorCount = errors.filter(e => e.severity === 'error').length
  const warnCount  = errors.filter(e => e.severity === 'warning').length

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-3 px-3 py-1.5 bg-dark-950 border-b border-dark-800 text-xs text-dark-400">
        {errorCount > 0 && (
          <span className="text-red-500">{errorCount} error{errorCount !== 1 ? 's' : ''}</span>
        )}
        {warnCount > 0 && (
          <span className="text-yellow-500">{warnCount} warning{warnCount !== 1 ? 's' : ''}</span>
        )}
      </div>
      <div className="overflow-y-auto max-h-40">
        {errors.map((err, i) => <ErrorRow key={i} err={err} />)}
      </div>
    </div>
  )
}
