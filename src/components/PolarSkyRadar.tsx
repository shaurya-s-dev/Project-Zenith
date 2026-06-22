'use client'

import { useState, useEffect, useMemo } from 'react'

/* ─── Types ──────────────────────────────────────────────────────── */
interface CelestialObject {
  key: string
  name: string
  az: number
  el: number
  color: string
  r: number
  type: 'planet' | 'moon' | 'star'
  info: { l1: string; l2: string; l3: string }
}

interface SatPass {
  name: string
  color: string
  countdown: number
  maxEl: string
  duration: string
}

interface PolarSkyRadarProps {
  onSelectPlanet: (id: string) => void
  onSelectMoon: () => void
}

/* ─── Constants ──────────────────────────────────────────────────── */
const S: React.CSSProperties = { fontFamily: "'Space Mono', 'Courier New', monospace" }
const CX = 310, CY = 300, R = 248

const OBJECTS: CelestialObject[] = [
  { key: 'MOON',    name: 'MOON',    az: 224, el: 55, color: '#B8C4E0', r: 9,  type: 'moon',   info: { l1: 'Phase: Waxing Gibbous', l2: 'Illumination: 78%', l3: 'Distance: 384,400 km' } },
  { key: 'VENUS',   name: 'VENUS',   az: 295, el: 18, color: '#FFF5E6', r: 5,  type: 'planet', info: { l1: 'Magnitude: −4.4', l2: 'Distance: 0.84 AU', l3: 'Best: 20:00 − 21:30' } },
  { key: 'JUPITER', name: 'JUPITER', az: 148, el: 42, color: '#FCD34D', r: 7,  type: 'planet', info: { l1: 'Magnitude: −2.9', l2: 'Distance: 4.21 AU', l3: 'Best: 23:30 − 04:00' } },
  { key: 'MARS',    name: 'MARS',    az: 82,  el: 31, color: '#F87171', r: 5,  type: 'planet', info: { l1: 'Magnitude: +0.7', l2: 'Distance: 1.62 AU', l3: 'Best: 01:00 − 05:00' } },
  { key: 'SATURN',  name: 'SATURN',  az: 258, el: 22, color: '#F5C542', r: 4,  type: 'planet', info: { l1: 'Magnitude: +0.5', l2: 'Distance: 9.35 AU', l3: 'Best: 03:00 − 05:30' } },
  { key: 'SIRIUS',  name: 'SIRIUS',  az: 193, el: 38, color: '#FFFFFF', r: 4,  type: 'star',   info: { l1: 'Type: Main Sequence A1V', l2: 'Magnitude: −1.46', l3: 'Distance: 8.6 ly' } },
  { key: 'POLARIS', name: 'POLARIS', az: 0,   el: 27, color: 'rgba(255,255,255,0.6)', r: 3.5, type: 'star', info: { l1: 'Type: Supergiant F7Ib', l2: 'Magnitude: +1.98', l3: 'Distance: 433 ly' } },
]

const INIT_PASSES: SatPass[] = [
  { name: 'ISS',           color: '#00FF88', countdown: 1394, maxEl: '72°', duration: '6m 12s' },
  { name: 'STARLINK-3112', color: '#00D4FF', countdown: 2702, maxEl: '45°', duration: '3m 48s' },
  { name: 'HUBBLE',        color: '#9B59FF', countdown: 4353, maxEl: '31°', duration: '4m 22s' },
  { name: 'TIANGONG',      color: '#FF6B35', countdown: 7511, maxEl: '58°', duration: '5m 05s' },
]

/* ─── Helpers ────────────────────────────────────────────────────── */
function toRad(d: number) { return (d * Math.PI) / 180 }

function polarXY(az: number, el: number) {
  const frac = 1 - el / 90
  return {
    x: CX + R * frac * Math.sin(toRad(az)),
    y: CY - R * frac * Math.cos(toRad(az)),
  }
}

