import { useNavigate } from 'react-router-dom'
import { TrendingUp, TrendingDown, Clock, Activity, Shield, Layers } from 'lucide-react'
import { ChainBadge } from '@/components/token-search/ChainBadge'
import { GrowthBadge } from './GrowthBadge'
import { RiskBadge } from './RiskBadge'
import { discoveryTokenToPath } from '@/services/discoveryApi'
import { formatChange, formatVolume, getChangeColor } from '@/utils/formatters'
import type { DiscoveryToken } from '@/types/discovery'

interface DiscoveryCardProps {
  token: DiscoveryToken
}

function formatAge(hours: number): string {
  if (hours <= 0) return 'Just now'
  if (hours < 1) return `${Math.round(hours * 60)}m ago`
  if (hours < 24) return `${Math.round(hours)}h ago`
  return `${Math.round(hours / 24)}d ago`
}

export function DiscoveryCard({ token }: DiscoveryCardProps) {
  const navigate = useNavigate()
  const path = discoveryTokenToPath(token)

  return (
    <div className="rounded-xl border border-dark-800 bg-dark-900/60 hover:border-dark-700 transition-all group">
      <button
        type="button"
        onClick={() => navigate(path)}
        className="w-full text-left p-4"
      >
      <div className="flex items-start gap-3">
        {token.logo_url ? (
          <img
            src={token.logo_url}
            alt=""
            className="w-10 h-10 rounded-full flex-shrink-0 bg-dark-800 object-cover"
            onError={(e) => {
              ;(e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        ) : (
          <div className="w-10 h-10 rounded-full flex-shrink-0 bg-dark-800 flex items-center justify-center text-sm font-bold text-dark-400">
            {(token.symbol || '?').slice(0, 2)}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-base font-semibold text-dark-50 group-hover:text-brand-400 transition-colors">
              {token.symbol || token.token_name || 'Unknown'}
            </span>
            {token.chain && token.chain !== 'cex' && <ChainBadge chain={token.chain} compact />}
            {token.source_type === 'cex' && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-400 font-medium">
                CEX
              </span>
            )}
            <GrowthBadge score={token.growth_score} compact />
            <RiskBadge level={token.risk_level} compact />
          </div>

          <p className="text-sm text-dark-400 truncate">{token.token_name}</p>

          <div className="flex items-center gap-3 mt-2 flex-wrap text-xs text-dark-500">
            {token.age_hours > 0 && (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatAge(token.age_hours)}
              </span>
            )}
            {token.dex && (
              <span className="capitalize">{token.dex}</span>
            )}
            {token.tx_count_24h > 0 && (
              <span className="inline-flex items-center gap-1">
                <Activity className="h-3 w-3" />
                {token.tx_count_24h} txns
              </span>
            )}
          </div>
        </div>

        <div className="text-right flex-shrink-0 space-y-1">
          {token.price_usd > 0 && (
            <p className="text-sm font-mono text-dark-100">
              ${token.price_usd < 0.01 ? token.price_usd.toExponential(2) : token.price_usd.toFixed(4)}
            </p>
          )}
          {token.price_change_24h !== 0 && (
            <p className={`text-xs font-mono inline-flex items-center gap-0.5 ${getChangeColor(token.price_change_24h)}`}>
              {token.price_change_24h >= 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {formatChange(token.price_change_24h)}
            </p>
          )}
          {token.volume_24h > 0 && (
            <p className="text-[10px] font-mono text-dark-500">Vol {formatVolume(token.volume_24h)}</p>
          )}
          {token.volume_change_pct > 0 && (
            <p className="text-[10px] font-mono text-positive">Vol +{token.volume_change_pct.toFixed(0)}%</p>
          )}
          {token.liquidity > 0 && (
            <p className="text-[10px] font-mono text-dark-600">Liq {formatVolume(token.liquidity)}</p>
          )}
        </div>
      </div>
      </button>

      {token.source_type !== 'cex' && token.contract_address && (
        <div className="flex flex-wrap gap-2 px-4 pb-3 border-t border-dark-800/50 pt-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/analytics?tab=safety&chain=${token.chain}&address=${encodeURIComponent(token.contract_address)}`)
            }}
            className="text-[11px] px-2 py-1 rounded-md bg-dark-800 text-dark-300 hover:text-brand-400 flex items-center gap-1"
          >
            <Shield className="h-3 w-3" /> Safety scan
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/onchain?chain=${token.chain}&address=${encodeURIComponent(token.contract_address)}&tab=overview`)
            }}
            className="text-[11px] px-2 py-1 rounded-md bg-dark-800 text-dark-300 hover:text-brand-400 flex items-center gap-1"
          >
            <Layers className="h-3 w-3" /> On-chain
          </button>
        </div>
      )}
    </div>
  )
}
