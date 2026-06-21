'use client'

import { motion, AnimatePresence } from 'framer-motion'

const S = { fontFamily: 'Space Mono, monospace' as const }

interface PhaseConfig { label: string; desc: string; fact: string }

const ALL_PHASES: PhaseConfig[] = [
  { label: 'NEW MOON', desc: 'Darkest night. Best for deep-sky stargazing.', fact: 'Darkest night. Best for deep-sky stargazing. The Moon is between Earth and Sun.' },
  { label: 'WAXING CRESCENT', desc: 'The Moon grows. Great for evening viewing.', fact: 'The Moon grows. Great for evening viewing. Visible in the western sky after sunset.' },
  { label: 'FIRST QUARTER', desc: 'Half lit. Visible until midnight.', fact: 'Half lit. Visible until midnight. The Moon has completed one quarter of its orbit.' },
  { label: 'WAXING GIBBOUS', desc: 'Almost full. Bright and prominent.', fact: 'Almost full. Bright and prominent. Rises in the afternoon, sets after midnight.' },
  { label: 'FULL MOON', desc: 'Fully illuminated. Tides are highest.', fact: 'Fully illuminated. Tides are highest. The Moon is opposite the Sun in the sky.' },
  { label: 'WANING GIBBOUS', desc: 'Slowly fading. Rises late at night.', fact: 'Slowly fading. Rises late at night. Sets in the morning sky.' },
  { label: 'LAST QUARTER', desc: 'Half dark. Visible in the morning sky.', fact: 'Half dark. Visible in the morning sky. The Moon is three-quarters through its orbit.' },
  { label: 'WANING CRESCENT', desc: 'Last glimpse before the new moon.', fact: 'Last glimpse before the new moon. Visible just before sunrise.' },
]

function MoonPhaseCircle({ phase, label, isCurrent }: { phase: number; label: string; isCurrent: boolean }) {
  const r = 32
  const isWaxing = phase < 0.5
  const litWidth = Math.abs(Math.cos(2 * Math.PI * phase)) * r
  const size = isCurrent ? 90 : 80

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0,
      padding: 10, borderRadius: 12,
      background: isCurrent ? 'rgba(0,212,255,0.06)' : 'transparent',
      border: isCurrent ? '2px solid rgba(0,212,255,0.4)' : '2px solid transparent',
      boxShadow: isCurrent ? '0 0 20px rgba(0,212,255,0.1)' : 'none',
      position: 'relative',
      transition: 'all 0.2s',
    }}>
      {isCurrent && (
        <div style={{
          position: 'absolute', top: 2, right: 2,
          ...S, fontSize: 7, color: '#00D4FF',
          background: 'rgba(0,212,255,0.15)',
          padding: '1px 6px', borderRadius: 4,
          letterSpacing: '0.1em',
        }}>
          ● CURRENT
        </div>
      )}
      <svg width={size} height={size} viewBox="0 0 80 80">
        <defs>
          <radialGradient id={`moonGrad-${label.replace(/\s/g, '')}`} cx="40%" cy="40%">
            <stop offset="0%" stopColor="#e8e0d0" />
            <stop offset="100%" stopColor="#9B89B0" />
          </radialGradient>
        </defs>
        <circle cx="40" cy="40" r={r} fill={`url(#moonGrad-${label.replace(/\s/g, '')})`} />
        <clipPath id={`clip-${label.replace(/\s/g, '')}`}>
          <circle cx="40" cy="40" r={r} />
        </clipPath>
        <g clipPath={`url(#clip-${label.replace(/\s/g, '')})`}>
          {isWaxing ? (
            <>
              <rect x={40 - litWidth} y={0} width={litWidth} height={80} fill="#1a1a2e" opacity="0.85" />
              <rect x={40} y={0} width={r} height={80} fill="#1a1a2e" opacity="0.35" />
            </>
          ) : (
            <>
              <rect x={40} y={0} width={litWidth} height={80} fill="#e8e0d0" opacity="0.85" />
              <rect x={40 - r} y={0} width={r} height={80} fill="#1a1a2e" opacity="0.35" />
            </>
          )}
        </g>
        <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(155,89,255,0.15)" strokeWidth="1" />
      </svg>
      <span style={{ ...S, fontSize: 8, color: isCurrent ? '#00D4FF' : '#8892A4', textAlign: 'center', letterSpacing: '0.05em', maxWidth: 80 }}>
        {label}
      </span>
    </div>
  )
}

function getPhaseIndex(phase: number): number {
  if (phase < 0.03 || phase > 0.97) return 0
  if (phase < 0.22) return 1
  if (phase < 0.28) return 2
  if (phase < 0.47) return 3
  if (phase < 0.53) return 4
  if (phase < 0.72) return 5
  if (phase < 0.78) return 6
  return 7
}

interface MoonPhaseGalleryProps {
  isOpen: boolean
  onClose: () => void
  currentPhase: number
  currentLabel: string
}

export default function MoonPhaseGallery({ isOpen, onClose, currentPhase, currentLabel }: MoonPhaseGalleryProps) {
  const currentIdx = getPhaseIndex(currentPhase)

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 1000 }}
          />
          <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001, padding: 16, pointerEvents: 'none' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: 'spring', damping: 22, stiffness: 280 }}
              style={{
                width: '92%', maxWidth: 700,
                maxHeight: '85vh', overflowY: 'auto',
                background: 'rgba(6,8,18,0.96)',
                border: '1px solid rgba(0,212,255,0.15)',
                borderRadius: 16, padding: '28px 24px',
                backdropFilter: 'blur(24px)',
                boxShadow: '0 0 60px rgba(0,212,255,0.06)',
                pointerEvents: 'auto',
              }}
            >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18 }}>🌙</span>
                <span style={{ ...S, fontSize: 11, color: '#00D4FF', letterSpacing: '0.25em' }}>LUNAR PHASE GALLERY</span>
              </div>
              <button onClick={onClose} style={{ ...S, fontSize: 16, color: '#4A5568', background: 'transparent', border: 'none', cursor: 'pointer' }}>✕</button>
            </div>

            {/* Phase grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 8,
              marginBottom: 24,
            }}>
              {ALL_PHASES.map((p, i) => (
                <MoonPhaseCircle
                  key={p.label}
                  phase={i / 8}
                  label={p.label}
                  isCurrent={i === currentIdx}
                />
              ))}
            </div>

            {/* Current phase fact */}
            <div style={{
              background: 'rgba(0,212,255,0.04)',
              border: '1px solid rgba(0,212,255,0.1)',
              borderRadius: 10, padding: '14px 16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <span style={{ ...S, fontSize: 8, color: '#00D4FF', letterSpacing: '0.2em' }}>DID YOU KNOW?</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>
                  {currentLabel === 'NEW MOON' ? '🌑' :
                   currentLabel === 'WAXING CRESCENT' ? '🌒' :
                   currentLabel === 'FIRST QUARTER' ? '🌓' :
                   currentLabel === 'WAXING GIBBOUS' ? '🌔' :
                   currentLabel === 'FULL MOON' ? '🌕' :
                   currentLabel === 'WANING GIBBOUS' ? '🌖' :
                   currentLabel === 'LAST QUARTER' ? '🌗' : '🌘'}
                </span>
                <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 13, color: '#ccc', lineHeight: 1.6, margin: 0 }}>
                  <strong style={{ color: '#fff' }}>{currentLabel}</strong>: {ALL_PHASES[currentIdx]?.fact}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </>
    )}
  </AnimatePresence>
  )
}
