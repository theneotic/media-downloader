import { describe, expect, it } from "vitest";
import { workerUpdateSchema, youtubeJobInputSchema } from "./jobs";

const validJob = {
  url: "https://www.youtube.com/playlist?list=example",
  mode: "audio" as const,
  scope: "playlist" as const,
  quality: "best" as const,
  outputTemplate: "%(playlist_title)s/%(playlist_index)03d - %(title)s.%(ext)s",
  workers: 4,
  retries: 3,
};

describe("youtubeJobInputSchema", () => {
  it("accepts a bounded, authorized YouTube job specification", () => {
    expect(youtubeJobInputSchema.parse(validJob)).toEqual(validJob);
  });

  it("rejects a non-YouTube URL, unsafe templates, and out-of-range workers", () => {
    expect(() => youtubeJobInputSchema.parse({ ...validJob, url: "https://example.com/video" })).toThrow();
    expect(() => youtubeJobInputSchema.parse({ ...validJob, outputTemplate: "../outside/%(title)s.%(ext)s" })).toThrow();
    expect(() => youtubeJobInputSchema.parse({ ...validJob, workers: 17 })).toThrow();
  });
});

describe("workerUpdateSchema", () => {
  it("accepts terminal success and rejects arbitrary status values", () => {
    expect(
      workerUpdateSchema.parse({
        jobId: "job-1",
        status: "succeeded",
        outputUrl: "https://files.example.com/output.mp3",
      }),
    ).toMatchObject({ status: "succeeded" });
    expect(() => workerUpdateSchema.parse({ jobId: "job-1", status: "queued" })).toThrow();
  });
});

