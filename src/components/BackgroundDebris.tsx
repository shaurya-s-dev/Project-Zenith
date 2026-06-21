'use client'

import { useEffect, useRef } from 'react'

interface DebrisParticle {
  cx: number; cy: number
  a: number; b: number
  angle: number
  speed: number
  size: number
  opacity: number
  phase: number
}

export default function BackgroundDebris() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const frameRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = 0, h = 0
    let particles: DebrisParticle[] = []

    const resize = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w
      canvas.height = h
      particles = Array.from({ length: 80 }, () => ({
        cx: Math.random() * w,
        cy: Math.random() * h,
        a: 20 + Math.random() * 80,
        b: 10 + Math.random() * 40,
        angle: Math.random() * Math.PI * 2,
        speed: 0.002 + Math.random() * 0.005,
        size: 0.5 + Math.random() * 1.5,
        opacity: 0.1 + Math.random() * 0.3,
        phase: Math.random() * Math.PI * 2,
      }))
    }

    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      ctx.clearRect(0, 0, w, h)

      for (const p of particles) {
        p.angle += p.speed

        const x = p.cx + p.a * Math.cos(p.angle)
        const y = p.cy + p.b * Math.sin(p.angle)

        const twinkle = 0.5 + 0.5 * Math.sin(Date.now() * 0.001 + p.phase)

        ctx.beginPath()
        ctx.arc(x, y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(0, 212, 255, ${(p.opacity * twinkle).toFixed(3)})`
        ctx.fill()

        if (p.size > 1) {
          ctx.beginPath()
          ctx.arc(x, y, p.size * 2, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(0, 212, 255, ${(p.opacity * twinkle * 0.15).toFixed(3)})`
          ctx.fill()
        }
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
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', inset: 0, width: '100vw', height: '100vh',
        zIndex: -50, pointerEvents: 'none', display: 'block',
      }}
      aria-hidden="true"
    />
  )
}
