import type { Metadata } from "next";
import Link from "next/link";
import { PublicAppShell } from "@/components/public-app/public-app-shell";
import { fetchCatalogForApp } from "@/lib/commerce";
import { buildPublicCatalogSections } from "@/lib/public-app-site";
import { ROUTES, signInRedirect } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Products and Pricing | Shasvata App",
  description:
    "Browse Shasvata landing-system packages, compare the three tiers clearly, and review add-ons and guardrails before moving into the signed-in storefront.",
  robots: { index: true, follow: true },
};

export default async function ProductsPage() {
  const catalog = buildPublicCatalogSections(await fetchCatalogForApp());

  return (
    <PublicAppShell
      eyebrow="Products and pricing"
      title="Productized landing systems with cleaner comparison, clearer scope, and a real workspace behind them."
      description="Review the three finalized package tiers, see how add-ons fit, and move into the signed-in storefront only when the commercial shape is already clear."
      primaryAction={{
        label: "Open signed-in storefront",
        href: signInRedirect(ROUTES.dashboard.products),
      }}
      secondaryAction={{
        label: "Contact Shasvata",
        href: ROUTES.public.contact,
      }}
    >
      <section className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-400">
              Packages
            </p>
            <h2 className="mt-2 font-display text-4xl font-black tracking-[-0.06em] text-slate-950">
              Fixed-scope offers
            </h2>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-slate-600">
            These are the cleanest fixed-scope options in the portal. The signed-in workspace then handles draft recovery, checkout, billing, and the post-payment onboarding flow.
          </p>
        </div>
        <div className="grid gap-5 xl:grid-cols-3">
          {catalog.packages.length ? (
            catalog.packages.map((item) => (
              <article
                key={item.slug}
                className="rounded-[30px] border border-white/90 bg-white/84 p-6 shadow-[0_24px_58px_rgba(15,23,42,0.08)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-sky-100 px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-sky-700">
                      {item.kindLabel}
                    </span>
                    {item.recommendedLabel ? (
                      <span className="rounded-full bg-slate-950 px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-white">
                        Recommended
                      </span>
                    ) : null}
                  </div>
                  {item.isFeatured ? (
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-slate-600">
                      Featured
                    </span>
                  ) : null}
                </div>
                <h3 className="mt-5 font-display text-3xl font-black tracking-[-0.05em] text-slate-950">
                  {item.label}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{item.summary}</p>
                {item.bestFor ? (
                  <div className="mt-5 rounded-[22px] border border-sky-100 bg-sky-50/80 px-4 py-4">
                    <p className="text-[11px] font-black uppercase tracking-[0.22em] text-sky-700">
                      Best for
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-950">{item.bestFor}</p>
                  </div>
                ) : null}
                <div className="mt-6 rounded-[24px] bg-slate-950 px-5 py-5 text-white">
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-400">
                    Price in INR
                  </p>
                  <p className="mt-2 text-3xl font-semibold tracking-[-0.05em]">
                    {item.priceLabel}
                  </p>
                  {item.paymentLabel ? (
                    <p className="mt-2 text-sm text-slate-300">{item.paymentLabel}</p>
                  ) : null}
                  <p className="mt-2 text-sm text-slate-400">
                    {item.deliveryWindow || "Delivery timing confirmed after kickoff."}
                  </p>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[20px] border border-slate-200 bg-slate-50/90 px-4 py-4">
                    <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">
                      Scope
                    </p>
                    <p className="mt-2 text-sm font-semibold leading-6 text-slate-950">
                      {item.scope || "Scope confirmed during kickoff."}
                    </p>
                  </div>
                  <div className="rounded-[20px] border border-slate-200 bg-slate-50/90 px-4 py-4">
                    <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">
                      Revisions
                    </p>
                    <p className="mt-2 text-sm font-semibold leading-6 text-slate-950">
                      {item.revisions || "Revision policy confirmed with package."}
                    </p>
                  </div>
                </div>
                <div className="mt-5 space-y-3">
                  {item.highlights.map((highlight) => (
                    <div
                      key={highlight}
                      className="rounded-[18px] border border-slate-200 bg-slate-50/90 px-4 py-3 text-sm leading-6 text-slate-600"
                    >
                      {highlight}
                    </div>
                  ))}
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-[30px] border border-dashed border-slate-300 bg-white/72 p-8 text-sm leading-7 text-slate-600 xl:col-span-3">
              No fixed-scope packages are published right now. Please contact Shasvata for the latest commercial options.
            </div>
          )}
        </div>
      </section>

      <section className="rounded-[30px] border border-white/90 bg-white/84 p-6 shadow-[0_24px_58px_rgba(15,23,42,0.08)]">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-400">
              Comparison
            </p>
            <h2 className="mt-2 font-display text-4xl font-black tracking-[-0.06em] text-slate-950">
              The three tiers are different on purpose.
            </h2>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-slate-600">
            Most clients should start with the campaign system. The lighter and premium tiers exist so scope stays honest instead of getting blurred during checkout.
          </p>
        </div>

        <div className="mt-6 overflow-hidden rounded-[24px] border border-slate-200">
          <div className="grid grid-cols-[1.15fr_repeat(3,minmax(0,1fr))] bg-slate-950 text-white">
            <div className="px-4 py-4 text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">
              What changes
            </div>
            {catalog.packages.map((item) => (
              <div key={item.slug} className="border-l border-white/10 px-4 py-4">
                <p className="text-sm font-semibold leading-6">{item.label}</p>
                {item.recommendedLabel ? (
                  <p className="mt-1 text-[11px] font-black uppercase tracking-[0.2em] text-sky-300">
                    {item.recommendedLabel}
                  </p>
                ) : null}
              </div>
            ))}
          </div>

          {catalog.comparisonRows.map((row, index) => (
            <div
              key={row.label}
              className="grid grid-cols-[1.15fr_repeat(3,minmax(0,1fr))]"
              style={{
                background: index % 2 === 0 ? "rgba(248,250,252,0.92)" : "rgba(255,255,255,0.96)",
              }}
            >
              <div className="px-4 py-4 text-sm font-semibold text-slate-950">{row.label}</div>
              {catalog.packages.map((item) => (
                <div
                  key={`${row.label}-${item.slug}`}
                  className="border-l border-slate-200 px-4 py-4 text-sm leading-6 text-slate-600"
                >
                  {row.values[item.slug as keyof typeof row.values]}
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[30px] border border-white/90 bg-white/84 p-6 shadow-[0_24px_58px_rgba(15,23,42,0.08)]">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-400">
            Add-ons
          </p>
          <div className="mt-5 space-y-5">
            {catalog.addonGroups.length ? (
              catalog.addonGroups.map((group) => (
                <div key={group.label} className="space-y-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-400">
                      {group.label}
                    </p>
                    <p className="mt-2 text-sm leading-7 text-slate-600">{group.description}</p>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {group.items.map((item) => (
                      <div
                        key={item.slug}
                        className="rounded-[22px] border border-slate-200 bg-slate-50/90 px-5 py-5"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-lg font-semibold text-slate-950">{item.label}</p>
                            <p className="mt-2 text-sm leading-7 text-slate-600">{item.summary}</p>
                            {item.paymentLabel ? (
                              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                                {item.paymentLabel}
                              </p>
                            ) : null}
                          </div>
                          <span className="text-sm font-bold text-slate-950">{item.priceLabel}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[22px] border border-dashed border-slate-300 bg-slate-50/80 px-5 py-5 text-sm leading-7 text-slate-600">
                Add-ons are not published right now. Custom scope can still be discussed through Shasvata support.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[30px] border border-white/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.92)_0%,rgba(247,250,255,0.94)_100%)] p-6 shadow-[0_24px_58px_rgba(15,23,42,0.08)]">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-400">
            Quote-first scope
          </p>
          <div className="mt-5 space-y-4">
            {catalog.customScopes.length ? (
              catalog.customScopes.map((item) => (
                <div
                  key={item.slug}
                  className="rounded-[22px] border border-slate-200 bg-white/88 px-5 py-5"
                >
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-lg font-semibold text-slate-950">{item.label}</p>
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-amber-800">
                      {item.priceLabel}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{item.summary}</p>
                </div>
              ))
            ) : (
              <div className="rounded-[22px] border border-dashed border-slate-300 bg-white/80 px-5 py-5 text-sm leading-7 text-slate-600">
                No quote-first scopes are published at the moment.
              </div>
            )}
          </div>

          <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-950 px-5 py-5 text-white">
            <p className="text-sm leading-7 text-slate-300">
              Payments for fixed-scope packages move through the signed-in workspace. Quote-first items pause at scope review before billing is created.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href={signInRedirect(ROUTES.dashboard.products)}
                className="rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-950 transition hover:-translate-y-0.5"
              >
                Continue in workspace
              </Link>
              <Link
                href={ROUTES.public.refunds}
                className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/8"
              >
                View refund policy
              </Link>
            </div>
          </div>

          <div className="mt-5 rounded-[24px] border border-amber-200 bg-amber-50/80 px-5 py-5">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-800">
              Commercial guardrails
            </p>
            <div className="mt-4 space-y-3">
              {catalog.guardrailLines.map((line) => (
                <p key={line} className="text-sm leading-7 text-amber-900">
                  {line}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>
    </PublicAppShell>
  );
}
