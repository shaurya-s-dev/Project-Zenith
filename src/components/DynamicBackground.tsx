'use client'

import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import CosmicBackground from './CosmicBackground'
import AuroraBackground from './AuroraBackground'
import SolarFlareBackground from './SolarFlareBackground'
import MatrixBackground from './MatrixBackground'
import BackgroundDebris from './BackgroundDebris'

export default function DynamicBackground() {
  const pathname = usePathname()
  const page = pathname.split('/')[1] || 'dashboard'

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: -50, pointerEvents: 'none' }}>
      <AnimatePresence mode="popLayout">
        {page === 'sky' && (
          <motion.div
            key="sky"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            style={{ position: 'absolute', inset: 0 }}
          >
            <AuroraBackground />
          </motion.div>
        )}
        {page === 'weather' && (
          <motion.div
            key="weather"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            style={{ position: 'absolute', inset: 0 }}
          >
            <SolarFlareBackground />
          </motion.div>
        )}
        {page === 'skylens' && (
          <motion.div
            key="skylens"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            style={{ position: 'absolute', inset: 0 }}
          >
            <MatrixBackground />
          </motion.div>
        )}
        {page !== 'sky' && page !== 'weather' && page !== 'skylens' && (
          <motion.div
            key="default"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            style={{ position: 'absolute', inset: 0 }}
          >
            <CosmicBackground />
          </motion.div>
        )}
      </AnimatePresence>
      <BackgroundDebris />
    </div>
  )
}
