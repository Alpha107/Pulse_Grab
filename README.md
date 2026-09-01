# PulseGrab

A local-only web app: download videos or extract mp3s (YouTube and most
other sites, via [yt-dlp](https://github.com/yt-dlp/yt-dlp)), pick whether
you want video or audio, grab whole playlists on request, and beam finished
mp3s to your phone — iPhone or Android — by scanning a QR code over your
home WiFi.

Runs entirely on your own machine. Nothing is uploaded anywhere except to
your own phone, over your own network.

> **About this repo.** This is a structure-and-documentation showcase, not
> the runnable implementation. Every file here has the real project's exact
> layout, module boundaries, function/route signatures, and type
> definitions — but function and component **bodies are stubbed out**
> (`raise NotImplementedError(...)` / placeholder JSX) rather than
> containing the actual working logic. The goal is to let you see how the
> project is put together — architecture, API surface, concurrency design,
> data shapes — without publishing the implementation itself. Cloning and
> running this repo as-is will start both servers, but downloads/transfers
> won't actually work.

> **A note on legality.** Downloading from YouTube technically runs against
> YouTube's Terms of Service, even though yt-dlp itself is legal,
> open-source, and one of the most widely used tools for personal media
> archiving. This app is built for personal/private use — your own
> uploads, Creative Commons material, or personal backups of things you
> have the right to download — not for redistributing other people's work.

---

## Contents

1. [What makes this different](#what-makes-this-different)
2. [How it works, in one paragraph](#how-it-works-in-one-paragraph)
3. [Architecture](#architecture)
4. [Prerequisites](#prerequisites)
5. [Running the stub](#running-the-stub)
6. [Using the real app — step by step](#using-the-real-app--step-by-step)
7. [Getting mp3s onto your phone's "playlist"](#getting-mp3s-onto-your-phones-playlist)
8. [Configuration](#configuration)
9. [API reference](#api-reference)
10. [Project structure](#project-structure)
11. [Limitations](#limitations)

---

## What makes this different

There are plenty of "web UI on top of yt-dlp" projects out there. Most stop
at paste-URL-click-download. A few things here go further, for real,
verifiable reasons rather than as marketing copy:

- **Playlists download 3-at-a-time, not one-at-a-time.** Most yt-dlp front
  ends hand the whole playlist URL to yt-dlp and let it work through the
  entries strictly in sequence. PulseGrab does a fast metadata-only pass to
  get every entry's direct URL, then fans out across a small thread pool
  (`CONCURRENT_PLAYLIST_DOWNLOADS`, default 3) so multiple videos are
  actually downloading at the same time. On a 20-video playlist this is
  roughly a 3x wall-clock improvement, not a theoretical one — verified
  during development by downloading 3 real YouTube videos concurrently and
  confirming all three started within the same instant rather than queuing.
- **Every video also downloads its own fragments in parallel**
  (`concurrent_fragment_downloads`), so even a single large video pulls
  multiple chunks of the stream at once instead of one piece at a time -
  a speed win most simple wrappers leave on the table entirely.
- **Live throughput telemetry, not just a percentage.** Every in-progress
  item shows its own real speed and ETA, and the whole job shows one
  combined throughput number (sum of every active download's speed) at the
  top of the progress panel - genuinely useful once several items are
  downloading side by side, and something almost no other yt-dlp UI
  surfaces.
- **An extraction sanity-check that catches a real, reproducible failure
  mode.** Sites yt-dlp doesn't have a dedicated extractor for fall back to
  a generic page scrape, which can grab *every* `<video>` element on the
  page - including hover-preview clips from a "related videos" rail -
  instead of the one video you actually asked for. This happened during
  development: a "playlist" of 13 identically-titled few-KB preview clips
  got downloaded instead of the real thing. PulseGrab now detects that
  exact pattern (most entries sharing one title) and warns you *before*
  you burn time and bandwidth on it, right in the playlist-confirmation
  dialog.
- **Phone transfer needs zero app install, zero account, and zero
  internet.** Not "no cloud dashboard" - genuinely no network hop outside
  your own WiFi. Compare that to AirDrop-alternative apps (need the app on
  both ends), emailing yourself a file, or dropping it in a cloud drive
  (needs internet both ways, needs an account, and the file sits on
  someone else's server in the meantime). Here it's QR code → phone
  camera → direct LAN transfer → gone. Selected files even bundle into one
  zip so a multi-file transfer is one tap, one download, not one
  re-scan-the-QR-code per file (a real usability bug caught and fixed
  during development).
- **It treats non-YouTube sites as first-class**, not an afterthought bolted
  onto a YouTube-shaped UI: any of yt-dlp's 1,800+ supported sites works
  the same way, video or audio, single item or "playlist," through the same
  flow.

None of this required a fork of yt-dlp or exotic infrastructure - it's a
few hundred lines of orchestration around a proven extraction engine,
which is exactly the point: the differentiation is in the parts most
clones don't bother building, not in reinventing the download itself.

## How it works, in one paragraph

You paste a URL into the frontend and hit **Check**. The backend asks
yt-dlp to read the URL's metadata only (no download yet). If it's a
playlist, you're asked whether to grab the whole thing or just that one
video. You then pick **MP3** or **Video** and a quality, and hit
**Download** — the backend runs yt-dlp in a background thread pool and
streams live progress back over a WebSocket. Finished mp3s show up in the
**Library** section; tick the ones you want on your phone and hit **Send to
phone**, which generates a QR code pointing at a short-lived link served
straight from your machine. Scan it with the phone's Camera app — iPhone or
Android, same mechanism either way (same WiFi network required) — tick the
files you want and download them as one zip. The transfer page even
detects which platform opened it and tailors the save instructions
accordingly.

## Architecture

```
┌─────────────────────┐        HTTP/JSON + WebSocket        ┌──────────────────────────┐
│   Frontend (Next.js) │ ───────────────────────────────────▶│   Backend (FastAPI)      │
│   localhost:3000     │◀─────────────────────────────────── │   0.0.0.0:8000           │
└─────────────────────┘                                      │                          │
                                                               │  yt-dlp  → downloads/   │
                                                               │  ffmpeg  (mp3 / mux)    │
┌─────────────────────┐    scans QR → opens in Safari/Chrome   │  QR + session-based      │
│  Phone (same WiFi)    │ ─────────────────────────────────────▶  file server            │
│  iPhone or Android    │                                      │                          │
└─────────────────────┘                                      └──────────────────────────┘
```

- **Backend**: FastAPI + yt-dlp. yt-dlp handles metadata extraction,
  playlist detection, the actual download, and (via ffmpeg) mp3 conversion
  or video muxing. Job progress is tracked in memory and pushed to the
  browser over a WebSocket. A small thread pool downloads playlist entries
  concurrently rather than one at a time.
- **Frontend**: Next.js (App Router) + TypeScript + Tailwind. A single page
  drives the check → playlist-confirm → download → library → transfer flow.
- **Transfer**: the backend generates a random session id scoped to the
  mp3s you picked, serves a plain HTML page of download links (or one
  combined zip) at `http://<your-LAN-IP>:8000/transfer/<session-id>`, and
  encodes that URL into a QR code. The session (and the link) expires after
  15 minutes.

## Prerequisites

- **Python 3.10+**
- **Node.js 18+**
- **ffmpeg** installed and on your PATH — required for mp3 conversion and
  for muxing separate video/audio streams into one file

## Running the stub

The stub still runs, since the FastAPI app and Next.js pages are all real —
only the logic inside each handler/component is omitted. This is useful for
seeing the actual API surface and UI shell in the browser.

```bash
npm start
```

or, per-shell:

- PowerShell: `.\run.ps1`
- cmd.exe: `run`
- Manual (two terminals): `cd backend && python -m venv venv && ...
  pip install -r requirements.txt && uvicorn main:app --host 0.0.0.0 --port
  8000`, then `cd frontend && npm install && npm run dev`.

Expect the UI to load and the API routes to respond, but any endpoint that
would normally do real work (analyze a URL, download something, generate a
transfer link) raises a clearly-labeled "not implemented in the public
version" error instead.

## Using the real app — step by step

This describes the behavior of the full (private) implementation, so you
know what the stubs above are standing in for:

1. **Paste a URL**, click **Check** — the app fetches metadata only.
   If it's a playlist, you're asked whether to grab the whole thing or
   just that one video, with a warning if the entries look like unrelated
   preview clips rather than a real playlist.
2. **Pick MP3 or Video** and a quality, then **Download**. A live progress
   panel shows per-item and combined download speed/ETA, updated over a
   WebSocket. Playlist items download several at a time.
3. Finished files land in the **Library**. Tick the mp3s you want on your
   phone, hit **Send to phone**, scan the QR code that appears with your
   phone's Camera app, tick the files you want there too, and download
   them all as one zip in a single tap.

## Getting mp3s onto your phone's "playlist"

**Android**: any app can read shared storage — most Music/Files apps
auto-index anything under `Downloads` or `Music`. If not, move the file
into the `Music` folder, or use **VLC for Android** to browse and build
playlists from any folder directly.

**iPhone**: iOS doesn't let any web app write into Apple Music's library —
that's an Apple-only sync path (Finder/iTunes). Once a file's in the
**Files** app, **VLC for iOS** is the smoothest way to build an actual
playlist from it.

## Configuration

| What | Where | Default |
|---|---|---|
| Backend port | `PORT` constant in `backend/main.py` | `8000` |
| Frontend → backend URL | `NEXT_PUBLIC_API_BASE` env var (frontend) | `http://localhost:8000` |
| Where downloads land | `backend/downloads/` (auto-created) | — |
| Transfer link lifetime | `SESSION_TTL_SECONDS` in `backend/transfer.py` | `900` (15 min) |
| Audio bitrates offered | `AUDIO_BITRATES` in `backend/downloader.py` | 320/192/128 kbps |
| Video quality caps offered | `VIDEO_FORMATS` in `backend/downloader.py` | best/1080/720/480 |
| Concurrent playlist downloads | `CONCURRENT_PLAYLIST_DOWNLOADS` in `backend/downloader.py` | `3` |
| Concurrent fragments per video | `CONCURRENT_FRAGMENT_DOWNLOADS` in `backend/downloader.py` | `4` |

## API reference

All endpoints are served by the FastAPI backend at `http://<host>:8000`.
Routes below are real and respond; the logic behind them is stubbed (see
[About this repo](#pulsegrab)).

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/health` | Liveness check |
| `POST` | `/api/analyze` | `{url}` → title/thumbnail/duration, playlist detection + entry list, and a `warning` if the "playlist" looks like related/preview clips rather than real content |
| `POST` | `/api/download` | `{url, mode, quality, playlist_choice}` → starts a background job (playlist items download concurrently), returns `{job_id}` |
| `GET` | `/api/jobs/{job_id}` | Poll a job's current status, including per-item `speed_bps`/`eta_seconds` and a job-wide `combined_speed_bps` |
| `POST` | `/api/jobs/{job_id}/cancel` | Cancel a running job |
| `WS` | `/ws/jobs/{job_id}` | Live job status push; closes itself once the job reaches a terminal state |
| `GET` | `/api/library` | List every finished download - mp3 and video - with name, size, modified time, and `kind` |
| `DELETE` | `/api/library/{filename}` | Delete a file from the library |
| `GET` | `/api/library/{filename}/download` | Download a library file to the computer itself |
| `POST` | `/api/transfer` | `{filenames}` → creates a 15-minute transfer session, returns a QR code (base64 PNG) + URL |
| `GET` | `/transfer/{session_id}` | Phone-facing HTML page of download links (opened by scanning the QR) |
| `GET` | `/transfer/{session_id}/file/{filename}` | Serves one file from an active transfer session |
| `GET` | `/transfer/{session_id}/zip?files=a.mp3&files=b.mp3` | Bundles the named files (or all of them, if `files` is omitted) into one zip download |

## Project structure

```
Pulse_Grab/
├── README.md
├── LICENSE
├── .gitignore
├── package.json          # `npm start` - the one-command launcher
├── run.bat / run.ps1      # thin wrappers so bare `run` works from cmd/PowerShell
├── scripts/
│   └── run.js             # bootstraps venv/node_modules if missing, runs both servers, opens browser
├── backend/
│   ├── main.py            # FastAPI app: routes, WebSocket, CORS
│   ├── downloader.py       # yt-dlp orchestration: analyze(), concurrent download engine, progress tracking
│   ├── transfer.py         # QR code generation, LAN IP detection, session-scoped file/zip serving
│   ├── models.py           # Pydantic request/response schemas (kept in full - pure data shapes)
│   ├── requirements.txt
│   └── downloads/          # downloaded videos/mp3s land here (gitignored)
└── frontend/
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx         # main page: owns all app state, wires components together
    │   └── globals.css
    ├── components/
    │   ├── UrlForm.tsx          # URL input + Check button
    │   ├── DownloadOptions.tsx  # format/quality picker + Download button
    │   ├── PlaylistModal.tsx    # "whole playlist or just this one?" dialog + extraction warning
    │   ├── ProgressPanel.tsx    # live per-item + combined speed/ETA
    │   ├── Library.tsx          # downloaded file list, selection, delete, "Send to phone"
    │   ├── TransferModal.tsx    # QR code + expiry countdown
    │   ├── HudStatusBar.tsx     # live backend status + library stats readout
    │   ├── Modal.tsx            # shared modal shell
    │   └── ErrorBanner.tsx      # shared inline error display
    ├── lib/api.ts            # typed fetch/WebSocket client for the backend (types kept in full)
    └── package.json
```

## Limitations

- Only mp3s are ever offered for phone transfer — video files stay on your
  computer, on purpose.
- There's no way for this (or any) web app to write directly into Apple
  Music's library on iOS; Android has no such restriction.
- This is a local single-user tool: job state and transfer sessions live
  in memory and are lost if you restart the backend.
