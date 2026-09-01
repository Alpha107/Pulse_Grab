"""PulseGrab backend - FastAPI app.

Run with:
    uvicorn main:app --host 0.0.0.0 --port 8000

--host 0.0.0.0 matters: it's what lets the phone reach this server on the
LAN for the QR transfer step.

NOTE: This is the public/portfolio version of PulseGrab. The route surface
below (paths, methods, request/response models, CORS setup) is real and the
server will actually start and respond - but each handler's real logic has
been replaced with a 501 "kept private" response. See the README's API
reference table for what each endpoint does in the full implementation.
"""
from __future__ import annotations

from fastapi import FastAPI, HTTPException, Query, Request, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse

from models import (
    AnalyzeRequest,
    AnalyzeResponse,
    DownloadRequest,
    DownloadStartResponse,
    JobStatus,
    LibraryFile,
    TransferRequest,
    TransferResponse,
)

PORT = 8000

app = FastAPI(title="PulseGrab")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # local-only tool; the phone browser also needs access
    allow_methods=["*"],
    allow_headers=["*"],
)

_NOT_IMPLEMENTED = "This endpoint's implementation is kept private for the public repo. See the README's API reference."


@app.get("/api/health")
def health():
    return {"ok": True}


@app.post("/api/analyze", response_model=AnalyzeResponse)
async def api_analyze(req: AnalyzeRequest):
    raise HTTPException(status_code=501, detail=_NOT_IMPLEMENTED)


@app.post("/api/download", response_model=DownloadStartResponse)
async def api_download(req: DownloadRequest):
    raise HTTPException(status_code=501, detail=_NOT_IMPLEMENTED)


@app.get("/api/jobs/{job_id}", response_model=JobStatus)
def api_job_status(job_id: str):
    raise HTTPException(status_code=501, detail=_NOT_IMPLEMENTED)


@app.post("/api/jobs/{job_id}/cancel")
def api_job_cancel(job_id: str):
    raise HTTPException(status_code=501, detail=_NOT_IMPLEMENTED)


@app.websocket("/ws/jobs/{job_id}")
async def ws_job_status(ws: WebSocket, job_id: str):
    """Streams live JobStatus updates until the job reaches a terminal
    state. Stubbed here - closes immediately in the public repo."""
    await ws.accept()
    await ws.close(code=1013, reason="not implemented in public repo")


@app.get("/api/library", response_model=list[LibraryFile])
def api_library():
    return []


@app.delete("/api/library/{filename}")
def api_library_delete(filename: str):
    raise HTTPException(status_code=501, detail=_NOT_IMPLEMENTED)


@app.get("/api/library/{filename}/download")
def api_library_download(filename: str):
    raise HTTPException(status_code=501, detail=_NOT_IMPLEMENTED)


@app.post("/api/transfer", response_model=TransferResponse)
def api_transfer(req: TransferRequest):
    raise HTTPException(status_code=501, detail=_NOT_IMPLEMENTED)


def _platform_hint(user_agent: str) -> str:
    """Tailors the phone-facing transfer page's save instructions to
    Android vs iOS based on the requesting browser's User-Agent."""
    ua = user_agent.lower()
    if "android" in ua:
        return (
            "Downloaded files land in your <b>Downloads</b> folder and are usually playable "
            "right away. If your music app doesn't pick them up automatically, move or copy "
            "the file into your phone's <b>Music</b> folder using the Files app."
        )
    if "iphone" in ua or "ipad" in ua or "ipod" in ua:
        return (
            "Safari will auto-unzip the download into a folder. Then tap the Share icon &rarr; "
            "<b>Save to Files</b> on each track. See the README for getting mp3s into a playlist "
            "app on iOS."
        )
    return "Downloading the zip will save it wherever your phone puts downloads - unzip it there."


@app.get("/transfer/{session_id}", response_class=HTMLResponse)
def transfer_page(session_id: str, request: Request):
    """Real implementation renders a checkbox list of the session's files
    with platform-aware save instructions (see _platform_hint above) and a
    form that posts to /zip. Stubbed here."""
    return HTMLResponse("<h1>Not implemented</h1><p>This is the public/portfolio repo.</p>", status_code=501)


@app.get("/transfer/{session_id}/zip")
def transfer_zip(session_id: str, files: list[str] = Query(default=[])):
    raise HTTPException(status_code=501, detail=_NOT_IMPLEMENTED)


@app.get("/transfer/{session_id}/file/{filename}")
def transfer_file(session_id: str, filename: str):
    raise HTTPException(status_code=501, detail=_NOT_IMPLEMENTED)
