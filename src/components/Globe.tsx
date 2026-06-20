'use client'

import dynamic from 'next/dynamic'
import { useRef, useEffect, useMemo, useState } from 'react'

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
  onSelect: (s: Sat) => void
}

export default function Globe({ satellites, selected, onSelect }: GlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null)
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

  const pointsData = useMemo(() => satellites.map(s => ({
    ...s,
    color: s.type === 'ISS' ? '#00FF88' : s.type === 'DEBRIS' ? '#FF6B35' : '#00D4FF',
    size: s.id === selected?.id ? 1.5 : s.type === 'ISS' ? 1.1 : 0.55,
  })), [satellites, selected])

  const ringsData = useMemo(() => {
    const iss = satellites.find(s => s.type === 'ISS')
    return iss ? [{ lat: iss.lat, lng: iss.lon }] : []
  }, [satellites])

  useEffect(() => {
    if (!globeRef.current) return
    const controls = globeRef.current.controls()
    controls.autoRotate = true
    controls.autoRotateSpeed = 0.35
    globeRef.current.pointOfView({ lat: 20, lng: 10, altitude: 2.2 }, 0)
  }, [])

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
        pointsData={pointsData}
        pointLat="lat"
        pointLng="lon"
        pointColor="color"
        pointAltitude={0.012}
        pointRadius="size"
        pointLabel={(d: any) => `<div style="font-family:'Space Mono',monospace;font-size:11px;color:#00D4FF;background:rgba(0,0,0,0.85);padding:6px 10px;border:1px solid rgba(0,212,255,0.3);border-radius:4px">${d.name}<br/><span style="color:#8892A4">${d.alt}km · ${d.speed.toLocaleString()}km/h</span></div>`}
        onPointClick={(d: any) => onSelect(d)}
        ringsData={ringsData}
        ringLat="lat"
        ringLng="lng"
        ringColor={() => 'rgba(0,255,136,0.6)'}
        ringMaxRadius={5}
        ringPropagationSpeed={2}
        ringRepeatPeriod={1000}
      />
    </div>
  )
}