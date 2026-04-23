import {
  createWorkbenchCheckoutSessionFromBillingSnapshot,
  isLocalPortalWorkbenchClientEnabled,
} from "./local-portal-workbench";

export type CommerceDiscountType = "PERCENTAGE" | "FIXED";
export type CommerceItemKind = "PACKAGE" | "ADDON" | "QUOTE_ONLY";
export type CommerceCheckoutMode = "INSTANT" | "QUOTE_ONLY";
export type CommerceBillingModel = "FULL" | "ADVANCE";
export type CommerceFlowMode = "SELF_SERVE" | "QUOTE_REQUEST";

export type CatalogItem = {
  slug: string;
  itemCode: string;
  label: string;
  summary: string;
  description?: string | null;
  domain: "MARKETING" | "TECH" | "ADVISORY";
  categoryLabel: string;
  kind: CommerceItemKind;
  checkoutMode: CommerceCheckoutMode;
  billingModel: CommerceBillingModel;
  currency: string;
  basePriceMinor: number | null;
  defaultDepositPercent: number | null;
  addonParentSlug?: string | null;
  compatiblePackageSlugs?: string[] | null;
  route?: string | null;
  deliveryWindow?: string | null;
  isFeatured: boolean;
};

export type CatalogOffer = {
  code: string;
  label: string;
  discountType: CommerceDiscountType;
  discountValue: number;
  minimumOrderMinor: number;
  appliesToKinds?: CommerceItemKind[];
};

export type CatalogResponse = {
  items: CatalogItem[];
  offers: CatalogOffer[];
  lastSyncedAt: string | null;
};

export type PreviewLine = {
  slug: string;
  label: string;
  kind: CommerceItemKind;
  billingModel: CommerceBillingModel;
  checkoutMode: CommerceCheckoutMode;
  unitPriceMinor: number | null;
  lineTotalMinor: number;
  payableTodayMinor: number;
  remainingAfterTodayMinor: number;
};

export type PreviewSummary = {
  flowMode: CommerceFlowMode;
  issues: string[];
  subtotalMinor: number;
  discountMinor: number;
  totalMinor: number;
  payableTodayMinor: number;
  remainingAfterTodayMinor: number;
  appliedOfferCode: string | null;
  lines: PreviewLine[];
};

export type PortalCart = {
  id: string;
  status: string;
  flowMode: CommerceFlowMode;
  summary: {
    subtotalMinor: number;
    discountMinor: number;
    totalMinor: number;
    payableTodayMinor: number;
    remainingAfterTodayMinor: number;
  };
  lines: PreviewLine[];
  quoteRequest: {
    id: string;
    status: string;
    erpQuotationId: string | null;
  } | null;
  latestCheckoutSession: {
    id: string;
    status: string;
    providerOrderId: string | null;
    paymentSessionId: string | null;
    amountMinor: number;
  } | null;
  erp: {
    quotationId: string | null;
    salesOrderId: string | null;
    customerId: string | null;
    syncStatus: string;
  };
};

export type CheckoutSessionResponse = {
  id: string;
  status: string;
  provider: string;
  environment: "MOCK" | "SANDBOX" | "PRODUCTION";
  amountMinor: number;
  currency: string;
  paymentSessionId: string | null;
  providerOrderId: string | null;
  hostedCheckoutUrl: string | null;
  erp: {
    customerId: string;
    quotationId: string;
    salesOrderId: string;
  };
};

export type PortalSummaryResponse = {
  email: string;
  portalUser: {
    id: string;
    status: string;
    companyName: string | null;
    erpCustomerId: string | null;
  } | null;
  carts: PortalCart[];
};

