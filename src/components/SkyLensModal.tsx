'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

import { SkeletonLine } from '@/components/Skeleton'

const S = { fontFamily: 'Space Mono, monospace' }

interface CelestialObject {
  id?: string
  name: string
  type?: string
  lat?: number
  lon?: number
  alt?: number
  speed?: number
  status?: string
  description?: string
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

function getQuickQuestions(name: string, type?: string) {
  const isIss = name.includes('ISS') || name.includes('ZARYA') || type === 'ISS'
  const isDebris = type === 'DEBRIS'

  if (isIss) {
    return [
      "How many astronauts are onboard?",
      "How long does one orbit take?",
      "What research is done on the ISS?",
    ]
  }
  if (isDebris) {
    return [
      "How dangerous is this debris?",
      "What is being done about space debris?",
      "How fast does space junk travel?",
    ]
  }
  return [
    "What is its primary mission?",
    "How long is its operational lifespan?",
    "How does it communicate with Earth?",
  ]
}

function TypewriterText({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState('')
  useEffect(() => {
    setTimeout(() => setDisplayed(''), 0)
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
      const win = window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown }
      const supported = !!(win.SpeechRecognition || win.webkitSpeechRecognition)
      setTimeout(() => setVoiceSupported(supported), 0)
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        setActiveTab('overview')
        setQuery('')
        setAiResponse('')
      }, 0)
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
    const win = window as unknown as { SpeechRecognition?: new () => unknown; webkitSpeechRecognition?: new () => unknown }
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition
    if (!SpeechRecognition) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognition = new (SpeechRecognition as any)()
    recognition.lang = 'en-US'
    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => setIsListening(false)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
              background: 'rgba(3, 5, 10, 0.7)',
              backdropFilter: 'blur(8px)',
              zIndex: 1000,
            }}
          />

          {/* Modal - Centered */}
          <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001, pointerEvents: 'none' }}>
            <motion.div
              initial={{ scale: 0.9, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 15, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              style={{
                width: '90%',
                maxWidth: 540,
                background: 'rgba(8, 10, 20, 0.88)',
                backdropFilter: 'blur(30px)',
                border: '1px solid rgba(0, 212, 255, 0.22)',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(0, 212, 255, 0.08)',
                pointerEvents: 'auto',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
            {/* Header */}
            <div style={{ padding: '20px 20px 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
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
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.15, color: '#FF3B3B' }}
                whileTap={{ scale: 0.95 }}
                style={{ ...S, fontSize: 14, color: '#8892A4', background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px', lineHeight: 1 }}
              >
                ✕
              </motion.button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 0, padding: '14px 20px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    ...S,
                    position: 'relative',
                    fontSize: 9,
                    letterSpacing: '0.2em',
                    color: activeTab === tab.id ? '#00D4FF' : '#8892A4',
                    background: 'transparent',
                    border: 'none',
                    padding: '0 0 10px',
                    marginRight: 24,
                    cursor: 'pointer',
                    transition: 'color 0.2s',
                  }}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTabLine"
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: 2,
                        background: '#00D4FF',
                        boxShadow: '0 0 8px #00D4FF',
                      }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div style={{ padding: '16px 20px', minHeight: 140, maxHeight: 280, overflowY: 'auto' }}>
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

            {/* Suggested Questions */}
            <div style={{ padding: '0 20px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ ...S, fontSize: 7, color: '#4A5568', letterSpacing: '0.15em', fontWeight: 600 }}>SUGGESTED QUESTIONS</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {getQuickQuestions(object.name, object.type).map((q, idx) => (
                  <motion.button
                    key={idx}
                    onClick={() => {
                      setQuery(q)
                      handleAskSkyLens(q)
                    }}
                    whileHover={{ scale: 1.02, y: -1, background: 'rgba(0, 212, 255, 0.08)', borderColor: 'rgba(0, 212, 255, 0.35)', boxShadow: '0 0 10px rgba(0, 212, 255, 0.15)' }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      ...S,
                      fontSize: 8,
                      color: '#00D4FF',
                      background: 'rgba(0, 212, 255, 0.03)',
                      border: '1px solid rgba(0, 212, 255, 0.12)',
                      borderRadius: 16,
                      padding: '4px 10px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'border-color 0.2s, background-color 0.2s',
                    }}
                  >
                    ✨ {q}
                  </motion.button>
                ))}
              </div>
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
          </div>
        </>
      )}
    </AnimatePresence>
  )
}