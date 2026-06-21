'use client'

import { createContext, useContext, useState, useCallback, useEffect } from 'react'

interface Msg { role: 'user' | 'assistant'; content: string }

interface SkyLensContextType {
  messages: Msg[]
  addMessage: (m: Msg) => void
  updateLastMessage: (content: string) => void
  clearMessages: () => void
  isLoading: boolean
  setIsLoading: (v: boolean) => void
}

const STORAGE_KEY = 'zenith-skylens-messages'

const SkyLensContext = createContext<SkyLensContextType>({
  messages: [],
  addMessage: () => {},
  updateLastMessage: () => {},
  clearMessages: () => {},
  isLoading: false,
  setIsLoading: () => {},
})

export function SkyLensProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Msg[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) return JSON.parse(saved)
      } catch {}
    }
    return []
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
  }, [messages])

  const addMessage = useCallback((m: Msg) => {
    setMessages(prev => [...prev, m])
  }, [])

  const updateLastMessage = useCallback((content: string) => {
    setMessages(prev => {
      if (prev.length === 0) return prev
      const copy = [...prev]
      copy[copy.length - 1] = { role: 'assistant', content }
      return copy
    })
  }, [])

  const clearMessages = useCallback(() => {
    setMessages([])
  }, [])

  return (
    <SkyLensContext.Provider value={{ messages, addMessage, updateLastMessage, clearMessages, isLoading, setIsLoading }}>
      {children}
    </SkyLensContext.Provider>
  )
}

export function useSkyLens() {
  return useContext(SkyLensContext)
}
