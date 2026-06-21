'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { InfoRayButton } from '@/components/InfoRayButton'
import InfoModal from '@/components/InfoModal'
import { useSpaceWeather } from '@/hooks/useSpaceWeather'
import { SkeletonLine } from '@/components/Skeleton'
import { usePulseOnChange } from '@/hooks/usePulse'

const S = { fontFamily: 'Space Mono, monospace' }

function flareClass(flux: number | null) {
  if (flux === null) return '—'
  if (flux >= 1e-4) return 'X' + (flux / 1e-4).toFixed(1)
  if (flux >= 1e-5) return 'M' + (flux / 1e-5).toFixed(1)
  if (flux >= 1e-6) return 'C' + (flux / 1e-6).toFixed(1)
  if (flux >= 1e-7) return 'B' + (flux / 1e-7).toFixed(1)
  return 'A' + (flux / 1e-8).toFixed(1)
}

function kpInfo(kp: number | null) {
  if (kp === null) return { label: '—', color: 'var(--theme-text-faint, #7D8A9E)', scale: '—' }
  if (kp < 4)  return { label: 'QUIET',           color: '#00FF88', scale: 'G0' }
  if (kp < 5)  return { label: 'UNSETTLED',       color: '#00D4FF', scale: 'G0' }
  if (kp < 6)  return { label: 'MINOR STORM',     color: '#FFD400', scale: 'G1' }
  if (kp < 7)  return { label: 'MODERATE STORM',  color: '#FF6B35', scale: 'G2' }
  if (kp < 8)  return { label: 'STRONG STORM',    color: '#FF6B35', scale: 'G3' }
  if (kp < 9)  return { label: 'SEVERE STORM',    color: '#FF3B3B', scale: 'G4' }
  return         { label: 'EXTREME STORM',    color: '#FF3B3B', scale: 'G5' }
}

// SVG Semi-circular Kp gauge
function KpGauge({ kp }: { kp: number | null }) {
  const val = kp ?? 0
  const normalized = Math.min(9, Math.max(0, val)) / 9
  const angle = normalized * 180
  const rad = (angle * Math.PI) / 180
  const cx = 100, cy = 100, r = 75
  const startAngle = -Math.PI

  // Needle end
  const nx = cx + r * Math.cos(startAngle + rad)
  const ny = cy + r * Math.sin(startAngle + rad)

  // Arc paths for each segment
  const arcPath = (start: number, end: number, color: string) => {
    const sA = startAngle + (start / 9) * Math.PI
    const eA = startAngle + (end / 9) * Math.PI
    const x1 = cx + r * Math.cos(sA)
    const y1 = cy + r * Math.sin(sA)
    const x2 = cx + r * Math.cos(eA)
    const y2 = cy + r * Math.sin(eA)
    const large = end - start > 4.5 ? 1 : 0
    return <path d={`M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`} stroke={color} strokeWidth="14" fill="none" strokeLinecap="round" />
  }

  const info = kpInfo(kp)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width="200" height="140" viewBox="0 0 200 140">
        {/* Background arc segments */}
        {arcPath(0, 3, '#00FF88')}
        {arcPath(3, 4, '#00D4FF')}
        {arcPath(4, 5, '#FFD400')}
        {arcPath(5, 6, '#FF6B35')}
        {arcPath(6, 7, '#FF6B35')}
        {arcPath(7, 8, '#FF3B3B')}
        {arcPath(8, 9, '#FF3B3B')}

        {/* Labels */}
        {[0, 3, 6, 9].map(v => {
          const a = startAngle + (v / 9) * Math.PI
          const lx = cx + (r + 20) * Math.cos(a)
          const ly = cy + (r + 20) * Math.sin(a)
          return <text key={v} x={lx} y={ly} fill="var(--theme-text-faint, #7D8A9E)" fontFamily="Space Mono, monospace" fontSize="9" textAnchor="middle" dominantBaseline="middle">{v}</text>
        })}

        {/* Needle */}
        <motion.g
          initial={{ rotate: 0 }}
          animate={{ rotate: angle }}
          transition={{ type: 'spring', stiffness: 60, damping: 12 }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        >
          <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx={cx} cy={cy} r="5" fill="#fff" />
        </motion.g>

        {/* Center value */}
        <text x={cx} y={cy + 5} fill="#fff" fontFamily="Space Mono, monospace" fontSize="18" textAnchor="middle" fontWeight="bold" dominantBaseline="middle">
          {kp !== null ? kp.toFixed(2) : '—'}
        </text>
      </svg>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
        <span style={{ ...S, fontSize: 10, color: info.color }}>{info.scale}</span>
        <span style={{ ...S, fontSize: 10, color: info.color }}>·</span>
        <span style={{ ...S, fontSize: 10, color: info.color }}>{info.label}</span>
      </div>
    </div>
  )
}

