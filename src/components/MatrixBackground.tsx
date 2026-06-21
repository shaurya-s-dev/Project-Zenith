'use client'

import { useEffect, useRef } from 'react'

export default function MatrixBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const frameRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = 0, h = 0
    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789<>/{}[]|&^%$#@'

    interface Drop { x: number; y: number; speed: number; len: number; chars: string[] }

    const fontSize = 14
    const cols = () => Math.floor(w / fontSize)
    let drops: Drop[] = []

    const resize = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w
      canvas.height = h
      drops = Array.from({ length: cols() }, (_, i) => ({
        x: i * fontSize,
        y: Math.random() * h,
        speed: 0.5 + Math.random() * 1.5,
        len: 5 + Math.floor(Math.random() * 15),
        chars: Array.from({ length: 20 }, () => chars[Math.floor(Math.random() * chars.length)]),
      }))
    }

    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
      ctx.fillRect(0, 0, w, h)

      ctx.font = `${fontSize}px "Space Mono", monospace`

      for (const drop of drops) {
        drop.y += drop.speed
        if (drop.y > h + drop.len * fontSize) {
          drop.y = -drop.len * fontSize
          drop.chars = Array.from({ length: 20 }, () => chars[Math.floor(Math.random() * chars.length)])
        }

        for (let i = 0; i < drop.len; i++) {
          const y = drop.y - i * fontSize
          if (y < 0 || y > h) continue
          const char = drop.chars[i % drop.chars.length]

          if (i === 0) {
            ctx.fillStyle = '#00D4FF'
            ctx.shadowColor = '#00D4FF'
            ctx.shadowBlur = 10
          } else {
            const alpha = 1 - i / drop.len
            ctx.fillStyle = `rgba(0, 212, 255, ${alpha * 0.5})`
            ctx.shadowBlur = 0
          }

          ctx.fillText(char, drop.x, y)
        }
      }

      ctx.shadowBlur = 0

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
