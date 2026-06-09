import type { OnchainAnalysis } from '@/types/onchainAnalysis'

interface PoolActivityPanelProps {
  pool: OnchainAnalysis['pool']
}

function TxnRow({ label, txns }: { label: string; txns: { buys: number; sells: number; buyers: number; sellers: number } }) {
  const total = txns.buys + txns.sells || 1
  const buyPct = (txns.buys / total) * 100

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs">
        <span className="text-dark-400">{label}</span>
        <span className="text-dark-300 font-mono">
          {txns.buys} buys · {txns.sells} sells
        </span>
      </div>
      <div className="h-2 rounded-full overflow-hidden flex bg-dark-800">
        <div className="bg-positive transition-all" style={{ width: `${buyPct}%` }} />
        <div className="bg-negative flex-1" />
      </div>
      <p className="text-[10px] text-dark-500">
        {txns.buyers} unique buyers · {txns.sellers} unique sellers
      </p>
    </div>
  )
}

export function PoolActivityPanel({ pool }: PoolActivityPanelProps) {
  if (!pool?.transactions) {
    return <p className="text-sm text-dark-500">No live activity data.</p>
  }

  const { h1, h6, h24 } = pool.transactions

  return (
    <div className="space-y-5">
      <p className="text-xs text-dark-500">
        Live DEX transaction counts from the primary pool (GeckoTerminal).
      </p>
      <TxnRow label="Last 24 hours" txns={h24} />
      <TxnRow label="Last 6 hours" txns={h6} />
      <TxnRow label="Last 1 hour" txns={h1} />
    </div>
  )
}
