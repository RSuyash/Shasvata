import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Quote } from "lucide-react";

export const metadata: Metadata = {
  title: "Work & Proof",
  description:
    "Selected proof, delivery philosophy, and the kinds of systems and operating layers Shasvata helps businesses build.",
};

const engagementBlocks = [
  {
    type: "Growth Systems",
    title: "Growth systems for performance-led businesses",
    body: "Where marketing execution needs stronger workflow logic, visibility, and repeatability behind it — not just more creative output on top of a fragile operating foundation.",
    tags: ["Campaign Operations", "Reporting", "Growth Process Design"],
  },
  {
    type: "Infrastructure",
    title: "Automation and operational infrastructure",
    body: "Where manual follow-up, scattered tools, and process inconsistency are slowing real business work down and preventing growth from compounding.",
    tags: ["Workflow Automation", "Integrations", "Internal Tools"],
  },
  {
    type: "Integrated",
    title: "Integrated growth and systems engagements",
    body: "Where advisory, technology, and growth support need to work as one engagement instead of three disconnected vendors creating coordination loss.",
    tags: ["Advisory", "Marketing", "Systems", "AI"],
  },
];

const proofCards = [
  {
    clientType: "Growth-focused B2B service business",
    problem: "Execution existed, but internal flow and reporting logic were weak. Too much depended on founder memory.",
    role: "Structured systems thinking, workflow clarity, reporting architecture, operating support",
    result: "Cleaner execution, stronger visibility, improved confidence in the operating model",
    engagementType: "Growth + Infrastructure",
  },
  {
    clientType: "Performance-driven service company",
    problem: "Strong external activity, weaker internal follow-through. Lead handling was inconsistent and manual.",
    role: "Growth process design, CRM logic, automation of qualification and routing",
    result: "Better coherence between acquisition, operations, and action. Significantly reduced manual dependency.",
    engagementType: "Infrastructure + Intelligence",
  },
  {
    clientType: "Founder-led product business",
    problem: "Team was executing well individually, but workflows were not connected. Reporting was assembled manually each week.",
    role: "Workflow integration, data flow design, automated reporting layer, internal tooling",
    result: "Weekly reporting time reduced from hours to minutes. Ownership became clearer across functions.",
    engagementType: "Infrastructure",
  },
];

const placeholderQuotes = [
  "Naya brought structure to areas that were previously scattered.",
  "The difference was not only execution. It was the system behind the execution.",
  "They think like operators, not just service providers.",
];

