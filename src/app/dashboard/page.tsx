'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Globe from '@/components/Globe'
import { InfoRayButton } from '@/components/InfoRayButton'
import SkyLensModal from '@/components/SkyLensModal'
import ConjunctionWarning from '@/components/ConjunctionWarning'
import SysMon from '@/components/SysMon'
import LaunchCountdownWidget from '@/components/LaunchCountdownWidget'
import HolographicGrid from '@/components/HolographicGrid'
import { useHologram } from '@/components/TabNav'
import { exportMissionLog } from '@/lib/exportPdf'
import { useISSData } from '@/hooks/useISSData'
import KeyboardShortcuts from '@/components/KeyboardShortcuts'
import { useTheme, THEME_ORDER } from '@/components/ThemeProvider'
import { SkeletonLine } from '@/components/Skeleton'
import Tooltip from '@/components/Tooltip'
import { usePulseOnChange } from '@/hooks/usePulse'

const SAT_DATA = [
  { id: 'ISS', name: 'ISS (ZARYA)', type: 'ISS', status: 'GREEN', lat: 42.46, lon: -70.71, alt: 408, speed: 27600 },
  { id: 'TG', name: 'TIANGONG (CSS)', type: 'SAT', status: 'GREEN', lat: 33.94, lon: -118.12, alt: 390, speed: 27600 },
  { id: 'HST', name: 'HUBBLE (HST)', type: 'SAT', status: 'GREEN', lat: 28.03, lon: -80.90, alt: 547, speed: 27300 },
  { id: 'SL1007', name: 'STARLINK-1007', type: 'SAT', status: 'GREEN', lat: -12.65, lon: 131.02, alt: 550, speed: 27000 },
  { id: 'SL1012', name: 'STARLINK-1012', type: 'SAT', status: 'GREEN', lat: 23.11, lon: -45.33, alt: 550, speed: 27000 },
  { id: 'SL1023', name: 'STARLINK-1023', type: 'SAT', status: 'YELLOW', lat: 51.5, lon: -0.12, alt: 540, speed: 26900 },
  { id: 'SL1045', name: 'STARLINK-1045', type: 'SAT', status: 'GREEN', lat: -23.5, lon: -46.6, alt: 550, speed: 27000 },
  { id: 'SL1056', name: 'STARLINK-1056', type: 'SAT', status: 'GREEN', lat: -45.2, lon: 165.1, alt: 550, speed: 27000 },
  { id: 'SL1067', name: 'STARLINK-1067', type: 'SAT', status: 'YELLOW', lat: 67.8, lon: 22.0, alt: 545, speed: 26950 },
  { id: 'SL1078', name: 'STARLINK-1078', type: 'SAT', status: 'GREEN', lat: 11.0, lon: -165.0, alt: 550, speed: 27000 },
  { id: 'SL1089', name: 'STARLINK-1089', type: 'SAT', status: 'GREEN', lat: -36.4, lon: -135.6, alt: 550, speed: 27000 },
  { id: 'GPS1', name: 'GPS IIF-1', type: 'SAT', status: 'GREEN', lat: 55.22, lon: 44.11, alt: 20200, speed: 14000 },
  { id: 'GPS2', name: 'GPS IIF-2', type: 'SAT', status: 'GREEN', lat: -10.2, lon: 120.4, alt: 20200, speed: 14000 },
  { id: 'GPS3', name: 'GPS IIF-3', type: 'SAT', status: 'YELLOW', lat: 38.5, lon: -9.4, alt: 20180, speed: 13980 },
  { id: 'IR1', name: 'IRIDIUM-1', type: 'SAT', status: 'GREEN', lat: 45.1, lon: 65.2, alt: 780, speed: 26800 },
  { id: 'IR2', name: 'IRIDIUM-2', type: 'SAT', status: 'GREEN', lat: -5.6, lon: 35.8, alt: 780, speed: 26800 },
  { id: 'IR3', name: 'IRIDIUM-3', type: 'SAT', status: 'GREEN', lat: 12.3, lon: -85.4, alt: 780, speed: 26800 },
  { id: 'C2542', name: 'COSMOS-2542', type: 'CLASSIFIED', status: 'BLUE', lat: 62.4, lon: -25.7, alt: 360, speed: 27800 },
  { id: 'C2543', name: 'COSMOS-2543', type: 'CLASSIFIED', status: 'BLUE', lat: -25.4, lon: 134.2, alt: 380, speed: 27750 },
  { id: 'C2544', name: 'COSMOS-2544', type: 'CLASSIFIED', status: 'BLUE', lat: 48.7, lon: 42.3, alt: 370, speed: 27820 },
  { id: 'N19', name: 'NOAA-19', type: 'SAT', status: 'GREEN', lat: 29.5, lon: 94.2, alt: 870, speed: 26100 },
  { id: 'N20', name: 'NOAA-20', type: 'SAT', status: 'GREEN', lat: 1.3, lon: 103.8, alt: 824, speed: 26200 },
  { id: 'N21', name: 'NOAA-21', type: 'SAT', status: 'GREEN', lat: -15.8, lon: -170.3, alt: 824, speed: 26200 },
  { id: 'G16', name: 'GOES-16', type: 'SAT', status: 'GREEN', lat: 0.0, lon: -75.2, alt: 35786, speed: 11070 },
  { id: 'G17', name: 'GOES-17', type: 'SAT', status: 'GREEN', lat: 0.0, lon: -137.2, alt: 35786, speed: 11070 },
  { id: 'G18', name: 'GOES-18', type: 'SAT', status: 'GREEN', lat: 0.0, lon: -137.0, alt: 35780, speed: 11070 },
  { id: 'S6A', name: 'SENTINEL-6A', type: 'SAT', status: 'GREEN', lat: 35.0, lon: -4.5, alt: 1336, speed: 25900 },
  { id: 'S6B', name: 'SENTINEL-6B', type: 'SAT', status: 'GREEN', lat: -3.5, lon: 132.8, alt: 1336, speed: 25900 },
  { id: 'L8', name: 'LANDSAT-8', type: 'SAT', status: 'GREEN', lat: 38.9, lon: -77.0, alt: 705, speed: 26600 },
  { id: 'L9', name: 'LANDSAT-9', type: 'SAT', status: 'GREEN', lat: -23.6, lon: -46.5, alt: 705, speed: 26600 },
  { id: 'DB22', name: 'DEBRIS-2022-041A', type: 'DEBRIS', status: 'RED', lat: -33.0, lon: 150.0, alt: 380, speed: 27800 },
  { id: 'DB23', name: 'DEBRIS-2023-089B', type: 'DEBRIS', status: 'RED', lat: 40.7, lon: -74.0, alt: 420, speed: 27700 },
  { id: 'DB24', name: 'DEBRIS-2024-012C', type: 'DEBRIS', status: 'RED', lat: 3.5, lon: 112.8, alt: 340, speed: 27950 },
  { id: 'OBJ123', name: 'OBJECT 12345 (CLASSIFIED)', type: 'CLASSIFIED', status: 'BLUE', lat: 40.0, lon: -110.0, alt: 250, speed: 28200 }
]

