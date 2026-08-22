import { desc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { mediaJobFiles, mediaJobs } from "../../drizzle/schema";
import { ENV } from "../_core/env";
import { getDb } from "../db";

function assertDatabase<T>(database: T | null): T {
  if (!database) throw new Error("The job database is unavailable.");
  return database;
}

export function safeWorkerFilename(value: string) {
  const filename = value.replace(/[^a-zA-Z0-9._ -]/g, "_").slice(-180);
  if (!filename || filename === "." || filename === "..") {
    throw new Error("A valid output filename is required.");
  }
  return filename;
}

export function mediaMimeType(filename: string) {
  const extension = filename.split(".").pop()?.toLowerCase();
  const mediaTypes: Record<string, string> = {
    mp3: "audio/mpeg",
    m4a: "audio/mp4",
    webm: "audio/webm",
    mp4: "video/mp4",
    mkv: "video/x-matroska",
  };
  return mediaTypes[extension ?? ""] ?? "application/octet-stream";
}

function appendHashSuffix(relKey: string) {
  const hash = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  const lastDot = relKey.lastIndexOf(".");
  return lastDot === -1 ? `${relKey}_${hash}` : `${relKey.slice(0, lastDot)}_${hash}${relKey.slice(lastDot)}`;
}

async function getAssignedRunningJob(jobId: string, workerReference: string) {
  const db = assertDatabase(await getDb());
  const [job] = await db.select().from(mediaJobs).where(eq(mediaJobs.id, jobId)).limit(1);
  if (!job) throw new Error("Media job not found.");
  if (job.workerReference !== workerReference) throw new Error("Worker is not assigned to this job.");
  if (job.status !== "running") throw new Error("Media job is not ready for output upload.");
  return { db, job };
}

export async function createWorkerUploadTarget({
  jobId,
  workerReference,
  filename,
  contentType,
}: {
  jobId: string;
  workerReference: string;
  filename: string;
  contentType?: string;
}) {
  const { job } = await getAssignedRunningJob(jobId, workerReference);
  const safeFilename = safeWorkerFilename(filename);
  const mimeType = contentType || mediaMimeType(safeFilename);
  const storageKey = appendHashSuffix(`media-jobs/${job.userId}/${job.id}/${safeFilename}`);
  if (!ENV.forgeApiUrl || !ENV.forgeApiKey) throw new Error("Managed storage is unavailable.");

  const presignUrl = new URL("v1/storage/presign/put", `${ENV.forgeApiUrl.replace(/\/+$/, "")}/`);
  presignUrl.searchParams.set("path", storageKey);
  const response = await fetch(presignUrl, { headers: { Authorization: `Bearer ${ENV.forgeApiKey}` } });
  if (!response.ok) throw new Error(`Storage upload target failed (${response.status}).`);
  const { url: uploadUrl } = (await response.json()) as { url: string };
  if (!uploadUrl) throw new Error("Storage returned an empty upload target.");
  return { storageKey, uploadUrl, filename: safeFilename, mimeType };
}

export async function recordWorkerOutput({
  jobId,
  workerReference,
  storageKey,
  filename,
  mimeType,
  bytes,
}: {
  jobId: string;
  workerReference: string;
  storageKey: string;
  filename: string;
  mimeType: string;
  bytes: number;
}) {
  const { db, job } = await getAssignedRunningJob(jobId, workerReference);
  const safeFilename = safeWorkerFilename(filename);
  const expectedPrefix = `media-jobs/${job.userId}/${job.id}/`;
  if (!storageKey.startsWith(expectedPrefix)) throw new Error("Storage key is outside this job's output directory.");
  if (!Number.isInteger(bytes) || bytes < 1) throw new Error("A positive output size is required.");

  const id = nanoid();
  const downloadUrl = `/manus-storage/${storageKey}`;
  await db.insert(mediaJobFiles).values({
    id,
    jobId: job.id,
    storageKey,
    downloadUrl,
    filename: safeFilename,
    mimeType,
    bytes,
  });
  await db.update(mediaJobs).set({ outputUrl: downloadUrl }).where(eq(mediaJobs.id, job.id));

  const [file] = await db.select().from(mediaJobFiles).where(eq(mediaJobFiles.id, id)).limit(1);
  return file;
}

export async function listMediaJobFiles(jobId: string) {
  const db = assertDatabase(await getDb());
  return db
    .select()
    .from(mediaJobFiles)
    .where(eq(mediaJobFiles.jobId, jobId))
    .orderBy(desc(mediaJobFiles.createdAt));
}
