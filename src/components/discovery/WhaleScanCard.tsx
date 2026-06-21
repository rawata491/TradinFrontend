import { useNavigate } from 'react-router-dom'
import { Clock, Fish, Layers, Shield, TrendingUp } from 'lucide-react'
import { ChainBadge } from '@/components/token-search/ChainBadge'
import { whaleScanHitToPath } from '@/services/whaleScanApi'
import { formatVolume } from '@/utils/formatters'
import type { WhaleScanHit } from '@/types/whaleScan'

interface WhaleScanCardProps {
  hit: WhaleScanHit
  onOpenDetails?: (hit: WhaleScanHit) => void
}

const EVENT_STYLES: Record<string, { label: string; className: string }> = {
  LARGE_BUY: { label: 'Large Buy', className: 'bg-positive/10 text-positive' },
  ACCUMULATION: { label: 'Accumulation', className: 'bg-positive/10 text-positive' },
  COORDINATED_ACTIVITY: { label: 'Coordinated', className: 'bg-yellow-500/10 text-yellow-400' },
  LARGE_SELL: { label: 'Large Sell', className: 'bg-negative/10 text-negative' },
}

function formatAge(hours: number): string {
  if (hours <= 0) return 'Just now'
  if (hours < 1) return `${Math.round(hours * 60)}m ago`
  if (hours < 24) return `${Math.round(hours)}h ago`
  return `${Math.round(hours / 24)}d ago`
}

function formatEventLabel(eventType: string): string {
  return EVENT_STYLES[eventType]?.label ?? eventType.replace(/_/g, ' ')
}

function eventChipClass(eventType: string): string {
  return EVENT_STYLES[eventType]?.className ?? 'bg-dark-800 text-dark-300'
}

export function WhaleScanCard({ hit, onOpenDetails }: WhaleScanCardProps) {
  const navigate = useNavigate()
  const path = whaleScanHitToPath(hit)
  const displayName = hit.symbol || hit.token_name || hit.contract_address.slice(0, 8)

  const handleOpen = () => {
    if (onOpenDetails) {
      onOpenDetails(hit)
    } else {
      navigate(path)
    }
  }

  return (
    <div className="rounded-xl border border-dark-800 bg-dark-900/60 hover:border-dark-700 transition-all group">
      <button
        type="button"
        onClick={handleOpen}
        className="w-full text-left p-4"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full flex-shrink-0 bg-brand-500/10 flex items-center justify-center">
            <Fish className="h-5 w-5 text-brand-400" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-base font-semibold text-dark-50 group-hover:text-brand-400 transition-colors">
                {displayName}
              </span>
              <ChainBadge chain={hit.chain} compact />
              {hit.notified_at && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-400 font-medium">
                  Alerted
                </span>
              )}
            </div>

            <p className="text-sm text-dark-400 truncate">{hit.token_name || hit.contract_address}</p>

            <div className="flex flex-wrap gap-1.5 mt-2">
              {hit.event_summary.map((item) => (
                <span
                  key={item.event_type}
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${eventChipClass(item.event_type)}`}
                >
                  {formatEventLabel(item.event_type)} ×{item.count}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-3 mt-2 flex-wrap text-xs text-dark-500">
              {hit.age_hours > 0 && (
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatAge(hit.age_hours)}
                </span>
              )}
              {hit.dex && <span className="capitalize">{hit.dex}</span>}
            </div>
          </div>

          <div className="text-right flex-shrink-0 space-y-1">
            {hit.max_usd > 0 && (
              <p className="text-sm font-mono text-dark-100 inline-flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-positive" />
                ${formatVolume(hit.max_usd)}
              </p>
            )}
            {hit.volume_24h > 0 && (
              <p className="text-[10px] font-mono text-dark-500">Vol {formatVolume(hit.volume_24h)}</p>
            )}
            {hit.liquidity_usd > 0 && (
              <p className="text-[10px] font-mono text-dark-600">Liq {formatVolume(hit.liquidity_usd)}</p>
            )}
          </div>
        </div>
      </button>

      <div className="flex flex-wrap gap-2 px-4 pb-3 border-t border-dark-800/50 pt-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onOpenDetails?.(hit)
          }}
          className="text-[11px] px-2 py-1 rounded-md bg-brand-500/15 text-brand-400 hover:bg-brand-500/25 flex items-center gap-1"
        >
          <Fish className="h-3 w-3" /> Whale details
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            navigate(`/analytics?tab=safety&chain=${hit.chain}&address=${encodeURIComponent(hit.contract_address)}`)
          }}
          className="text-[11px] px-2 py-1 rounded-md bg-dark-800 text-dark-300 hover:text-brand-400 flex items-center gap-1"
        >
          <Shield className="h-3 w-3" /> Safety scan
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            navigate(`/onchain?chain=${hit.chain}&address=${encodeURIComponent(hit.contract_address)}&tab=whales`)
          }}
          className="text-[11px] px-2 py-1 rounded-md bg-dark-800 text-dark-300 hover:text-brand-400 flex items-center gap-1"
        >
          <Layers className="h-3 w-3" /> On-chain
        </button>
      </div>
    </div>
  )
}
