'use client'

import { useEffect, useRef } from 'react'

export default function SolarFlareBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const frameRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = 0, h = 0
    let time = 0

    const resize = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w
      canvas.height = h
    }

    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      time += 0.01
      ctx.clearRect(0, 0, w, h)

      const cx = w * 0.15, cy = h * 0.15

      // Coronal glow
      for (let r = 150; r > 0; r -= 8) {
        const alpha = 0.04 * (1 - r / 150)
        ctx.beginPath()
        ctx.arc(cx, cy, r, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(30, 100%, ${50 + r * 0.1}%, ${alpha})`
        ctx.fill()
      }

      // Solar corona streamers
      for (let i = 0; i < 20; i++) {
        const angle = (i / 20) * Math.PI * 2 + time * 0.2
        const len = 60 + 40 * Math.sin(i * 1.5 + time)
        const x1 = cx + Math.cos(angle) * 40
        const y1 = cy + Math.sin(angle) * 40
        const x2 = cx + Math.cos(angle) * (40 + len)
        const y2 = cy + Math.sin(angle) * (40 + len)
        const x3 = cx + Math.cos(angle + 0.15) * (40 + len * 0.7)
        const y3 = cy + Math.sin(angle + 0.15) * (40 + len * 0.7)

        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.quadraticCurveTo(x2, y2, x3, y3)
        ctx.strokeStyle = `hsla(35, 100%, 70%, ${0.15 + Math.sin(i + time) * 0.08})`
        ctx.lineWidth = 2 + Math.sin(i * 0.5 + time) * 1
        ctx.stroke()
      }

      // Surface flicker
      for (let i = 0; i < 15; i++) {
        const sx = cx + (Math.random() - 0.5) * 60
        const sy = cy + (Math.random() - 0.5) * 60
        const sr = 2 + Math.random() * 6
        ctx.beginPath()
        ctx.arc(sx, sy, sr, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(40, 100%, ${70 + Math.random() * 20}%, ${0.2 + Math.random() * 0.3})`
        ctx.fill()
      }

      // Heat haze ripples across screen
      for (let i = 0; i < 4; i++) {
        const y = h * (0.3 + i * 0.15) + Math.sin(time * 0.5 + i) * 10
        ctx.beginPath()
        for (let x = 0; x <= w; x += 3) {
          const yOff = Math.sin(x * 0.005 + time * 1.5 + i * 2) * 8
          if (x === 0) {
            ctx.moveTo(x, y + yOff)
          } else {
            ctx.lineTo(x, y + yOff)
          }
        }
        ctx.strokeStyle = `hsla(20, 90%, 60%, 0.03)`
        ctx.lineWidth = 12
        ctx.stroke()
      }

      // Particles
      for (let i = 0; i < 30; i++) {
        const px = (Math.random() * w)
        const py = cy + 200 + Math.random() * (h - cy - 200)
        const pr = 0.5 + Math.random() * 2
        ctx.beginPath()
        ctx.arc(px, py, pr, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(25, 100%, 70%, ${0.1 + Math.random() * 0.2})`
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
        position: 'fixed', inset: 0, width: '100vw', height: '100vh',
        zIndex: -1, pointerEvents: 'none', display: 'block',
      }}
      aria-hidden="true"
    />
  )
}