export const fallbackCatalog: CatalogResponse = {
  items: [
    {
      slug: "landing-page-starter",
      itemCode: "NG-LP-STARTER",
      label: "Naya Launch Page Core",
      summary: "A professionally designed, mobile-responsive landing page built for clean launch readiness.",
      description:
        "Includes up to 6 structured sections, one lead form, thank-you state, legal/compliance pages, CTA placement, and deployment support. Best for lean launches and straightforward campaign use cases.",
      domain: "TECH",
      categoryLabel: "Landing System Packages",
      kind: "PACKAGE",
      checkoutMode: "INSTANT",
      billingModel: "ADVANCE",
      currency: "INR",
      basePriceMinor: 999_900,
      defaultDepositPercent: 60,
      addonParentSlug: null,
      compatiblePackageSlugs: null,
      route: "/pricing",
      deliveryWindow: "3–5 business days",
      isFeatured: false,
    },
    {
      slug: "landing-page-growth",
      itemCode: "NG-LP-GROWTH",
      label: "Naya Campaign Landing System",
      summary: "A conversion-focused landing system designed for campaign traffic and serious lead generation.",
      description:
        "Includes up to 10 structured sections, premium responsive design, stronger CTA flow, legal/compliance pages, basic routing to one agreed destination, tracking-ready structure, script placement for provided analytics/ad tags, and launch QA. Recommended for most performance-led campaigns.",
      domain: "TECH",
      categoryLabel: "Landing System Packages",
      kind: "PACKAGE",
      checkoutMode: "INSTANT",
      billingModel: "ADVANCE",
      currency: "INR",
      basePriceMinor: 1_799_900,
      defaultDepositPercent: 50,
      addonParentSlug: null,
      compatiblePackageSlugs: null,
      route: "/pricing",
      deliveryWindow: "5–7 business days",
      isFeatured: true,
    },
    {
      slug: "landing-page-premium",
      itemCode: "NG-LP-PREMIUM",
      label: "Shasvata Landing + Lead Ops Setup",
      summary:
        "A premium landing and lead-capture system for businesses that need stronger commercial structure and post-launch confidence.",
      description:
        "Includes up to 12 sections, message architecture, premium design, legal/compliance pages, operational routing, conversion action mapping, launch QA, one post-launch optimization pass, and a 14-day support window.",
      domain: "TECH",
      categoryLabel: "Landing System Packages",
      kind: "PACKAGE",
      checkoutMode: "INSTANT",
      billingModel: "ADVANCE",
      currency: "INR",
      basePriceMinor: 3_499_900,
      defaultDepositPercent: 50,
      addonParentSlug: null,
      compatiblePackageSlugs: null,
      route: "/pricing",
      deliveryWindow: "7–12 business days",
      isFeatured: false,
    },
    {
      slug: "landing-page-extra-section",
      itemCode: "NG-LP-SECTION",
      label: "Extra Section",
      summary: "Additional structured landing-page section beyond the tier limit.",
      description:
        "Useful when the selected package is right but the page needs more room for trust, proof, or offer detail.",
      domain: "TECH",
      categoryLabel: "Landing System Add-ons",
      kind: "ADDON",
      checkoutMode: "INSTANT",
      billingModel: "FULL",
      currency: "INR",
      basePriceMinor: 150_000,
      defaultDepositPercent: 100,
      addonParentSlug: "landing-page-starter",
      compatiblePackageSlugs: [
        "landing-page-starter",
        "landing-page-growth",
        "landing-page-premium",
      ],
      route: "/pricing",
      deliveryWindow: "Added to the selected scope",
      isFeatured: false,
    },
    {
      slug: "landing-page-copywriting",
      itemCode: "NG-LP-COPY",
      label: "Premium Copywriting",
      summary: "Hero, offer, CTA, objection-handling, and section copy drafting/polish based on client inputs.",
      description: "Adds message structure and copy polish when the page needs more than formatting and light refinement.",
      domain: "MARKETING",
      categoryLabel: "Landing System Add-ons",
      kind: "ADDON",
      checkoutMode: "INSTANT",
      billingModel: "FULL",
      currency: "INR",
      basePriceMinor: 350_000,
      defaultDepositPercent: 100,
      addonParentSlug: "landing-page-growth",
      compatiblePackageSlugs: [
        "landing-page-starter",
        "landing-page-growth",
        "landing-page-premium",
      ],
      route: "/pricing",
      deliveryWindow: "Added to the selected scope",
      isFeatured: false,
    },
    {
      slug: "landing-page-tracking",
      itemCode: "NG-LP-TRACKING",
      label: "Analytics & Tracking Setup",
      summary: "Basic event setup support for agreed page actions and verification of script placement.",
      description:
        "Useful when the page needs clean measurement readiness without expanding into full analytics architecture or ad-platform troubleshooting.",
      domain: "TECH",
      categoryLabel: "Landing System Add-ons",
      kind: "ADDON",
      checkoutMode: "INSTANT",
      billingModel: "FULL",
      currency: "INR",
      basePriceMinor: 450_000,
      defaultDepositPercent: 100,
      addonParentSlug: "landing-page-growth",
      compatiblePackageSlugs: [
        "landing-page-starter",
        "landing-page-growth",
        "landing-page-premium",
      ],
      route: "/pricing",
      deliveryWindow: "Added to the selected scope",
      isFeatured: false,
    },
    {
      slug: "landing-page-email-updates",
      itemCode: "NG-LP-EMAIL-UPDATES",
      label: "Lead Routing Add-On",
      summary: "Routing support to one agreed destination with basic field mapping.",
      description: "Best when the selected package needs a cleaner operational handoff to one email, sheet, or simple endpoint.",
      domain: "ADVISORY",
      categoryLabel: "Landing System Add-ons",
      kind: "ADDON",
      checkoutMode: "INSTANT",
      billingModel: "FULL",
      currency: "INR",
      basePriceMinor: 450_000,
      defaultDepositPercent: 100,
      addonParentSlug: "landing-page-growth",
      compatiblePackageSlugs: [
        "landing-page-starter",
        "landing-page-growth",
        "landing-page-premium",
      ],
      route: "/pricing",
      deliveryWindow: "Added to the selected scope",
      isFeatured: false,
    },
    {
      slug: "landing-page-crm-integration",
      itemCode: "NG-LP-CRM",
      label: "CRM / Webhook Routing Pro",
      summary: "For more structured CRM or webhook handoff where the stack and field mapping are already clear.",
      description:
        "Best for cleaner operational routing when a simple one-destination handoff is not enough, but the integration scope is still well-bounded.",
      domain: "TECH",
      categoryLabel: "Landing System Add-ons",
      kind: "ADDON",
      checkoutMode: "INSTANT",
      billingModel: "FULL",
      currency: "INR",
      basePriceMinor: 850_000,
      defaultDepositPercent: 100,
      addonParentSlug: "landing-page-growth",
      compatiblePackageSlugs: [
        "landing-page-starter",
        "landing-page-growth",
        "landing-page-premium",
      ],
      route: "/pricing",
      deliveryWindow: "Added to the selected scope",
      isFeatured: false,
    },
    {
      slug: "landing-page-extra-page",
      itemCode: "NG-LP-PAGE",
      label: "A/B Hero Variant Pack",
      summary: "One alternate hero section/version for testing angle, CTA, or offer framing.",
      description: "Useful when the launch needs one controlled alternate opening hook without reopening the whole page scope.",
      domain: "MARKETING",
      categoryLabel: "Landing System Add-ons",
      kind: "ADDON",
      checkoutMode: "INSTANT",
      billingModel: "FULL",
      currency: "INR",
      basePriceMinor: 250_000,
      defaultDepositPercent: 100,
      addonParentSlug: "landing-page-growth",
      compatiblePackageSlugs: [
        "landing-page-starter",
        "landing-page-growth",
        "landing-page-premium",
      ],
      route: "/pricing",
      deliveryWindow: "Added to the selected scope",
      isFeatured: false,
    },
    {
      slug: "landing-page-priority-delivery",
      itemCode: "NG-LP-FAST",
      label: "Priority Delivery",
      summary: "Fast-track queue priority and compressed turnaround, subject to input readiness.",
      description: "Useful when the campaign clock is tight and the inputs are already ready to move.",
      domain: "ADVISORY",
      categoryLabel: "Landing System Add-ons",
      kind: "ADDON",
      checkoutMode: "INSTANT",
      billingModel: "FULL",
      currency: "INR",
      basePriceMinor: 400_000,
      defaultDepositPercent: 100,
      addonParentSlug: "landing-page-growth",
      compatiblePackageSlugs: [
        "landing-page-starter",
        "landing-page-growth",
        "landing-page-premium",
      ],
      route: "/pricing",
      deliveryWindow: "Fast-track queue priority",
      isFeatured: false,
    },
    {
      slug: "landing-page-major-revision",
      itemCode: "NG-LP-REVISION-MAJOR",
      label: "Additional Revision Round",
      summary: "Extra revision cycle beyond the rounds included in the selected package, within the approved direction.",
      description: "Use when the package revision allowance is already used and the requested changes stay inside the approved direction.",
      domain: "ADVISORY",
      categoryLabel: "Landing System Add-ons",
      kind: "ADDON",
      checkoutMode: "INSTANT",
      billingModel: "FULL",
      currency: "INR",
      basePriceMinor: 250_000,
      defaultDepositPercent: 100,
      addonParentSlug: "landing-page-growth",
      compatiblePackageSlugs: [
        "landing-page-starter",
        "landing-page-growth",
        "landing-page-premium",
      ],
      route: "/pricing",
      deliveryWindow: "Added to the selected scope",
      isFeatured: false,
    },
    {
      slug: "landing-page-revision-bundle",
      itemCode: "NG-LP-REVISION-BUNDLE",
      label: "Post-Launch Optimization Sprint",
      summary: "A 7-day focused review for CTA, copy, and micro-layout refinements after launch.",
      description:
        "Covers one structured refinement cycle for CTA wording, section order, minor layout adjustments, and small form-field improvements.",
      domain: "ADVISORY",
      categoryLabel: "Landing System Add-ons",
      kind: "ADDON",
      checkoutMode: "INSTANT",
      billingModel: "FULL",
      currency: "INR",
      basePriceMinor: 750_000,
      defaultDepositPercent: 100,
      addonParentSlug: "landing-page-premium",
      compatiblePackageSlugs: [
        "landing-page-starter",
        "landing-page-growth",
        "landing-page-premium",
      ],
      route: "/pricing",
      deliveryWindow: "Starts after launch handoff",
      isFeatured: false,
    },
    {
      slug: "landing-page-compliance-pack",
      itemCode: "NG-LP-COMPLIANCE",
      label: "Compliance Pack",
      summary: "For projects needing stricter disclaimer handling, regulated wording blocks, or sector-specific compliance structuring.",
      description:
        "Use when the page needs added compliance handling beyond the standard legal/compliance pages already included in the packages.",
      domain: "ADVISORY",
      categoryLabel: "Landing System Add-ons",
      kind: "ADDON",
      checkoutMode: "QUOTE_ONLY",
      billingModel: "FULL",
      currency: "INR",
      basePriceMinor: 350_000,
      defaultDepositPercent: 100,
      addonParentSlug: "landing-page-growth",
      compatiblePackageSlugs: [
        "landing-page-starter",
        "landing-page-growth",
        "landing-page-premium",
      ],
      route: "/pricing",
      deliveryWindow: "Confirmed after scope review",
      isFeatured: false,
    },
    {
      slug: "landing-page-monthly-support",
      itemCode: "NG-LP-MONTHLY-SUPPORT",
      label: "Monthly Launch Support",
      summary: "For live campaign pages needing upkeep, minor edits, and controlled optimization under a monthly scope.",
      description:
        "Best when the page needs a retained support layer after launch instead of one-off maintenance decisions.",
      domain: "ADVISORY",
      categoryLabel: "Landing System Add-ons",
      kind: "ADDON",
      checkoutMode: "QUOTE_ONLY",
      billingModel: "FULL",
      currency: "INR",
      basePriceMinor: 650_000,
      defaultDepositPercent: 100,
      addonParentSlug: "landing-page-premium",
      compatiblePackageSlugs: [
        "landing-page-starter",
        "landing-page-growth",
        "landing-page-premium",
      ],
      route: "/pricing",
      deliveryWindow: "Monthly retained scope",
      isFeatured: false,
    },
    {
      slug: "landing-page-custom-redesign",
      itemCode: "NG-LP-CUSTOM-REDESIGN",
      label: "Custom Website Redesign",
      summary: "Quote-first when the scope has outgrown a landing system and needs a broader redesign.",
      description:
        "For businesses that need wider information architecture, more pages, a fuller design system, or a deeper content model.",
      domain: "TECH",
      categoryLabel: "Custom Scope",
      kind: "QUOTE_ONLY",
      checkoutMode: "QUOTE_ONLY",
      billingModel: "ADVANCE",
      currency: "INR",
      basePriceMinor: null,
      defaultDepositPercent: null,
      addonParentSlug: null,
      compatiblePackageSlugs: null,
      route: "/pricing",
      deliveryWindow: null,
      isFeatured: true,
    },
    {
      slug: "landing-page-builder-launch-suite",
      itemCode: "NG-LP-BUILDER-SUITE",
      label: "Builder Launch Suite",
      summary: "Quote-first builder scope with heavier compliance, asset coordination, and multi-page launch needs.",
      description:
        "Best for real-estate or operator launches that need a broader compliance and asset-handling layer before pricing is locked.",
      domain: "TECH",
      categoryLabel: "Custom Scope",
      kind: "QUOTE_ONLY",
      checkoutMode: "QUOTE_ONLY",
      billingModel: "ADVANCE",
      currency: "INR",
      basePriceMinor: null,
      defaultDepositPercent: null,
      addonParentSlug: null,
      compatiblePackageSlugs: null,
      route: "/pricing",
      deliveryWindow: null,
      isFeatured: true,
    },
  ],
  offers: [],
  lastSyncedAt: null,
};

