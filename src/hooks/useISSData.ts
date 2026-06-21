'use client'

import { useQuery } from '@tanstack/react-query'

interface ISSPos {
  lat: number
  lon: number
  alt: number
  vel: number
  live: boolean
}

async function fetchISS(): Promise<ISSPos> {
  const res = await fetch('/api/iss')
  const d = await res.json()
  return {
    lat: +d.latitude.toFixed(2),
    lon: +d.longitude.toFixed(2),
    alt: Math.round(d.altitude),
    vel: Math.round(d.velocity),
    live: d.live ?? false,
  }
}

export function useISSData() {
  return useQuery<ISSPos>({
    queryKey: ['iss'],
    queryFn: fetchISS,
    refetchInterval: 5000,
  })
}
