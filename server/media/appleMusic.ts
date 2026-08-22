import { hostMatches, type SourceInspection } from "./sourceTypes";

const APPLE_MUSIC_HOSTS = ["music.apple.com"] as const;

export function inspectAppleMusicUrl(url: string): SourceInspection {
  return {
    source: "appleMusic",
    urlRecognized: hostMatches(url, APPLE_MUSIC_HOSTS),
    workflow: "metadata-and-playback-link",
    title: "Apple Music metadata",
    message:
      "Inspect a public track, album, or playlist URL and retain an official playback link. Protected audio extraction is not available.",
    nextStep: "Connect Apple Music MusicKit credentials to retrieve catalog metadata.",
  };
}
