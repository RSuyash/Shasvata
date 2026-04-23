import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { buildAppPortalLink } from "@/lib/commerce-links";

export const metadata: Metadata = {
  title: "Landing Systems Pricing",
  description:
    "Premium landing systems built for conversion, clarity, and launch readiness, with structured packages, add-ons, and clean app-portal handoff.",
};

const packages = [
  {
    slug: "landing-page-starter",
    title: "Naya Launch Page Core",
    price: "₹9,999",
    bestFor: "Simple launches, local businesses, founders, first paid-campaign page",
    payment: "60% advance / 40% before final handover or launch",
    timeline: "3–5 business days after complete inputs are received",
    featured: false,
    summary:
      "A professionally designed, mobile-responsive landing page built for clean launch readiness.",
    includes: [
      "One custom landing page with up to 6 structured sections",
      "One lead capture form, thank-you state, and standard CTA placement",
      "Privacy Policy, Terms & Conditions, Refunds & Cancellations, and Contact / Support page",
      "Basic deployment support and 1 revision round within the approved direction",
    ],
    href: buildAppPortalLink({ packageSlug: "landing-page-starter" }),
  },
  {
    slug: "landing-page-growth",
    title: "Naya Campaign Landing System",
    price: "₹17,999",
    bestFor: "Lead generation campaigns, service businesses, real-estate ads, serious performance traffic",
    payment: "50% advance / 50% before final handover or launch",
    timeline: "5–7 business days after complete inputs and access",
    featured: true,
    summary:
      "A conversion-focused landing system designed for campaign traffic and serious lead generation.",
    includes: [
      "One custom landing page with up to 10 structured sections",
      "Conversion-first section planning across hero, trust, offer, CTA flow, and objection handling",
      "Legal/compliance pages plus one lead form, repeated CTA placement, and thank-you state",
      "Basic routing to one agreed destination, tracking-ready structure, script placement, and launch QA",
    ],
    href: buildAppPortalLink({ packageSlug: "landing-page-growth" }),
  },
  {
    slug: "landing-page-premium",
    title: "Shasvata Landing + Lead Ops Setup",
    price: "₹34,999",
    bestFor: "Operator clients, higher-ticket funnels, paid traffic teams, real-estate systems",
    payment: "50% advance / 30% on design approval / 20% before final handover or launch",
    timeline: "7–12 business days after complete inputs, content, and access",
    featured: false,
    summary:
      "A premium landing and lead-capture system for businesses that need stronger commercial structure, cleaner routing, and post-launch operational confidence.",
    includes: [
      "One premium custom landing page with up to 12 structured sections",
      "Message architecture, conversion-led structuring, operational routing, and conversion action mapping",
      "Legal/compliance pages, launch QA, and final pre-launch review",
      "One post-launch optimization pass, a 14-day support window, and 2 revision rounds within the approved direction",
    ],
    href: buildAppPortalLink({ packageSlug: "landing-page-premium" }),
  },
];

const comparisonRows = [
  {
    option: "Naya Launch Page Core",
    price: "₹9,999",
    sections: "Up to 6",
    routing: "Email only",
    scripts: "Placement only if provided",
    revisions: "1 round",
    support: "None",
  },
  {
    option: "Naya Campaign Landing System",
    price: "₹17,999",
    sections: "Up to 10",
    routing: "One agreed destination",
    scripts: "Placement for provided scripts",
    revisions: "2 rounds",
    support: "Launch confirmation only",
  },
  {
    option: "Shasvata Landing + Lead Ops Setup",
    price: "₹34,999",
    sections: "Up to 12",
    routing: "One operational destination",
    scripts: "Placement + structured readiness",
    revisions: "2 rounds",
    support: "14-day support + 1 optimization pass",
  },
];

const addons = [
  { label: "Extra Section", price: "₹1,500", detail: "Additional structured landing-page section beyond the tier limit." },
  { label: "Premium Copywriting", price: "₹3,500", detail: "Hero, offer, CTA, objection-handling, and section copy drafting/polish based on client inputs." },
  { label: "Analytics & Tracking Setup", price: "₹4,500", detail: "Basic event setup support for agreed page actions and verification of script placement." },
  { label: "Lead Routing Add-On", price: "₹4,500", detail: "Routing support to one agreed destination with basic field mapping." },
  { label: "CRM / Webhook Routing Pro", price: "₹8,500", detail: "For more structured CRM/webhook handoff where stack clarity exists." },
  { label: "Compliance Pack", price: "₹3,500", detail: "For projects needing stricter disclaimer handling, regulated wording blocks, or sector-specific compliance structuring." },
  { label: "Priority Delivery", price: "₹4,000", detail: "Fast-track queue priority and compressed turnaround, subject to input readiness." },
  { label: "Additional Revision Round", price: "₹2,500 / round", detail: "Extra revision cycle beyond the included rounds, within the approved direction." },
  { label: "A/B Hero Variant Pack", price: "₹2,500", detail: "One alternate hero section/version for testing angle, CTA, or offer framing." },
  { label: "Post-Launch Optimization Sprint", price: "₹7,500", detail: "7-day focused review for CTA, copy, and micro-layout refinements after launch." },
  { label: "Monthly Launch Support", price: "₹6,500 / month", detail: "For live campaign pages needing upkeep, minor edits, and controlled optimization under a monthly scope." },
];

