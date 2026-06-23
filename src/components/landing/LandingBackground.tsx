import { useRef } from 'react'
import { LandingCryptoLayer } from '@/components/landing/LandingCryptoLayer'
import { LandingParticleCanvas } from '@/components/landing/LandingParticleCanvas'

export function LandingBackground() {
  const spotlightRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (x: number, y: number) => {
    if (spotlightRef.current) {
      spotlightRef.current.style.background = `radial-gradient(700px circle at ${x}px ${y}px, rgba(59,130,246,0.16), transparent 55%)`
    }
  }

  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-[#020617] pointer-events-none" aria-hidden>
      <div className="landing-aurora landing-aurora-1" />
      <div className="landing-aurora landing-aurora-2" />
      <div className="landing-aurora landing-aurora-3" />
      <div className="landing-grid" />
      <LandingParticleCanvas variant="dark" onMouseMove={handleMouseMove} />
      <div ref={spotlightRef} className="absolute inset-0 z-[2] landing-spotlight pointer-events-none" />
      <LandingCryptoLayer variant="dark" />
      <div className="absolute inset-0 z-[3] landing-bg-vignette pointer-events-none" />
    </div>
  )
}