function roundMinor(value: number): number {
  return Math.round(value);
}

function getEligibleItems(
  items: CatalogItem[],
  selectedPackageSlug: string | null,
  selectedAddons: string[],
  selectedQuoteItems: string[],
) {
  const selectedSlugs = [
    ...(selectedPackageSlug ? [selectedPackageSlug] : []),
    ...selectedAddons,
    ...selectedQuoteItems,
  ];

  return selectedSlugs
    .map((slug) => items.find((item) => item.slug === slug))
    .filter((item): item is CatalogItem => Boolean(item));
}

function findOffer(offers: CatalogOffer[], code: string | undefined, items: CatalogItem[]): CatalogOffer | null {
  if (!code) return null;
  const normalized = code.trim().toUpperCase();
  const offer = offers.find((entry) => entry.code === normalized);
  if (!offer) return null;

  const eligibleSubtotal = items
    .filter((item) => {
      if (offer.appliesToKinds?.length && !offer.appliesToKinds.includes(item.kind)) {
        return false;
      }

      return item.basePriceMinor !== null;
    })
    .reduce((sum, item) => sum + (item.basePriceMinor ?? 0), 0);

  return eligibleSubtotal >= offer.minimumOrderMinor ? offer : null;
}

export function buildClientPreview(input: {
  catalog: CatalogResponse;
  selectedPackageSlug: string | null;
  selectedAddons: string[];
  selectedQuoteItems: string[];
  couponCode?: string;
}): PreviewSummary {
  const items = getEligibleItems(
    input.catalog.items,
    input.selectedPackageSlug,
    input.selectedAddons,
    input.selectedQuoteItems,
  );
  const issues: string[] = [];
  const flowMode: CommerceFlowMode =
    items.some((item) => item.checkoutMode === "QUOTE_ONLY" || item.basePriceMinor === null)
      ? "QUOTE_REQUEST"
      : "SELF_SERVE";

  if (!items.length) {
    issues.push("empty_selection");
  }

  if (flowMode === "QUOTE_REQUEST") {
    issues.push("quote_only_item_selected");
  }

  const offer = findOffer(input.catalog.offers, input.couponCode, items);
  const eligibleSubtotal = items
    .filter((item) => {
      if (!offer) return false;
      if (offer.appliesToKinds?.length && !offer.appliesToKinds.includes(item.kind)) return false;
      return item.basePriceMinor !== null;
    })
    .reduce((sum, item) => sum + (item.basePriceMinor ?? 0), 0);

  const totalDiscountMinor =
    !offer
      ? 0
      : offer.discountType === "PERCENTAGE"
        ? roundMinor((eligibleSubtotal * offer.discountValue) / 100)
        : Math.min(offer.discountValue, eligibleSubtotal);

  let discountRemaining = totalDiscountMinor;

  const lines = items.map<PreviewLine>((item, index) => {
    const lineSubtotal = item.basePriceMinor ?? 0;
    const isEligible =
      Boolean(offer) &&
      (!offer?.appliesToKinds?.length || offer.appliesToKinds.includes(item.kind)) &&
      item.basePriceMinor !== null;
    const provisionalDiscount =
      isEligible && offer
        ? offer.discountType === "PERCENTAGE"
          ? roundMinor((lineSubtotal * offer.discountValue) / 100)
          : index === items.length - 1
            ? discountRemaining
            : roundMinor((lineSubtotal / Math.max(eligibleSubtotal, 1)) * totalDiscountMinor)
        : 0;
    const boundedDiscount = Math.min(provisionalDiscount, discountRemaining, lineSubtotal);
    discountRemaining -= boundedDiscount;
    const lineTotal = lineSubtotal - boundedDiscount;

    if (flowMode === "QUOTE_REQUEST") {
      return {
        slug: item.slug,
        label: item.label,
        kind: item.kind,
        billingModel: item.billingModel,
        checkoutMode: item.checkoutMode,
        unitPriceMinor: item.basePriceMinor,
        lineTotalMinor: lineTotal,
        payableTodayMinor: 0,
        remainingAfterTodayMinor: 0,
      };
    }

    const depositPercent = item.billingModel === "ADVANCE" ? item.defaultDepositPercent ?? 100 : 100;
    const payableToday = roundMinor((lineTotal * depositPercent) / 100);

    return {
      slug: item.slug,
      label: item.label,
      kind: item.kind,
      billingModel: item.billingModel,
      checkoutMode: item.checkoutMode,
      unitPriceMinor: item.basePriceMinor,
      lineTotalMinor: lineTotal,
      payableTodayMinor: payableToday,
      remainingAfterTodayMinor: lineTotal - payableToday,
    };
  });

  return {
    flowMode,
    issues,
    subtotalMinor: items.reduce((sum, item) => sum + (item.basePriceMinor ?? 0), 0),
    discountMinor: totalDiscountMinor,
    totalMinor: lines.reduce((sum, line) => sum + line.lineTotalMinor, 0),
    payableTodayMinor: lines.reduce((sum, line) => sum + line.payableTodayMinor, 0),
    remainingAfterTodayMinor: lines.reduce((sum, line) => sum + line.remainingAfterTodayMinor, 0),
    appliedOfferCode: offer?.code ?? null,
    lines,
  };
}

