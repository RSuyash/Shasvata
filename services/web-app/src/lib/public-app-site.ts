import type { CatalogResponse } from "./commerce";
import { formatInr } from "./commerce";
import { ROUTES } from "./routes";
import {
  groupStorefrontAddons,
  recommendedStorefrontPackageSlug,
  storefrontComparisonRows,
  storefrontGuardrailLines,
  storefrontPackageProfiles,
} from "./storefront-presentation";

type PublicCatalogItem = {
  slug: string;
  label: string;
  summary: string;
  priceLabel: string;
  paymentLabel: string | null;
  kindLabel: string;
  deliveryWindow: string | null;
  route: string | null;
  isFeatured: boolean;
  bestFor: string | null;
  scope: string | null;
  revisions: string | null;
  highlights: string[];
  recommendedLabel: string | null;
};

type PublicPolicySection = {
  title: string;
  body: string;
};

type PublicPageLink = {
  label: string;
  href: string;
};

const publicCatalogSlugPrefix = "landing-page-";

export const publicAppIdentity = {
  name: "Shasvata",
  workspaceLabel: "Client Workspace and Checkout",
  supportEmail: "hello@shasvata.com",
  contactEmail: "contact@shasvata.com",
  supportPhoneLabel: "+91 92846 20279",
  supportPhoneDigits: "919284620279",
  location: "Pune, Maharashtra, India",
} as const;

export const publicPageLinks: PublicPageLink[] = [
  { label: "Products", href: ROUTES.public.products },
  { label: "Contact", href: ROUTES.public.contact },
  { label: "Terms", href: ROUTES.public.terms },
  { label: "Privacy", href: ROUTES.public.privacy },
  { label: "Refunds", href: ROUTES.public.refunds },
] as const;

export const publicTermsSections: PublicPolicySection[] = [
  {
    title: "Nature of the workspace",
    body: "shasvata.com/app is the client workspace and billing surface used by Shasvata for productized services, checkout, onboarding, project visibility, and commercial communication.",
  },
  {
    title: "Productized services",
    body: "Products shown in this workspace are service packages sold in INR. Package scope, included revision rounds within the approved direction, add-ons, payment terms, and delivery timelines are shown on the relevant product pages.",
  },
  {
    title: "Custom scope",
    body: "Some services use a quote-first flow instead of instant checkout. In those cases, pricing and delivery terms are finalized only after scope review and written confirmation.",
  },
  {
    title: "Client responsibilities",
    body: "Clients are responsible for providing accurate business, billing, and project information, along with the content, assets, and approvals required to deliver the purchased scope.",
  },
  {
    title: "Support and contact",
    body: `Questions about these terms can be sent to ${publicAppIdentity.supportEmail}.`,
  },
] as const;

export const publicPrivacySections: PublicPolicySection[] = [
  {
    title: "Information we collect",
    body: "We collect the information needed to sell, bill, and deliver Shasvata services, including contact details, company details, package selections, payment references, and project onboarding responses.",
  },
  {
    title: "How we use it",
    body: "We use this data to operate checkout, recover abandoned drafts, send billing updates, deliver purchased work, coordinate internal assignments, and provide client support.",
  },
  {
    title: "Payments and billing",
    body: "Payment processing is handled through approved payment partners. We store commercial and project records needed for support, fulfillment, and finance reconciliation.",
  },
  {
    title: "Retention and deletion",
    body: `Commercial and delivery records are retained for business, finance, and support needs. Privacy-related requests can be sent to ${publicAppIdentity.supportEmail}.`,
  },
] as const;

export const publicRefundSections: PublicPolicySection[] = [
  {
    title: "Standard package purchases",
    body: "For fixed-scope packages purchased through the workspace, cancellation requests are reviewed before active production or onboarding begins. Once production work, onboarding review, or revision handling has materially started, the order may become non-refundable.",
  },
  {
    title: "Custom and quote-led work",
    body: "Custom-scope, quote-first, or negotiated engagements follow the commercial terms approved for that specific scope. Those terms override generic package rules where applicable.",
  },
  {
    title: "Duplicate or failed payments",
    body: "If a payment fails, duplicates, or is charged incorrectly, Shasvata will review the transaction and coordinate correction or refund processing where appropriate.",
  },
  {
    title: "Processing timeline",
    body: `For approved refunds, processing timelines depend on the payment partner and the customer bank. Questions can be sent to ${publicAppIdentity.supportEmail}.`,
  },
] as const;

