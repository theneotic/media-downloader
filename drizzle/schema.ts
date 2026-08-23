import { index, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const mediaJobs = mysqlTable(
  "media_jobs",
  {
    id: varchar("id", { length: 32 }).primaryKey(),
    userId: int("user_id").notNull(),
    source: mysqlEnum("source", ["youtube"]).notNull().default("youtube"),
    url: text("url").notNull(),
    mode: mysqlEnum("mode", ["video", "audio"]).notNull(),
    scope: mysqlEnum("scope", ["video", "playlist", "channel"]).notNull(),
    quality: varchar("quality", { length: 16 }).notNull(),
    outputTemplate: text("output_template").notNull(),
    workers: int("workers").notNull(),
    retries: int("retries").notNull(),
    status: mysqlEnum("status", ["queued", "assigned", "running", "succeeded", "failed", "cancelled"])
      .notNull()
      .default("queued"),
    outputUrl: text("output_url"),
    failureReason: text("failure_reason"),
    workerReference: varchar("worker_reference", { length: 64 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
    startedAt: timestamp("started_at"),
    completedAt: timestamp("completed_at"),
  },
  (table) => [
    index("media_jobs_user_created_idx").on(table.userId, table.createdAt),
    index("media_jobs_status_created_idx").on(table.status, table.createdAt),
  ],
);

export type MediaJob = typeof mediaJobs.$inferSelect;
export type InsertMediaJob = typeof mediaJobs.$inferInsert;

export const mediaJobFiles = mysqlTable(
  "media_job_files",
  {
    id: varchar("id", { length: 32 }).primaryKey(),
    jobId: varchar("job_id", { length: 32 }).notNull(),
    storageKey: varchar("storage_key", { length: 512 }).notNull(),
    downloadUrl: text("download_url").notNull(),
    filename: varchar("filename", { length: 512 }).notNull(),
    mimeType: varchar("mime_type", { length: 128 }).notNull(),
    bytes: int("bytes").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("media_job_files_job_created_idx").on(table.jobId, table.createdAt)],
);

export type MediaJobFile = typeof mediaJobFiles.$inferSelect;

export const contactMessages = mysqlTable(
  "contact_messages",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 120 }).notNull(),
    email: varchar("email", { length: 320 }).notNull(),
    subject: varchar("subject", { length: 160 }).notNull(),
    message: text("message").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("contact_messages_email_created_idx").on(table.email, table.createdAt)],
);

export type ContactMessage = typeof contactMessages.$inferSelect;
