import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const caller = appRouter.createCaller({} as TrpcContext);

describe("media.inspect", () => {
  it("returns the authorized-download workflow for a recognized YouTube URL", async () => {
    const result = await caller.media.inspect({
      source: "youtube",
      url: "https://www.youtube.com/watch?v=example",
    });

    expect(result).toMatchObject({
      workflow: "authorized-download",
      urlRecognized: true,
    });
  });

  it("returns the metadata workflow for Spotify and Apple Music URLs", async () => {
    const spotify = await caller.media.inspect({
      source: "spotify",
      url: "https://open.spotify.com/playlist/example",
    });
    const appleMusic = await caller.media.inspect({
      source: "appleMusic",
      url: "https://music.apple.com/us/playlist/example/pl.example",
    });

    expect(spotify.workflow).toBe("metadata-and-playback-link");
    expect(spotify.urlRecognized).toBe(true);
    expect(appleMusic.workflow).toBe("metadata-and-playback-link");
    expect(appleMusic.urlRecognized).toBe(true);
  });

  it("marks a valid URL from the wrong provider as unrecognized", async () => {
    const result = await caller.media.inspect({
      source: "spotify",
      url: "https://music.apple.com/us/album/example/1",
    });

    expect(result.urlRecognized).toBe(false);
  });

  it("rejects malformed URLs and invalid source values", async () => {
    await expect(
      caller.media.inspect({
        source: "youtube",
        url: "this is not a URL",
      }),
    ).rejects.toThrow();

    await expect(
      caller.media.inspect({
        source: "soundcloud" as "youtube",
        url: "https://soundcloud.com/example",
      }),
    ).rejects.toThrow();
  });
});

describe("media.worker.verify", () => {
  it("accepts the configured worker secret and rejects an incorrect secret", async () => {
    const workerSecret = process.env.WORKER_SHARED_SECRET;
    expect(workerSecret).toBeTruthy();

    await expect(caller.media.worker.verify({ workerSecret: workerSecret! })).resolves.toEqual({
      authenticated: true,
    });
    await expect(caller.media.worker.verify({ workerSecret: "incorrect-secret" })).rejects.toThrow(
      "Worker authentication failed.",
    );
  });
});