const guardrails = [
  {
    title: "Scope expansion clause",
    body: "Included revisions apply only within the approved direction. Direction changes, additional sections, new features, added integrations, new deliverables, or any scope expansion beyond the quoted package are billed separately.",
  },
  {
    title: "Revision clause",
    body: "Revision rounds are limited to the number included in the selected package. Additional revision cycles are billed separately.",
  },
  {
    title: "Approval clause",
    body: "Work proceeds on the basis of written approval through the agreed communication channel. Delays in feedback, content, approvals, or access may shift timelines.",
  },
  {
    title: "Client dependency clause",
    body: "The client is responsible for timely sharing of content, assets, business details, legal details, required access, tracking IDs/scripts where applicable, and one clear approval point of contact.",
  },
  {
    title: "Exclusions clause",
    body: "Domain, hosting, premium plugins, paid third-party tools, premium stock/media assets, advanced automation, CRM implementation, custom backend/admin systems, paid traffic management, ad spend, external API charges, and any work beyond the quoted scope are excluded unless separately approved in writing.",
  },
];

const quoteFlows = [
  {
    title: "Custom Website Redesign",
    summary: "When the requirement has outgrown a landing system and needs broader IA, more pages, or a fuller redesign scope.",
    href: buildAppPortalLink({ quoteSlugs: ["landing-page-custom-redesign"] }),
  },
  {
    title: "Builder Launch Suite",
    summary: "When the launch needs heavier compliance, asset coordination, and multi-page delivery before pricing should be locked.",
    href: buildAppPortalLink({ quoteSlugs: ["landing-page-builder-launch-suite"] }),
  },
];

