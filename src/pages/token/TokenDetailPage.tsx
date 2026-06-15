import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Copy,
  Send,
  CheckCircle,
  ShieldAlert,
  Brain,
} from 'lucide-react'
import { tokenSearchApi } from '@/services/tokenSearchApi'
import { useTokenSearchStore } from '@/store/useTokenSearchStore'
import { useAuthStore } from '@/store/useAuthStore'
import { permissions } from '@/config/permissions'
import { ChainBadge } from '@/components/token-search/ChainBadge'
import { LiquidityBadge } from '@/components/token-search/LiquidityBadge'
import { PageLoader } from '@/components/Loader'
import { ErrorState } from '@/components/ErrorState'
import { DetailStatGrid } from '@/components/detail/DetailStat'
import type { DiscoveredToken, TokenChain } from '@/types/tokenSearch'

export function TokenDetailPage() {
  const { chain, address } = useParams<{ chain: string; address: string }>()
  const navigate = useNavigate()
  const [token, setToken] = useState<DiscoveredToken | null>(null)
  const [aiSummary, setAiSummary] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [broadcasting, setBroadcasting] = useState(false)
  const [broadcastMsg, setBroadcastMsg] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const selectToken = useTokenSearchStore((s) => s.selectToken)
  const user = useAuthStore((s) => s.user)
  const canBroadcast = permissions.tokenBroadcast(user?.role)

  useEffect(() => {
    if (!chain || !address) return

    setIsLoading(true)
    tokenSearchApi
      .getDetail(decodeURIComponent(address), chain as TokenChain)
      .then(async (data) => {
        setToken(data.token)
        setAiSummary(data.ai_summary ?? data.token.ai_summary ?? null)
        await selectToken(data.token)
      })
      .catch((err) => setError((err as Error).message))
      .finally(() => setIsLoading(false))
  }, [chain, address, selectToken])

  const copyAddress = () => {
    if (address) {
      void navigator.clipboard.writeText(decodeURIComponent(address))
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleBroadcast = async () => {
    if (!chain || !address) return
    setBroadcasting(true)
    setBroadcastMsg(null)
    try {
      await tokenSearchApi.broadcastToken({
        chain,
        contract_address: decodeURIComponent(address),
      })
      setBroadcastMsg('Broadcast queued')
    } catch (err) {
      setBroadcastMsg(err instanceof Error ? err.message : 'Broadcast failed')
    } finally {
      setBroadcasting(false)
    }
  }

  if (isLoading) return <PageLoader />
  if (error || !token) return <ErrorState message={error ?? 'Token not found'} />

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fade-in">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-dark-400 hover:text-dark-200 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="card p-6">
        <div className="flex flex-col sm:flex-row gap-6">
          {token.logo_url ? (
            <img src={token.logo_url} alt="" className="w-16 h-16 rounded-2xl bg-dark-800 object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-dark-800 flex items-center justify-center text-2xl font-bold text-dark-400">
              {token.symbol.slice(0, 2)}
            </div>
          )}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-dark-50">{token.token_name}</h1>
              <span className="text-lg text-dark-400 font-mono">{token.symbol}</span>
              <ChainBadge chain={token.chain} />
              {token.verified ? (
                <span className="flex items-center gap-1 text-xs text-positive">
                  <CheckCircle className="h-3.5 w-3.5" /> Verified
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs text-dark-500">
                  <ShieldAlert className="h-3.5 w-3.5" /> Unverified
                </span>
              )}
              <LiquidityBadge liquidity={token.liquidity} />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <code className="text-xs font-mono text-dark-500 bg-dark-900 px-2 py-1 rounded truncate max-w-md">
                {token.contract_address}
              </code>
              <button type="button" onClick={copyAddress} className="text-dark-500 hover:text-dark-300" title="Copy address">
                <Copy className="h-3.5 w-3.5" />
              </button>
              {copied && <span className="text-xs text-positive">Copied</span>}
            </div>
            {token.dex && (
              <p className="text-sm text-dark-400 mt-2 capitalize">Trading on {token.dex}</p>
            )}
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            {token.price_usd > 0 && (
              <p className="text-2xl font-mono font-bold text-dark-50">
                ${token.price_usd < 0.01 ? token.price_usd.toExponential(3) : token.price_usd.toFixed(6)}
              </p>
            )}
            {canBroadcast && (
              <>
                <button
                  type="button"
                  onClick={handleBroadcast}
                  disabled={broadcasting}
                  className="btn-ghost text-xs px-3 py-1.5 flex items-center gap-1.5"
                >
                  <Send className="h-3.5 w-3.5" /> {broadcasting ? 'Sending…' : 'Alert'}
                </button>
                {broadcastMsg && (
                  <p className={`text-xs ${broadcastMsg.includes('failed') || broadcastMsg.includes('Failed') ? 'text-negative' : 'text-positive'}`}>
                    {broadcastMsg}
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-dark-800">
          <DetailStatGrid
            stats={[
              { label: 'Market Cap', value: token.market_cap, format: 'compact' },
              { label: 'Liquidity', value: token.liquidity, format: 'compact' },
              { label: 'Volume 24h', value: token.volume_24h, format: 'compact' },
              { label: 'Rank Score', value: token.rank_score.toFixed(0) },
            ]}
          />
        </div>
      </div>

      {aiSummary && (
        <div className="card p-4 border-brand-500/20 bg-brand-500/5">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="h-4 w-4 text-brand-400" />
            <span className="text-sm font-medium text-brand-400">AI Token Intelligence</span>
          </div>
          <p className="text-sm text-dark-200">{aiSummary}</p>
        </div>
      )}
    </div>
  )
}
