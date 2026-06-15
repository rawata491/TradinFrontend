import http, { scriptHttp } from '@/services/httpClient'
import type { Script, ScriptCreate, ScriptUpdate, ScriptListResponse } from '@/types/script'
import type { ValidationResult, ValidateRequest } from '@/types/compiler'
import type { RunRequest, RunResponse, Signal } from '@/types/signal'
import type { BacktestRequest, BacktestResult } from '@/types/backtest'

export const scriptApi = {
  list: (page = 1, pageSize = 20): Promise<ScriptListResponse> =>
    http.get('/api/scripts', { params: { page, page_size: pageSize } }).then((r) => r.data),

  get: (id: number): Promise<Script> =>
    http.get(`/api/scripts/${id}`).then((r) => r.data),

  create: (payload: ScriptCreate): Promise<Script> =>
    http.post('/api/scripts', payload).then((r) => r.data),

  update: (id: number, payload: ScriptUpdate): Promise<Script> =>
    http.put(`/api/scripts/${id}`, payload).then((r) => r.data),

  delete: (id: number): Promise<void> =>
    http.delete(`/api/scripts/${id}`).then(() => undefined),

  validate: (payload: ValidateRequest): Promise<ValidationResult> =>
    http.post('/api/scripts/validate', payload).then((r) => r.data),

  run: (symbol: string, payload: RunRequest): Promise<RunResponse> =>
    http.post(`/api/scripts/run/${symbol}`, payload).then((r) => r.data),

  runSaved: (scriptId: number, symbol: string, payload: RunRequest): Promise<RunResponse> =>
    http.post(`/api/scripts/${scriptId}/run/${symbol}`, payload).then((r) => r.data),

  backtest: (symbol: string, payload: BacktestRequest): Promise<BacktestResult> =>
    scriptHttp.post(`/api/scripts/backtest/${symbol}`, payload).then((r) => r.data),

  backtestSaved: (scriptId: number, symbol: string, payload: BacktestRequest): Promise<BacktestResult> =>
    scriptHttp.post(`/api/scripts/${scriptId}/backtest/${symbol}`, payload).then((r) => r.data),

  getSignals: (scriptId: number, symbol: string, limit = 100): Promise<{ signals: Signal[] }> =>
    http.get(`/api/scripts/${scriptId}/signals/${symbol}`, { params: { limit } }).then((r) => r.data),
}
