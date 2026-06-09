import type { IChartApi, ISeriesApi, UTCTimestamp } from 'lightweight-charts'
import type { DrawingTool } from '@/store/useChartStore'

export interface ChartPoint {
  time: number
  price: number
}

export type DrawingKind = 'trendline' | 'horizontal' | 'fib'

export interface Drawing {
  id: string
  kind: DrawingKind
  points: ChartPoint[]
  color: string
}

const FIB_LEVELS = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1]
const HIT_RADIUS = 8

function storageKey(productId: string, timeframe: string): string {
  return `tradin:drawings:${productId}:${timeframe}`
}

export function loadDrawings(productId: string, timeframe: string): Drawing[] {
  try {
    const raw = localStorage.getItem(storageKey(productId, timeframe))
    if (!raw) return []
    const parsed = JSON.parse(raw) as Drawing[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveDrawings(productId: string, timeframe: string, drawings: Drawing[]): void {
  localStorage.setItem(storageKey(productId, timeframe), JSON.stringify(drawings))
}

type DragMode =
  | { type: 'point'; drawingId: string; pointIndex: number }
  | { type: 'horizontal'; drawingId: string }

export class DrawingManager {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private drawings: Drawing[] = []
  private pendingPoints: ChartPoint[] = []
  private activeTool: DrawingTool = 'none'
  private productId = ''
  private timeframe = ''
  private selectedId: string | null = null
  private hoverId: string | null = null
  private drag: DragMode | null = null
  private onKeyDown: (e: KeyboardEvent) => void
  private onHorizontalPriceChange?: (price: number | null) => void

  constructor(
    private container: HTMLElement,
    private chart: IChartApi,
    private priceSeries: ISeriesApi<'Candlestick'> | ISeriesApi<'Line'> | ISeriesApi<'Area'>,
  ) {
    this.canvas = document.createElement('canvas')
    this.canvas.style.cssText =
      'position:absolute;inset:0;pointer-events:none;z-index:20;'
    this.container.style.position = 'relative'
    this.container.appendChild(this.canvas)
    const ctx = this.canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas 2D unavailable')
    this.ctx = ctx

    this.onMouseDown = this.onMouseDown.bind(this)
    this.onMouseMove = this.onMouseMove.bind(this)
    this.onMouseUp = this.onMouseUp.bind(this)
    this.onResize = this.onResize.bind(this)
    this.onKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && this.selectedId) {
        this.drawings = this.drawings.filter((d) => d.id !== this.selectedId)
        this.selectedId = null
        this.persist()
        this.render()
      }
    }

    // Capture phase: intercept only when drawing/editing; otherwise events reach the chart.
    this.container.addEventListener('mousedown', this.onMouseDown, true)
    this.container.addEventListener('mousemove', this.onMouseMove, true)
    window.addEventListener('mouseup', this.onMouseUp)
    window.addEventListener('keydown', this.onKeyDown)
    window.addEventListener('resize', this.onResize)

    this.chart.timeScale().subscribeVisibleLogicalRangeChange(() => this.render())
    this.chart.timeScale().subscribeSizeChange(() => this.onResize())
  }

  init(productId: string, timeframe: string): void {
    this.productId = productId
    this.timeframe = timeframe
    this.drawings = loadDrawings(productId, timeframe)
    this.pendingPoints = []
    this.selectedId = null
    this.onResize()
    this.notifyHorizontalPrice()
    this.render()
  }

  setTool(tool: DrawingTool): void {
    this.activeTool = tool
    this.pendingPoints = []
    if (tool !== 'none') {
      this.selectedId = null
    }
    this.notifyHorizontalPrice()
    this.render()
  }

  setOnHorizontalPriceChange(cb: (price: number | null) => void): void {
    this.onHorizontalPriceChange = cb
    this.notifyHorizontalPrice()
  }

  private notifyHorizontalPrice(): void {
    this.onHorizontalPriceChange?.(this.getSelectedHorizontalPrice())
  }

  getSelectedHorizontalPrice(): number | null {
    if (!this.selectedId) return null
    const d = this.drawings.find((x) => x.id === this.selectedId)
    if (!d || d.kind !== 'horizontal' || !d.points[0]) return null
    return d.points[0].price
  }

  clearAll(): void {
    this.drawings = []
    this.pendingPoints = []
    this.selectedId = null
    this.persist()
    this.notifyHorizontalPrice()
    this.render()
  }

  destroy(): void {
    this.container.removeEventListener('mousedown', this.onMouseDown, true)
    this.container.removeEventListener('mousemove', this.onMouseMove, true)
    window.removeEventListener('mouseup', this.onMouseUp)
    window.removeEventListener('keydown', this.onKeyDown)
    window.removeEventListener('resize', this.onResize)
    this.canvas.remove()
  }

  private persist(): void {
    saveDrawings(this.productId, this.timeframe, this.drawings)
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

  private timeToNum(time: unknown): number | null {
    if (typeof time === 'number') return time
    if (time && typeof time === 'object' && 'year' in time) {
      const bd = time as { year: number; month: number; day: number }
      return Math.floor(new Date(`${bd.year}-${bd.month}-${bd.day}`).getTime() / 1000)
    }
    return null
  }

  private eventToPoint(e: MouseEvent): ChartPoint | null {
    const rect = this.container.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const time = this.chart.timeScale().coordinateToTime(x)
    const price = this.priceSeries.coordinateToPrice(y)
    if (time == null || price == null) return null
    const t = this.timeToNum(time)
    if (t == null) return null
    return { time: t, price }
  }

  private pointToXY(point: ChartPoint): { x: number; y: number } | null {
    const x = this.chart.timeScale().timeToCoordinate(point.time as UTCTimestamp)
    const y = this.priceSeries.priceToCoordinate(point.price)
    if (x == null || y == null) return null
    return { x, y }
  }

  private dist(ax: number, ay: number, bx: number, by: number): number {
    return Math.hypot(ax - bx, ay - by)
  }

  private hitTest(x: number, y: number): { id: string; pointIndex?: number } | null {
    for (let i = this.drawings.length - 1; i >= 0; i--) {
      const d = this.drawings[i]
      if (d.kind === 'horizontal' && d.points[0]) {
        const py = this.priceSeries.priceToCoordinate(d.points[0].price)
        if (py != null && Math.abs(py - y) < HIT_RADIUS) return { id: d.id }
      }
      if (d.points.length >= 2) {
        for (let pi = 0; pi < 2; pi++) {
          const xy = this.pointToXY(d.points[pi])
          if (xy && this.dist(xy.x, xy.y, x, y) < HIT_RADIUS) return { id: d.id, pointIndex: pi }
        }
        const p0 = this.pointToXY(d.points[0])
        const p1 = this.pointToXY(d.points[1])
        if (p0 && p1) {
          const lineDist = this.pointLineDistance(x, y, p0.x, p0.y, p1.x, p1.y)
          if (lineDist < HIT_RADIUS) return { id: d.id }
        }
      }
    }
    return null
  }

  private pointLineDistance(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
    const dx = x2 - x1
    const dy = y2 - y1
    if (dx === 0 && dy === 0) return this.dist(px, py, x1, y1)
    const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy)))
    return this.dist(px, py, x1 + t * dx, y1 + t * dy)
  }

  private onMouseDown(e: MouseEvent): void {
    const rect = this.container.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (this.activeTool === 'none') {
      const hit = this.hitTest(x, y)
      if (hit) {
        this.selectedId = hit.id
        const d = this.drawings.find((dr) => dr.id === hit.id)
        if (d?.kind === 'horizontal') {
          this.drag = { type: 'horizontal', drawingId: hit.id }
        } else if (hit.pointIndex != null) {
          this.drag = { type: 'point', drawingId: hit.id, pointIndex: hit.pointIndex }
        }
        e.stopPropagation()
        e.preventDefault()
        this.notifyHorizontalPrice()
        this.render()
      } else {
        this.selectedId = null
        this.notifyHorizontalPrice()
        this.render()
      }
      return
    }

    const pt = this.eventToPoint(e)
    if (!pt) return
    e.stopPropagation()
    e.preventDefault()

    if (this.activeTool === 'horizontal') {
      const id = crypto.randomUUID()
      this.drawings.push({
        id,
        kind: 'horizontal',
        points: [pt],
        color: '#2962FF',
      })
      this.selectedId = id
      this.persist()
      this.notifyHorizontalPrice()
      this.render()
      return
    }

    this.pendingPoints.push(pt)
    if (this.activeTool === 'trendline' && this.pendingPoints.length === 2) {
      this.drawings.push({
        id: crypto.randomUUID(),
        kind: 'trendline',
        points: [...this.pendingPoints],
        color: '#2962FF',
      })
      this.pendingPoints = []
      this.persist()
    }

    if (this.activeTool === 'fib' && this.pendingPoints.length === 2) {
      this.drawings.push({
        id: crypto.randomUUID(),
        kind: 'fib',
        points: [...this.pendingPoints],
        color: '#F59E0B',
      })
      this.pendingPoints = []
      this.persist()
    }

    this.render()
  }

  private onMouseMove(e: MouseEvent): void {
    const rect = this.container.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (this.drag) {
      e.stopPropagation()
      e.preventDefault()
      const pt = this.eventToPoint(e)
      if (!pt) return
      const d = this.drawings.find((dr) => dr.id === this.drag!.drawingId)
      if (!d) return
      if (this.drag.type === 'horizontal') {
        d.points[0] = { ...d.points[0], price: pt.price }
        this.notifyHorizontalPrice()
      } else {
        d.points[this.drag.pointIndex] = pt
      }
      this.persist()
      this.render()
      return
    }

    if (this.activeTool === 'none') {
      const hit = this.hitTest(x, y)
      this.hoverId = hit?.id ?? null
      this.container.style.cursor = hit ? 'pointer' : ''
      this.render()
      return
    }

    e.stopPropagation()

    if (this.pendingPoints.length === 0 || this.activeTool === 'horizontal') return
    const pt = this.eventToPoint(e)
    if (!pt) return
    this.render(pt)
  }

  private onMouseUp(): void {
    if (this.drag) {
      this.drag = null
      this.persist()
      this.notifyHorizontalPrice()
    }
  }

  render(previewPoint?: ChartPoint): void {
    const { width, height } = this.container.getBoundingClientRect()
    this.ctx.clearRect(0, 0, width, height)

    for (const drawing of this.drawings) {
      const selected = drawing.id === this.selectedId
      const hovered = drawing.id === this.hoverId
      this.drawShape(drawing, selected, hovered)
    }

    if (previewPoint && this.pendingPoints.length === 1) {
      const kind = this.activeTool === 'fib' ? 'fib' : 'trendline'
      this.drawShape(
        {
          id: 'preview',
          kind,
          points: [this.pendingPoints[0], previewPoint],
          color: 'rgba(41, 98, 255, 0.6)',
        },
        false,
        false,
      )
    }
  }

  private drawHandle(x: number, y: number, selected: boolean): void {
    this.ctx.beginPath()
    this.ctx.arc(x, y, selected ? 5 : 4, 0, Math.PI * 2)
    this.ctx.fillStyle = selected ? '#2962FF' : '#ffffff'
    this.ctx.strokeStyle = '#2962FF'
    this.ctx.lineWidth = 1.5
    this.ctx.fill()
    this.ctx.stroke()
  }

  private drawShape(drawing: Drawing, selected: boolean, hovered: boolean): void {
    const { ctx } = this
    ctx.strokeStyle = drawing.color
    ctx.fillStyle = drawing.color
    ctx.lineWidth = selected || hovered ? 2.5 : 1.5

    if (drawing.kind === 'horizontal' && drawing.points[0]) {
      const y = this.priceSeries.priceToCoordinate(drawing.points[0].price)
      if (y == null) return
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(this.container.clientWidth, y)
      ctx.stroke()
      ctx.font = '11px JetBrains Mono, monospace'
      ctx.fillText(drawing.points[0].price.toFixed(2), 8, y - 4)
      if (selected || hovered) {
        this.drawHandle(12, y, selected)
      }
      return
    }

    if (drawing.points.length < 2) return
    const p0 = this.pointToXY(drawing.points[0])
    const p1 = this.pointToXY(drawing.points[1])
    if (!p0 || !p1) return

    if (drawing.kind === 'trendline') {
      ctx.beginPath()
      ctx.moveTo(p0.x, p0.y)
      ctx.lineTo(p1.x, p1.y)
      ctx.stroke()
      if (selected || hovered) {
        this.drawHandle(p0.x, p0.y, selected)
        this.drawHandle(p1.x, p1.y, selected)
      }
      return
    }

    if (drawing.kind === 'fib') {
      const high = Math.max(drawing.points[0].price, drawing.points[1].price)
      const low = Math.min(drawing.points[0].price, drawing.points[1].price)
      const xLeft = Math.min(p0.x, p1.x)
      const xRight = Math.max(p0.x, p1.x)
      ctx.font = '10px JetBrains Mono, monospace'
      for (const level of FIB_LEVELS) {
        const price = high - (high - low) * level
        const y = this.priceSeries.priceToCoordinate(price)
        if (y == null) continue
        ctx.strokeStyle = drawing.color
        ctx.beginPath()
        ctx.moveTo(xLeft, y)
        ctx.lineTo(xRight, y)
        ctx.stroke()
        ctx.fillText(`${(level * 100).toFixed(1)}%`, xRight + 4, y + 3)
      }
      if (selected || hovered) {
        this.drawHandle(p0.x, p0.y, selected)
        this.drawHandle(p1.x, p1.y, selected)
      }
    }
  }
}
