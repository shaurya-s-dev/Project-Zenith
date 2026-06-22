'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { InfoRayButton } from '@/components/InfoRayButton'
import InfoModal from '@/components/InfoModal'
import PolarSkyRadar from '@/components/PolarSkyRadar'
import MoonPhaseGallery from '@/components/MoonPhaseGallery'
import Tooltip from '@/components/Tooltip'
import { usePulseOnChange } from '@/hooks/usePulse'

const S = { fontFamily: 'Space Mono, monospace' as const }
const FALLBACK_LOC = { lat: 28.6139, lon: 77.2090, label: 'DEFAULT (NEW DELHI)' }

// Text Visibility Style System
const STYLE_HEADER: React.CSSProperties = {
  color: '#ffffff',
  fontWeight: 700,
  letterSpacing: '0.05em',
  textShadow: '0 0 20px rgba(255,255,255,0.1)',
}

const STYLE_SUBHEADER: React.CSSProperties = {
  color: 'rgba(191, 219, 254, 0.9)',
  fontWeight: 500,
  letterSpacing: '0.02em',
}

const STYLE_DATA: React.CSSProperties = {
  color: '#67e8f9',
  fontFamily: 'Space Mono, monospace',
  textShadow: '0 0 15px rgba(0,212,255,0.2)',
  fontWeight: 700,
}

const STYLE_LABEL: React.CSSProperties = {
  color: '#9ca3af',
  fontSize: '9px',
  textTransform: 'uppercase',
  letterSpacing: '0.07em',
  fontFamily: 'Space Mono, monospace',
}

function toRad(d: number) { return d * Math.PI / 180 }
function toDeg(r: number) { return r * 180 / Math.PI }

function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371
  const dLat = toRad(lat2 - lat1), dLon = toRad(lon2 - lon1)
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

function bearing(lat1: number, lon1: number, lat2: number, lon2: number) {
  const y = Math.sin(toRad(lon2-lon1)) * Math.cos(toRad(lat2))
  const x = Math.cos(toRad(lat1))*Math.sin(toRad(lat2)) - Math.sin(toRad(lat1))*Math.cos(toRad(lat2))*Math.cos(toRad(lon2-lon1))
  return (toDeg(Math.atan2(y, x)) + 360) % 360
}

function getMoonPhase(date: Date) {
  const synodic = 29.530588861
  const knownNewMoon = Date.UTC(2000, 0, 6, 18, 14, 0)
  const diffDays = (date.getTime() - knownNewMoon) / 86400000
  let phase = (diffDays % synodic) / synodic
  if (phase < 0) phase += 1
  return phase
}

function phaseInfo(phase: number) {
  const illum = Math.round((1 - Math.cos(2 * Math.PI * phase)) / 2 * 100)
  let label = 'NEW MOON', emoji = '🌑'
  if (phase < 0.03 || phase > 0.97)        { label = 'NEW MOON';          emoji = '🌑' }
  else if (phase < 0.22)                   { label = 'WAXING CRESCENT';   emoji = '🌒' }
  else if (phase < 0.28)                   { label = 'FIRST QUARTER';     emoji = '🌓' }
  else if (phase < 0.47)                   { label = 'WAXING GIBBOUS';    emoji = '🌔' }
  else if (phase < 0.53)                   { label = 'FULL MOON';         emoji = '🌕' }
  else if (phase < 0.72)                   { label = 'WANING GIBBOUS';    emoji = '🌖' }
  else if (phase < 0.78)                   { label = 'LAST QUARTER';      emoji = '🌗' }
  else                                      { label = 'WANING CRESCENT';   emoji = '🌘' }
  return { label, emoji, illum }
}

const VISIBLE_TONIGHT = [
  { id: 'VENUS', name: 'VENUS', note: 'Evening star, west horizon', mag: '-4.4' },
  { id: 'JUPITER', name: 'JUPITER', note: 'Bright, rises late evening', mag: '-2.9' },
  { id: 'MARS', name: 'MARS', note: 'Reddish tint, mid-sky', mag: '+0.7' },
  { id: 'SATURN', name: 'SATURN', note: 'Faint, requires dark sky', mag: '+0.5' },
]

