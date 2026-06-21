'use client'

import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import InfoModal from './InfoModal'

const S = { fontFamily: 'Space Mono, monospace' as const }

interface Sat {
  id: string; name: string; lat: number; lon: number; alt: number; speed: number; type: string
}

interface Conjunction {
  a: Sat; b: Sat
  dist: number
  time: string
}

function haversineDistKm(lat1: number, lon1: number, lat2: number, lon2: number, alt1: number, alt2: number) {
  const R = 6371
  const toRad = (d: number) => d * Math.PI / 180
  const dLat = toRad(lat2 - lat1), dLon = toRad(lon2 - lon1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  const ground = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const altDiff = Math.abs(alt1 - alt2) / 1000
  return Math.sqrt(ground * ground + altDiff * altDiff)
}

const THRESHOLD_KM = 1

export default function ConjunctionWarning({ satellites }: { satellites: Sat[] }) {
  const [dismissed, setDismissed] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  const conjunctions = useMemo(() => {
    const result: Conjunction[] = []
    for (let i = 0; i < satellites.length; i++) {
      for (let j = i + 1; j < satellites.length; j++) {
        const a = satellites[i], b = satellites[j]
        const dist = haversineDistKm(a.lat, a.lon, b.lat, b.lon, a.alt, b.alt)
        if (dist < THRESHOLD_KM) {
          result.push({
            a, b, dist,
            time: new Date().toISOString().slice(11, 19) + ' UTC',
          })
        }
      }
    }
    return result.slice(0, 5)
  }, [satellites])

  const active = conjunctions.length > 0 && !dismissed

  return (
    <>
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              background: 'rgba(255, 59, 59, 0.12)',
              border: '1px solid rgba(255, 59, 59, 0.4)',
              borderRadius: 8, padding: '8px 14px', marginBottom: 8,
              display: 'flex', alignItems: 'center', gap: 10,
              cursor: 'pointer',
            }}
            onClick={() => setModalOpen(true)}
          >
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#FF3B3B', animation: 'blink 0.5s infinite', flexShrink: 0 }} />
            <span style={{ ...S, fontSize: 9, color: '#FF3B3B', flex: 1 }}>
              ⚠️ COLLISION RISK — {conjunctions.length} conjunction{conjunctions.length > 1 ? 's' : ''} detected within {THRESHOLD_KM} km
            </span>
            <button
              onClick={e => { e.stopPropagation(); setDismissed(true) }}
              style={{ ...S, fontSize: 8, color: '#4A5568', background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <InfoModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Collision Risk Assessment"
        content={
          conjunctions.length > 0
            ? conjunctions.map(c =>
                `${c.a.name} & ${c.b.name} — ${c.dist.toFixed(3)} km apart at ${c.time}`
              ).join('\n\n')
            : 'No conjunctions detected.'
        }
        color="#FF3B3B"
      />
    </>
  )
}
