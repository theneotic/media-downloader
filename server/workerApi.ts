import type { Express, Request, Response } from "express";
import { z, ZodError } from "zod";
import { createWorkerUploadTarget, recordWorkerOutput } from "./media/files";
import { claimNextMediaJob, workerClaimSchema, workerUpdateSchema, updateMediaJobFromWorker } from "./media/jobs";
import { assertWorkerSecret } from "./media/workerAuth";

function sendWorkerError(res: Response, error: unknown) {
  if (error instanceof ZodError) {
    return res.status(400).json({ error: "Invalid worker request.", issues: error.issues });
  }
  const message = error instanceof Error ? error.message : "Worker request failed.";
  const status = message === "Worker authentication failed." ? 401 : 500;
  return res.status(status).json({ error: message });
}

export function registerWorkerRoutes(app: Express) {
  app.post("/api/worker/claim", async (req: Request, res: Response) => {
    try {
      const input = workerClaimSchema.parse(req.body);
      assertWorkerSecret(input.workerSecret);
      const job = await claimNextMediaJob(input.workerReference);
      return res.json({ job });
    } catch (error) {
      return sendWorkerError(res, error);
    }
  });

  app.post("/api/worker/update", async (req: Request, res: Response) => {
    try {
      const input = workerUpdateSchema.extend({ workerSecret: z.string().min(1) }).parse(req.body);
      assertWorkerSecret(input.workerSecret);
      const job = await updateMediaJobFromWorker(input);
      if (!job) return res.status(404).json({ error: "Media job not found." });
      return res.json({ job });
    } catch (error) {
      return sendWorkerError(res, error);
    }
  });

  app.post("/api/worker/upload-url/:jobId", async (req: Request, res: Response) => {
    try {
      const input = z.object({
        workerSecret: z.string().min(1),
        workerReference: z.string().min(3).max(64),
        filename: z.string().min(1).max(512),
        contentType: z.string().min(1).max(128).optional(),
      }).parse(req.body);
      assertWorkerSecret(input.workerSecret);
      const target = await createWorkerUploadTarget({
        jobId: req.params.jobId,
        workerReference: input.workerReference,
        filename: input.filename,
        contentType: input.contentType,
      });
      return res.json({ target });
    } catch (error) {
      return sendWorkerError(res, error);
    }
  });

  app.post("/api/worker/upload-complete/:jobId", async (req: Request, res: Response) => {
    try {
      const input = z.object({
        workerSecret: z.string().min(1),
        workerReference: z.string().min(3).max(64),
        storageKey: z.string().min(1).max(512),
        filename: z.string().min(1).max(512),
        mimeType: z.string().min(1).max(128),
        bytes: z.number().int().positive(),
      }).parse(req.body);
      assertWorkerSecret(input.workerSecret);
      const file = await recordWorkerOutput({ jobId: req.params.jobId, ...input });
      return res.status(201).json({ file });
    } catch (error) {
      return sendWorkerError(res, error);
    }
  });
}