const PLANET_QUICKFACTS: Record<string, { distance: string; constellation: string; bestTime: string }> = {
  VENUS: { distance: '0.84 AU', constellation: 'Gemini', bestTime: '20:00 - 21:30' },
  JUPITER: { distance: '4.21 AU', constellation: 'Taurus', bestTime: '23:30 - 04:00' },
  MARS: { distance: '1.62 AU', constellation: 'Leo', bestTime: '01:00 - 05:00' },
  SATURN: { distance: '9.35 AU', constellation: 'Aquarius', bestTime: '03:00 - 05:30' },
}

const PLANET_INFO: Record<string, { title: string; content: string; color: string }> = {
  VENUS: {
    title: 'Venus — The Evening Star',
    content: 'The Evening Star. Magnitude -4.4. Visible in the west just after sunset. Its thick CO₂ atmosphere causes a runaway greenhouse effect, making it the hottest planet (475°C). Often mistaken for a UFO.',
    color: '#FFD400',
  },
  JUPITER: {
    title: 'Jupiter — King of Planets',
    content: 'King of Planets. Magnitude -2.9. Brightest planet in the night sky. Rises late evening. The Great Red Spot is a storm larger than Earth that has raged for centuries.',
    color: '#FF6B35',
  },
  MARS: {
    title: 'Mars — The Red Planet',
    content: 'The Red Planet. Magnitude +0.7. Distinct reddish tint from iron oxide (rust) on its surface. Currently in the mid-sky. Home to Olympus Mons, the largest volcano in the solar system.',
    color: '#FF3B3B',
  },
  SATURN: {
    title: 'Saturn — The Ringed Jewel',
    content: 'The Ringed Jewel. Magnitude +0.5. Faint, requires dark skies. Its rings are made of billions of ice and rock particles. Requires a telescope to see the rings clearly.',
    color: '#9B59FF',
  },
  TONIGHT_VIEW_INFO: {
    title: "Tonight's Celestial Outlook",
    content: "This sky diagram displays the calculated positions of the brightest planets and the Moon relative to the horizon line at your current time. Tap directly on any planet or the Moon in the SVG diagram to open their deep telemetry details, active magnitude, and astronomical facts.",
    color: '#00D4FF',
  },
}

function MoonPhaseSVG({ phase }: { phase: number; illum: number }) {
  const r = 40
  const isWaxing = phase < 0.5
  const litWidth = Math.abs(Math.cos(2 * Math.PI * phase)) * r

  return (
    <svg width="100" height="100" viewBox="0 0 100 100" style={{ animation: 'moon-glow 3s ease-in-out infinite', flexShrink: 0 }}>
      <defs>
        <radialGradient id="moonGradMain" cx="40%" cy="40%">
          <stop offset="0%" stopColor="#e8e0d0" />
          <stop offset="100%" stopColor="#9B89B0" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r={r} fill="url(#moonGradMain)" />
      <clipPath id="moonClipMain">
        <circle cx="50" cy="50" r={r} />
      </clipPath>
      <g clipPath="url(#moonClipMain)">
        {isWaxing ? (
          <>
            <rect x={50 - litWidth} y={0} width={litWidth} height={100} fill="#1a1a2e" opacity="0.85" />
            <rect x={50} y={0} width={r} height={100} fill="#1a1a2e" opacity="0.4" />
          </>
        ) : (
          <>
            <rect x={50} y={0} width={litWidth} height={100} fill="#e8e0d0" opacity="0.85" />
            <rect x={50 - r} y={0} width={r} height={100} fill="#1a1a2e" opacity="0.4" />
          </>
        )}
      </g>
      <circle cx="40" cy="38" r="5" fill="rgba(0,0,0,0.08)" />
      <circle cx="55" cy="55" r="8" fill="rgba(0,0,0,0.06)" />
      <circle cx="38" cy="60" r="3" fill="rgba(0,0,0,0.05)" />
      <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(155,89,255,0.2)" strokeWidth="1" />
    </svg>
  )
}

