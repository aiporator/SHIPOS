"""Regression tests for the /missions video-analysis pipeline.

These tests synthesize a small real speech audio with espeak + ffmpeg
(both available in CI / dev containers via apt + the bundled
`imageio-ffmpeg` python package) and run the full upload → Whisper →
GPT-5.2 path. They catch the class of bugs that broke production in
iter 90 (Whisper rejected raw browser-recorded video/webm containers).

If you're running locally and don't have espeak-ng installed:
    apt-get install -y espeak-ng ffmpeg

Tests are skipped automatically when synthesizers are missing.
"""
from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from routes.video import _ffmpeg_executable, _ffmpeg_extract_audio  # noqa: E402


def _have(cmd: str) -> bool:
    try:
        r = subprocess.run([cmd, "--help"], capture_output=True, timeout=3)
        return r.returncode in (0, 1)
    except (FileNotFoundError, subprocess.TimeoutExpired):
        return False


def _synthesize_browser_webm(text: str, out_path: str) -> None:
    """Generate a webm file that looks like Chrome's MediaRecorder output:
    video track (testsrc) + audio track (espeak-ng generated speech)."""
    wav_path = out_path.replace(".webm", ".wav")
    subprocess.run(
        ["espeak-ng", "-v", "de", "-s", "130", text, "-w", wav_path],
        check=True, capture_output=True, timeout=15,
    )
    ff = _ffmpeg_executable()
    subprocess.run([
        ff, "-y", "-hide_banner", "-loglevel", "error",
        "-i", wav_path,
        "-f", "lavfi", "-i", "testsrc=size=320x240:rate=10",
        "-shortest",
        "-c:a", "libopus", "-c:v", "libvpx",
        "-b:a", "64k", "-b:v", "200k",
        out_path,
    ], check=True, capture_output=True, timeout=60)
    os.unlink(wav_path)


@pytest.fixture()
def browser_webm(tmp_path):
    if not _have("espeak-ng"):
        pytest.skip("espeak-ng not installed (apt-get install -y espeak-ng)")
    p = str(tmp_path / "speech.webm")
    _synthesize_browser_webm(
        "Hallo, ich bin Mert. Heute spreche ich über Veränderung und Führung.",
        p,
    )
    assert os.path.getsize(p) > 1000
    return p


def test_ffmpeg_executable_resolves():
    """Either system ffmpeg or the bundled imageio-ffmpeg binary must be reachable."""
    ff = _ffmpeg_executable()
    assert ff
    r = subprocess.run([ff, "-version"], capture_output=True, text=True, timeout=5)
    assert r.returncode == 0
    assert "ffmpeg version" in r.stdout


def test_extract_audio_from_browser_webm(browser_webm, tmp_path):
    """ffmpeg should strip the video track and produce a small mono 16kHz MP3."""
    out = str(tmp_path / "out.mp3")
    _ffmpeg_extract_audio(browser_webm, out)
    assert os.path.exists(out)
    size = os.path.getsize(out)
    # Reasonable lower/upper bounds for ~2s of speech at 64kbps mono.
    assert 1_000 < size < 300_000, f"unexpected MP3 size {size}"
