'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Globe from '@/components/Globe'
import { InfoRayButton } from '@/components/InfoRayButton'
import SkyLensModal from '@/components/SkyLensModal'
import type { Constellation } from '@/components/constellations-data'

const SAT_DATA = [
  { id: 'ISS', name: 'ISS (ZARYA)', type: 'ISS', lat: 42.46, lon: -70.71, alt: 408, speed: 27600 },
  { id: 'SL1', name: 'STARLINK-3112', type: 'SAT', lat: -12.65, lon: 131.02, alt: 550, speed: 27000 },
  { id: 'SL2', name: 'STARLINK-3445', type: 'SAT', lat: 23.11, lon: -45.33, alt: 550, speed: 27000 },
  { id: 'HST', name: 'HUBBLE (HST)', type: 'SAT', lat: 28.03, lon: -80.90, alt: 547, speed: 27300 },
  { id: 'TG', name: 'TIANGONG', type: 'SAT', lat: 33.94, lon: -118.12, alt: 390, speed: 27600 },
  { id: 'GPS1', name: 'GPS IIF-3', type: 'SAT', lat: 55.22, lon: 44.11, alt: 20200, speed: 14000 },
  { id: 'DB1', name: 'DEBRIS-2022-041', type: 'DEBRIS', lat: -33.0, lon: 150.0, alt: 380, speed: 27800 },
  { id: 'SL3', name: 'STARLINK-4001', type: 'SAT', lat: 51.5, lon: -0.12, alt: 550, speed: 27000 },
  { id: 'SL4', name: 'STARLINK-4200', type: 'SAT', lat: -23.5, lon: -46.6, alt: 550, speed: 27000 },
  { id: 'DB2', name: 'DEBRIS-2019-006', type: 'DEBRIS', lat: 40.7, lon: -74.0, alt: 420, speed: 27700 },
  { id: 'LN1', name: 'LANDSAT-9', type: 'SAT', lat: 38.9, lon: -77.0, alt: 705, speed: 26600 },
  { id: 'WS1', name: 'WORLDVIEW-3', type: 'SAT', lat: 1.3, lon: 103.8, alt: 617, speed: 26800 },
]

const PASSES = [
  { sat: 'ISS', seconds: 1394, elevation: '72°', direction: 'NW→SE' },
  { sat: 'STARLINK', seconds: 2702, elevation: '45°', direction: 'N→S' },
  { sat: 'HUBBLE', seconds: 4353, elevation: '31°', direction: 'SW→NE' },
  { sat: 'TIANGONG', seconds: 7511, elevation: '58°', direction: 'W→E' },
]

const WEATHER = [
  { label: 'KP INDEX', value: '2.4', pct: 24, color: '#00FF88' },
  { label: 'SOLAR WIND', value: '420 KM/S', pct: 42, color: '#00D4FF' },
  { label: 'X-RAY FLUX', value: 'B2.1', pct: 20, color: '#9B59FF' },
]

const ZENITH_OBJECTS = [
  { name: 'VENUS', mag: '-4.5' },
  { name: 'JUPITER', mag: '-2.9' },
  { name: 'MARS', mag: '+0.7' },
  { name: 'SIRIUS', mag: '-1.5' },
]

const RISE_SET = [
  { body: 'SUN', rise: '06:14', set: '19:47' },
  { body: 'MOON', rise: '21:32', set: '08:19' },
  { body: 'ISS', rise: '22:14', set: '22:21' },
]

