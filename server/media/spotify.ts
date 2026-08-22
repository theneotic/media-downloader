import { hostMatches, type SourceInspection } from "./sourceTypes";

const SPOTIFY_HOSTS = ["open.spotify.com"] as const;

export function inspectSpotifyUrl(url: string): SourceInspection {
  return {
    source: "spotify",
    urlRecognized: hostMatches(url, SPOTIFY_HOSTS),
    workflow: "metadata-and-playback-link",
    title: "Spotify metadata",
    message:
      "Inspect a public track, album, or playlist URL and retain an official playback link. Protected audio extraction is not available.",
    nextStep: "Connect Spotify Web API credentials to retrieve catalog metadata.",
  };
}
