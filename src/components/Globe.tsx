'use client'

import dynamic from 'next/dynamic'
import { useRef, useEffect, useMemo, useState } from 'react'
import { CONSTELLATIONS, type Constellation } from './constellations-data'

const GlobeGL = dynamic(() => import('react-globe.gl'), { ssr: false })

interface Sat {
  id: string
  name: string
  type: string
  lat: number
  lon: number
  alt: number
  speed: number
}

interface GlobeProps {
  satellites: Sat[]
  selected: Sat | null
  onSelect: (s: Sat | null) => void
  timeOffsetHours?: number
  showConstellations?: boolean
  onConstellationClick?: (c: Constellation) => void
  isPaused?: boolean
  focusCoords?: { lat: number; lon: number } | null
}

// Propagate satellite position by time offset (simple linear approximation)
// Real implementation would use SGP4, but we approximate orbital motion
function propagateSat(sat: Sat, offsetHours: number): { lat: number; lon: number } {
  if (offsetHours === 0) return { lat: sat.lat, lon: sat.lon }

  // Orbital period in hours (approximate from altitude)
  // LEO ~90min, MEO ~12h, GEO ~24h
  const altKm = sat.alt
  const periodHours = altKm < 2000
    ? 1.5  // LEO ~90 min
    : altKm < 10000
    ? 6    // MEO
    : 24   // GEO

  const fractionOfOrbit = (offsetHours / periodHours) % 1
  // Approximate longitude drift (satellites move eastward relative to ground in LEO)
  const lonDrift = fractionOfOrbit * 360
  // Latitude oscillates with inclination
  const newLon = ((sat.lon + lonDrift + 180) % 360) - 180
  const latOscillation = Math.sin(fractionOfOrbit * 2 * Math.PI) * Math.abs(sat.lat)

  return {
    lat: Math.max(-90, Math.min(90, latOscillation)),
    lon: newLon,
  }
}

