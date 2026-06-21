# 🌌 Project Zenith — The Celestial Eye

> Real-time cosmic radar. Track satellites, the ISS, planets and constellations above any point on Earth.

Built with **Next.js 16**, **React 19**, **Three.js / react-globe.gl**, **Framer Motion**, and **Groq AI** (SkyLens).

---

## 🚀 Getting Started

```bash
npm install
cp .env.example .env.local   # add your GROQ_API_KEY
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 🔑 Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GROQ_API_KEY` | ✅ | Powers the SkyLens AI chat (get one at console.groq.com) |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── dashboard/page.tsx   # Mission Control — globe + satellite tracker
│   ├── sky/page.tsx         # Sky Above Me — ISS compass, moon, planets
│   ├── weather/page.tsx     # Space Weather — live NOAA SWPC data
│   ├── skylens/page.tsx     # SkyLens AI — streaming space assistant
│   └── api/
│       ├── iss/route.ts     # Proxy → wheretheiss.at (with fallback)
│       └── skylens/route.ts # Groq streaming endpoint
├── components/
│   ├── Globe.tsx            # react-globe.gl WebGL globe
│   ├── GlobeDynamic.tsx     # SSR-safe dynamic wrapper (Part 9)
│   ├── TimeTravel.tsx       # Time simulation slider (Part 6)
│   └── ui/
│       ├── InfoRayButton.tsx   # Ray-burst ⓘ button (Part 2)
│       ├── SkyLensModal.tsx    # Slide-up AI modal + voice (Part 5)
│       └── CosmicToast.tsx     # Shooting-star notification toasts (Part 8)
```

---

## 🚀 Advanced Features & Animations

### Part 2 — Ray Burst Info Button (`InfoRayButton`)

Every satellite card and celestial object has a small **ⓘ** button. On click it fires a **radial burst of 10 rays** — each ray scales outward with a gold-to-cyan gradient and fades over 0.65 s — then opens the SkyLens modal for that object.

```tsx
<InfoRayButton
  color="#00FF88"
  size={28}
  onClick={() => openSkyLens(satellite)}
/>
```

Key details:
- 10 rays evenly spaced at 36° intervals using absolute `div`s rotated with CSS transforms
- `@keyframes rayBurst` scales Y from 0.2 → 1.2 → 0.6 with translateY for a natural "explosion then settle" feel
- The ⓘ icon pulses with a `drop-shadow` glow during the burst

---

### Part 3 — Sky Above Me & Space Weather Grid

The `/sky` page uses a **CSS Grid 3-column layout** that keeps Sky Above Me (2 cols) and Space Weather (1 col) perfectly aligned at any viewport width.

```tsx
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
  <div style={{ gridColumn: 'span 2' }}>  {/* Sky Above Me */}  </div>
  <div style={{ gridColumn: 'span 1' }}>  {/* Space Weather */} </div>
</div>
```

Inside Sky Above Me, a second `grid-template-columns: 1fr 1fr` splits **Zenith Objects** (left) from **Rise/Set Times** (right).

---

### Part 5 — SkyLens AI Modal + Voice Input

Triggered by any **ⓘ** button. The modal **slides up from the bottom** with glass-morphism:

- `backdrop-filter: blur(24px)` + `rgba(8,12,24,0.97)` background
- Spring animation: `stiffness: 280, damping: 30`
- **3 tabs**: Overview · Orbit Data · AI Fun Fact
- Responses stream token-by-token from Groq via the `/api/skylens` SSE endpoint
- **Voice input** via Web Speech API — tap 🎙️, speak, auto-submits:

```ts
function getSpeechRecognition(): any {
  if (typeof window === 'undefined') return null
  return (window as any).SpeechRecognition ||
         (window as any).webkitSpeechRecognition || null
}
```

> Note: `(window as any)` casting avoids the TypeScript `Property 'SpeechRecognition' does not exist on Window` build error.

---

### Part 6 — Time Travel Simulation

A **time-travel slider** sits below the globe on the dashboard. Drag it from −12 h to +48 h to simulate where satellites *were* or *will be*.

- Track fills with directional gradient: purple (past) → gold (future)
- **Comet-tail thumb**: the slider handle glows with a trailing `box-shadow` (`-8px 0 12px rgba(0,212,255,0.8)`) giving it a comet-burning-through-time look
- **▶ PLAY** auto-advances at 5 min per 100 ms tick
- Navbar shows **⏳ SIM** badge when not in live mode, snaps to **LIVE** on reset
- Satellite positions are propagated using orbital-period math (LEO ≈ 92 min, MEO ≈ 6 h)

---

### Part 8 — Cosmic Notification Toasts

`CosmicToastProvider` wraps the entire app in `layout.tsx`. Toasts slide in from the top-right with:

- **Shooting-star bar**: a `@keyframes shootingStarBar` gradient races across the top edge as the toast appears
- Neon border colour-coded by type: cyan (info) · green (success) · gold (warning) · orange (alert)
- Auto-dismiss after 5 s with an animated progress bar along the bottom

```tsx
const { addToast } = useToast()
addToast('NEO 2024 BX1 approaching — distance 2.3 LD', {
  title: 'NEO PROXIMITY ALERT',
  type: 'warning',
})
```

---

### Part 9 — Performance & Code Quality

#### `next/dynamic` with `ssr: false`

All heavy WebGL / 3D components are lazy-loaded client-side only, preventing SSR crashes and Node.js memory leaks:

```ts
// GlobeDynamic.tsx — the canonical pattern used project-wide
const Globe = dynamic(() => import('./Globe'), {
  ssr: false,
  loading: () => <GlobeLoadingSpinner />,
})
```

Components using this pattern:
| Component | Reason |
|---|---|
| `Globe` (react-globe.gl + Three.js) | `window`, `WebGLRenderingContext`, `requestAnimationFrame` |
| Any future CesiumJS viewer | Same WebGL APIs |
| Any future Three.js canvas | Same |

#### `next.config.ts` optimisations

```ts
experimental: {
  optimizePackageImports: ['three', 'react-globe.gl', 'framer-motion', 'satellite.js', 'lucide-react'],
},
webpack(config) {
  config.module.exprContextCritical = false  // silences Three.js worker warnings
  return config
},
```

`optimizePackageImports` tells the Next.js compiler to tree-shake these libraries more aggressively, only bundling the specific exports each page actually imports rather than the entire package.

---

## 🛰️ Data Sources

| Feed | URL | Update rate |
|---|---|---|
| ISS position | `api.wheretheiss.at/v1/satellites/25544` | Every 5 s |
| Kp index | `services.swpc.noaa.gov/json/planetary_k_index_1m.json` | Every 60 s |
| Solar wind | `services.swpc.noaa.gov/products/solar-wind/plasma-1-day.json` | Every 60 s |
| X-ray flux | `services.swpc.noaa.gov/json/goes/primary/xrays-1-day.json` | Every 60 s |
| SkyLens AI | Groq (`openai/gpt-oss-120b`) | On demand |

---

## 🚢 Deploy on Vercel

```bash
vercel deploy
```

Set `GROQ_API_KEY` in your Vercel project's environment variables. The `api/iss` route includes a fallback position so the UI never goes blank even if the external API is down.

---

## 📜 License

MIT