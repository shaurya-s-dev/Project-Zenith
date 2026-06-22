import { NextResponse } from 'next/server'

// ── Cached last-known position ─────────────────────────────────────────────
// Persists across hot-reloads in dev (module-level singleton).
// On timeout/error the cached value is returned immediately so the UI
// never hangs waiting for a slow upstream response.
let cache = {
  latitude:  28.61,
  longitude: 77.21,
  altitude:  408,
  velocity:  27600,
  timestamp: 0,
  source:    'fallback' as string,
}

// How old the cache must be before we attempt a fresh fetch (ms)
const CACHE_TTL = 4_000

// ── Upstream sources (tried in order) ─────────────────────────────────────
// 1. Open-Notify  – very fast, simple JSON, rarely throttled
// 2. wheretheiss  – richer data but often slow from India
const SOURCES = [
  {
    name: 'open-notify',
    url: 'http://api.open-notify.org/iss-now.json',
    timeout: 4_000,
    parse: (d: any) => ({
      latitude:  parseFloat(d.iss_position.latitude),
      longitude: parseFloat(d.iss_position.longitude),
      altitude:  408,      // open-notify doesn't provide altitude
      velocity:  27_600,   // approximate; open-notify doesn't provide speed
    }),
  },
  {
    name: 'wheretheiss',
    url: 'https://api.wheretheiss.at/v1/satellites/25544',
    timeout: 5_000,
    parse: (d: any) => ({
      latitude:  d.latitude,
      longitude: d.longitude,
      altitude:  d.altitude,
      velocity:  d.velocity,
    }),
  },
]

async function fetchWithTimeout(url: string, timeoutMs: number) {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      cache: 'no-store',
      headers: { 'User-Agent': 'ProjectZenith/1.0' },
    })
    clearTimeout(id)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch (err) {
    clearTimeout(id)
    throw err
  }
}

export async function GET() {
  const now = Date.now()

  // Return cache immediately if it's fresh enough
  if (now - cache.timestamp < CACHE_TTL) {
    return NextResponse.json({ ...cache, live: true, cached: true })
  }

  // Try each source in order; return the first that succeeds
  for (const source of SOURCES) {
    try {
      const raw = await fetchWithTimeout(source.url, source.timeout)
      const parsed = source.parse(raw)

      // Validate — reject obviously bad values
      if (
        isNaN(parsed.latitude) ||
        isNaN(parsed.longitude) ||
        Math.abs(parsed.latitude)  > 90 ||
        Math.abs(parsed.longitude) > 180
      ) throw new Error('invalid data')

      cache = {
        ...parsed,
        timestamp: Date.now(),
        source: source.name,
      }

      return NextResponse.json({ ...cache, live: true, cached: false })
    } catch {
      // Try next source
      continue
    }
  }

  // All sources failed — return stale cache with live:false
  return NextResponse.json({ ...cache, live: false, cached: true })
}