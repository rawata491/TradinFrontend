import React from 'react'
import ReactDOM from 'react-dom/client'
import { inject } from '@vercel/analytics'
import App from './App'
import './index.css'

// Apply saved theme BEFORE first paint to prevent a flash of the wrong theme.
;(function applyInitialTheme() {
  try {
    const stored = localStorage.getItem('tradin_theme')
    const parsed = stored ? JSON.parse(stored) : null
    const savedTheme: string | null = parsed?.state?.theme ?? null

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const theme = savedTheme ?? (prefersDark ? 'dark' : 'light')

    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  } catch {
    document.documentElement.classList.add('dark')
  }
})()

inject()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
