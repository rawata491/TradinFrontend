import type { SeriesMarker, Time, UTCTimestamp } from 'lightweight-charts'
import type { IChartApi, ISeriesApi } from 'lightweight-charts'
import type { Trade } from '@/types/backtest'

export function buildTradeMarkers(
  trades: Trade[],
  times: number[],
): SeriesMarker<Time>[] {
  const markers: SeriesMarker<Time>[] = []

  for (const trade of trades) {
    if (trade.entry_bar < 0 || trade.entry_bar >= times.length) continue
    if (trade.exit_bar < 0 || trade.exit_bar >= times.length) continue

    const entryTime = times[trade.entry_bar] as UTCTimestamp
    const exitTime = times[trade.exit_bar] as UTCTimestamp
    const win = trade.pnl_pct >= 0

    markers.push({
      time: entryTime,
      position: 'belowBar',
      color: '#10B981',
      shape: 'arrowUp',
      text: trade.label || 'Entry',
      size: 1,
    })

    markers.push({
      time: exitTime,
      position: 'aboveBar',
      color: win ? '#10B981' : '#EF4444',
      shape: 'arrowDown',
      text: `${win ? '+' : ''}${trade.pnl_pct.toFixed(1)}%`,
      size: 1,
    })
  }

  return markers.sort((a, b) => (a.time as number) - (b.time as number))
}

export class TradeOverlayRenderer {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private trades: Trade[] = []
  private times: number[] = []

  constructor(
    private container: HTMLElement,
    private chart: IChartApi,
    private priceSeries: ISeriesApi<'Candlestick'> | ISeriesApi<'Line'> | ISeriesApi<'Area'>,
  ) {
    this.canvas = document.createElement('canvas')
    this.canvas.style.cssText =
      'position:absolute;inset:0;pointer-events:none;z-index:15;'
    this.container.appendChild(this.canvas)
    const ctx = this.canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas 2D unavailable')
    this.ctx = ctx

    this.onResize = this.onResize.bind(this)
    window.addEventListener('resize', this.onResize)
    this.chart.timeScale().subscribeVisibleLogicalRangeChange(() => this.render())
    this.chart.timeScale().subscribeSizeChange(() => this.onResize())
  }

  setData(trades: Trade[], times: number[]): void {
    this.trades = trades
    this.times = times
    this.onResize()
    this.render()
  }

  destroy(): void {
    window.removeEventListener('resize', this.onResize)
    this.canvas.remove()
  }

  private onResize(): void {
    const rect = this.container.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    this.canvas.width = Math.floor(rect.width * dpr)
    this.canvas.height = Math.floor(rect.height * dpr)
    this.canvas.style.width = `${rect.width}px`
    this.canvas.style.height = `${rect.height}px`
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    this.render()
  }

  render(): void {
    const { width, height } = this.container.getBoundingClientRect()
    this.ctx.clearRect(0, 0, width, height)

    for (const trade of this.trades) {
      if (trade.entry_bar < 0 || trade.entry_bar >= this.times.length) continue
      if (trade.exit_bar < 0 || trade.exit_bar >= this.times.length) continue

      const entryTime = this.times[trade.entry_bar] as UTCTimestamp
      const exitTime = this.times[trade.exit_bar] as UTCTimestamp
      const x1 = this.chart.timeScale().timeToCoordinate(entryTime)
      const y1 = this.priceSeries.priceToCoordinate(trade.entry_price)
      const x2 = this.chart.timeScale().timeToCoordinate(exitTime)
      const y2 = this.priceSeries.priceToCoordinate(trade.exit_price)

      if (x1 == null || y1 == null || x2 == null || y2 == null) continue

      const color = trade.pnl_pct >= 0 ? 'rgba(16, 185, 129, 0.7)' : 'rgba(239, 68, 68, 0.7)'
      this.ctx.strokeStyle = color
      this.ctx.lineWidth = 1.5
      this.ctx.setLineDash([4, 3])
      this.ctx.beginPath()
      this.ctx.moveTo(x1, y1)
      this.ctx.lineTo(x2, y2)
      this.ctx.stroke()
      this.ctx.setLineDash([])
    }
  }
}

export function focusTradeRange(
  chart: IChartApi,
  trade: Trade,
  totalBars: number,
): void {
  const from = Math.max(0, trade.entry_bar - 5)
  const to = Math.min(totalBars - 1, trade.exit_bar + 5)
  chart.timeScale().setVisibleLogicalRange({ from, to })
}
