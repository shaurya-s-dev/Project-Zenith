import type { Metadata, Viewport } from "next";
import "./globals.css";
import TabNav from "@/components/TabNav";
import DynamicBackground from "@/components/DynamicBackground";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SkyLensProvider } from "@/components/SkyLensContext";
import QueryProvider from "@/components/QueryProvider";

import PageTransition from "@/components/PageTransition";

export const metadata: Metadata = {
  title: "Project Zenith — The Celestial Eye",
  description: "Real-time cosmic radar. Track satellites, ISS, planets and constellations above any point on Earth.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#0a0e1a",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
        <QueryProvider>
          <ThemeProvider>
            <SkyLensProvider>
              <DynamicBackground />
              <TabNav />
              <div className="scanline-overlay" />
              <PageTransition>
                {children}
              </PageTransition>
            </SkyLensProvider>
          </ThemeProvider>
        </QueryProvider>

        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(reg) {
                    console.log('SW registered', reg.scope);
                  }).catch(function(err) {
                    console.log('SW registration failed', err);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
