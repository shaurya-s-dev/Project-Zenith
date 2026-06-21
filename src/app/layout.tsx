import type { Metadata } from "next";
import "./globals.css";
import TabNav from "@/components/TabNav";
import CosmicBackground from "@/components/CosmicBackground";

export const metadata: Metadata = {
  title: "Project Zenith — The Celestial Eye",
  description: "Real-time cosmic radar. Track satellites, ISS, planets and constellations above any point on Earth.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
        <CosmicBackground />
        <TabNav />
        <div className="scanline-overlay" />
        {children}
      </body>
    </html>
  );
}
