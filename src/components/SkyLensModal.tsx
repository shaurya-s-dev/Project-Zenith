'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface SkyLensModalProps {
  isOpen: boolean
  onClose: () => void
  objectName: string
  orbitData?: { label: string; value: string }[]
  overviewText?: string
  context?: string
}

interface Msg { role: 'user' | 'assistant'; content: string }

const TABS = ['OVERVIEW', 'ORBIT DATA', 'AI FUN FACT'] as const
type Tab = typeof TABS[number]

// Safely access browser Speech API — avoids TypeScript window.SpeechRecognition errors
function getSpeechRecognition(): any {
  if (typeof window === 'undefined') return null
  return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null
}

export function SkyLensModal({
  isOpen,
  onClose,
  objectName,
  orbitData = [],
  overviewText = '',
  context = '',
}: SkyLensModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('OVERVIEW')
  const [query, setQuery] = useState('')
  const [messages, setMessages] = useState<Msg[]>([])
  const [loading, setLoading] = useState(false)
  const [listening, setListening] = useState(false)
  const [voiceSupported, setVoiceSupported] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const S = { fontFamily: 'Space Mono, monospace' }

  useEffect(() => {
    // Must run client-side only
    setVoiceSupported(!!getSpeechRecognition())
  }, [])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const handleAsk = async (text: string) => {
    if (!text.trim() || loading) return
    const next = [...messages, { role: 'user' as const, content: text }]
    setMessages(next)
    setQuery('')
    setLoading(true)
    setMessages(m => [...m, { role: 'assistant' as const, content: '' }])

    try {
      const res = await fetch('/api/skylens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: next,
          context: `The user is viewing data about: ${objectName}. ${context}`,
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
        setMessages(m => {
          const copy = [...m]
          copy[copy.length - 1] = { role: 'assistant', content: acc }
          return copy
        })
      }
    } catch {
      setMessages(m => {
        const copy = [...m]
        copy[copy.length - 1] = { role: 'assistant', content: 'SkyLens core unreachable. Check GROQ_API_KEY.' }
        return copy
      })
    } finally {
      setLoading(false)
    }
  }

  const startVoice = () => {
    const SR = getSpeechRecognition()
    if (!SR) { alert('Voice not supported in this browser.'); return }
    const recognition = new SR()
    recognition.lang = 'en-US'
    recognition.onstart = () => setListening(true)
    recognition.onend = () => setListening(false)
    recognition.onerror = () => setListening(false)
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setQuery(transcript)
      setActiveTab('AI FUN FACT')
      handleAsk(transcript)
    }
    recognition.start()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(10px)',
            zIndex: 200,
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            padding: '0 16px 16px',
          }}
        >
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 30 }}
            onClick={e => e.stopPropagation()}
            style={{
              background: 'rgba(8,12,24,0.97)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(0,212,255,0.2)',
              borderRadius: 20,
              width: '100%', maxWidth: 580, maxHeight: '80vh',
              display: 'flex', flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 -20px 60px rgba(0,212,255,0.08)',
            }}
          >
            {/* Header */}
            <div style={{ padding: '18px 20px 0', flexShrink: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div>
                  <div style={{ ...S, fontSize: 8, color: '#4A5568', letterSpacing: '0.25em', marginBottom: 3 }}>SKYLENS INTEL</div>
                  <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 20, fontWeight: 700, color: '#fff' }}>{objectName}</div>
                </div>
                <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#8892A4', cursor: 'pointer', borderRadius: 8, width: 32, height: 32, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
              </div>

              {/* Tabs */}
              <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {TABS.map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)} style={{ ...S, fontSize: 8, letterSpacing: '0.15em', padding: '8px 14px', background: 'transparent', border: 'none', cursor: 'pointer', color: activeTab === tab ? '#00D4FF' : '#4A5568', borderBottom: activeTab === tab ? '2px solid #00D4FF' : '2px solid transparent', marginBottom: -1 }}>
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
              <AnimatePresence mode="wait">
                {activeTab === 'OVERVIEW' && (
                  <motion.div key="overview" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                    <p style={{ ...S, fontSize: 11, color: '#c8d6e5', lineHeight: 1.8 }}>
                      {overviewText || `Real-time data for ${objectName}. Select a tab for orbit details or ask SkyLens AI for a fun fact.`}
                    </p>
                  </motion.div>
                )}
                {activeTab === 'ORBIT DATA' && (
                  <motion.div key="orbit" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                    {orbitData.length > 0 ? (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        {orbitData.map(d => (
                          <div key={d.label} style={{ background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.1)', borderRadius: 10, padding: 12 }}>
                            <div style={{ ...S, fontSize: 8, color: '#4A5568', marginBottom: 4 }}>{d.label}</div>
                            <div style={{ ...S, fontSize: 13, color: '#00D4FF' }}>{d.value}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ ...S, fontSize: 11, color: '#4A5568' }}>No orbit data available.</p>
                    )}
                  </motion.div>
                )}
                {activeTab === 'AI FUN FACT' && (
                  <motion.div key="ai" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                    {messages.length === 0 && !loading && (
                      <div style={{ textAlign: 'center', paddingTop: 16 }}>
                        <div style={{ fontSize: 28, marginBottom: 8 }}>🔭</div>
                        <p style={{ ...S, fontSize: 10, color: '#4A5568' }}>Ask SkyLens AI about {objectName} below</p>
                      </div>
                    )}
                    {messages.map((m, i) => (
                      <div key={i} style={{ marginBottom: 12 }}>
                        <div style={{ ...S, fontSize: 8, color: m.role === 'user' ? '#00D4FF' : '#9B59FF', marginBottom: 4 }}>
                          {m.role === 'user' ? 'YOU' : 'SKYLENS AI'}
                        </div>
                        <div style={{ ...S, fontSize: 10, color: '#c8d6e5', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                          {m.content || (loading && i === messages.length - 1 ? '···' : '')}
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Input */}
            <div style={{ padding: '12px 16px 18px', borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {voiceSupported && (
                  <button onClick={startVoice} title="Voice input" style={{ width: 36, height: 36, borderRadius: 8, background: listening ? 'rgba(255,107,53,0.2)' : 'rgba(255,255,255,0.05)', border: `1px solid ${listening ? 'rgba(255,107,53,0.5)' : 'rgba(255,255,255,0.1)'}`, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    🎙️
                  </button>
                )}
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { setActiveTab('AI FUN FACT'); handleAsk(query) } }}
                  placeholder={`Ask about ${objectName}...`}
                  style={{ ...S, flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '9px 12px', color: '#fff', fontSize: 11, outline: 'none' }}
                />
                <button onClick={() => { setActiveTab('AI FUN FACT'); handleAsk(query) }} disabled={loading} style={{ ...S, fontSize: 9, letterSpacing: '0.15em', color: '#000', background: loading ? '#4A5568' : '#00D4FF', border: 'none', borderRadius: 8, padding: '0 16px', height: 36, cursor: loading ? 'default' : 'pointer', flexShrink: 0 }}>
                  {loading ? '...' : 'ASK'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}