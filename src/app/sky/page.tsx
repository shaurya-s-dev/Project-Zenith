'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { InfoRayButton } from '@/components/InfoRayButton'
import InfoModal from '@/components/InfoModal'

const S = { fontFamily: 'Space Mono, monospace' }
const FALLBACK_LOC = { lat: 28.6139, lon: 77.2090, label: 'DEFAULT (NEW DELHI)' }

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

const PLANET_INFO: Record<string, { title: string; content: string; color: string }> = {
  VENUS: {
    title: 'Venus — The Evening Star',
    content: 'Currently at magnitude -4.4. Visible in the west just after sunset. Its thick atmosphere of CO₂ with sulfuric acid clouds creates a runaway greenhouse effect, making it the hottest planet in the solar system at 462°C.',
    color: '#FFD400',
  },
  JUPITER: {
    title: 'Jupiter — King of Planets',
    content: 'The largest planet in our solar system. Bright and rises late evening. Its Great Red Spot is a storm larger than Earth that has raged for at least 400 years. Jupiter has 95 known moons.',
    color: '#FF6B35',
  },
  MARS: {
    title: 'Mars — The Red Planet',
    content: 'Has a reddish tint from iron oxide (rust) on its surface. Currently in the mid-sky. Mars has the tallest mountain in the solar system (Olympus Mons, 21.9 km) and the longest canyon (Valles Marineris, 4000 km).',
    color: '#FF3B3B',
  },
  SATURN: {
    title: 'Saturn — The Ringed Planet',
    content: 'Faint, requires a dark sky and telescope to see its rings clearly. Saturn\'s ring system spans 282,000 km but is only about 10 meters thick. It has 146 known moons, including Titan which has a thick atmosphere.',
    color: '#9B59FF',
  },
}

// SVG Moon visualization
function MoonPhaseSVG({ phase, illum }: { phase: number; illum: number }) {
  const r = 40
  const isWaxing = phase < 0.5
  const litWidth = Math.abs(Math.cos(2 * Math.PI * phase)) * r

  return (
    <svg width="100" height="100" viewBox="0 0 100 100" style={{ animation: 'moon-glow 3s ease-in-out infinite' }}>
      <defs>
        <radialGradient id="moonGrad" cx="40%" cy="40%">
          <stop offset="0%" stopColor="#e8e0d0" />
          <stop offset="100%" stopColor="#9B89B0" />
        </radialGradient>
      </defs>
      {/* Moon body */}
      <circle cx="50" cy="50" r={r} fill="url(#moonGrad)" />
      {/* Shadow */}
      <clipPath id="moonClip">
        <circle cx="50" cy="50" r={r} />
      </clipPath>
      <g clipPath="url(#moonClip)">
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
      {/* Craters */}
      <circle cx="40" cy="38" r="5" fill="rgba(0,0,0,0.08)" />
      <circle cx="55" cy="55" r="8" fill="rgba(0,0,0,0.06)" />
      <circle cx="38" cy="60" r="3" fill="rgba(0,0,0,0.05)" />
      {/* Outer ring */}
      <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(155,89,255,0.2)" strokeWidth="1" />
    </svg>
  )
}

