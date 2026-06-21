import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},

  // ─── PART 9: Performance & SSR Safety ───────────────────────────────────────
  // Prevent SSR memory leaks from WebGL / Three.js / CesiumJS / react-globe.gl.
  // All heavy 3D components are wrapped with next/dynamic { ssr: false } at the
  // component level, so this config layer adds bundle-level optimisations on top.
  experimental: {
    optimizePackageImports: [
      'three',
      'react-globe.gl',
      'framer-motion',
      'satellite.js',
      'lucide-react',
    ],
  },

  // Silence the "Critical dependency: the request of a dependency is an
  // expression" warning that CesiumJS / Three.js workers emit during build.
  webpack(config) {
    config.module = config.module ?? {};
    config.module.exprContextCritical = false;
    return config;
  },
};

export default nextConfig;