'use client'

import { useQuery } from '@tanstack/react-query'

interface ISSPos {
  lat: number
  lon: number
  alt: number
  vel: number
  live: boolean
  latencyMs?: number
}

async function fetchISS(): Promise<ISSPos> {
  const t0 = performance.now()
  const res = await fetch('/api/iss')
  const d = await res.json()
  const t1 = performance.now()
  return {
    lat: +d.latitude.toFixed(2),
    lon: +d.longitude.toFixed(2),
    alt: Math.round(d.altitude),
    vel: Math.round(d.velocity),
    live: d.live ?? false,
    latencyMs: Math.round(t1 - t0),
  }
}

export function useISSData() {
  return useQuery<ISSPos>({
    queryKey: ['iss'],
    queryFn: fetchISS,
    refetchInterval: 5000,
  })
}
