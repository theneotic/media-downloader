import { describe, expect, it } from "vitest";
import {
  footerExploreLinks,
  footerPolicyLinks,
  policyNavigation,
  primaryNavigation,
  publicPageMetadata,
  searchSiteContent,
} from "./siteContent";

describe("public site structure", () => {
  it("exposes workspace, trust, support, and policy destinations in shared navigation", () => {
    expect(primaryNavigation.map((item) => item.href)).toEqual(["/#workspace", "/about", "/contact"]);
    expect(policyNavigation.map((item) => item.href)).toEqual(["/privacy", "/terms"]);
    expect(footerExploreLinks.map((item) => item.href)).toContain("/contact");
    expect(footerPolicyLinks.map((item) => item.href)).toEqual(["/privacy", "/terms"]);
  });

  it("returns relevant public-page search results and safely handles no-result queries", () => {
    expect(searchSiteContent("privacy").map((item) => item.href)).toEqual(["/privacy"]);
    expect(searchSiteContent("YouTube").map((item) => item.href)).toContain("/#workspace");
    expect(searchSiteContent("not-a-site-page")).toHaveLength(0);
  });

  it("defines a clear heading and supporting description for each public route", () => {
    expect(publicPageMetadata.about.title).toContain("service boundaries");
    expect(publicPageMetadata.contact.eyebrow).toBe("CONTACT & SUPPORT");
    expect(publicPageMetadata.privacy.title).toContain("information");
    expect(publicPageMetadata.terms.title).toContain("allowed to handle");
    expect(publicPageMetadata.search.title).toContain("Find the right page");
  });
});
