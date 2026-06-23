import axios from 'axios'
import { API_BASE_URL } from '@/utils/constants'
import { useAuthStore } from '@/store/useAuthStore'

const attachAuth = (config: import('axios').InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}

const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

/** Slow analytics endpoints (bridges, funding, global) can take 20–45s. */
export const analyticsHttp = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
})

/** AI insight generation can take 30–90s on cold cache. */
export const aiHttp = axios.create({
  baseURL: API_BASE_URL,
  timeout: 90000,
  headers: {
    'Content-Type': 'application/json',
  },
})

/** Backtest / script runs can be CPU-heavy. */
export const scriptHttp = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000,
  headers: {
    'Content-Type': 'application/json',
  },
})

for (const client of [http, analyticsHttp, aiHttp, scriptHttp]) {
  client.interceptors.request.use(attachAuth)
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const original = error.config
      if (error.response?.status === 401 && original && !original._retry) {
        original._retry = true
        const refreshed = await useAuthStore.getState().refreshAccessToken()
        if (refreshed) {
          original.headers.Authorization = `Bearer ${useAuthStore.getState().token}`
          return client(original)
        }
        useAuthStore.getState().logout()
      }
      const message =
        error.response?.data?.detail ??
        error.response?.data?.message ??
        error.message ??
        'An unexpected error occurred'
      return Promise.reject(new Error(typeof message === 'string' ? message : JSON.stringify(message)))
    },
  )
}

export default http
