'use client'

import { useEffect, useRef } from 'react'

const S = { fontFamily: 'Space Mono, monospace' as const }

interface Body { label: string; xPct: number; yPct: number; color: string; size: number; glow: string }

const BODIES: Body[] = [
  { label: 'SUN', xPct: 18, yPct: 68, color: '#FFD400', size: 18, glow: 'rgba(255,212,0,0.6)' },
  { label: 'MOON', xPct: 52, yPct: 22, color: '#e8e0d0', size: 12, glow: 'rgba(232,224,208,0.4)' },
  { label: 'VENUS', xPct: 28, yPct: 52, color: '#FFD400', size: 5, glow: 'rgba(255,212,0,0.3)' },
  { label: 'JUPITER', xPct: 68, yPct: 32, color: '#FF6B35', size: 7, glow: 'rgba(255,107,53,0.3)' },
  { label: 'MARS', xPct: 78, yPct: 45, color: '#FF3B3B', size: 4, glow: 'rgba(255,59,59,0.3)' },
  { label: 'SATURN', xPct: 85, yPct: 60, color: '#9B59FF', size: 5, glow: 'rgba(155,89,255,0.3)' },
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
    let sweepAngle = 0
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
      for (let i = 0; i < 20; i++) {
        asteroids.push({
          x: Math.random() * rect.width,
          y: rect.height * 0.35 + (Math.random() - 0.5) * rect.height * 0.15,
          vx: 0.05 + Math.random() * 0.1,
          size: 0.8 + Math.random() * 1.2,
          opacity: 0.25 + Math.random() * 0.5,
        })
      }
    }

    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      const rect = canvas.getBoundingClientRect()
      const cw = rect.width
      const ch = rect.height

      sweepAngle += 0.005
      ctx.clearRect(0, 0, cw, ch)

      // Sky gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, ch)
      skyGrad.addColorStop(0, '#0a0a1a')
      skyGrad.addColorStop(0.5, '#1a1a3a')
      skyGrad.addColorStop(0.75, '#2a1a3a')
      skyGrad.addColorStop(0.9, '#4a2a20')
      skyGrad.addColorStop(1, '#5a3a20')
      ctx.fillStyle = skyGrad
      ctx.fillRect(0, 0, cw, ch)

      // Horizon arc
      const horizonY = ch * 0.78
      ctx.beginPath()
      ctx.moveTo(0, horizonY)
      ctx.quadraticCurveTo(cw / 2, horizonY - 20, cw, horizonY)
      ctx.strokeStyle = 'rgba(255,180,100,0.3)'
      ctx.lineWidth = 2
      ctx.stroke()

      // Ground below horizon
      const groundGrad = ctx.createLinearGradient(0, horizonY, 0, ch)
      groundGrad.addColorStop(0, 'rgba(30,20,10,0.6)')
      groundGrad.addColorStop(1, 'rgba(10,8,5,0.8)')
      ctx.fillStyle = groundGrad
      ctx.beginPath()
      ctx.moveTo(0, horizonY)
      ctx.quadraticCurveTo(cw / 2, horizonY - 10, cw, horizonY)
      ctx.lineTo(cw, ch)
      ctx.lineTo(0, ch)
      ctx.closePath()
      ctx.fill()

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
        ctx.fillStyle = `rgba(224, 180, 140, ${a.opacity * 0.6})`
        ctx.fill()
      }

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

        // Sun rays
        if (b.label === 'SUN') {
          ctx.save()
          ctx.beginPath()
          ctx.arc(bx, by, b.size * 1.6, 0, Math.PI * 2)
          ctx.fillStyle = 'rgba(255,212,0,0.08)'
          ctx.fill()
          for (let i = 0; i < 8; i++) {
            const a = (i / 8) * Math.PI * 2 + now * 0.0005
            ctx.beginPath()
            ctx.moveTo(bx + Math.cos(a) * b.size * 1.2, by + Math.sin(a) * b.size * 1.2)
            ctx.lineTo(bx + Math.cos(a) * b.size * 2.2, by + Math.sin(a) * b.size * 2.2)
            ctx.strokeStyle = 'rgba(255,212,0,0.15)'
            ctx.lineWidth = 1.5
            ctx.stroke()
          }
          ctx.restore()
        }

        // Moon crescent
        if (b.label === 'MOON') {
          ctx.beginPath()
          ctx.arc(bx - 3, by - 2, b.size * 0.6, 0, Math.PI * 2)
          ctx.fillStyle = 'rgba(0,0,0,0.4)'
          ctx.fill()
        }

        // Label
        ctx.fillStyle = 'rgba(255,255,255,0.7)'
        ctx.font = '9px Space Mono, monospace'
        ctx.textAlign = 'center'
        ctx.fillText(b.label, bx, by + b.size + 14)
      }

      // Radar sweep
      ctx.save()
      ctx.beginPath()
      ctx.moveTo(cw / 2, ch)
      const sweepX = cw / 2 + Math.sin(sweepAngle) * cw * 0.6
      const sweepY = ch - Math.cos(sweepAngle) * ch * 0.7
      ctx.lineTo(sweepX, sweepY)
      ctx.lineWidth = 1
      ctx.strokeStyle = 'rgba(0,212,255,0.2)'
      ctx.stroke()

      // Sweep cone fill
      ctx.beginPath()
      ctx.moveTo(cw / 2, ch)
      const sw2 = sweepAngle + 0.12
      const sx1 = cw / 2 + Math.sin(sweepAngle) * cw * 0.6
      const sy1 = ch - Math.cos(sweepAngle) * ch * 0.7
      const sx2 = cw / 2 + Math.sin(sw2) * cw * 0.6
      const sy2 = ch - Math.cos(sw2) * ch * 0.7
      ctx.lineTo(sx1, sy1)
      ctx.lineTo(sx2, sy2)
      ctx.closePath()
      ctx.fillStyle = 'rgba(0,212,255,0.04)'
      ctx.fill()
      ctx.restore()

      frameRef.current = requestAnimationFrame(draw)
    }

    frameRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(frameRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <div className="animate-card-glow" style={{
      background: 'rgba(10,10,15,0.8)',
      border: '1px solid rgba(0,212,255,0.1)',
      borderRadius: 12, overflow: 'hidden', position: 'relative',
    }}>
      <div style={{
        position: 'absolute', top: 10, left: 14, zIndex: 2,
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span style={{ fontSize: 14 }}>🌅</span>
        <span style={{ ...S, fontSize: 9, color: '#8892A4', letterSpacing: '0.2em' }}>TONIGHT&apos;S VIEW</span>
      </div>
      <div style={{
        position: 'absolute', top: 10, right: 14, zIndex: 2,
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
