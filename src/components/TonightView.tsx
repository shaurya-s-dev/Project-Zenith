'use client'

const S = { fontFamily: 'Space Mono, monospace' as const }

export default function TonightView() {
  return (
    <div className="w-full h-[180px] bg-[#0a0e1a]/60 backdrop-blur-md rounded-2xl border border-white/10 p-4 relative overflow-hidden flex flex-col justify-between">
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
      <div className="flex-1 w-full relative flex items-center justify-center">
        <svg viewBox="0 0 800 135" className="w-full h-full max-w-[800px]" preserveAspectRatio="xMidYMid meet">
          {/* Gradient sky inside the box */}
          <defs>
            <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#080816" />
              <stop offset="60%" stopColor="#0e0e24" />
              <stop offset="100%" stopColor="#161220" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="800" height="135" rx="10" fill="url(#skyGrad)" />
          
          {/* Star vault guidelines */}
          <path d="M 80 115 A 300 300 0 0 1 720 115" stroke="rgba(0,212,255,0.06)" strokeWidth="1" strokeDasharray="3,3" fill="none" />
          <path d="M 180 115 A 200 200 0 0 1 620 115" stroke="rgba(0,212,255,0.04)" strokeWidth="1" strokeDasharray="3,3" fill="none" />
          
          {/* Horizon arc */}
          <path d="M 0 115 Q 400 100 800 115" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" fill="none" />
          
          {/* Compass direction labels */}
          <text x="25" y="112" fill="rgba(255,255,255,0.25)" fontSize="9" style={S}>W</text>
          <text x="775" y="112" fill="rgba(255,255,255,0.25)" fontSize="9" style={S} textAnchor="end">E</text>
          
          {/* Sun (below horizon, drawing as a warm glow) */}
          <circle cx="680" cy="120" r="16" fill="rgba(255, 140, 50, 0.25)" />
          <circle cx="680" cy="120" r="8" fill="rgba(255, 140, 50, 0.45)" />
          <text x="680" y="132" fill="rgba(255,140,50,0.6)" fontSize="9" style={S} textAnchor="middle">☀️ SUN</text>
          
          {/* Venus */}
          <circle cx="560" cy="85" r="5" fill="#FFFFFF" />
          <circle cx="560" cy="85" r="10" fill="rgba(255, 255, 255, 0.15)" />
          <text x="560" y="99" fill="rgba(255,255,255,0.7)" fontSize="9" style={S} textAnchor="middle">VENUS</text>
          
          {/* Jupiter */}
          <circle cx="440" cy="50" r="7" fill="#FCD34D" />
          <circle cx="440" cy="50" r="13" fill="rgba(252, 211, 77, 0.15)" />
          <text x="440" y="66" fill="rgba(252,211,77,0.7)" fontSize="9" style={S} textAnchor="middle">JUPITER</text>
          
          {/* Mars */}
          <circle cx="280" cy="55" r="6" fill="#F87171" />
          <circle cx="280" cy="55" r="11" fill="rgba(248, 113, 113, 0.15)" />
          <text x="280" y="71" fill="rgba(248,113,113,0.7)" fontSize="9" style={S} textAnchor="middle">MARS</text>
          
          {/* Saturn */}
          <circle cx="160" cy="95" r="5" fill="#E2E8F0" />
          <circle cx="160" cy="95" r="10" fill="rgba(226, 232, 240, 0.15)" />
          {/* Saturn's Ring */}
          <ellipse cx="160" cy="95" rx="8" ry="2.2" fill="none" stroke="#CBD5E1" strokeWidth="1.2" transform="rotate(-15 160 95)" />
          <text x="160" y="109" fill="rgba(226, 232, 240, 0.7)" fontSize="9" style={S} textAnchor="middle">SATURN</text>
          
          {/* Moon */}
          <circle cx="350" cy="22" r="8" fill="#E2E8F0" />
          <circle cx="350" cy="22" r="15" fill="rgba(226, 232, 240, 0.12)" />
          {/* Moon crescent shading */}
          <path d="M 350 14 A 8 8 0 0 0 350 30 A 6 8 0 0 1 350 14" fill="#080816" opacity="0.6" />
          <text x="350" y="36" fill="rgba(255,255,255,0.7)" fontSize="9" style={S} textAnchor="middle">🌙 MOON</text>
        </svg>
      </div>
    </div>
  )
}
