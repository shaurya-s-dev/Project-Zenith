'use client'

import { useEffect, useRef } from 'react'

interface Node {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
}

interface Stream {
  x: number
  y: number
  speed: number
  chars: string[]
  opacity: number
}

export default function MatrixBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const frameRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = 0, h = 0
    let nodes: Node[] = []
    let streams: Stream[] = []
    const charPool = ['0', '1']

    const resize = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w
      canvas.height = h

      // Create Neural Network nodes
      const nodeCount = Math.min(100, Math.floor((w * h) / 18000))
      nodes = Array.from({ length: nodeCount }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2 + 1,
      }))

      // Create falling binary streams
      const streamCount = Math.floor(w / 40)
      streams = Array.from({ length: streamCount }, (_, i) => ({
        x: i * 40 + Math.random() * 10,
        y: Math.random() * -h,
        speed: 1 + Math.random() * 2,
        chars: Array.from({ length: 15 + Math.floor(Math.random() * 10) }, () =>
          charPool[Math.floor(Math.random() * charPool.length)]
        ),
        opacity: 0.05 + Math.random() * 0.12,
      }))
    }

    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      // Clear background with extremely high opacity black for clean trail
      ctx.fillStyle = 'rgba(6, 7, 19, 0.25)'
      ctx.fillRect(0, 0, w, h)

      // 1. Draw binary streams
      ctx.font = '10px "Space Mono", monospace'
      for (const s of streams) {
        s.y += s.speed
        if (s.y > h + 15 * 12) {
          s.y = -200
          s.speed = 1 + Math.random() * 2
        }

        for (let i = 0; i < s.chars.length; i++) {
          const charY = s.y - i * 12
          if (charY < 0 || charY > h) continue

          const isLeader = i === 0
          const char = s.chars[(Math.floor(s.y / 10) + i) % s.chars.length]

          if (isLeader) {
            ctx.fillStyle = 'rgba(0, 243, 255, 0.8)'
          } else {
            ctx.fillStyle = `rgba(155, 89, 255, ${s.opacity * (1 - i / s.chars.length)})`
          }
          ctx.fillText(char, s.x, charY)
        }
      }

      // 2. Draw Neural Network connections
      const maxDistance = 140
      ctx.lineWidth = 0.5

      for (let i = 0; i < nodes.length; i++) {
        const n1 = nodes[i]
        n1.x += n1.vx
        n1.y += n1.vy

        // Keep inside bounds
        if (n1.x < 0 || n1.x > w) n1.vx *= -1
        if (n1.y < 0 || n1.y > h) n1.vy *= -1

        // Draw node
        ctx.beginPath()
        ctx.arc(n1.x, n1.y, n1.radius, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(0, 243, 255, 0.4)'
        ctx.fill()

        // Scan for neighbors
        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j]
          const dx = n1.x - n2.x
          const dy = n1.y - n2.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < maxDistance) {
            const alpha = (1 - dist / maxDistance) * 0.15
            const pulse = 0.8 + 0.2 * Math.sin(Date.now() * 0.002 + dist)
            ctx.strokeStyle = `rgba(155, 89, 255, ${(alpha * pulse).toFixed(3)})`
            ctx.beginPath()
            ctx.moveTo(n1.x, n1.y)
            ctx.lineTo(n2.x, n2.y)
            ctx.stroke()
          }
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
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -50,
        pointerEvents: 'none',
        display: 'block',
      }}
      aria-hidden="true"
    />
  )
}
