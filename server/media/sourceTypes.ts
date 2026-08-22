export type MediaSource = "youtube" | "spotify" | "appleMusic";

export type SourceInspection = {
  source: MediaSource;
  urlRecognized: boolean;
  workflow: "authorized-download" | "metadata-and-playback-link";
  title: string;
  message: string;
  nextStep: string;
};

export function hostMatches(url: string, allowedHosts: readonly string[]) {
  const hostname = new URL(url).hostname.toLowerCase().replace(/^www\./, "");
  return allowedHosts.includes(hostname);
}
