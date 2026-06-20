import { NextResponse } from 'next/server'

// Fallback so the UI never shows blank data even if the external API is down
let lastKnown = { latitude: 42.46, longitude: -70.71, altitude: 408, velocity: 27600 }

export async function GET() {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 6000)
    const res = await fetch('https://api.wheretheiss.at/v1/satellites/25544', {
      signal: controller.signal,
      cache: 'no-store',
    })
    clearTimeout(timeout)
    if (!res.ok) throw new Error('bad status')
    const d = await res.json()
    lastKnown = { latitude: d.latitude, longitude: d.longitude, altitude: d.altitude, velocity: d.velocity }
    return NextResponse.json({ ...lastKnown, live: true })
  } catch {
    return NextResponse.json({ ...lastKnown, live: false })
  }
}