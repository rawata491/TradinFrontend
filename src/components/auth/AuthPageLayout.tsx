import type { LucideIcon } from 'lucide-react'
import { Brain, LineChart, Shield, Zap } from 'lucide-react'
import { PublicFooter } from '@/components/public/PublicFooter'
import { PublicHeader } from '@/components/public/PublicHeader'
import { PublicGlassPanel } from '@/components/PublicPageShell'

export const AUTH_HIGHLIGHTS: { icon: LucideIcon; title: string; desc: string }[] = [
  {
    icon: LineChart,
    title: 'Live market data',
    desc: 'WebSocket charts across Coinbase & Gate.io pairs.',
  },
  {
    icon: Brain,
    title: 'AI insights',
    desc: 'Summaries, sentiment, and key drivers per symbol.',
  },
  {
    icon: Zap,
    title: 'Pine Script backtests',
    desc: 'Run and validate strategies in a sandboxed runtime.',
  },
  {
    icon: Shield,
    title: 'Paper trading',
    desc: 'Simulate positions — no exchange connection required.',
  },
]

const AUTH_STATS = [
  { value: '13', label: 'Research tabs' },
  { value: 'Live', label: 'WebSocket feeds' },
  { value: '$0', label: 'To start' },
]

interface AuthPageLayoutProps {
  children: React.ReactNode
  panelTitle: string
  panelSubtitle: string
  panelBadge?: string
  authLink?: { to: string; label: string }
}

export function AuthPageLayout({
  children,
  panelTitle,
  panelSubtitle,
  panelBadge = 'Research platform · Not a broker',
  authLink,
}: AuthPageLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-dark-950 text-dark-50">
      {/* Backdrop */}
      <div className="dark:hidden fixed inset-0 -z-10 bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100" aria-hidden />
      <div className="hidden dark:block fixed inset-0 -z-10 overflow-hidden" aria-hidden>
        <div className="landing-aurora landing-aurora-1 opacity-20" />
        <div className="landing-aurora landing-aurora-2 opacity-15" />
        <div className="landing-grid opacity-40" />
      </div>

      <PublicHeader variant="minimal" maxWidth="7xl" authLink={authLink} />

      <main id="main-content" className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center min-h-[calc(100vh-12rem)]">
          {/* Left marketing panel */}
          <div className="space-y-8 lg:pr-4">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-dark-800 bg-dark-900/80 text-xs font-mono text-dark-400 dark:border-white/10 dark:bg-white/5">
                <span className="h-2 w-2 rounded-full bg-signal animate-pulse" />
                {panelBadge}
              </span>
              <h1 className="text-3xl sm:text-4xl font-bold leading-tight text-dark-50">
                {panelTitle}
              </h1>
              <p className="text-dark-400 text-lg leading-relaxed max-w-md">
                {panelSubtitle}
              </p>
            </div>

            <ul className="space-y-4">
              {AUTH_HIGHLIGHTS.map(({ icon: Icon, title, desc }) => (
                <li key={title} className="flex gap-4">
                  <div className="shrink-0 p-2.5 rounded-xl bg-brand-600/10 border border-brand-500/20 h-fit">
                    <Icon className="h-5 w-5 text-brand-500" />
                  </div>
                  <div>
                    <p className="font-medium text-dark-100">{title}</p>
                    <p className="text-sm text-dark-400 mt-0.5">{desc}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="hidden sm:grid grid-cols-3 gap-4 pt-2 border-t border-dark-800 dark:border-white/10">
              {AUTH_STATS.map(({ value, label }) => (
                <div key={label}>
                  <p className="text-xl font-bold font-mono text-dark-50">{value}</p>
                  <p className="text-xs text-dark-400 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Form panel */}
          <div className="w-full max-w-md mx-auto lg:max-w-none lg:mx-0">
            <PublicGlassPanel className="lg:shadow-2xl">{children}</PublicGlassPanel>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}
