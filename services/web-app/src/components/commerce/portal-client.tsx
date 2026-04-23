"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type Dispatch,
  type SetStateAction,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { ClientPortalKpiCard } from "@/components/client-portal/client-portal-kpi-card";
import {
  ClientPortalSectionCard,
  ClientPortalStatusPill,
} from "@/components/client-portal/client-portal-panels";
import {
  buildClientPreview,
  createCartForApp,
  createCheckoutSessionForApp,
  createQuoteRequestForApp,
  fetchPortalSummaryForApp,
  formatInr,
  type CatalogResponse,
  type CheckoutSessionResponse,
  type PortalCart,
  type PortalSummaryResponse,
} from "@/lib/commerce";
import { launchCashfreeCheckout } from "@/lib/cashfree-checkout";
import { resolveProjectOnboardingForApp } from "@/lib/landing-portal";
import { getStorefrontRecoveryAction } from "@/lib/product-storefront";
import { ROUTES } from "@/lib/routes";
import {
  groupStorefrontAddons,
  recommendedStorefrontPackageSlug,
  storefrontComparisonRows,
  storefrontGuardrailLines,
  storefrontPackageProfiles,
  type StorefrontPackageSlug,
} from "@/lib/storefront-presentation";
import { formatMoneyMinor } from "@/lib/utils";

type PortalClientProps = {
  catalog: CatalogResponse;
  initialSelection: {
    packageSlug: string | null;
    addonSlugs: string[];
    quoteSlugs: string[];
    couponCode: string;
    referralCode: string;
  };
  initialBuyer?: {
    fullName?: string | null;
    email?: string | null;
    companyName?: string | null;
  };
  initialNotice?: string | null;
};

type BuyerDraft = {
  fullName: string;
  email: string;
  companyName: string;
  phone: string;
};

type PackageProfile = {
  bestFor: string;
  scope: string;
  revisions: string;
  timeline: string;
  features: string[];
  includedAddons?: string[];
};

const PRODUCTS_ROUTE = ROUTES.dashboard.products;

const emptyBuyer: BuyerDraft = {
  fullName: "",
  email: "",
  companyName: "",
  phone: "",
};

const packageProfiles: Record<string, PackageProfile> = {
  "landing-page-starter": {
    bestFor: "Simple launches, local businesses, founders",
    scope: "One custom landing page, up to 6 structured sections",
    revisions: "1 revision round within the approved direction",
    timeline: "3–5 business days",
    features: [
      "One lead capture form, thank-you state, and standard CTA placement",
      "Privacy, terms, refunds, and contact/support pages included",
      "60% advance / 40% before final handover or launch",
    ],
  },
  "landing-page-growth": {
    bestFor: "Paid ads, service businesses, real-estate lead-gen",
    scope: "One custom landing page, up to 10 structured sections",
    revisions: "2 revision rounds within the approved direction",
    timeline: "5–7 business days",
    features: [
      "Conversion-first structure with trust, offer, CTA flow, and objection handling",
      "Basic routing to one agreed destination plus tracking-ready script placement",
      "50% advance / 50% before final handover or launch",
    ],
  },
  "landing-page-premium": {
    bestFor: "Higher-ticket funnels, operator teams, paid-traffic systems",
    scope: "One premium landing page, up to 12 structured sections",
    revisions: "2 revision rounds within the approved direction",
    timeline: "7–12 business days",
    features: [
      "Message architecture, operational routing, and conversion action mapping",
      "One post-launch optimization pass and a 14-day support window",
      "50% advance / 30% on design approval / 20% before final handover or launch",
    ],
  },
};

function dedupe(items: string[]) {
  return Array.from(new Set(items.filter(Boolean)));
}

function buildBuyerSeed(initialBuyer?: PortalClientProps["initialBuyer"]): BuyerDraft {
  return {
    fullName: initialBuyer?.fullName?.trim() || "",
    email: initialBuyer?.email?.trim().toLowerCase() || "",
    companyName: initialBuyer?.companyName?.trim() || "",
    phone: "",
  };
}

function buildBuyerPayload(buyer: BuyerDraft) {
  return {
    fullName: buyer.fullName.trim() || undefined,
    email: buyer.email.trim().toLowerCase() || undefined,
    companyName: buyer.companyName.trim() || undefined,
    phone: buyer.phone.trim() || undefined,
  };
}

function buildSelectionPayload(
  selectedPackageSlug: string | null,
  selectedAddons: string[],
  selectedQuoteItems: string[],
) {
  return [
    ...(selectedPackageSlug ? [{ slug: selectedPackageSlug, quantity: 1 }] : []),
    ...selectedAddons.map((slug) => ({ slug, quantity: 1 })),
    ...selectedQuoteItems.map((slug) => ({ slug, quantity: 1 })),
  ];
}