const PASSES = [
  { sat: 'ISS', seconds: 1394, elevation: '72°', direction: 'NW→SE' },
  { sat: 'STARLINK', seconds: 2702, elevation: '45°', direction: 'N→S' },
  { sat: 'HUBBLE', seconds: 4353, elevation: '31°', direction: 'SW→NE' },
  { sat: 'TIANGONG', seconds: 7511, elevation: '58°', direction: 'W→E' },
]

const PASS_MAX = Math.max(...PASSES.map(p => p.seconds))

const SAT_META: Record<string, { norad: string; launch: string; operator: string; orbit: string }> = {
  ISS:  { norad: '25544', launch: '1998-11-20', operator: 'NASA / Roscosmos / ESA / JAXA / CSA', orbit: 'LEO' },
  HST:  { norad: '20580', launch: '1990-04-24', operator: 'NASA / ESA',                          orbit: 'LEO' },
  TG:   { norad: '48274', launch: '2021-04-29', operator: 'CMSA (China)',                        orbit: 'LEO' },
  GPS1: { norad: '40730', launch: '2015-10-31', operator: 'US Space Force',                      orbit: 'MEO' },
  L9:   { norad: '49260', launch: '2021-09-27', operator: 'NASA / USGS',                          orbit: 'LEO · Sun-sync' },
}

