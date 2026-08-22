import { hostMatches, type SourceInspection } from "./sourceTypes";

const YOUTUBE_HOSTS = ["youtube.com", "youtu.be", "music.youtube.com", "m.youtube.com"] as const;

export function inspectYouTubeUrl(url: string): SourceInspection {
  return {
    source: "youtube",
    urlRecognized: hostMatches(url, YOUTUBE_HOSTS),
    workflow: "authorized-download",
    title: "Authorized YouTube download",
    message:
      "Prepare a permitted video, playlist, or channel job with quality, audio, naming, worker, and retry controls.",
    nextStep: "Choose the media controls and submit the job to a configured worker.",
  };
}
