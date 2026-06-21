# 🛰️ Project Zenith — The Celestial Eye

> Real-time WebGL cosmic radar. Track satellites, the ISS, space debris, planets, and constellations above any point on Earth with AI-powered space diagnostics.

Built with **Next.js 16 (Turbopack)**, **React 19**, **Three.js / react-globe.gl**, **Framer Motion**, **Tailwind CSS v4**, and **Groq AI (SkyLens)**.

---

## 🚀 Getting Started

To run the application locally:

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
# Copy .env.example and populate your console.groq.com API key
cp .env.example .env.local

# 3. Launch the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view Mission Control.

---

## 🔑 Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GROQ_API_KEY` | ✅ | Powers the SkyLens AI space assistant chat stream |

---

## 📁 Project Architecture

```
src/
├── app/
│   ├── dashboard/page.tsx   # Mission Control — 3D Globe, tachometer HUD, stats, fact widget
│   ├── sky/page.tsx         # Sky Above Me — rise/set times, Tonight's View horizon, moon gallery
│   ├── weather/page.tsx     # Space Weather — NOAA SWPC telemetry charts and gauges
│   ├── skylens/page.tsx     # SkyLens AI Page — full screen AI conversation hub
│   └── api/
│       ├── iss/route.ts     # ISS telemetry proxy with fallback caching
│       └── skylens/route.ts # Groq streaming chat endpoint
├── components/
│   ├── Globe.tsx            # WebGL Globe with constellation arcs, labels, and orbit path rendering
│   ├── GlobeDynamic.tsx     # SSR-safe dynamic wrapper for WebGL
│   ├── SysMon.tsx           # Cyberpunk system diagnostics HUD overlay (FPS, Heap memory, sync latency)
│   ├── TonightView.tsx      # SVG Horizon diagram with clickable planet targets
│   ├── KeyboardShortcuts.tsx# Fixed hotkey listener (Space to pause, M to open SkyLens, 1-4 for themes)
│   ├── LaunchCountdownWidget.tsx # Live launch countdown clock (renders pure for React 19)
│   ├── InfoModal.tsx        # Framer-motion centered knowledge modal
│   └── SkyLensModal.tsx    # Centered floating AI helper with suggestions & voice inputs
```

---

## 🛰️ Advanced Subsystems & Features

### 1. 3D WebGL Globe & Animated Orbit Paths
* **3D Orbital Trails**: Traces the exact orbital path of the selected satellite at its real altitude. The path is rendered as a 3D dashed line trail that moves forward in the direction of the satellite's flight.
* **Lag-Free Time Travel Camera Tracking**: Dynamically tracks selected satellites during time simulation. Updates camera coordinates instantly (`0ms`) during slider drags to prevent camera transition overlaps, while maintaining smooth `900ms` transitions on new clicks.
* **Default Rotation**: Auto-rotates immediately on startup by initializing controls inside the WebGL `onGlobeReady` callback hook.

### 2. Interactive Columns & Specification Modals
All three dashboard column widgets are hover-reactive (`hover-lift` class) and support click triggers that open detailed, color-coded diagnostic panels:
* **Launch Countdown**: Rocket details (Falcon 9 Block 5), payloads (22 Starlink V2 Mini), booster code reuse statuses, and autonomous landing ship tracking.
* **NEO Watch Alert**: Diameter (310m), close-approach distance (0.042 AU), velocity (14.8 km/s), lunar distance factors, hazard level reports.
* **System Telemetry**: NOAA server synchronization states, active data cache indexes, average fetch latency tracking (128ms average), and client heap memory graphs.

### 3. SkyLens AI Assistant (Groq Streaming)
* **Centered Modal Layout**: Centered horizontally and vertically in a glassmorphic floating modal. Uses spring physics (`stiffness: 350, damping: 25`) for scaling pop-in effects.
* **Suggested Questions**: Dynamically generates suggestions depending on the selected target (astronaut capacity for ISS, space junk kinetic energy for Debris, lifespans for satellites). Suggestion chips feature hover glows and tap triggers.
* **Sliding Underlines**: Navigating tabs (Overview, Orbit, AI Fun Fact) utilizes Framer Motion `layoutId` tags for a sliding underline transition.
* **Speech-to-Text Recognition**: Built-in voice input uses the browser's Web Speech API. Clicking the microphone icon transcribes spoken queries and submits them instantly.

### 4. Sky Above Me Horizon Diagram
* **Tonight's View Horizon**: A fully responsive SVG horizon diagram, locked into aspect ratio (`viewBox` settings) for circular integrity on ultra-widescreens.
* **Interactive Planet Nodes**: Clickable SVG nodes for Moon, Mars, Jupiter, Venus, and Saturn open detail modals and lunar phase galleries.
* **Unified Deep Space Dark Stars**: Uses a dark gradient space background overlaid with 250 slow-twinkling stars of random sizes, making texts highly readable.

### 5. Time Travel Simulation HUD
* **comet-tail thumb**: The simulation slider handle glows with a trailing `box-shadow` to depict a comet burning through time.
* **▶ PLAY**: Automatically advances the simulated timeline at 5 minutes per 100ms tick. Snap back to real-time with **↺ NOW**.

---

## ⚡ Performance, Purity & Resiliency

* **React 19 Purity**: Synchronous state updates in effects are executed using `setTimeout(..., 0)` to prevent cascading render cycles. Impure functions (`performance.now()`, `Date.now()`) are completely extracted from the render scope and placed in `useEffect` and `useRef` lazily.
* **API Resiliency**: NOAA and ISS endpoints are wrapped in try-catch structures. Solar wind telemetry fallbacks are embedded in [useSpaceWeather.ts](file:///d:/zenith/src/hooks/useSpaceWeather.ts) to keep the UI online even during solar weather outages.
* **Offline-Ready Service Worker**: Refactored PWA caching strategy: Navigation requests are network-first to ensure fast updates, public assets are cached using stale-while-revalidate, and API requests (`/api/*`) bypass cache.
* **Clean Code Standards**: Type-checked to achieve zero ESLint warnings, zero type warnings, and zero compiler messages.

---

## 📊 Live Data Sources

| Telemetry Feed | API Endpoint | Update Rate |
|---|---|---|
| **ISS Telemetry** | `api.wheretheiss.at/v1/satellites/25544` | Every 5 s |
| **Planetary Kp Index** | `services.swpc.noaa.gov/json/planetary_k_index_1m.json` | Every 60 s |
| **Solar Wind Plasma** | `services.swpc.noaa.gov/products/solar-wind/plasma-1-day.json` | Every 60 s |
| **GOES X-Ray Flux** | `services.swpc.noaa.gov/json/goes/primary/xrays-1-day.json` | Every 60 s |
| **SkyLens AI Core** | Groq Cloud API (`openai/gpt-oss-120b` or Llama 3) | On demand |

---

## 🚢 Deploying to Production

To deploy Project Zenith on Vercel:

```bash
# Deploy to production environment
npm i -g vercel
vercel deploy --prod
```

Ensure you configure the `GROQ_API_KEY` project environment variable on your Vercel Dashboard.

---

## 📜 License

MIT