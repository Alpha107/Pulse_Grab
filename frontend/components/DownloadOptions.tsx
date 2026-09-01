"use client";

// Format/quality picker + Download button, shown once a URL has been
// analyzed. Real version: MP3/Video toggle, quality dropdown scoped to the
// selected mode, playlist-aware copy and metadata display. Stubbed here.

import type { AnalyzeResponse, Mode, PlaylistChoice } from "@/lib/api";

export default function DownloadOptions({
  info,
  playlistChoice,
  busy,
  onDownload,
}: {
  info: AnalyzeResponse;
  playlistChoice: PlaylistChoice;
  busy: boolean;
  onDownload: (mode: Mode, quality: string) => void;
}) {
  return (
    <div className="hud-frame space-y-4 rounded-2xl border border-edge bg-surface p-5 text-sm text-muted opacity-60">
      [stubbed - see README's "Using the real app" section]
    </div>
  );
}
