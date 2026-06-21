'use client'

import { useEffect, useState } from 'react'

const S = { fontFamily: 'Space Mono, monospace' as const }

interface ShortcutCallbacks {
  onTogglePause: () => void
  onResetCamera: () => void
  onToggleFullscreen: () => void
  onToggleSkylens: () => void
  onTheme: (idx: number) => void
}

export default function KeyboardShortcuts(cb: ShortcutCallbacks) {
  const [showTooltip, setShowTooltip] = useState(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return

      switch (e.code) {
        case 'Space':
          e.preventDefault()
          cb.onTogglePause()
          break
        case 'KeyR':
          cb.onResetCamera()
          break
        case 'KeyF':
          cb.onToggleFullscreen()
          break
        case 'KeyM':
          cb.onToggleSkylens()
          break
        case 'Digit1': cb.onTheme(0); break
        case 'Digit2': cb.onTheme(1); break
        case 'Digit3': cb.onTheme(2); break
        case 'Digit4': cb.onTheme(3); break
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [cb])

  return (
    <div
      style={{
        position: 'fixed', bottom: 48, right: 16, zIndex: 999,
      }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div style={{
        ...S, fontSize: 8, color: '#4A5568', letterSpacing: '0.1em',
        background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 6, padding: '4px 8px', cursor: 'default',
        backdropFilter: 'blur(8px)',
      }}>
        ⌨️
      </div>
      {showTooltip && (
        <div style={{
          position: 'absolute', bottom: '100%', right: 0, marginBottom: 6,
          background: 'rgba(0,0,0,0.88)', border: '1px solid rgba(0,212,255,0.15)',
          borderRadius: 8, padding: '8px 12px', minWidth: 200,
          backdropFilter: 'blur(12px)',
        }}>
          <div style={{ ...S, fontSize: 8, color: '#00D4FF', letterSpacing: '0.2em', marginBottom: 6 }}>KEYBOARD SHORTCUTS</div>
          {[
            ['Space', 'Pause / Resume'],
            ['R', 'Reset camera'],
            ['F', 'Fullscreen'],
            ['M', 'Toggle SkyLens'],
            ['1-4', 'Switch theme'],
          ].map(([key, desc]) => (
            <div key={key} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 3 }}>
              <span style={{ ...S, fontSize: 8, color: '#FFD400' }}>{key}</span>
              <span style={{ ...S, fontSize: 8, color: '#8892A4' }}>{desc}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
