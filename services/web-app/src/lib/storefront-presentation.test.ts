import { describe, expect, it } from "vitest";
import {
  groupStorefrontAddons,
  recommendedStorefrontPackageSlug,
  storefrontComparisonRows,
  storefrontGuardrailLines,
  storefrontPackageProfiles,
} from "./storefront-presentation";

describe("storefront-presentation", () => {
  it("pins the recommended package and final package framing in one shared source", () => {
    expect(recommendedStorefrontPackageSlug).toBe("landing-page-growth");

    expect(storefrontPackageProfiles["landing-page-starter"]).toEqual(
      expect.objectContaining({
        bestFor: "Simple launches, local businesses, founders",
        scope: "One custom landing page, up to 6 structured sections",
        revisions: "1 revision round within the approved direction",
        timeline: "3-5 business days",
      }),
    );

    expect(storefrontPackageProfiles["landing-page-growth"]).toEqual(
      expect.objectContaining({
        recommendedLabel: "Recommended for most lead-generation clients",
        paymentTerms: "50% advance / 50% before final handover or launch",
      }),
    );

    expect(storefrontPackageProfiles["landing-page-premium"]).toEqual(
      expect.objectContaining({
        paymentTerms:
          "50% advance / 30% on design approval / 20% before final handover or launch",
      }),
    );
  });

  it("defines a comparison matrix and commercial guardrails for the storefront", () => {
    expect(storefrontComparisonRows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: "Structured sections",
          values: expect.objectContaining({
            "landing-page-starter": "Up to 6",
            "landing-page-growth": "Up to 10",
            "landing-page-premium": "Up to 12",
          }),
        }),
        expect.objectContaining({
          label: "Post-launch support",
          values: expect.objectContaining({
            "landing-page-starter": "None",
            "landing-page-growth": "Launch confirmation only",
            "landing-page-premium": "14-day support + 1 optimization pass",
          }),
        }),
      ]),
    );

    expect(storefrontGuardrailLines).toContain(
      "Included revisions apply only within the approved direction.",
    );
  });

  it("groups add-ons into clearer commercial buckets", () => {
    const groups = groupStorefrontAddons([
      {
        slug: "landing-page-extra-section",
        label: "Extra Section",
        summary: "Build scope add-on",
      },
      {
        slug: "landing-page-tracking",
        label: "Analytics & Tracking Setup",
        summary: "Measurement add-on",
      },
      {
        slug: "landing-page-monthly-support",
        label: "Monthly Launch Support",
        summary: "Support add-on",
      },
    ]);

    expect(groups.map((group) => group.label)).toEqual([
      "Scope and build",
      "Measurement and routing",
      "Launch support",
    ]);

    expect(groups[0]?.items.map((item) => item.slug)).toEqual(["landing-page-extra-section"]);
    expect(groups[1]?.items.map((item) => item.slug)).toEqual(["landing-page-tracking"]);
    expect(groups[2]?.items.map((item) => item.slug)).toEqual(["landing-page-monthly-support"]);
  });
});