function hashStr(s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

function getSatMeta(s: { id: string; name: string; type: string; alt: number }) {
  if (SAT_META[s.id]) return SAT_META[s.id]
  if (s.name.startsWith('STARLINK')) {
    return { norad: String(40000 + (hashStr(s.id) % 9999)), launch: '2020 – 2024', operator: 'SpaceX', orbit: 'LEO' }
  }
  if (s.type === 'DEBRIS') return { norad: '—', launch: 'Unknown', operator: 'N/A · fragment', orbit: 'Decaying LEO' }
  return {
    norad: String(30000 + (hashStr(s.id) % 9999)), launch: 'Unknown', operator: 'Unknown',
    orbit: s.alt < 2000 ? 'LEO' : s.alt < 35000 ? 'MEO' : 'GEO',
  }
}

const NO_DATA = { lat: 0, lon: 0, alt: 0, vel: 0, live: false, latencyMs: undefined as number | undefined }

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
  CLASSIFIED: { bg: 'rgba(155,89,255,0.1)', color: '#9B59FF', border: '1px solid rgba(155,89,255,0.3)' },
}[t] || {})

// Status dot component
function StatusDot({ status }: { status: string }) {
  const style: React.CSSProperties = {
    width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
  }
  if (status === 'GREEN') {
    style.background = '#00FF88'
    style.boxShadow = '0 0 6px rgba(0,255,136,0.6)'
    style.animation = 'blink 1.8s infinite'
  } else if (status === 'YELLOW') {
    style.background = '#FFD400'
    style.boxShadow = '0 0 6px rgba(255,212,0,0.6)'
    style.animation = 'blink 1.2s infinite'
  } else if (status === 'RED') {
    style.background = '#FF3B3B'
    style.boxShadow = '0 0 6px rgba(255,59,59,0.6)'
    style.animation = 'flicker-noise 0.8s infinite'
  } else { // BLUE
    style.background = '#00D4FF'
    style.boxShadow = '0 0 6px rgba(0,212,255,0.6)'
    style.animation = 'heartbeat 2s infinite'
  }
  return <div style={style} />
}