function getReturnUrl(cartId: string) {
  if (typeof window === "undefined") {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  return `${window.location.origin}${PRODUCTS_ROUTE}?payment=return&cartId=${encodeURIComponent(cartId)}`;
}

function getCancelUrl(cartId: string) {
  if (typeof window === "undefined") {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  return `${window.location.origin}${PRODUCTS_ROUTE}?payment=cancelled&cartId=${encodeURIComponent(cartId)}`;
}

function setBuyerField(
  setBuyer: Dispatch<SetStateAction<BuyerDraft>>,
  field: keyof BuyerDraft,
  value: string,
) {
  setBuyer((current) => ({
    ...current,
    [field]: value,
  }));
}

function formatStatus(status: string) {
  return status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (value) => value.toUpperCase());
}

const fieldClassName =
  "mt-2 w-full rounded-[18px] border px-4 py-3 text-sm outline-none transition";

export function PortalClient({
  catalog,
  initialSelection,
  initialBuyer,
  initialNotice,
}: PortalClientProps) {
  const router = useRouter();
  const packages = catalog.items.filter((item) => item.kind === "PACKAGE");
  const addons = catalog.items.filter((item) => item.kind === "ADDON");
  const quoteOnlyItems = catalog.items.filter((item) => item.kind === "QUOTE_ONLY");

  const [selectedPackageSlug, setSelectedPackageSlug] = useState<string | null>(
    initialSelection.packageSlug,
  );
  const [selectedAddons, setSelectedAddons] = useState<string[]>(
    dedupe(initialSelection.addonSlugs),
  );
  const [selectedQuoteItems, setSelectedQuoteItems] = useState<string[]>(
    dedupe(initialSelection.quoteSlugs),
  );
  const [couponCode, setCouponCode] = useState(initialSelection.couponCode);
  const [referralCode, setReferralCode] = useState(initialSelection.referralCode);
  const [buyer, setBuyer] = useState<BuyerDraft>(buildBuyerSeed(initialBuyer));
  const [notes, setNotes] = useState("");
  const [projectGoals, setProjectGoals] = useState("");
  const [serverCart, setServerCart] = useState<PortalCart | null>(null);
  const [checkoutSession, setCheckoutSession] =
    useState<CheckoutSessionResponse | null>(null);
  const [portalSummary, setPortalSummary] = useState<PortalSummaryResponse | null>(null);
  const [feedback, setFeedback] = useState<string | null>(initialNotice ?? null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedPackage =
    packages.find((item) => item.slug === selectedPackageSlug) ?? null;
  const selectedPackageProfile = selectedPackageSlug
    ? storefrontPackageProfiles[selectedPackageSlug as StorefrontPackageSlug] ?? null
    : null;
  const includedAddons = useMemo(() => new Set<string>(), []);
  const availableAddons = addons.filter((item) => {
    if (!selectedPackageSlug) {
      return false;
    }

    if (!item.compatiblePackageSlugs?.length) {
      return true;
    }

    return item.compatiblePackageSlugs.includes(selectedPackageSlug);
  });

  useEffect(() => {
    if (!selectedPackageSlug) {
      setSelectedAddons([]);
      return;
    }

    setSelectedAddons((current) =>
      current.filter((slug) => {
        if (includedAddons.has(slug)) {
          return false;
        }

        return addons.some(
          (item) =>
            item.slug === slug &&
            item.compatiblePackageSlugs?.includes(selectedPackageSlug),
        );
      }),
    );
  }, [addons, includedAddons, selectedPackageSlug]);

  const preview = buildClientPreview({
    catalog,
    selectedPackageSlug,
    selectedAddons,
    selectedQuoteItems,
    couponCode: couponCode.trim() || referralCode.trim(),
  });
  const latestKnownCart = serverCart ?? portalSummary?.carts[0] ?? null;
  const groupedAvailableAddons = useMemo(
    () => groupStorefrontAddons(availableAddons),
    [availableAddons],
  );
  const selectedLineCount = preview.lines.length;
  const canCreateDraft =
    Boolean(buyer.email.trim()) &&
    (Boolean(selectedPackageSlug) || selectedQuoteItems.length > 0);
  const canPayNow =
    Boolean(selectedPackageSlug) &&
    preview.flowMode === "SELF_SERVE" &&
    preview.issues.length === 0 &&
    Boolean(buyer.email.trim());
  const canRequestQuote =
    Boolean(buyer.email.trim()) &&
    (selectedQuoteItems.length > 0 || preview.flowMode === "QUOTE_REQUEST");

  useEffect(() => {
    if (!initialBuyer?.email) {
      return;
    }

    void refreshPortalSummary(initialBuyer.email).catch(() => null);
  }, [initialBuyer?.email]);

  async function refreshPortalSummary(email: string) {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      return;
    }

    const summary = await fetchPortalSummaryForApp(trimmedEmail);
    setPortalSummary(summary);
  }

  async function createDraft(sourceCta: string): Promise<PortalCart> {
    const selections = buildSelectionPayload(
      selectedPackageSlug,
      selectedAddons,
      selectedQuoteItems,
    );

    if (!selectedPackageSlug && !selectedQuoteItems.length) {
      throw new Error("Choose a landing page package or a custom scope before continuing.");
    }

    if (!buyer.email.trim()) {
      throw new Error("Buyer email is required so we can recover the draft and payment trail later.");
    }

    const cart = await createCartForApp({
      selections,
      buyer: buildBuyerPayload(buyer),
      couponCode: couponCode.trim() || undefined,
      referralCode: referralCode.trim() || undefined,
      notes: notes.trim() || undefined,
      sourcePage: PRODUCTS_ROUTE,
      sourceCta,
    });

    setServerCart(cart);
    await refreshPortalSummary(buyer.email);
    return cart;
  }

  function runAction(action: () => Promise<void>) {
    setError(null);
    setFeedback(null);

    startTransition(() => {
      void action().catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Commerce request failed.");
      });
    });
  }

  function toggleAddon(slug: string) {
    setSelectedAddons((current) =>
      current.includes(slug)
        ? current.filter((entry) => entry !== slug)
        : [...current, slug],
    );
  }

  function toggleQuoteItem(slug: string) {
    setSelectedQuoteItems((current) =>
      current.includes(slug)
        ? current.filter((entry) => entry !== slug)
        : [...current, slug],
    );
  }

  const quoteBrief = {
    goals: projectGoals.trim() || undefined,
    notes: notes.trim() || undefined,
    requestedPackage: selectedPackageSlug,
    selectedAddons,
    selectedQuoteItems,
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-4">
        <ClientPortalKpiCard
          label="Selected package"
          value={selectedPackage?.label || "Choose one"}
          detail={
            selectedPackageProfile?.bestFor ||
            "Pick the base build first, then layer add-ons."
          }
          tone="indigo"
        />
        <ClientPortalKpiCard
          label="Pay today"
          value={formatMoneyMinor(preview.payableTodayMinor)}
          detail={
            preview.flowMode === "SELF_SERVE"
              ? "Ready for secure checkout once the buyer details are filled."
              : "Quote-first selections pause payment until pricing is approved."
          }
          tone="blue"
        />
        <ClientPortalKpiCard
          label="Revisions"
          value={selectedPackageProfile?.revisions || "Package dependent"}
          detail="Revision packs and major changes can be bought cleanly instead of handled ad hoc."
          tone="cyan"
        />
        <ClientPortalKpiCard
          label="Timeline"
          value={selectedPackageProfile?.timeline || "Package dependent"}
          detail={
            selectedPackageProfile?.scope ||
            "Scope and delivery window update from the chosen package."
          }
          tone="slate"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.24fr_0.76fr]">
        <div className="space-y-6">
          <ClientPortalSectionCard
            title="Landing Page Packages"
            subtitle="Start with the tier that matches the real commercial need, then layer only the extras that actually improve the launch."
          >
            <div className="grid gap-4 xl:grid-cols-3">
              {packages.map((item) => {
                const selected = item.slug === selectedPackageSlug;
                const profile =
                  storefrontPackageProfiles[item.slug as StorefrontPackageSlug] ?? null;

                return (
                  <button
                    key={item.slug}
                    type="button"
                    onClick={() => setSelectedPackageSlug(selected ? null : item.slug)}
                    className="rounded-[26px] border p-5 text-left transition hover:-translate-y-0.5"
                    style={{
                      borderColor: selected
                        ? "var(--portal-accent-border)"
                        : "var(--portal-border)",
                      background: selected
                        ? "var(--portal-elevated)"
                        : "var(--portal-card)",
                      boxShadow: selected
                        ? "var(--portal-elevated-shadow)"
                        : "var(--portal-shadow)",
                    }}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <ClientPortalStatusPill
                          label={item.isFeatured ? "Featured" : "Package"}
                          tone={item.isFeatured ? "indigo" : "neutral"}
                        />
                        {item.slug === recommendedStorefrontPackageSlug ? (
                          <ClientPortalStatusPill label="Recommended" tone="success" />
                        ) : null}
                      </div>
                      <span className="text-sm font-semibold text-[var(--portal-muted)]">
                        {profile?.timeline || item.deliveryWindow || "Timeline pending"}
                      </span>
                    </div>

                    <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-[var(--portal-foreground)]">
                      {item.label}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-[var(--portal-muted)]">
                      {item.summary}
                    </p>

                    <div className="mt-4 flex items-end justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.22em] text-[var(--portal-muted)]">
                          Best for
                        </p>
                        <p className="mt-1 text-sm font-semibold text-[var(--portal-foreground)]">
                          {profile?.bestFor || "Client launches"}
                        </p>
                      </div>
                      <p className="text-2xl font-semibold tracking-[-0.04em] text-[var(--portal-foreground)]">
                        {formatInr(item.basePriceMinor ?? 0)}
                      </p>
                    </div>

                    <div
                      className="mt-4 rounded-[18px] border px-3 py-3 text-sm"
                      style={{
                        borderColor: "var(--portal-border)",
                        background: "var(--portal-surface-soft)",
                        color: "var(--portal-foreground)",
                      }}
                    >
                      {profile?.paymentTerms || "Payment terms confirmed before checkout."}
                    </div>

                    <div className="mt-5 space-y-2">
                      {profile?.highlights.map((feature) => (
                        <div
                          key={feature}
                          className="rounded-[18px] border px-3 py-2 text-sm text-[var(--portal-muted)]"
                          style={{
                            borderColor: "var(--portal-border)",
                            background: "var(--portal-surface-soft)",
                          }}
                        >
                          {feature}
                        </div>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>

            <div
              className="mt-5 overflow-hidden rounded-[22px] border"
              style={{
                borderColor: "var(--portal-border)",
                background: "var(--portal-card)",
              }}
            >
              <div
                className="grid grid-cols-[1.15fr_repeat(3,minmax(0,1fr))]"
                style={{ background: "var(--portal-surface-soft)" }}
              >
                <div className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--portal-muted)]">
                  What changes
                </div>
                {packages.map((item) => (
                  <div
                    key={`comparison-head-${item.slug}`}
                    className="border-l px-4 py-3 text-sm font-semibold text-[var(--portal-foreground)]"
                    style={{ borderColor: "var(--portal-border)" }}
                  >
                    {item.label}
                  </div>
                ))}
              </div>
              {storefrontComparisonRows.map((row) => (
                <div
                  key={row.label}
                  className="grid grid-cols-[1.15fr_repeat(3,minmax(0,1fr))]"
                >
                  <div className="px-4 py-3 text-sm font-semibold text-[var(--portal-foreground)]">
                    {row.label}
                  </div>
                  {packages.map((item) => (
                    <div
                      key={`${row.label}-${item.slug}`}
                      className="border-l px-4 py-3 text-sm leading-6 text-[var(--portal-muted)]"
                      style={{ borderColor: "var(--portal-border)" }}
                    >
                      {row.values[item.slug as "landing-page-starter" | "landing-page-growth" | "landing-page-premium"]}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </ClientPortalSectionCard>

          <ClientPortalSectionCard
            title="Add-ons, Integrations, and Revision Packs"
            subtitle="This layer keeps the upsells structured: extra scope, deeper tracking, faster delivery, and revision commerce."
          >
            {selectedPackageSlug ? (
              <div className="space-y-5">
                {groupedAvailableAddons.map((group) => (
                  <div key={group.label} className="space-y-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--portal-muted)]">
                        {group.label}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-[var(--portal-muted)]">
                        {group.description}
                      </p>
                    </div>
                    <div className="grid gap-4 xl:grid-cols-2">
                      {group.items.map((item) => {
                        const isIncluded = includedAddons.has(item.slug);
                        const checked = isIncluded || selectedAddons.includes(item.slug);

                        return (
                          <label
                            key={item.slug}
                            className="rounded-[22px] border p-4 transition"
                            style={{
                              borderColor: checked
                                ? "var(--portal-accent-border)"
                                : "var(--portal-border)",
                              background: checked
                                ? "var(--portal-elevated)"
                                : "var(--portal-card)",
                              boxShadow: checked
                                ? "var(--portal-elevated-shadow)"
                                : "var(--portal-shadow)",
                              cursor: isIncluded ? "default" : "pointer",
                            }}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex gap-3">
                                <input
                                  checked={checked}
                                  className="mt-1 h-4 w-4 accent-[#5347CE]"
                                  disabled={isIncluded}
                                  onChange={() => toggleAddon(item.slug)}
                                  type="checkbox"
                                />
                                <div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <p className="text-base font-semibold text-[var(--portal-foreground)]">
                                      {item.label}
                                    </p>
                                    {isIncluded ? (
                                      <ClientPortalStatusPill label="Included" tone="success" />
                                    ) : null}
                                  </div>
                                  <p className="mt-2 text-sm leading-6 text-[var(--portal-muted)]">
                                    {item.summary}
                                  </p>
                                </div>
                              </div>
                              <span className="text-sm font-semibold text-[var(--portal-foreground)]">
                                {isIncluded ? "Included" : formatInr(item.basePriceMinor ?? 0)}
                              </span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
                <div
                  className="rounded-[18px] border px-4 py-3 text-sm"
                  style={{
                    borderColor: "var(--portal-tone-warning-text)",
                    background: "var(--portal-tone-warning-bg)",
                    color: "var(--portal-tone-warning-text)",
                  }}
                >
                  {storefrontGuardrailLines[0]}
                </div>
              </div>
            ) : (
              <div
                className="rounded-[24px] border border-dashed px-5 py-10 text-center text-sm"
                style={{
                  borderColor: "var(--portal-border)",
                  color: "var(--portal-muted)",
                }}
              >
                Pick the base package first, then the app unlocks compatible add-ons and revision packs.
              </div>
            )}
          </ClientPortalSectionCard>

          <ClientPortalSectionCard
            title="Custom Scope"
            subtitle="Some work should shift into quote-first mode instead of pretending every project belongs in one-click ecommerce."
          >
            <div className="grid gap-4 xl:grid-cols-2">
              {quoteOnlyItems.map((item) => {
                const checked = selectedQuoteItems.includes(item.slug);

                return (
                  <button
                    key={item.slug}
                    type="button"
                    onClick={() => toggleQuoteItem(item.slug)}
                    className="rounded-[22px] border p-5 text-left transition hover:-translate-y-0.5"
                    style={{
                      borderColor: checked
                        ? "var(--portal-tone-warning-text)"
                        : "var(--portal-border)",
                      background: checked
                        ? "var(--portal-tone-warning-bg)"
                        : "var(--portal-card)",
                      boxShadow: checked
                        ? "var(--portal-elevated-shadow)"
                        : "var(--portal-shadow)",
                    }}
                  >
                    <ClientPortalStatusPill label="Quote first" tone="warning" />
                    <h3 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-[var(--portal-foreground)]">
                      {item.label}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-[var(--portal-muted)]">
                      {item.summary}
                    </p>
                  </button>
                );
              })}
            </div>
          </ClientPortalSectionCard>
        </div>
        <div className="space-y-6">
          <ClientPortalSectionCard
            title="Checkout Summary"
            subtitle="The payment flow stays clean: package, add-ons, offer, then a recoverable draft before secure checkout."
            action={
              preview.flowMode === "SELF_SERVE" ? (
                <ClientPortalStatusPill label="Self serve" tone="success" />
              ) : (
                <ClientPortalStatusPill label="Quote flow" tone="warning" />
              )
            }
          >
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <div
                  className="rounded-[20px] border p-4"
                  style={{
                    borderColor: "var(--portal-border)",
                    background: "var(--portal-surface-soft)",
                  }}
                >
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--portal-muted)]">
                    Lines selected
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-[var(--portal-foreground)]">
                    {selectedLineCount}
                  </p>
                </div>
                <div
                  className="rounded-[20px] border p-4"
                  style={{
                    borderColor: "var(--portal-border)",
                    background: "var(--portal-surface-soft)",
                  }}
                >
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--portal-muted)]">
                    Total package value
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-[var(--portal-foreground)]">
                    {formatMoneyMinor(preview.totalMinor)}
                  </p>
                </div>
                <div
                  className="rounded-[20px] border p-4"
                  style={{
                    borderColor: "var(--portal-border)",
                    background: "var(--portal-surface-soft)",
                  }}
                >
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--portal-muted)]">
                    Remaining later
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-[var(--portal-foreground)]">
                    {formatMoneyMinor(preview.remainingAfterTodayMinor)}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {preview.lines.length ? (
                  preview.lines.map((line) => (
                    <div
                      key={line.slug}
                      className="flex flex-wrap items-start justify-between gap-3 rounded-[20px] border px-4 py-3"
                      style={{
                        borderColor: "var(--portal-border)",
                        background: "var(--portal-card)",
                      }}
                    >
                      <div>
                        <p className="text-sm font-semibold text-[var(--portal-foreground)]">
                          {line.label}
                        </p>
                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[var(--portal-muted)]">
                          {line.kind.replace("_", " ")} · {line.checkoutMode}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-[var(--portal-foreground)]">
                          {formatMoneyMinor(line.lineTotalMinor)}
                        </p>
                        <p className="mt-1 text-xs text-[var(--portal-muted)]">
                          Today {formatMoneyMinor(line.payableTodayMinor)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div
                    className="rounded-[20px] border border-dashed px-4 py-6 text-sm text-[var(--portal-muted)]"
                    style={{ borderColor: "var(--portal-border)" }}
                  >
                    Start with a package or a custom-scope item and the commercial summary will build itself here.
                  </div>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm">
                  <span className="font-medium text-[var(--portal-foreground)]">Coupon code</span>
                  <input
                    value={couponCode}
                    onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
                    placeholder="NAYA10"
                    className={fieldClassName}
                    style={{
                      borderColor: "var(--portal-border)",
                      background: "var(--portal-surface-soft)",
                      color: "var(--portal-foreground)",
                    }}
                  />
                </label>
                <label className="text-sm">
                  <span className="font-medium text-[var(--portal-foreground)]">Referral code</span>
                  <input
                    value={referralCode}
                    onChange={(event) => setReferralCode(event.target.value.toUpperCase())}
                    placeholder="Optional"
                    className={fieldClassName}
                    style={{
                      borderColor: "var(--portal-border)",
                      background: "var(--portal-surface-soft)",
                      color: "var(--portal-foreground)",
                    }}
                  />
                </label>
              </div>

              {preview.appliedOfferCode ? (
                <div className="flex flex-wrap items-center gap-3 rounded-[18px] bg-[var(--portal-tone-success-bg)] px-4 py-3">
                  <ClientPortalStatusPill
                    label={`Applied ${preview.appliedOfferCode}`}
                    tone="success"
                  />
                  <p className="text-sm text-[var(--portal-tone-success-text)]">
                    Savings locked in preview: {formatMoneyMinor(preview.discountMinor)}
                  </p>
                </div>
              ) : null}

              {preview.issues.length ? (
                <div className="space-y-2 rounded-[18px] bg-[var(--portal-tone-warning-bg)] px-4 py-4">
                  {preview.issues.map((issue) => (
                    <p
                      key={issue}
                      className="text-sm leading-6 text-[var(--portal-tone-warning-text)]"
                    >
                      {issue}
                    </p>
                  ))}
                </div>
              ) : null}

              {error ? (
                <div className="rounded-[18px] bg-[rgba(220,38,38,0.12)] px-4 py-3 text-sm text-[#FCA5A5]">
                  {error}
                </div>
              ) : null}

              {feedback ? (
                <div className="rounded-[18px] bg-[var(--portal-tone-blue-bg)] px-4 py-3 text-sm text-[var(--portal-tone-blue-text)]">
                  {feedback}
                </div>
              ) : null}

              <div className="grid gap-3">
                <button
                  type="button"
                  disabled={isPending || !canPayNow}
                  onClick={() =>
                    runAction(async () => {
                      const cart = await createDraft("storefront-pay-now");
                      const session = await createCheckoutSessionForApp({
                        cartId: cart.id,
                        returnUrl: getReturnUrl(cart.id),
                        cancelUrl: getCancelUrl(cart.id),
                      });
                      setCheckoutSession(session);
                      await refreshPortalSummary(buyer.email);
                      if (session.environment === "MOCK") {
                        setFeedback(
                          "Checkout session is ready, but Cashfree is still in mock mode here.",
                        );
                        return;
                      }

                      setFeedback("Secure payment session created. Redirecting to checkout...");
                      await launchCashfreeCheckout(session);
                    })
                  }
                  className="inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--portal-tone-indigo) 0%, var(--portal-tone-blue) 100%)",
                  }}
                >
                  {isPending ? "Preparing checkout..." : "Continue to payment"}
                </button>

                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    disabled={isPending || !canCreateDraft}
                    onClick={() =>
                      runAction(async () => {
                        const cart = await createDraft("storefront-save-draft");
                        setFeedback(
                          `Draft ${cart.id.slice(0, 8)} saved. Use the same buyer email to resume later.`,
                        );
                      })
                    }
                    className="inline-flex items-center justify-center rounded-full border px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
                    style={{
                      borderColor: "var(--portal-border)",
                      color: "var(--portal-foreground)",
                      background: "var(--portal-surface-soft)",
                    }}
                  >
                    Save draft
                  </button>
                  <button
                    type="button"
                    disabled={isPending || !canRequestQuote}
                    onClick={() =>
                      runAction(async () => {
                        const cart = await createDraft("storefront-request-quote");
                        const updatedCart = await createQuoteRequestForApp({
                          cartId: cart.id,
                          brief: quoteBrief,
                          sourcePage: PRODUCTS_ROUTE,
                        });
                        setServerCart(updatedCart);
                        await refreshPortalSummary(buyer.email);
                        setFeedback(
                          "Scoped quote requested. The team can now shape pricing and delivery before billing.",
                        );
                      })
                    }
                    className="inline-flex items-center justify-center rounded-full border px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
                    style={{
                      borderColor: "var(--portal-border)",
                      color: "var(--portal-foreground)",
                      background: "var(--portal-card)",
                    }}
                  >
                    Request scoped quote
                  </button>
                </div>
              </div>

              {checkoutSession?.hostedCheckoutUrl ? (
                <a
                  href={checkoutSession.hostedCheckoutUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--portal-tone-blue-text)]"
                >
                  Re-open active checkout
                </a>
              ) : null}
            </div>
          </ClientPortalSectionCard>

          <ClientPortalSectionCard
            title="Buyer and Brief"
            subtitle="This becomes the first commercial and delivery context for the team. Keep it accurate enough that payment recovery and onboarding stay smooth."
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm">
                <span className="font-medium text-[var(--portal-foreground)]">Full name</span>
                <input
                  value={buyer.fullName}
                  onChange={(event) => setBuyerField(setBuyer, "fullName", event.target.value)}
                  placeholder="Who is buying this?"
                  className={fieldClassName}
                  style={{
                    borderColor: "var(--portal-border)",
                    background: "var(--portal-surface-soft)",
                    color: "var(--portal-foreground)",
                  }}
                />
              </label>
              <label className="text-sm">
                <span className="font-medium text-[var(--portal-foreground)]">Company</span>
                <input
                  value={buyer.companyName}
                  onChange={(event) => setBuyerField(setBuyer, "companyName", event.target.value)}
                  placeholder="Client company or brand"
                  className={fieldClassName}
                  style={{
                    borderColor: "var(--portal-border)",
                    background: "var(--portal-surface-soft)",
                    color: "var(--portal-foreground)",
                  }}
                />
              </label>
              <label className="text-sm">
                <span className="font-medium text-[var(--portal-foreground)]">Email</span>
                <input
                  value={buyer.email}
                  onChange={(event) => setBuyerField(setBuyer, "email", event.target.value)}
                  placeholder="Used for recovery, billing, and onboarding"
                  className={fieldClassName}
                  style={{
                    borderColor: "var(--portal-border)",
                    background: "var(--portal-surface-soft)",
                    color: "var(--portal-foreground)",
                  }}
                />
              </label>
              <label className="text-sm">
                <span className="font-medium text-[var(--portal-foreground)]">Phone</span>
                <input
                  value={buyer.phone}
                  onChange={(event) => setBuyerField(setBuyer, "phone", event.target.value)}
                  placeholder="Optional for now"
                  className={fieldClassName}
                  style={{
                    borderColor: "var(--portal-border)",
                    background: "var(--portal-surface-soft)",
                    color: "var(--portal-foreground)",
                  }}
                />
              </label>
            </div>

            <div className="mt-4 space-y-3">
              <label className="block text-sm">
                <span className="font-medium text-[var(--portal-foreground)]">Launch goals</span>
                <textarea
                  value={projectGoals}
                  onChange={(event) => setProjectGoals(event.target.value)}
                  placeholder="Campaign goal, audience, or why this page exists."
                  rows={4}
                  className={`${fieldClassName} resize-y`}
                  style={{
                    borderColor: "var(--portal-border)",
                    background: "var(--portal-surface-soft)",
                    color: "var(--portal-foreground)",
                  }}
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium text-[var(--portal-foreground)]">Operator notes</span>
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Anything the team should already know before payment or quote review."
                  rows={4}
                  className={`${fieldClassName} resize-y`}
                  style={{
                    borderColor: "var(--portal-border)",
                    background: "var(--portal-surface-soft)",
                    color: "var(--portal-foreground)",
                  }}
                />
              </label>
            </div>
          </ClientPortalSectionCard>

          <ClientPortalSectionCard
            title="Drafts and Payment Recovery"
            subtitle="Drafts save against the buyer email so the client can come back, reopen checkout, or continue later without starting over."
          >
            <div className="space-y-3">
              {portalSummary?.carts.length ? (
                portalSummary.carts.slice(0, 3).map((cart) => {
                  const recoveryAction = getStorefrontRecoveryAction(cart);

                  return (
                    <div
                      key={cart.id}
                      className="rounded-[20px] border px-4 py-4"
                      style={{
                        borderColor: "var(--portal-border)",
                        background:
                          cart.id === latestKnownCart?.id
                            ? "var(--portal-elevated)"
                            : "var(--portal-card)",
                      }}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <ClientPortalStatusPill
                            label={formatStatus(cart.status)}
                            tone={cart.flowMode === "SELF_SERVE" ? "success" : "warning"}
                          />
                          <ClientPortalStatusPill
                            label={
                              cart.flowMode === "SELF_SERVE"
                                ? "Checkout ready"
                                : "Quote flow"
                            }
                            tone="neutral"
                          />
                        </div>
                        <p className="text-sm font-semibold text-[var(--portal-foreground)]">
                          {formatMoneyMinor(cart.summary.payableTodayMinor)}
                        </p>
                      </div>

                      <div className="mt-3 grid gap-2 text-sm text-[var(--portal-muted)] sm:grid-cols-2">
                        <p>Cart ID: {cart.id}</p>
                        <p>
                          Checkout:{" "}
                          {cart.latestCheckoutSession
                            ? formatStatus(cart.latestCheckoutSession.status)
                            : "Not created"}
                        </p>
                        <p>
                          Quote:{" "}
                          {cart.quoteRequest
                            ? formatStatus(cart.quoteRequest.status)
                            : "Not requested"}
                        </p>
                        <p>ERP sync: {formatStatus(cart.erp.syncStatus)}</p>
                      </div>

                      {recoveryAction.kind !== "none" ? (
                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                          <p className="max-w-2xl text-sm text-[var(--portal-muted)]">
                            {recoveryAction.detail}
                          </p>
                          {recoveryAction.kind === "onboarding" ? (
                            <button
                              type="button"
                              disabled={isPending}
                              onClick={() =>
                                runAction(async () => {
                                  const session = await resolveProjectOnboardingForApp({
                                    cartId: cart.id,
                                  });
                                  setFeedback(
                                    "Payment verified. Opening the structured onboarding brief...",
                                  );
                                  router.push(ROUTES.dashboard.onboarding(session.id));
                                })
                              }
                              className="inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
                              style={{
                                background:
                                  "linear-gradient(135deg, var(--portal-tone-indigo) 0%, var(--portal-tone-blue) 100%)",
                              }}
                            >
                              {recoveryAction.label}
                            </button>
                          ) : recoveryAction.kind === "checkout" ? (
                            <button
                              type="button"
                              disabled={isPending}
                              onClick={() =>
                                runAction(async () => {
                                  const session = await createCheckoutSessionForApp({
                                    cartId: cart.id,
                                    returnUrl: getReturnUrl(cart.id),
                                    cancelUrl: getCancelUrl(cart.id),
                                  });
                                  setCheckoutSession(session);
                                  await refreshPortalSummary(
                                    buyer.email.trim() || portalSummary?.email || "",
                                  );
                                  if (session.environment === "MOCK") {
                                    setFeedback(
                                      "Checkout session is ready, but Cashfree is still in mock mode here.",
                                    );
                                    return;
                                  }

                                  setFeedback(
                                    "Secure payment session created. Redirecting to checkout...",
                                  );
                                  await launchCashfreeCheckout(session);
                                })
                              }
                              className="inline-flex items-center justify-center rounded-full border px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
                              style={{
                                borderColor: "var(--portal-border)",
                                color: "var(--portal-foreground)",
                                background: "var(--portal-surface-soft)",
                              }}
                            >
                              {recoveryAction.label}
                            </button>
                          ) : (
                            <span className="text-sm font-semibold text-[var(--portal-muted)]">
                              {recoveryAction.label}
                            </span>
                          )}
                        </div>
                      ) : null}
                    </div>
                  );
                })
              ) : (
                <div
                  className="rounded-[20px] border border-dashed px-4 py-6 text-sm text-[var(--portal-muted)]"
                  style={{ borderColor: "var(--portal-border)" }}
                >
                  No recoverable drafts yet. Once a draft is saved or payment is attempted, the buyer email becomes the recovery key.
                </div>
              )}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
              <p className="text-[var(--portal-muted)]">
                Payment session:{" "}
                {checkoutSession
                  ? `${formatStatus(checkoutSession.status)} · ${checkoutSession.environment}`
                  : "Not created"}
              </p>
              <Link
                href={ROUTES.dashboard.projects}
                className="font-semibold text-[var(--portal-tone-blue-text)]"
              >
                Open active projects
              </Link>
            </div>
          </ClientPortalSectionCard>

          <ClientPortalSectionCard
            title="What happens next"
            subtitle="This is the commercial spine we are hardening: buy, pay, brief, then convert the paid scope into an internal project."
          >
            <div className="grid gap-3">
              {[
                "1. Choose the package and add only the extras that improve the launch.",
                "2. Save a recoverable draft before payment so the buyer can resume later.",
                "3. Pay now for self-serve scope or switch to quote flow for custom work.",
                "4. After payment, the next milestone is the structured onboarding wizard.",
              ].map((step) => (
                <div
                  key={step}
                  className="rounded-[18px] border px-4 py-3 text-sm text-[var(--portal-muted)]"
                  style={{
                    borderColor: "var(--portal-border)",
                    background: "var(--portal-surface-soft)",
                  }}
                >
                  {step}
                </div>
              ))}

              <div
                className="rounded-[20px] border px-4 py-4"
                style={{
                  borderColor: "var(--portal-border)",
                  background: "var(--portal-card)",
                }}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <ClientPortalStatusPill
                    label={preview.flowMode === "SELF_SERVE" ? "Payment ready" : "Quote led"}
                    tone={preview.flowMode === "SELF_SERVE" ? "success" : "warning"}
                  />
                  {latestKnownCart ? (
                    <ClientPortalStatusPill
                      label={`Latest cart ${formatStatus(latestKnownCart.status)}`}
                      tone="neutral"
                    />
                  ) : null}
                </div>
                <p className="mt-3 text-sm text-[var(--portal-muted)]">
                  Draft recovery is already live. The next build after this storefront slice is the post-payment onboarding wizard.
                </p>
              </div>
            </div>
          </ClientPortalSectionCard>
        </div>
      </section>
    </div>
  );
}
