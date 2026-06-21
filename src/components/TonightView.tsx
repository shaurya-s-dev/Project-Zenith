'use client'

const S = { fontFamily: 'Space Mono, monospace' as const }

export default function TonightView() {
  return (
    <div className="w-full h-[180px] bg-[#0a0e1a]/40 backdrop-blur-sm rounded-2xl border border-white/5 p-4 relative overflow-hidden flex flex-col justify-between">
      {/* Title */}
      <div className="flex items-center justify-between z-10 mb-1">
        <div className="flex items-center gap-2">
          <span className="text-sm">🌅</span>
          <span style={S} className="text-xs font-bold text-white tracking-wider text-glow">
            TONIGHT&apos;S VIEW – Estimated Positions
          </span>
          <span className="text-xs cursor-help text-white/50" title="Estimated sky positions from your location">ℹ️</span>
        </div>
        <span style={S} className="text-[8px] text-white/30 tracking-widest uppercase">Estimated positions · Real-time tracking</span>
      </div>
      
      {/* SVG Diagram */}
      <div className="flex-1 w-full relative">
        <svg viewBox="0 0 800 180" className="w-full h-full" preserveAspectRatio="none">
          {/* Gradient sky */}
          <defs>
            <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0a0e1a" />
              <stop offset="60%" stopColor="#1a1a3a" />
              <stop offset="100%" stopColor="#2a1a0a" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="800" height="180" rx="8" fill="url(#skyGrad)" />
          
          {/* Horizon arc */}
          <path d="M 0 150 Q 400 130 800 150" stroke="rgba(255,255,255,0.1)" strokeWidth="2" fill="none" />
          
          {/* Sun (if below horizon, draw as a glow) */}
          <circle cx="650" cy="155" r="20" fill="rgba(255, 180, 50, 0.3)" />
          <circle cx="650" cy="155" r="12" fill="rgba(255, 180, 50, 0.5)" />
          <text x="650" y="175" fill="rgba(255,180,50,0.6)" fontSize="10" style={S} textAnchor="middle">☀️ SUN</text>
          
          {/* Venus */}
          <circle cx="550" cy="120" r="6" fill="rgba(255, 255, 255, 0.9)" />
          <circle cx="550" cy="120" r="10" fill="rgba(255, 255, 255, 0.1)" />
          <text x="550" y="135" fill="rgba(255,255,255,0.6)" fontSize="10" style={S} textAnchor="middle">VENUS</text>
          
          {/* Jupiter */}
          <circle cx="400" cy="80" r="10" fill="rgba(255, 200, 150, 0.9)" />
          <circle cx="400" cy="80" r="16" fill="rgba(255, 200, 150, 0.1)" />
          <text x="400" y="98" fill="rgba(255,255,255,0.6)" fontSize="10" style={S} textAnchor="middle">JUPITER</text>
          
          {/* Mars */}
          <circle cx="250" cy="90" r="7" fill="rgba(255, 100, 50, 0.9)" />
          <circle cx="250" cy="90" r="12" fill="rgba(255, 100, 50, 0.1)" />
          <text x="250" y="108" fill="rgba(255,255,255,0.6)" fontSize="10" style={S} textAnchor="middle">MARS</text>
          
          {/* Saturn */}
          <circle cx="150" cy="140" r="8" fill="rgba(255, 220, 180, 0.7)" />
          <circle cx="150" cy="140" r="14" fill="rgba(255, 220, 180, 0.1)" />
          <text x="150" y="158" fill="rgba(255,255,255,0.6)" fontSize="10" style={S} textAnchor="middle">SATURN</text>
          
          {/* Moon */}
          <circle cx="320" cy="40" r="12" fill="rgba(200, 200, 220, 0.8)" />
          <circle cx="320" cy="40" r="18" fill="rgba(200, 200, 220, 0.1)" />
          <text x="320" y="58" fill="rgba(255,255,255,0.6)" fontSize="10" style={S} textAnchor="middle">🌙 MOON</text>
        </svg>
      </div>
    </div>
  )
}
