import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)
    
    const res = await fetch('https://celestrak.org/NORAD/elements/gp.php?CATNR=25544&FORMAT=json', {
      signal: controller.signal,
      cache: 'no-store',
    })
    
    clearTimeout(timeout)
    return NextResponse.json({ online: res.ok })
  } catch {
    return NextResponse.json({ online: false })
  }
}
