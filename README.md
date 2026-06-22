# 🛰️ Project Zenith — The Celestial Eye

> Real-time WebGL cosmic radar. Track satellites, the ISS, space debris, planets, and constellations above any point on Earth with AI-powered space diagnostics and live space weather feeds.

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
│   ├── dashboard/page.tsx   # Mission Control — 3D Globe, tabs, tachometer HUD, widgets
│   ├── sky/page.tsx         # Sky Above Me — rise/set times, Polar Sky Radar, moon gallery
│   ├── weather/page.tsx     # Space Weather — NOAA SWPC telemetry charts and gauges
│   ├── skylens/page.tsx     # SkyLens AI Page — full screen AI conversation hub
│   └── api/
│       ├── iss/route.ts     # ISS telemetry proxy with fallback caching
│       └── skylens/route.ts # Groq streaming chat endpoint
├── components/
│   ├── Globe.tsx            # WebGL Globe with constellation arcs, labels, and orbit path rendering
│   ├── GlobeDynamic.tsx     # SSR-safe dynamic wrapper for WebGL
│   ├── SysMon.tsx           # Cyberpunk system diagnostics HUD overlay (FPS, Heap memory, sync latency)
│   ├── PolarSkyRadar.tsx    # NASA-style SVG Polar Sky Radar with sweep animation and interactive objects
│   ├── KeyboardShortcuts.tsx# Fixed hotkey listener (Space to pause, M to open SkyLens, 1-4 for themes)
│   ├── LaunchCountdownWidget.tsx # Live launch countdown clock (renders pure for React 19)
│   ├── InfoModal.tsx        # Framer-motion centered knowledge modal
│   └── SkyLensModal.tsx     # Centered floating AI helper with suggestions & voice inputs
```

---

## 🛰️ Advanced Subsystems & Features

### 1. Polar Sky Radar (New)
* **Mission Control Aesthetic**: Built with a dark `#00040f` background, Space Mono typography, and vibrant green (`#00FF88`) & cyan (`#00D4FF`) accents.
* **Dynamic Sweep Sector**: Features a custom rotating SVG sweep sector (radial gradient, 6-second sweep animation) tracking real-time positions.
* **Multi-Object Plotting**: Maps Moon, Venus, Jupiter, Mars, Saturn, Sirius, and Polaris using precise polar coordinates. Includes orbital paths for active ISS and Starlink passes.
* **Interactive HUD Sidebar**:
  - Live ticking UTC clock synchronizing with system time.
  - Interactive clickable celestial targets opening custom details cards.
  - Integrated "Use My Location" browser geolocation coordinator.
  - Live countdown timers showing upcoming satellite passes.

### 2. Dual-Tab Control & Navigation Panel
* **`🛰️ SATELLITES` Tab**: Renders the complete tracked objects directory, custom search engine, and orbit filter categories (ALL, SAT, ISS, DEBRIS, CLASSIFIED).
* **`✨ CONSTELLATIONS` Tab**: Integrates a full-featured Constellations Browser. Includes:
  - **Star Lines Master Switch**: Styled toggle switch to overlay or hide constellations on the 3D globe.
  - **Search Input**: Filters constellations instantly by name (e.g., Orion), abbreviation (e.g., Ori), or season (e.g., Winter).
  - **Animated Mythology Expander**: Clicking a constellation centers the camera on its star centroid and expands its card using Framer Motion spring physics to show its ancient mythology.

### 3. Bidirectional WebGL Globe Integration
* **Arc & Label Clicks**: Clicking on any constellation line (arc) or name label directly on the 3D WebGL globe automatically switches the Left Panel to the `CONSTELLATIONS` tab, highlights the corresponding card, and expands its mythology text.
* **Deselection Triggers**: Clear active selections easily by clicking the ocean/land surface of the 3D globe, clicking the red-orange `✕ DESELECT` button on the target card, or hitting the `R` key.

### 4. Clear & Spacious Mission Control HUD
* **Zero Collision Viewport**: Deleted all floating overlay buttons and panel drawers from the 3D Globe, leaving the rotating Earth completely clean.
* **Repositioned Target Overlays**: The `SELECTED TARGET` panel sits compactly in the top-left corner (`top: 14`, `left: 14`), while the speed tachometer gauge is positioned in the top-right corner (`top: 14`, `right: 14`).
* **High-Legibility Modals**: Enlarged all modal overlays (SkyLens, Launch, NEO, and Telemetry) and boosted their typographic sizes for clear, comfortable reading on high-resolution displays.

### 5. 3D WebGL Globe & Animated Orbit Paths
* **Crawling Orbit Trails**: Traces the exact orbital path of selected satellites with a thick (`2.2px`) glowing dot-dash vector. The path crawls forward smoothly at an optimized `12,000ms` cycle.
* **Default Rotation**: Auto-rotates immediately on startup by initializing controls inside the WebGL `onGlobeReady` callback hook.
* **Instant Time Travel Camera Sync**: Prevents camera transitions from stacking or overlapping during timeline drags by instantly snapping the camera coordinates, while maintaining smooth `900ms` transitions on new clicks.

### 6. SkyLens AI Assistant (Groq Streaming)
* **Centered Modal Layout**: Centered floating glassmorphic assistant utilizing spring physics (`stiffness: 350, damping: 25`) for scaling pop-in effects.
* **Contextual Suggestions**: Automatically recommends questions depending on the selected satellite (e.g., astronaut capacity for ISS, space junk kinetic energy for Debris).
* **Speech-to-Text Recognition**: Supports voice search queries using the HTML5 Web Speech API via the microphone button.

---

## ⚡ Performance, Purity & Resiliency

* **React 19 Rendering Purity**: Renders are kept strictly pure. Synchronous state modifications within effects are deferred using `setTimeout(..., 0)` to prevent cascading render cycles, and impure APIs (`performance.now()`, `Date.now()`) are completely encapsulated in lazy `useEffect` hooks.
* **CSS Property Performance**: Handled style conflicts between shorthand and longhand CSS animations (e.g., animation and animationDelay) during re-renders by replacing shorthand declarations with separate longhand declarations.
* **API Resiliency & Caching**: Wrapping NOAA SWPC solar plasma/flux and CelesTrak proxies in robust try-catch blocks with hardcoded local fallback datasets so the interface remains fully operational during network outages.
* **Contrast & Theme Optimization**: Built on four gorgeous cyberpunk design themes (Deep Space, Holographic, Solar Flare, Aurora Borealis) with high-contrast text ratios utilizing custom CSS variables (`--theme-text-dim` and `--theme-text-faint`) to guarantee WCAG readability on dark backdrops.

---

## 📊 Live Data Sources

| Telemetry Feed | API Endpoint | Update Rate |
|---|---|---|
| **ISS Telemetry** | `api.wheretheiss.at/v1/satellites/25544` | Every 5 s |
| **Planetary Kp Index** | `services.swpc.noaa.gov/json/planetary_k_index_1m.json` | Every 60 s |
| **Solar Wind Plasma** | `services.swpc.noaa.gov/products/solar-wind/plasma-1-day.json` | Every 60 s |
| **GOES X-Ray Flux** | `services.swpc.noaa.gov/json/goes/primary/xrays-1-day.json` | Every 60 s |
| **SkyLens AI Core** | Groq Cloud API (Llama 3 70B / Mixtral 8x7B) | On demand |

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