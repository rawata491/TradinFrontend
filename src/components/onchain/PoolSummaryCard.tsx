import type { OnchainAnalysis } from '@/types/onchainAnalysis'

interface PoolSummaryCardProps {
  pool: OnchainAnalysis['pool']
  tokenName: string
}

export function PoolSummaryCard({ pool, tokenName }: PoolSummaryCardProps) {
  if (!pool) return null

  return (
    <div className="card p-4 border-dark-700/80">
      <p className="text-xs text-dark-400 mb-3">Primary DEX pool · {tokenName}</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-dark-500 mb-0.5">Price</p>
          <p className="font-mono text-dark-100">
            ${pool.price_usd < 1 ? pool.price_usd.toFixed(6) : pool.price_usd.toFixed(4)}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-dark-500 mb-0.5">Liquidity</p>
          <p className="font-mono text-dark-100">
            ${pool.liquidity_usd.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-dark-500 mb-0.5">24h Volume</p>
          <p className="font-mono text-dark-100">
            ${pool.volume_h24_usd.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-dark-500 mb-0.5">DEX</p>
          <p className="text-dark-200 truncate">{pool.dex ?? '—'}</p>
        </div>
      </div>
    </div>
  )
}
