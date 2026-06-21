'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'

type ThemeKey = 'deep-space' | 'holographic' | 'solar-flare' | 'aurora-borealis'

interface ThemeContextType {
  theme: ThemeKey
  setTheme: (t: ThemeKey) => void
  nextTheme: () => void
  hologramOn: boolean
  setHologramOn: (h: boolean) => void
}

const THEME_LABELS: Record<ThemeKey, string> = {
  'deep-space': 'DEEP SPACE',
  'holographic': 'HOLOGRAPHIC',
  'solar-flare': 'SOLAR FLARE',
  'aurora-borealis': 'AURORA BOREALIS',
}

const THEME_ORDER: ThemeKey[] = ['deep-space', 'holographic', 'solar-flare', 'aurora-borealis']

const ThemeContext = createContext<ThemeContextType>({
  theme: 'deep-space',
  setTheme: () => {},
  nextTheme: () => {},
  hologramOn: false,
  setHologramOn: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeKey>('deep-space')
  const [hologramOn, setHologramOnState] = useState<boolean>(false)

  useEffect(() => {
    const saved = localStorage.getItem('zenith-theme') as ThemeKey | null
    if (saved && THEME_ORDER.includes(saved)) {
      setTimeout(() => setThemeState(saved), 0)
      document.documentElement.setAttribute('data-theme', saved)
    } else {
      document.documentElement.setAttribute('data-theme', 'deep-space')
    }

    const savedHolo = localStorage.getItem('zenith-hologram')
    if (savedHolo === 'true') {
      setTimeout(() => setHologramOnState(true), 0)
      document.documentElement.setAttribute('data-hologram', 'true')
    } else {
      document.documentElement.setAttribute('data-hologram', 'false')
    }
  }, [])

  const setTheme = useCallback((t: ThemeKey) => {
    setThemeState(t)
    localStorage.setItem('zenith-theme', t)
    document.documentElement.setAttribute('data-theme', t)
    // If setting to holographic, sync hologram mode
    if (t === 'holographic') {
      setHologramOnState(true)
      localStorage.setItem('zenith-hologram', 'true')
      document.documentElement.setAttribute('data-hologram', 'true')
    }
  }, [])

  const setHologramOn = useCallback((h: boolean) => {
    setHologramOnState(h)
    localStorage.setItem('zenith-hologram', h ? 'true' : 'false')
    document.documentElement.setAttribute('data-hologram', h ? 'true' : 'false')
    if (h) {
      setThemeState('holographic')
      localStorage.setItem('zenith-theme', 'holographic')
      document.documentElement.setAttribute('data-theme', 'holographic')
    } else if (theme === 'holographic') {
      // Toggle back to default deep-space
      setTheme('deep-space')
    }
  }, [theme, setTheme])

  const nextTheme = useCallback(() => {
    const idx = THEME_ORDER.indexOf(theme)
    const next = THEME_ORDER[(idx + 1) % THEME_ORDER.length]
    setTheme(next)
  }, [theme, setTheme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, nextTheme, hologramOn, setHologramOn }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}

export { THEME_LABELS, THEME_ORDER }
export type { ThemeKey }
