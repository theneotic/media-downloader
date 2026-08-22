# Dedicated Worker

This optional worker runs on a Linux machine you control. It claims queued, authorized YouTube jobs from Media Catch and processes them with `yt-dlp` and FFmpeg. It does not process Spotify or Apple Music streams.

## Requirements

Install Python 3.10 or later, FFmpeg, and the packages in `requirements.txt`. Configure these environment variables before starting the worker:

| Variable | Purpose |
|---|---|
| `MEDIA_CATCH_API_URL` | Public URL of the Media Catch website, without a trailing slash. |
| `WORKER_SHARED_SECRET` | The secret copied from Media Catch project settings. |
| `WORKER_REFERENCE` | A descriptive worker name, such as `home-linux-worker`. |
| `MEDIA_CATCH_OUTPUT_DIR` | Local directory for completed media files. |
| `MEDIA_CATCH_POLL_SECONDS` | Optional job-poll interval; defaults to 5 seconds. |

When a job completes, the worker obtains a short-lived managed-storage upload target, uploads each resulting media file directly, and reports durable file records to the website. This avoids routing large media bytes through the website server.

Run it with:

```bash
python3 -m pip install -r requirements.txt
python3 runner.py
```

The worker has access to the full job URL and download configuration, so keep its machine and shared secret private. Do not expose the worker directly to the public internet.
