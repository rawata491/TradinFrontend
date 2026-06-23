import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Star, FlaskConical, Code2, X } from 'lucide-react'
import { useWatchlistStore } from '@/store/useWatchlistStore'
import { DEFAULT_WATCHLIST } from '@/utils/constants'

const STORAGE_KEY = 'tradin.onboardingComplete'

export function isOnboardingComplete(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

export function markOnboardingComplete() {
  try {
    localStorage.setItem(STORAGE_KEY, 'true')
  } catch {
    /* ignore */
  }
}

export function OnboardingModal() {
  const [step, setStep] = useState(0)
  const [open, setOpen] = useState(() => !isOnboardingComplete())
  const navigate = useNavigate()
  const setItems = useWatchlistStore((s) => s.setItems)

  if (!open) return null

  const finish = () => {
    markOnboardingComplete()
    setOpen(false)
  }

  const steps = [
    {
      icon: Star,
      title: 'Build your watchlist',
      body: 'We added popular markets to your watchlist. Star any coin from the dashboard to track it.',
      action: () => {
        setItems([...DEFAULT_WATCHLIST])
        setStep(1)
      },
      actionLabel: 'Use defaults & continue',
    },
    {
      icon: FlaskConical,
      title: 'Try a paper trade',
      body: 'Practice with virtual money on the BTC chart — order book and trader panel on the right.',
      action: () => {
        finish()
        navigate('/coin/BTC-USD')
      },
      actionLabel: 'Open BTC chart',
    },
    {
      icon: Code2,
      title: 'Run a sample backtest',
      body: 'Open the strategy workspace with a pre-loaded EMA crossover script and run a backtest.',
      action: () => {
        finish()
        navigate('/strategy')
      },
      actionLabel: 'Open strategy lab',
    },
  ]

  const current = steps[step]
  const Icon = current.icon

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="card max-w-md w-full p-6 relative animate-fade-in">
        <button
          type="button"
          onClick={finish}
          className="absolute top-4 right-4 text-dark-500 hover:text-dark-200"
          aria-label="Skip onboarding"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-brand-500/10">
            <Icon className="h-6 w-6 text-brand-400" />
          </div>
          <div>
            <p className="text-xs text-dark-500">Step {step + 1} of {steps.length}</p>
            <h2 className="text-lg font-bold text-dark-50">{current.title}</h2>
          </div>
        </div>
        <p className="text-sm text-dark-400 mb-6">{current.body}</p>
        <div className="flex gap-2">
          <button type="button" onClick={current.action} className="btn-primary flex-1 py-2.5 text-sm">
            {current.actionLabel}
          </button>
          {step < steps.length - 1 && (
            <button type="button" onClick={finish} className="btn-ghost px-4 text-sm">
              Skip
            </button>
          )}
        </div>
        <p className="text-[10px] text-dark-600 mt-4 text-center">
          Simulated trading only —{' '}
          <Link to="/terms" className="text-brand-400 hover:underline" onClick={finish}>
            learn more
          </Link>
        </p>
      </div>
    </div>
  )
}
