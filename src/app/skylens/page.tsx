'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useSkyLens } from '@/components/SkyLensContext'

const NAV = [['MISSION CONTROL','/dashboard'],['SKY ABOVE ME','/sky'],['SPACE WEATHER','/weather'],['SKYLENS AI','/skylens']]
const S = { fontFamily: 'Space Mono, monospace' }

interface Msg { role: 'user' | 'assistant'; content: string }

const SUGGESTIONS = [
  'How fast is the ISS moving right now?',
  'What causes the aurora?',
  'Why does the Moon have phases?',
  'How do satellites stay in orbit?',
]

export default function SkyLensPage() {
  const { messages, addMessage, updateLastMessage, clearMessages, isLoading, setIsLoading } = useSkyLens()
  const [input, setInput] = useState('')
  const [issContext, setIssContext] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('https://api.wheretheiss.at/v1/satellites/25544')
      .then(r => r.json())
      .then(d => setIssContext(`ISS position: lat ${d.latitude.toFixed(2)}°, lon ${d.longitude.toFixed(2)}°, altitude ${Math.round(d.altitude)} km, velocity ${Math.round(d.velocity)} km/h.`))
      .catch(() => {})
  }, [])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

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
    <div style={{ height: '100vh', background: '#000', color: '#fff', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      <nav style={{ height: 56, flexShrink: 0, background: 'rgba(0,0,0,0.9)', borderBottom: '1px solid rgba(0,212,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', backdropFilter: 'blur(20px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00D4FF', animation: 'pulse-cyan 2s infinite' }} />
          <span style={{ ...S, color: '#00D4FF', letterSpacing: '0.3em', fontSize: 14, fontWeight: 700 }}>ZENITH</span>
        </div>
        <div style={{ display: 'flex', gap: 32 }}>
          {NAV.map(([label, href]) => (
            <Link key={label} href={href} style={{ ...S, fontSize: 10, letterSpacing: '0.2em', color: href === '/skylens' ? '#00D4FF' : '#8892A4', textDecoration: 'none' }}>{label}</Link>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#9B59FF', animation: 'blink 1s infinite' }} />
          <span style={{ ...S, fontSize: 10, color: '#9B59FF', letterSpacing: '0.15em' }}>AI ONLINE</span>
        </div>
      </nav>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', maxWidth: 760, margin: '0 auto', width: '100%', padding: '0 20px', overflow: 'hidden' }}>

        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px 0' }}>
          {messages.length > 0 && (
            <button
              onClick={clearMessages}
              style={{ ...S, fontSize: 8, color: '#8892A4', background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 4, padding: '3px 8px', cursor: 'pointer' }}
            >
              CLEAR CHAT
            </button>
          )}
        </div>

        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '24px 0' }}>
          {messages.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', marginTop: 60 }}>
              <div style={{ ...S, fontSize: 11, color: '#9B59FF', letterSpacing: '0.3em', marginBottom: 12 }}>SKYLENS AI</div>
              <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 22, marginBottom: 8 }}>Ask me about the sky</div>
              <div style={{ ...S, fontSize: 11, color: '#4A5568', marginBottom: 28 }}>Live-aware of current ISS telemetry · powered by Groq</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', maxWidth: 500, margin: '0 auto' }}>
                {SUGGESTIONS.map(s => (
                  <button key={s} onClick={() => send(s)} style={{ ...S, fontSize: 10, color: '#8892A4', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)', padding: '8px 12px', borderRadius: 8, cursor: 'pointer', textAlign: 'left' }}>{s}</button>
                ))}
              </div>
            </motion.div>
          )}

          {messages.map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: 14 }}>
              <div style={{
                maxWidth: '78%', padding: '10px 14px', borderRadius: 10,
                background: m.role === 'user' ? 'rgba(0,212,255,0.1)' : 'rgba(155,89,255,0.06)',
                border: m.role === 'user' ? '1px solid rgba(0,212,255,0.25)' : '1px solid rgba(155,89,255,0.15)',
                fontFamily: 'Space Grotesk, sans-serif', fontSize: 13, lineHeight: 1.6, color: '#fff',
                whiteSpace: 'pre-wrap',
              }}>
                {m.content || (isLoading && i === messages.length - 1 ? <span style={{ ...S, color: '#9B59FF' }}>···</span> : '')}
              </div>
            </motion.div>
          ))}
        </div>

        <form onSubmit={e => { e.preventDefault(); send(input) }} style={{ display: 'flex', gap: 10, padding: '16px 0 24px', flexShrink: 0 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about satellites, the ISS, space weather, the night sky..."
            style={{ ...S, flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '12px 14px', color: '#fff', fontSize: 12, outline: 'none' }}
          />
          <button type="submit" disabled={isLoading} style={{ ...S, fontSize: 10, letterSpacing: '0.15em', color: '#000', background: isLoading ? '#4A5568' : '#00D4FF', border: 'none', borderRadius: 8, padding: '0 22px', cursor: isLoading ? 'default' : 'pointer' }}>
            {isLoading ? '...' : 'SEND'}
          </button>
        </form>
      </div>
    </div>
  )
}
