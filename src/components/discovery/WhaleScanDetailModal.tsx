import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock, ExternalLink, Fish, Layers, Shield, X } from 'lucide-react'
import { ChainBadge } from '@/components/token-search/ChainBadge'
import { WhaleActivityFeed } from '@/components/onchain/WhaleActivityFeed'
import { DetailStatGrid } from '@/components/detail/DetailStat'
import { Loader } from '@/components/Loader'
import { whaleScanApi, whaleScanHitToPath } from '@/services/whaleScanApi'
import { formatDistanceToNow, formatVolume } from '@/utils/formatters'
import type { WhaleScanDetail, WhaleScanHit } from '@/types/whaleScan'
import type { WhaleEvent } from '@/types/onchain'

interface WhaleScanDetailModalProps {
  open: boolean
  onClose: () => void
  hit: WhaleScanHit | null
  initialDetail?: WhaleScanDetail | null
}

const EVENT_STYLES: Record<string, string> = {
  LARGE_BUY: 'bg-positive/10 text-positive',
  ACCUMULATION: 'bg-positive/10 text-positive',
  COORDINATED_ACTIVITY: 'bg-yellow-500/10 text-yellow-400',
  LARGE_SELL: 'bg-negative/10 text-negative',
}

function formatAge(hours: number): string {
  if (hours <= 0) return 'Just now'
  if (hours < 1) return `${Math.round(hours * 60)}m ago`
  if (hours < 24) return `${Math.round(hours)}h ago`
  return `${Math.round(hours / 24)}d ago`
}

function toWhaleEvents(detail: WhaleScanDetail): WhaleEvent[] {
  return detail.events.map((event) => ({
    id: event.id,
    chain: event.chain,
    wallet: event.wallet,
    token_address: event.token_address,
    event_type: event.event_type,
    usd_value: event.usd_value,
    description: event.description,
    tx_hash: event.tx_hash ?? '',
    detected_at: event.detected_at,
    metadata: event.metadata,
  }))
}

export function WhaleScanDetailModal({
  open,
  onClose,
  hit,
  initialDetail = null,
}: WhaleScanDetailModalProps) {
  const navigate = useNavigate()
  const [detail, setDetail] = useState<WhaleScanDetail | null>(initialDetail)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    if (!open || !hit) {
      setDetail(null)
      setError(null)
      return
    }

    if (initialDetail) {
      setDetail(initialDetail)
      setError(null)
      return
    }

    setIsLoading(true)
    setError(null)
    whaleScanApi
      .getDetail(hit.chain, hit.contract_address, { page_size: 50 })
      .then((data) => setDetail(data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load whale details'))
      .finally(() => setIsLoading(false))
  }, [open, hit, initialDetail])

  if (!open || !hit) return null

  const displayName = hit.symbol || hit.token_name || hit.contract_address.slice(0, 10)
  const summary = detail ?? hit

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close whale details"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="whale-detail-title"
        className="relative w-full max-w-lg max-h-[88vh] overflow-hidden rounded-2xl border border-dark-700 bg-dark-950 shadow-2xl flex flex-col"
      >
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-dark-800">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full flex-shrink-0 bg-brand-500/10 flex items-center justify-center">
              <Fish className="h-5 w-5 text-brand-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 id="whale-detail-title" className="text-lg font-semibold text-dark-50 truncate">
                  {displayName}
                </h2>
                <ChainBadge chain={hit.chain} compact />
              </div>
              <p className="text-xs text-dark-500 font-mono truncate mt-0.5">
                {hit.contract_address}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-dark-400 hover:text-dark-100 hover:bg-dark-800 flex-shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5">
          {isLoading && (
            <div className="py-10 flex justify-center">
              <Loader size="lg" />
            </div>
          )}

          {error && !isLoading && (
            <p className="text-sm text-negative text-center py-6">{error}</p>
          )}

          {!isLoading && !error && (
            <>
              <DetailStatGrid
                stats={[
                  { label: 'Max trade', value: summary.max_usd, format: 'compact' },
                  { label: 'Liquidity', value: summary.liquidity_usd, format: 'compact' },
                  { label: 'Vol 24h', value: summary.volume_24h, format: 'compact' },
                  {
                    label: 'Whale score',
                    value: 'score' in summary && summary.score ? summary.score.toFixed(0) : hit.score.toFixed(0),
                  },
                ]}
              />

              <div className="flex flex-wrap gap-2 text-xs text-dark-500">
                {hit.age_hours > 0 && (
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Token age {formatAge(hit.age_hours)}
                  </span>
                )}
                {hit.dex && <span className="capitalize">· {hit.dex}</span>}
                {detail && (
                  <span>
                    · Threshold ${formatVolume(detail.threshold_usd)} · {detail.lookback_hours}h lookback
                  </span>
                )}
                {hit.last_scanned_at && (
                  <span>· Scanned {formatDistanceToNow(hit.last_scanned_at)}</span>
                )}
              </div>

              <div>
                <p className="text-xs font-medium text-dark-400 mb-2 uppercase tracking-wide">
                  Event breakdown
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {(detail?.event_summary ?? hit.event_summary).map((item) => (
                    <span
                      key={item.event_type}
                      className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${
                        EVENT_STYLES[item.event_type] ?? 'bg-dark-800 text-dark-300'
                      }`}
                    >
                      {item.event_type.replace(/_/g, ' ')} ×{item.count}
                    </span>
                  ))}
                </div>
              </div>

              {detail && detail.events.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-dark-400 mb-2 uppercase tracking-wide">
                    Whale activity ({detail.total_events})
                  </p>
                  <WhaleActivityFeed whales={toWhaleEvents(detail)} />
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex flex-wrap gap-2 px-5 py-4 border-t border-dark-800 bg-dark-950/95">
          <button
            type="button"
            onClick={() => {
              onClose()
              navigate(whaleScanHitToPath(hit))
            }}
            className="text-xs px-3 py-2 rounded-lg bg-brand-600 text-white hover:bg-brand-500 inline-flex items-center gap-1.5"
          >
            <ExternalLink className="h-3.5 w-3.5" /> Token page
          </button>
          <button
            type="button"
            onClick={() => {
              onClose()
              navigate(`/onchain?chain=${hit.chain}&address=${encodeURIComponent(hit.contract_address)}&tab=whales`)
            }}
            className="text-xs px-3 py-2 rounded-lg bg-dark-800 text-dark-300 hover:text-brand-400 inline-flex items-center gap-1.5"
          >
            <Layers className="h-3.5 w-3.5" /> On-chain
          </button>
          <button
            type="button"
            onClick={() => {
              onClose()
              navigate(`/analytics?tab=safety&chain=${hit.chain}&address=${encodeURIComponent(hit.contract_address)}`)
            }}
            className="text-xs px-3 py-2 rounded-lg bg-dark-800 text-dark-300 hover:text-brand-400 inline-flex items-center gap-1.5"
          >
            <Shield className="h-3.5 w-3.5" /> Safety
          </button>
        </div>
      </div>
    </div>
  )
}