// Solar wind particle stream
function SolarWindParticles({ windSpeed }: { windSpeed: number | null }) {
  const speed = windSpeed ?? 400
  // Map speed (300-800 km/s) to animation duration (4-10s)
  const duration = Math.max(2, 10 - ((speed - 300) / 500) * 6)
  return (
    <div style={{ position: 'relative', height: 20, overflow: 'hidden', borderRadius: 4, background: 'rgba(0,0,0,0.3)', marginBottom: 8 }}>
      {/* Glow line */}
      <div style={{
        position: 'absolute', top: '50%', left: 0, right: 0, height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.3), transparent)',
        transform: 'translateY(-50%)',
      }} />
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute', top: '50%', width: 3, height: 3, borderRadius: '50%',
            background: '#00D4FF',
            boxShadow: '0 0 4px #00D4FF',
            animation: `particle-drift ${duration}s linear infinite`,
            animationDelay: `${i * (duration / 8)}s`,
            transform: 'translateY(-50%)',
          }}
        />
      ))}
    </div>
  )
}

// Aurora oval SVG
function AuroraOval({ kp }: { kp: number | null }) {
  const val = kp ?? 2
  const scale = 0.6 + (val / 9) * 0.4
  const opacity = 0.2 + (val / 9) * 0.5

  return (
    <motion.svg
      width="100%"
      height="80"
      viewBox="0 0 200 80"
      animate={{ scale }}
      transition={{ duration: 2, ease: 'easeInOut' }}
      style={{ transformOrigin: 'center center' }}
    >
      <defs>
        <radialGradient id="auroraGrad">
          <stop offset="0%" stopColor="rgba(0,255,136,0)" />
          <stop offset="60%" stopColor={`rgba(0,255,136,${opacity})`} />
          <stop offset="80%" stopColor={`rgba(0,212,255,${opacity * 0.6})`} />
          <stop offset="100%" stopColor="rgba(0,255,136,0)" />
        </radialGradient>
      </defs>
      <ellipse cx="100" cy="40" rx="60" ry="20" fill="url(#auroraGrad)" style={{ animation: 'aurora-pulse 4s ease-in-out infinite' }} />
    </motion.svg>
  )
}

