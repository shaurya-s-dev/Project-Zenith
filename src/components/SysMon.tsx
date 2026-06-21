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
  const [memory, setMemory] = useState<string>('N/A')
  const frameRef = useRef<number>(0)
  const lastTimeRef = useRef<number>(0)
  const framesRef = useRef(0)

  useEffect(() => {
    let running = true
    lastTimeRef.current = performance.now()
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

  useEffect(() => {
    const updateMemory = () => {
      const perf = typeof window !== 'undefined' ? window.performance as unknown as { memory?: { usedJSHeapSize: number } } : null
      if (perf && perf.memory) {
        setMemory(`${Math.round(perf.memory.usedJSHeapSize / 1048576)}MB`)
      } else {
        setMemory('N/A')
      }
    }
    updateMemory()
    const i = setInterval(updateMemory, 2000)
    return () => clearInterval(i)
  }, [])

  let latencyColor = '#8892A4'
  let latencyText = '—'
  if (apiLatency !== undefined && apiLatency !== null) {
    latencyText = `${apiLatency}ms`
    if (apiLatency < 200) latencyColor = '#00FF88'
    else if (apiLatency < 500) latencyColor = '#FFD400'
    else latencyColor = '#FF3B3B'
  }

  return (
    <div style={{
      position: 'fixed', bottom: 48, left: 16, zIndex: 998,
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
            ['API LATENCY', latencyText, latencyColor],
            ['TLE AGE', tleLastUpdated || '—', '#8892A4'],
            ['MEMORY', memory, memory === 'N/A' ? '#4A5568' : '#00D4FF'],
            ['WS CONN', 'N/A (no WS)', '#4A5568'],
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
