/**
 * PART 9 — Performance: dynamic import wrapper for the Globe component.
 *
 * react-globe.gl depends on Three.js and WebGL APIs that only exist in the
 * browser. Wrapping it with next/dynamic + ssr:false means Next.js will never
 * attempt to render it on the server, preventing:
 *   - "document is not defined" / "window is not defined" SSR crashes
 *   - Memory leaks from dangling WebGL contexts in the Node.js process
 *   - Unnecessarily large server-side HTML payloads
 *
 * Usage (replaces a direct `import Globe from '@/components/Globe'`):
 *   import GlobeDynamic from '@/components/GlobeDynamic'
 *   <GlobeDynamic satellites={...} selected={...} onSelect={...} />
 */
'use client'

import dynamic from 'next/dynamic'
import { ComponentProps } from 'react'

// Lazy-load the actual WebGL globe — zero SSR, shows spinner while loading
const Globe = dynamic(() => import('./Globe'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#000',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          border: '2px solid rgba(0,212,255,0.15)',
          borderTop: '2px solid #00D4FF',
          animation: 'rotate-slow 1s linear infinite',
        }}
      />
      <span
        style={{
          fontFamily: 'Space Mono, monospace',
          fontSize: 10,
          color: '#4A5568',
          letterSpacing: '0.2em',
        }}
      >
        INITIALIZING GLOBE...
      </span>
    </div>
  ),
})

// Re-export with the same prop types so callers need zero changes
type GlobeProps = ComponentProps<typeof Globe>
export default function GlobeDynamic(props: GlobeProps) {
  return <Globe {...props} />
}