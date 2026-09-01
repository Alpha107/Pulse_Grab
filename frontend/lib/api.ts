// Thin typed client for the PulseGrab backend. Every shape here mirrors a
// pydantic model in backend/models.py - keep them in sync if either changes.
//
// Kept real in the public repo (unlike most files here) - this is a pure
// API contract, not app logic: it just documents the request/response
// shapes and wraps fetch/WebSocket URLs. See README's "About this repo".

export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") || "http://localhost:8000";

export interface PlaylistEntry {
  id: string;
  title: string;
  duration: number | null;
  thumbnail: string | null;
}

export interface AnalyzeResponse {
  url: string;
  title: string;
  thumbnail: string | null;
  duration: number | null;
  uploader: string | null;
  is_playlist: boolean;
  playlist_title: string | null;
  playlist_count: number;
  entries: PlaylistEntry[];
  warning: string | null;
}

export type Mode = "audio" | "video";
export type PlaylistChoice = "single" | "all";

export interface DownloadRequest {
  url: string;
  mode: Mode;
  quality: string;
  playlist_choice: PlaylistChoice;
}

export interface JobItem {
  index: number;
  title: string;
  status: "pending" | "downloading" | "converting" | "done" | "error";
  percent: number;
  error: string | null;
  filename: string | null;
  speed_bps: number | null;
  eta_seconds: number | null;
}

export interface JobStatus {
  job_id: string;
  status: "pending" | "running" | "done" | "error" | "cancelled";
  mode: string;
  total_items: number;
  completed_items: number;
  current_index: number;
  items: JobItem[];
  error: string | null;
  combined_speed_bps: number | null;
}

export interface LibraryFile {
  name: string;
  size_bytes: number;
  modified: number;
  kind: "audio" | "video";
}

export interface TransferResponse {
  session_id: string;
  url: string;
  qr_png_base64: string;
  expires_at: number;
  files: string[];
}

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail || detail;
    } catch {
      /* body wasn't JSON - fall back to statusText */
    }
    throw new Error(detail);
  }
  return res.json();
}

export const api = {
  health: () => req<{ ok: boolean }>("/api/health"),

  analyze: (url: string) =>
    req<AnalyzeResponse>("/api/analyze", { method: "POST", body: JSON.stringify({ url }) }),

  startDownload: (body: DownloadRequest) =>
    req<{ job_id: string }>("/api/download", { method: "POST", body: JSON.stringify(body) }),

  jobStatus: (jobId: string) => req<JobStatus>(`/api/jobs/${jobId}`),

  cancelJob: (jobId: string) => req<{ ok: boolean }>(`/api/jobs/${jobId}/cancel`, { method: "POST" }),

  library: () => req<LibraryFile[]>("/api/library"),

  deleteFromLibrary: (name: string) =>
    req<{ ok: boolean }>(`/api/library/${encodeURIComponent(name)}`, { method: "DELETE" }),

  libraryDownloadUrl: (name: string) => `${API_BASE}/api/library/${encodeURIComponent(name)}/download`,

  transfer: (filenames: string[]) =>
    req<TransferResponse>("/api/transfer", { method: "POST", body: JSON.stringify({ filenames }) }),

  jobSocketUrl: (jobId: string) => `${API_BASE.replace(/^http/, "ws")}/ws/jobs/${jobId}`,
};
