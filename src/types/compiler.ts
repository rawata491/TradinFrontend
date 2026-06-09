export interface CompilerError {
  line: number
  col: number
  message: string
  severity: 'error' | 'warning' | 'info'
  source: string
}

export interface ValidationResult {
  valid: boolean
  errors: CompilerError[]
  warnings: CompilerError[]
  strategy_name: string | null
  indicators_used: string[]
}

export interface ValidateRequest {
  source: string
}