export default function Globe({
  satellites,
  selected,
  onSelect,
  timeOffsetHours = 0,
  showConstellations = false,
  onConstellationClick,
  isPaused = false,
  focusCoords = null,
}: GlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const globeRef = useRef<any>(null)
  const [size, setSize] = useState({ w: 600, h: 600 })

  useEffect(() => {
    if (!containerRef.current) return
    const el = containerRef.current
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect
      setSize({ w: width, h: height })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Part 6: propagate satellite positions based on time offset
  const pointsData = useMemo(() => satellites.map(s => {
    const pos = propagateSat(s, timeOffsetHours)
    return {
      ...s,
      lat: pos.lat,
      lon: pos.lon,
      color: s.type === 'ISS' ? '#00FF88' : s.type === 'DEBRIS' ? '#FF6B35' : '#00D4FF',
      size: s.id === selected?.id ? 1.5 : s.type === 'ISS' ? 1.1 : 0.55,
    }
  }), [satellites, selected, timeOffsetHours])

  // ISS and Selected satellite rings
  const ringsData = useMemo(() => {
    const rings: { lat: number; lng: number; type: string }[] = []
    const iss = pointsData.find(s => s.type === 'ISS')
    if (iss) {
      rings.push({ lat: iss.lat, lng: iss.lon, type: 'ISS' })
    }
    if (selected && selected.type !== 'ISS') {
      const selProp = pointsData.find(s => s.id === selected.id)
      if (selProp) {
        rings.push({ lat: selProp.lat, lng: selProp.lon, type: 'SELECTED' })
      }
    }
    return rings
  }, [pointsData, selected])


  // Part 7: Constellation arc lines as custom arcs on the globe
  // We use arcsData to draw lines between star pairs
  const arcsData = useMemo(() => {
    if (!showConstellations) return []
    const arcs: { startLat: number; startLng: number; endLat: number; endLng: number; color: string; constellationId: string; constellationName: string; mythology: string; season: string }[] = []
    for (const con of CONSTELLATIONS) {
      for (const [ai, bi] of con.lines) {
        const a = con.stars[ai]
        const b = con.stars[bi]
        if (!a || !b) continue
        arcs.push({
          startLat: a.lat,
          startLng: a.lon,
          endLat: b.lat,
          endLng: b.lon,
          color: 'rgba(155,220,255,0.35)',
          constellationId: con.id,
          constellationName: con.name,
          mythology: con.mythology,
          season: con.season,
        })
      }
    }
    return arcs
  }, [showConstellations])

  // Part 7: Constellation star points (dim background)
  const constellationStars = useMemo(() => {
    if (!showConstellations) return []
    return CONSTELLATIONS.flatMap(con =>
      con.stars.map(star => ({
        lat: star.lat,
        lon: star.lon,
        color: 'rgba(200,230,255,0.7)',
        size: 0.3,
        label: star.name || '',
        constellationName: con.name,
        mythology: con.mythology,
      }))
    )
  }, [showConstellations])

  // Part 7: Constellation name labels at centroid
  const constellationLabels = useMemo(() => {
    if (!showConstellations) return []
    return CONSTELLATIONS.map(con => {
      const avgLat = con.stars.reduce((s, st) => s + st.lat, 0) / con.stars.length
      const avgLon = con.stars.reduce((s, st) => s + st.lon, 0) / con.stars.length
      return {
        lat: avgLat,
        lon: avgLon,
        text: con.abbr,
        size: 0.6,
        color: 'rgba(155,220,255,0.55)',
        con,
      }
    })
  }, [showConstellations])

  // Selected satellite orbit path
  const selectedPathData = useMemo(() => {
    if (!selected) return []

    const altKm = selected.alt
    const periodHours = altKm < 2000
      ? 1.5  // LEO ~90 min
      : altKm < 10000
      ? 6    // MEO
      : 24   // GEO

    const coords: { lat: number; lon: number; alt: number }[] = []
    const steps = 120
    for (let i = 0; i <= steps; i++) {
      const t = timeOffsetHours + (i / steps) * periodHours
      const pos = propagateSat(selected, t)
      coords.push({
        lat: pos.lat,
        lon: pos.lon,
        alt: altKm / 6371,
      })
    }

    return [{
      coords,
      color: selected.type === 'ISS' ? '#00FF88' : selected.type === 'DEBRIS' ? '#FF6B35' : '#00D4FF',
    }]
  }, [selected, timeOffsetHours])

  const lastSelectedIdRef = useRef<string | null>(null)

  // Fly to selected satellite position when it changes
  useEffect(() => {
    if (selected && globeRef.current) {
      const pos = propagateSat(selected, timeOffsetHours)
      const isNewSelection = lastSelectedIdRef.current !== selected.id
      lastSelectedIdRef.current = selected.id

      // Smooth fly-to on new selection, instant tracking on time offset updates
      const transitionMs = isNewSelection ? 900 : 0
      globeRef.current.pointOfView({ lat: pos.lat, lng: pos.lon, altitude: 1.4 }, transitionMs)
    } else if (!selected && globeRef.current && lastSelectedIdRef.current !== null) {
      // Smoothly zoom out to default overview when selection is cleared
      globeRef.current.pointOfView({ lat: 20, lng: 10, altitude: 2.2 }, 900)
      lastSelectedIdRef.current = null
    } else {
      lastSelectedIdRef.current = null
    }
  }, [selected, timeOffsetHours])

  useEffect(() => {
    if (!globeRef.current) return
    const controls = globeRef.current.controls()
    if (controls) {
      controls.autoRotate = !isPaused
    }
  }, [isPaused])

  // Focus camera on custom coordinates when triggered
  useEffect(() => {
    if (focusCoords && globeRef.current) {
      globeRef.current.pointOfView({ lat: focusCoords.lat, lng: focusCoords.lon, altitude: 2.0 }, 1000)
    }
  }, [focusCoords])


  // Combined points: satellite points + constellation stars
  const allPoints = useMemo(() => [
    ...pointsData,
    ...(showConstellations ? constellationStars : []),
  ], [pointsData, constellationStars, showConstellations])

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <GlobeGL
        ref={globeRef}
        width={size.w}
        height={size.h}
        globeImageUrl="https://unpkg.com/three-globe/example/img/earth-night.jpg"
        bumpImageUrl="https://unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundColor="rgba(0,0,0,0)"
        atmosphereColor="#00D4FF"
        atmosphereAltitude={0.2}
        onGlobeClick={() => onSelect(null)}
        onGlobeReady={() => {
          if (!globeRef.current) return
          const controls = globeRef.current.controls()
          if (controls) {
            controls.autoRotate = !isPaused
            controls.autoRotateSpeed = 0.35
          }
          globeRef.current.pointOfView({ lat: 20, lng: 10, altitude: 2.2 }, 0)
        }}

        // Satellite + constellation star points
        pointsData={allPoints}
        pointLat="lat"
        pointLng="lon"
        pointColor="color"
        pointAltitude={0.012}
        pointRadius="size"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        pointLabel={(d: any) => {
          if (d.constellationName && !d.speed) {
            // Constellation star tooltip
            return `<div style="font-family:'Space Mono',monospace;font-size:10px;color:#9BDCFF;background:rgba(0,0,0,0.85);padding:6px 10px;border:1px solid rgba(155,220,255,0.25);border-radius:4px;max-width:200px">${d.label ? `⭐ ${d.label}<br/>` : ''}<span style="color:#8892A4">${d.constellationName}</span></div>`
          }
          return `<div style="font-family:'Space Mono',monospace;font-size:11px;color:#00D4FF;background:rgba(0,0,0,0.85);padding:6px 10px;border:1px solid rgba(0,212,255,0.3);border-radius:4px">${d.name}<br/><span style="color:#8892A4">${d.alt}km · ${d.speed?.toLocaleString('en-US')}km/h</span></div>`
        }}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onPointClick={(d: any) => {
          if (d.speed !== undefined) onSelect(d as Sat)
        }}

        // ISS / Selected pulse ring
        ringsData={ringsData}
        ringLat="lat"
        ringLng="lng"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ringColor={(d: any) => d.type === 'ISS' ? 'rgba(0,255,136,0.6)' : 'rgba(255,170,0,0.8)'}
        ringMaxRadius={5}
        ringPropagationSpeed={2}
        ringRepeatPeriod={1000}

        // Part 7: Constellation arc lines
        arcsData={arcsData}
        arcStartLat="startLat"
        arcStartLng="startLng"
        arcEndLat="endLat"
        arcEndLng="endLng"
        arcColor="color"
        arcAltitude={0.005}
        arcStroke={0.5}
        arcDashLength={0.6}
        arcDashGap={0.3}
        arcDashAnimateTime={showConstellations ? 8000 : 0}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        arcLabel={(d: any) => `<div style="font-family:'Space Mono',monospace;font-size:10px;color:#9BDCFF;background:rgba(0,0,0,0.88);padding:8px 12px;border:1px solid rgba(155,220,255,0.2);border-radius:6px;max-width:220px"><strong>${d.constellationName}</strong><br/><span style="color:#8892A4;font-size:9px">${d.mythology?.slice(0,100)}...</span></div>`}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onArcClick={(d: any) => {
          const con = CONSTELLATIONS.find(c => c.id === d.constellationId)
          if (con && onConstellationClick) onConstellationClick(con)
        }}

        // Part 7: Constellation abbreviation labels
        labelsData={constellationLabels}
        labelLat="lat"
        labelLng="lon"
        labelText="text"
        labelSize="size"
        labelColor="color"
        labelAltitude={0.02}
        labelDotRadius={0}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onLabelClick={(d: any) => {
          if (d.con && onConstellationClick) onConstellationClick(d.con)
        }}

        // Selected satellite 3D orbit path
        pathsData={selectedPathData}
        pathPoints="coords"
        pathPointLat="lat"
        pathPointLng="lon"
        pathPointAlt="alt"
        pathColor="color"
        pathStroke={2.2}
        pathDashLength={0.06}
        pathDashGap={0.02}
        pathDashAnimateTime={12000}
        pathTransitionDuration={0}
      />
    </div>
  )
}