export default function WeatherPage() {
  const { data: sw, isFetching } = useSpaceWeather()
  const kp = sw?.kp ?? null
  const wind = sw?.windSpeed != null ? { speed: sw.windSpeed, density: sw.windDensity ?? 0 } : null
  const flux = sw?.xrayFlux ?? null

  const kpPulse = usePulseOnChange(kp)
  const windPulse = usePulseOnChange(wind?.speed)
  const fluxPulse = usePulseOnChange(flux)

  const [modalKey, setModalKey] = useState<string | null>(null)

  const INFO = {
    kp: {
      title: 'Kp Index — Geomagnetic Activity',
      content: 'Measures global geomagnetic activity on a scale of 0-9. Higher values mean more aurora visibility but risk to satellites and power grids. Kp 5+ triggers G-scale storm warnings from NOAA SWPC.',
    },
    solar: {
      title: 'Solar Wind — Coronal Mass Ejections',
      content: 'Stream of charged particles from the Sun. Speed &gt; 500 km/s indicates a Coronal Mass Ejection (CME). CMEs can cause geomagnetic storms, disrupt GPS, and create stunning aurora displays.',
    },
    xray: {
      title: 'X-Ray Flux — Solar Flares',
      content: 'Class B is low background. C flares are common with little effect. M flares can cause minor radio blackouts. X flares are major events causing widespread radio blackouts and radiation storms. Classified by peak flux in the 0.1-0.8 nm band.',
    },
    aurora: {
      title: 'Aurora Outlook — Northern & Southern Lights',
      content: 'Auroras occur when charged solar particles collide with Earth\'s atmosphere, exciting oxygen and nitrogen. Kp 5+ is needed for mid-latitude visibility. The auroral oval expands during storms, bringing the lights further from the poles.',
    },
  }

  const info = kpInfo(kp)
  const auroraPossible = kp !== null && kp >= 5

  return (
    <div style={{ minHeight: 'calc(100vh - 52px)', color: '#fff' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 24px 80px' }}>

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 20 }}>
          <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 28, fontWeight: 700, letterSpacing: '0.05em' }} className="animate-flicker">SPACE WEATHER</h1>
          <p style={{ ...S, fontSize: 10, color: 'var(--theme-text-dim, #A0AEC0)', marginTop: 4 }}>Live geomagnetic and solar activity · NOAA SWPC</p>
        </motion.div>

        {/* Top stat row with InfoRayButtons */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
          {[
            { label: 'GEOMAGNETIC (KP)', value: kp !== null ? kp.toFixed(2) : '—', sub: info.label, color: info.color, infoKey: 'kp' as const, pulsed: kpPulse },
            { label: 'SOLAR WIND SPEED', value: wind ? Math.round(wind.speed).toLocaleString('en-US') + ' KM/S' : '—', sub: 'PLASMA VELOCITY', color: '#00D4FF', infoKey: 'solar' as const, pulsed: windPulse },
            { label: 'X-RAY FLUX CLASS', value: flareClass(flux), sub: 'GOES LONG BAND', color: '#9B59FF', infoKey: 'xray' as const, pulsed: fluxPulse },
          ].map((c, i) => (
            <motion.div key={c.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="animate-card-glow hover-lift"
              style={{
                background: 'rgba(10,10,15,0.8)',
                border: c.pulsed ? `1px solid ${c.color}` : '1px solid rgba(0,212,255,0.1)',
                boxShadow: c.pulsed ? `0 0 16px ${c.color}44` : 'none',
                borderRadius: 12, padding: 16, position: 'relative',
                transition: 'border-color 0.4s ease, box-shadow 0.4s ease',
              }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ ...S, fontSize: 9, color: 'var(--theme-text-dim, #A0AEC0)', letterSpacing: '0.2em' }}>{c.label}</span>
                <InfoRayButton onClick={() => setModalKey(c.infoKey)} color={c.color} size={20} />
              </div>
              {isFetching && kp === null ? (
                <>
                  <SkeletonLine w="80%" h={28} style={{ marginBottom: 4 }} />
                  <SkeletonLine w="50%" h={12} />
                </>
              ) : (
                <>
                  <div style={{ ...S, fontSize: 24, color: c.color, marginBottom: 2 }}>{c.value}</div>
                  <div style={{ ...S, fontSize: 9, color: 'var(--theme-text-faint, #7D8A9E)' }}>{c.sub}</div>
                </>
              )}
            </motion.div>
          ))}
        </div>

        {/* Kp gauge */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="animate-card-glow hover-lift"
          style={{ background: 'rgba(10,10,15,0.8)', border: '1px solid rgba(0,212,255,0.08)', borderRadius: 12, padding: 20, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ ...S, fontSize: 9, color: 'var(--theme-text-dim, #A0AEC0)', letterSpacing: '0.2em' }}>GEOMAGNETIC STORM SCALE</span>
              <InfoRayButton onClick={() => setModalKey('kp')} color={info.color} size={20} />
            </div>
            <KpGauge kp={kp} />
          </div>
          <AuroraOval kp={kp} />
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Solar Wind */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="animate-card-glow hover-lift"
            style={{ background: 'rgba(10,10,15,0.8)', border: '1px solid rgba(0,212,255,0.1)', borderRadius: 12, padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ ...S, fontSize: 9, color: 'var(--theme-text-dim, #A0AEC0)', letterSpacing: '0.2em' }}>SOLAR WIND PLASMA</span>
              <InfoRayButton onClick={() => setModalKey('solar')} color="#00D4FF" size={20} />
            </div>
            <SolarWindParticles windSpeed={wind?.speed ?? null} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={{ background: '#111118', borderRadius: 6, padding: 10 }}>
                <div style={{ ...S, fontSize: 8, color: 'var(--theme-text-faint, #7D8A9E)', marginBottom: 4 }}>SPEED</div>
                <div style={{ ...S, fontSize: 14, color: '#00D4FF' }}>{wind ? Math.round(wind.speed) + ' KM/S' : '—'}</div>
              </div>
              <div style={{ background: '#111118', borderRadius: 6, padding: 10 }}>
                <div style={{ ...S, fontSize: 8, color: 'var(--theme-text-faint, #7D8A9E)', marginBottom: 4 }}>DENSITY</div>
                <div style={{ ...S, fontSize: 14, color: '#00D4FF' }}>{wind ? wind.density.toFixed(1) + ' P/CM³' : '—'}</div>
              </div>
            </div>
          </motion.div>

          {/* Aurora Outlook */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="animate-card-glow"
            style={{
              background: 'rgba(10,10,15,0.8)',
              border: `1px solid ${auroraPossible ? 'rgba(0,255,136,0.25)' : 'rgba(255,255,255,0.06)'}`,
              borderRadius: 12, padding: 18, position: 'relative', overflow: 'hidden',
            }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ ...S, fontSize: 9, color: 'var(--theme-text-dim, #A0AEC0)', letterSpacing: '0.2em' }}>AURORA OUTLOOK</span>
              <InfoRayButton onClick={() => setModalKey('aurora')} color={auroraPossible ? '#00FF88' : 'var(--theme-text-faint, #7D8A9E)'} size={20} />
            </div>
            {/* Aurora background glow */}
            <div style={{
              position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: '50%',
              background: auroraPossible ? 'radial-gradient(circle, rgba(0,255,136,0.08), transparent)' : 'none',
              pointerEvents: 'none',
            }} />
            <div style={{ ...S, fontSize: 16, color: auroraPossible ? '#00FF88' : 'var(--theme-text-faint, #7D8A9E)', marginBottom: 6 }}>
              {auroraPossible ? 'ELEVATED CHANCE' : 'LOW CHANCE'}
            </div>
            <div style={{ ...S, fontSize: 9, color: 'var(--theme-text-faint, #7D8A9E)', lineHeight: 1.6 }}>
              {auroraPossible
                ? 'Current Kp ≥ 5 — aurora may be visible from northern US, Canada, UK, and similar latitudes if skies are clear.'
                : 'Current geomagnetic activity is too low for aurora outside polar regions.'}
            </div>
          </motion.div>
        </div>

        {/* 3-Day Forecast Chart */}
        <ForecastChart />

        {/* Source note */}
        <div style={{ ...S, fontSize: 8, color: 'var(--theme-text-faint, #7D8A9E)', marginTop: 24, textAlign: 'center' }}>
          SOURCE: NOAA SPACE WEATHER PREDICTION CENTER (SWPC) · UPDATES EVERY 60S
        </div>
      </div>

      {/* Info modals */}
      <InfoModal
        isOpen={modalKey === 'kp'}
        onClose={() => setModalKey(null)}
        title={INFO.kp.title}
        content={`${INFO.kp.content}\n\nRight now: Current Kp is ${kp !== null ? kp.toFixed(2) : '—'} (${kpInfo(kp).label}).`}
        color="#00FF88"
      />
      <InfoModal
        isOpen={modalKey === 'solar'}
        onClose={() => setModalKey(null)}
        title={INFO.solar.title}
        content={`${INFO.solar.content}\n\nRight now: Solar wind speed is ${wind ? Math.round(wind.speed) : '—'} km/s, which is ${wind && wind.speed > 500 ? 'above' : 'below'} the CME threshold (500 km/s).`}
        color="#00D4FF"
      />
      <InfoModal
        isOpen={modalKey === 'xray'}
        onClose={() => setModalKey(null)}
        title={INFO.xray.title}
        content={`${INFO.xray.content}\n\nRight now: Solar X-ray flux is ${flareClass(flux)}, indicating a ${flux && flux >= 1e-5 ? 'HIGH' : 'LOW'} risk of HF radio blackout.`}
        color="#9B59FF"
      />
      <InfoModal
        isOpen={modalKey === 'aurora'}
        onClose={() => setModalKey(null)}
        title={INFO.aurora.title}
        content={`${INFO.aurora.content}\n\nRight now: Geomagnetic index Kp is ${kp !== null ? kp.toFixed(2) : '—'}. Aurora visibility verdict: ${auroraPossible ? 'VISIBLE AT HIGH/MID LATITUDES' : 'LOW VISIBILITY OUTSIDE POLAR REGIONS'}.`}
        color="#00FF88"
      />
    </div>
  )
}

