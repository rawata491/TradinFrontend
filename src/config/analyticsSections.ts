import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboard,
  Gauge,
  TrendingUp,
  BookOpen,
  Target,
  Activity,
  Filter,
  Waves,
  Calendar,
  GitCompare,
  BarChart3,
  Layers,
  Shield,
} from 'lucide-react'

export type AnalyticsTabId =
  | 'overview'
  | 'fear-greed'
  | 'funding'
  | 'orderbook'
  | 'liquidations'
  | 'mtf'
  | 'screener'
  | 'volatility'
  | 'events'
  | 'correlation'
  | 'compare'
  | 'bridges'
  | 'safety'

export interface AnalyticsTab {
  id: AnalyticsTabId
  label: string
  icon: LucideIcon
  title: string
  description: string
  tip?: string
}

export interface AnalyticsSection {
  title: string
  tabs: AnalyticsTab[]
}

/** Legacy URL param — old default tab. */
export const LEGACY_TAB_ALIASES: Record<string, AnalyticsTabId> = {
  global: 'overview',
  paper: 'overview',
}

export const ANALYTICS_SECTIONS: AnalyticsSection[] = [
  {
    title: 'Start here',
    tabs: [
      {
        id: 'overview',
        label: 'Dashboard',
        icon: LayoutDashboard,
        title: 'Market dashboard',
        description:
          'High-level crypto market health: total cap, volume, BTC dominance, and current sentiment. Use this first to set context before diving into specific tools.',
      },
    ],
  },
  {
    title: 'Sentiment',
    tabs: [
      {
        id: 'fear-greed',
        label: 'Fear & Greed',
        icon: Gauge,
        title: 'Fear & Greed Index',
        description:
          'A 0–100 sentiment gauge from social media, volatility, and market momentum. Low values often coincide with fear (possible dip-buying zones); high values signal greed (overheating risk).',
        tip: 'Not a buy/sell signal on its own — combine with price action and your strategy.',
      },
    ],
  },
  {
    title: 'Derivatives',
    tabs: [
      {
        id: 'funding',
        label: 'Funding & OI',
        icon: TrendingUp,
        title: 'Funding rates & open interest',
        description:
          'Perpetual futures funding rates and open interest across major coins. Positive funding = longs pay shorts (bullish crowding); negative = shorts pay longs.',
        tip: 'Extreme positive funding often precedes long squeezes.',
      },
      {
        id: 'orderbook',
        label: 'Order Book',
        icon: BookOpen,
        title: 'Order book depth',
        description:
          'Live bid/ask ladder and depth imbalance for a Gate.io spot pair. Shows where liquidity sits and whether buyers or sellers dominate near the mid price.',
        tip: 'Change the product ID (e.g. ETH-USD) to analyze another pair.',
      },
      {
        id: 'liquidations',
        label: 'Liquidations',
        icon: Target,
        title: 'Liquidation heatmap',
        description:
          'Estimated price levels where leveraged long/short positions would liquidate. Clusters can act as magnets or cascade triggers during volatile moves.',
        tip: 'Levels are modeled estimates, not exchange-reported liquidations.',
      },
      {
        id: 'mtf',
        label: 'MTF Signals',
        icon: Activity,
        title: 'Multi-timeframe confluence',
        description:
          'Trend bias across 15m, 1h, 4h, and 1d using RSI and EMA crosses. Higher confluence % means more timeframes agree on direction.',
        tip: 'Useful for timing entries when several timeframes align.',
      },
    ],
  },
  {
    title: 'Market scan',
    tabs: [
      {
        id: 'screener',
        label: 'Screener',
        icon: Filter,
        title: 'Volume & momentum screener',
        description:
          'Filter Gate.io USD pairs by 24h volume and price change. Find movers with real liquidity instead of scrolling the full market list.',
        tip: 'Raise min volume to avoid thin, illiquid pairs.',
      },
      {
        id: 'volatility',
        label: 'Volatility',
        icon: Waves,
        title: 'Volatility regime',
        description:
          'ATR % and 30-day realized volatility per asset. Classifies each coin as low, normal, or high volatility so you can size positions accordingly.',
      },
      {
        id: 'events',
        label: 'Events',
        icon: Calendar,
        title: 'Upcoming market events',
        description:
          'Token unlocks, upgrades, and macro dates that can move prices. Impact tags (high/medium/low) help you prioritize what to watch.',
      },
    ],
  },
  {
    title: 'Research',
    tabs: [
      {
        id: 'correlation',
        label: 'Correlation',
        icon: GitCompare,
        title: 'Asset correlation matrix',
        description:
          '30-day return correlation between major pairs. High correlation means assets move together (less diversification); low or negative adds hedge potential.',
      },
      {
        id: 'compare',
        label: 'Exchanges',
        icon: BarChart3,
        title: 'Cross-exchange price compare',
        description:
          'Spot price on Gate.io vs other free public sources for the same symbol. Large spreads may indicate arb opportunities or stale quotes.',
        tip: 'Enter base symbol only (BTC, ETH) — not BTC-USD.',
      },
      {
        id: 'bridges',
        label: 'Chain TVL',
        icon: Layers,
        title: 'Cross-chain TVL flows',
        description:
          'Stablecoin supply and net bridge flows by chain. Rising TVL on a chain can signal growing activity; outflows may mean capital leaving.',
      },
    ],
  },
  {
    title: 'On-chain',
    tabs: [
      {
        id: 'safety',
        label: 'Token Safety',
        icon: Shield,
        title: 'DEX token safety scan',
        description:
          'Heuristic rug-pull and honeypot checks for a contract address. Use before trading unfamiliar tokens from Discover — not a guarantee of safety.',
        tip: 'Also reachable from Discover token cards via “Safety scan”.',
      },
    ],
  },
]

export const ALL_ANALYTICS_TABS: AnalyticsTab[] = ANALYTICS_SECTIONS.flatMap((s) => s.tabs)

export function resolveAnalyticsTab(raw: string | null): AnalyticsTabId {
  if (!raw) return 'overview'
  const aliased = LEGACY_TAB_ALIASES[raw] ?? raw
  const found = ALL_ANALYTICS_TABS.find((t) => t.id === aliased)
  return found?.id ?? 'overview'
}

export function getAnalyticsTabMeta(id: AnalyticsTabId): AnalyticsTab {
  return ALL_ANALYTICS_TABS.find((t) => t.id === id) ?? ALL_ANALYTICS_TABS[0]
}
