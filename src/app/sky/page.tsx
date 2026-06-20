'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

const NAV = [['MISSION CONTROL','/dashboard'],['SKY ABOVE ME','/sky'],['SPACE WEATHER','/weather'],['SKYLENS AI','/skylens']]
const S = { fontFamily: 'Space Mono, monospace' }

// Default fallback location if geolocation is denied/unavailable
const FALLBACK_LOC = { lat: 28.6139, lon: 77.2090, label: 'DEFAULT (NEW DELHI)' }

function toRad(d: number) { return d * Math.PI / 180 }
function toDeg(r: number) { return r * 180 / Math.PI }

// Haversine great-circle distance in km
function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

// Initial compass bearing from point A to point B, 0-360, 0=North
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
  { name: 'VENUS', note: 'Evening star, west horizon' },
  { name: 'JUPITER', note: 'Bright, rises late evening' },
  { name: 'MARS', note: 'Reddish tint, mid-sky' },
  { name: 'SATURN', note: 'Faint, requires dark sky' },
]

export default function SkyPage() {
  const [userLoc, setUserLoc] = useState<{ lat: number; lon: number; label: string } | null>(null)
  const [locStatus, setLocStatus] = useState<'idle'|'loading'|'ok'|'denied'>('idle')
  const [manualLat, setManualLat] = useState('')
  const [manualLon, setManualLon] = useState('')

  const [iss, setIss] = useState<{ lat: number; lon: number; alt: number; vel: number } | null>(null)
  const [issStatus, setIssStatus] = useState<'loading'|'ok'|'error'>('loading')
  const [now, setNow] = useState<Date | null>(null)

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
  const { label: moonLabel, emoji: moonEmoji, illum } = phaseInfo(phase)

  // Percentage-based so the circle scales with the card instead of overflowing it
  const RADIUS_PCT = 40
  const markerXPct = brg !== null ? 50 + RADIUS_PCT * Math.sin(toRad(brg)) : 50
  const markerYPct = brg !== null ? 50 - RADIUS_PCT * Math.cos(toRad(brg)) : 50

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff' }}>

      {/* Navbar */}
      <nav style={{ height: 56, background: 'rgba(0,0,0,0.9)', borderBottom: '1px solid rgba(0,212,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00D4FF', animation: 'pulse-cyan 2s infinite' }} />
          <span style={{ ...S, color: '#00D4FF', letterSpacing: '0.3em', fontSize: 14, fontWeight: 700 }}>ZENITH</span>
        </div>
        <div style={{ display: 'flex', gap: 32 }}>
          {NAV.map(([label, href]) => (
            <Link key={label} href={href} style={{ ...S, fontSize: 10, letterSpacing: '0.2em', color: href === '/sky' ? '#00D4FF' : '#8892A4', textDecoration: 'none' }}>{label}</Link>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00FF88', animation: 'blink 1s infinite' }} />
          <span style={{ ...S, fontSize: 10, color: '#00FF88', letterSpacing: '0.15em' }}>LIVE</span>
          <span style={{ ...S, fontSize: 11, color: '#8892A4' }}>{now ? now.toUTCString().split(' ')[4] + ' UTC' : '--:--:--'}</span>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px 80px' }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 32, fontWeight: 700, letterSpacing: '0.05em' }}>SKY ABOVE ME</h1>
          <p style={{ ...S, fontSize: 11, color: '#8892A4', marginTop: 6 }}>What&apos;s overhead, tracked live from your location</p>
        </motion.div>

        {/* Location bar */}
        <div style={{ background: 'rgba(10,10,15,0.8)', border: '1px solid rgba(0,212,255,0.1)', borderRadius: 10, padding: 14, marginBottom: 24, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: locStatus === 'ok' ? '#00FF88' : locStatus === 'loading' ? '#FFD400' : '#FF6B35' }} />
            <span style={{ ...S, fontSize: 9, color: '#8892A4' }}>
              {userLoc ? `${userLoc.label} · ${userLoc.lat.toFixed(3)}°, ${userLoc.lon.toFixed(3)}°` : 'LOCATING...'}
            </span>
          </div>
          <button onClick={requestLocation} style={{ ...S, fontSize: 9, color: '#00D4FF', border: '1px solid rgba(0,212,255,0.3)', background: 'transparent', padding: '4px 10px', borderRadius: 4, cursor: 'pointer' }}>
            USE MY LOCATION
          </button>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginLeft: 'auto' }}>
            <input value={manualLat} onChange={e => setManualLat(e.target.value)} placeholder="lat" style={{ ...S, width: 70, fontSize: 9, background: '#111118', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '4px 6px', borderRadius: 4 }} />
            <input value={manualLon} onChange={e => setManualLon(e.target.value)} placeholder="lon" style={{ ...S, width: 70, fontSize: 9, background: '#111118', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '4px 6px', borderRadius: 4 }} />
            <button
              onClick={() => {
                const la = parseFloat(manualLat), lo = parseFloat(manualLon)
                if (!isNaN(la) && !isNaN(lo)) { setUserLoc({ lat: la, lon: lo, label: 'MANUAL OVERRIDE' }); setLocStatus('ok') }
              }}
              style={{ ...S, fontSize: 9, color: '#8892A4', border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', padding: '4px 10px', borderRadius: 4, cursor: 'pointer' }}
            >SET</button>
          </div>
        </div>

        {/* Main grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24 }}>

          {/* Compass / ISS tracker */}
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} style={{ background: 'rgba(10,10,15,0.8)', border: '1px solid rgba(0,212,255,0.1)', borderRadius: 12, padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ ...S, fontSize: 9, color: '#8892A4', letterSpacing: '0.25em' }}>ISS DIRECTION FINDER</span>
              <span style={{ ...S, fontSize: 8, color: issStatus === 'ok' ? '#00FF88' : issStatus === 'loading' ? '#FFD400' : '#FF6B35' }}>
                {issStatus === 'ok' ? 'LIVE' : issStatus === 'loading' ? 'SYNCING' : 'SIGNAL LOST'}
              </span>
            </div>

           <div style={{ position: 'relative', width: '100%', maxWidth: 280, aspectRatio: '1 / 1', margin: '0 auto' }}>
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1px solid rgba(0,212,255,0.15)' }} />
              <div style={{ position: 'absolute', inset: '12%', borderRadius: '50%', border: '1px solid rgba(0,212,255,0.08)' }} />
              <div style={{ position: 'absolute', inset: '28%', borderRadius: '50%', border: '1px solid rgba(0,212,255,0.06)' }} />
              <span style={{ position: 'absolute', left: '50%', top: 4, transform: 'translateX(-50%)', ...S, fontSize: 11, color: '#4A5568' }}>N</span>
              <span style={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)', ...S, fontSize: 11, color: '#4A5568' }}>E</span>
              <span style={{ position: 'absolute', left: '50%', bottom: 4, transform: 'translateX(-50%)', ...S, fontSize: 11, color: '#4A5568' }}>S</span>
              <span style={{ position: 'absolute', left: 4, top: '50%', transform: 'translateY(-50%)', ...S, fontSize: 11, color: '#4A5568' }}>W</span>
              {brg !== null && (
                <div style={{ position: 'absolute', left: `${markerXPct}%`, top: `${markerYPct}%`, width: 14, height: 14, marginLeft: -7, marginTop: -7, borderRadius: '50%', background: overhead ? '#00FF88' : '#00D4FF', boxShadow: `0 0 14px ${overhead ? 'rgba(0,255,136,0.8)' : 'rgba(0,212,255,0.8)'}`, animation: 'blink 1.2s infinite' }} />
              )}
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                <span style={{ ...S, fontSize: 9, color: '#8892A4' }}>{overhead ? 'ISS OVERHEAD' : 'ISS BEARING'}</span>
                <span style={{ ...S, fontSize: 22, color: overhead ? '#00FF88' : '#00D4FF', marginTop: 4 }}>{brg !== null ? Math.round(brg) + '°' : '—'}</span>
                <span style={{ ...S, fontSize: 9, color: '#4A5568', marginTop: 4 }}>{dist !== null ? Math.round(dist).toLocaleString() + ' km away' : ''}</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 16 }}>
              {[['ALTITUDE', iss ? iss.alt + ' km' : '—'],['VELOCITY', iss ? iss.vel.toLocaleString() + ' km/h' : '—']].map(([l,v]) => (
                <div key={l} style={{ background: '#111118', borderRadius: 6, padding: 8 }}>
                  <div style={{ ...S, fontSize: 8, color: '#4A5568' }}>{l}</div>
                  <div style={{ ...S, fontSize: 12, color: '#00D4FF' }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ ...S, fontSize: 8, color: '#4A5568', marginTop: 10, textAlign: 'center' }}>SOURCE: WHERETHEISS.AT · LIVE TELEMETRY</div>
          </motion.div>

          {/* Right column: moon + planets */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              style={{ background: 'rgba(10,10,15,0.8)', border: '1px solid rgba(155,89,255,0.15)', borderRadius: 12, padding: 18, display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ fontSize: 48 }}>{moonEmoji}</div>
              <div>
                <div style={{ ...S, fontSize: 9, color: '#8892A4', letterSpacing: '0.2em', marginBottom: 4 }}>TONIGHT&apos;S MOON</div>
                <div style={{ ...S, fontSize: 16, color: '#9B59FF', marginBottom: 4 }}>{moonLabel}</div>
                <div style={{ ...S, fontSize: 10, color: '#4A5568' }}>{illum}% illuminated</div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              style={{ background: 'rgba(10,10,15,0.8)', border: '1px solid rgba(0,212,255,0.1)', borderRadius: 12, padding: 18, flex: 1 }}>
              <div style={{ ...S, fontSize: 9, color: '#8892A4', letterSpacing: '0.2em', marginBottom: 14 }}>VISIBLE TONIGHT (TYPICAL)</div>
              {VISIBLE_TONIGHT.map(p => (
                <div key={p.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ ...S, fontSize: 11, color: '#fff' }}>{p.name}</span>
                  <span style={{ ...S, fontSize: 9, color: '#4A5568' }}>{p.note}</span>
                </div>
              ))}
              <div style={{ ...S, fontSize: 8, color: '#4A5568', marginTop: 12 }}>Estimated seasonal visibility — not real-time ephemeris</div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}