# Lawful Music-Service Integration Research

## Spotify

[`spotipy-dev/spotipy`](https://github.com/spotipy-dev/spotipy) is an actively maintained Python client for the Spotify Web API. Its documented scope is music-data access, endpoint coverage, and user authorization. It is appropriate for playlist metadata, track details, catalog search, and outbound playback links; it is not a protected-audio downloader.

## Apple Music

[`mpalazzolo/apple-music-python`](https://github.com/mpalazzolo/apple-music-python) is an MIT-licensed Python wrapper for the Apple Music API. The repository documents catalog requests and requires an Apple Developer Account and a MusicKit API key. Its README states that it does not support library resources. It is suitable as a reference for Apple Music catalog metadata and URL inspection, not stream extraction.

## Product boundary

The website will present a unified source selector with three explicit workflows. YouTube remains an authorized-media download workflow. Spotify and Apple Music remain metadata, playlist inspection, and official playback-link workflows, because protected-stream extraction or DRM circumvention is outside the product scope.

## References

[1]: https://github.com/spotipy-dev/spotipy "Spotipy GitHub repository"
[2]: https://github.com/mpalazzolo/apple-music-python "apple-music-python GitHub repository"
