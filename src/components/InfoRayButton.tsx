'use client'

import { useState, useEffect } from 'react'

interface InfoRayButtonProps {
  onClick: () => void
  color?: string
  size?: number
}

export const InfoRayButton = ({ onClick, color = '#FFD400', size = 32 }: InfoRayButtonProps) => {
  const [isBursting, setIsBursting] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const handleClick = () => {
    setIsBursting(true)
    setTimeout(() => setIsBursting(false), 700)
    onClick()
  }

  const RAY_COUNT = 10
  const rays = Array.from({ length: RAY_COUNT }, (_, i) => i)

  return (
    <button
      onClick={handleClick}
      style={{
        position: 'relative',
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
        flexShrink: 0,
      }}
      aria-label="Info"
    >
      {/* Glow ring */}
      <div style={{
        position: 'absolute',
        inset: -4,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${color}22 0%, transparent 70%)`,
        opacity: isBursting ? 1 : 0,
        transition: 'opacity 0.1s',
        pointerEvents: 'none',
      }} />

      {/* Rays burst */}
      {mounted && isBursting && rays.map((i) => {
        const angle = (i / RAY_COUNT) * 360
        const angleRad = (angle * Math.PI) / 180
        const endX = Math.cos(angleRad) * (size * 1.4)
        const endY = Math.sin(angleRad) * (size * 1.4)
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: 2,
              height: size * 0.55,
              marginLeft: -1,
              marginTop: -(size * 0.55),
              transformOrigin: '50% 100%',
              transform: `rotate(${angle}deg)`,
              borderRadius: 2,
              background: `linear-gradient(to top, transparent, ${i % 2 === 0 ? color : '#00D4FF'})`,
              animation: 'rayBurst 0.6s ease-out forwards',
              pointerEvents: 'none',
            }}
          />
        )
      })}

      {/* ⓘ icon */}
      <span style={{
        fontFamily: 'Space Mono, monospace',
        fontSize: size * 0.55,
        color: color,
        lineHeight: 1,
        display: 'block',
        transition: 'transform 0.15s, filter 0.15s',
        filter: isBursting ? `drop-shadow(0 0 6px ${color})` : 'none',
        transform: isBursting ? 'scale(1.15)' : 'scale(1)',
        userSelect: 'none',
      }}>
        ⓘ
      </span>

      <style>{`
        @keyframes rayBurst {
          0%   { transform: rotate(var(--r, 0deg)) scaleY(0); opacity: 1; }
          60%  { opacity: 0.8; }
          100% { transform: rotate(var(--r, 0deg)) scaleY(2.2); opacity: 0; }
        }
      `}</style>
    </button>
  )
}