'use client'

import { usePathname } from 'next/navigation'
import CosmicBackground from './CosmicBackground'
import AuroraBackground from './AuroraBackground'
import SolarFlareBackground from './SolarFlareBackground'
import MatrixBackground from './MatrixBackground'
import BackgroundDebris from './BackgroundDebris'

export default function DynamicBackground() {
  const pathname = usePathname()
  const page = pathname.split('/')[1] || 'dashboard'

  return (
    <>
      {page === 'sky' ? <AuroraBackground /> :
       page === 'weather' ? <SolarFlareBackground /> :
       page === 'skylens' ? <MatrixBackground /> :
       <CosmicBackground />}
      <BackgroundDebris />
    </>
  )
}
