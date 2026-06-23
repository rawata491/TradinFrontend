const TICKERS = [
  { sym: 'BTC', price: '97,842', chg: '+2.4%', up: true },
  { sym: 'ETH', price: '3,521', chg: '+1.8%', up: true },
  { sym: 'SOL', price: '198.42', chg: '-0.6%', up: false },
  { sym: 'XRP', price: '2.41', chg: '+4.2%', up: true },
  { sym: 'DOGE', price: '0.382', chg: '+0.9%', up: true },
  { sym: 'AVAX', price: '38.12', chg: '-1.1%', up: false },
  { sym: 'LINK', price: '18.94', chg: '+3.1%', up: true },
  { sym: 'DOT', price: '7.82', chg: '+0.4%', up: true },
  { sym: 'ADA', price: '0.91', chg: '-0.3%', up: false },
  { sym: 'MATIC', price: '0.54', chg: '+1.2%', up: true },
]

function TickerStrip() {
  return (
    <>
      {TICKERS.map(({ sym, price, chg, up }) => (
        <span key={sym} className="inline-flex items-center gap-2 mx-6 shrink-0 font-mono text-sm">
          <span className="text-brand-500 font-semibold">{sym}</span>
          <span className="text-dark-300 dark:text-white/70">${price}</span>
          <span className={up ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}>{chg}</span>
        </span>
      ))}
    </>
  )
}

export function LandingTicker() {
  return (
    <div className="relative border-y border-dark-800 bg-dark-900/80 backdrop-blur-md overflow-hidden dark:border-white/5 dark:bg-black/30">
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-dark-950 to-transparent z-10 dark:from-[#020617]" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-dark-950 to-transparent z-10 dark:from-[#020617]" />
      <div className="flex py-2.5 animate-marquee whitespace-nowrap">
        <TickerStrip />
        <TickerStrip />
      </div>
    </div>
  )
}
