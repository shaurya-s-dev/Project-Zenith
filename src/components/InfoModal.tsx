'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface InfoModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  content: string
  color?: string
}

export default function InfoModal({ isOpen, onClose, title, content, color = '#00D4FF' }: InfoModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 1000 }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', damping: 24, stiffness: 300 }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '90%',
              maxWidth: 400,
              background: 'rgba(6, 8, 18, 0.96)',
              border: `1px solid ${color}33`,
              borderRadius: 14,
              padding: 24,
              zIndex: 1001,
              backdropFilter: 'blur(20px)',
              boxShadow: `0 0 40px ${color}0f`,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color, letterSpacing: '0.25em' }}>
                SKYLENS · KNOWLEDGE
              </div>
              <button onClick={onClose} style={{ fontFamily: 'Space Mono, monospace', fontSize: 14, color: '#4A5568', background: 'transparent', border: 'none', cursor: 'pointer' }}>✕</button>
            </div>
            <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 14, letterSpacing: '0.04em' }}>
              {title}
            </h2>
            <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 13, color: '#ccc', lineHeight: 1.7, margin: 0 }}>
              {content}
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
