import type { OnchainTrade, WhaleEvent, OnchainChartMarker } from '@/types/onchain'

/** Build TradingView chart markers from on-chain trades and whale events. */
export function buildOnchainChartMarkers(
  trades: OnchainTrade[],
  whales: WhaleEvent[] = [],
): OnchainChartMarker[] {
  const markers: OnchainChartMarker[] = []

  for (const t of trades) {
    if (t.usd_value < 1000) continue
    const ts = Math.floor(new Date(t.timestamp).getTime() / 1000)
    markers.push({
      time: ts,
      position: t.side === 'BUY' ? 'belowBar' : 'aboveBar',
      color: t.side === 'BUY' ? '#22c55e' : '#ef4444',
      shape: t.side === 'BUY' ? 'arrowUp' : 'arrowDown',
      text: t.usd_value >= 50000 ? '🐋' : t.side === 'BUY' ? 'B' : 'S',
    })
  }

  for (const w of whales) {
    const ts = Math.floor(new Date(w.detected_at).getTime() / 1000)
    markers.push({
      time: ts,
      position: w.event_type.includes('BUY') ? 'belowBar' : 'aboveBar',
      color: '#6366f1',
      shape: 'circle',
      text: '🐋',
    })
  }

  return markers.sort((a, b) => a.time - b.time)
}

/** Convert on-chain markers to lightweight-charts series marker format. */
export function toChartSeriesMarkers(markers: OnchainChartMarker[]) {
  return markers.map((m) => ({
    time: m.time as unknown as import('lightweight-charts').UTCTimestamp,
    position: m.position,
    color: m.color,
    shape: m.shape,
    text: m.text,
  }))
}
