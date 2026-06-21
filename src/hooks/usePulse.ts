'use client'

import { useEffect, useRef, useState } from 'react'

export function usePulseOnChange<T>(value: T, duration = 700): boolean {
  const [pulse, setPulse] = useState(false)
  const isFirstMount = useRef(true)

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false
      return
    }

    setPulse(true)
    const timer = setTimeout(() => {
      setPulse(false)
    }, duration)

    return () => clearTimeout(timer)
  }, [value, duration])

  return pulse
}