export const publicContactCards = [
  {
    title: "Billing and support",
    value: publicAppIdentity.supportEmail,
    href: `mailto:${publicAppIdentity.supportEmail}`,
    detail: "Commercial questions, billing clarifications, and payment follow-up.",
  },
  {
    title: "General enquiries",
    value: publicAppIdentity.contactEmail,
    href: `mailto:${publicAppIdentity.contactEmail}`,
    detail: "New sales conversations, onboarding questions, and service discovery.",
  },
  {
    title: "WhatsApp",
    value: publicAppIdentity.supportPhoneLabel,
    href: `https://wa.me/${publicAppIdentity.supportPhoneDigits}`,
    detail: "Fast coordination when a launch, billing review, or delivery handoff is time-sensitive.",
  },
] as const;

function isLandingPageStorefrontItem(slug: string) {
  return slug.startsWith(publicCatalogSlugPrefix);
}

function toPublicCatalogItem(item: CatalogResponse["items"][number]): PublicCatalogItem {
  const packageProfile =
    item.kind === "PACKAGE" &&
    Object.prototype.hasOwnProperty.call(storefrontPackageProfiles, item.slug)
      ? storefrontPackageProfiles[item.slug as keyof typeof storefrontPackageProfiles]
      : null;

  const paymentLabel =
    item.basePriceMinor === null
      ? null
      : item.slug === "landing-page-starter"
        ? "60% advance / 40% before final handover or launch"
        : item.slug === "landing-page-growth"
          ? "50% advance / 50% before final handover or launch"
          : item.slug === "landing-page-premium"
            ? "50% advance / 30% on design approval / 20% before final handover or launch"
            : item.checkoutMode === "QUOTE_ONLY"
              ? "Quoted and approved before billing"
              : item.billingModel === "ADVANCE" && item.defaultDepositPercent
                ? `Pay ${item.defaultDepositPercent}% upfront`
                : item.billingModel === "FULL"
                  ? "Paid in full"
                  : null;

  return {
    slug: item.slug,
    label: item.label,
    summary: item.summary,
    priceLabel:
      item.basePriceMinor === null ? "Quote first" : formatInr(item.basePriceMinor),
    paymentLabel,
    kindLabel:
      item.kind === "PACKAGE"
        ? "Package"
        : item.kind === "ADDON"
          ? "Add-on"
          : "Custom scope",
    deliveryWindow: item.deliveryWindow ?? null,
    route: item.route ?? null,
    isFeatured: item.isFeatured,
    bestFor: packageProfile?.bestFor ?? null,
    scope: packageProfile?.scope ?? null,
    revisions: packageProfile?.revisions ?? null,
    highlights: packageProfile?.highlights ?? [],
    recommendedLabel:
      item.slug === recommendedStorefrontPackageSlug
        ? storefrontPackageProfiles[recommendedStorefrontPackageSlug].recommendedLabel ?? null
        : null,
  };
}

export function buildPublicCatalogSections(catalog: CatalogResponse) {
  const items = catalog.items
    .filter((item) => isLandingPageStorefrontItem(item.slug))
    .map(toPublicCatalogItem);

  return {
    packages: items.filter((item) => item.kindLabel === "Package"),
    addons: items.filter((item) => item.kindLabel === "Add-on"),
    customScopes: items.filter((item) => item.kindLabel === "Custom scope"),
    recommendedPackage:
      items.find((item) => item.slug === recommendedStorefrontPackageSlug) ?? null,
    comparisonRows: storefrontComparisonRows,
    guardrailLines: [...storefrontGuardrailLines],
    addonGroups: groupStorefrontAddons(items.filter((item) => item.kindLabel === "Add-on")),
  };
}

function normalizeBaseUrl(baseUrl: string) {
  return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
}

export function buildWhitelistingChecklist(baseUrl: string) {
  const normalized = normalizeBaseUrl(baseUrl);

  return [
    `${normalized}${ROUTES.public.home}`,
    `${normalized}${ROUTES.public.products}`,
    `${normalized}${ROUTES.public.contact}`,
    `${normalized}${ROUTES.public.terms}`,
    `${normalized}${ROUTES.public.privacy}`,
    `${normalized}${ROUTES.public.refunds}`,
  ];
}
