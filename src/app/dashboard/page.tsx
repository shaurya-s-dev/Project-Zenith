'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

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

function fmt(s: number) {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60
  return `+${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
}

const badge = (t: string) => ({
  ISS: { bg: 'rgba(0,255,136,0.1)', color: '#00FF88', border: '1px solid rgba(0,255,136,0.3)' },
  SAT: { bg: 'rgba(0,212,255,0.1)', color: '#00D4FF', border: '1px solid rgba(0,212,255,0.3)' },
  DEBRIS: { bg: 'rgba(255,107,53,0.1)', color: '#FF6B35', border: '1px solid rgba(255,107,53,0.3)' },
}[t] || {})

const NAV = [['MISSION CONTROL','/dashboard'],['SKY ABOVE ME','/sky'],['SPACE WEATHER','/weather'],['SKYLENS AI','/skylens']]

export default function Dashboard() {
  const [filter, setFilter] = useState('ALL')
  const [selected, setSelected] = useState<typeof SAT_DATA[0] | null>(null)
  const [utc, setUtc] = useState('')
  const [issPos, setIssPos] = useState({ lat: 42.46, lon: -70.71 })
  const [passes, setPasses] = useState(PASSES.map(p => ({ ...p })))

  useEffect(() => {
    const t = () => setUtc(new Date().toUTCString().split(' ')[4] + ' UTC')
    t(); const i = setInterval(t, 1000); return () => clearInterval(i)
  }, [])

  useEffect(() => {
    const i = setInterval(() => setIssPos(p => ({
      lat: +(p.lat + (Math.random()-.5)*.5).toFixed(2),
      lon: +(p.lon + (Math.random()-.5)*.5).toFixed(2),
    })), 5000); return () => clearInterval(i)
  }, [])

  useEffect(() => {
    const i = setInterval(() => setPasses(p => p.map(x => ({ ...x, seconds: Math.max(0, x.seconds-1) }))), 1000)
    return () => clearInterval(i)
  }, [])

  const list = SAT_DATA.filter(s => filter === 'ALL' || s.type === filter)

  const S = { fontFamily: 'Space Mono, monospace' }

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
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00FF88', animation: 'blink 1s infinite' }} />
          <span style={{ ...S, fontSize: 10, color: '#00FF88', letterSpacing: '0.15em' }}>LIVE</span>
          <span style={{ ...S, fontSize: 11, color: '#8892A4' }}>{utc}</span>
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
              {['ALL','SAT','ISS','DEBRIS'].map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{ ...S, fontSize: 9, padding: '3px 8px', borderRadius: 4, cursor: 'pointer', background: filter===f ? 'rgba(0,212,255,0.1)' : 'transparent', color: filter===f ? '#00D4FF' : '#8892A4', border: filter===f ? '1px solid rgba(0,212,255,0.3)' : '1px solid transparent' }}>{f}</button>
              ))}
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {list.map((s, i) => (
              <motion.div key={s.id} initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ delay: i*0.03 }}
                onClick={() => setSelected(s)}
                style={{ padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', background: selected?.id===s.id ? 'rgba(0,212,255,0.05)' : 'transparent' }}
                onMouseEnter={e => { if(selected?.id!==s.id) e.currentTarget.style.background='rgba(255,255,255,0.03)' }}
                onMouseLeave={e => { e.currentTarget.style.background = selected?.id===s.id ? 'rgba(0,212,255,0.05)' : 'transparent' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                  <span style={{ ...S, fontSize: 8, padding: '1px 5px', borderRadius: 3, ...badge(s.type) }}>{s.type}</span>
                  <span style={{ ...S, fontSize: 10, color: '#fff', flex: 1 }}>{s.name}</span>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: s.type==='DEBRIS' ? '#FF6B35' : '#00FF88', animation: 'blink 1s infinite' }} />
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
                <div style={{ ...S, fontSize: 12, color: '#00D4FF', marginBottom: 8 }}>{selected.name}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 8 }}>
                  {[['LAT', selected.lat+'°'],['LON', selected.lon+'°'],['ALT', selected.alt+'km'],['SPD', selected.speed.toLocaleString()]].map(([k,v]) => (
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
        <div style={{ flex: 1, background: '#000', display: 'flex', flexDirection: 'column' }}>
          <div style={{ height: 40, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', borderBottom: '1px solid rgba(0,212,255,0.08)' }}>
            <span style={{ ...S, fontSize: 9, color: '#4A5568' }}>ZENITH / MISSION CONTROL</span>
            <span style={{ ...S, fontSize: 10, color: '#8892A4', letterSpacing: '0.2em' }}>GLOBAL TRACKING VIEW</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ ...S, fontSize: 10, color: '#00D4FF' }}>{utc}</span>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00FF88', animation: 'blink 1s infinite' }} />
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            {[520, 420, 320].map((sz, i) => (
              <div key={i} style={{ position: 'absolute', width: sz, height: sz, borderRadius: '50%', border: '1px solid rgba(0,212,255,0.06)', transform: `rotate(${[15,-15,45][i]}deg)` }} />
            ))}
            <div style={{ width: 300, height: 300, borderRadius: '50%', border: '2px solid rgba(0,212,255,0.25)', background: 'radial-gradient(circle at 35% 35%, rgba(0,212,255,0.08), rgba(0,0,60,0.4) 60%, rgba(0,0,0,0.8))', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <span style={{ ...S, fontSize: 10, color: '#8892A4' }}>GLOBE INITIALIZING...</span>
            </div>
            {[{top:'22%',left:'56%'},{top:'62%',left:'26%'},{top:'72%',left:'63%'},{top:'38%',left:'22%'}].map((pos,i) => (
              <div key={i} style={{ position: 'absolute', ...pos, width: 8, height: 8, borderRadius: '50%', background: '#00D4FF', animation: 'blink 1s infinite', animationDelay: i*0.25+'s', boxShadow: '0 0 8px rgba(0,212,255,0.8)' }} />
            ))}
          </div>

          <div style={{ height: 44, display: 'flex', alignItems: 'center', gap: 0, padding: '0 16px', borderTop: '1px solid rgba(0,212,255,0.08)' }}>
            {[['ACTIVE SATS','23,794'],['ISS ALT','408 KM'],['COVERAGE','94.2%'],['REFRESH','5s']].map(([l,v]) => (
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
              {[['ALTITUDE','408 KM'],['SPEED','27,600 KM/H'],['LAT', issPos.lat+'°'],['LON', issPos.lon+'°']].map(([l,v]) => (
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
                  <div style={{ width: pct+'%', height: '100%', background: color, borderRadius: 2 }} />
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
    </div>
  )
}