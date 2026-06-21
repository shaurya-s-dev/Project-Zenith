'use client'

import { useEffect, useRef } from 'react'

interface Star {
  x: number
  y: number
  size: number
  phase: number
  speed: number
}

const CONSTELLATIONS = [
  // Constellation A
  [[0.15, 0.2], [0.25, 0.15]],
  [[0.25, 0.15], [0.35, 0.3]],
  [[0.35, 0.3], [0.45, 0.25]],
  [[0.35, 0.3], [0.3, 0.45]],
  // Constellation B
  [[0.6, 0.4], [0.7, 0.25]],
  [[0.7, 0.25], [0.8, 0.35]],
  [[0.8, 0.35], [0.85, 0.55]],
  [[0.85, 0.55], [0.75, 0.6]],
  [[0.8, 0.35], [0.75, 0.6]],
  // Constellation C (subtle)
  [[0.45, 0.7], [0.55, 0.75]],
  [[0.55, 0.75], [0.5, 0.85]],
]

export default function AuroraBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const frameRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = 0, h = 0
    let stars: Star[] = []

    const resize = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w
      canvas.height = h

      // Re-populate stars based on size
      const count = Math.floor((w * h) / 6000) // ~250 stars on 1080p
      const newStars: Star[] = []
      for (let i = 0; i < count; i++) {
        newStars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          size: 0.4 + Math.random() * 1.2,
          phase: Math.random() * Math.PI * 2,
          speed: 0.5 + Math.random() * 1.5,
        })
      }
      stars = newStars
    }

    resize()
    window.addEventListener('resize', resize)

    let time = 0
    const draw = () => {
      time += 0.01
      ctx.clearRect(0, 0, w, h)

      // Draw constellation lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)'
      ctx.lineWidth = 0.8
      for (const edge of CONSTELLATIONS) {
        const [p1, p2] = edge
        ctx.beginPath()
        ctx.moveTo(p1[0] * w, p1[1] * h)
        ctx.lineTo(p2[0] * w, p2[1] * h)
        ctx.stroke()
      }

      // Draw constellation vertices with a small glow
      for (const edge of CONSTELLATIONS) {
        for (const pt of edge) {
          const px = pt[0] * w
          const py = pt[1] * h
          const glow = 2 + Math.sin(time * 2 + px) * 1
          ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'
          ctx.beginPath()
          ctx.arc(px, py, 1.5, 0, Math.PI * 2)
          ctx.fill()

          ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)'
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.arc(px, py, glow + 2, 0, Math.PI * 2)
          ctx.stroke()
        }
      }

      // Draw stars
      for (const s of stars) {
        const opacity = 0.2 + 0.8 * Math.sin(s.phase + time * s.speed)
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2)
        ctx.fill()
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
      position: 'fixed', inset: 0, width: '100vw', height: '100vh',
      zIndex: -1, pointerEvents: 'none', display: 'block',
      background: 'radial-gradient(ellipse at 30% 50%, #0f1a2e 0%, #070b14 100%)',
    }}>
      <canvas
        ref={canvasRef}
        style={{
          width: '100%', height: '100%',
          pointerEvents: 'none', display: 'block',
          opacity: 0.6,
        }}
        aria-hidden="true"
      />
    </div>
  )
}
