import { describe, it, expect } from "vitest";
import {
  navLinks,
  pillars,
  capabilityGroups,
  solutions,
  insightArticles,
  serviceInterestOptions,
} from "@/content/site";

describe("Site content", () => {
  it("navLinks has correct structure", () => {
    expect(navLinks.length).toBeGreaterThan(0);
    navLinks.forEach((link) => {
      expect(link).toHaveProperty("label");
      expect(link).toHaveProperty("href");
      expect(link.href).toMatch(/^(\/|https:\/\/)/);
    });
  });

  it("pillars has exactly 3 items", () => {
    expect(pillars).toHaveLength(3);
    pillars.forEach((p) => {
      expect(p).toHaveProperty("id");
      expect(p).toHaveProperty("headline");
      expect(p).toHaveProperty("body");
    });
  });

  it("capabilityGroups each have 6 items", () => {
    capabilityGroups.forEach((group) => {
      expect(group.items).toHaveLength(6);
    });
  });

  it("solutions all have valid hrefs", () => {
    solutions.forEach((s) => {
      expect(s.href).toMatch(/^\//);
      expect(s.headline.length).toBeGreaterThan(10);
    });
  });

  it("insightArticles have valid slugs and dates", () => {
    insightArticles.forEach((a) => {
      expect(a.slug).toMatch(/^[a-z0-9-]+$/);
      expect(new Date(a.date).toString()).not.toBe("Invalid Date");
    });
  });

  it("serviceInterestOptions are unique", () => {
    const values = serviceInterestOptions.map((o) => o.value);
    expect(new Set(values).size).toBe(values.length);
  });
});
