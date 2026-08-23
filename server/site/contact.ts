import { contactMessages } from "../../drizzle/schema";
import { getDb } from "../db";
import { z } from "zod";

export const contactMessageSchema = z.object({
  name: z.string().trim().min(2, "Enter your name.").max(120, "Name is too long."),
  email: z.string().trim().email("Enter a valid email address.").max(320, "Email is too long."),
  subject: z.string().trim().min(3, "Enter a subject.").max(160, "Subject is too long."),
  message: z.string().trim().min(10, "Please provide a little more detail.").max(5000, "Message is too long."),
});

export async function createContactMessage(input: z.infer<typeof contactMessageSchema>) {
  const db = await getDb();
  if (!db) throw new Error("Support messages are temporarily unavailable. Please try again later.");

  await db.insert(contactMessages).values(input);
  return { received: true } as const;
}
