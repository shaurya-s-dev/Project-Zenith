'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

const NAV = [['MISSION CONTROL','/dashboard'],['SKY ABOVE ME','/sky'],['SPACE WEATHER','/weather'],['SKYLENS AI','/skylens']]
const S = { fontFamily: 'Space Mono, monospace' }

const KP_URL = 'https://services.swpc.noaa.gov/json/planetary_k_index_1m.json'
const WIND_URL = 'https://services.swpc.noaa.gov/products/solar-wind/plasma-1-day.json'
const XRAY_URL = 'https://services.swpc.noaa.gov/json/goes/primary/xrays-1-day.json'

// NOAA endpoints sometimes return array-of-arrays with a header row,
// sometimes array-of-objects. Normalize both into objects.
function normalizeRows(raw: any[]): Record<string, any>[] {
  if (raw.length && Array.isArray(raw[0])) {
    const headers = raw[0] as string[]
    return raw.slice(1).map((row: any[]) => {
      const obj: Record<string, any> = {}
      headers.forEach((h, i) => { obj[h] = row[i] })
      return obj
    })
  }
  return raw
}

function findVal(obj: Record<string, any>, includes: string) {
  const key = Object.keys(obj).find(k => k.toLowerCase().includes(includes))
  return key ? obj[key] : undefined
}

async function fetchKp(): Promise<number | null> {
  try {
    const res = await fetch(KP_URL)
    const rows = normalizeRows(await res.json())
    const last = rows[rows.length - 1]
    const v = findVal(last, 'kp_index') ?? findVal(last, 'estimated_kp') ?? findVal(last, 'kp')
    const n = parseFloat(v)
    return isNaN(n) ? null : n
  } catch { return null }
}

async function fetchWind(): Promise<{ speed: number; density: number } | null> {
  try {
    const res = await fetch(WIND_URL)
    const rows = normalizeRows(await res.json())
    for (let i = rows.length - 1; i >= 0; i--) {
      const speed = parseFloat(findVal(rows[i], 'speed'))
      const density = parseFloat(findVal(rows[i], 'density'))
      if (!isNaN(speed) && !isNaN(density)) return { speed, density }
    }
    return null
  } catch { return null }
}

async function fetchXray(): Promise<number | null> {
  try {
    const res = await fetch(XRAY_URL)
    const rows = normalizeRows(await res.json())
    const longBand = rows.filter(r => String(findVal(r, 'energy') || '').includes('0.1-0.8'))
    const pool = longBand.length ? longBand : rows
    for (let i = pool.length - 1; i >= 0; i--) {
      const flux = parseFloat(findVal(pool[i], 'flux'))
      if (!isNaN(flux) && flux > 0) return flux
    }
    return null
  } catch { return null }
}

function flareClass(flux: number | null) {
  if (flux === null) return '—'
  if (flux >= 1e-4) return 'X' + (flux / 1e-4).toFixed(1)
  if (flux >= 1e-5) return 'M' + (flux / 1e-5).toFixed(1)
  if (flux >= 1e-6) return 'C' + (flux / 1e-6).toFixed(1)
  if (flux >= 1e-7) return 'B' + (flux / 1e-7).toFixed(1)
  return 'A' + (flux / 1e-8).toFixed(1)
}

function kpInfo(kp: number | null) {
  if (kp === null) return { label: '—', color: '#4A5568', scale: '—' }
  if (kp < 4)  return { label: 'QUIET',           color: '#00FF88', scale: 'G0' }
  if (kp < 5)  return { label: 'UNSETTLED',       color: '#00D4FF', scale: 'G0' }
  if (kp < 6)  return { label: 'MINOR STORM',     color: '#FFD400', scale: 'G1' }
  if (kp < 7)  return { label: 'MODERATE STORM',  color: '#FF6B35', scale: 'G2' }
  if (kp < 8)  return { label: 'STRONG STORM',    color: '#FF6B35', scale: 'G3' }
  if (kp < 9)  return { label: 'SEVERE STORM',    color: '#FF3B3B', scale: 'G4' }
  return         { label: 'EXTREME STORM',    color: '#FF3B3B', scale: 'G5' }
}

