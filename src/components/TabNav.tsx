'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const S = { fontFamily: 'Space Mono, monospace' }

const TABS = [
  { label: 'DASHBOARD', href: '/dashboard', icon: '◉' },
  { label: 'SKY ABOVE ME', href: '/sky', icon: '✦' },
  { label: 'SPACE WEATHER', href: '/weather', icon: '☀' },
]

export default function TabNav() {
  const pathname = usePathname()
  const activeHref = '/' + pathname.split('/')[1]

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

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#00FF88', animation: 'blink 1s infinite' }} />
        <span style={{ ...S, fontSize: 9, color: '#00FF88', letterSpacing: '0.15em' }}>SYSTEMS ONLINE</span>
      </div>
    </nav>
  )
}
