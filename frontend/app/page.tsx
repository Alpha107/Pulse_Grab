"use client";

// Main page. Real version owns all app state and wires the whole flow
// together: check -> playlist-confirm (with the extraction-warning banner)
// -> download (WebSocket-driven live progress) -> library -> QR transfer.
// See the README's "How it works" and "Architecture" sections for the full
// flow. Stubbed here - renders the static shell only.

import { Download as DownloadIcon } from "lucide-react";

export default function Home() {
  return (
    <main className="space-y-8">
      <header className="flex items-center gap-3.5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent-gradient shadow-glow">
          <DownloadIcon size={20} className="text-white" strokeWidth={2.4} />
        </div>
        <div>
          <h1 className="bg-accent-gradient bg-clip-text font-mono text-2xl font-bold tracking-tight text-transparent">
            PulseGrab
          </h1>
          <p className="text-sm text-muted">
            This is the public/portfolio repo - see the README for what the full app does.
          </p>
        </div>
      </header>
    </main>
  );
}
