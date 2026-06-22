import { NextResponse } from 'next/server'
import axios from 'axios'
import https from 'https'

// Force IPv4 — prevents 10s+ hang on Windows where Node tries IPv6 first
const agent = new https.Agent({ family: 4 })

let lastKnown = { latitude: 42.46, longitude: -70.71, altitude: 408, velocity: 27600 }

export async function GET() {
  try {
    const { data } = await axios.get(
      'https://api.wheretheiss.at/v1/satellites/25544',
      { timeout: 8000, httpsAgent: agent }
    )
    lastKnown = {
      latitude: data.latitude,
      longitude: data.longitude,
      altitude: data.altitude,
      velocity: data.velocity,
    }
    return NextResponse.json({ ...lastKnown, live: true })
  } catch (err) {
    console.error('[ISS API] fetch failed:', err)
    return NextResponse.json({ ...lastKnown, live: false })
  }
}