export default function WeatherPage() {
  const [kp, setKp] = useState<number | null>(null)
  const [wind, setWind] = useState<{ speed: number; density: number } | null>(null)
  const [flux, setFlux] = useState<number | null>(null)
  const [status, setStatus] = useState<'loading'|'ok'|'partial'|'error'>('loading')
  const [now, setNow] = useState<Date | null>(null)

  const loadAll = useCallback(async () => {
    const [k, w, x] = await Promise.all([fetchKp(), fetchWind(), fetchXray()])
    setKp(k); setWind(w); setFlux(x)
    if (k === null && w === null && x === null) setStatus('error')
    else if (k === null || w === null || x === null) setStatus('partial')
    else setStatus('ok')
  }, [])

  useEffect(() => {
    loadAll()
    const i = setInterval(loadAll, 60000)
    return () => clearInterval(i)
  }, [loadAll])

  useEffect(() => {
    setNow(new Date())
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const info = kpInfo(kp)
  const kpPct = kp !== null ? Math.min(100, (kp / 9) * 100) : 0
  const auroraPossible = kp !== null && kp >= 5

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff' }}>

      <nav style={{ height: 56, background: 'rgba(0,0,0,0.9)', borderBottom: '1px solid rgba(0,212,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00D4FF', animation: 'pulse-cyan 2s infinite' }} />
          <span style={{ ...S, color: '#00D4FF', letterSpacing: '0.3em', fontSize: 14, fontWeight: 700 }}>ZENITH</span>
        </div>
        <div style={{ display: 'flex', gap: 32 }}>
          {NAV.map(([label, href]) => (
            <Link key={label} href={href} style={{ ...S, fontSize: 10, letterSpacing: '0.2em', color: href === '/weather' ? '#00D4FF' : '#8892A4', textDecoration: 'none' }}>{label}</Link>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: status === 'ok' ? '#00FF88' : status === 'error' ? '#FF6B35' : '#FFD400', animation: 'blink 1s infinite' }} />
          <span style={{ ...S, fontSize: 10, color: '#8892A4', letterSpacing: '0.15em' }}>{status === 'ok' ? 'LIVE' : status === 'partial' ? 'PARTIAL' : status === 'error' ? 'OFFLINE' : 'SYNCING'}</span>
          <span style={{ ...S, fontSize: 11, color: '#8892A4' }}>{now ? now.toUTCString().split(' ')[4] + ' UTC' : '--:--:--'}</span>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px 80px' }}>

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 32, fontWeight: 700, letterSpacing: '0.05em' }}>SPACE WEATHER</h1>
          <p style={{ ...S, fontSize: 11, color: '#8892A4', marginTop: 6 }}>Live geomagnetic and solar activity, sourced from NOAA SWPC</p>
        </motion.div>

        {/* Top stat row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
          {[
            { label: 'GEOMAGNETIC (KP)', value: kp !== null ? kp.toFixed(2) : '—', sub: info.label, color: info.color },
            { label: 'SOLAR WIND SPEED', value: wind ? Math.round(wind.speed).toLocaleString() + ' KM/S' : '—', sub: 'PLASMA VELOCITY', color: '#00D4FF' },
            { label: 'X-RAY FLUX CLASS', value: flareClass(flux), sub: 'GOES LONG BAND', color: '#9B59FF' },
          ].map((c, i) => (
            <motion.div key={c.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              style={{ background: 'rgba(10,10,15,0.8)', border: '1px solid rgba(0,212,255,0.1)', borderRadius: 12, padding: 18 }}>
              <div style={{ ...S, fontSize: 9, color: '#8892A4', letterSpacing: '0.2em', marginBottom: 10 }}>{c.label}</div>
              <div style={{ ...S, fontSize: 26, color: c.color, marginBottom: 4 }}>{c.value}</div>
              <div style={{ ...S, fontSize: 9, color: '#4A5568' }}>{c.sub}</div>
            </motion.div>
          ))}
        </div>

        {/* Kp gauge */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          style={{ background: 'rgba(10,10,15,0.8)', border: '1px solid rgba(0,212,255,0.1)', borderRadius: 12, padding: 20, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ ...S, fontSize: 9, color: '#8892A4', letterSpacing: '0.2em' }}>GEOMAGNETIC STORM SCALE</span>
            <span style={{ ...S, fontSize: 9, color: info.color }}>{info.scale} · {info.label}</span>
          </div>
          <div style={{ position: 'relative', height: 10, borderRadius: 5, overflow: 'hidden', background: 'linear-gradient(90deg, #00FF88 0%, #00FF88 44%, #00D4FF 44%, #00D4FF 55%, #FFD400 55%, #FFD400 66%, #FF6B35 66%, #FF6B35 88%, #FF3B3B 88%, #FF3B3B 100%)' }}>
            <div style={{ position: 'absolute', left: `calc(${kpPct}% - 2px)`, top: -3, width: 4, height: 16, background: '#fff', borderRadius: 2, boxShadow: '0 0 6px rgba(255,255,255,0.8)' }} />
          </div>
          <div style={{ position: 'relative', height: 14, marginTop: 4 }}>
            {[0,1,2,3,4,5,6,7,8,9].map(n => (
              <span key={n} style={{ position: 'absolute', left: `${(n/9)*100}%`, transform: n===0 ? 'none' : n===9 ? 'translateX(-100%)' : 'translateX(-50%)', ...S, fontSize: 8, color: '#4A5568' }}>{n}</span>
            ))}
          </div>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            style={{ background: 'rgba(10,10,15,0.8)', border: '1px solid rgba(0,212,255,0.1)', borderRadius: 12, padding: 18 }}>
            <div style={{ ...S, fontSize: 9, color: '#8892A4', letterSpacing: '0.2em', marginBottom: 14 }}>SOLAR WIND PLASMA</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={{ background: '#111118', borderRadius: 6, padding: 10 }}>
                <div style={{ ...S, fontSize: 8, color: '#4A5568', marginBottom: 4 }}>SPEED</div>
                <div style={{ ...S, fontSize: 14, color: '#00D4FF' }}>{wind ? Math.round(wind.speed) + ' KM/S' : '—'}</div>
              </div>
              <div style={{ background: '#111118', borderRadius: 6, padding: 10 }}>
                <div style={{ ...S, fontSize: 8, color: '#4A5568', marginBottom: 4 }}>DENSITY</div>
                <div style={{ ...S, fontSize: 14, color: '#00D4FF' }}>{wind ? wind.density.toFixed(1) + ' P/CM³' : '—'}</div>
              </div>
            </div>
            <div style={{ ...S, fontSize: 8, color: '#4A5568', marginTop: 12 }}>Solar wind drives geomagnetic activity — faster, denser streams raise Kp.</div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            style={{ background: 'rgba(10,10,15,0.8)', border: `1px solid ${auroraPossible ? 'rgba(0,255,136,0.25)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 12, padding: 18 }}>
            <div style={{ ...S, fontSize: 9, color: '#8892A4', letterSpacing: '0.2em', marginBottom: 10 }}>AURORA OUTLOOK</div>
            <div style={{ ...S, fontSize: 16, color: auroraPossible ? '#00FF88' : '#4A5568', marginBottom: 6 }}>
              {auroraPossible ? 'ELEVATED CHANCE AT HIGH LATITUDES' : 'LOW CHANCE'}
            </div>
            <div style={{ ...S, fontSize: 9, color: '#4A5568', lineHeight: 1.6 }}>
              {auroraPossible
                ? 'Current Kp ≥ 5 — aurora may be visible from northern US, Canada, UK, and similar latitudes if skies are clear.'
                : 'Current geomagnetic activity is too low for aurora outside polar regions.'}
            </div>
          </motion.div>
        </div>

        <div style={{ ...S, fontSize: 8, color: '#4A5568', marginTop: 20, textAlign: 'center' }}>
          SOURCE: NOAA SPACE WEATHER PREDICTION CENTER (SWPC) · UPDATES EVERY 60S
        </div>
      </div>
    </div>
  )
}