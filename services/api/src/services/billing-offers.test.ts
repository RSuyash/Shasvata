import { describe, expect, it } from "vitest";
import type { CommerceCatalogEntry } from "../domain/commerce.js";
import {
  evaluateBillingPreview,
  type BillingOfferPolicyInput,
} from "./billing-offers.js";

const launchpadCatalogEntry: CommerceCatalogEntry = {
  slug: "launchpad-website",
  itemCode: "NG-TECH-LAUNCHPAD",
  label: "Launchpad Website",
  summary: "Conversion-focused website package",
  domain: "TECH",
  categoryLabel: "Packages",
  kind: "PACKAGE",
  checkoutMode: "INSTANT",
  billingModel: "ADVANCE",
  currency: "INR",
  basePriceMinor: 8_500_000,
  defaultDepositPercent: 50,
  portalVisible: true,
  isFeatured: true,
  sortOrder: 1,
};

describe("evaluateBillingPreview", () => {
  it("applies catalog coupon pricing and operator adjustment on the server", () => {
    const preview = evaluateBillingPreview({
      config: {
        currency: "INR",
        allowCoupons: true,
        allowReferral: true,
        allowOperatorOverride: true,
        defaultDepositPercent: 50,
        defaultPaymentMode: "DEPOSIT",
      },
      catalog: [launchpadCatalogEntry],
      selections: [{ slug: "launchpad-website", quantity: 1 }],
      policies: [
        {
          id: "policy_naya10",
          code: "NAYA10",
          label: "Campaign launch offer",
          scopeType: "CHECKOUT",
          discountType: "PERCENT",
          discountValue: 10,
          couponCode: "NAYA10",
          referralCode: null,
          stackingMode: "STACKABLE",
          minSubtotalMinor: 0,
          maxDiscountMinor: null,
          validFrom: new Date("2026-03-01T00:00:00.000Z"),
          validUntil: new Date("2026-05-01T00:00:00.000Z"),
          usageLimit: null,
          requiresOperatorApproval: false,
          marketingLabel: "Launch offer",
          internalReason: null,
          isActive: true,
        },
      ],
      couponCode: "NAYA10",
      operatorAdjustmentMinor: 500_000,
      now: new Date("2026-03-31T00:00:00.000Z"),
    });

    expect(preview.subtotalMinor).toBe(8_500_000);
    expect(preview.discountMinor).toBe(1_350_000);
    expect(preview.totalMinor).toBe(7_150_000);
    expect(preview.payableTodayMinor).toBe(3_575_000);
    expect(preview.remainingAfterTodayMinor).toBe(3_575_000);
    expect(preview.appliedOfferCodes).toEqual(["NAYA10", "OPERATOR_OVERRIDE"]);
  });

  it("supports custom negotiated lines and ignores expired project policies", () => {
    const preview = evaluateBillingPreview({
      config: {
        currency: "INR",
        allowCoupons: true,
        allowReferral: false,
        allowOperatorOverride: false,
        defaultDepositPercent: 100,
        defaultPaymentMode: "FULL",
      },
      catalog: [],
      customLines: [
        {
          itemCode: "NG-WEB-OPT1-LAUNCH-BASIC",
          label: "Landing Page Launch Basic",
          quantity: 1,
          unitPriceMinor: 9_999,
          billingModel: "FULL",
          checkoutMode: "INSTANT",
          kind: "PACKAGE",
        },
      ],
      policies: [
        {
          id: "policy_old",
          code: "OLD500",
          label: "Old expired offer",
          scopeType: "PROJECT",
          scopeProjectId: "project_alpha",
          discountType: "FIXED_MINOR",
          discountValue: 500,
          couponCode: "OLD500",
          referralCode: null,
          stackingMode: "EXCLUSIVE",
          minSubtotalMinor: 0,
          maxDiscountMinor: null,
          validFrom: new Date("2026-01-01T00:00:00.000Z"),
          validUntil: new Date("2026-02-01T00:00:00.000Z"),
          usageLimit: null,
          requiresOperatorApproval: false,
          marketingLabel: null,
          internalReason: null,
          isActive: true,
        } satisfies BillingOfferPolicyInput,
      ],
      couponCode: "OLD500",
      now: new Date("2026-03-31T00:00:00.000Z"),
    });

    expect(preview.discountMinor).toBe(0);
    expect(preview.totalMinor).toBe(9_999);
    expect(preview.appliedOfferCodes).toEqual([]);
  });
});
