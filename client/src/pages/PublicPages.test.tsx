import { renderToStaticMarkup } from "react-dom/server";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: () => ({ isAuthenticated: false, loading: false }),
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    site: {
      contact: {
        useMutation: () => ({ mutate: vi.fn(), isPending: false }),
      },
    },
  },
}));

import { AboutPage, ContactPage, PrivacyPage, SearchPage, TermsPage } from "./PublicPages";

describe("public route components", () => {
  beforeEach(() => {
    const location = { pathname: "/", search: "?q=privacy", hash: "" };
    vi.stubGlobal("location", location);
    vi.stubGlobal("window", { location });
  });

  it("renders expected content for every public page", () => {
    expect(renderToStaticMarkup(<AboutPage />)).toContain("Clear routes for media tasks that stay within service boundaries.");
    expect(renderToStaticMarkup(<ContactPage />)).toContain("Tell us what you need help with.");
    expect(renderToStaticMarkup(<PrivacyPage />)).toContain("A plain-language view of how this site handles information.");
    expect(renderToStaticMarkup(<TermsPage />)).toContain("Use the right source flow for content you are allowed to handle.");
    expect(renderToStaticMarkup(<SearchPage />)).toContain("Privacy policy");
  });
});
