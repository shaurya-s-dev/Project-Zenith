'use client'

import { useEffect, useRef } from 'react'

const S = { fontFamily: 'Space Mono, monospace' as const }

interface Body { label: string; xPct: number; yPct: number; color: string; size: number; glow: string }

const BODIES: Body[] = [
  { label: 'VENUS', xPct: 22, yPct: 68, color: '#FFFFFF', size: 6, glow: 'rgba(255,255,255,0.7)' },
  { label: 'SATURN', xPct: 78, yPct: 72, color: '#FCD34D', size: 4, glow: 'rgba(252,211,77,0.3)' },
  { label: 'JUPITER', xPct: 48, yPct: 35, color: '#FED7AA', size: 8, glow: 'rgba(254,215,170,0.5)' },
  { label: 'MARS', xPct: 64, yPct: 48, color: '#F87171', size: 5, glow: 'rgba(248,113,113,0.4)' },
]

export default function TonightView() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const frameRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = 0, h = 0, dpr = 1
    const stars: { x: number; y: number; size: number; phase: number }[] = []
    const asteroids: { x: number; y: number; vx: number; size: number; opacity: number }[] = []

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      dpr = window.devicePixelRatio || 1
      w = rect.width * dpr
      h = rect.height * dpr
      canvas.width = w
      canvas.height = h
      ctx.scale(dpr, dpr)
      
      stars.length = 0
      for (let i = 0; i < 60; i++) {
        stars.push({
          x: Math.random() * rect.width,
          y: Math.random() * rect.height * 0.7,
          size: 0.5 + Math.random() * 1.5,
          phase: Math.random() * Math.PI * 2,
        })
      }

      asteroids.length = 0
      for (let i = 0; i < 15; i++) {
        asteroids.push({
          x: Math.random() * rect.width,
          y: rect.height * 0.35 + (Math.random() - 0.5) * rect.height * 0.15,
          vx: 0.05 + Math.random() * 0.08,
          size: 0.8 + Math.random() * 1.2,
          opacity: 0.25 + Math.random() * 0.5,
        })
      }
    }

    resize()
    window.addEventListener('resize', resize)

    let time = 0
    const draw = () => {
      const rect = canvas.getBoundingClientRect()
      const cw = rect.width
      const ch = rect.height

      time += 0.005
      ctx.clearRect(0, 0, cw, ch)

      // Sky gradient (dark navy-to-midnight matching)
      const skyGrad = ctx.createLinearGradient(0, 0, 0, ch)
      skyGrad.addColorStop(0, '#070b14')
      skyGrad.addColorStop(0.6, '#0f1a2e')
      skyGrad.addColorStop(1, '#070b14')
      ctx.fillStyle = skyGrad
      ctx.fillRect(0, 0, cw, ch)

      // Stars
      const now = Date.now()
      for (const s of stars) {
        const twinkle = 0.4 + 0.6 * Math.sin(now * 0.001 + s.phase)
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${twinkle * 0.7})`
        ctx.fill()
      }

      // Asteroid Belt Particles
      for (const a of asteroids) {
        a.x += a.vx
        if (a.x > cw) {
          a.x = -10
          a.y = ch * 0.35 + (Math.random() - 0.5) * ch * 0.15
        }
        ctx.beginPath()
        ctx.arc(a.x, a.y, a.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(224, 180, 140, ${a.opacity * 0.5})`
        ctx.fill()
      }

      // 180° Semicircle Sky Dome Arc
      const horizonY = ch * 0.8
      const rx = cw * 0.42
      ctx.beginPath()
      ctx.arc(cw / 2, horizonY, rx, Math.PI, 0)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)'
      ctx.lineWidth = 1
      ctx.setLineDash([4, 4])
      ctx.stroke()
      ctx.setLineDash([]) // Reset

      // Compass East/West labels on Dome Ends
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
      ctx.font = '8px Space Mono, monospace'
      ctx.textAlign = 'center'
      ctx.fillText('W', cw / 2 - rx - 12, horizonY + 3)
      ctx.fillText('E', cw / 2 + rx + 12, horizonY + 3)

      // Horizon line
      ctx.beginPath()
      ctx.moveTo(0, horizonY)
      ctx.lineTo(cw, horizonY)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)'
      ctx.lineWidth = 1.5
      ctx.stroke()

      // Ground below horizon
      ctx.fillStyle = 'rgba(5, 7, 12, 0.9)'
      ctx.fillRect(0, horizonY, cw, ch - horizonY)

      // Celestial bodies
      for (const b of BODIES) {
        const bx = (b.xPct / 100) * cw
        const by = (b.yPct / 100) * ch

        // Glow
        const glowGrad = ctx.createRadialGradient(bx, by, 0, bx, by, b.size * 3)
        glowGrad.addColorStop(0, b.glow)
        glowGrad.addColorStop(1, 'transparent')
        ctx.fillStyle = glowGrad
        ctx.fillRect(bx - b.size * 3, by - b.size * 3, b.size * 6, b.size * 6)

        // Body
        ctx.beginPath()
        ctx.arc(bx, by, b.size, 0, Math.PI * 2)
        ctx.fillStyle = b.color
        ctx.fill()

        // Label with white glow
        ctx.save()
        ctx.shadowColor = 'rgba(255,255,255,0.8)'
        ctx.shadowBlur = 4
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 9px Space Mono, monospace'
        ctx.textAlign = 'center'
        ctx.fillText(b.label, bx, by - b.size - 6)
        ctx.restore()
      }

      frameRef.current = requestAnimationFrame(draw)
    }

    frameRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(frameRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <div style={{
      background: 'rgba(7, 11, 20, 0.75)',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 12, overflow: 'hidden', position: 'relative',
    }}>
      <div style={{
        position: 'absolute', top: 12, left: 14, zIndex: 2,
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <span style={{ fontSize: 14 }}>🌅</span>
        <span style={{ ...S, fontSize: 10, color: '#fff', fontWeight: 700, letterSpacing: '0.05em', textShadow: '0 0 10px rgba(255,255,255,0.2)' }}>
          TONIGHT&apos;S VIEW – Estimated Positions
        </span>
        <span style={{ fontSize: 10, cursor: 'help', color: 'rgba(255,255,255,0.5)' }} title="Estimated sky positions from your location">ℹ️</span>
      </div>
      <div style={{
        position: 'absolute', top: 12, right: 14, zIndex: 2,
      }}>
        <span style={{ ...S, fontSize: 7, color: '#4A5568', letterSpacing: '0.1em' }}>Estimated positions · Real-time tracking</span>
      </div>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: 200, display: 'block' }}
        aria-hidden="true"
      />
    </div>
  )
}
