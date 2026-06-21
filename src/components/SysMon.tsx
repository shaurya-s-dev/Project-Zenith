'use client'

import { useState, useEffect, useRef } from 'react'

const S = { fontFamily: 'Space Mono, monospace' as const }

interface SysMonProps {
  apiLatency?: number | null
  tleLastUpdated?: string
}

export default function SysMon({ apiLatency, tleLastUpdated }: SysMonProps) {
  const [collapsed, setCollapsed] = useState(true)
  const [fps, setFps] = useState(0)
  const frameRef = useRef<number>(0)
  const lastTimeRef = useRef(performance.now())
  const framesRef = useRef(0)

  useEffect(() => {
    let running = true
    const tick = () => {
      if (!running) return
      framesRef.current++
      const now = performance.now()
      if (now - lastTimeRef.current >= 1000) {
        setFps(framesRef.current)
        framesRef.current = 0
        lastTimeRef.current = now
      }
      frameRef.current = requestAnimationFrame(tick)
    }
    frameRef.current = requestAnimationFrame(tick)
    return () => { running = false; cancelAnimationFrame(frameRef.current) }
  }, [])

  return (
    <div style={{
      position: 'fixed', bottom: 16, left: 16, zIndex: 998,
    }}>
      <button
        onClick={() => setCollapsed(c => !c)}
        style={{
          ...S, fontSize: 8, letterSpacing: '0.1em',
          color: '#4A5568', background: 'rgba(0,0,0,0.5)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 6, padding: '4px 8px', cursor: 'pointer',
          backdropFilter: 'blur(8px)',
        }}
      >
        🖥️ SYS MON {collapsed ? '+' : '−'}
      </button>

      {!collapsed && (
        <div style={{
          marginTop: 4,
          background: 'rgba(0,0,0,0.85)', border: '1px solid rgba(0,212,255,0.12)',
          borderRadius: 8, padding: '8px 10px', minWidth: 170,
          backdropFilter: 'blur(12px)',
        }}>
          <div style={{ ...S, fontSize: 7, color: '#00D4FF', letterSpacing: '0.2em', marginBottom: 6 }}>SYSTEM MONITOR</div>
          {[
            ['FPS', `${fps}`, fps > 50 ? '#00FF88' : fps > 30 ? '#FFD400' : '#FF6B35'],
            ['API LATENCY', apiLatency !== null ? `${apiLatency}ms` : '—', '#00D4FF'],
            ['TLE AGE', tleLastUpdated || '—', '#8892A4'],
            ['WS CONN', '0', '#4A5568'],
          ].map(([label, value, color]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
              <span style={{ ...S, fontSize: 7, color: '#4A5568' }}>{label}</span>
              <span style={{ ...S, fontSize: 7, color }}>{value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
