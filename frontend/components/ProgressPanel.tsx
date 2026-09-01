"use client";

// Live per-item + combined download progress. Real version renders one row
// per JobItem with a status icon (pending/downloading/converting/done/error),
// per-item speed_bps/eta_seconds, and a job-wide combined_speed_bps readout
// at the top - all pushed over the /ws/jobs/{job_id} WebSocket. Stubbed here.

import type { JobStatus } from "@/lib/api";

export default function ProgressPanel({ job, onCancel }: { job: JobStatus; onCancel: () => void }) {
  return (
    <div className="hud-frame space-y-4 rounded-2xl border border-edge bg-surface p-5 text-sm text-muted opacity-60">
      [stubbed - see README]
    </div>
  );
}
