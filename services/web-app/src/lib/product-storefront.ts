import type { CatalogItem, CatalogResponse, PortalCart } from "./commerce";

const landingPagePackageSlugs = [
  "landing-page-starter",
  "landing-page-growth",
  "landing-page-premium",
] as const;

const landingPageAddonSlugs = [
  "landing-page-copywriting",
  "landing-page-email-updates",
  "landing-page-tracking",
  "landing-page-extra-section",
  "landing-page-extra-page",
  "landing-page-crm-integration",
  "landing-page-priority-delivery",
  "landing-page-major-revision",
  "landing-page-revision-bundle",
  "landing-page-compliance-pack",
  "landing-page-monthly-support",
] as const;

const landingPageQuoteSlugs = [
  "landing-page-custom-redesign",
  "landing-page-builder-launch-suite",
] as const;

const legacySlugAliases: Record<string, string> = {
  "launchpad-website": "landing-page-growth",
  "tracking-layer": "landing-page-tracking",
  "reporting-cockpit": "landing-page-email-updates",
};

const landingPageSlugs = new Set<string>([
  ...landingPagePackageSlugs,
  ...landingPageAddonSlugs,
  ...landingPageQuoteSlugs,
]);

function readFirstValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function normalizeSlug(slug: string): string {
  return legacySlugAliases[slug] ?? slug;
}

function readSlugList(value: string | string[] | undefined) {
  return Array.from(
    new Set(
      readFirstValue(value)
        .split(",")
        .map((slug) => normalizeSlug(slug.trim()))
        .filter(Boolean),
    ),
  );
}

export function readStorefrontSelection(input: Record<string, string | string[] | undefined>) {
  return {
    packageSlug: normalizeSlug(readFirstValue(input["package"])) || null,
    addonSlugs: readSlugList(input["addons"]),
    quoteSlugs: readSlugList(input["quotes"]),
    couponCode: readFirstValue(input["coupon"]).trim().toUpperCase(),
    referralCode: readFirstValue(input["ref"]).trim().toUpperCase(),
  };
}

export function readStorefrontPaymentState(
  input: Record<string, string | string[] | undefined>,
) {
  const payment = readFirstValue(input["payment"]).trim().toLowerCase();
  const cartId = readFirstValue(input["cartId"]).trim();

  if (payment === "return" && cartId) {
    return {
      kind: "return" as const,
      cartId,
    };
  }

  if (payment === "cancelled") {
    return {
      kind: "cancelled" as const,
      cartId: cartId || null,
    };
  }

  return {
    kind: null,
    cartId: null,
  };
}

export function getStorefrontRecoveryAction(cart: PortalCart) {
  if (
    cart.flowMode === "SELF_SERVE" &&
    (cart.status === "PAID" || cart.latestCheckoutSession?.status === "PAID")
  ) {
    return {
      kind: "onboarding" as const,
      label: "Continue onboarding",
      detail: "Payment is already captured, so the next step is the delivery brief.",
    };
  }

  if (
    cart.flowMode === "SELF_SERVE" &&
    (cart.status === "CHECKOUT_READY" ||
      cart.status === "CHECKOUT_PENDING" ||
      cart.latestCheckoutSession?.status === "CREATED" ||
      cart.latestCheckoutSession?.status === "ACTION_REQUIRED")
  ) {
    return {
      kind: "checkout" as const,
      label: "Resume payment",
      detail: "This draft is still waiting for payment, so we should reopen checkout.",
    };
  }

  if (cart.flowMode === "QUOTE_REQUEST") {
    return {
      kind: "quote" as const,
      label: "Quote in review",
      detail:
        "This scope is still with the team for pricing, so no payment action should show yet.",
    };
  }

  return {
    kind: "none" as const,
    label: null,
    detail: null,
  };
}

export function filterLandingPageCatalog(catalog: CatalogResponse): CatalogResponse {
  return {
    ...catalog,
    items: catalog.items.filter((item) => landingPageSlugs.has(item.slug)),
  };
}

export function buildStorefrontRedirectTarget(
  pathname: string,
  searchParams: Record<string, string | string[] | undefined>,
) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (Array.isArray(value)) {
      for (const entry of value) {
        params.append(key, entry);
      }
      continue;
    }

    if (value) {
      params.set(key, value);
    }
  }

  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function getCatalogItemBySlug(items: CatalogItem[], slug: string | null) {
  if (!slug) {
    return null;
  }

  return items.find((item) => item.slug === slug) ?? null;
}
