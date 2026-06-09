import type { OnchainTrade, WhaleEvent } from '@/types/onchain'

const MIN_WHALE_USD = 2_500
const FALLBACK_MIN_USD = 500
const FALLBACK_TOP_N = 10

/** Dynamic whale threshold: at least $2.5k or 0.15% of 24h pool volume. */
export function whaleThresholdUsd(volumeH24Usd?: number): number {
  if (!volumeH24Usd || volumeH24Usd <= 0) return MIN_WHALE_USD
  return Math.max(MIN_WHALE_USD, Math.round(volumeH24Usd * 0.0015))
}

export function tradesToWhales(
  trades: OnchainTrade[],
  volumeH24Usd?: number,
): { whales: WhaleEvent[]; thresholdUsd: number; usedFallback: boolean } {
  const thresholdUsd = whaleThresholdUsd(volumeH24Usd)
  const sorted = [...trades].sort((a, b) => b.usd_value - a.usd_value)
  let matches = sorted.filter((t) => t.usd_value >= thresholdUsd)
  let usedFallback = false

  if (matches.length === 0 && sorted.length > 0) {
    matches = sorted.filter((t) => t.usd_value >= FALLBACK_MIN_USD).slice(0, FALLBACK_TOP_N)
    usedFallback = matches.length > 0
  }

  const whales = matches.map((t, i) => ({
    id: i + 1,
    chain: t.chain,
    wallet: t.wallet,
    token_address: t.token_address,
    event_type: t.side === 'BUY' ? 'LARGE_BUY' : 'LARGE_SELL',
    usd_value: t.usd_value,
    description: `${t.side === 'BUY' ? 'Buy' : 'Sell'} $${t.usd_value.toLocaleString(undefined, { maximumFractionDigits: 0 })} on ${t.dex || 'DEX'}`,
    tx_hash: t.tx_hash,
    detected_at: t.timestamp,
  }))

  return { whales, thresholdUsd, usedFallback }
}