function fmt(s: number) {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60
  return `+${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

// Part 6: format time offset label
function fmtOffset(hours: number) {
  if (hours === 0) return 'NOW'
  const abs = Math.abs(hours)
  const h = Math.floor(abs)
  const m = Math.round((abs - h) * 60)
  const sign = hours < 0 ? '-' : '+'
  return `${sign}${h}h${m > 0 ? m + 'm' : ''}`
}

function getSimulatedTime(offsetHours: number): string {
  const d = new Date()
  d.setTime(d.getTime() + offsetHours * 3600 * 1000)
  return d.toUTCString().split(' ')[4] + ' UTC'
}

const badge = (t: string) => ({
  ISS: { bg: 'rgba(0,255,136,0.1)', color: '#00FF88', border: '1px solid rgba(0,255,136,0.3)' },
  SAT: { bg: 'rgba(0,212,255,0.1)', color: '#00D4FF', border: '1px solid rgba(0,212,255,0.3)' },
  DEBRIS: { bg: 'rgba(255,107,53,0.1)', color: '#FF6B35', border: '1px solid rgba(255,107,53,0.3)' },
}[t] || {})

const NAV = [['MISSION CONTROL', '/dashboard'], ['SKY ABOVE ME', '/sky'], ['SPACE WEATHER', '/weather'], ['SKYLENS AI', '/skylens']]

// Part 7: Constellation info modal
function ConstellationModal({ con, onClose }: { con: Constellation | null; onClose: () => void }) {
  return (
    <AnimatePresence>
      {con && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 900 }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', damping: 24, stiffness: 300 }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 380,
              background: 'rgba(6, 8, 18, 0.96)',
              border: '1px solid rgba(155,220,255,0.2)',
              borderRadius: 14,
              padding: 24,
              zIndex: 901,
              backdropFilter: 'blur(20px)',
              boxShadow: '0 0 40px rgba(155,220,255,0.06)',
            }}
          >
            {/* Star count badge */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: '#9BDCFF', letterSpacing: '0.25em', marginBottom: 6 }}>
                  IAU CONSTELLATION · {con.season.toUpperCase()}
                </div>
                <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 24, fontWeight: 700, color: '#fff', margin: 0 }}>
                  {con.name}
                </h2>
                <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, color: '#4A5568', marginTop: 4 }}>
                  {con.abbr} · {con.stars.length} principal stars
                </div>
              </div>
              <button onClick={onClose} style={{ fontFamily: 'Space Mono, monospace', fontSize: 14, color: '#4A5568', background: 'transparent', border: 'none', cursor: 'pointer' }}>✕</button>
            </div>

            {/* Mythology */}
            <div style={{ background: 'rgba(155,220,255,0.04)', border: '1px solid rgba(155,220,255,0.1)', borderRadius: 10, padding: '12px 14px', marginBottom: 16 }}>
              <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, color: '#9BDCFF', marginBottom: 6, letterSpacing: '0.2em' }}>MYTHOLOGY</div>
              <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 13, color: '#ccc', lineHeight: 1.65, margin: 0 }}>
                {con.mythology}
              </p>
            </div>

            {/* Stars list */}
            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, color: '#4A5568', marginBottom: 8, letterSpacing: '0.2em' }}>
              PRINCIPAL STARS
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {con.stars.filter(s => s.name).map(s => (
                <span key={s.name} style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: '#9BDCFF', background: 'rgba(155,220,255,0.07)', border: '1px solid rgba(155,220,255,0.15)', borderRadius: 4, padding: '3px 7px' }}>
                  ⭐ {s.name}
                </span>
              ))}
            </div>

            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, color: '#4A5568', marginTop: 16, textAlign: 'center' }}>
              CLICK ANYWHERE TO CLOSE
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default function Dashboard() {
  const [filter, setFilter] = useState('ALL')
  const [selected, setSelected] = useState<typeof SAT_DATA[0] | null>(null)
  const [utc, setUtc] = useState('')
  const [issPos, setIssPos] = useState({ lat: 42.46, lon: -70.71, alt: 408, vel: 27600 })
  const [passes, setPasses] = useState(PASSES.map(p => ({ ...p })))

  // Part 5: SkyLens satellite modal
  const [modalOpen, setModalOpen] = useState(false)
  const [modalObject, setModalObject] = useState<typeof SAT_DATA[0] | null>(null)

  // Part 4: Speed tracker
  const [currentSpeed, setCurrentSpeed] = useState(0)
  const [speedDelta, setSpeedDelta] = useState(0)
  const prevSpeedRef = useRef(0)

  // Part 6: Time travel
  const [timeOffset, setTimeOffset] = useState(0)        // hours, -24 to +24
  const [isPlaying, setIsPlaying] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const playRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Part 7: Constellation toggle + info modal
  const [showConstellations, setShowConstellations] = useState(false)
  const [selectedConstellation, setSelectedConstellation] = useState<Constellation | null>(null)

  // ── clock ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const t = () => setUtc(new Date().toUTCString().split(' ')[4] + ' UTC')
    t(); const i = setInterval(t, 1000); return () => clearInterval(i)
  }, [])

  // ── ISS live poll ──────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    const poll = async () => {
      try {
        const res = await fetch('/api/iss')
        const d = await res.json()
        if (!cancelled) setIssPos({ lat: +d.latitude.toFixed(2), lon: +d.longitude.toFixed(2), alt: Math.round(d.altitude), vel: Math.round(d.velocity) })
      } catch { }
    }
    poll(); const i = setInterval(poll, 5000)
    return () => { cancelled = true; clearInterval(i) }
  }, [])

  // ── pass countdown ─────────────────────────────────────────────────────────
  useEffect(() => {
    const i = setInterval(() => setPasses(p => p.map(x => ({ ...x, seconds: Math.max(0, x.seconds - 1) }))), 1000)
    return () => clearInterval(i)
  }, [])

  // ── speed tracker ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!selected) return
    const base = selected.id === 'ISS' ? issPos.vel : selected.speed
    setCurrentSpeed(base); prevSpeedRef.current = base
    const i = setInterval(() => {
      const newSpeed = Math.round(base + (Math.random() - 0.5) * 12)
      setSpeedDelta(newSpeed - prevSpeedRef.current)
      setCurrentSpeed(newSpeed); prevSpeedRef.current = newSpeed
    }, 1000)
    return () => clearInterval(i)
  }, [selected, issPos.vel])

  // ── Part 6: time-travel auto-play ─────────────────────────────────────────
  useEffect(() => {
    if (isPlaying) {
      playRef.current = setInterval(() => {
        setTimeOffset(prev => {
          const next = prev + 0.25  // advance 15min per tick
          if (next >= 24) { setIsPlaying(false); return 24 }
          return next
        })
      }, 200)
    } else {
      if (playRef.current) clearInterval(playRef.current)
    }
    return () => { if (playRef.current) clearInterval(playRef.current) }
  }, [isPlaying])

  const handleInfoClick = (sat: typeof SAT_DATA[0]) => {
    setModalObject(sat); setModalOpen(true)
  }

  const list = SAT_DATA.filter(s => filter === 'ALL' || s.type === filter)
  const S = { fontFamily: 'Space Mono, monospace' }
  const issContextString = `ISS: lat ${issPos.lat}°, lon ${issPos.lon}°, altitude ${issPos.alt} km, velocity ${issPos.vel.toLocaleString()} km/h.`
  const isTimeTravel = timeOffset !== 0
  const displayTime = isTimeTravel ? getSimulatedTime(timeOffset) : utc

  return (
    <div style={{ height: '100vh', background: '#000', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* Navbar */}
      <nav style={{ height: 56, flexShrink: 0, background: 'rgba(0,0,0,0.9)', borderBottom: '1px solid rgba(0,212,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', backdropFilter: 'blur(20px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00D4FF', animation: 'pulse-cyan 2s infinite' }} />
          <span style={{ ...S, color: '#00D4FF', letterSpacing: '0.3em', fontSize: 14, fontWeight: 700 }}>ZENITH</span>
        </div>
        <div style={{ display: 'flex', gap: 32 }}>
          {NAV.map(([label, href]) => (
            <Link key={label} href={href} style={{ ...S, fontSize: 10, letterSpacing: '0.2em', color: href === '/dashboard' ? '#00D4FF' : '#8892A4', textDecoration: 'none' }}>{label}</Link>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {isTimeTravel
            ? <span style={{ ...S, fontSize: 9, color: '#FFD400', border: '1px solid rgba(255,212,0,0.3)', padding: '2px 7px', borderRadius: 4 }}>⏳ TIME WARP</span>
            : <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00FF88', animation: 'blink 1s infinite' }} />
          }
          <span style={{ ...S, fontSize: 10, color: isTimeTravel ? '#FFD400' : '#00FF88', letterSpacing: '0.15em' }}>{isTimeTravel ? 'SIMULATED' : 'LIVE'}</span>
          <span style={{ ...S, fontSize: 11, color: '#8892A4' }}>{displayTime}</span>
        </div>
      </nav>

      {/* 3 panels */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* LEFT */}
        <div style={{ width: 280, flexShrink: 0, background: 'rgba(10,10,15,0.98)', borderRight: '1px solid rgba(0,212,255,0.1)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: 12, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ ...S, fontSize: 9, color: '#8892A4', letterSpacing: '0.3em' }}>TRACKED OBJECTS</span>
              <span style={{ ...S, fontSize: 12, color: '#00D4FF' }}>23,794</span>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {['ALL', 'SAT', 'ISS', 'DEBRIS'].map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{ ...S, fontSize: 9, padding: '3px 8px', borderRadius: 4, cursor: 'pointer', background: filter === f ? 'rgba(0,212,255,0.1)' : 'transparent', color: filter === f ? '#00D4FF' : '#8892A4', border: filter === f ? '1px solid rgba(0,212,255,0.3)' : '1px solid transparent' }}>{f}</button>
              ))}
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {list.map((s, i) => (
              <motion.div key={s.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                onClick={() => setSelected(s)}
                style={{ padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', background: selected?.id === s.id ? 'rgba(0,212,255,0.05)' : 'transparent' }}
                onMouseEnter={e => { if (selected?.id !== s.id) e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
                onMouseLeave={e => { e.currentTarget.style.background = selected?.id === s.id ? 'rgba(0,212,255,0.05)' : 'transparent' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                  <span style={{ ...S, fontSize: 8, padding: '1px 5px', borderRadius: 3, ...badge(s.type) }}>{s.type}</span>
                  <span style={{ ...S, fontSize: 10, color: '#fff', flex: 1 }}>{s.name}</span>
                  <InfoRayButton onClick={() => handleInfoClick(s)} color={s.type === 'ISS' ? '#00FF88' : s.type === 'DEBRIS' ? '#FF6B35' : '#FFD400'} size={22} />
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: s.type === 'DEBRIS' ? '#FF6B35' : '#00FF88', animation: 'blink 1s infinite' }} />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <span style={{ ...S, fontSize: 9, color: '#4A5568' }}>ALT: {s.alt}km</span>
                  <span style={{ ...S, fontSize: 9, color: '#4A5568' }}>SPD: {s.speed.toLocaleString()}</span>
                </div>
              </motion.div>
            ))}
          </div>

          <div style={{ padding: 12, background: '#0a0a0f', borderTop: '1px solid rgba(0,212,255,0.1)', minHeight: 100 }}>
            {selected ? (
              <>
                <div style={{ ...S, fontSize: 8, color: '#8892A4', marginBottom: 4 }}>SELECTED TARGET</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ ...S, fontSize: 12, color: '#00D4FF' }}>{selected.name}</div>
                  <InfoRayButton onClick={() => handleInfoClick(selected)} color="#FFD400" size={26} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 8 }}>
                  {[['LAT', selected.lat + '°'], ['LON', selected.lon + '°'], ['ALT', selected.alt + 'km'], ['SPD', selected.speed.toLocaleString()]].map(([k, v]) => (
                    <div key={k}>
                      <div style={{ ...S, fontSize: 8, color: '#4A5568' }}>{k}</div>
                      <div style={{ ...S, fontSize: 10, color: '#fff' }}>{v}</div>
                    </div>
                  ))}
                </div>
                <button style={{ ...S, fontSize: 9, color: '#00D4FF', border: '1px solid rgba(0,212,255,0.4)', background: 'transparent', padding: '4px 12px', borderRadius: 4, cursor: 'pointer' }}>TRACK</button>
              </>
            ) : (
              <div style={{ ...S, fontSize: 9, color: '#4A5568', textAlign: 'center', paddingTop: 16 }}>SELECT A TARGET</div>
            )}
          </div>
        </div>

        {/* CENTER */}
        <div style={{ flex: 1, background: '#000', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
          <div style={{ height: 40, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', borderBottom: '1px solid rgba(0,212,255,0.08)' }}>
            <span style={{ ...S, fontSize: 9, color: '#4A5568' }}>ZENITH / MISSION CONTROL</span>
            {/* Part 7: constellation toggle */}
            <button
              onClick={() => setShowConstellations(c => !c)}
              style={{
                ...S, fontSize: 9, letterSpacing: '0.15em',
                color: showConstellations ? '#9BDCFF' : '#4A5568',
                background: showConstellations ? 'rgba(155,220,255,0.08)' : 'transparent',
                border: showConstellations ? '1px solid rgba(155,220,255,0.25)' : '1px solid rgba(255,255,255,0.08)',
                borderRadius: 4, padding: '3px 10px', cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              ✦ CONSTELLATIONS {showConstellations ? 'ON' : 'OFF'}
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ ...S, fontSize: 10, color: isTimeTravel ? '#FFD400' : '#00D4FF' }}>{displayTime}</span>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: isTimeTravel ? '#FFD400' : '#00FF88', animation: 'blink 1s infinite' }} />
            </div>
          </div>

          <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
            <Globe
              satellites={SAT_DATA}
              selected={selected}
              onSelect={setSelected}
              timeOffsetHours={timeOffset}
              showConstellations={showConstellations}
              onConstellationClick={setSelectedConstellation}
            />

            {/* Part 4: Speed Tracker HUD */}
            <AnimatePresence>
              {selected && (
                <motion.div
                  key="speedhud"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  style={{
                    position: 'absolute', top: 16, right: 16,
                    background: 'rgba(0,0,0,0.82)',
                    border: '1px solid rgba(0,212,255,0.25)',
                    borderRadius: 10, padding: '12px 16px',
                    backdropFilter: 'blur(12px)', minWidth: 180,
                    boxShadow: '0 0 20px rgba(0,212,255,0.08)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#00FF88', animation: 'blink 1s infinite' }} />
                    <span style={{ ...S, fontSize: 8, color: '#8892A4', letterSpacing: '0.2em' }}>LIVE SPEED TRACKER</span>
                  </div>
                  <div style={{ ...S, fontSize: 9, color: '#4A5568', marginBottom: 4 }}>{selected.name}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    <span style={{ ...S, fontSize: 22, color: '#00D4FF', fontWeight: 700 }}>{currentSpeed.toLocaleString()}</span>
                    <span style={{ ...S, fontSize: 9, color: '#4A5568' }}>KM/H</span>
                  </div>
                  <div style={{ ...S, fontSize: 9, color: speedDelta >= 0 ? '#00FF88' : '#FF6B35', marginTop: 4 }}>
                    {speedDelta >= 0 ? '▲' : '▼'} {Math.abs(speedDelta)} km/h
                  </div>
                  <div style={{ marginTop: 8, height: 2, background: 'rgba(0,212,255,0.1)', borderRadius: 1 }}>
                    <motion.div
                      animate={{ width: `${Math.min(100, (currentSpeed / 30000) * 100)}%` }}
                      transition={{ duration: 0.8 }}
                      style={{ height: '100%', background: '#00D4FF', borderRadius: 1 }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                    <span style={{ ...S, fontSize: 8, color: '#4A5568' }}>ALT: {selected.id === 'ISS' ? issPos.alt : selected.alt} KM</span>
                    <span style={{ ...S, fontSize: 8, color: '#4A5568' }}>{selected.type}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Part 7: constellation hint when active */}
            <AnimatePresence>
              {showConstellations && (
                <motion.div
                  key="conhint"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  style={{
                    position: 'absolute', top: 16, left: 16,
                    background: 'rgba(0,0,0,0.78)',
                    border: '1px solid rgba(155,220,255,0.2)',
                    borderRadius: 8, padding: '8px 12px',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <span style={{ ...S, fontSize: 9, color: '#9BDCFF' }}>
                    ✦ 10 constellations overlaid · click a line or label for mythology
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── PART 6: Time Travel Slider ── */}
          <div style={{
            flexShrink: 0,
            background: 'rgba(6,8,14,0.95)',
            borderTop: '1px solid rgba(255,212,0,0.12)',
            padding: '10px 16px 8px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              {/* Label */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                <span style={{ fontSize: 12 }}>⏳</span>
                <span style={{ ...S, fontSize: 9, color: '#FFD400', letterSpacing: '0.2em' }}>TIME TRAVEL</span>
              </div>

              {/* Play/Pause */}
              <button
                onClick={() => {
                  if (timeOffset >= 24) setTimeOffset(-24)
                  setIsPlaying(p => !p)
                }}
                style={{
                  ...S, fontSize: 10, color: isPlaying ? '#FF6B35' : '#FFD400',
                  background: 'transparent',
                  border: `1px solid ${isPlaying ? 'rgba(255,107,53,0.4)' : 'rgba(255,212,0,0.3)'}`,
                  borderRadius: 4, padding: '3px 10px', cursor: 'pointer',
                }}
              >
                {isPlaying ? '⏸ PAUSE' : '▶ PLAY'}
              </button>

              {/* Reset */}
              <button
                onClick={() => { setTimeOffset(0); setIsPlaying(false) }}
                style={{
                  ...S, fontSize: 9, color: '#8892A4',
                  background: 'transparent', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 4, padding: '3px 8px', cursor: 'pointer',
                }}
              >
                ↺ NOW
              </button>

              {/* Current time label */}
              <span style={{ ...S, fontSize: 10, color: timeOffset === 0 ? '#00FF88' : '#FFD400', marginLeft: 4 }}>
                {fmtOffset(timeOffset)}
              </span>

              {/* Spacer */}
              <div style={{ flex: 1 }} />

              {/* Simulated date */}
              <span style={{ ...S, fontSize: 9, color: '#4A5568' }}>
                {getSimulatedTime(timeOffset)}
              </span>
            </div>

            {/* Slider track with comet-tail thumb styling */}
            <div style={{ position: 'relative' }}>
              {/* Custom track fill */}
              <div style={{
                position: 'absolute', top: '50%', left: 0,
                height: 3, borderRadius: 2,
                width: `${((timeOffset + 24) / 48) * 100}%`,
                background: timeOffset === 0
                  ? 'rgba(0,212,255,0.4)'
                  : timeOffset > 0
                  ? 'linear-gradient(90deg, rgba(0,212,255,0.3), #FFD400)'
                  : 'linear-gradient(90deg, #9B59FF, rgba(0,212,255,0.3))',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
                zIndex: 1,
                // Comet-tail glow
                boxShadow: `0 0 8px ${timeOffset === 0 ? 'rgba(0,212,255,0.4)' : timeOffset > 0 ? 'rgba(255,212,0,0.5)' : 'rgba(155,89,255,0.5)'}`,
              }} />

              <input
                type="range"
                min={-24}
                max={24}
                step={0.25}
                value={timeOffset}
                onMouseDown={() => { setIsDragging(true); setIsPlaying(false) }}
                onMouseUp={() => setIsDragging(false)}
                onChange={e => setTimeOffset(parseFloat(e.target.value))}
                style={{
                  width: '100%',
                  height: 18,
                  appearance: 'none',
                  background: 'rgba(255,255,255,0.06)',
                  borderRadius: 2,
                  outline: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  zIndex: 2,
                }}
              />

              {/* Tick marks */}
              <div style={{ position: 'absolute', bottom: -14, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', pointerEvents: 'none' }}>
                {[-24, -18, -12, -6, 0, 6, 12, 18, 24].map(h => (
                  <span key={h} style={{ ...S, fontSize: 7, color: h === 0 ? '#00D4FF' : '#4A5568' }}>
                    {h === 0 ? 'NOW' : (h > 0 ? '+' : '') + h + 'h'}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ height: 14 }} />
          </div>

          {/* Sky Above Me + Space Weather grid */}
          <div style={{ flexShrink: 0, borderTop: '1px solid rgba(0,212,255,0.08)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 0 }}>
              {/* Sky Above Me */}
              <div style={{ borderRight: '1px solid rgba(0,212,255,0.08)', padding: '10px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <span style={{ animation: 'blink 2s infinite', fontSize: 12 }}>🌐</span>
                  <span style={{ ...S, fontSize: 9, color: '#00D4FF', letterSpacing: '0.2em' }}>SKY ABOVE ME</span>
                  <InfoRayButton onClick={() => { }} color="#00D4FF" size={18} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {ZENITH_OBJECTS.map(obj => (
                      <div key={obj.name} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ ...S, fontSize: 9, color: '#fff', minWidth: 52 }}>{obj.name}</span>
                        <span style={{ ...S, fontSize: 8, color: '#4A5568' }}>mag {obj.mag}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {RISE_SET.map(rs => (
                      <div key={rs.body} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ ...S, fontSize: 8, color: '#8892A4', minWidth: 36 }}>{rs.body}</span>
                        <span style={{ ...S, fontSize: 8, color: '#00FF88' }}>↑{rs.rise}</span>
                        <span style={{ ...S, fontSize: 8, color: '#FF6B35' }}>↓{rs.set}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Space Weather */}
              <div style={{ padding: '10px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <span style={{ animation: 'blink 2s infinite', fontSize: 12 }}>☀️</span>
                  <span style={{ ...S, fontSize: 9, color: '#FF6B35', letterSpacing: '0.2em' }}>SPACE WEATHER</span>
                </div>
                {WEATHER.map(({ label, value, pct, color }) => (
                  <div key={label} style={{ marginBottom: 6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                      <span style={{ ...S, fontSize: 8, color: '#4A5568' }}>{label}</span>
                      <span style={{ ...S, fontSize: 8, color: '#fff' }}>{value}</span>
                    </div>
                    <div style={{ width: '100%', height: 2, background: '#1a1a2e', borderRadius: 1 }}>
                      <div style={{ width: pct + '%', height: '100%', background: color, borderRadius: 1 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ height: 44, display: 'flex', alignItems: 'center', padding: '0 16px', borderTop: '1px solid rgba(0,212,255,0.08)', flexShrink: 0 }}>
            {[['ACTIVE SATS', '23,794'], ['ISS ALT', '408 KM'], ['COVERAGE', '94.2%'], ['REFRESH', '5s']].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 6, marginRight: 20 }}>
                <span style={{ ...S, fontSize: 9, color: '#4A5568' }}>{l}:</span>
                <span style={{ ...S, fontSize: 9, color: '#00D4FF' }}>{v}</span>
                <span style={{ color: 'rgba(0,212,255,0.15)', marginLeft: 14 }}>|</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <div style={{ width: 290, flexShrink: 0, background: 'rgba(10,10,15,0.98)', borderLeft: '1px solid rgba(0,212,255,0.1)', overflowY: 'auto' }}>
          <div style={{ padding: 12, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ ...S, fontSize: 9, color: '#8892A4', letterSpacing: '0.25em' }}>ISS TELEMETRY</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#00FF88', animation: 'blink 1s infinite' }} />
                <span style={{ ...S, fontSize: 8, color: '#00FF88' }}>LIVE</span>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {[['ALTITUDE', issPos.alt + ' KM'], ['SPEED', issPos.vel.toLocaleString() + ' KM/H'], ['LAT', issPos.lat + '°'], ['LON', issPos.lon + '°']].map(([l, v]) => (
                <div key={l} style={{ background: '#111118', borderRadius: 6, padding: 8 }}>
                  <div style={{ ...S, fontSize: 8, color: '#4A5568', marginBottom: 3 }}>{l}</div>
                  <div style={{ ...S, fontSize: 12, color: '#00D4FF', fontWeight: 700 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ padding: 12, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ ...S, fontSize: 9, color: '#8892A4', letterSpacing: '0.25em', marginBottom: 12 }}>SPACE WEATHER</div>
            {WEATHER.map(({ label, value, pct, color }) => (
              <div key={label} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ ...S, fontSize: 9, color: '#4A5568' }}>{label}</span>
                  <span style={{ ...S, fontSize: 9, color: '#fff' }}>{value}</span>
                </div>
                <div style={{ width: '100%', height: 3, background: '#1a1a2e', borderRadius: 2 }}>
                  <div style={{ width: pct + '%', height: '100%', background: color, borderRadius: 2 }} />
                </div>
              </div>
            ))}
          </div>

          <div style={{ padding: 12 }}>
            <div style={{ ...S, fontSize: 9, color: '#8892A4', letterSpacing: '0.25em', marginBottom: 12 }}>UPCOMING PASSES</div>
            {passes.map((p, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div>
                  <div style={{ ...S, fontSize: 10, color: '#fff', marginBottom: 2 }}>{p.sat}</div>
                  <div style={{ ...S, fontSize: 8, color: '#4A5568' }}>{p.direction}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ ...S, fontSize: 10, color: '#00D4FF', marginBottom: 2 }}>{fmt(p.seconds)}</div>
                  <div style={{ ...S, fontSize: 8, color: '#00FF88' }}>{p.elevation}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Slider thumb styles (comet-tail glow effect) */}
      <style>{`
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #FFD400;
          box-shadow: 0 0 0 3px rgba(255,212,0,0.15), -8px 0 14px 2px rgba(255,212,0,0.35);
          cursor: pointer;
          border: 2px solid rgba(0,0,0,0.6);
          transition: box-shadow 0.15s;
        }
        input[type=range]::-webkit-slider-thumb:hover {
          box-shadow: 0 0 0 5px rgba(255,212,0,0.2), -12px 0 18px 4px rgba(255,212,0,0.5);
        }
        input[type=range]::-webkit-slider-runnable-track {
          height: 3px;
          border-radius: 2px;
          background: rgba(255,255,255,0.06);
        }
        input[type=range]::-moz-range-thumb {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #FFD400;
          box-shadow: 0 0 0 3px rgba(255,212,0,0.15), -8px 0 14px 2px rgba(255,212,0,0.35);
          cursor: pointer;
          border: 2px solid rgba(0,0,0,0.6);
        }
      `}</style>

      {/* Part 5: SkyLens Modal */}
      <SkyLensModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        object={modalObject}
        issContext={issContextString}
      />

      {/* Part 7: Constellation Info Modal */}
      <ConstellationModal
        con={selectedConstellation}
        onClose={() => setSelectedConstellation(null)}
      />
    </div>
  )
}