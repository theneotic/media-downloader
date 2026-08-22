import { and, asc, desc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";
import { mediaJobs, type MediaJob } from "../../drizzle/schema";
import { getDb } from "../db";

const youtubeHosts = ["youtube.com", "youtu.be", "music.youtube.com", "m.youtube.com"];
const outputTemplate = z
  .string()
  .min(1)
  .max(500)
  .refine((value) => !value.startsWith("/") && !value.split("/").includes(".."), {
    message: "Output templates must stay inside the configured output directory.",
  });

export const youtubeJobInputSchema = z.object({
  url: z
    .string()
    .url()
    .refine((value) => youtubeHosts.includes(new URL(value).hostname.toLowerCase().replace(/^www\./, "")), {
      message: "A YouTube URL is required.",
    }),
  mode: z.enum(["video", "audio"]),
  scope: z.enum(["video", "playlist", "channel"]),
  quality: z.enum(["best", "1080", "720", "480", "360"]),
  outputTemplate,
  workers: z.number().int().min(1).max(16),
  retries: z.number().int().min(0).max(10),
});

export const workerUpdateSchema = z.object({
  jobId: z.string().min(1),
  status: z.enum(["running", "succeeded", "failed", "cancelled"]),
  outputUrl: z.string().url().optional(),
  failureReason: z.string().min(1).max(2000).optional(),
});

export const workerClaimSchema = z.object({
  workerSecret: z.string().min(1),
  workerReference: z.string().min(3).max(64),
});

export type YouTubeJobInput = z.infer<typeof youtubeJobInputSchema>;
export type WorkerUpdateInput = z.infer<typeof workerUpdateSchema>;

function assertDatabase<T>(database: T | null): T {
  if (!database) {
    throw new Error("The job database is unavailable.");
  }
  return database;
}

export async function createYouTubeJob(userId: number, input: YouTubeJobInput) {
  const db = assertDatabase(await getDb());
  const id = nanoid();
  await db.insert(mediaJobs).values({
    id,
    userId,
    source: "youtube",
    ...input,
    status: "queued",
  });
  const [job] = await db.select().from(mediaJobs).where(eq(mediaJobs.id, id)).limit(1);
  return job;
}

export async function listUserMediaJobs(userId: number) {
  const db = assertDatabase(await getDb());
  return db
    .select()
    .from(mediaJobs)
    .where(eq(mediaJobs.userId, userId))
    .orderBy(desc(mediaJobs.createdAt))
    .limit(20);
}

export async function claimNextMediaJob(workerReference: string): Promise<MediaJob | null> {
  const db = assertDatabase(await getDb());
  const [candidate] = await db
    .select()
    .from(mediaJobs)
    .where(eq(mediaJobs.status, "queued"))
    .orderBy(asc(mediaJobs.createdAt))
    .limit(1);

  if (!candidate) return null;

  await db
    .update(mediaJobs)
    .set({
      status: "assigned",
      workerReference,
      startedAt: new Date(),
    })
    .where(and(eq(mediaJobs.id, candidate.id), eq(mediaJobs.status, "queued")));

  const [claimed] = await db.select().from(mediaJobs).where(eq(mediaJobs.id, candidate.id)).limit(1);
  return claimed?.workerReference === workerReference ? claimed : null;
}

export async function updateMediaJobFromWorker(input: WorkerUpdateInput) {
  const db = assertDatabase(await getDb());
  const completedAt = ["succeeded", "failed", "cancelled"].includes(input.status)
    ? new Date()
    : null;

  await db
    .update(mediaJobs)
    .set({
      status: input.status,
      outputUrl: input.status === "succeeded" ? input.outputUrl ?? null : null,
      failureReason: input.status === "failed" ? input.failureReason ?? "Worker reported a failure." : null,
      completedAt,
    })
    .where(eq(mediaJobs.id, input.jobId));

  const [job] = await db.select().from(mediaJobs).where(eq(mediaJobs.id, input.jobId)).limit(1);
  return job ?? null;
}