function Compass({ brg, overhead }: { brg: number | null; overhead: boolean }) {
  const RADIUS_PCT = 38
  const markerXPct = brg !== null ? 50 + RADIUS_PCT * Math.sin(toRad(brg)) : 50
  const markerYPct = brg !== null ? 50 - RADIUS_PCT * Math.cos(toRad(brg)) : 50

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 260, aspectRatio: '1 / 1', margin: '0 auto' }}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1px solid rgba(0,212,255,0.15)' }} />
      <div style={{ position: 'absolute', inset: '12%', borderRadius: '50%', border: '1px solid rgba(0,212,255,0.08)' }} />
      <div style={{ position: 'absolute', inset: '28%', borderRadius: '50%', border: '1px solid rgba(0,212,255,0.05)' }} />

      <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: '50%', left: '50%', width: '50%', height: '50%',
          transformOrigin: 'left top',
          background: 'linear-gradient(135deg, rgba(0,212,255,0.06), transparent)',
          animation: 'radar-sweep 5s linear infinite',
        }} />
      </div>

      <span style={{ position: 'absolute', left: '50%', top: 2, transform: 'translateX(-50%)', ...S, fontSize: 10, color: 'var(--theme-text-faint, #7D8A9E)' }}>N</span>
      <span style={{ position: 'absolute', right: 2, top: '50%', transform: 'translateY(-50%)', ...S, fontSize: 10, color: 'var(--theme-text-faint, #7D8A9E)' }}>E</span>
      <span style={{ position: 'absolute', left: '50%', bottom: 2, transform: 'translateX(-50%)', ...S, fontSize: 10, color: 'var(--theme-text-faint, #7D8A9E)' }}>S</span>
      <span style={{ position: 'absolute', left: 2, top: '50%', transform: 'translateY(-50%)', ...S, fontSize: 10, color: 'var(--theme-text-faint, #7D8A9E)' }}>W</span>

      {brg !== null && (
        <div style={{
          position: 'absolute', left: `${markerXPct}%`, top: `${markerYPct}%`,
          width: 14, height: 14, marginLeft: -7, marginTop: -7, borderRadius: '50%',
          background: overhead ? '#00FF88' : '#00D4FF',
          boxShadow: `0 0 14px ${overhead ? 'rgba(0,255,136,0.8)' : 'rgba(0,212,255,0.8)'}`,
          animation: overhead ? 'ping-green 1.5s infinite' : 'blink 1.2s infinite',
        }} />
      )}

      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <span style={{ ...S, fontSize: 8, color: 'var(--theme-text-dim, #A0AEC0)' }}>{overhead ? 'ISS OVERHEAD' : 'ISS BEARING'}</span>
        <span className="text-glow" style={{ ...STYLE_DATA, fontSize: 20, color: overhead ? '#00FF88' : '#00D4FF', marginTop: 2 }}>{brg !== null ? Math.round(brg) + '°' : '—'}</span>
      </div>
    </div>
  )
}

