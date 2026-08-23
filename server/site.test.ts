import { describe, expect, it } from "vitest";
import { contactMessageSchema } from "./site/contact";

describe("public contact form", () => {
  it("accepts a complete support message", () => {
    expect(contactMessageSchema.parse({
      name: "Taylor Example",
      email: "taylor@example.com",
      subject: "Question about a supported workflow",
      message: "I need help understanding the available workflow for a media URL.",
    })).toMatchObject({ email: "taylor@example.com" });
  });

  it("rejects incomplete or invalid support messages", () => {
    expect(() => contactMessageSchema.parse({ name: "A", email: "not-an-email", subject: "Hi", message: "Short" })).toThrow();
  });
});
