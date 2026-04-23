import { describe, expect, it } from "vitest";
import {
  calculateCommerceDraft,
  type CommerceCatalogEntry,
  type CommerceOffer,
} from "./commerce.js";

const catalog: CommerceCatalogEntry[] = [
  {
    slug: "growth-sprint",
    itemCode: "NG-MKT-GROWTH-SPRINT",
    label: "Growth Sprint",
    summary: "Demand generation reset for growth teams.",
    domain: "MARKETING",
    categoryLabel: "Growth Systems",
    kind: "PACKAGE",
    checkoutMode: "INSTANT",
    billingModel: "FULL",
    currency: "INR",
    basePriceMinor: 4900000,
    defaultDepositPercent: 100,
    portalVisible: true,
    isFeatured: true,
    sortOrder: 1,
  },
  {
    slug: "revops-foundation",
    itemCode: "NG-TECH-REVOPS",
    label: "RevOps Foundation",
    summary: "Revenue operations cleanup and reporting.",
    domain: "TECH",
    categoryLabel: "Revenue Operations",
    kind: "PACKAGE",
    checkoutMode: "INSTANT",
    billingModel: "ADVANCE",
    currency: "INR",
    basePriceMinor: 12000000,
    defaultDepositPercent: 50,
    portalVisible: true,
    isFeatured: true,
    sortOrder: 2,
  },
  {
    slug: "tracking-layer",
    itemCode: "NG-ADDON-TRACKING",
    label: "Tracking Layer",
    summary: "Analytics and conversion instrumentation.",
    domain: "TECH",
    categoryLabel: "Add-ons",
    kind: "ADDON",
    checkoutMode: "INSTANT",
    billingModel: "FULL",
    currency: "INR",
    basePriceMinor: 1800000,
    defaultDepositPercent: 100,
    addonParentSlug: "revops-foundation",
    portalVisible: true,
    isFeatured: false,
    sortOrder: 3,
  },
  {
    slug: "enterprise-rollout",
    itemCode: "NG-ADV-ENTERPRISE",
    label: "Enterprise Rollout",
    summary: "Multi-team enablement and transformation.",
    domain: "ADVISORY",
    categoryLabel: "Enterprise",
    kind: "QUOTE_ONLY",
    checkoutMode: "QUOTE_ONLY",
    billingModel: "ADVANCE",
    currency: "INR",
    basePriceMinor: null,
    defaultDepositPercent: null,
    portalVisible: true,
    isFeatured: true,
    sortOrder: 4,
  },
];

const offers: CommerceOffer[] = [
  {
    code: "NAYA10",
    label: "Launch offer",
    discountType: "PERCENTAGE",
    discountValue: 10,
    appliesToKinds: ["PACKAGE"],
    minimumOrderMinor: 0,
  },
];

describe("calculateCommerceDraft", () => {
  it("builds a self-serve quote for priced package and add-on mixes", () => {
    const draft = calculateCommerceDraft({
      catalog,
      offers,
      selections: [
        { slug: "revops-foundation", quantity: 1 },
        { slug: "tracking-layer", quantity: 1 },
      ],
    });

    expect(draft.flowMode).toBe("SELF_SERVE");
    expect(draft.subtotalMinor).toBe(13_800_000);
    expect(draft.discountMinor).toBe(0);
    expect(draft.payableTodayMinor).toBe(7_800_000);
    expect(draft.remainingAfterTodayMinor).toBe(6_000_000);
  });

  it("switches the builder into quote-request mode when any custom item is present", () => {
    const draft = calculateCommerceDraft({
      catalog,
      offers,
      selections: [
        { slug: "growth-sprint", quantity: 1 },
        { slug: "enterprise-rollout", quantity: 1 },
      ],
    });

    expect(draft.flowMode).toBe("QUOTE_REQUEST");
    expect(draft.requiresHumanReview).toBe(true);
    expect(draft.payableTodayMinor).toBe(0);
    expect(draft.remainingAfterTodayMinor).toBe(0);
    expect(draft.issues).toContain("quote_only_item_selected");
  });

  it("applies eligible discounts before calculating the amount due today", () => {
    const draft = calculateCommerceDraft({
      catalog,
      offers,
      selections: [{ slug: "revops-foundation", quantity: 1 }],
      couponCode: "NAYA10",
    });

    expect(draft.discountMinor).toBe(1_200_000);
    expect(draft.totalMinor).toBe(10_800_000);
    expect(draft.payableTodayMinor).toBe(5_400_000);
    expect(draft.remainingAfterTodayMinor).toBe(5_400_000);
    expect(draft.appliedOffer?.code).toBe("NAYA10");
  });

  it("rejects unknown selections clearly", () => {
    expect(() =>
      calculateCommerceDraft({
        catalog,
        offers,
        selections: [{ slug: "missing-item", quantity: 1 }],
      }),
    ).toThrowError(/Unknown catalog item/i);
  });
});
