"""Pydantic request/response schemas shared across the API."""
from __future__ import annotations

from typing import Literal, Optional

from pydantic import BaseModel


class AnalyzeRequest(BaseModel):
    url: str


class PlaylistEntry(BaseModel):
    id: str
    title: str
    duration: Optional[float] = None
    thumbnail: Optional[str] = None


class AnalyzeResponse(BaseModel):
    url: str
    title: str
    thumbnail: Optional[str] = None
    duration: Optional[float] = None
    uploader: Optional[str] = None
    is_playlist: bool
    playlist_title: Optional[str] = None
    playlist_count: int = 0
    entries: list[PlaylistEntry] = []
    # Set when the "playlist" looks like it might actually be a related/preview-clip
    # rail rather than real content - see downloader._extraction_warning().
    warning: Optional[str] = None


class DownloadRequest(BaseModel):
    url: str
    mode: Literal["audio", "video"]
    # audio bitrate in kbps, or video target height (e.g. 1080, 720, 480) / "best"
    quality: str
    playlist_choice: Literal["single", "all"] = "single"


class DownloadStartResponse(BaseModel):
    job_id: str


class JobItem(BaseModel):
    index: int
    title: str
    status: Literal["pending", "downloading", "converting", "done", "error"]
    percent: float = 0.0
    error: Optional[str] = None
    filename: Optional[str] = None
    speed_bps: Optional[float] = None
    eta_seconds: Optional[int] = None


class JobStatus(BaseModel):
    job_id: str
    status: Literal["pending", "running", "done", "error", "cancelled"]
    mode: str
    total_items: int
    completed_items: int
    current_index: int = -1
    items: list[JobItem] = []
    error: Optional[str] = None
    # Sum of every currently-downloading item's speed - lets the UI show one
    # combined throughput number, which is only meaningful because multiple
    # playlist items can now be downloading at once.
    combined_speed_bps: Optional[float] = None


class LibraryFile(BaseModel):
    name: str
    size_bytes: int
    modified: float
    kind: Literal["audio", "video"]


class TransferRequest(BaseModel):
    filenames: list[str]


class TransferResponse(BaseModel):
    session_id: str
    url: str
    qr_png_base64: str
    expires_at: float
    files: list[str]
