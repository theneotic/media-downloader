import { describe, expect, it } from "vitest";
import { mediaMimeType, safeWorkerFilename } from "./files";

describe("worker output file validation", () => {
  it("normalizes uploaded media filenames and identifies common media MIME types", () => {
    expect(safeWorkerFilename("../../my:track?.mp3")).toBe(".._.._my_track_.mp3");
    expect(mediaMimeType("my-track.mp3")).toBe("audio/mpeg");
    expect(mediaMimeType("video.mp4")).toBe("video/mp4");
  });

  it("rejects empty output filenames", () => {
    expect(() => safeWorkerFilename("")).toThrow("valid output filename");
  });
});
