'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'

type ThemeKey = 'deep-space' | 'cosmic-aurora' | 'solar-flare' | 'retro-terminal'

interface ThemeContextType {
  theme: ThemeKey
  setTheme: (t: ThemeKey) => void
  nextTheme: () => void
}

const THEME_LABELS: Record<ThemeKey, string> = {
  'deep-space': 'DEEP SPACE',
  'cosmic-aurora': 'COSMIC AURORA',
  'solar-flare': 'SOLAR FLARE',
  'retro-terminal': 'RETRO TERMINAL',
}

const THEME_ORDER: ThemeKey[] = ['deep-space', 'cosmic-aurora', 'solar-flare', 'retro-terminal']

const ThemeContext = createContext<ThemeContextType>({
  theme: 'deep-space',
  setTheme: () => {},
  nextTheme: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeKey>('deep-space')

  useEffect(() => {
    const saved = localStorage.getItem('zenith-theme') as ThemeKey | null
    if (saved && THEME_ORDER.includes(saved)) {
      setThemeState(saved)
      document.documentElement.setAttribute('data-theme', saved)
    } else {
      document.documentElement.setAttribute('data-theme', 'deep-space')
    }
  }, [])

  const setTheme = useCallback((t: ThemeKey) => {
    setThemeState(t)
    localStorage.setItem('zenith-theme', t)
    document.documentElement.setAttribute('data-theme', t)
  }, [])

  const nextTheme = useCallback(() => {
    const idx = THEME_ORDER.indexOf(theme)
    const next = THEME_ORDER[(idx + 1) % THEME_ORDER.length]
    setTheme(next)
  }, [theme, setTheme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, nextTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}

export { THEME_LABELS, THEME_ORDER }
export type { ThemeKey }