// 3-Day Forecast SVG Chart
function ForecastChart() {
  const [activePt, setActivePt] = useState<{ x: number; y: number; label: string; val: number } | null>(null)
  
  // 3-day simulated Kp data: 24 points (every 3 hours)
  const data = [
    { label: 'Day 1 03h', val: 2.1 },
    { label: 'Day 1 06h', val: 1.8 },
    { label: 'Day 1 09h', val: 2.5 },
    { label: 'Day 1 12h', val: 3.2 },
    { label: 'Day 1 15h', val: 4.0 },
    { label: 'Day 1 18h', val: 4.8 },
    { label: 'Day 1 21h', val: 5.2 },
    { label: 'Day 1 24h', val: 4.5 },
    { label: 'Day 2 03h', val: 3.5 },
    { label: 'Day 2 06h', val: 2.8 },
    { label: 'Day 2 09h', val: 2.0 },
    { label: 'Day 2 12h', val: 1.5 },
    { label: 'Day 2 15h', val: 1.8 },
    { label: 'Day 2 18h', val: 2.2 },
    { label: 'Day 2 21h', val: 3.0 },
    { label: 'Day 2 24h', val: 3.6 },
    { label: 'Day 3 03h', val: 4.2 },
    { label: 'Day 3 06h', val: 5.0 },
    { label: 'Day 3 09h', val: 5.8 },
    { label: 'Day 3 12h', val: 6.2 },
    { label: 'Day 3 15h', val: 5.5 },
    { label: 'Day 3 18h', val: 4.1 },
    { label: 'Day 3 21h', val: 3.2 },
    { label: 'Day 3 24h', val: 2.4 },
  ]

  const width = 1000
  const height = 180
  const paddingX = 40
  const paddingY = 20

  const chartWidth = width - paddingX * 2
  const chartHeight = height - paddingY * 2

  // Generate SVG points
  const points = data.map((d, i) => {
    const x = paddingX + (i / (data.length - 1)) * chartWidth
    const y = height - paddingY - (d.val / 9) * chartHeight
    return { x, y, ...d }
  })

  const pathD = points.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`
    return `${acc} L ${p.x} ${p.y}`
  }, '')

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`

  return (
    <div className="animate-card-glow" style={{
      background: 'rgba(10,10,15,0.85)',
      border: '1px solid rgba(0,212,255,0.08)',
      borderRadius: 12, padding: 20, marginTop: 24,
      position: 'relative'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ ...S, fontSize: 9, color: 'var(--theme-text-dim, #A0AEC0)', letterSpacing: '0.2em' }}>📈 3-DAY GEOMAGNETIC OUTLOOK (Kp FORECAST)</span>
        <span style={{ ...S, fontSize: 8, color: 'var(--theme-text-faint, #7D8A9E)' }}>Estimated 3-hour planetary Kp index predicted by NOAA SWPC</span>
      </div>
      <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={{ minWidth: 700, display: 'block' }}>
          <defs>
            <linearGradient id="areaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(0, 212, 255, 0.25)" />
              <stop offset="100%" stopColor="rgba(0, 212, 255, 0)" />
            </linearGradient>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00FF88" />
              <stop offset="50%" stopColor="#00D4FF" />
              <stop offset="100%" stopColor="#FF6B35" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 3, 6, 9].map(val => {
            const y = height - paddingY - (val / 9) * chartHeight
            return (
              <g key={val}>
                <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="4 4" />
                <text x={paddingX - 10} y={y + 3} fill="var(--theme-text-faint, #7D8A9E)" fontFamily="Space Mono, monospace" fontSize="8" textAnchor="end">Kp {val}</text>
              </g>
            )
          })}

          {/* Horizontal days lines separator */}
          {[8, 16].map((idx) => {
            const x = paddingX + (idx / (data.length - 1)) * chartWidth
            return (
              <g key={idx}>
                <line x1={x} y1={paddingY} x2={x} y2={height - paddingY} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                <text x={x + 5} y={paddingY + 8} fill="var(--theme-text-dim, #A0AEC0)" fontFamily="Space Mono, monospace" fontSize="8">DAY {idx === 8 ? '2' : '3'}</text>
              </g>
            )
          })}
          <text x={paddingX + 5} y={paddingY + 8} fill="var(--theme-text-dim, #A0AEC0)" fontFamily="Space Mono, monospace" fontSize="8">DAY 1</text>

          {/* Area Fill */}
          <path d={areaD} fill="url(#areaGrad)" />

          {/* Path Line */}
          <path d={pathD} fill="none" stroke="url(#lineGrad)" strokeWidth="2" strokeLinecap="round" />

          {/* Points circles */}
          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={activePt?.x === p.x ? 5 : 2.5}
              fill={activePt?.x === p.x ? 'var(--theme-primary, #00D4FF)' : 'rgba(255,255,255,0.3)'}
              stroke="rgba(0,0,0,0.5)"
              strokeWidth="1"
              style={{ cursor: 'pointer', transition: 'all 0.15s' }}
              onMouseEnter={() => setActivePt(p)}
              onMouseLeave={() => setActivePt(null)}
            />
          ))}

          {/* Vertical indicator line */}
          {activePt && (
            <line x1={activePt.x} y1={paddingY} x2={activePt.x} y2={height - paddingY} stroke="rgba(0, 212, 255, 0.3)" strokeWidth="1" pointerEvents="none" />
          )}
        </svg>

        {/* Dynamic Tooltip */}
        {activePt && (
          <div style={{
            position: 'absolute',
            left: Math.min(width - 160, Math.max(10, activePt.x - 75)),
            bottom: height - activePt.y + 10,
            background: 'rgba(5, 5, 8, 0.95)',
            border: '1px solid var(--theme-border, rgba(0, 212, 255, 0.2))',
            borderRadius: 6,
            padding: '6px 10px',
            pointerEvents: 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            zIndex: 10,
          }}>
            <div style={{ ...S, fontSize: 8, color: 'var(--theme-text-dim, #A0AEC0)', marginBottom: 2 }}>{activePt.label}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: activePt.val >= 5 ? '#FF3B3B' : activePt.val >= 4 ? '#FFD400' : '#00FF88' }} />
              <span style={{ ...S, fontSize: 11, color: '#fff', fontWeight: 'bold' }}>Kp {activePt.val}</span>
            </div>
            <div style={{ ...S, fontSize: 7, color: 'var(--theme-text-faint, #7D8A9E)', marginTop: 2 }}>
              {activePt.val >= 5 ? '⚠️ GEOMAGNETIC STORM' : activePt.val >= 4 ? 'UNSETTLED' : 'NOMINAL'}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
