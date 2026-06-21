'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

import { SkeletonLine } from '@/components/Skeleton'

const S = { fontFamily: 'Space Mono, monospace' }

interface CelestialObject {
  name: string
  type?: string
  lat?: number
  lon?: number
  alt?: number
  speed?: number
  description?: string
  [key: string]: any
}

interface SkyLensModalProps {
  isOpen: boolean
  onClose: () => void
  object: CelestialObject | null
  issContext?: string
}

type Tab = 'overview' | 'orbit' | 'aifact'

const GROQ_FACTS: Record<string, string> = {
  ISS: 'The ISS travels at ~7.66 km/s — fast enough to circle Earth in ~92 minutes. At that speed, astronauts see 16 sunrises and sunsets every day.',
  HUBBLE: 'Hubble has peered back 13.4 billion years, observing galaxies formed just 400 million years after the Big Bang.',
  TIANGONG: 'China\'s Tiangong station operates independently of the ISS and hosts rotating crews on 6-month missions. Its modular design allows future expansion.',
  DEBRIS: 'Space debris travels at ~7-8 km/s in LEO. A 1 cm fragment carries the kinetic energy equivalent to a hand grenade.',
  DEFAULT: 'Satellites in LEO experience atmospheric drag from residual gas at altitudes below 600 km, requiring periodic reboosts to maintain their orbits.',
}

function getDefaultFact(name: string, type?: string) {
  if (name.includes('ISS') || name.includes('ZARYA')) return GROQ_FACTS.ISS
  if (name.includes('HUBBLE')) return GROQ_FACTS.HUBBLE
  if (name.includes('TIANGONG')) return GROQ_FACTS.TIANGONG
  if (type === 'DEBRIS') return GROQ_FACTS.DEBRIS
  return GROQ_FACTS.DEFAULT
}

function TypewriterText({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState('')
  useEffect(() => {
    setDisplayed('')
    let i = 0
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1))
        i++
      } else {
        clearInterval(interval)
      }
    }, 18)
    return () => clearInterval(interval)
  }, [text])
  return <span>{displayed}<span style={{ animation: 'blink 0.8s infinite', opacity: displayed.length < text.length ? 1 : 0 }}>_</span></span>
}

