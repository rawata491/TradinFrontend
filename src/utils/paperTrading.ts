import type { PaperSide, PaperTrade, PaperTradeStats, PracticeSummary } from '@/types/paperTrade'

export const DEFAULT_STARTING_BALANCE = 10_000
export const DEFAULT_TRADE_USD = 500

export function usdToQuantity(usd: number, price: number): number {
  if (!Number.isFinite(usd) || usd <= 0 || !Number.isFinite(price) || price <= 0) return 0
  return usd / price
}

export function quantityToUsd(quantity: number, price: number): number {
  if (!Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(price) || price <= 0) return 0
  return quantity * price
}

export function sideLabel(side: PaperSide): string {
  return side === 'long' ? 'Buy' : 'Short'
}

export function sideHint(side: PaperSide): string {
  return side === 'long' ? 'Profit when price rises' : 'Profit when price falls'
}

export function computeClosedPnl(
  side: PaperSide,
  entryPrice: number,
  exitPrice: number,
  quantity: number,
  feePct: number,
): { pnl: number; pnlPct: number } {
  const entryNotional = entryPrice * quantity
  const exitNotional = exitPrice * quantity
  const fees = entryNotional * feePct + exitNotional * feePct
  if (side === 'long') {
    const gross = (exitPrice - entryPrice) * quantity
    const pnlPct = ((exitPrice - entryPrice) / entryPrice) * 100
    return { pnl: gross - fees, pnlPct }
  }
  const gross = (entryPrice - exitPrice) * quantity
  const pnlPct = ((entryPrice - exitPrice) / entryPrice) * 100
  return { pnl: gross - fees, pnlPct }
}

export function computeUnrealizedPnl(
  side: PaperSide,
  entryPrice: number,
  currentPrice: number,
  quantity: number,
  feePct: number,
): { pnl: number; pnlPct: number } {
  return computeClosedPnl(side, entryPrice, currentPrice, quantity, feePct)
}

export function signalToPaperSide(direction: string, signalType: string): PaperSide | null {
  const d = direction.toLowerCase()
  if (d === 'buy' || signalType === 'entry') return 'long'
  if (d === 'sell' || signalType === 'exit' || signalType === 'close') return 'short'
  return null
}

export function buildPracticeSummary(
  stats: PaperTradeStats,
  unrealizedPnl: number,
  startingBalance: number,
): PracticeSummary {
  const realizedPnl = stats.total_realized_pnl
  return {
    startingBalance,
    realizedPnl,
    unrealizedPnl,
    equity: startingBalance + realizedPnl + unrealizedPnl,
    openCount: stats.open_count,
    closedCount: stats.closed_count,
    winRatePct: stats.win_rate_pct,
  }
}

export function formatPnl(value: number, opts?: { showSign?: boolean }): string {
  const sign = opts?.showSign !== false && value >= 0 ? '+' : ''
  return `${sign}$${Math.abs(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function formatPnlPct(value: number): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

export function tradeNotional(trade: PaperTrade): number {
  return trade.entry_price * trade.quantity
}
