'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, createContext, useEffect } from 'react'
import { useTheme, THEME_LABELS, THEME_ORDER } from './ThemeProvider'

const S = { fontFamily: 'Space Mono, monospace' }

export const HologramCtx = createContext({ hologramOn: false, setHologramOn: (() => {}) as (h: boolean) => void })

const TABS = [
  { id: 'dashboard', label: '🛰️ DASHBOARD', href: '/dashboard', icon: '📡' },
  { id: 'sky', label: '🌌 SKY ABOVE ME', href: '/sky', icon: '🔭' },
  { id: 'weather', label: '☀️ SPACE WEATHER', href: '/weather', icon: '🌤️' },
  { id: 'skylens', label: '🤖 SKYLENS AI', href: '/skylens', icon: '🧠' },
]

export default function TabNav() {
  const pathname = usePathname()
  const activeHref = '/' + pathname.split('/')[1]
  const { theme, setTheme, hologramOn, setHologramOn } = useTheme()
  const [themeOpen, setThemeOpen] = useState(false)
  const [apiStatus, setApiStatus] = useState<'green' | 'yellow' | 'red'>('green')
  const [showStatusTooltip, setShowStatusTooltip] = useState(false)
  const [healthDetails, setHealthDetails] = useState({
    iss: 'PENDING',
    celestrak: 'PENDING',
    skylens: 'PENDING'
  })

  useEffect(() => {
    const checkApis = async () => {
      let isISSOnline = false
      let isCelestrakOnline = false
      let isSkylensOnline = false

      try {
        const r = await fetch('/api/iss')
        if (r.ok) {
          const d = await r.json()
          isISSOnline = d.live !== false
        }
      } catch {}

      try {
        const r = await fetch('/api/celestrak')
        if (r.ok) {
          const d = await r.json()
          isCelestrakOnline = d.online === true
        }
      } catch {}

      try {
        const r = await fetch('/api/skylens', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: [], context: '' })
        })
        // 500 (usually due to missing keys) still means endpoint is online/running, 404 is critical
        isSkylensOnline = r.status !== 404
      } catch {}

      setHealthDetails({
        iss: isISSOnline ? 'ONLINE' : 'OFFLINE',
        celestrak: isCelestrakOnline ? 'ONLINE' : 'OFFLINE',
        skylens: isSkylensOnline ? 'ONLINE' : 'OFFLINE'
      })

      const onlineCount = [isISSOnline, isCelestrakOnline, isSkylensOnline].filter(Boolean).length
      if (onlineCount === 3) setApiStatus('green')
      else if (onlineCount > 0) setApiStatus('yellow')
      else setApiStatus('red')
    }

    checkApis()
    const interval = setInterval(checkApis, 45000)
    return () => clearInterval(interval)
  }, [])

  return (
    <HologramCtx.Provider value={{ hologramOn, setHologramOn }}>
      <nav style={{
        height: 52,
        background: 'color-mix(in srgb, var(--theme-bg, #000) 85%, transparent)',
        borderBottom: '1px solid var(--theme-border, rgba(0,212,255,0.12))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        backdropFilter: 'blur(20px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        transition: 'background 0.3s, border-color 0.3s',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--theme-primary, #00D4FF)', animation: 'pulse-cyan 2s infinite' }} />
          <span style={{ ...S, color: 'var(--theme-primary, #00D4FF)', letterSpacing: '0.3em', fontSize: 13, fontWeight: 700 }}>ZENITH</span>
        </div>

        <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: 3 }}>
          {TABS.map(({ label, href, icon }) => {
            const isActive = activeHref === href
            return (
              <Link
                key={href}
                href={href}
                style={{
                  ...S,
                  fontSize: 9,
                  letterSpacing: '0.15em',
                  color: isActive ? '#000' : 'var(--theme-text-dim, #8892A4)',
                  background: isActive ? 'var(--theme-primary, #00D4FF)' : 'transparent',
                  borderRadius: 6,
                  padding: '6px 14px',
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span style={{ fontSize: 11 }}>{icon}</span>
                {label.split(' ').slice(1).join(' ')}
              </Link>
            )
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Export PDF */}
          <button
            id="export-pdf-btn"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('zenith-export-pdf'))
            }}
            style={{
              ...S, fontSize: 8, letterSpacing: '0.1em',
              color: 'var(--theme-text-dim, #8892A4)', background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4,
              padding: '4px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
            }}
          >
            📄 EXPORT
          </button>

          {/* Hologram toggle */}
          <button
            onClick={() => { setHologramOn(!hologramOn) }}
            style={{
              ...S, fontSize: 8, letterSpacing: '0.15em',
              color: hologramOn ? 'var(--theme-primary, #00D4FF)' : 'var(--theme-text-dim, #8892A4)',
              background: hologramOn ? 'color-mix(in srgb, var(--theme-primary, #00D4FF) 8%, transparent)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${hologramOn ? 'color-mix(in srgb, var(--theme-primary, #00D4FF) 30%, transparent)' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: 4, padding: '4px 8px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 4,
              boxShadow: hologramOn ? '0 0 10px rgba(0, 243, 255, 0.2)' : 'none',
            }}
          >
            🧊 HOLO {hologramOn ? 'ON' : 'OFF'}
          </button>

          {/* DEEP SPACE Quick-Switch */}
          <button
            onClick={() => setTheme('deep-space')}
            style={{
              ...S, fontSize: 8, letterSpacing: '0.15em',
              color: theme === 'deep-space' ? 'var(--theme-primary, #00D4FF)' : 'var(--theme-text-dim, #8892A4)',
              background: theme === 'deep-space' ? 'color-mix(in srgb, var(--theme-primary, #00D4FF) 8%, transparent)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${theme === 'deep-space' ? 'color-mix(in srgb, var(--theme-primary, #00D4FF) 30%, transparent)' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: 4, padding: '4px 8px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 4,
            }}
          >
            🌌 DEEP SPACE
          </button>

          {/* Theme picker */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setThemeOpen(o => !o)}
              style={{
                ...S, fontSize: 8, letterSpacing: '0.15em',
                color: 'var(--theme-text-dim, #8892A4)', background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4,
                padding: '4px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
              }}
            >
              <span style={{ fontSize: 9 }}>🎨</span>
              {THEME_LABELS[theme]}
            </button>
            {themeOpen && (
              <div
                style={{
                  position: 'absolute', right: 0, top: '100%', marginTop: 4,
                  background: 'var(--theme-surface, #0a0a12)', border: '1px solid var(--theme-border, rgba(0,212,255,0.15))',
                  borderRadius: 8, padding: 4, minWidth: 165, zIndex: 100,
                  backdropFilter: 'blur(20px)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                }}
              >
                {THEME_ORDER.map(kt => (
                  <button
                    key={kt}
                    onClick={() => { setTheme(kt); setThemeOpen(false) }}
                    style={{
                      ...S, fontSize: 9, letterSpacing: '0.1em', width: '100%', textAlign: 'left',
                      color: theme === kt ? 'var(--theme-primary, #00D4FF)' : 'var(--theme-text-dim, #8892A4)',
                      background: theme === kt ? 'color-mix(in srgb, var(--theme-primary, #00D4FF) 8%, transparent)' : 'transparent',
                      border: 'none', borderRadius: 4, padding: '6px 10px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 6,
                    }}
                  >
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: kt === 'deep-space' ? '#00D4FF' :
                                  kt === 'holographic' ? '#00F3FF' :
                                  kt === 'solar-flare' ? '#FF6B35' : '#00FF88',
                      flexShrink: 0,
                    }} />
                    {THEME_LABELS[kt]}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* SYSTEMS ONLINE status dot/indicator */}
          <div
            style={{ display: 'flex', alignItems: 'center', gap: 8, position: 'relative', cursor: 'pointer' }}
            onMouseEnter={() => setShowStatusTooltip(true)}
            onMouseLeave={() => setShowStatusTooltip(false)}
          >
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              background: apiStatus === 'green' ? '#00FF88' : apiStatus === 'yellow' ? '#FFD400' : '#FF3B3B',
              boxShadow: `0 0 10px ${apiStatus === 'green' ? 'rgba(0,255,136,0.6)' : apiStatus === 'yellow' ? 'rgba(255,212,0,0.6)' : 'rgba(255,59,59,0.6)'}`,
              animation: 'blink 1.2s infinite'
            }} />
            <span style={{
              ...S, fontSize: 9,
              color: apiStatus === 'green' ? '#00FF88' : apiStatus === 'yellow' ? '#FFD400' : '#FF3B3B',
              letterSpacing: '0.15em'
            }}>
              SYSTEMS {apiStatus === 'green' ? 'ONLINE' : apiStatus === 'yellow' ? 'DEGRADED' : 'CRITICAL'}
            </span>

            {/* Health detail tooltip */}
            {showStatusTooltip && (
              <div style={{
                position: 'absolute', right: 0, top: '100%', marginTop: 8,
                background: 'rgba(5, 5, 8, 0.95)', border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 6, padding: '8px 12px', minWidth: 200, zIndex: 100,
                backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column', gap: 6,
                boxShadow: '0 4px 15px rgba(0,0,0,0.6)'
              }}>
                <div style={{ ...S, fontSize: 8, color: '#8892A4', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 4, fontWeight: 'bold' }}>API GATEWAY HEALTH</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ ...S, fontSize: 8, color: '#fff' }}>ISS TELEMETRY</span>
                  <span style={{ ...S, fontSize: 8, color: healthDetails.iss === 'ONLINE' ? '#00FF88' : '#FF3B3B' }}>{healthDetails.iss}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ ...S, fontSize: 8, color: '#fff' }}>CELESTRAK DB</span>
                  <span style={{ ...S, fontSize: 8, color: healthDetails.celestrak === 'ONLINE' ? '#00FF88' : '#FF3B3B' }}>{healthDetails.celestrak}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ ...S, fontSize: 8, color: '#fff' }}>SKYLENS AI CORE</span>
                  <span style={{ ...S, fontSize: 8, color: healthDetails.skylens === 'ONLINE' ? '#00FF88' : '#FF3B3B' }}>{healthDetails.skylens}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
    </HologramCtx.Provider>
  )
}

export function useHologram() {
  const { hologramOn, setHologramOn } = useTheme()
  return { hologramOn, setHologramOn }
}