export default function Dashboard() {
  const [filter, setFilter] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [selected, setSelected] = useState<typeof SAT_DATA[0] | null>(null)
  const [utc, setUtc] = useState('')
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
  const [globePaused, setGlobePaused] = useState(false)
  const [skylensOpen, setSkylensOpen] = useState(false)
  const globeRef = useRef<HTMLDivElement>(null)

  const { data: issPos = NO_DATA, isFetching: issFetching } = useISSData()
  const { hologramOn } = useHologram()
  const { setTheme } = useTheme()

  // Odometer digit animation
  const prevSpeedDisplay = useRef(0)
  const [displaySpeed, setDisplaySpeed] = useState(0)

  const speedTier = Math.floor(displaySpeed / 500)
  const speedPulse = usePulseOnChange(speedTier)

  useEffect(() => {
    const t = () => setUtc(new Date().toUTCString().split(' ')[4] + ' UTC')
    t(); const i = setInterval(t, 1000); return () => clearInterval(i)
  }, [])

  useEffect(() => {
    const i = setInterval(() => setPasses(p => p.map(x => ({ ...x, seconds: Math.max(0, x.seconds - 1) }))), 1000)
    return () => clearInterval(i)
  }, [])

  // Keyboard shortcut callbacks
  const kbdCallbacks = {
    onTogglePause: () => setGlobePaused(p => !p),
    onResetCamera: () => {},
    onToggleFullscreen: () => { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen() },
    onToggleSkylens: () => setSkylensOpen(o => !o),
    onTheme: (idx: number) => setTheme(THEME_ORDER[idx % THEME_ORDER.length]),
  }

  // Live speed simulator
  useEffect(() => {
    if (!selected) return
    setCurrentSpeed(selected.speed)
    setDisplaySpeed(selected.speed)
  }, [selected])

  useEffect(() => {
    if (!selected) return
    const i = setInterval(() => {
      const base = selected.speed
      const v = base + Math.round((Math.random() - 0.5) * 80)
      setCurrentSpeed(v)
      setSpeedDelta(v - prevSpeedRef.current)
      prevSpeedRef.current = v
    }, 2000)
    return () => clearInterval(i)
  }, [selected])

  useEffect(() => {
    let frameId: number
    const step = () => {
      const diff = currentSpeed - prevSpeedDisplay.current
      if (Math.abs(diff) < 1) {
        setDisplaySpeed(currentSpeed)
        prevSpeedDisplay.current = currentSpeed
      } else {
        const nextSpeed = prevSpeedDisplay.current + diff * 0.12
        setDisplaySpeed(Math.round(nextSpeed))
        prevSpeedDisplay.current = nextSpeed
        frameId = requestAnimationFrame(step)
      }
    }
    frameId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frameId)
  }, [currentSpeed])

  // Simulation time loop
  useEffect(() => {
    if (isPlaying) {
      playRef.current = setInterval(() => {
        setTimeOffset(o => {
          if (o >= 24) {
            setIsPlaying(false)
            return 24
          }
          return o + 0.25
        })
      }, 500)
    } else {
      if (playRef.current) clearInterval(playRef.current)
    }
    return () => { if (playRef.current) clearInterval(playRef.current) }
  }, [isPlaying])

  const handleInfoClick = (sat: typeof SAT_DATA[0]) => {
    setModalObject(sat); setModalOpen(true)
  }

  const list = SAT_DATA.filter(s => {
    const matchesFilter = filter === 'ALL' || s.type === filter
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.type.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })
  const S = { fontFamily: 'Space Mono, monospace' }

  // PDF export listener (must come after list declaration)
  useEffect(() => {
    const handler = () => {
      exportMissionLog({
        globeElement: globeRef.current,
        trackedObjects: list,
        kp: null,
        solarWind: null,
        passes: passes.map(p => ({ sat: p.sat, time: fmt(p.seconds), elevation: p.elevation })),
        location: 'Dashboard',
      })
    }
    window.addEventListener('zenith-export-pdf', handler)
    return () => window.removeEventListener('zenith-export-pdf', handler)
  }, [list, passes])
  const issContextString = issPos.vel ? `ISS: lat ${issPos.lat}°, lon ${issPos.lon}°, altitude ${issPos.alt} km, velocity ${issPos.vel.toLocaleString()} km/h.` : ''
  const isTimeTravel = timeOffset !== 0
  const displayTime = isTimeTravel ? getSimulatedTime(timeOffset) : utc
  const speedColor = displaySpeed > 28000 ? '#FF6B35' : displaySpeed > 26000 ? '#FFD400' : '#00D4FF'
  const speedPct = Math.min(100, (displaySpeed / 30000) * 100)

  return (
    <div style={{ height: 'calc(100vh - 52px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* LEFT PANEL - Tracked Objects */}
        <div className="animate-card-glow hover-lift" style={{ width: 280, flexShrink: 0, background: 'rgba(8,10,16,0.92)', borderRight: '1px solid rgba(0,212,255,0.12)', display: 'flex', flexDirection: 'column' }}>
          <ConjunctionWarning satellites={SAT_DATA} />

          <div style={{ padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ ...S, fontSize: 9, color: '#8892A4', letterSpacing: '0.3em' }}>TRACKED OBJECTS</span>
              <span style={{ ...S, fontSize: 12, color: 'var(--theme-primary, #00D4FF)' }}>{list.length}</span>
            </div>

            {/* Search Input */}
            <input
              type="text"
              placeholder="🔍 Filter satellites..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                ...S,
                width: '100%',
                fontSize: 10,
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 4,
                padding: '5px 8px',
                color: '#fff',
                marginBottom: 8,
                outline: 'none',
              }}
            />

            <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              {['ALL', 'SAT', 'ISS', 'DEBRIS', 'CLASSIFIED'].map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{
                  ...S, fontSize: 8, padding: '3px 6px', borderRadius: 4, cursor: 'pointer',
                  background: filter === f ? 'rgba(0,212,255,0.12)' : 'transparent',
                  color: filter === f ? 'var(--theme-primary, #00D4FF)' : '#8892A4',
                  border: filter === f ? '1px solid rgba(0,212,255,0.3)' : '1px solid transparent',
                  marginBottom: 2,
                }}>{f}</button>
              ))}
            </div>
          </div>

          <div className="custom-scrollbar" style={{ flex: 1, maxHeight: 450, overflowY: 'auto' }}>
            {list.map((s, i) => {
              const meta = getSatMeta(s)
              const tooltipContent = (
                <div style={{ ...S, fontSize: 9, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <div style={{ fontWeight: 'bold', color: 'var(--theme-primary, #00D4FF)' }}>{s.name}</div>
                  <div><span style={{ color: '#8892A4' }}>NORAD ID:</span> {meta.norad}</div>
                  <div><span style={{ color: '#8892A4' }}>Launch:</span> {meta.launch}</div>
                  <div><span style={{ color: '#8892A4' }}>Operator:</span> {meta.operator}</div>
                  <div><span style={{ color: '#8892A4' }}>Orbit:</span> {meta.orbit}</div>
                </div>
              )
              return (
                <motion.div key={s.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}
                  onClick={() => setSelected(s)}
                  className="hover-lift"
                  style={{
                    padding: '7px 12px', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer',
                    background: selected?.id === s.id ? 'rgba(0,212,255,0.06)' : 'transparent',
                    transition: 'background 0.15s, transform 0.2s, box-shadow 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <StatusDot status={s.status} />
                    <span style={{ ...S, fontSize: 8, padding: '1px 5px', borderRadius: 3, ...badge(s.type) }}>{s.type}</span>
                    <Tooltip content={tooltipContent} color={s.status === 'GREEN' ? '#00FF88' : s.status === 'YELLOW' ? '#FFD400' : s.status === 'RED' ? '#FF3B3B' : '#00D4FF'}>
                      <span style={{ ...S, fontSize: 10, color: '#fff', flex: 1, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', cursor: 'help' }}>{s.name}</span>
                    </Tooltip>
                    <InfoRayButton onClick={() => handleInfoClick(s)} color={s.status === 'GREEN' ? '#00FF88' : s.status === 'YELLOW' ? '#FFD400' : s.status === 'RED' ? '#FF3B3B' : '#00D4FF'} size={20} />
                  </div>
                  <div style={{ display: 'flex', gap: 10, marginLeft: 18 }}>
                    <span style={{ ...S, fontSize: 8, color: '#4A5568' }}>ALT: {s.alt}km</span>
                    <span style={{ ...S, fontSize: 8, color: '#4A5568' }}>SPD: {s.speed.toLocaleString()}</span>
                  </div>
                </motion.div>
              )
            })}
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

          {/* Launch Countdown */}
          <LaunchCountdownWidget />

          {/* NEO Alert Widget */}
          <div className="animate-card-glow hover-lift" style={{
            background: 'rgba(10,10,15,0.8)',
            border: '1px solid rgba(155,89,255,0.15)',
            borderRadius: 10, padding: 12, marginTop: 10, marginBottom: 10,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <span style={{ fontSize: 12 }}>☄️</span>
              <span style={{ ...S, fontSize: 8, color: '#9B59FF', letterSpacing: '0.2em' }}>NEO WATCH ALERT</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ ...S, fontSize: 9, color: '#fff' }}>ASTEROID 2026-FT3</span>
                  <span style={{ ...S, fontSize: 7, padding: '2px 4px', borderRadius: 3, background: 'rgba(255,170,0,0.1)', color: '#FFD400', border: '1px solid rgba(255,170,0,0.2)' }}>MONITORING</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
                  <span style={{ ...S, fontSize: 7, color: '#4A5568' }}>DIST: 0.042 AU</span>
                  <span style={{ ...S, fontSize: 7, color: '#4A5568' }}>VEL: 14.8 KM/S</span>
                </div>
              </div>
            </div>
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
              onSelect={(s) => {
                const found = SAT_DATA.find(x => x.id === s.id)
                if (found) setSelected(found)
              }}
              timeOffsetHours={timeOffset}
              showConstellations={showConstellations}
              isPaused={globePaused}
            />

            {/* Live Speed Tachometer HUD */}
            <AnimatePresence>
              {selected && (
                <motion.div
                  key="speedhud"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  style={{
                    position: 'absolute', top: 14, right: 14, zIndex: 10,
                    background: 'rgba(8,10,16,0.92)',
                    border: speedPulse ? `1px solid ${speedColor}` : '1px solid rgba(0,212,255,0.15)',
                    boxShadow: speedPulse ? `0 0 20px ${speedColor}66` : '0 0 20px rgba(0,212,255,0.06)',
                    borderRadius: 12, padding: 12, width: 200,
                    backdropFilter: 'blur(12px)',
                    transition: 'border-color 0.4s ease, box-shadow 0.4s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
                    <StatusDot status={selected.status} />
                    <span style={{ ...S, fontSize: 7, color: '#8892A4', letterSpacing: '0.2em' }}>TACHOMETER</span>
                  </div>
                  <div style={{ ...S, fontSize: 9, color: 'var(--theme-primary, #00D4FF)', marginBottom: 6, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{selected.name}</div>
                  
                  {/* Speed Tachometer SVG */}
                  <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
                    <svg width="140" height="85" viewBox="0 0 140 85">
                      <defs>
                        <linearGradient id="speedGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#00FF88" />
                          <stop offset="60%" stopColor="#00D4FF" />
                          <stop offset="100%" stopColor="#FF6B35" />
                        </linearGradient>
                      </defs>
                      {/* Dial Arc */}
                      <path d="M 20 75 A 50 50 0 0 1 120 75" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" strokeLinecap="round" />
                      <path 
                        d="M 20 75 A 50 50 0 0 1 120 75" 
                        fill="none" 
                        stroke="url(#speedGrad)" 
                        strokeWidth="6" 
                        strokeDasharray="157" 
                        strokeDashoffset={157 - (Math.min(displaySpeed, 30000) / 30000) * 157} 
                        strokeLinecap="round" 
                        style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
                      />
                      {/* Needle */}
                      <g style={{ 
                        transform: `rotate(${(-180 + (Math.min(displaySpeed, 30000) / 30000) * 180)}deg)`, 
                        transformOrigin: '70px 75px',
                        transition: 'transform 0.5s cubic-bezier(0.1, 0.8, 0.3, 1)'
                      }}>
                        <line x1="70" y1="75" x2="25" y2="75" stroke="var(--theme-primary, #00D4FF)" strokeWidth="2.5" strokeLinecap="round" />
                      </g>
                      <circle cx="70" cy="75" r="4.5" fill="#fff" stroke="var(--theme-primary, #00D4FF)" strokeWidth="1.5" />
                    </svg>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, justifyContent: 'center', marginBottom: 4 }}>
                    <motion.span
                      key={Math.floor(displaySpeed / 100)}
                      style={{ ...S, fontSize: 18, color: speedColor, fontWeight: 700 }}
                    >
                      {displaySpeed.toLocaleString()}
                    </motion.span>
                    <span style={{ ...S, fontSize: 8, color: '#4A5568' }}>KM/H</span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 6, marginTop: 4 }}>
                    <span style={{ ...S, fontSize: 7, color: '#4A5568' }}>ALT: {selected.id === 'ISS' && issPos.vel ? issPos.alt : selected.alt} KM</span>
                    <span style={{ ...S, fontSize: 7, color: '#4A5568' }}>{selected.type}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pause rotation button */}
            <button
              onClick={() => setGlobePaused(p => !p)}
              style={{
                position: 'absolute', bottom: 14, left: 14, zIndex: 10,
                fontFamily: "'Space Mono', monospace", fontSize: 8, letterSpacing: '0.15em',
                color: globePaused ? '#00FF88' : '#8892A4',
                background: globePaused ? 'rgba(0,255,136,0.1)' : 'rgba(255,255,255,0.04)',
                border: globePaused ? '1px solid rgba(0,255,136,0.3)' : '1px solid rgba(255,255,255,0.1)',
                borderRadius: 6, padding: '5px 10px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 5,
                backdropFilter: 'blur(8px)',
                transition: 'all 0.2s',
              }}
            >
              <span style={{ fontSize: 10 }}>{globePaused ? '▶' : '⏸'}</span>
              {globePaused ? 'ROTATION PAUSED' : 'PAUSE ROTATION'}
            </button>

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

          {/* Phase 5: Redesigned Time Travel */}
          <div style={{
            flexShrink: 0,
            background: 'rgba(6,8,14,0.95)',
            borderTop: '1px solid rgba(255,212,0,0.12)',
            padding: '10px 14px 8px',
          }}>
            {/* Row 1: Label + controls + digital clock */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ ...S, fontSize: 7, color: '#4A5568', letterSpacing: '0.2em' }}>⏳ TIMELINE</span>
              </div>
              <button
                onClick={() => { if (timeOffset >= 24) setTimeOffset(-24); setIsPlaying(p => !p) }}
                style={{
                  ...S, fontSize: 10,
                  color: isPlaying ? '#FF6B35' : '#FFD400',
                  background: isPlaying ? 'rgba(255,107,53,0.12)' : 'rgba(255,212,0,0.08)',
                  border: `1px solid ${isPlaying ? 'rgba(255,107,53,0.4)' : 'rgba(255,212,0,0.3)'}`,
                  borderRadius: 5, padding: '2px 10px', cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {isPlaying ? '⏸ PAUSE' : '▶ PLAY'}
              </button>
              <button
                onClick={() => { setTimeOffset(0); setIsPlaying(false) }}
                style={{ ...S, fontSize: 8, color: timeOffset === 0 ? '#00FF88' : '#8892A4', background: timeOffset === 0 ? 'rgba(0,255,136,0.08)' : 'transparent', border: timeOffset === 0 ? '1px solid rgba(0,255,136,0.25)' : '1px solid rgba(255,255,255,0.08)', borderRadius: 4, padding: '2px 7px', cursor: 'pointer' }}
              >
                ↺ NOW
              </button>

              {/* Neon digital clock */}
              <div style={{
                flex: 1, textAlign: 'center',
                fontFamily: "'Space Mono', monospace", fontSize: 13,
                color: timeOffset === 0 ? '#00D4FF' : '#FFD400',
                letterSpacing: '0.15em', fontWeight: 700,
                textShadow: timeOffset === 0
                  ? '0 0 10px rgba(0,212,255,0.5), 0 0 30px rgba(0,212,255,0.2)'
                  : '0 0 10px rgba(255,212,0,0.5), 0 0 30px rgba(255,212,0,0.2)',
              }}>
                {getSimulatedTime(timeOffset)}
              </div>

              <span style={{ ...S, fontSize: 8, color: isTimeTravel ? '#FFD400' : '#00FF88' }}>
                {fmtOffset(timeOffset)}
              </span>
            </div>

            {/* Row 2: Quick-jump pills */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
              {[-24, -12, -6, -1, 0, 1, 6, 12, 24].map(h => (
                <button
                  key={h}
                  onClick={() => { setTimeOffset(h); setIsPlaying(false) }}
                  style={{
                    ...S, fontSize: 7, letterSpacing: '0.05em', flex: 1,
                    padding: '3px 0', borderRadius: 4,
                    color: timeOffset === h ? '#000' : timeOffset < 0 && h < 0 ? '#9B59FF' : timeOffset > 0 && h > 0 ? '#FFD400' : '#8892A4',
                    background: timeOffset === h
                      ? '#00D4FF'
                      : timeOffset < 0 && h < 0 ? 'rgba(155,89,255,0.08)'
                      : timeOffset > 0 && h > 0 ? 'rgba(255,212,0,0.08)'
                      : 'rgba(255,255,255,0.03)',
                    border: timeOffset === h
                      ? '1px solid #00D4FF'
                      : '1px solid rgba(255,255,255,0.06)',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  {h === 0 ? 'NOW' : h > 0 ? `+${h}h` : `${h}h`}
                </button>
              ))}
            </div>

            {/* Row 3: Comet-tail slider */}
            <div style={{ position: 'relative' }}>
              {/* Filled track with comet tail */}
              <div style={{
                position: 'absolute', top: '50%', left: 0, height: 3, borderRadius: 2,
                width: `${((timeOffset + 24) / 48) * 100}%`,
                background: timeOffset === 0 ? 'rgba(0,212,255,0.4)' : timeOffset > 0
                  ? 'linear-gradient(90deg, rgba(0,212,255,0.3), #FFD400)'
                  : 'linear-gradient(90deg, #9B59FF, rgba(0,212,255,0.3))',
                transform: 'translateY(-50%)', pointerEvents: 'none', zIndex: 1,
                boxShadow: `0 0 12px ${timeOffset === 0 ? 'rgba(0,212,255,0.4)' : timeOffset > 0 ? 'rgba(255,212,0,0.5)' : 'rgba(155,89,255,0.5)'}`,
                transition: 'width 0.1s',
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
          width: 16px; height: 16px;
          border-radius: 50%;
          background: ${timeOffset === 0 ? '#00D4FF' : timeOffset > 0 ? '#FFD400' : '#9B59FF'};
          box-shadow: 0 0 0 3px rgba(0,0,0,0.3), 0 0 16px 2px ${timeOffset === 0 ? 'rgba(0,212,255,0.5)' : timeOffset > 0 ? 'rgba(255,212,0,0.5)' : 'rgba(155,89,255,0.5)'};
          cursor: pointer; border: 2px solid rgba(0,0,0,0.6);
          transition: box-shadow 0.15s;
        }
        input[type=range]::-webkit-slider-thumb:hover {
          box-shadow: 0 0 0 5px rgba(0,0,0,0.2), 0 0 24px 4px ${timeOffset === 0 ? 'rgba(0,212,255,0.7)' : timeOffset > 0 ? 'rgba(255,212,0,0.7)' : 'rgba(155,89,255,0.7)'};
        }
        input[type=range]::-webkit-slider-runnable-track {
          height: 3px; border-radius: 2px;
          background: rgba(255,255,255,0.06);
        }
        input[type=range]::-moz-range-thumb {
          width: 16px; height: 16px;
          border-radius: 50%;
          background: ${timeOffset === 0 ? '#00D4FF' : timeOffset > 0 ? '#FFD400' : '#9B59FF'};
          box-shadow: 0 0 0 3px rgba(0,0,0,0.3), 0 0 16px 2px ${timeOffset === 0 ? 'rgba(0,212,255,0.5)' : timeOffset > 0 ? 'rgba(255,212,0,0.5)' : 'rgba(155,89,255,0.5)'};
          cursor: pointer; border: 2px solid rgba(0,0,0,0.6);
        }
      `}</style>

      <SkyLensModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        object={modalObject}
        issContext={issContextString}
      />

      <HolographicGrid enabled={hologramOn} />
      <SysMon apiLatency={issPos.latencyMs ?? null} tleLastUpdated={new Date().toISOString().slice(11, 19)} />
      <KeyboardShortcuts {...kbdCallbacks} />
    </div>
  )
}