export default function PricingPage() {
  return (
    <div className="relative overflow-hidden bg-[linear-gradient(180deg,_#f4eee6_0%,_#f8f4ef_22%,_#fbfaf8_48%,_#ffffff_100%)] text-slate-900">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(191,149,94,0.18),_transparent_26%),radial-gradient(circle_at_bottom_right,_rgba(15,23,42,0.08),_transparent_26%)]" />

      <section className="relative mx-auto max-w-7xl px-6 pb-16 pt-32 md:pb-24">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/90 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.3em] text-amber-800 shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />
            Finalized Landing System Pricing
          </div>
          <h1 className="mt-6 max-w-4xl font-display text-5xl font-black tracking-[-0.06em] text-[rgb(var(--naya-navy))] md:text-7xl">
            Premium landing systems built for conversion, clarity, and launch readiness.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
            This is not a basic landing page build. It is a conversion-focused landing system designed for
            campaign readiness, clean lead capture, compliant structure, deployment, and controlled post-launch
            support.
          </p>
        </div>

        <div className="mt-12 grid gap-6 xl:grid-cols-3">
          {packages.map((item) => (
            <article
              key={item.slug}
              className={`rounded-[2rem] border p-6 shadow-[0_28px_80px_rgba(15,23,42,0.08)] backdrop-blur ${
                item.featured
                  ? "border-slate-950 bg-slate-950 text-white"
                  : "border-white/80 bg-white/88"
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <p className={`text-xs font-bold uppercase tracking-[0.3em] ${item.featured ? "text-slate-400" : "text-slate-400"}`}>
                  Landing System
                </p>
                <span
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${
                    item.featured
                      ? "border border-white/15 bg-white/10 text-white"
                      : "border border-slate-200 bg-slate-50 text-slate-600"
                  }`}
                >
                  {item.featured ? "Recommended" : "Package"}
                </span>
              </div>
              <h2 className={`mt-5 text-3xl font-bold tracking-[-0.04em] ${item.featured ? "text-white" : "text-slate-950"}`}>
                {item.title}
              </h2>
              <p className={`mt-4 text-sm leading-7 ${item.featured ? "text-slate-300" : "text-slate-600"}`}>
                {item.summary}
              </p>
              <div className={`mt-6 rounded-[1.5rem] px-5 py-5 ${item.featured ? "bg-white/8" : "bg-slate-950 text-white"}`}>
                <p className={`text-xs uppercase tracking-[0.25em] ${item.featured ? "text-slate-400" : "text-slate-400"}`}>
                  Price in INR
                </p>
                <p className="mt-2 text-3xl font-semibold tracking-[-0.03em]">{item.price}</p>
                <p className={`mt-2 text-sm ${item.featured ? "text-slate-300" : "text-slate-300"}`}>{item.payment}</p>
              </div>
              <div className={`mt-6 rounded-[1.5rem] border px-5 py-4 ${item.featured ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50/80"}`}>
                <p className={`text-xs uppercase tracking-[0.22em] ${item.featured ? "text-slate-400" : "text-slate-400"}`}>
                  Best for
                </p>
                <p className={`mt-2 text-sm leading-7 ${item.featured ? "text-slate-200" : "text-slate-700"}`}>{item.bestFor}</p>
                <p className={`mt-3 text-xs uppercase tracking-[0.22em] ${item.featured ? "text-slate-400" : "text-slate-400"}`}>
                  Delivery timeline
                </p>
                <p className={`mt-2 text-sm ${item.featured ? "text-slate-200" : "text-slate-700"}`}>{item.timeline}</p>
              </div>
              <ul className={`mt-6 space-y-3 text-sm ${item.featured ? "text-slate-200" : "text-slate-600"}`}>
                {item.includes.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <CheckCircle2 className={`mt-0.5 h-4 w-4 ${item.featured ? "text-amber-300" : "text-amber-700"}`} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                className={`mt-8 inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold transition hover:-translate-y-0.5 ${
                  item.featured
                    ? "bg-white text-slate-950 hover:bg-amber-50"
                    : "bg-[rgb(var(--naya-blue))] text-white hover:bg-sky-600"
                }`}
                href={item.href}
              >
                Start in app portal
                <ArrowRight className="h-4 w-4" />
              </Link>
            </article>
          ))}
        </div>

        <div className="mt-16 rounded-[2rem] border border-slate-200 bg-white/88 p-7 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">Comparison</p>
              <h2 className="mt-2 font-display text-4xl font-black tracking-[-0.05em] text-slate-950">
                Final 3-tier pricing architecture
              </h2>
            </div>
            <p className="max-w-2xl text-sm leading-7 text-slate-600">
              Recommended for most lead-generation clients: Option 2 — Naya Campaign Landing System.
              It gives the strongest balance of conversion structure, scope clarity, and commercial value
              without overcomplicating the build.
            </p>
          </div>

          <div className="mt-8 overflow-hidden rounded-[1.5rem] border border-slate-200">
            <div className="grid grid-cols-6 gap-4 bg-slate-950 px-5 py-4 text-xs font-bold uppercase tracking-[0.22em] text-slate-300">
              <span>Option</span>
              <span>Price</span>
              <span>Sections</span>
              <span>Routing</span>
              <span>Script handling</span>
              <span>Post-launch</span>
            </div>
            {comparisonRows.map((row) => (
              <div
                key={row.option}
                className="grid grid-cols-6 gap-4 border-t border-slate-200 bg-white px-5 py-4 text-sm text-slate-700"
              >
                <span className="font-semibold text-slate-950">{row.option}</span>
                <span>{row.price}</span>
                <span>{row.sections}</span>
                <span>{row.routing}</span>
                <span>{row.scripts}</span>
                <span>{row.support}</span>
              </div>
            ))}
          </div>
          <p className="mt-5 text-sm font-semibold text-slate-700">
            Recommended Option: Naya Campaign Landing System — best balance of conversion structure, premium
            presentation, and commercial clarity for most lead-generation use cases.
          </p>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-[2rem] border border-slate-200 bg-white/88 p-7 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">Add-ons</p>
            <h2 className="mt-2 font-display text-4xl font-black tracking-[-0.05em] text-slate-950">
              Final add-on catalog
            </h2>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {addons.map((item) => (
                <article key={item.label} className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-950">{item.label}</h3>
                      <p className="mt-2 text-sm leading-7 text-slate-600">{item.detail}</p>
                    </div>
                    <span className="whitespace-nowrap rounded-full bg-white px-3 py-1 text-sm font-bold text-slate-950 shadow-sm">
                      {item.price}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white/88 p-7 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">Guardrails</p>
            <h2 className="mt-2 font-display text-4xl font-black tracking-[-0.05em] text-slate-950">
              Legal and commercial boundaries
            </h2>
            <div className="mt-6 space-y-4">
              {guardrails.map((item) => (
                <article key={item.title} className="rounded-[1.4rem] border border-slate-200 bg-slate-50/70 p-5">
                  <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{item.body}</p>
                </article>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-16 rounded-[2rem] border border-slate-200 bg-slate-950 p-7 text-white shadow-[0_24px_70px_rgba(15,23,42,0.18)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">Quote-first work</p>
              <h2 className="mt-2 font-display text-4xl font-black tracking-[-0.05em] text-white">
                Some work should never be forced into one-click ecommerce.
              </h2>
            </div>
            <p className="max-w-2xl text-sm leading-7 text-slate-300">
              If the requirement has outgrown the fixed package stack, move into the same app portal through a quote-first path so pricing, scope, and approvals stay sane.
            </p>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {quoteFlows.map((item) => (
              <article key={item.title} className="rounded-[1.6rem] border border-white/10 bg-white/5 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-300">Quote first</p>
                <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">{item.summary}</p>
                <Link
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-50"
                  href={item.href}
                >
                  Request scoped quote
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
