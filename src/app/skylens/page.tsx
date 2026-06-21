'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSkyLens } from '@/components/SkyLensContext'

const S = { fontFamily: 'Space Mono, monospace' as const }

interface Msg { role: 'user' | 'assistant'; content: string }

const SUGGESTIONS = [
  { text: "🛰️ What's the ISS doing right now?", query: "What's the ISS doing right now?" },
  { text: "🌡️ Explain the KP index simply.", query: "Explain the KP index simply." },
  { text: "🪐 When can I see Jupiter tonight?", query: "When can I see Jupiter tonight?" },
  { text: "📡 How does satellite tracking work?", query: "How does satellite tracking work?" },
  { text: "🌙 Tell me about moon phases.", query: "Tell me about moon phases." },
  { text: "☄️ What is a near-Earth object?", query: "What is a near-Earth object?" },
  { text: "🛸 What is orbital decay?", query: "What is orbital decay?" },
  { text: "🌍 How many satellites are active?", query: "How many satellites are active?" },
]

export default function SkyLensPage() {
  const { messages, addMessage, updateLastMessage, clearMessages, isLoading, setIsLoading } = useSkyLens()
  const [input, setInput] = useState('')
  const [issContext, setIssContext] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const [dots, setDots] = useState('')

  useEffect(() => {
    fetch('https://api.wheretheiss.at/v1/satellites/25544')
      .then(r => r.json())
      .then(d => setIssContext(`ISS position: lat ${d.latitude.toFixed(2)}°, lon ${d.longitude.toFixed(2)}°, altitude ${Math.round(d.altitude)} km, velocity ${Math.round(d.velocity)} km/h.`))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isLoading])

  useEffect(() => {
    if (!isLoading) { setDots(''); return }
    const i = setInterval(() => setDots(p => p.length >= 3 ? '' : p + '.'), 400)
    return () => clearInterval(i)
  }, [isLoading])

  const send = async (text: string) => {
    if (!text.trim() || isLoading) return
    const next: Msg[] = [...messages, { role: 'user' as const, content: text }]
    addMessage({ role: 'user', content: text })
    setInput('')
    setIsLoading(true)
    addMessage({ role: 'assistant', content: '' })

    try {
      const res = await fetch('/api/skylens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next, context: issContext }),
      })
      if (!res.body) throw new Error('no stream')
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let acc = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        acc += decoder.decode(value, { stream: true })
        updateLastMessage(acc)
      }
    } catch {
      updateLastMessage('CONNECTION ERROR — could not reach SkyLens core. Check your GROQ_API_KEY and restart the dev server.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: 'calc(100vh - 52px)',
      color: 'var(--theme-text, #fff)',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        maxWidth: 800,
        margin: '0 auto',
        width: '100%',
        padding: '0 24px',
        zIndex: 5,
      }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: '24px 0 12px',
            borderBottom: '1px solid var(--theme-border, rgba(255,255,255,0.06))',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 2 }}>
              <span style={{ fontSize: 24 }}>🌌</span>
              <h1 style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: '0.05em',
                background: 'linear-gradient(135deg, var(--theme-primary, #00D4FF), var(--theme-accent, #9B59FF))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                SkyLens AI – Your Personal Space Expert
              </h1>
            </div>
            <p style={{ ...S, fontSize: 10, color: 'var(--theme-text-dim, #8892A4)' }}>
              Ask me anything about space, satellites, planets, and astronomy.
            </p>
          </div>

          {messages.length > 0 && (
            <button
              onClick={clearMessages}
              style={{
                ...S,
                fontSize: 9,
                color: '#FF6B35',
                background: 'rgba(255,107,53,0.08)',
                border: '1px solid rgba(255,107,53,0.25)',
                borderRadius: 6,
                padding: '5px 12px',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              🗑️ CLEAR CHAT
            </button>
          )}
        </motion.div>

        {/* Message Panel */}
        <div
          ref={scrollRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px 0',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                textAlign: 'center',
                margin: 'auto 0',
                padding: '40px 0',
              }}
            >
              <div style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: 'rgba(0, 212, 255, 0.08)',
                border: '1px solid rgba(0, 212, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 32,
                margin: '0 auto 20px',
                boxShadow: '0 0 20px rgba(0, 212, 255, 0.15)',
              }}>
                🧠
              </div>
              <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 24, fontWeight: 700, marginBottom: 8, color: '#fff' }}>
                Establish Telemetry Link
              </h2>
              <p style={{ ...S, fontSize: 11, color: 'var(--theme-text-dim, #8892A4)', maxWidth: 440, margin: '0 auto 24px', lineHeight: 1.6 }}>
                Initialize connection with SkyLens AI. Real-time telemetry connection to ISS is active. Choose a suggestion or query the system directly.
              </p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 10,
                maxWidth: 600,
                margin: '0 auto',
              }}>
                {SUGGESTIONS.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => send(s.query)}
                    style={{
                      ...S,
                      fontSize: 10,
                      color: 'var(--theme-text-dim, #a0c0d0)',
                      border: '1px solid var(--theme-border, rgba(255,255,255,0.08))',
                      background: 'rgba(255,255,255,0.02)',
                      padding: '12px 14px',
                      borderRadius: 10,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s',
                      backdropFilter: 'blur(4px)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(0, 212, 255, 0.05)'
                      e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.25)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'
                      e.currentTarget.style.borderColor = 'var(--theme-border, rgba(255,255,255,0.08))'
                    }}
                  >
                    {s.text}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {messages.map((m, i) => {
            const isLast = i === messages.length - 1
            const showFollowups = isLast && m.role === 'assistant' && !isLoading
            const prevMsg = i > 0 ? messages[i - 1]?.content : ''
            const combinedText = prevMsg + ' ' + m.content
            const followups = showFollowups ? (() => {
              const t = combinedText.toLowerCase()
              if (t.includes('iss') || t.includes('zarya') || t.includes('station')) {
                return ["🛰️ Where is the ISS heading now?", "🔬 What science is done on the ISS?"]
              }
              if (t.includes('kp') || t.includes('storm') || t.includes('weather') || t.includes('wind') || t.includes('flare')) {
                return ["🌡️ How do solar storms affect GPS?", "📡 How does NOAA predict space weather?"]
              }
              if (t.includes('jupiter') || t.includes('planet') || t.includes('venus') || t.includes('mars') || t.includes('saturn')) {
                return ["🪐 Tell me about Jupiter's moons.", "🔭 How do I spot planets tonight?"]
              }
              if (t.includes('satellite') || t.includes('orbit') || t.includes('starlink') || t.includes('hubble')) {
                return ["🛰️ How do satellites avoid collisions?", "📡 What is a geostationary orbit?"]
              }
              if (t.includes('moon') || t.includes('lunar') || t.includes('phase')) {
                return ["🌙 What causes a lunar eclipse?", "🚀 Tell me about the Artemis missions."]
              }
              if (t.includes('neo') || t.includes('asteroid') || t.includes('comet') || t.includes('meteor')) {
                return ["☄️ Are any asteroids a threat to Earth?", "🌌 How do we deflect an asteroid?"]
              }
              return ["❓ Tell me another space fact.", "🌌 What is the nearest star system?"]
            })() : []

            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    display: 'flex',
                    justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
                    width: '100%',
                  }}
                >
                  <div style={{
                    maxWidth: '82%',
                    padding: '12px 16px',
                    borderRadius: m.role === 'user' ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                    background: m.role === 'user'
                      ? 'rgba(0, 212, 255, 0.08)'
                      : 'rgba(155, 89, 255, 0.05)',
                    border: m.role === 'user'
                      ? '1px solid rgba(0, 212, 255, 0.25)'
                      : '1px solid rgba(155, 89, 255, 0.2)',
                    boxShadow: m.role === 'user'
                      ? '0 4px 12px rgba(0, 212, 255, 0.05)'
                      : '0 4px 15px rgba(155, 89, 255, 0.08), 0 0 10px rgba(155, 89, 255, 0.05)',
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontSize: 13.5,
                    lineHeight: 1.6,
                    color: '#fff',
                    whiteSpace: 'pre-wrap',
                    backdropFilter: 'blur(12px)',
                  }}>
                    {m.content || (isLoading && i === messages.length - 1 ? (
                      <span style={{ ...S, color: 'var(--theme-accent, #9B59FF)' }}>
                        SkyLens is thinking{dots}
                      </span>
                    ) : '')}
                  </div>
                </motion.div>
                {showFollowups && followups.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      display: 'flex',
                      gap: 8,
                      marginTop: 8,
                      flexWrap: 'wrap',
                      paddingLeft: 8,
                    }}
                  >
                    {followups.map((f, fIdx) => (
                      <button
                        key={fIdx}
                        onClick={() => send(f)}
                        style={{
                          ...S,
                          fontSize: 9,
                          color: 'var(--theme-primary, #00D4FF)',
                          background: 'rgba(0, 212, 255, 0.05)',
                          border: '1px solid rgba(0, 212, 255, 0.2)',
                          borderRadius: 16,
                          padding: '4px 10px',
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = 'rgba(0, 212, 255, 0.12)'
                          e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.4)'
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = 'rgba(0, 212, 255, 0.05)'
                          e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.2)'
                        }}
                      >
                        {f}
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>
            )
          })}
        </div>

        {/* Input Bar */}
        <div style={{
          padding: '16px 0 24px',
          borderTop: '1px solid var(--theme-border, rgba(255,255,255,0.06))',
          backgroundColor: 'transparent',
        }}>
          {messages.length > 0 && (
            <div style={{
              display: 'flex',
              gap: 6,
              overflowX: 'auto',
              paddingBottom: 10,
              marginBottom: 10,
              scrollbarWidth: 'none',
            }}>
              {SUGGESTIONS.slice(0, 4).map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => send(s.query)}
                  style={{
                    ...S,
                    fontSize: 8.5,
                    color: 'var(--theme-text-dim, #8892A4)',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 20,
                    padding: '4px 10px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--theme-primary, #00D4FF)'
                    e.currentTarget.style.color = '#fff'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
                    e.currentTarget.style.color = 'var(--theme-text-dim, #8892A4)'
                  }}
                >
                  {s.text}
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={e => { e.preventDefault(); send(input) }}
            style={{ display: 'flex', gap: 10 }}
          >
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about satellites, the ISS, space weather, the night sky..."
              style={{
                ...S,
                flex: 1,
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid var(--theme-border, rgba(255,255,255,0.1))',
                borderRadius: 8,
                padding: '12px 14px',
                color: '#fff',
                fontSize: 12,
                outline: 'none',
                boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.5)',
              }}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              style={{
                ...S,
                fontSize: 11.5,
                letterSpacing: '0.15em',
                color: '#000',
                background: isLoading || !input.trim()
                  ? 'var(--theme-text-faint, #4A5568)'
                  : 'var(--theme-primary, #00D4FF)',
                border: 'none',
                borderRadius: 8,
                padding: '0 24px',
                cursor: isLoading || !input.trim() ? 'default' : 'pointer',
                transition: 'background 0.2s',
                fontWeight: 700,
                boxShadow: isLoading || !input.trim() ? 'none' : '0 0 15px rgba(0, 212, 255, 0.4)',
              }}
            >
              {isLoading ? '...' : '🚀 Send'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
