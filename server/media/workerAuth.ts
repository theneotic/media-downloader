import { timingSafeEqual } from "node:crypto";
import { TRPCError } from "@trpc/server";
import { ENV } from "../_core/env";

export function assertWorkerSecret(candidate: string) {
  const expected = ENV.workerSharedSecret;
  const candidateBuffer = Buffer.from(candidate);
  const expectedBuffer = Buffer.from(expected);

  if (
    !expected ||
    candidateBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(candidateBuffer, expectedBuffer)
  ) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Worker authentication failed.",
    });
  }
}
