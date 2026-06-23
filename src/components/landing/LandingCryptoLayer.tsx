/** Crypto-themed animated overlay for the landing page background. */

const FLOATING_ASSETS = [
  { symbol: '₿', label: 'BTC', left: '6%', top: '14%', delay: '0s', duration: '24s' },
  { symbol: 'Ξ', label: 'ETH', left: '88%', top: '20%', delay: '2s', duration: '28s' },
  { symbol: '◎', label: 'SOL', left: '12%', top: '62%', delay: '4s', duration: '26s' },
  { symbol: '◈', label: 'XRP', left: '82%', top: '58%', delay: '1s', duration: '30s' },
  { symbol: '⬡', label: 'MATIC', left: '72%', top: '78%', delay: '3s', duration: '22s' },
  { symbol: '◆', label: 'LINK', left: '22%', top: '82%', delay: '5s', duration: '27s' },
  { symbol: 'Ð', label: 'DOGE', left: '48%', top: '8%', delay: '1.5s', duration: '25s' },
  { symbol: '◉', label: 'DOT', left: '58%', top: '72%', delay: '3.5s', duration: '29s' },
]

const HEX_COLUMNS = [
  'a3f9c2e8b1d4',
  'ff00c9e712',
  '0xdeadbeef',
  'c0ffee001',
  'b16b00b5',
  'e8f4a2c9',
]

/** Mini candlestick data for the background chart silhouette. */
const BG_CANDLES = [
  { x: 40, o: 280, c: 260, h: 250, l: 290 },
  { x: 70, o: 260, c: 270, h: 255, l: 275 },
  { x: 100, o: 270, c: 240, h: 230, l: 275 },
  { x: 130, o: 240, c: 250, h: 235, l: 255 },
  { x: 160, o: 250, c: 220, h: 210, l: 255 },
  { x: 190, o: 220, c: 235, h: 215, l: 240 },
  { x: 220, o: 235, c: 200, h: 190, l: 240 },
  { x: 250, o: 200, c: 215, h: 195, l: 220 },
  { x: 280, o: 215, c: 180, h: 170, l: 220 },
  { x: 310, o: 180, c: 195, h: 175, l: 200 },
  { x: 340, o: 195, c: 170, h: 160, l: 200 },
  { x: 370, o: 170, c: 185, h: 165, l: 190 },
  { x: 400, o: 185, c: 155, h: 145, l: 190 },
  { x: 430, o: 155, c: 168, h: 150, l: 172 },
  { x: 460, o: 168, c: 140, h: 130, l: 172 },
  { x: 490, o: 140, c: 152, h: 135, l: 158 },
  { x: 520, o: 152, c: 125, h: 115, l: 158 },
  { x: 550, o: 125, c: 138, h: 120, l: 142 },
  { x: 580, o: 138, c: 110, h: 100, l: 142 },
  { x: 610, o: 110, c: 122, h: 105, l: 128 },
  { x: 640, o: 122, c: 95, h: 85, l: 128 },
  { x: 670, o: 95, c: 108, h: 90, l: 112 },
  { x: 700, o: 108, c: 88, h: 78, l: 112 },
  { x: 730, o: 88, c: 98, h: 82, l: 102 },
  { x: 760, o: 98, c: 75, h: 65, l: 102 },
  { x: 790, o: 75, c: 86, h: 70, l: 90 },
  { x: 820, o: 86, c: 68, h: 58, l: 90 },
  { x: 850, o: 68, c: 78, h: 62, l: 82 },
  { x: 880, o: 78, c: 60, h: 50, l: 82 },
  { x: 910, o: 60, c: 72, h: 55, l: 76 },
  { x: 940, o: 72, c: 55, h: 45, l: 76 },
  { x: 970, o: 55, c: 65, h: 50, l: 68 },
  { x: 1000, o: 65, c: 48, h: 38, l: 68 },
  { x: 1030, o: 48, c: 58, h: 42, l: 62 },
  { x: 1060, o: 58, c: 42, h: 32, l: 62 },
  { x: 1090, o: 42, c: 52, h: 36, l: 56 },
  { x: 1120, o: 52, c: 38, h: 28, l: 56 },
  { x: 1150, o: 38, c: 48, h: 32, l: 52 },
  { x: 1180, o: 48, c: 35, h: 25, l: 52 },
  { x: 1210, o: 35, c: 44, h: 30, l: 48 },
  { x: 1240, o: 44, c: 32, h: 22, l: 48 },
  { x: 1270, o: 32, c: 40, h: 28, l: 44 },
  { x: 1300, o: 40, c: 28, h: 18, l: 44 },
  { x: 1330, o: 28, c: 36, h: 24, l: 40 },
  { x: 1360, o: 36, c: 26, h: 16, l: 40 },
  { x: 1390, o: 26, c: 32, h: 20, l: 36 },
]

interface LandingCryptoLayerProps {
  variant: 'light' | 'dark'
}

export function LandingCryptoLayer({ variant }: LandingCryptoLayerProps) {
  const linePath = BG_CANDLES.map((c, i) => {
    const x = c.x
    const y = c.c
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
  }).join(' ')

  return (
    <div className={`landing-crypto-layer landing-crypto-layer--${variant}`} aria-hidden>
      {/* Scrolling blockchain hex columns */}
      <div className="landing-crypto-hex-columns">
        {HEX_COLUMNS.map((hex, i) => (
          <div
            key={hex}
            className="landing-crypto-hex-col"
            style={{
              left: `${8 + i * 15}%`,
              animationDelay: `${i * 1.2}s`,
              animationDuration: `${18 + i * 2}s`,
            }}
          >
            {Array.from({ length: 12 }).map((_, row) => (
              <span key={row}>{hex}{row.toString(16)}</span>
            ))}
          </div>
        ))}
      </div>

      {/* Background candlestick chart + trend line */}
      <svg
        className="landing-crypto-chart-svg"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={`landingChartFill-${variant}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.35" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>

        {BG_CANDLES.map((c) => {
          const bullish = c.c <= c.o
          const bodyTop = Math.min(c.o, c.c)
          const bodyH = Math.abs(c.c - c.o) || 2
          return (
            <g key={c.x} className="landing-crypto-candle">
              <line x1={c.x} y1={c.h} x2={c.x} y2={c.l} stroke="currentColor" strokeWidth="1.5" opacity="0.55" />
              <rect
                x={c.x - 6}
                y={bodyTop}
                width="12"
                height={bodyH}
                opacity={bullish ? 0.75 : 0.65}
                className={bullish ? 'landing-crypto-candle--bull' : 'landing-crypto-candle--bear'}
              />
            </g>
          )
        })}

        <path
          d={`${linePath} L 1390 320 L 40 320 Z`}
          fill={`url(#landingChartFill-${variant})`}
          className="landing-crypto-area"
        />
        <path
          d={linePath}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          className="landing-crypto-line"
        />
      </svg>

      {/* Floating coin symbols */}
      {FLOATING_ASSETS.map(({ symbol, label, left, top, delay, duration }) => (
        <div
          key={label}
          className="landing-crypto-float"
          style={{ left, top, animationDelay: delay, animationDuration: duration }}
        >
          <span className="landing-crypto-float-symbol">{symbol}</span>
          <span className="landing-crypto-float-label">{label}</span>
        </div>
      ))}

      {/* Pulse rings — blockchain node metaphor */}
      <div className="landing-crypto-node landing-crypto-node-1" />
      <div className="landing-crypto-node landing-crypto-node-2" />
      <div className="landing-crypto-node landing-crypto-node-3" />
    </div>
  )
}
