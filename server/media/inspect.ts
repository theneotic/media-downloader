import { inspectAppleMusicUrl } from "./appleMusic";
import { inspectSpotifyUrl } from "./spotify";
import type { MediaSource, SourceInspection } from "./sourceTypes";
import { inspectYouTubeUrl } from "./youtube";

export function inspectSourceUrl(source: MediaSource, url: string): SourceInspection {
  switch (source) {
    case "youtube":
      return inspectYouTubeUrl(url);
    case "spotify":
      return inspectSpotifyUrl(url);
    case "appleMusic":
      return inspectAppleMusicUrl(url);
  }
}
