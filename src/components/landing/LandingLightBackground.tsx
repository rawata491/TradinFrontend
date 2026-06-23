import { useRef } from 'react'
import { LandingCryptoLayer } from '@/components/landing/LandingCryptoLayer'
import { LandingParticleCanvas } from '@/components/landing/LandingParticleCanvas'

export function LandingLightBackground() {
  const spotlightRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (x: number, y: number) => {
    if (spotlightRef.current) {
      spotlightRef.current.style.background = `radial-gradient(600px circle at ${x}px ${y}px, rgba(59,130,246,0.1), transparent 55%)`
    }
  }

  return (
    <div
      className="fixed inset-0 z-0 overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30 pointer-events-none"
      aria-hidden
    >
      <div className="landing-light-orb landing-light-orb-1" />
      <div className="landing-light-orb landing-light-orb-2" />
      <div className="landing-light-orb landing-light-orb-3" />
      <div className="landing-light-grid" />
      <LandingParticleCanvas variant="light" onMouseMove={handleMouseMove} />
      <div ref={spotlightRef} className="absolute inset-0 z-[2] landing-spotlight pointer-events-none" />
      <LandingCryptoLayer variant="light" />
    </div>
  )
}
