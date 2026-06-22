'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { ChevronDown } from 'lucide-react'

const BOOT_LINES = [
  '> INITIALIZING ZENITH SYSTEMS...',
  '> CONNECTING TO CELESTRAK DATABASE...',
  '> ISS TELEMETRY: ONLINE',
  '> SATELLITE FEEDS: 23,794 OBJECTS TRACKED',
  '> ASTRONOMICAL CALCULATIONS: READY',
  '> ALL SYSTEMS NOMINAL',
]

const STATS = [
  { value: '23,794+', label: 'ACTIVE OBJECTS' },
  { value: '< 5s', label: 'DATA LATENCY' },
  { value: '99.9%', label: 'UPTIME' },
]
const toRad = (d: number) => (d * Math.PI) / 180

interface Meteor { id: number; top: number; left: number; angle: number; length: number; duration: number }

export default function HomePage() {
  const router = useRouter()
  const [stars, setStars] = useState<{ top: string; left: string; size: number; opacity: number; delay: number }[]>([])
  const [meteors, setMeteors] = useState<Meteor[]>([])
  const [bootLines, setBootLines] = useState<string[]>([])
  const [bootComplete, setBootComplete] = useState(false)

  useEffect(() => {
    const s = Array.from({ length: 150 }, () => ({
      top: Math.random() * 100 + '%',
      left: Math.random() * 100 + '%',
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.6 + 0.2,
      delay: Math.random() * 3,
    }))
    setTimeout(() => {
      setStars(s)
    }, 0)
  }, [])

  useEffect(() => {
    let active = true
    const spawn = () => {
      if (!active) return
      const id = Date.now() + Math.random()
      const angle = 25 + Math.random() * 30
      const duration = 0.9 + Math.random() * 1.1
      setMeteors(prev => [...prev, { id, top: Math.random() * 45, left: Math.random() * 85, angle, length: 70 + Math.random() * 70, duration }])
      setTimeout(() => setMeteors(prev => prev.filter(m => m.id !== id)), (duration + 0.4) * 1000)
      setTimeout(spawn, 1500 + Math.random() * 3500)
    }
    const initial = setTimeout(spawn, 1000)
    return () => { active = false; clearTimeout(initial) }
  }, [])

  useEffect(() => {
    BOOT_LINES.forEach((line, i) => {
      setTimeout(() => {
        setBootLines(prev => [...prev, line])
        if (i === BOOT_LINES.length - 1) {
          setTimeout(() => setBootComplete(true), 400)
        }
      }, i * 350)
    })
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', padding: '24px' }}>

      {/* Stars */}
      {stars.map((s, i) => (
        <div key={i} style={{
          position: 'absolute', top: s.top, left: s.left,
          width: s.size, height: s.size, borderRadius: '50%',
          background: '#fff', opacity: s.opacity,
          animationName: 'twinkle',
          animationDuration: `${2 + s.delay}s`,
          animationTimingFunction: 'ease-in-out',
          animationIterationCount: 'infinite',
          animationDelay: s.delay + 's',
          pointerEvents: 'none',
        }} />
      ))}
      {meteors.map(m => (
        <motion.div
          key={m.id}
          initial={{ opacity: 0, x: 0, y: 0 }}
          animate={{ opacity: [0, 1, 1, 0], x: Math.cos(toRad(m.angle)) * 480, y: Math.sin(toRad(m.angle)) * 480 }}
          transition={{ duration: m.duration, ease: 'easeIn' }}
          style={{
            position: 'absolute', top: m.top + '%', left: m.left + '%',
            width: m.length, height: 2, borderRadius: 2,
            background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(0,212,255,0.6) 60%, #fff 100%)',
            transform: `rotate(${m.angle}deg)`, transformOrigin: 'left center',
            boxShadow: '0 0 6px rgba(255,255,255,0.6)', pointerEvents: 'none',
          }}
        />
      ))}

      {/* Boot terminal */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.2)',
          borderRadius: 12, padding: '16px 20px', maxWidth: 480, width: '100%',
          marginBottom: 40, backdropFilter: 'blur(12px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 8 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00FF88', animation: 'blink 1s infinite' }} />
          <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: 'var(--theme-text-dim, #A0AEC0)', letterSpacing: '0.2em' }}>SYSTEM_BOOT.SH</span>
        </div>
        {bootLines.map((line, i) => (
          <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}
            style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, color: '#00FF88', lineHeight: 1.8 }}>
            {line}
          </motion.div>
        ))}
        {bootLines.length < BOOT_LINES.length && (
          <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, color: '#00FF88', animation: 'blink 0.8s infinite' }}>_</span>
        )}
      </motion.div>

      {/* Main content */}
      <AnimatePresence>
        {bootComplete && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>

            <div style={{ marginBottom: 8 }}>
              <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 'clamp(36px, 8vw, 80px)', letterSpacing: '0.12em', color: '#fff' }}>
                PROJECT{' '}
              </span>
              <span style={{
                fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700,
                fontSize: 'clamp(36px, 8vw, 80px)', letterSpacing: '0.12em',
                background: 'linear-gradient(135deg, #00D4FF, #9B59FF)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                ZENITH
              </span>
            </div>

            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 'clamp(10px, 2vw, 14px)', letterSpacing: '0.4em', color: 'var(--theme-text-dim, #A0AEC0)', marginBottom: 20 }}>
              THE CELESTIAL EYE
            </div>

            <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 'clamp(14px, 2vw, 18px)', color: 'var(--theme-text-dim, #A0AEC0)', maxWidth: 480, lineHeight: 1.6, marginBottom: 32 }}>
              Every point on Earth. Every object in the sky. Right now.
            </p>

            {/* Stats */}
            <div style={{ display: 'flex', gap: 40, marginBottom: 40 }}>
              {STATS.map(({ value, label }) => (
                <div key={label} style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 'clamp(18px, 3vw, 26px)', color: '#00D4FF', animation: 'float 3s ease-in-out infinite', marginBottom: 6 }}>
                    {value}
                  </div>
                  <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: 'var(--theme-text-faint, #7D8A9E)', letterSpacing: '0.2em' }}>
                    {label}
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <motion.button
              whileHover={{ scale: 1.03, boxShadow: '0 0 30px rgba(0,212,255,0.3)' }}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push('/dashboard')}
              style={{
                fontFamily: 'Space Mono, monospace', fontSize: 13, letterSpacing: '0.3em',
                color: '#00D4FF', background: 'transparent',
                border: '1px solid #00D4FF', padding: '14px 40px',
                cursor: 'pointer', borderRadius: 4, position: 'relative',
                transition: 'background 0.2s',
              }}
            >
              INITIALIZE MISSION
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scroll indicator */}
      {bootComplete && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
          style={{ position: 'absolute', bottom: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: 'var(--theme-text-faint, #7D8A9E)', letterSpacing: '0.2em' }}>SCROLL TO EXPLORE</span>
          <ChevronDown size={16} color="var(--theme-text-faint, #7D8A9E)" style={{ animation: 'float 2s ease-in-out infinite' }} />
        </motion.div>
      )}
    </div>
  )
}