// Compass with radar sweep
function Compass({ brg, overhead }: { brg: number | null; overhead: boolean }) {
  const RADIUS_PCT = 38
  const markerXPct = brg !== null ? 50 + RADIUS_PCT * Math.sin(toRad(brg)) : 50
  const markerYPct = brg !== null ? 50 - RADIUS_PCT * Math.cos(toRad(brg)) : 50

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 260, aspectRatio: '1 / 1', margin: '0 auto' }}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1px solid rgba(0,212,255,0.15)' }} />
      <div style={{ position: 'absolute', inset: '12%', borderRadius: '50%', border: '1px solid rgba(0,212,255,0.08)' }} />
      <div style={{ position: 'absolute', inset: '28%', borderRadius: '50%', border: '1px solid rgba(0,212,255,0.05)' }} />

      {/* Radar sweep */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '50%', left: '50%', width: '50%', height: '50%',
          transformOrigin: 'left top',
          background: 'linear-gradient(135deg, rgba(0,212,255,0.06), transparent)',
          animation: 'radar-sweep 5s linear infinite',
        }} />
      </div>

      {/* Compass labels */}
      <span style={{ position: 'absolute', left: '50%', top: 2, transform: 'translateX(-50%)', ...S, fontSize: 10, color: '#4A5568' }}>N</span>
      <span style={{ position: 'absolute', right: 2, top: '50%', transform: 'translateY(-50%)', ...S, fontSize: 10, color: '#4A5568' }}>E</span>
      <span style={{ position: 'absolute', left: '50%', bottom: 2, transform: 'translateX(-50%)', ...S, fontSize: 10, color: '#4A5568' }}>S</span>
      <span style={{ position: 'absolute', left: 2, top: '50%', transform: 'translateY(-50%)', ...S, fontSize: 10, color: '#4A5568' }}>W</span>

      {/* ISS bearing marker */}
      {brg !== null && (
        <div style={{
          position: 'absolute', left: `${markerXPct}%`, top: `${markerYPct}%`,
          width: 14, height: 14, marginLeft: -7, marginTop: -7, borderRadius: '50%',
          background: overhead ? '#00FF88' : '#00D4FF',
          boxShadow: `0 0 14px ${overhead ? 'rgba(0,255,136,0.8)' : 'rgba(0,212,255,0.8)'}`,
          animation: overhead ? 'ping-green 1.5s infinite' : 'blink 1.2s infinite',
        }} />
      )}

      {/* Center text */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <span style={{ ...S, fontSize: 8, color: '#8892A4' }}>{overhead ? 'ISS OVERHEAD' : 'ISS BEARING'}</span>
        <span style={{ ...S, fontSize: 20, color: overhead ? '#00FF88' : '#00D4FF', marginTop: 2 }}>{brg !== null ? Math.round(brg) + '°' : '—'}</span>
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
      { timeout: 8000 }
    )
  }, [])

  useEffect(() => { requestLocation() }, [requestLocation])

  useEffect(() => {
    setNow(new Date())
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
        if (!cancelled) setIssStatus('error')
      }
    }
    fetchIss()
    const i = setInterval(fetchIss, 5000)
    return () => { cancelled = true; clearInterval(i) }
  }, [])

  const dist = userLoc && iss ? distanceKm(userLoc.lat, userLoc.lon, iss.lat, iss.lon) : null
  const brg = userLoc && iss ? bearing(userLoc.lat, userLoc.lon, iss.lat, iss.lon) : null
  const overhead = dist !== null && dist < 2200

  const phase = now ? getMoonPhase(now) : 0
  const { label: moonLabel, illum } = phaseInfo(phase)

  return (
    <div style={{ minHeight: 'calc(100vh - 52px)', color: '#fff' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 24px 80px' }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 20 }}>
          <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 28, fontWeight: 700, letterSpacing: '0.05em' }} className="animate-flicker">SKY ABOVE ME</h1>
          <p style={{ ...S, fontSize: 10, color: '#8892A4', marginTop: 4 }}>What&apos;s overhead, tracked live from your location</p>
        </motion.div>

        {/* Location bar */}
        <div className="animate-card-glow" style={{ background: 'rgba(10,10,15,0.8)', border: '1px solid rgba(0,212,255,0.1)', borderRadius: 10, padding: 12, marginBottom: 20, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <motion.div
              key={locStatus}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              style={{ width: 6, height: 6, borderRadius: '50%', background: locStatus === 'ok' ? '#00FF88' : locStatus === 'loading' ? '#FFD400' : '#FF6B35' }}
            />
            <span style={{ ...S, fontSize: 9, color: '#8892A4' }}>
              {userLoc ? `${userLoc.label} · ${userLoc.lat.toFixed(3)}°, ${userLoc.lon.toFixed(3)}°` : 'LOCATING...'}
            </span>
          </div>
          <button onClick={requestLocation} style={{ ...S, fontSize: 8, color: '#00D4FF', border: '1px solid rgba(0,212,255,0.3)', background: 'transparent', padding: '4px 8px', borderRadius: 4, cursor: 'pointer' }}>
            USE MY LOCATION
          </button>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginLeft: 'auto' }}>
            <input value={manualLat} onChange={e => setManualLat(e.target.value)} placeholder="lat" style={{ ...S, width: 60, fontSize: 8, background: '#111118', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '3px 5px', borderRadius: 4 }} />
            <input value={manualLon} onChange={e => setManualLon(e.target.value)} placeholder="lon" style={{ ...S, width: 60, fontSize: 8, background: '#111118', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '3px 5px', borderRadius: 4 }} />
            <button onClick={() => { const la = parseFloat(manualLat), lo = parseFloat(manualLon); if (!isNaN(la) && !isNaN(lo)) { setUserLoc({ lat: la, lon: lo, label: 'MANUAL OVERRIDE' }); setLocStatus('ok') } }}
              style={{ ...S, fontSize: 8, color: '#8892A4', border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', padding: '3px 8px', borderRadius: 4, cursor: 'pointer' }}>SET</button>
          </div>
        </div>

        {/* Main grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 24 }}>
          {/* Compass card */}
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
            className="animate-card-glow"
            style={{ background: 'rgba(10,10,15,0.8)', border: '1px solid rgba(0,212,255,0.1)', borderRadius: 12, padding: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ ...S, fontSize: 9, color: '#8892A4', letterSpacing: '0.25em' }}>ISS DIRECTION FINDER</span>
              <span style={{ ...S, fontSize: 8, color: issStatus === 'ok' ? '#00FF88' : issStatus === 'loading' ? '#FFD400' : '#FF6B35' }}>
                {issStatus === 'ok' ? 'LIVE' : issStatus === 'loading' ? 'SYNCING' : 'SIGNAL LOST'}
              </span>
            </div>
            <Compass brg={brg} overhead={overhead} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 12 }}>
              {[['ALTITUDE', iss ? iss.alt + ' km' : '—'],['VELOCITY', iss ? iss.vel.toLocaleString() + ' km/h' : '—']].map(([l,v]) => (
                <div key={l} style={{ background: '#111118', borderRadius: 6, padding: 6 }}>
                  <div style={{ ...S, fontSize: 7, color: '#4A5568' }}>{l}</div>
                  <div style={{ ...S, fontSize: 11, color: '#00D4FF' }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ ...S, fontSize: 7, color: '#4A5568', marginTop: 8, textAlign: 'center' }}>SOURCE: WHERETHEISS.AT · LIVE</div>
          </motion.div>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Moon card */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="animate-card-glow"
              style={{ background: 'rgba(10,10,15,0.8)', border: '1px solid rgba(155,89,255,0.15)', borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
              <MoonPhaseSVG phase={phase} illum={illum} />
              <div style={{ flex: 1 }}>
                <div style={{ ...S, fontSize: 9, color: '#8892A4', letterSpacing: '0.2em', marginBottom: 4 }}>TONIGHT&apos;S MOON</div>
                <div style={{ ...S, fontSize: 16, color: '#9B59FF', marginBottom: 2 }}>{moonLabel}</div>
                <div style={{ ...S, fontSize: 10, color: '#4A5568' }}>{illum}% illuminated</div>
              </div>
            </motion.div>

            {/* Planet cards */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {VISIBLE_TONIGHT.map((p, i) => {
                const info = PLANET_INFO[p.id]
                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.06 }}
                    className="animate-card-glow"
                    whileHover={{ scale: 1.02 }}
                    style={{
                      background: 'rgba(10,10,15,0.85)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: 10, padding: 12,
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      perspective: '800px',
                      cursor: 'default',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'perspective(800px) rotateY(5deg) scale(1.02)'
                      e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.4)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'perspective(800px) rotateY(0deg) scale(1)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 14, fontWeight: 700, color: '#fff', letterSpacing: '0.04em' }}>
                            {p.name}
                          </span>
                          {/* Pulsating ring */}
                          <div style={{
                            width: 6, height: 6, borderRadius: '50%',
                            background: info.color,
                            animation: 'heartbeat 2s infinite',
                            boxShadow: `0 0 6px ${info.color}`,
                          }} />
                        </div>
                        <div style={{ ...S, fontSize: 8, color: '#4A5568', marginTop: 2 }}>mag {p.mag}</div>
                      </div>
                      <InfoRayButton onClick={() => setModalKey(p.id)} color={info.color} size={18} />
                    </div>
                    <div style={{ ...S, fontSize: 9, color: '#8892A4', lineHeight: 1.5, marginTop: 2 }}>{p.note}</div>
                  </motion.div>
                )
              })}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Info modals */}
      {Object.entries(PLANET_INFO).map(([key, info]) => (
        <InfoModal key={key} isOpen={modalKey === key} onClose={() => setModalKey(null)} title={info.title} content={info.content} color={info.color} />
      ))}
    </div>
  )
}
