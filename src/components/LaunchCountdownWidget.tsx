'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const S = { fontFamily: 'Space Mono, monospace' as const }

const LAUNCH_TARGET = Date.now() + 3600000 * 4

export default function LaunchCountdownWidget() {
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(i)
  }, [])

  const totalMs = LAUNCH_TARGET - now
  if (totalMs <= 0) return null

  const cd = {
    d: Math.floor(totalMs / 86400000),
    h: Math.floor((totalMs % 86400000) / 3600000),
    m: Math.floor((totalMs % 3600000) / 60000),
    s: Math.floor((totalMs % 60000) / 1000),
  }

  return (
    <div className="animate-card-glow hover-lift" style={{
      background: 'rgba(10,10,15,0.8)',
      border: '1px solid rgba(255,107,53,0.15)',
      borderRadius: 10, padding: 12, marginTop: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        <span style={{ fontSize: 12 }}>🚀</span>
        <span style={{ ...S, fontSize: 8, color: '#FF6B35', letterSpacing: '0.2em' }}>LAUNCH COUNTDOWN</span>
      </div>
      <div style={{ ...S, fontSize: 10, color: '#fff', marginBottom: 6 }}>Falcon 9 · Starlink 12-3</div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
        {([['DAYS', cd.d], ['HRS', cd.h], ['MIN', cd.m], ['SEC', cd.s]] as [string, number][]).map(([l, v]) => (
          <div key={l} style={{ flex: 1, textAlign: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: 6, padding: '4px 6px' }}>
            <motion.div
              key={`${l}-${v}`}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              style={{ ...S, fontSize: 16, color: '#FF6B35', fontWeight: 700 }}
            >
              {String(v).padStart(2, '0')}
            </motion.div>
            <div style={{ ...S, fontSize: 6, color: '#4A5568', letterSpacing: '0.1em' }}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{ ...S, fontSize: 7, color: '#4A5568' }}>SpaceX · Communications</div>
    </div>
  )
}