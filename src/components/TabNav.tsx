'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { useTheme, THEME_LABELS, THEME_ORDER } from './ThemeProvider'
import type { ThemeKey } from './ThemeProvider'

const S = { fontFamily: 'Space Mono, monospace' }

const TABS = [
  { label: 'DASHBOARD', href: '/dashboard', icon: '◉' },
  { label: 'SKY ABOVE ME', href: '/sky', icon: '✦' },
  { label: 'SPACE WEATHER', href: '/weather', icon: '☀' },
]

export default function TabNav() {
  const pathname = usePathname()
  const activeHref = '/' + pathname.split('/')[1]
  const { theme, setTheme } = useTheme()
  const [themeOpen, setThemeOpen] = useState(false)

  return (
    <nav style={{
      height: 52,
      background: 'rgba(0,0,0,0.85)',
      borderBottom: '1px solid rgba(0,212,255,0.12)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      backdropFilter: 'blur(20px)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#00D4FF', animation: 'pulse-cyan 2s infinite' }} />
        <span style={{ ...S, color: '#00D4FF', letterSpacing: '0.3em', fontSize: 13, fontWeight: 700 }}>ZENITH</span>
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
                letterSpacing: '0.2em',
                color: isActive ? '#000' : '#8892A4',
                background: isActive ? '#00D4FF' : 'transparent',
                borderRadius: 6,
                padding: '6px 14px',
                textDecoration: 'none',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <span style={{ fontSize: 10 }}>{icon}</span>
              {label}
            </Link>
          )
        })}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Theme picker */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setThemeOpen(o => !o)}
            style={{
              ...S, fontSize: 8, letterSpacing: '0.15em',
              color: '#8892A4', background: 'rgba(255,255,255,0.04)',
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
                background: '#0a0a12', border: '1px solid rgba(0,212,255,0.15)',
                borderRadius: 8, padding: 4, minWidth: 160, zIndex: 100,
                backdropFilter: 'blur(20px)',
              }}
            >
              {THEME_ORDER.map(kt => (
                <button
                  key={kt}
                  onClick={() => { setTheme(kt); setThemeOpen(false) }}
                  style={{
                    ...S, fontSize: 9, letterSpacing: '0.1em', width: '100%', textAlign: 'left',
                    color: theme === kt ? '#00D4FF' : '#8892A4',
                    background: theme === kt ? 'rgba(0,212,255,0.08)' : 'transparent',
                    border: 'none', borderRadius: 4, padding: '6px 10px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}
                >
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: kt === 'deep-space' ? '#00D4FF' :
                                kt === 'cosmic-aurora' ? '#9B59FF' :
                                kt === 'solar-flare' ? '#FF6B35' : '#00FF88',
                    flexShrink: 0,
                  }} />
                  {THEME_LABELS[kt]}
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#00FF88', animation: 'blink 1s infinite' }} />
        <span style={{ ...S, fontSize: 9, color: '#00FF88', letterSpacing: '0.15em' }}>SYSTEMS ONLINE</span>
      </div>
    </nav>
  )
}
