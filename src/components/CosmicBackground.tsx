'use client'

import { useEffect, useRef } from 'react'

interface Star {
  x: number; y: number; size: number; speedX: number; speedY: number; opacity: number
}

export default function CosmicBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const frameRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = 0, h = 0
    let hue = 260
    let stars: Star[] = []

    const resize = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w
      canvas.height = h
      stars = Array.from({ length: 500 }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        size: Math.random() * 2 + 0.5,
        speedX: (Math.random() - 0.5) * 0.15,
        speedY: (Math.random() - 0.5) * 0.15,
        opacity: Math.random() * 0.7 + 0.3,
      }))
    }

    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      ctx.clearRect(0, 0, w, h)

      // Nebula layers
      hue = (hue + 0.04) % 360
      const gradient1 = ctx.createRadialGradient(w * 0.2, h * 0.3, 0, w * 0.2, h * 0.3, w * 0.7)
      gradient1.addColorStop(0, `hsla(${hue}, 80%, 20%, 0.15)`)
      gradient1.addColorStop(0.5, `hsla(${(hue + 30) % 360}, 70%, 12%, 0.08)`)
      gradient1.addColorStop(1, 'transparent')
      ctx.fillStyle = gradient1
      ctx.fillRect(0, 0, w, h)

      const gradient2 = ctx.createRadialGradient(w * 0.8, h * 0.7, 0, w * 0.8, h * 0.7, w * 0.5)
      gradient2.addColorStop(0, `hsla(${(hue + 60) % 360}, 70%, 15%, 0.1)`)
      gradient2.addColorStop(0.6, `hsla(${(hue + 120) % 360}, 60%, 8%, 0.06)`)
      gradient2.addColorStop(1, 'transparent')
      ctx.fillStyle = gradient2
      ctx.fillRect(0, 0, w, h)

      // Radar grid sphere (subtle wireframe circle)
      const cx = w / 2, cy = h / 2
      const radius = Math.min(w, h) * 0.18
      ctx.strokeStyle = `hsla(${(hue + 180) % 360}, 50%, 50%, 0.04)`
      ctx.lineWidth = 0.5
      for (let r = radius * 0.3; r <= radius; r += radius * 0.35) {
        ctx.beginPath()
        ctx.arc(cx, cy, r, 0, Math.PI * 2)
        ctx.stroke()
      }
      // Crosshairs
      for (let a = 0; a < 4; a++) {
        const angle = a * Math.PI / 4 + Date.now() * 0.00005
        ctx.beginPath()
        ctx.moveTo(cx + Math.cos(angle) * radius * 0.3, cy + Math.sin(angle) * radius * 0.3)
        ctx.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius)
        ctx.stroke()
      }

      // Stars with parallax drift
      for (const s of stars) {
        s.x += s.speedX
        s.y += s.speedY
        if (s.x < 0) s.x = w
        if (s.x > w) s.x = 0
        if (s.y < 0) s.y = h
        if (s.y > h) s.y = 0

        const twinkle = 0.6 + 0.4 * Math.sin(Date.now() * 0.001 * s.size + s.x)
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${(s.opacity * twinkle * 0.4).toFixed(3)})`
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
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        pointerEvents: 'none',
        display: 'block',
      }}
      aria-hidden="true"
    />
  )
}