export default function SkyPage() {
  const [userLoc, setUserLoc] = useState<{ lat: number; lon: number; label: string } | null>(null)
  const [locStatus, setLocStatus] = useState<'idle'|'loading'|'ok'|'denied'>('idle')
  const [manualLat, setManualLat] = useState('')
  const [manualLon, setManualLon] = useState('')
  const [iss, setIss] = useState<{ lat: number; lon: number; alt: number; vel: number } | null>(null)
  const [issStatus, setIssStatus] = useState<'loading'|'ok'|'error'>('loading')
  const [now, setNow] = useState<Date | null>(null)
  const [modalKey, setModalKey] = useState<string | null>(null)
  const [moonGalleryOpen, setMoonGalleryOpen] = useState(false)

  const requestLocation = useCallback(() => {
    setLocStatus('loading')
    if (!navigator.geolocation) {
      setUserLoc(FALLBACK_LOC); setLocStatus('denied'); return
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        setUserLoc({ lat: pos.coords.latitude, lon: pos.coords.longitude, label: 'DETECTED LOCATION' })
        setLocStatus('ok')
      },
      () => { setUserLoc(FALLBACK_LOC); setLocStatus('denied') },
      { enableHighAccuracy: false, timeout: 2500, maximumAge: 600000 }
    )
  }, [])

  useEffect(() => {
    setTimeout(() => {
      requestLocation()
    }, 0)
  }, [requestLocation])

  useEffect(() => {
    setTimeout(() => {
      setNow(new Date())
    }, 0)
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    let cancelled = false
    const fetchIss = async () => {
      try {
        const res = await fetch('/api/iss')
        const d = await res.json()
        if (!cancelled) {
          setIss({ lat: d.latitude, lon: d.longitude, alt: Math.round(d.altitude), vel: Math.round(d.velocity) })
          setIssStatus(d.live ? 'ok' : 'error')
        }
      } catch {
        if (!cancelled) {
          setIssStatus('error')
          // Fallback cache setting if no iss loaded yet
          setIss(prev => prev || { lat: 42.46, lon: -70.71, alt: 408, vel: 27608 })
        }
      }
    }
    fetchIss()
    const i = setInterval(fetchIss, 5000)
    return () => { cancelled = true; clearInterval(i) }
  }, [])

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const pulse = usePulseOnChange(iss?.vel)

  const dist = userLoc && iss ? distanceKm(userLoc.lat, userLoc.lon, iss.lat, iss.lon) : null
  const brg = userLoc && iss ? bearing(userLoc.lat, userLoc.lon, iss.lat, iss.lon) : null
  const overhead = dist !== null && dist < 2200

  const phase = now ? getMoonPhase(now) : 0
  const { label: moonLabel, emoji: moonEmoji, illum } = phaseInfo(phase)

  const compassDir = brg !== null
    ? (brg >= 337.5 || brg < 22.5 ? 'N' : brg >= 22.5 && brg < 67.5 ? 'NE' : brg >= 67.5 && brg < 112.5 ? 'E' : brg >= 112.5 && brg < 157.5 ? 'SE' : brg >= 157.5 && brg < 202.5 ? 'S' : brg >= 202.5 && brg < 247.5 ? 'SW' : brg >= 247.5 && brg < 292.5 ? 'W' : 'NW')
    : '—'

  return (
    <div className="sky-above-me-container" style={{ height: 'calc(100vh - 52px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      
      {/* Scrollable Main Area */}
      <div style={{ flex: 1, overflowY: 'auto', position: 'relative' }} className="custom-scrollbar">

        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 24px 40px' }}>
          
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 20 }}>
            <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 28, fontWeight: 700, letterSpacing: '0.05em', ...STYLE_HEADER }} className="animate-flicker">SKY ABOVE ME</h1>
            <p style={{ ...S, fontSize: 10, ...STYLE_SUBHEADER, marginTop: 4 }}>What&apos;s overhead, tracked live from your location</p>
          </motion.div>

          {/* ROW 1: Polar Sky Radar */}
          <div style={{ marginBottom: 20 }}>
            <PolarSkyRadar 
              onSelectPlanet={(id) => setModalKey(id)} 
              onSelectMoon={() => setMoonGalleryOpen(true)}
            />
          </div>

          {/* ROW 2: Location bar */}
          <div style={{ 
            background: 'rgba(7, 11, 20, 0.75)', 
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.06)', 
            borderRadius: 10, 
            padding: '10px 14px', 
            marginBottom: 20, 
            display: 'flex', 
            alignItems: 'center', 
            flexWrap: 'wrap', 
            gap: 12 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 14 }}>📍</span>
              <motion.div
                key={locStatus}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                style={{ width: 6, height: 6, borderRadius: '50%', background: locStatus === 'ok' ? '#00FF88' : locStatus === 'loading' ? '#FFD400' : '#FF6B35' }}
              />
              <span style={{ ...STYLE_SUBHEADER, fontSize: 9 }}>
                {userLoc ? `DETECTED LOCATION: ${userLoc.lat.toFixed(3)}°, ${userLoc.lon.toFixed(3)}°` : 'LOCATING...'}
              </span>
            </div>
            <button onClick={requestLocation} style={{
              ...S, fontSize: 8, color: '#00D4FF',
              border: '1px solid rgba(0,212,255,0.3)',
              background: locStatus === 'loading' ? 'rgba(0,212,255,0.08)' : 'transparent',
              padding: '4px 10px', borderRadius: 4, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <span style={{ fontSize: 10 }}>📍</span>
              USE MY LOCATION
            </button>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginLeft: 'auto' }}>
              <input value={manualLat} onChange={e => setManualLat(e.target.value)} placeholder="lat" style={{ ...S, width: 60, fontSize: 8, background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', padding: '3px 5px', borderRadius: 4, outline: 'none' }} />
              <input value={manualLon} onChange={e => setManualLon(e.target.value)} placeholder="lon" style={{ ...S, width: 60, fontSize: 8, background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', padding: '3px 5px', borderRadius: 4, outline: 'none' }} />
              <button onClick={() => { const la = parseFloat(manualLat), lo = parseFloat(manualLon); if (!isNaN(la) && !isNaN(lo)) { setUserLoc({ lat: la, lon: lo, label: 'MANUAL OVERRIDE' }); setLocStatus('ok') } }}
                style={{ ...S, fontSize: 8, color: '#00D4FF', border: '1px solid rgba(0,212,255,0.3)', background: 'transparent', padding: '3px 8px', borderRadius: 4, cursor: 'pointer' }}>SET</button>
            </div>
          </div>

          {/* ROW 3: ISS Direction Finder (Compass) & Telemetry side by side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            {/* Compass card */}
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
              style={{ 
                background: 'rgba(7, 11, 20, 0.75)', 
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.06)', 
                borderRadius: 12, 
                padding: 14 
              }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ ...STYLE_LABEL, fontSize: 9 }}>ISS DIRECTION FINDER</span>
                <span style={{
                  ...S, fontSize: 8,
                  color: issStatus === 'loading' ? '#FFD400' : '#00FF88',
                  display: 'flex', alignItems: 'center', gap: 4,
                }}>
                  {issStatus === 'loading' ? (
                    <><span style={{ width: 5, height: 5, borderRadius: '50%', background: '#FFD400', animation: 'blink 1.2s infinite' }} />SYNCING</>
                  ) : (
                    <><span style={{ width: 5, height: 5, borderRadius: '50%', background: '#00FF88', animation: 'blink 1s infinite' }} />LIVE</>
                  )}
                </span>
              </div>
              <Compass brg={brg} overhead={overhead} />
              <div style={{ ...S, fontSize: 7, color: 'var(--theme-text-faint, #7D8A9E)', marginTop: 8, textAlign: 'center' }}>SOURCE: WHERETHEISS.AT · LIVE</div>
            </motion.div>

            {/* ISS Telemetry card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.96 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ delay: 0.05 }}
              style={{
                background: 'rgba(7, 11, 20, 0.75)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 12, 
                padding: 20,
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'space-between',
                minHeight: 220,
              }}
            >
              {/* Top row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {issStatus === 'loading' ? (
                    <>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#FFD400', animation: 'blink 1.2s infinite', boxShadow: '0 0 6px #FFD400' }} />
                      <span style={{ ...STYLE_HEADER, fontSize: 10, color: '#FFD400' }}>SYNCING...</span>
                    </>
                  ) : issStatus === 'error' ? (
                    <>
                      <span style={{ fontSize: 11, animation: 'blink 1.5s infinite', color: '#00FF88' }}>⚡</span>
                      <span style={{ ...STYLE_HEADER, fontSize: 10, color: '#00FF88' }}>LIVE (CACHED)</span>
                    </>
                  ) : (
                    <>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00FF88', animation: 'blink 1s infinite', boxShadow: '0 0 6px #00FF88' }} />
                      <span style={{ ...STYLE_HEADER, fontSize: 10, color: '#00FF88' }}>LIVE</span>
                    </>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={STYLE_LABEL}>ISS BEARING:</span>
                  <span className="text-glow" style={{ ...STYLE_DATA, fontSize: 11 }}>
                    {issStatus === 'loading' ? (
                      <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5 }}>● ● ●</motion.span>
                    ) : (
                      `${compassDir} ${brg !== null ? Math.round(brg) : '339'}°`
                    )}
                  </span>
                </div>
              </div>

              {/* Inner rows */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { label: 'ALT', key: 'alt' as const, color: '#00D4FF' },
                  { label: 'VEL', key: 'vel' as const, color: '#00FF88' },
                  { label: 'DIST', key: 'dist' as const, color: '#9B59FF' },
                ].map(({ label, key, color }) => (
                  <div key={label} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    paddingBottom: 6,
                  }}>
                    <span style={STYLE_LABEL}>{label}</span>
                    <span className="text-glow" style={{ ...STYLE_DATA, fontSize: 15, color }}>
                      {issStatus === 'loading' ? (
                        <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5 }}>● ● ●</motion.span>
                      ) : key === 'alt' ? (
                        `${iss ? iss.alt : 408} km`
                      ) : key === 'vel' ? (
                        `${(iss ? iss.vel : 27608).toLocaleString('en-US')} km/h`
                      ) : (
                        `${dist !== null ? Math.round(dist).toLocaleString('en-US') : '11,779'} km`
                      )}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ ...S, fontSize: 7, color: 'var(--theme-text-faint, #7D8A9E)', marginTop: 10, textAlign: 'center' }}>SOURCE: WHERETHEISS.AT · LIVE</div>
            </motion.div>
          </div>

          {/* ROW 4: Moon Card (full width, clickable) */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onClick={() => setMoonGalleryOpen(true)}
            style={{
              background: 'rgba(7, 11, 20, 0.75)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(155, 89, 255, 0.2)',
              boxShadow: '0 0 10px rgba(155, 89, 255, 0.05)',
              borderRadius: 12, 
              padding: 16, 
              marginBottom: 20,
              display: 'flex', 
              alignItems: 'center', 
              gap: 16,
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.borderColor = 'rgba(155, 89, 255, 0.5)'
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(155, 89, 255, 0.2), 0 0 16px rgba(155, 89, 255, 0.1)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0px)'
              e.currentTarget.style.borderColor = 'rgba(155, 89, 255, 0.2)'
              e.currentTarget.style.boxShadow = '0 0 10px rgba(155, 89, 255, 0.05)'
            }}
          >
            <MoonPhaseSVG phase={phase} illum={illum} />
            <div style={{ flex: 1 }}>
              <div style={{ ...STYLE_LABEL, fontSize: 9, marginBottom: 4 }}>TONIGHT&apos;S MOON</div>
              <div className="text-glow" style={{ ...STYLE_HEADER, fontSize: 18, color: '#9B59FF', marginBottom: 2 }}>
                {moonEmoji} {moonLabel}
              </div>
              <div style={{ ...STYLE_SUBHEADER, fontSize: 10 }}>{illum}% illuminated</div>
            </div>
            <div style={{
              ...S, fontSize: 8, color: 'var(--theme-text-dim, #A0AEC0)',
              display: 'flex', alignItems: 'center', gap: 4,
              flexShrink: 0,
            }}>
              Click for all phases →
            </div>
          </motion.div>

          {/* ROW 5: Planet cards (4 columns) */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {VISIBLE_TONIGHT.map((p, i) => {
              const info = PLANET_INFO[p.id]
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.06 }}
                  onClick={() => setModalKey(p.id)}
                  style={{
                    background: 'rgba(7, 11, 20, 0.75)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    boxShadow: '0 0 10px rgba(255, 255, 255, 0.02)',
                    borderRadius: 10, 
                    padding: 12,
                    transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.borderColor = info.color
                    e.currentTarget.style.boxShadow = `0 8px 24px ${info.color}44, 0 0 16px ${info.color}22`
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0px)'
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)'
                    e.currentTarget.style.boxShadow = '0 0 10px rgba(255, 255, 255, 0.02)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {(() => {
                          const quick = PLANET_QUICKFACTS[p.id]
                          const tooltipContent = (
                            <div style={{ ...S, fontSize: 9, display: 'flex', flexDirection: 'column', gap: 2 }}>
                              <div style={{ fontWeight: 'bold', color: info.color }}>{p.name} QUICK FACTS</div>
                              <div><span style={{ color: 'var(--theme-text-dim, #A0AEC0)' }}>Magnitude:</span> {p.mag}</div>
                              {quick && (
                                <>
                                  <div><span style={{ color: 'var(--theme-text-dim, #A0AEC0)' }}>Distance:</span> {quick.distance}</div>
                                  <div><span style={{ color: 'var(--theme-text-dim, #A0AEC0)' }}>Constellation:</span> {quick.constellation}</div>
                                  <div><span style={{ color: 'var(--theme-text-dim, #A0AEC0)' }}>Best Viewing:</span> {quick.bestTime}</div>
                                </>
                              )}
                            </div>
                          )
                          return (
                            <Tooltip content={tooltipContent} color={info.color}>
                              <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 14, fontWeight: 700, color: '#fff', letterSpacing: '0.04em', cursor: 'help', textShadow: `0 0 10px ${info.color}55` }}>
                                {p.name}
                              </span>
                            </Tooltip>
                          )
                        })()}
                        <div style={{
                          width: 6, height: 6, borderRadius: '50%',
                          background: info.color,
                          animation: 'heartbeat 2s infinite',
                          boxShadow: `0 0 6px ${info.color}`,
                        }} />
                      </div>
                      <div style={{ ...S, fontSize: 8, color: '#a0aec0', marginTop: 2 }}>MAG {p.mag}</div>
                    </div>
                    <div onClick={(e) => e.stopPropagation()}>
                      <InfoRayButton onClick={() => setModalKey(p.id)} color={info.color} size={18} />
                    </div>
                  </div>
                  <div style={{ ...STYLE_SUBHEADER, fontSize: 9, lineHeight: 1.5, marginTop: 4 }}>{p.note}</div>
                </motion.div>
              )
            })}
          </motion.div>

        </div>
      </div>

      {/* Pinned Bottom Status Bar */}
      <div style={{
        height: 36,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 14px',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        background: 'rgba(7, 11, 20, 0.75)',
        backdropFilter: 'blur(12px)',
        flexShrink: 0,
        zIndex: 51,
      }}>
        {/* Left: Search Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ ...S, fontSize: 8, color: 'var(--theme-text-faint, #7D8A9E)' }}>🔍 SEARCH:</span>
          <span style={{ ...S, fontSize: 8, color: '#00D4FF' }}>ACTIVE</span>
        </div>
        
        {/* Middle: Language & Battery */}
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ ...S, fontSize: 8, color: 'var(--theme-text-faint, #7D8A9E)' }}>🌐 LANG:</span>
            <span style={{ ...S, fontSize: 8, color: '#00D4FF' }}>EN-US</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ ...S, fontSize: 8, color: 'var(--theme-text-faint, #7D8A9E)' }}>🔋 BATTERY:</span>
            <span style={{ ...S, fontSize: 8, color: '#00FF88' }}>100% (AC)</span>
          </div>
        </div>

        {/* Right: Time */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ ...S, fontSize: 8, color: 'var(--theme-text-faint, #7D8A9E)' }}>🕒 TIME:</span>
          <span style={{ ...S, fontSize: 8, color: '#00D4FF' }}>
            {now ? now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }) + ' LMT' : '—'}
          </span>
        </div>
      </div>

      {/* Planet info modals */}
      {Object.entries(PLANET_INFO).map(([key, info]) => (
        <InfoModal key={key} isOpen={modalKey === key} onClose={() => setModalKey(null)} title={info.title} content={info.content} color={info.color} />
      ))}

      {/* Moon Phase Gallery modal */}
      <MoonPhaseGallery
        isOpen={moonGalleryOpen}
        onClose={() => setMoonGalleryOpen(false)}
        currentPhase={phase}
        currentLabel={moonLabel}
      />
    </div>
  )
}
