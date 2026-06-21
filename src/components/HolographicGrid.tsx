'use client'

import { useEffect, useRef } from 'react'

interface HolographicGridProps {
  enabled: boolean
}

export default function HolographicGrid({ enabled }: HolographicGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const frameRef = useRef<number>(0)

  useEffect(() => {
    if (!enabled) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = 0, h = 0, angle = 0

    const resize = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w
      canvas.height = h
    }

    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      if (!enabled) { frameRef.current = requestAnimationFrame(draw); return }
      angle += 0.002
      ctx.clearRect(0, 0, w, h)

      const cx = w / 2, cy = h / 2
      const spacing = 48
      const radius = Math.sqrt(w * w + h * h)

      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(angle)

      for (let r = 0; r < radius; r += spacing) {
        const vertices = 6
        for (let i = 0; i < vertices; i++) {
          const a1 = (i / vertices) * Math.PI * 2
          const a2 = ((i + 1) / vertices) * Math.PI * 2
          const x1 = r * Math.cos(a1), y1 = r * Math.sin(a1)
          const x2 = r * Math.cos(a2), y2 = r * Math.sin(a2)

          ctx.beginPath()
          ctx.moveTo(x1, y1)
          ctx.lineTo(x2, y2)
          ctx.strokeStyle = `rgba(0, 212, 255, ${(0.03 + Math.sin(angle * 2 + r * 0.01) * 0.02).toFixed(3)})`
          ctx.lineWidth = 0.5
          ctx.stroke()
        }

        const aStep = Math.PI * 2 / 8
        for (let a = 0; a < Math.PI * 2; a += aStep) {
          const x = r * Math.cos(a), y = r * Math.sin(a)
          ctx.beginPath()
          ctx.arc(x, y, 1, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(0, 212, 255, ${(0.04 + Math.sin(angle + a) * 0.03).toFixed(3)})`
          ctx.fill()
        }
      }

      ctx.restore()
      frameRef.current = requestAnimationFrame(draw)
    }

    frameRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(frameRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', inset: 0, width: '100vw', height: '100vh',
        zIndex: 1, pointerEvents: 'none', display: 'block',
      }}
      aria-hidden="true"
    />
  )
}