export default function SkyLensModal({ isOpen, onClose, object, issContext }: SkyLensModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [query, setQuery] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [voiceSupported, setVoiceSupported] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setVoiceSupported(!!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition))
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      setActiveTab('overview')
      setQuery('')
      setAiResponse('')
    }
  }, [isOpen, object])

  const handleAskSkyLens = async (text: string) => {
    if (!text.trim() || aiLoading) return
    setAiLoading(true)
    setAiResponse('')
    setActiveTab('aifact')

    const context = [
      object ? `Object: ${object.name} (${object.type || 'satellite'})` : '',
      object?.alt ? `Altitude: ${object.alt} km` : '',
      object?.speed ? `Speed: ${object.speed.toLocaleString('en-US')} km/h` : '',
      issContext || '',
    ].filter(Boolean).join('. ')

    try {
      const res = await fetch('/api/skylens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: text }],
          context,
        }),
      })
      if (!res.body) throw new Error('no stream')
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let acc = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        acc += decoder.decode(value, { stream: true })
        setAiResponse(acc)
      }
    } catch {
      setAiResponse('CONNECTION ERROR — could not reach SkyLens core.')
    } finally {
      setAiLoading(false)
    }
  }

  const startVoice = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) return
    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => setIsListening(false)
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setQuery(transcript)
      handleAskSkyLens(transcript)
    }
    recognition.onerror = () => setIsListening(false)
    recognition.start()
  }

  if (!object) return null

  const fact = getDefaultFact(object.name, object.type)

  const TABS: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'OVERVIEW' },
    { id: 'orbit', label: 'ORBIT DATA' },
    { id: 'aifact', label: 'AI FUN FACT' },
  ]

  const typeColor = object.type === 'ISS' ? '#00FF88' : object.type === 'DEBRIS' ? '#FF6B35' : '#00D4FF'

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(4px)',
              zIndex: 1000,
            }}
          />

          {/* Modal - slides up from bottom */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 26, stiffness: 280 }}
            style={{
              position: 'fixed',
              bottom: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '100%',
              maxWidth: 560,
              background: 'rgba(8, 10, 20, 0.97)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(0,212,255,0.18)',
              borderBottom: 'none',
              borderRadius: '16px 16px 0 0',
              zIndex: 1001,
              overflow: 'hidden',
              boxShadow: '0 -20px 60px rgba(0,212,255,0.08)',
            }}
          >
            {/* Drag handle */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 0' }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)' }} />
            </div>

            {/* Header */}
            <div style={{ padding: '12px 20px 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ ...S, fontSize: 8, padding: '2px 6px', borderRadius: 3, background: `${typeColor}18`, color: typeColor, border: `1px solid ${typeColor}40` }}>
                    {object.type || 'SAT'}
                  </span>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: typeColor, animation: 'blink 1.2s infinite' }} />
                </div>
                <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 20, fontWeight: 700, color: '#fff', margin: 0, letterSpacing: '0.04em' }}>
                  {object.name}
                </h2>
                {object.description && (
                  <p style={{ ...S, fontSize: 9, color: '#8892A4', marginTop: 4 }}>{object.description}</p>
                )}
              </div>
              <button
                onClick={onClose}
                style={{ ...S, fontSize: 16, color: '#4A5568', background: 'transparent', border: 'none', cursor: 'pointer', padding: '0 4px', lineHeight: 1 }}
              >
                ✕
              </button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 0, padding: '14px 20px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    ...S,
                    fontSize: 9,
                    letterSpacing: '0.2em',
                    color: activeTab === tab.id ? '#00D4FF' : '#4A5568',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: activeTab === tab.id ? '2px solid #00D4FF' : '2px solid transparent',
                    padding: '0 0 10px',
                    marginRight: 20,
                    cursor: 'pointer',
                    transition: 'color 0.15s',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div style={{ padding: '16px 20px', minHeight: 140 }}>
              <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                  <motion.div key="overview" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      {[
                        ['ALTITUDE', object.alt ? `${object.alt} km` : '—'],
                        ['SPEED', object.speed ? `${object.speed.toLocaleString('en-US')} km/h` : '—'],
                        ['LATITUDE', object.lat !== undefined ? `${object.lat.toFixed(2)}°` : '—'],
                        ['LONGITUDE', object.lon !== undefined ? `${object.lon.toFixed(2)}°` : '—'],
                      ].map(([label, value]) => (
                        <div key={label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '10px 12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                          <div style={{ ...S, fontSize: 8, color: '#4A5568', marginBottom: 4 }}>{label}</div>
                          <div style={{ ...S, fontSize: 13, color: typeColor }}>{value}</div>
                        </div>
                      ))}
                    </div>
                    {object.type === 'ISS' && (
                      <div style={{ marginTop: 10, background: 'rgba(0,255,136,0.04)', border: '1px solid rgba(0,255,136,0.12)', borderRadius: 8, padding: '8px 12px' }}>
                        <div style={{ ...S, fontSize: 9, color: '#00FF88' }}>🛸 International Space Station</div>
                        <div style={{ ...S, fontSize: 9, color: '#4A5568', marginTop: 3, lineHeight: 1.6 }}>Orbiting since 1998 · Continuous human habitation since 2000 · ~109m wide</div>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'orbit' && (
                  <motion.div key="orbit" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      {[
                        ['ORBIT TYPE', object.alt && object.alt < 2000 ? 'LEO' : object.alt && object.alt < 35000 ? 'MEO' : 'GEO'],
                        ['PERIOD', object.alt ? `~${(Math.sqrt(Math.pow((6371 + object.alt) / 6371, 3)) * 90).toFixed(0)} min` : '—'],
                        ['INCLINATION', object.lat !== undefined ? `~${Math.abs(object.lat).toFixed(0)}°` : '—'],
                        ['ECCENTRICITY', '~0.0002'],
                        ['PERIGEE', object.alt ? `${(object.alt - 5).toFixed(0)} km` : '—'],
                        ['APOGEE', object.alt ? `${(object.alt + 5).toFixed(0)} km` : '—'],
                      ].map(([label, value]) => (
                        <div key={label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '10px 12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                          <div style={{ ...S, fontSize: 8, color: '#4A5568', marginBottom: 4 }}>{label}</div>
                          <div style={{ ...S, fontSize: 12, color: '#00D4FF' }}>{value}</div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'aifact' && (
                  <motion.div key="aifact" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    <div style={{ background: 'rgba(155,89,255,0.06)', border: '1px solid rgba(155,89,255,0.15)', borderRadius: 10, padding: 14, minHeight: 80 }}>
                      <div style={{ ...S, fontSize: 8, color: '#9B59FF', marginBottom: 8, letterSpacing: '0.2em' }}>
                        {aiLoading ? '⟳ SKYLENS AI THINKING...' : 'SKYLENS AI'}
                      </div>
                      <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 13, color: '#fff', lineHeight: 1.65 }}>
                        {aiLoading ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <SkeletonLine w="100%" h={10} style={{ background: 'rgba(155, 89, 255, 0.15)' }} />
                            <SkeletonLine w="85%" h={10} style={{ background: 'rgba(155, 89, 255, 0.15)' }} />
                            <SkeletonLine w="60%" h={10} style={{ background: 'rgba(155, 89, 255, 0.15)' }} />
                          </div>
                        ) : aiResponse ? (
                          aiResponse
                        ) : (
                          <TypewriterText text={fact} />
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Input bar */}
            <div style={{ padding: '0 20px 20px', display: 'flex', gap: 8 }}>
              <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  ref={inputRef}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { handleAskSkyLens(query); setQuery('') } }}
                  placeholder={`Ask SkyLens about ${object.name}...`}
                  style={{
                    ...S,
                    flex: 1,
                    width: '100%',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 8,
                    padding: '9px 38px 9px 12px',
                    color: '#fff',
                    fontSize: 11,
                    outline: 'none',
                  }}
                />
                {voiceSupported && (
                  <button
                    onClick={startVoice}
                    style={{
                      position: 'absolute',
                      right: 8,
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 14,
                      opacity: isListening ? 1 : 0.5,
                      animation: isListening ? 'blink 0.8s infinite' : 'none',
                    }}
                    title="Voice input"
                  >
                    🎙️
                  </button>
                )}
              </div>
              <button
                onClick={() => { handleAskSkyLens(query); setQuery('') }}
                disabled={aiLoading || !query.trim()}
                style={{
                  ...S,
                  fontSize: 9,
                  letterSpacing: '0.15em',
                  color: '#000',
                  background: aiLoading || !query.trim() ? '#4A5568' : '#00D4FF',
                  border: 'none',
                  borderRadius: 8,
                  padding: '0 16px',
                  cursor: aiLoading || !query.trim() ? 'default' : 'pointer',
                  height: 38,
                  flexShrink: 0,
                }}
              >
                ASK
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}