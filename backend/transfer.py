"""QR-code phone transfer: bundle selected mp3s into a short-lived session
that's servable over the LAN, and hand back a QR code pointing at it.

NOTE: This is the public/portfolio version of PulseGrab - see the note at
the top of downloader.py. Function bodies here are stubbed out.
"""
from __future__ import annotations

from pathlib import Path

from downloader import DOWNLOADS_DIR

SESSION_TTL_SECONDS = 15 * 60

# session_id -> {"files": [Path, ...], "expires": float}
SESSIONS: dict[str, dict] = {}


def get_lan_ip() -> str:
    """Best-effort LAN IP so the phone (on the same WiFi) can reach us.
    Doesn't actually send any traffic - just asks the OS which local
    interface it would use to reach the internet."""
    raise NotImplementedError("Implementation omitted from the public repo.")


def create_session(filenames: list[str], port: int) -> dict:
    """Validate the requested filenames actually live in downloads/ (path
    traversal guard), stash them under a random session id with a 15-minute
    expiry, and generate a QR code PNG pointing at the LAN transfer URL."""
    raise NotImplementedError("Implementation omitted from the public repo.")


def get_session(session_id: str) -> dict | None:
    raise NotImplementedError("Implementation omitted from the public repo.")


def get_session_file(session_id: str, filename: str) -> Path | None:
    raise NotImplementedError("Implementation omitted from the public repo.")


def build_zip(session: dict, wanted_names: list[str] | None) -> bytes:
    """Bundle the requested files (or all of them, if none named) from a
    session into a single in-memory zip. This is what lets the phone grab
    everything in one download instead of navigating away per file - which
    on iOS Safari otherwise means re-scanning the QR code for every track."""
    raise NotImplementedError("Implementation omitted from the public repo.")
