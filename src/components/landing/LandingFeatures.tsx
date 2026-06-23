import { useEffect, useRef, useState } from 'react'
import {
  Activity,
  Bell,
  Brain,
  Layers,
  LineChart,
  Shield,
  Sparkles,
  Waves,
  Zap,
} from 'lucide-react'

type AccentFamily = 'brand' | 'intelligence' | 'signal'

const ACCENT_GRADIENT: Record<AccentFamily, string> = {
  brand: 'from-brand-500/20 to-brand-600/5',
  intelligence: 'from-intelligence/20 to-violet-600/5',
  signal: 'from-signal/20 to-emerald-600/5',
}

const FEATURES: {
  icon: typeof LineChart
  title: string
  desc: string
  span: string
  accent: AccentFamily
}[] = [
  {
    icon: LineChart,
    title: 'Live market pulse',
    desc: 'WebSocket tickers from Coinbase & Gate.io with sub-second updates across your watchlist.',
    span: 'md:col-span-2',
    accent: 'brand',
  },
  {
    icon: Zap,
    title: 'Pine Script engine',
    desc: 'Write, validate, run, and backtest strategies in a sandboxed DSL runtime.',
    span: '',
    accent: 'brand',
  },
  {
    icon: Brain,
    title: 'AI market intel',
    desc: 'GPT-powered summaries, sentiment scores, and key driver analysis per symbol.',
    span: '',
    accent: 'intelligence',
  },
  {
    icon: Layers,
    title: '13 research tabs',
    desc: 'Funding rates, fear & greed, liquidations, correlation matrices, bridge flows, and more.',
    span: 'md:col-span-2',
    accent: 'brand',
  },
  {
    icon: Waves,
    title: 'On-chain radar',
    desc: 'Whale detection, smart money scoring, DEX flow analysis, and live signal broadcasts.',
    span: '',
    accent: 'signal',
  },
  {
    icon: Bell,
    title: 'Multi-channel alerts',
    desc: 'Price targets hit your browser, WebSocket toast, and Telegram — instantly.',
    span: '',
    accent: 'signal',
  },
  {
    icon: Shield,
    title: 'Paper trading',
    desc: 'Simulate long/short positions with live P&L. Zero real funds at risk.',
    span: 'md:col-span-2',
    accent: 'brand',
  },
  {
    icon: Activity,
    title: 'Token discovery',
    desc: 'Scan new DEX listings, surging tokens, and whale scan hits on a schedule.',
    span: '',
    accent: 'signal',
  },
  {
    icon: Sparkles,
    title: 'Strategy signals',
    desc: 'Latest-bar signals overlay on charts and can open practice trades in one click.',
    span: '',
    accent: 'intelligence',
  },
]

function FeatureCard({
  icon: Icon,
  title,
  desc,
  span,
  accent,
  delay,
}: (typeof FEATURES)[0] & { delay: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true) },
      { threshold: 0.15 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`group relative overflow-hidden rounded-2xl border border-dark-800 bg-dark-900 p-6 transition-all duration-700
                  hover:border-dark-700 hover:shadow-lg
                  dark:border-white/8 dark:bg-white/[0.03] dark:hover:border-white/15 dark:hover:bg-white/[0.06]
                  ${span} ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${ACCENT_GRADIENT[accent]} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      <div className="relative">
        <div className="inline-flex p-2.5 rounded-xl bg-dark-800 border border-dark-700 mb-4 group-hover:scale-110 transition-all duration-300 dark:bg-white/5 dark:border-white/10 dark:group-hover:border-brand-500/30">
          <Icon className="h-5 w-5 text-brand-500" />
        </div>
        <h3 className="text-lg font-semibold text-dark-50 mb-2">{title}</h3>
        <p className="text-sm text-dark-400 leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}

export function LandingFeatures() {
  return (
    <section className="relative px-6 py-24 max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <p className="text-sm font-mono text-brand-500 uppercase tracking-[0.2em] mb-3">Platform</p>
        <h2 className="text-3xl md:text-4xl font-bold text-dark-50">
          Everything a researcher needs.
          <span className="block text-dark-400 text-xl md:text-2xl font-normal mt-2">
            Nothing a broker would ask for.
          </span>
        </h2>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {FEATURES.map((f, i) => (
          <FeatureCard key={f.title} {...f} delay={i * 80} />
        ))}
      </div>
    </section>
  )
}
