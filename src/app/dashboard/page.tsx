'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Globe from '@/components/Globe'
import { InfoRayButton } from '@/components/InfoRayButton'
import SkyLensModal from '@/components/SkyLensModal'

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

const PASS_MAX = Math.max(...PASSES.map(p => p.seconds))

const NO_DATA = { lat: 0, lon: 0, alt: 0, vel: 0 }

function fmt(s: number) {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60
  return `+${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

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

// Status dot component
function StatusDot({ type }: { type: string }) {
  const style: React.CSSProperties = {
    width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
  }
  if (type === 'ISS') {
    style.background = '#00FF88'
    style.animation = 'heartbeat 1.5s infinite'
    style.boxShadow = '0 0 6px rgba(0,255,136,0.6)'
  } else if (type === 'DEBRIS') {
    style.background = '#FF6B35'
    style.animation = 'flicker-noise 0.8s infinite'
  } else {
    style.background = '#00D4FF'
    style.animation = 'blink 2s infinite'
    style.opacity = 0.7
  }
  return <div style={style} />
}

export default function Dashboard() {
  const [filter, setFilter] = useState('ALL')
  const [selected, setSelected] = useState<typeof SAT_DATA[0] | null>(null)
  const [utc, setUtc] = useState('')
  const [issPos, setIssPos] = useState(NO_DATA)
  const [passes, setPasses] = useState(PASSES.map(p => ({ ...p })))
  const [modalOpen, setModalOpen] = useState(false)
  const [modalObject, setModalObject] = useState<typeof SAT_DATA[0] | null>(null)
  const [currentSpeed, setCurrentSpeed] = useState(0)
  const [speedDelta, setSpeedDelta] = useState(0)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isDragging, setIsDragging] = useState(false)
  const prevSpeedRef = useRef(0)
  const [timeOffset, setTimeOffset] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const playRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [showConstellations, setShowConstellations] = useState(false)

  // Odometer digit animation
  const prevSpeedDisplay = useRef(0)
  const [displaySpeed, setDisplaySpeed] = useState(0)

  useEffect(() => {
    const t = () => setUtc(new Date().toUTCString().split(' ')[4] + ' UTC')
    t(); const i = setInterval(t, 1000); return () => clearInterval(i)
  }, [])

  useEffect(() => {
    let cancelled = false
    const poll = async () => {
      try {
        const res = await fetch('/api/iss')
        const d = await res.json()
        if (!cancelled) setIssPos({ lat: +d.latitude.toFixed(2), lon: +d.longitude.toFixed(2), alt: Math.round(d.altitude), vel: Math.round(d.velocity) })
      } catch { /* use fallback */ }
    }
    poll(); const i = setInterval(poll, 5000)
    return () => { cancelled = true; clearInterval(i) }
  }, [])

  useEffect(() => {
    const i = setInterval(() => setPasses(p => p.map(x => ({ ...x, seconds: Math.max(0, x.seconds - 1) }))), 1000)
    return () => clearInterval(i)
  }, [])

  // Speed tracker with odometer effect
  useEffect(() => {
    if (!selected) return
    const base = selected.id === 'ISS' ? issPos.vel : selected.speed
    setCurrentSpeed(base); prevSpeedRef.current = base; prevSpeedDisplay.current = base; setDisplaySpeed(base)
    const i = setInterval(() => {
      const newSpeed = Math.round(base + (Math.random() - 0.5) * 12)
      setSpeedDelta(newSpeed - prevSpeedRef.current)
      setCurrentSpeed(newSpeed); prevSpeedRef.current = newSpeed
    }, 1000)
    return () => clearInterval(i)
  }, [selected, issPos.vel])

  // Odometer rolling animation
  useEffect(() => {
    if (!currentSpeed) return
    const step = Math.sign(currentSpeed - displaySpeed) * Math.max(1, Math.abs(currentSpeed - displaySpeed) * 0.15)
    const i = setInterval(() => {
      setDisplaySpeed(prev => {
        if (Math.abs(prev - currentSpeed) <= 1) return currentSpeed
        return prev + step
      })
    }, 40)
    return () => clearInterval(i)
  }, [currentSpeed, displaySpeed])

  useEffect(() => {
    if (isPlaying) {
      playRef.current = setInterval(() => {
        setTimeOffset(prev => {
          const next = prev + 0.25
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
  const issContextString = issPos.vel ? `ISS: lat ${issPos.lat}°, lon ${issPos.lon}°, altitude ${issPos.alt} km, velocity ${issPos.vel.toLocaleString()} km/h.` : ''
  const isTimeTravel = timeOffset !== 0
  const displayTime = isTimeTravel ? getSimulatedTime(timeOffset) : utc
  const speedColor = displaySpeed > 28000 ? '#FF6B35' : displaySpeed > 26000 ? '#FFD400' : '#00D4FF'
  const speedPct = Math.min(100, (displaySpeed / 30000) * 100)

  return (
    <div style={{ height: 'calc(100vh - 52px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* LEFT PANEL - Tracked Objects */}
        <div className="animate-card-glow" style={{ width: 280, flexShrink: 0, background: 'rgba(8,10,16,0.92)', borderRight: '1px solid rgba(0,212,255,0.12)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ ...S, fontSize: 9, color: '#8892A4', letterSpacing: '0.3em' }}>TRACKED OBJECTS</span>
              <span style={{ ...S, fontSize: 12, color: '#00D4FF' }}>23,794</span>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {['ALL', 'SAT', 'ISS', 'DEBRIS'].map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{
                  ...S, fontSize: 9, padding: '3px 8px', borderRadius: 4, cursor: 'pointer',
                  background: filter === f ? 'rgba(0,212,255,0.12)' : 'transparent',
                  color: filter === f ? '#00D4FF' : '#8892A4',
                  border: filter === f ? '1px solid rgba(0,212,255,0.3)' : '1px solid transparent',
                }}>{f}</button>
              ))}
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {list.map((s, i) => (
              <motion.div key={s.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                onClick={() => setSelected(s)}
                style={{
                  padding: '7px 12px', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer',
                  background: selected?.id === s.id ? 'rgba(0,212,255,0.06)' : 'transparent',
                  transition: 'background 0.15s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                  <StatusDot type={s.type} />
                  <span style={{ ...S, fontSize: 8, padding: '1px 5px', borderRadius: 3, ...badge(s.type) }}>{s.type}</span>
                  <span style={{ ...S, fontSize: 10, color: '#fff', flex: 1 }}>{s.name}</span>
                  <InfoRayButton onClick={() => handleInfoClick(s)} color={s.type === 'ISS' ? '#00FF88' : s.type === 'DEBRIS' ? '#FF6B35' : '#FFD400'} size={20} />
                </div>
                <div style={{ display: 'flex', gap: 10, marginLeft: 18 }}>
                  <span style={{ ...S, fontSize: 8, color: '#4A5568' }}>ALT: {s.alt}km</span>
                  <span style={{ ...S, fontSize: 8, color: '#4A5568' }}>SPD: {s.speed.toLocaleString()}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Selected target details */}
          <div style={{ padding: 10, background: '#0a0a0f', borderTop: '1px solid rgba(0,212,255,0.1)', minHeight: 90 }}>
            {selected ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ ...S, fontSize: 8, color: '#8892A4' }}>SELECTED TARGET</span>
                  <InfoRayButton onClick={() => handleInfoClick(selected)} color="#FFD400" size={22} />
                </div>
                <div style={{ ...S, fontSize: 10, color: '#00D4FF', marginBottom: 4 }}>{selected.name}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                  {[['LAT', selected.lat + '°'], ['LON', selected.lon + '°'], ['ALT', selected.alt + 'km'], ['SPD', selected.speed.toLocaleString()]].map(([k, v]) => (
                    <div key={k}><span style={{ ...S, fontSize: 7, color: '#4A5568' }}>{k} </span><span style={{ ...S, fontSize: 9, color: '#fff' }}>{v}</span></div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ ...S, fontSize: 9, color: '#4A5568', textAlign: 'center', paddingTop: 12 }}>SELECT A TARGET</div>
            )}
          </div>
        </div>

        {/* CENTER - Globe + HUD */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
          {/* Title bar */}
          <div style={{ height: 36, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 14px', borderBottom: '1px solid rgba(0,212,255,0.08)' }}>
            <span style={{ ...S, fontSize: 9, color: '#4A5568' }} className="animate-flicker">ZENITH / MISSION CONTROL</span>
            <button
              onClick={() => setShowConstellations(c => !c)}
              style={{
                ...S, fontSize: 8, letterSpacing: '0.15em',
                color: showConstellations ? '#9BDCFF' : '#4A5568',
                background: showConstellations ? 'rgba(155,220,255,0.08)' : 'transparent',
                border: showConstellations ? '1px solid rgba(155,220,255,0.25)' : '1px solid rgba(255,255,255,0.08)',
                borderRadius: 4, padding: '2px 8px', cursor: 'pointer',
              }}
            >
              ✦ CONSTELLATIONS {showConstellations ? 'ON' : 'OFF'}
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ ...S, fontSize: 10, color: isTimeTravel ? '#FFD400' : '#00D4FF' }}>{displayTime}</span>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: isTimeTravel ? '#FFD400' : '#00FF88', animation: 'blink 1s infinite' }} />
            </div>
          </div>

          {/* Globe */}
          <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
            <Globe
              satellites={SAT_DATA}
              selected={selected}
              onSelect={setSelected}
              timeOffsetHours={timeOffset}
              showConstellations={showConstellations}
            />

            {/* Phase 6: Live Speed Tracker HUD */}
            <AnimatePresence>
              {selected && (
                <motion.div
                  key="speedhud"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  style={{
                    position: 'absolute', top: 14, right: 14,
                    background: 'rgba(0,0,0,0.82)',
                    border: '1px solid rgba(0,212,255,0.2)',
                    borderRadius: 10, padding: '10px 14px',
                    backdropFilter: 'blur(12px)', minWidth: 170,
                    boxShadow: '0 0 20px rgba(0,212,255,0.06)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
                    <StatusDot type={selected.type === 'DEBRIS' ? 'DEBRIS' : selected.type === 'ISS' ? 'ISS' : 'SAT'} />
                    <span style={{ ...S, fontSize: 7, color: '#8892A4', letterSpacing: '0.2em' }}>LIVE SPEED</span>
                  </div>
                  <div style={{ ...S, fontSize: 8, color: '#4A5568', marginBottom: 2 }}>{selected.name}</div>
                  {/* Odometer-style speed */}
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
                    <motion.span
                      key={Math.floor(displaySpeed / 1000)}
                      style={{ ...S, fontSize: 24, color: speedColor, fontWeight: 700 }}
                    >
                      {displaySpeed.toLocaleString()}
                    </motion.span>
                    <span style={{ ...S, fontSize: 8, color: '#4A5568' }}>KM/H</span>
                  </div>
                  <div style={{ ...S, fontSize: 8, color: speedDelta >= 0 ? '#00FF88' : '#FF6B35', marginBottom: 4 }}>
                    {speedDelta >= 0 ? '▲' : '▼'} {Math.abs(speedDelta)} km/h
                  </div>
                  {/* Glowing neon bar */}
                  <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                    <motion.div
                      animate={{ width: `${speedPct}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      style={{
                        height: '100%',
                        background: speedColor,
                        borderRadius: 2,
                        boxShadow: `0 0 8px ${speedColor}`,
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                    <span style={{ ...S, fontSize: 7, color: '#4A5568' }}>ALT: {selected.id === 'ISS' && issPos.vel ? issPos.alt : selected.alt} KM</span>
                    <span style={{ ...S, fontSize: 7, color: '#4A5568' }}>{selected.type}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Constellation hint */}
            <AnimatePresence>
              {showConstellations && (
                <motion.div
                  key="conhint"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  style={{
                    position: 'absolute', top: 14, left: 14,
                    background: 'rgba(0,0,0,0.78)',
                    border: '1px solid rgba(155,220,255,0.2)',
                    borderRadius: 8, padding: '6px 10px',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <span style={{ ...S, fontSize: 8, color: '#9BDCFF' }}>
                    ✦ 10 constellations overlaid · click a line or label for mythology
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Time Travel Slider */}
          <div style={{
            flexShrink: 0,
            background: 'rgba(6,8,14,0.95)',
            borderTop: '1px solid rgba(255,212,0,0.1)',
            padding: '8px 14px 6px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: 10 }}>⏳</span>
                <span style={{ ...S, fontSize: 8, color: '#FFD400', letterSpacing: '0.2em' }}>TIME TRAVEL</span>
              </div>
              <button
                onClick={() => { if (timeOffset >= 24) setTimeOffset(-24); setIsPlaying(p => !p) }}
                style={{
                  ...S, fontSize: 9, color: isPlaying ? '#FF6B35' : '#FFD400',
                  background: 'transparent',
                  border: `1px solid ${isPlaying ? 'rgba(255,107,53,0.4)' : 'rgba(255,212,0,0.3)'}`,
                  borderRadius: 4, padding: '2px 8px', cursor: 'pointer',
                }}
              >
                {isPlaying ? '⏸' : '▶'}
              </button>
              <button
                onClick={() => { setTimeOffset(0); setIsPlaying(false) }}
                style={{ ...S, fontSize: 8, color: '#8892A4', background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 4, padding: '2px 6px', cursor: 'pointer' }}
              >
                ↺ NOW
              </button>
              <span style={{ ...S, fontSize: 9, color: timeOffset === 0 ? '#00FF88' : '#FFD400' }}>
                {fmtOffset(timeOffset)}
              </span>
              <div style={{ flex: 1 }} />
              <span style={{ ...S, fontSize: 8, color: '#4A5568' }}>{getSimulatedTime(timeOffset)}</span>
            </div>

            {/* Slider with comet-tail */}
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute', top: '50%', left: 0, height: 3, borderRadius: 2,
                width: `${((timeOffset + 24) / 48) * 100}%`,
                background: timeOffset === 0 ? 'rgba(0,212,255,0.4)' : timeOffset > 0
                  ? 'linear-gradient(90deg, rgba(0,212,255,0.3), #FFD400)'
                  : 'linear-gradient(90deg, #9B59FF, rgba(0,212,255,0.3))',
                transform: 'translateY(-50%)', pointerEvents: 'none', zIndex: 1,
                boxShadow: `0 0 8px ${timeOffset === 0 ? 'rgba(0,212,255,0.4)' : timeOffset > 0 ? 'rgba(255,212,0,0.5)' : 'rgba(155,89,255,0.5)'}`,
              }} />
              <input
                type="range" min={-24} max={24} step={0.25} value={timeOffset}
                onMouseDown={() => { setIsDragging(true); setIsPlaying(false) }}
                onMouseUp={() => setIsDragging(false)}
                onChange={e => setTimeOffset(parseFloat(e.target.value))}
                style={{
                  width: '100%', height: 16, appearance: 'none',
                  background: 'rgba(255,255,255,0.06)', borderRadius: 2,
                  outline: 'none', cursor: 'pointer', position: 'relative', zIndex: 2,
                }}
              />
            </div>
            <div style={{ height: 12 }} />
          </div>

          {/* Bottom status bar */}
          <div style={{ height: 36, display: 'flex', alignItems: 'center', padding: '0 14px', borderTop: '1px solid rgba(0,212,255,0.08)', flexShrink: 0, gap: 16 }}>
            {[['ACTIVE SATS', '23,794'], ['ISS ALT', (issPos.vel ? issPos.alt : '408') + ' KM'], ['COVERAGE', '94.2%'], ['REFRESH', '5s']].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ ...S, fontSize: 8, color: '#4A5568' }}>{l}:</span>
                <span style={{ ...S, fontSize: 8, color: '#00D4FF' }}>{v}</span>
              </div>
            ))}
          </div>

          {/* Upcoming Passes with progress bars */}
          <div style={{ borderTop: '1px solid rgba(0,212,255,0.08)' }}>
            <div style={{ padding: '6px 14px', display: 'flex', gap: 8 }}>
              {passes.map((p, i) => {
                const pct = ((PASS_MAX - p.seconds) / PASS_MAX) * 100
                const urgent = p.seconds < 300
                return (
                  <div
                    key={i}
                    style={{
                      flex: 1, background: 'rgba(10,10,15,0.8)', borderRadius: 6, padding: '6px 8px',
                      border: `1px solid ${urgent ? 'rgba(255,107,53,0.5)' : 'rgba(0,212,255,0.08)'}`,
                      transition: 'border-color 0.3s',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                      <span style={{ ...S, fontSize: 8, color: '#fff' }}>{p.sat}</span>
                      <span style={{ ...S, fontSize: 8, color: urgent ? '#FF6B35' : '#00D4FF' }}>{fmt(p.seconds)}</span>
                    </div>
                    <div style={{ ...S, fontSize: 7, color: '#4A5568', marginBottom: 3 }}>{p.direction} · {p.elevation}</div>
                    <div style={{ height: 2, background: 'rgba(255,255,255,0.06)', borderRadius: 1, overflow: 'hidden' }}>
                      <div style={{
                        width: `${pct}%`, height: '100%',
                        background: urgent ? '#FF6B35' : 'rgba(0,212,255,0.5)',
                        borderRadius: 1, transition: 'width 1s linear',
                      }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Slider thumb styles */}
      <style>{`
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 14px; height: 14px;
          border-radius: 50%;
          background: #FFD400;
          box-shadow: 0 0 0 3px rgba(255,212,0,0.15), -8px 0 14px 2px rgba(255,212,0,0.35);
          cursor: pointer; border: 2px solid rgba(0,0,0,0.6);
          transition: box-shadow 0.15s;
        }
        input[type=range]::-webkit-slider-thumb:hover {
          box-shadow: 0 0 0 5px rgba(255,212,0,0.2), -12px 0 18px 4px rgba(255,212,0,0.5);
        }
        input[type=range]::-webkit-slider-runnable-track {
          height: 3px; border-radius: 2px;
          background: rgba(255,255,255,0.06);
        }
        input[type=range]::-moz-range-thumb {
          width: 14px; height: 14px;
          border-radius: 50%;
          background: #FFD400;
          box-shadow: 0 0 0 3px rgba(255,212,0,0.15), -8px 0 14px 2px rgba(255,212,0,0.35);
          cursor: pointer; border: 2px solid rgba(0,0,0,0.6);
        }
      `}</style>

      <SkyLensModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        object={modalObject}
        issContext={issContextString}
      />
    </div>
  )
}
