import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "PulseGrab",
  description: "Local video/mp3 downloader with phone transfer",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <body className="min-h-screen bg-ink font-sans antialiased">
        <div className="pointer-events-none fixed inset-0 bg-page-glow" />
        <div className="pointer-events-none fixed inset-0 bg-scanlines opacity-40" />
        <div className="relative mx-auto max-w-3xl px-4 py-10 sm:py-14">{children}</div>
      </body>
    </html>
  );
}
