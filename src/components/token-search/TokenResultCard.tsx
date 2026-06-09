import { CheckCircle, ShieldAlert } from 'lucide-react'
import { ChainBadge } from './ChainBadge'
import { LiquidityBadge } from './LiquidityBadge'
import type { DiscoveredToken } from '@/types/tokenSearch'

interface TokenResultCardProps {
  token: DiscoveredToken
  highlighted?: boolean
  onClick?: () => void
  active?: boolean
}

function truncateAddr(addr: string): string {
  if (addr.length <= 14) return addr
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

export function TokenResultCard({
  token,
  highlighted = false,
  onClick,
  active = false,
}: TokenResultCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
        active ? 'bg-brand-500/10 border-l-2 border-brand-500' : 'hover:bg-dark-800/80'
      } ${highlighted ? 'ring-1 ring-brand-500/30' : ''}`}
    >
      {token.logo_url ? (
        <img
          src={token.logo_url}
          alt=""
          className="w-8 h-8 rounded-full flex-shrink-0 bg-dark-800 object-cover"
          onError={(e) => {
            ;(e.target as HTMLImageElement).style.display = 'none'
          }}
        />
      ) : (
        <div className="w-8 h-8 rounded-full flex-shrink-0 bg-dark-800 flex items-center justify-center text-xs font-bold text-dark-400">
          {token.symbol.slice(0, 2)}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-dark-50">{token.symbol}</span>
          <ChainBadge chain={token.chain} compact />
          {token.verified ? (
            <CheckCircle className="h-3.5 w-3.5 text-positive flex-shrink-0" />
          ) : (
            <ShieldAlert className="h-3.5 w-3.5 text-dark-600 flex-shrink-0" />
          )}
          <LiquidityBadge liquidity={token.liquidity} compact />
        </div>
        <p className="text-xs text-dark-400 truncate">{token.token_name}</p>
        <p className="text-[10px] font-mono text-dark-600 truncate">{truncateAddr(token.contract_address)}</p>
      </div>

      <div className="text-right flex-shrink-0 space-y-0.5">
        {token.price_usd > 0 && (
          <p className="text-sm font-mono text-dark-100">
            ${token.price_usd < 0.01 ? token.price_usd.toExponential(2) : token.price_usd.toFixed(4)}
          </p>
        )}
        {token.dex && (
          <p className="text-[10px] text-dark-500 capitalize">{token.dex}</p>
        )}
        {token.volume_24h > 0 && (
          <p className="text-[10px] font-mono text-dark-500">
            Vol ${token.volume_24h >= 1e6 ? `${(token.volume_24h / 1e6).toFixed(1)}M` : `${(token.volume_24h / 1e3).toFixed(0)}K`}
          </p>
        )}
      </div>
    </button>
  )
}
