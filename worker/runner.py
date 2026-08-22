"""Dedicated Media Catch worker for authorized YouTube download jobs.

Run this process only on a machine you control and only for media you own or
are authorized to download. Spotify and Apple Music are intentionally not
handled here because their protected streams are outside this worker's scope.
"""

from __future__ import annotations

import os
from pathlib import Path
import time
from typing import Any

import requests
import yt_dlp


API_URL = os.environ["MEDIA_CATCH_API_URL"].rstrip("/")
WORKER_SECRET = os.environ["WORKER_SHARED_SECRET"]
WORKER_REFERENCE = os.environ.get("WORKER_REFERENCE", "media-catch-worker")
OUTPUT_DIR = Path(os.environ.get("MEDIA_CATCH_OUTPUT_DIR", "downloads"))
POLL_SECONDS = max(1, int(os.environ.get("MEDIA_CATCH_POLL_SECONDS", "5")))


def worker_post(path: str, payload: dict[str, Any]) -> dict[str, Any]:
    response = requests.post(f"{API_URL}{path}", json=payload, timeout=30)
    response.raise_for_status()
    return response.json()


def build_options(job: dict[str, Any]) -> dict[str, Any]:
    job_output_dir = OUTPUT_DIR / job["id"]
    job_output_dir.mkdir(parents=True, exist_ok=True)
    options: dict[str, Any] = {
        "format": "bestaudio/best" if job["mode"] == "audio" else "bestvideo*+bestaudio/best",
        "outtmpl": str(job_output_dir / job["outputTemplate"]),
        "noplaylist": job["scope"] == "video",
        "quiet": True,
        "no_warnings": True,
        "restrictfilenames": True,
        "windowsfilenames": True,
        "retries": job["retries"],
        "fragment_retries": job["retries"],
        "concurrent_fragment_downloads": job["workers"],
    }
    if job["mode"] == "audio":
        options["postprocessors"] = [
            {
                "key": "FFmpegExtractAudio",
                "preferredcodec": "mp3",
                "preferredquality": "192",
            }
        ]
    elif job["quality"] != "best":
        height = job["quality"]
        options["format"] = f"bestvideo*[height<={height}]+bestaudio/best[height<={height}]/best"
    return options


def completed_files(job: dict[str, Any]) -> list[Path]:
    job_output_dir = OUTPUT_DIR / job["id"]
    return [
        path
        for path in job_output_dir.rglob("*")
        if path.is_file() and not path.name.endswith((".part", ".ytdl"))
    ]


def upload_file(job: dict[str, Any], path: Path) -> None:
    target_payload = worker_post(
        f"/api/worker/upload-url/{job['id']}",
        {
            "workerSecret": WORKER_SECRET,
            "workerReference": WORKER_REFERENCE,
            "filename": path.name,
            "contentType": "application/octet-stream",
        },
    )
    target = target_payload["target"]
    with path.open("rb") as file_handle:
        response = requests.put(
            target["uploadUrl"],
            headers={"Content-Type": target["mimeType"]},
            data=file_handle,
            timeout=600,
        )
    response.raise_for_status()
    worker_post(
        f"/api/worker/upload-complete/{job['id']}",
        {
            "workerSecret": WORKER_SECRET,
            "workerReference": WORKER_REFERENCE,
            "storageKey": target["storageKey"],
            "filename": target["filename"],
            "mimeType": target["mimeType"],
            "bytes": path.stat().st_size,
        },
    )


def report(job_id: str, status: str, **extra: str) -> None:
    worker_post(
        "/api/worker/update",
        {"workerSecret": WORKER_SECRET, "jobId": job_id, "status": status, **extra},
    )


def run_job(job: dict[str, Any]) -> None:
    report(job["id"], "running")
    try:
        with yt_dlp.YoutubeDL(build_options(job)) as downloader:
            downloader.download([job["url"]])
        files = completed_files(job)
        if not files:
            raise RuntimeError("No completed output files were found for the job.")
        for path in files:
            upload_file(job, path)
        report(job["id"], "succeeded")
    except Exception as error:  # yt-dlp exposes provider-specific errors at runtime.
        report(job["id"], "failed", failureReason=str(error)[:2000])


def main() -> None:
    while True:
        try:
            payload = worker_post(
                "/api/worker/claim",
                {"workerSecret": WORKER_SECRET, "workerReference": WORKER_REFERENCE},
            )
            job = payload.get("job")
            if job:
                run_job(job)
                continue
        except requests.RequestException as error:
            print(f"Worker request failed: {error}")
        time.sleep(POLL_SECONDS)


if __name__ == "__main__":
    main()
