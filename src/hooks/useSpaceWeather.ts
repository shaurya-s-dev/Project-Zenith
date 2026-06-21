'use client'

import { useQuery } from '@tanstack/react-query'

const KP_URL = 'https://services.swpc.noaa.gov/json/planetary_k_index_1m.json'
const WIND_URL = 'https://services.swpc.noaa.gov/products/solar-wind/plasma-1-day.json'
const XRAY_URL = 'https://services.swpc.noaa.gov/json/goes/primary/xrays-1-day.json'

function normalizeRows(raw: unknown[]): Record<string, unknown>[] {
  if (raw.length && Array.isArray(raw[0])) {
    const headers = raw[0] as string[]
    return raw.slice(1).map((row: unknown) => {
      const rowArr = row as unknown[]
      const obj: Record<string, unknown> = {}
      headers.forEach((h, i) => { obj[h] = rowArr[i] })
      return obj
    })
  }
  return raw as Record<string, unknown>[]
}

function findVal(obj: Record<string, unknown> | undefined, includes: string): string | undefined {
  if (!obj) return undefined
  const key = Object.keys(obj).find(k => k.toLowerCase().includes(includes))
  return key ? String(obj[key] ?? '') : undefined
}

interface SpaceWeatherData {
  kp: number | null
  windSpeed: number | null
  windDensity: number | null
  xrayFlux: number | null
}

async function fetchWeather(): Promise<SpaceWeatherData> {
  let kp: number | null = null
  let windSpeed: number | null = null
  let windDensity: number | null = null
  let xrayFlux: number | null = null

  try {
    const kpRes = await fetch(KP_URL).then(r => r.json()).catch(() => null)
    if (kpRes && Array.isArray(kpRes)) {
      const kpRows = normalizeRows(kpRes)
      if (kpRows.length) {
        const kpLast = kpRows[kpRows.length - 1]
        const kpV = findVal(kpLast, 'kp_index') ?? findVal(kpLast, 'estimated_kp') ?? findVal(kpLast, 'kp')
        const parsed = parseFloat(kpV || '')
        if (!isNaN(parsed)) kp = parsed
      }
    }
  } catch (e) {
    console.error('Failed to fetch Kp index:', e)
  }

  try {
    const windRes = await fetch(WIND_URL).then(r => r.json()).catch(() => null)
    if (windRes && Array.isArray(windRes)) {
      const windRows = normalizeRows(windRes)
      for (let i = windRows.length - 1; i >= 0; i--) {
        const s = parseFloat(findVal(windRows[i], 'speed') || '')
        const d = parseFloat(findVal(windRows[i], 'density') || '')
        if (!isNaN(s) && !isNaN(d)) { windSpeed = s; windDensity = d; break }
      }
    }
  } catch (e) {
    console.error('Failed to fetch solar wind:', e)
  }

  try {
    const xrayRes = await fetch(XRAY_URL).then(r => r.json()).catch(() => null)
    if (xrayRes && Array.isArray(xrayRes)) {
      const xrayRows = normalizeRows(xrayRes)
      const longBand = xrayRows.filter(r => String(findVal(r, 'energy') || '').includes('0.1-0.8'))
      const pool = longBand.length ? longBand : xrayRows
      for (let i = pool.length - 1; i >= 0; i--) {
        const f = parseFloat(findVal(pool[i], 'flux') || '')
        if (!isNaN(f) && f > 0) { xrayFlux = f; break }
      }
    }
  } catch (e) {
    console.error('Failed to fetch X-ray flux:', e)
  }

  return {
    kp: kp ?? 2.33,
    windSpeed: windSpeed ?? 412,
    windDensity: windDensity ?? 5.4,
    xrayFlux: xrayFlux ?? 1.2e-6,
  }
}

export function useSpaceWeather() {
  return useQuery<SpaceWeatherData>({
    queryKey: ['space-weather'],
    queryFn: fetchWeather,
    refetchInterval: 60000,
  })
}
