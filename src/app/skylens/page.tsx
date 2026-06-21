'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSkyLens } from '@/components/SkyLensContext'

const S = { fontFamily: 'Space Mono, monospace' as const }

interface Msg { role: 'user' | 'assistant'; content: string }

const SUGGESTIONS = [
  'What is the ISS doing right now?',
  'Explain the KP index in simple terms.',
  'When can I see Jupiter tonight?',
  'How does satellite tracking work?',
  'Tell me about the moon phases.',
  'What is a near-Earth object?',
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
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

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
      updateLastMessage('SIGNAL LOST — could not reach SkyLens core. Check your GROQ_API_KEY and restart the dev server.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: 'calc(100vh - 52px)',
      color: 'var(--theme-text, #fff)',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', maxWidth: 760, margin: '0 auto', width: '100%', padding: '0 20px', overflow: 'hidden' }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '28px 0 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 22 }}>🌌</span>
            <h1 style={{
              fontFamily: 'Space Grotesk, sans-serif', fontSize: 22, fontWeight: 700,
              letterSpacing: '0.05em', color: 'var(--theme-text, #fff)',
            }}>
              SkyLens AI
            </h1>
          </div>
          <p style={{ ...S, fontSize: 10, color: 'var(--theme-text-dim, #8892A4)' }}>
            Your Space Expert — Ask me anything about space, satellites, planets, and astronomy.
          </p>
        </motion.div>

        {/* Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 0 8px' }}>
          {messages.length > 0 && (
            <button
              onClick={clearMessages}
              style={{
                ...S, fontSize: 8, color: 'var(--theme-text-dim, #8892A4)',
                background: 'transparent', border: '1px solid var(--theme-border, rgba(255,255,255,0.08))',
                borderRadius: 4, padding: '3px 8px', cursor: 'pointer',
              }}
            >
              CLEAR CHAT
            </button>
          )}
        </div>

        {/* Messages */}
        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', paddingBottom: 12 }}>
          {messages.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', marginTop: 40 }}>
              <div style={{ ...S, fontSize: 11, color: 'var(--theme-accent, #9B59FF)', letterSpacing: '0.3em', marginBottom: 12 }}>SKYLENS AI</div>
              <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 20, marginBottom: 8, color: 'var(--theme-text, #fff)' }}>
                Ask me about the sky
              </div>
              <div style={{ ...S, fontSize: 11, color: 'var(--theme-text-faint, #4A5568)', marginBottom: 28 }}>
                Live-aware of current ISS telemetry · powered by Groq
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', maxWidth: 520, margin: '0 auto' }}>
                {SUGGESTIONS.map(s => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    style={{
                      ...S, fontSize: 10, color: 'var(--theme-text-dim, #8892A4)',
                      border: '1px solid var(--theme-border, rgba(255,255,255,0.1))',
                      background: 'rgba(255,255,255,0.02)', padding: '8px 12px',
                      borderRadius: 8, cursor: 'pointer', textAlign: 'left',
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {messages.map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: 14 }}>
              <div style={{
                maxWidth: '78%', padding: '10px 14px', borderRadius: 10,
                background: m.role === 'user'
                  ? 'color-mix(in srgb, var(--theme-primary, #00D4FF) 8%, transparent)'
                  : 'color-mix(in srgb, var(--theme-accent, #9B59FF) 4%, transparent)',
                border: m.role === 'user'
                  ? '1px solid color-mix(in srgb, var(--theme-primary, #00D4FF) 20%, transparent)'
                  : '1px solid color-mix(in srgb, var(--theme-accent, #9B59FF) 12%, transparent)',
                fontFamily: 'Space Grotesk, sans-serif', fontSize: 13, lineHeight: 1.6,
                color: 'var(--theme-text, #fff)',
                whiteSpace: 'pre-wrap',
              }}>
                {m.content || (isLoading && i === messages.length - 1 ? (
                  <span style={{ ...S, color: 'var(--theme-accent, #9B59FF)' }}>
                    thinking{dots}
                  </span>
                ) : '')}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Input */}
        <form onSubmit={e => { e.preventDefault(); send(input) }} style={{
          display: 'flex', gap: 10, padding: '12px 0 24px', flexShrink: 0,
          borderTop: '1px solid var(--theme-border, rgba(255,255,255,0.06))',
          marginTop: 8,
        }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about satellites, the ISS, space weather, the night sky..."
            style={{
              ...S, flex: 1, background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--theme-border, rgba(255,255,255,0.1))',
              borderRadius: 8, padding: '12px 14px', color: 'var(--theme-text, #fff)',
              fontSize: 12, outline: 'none',
            }}
          />
          <button
            type="submit"
            disabled={isLoading}
            style={{
              ...S, fontSize: 10, letterSpacing: '0.15em',
              color: '#000',
              background: isLoading ? 'var(--theme-text-faint, #4A5568)' : 'var(--theme-primary, #00D4FF)',
              border: 'none', borderRadius: 8, padding: '0 22px',
              cursor: isLoading ? 'default' : 'pointer',
              transition: 'background 0.2s',
            }}
          >
            {isLoading ? '...' : '🚀 Send'}
          </button>
        </form>
      </div>
    </div>
  )
}