export default function WorkPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-grid" aria-hidden="true" />
        <div className="glow-orb -z-10 absolute left-0 bottom-0 h-[350px] w-[350px] bg-[rgb(var(--naya-sky)/0.07)]" />
        <div className="container-naya">
          <p className="eyebrow mb-5">Proof</p>
          <h1 className="text-fluid-2xl font-display font-black mb-6 max-w-3xl text-balance">
            Proof, selected work, and the kind of systems{" "}
            <span className="gradient-text-dark dark:gradient-text">we help build.</span>
          </h1>
          <p className="max-w-2xl text-lg text-[hsl(var(--muted-foreground))] leading-relaxed mb-6">
            Naya is built around structured delivery, practical systems, and work that compounds.
          </p>
          <div className="accent-bar max-w-xl">
            We believe proof should reduce risk, not inflate perception. That means showing the kind
            of business problems we help solve, the systems we help put in place, and the outcomes we
            aim to create — without exaggerated claims or vanity metrics.
          </div>
        </div>
      </section>

      {/* Engagement types */}
      <section className="section-y bg-[hsl(var(--background))]">
        <div className="container-naya">
          <p className="eyebrow mb-8">Engagement Types</p>
          <div className="grid gap-5 md:grid-cols-3">
            {engagementBlocks.map((block) => (
              <div
                key={block.title}
                className="card-glow group"
              >
                <span className="badge-sky mb-4 block w-fit">{block.type}</span>
                <h3 className="mb-3 font-bold tracking-tight text-[hsl(var(--foreground))] leading-snug">
                  {block.title}
                </h3>
                <p className="mb-5 text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
                  {block.body}
                </p>
                <div className="flex flex-wrap gap-2">
                  {block.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-[hsl(var(--border))] px-2.5 py-0.5 text-xs text-[hsl(var(--muted-foreground))]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Case story cards */}
      <section className="section-y bg-[hsl(var(--muted)/0.3)]">
        <div className="container-naya">
          <div className="mb-12">
            <p className="eyebrow mb-4">Case Stories</p>
            <h2 className="text-fluid-xl font-display font-black mb-3">
              Selected{" "}
              <span className="gradient-text-dark dark:gradient-text">engagements</span>
            </h2>
            <p className="text-[hsl(var(--muted-foreground))] max-w-xl">
              Client names and specific metrics are omitted without explicit approval. These
              represent real engagement types and outcome directions.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {proofCards.map((card) => (
              <div key={card.clientType} className="card-base flex flex-col gap-5">
                <div>
                  <span className="badge-navy mb-3 block w-fit">{card.engagementType}</span>
                  <p className="text-xs font-semibold uppercase tracking-widest text-[hsl(var(--muted-foreground))] mb-1">
                    Client Type
                  </p>
                  <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                    {card.clientType}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-[hsl(var(--muted-foreground))] mb-1">
                    Core Problem
                  </p>
                  <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
                    {card.problem}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-[hsl(var(--muted-foreground))] mb-1">
                    Naya's Role
                  </p>
                  <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
                    {card.role}
                  </p>
                </div>
                <div className="rounded-xl bg-[rgb(var(--naya-sky)/0.08)] border border-[rgb(var(--naya-sky)/0.15)] p-3">
                  <p className="text-xs font-semibold uppercase tracking-widest text-[rgb(var(--naya-sky))] mb-1">
                    Result Direction
                  </p>
                  <p className="text-sm text-[hsl(var(--foreground))] font-medium leading-relaxed">
                    {card.result}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial placeholders */}
      <section className="section-y bg-[hsl(var(--background))]">
        <div className="container-naya">
          <p className="eyebrow mb-8">Client Perspective</p>
          <div className="grid gap-5 md:grid-cols-3">
            {placeholderQuotes.map((quote) => (
              <figure key={quote} className="card-base relative">
                <Quote className="absolute top-4 right-4 h-8 w-8 text-[rgb(var(--naya-sky)/0.15)]" aria-hidden="true" />
                <blockquote className="text-[hsl(var(--foreground))] leading-relaxed italic mb-4">
                  &ldquo;{quote}&rdquo;
                </blockquote>
                <figcaption className="text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-widest">
                  Shasvata Client — Awaiting approval to publish
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Delivery philosophy */}
      <section className="section-y bg-[rgb(var(--naya-navy))]">
        <div className="container-naya">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div>
              <p className="eyebrow mb-5 !text-[rgb(var(--naya-sky))]">How We Approach Delivery</p>
              <h2 className="text-fluid-xl font-display font-black text-white mb-5">
                Scoped. Reviewed. Built to{" "}
                <span className="text-[rgb(var(--naya-sky))]">compound.</span>
              </h2>
              <p className="text-[rgb(168,196,224)] leading-relaxed mb-4">
                We prefer scoped work over vague work. Before we build anything, we define what
                is being solved, what is being built, what done looks like, and what happens after delivery.
              </p>
              <p className="text-[rgb(168,196,224)] leading-relaxed">
                That makes communication easier, delivery cleaner, and results easier to trust —
                on both sides. We do not do discovery theatre. We do not oversell and underdeliver.
              </p>
            </div>
            <div className="space-y-4">
              {[
                "Define the problem before designing the solution",
                "Structured scopes with clear deliverable boundaries",
                "Founder-reviewed quality at every stage",
                "Reusable assets that compound after delivery",
                "Honest assessments over comfortable promises",
              ].map((point) => (
                <div
                  key={point}
                  className="flex items-center gap-3 rounded-xl border border-[rgb(255,255,255/0.08)] bg-[rgb(255,255,255/0.04)] px-5 py-4"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--naya-sky)/0.2)]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[rgb(var(--naya-sky))]" />
                  </span>
                  <p className="text-sm text-white">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-y bg-[hsl(var(--background))]">
        <div className="container-narrow text-center">
          <h2 className="text-fluid-xl font-display font-black mb-5">
            Need this kind of thinking{" "}
            <span className="gradient-text-dark dark:gradient-text">inside your business?</span>
          </h2>
          <Link href="/contact" className="btn-primary btn-lg gap-2.5">
            Book a Discovery Call
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
