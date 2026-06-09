import { useStrategyStore } from '@/store/useStrategyStore'
import { Trash2, Terminal } from 'lucide-react'

export function ExecutionLogs() {
  const logs = useStrategyStore(s => s.executionLog)
  const clearLogs = useStrategyStore(s => s.clearLogs)

  return (
    <div className="flex flex-col h-full min-h-48">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-dark-800 bg-dark-950">
        <div className="flex items-center gap-2 text-xs text-dark-400 font-medium">
          <Terminal className="w-3.5 h-3.5" />
          Execution Log
        </div>
        {logs.length > 0 && (
          <button
            onClick={clearLogs}
            className="text-dark-500 hover:text-dark-300 transition-colors p-0.5 rounded"
            title="Clear logs"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Log body */}
      <div className="flex-1 overflow-y-auto font-mono text-xs p-3 space-y-0.5 bg-dark-900">
        {logs.length === 0 ? (
          <p className="text-dark-500 italic">No logs yet. Run a script to see output.</p>
        ) : (
          logs.map((line, i) => {
            const isError   = line.includes('✗') || line.includes('Error')
            const isSuccess = line.includes('✓') || line.includes('Done')
            const color = isError   ? 'text-red-400'
                        : isSuccess ? 'text-positive'
                        :             'text-dark-300'
            return (
              <div key={i} className={`leading-5 ${color}`}>
                {line}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
