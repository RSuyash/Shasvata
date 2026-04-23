import { describe, expect, it } from "vitest";
import type { CatalogResponse } from "./commerce";
import {
  buildPublicCatalogSections,
  buildWhitelistingChecklist,
} from "./public-app-site";

const sampleCatalog: CatalogResponse = {
  items: [
    {
      slug: "landing-page-growth",
      itemCode: "NG-LP-GROWTH",
      label: "Naya Campaign Landing System",
      summary: "Recommended campaign-focused package",
      domain: "TECH",
      categoryLabel: "Landing Page Packages",
      kind: "PACKAGE",
      checkoutMode: "INSTANT",
      billingModel: "ADVANCE",
      currency: "INR",
      basePriceMinor: 1_799_900,
      defaultDepositPercent: 50,
      route: "/pricing",
      deliveryWindow: "5–7 business days",
      isFeatured: true,
    },
    {
      slug: "landing-page-email-updates",
      itemCode: "NG-LP-EMAIL",
      label: "Lead Routing Add-On",
      summary: "One agreed destination with basic field mapping",
      domain: "ADVISORY",
      categoryLabel: "Landing Page Add-ons",
      kind: "ADDON",
      checkoutMode: "INSTANT",
      billingModel: "FULL",
      currency: "INR",
      basePriceMinor: 450_000,
      defaultDepositPercent: 100,
      compatiblePackageSlugs: ["landing-page-growth"],
      route: "/pricing",
      deliveryWindow: "Added to active scope",
      isFeatured: false,
    },
    {
      slug: "landing-page-custom-redesign",
      itemCode: "NG-LP-CUSTOM",
      label: "Custom Website Redesign",
      summary: "Quote-first scope",
      domain: "TECH",
      categoryLabel: "Custom Scope",
      kind: "QUOTE_ONLY",
      checkoutMode: "QUOTE_ONLY",
      billingModel: "ADVANCE",
      currency: "INR",
      basePriceMinor: null,
      defaultDepositPercent: null,
      route: "/pricing",
      deliveryWindow: null,
      isFeatured: true,
    },
    {
      slug: "legacy-marketing-sprint",
      itemCode: "NG-MKT-LEGACY",
      label: "Legacy Sprint",
      summary: "Legacy non-storefront item",
      domain: "MARKETING",
      categoryLabel: "Packages",
      kind: "PACKAGE",
      checkoutMode: "INSTANT",
      billingModel: "FULL",
      currency: "INR",
      basePriceMinor: 2_500_000,
      defaultDepositPercent: 100,
      route: "/pricing",
      deliveryWindow: "2 weeks",
      isFeatured: false,
    },
  ],
  offers: [],
  lastSyncedAt: null,
};

describe("buildPublicCatalogSections", () => {
  it("groups the app-domain storefront into packages, add-ons, and quote-first items with INR labels", () => {
    const sections = buildPublicCatalogSections(sampleCatalog);

    expect(sections.packages).toEqual([
      expect.objectContaining({
        slug: "landing-page-growth",
        priceLabel: "₹17,999",
        paymentLabel: "50% advance / 50% before final handover or launch",
      }),
    ]);
    expect(sections.addons).toEqual([
      expect.objectContaining({
        slug: "landing-page-email-updates",
        priceLabel: "₹4,500",
        paymentLabel: "Paid in full",
      }),
    ]);
    expect(sections.customScopes).toEqual([
      expect.objectContaining({
        slug: "landing-page-custom-redesign",
        priceLabel: "Quote first",
      }),
    ]);
    expect(sections.recommendedPackage?.slug).toBe("landing-page-growth");
    expect(sections.comparisonRows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: "Structured sections" }),
        expect.objectContaining({ label: "Post-launch support" }),
      ]),
    );
    expect(sections.guardrailLines).toContain(
      "Included revisions apply only within the approved direction.",
    );
    expect(sections.addonGroups).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: "Measurement and routing",
          items: [expect.objectContaining({ slug: "landing-page-email-updates" })],
        }),
      ]),
    );
  });
});

describe("buildWhitelistingChecklist", () => {
  it("returns the exact app-domain URLs needed for Cashfree review", () => {
    expect(buildWhitelistingChecklist("https://shasvata.com/app")).toEqual([
      "https://shasvata.com/app/",
      "https://shasvata.com/app/products",
      "https://shasvata.com/app/contact",
      "https://shasvata.com/app/terms",
      "https://shasvata.com/app/privacy",
      "https://shasvata.com/app/refunds-cancellations",
    ]);
  });
});
