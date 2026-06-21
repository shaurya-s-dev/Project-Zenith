'use client'

import { useEffect, useRef } from 'react'

export default function AuroraBackground() {
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
      time += 0.004
      ctx.clearRect(0, 0, w, h)

      for (let i = 0; i < 5; i++) {
        const yBase = h * (0.2 + i * 0.15)
        const amp = 40 + i * 12
        const freq = 0.002 + i * 0.0008
        const hue = 160 + i * 20 + Math.sin(time * 0.3 + i) * 15
        const alpha = 0.04 + (1 - i * 0.18)

        ctx.beginPath()
        for (let x = 0; x <= w; x += 2) {
          const y = yBase + Math.sin(x * freq + time * 1.2 + i * 2) * amp
            + Math.sin(x * freq * 2.3 + time * 0.9 + i) * amp * 0.4
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
        }
        ctx.strokeStyle = `hsla(${hue}, 80%, 60%, ${alpha})`
        ctx.lineWidth = 20 + i * 8
        ctx.stroke()
      }

      for (let i = 0; i < 3; i++) {
        const yBase = h * (0.3 + i * 0.2)
        const amp = 30 + i * 10
        const freq = 0.003 + i * 0.001
        const hue = 280 + i * 15 + Math.sin(time * 0.2 + i * 0.5) * 10

        ctx.beginPath()
        for (let x = 0; x <= w; x += 2) {
          const y = yBase + Math.sin(x * freq + time * 0.8 + i * 3) * amp
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
        }
        ctx.strokeStyle = `hsla(${hue}, 70%, 65%, 0.03)`
        ctx.lineWidth = 15 + i * 6
        ctx.stroke()
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
