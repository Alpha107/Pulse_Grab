"use client";

// Live backend-online indicator (pings /api/health every 15s) plus a
// library stats readout (file count + total size). The "data-analytic" HUD
// touch under the header. Stubbed here.

export default function HudStatusBar({ refreshKey }: { refreshKey: number }) {
  return (
    <div className="hud-frame flex items-center gap-3 rounded-xl border border-edge bg-surface/60 px-4 py-2.5 font-mono text-[11px] uppercase tracking-wider text-muted opacity-60">
      [stubbed - see README]
    </div>
  );
}