export function formatInr(amountMinor: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amountMinor / 100);
}

export function getApiBaseUrl(): string {
  if (typeof window === "undefined" && process.env.API_URL) {
    return process.env.API_URL;
  }

  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  if (typeof window !== "undefined") {
    if (window.location.hostname === "localhost") {
      return "http://localhost:3001";
    }

    if (window.location.hostname.endsWith("shasvata.com")) {
      return `${window.location.protocol}//api.shasvata.com`;
    }
  }

  return process.env.NODE_ENV === "production" ? "https://api.shasvata.com" : "http://localhost:3001";
}

export async function fetchCatalogForApp(): Promise<CatalogResponse> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/api/commerce/catalog`, {
      cache: "no-store",
    });

    if (response.ok) {
      return (await response.json()) as CatalogResponse;
    }
  } catch {
    // Fall back when API is not reachable during build/local preview.
  }

  return fallbackCatalog;
}

async function readJson<T>(response: Response): Promise<T> {
  if (response.ok) {
    return (await response.json()) as T;
  }

  let message = "Commerce request failed.";

  try {
    const payload = (await response.json()) as { error?: string };
    if (payload.error) {
      message = payload.error;
    }
  } catch {
    // Ignore parse failures and surface the generic message.
  }

  throw new Error(message);
}

export async function createCartForApp(input: {
  selections: Array<{ slug: string; quantity: number }>;
  buyer?: {
    email?: string;
    fullName?: string;
    companyName?: string;
    phone?: string;
  };
  couponCode?: string;
  referralCode?: string;
  notes?: string;
  sourcePage?: string;
  sourceCta?: string;
}): Promise<PortalCart> {
  const response = await fetch(`${getApiBaseUrl()}/api/commerce/carts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  return readJson<PortalCart>(response);
}

