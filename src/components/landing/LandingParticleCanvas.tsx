import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
}

interface LandingParticleCanvasProps {
  variant: 'light' | 'dark'
  onMouseMove?: (x: number, y: number) => void
}

const COLORS = {
  dark: {
    dot: 'rgba(96, 165, 250, 0.45)',
    line: 'rgba(59, 130, 246,',
    lineAlpha: 0.18,
    opacity: 0.65,
  },
  light: {
    dot: 'rgba(37, 99, 235, 0.35)',
    line: 'rgba(37, 99, 235,',
    lineAlpha: 0.14,
    opacity: 0.55,
  },
} as const

export function LandingParticleCanvas({ variant, onMouseMove }: LandingParticleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const onMouseMoveRef = useRef(onMouseMove)
  onMouseMoveRef.current = onMouseMove
  const opacity = COLORS[variant].opacity

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { dot, line, lineAlpha } = COLORS[variant]

    let animId = 0
    let particles: Particle[] = []
    let mouse = { x: -1000, y: -1000 }

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      const count = Math.min(90, Math.floor((canvas.width * canvas.height) / 16000))
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        size: Math.random() * 1.5 + 0.5,
      }))
    }

    const onMove = (e: MouseEvent) => {
      mouse = { x: e.clientX, y: e.clientY }
      onMouseMoveRef.current?.(e.clientX, e.clientY)
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1

        const dx = mouse.x - p.x
        const dy = mouse.y - p.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 140) {
          p.vx += dx * 0.00006
          p.vy += dy * 0.00006
        }

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = dot
        ctx.fill()
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i]
          const b = particles[j]
          const d = Math.hypot(a.x - b.x, a.y - b.y)
          if (d < 150) {
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.strokeStyle = `${line}${lineAlpha * (1 - d / 150)})`
            ctx.lineWidth = 0.7
            ctx.stroke()
          }
        }
      }

      animId = requestAnimationFrame(draw)
    }

    resize()
    draw()
    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', onMove)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMove)
    }
  }, [variant])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-[1]"
      style={{ opacity }}
      aria-hidden
    />
  )
}
