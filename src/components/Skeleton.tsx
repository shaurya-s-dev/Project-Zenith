'use client'

const shimmerStyle: React.CSSProperties = {
  background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.03) 75%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.5s ease-in-out infinite',
  borderRadius: 6,
}

export function SkeletonLine({ w = '100%', h = 12, style }: { w?: string | number; h?: number; style?: React.CSSProperties }) {
  return <div style={{ ...shimmerStyle, width: w as any, height: h, ...style }} />
}

export function SkeletonRect({ w = '100%', h = 80, style }: { w?: string | number; h?: number; style?: React.CSSProperties }) {
  return <div style={{ ...shimmerStyle, width: w as any, height: h, ...style }} />
}

export function SkeletonCircle({ size = 40, style }: { size?: number; style?: React.CSSProperties }) {
  return <div style={{ ...shimmerStyle, width: size, height: size, borderRadius: '50%', ...style }} />
}

export function SkeletonCard({ lines = 3, style }: { lines?: number; style?: React.CSSProperties }) {
  return (
    <div style={{ padding: 12, ...style }}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonLine key={i} h={10} style={{ marginBottom: 8, width: i === lines - 1 ? '60%' : '100%' }} />
      ))}
    </div>
  )
}
