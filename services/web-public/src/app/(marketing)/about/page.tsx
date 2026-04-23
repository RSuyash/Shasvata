import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, TrendingUp, Layers, Cpu } from "lucide-react";
import { aboutBeliefs } from "@/content/site";

export const metadata: Metadata = {
  title: "About Shasvata",
  description:
    "Learn how Shasvata combines growth, infrastructure, and intelligence to help businesses scale with clarity and less operational chaos.",
};

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-grid" aria-hidden="true" />
        <div className="glow-orb -z-10 absolute right-0 top-1/4 h-[400px] w-[400px] bg-[rgb(var(--naya-sky)/0.08)]" />
        <div className="container-naya">
          <div className="max-w-3xl">
            <p className="eyebrow mb-5">About Us</p>
            <h1 className="text-fluid-2xl font-display font-black mb-6 text-balance">
              Shasvata was built for businesses that need more than{" "}
              <span className="gradient-text-dark dark:gradient-text">disconnected services.</span>
            </h1>
            <p className="text-xl text-slate-700 leading-relaxed">
              We believe growth becomes stronger when execution, infrastructure, and intelligent
              systems are designed to work together — not bought separately and glued together later.
            </p>
          </div>
        </div>
      </section>

      {/* Why Naya exists */}
      <section className="section-y bg-[hsl(var(--background))]">
        <div className="container-naya">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20 items-center">
            <div>
              <p className="eyebrow mb-5">Origin</p>
              <h2 className="text-fluid-xl font-display font-black mb-5">
                Why Naya{" "}
                <span className="gradient-text-dark dark:gradient-text">exists</span>
              </h2>
              <div className="space-y-4 text-slate-700 leading-relaxed">
                <p>
                  Too many businesses are forced to work across disconnected specialists. One team
                  handles marketing. Another handles technology. Another gives advice. The result
                  is coordination loss, slower execution, unclear ownership, and systems that
                  never fully connect.
                </p>
                <p>
                  Naya was built to close that gap. We exist to help businesses build the operating
                  layer behind growth — combining execution, structure, and intelligent workflows in
                  a way that is actually usable, not theoretically elegant.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="rounded-2xl border border-[rgb(var(--naya-sky)/0.2)] bg-[rgb(var(--naya-sky)/0.05)] p-6">
                <h3 className="font-bold mb-2 text-[hsl(var(--foreground))]">The gap we close</h3>
                <p className="text-sm text-slate-700 leading-relaxed">
                  Most businesses have marketing, or tech, or strategy. Very few have them designed
                  to work as one connected operating model.
                </p>
              </div>
              <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
                <h3 className="font-bold mb-2 text-[hsl(var(--foreground))]">What we are building</h3>
                <p className="text-sm text-slate-700 leading-relaxed">
                  A structured, system-driven growth company — combining service delivery,
                  reusable frameworks, operational intelligence, and long-term capability development.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What we believe */}
      <section className="section-y bg-[hsl(var(--muted)/0.3)]">
        <div className="container-naya">
          <div className="mb-12">
            <p className="eyebrow mb-4">Philosophy</p>
            <h2 className="text-fluid-xl font-display font-black">
              What we{" "}
              <span className="gradient-text-dark dark:gradient-text">believe</span>
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {aboutBeliefs.map((belief, i) => (
              <div
                key={belief.statement}
                className="card-base relative overflow-hidden"
              >
                <span className="absolute top-4 right-4 text-3xl font-black text-[hsl(var(--muted-foreground)/0.08)]">
                  0{i + 1}
                </span>
                <h3 className="mb-3 font-bold tracking-tight text-[hsl(var(--foreground))] pr-8">
                  {belief.statement}
                </h3>
                <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
                  {belief.meaning}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Three-lens model */}
      <section className="section-y bg-[rgb(var(--naya-navy))]">
        <div className="container-naya">
          <div className="mb-12">
            <p className="eyebrow mb-4 !text-[rgb(var(--naya-sky))]">How We Think About Our Work</p>
            <h2 className="text-fluid-xl font-display font-black text-white">
              Three lenses. One{" "}
              <span className="text-[rgb(var(--naya-sky))]">connected model.</span>
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {[
              { icon: TrendingUp, label: "Growth", body: "Demand, campaigns, content systems, reporting visibility, and execution flow. The external output layer." },
              { icon: Layers, label: "Infrastructure", body: "Workflows, tools, automations, integrations, and operational reliability. The backbone that makes growth consistent." },
              { icon: Cpu, label: "Intelligence", body: "AI-assisted processes, optimisation logic, decision support, and reusable business knowledge. The layer that improves over time." },
            ].map(({ icon: Icon, label, body }) => (
              <div key={label} className="rounded-2xl border border-[rgb(255,255,255/0.08)] bg-[rgb(255,255,255/0.04)] p-7">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgb(var(--naya-sky)/0.15)] text-[rgb(var(--naya-sky))]">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mb-3 text-lg font-bold text-white">{label}</h3>
                <p className="text-sm text-[rgb(168,196,224)] leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How we prefer to work */}
      <section className="section-y bg-[hsl(var(--background))]">
        <div className="container-naya">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div>
              <p className="eyebrow mb-4">Working Style</p>
              <h2 className="text-fluid-xl font-display font-black mb-5">
                How we prefer{" "}
                <span className="gradient-text-dark dark:gradient-text">to work</span>
              </h2>
              <div className="space-y-4 text-slate-700 leading-relaxed">
                <p>
                  We are less interested in vanity activity and more interested in the systems that
                  continue to create value after the first sprint, campaign, or deliverable is complete.
                </p>
                <p>
                  Every client engagement contributes to a growing system of knowledge, tooling, and
                  execution capability. That is how we get better over time — not by adding more
                  people, but by building better systems.
                </p>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { label: "Well-scoped", desc: "Defined boundaries, clear deliverables, agreed success criteria" },
                { label: "High-trust", desc: "Open communication, honest assessments, no hidden surprises" },
                { label: "Operationally useful", desc: "Builds things that the business actually uses and benefits from" },
                { label: "Measurable", desc: "Improvements can be tracked and attributed to specific changes" },
                { label: "Capable of compounding", desc: "Every engagement adds to a growing system, not a pile of one-offs" },
              ].map(({ label, desc }) => (
                <div key={label} className="flex items-start gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
                  <span className="mt-0.5 h-5 w-5 shrink-0 rounded-full bg-[rgb(var(--naya-sky)/0.15)] flex items-center justify-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-[rgb(var(--naya-sky))]" />
                  </span>
                  <div>
                    <p className="font-semibold text-sm text-[hsl(var(--foreground))]">{label}</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))] leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-y bg-[hsl(var(--muted)/0.3)]">
        <div className="container-narrow text-center">
          <h2 className="text-fluid-xl font-display font-black mb-5 text-balance">
            If this is how you think about growth too,{" "}
            <span className="gradient-text-dark dark:gradient-text">we should talk.</span>
          </h2>
          <Link href="/contact" className="btn-primary btn-lg gap-2.5">
            Talk to Shasvata
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
