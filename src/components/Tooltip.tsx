'use client'

import { useState, useRef, useCallback } from 'react'

interface TooltipProps {
  content: React.ReactNode
  children: React.ReactNode
  color?: string
}

export default function Tooltip({ content, children, color = '#00D4FF' }: TooltipProps) {
  const [show, setShow] = useState(false)
  const [coords, setCoords] = useState({ x: 0, y: 0 })
  const wrapRef = useRef<HTMLSpanElement>(null)

  const handleEnter = useCallback(() => {
    const rect = wrapRef.current?.getBoundingClientRect()
    if (rect) setCoords({ x: rect.left + rect.width / 2, y: rect.top })
    setShow(true)
  }, [])

  return (
    <span ref={wrapRef} onMouseEnter={handleEnter} onMouseLeave={() => setShow(false)} style={{ display: 'contents' }}>
      {children}
      {show && (
        <span style={{
          position: 'fixed', left: coords.x, top: coords.y - 10,
          transform: 'translate(-50%, -100%)', zIndex: 2000,
          background: 'rgba(6,8,18,0.97)', border: `1px solid ${color}40`,
          borderRadius: 8, padding: '8px 12px', minWidth: 170, maxWidth: 240,
          pointerEvents: 'none', boxShadow: `0 8px 24px rgba(0,0,0,0.5), 0 0 16px ${color}11`,
          backdropFilter: 'blur(14px)', display: 'block',
        }}>
          {content}
        </span>
      )}
    </span>
  )
}