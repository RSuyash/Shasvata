import type { Metadata } from "next";
import Link from "next/link";
import { TrendingUp, Layers, Cpu, ArrowRight, CheckCircle2 } from "lucide-react";
import { capabilityGroups } from "@/content/site";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Capabilities",
  description:
    "Explore Shasvata's capabilities across growth execution, workflow infrastructure, automation, and intelligent business systems.",
};

const iconMap = { TrendingUp, Layers, Cpu };

export default function CapabilitiesPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-grid" aria-hidden="true" />
        <div className="glow-orb -z-10 absolute left-0 top-0 h-[400px] w-[400px] bg-[rgb(var(--naya-sky)/0.08)]" />
        <div className="container-naya">
          <p className="eyebrow mb-5">What We Do</p>
          <h1 className="text-fluid-2xl font-display font-black mb-6 max-w-3xl text-balance">
            Capabilities built for businesses that need growth and systems to{" "}
            <span className="gradient-text-dark dark:gradient-text">work together.</span>
          </h1>
          <p className="max-w-2xl text-lg text-[hsl(var(--muted-foreground))] leading-relaxed mb-8">
            We do not sell disconnected services with disconnected outcomes. Our work lives at the
            intersection of execution, systems, visibility, and leverage.
          </p>
          <p className="text-[hsl(var(--muted-foreground))] leading-relaxed max-w-2xl">
            That means a client may come in asking for marketing support and actually need automation,
            reporting, internal workflow redesign, or a more structured operating model underneath it.
            We are comfortable working in that complexity.
          </p>
        </div>
      </section>

      {/* Jump links */}
      <div className="sticky top-[4.5rem] z-30 border-b border-[hsl(var(--border))] bg-[hsl(var(--background)/0.95)] backdrop-blur-xl">
        <div className="container-naya">
          <nav className="flex gap-1 py-3" aria-label="Capability groups">
            {capabilityGroups.map((group) => {
              const Icon = iconMap[group.icon as keyof typeof iconMap];
              return (
                <a
                  key={group.id}
                  href={`#${group.id}`}
                  className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors"
                >
                  <Icon className="h-3.5 w-3.5" />
                  {group.label}
                </a>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Capability groups */}
      {capabilityGroups.map((group, gi) => {
        const Icon = iconMap[group.icon as keyof typeof iconMap];
        const isAlt = gi % 2 === 1;
        return (
          <section
            key={group.id}
            id={group.id}
            className={cn(
              "section-y scroll-mt-28",
              isAlt ? "bg-[hsl(var(--muted)/0.3)]" : "bg-[hsl(var(--background))]",
            )}
          >
            <div className="container-naya">
              {/* Group header */}
              <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div className="max-w-xl">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgb(var(--naya-sky)/0.1)] text-[rgb(var(--naya-sky))]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-[rgb(var(--naya-sky))]">
                      {group.label}
                    </span>
                  </div>
                  <h2 className="text-3xl font-display font-black mb-3">{group.headline}</h2>
                  <p className="text-[hsl(var(--muted-foreground))] leading-relaxed">{group.intro}</p>
                </div>
                <Link
                  href="/contact"
                  className="btn-primary shrink-0 gap-2"
                >
                  {group.cta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {/* Capability items */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {group.items.map((item) => (
                  <div
                    key={item.title}
                    className="card-hover group"
                  >
                    <div className="mb-3 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-[rgb(var(--naya-sky))]" />
                      <h3 className="font-semibold text-sm tracking-tight text-[hsl(var(--foreground))]">
                        {item.title}
                      </h3>
                    </div>
                    <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
                      {item.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      })}

      {/* Productised clarity */}
      <section className="section-y bg-[rgb(var(--naya-navy))]">
        <div className="container-narrow text-center">
          <p className="eyebrow mb-5 justify-center !text-[rgb(var(--naya-sky))]">
            Delivery Philosophy
          </p>
          <h2 className="text-fluid-xl font-display font-black text-white mb-5 text-balance">
            Structured scopes. Clear deliverables.{" "}
            <span className="text-[rgb(var(--naya-sky))]">Less mystery.</span>
          </h2>
          <p className="text-[rgb(168,196,224)] leading-relaxed mb-4">
            Naya believes serious work should be understandable before it is sold. That means better
            scoping, clearer boundaries, cleaner deliverables, and engagements that do not rely on
            vague promises or "we will figure it out together" ambiguity.
          </p>
          <p className="text-[rgb(168,196,224)] leading-relaxed mb-10">
            We prefer structured work over black-box work because clarity builds trust, improves
            delivery, and protects both sides of the engagement.
          </p>
          <Link href="/contact" className="btn-primary btn-lg gap-2.5">
            Need help identifying the right capability mix?
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
