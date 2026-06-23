import { Link } from 'react-router-dom'
import { ArrowRight, ChevronRight, Play } from 'lucide-react'
import { LandingBackground } from '@/components/landing/LandingBackground'
import { LandingLightBackground } from '@/components/landing/LandingLightBackground'
import { LandingTicker } from '@/components/landing/LandingTicker'
import { LandingHeroChart } from '@/components/landing/LandingHeroChart'
import { LandingFeatures } from '@/components/landing/LandingFeatures'
import { PublicFooter } from '@/components/public/PublicFooter'
import { PublicHeader } from '@/components/public/PublicHeader'

const STATS = [
  { value: '13', label: 'Research tabs' },
  { value: 'Live', label: 'WebSocket data' },
  { value: 'Pine', label: 'Script DSL' },
  { value: '0$', label: 'To start' },
]

export function LandingPage() {
  return (
    <div className="relative min-h-screen flex flex-col text-dark-50 selection:bg-brand-500/30 overflow-x-hidden">
      <div className="dark:hidden">
        <LandingLightBackground />
      </div>
      <div className="hidden dark:block">
        <LandingBackground />
      </div>

      <PublicHeader />

      <main id="main-content" className="relative z-10">
        <LandingTicker />

        <section className="relative z-10 px-6 pt-16 pb-24 max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-dark-800 bg-dark-900/80 backdrop-blur-sm landing-badge-glow landing-fade-up dark:border-white/10 dark:bg-white/5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-signal opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-signal" />
                </span>
                <span className="text-xs font-mono text-dark-400 dark:text-dark-400">Research platform · Not a broker</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.08] tracking-tight">
                <span className="block text-dark-50 landing-line-reveal">Decode the</span>
                <span className="block landing-gradient-text landing-line-reveal landing-line-reveal-1">crypto markets</span>
                <span className="block text-dark-200 text-3xl sm:text-4xl lg:text-5xl font-semibold mt-2 landing-line-reveal landing-line-reveal-2">
                  before you trade them.
                </span>
              </h1>

              <p className="text-lg text-dark-400 max-w-xl mx-auto lg:mx-0 leading-relaxed landing-line-reveal landing-line-reveal-3">
                Real-time charts, AI insights, Pine Script backtests, on-chain whale radar,
                and paper trading — unified in one cinematic dashboard.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start landing-line-reveal landing-line-reveal-4">
                <Link to="/signup" className="btn-marketing-primary relative overflow-hidden inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-semibold group">
                  <span className="absolute inset-0 landing-btn-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden />
                  <span className="relative">Start researching free</span>
                  <ChevronRight className="relative h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link to="/login" className="btn-marketing-secondary px-8 py-4 rounded-2xl group">
                  <Play className="h-4 w-4 fill-current opacity-60 transition-transform group-hover:scale-110" />
                  Sign in to dashboard
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
                {STATS.map(({ value, label }, i) => (
                  <div key={label} className={`text-center lg:text-left landing-stat-pop landing-stat-pop-${i + 1}`}>
                    <p className="text-2xl font-bold font-mono text-dark-50 landing-stat-glow">{value}</p>
                    <p className="text-xs text-dark-400 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="landing-hero-chart-enter">
              <LandingHeroChart />
            </div>
          </div>
        </section>

        <div className="relative z-10 py-8 overflow-hidden border-y border-dark-800 dark:border-white/5">
          <div className="flex animate-marquee-slow whitespace-nowrap">
            {[...Array(2)].map((_, gi) => (
              <div key={gi} className="flex shrink-0">
                {['Backtesting', 'Whale Scanner', 'Fear & Greed', 'Funding Rates', 'Token Discovery', 'Price Alerts', 'MTF Fib', 'Smart Money', 'Paper Trading', 'AI Sentiment'].map(
                  (tag) => (
                    <span
                      key={`${gi}-${tag}`}
                      className="mx-3 px-4 py-1.5 rounded-full border border-dark-800 bg-dark-900 text-sm text-dark-400 font-mono dark:border-white/8 dark:bg-white/[0.03]"
                    >
                      {tag}
                    </span>
                  ),
                )}
              </div>
            ))}
          </div>
        </div>

        <LandingFeatures />

        <section className="relative z-10 px-6 py-24 max-w-3xl mx-auto text-center">
          <div className="relative rounded-3xl border border-dark-800 bg-dark-900 p-12 overflow-hidden dark:border-white/10 landing-cta-enter">
            <div className="absolute inset-0 bg-brand-600/5 dark:bg-brand-600/10" aria-hidden />
            <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-brand-500/10 blur-3xl landing-cta-orb" aria-hidden />
            <div className="relative space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-dark-50">Ready to research smarter?</h2>
              <p className="text-dark-400 max-w-md mx-auto">
                Join free. No credit card. Simulate strategies, set alerts, and explore on-chain — all without connecting an exchange.
              </p>
              <Link to="/signup" className="btn-marketing-primary inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold">
                Create your account
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  )
}
