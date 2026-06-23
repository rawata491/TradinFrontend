import { useEffect, useState } from 'react'

const CANDLES = [
  { o: 60, c: 72, h: 78, l: 55 },
  { o: 72, c: 68, h: 75, l: 62 },
  { o: 68, c: 82, h: 86, l: 65 },
  { o: 82, c: 78, h: 88, l: 74 },
  { o: 78, c: 90, h: 94, l: 76 },
  { o: 90, c: 85, h: 93, l: 82 },
  { o: 85, c: 96, h: 100, l: 83 },
  { o: 96, c: 92, h: 99, l: 88 },
  { o: 92, c: 105, h: 110, l: 90 },
  { o: 105, c: 100, h: 108, l: 97 },
  { o: 100, c: 112, h: 118, l: 98 },
  { o: 112, c: 108, h: 115, l: 104 },
]

export function LandingHeroChart() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 300)
    return () => clearTimeout(t)
  }, [])

  const linePath = CANDLES.map((c, i) => {
    const x = 20 + i * 28
    const y = 130 - c.c
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
  }).join(' ')

  return (
    <div className="relative w-full max-w-lg mx-auto animate-float">
      <div className="absolute -inset-4 bg-brand-500/10 blur-3xl rounded-full animate-pulse-glow" />
      <div className="relative rounded-2xl border border-dark-800 bg-dark-900 backdrop-blur-xl p-5 shadow-xl dark:border-white/10 dark:shadow-2xl dark:shadow-brand-500/10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-dark-400 font-mono dark:text-white/40">BTC-USD · 1H</p>
            <p className="text-2xl font-bold text-dark-50 font-mono tracking-tight dark:text-white">
              $97,842<span className="text-emerald-600 dark:text-emerald-400 text-sm ml-2">+2.41%</span>
            </p>
          </div>
          <div className="flex gap-1">
            {['1H', '4H', '1D'].map((tf) => (
              <span
                key={tf}
                className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                  tf === '1H' ? 'bg-blue-500/30 text-blue-300' : 'text-white/30'
                }`}
              >
                {tf}
              </span>
            ))}
          </div>
        </div>

        <svg viewBox="0 0 360 140" className="w-full h-auto" aria-hidden>
          <defs>
            <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
          </defs>

          {[30, 60, 90, 120].map((y) => (
            <line key={y} x1="10" y1={y} x2="350" y2={y} stroke="rgba(255,255,255,0.04)" />
          ))}

          {CANDLES.map((c, i) => {
            const x = 20 + i * 28
            const bullish = c.c >= c.o
            const color = bullish ? '#22c55e' : '#ef4444'
            const bodyTop = 130 - Math.max(c.o, c.c)
            const bodyH = Math.abs(c.c - c.o) || 1
            return (
              <g key={i} style={{ opacity: mounted ? 1 : 0, transition: `opacity 0.4s ${i * 0.05}s` }}>
                <line x1={x} y1={130 - c.h} x2={x} y2={130 - c.l} stroke={color} strokeWidth="1" opacity="0.7" />
                <rect x={x - 4} y={bodyTop} width="8" height={bodyH} fill={color} rx="1" opacity="0.9" />
              </g>
            )
          })}

          <path
            d={`${linePath} L ${20 + (CANDLES.length - 1) * 28} 130 L 20 130 Z`}
            fill="url(#lineGrad)"
            opacity={mounted ? 0.6 : 0}
            style={{ transition: 'opacity 1s 0.5s' }}
          />
          <path
            d={linePath}
            fill="none"
            stroke="#60a5fa"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="400"
            strokeDashoffset={mounted ? 0 : 400}
            style={{ transition: 'stroke-dashoffset 2s ease-out' }}
          />

          {mounted && (
            <circle cx={20 + (CANDLES.length - 1) * 28} cy={130 - CANDLES[CANDLES.length - 1].c} r="4" fill="#60a5fa">
              <animate attributeName="r" values="4;6;4" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" />
            </circle>
          )}
        </svg>

        <div className="flex gap-3 mt-3 pt-3 border-t border-white/5">
          {[
            { label: 'RSI', val: '58.2', color: 'text-amber-400' },
            { label: 'Vol', val: '2.4B', color: 'text-white/60' },
            { label: 'Signal', val: 'BULLISH', color: 'text-emerald-400' },
          ].map(({ label, val, color }) => (
            <div key={label} className="flex-1 text-center">
              <p className="text-[10px] text-white/30 uppercase tracking-wider">{label}</p>
              <p className={`text-xs font-mono font-semibold ${color}`}>{val}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
