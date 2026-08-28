# Media Downloader

> **A unified web workspace that routes music and video URLs through the workflow each supported service requires.**

| Project lens | Details |
| --- | --- |
| **Type** | Web application |
| **Stack** | TypeScript · React · Vite |
| **Status** | Actively maintained |

## Overview

A unified web workspace that routes music and video URLs through the workflow each supported service requires. This README keeps the project’s verified setup, usage, privacy, and implementation notes together in one place.

## Repository Snapshot

The top-level workspace currently includes `README.md`, `api/`, `client/`, `components.json`, `docs/`, `drizzle/`, `drizzle.config.ts`, `package.json`, `patches/`, `pnpm-lock.yaml`, `server/`, `shared/`. Review the project-specific sections below before installing dependencies, supplying configuration values, or running a build.


---

Media Downloader is a unified web workspace for routing music and video URLs through the workflow each service actually supports. It provides a single source selector with **three separate server modules**:

| Source | Module | Supported workflow |
|---|---|---|
| YouTube | `server/media/youtube.ts` | Prepare authorized video, playlist, channel, and MP3 workflow requests. |
| Spotify | `server/media/spotify.ts` | Inspect public URLs for catalog metadata and official playback-link workflows. |
| Apple Music | `server/media/appleMusic.ts` | Inspect public URLs for catalog metadata and official playback-link workflows. |

> Media Downloader does not implement DRM circumvention, credential harvesting, or protected-stream extraction. Spotify and Apple Music integrations are intentionally scoped to official catalog metadata and playback links.

## Local development

```bash
pnpm install
pnpm dev
```

Run the static type check and unit suite before contributing:

```bash
pnpm check
pnpm test
```

## Integration design

The website uses a source-specific inspection layer behind a common tRPC procedure. It verifies whether a URL host matches the selected service, then returns the allowed workflow and clear next steps. This keeps each provider isolated and prevents service-specific policies from being blurred in the UI.

The YouTube interface contains configuration controls for media type, collection scope, quality, naming template, worker count, and retries. A production download runner should be provisioned separately with persistent storage, a permitted processing environment, and a supported background-job design. Spotify and Apple Music metadata retrieval requires official provider credentials.

## GitHub research

The following open-source projects were reviewed as lawful API-oriented references. They are not protected-audio downloaders.

| Service | Project | Use case |
|---|---|---|
| Spotify | [Spotipy][1] | Python client for Spotify Web API music data and authorization. |
| Apple Music | [apple-music-python][2] | Python wrapper for Apple Music API catalog requests. |

Detailed notes are in [`docs/integration-research.md`](docs/integration-research.md).

## References

[1]: https://github.com/spotipy-dev/spotipy "Spotipy GitHub repository"
[2]: https://github.com/mpalazzolo/apple-music-python "apple-music-python GitHub repository"