function fmtCountdown(s: number) {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return `+${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

/* ─── Component ──────────────────────────────────────────────────── */
export default function PolarSkyRadar({ onSelectPlanet, onSelectMoon }: PolarSkyRadarProps) {
  const [utc, setUtc] = useState('')
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [passes, setPasses] = useState(INIT_PASSES.map(p => ({ ...p })))
  const [locLabel, setLocLabel] = useState('28.614°N, 77.209°E')
  const [locStatus, setLocStatus] = useState<'default' | 'detected' | 'denied'>('default')

  // UTC clock
  useEffect(() => {
    const tick = () => {
      const d = new Date()
      setUtc(
        `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}:${String(d.getUTCSeconds()).padStart(2, '0')} UTC`
      )
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  // Countdown timers
  useEffect(() => {
    const id = setInterval(() => {
      setPasses(prev => prev.map(p => ({ ...p, countdown: Math.max(0, p.countdown - 1) })))
    }, 1000)
    return () => clearInterval(id)
  }, [])

  // Geolocation
  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocStatus('denied')
      return
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        const lat = pos.coords.latitude
        const lon = pos.coords.longitude
        setLocLabel(`${Math.abs(lat).toFixed(3)}°${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lon).toFixed(3)}°${lon >= 0 ? 'E' : 'W'}`)
        setLocStatus('detected')
      },
      () => setLocStatus('denied'),
      { enableHighAccuracy: false, timeout: 3000, maximumAge: 600000 }
    )
  }

  const showInfo = (key: string) => setSelectedKey(key)
  const hideInfo = () => setSelectedKey(null)

  const selectedObj = useMemo(() => OBJECTS.find(o => o.key === selectedKey), [selectedKey])

  // ISS arc points (NW → near zenith → SE)
  const issArc = useMemo(() => {
    const pts: { az: number; el: number }[] = [
      { az: 317, el: 5 }, { az: 330, el: 25 }, { az: 350, el: 55 },
      { az: 20, el: 78 }, { az: 80, el: 55 }, { az: 120, el: 30 }, { az: 145, el: 8 },
    ]
    return pts.map(p => polarXY(p.az, p.el))
  }, [])

  // STARLINK arc points (N → S)
  const starlinkArc = useMemo(() => {
    const pts: { az: number; el: number }[] = [
      { az: 355, el: 8 }, { az: 5, el: 30 }, { az: 10, el: 50 },
      { az: 175, el: 45 }, { az: 180, el: 25 }, { az: 185, el: 6 },
    ]
    return pts.map(p => polarXY(p.az, p.el))
  }, [])

  // Build SVG path from points
  const buildPath = (pts: { x: number; y: number }[]) => {
    if (pts.length < 2) return ''
    let d = `M ${pts[0].x} ${pts[0].y}`
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1]
      const curr = pts[i]
      const cpx = (prev.x + curr.x) / 2
      const cpy = (prev.y + curr.y) / 2
      d += ` Q ${prev.x + (curr.x - prev.x) * 0.3} ${prev.y + (curr.y - prev.y) * 0.1} ${cpx} ${cpy}`
    }
    const last = pts[pts.length - 1]
    d += ` L ${last.x} ${last.y}`
    return d
  }

  const issPathD = buildPath(issArc)
  const starlinkPathD = buildPath(starlinkArc)

  return (
    <div style={{
      background: '#00040f',
      borderRadius: 12,
      overflow: 'hidden',
      ...S,
    }}>
      {/* ── HEADER BAR ─────────────────────────────────────────── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '10px 16px',
        borderBottom: '1px solid rgba(0,212,255,0.1)',
        background: 'rgba(255,255,255,0.015)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 7, height: 7, borderRadius: '50%', background: '#00FF88',
            animationName: 'pulse-cyan',
            animationDuration: '2s',
            animationTimingFunction: 'ease-in-out',
            animationIterationCount: 'infinite',
          }} />
          <span style={{ fontSize: 10, color: '#00D4FF', letterSpacing: '0.25em', fontWeight: 700 }}>
            POLAR SKY RADAR
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 8, color: '#8892A4', letterSpacing: '0.1em' }}>
            {locLabel}
          </span>
          <span style={{ fontSize: 9, color: '#00D4FF', letterSpacing: '0.08em', fontWeight: 600 }}>
            {utc}
          </span>
        </div>
      </div>

      {/* ── MAIN AREA ──────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px' }}>

        {/* ── RADAR SVG ──────────────────────────────────────── */}
        <div style={{ padding: '8px 12px', position: 'relative' }}>
          <svg viewBox="0 0 620 600" style={{ width: '100%', height: 'auto', display: 'block' }}>
            <defs>
              {/* Sweep gradient */}
              <radialGradient id="sweepGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#00D4FF" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#00D4FF" stopOpacity="0" />
              </radialGradient>
              {/* Clip to radar circle */}
              <clipPath id="radarClip">
                <circle cx={CX} cy={CY} r={R} />
              </clipPath>
            </defs>

            {/* ── Concentric rings ─── */}
            <circle cx={CX} cy={CY} r={248} fill="none" stroke="rgba(0,212,255,0.2)" strokeWidth="1" />
            <circle cx={CX} cy={CY} r={165} fill="none" stroke="rgba(0,212,255,0.1)" strokeWidth="0.8" strokeDasharray="4 3" />
            <circle cx={CX} cy={CY} r={83} fill="none" stroke="rgba(0,212,255,0.08)" strokeWidth="0.8" strokeDasharray="4 3" />
            <circle cx={CX} cy={CY} r={6} fill="rgba(0,212,255,0.15)" stroke="rgba(0,212,255,0.3)" strokeWidth="0.8" />

            {/* Ring labels */}
            <text x={CX + 252} y={CY + 4} fill="#4A5568" fontSize="7" style={S}>HORIZON</text>
            <text x={CX + 168} y={CY + 4} fill="#4A5568" fontSize="7" style={S}>60°</text>
            <text x={CX + 86} y={CY + 4} fill="#4A5568" fontSize="7" style={S}>30°</text>
            <text x={CX + 10} y={CY - 4} fill="#4A5568" fontSize="7" style={S}>ZENITH</text>

            {/* ── Crosshair spokes ─── */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => {
              const rad = toRad(angle)
              const x2 = CX + R * Math.sin(rad)
              const y2 = CY - R * Math.cos(rad)
              const isMajor = angle % 90 === 0
              return (
                <line key={angle}
                  x1={CX} y1={CY} x2={x2} y2={y2}
                  stroke={isMajor ? 'rgba(0,212,255,0.1)' : 'rgba(0,212,255,0.04)'}
                  strokeWidth={isMajor ? 0.8 : 0.5}
                />
              )
            })}

            {/* ── Cardinal labels ─── */}
            <text x={CX} y={CY - R - 8} fill="#00D4FF" fontSize="11" fontWeight="bold" textAnchor="middle" style={S}>N</text>
            <text x={CX} y={CY + R + 16} fill="#8892A4" fontSize="11" fontWeight="bold" textAnchor="middle" style={S}>S</text>
            <text x={CX + R + 12} y={CY + 4} fill="#8892A4" fontSize="11" fontWeight="bold" textAnchor="start" style={S}>E</text>
            <text x={CX - R - 12} y={CY + 4} fill="#8892A4" fontSize="11" fontWeight="bold" textAnchor="end" style={S}>W</text>

            {/* ── Rotating sweep arm ─── */}
            <g clipPath="url(#radarClip)" style={{
              transformOrigin: `${CX}px ${CY}px`,
              animationName: 'polar-sweep',
              animationDuration: '6s',
              animationTimingFunction: 'linear',
              animationIterationCount: 'infinite',
            }}>
              {/* Wedge sector */}
              <path
                d={`M ${CX} ${CY} L ${CX} ${CY - R} A ${R} ${R} 0 0 1 ${CX + R * Math.sin(toRad(30))} ${CY - R * Math.cos(toRad(30))} Z`}
                fill="url(#sweepGrad)"
              />
              {/* Leading edge line */}
              <line x1={CX} y1={CY} x2={CX} y2={CY - R} stroke="rgba(0,212,255,0.5)" strokeWidth="1" />
            </g>

            {/* ── ISS Pass Arc ──────────────────────────────── */}
            <path d={issPathD} fill="none" stroke="#00FF88" strokeWidth="1.2"
              strokeDasharray="6 4" opacity="0.5"
              style={{
                animationName: 'orbit-march',
                animationDuration: '8s',
                animationTimingFunction: 'linear',
                animationIterationCount: 'infinite',
              }}
            />
            {/* ISS Dot */}
            {(() => {
              const issPt = issArc[3] // near zenith position
              return (
                <g>
                  {/* Ping ring */}
                  <circle cx={issPt.x} cy={issPt.y} r="4" fill="none" stroke="#00FF88" strokeWidth="1.5"
                    style={{
                      animationName: 'radar-ping',
                      animationDuration: '1.8s',
                      animationTimingFunction: 'ease-out',
                      animationIterationCount: 'infinite',
                    }}
                  />
                  {/* Dot */}
                  <circle cx={issPt.x} cy={issPt.y} r="5" fill="#00FF88"
                    style={{
                      animationName: 'blip-pulse',
                      animationDuration: '1.4s',
                      animationTimingFunction: 'ease-in-out',
                      animationIterationCount: 'infinite',
                    }}
                  />
                  <text x={issPt.x} y={issPt.y - 12} fill="#00FF88" fontSize="9" fontWeight="bold" textAnchor="middle" style={S}>ISS</text>
                  <text x={issPt.x} y={issPt.y + 18} fill="rgba(0,255,136,0.5)" fontSize="7" textAnchor="middle" style={S}>PASS IN ~23 MIN</text>
                </g>
              )
            })()}

            {/* ── STARLINK Pass Arc ─────────────────────────── */}
            <path d={starlinkPathD} fill="none" stroke="#00D4FF" strokeWidth="0.8"
              strokeDasharray="4 4" opacity="0.3"
              style={{
                animationName: 'orbit-march',
                animationDuration: '10s',
                animationTimingFunction: 'linear',
                animationIterationCount: 'infinite',
              }}
            />
            {(() => {
              const slPt = starlinkArc[2]
              return (
                <g>
                  <circle cx={slPt.x} cy={slPt.y} r="3" fill="#00D4FF" opacity="0.7"
                    style={{
                      animationName: 'blip-pulse',
                      animationDuration: '1.4s',
                      animationTimingFunction: 'ease-in-out',
                      animationIterationCount: 'infinite',
                      animationDelay: '0.5s',
                    }}
                  />
                  <text x={slPt.x} y={slPt.y - 8} fill="rgba(0,212,255,0.6)" fontSize="8" textAnchor="middle" style={S}>STRLINK</text>
                </g>
              )
            })()}

            {/* ── Celestial objects ──────────────────────────── */}
            {OBJECTS.map((obj, i) => {
              const { x, y } = polarXY(obj.az, obj.el)
              return (
                <g key={obj.key} onClick={() => showInfo(obj.key)} style={{ cursor: 'pointer' }}>
                  {/* Moon special rendering */}
                  {obj.type === 'moon' && (
                    <>
                      <circle cx={x} cy={y} r={14} fill="none" stroke="rgba(184,196,224,0.25)" strokeWidth="1"
                        style={{
                          animationName: 'moon-pulse',
                          animationDuration: '3s',
                          animationTimingFunction: 'ease-in-out',
                          animationIterationCount: 'infinite',
                        }}
                      />
                      <circle cx={x} cy={y} r={obj.r} fill={obj.color} />
                      <circle cx={x - 3} cy={y - 2} r={5} fill="#00040f" opacity="0.5" />
                    </>
                  )}

                  {/* Saturn special rendering */}
                  {obj.key === 'SATURN' && (
                    <>
                      <circle cx={x} cy={y} r={obj.r} fill={obj.color}
                        style={{
                          animationName: 'blip-pulse',
                          animationDuration: '1.4s',
                          animationTimingFunction: 'ease-in-out',
                          animationIterationCount: 'infinite',
                          animationDelay: `${0.3 + i * 0.4}s`,
                        }}
                      />
                      <ellipse cx={x} cy={y} rx={8} ry={3} fill="none" stroke={obj.color} strokeWidth="0.8" opacity="0.6"
                        transform={`rotate(-15 ${x} ${y})`}
                      />
                    </>
                  )}

                  {/* Standard planet/star rendering */}
                  {obj.type !== 'moon' && obj.key !== 'SATURN' && (
                    <circle cx={x} cy={y} r={obj.r} fill={obj.color}
                      style={{
                        animationName: 'blip-pulse',
                        animationDuration: '1.4s',
                        animationTimingFunction: 'ease-in-out',
                        animationIterationCount: 'infinite',
                        animationDelay: `${0.3 + i * 0.4}s`,
                      }}
                    />
                  )}

                  {/* Labels */}
                  <text x={x} y={y + obj.r + 12} fill="rgba(255,255,255,0.7)" fontSize="9" textAnchor="middle" style={S}>{obj.name}</text>
                  <text x={x} y={y + obj.r + 22} fill="#4A5568" fontSize="8" textAnchor="middle" style={S}>
                    {obj.az}°/{obj.el}°
                  </text>
                </g>
              )
            })}

            {/* ── Info popup panel ──────────────────────────── */}
            {selectedObj && (
              <g>
                <rect x={30} y={30} width={210} height={115} rx={8}
                  fill="rgba(0,4,15,0.93)" stroke="rgba(0,212,255,0.3)" strokeWidth="1" />
                <text x={44} y={54} fill="#00D4FF" fontSize="11" fontWeight="bold" style={S}>{selectedObj.name}</text>
                <text x={44} y={72} fill="#fff" fontSize="10" style={S}>{selectedObj.info.l1}</text>
                <text x={44} y={88} fill="#8892A4" fontSize="9" style={S}>{selectedObj.info.l2}</text>
                <text x={44} y={104} fill="#8892A4" fontSize="9" style={S}>{selectedObj.info.l3}</text>
                {/* Close button */}
                <g onClick={(e) => { e.stopPropagation(); hideInfo() }} style={{ cursor: 'pointer' }}>
                  <text x={222} y={48} fill="#8892A4" fontSize="12" textAnchor="middle" style={S}>✕</text>
                </g>
                {/* Open detail button */}
                <g onClick={(e) => {
                  e.stopPropagation()
                  if (selectedObj.type === 'moon') onSelectMoon()
                  else if (selectedObj.type === 'planet') onSelectPlanet(selectedObj.key)
                  hideInfo()
                }} style={{ cursor: 'pointer' }}>
                  <rect x={44} y={110} width={80} height={18} rx={3}
                    fill="rgba(0,212,255,0.08)" stroke="rgba(0,212,255,0.2)" strokeWidth="0.5" />
                  <text x={84} y={123} fill="#00D4FF" fontSize="8" textAnchor="middle" style={S}>VIEW DETAILS →</text>
                </g>
              </g>
            )}
          </svg>
        </div>

        {/* ── SIDEBAR ────────────────────────────────────────── */}
        <div style={{
          borderLeft: '1px solid rgba(0,212,255,0.1)',
          padding: '12px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          overflowY: 'auto',
          maxHeight: 600,
        }}>
          {/* Section 1: Upcoming Passes */}
          <div>
            <div style={{ fontSize: 9, color: '#8892A4', letterSpacing: '0.25em', marginBottom: 8, fontWeight: 600 }}>
              UPCOMING PASSES
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {passes.map(p => (
                <div key={p.name} style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: 8,
                  padding: '8px 10px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: 9, color: p.color, fontWeight: 700, letterSpacing: '0.05em' }}>{p.name}</span>
                    <span style={{
                      fontSize: 9,
                      color: p.countdown < 300 ? '#FF6B35' : '#00D4FF',
                      fontWeight: 600,
                      letterSpacing: '0.05em',
                    }}>
                      {fmtCountdown(p.countdown)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 8, color: '#4A5568' }}>MAX EL: {p.maxEl}</span>
                    <span style={{ fontSize: 8, color: '#4A5568' }}>DUR: {p.duration}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Visible Now */}
          <div>
            <div style={{ fontSize: 9, color: '#8892A4', letterSpacing: '0.25em', marginBottom: 8, fontWeight: 600 }}>
              VISIBLE NOW
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {OBJECTS.filter(o => o.type !== 'star').map(obj => (
                <div key={obj.key}
                  onClick={() => showInfo(obj.key)}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '5px 8px', borderRadius: 4, cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: obj.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 9, color: '#fff' }}>{obj.name}</span>
                  </div>
                  <span style={{ fontSize: 8, color: '#4A5568' }}>{obj.el}°</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Legend */}
          <div>
            <div style={{ fontSize: 9, color: '#8892A4', letterSpacing: '0.25em', marginBottom: 8, fontWeight: 600 }}>
              LEGEND
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {[
                { color: '#00FF88', label: 'Satellite Pass' },
                { color: '#FFF5E6', label: 'Planet' },
                { color: '#B8C4E0', label: 'Moon' },
              ].map(l => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: l.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 8, color: '#8892A4' }}>{l.label}</span>
                </div>
              ))}
              <div style={{ fontSize: 7, color: '#4A5568', marginTop: 4, lineHeight: 1.5 }}>
                Outer ring = horizon (0°)<br />
                Dashed rings = 30° / 60°<br />
                Center = zenith (90°)
              </div>
            </div>
          </div>

          {/* USE MY LOCATION */}
          <button
            onClick={requestLocation}
            style={{
              ...S,
              width: '100%',
              fontSize: 9,
              letterSpacing: '0.1em',
              color: locStatus === 'detected' ? '#00FF88' : '#00D4FF',
              background: 'transparent',
              border: `1px solid ${locStatus === 'detected' ? 'rgba(0,255,136,0.3)' : 'rgba(0,212,255,0.3)'}`,
              borderRadius: 6,
              padding: '7px 0',
              cursor: 'pointer',
              transition: 'all 0.2s',
              marginTop: 'auto',
            }}
          >
            {locStatus === 'detected' ? '✓ LOCATION DETECTED' : locStatus === 'denied' ? 'LOCATION DENIED · DEFAULT' : '📍 USE MY LOCATION'}
          </button>
        </div>
      </div>

      {/* ── FOOTER BAR ─────────────────────────────────────────── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '8px 16px',
        borderTop: '1px solid rgba(0,212,255,0.1)',
        background: 'rgba(255,255,255,0.015)',
      }}>
        <span style={{ fontSize: 8, color: '#4A5568', letterSpacing: '0.08em' }}>
          SWEEP: 6s PERIOD · {OBJECTS.length} OBJECTS TRACKED
        </span>
        <span style={{ fontSize: 8, color: '#8892A4', letterSpacing: '0.08em' }}>
          CLICK ANY OBJECT FOR DETAILS
        </span>
      </div>
    </div>
  )
}
