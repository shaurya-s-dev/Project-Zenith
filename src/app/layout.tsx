import type { Metadata } from "next";
import "./globals.css";
import TabNav from "@/components/TabNav";
import DynamicBackground from "@/components/DynamicBackground";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SkyLensProvider } from "@/components/SkyLensContext";

export const metadata: Metadata = {
  title: "Project Zenith — The Celestial Eye",
  description: "Real-time cosmic radar. Track satellites, ISS, planets and constellations above any point on Earth.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
        <ThemeProvider>
          <SkyLensProvider>
            <DynamicBackground />
            <TabNav />
            <div className="scanline-overlay" />
            {children}
          </SkyLensProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