export async function createQuoteRequestForApp(input: {
  cartId: string;
  brief?: Record<string, unknown>;
  sourcePage?: string;
}): Promise<PortalCart> {
  const response = await fetch(`${getApiBaseUrl()}/api/commerce/carts/${input.cartId}/quote-requests`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      brief: input.brief,
      sourcePage: input.sourcePage,
    }),
  });

  return readJson<PortalCart>(response);
}

export async function createCheckoutSessionForApp(input: {
  cartId: string;
  returnUrl?: string;
  cancelUrl?: string;
}): Promise<CheckoutSessionResponse> {
  const response = await fetch(`${getApiBaseUrl()}/api/commerce/carts/${input.cartId}/checkout-sessions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      returnUrl: input.returnUrl,
      cancelUrl: input.cancelUrl,
    }),
  });

  return readJson<CheckoutSessionResponse>(response);
}

export async function createCheckoutSessionFromBillingSnapshotForApp(input: {
  billingSnapshotId: string;
  returnUrl?: string;
  cancelUrl?: string;
}): Promise<CheckoutSessionResponse> {
  if (isLocalPortalWorkbenchClientEnabled()) {
    return createWorkbenchCheckoutSessionFromBillingSnapshot(input);
  }

  const response = await fetch(`${getApiBaseUrl()}/api/commerce/checkout-sessions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      billingSnapshotId: input.billingSnapshotId,
      returnUrl: input.returnUrl,
      cancelUrl: input.cancelUrl,
    }),
  });

  return readJson<CheckoutSessionResponse>(response);
}

export async function fetchPortalSummaryForApp(email: string): Promise<PortalSummaryResponse> {
  const response = await fetch(
    `${getApiBaseUrl()}/api/commerce/portal/summary?email=${encodeURIComponent(email)}`,
    {
      cache: "no-store",
    },
  );

  return readJson<PortalSummaryResponse>(response);
}
