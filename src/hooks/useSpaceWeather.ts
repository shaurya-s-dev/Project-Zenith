'use client'

import { useQuery } from '@tanstack/react-query'

const KP_URL = 'https://services.swpc.noaa.gov/json/planetary_k_index_1m.json'
const WIND_URL = 'https://services.swpc.noaa.gov/products/solar-wind/plasma-1-day.json'
const XRAY_URL = 'https://services.swpc.noaa.gov/json/goes/primary/xrays-1-day.json'

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

interface SpaceWeatherData {
  kp: number | null
  windSpeed: number | null
  windDensity: number | null
  xrayFlux: number | null
}

async function fetchWeather(): Promise<SpaceWeatherData> {
  const [kpRes, windRes, xrayRes] = await Promise.all([
    fetch(KP_URL).then(r => r.json()),
    fetch(WIND_URL).then(r => r.json()),
    fetch(XRAY_URL).then(r => r.json()),
  ])

  const kpRows = normalizeRows(kpRes)
  const kpLast = kpRows[kpRows.length - 1]
  const kpV = findVal(kpLast, 'kp_index') ?? findVal(kpLast, 'estimated_kp') ?? findVal(kpLast, 'kp')
  const kp = parseFloat(kpV)

  const windRows = normalizeRows(windRes)
  let windSpeed: number | null = null, windDensity: number | null = null
  for (let i = windRows.length - 1; i >= 0; i--) {
    const s = parseFloat(findVal(windRows[i], 'speed'))
    const d = parseFloat(findVal(windRows[i], 'density'))
    if (!isNaN(s) && !isNaN(d)) { windSpeed = s; windDensity = d; break }
  }

  const xrayRows = normalizeRows(xrayRes)
  const longBand = xrayRows.filter(r => String(findVal(r, 'energy') || '').includes('0.1-0.8'))
  const pool = longBand.length ? longBand : xrayRows
  let xrayFlux: number | null = null
  for (let i = pool.length - 1; i >= 0; i--) {
    const f = parseFloat(findVal(pool[i], 'flux'))
    if (!isNaN(f) && f > 0) { xrayFlux = f; break }
  }

  return { kp: isNaN(kp) ? null : kp, windSpeed, windDensity, xrayFlux }
}

export function useSpaceWeather() {
  return useQuery<SpaceWeatherData>({
    queryKey: ['space-weather'],
    queryFn: fetchWeather,
    refetchInterval: 60000,
  })
}
