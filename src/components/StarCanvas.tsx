'use client'

import { useEffect, useRef } from 'react'

interface Star {
  x: number
  y: number
  radius: number
  opacity: number
  twinkleSpeed: number
  twinkleOffset: number
}

interface ShootingStar {
  x: number
  y: number
  angle: number       // radians, 30-50 degrees converted
  length: number      // px, 100-200
  speed: number       // px per frame, 5-15
  opacity: number
  progress: number    // 0 → 1 along the path
  trailOpacity: number
  active: boolean
}

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min
}

function degToRad(deg: number) {
  return (deg * Math.PI) / 180
}

function spawnShootingStar(w: number, h: number): ShootingStar {
  const angle = degToRad(rand(30, 50))
  return {
    x: rand(0, w),
    y: rand(0, h * 0.6),
    angle,
    length: rand(100, 200),
    speed: rand(5, 15),
    opacity: rand(0.6, 1),
    progress: 0,
    trailOpacity: 0,
    active: true,
  }
}

export default function StarCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const frameRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = 0
    let h = 0

    // ── generate static stars ─────────────────────────────────────────────────
    let stars: Star[] = []
    const genStars = (width: number, height: number) => {
      const count = Math.floor(rand(50, 80))
      stars = Array.from({ length: count }, () => ({
        x: rand(0, width),
        y: rand(0, height),
        radius: rand(0.4, 2.0),
        opacity: rand(0.3, 1),
        twinkleSpeed: rand(0.005, 0.02),
        twinkleOffset: rand(0, Math.PI * 2),
      }))
    }

    // ── generate shooting stars ───────────────────────────────────────────────
    let shooters: ShootingStar[] = []
    const genShooters = (width: number, height: number) => {
      const count = Math.floor(rand(8, 12))
      // Stagger their start so they don't all fire simultaneously
      shooters = Array.from({ length: count }, (_, i) => {
        const s = spawnShootingStar(width, height)
        s.progress = -(i / count) * 1.5   // negative = pre-queued, not yet visible
        return s
      })
    }

    // ── resize handler ────────────────────────────────────────────────────────
    const resize = () => {
      const parent = canvas.parentElement
      if (!parent) return
      w = parent.clientWidth
      h = parent.clientHeight
      canvas.width = w
      canvas.height = h
      genStars(w, h)
      genShooters(w, h)
    }

    const ro = new ResizeObserver(resize)
    if (canvas.parentElement) ro.observe(canvas.parentElement)
    resize()

    let tick = 0

    // ── draw loop ─────────────────────────────────────────────────────────────
    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      tick++

      // — static stars
      for (const s of stars) {
        const twinkle = 0.5 + 0.5 * Math.sin(tick * s.twinkleSpeed + s.twinkleOffset)
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${(s.opacity * twinkle).toFixed(3)})`
        ctx.fill()
      }

      // — shooting stars
      for (let i = 0; i < shooters.length; i++) {
        const ss = shooters[i]

        // advance progress (negative = still waiting in queue)
        ss.progress += ss.speed / (ss.length + 80)

        if (ss.progress < 0) continue   // not yet started

        // travel distance along angle
        const dist = ss.progress * (ss.length + 80)
        const headX = ss.x + Math.cos(ss.angle) * dist
        const headY = ss.y + Math.sin(ss.angle) * dist

        // trail start (behind the head by `length` px, clamped so it doesn't start before origin)
        const trailDist = Math.max(0, dist - ss.length)
        const tailX = ss.x + Math.cos(ss.angle) * trailDist
        const tailY = ss.y + Math.sin(ss.angle) * trailDist

        // fade out as tail lifts off & head finishes
        const fadeIn  = Math.min(1, dist / 30)
        const fadeOut = ss.progress > 0.85 ? 1 - ((ss.progress - 0.85) / 0.15) : 1
        const alpha   = ss.opacity * fadeIn * Math.max(0, fadeOut)

        if (alpha > 0) {
          const grad = ctx.createLinearGradient(tailX, tailY, headX, headY)
          grad.addColorStop(0, `rgba(255,255,255,0)`)
          grad.addColorStop(0.6, `rgba(180,220,255,${(alpha * 0.4).toFixed(3)})`)
          grad.addColorStop(1, `rgba(255,255,255,${alpha.toFixed(3)})`)

          ctx.beginPath()
          ctx.moveTo(tailX, tailY)
          ctx.lineTo(headX, headY)
          ctx.strokeStyle = grad
          ctx.lineWidth = 1.5
          ctx.shadowColor = 'rgba(100,200,255,0.8)'
          ctx.shadowBlur = 4
          ctx.stroke()
          ctx.shadowBlur = 0
        }

        // respawn when completely finished
        if (ss.progress >= 1) {
          shooters[i] = spawnShootingStar(w, h)
          // give it a small random pre-delay so the rhythm stays varied
          shooters[i].progress = -rand(0, 1.2)
        }
      }

      frameRef.current = requestAnimationFrame(draw)
    }

    frameRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(frameRef.current)
      ro.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        display: 'block',
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    />
  )
}