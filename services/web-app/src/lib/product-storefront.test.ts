import { describe, expect, it } from "vitest";
import type { CatalogResponse } from "./commerce";
import {
  filterLandingPageCatalog,
  getStorefrontRecoveryAction,
  readStorefrontPaymentState,
  readStorefrontSelection,
} from "./product-storefront";

const sampleCatalog: CatalogResponse = {
  items: [
    {
      slug: "landing-page-starter",
      itemCode: "NG-LP-STARTER",
      label: "Naya Launch Page Core",
      summary: "Launch-ready core package",
      domain: "TECH",
      categoryLabel: "Landing Page Packages",
      kind: "PACKAGE",
      checkoutMode: "INSTANT",
      billingModel: "ADVANCE",
      currency: "INR",
      basePriceMinor: 999900,
      defaultDepositPercent: 60,
      route: null,
      deliveryWindow: "3–5 business days",
      isFeatured: true,
    },
    {
      slug: "landing-page-extra-section",
      itemCode: "NG-LP-SECTION",
      label: "Extra Section",
      summary: "Additional structured section",
      domain: "TECH",
      categoryLabel: "Landing Page Add-ons",
      kind: "ADDON",
      checkoutMode: "INSTANT",
      billingModel: "FULL",
      currency: "INR",
      basePriceMinor: 150000,
      defaultDepositPercent: 100,
      compatiblePackageSlugs: ["landing-page-starter"],
      route: null,
      deliveryWindow: "Added to scope",
      isFeatured: false,
    },
    {
      slug: "landing-page-monthly-support",
      itemCode: "NG-LP-MONTHLY-SUPPORT",
      label: "Monthly Launch Support",
      summary: "Retained support for live pages",
      domain: "ADVISORY",
      categoryLabel: "Landing Page Add-ons",
      kind: "ADDON",
      checkoutMode: "QUOTE_ONLY",
      billingModel: "FULL",
      currency: "INR",
      basePriceMinor: 650000,
      defaultDepositPercent: 100,
      compatiblePackageSlugs: ["landing-page-starter"],
      route: null,
      deliveryWindow: "Monthly retained scope",
      isFeatured: false,
    },
    {
      slug: "growth-sprint",
      itemCode: "NG-MKT-GROWTH-SPRINT",
      label: "Growth Sprint",
      summary: "Legacy package",
      domain: "MARKETING",
      categoryLabel: "Packages",
      kind: "PACKAGE",
      checkoutMode: "INSTANT",
      billingModel: "FULL",
      currency: "INR",
      basePriceMinor: 4900000,
      defaultDepositPercent: 100,
      route: null,
      deliveryWindow: "2 weeks",
      isFeatured: false,
    },
  ],
  offers: [],
  lastSyncedAt: null,
};

describe("readStorefrontSelection", () => {
  it("maps legacy product slugs into the canonical landing-page storefront", () => {
    const selection = readStorefrontSelection({
      package: "launchpad-website",
      addons: "tracking-layer,landing-page-extra-section",
      coupon: "naya10",
      ref: "partner7",
    });

    expect(selection).toEqual({
      packageSlug: "landing-page-growth",
      addonSlugs: [
        "landing-page-tracking",
        "landing-page-extra-section",
      ],
      quoteSlugs: [],
      couponCode: "NAYA10",
      referralCode: "PARTNER7",
    });
  });
});

describe("filterLandingPageCatalog", () => {
  it("keeps only the landing-page SaaS items inside the logged-in storefront", () => {
    const filtered = filterLandingPageCatalog(sampleCatalog);

    expect(filtered.items.map((item) => item.slug)).toEqual([
      "landing-page-starter",
      "landing-page-extra-section",
      "landing-page-monthly-support",
    ]);
  });
});

describe("readStorefrontPaymentState", () => {
  it("reads a payment return state only when a recoverable cart id is present", () => {
    expect(
      readStorefrontPaymentState({
        payment: "return",
        cartId: "cart_paid",
      }),
    ).toEqual({
      kind: "return",
      cartId: "cart_paid",
    });

    expect(
      readStorefrontPaymentState({
        payment: "return",
      }),
    ).toEqual({
      kind: null,
      cartId: null,
    });
  });

  it("keeps cancelled payment state readable in the storefront", () => {
    expect(
      readStorefrontPaymentState({
        payment: "cancelled",
        cartId: "cart_paid",
      }),
    ).toEqual({
      kind: "cancelled",
      cartId: "cart_paid",
    });
  });
});

describe("getStorefrontRecoveryAction", () => {
  it("routes paid self-serve carts into onboarding instead of another checkout loop", () => {
    expect(
      getStorefrontRecoveryAction({
        id: "cart_paid",
        status: "PAID",
        flowMode: "SELF_SERVE",
        summary: {
          subtotalMinor: 4900000,
          discountMinor: 0,
          totalMinor: 4900000,
          payableTodayMinor: 4900000,
          remainingAfterTodayMinor: 0,
        },
        lines: [],
        quoteRequest: null,
        latestCheckoutSession: {
          id: "checkout_paid",
          status: "PAID",
          providerOrderId: "provider_1",
          paymentSessionId: "session_1",
          amountMinor: 4900000,
        },
        erp: {
          quotationId: null,
          salesOrderId: null,
          customerId: null,
          syncStatus: "PENDING",
        },
      }),
    ).toEqual({
      kind: "onboarding",
      label: "Continue onboarding",
      detail: "Payment is already captured, so the next step is the delivery brief.",
    });
  });

  it("re-opens checkout for self-serve carts that are still waiting for payment", () => {
    expect(
      getStorefrontRecoveryAction({
        id: "cart_ready",
        status: "CHECKOUT_READY",
        flowMode: "SELF_SERVE",
        summary: {
          subtotalMinor: 4900000,
          discountMinor: 0,
          totalMinor: 4900000,
          payableTodayMinor: 4900000,
          remainingAfterTodayMinor: 0,
        },
        lines: [],
        quoteRequest: null,
        latestCheckoutSession: {
          id: "checkout_waiting",
          status: "ACTION_REQUIRED",
          providerOrderId: "provider_2",
          paymentSessionId: "session_2",
          amountMinor: 4900000,
        },
        erp: {
          quotationId: null,
          salesOrderId: null,
          customerId: null,
          syncStatus: "PENDING",
        },
      }),
    ).toEqual({
      kind: "checkout",
      label: "Resume payment",
      detail: "This draft is still waiting for payment, so we should reopen checkout.",
    });
  });

  it("keeps quote-led carts out of the payment resume path", () => {
    expect(
      getStorefrontRecoveryAction({
        id: "cart_quote",
        status: "QUOTE_REQUESTED",
        flowMode: "QUOTE_REQUEST",
        summary: {
          subtotalMinor: 4900000,
          discountMinor: 0,
          totalMinor: 4900000,
          payableTodayMinor: 0,
          remainingAfterTodayMinor: 4900000,
        },
        lines: [],
        quoteRequest: {
          id: "quote_1",
          status: "SUBMITTED",
          erpQuotationId: null,
        },
        latestCheckoutSession: null,
        erp: {
          quotationId: null,
          salesOrderId: null,
          customerId: null,
          syncStatus: "PENDING",
        },
      }),
    ).toEqual({
      kind: "quote",
      label: "Quote in review",
      detail: "This scope is still with the team for pricing, so no payment action should show yet.",
    });
  });
});
