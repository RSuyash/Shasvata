"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const serviceLayers = [
  {
    label: "Tech",
    title: "Build the operating layer.",
    description:
      "Web, CRM, automation, internal tools, and AI-assisted workflows that reduce manual drag.",
    bullets: ["Web and conversion systems", "CRM and workflow automation", "Internal tooling and integrations"],
    frame: "border-[rgb(var(--naya-blue)/0.18)] bg-[rgb(var(--naya-blue)/0.03)]",
    badge: "bg-[rgb(var(--naya-blue)/0.08)] text-[rgb(var(--naya-blue))] ring-[rgb(var(--naya-blue)/0.12)]",
  },
  {
    label: "Marketing",
    title: "Drive demand with structure.",
    description:
      "Performance, content, and conversion systems built to compound rather than fragment.",
    bullets: ["Performance and demand generation", "Content and social systems", "Landing pages and conversion layers"],
    frame: "border-slate-200 bg-white",
    badge: "bg-slate-100 text-slate-800 ring-slate-200",
  },
  {
    label: "Advisory",
    title: "Align the growth model.",
    description:
      "Positioning, offers, and operating guidance that keeps execution tied to strategy.",
    bullets: ["Positioning and offer architecture", "Go-to-market planning", "Process and operating model design"],
    frame: "border-slate-200 bg-[rgb(15_23_42/0.015)]",
    badge: "bg-slate-100 text-slate-700 ring-slate-200",
  },
] as const;

export function ServiceStackSection() {
  return (
    <section
      id="service-stack"
      className="relative isolate overflow-hidden bg-[#f8fafc] py-14 scroll-mt-28 lg:py-16"
    >
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.06),transparent_54%)]"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.02)_1px,transparent_1px)] bg-[size:24px_24px] opacity-25"
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(37,99,235,0.22),transparent)]"
        aria-hidden="true"
      />

      <div className="container-naya relative z-10">
        <div className="relative overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/80 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-2xl md:p-8 lg:p-10">
          <div
            className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.84),rgba(248,250,252,0.48))]"
            aria-hidden="true"
          />
          <div
            className="absolute -right-20 top-8 h-56 w-56 rounded-full bg-[rgb(var(--naya-sky)/0.08)] blur-3xl"
            aria-hidden="true"
          />

          <div className="relative z-10 grid items-start gap-8 lg:grid-cols-[0.88fr_1.12fr] lg:gap-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-5 lg:pt-2"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-[rgb(var(--naya-sky))]" aria-hidden="true" />
                <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-600">
                  Service stack
                </span>
              </div>

              <h2 className="max-w-xl text-4xl font-black tracking-[-0.05em] text-slate-950 sm:text-[3.5rem] sm:leading-[0.95] lg:text-[4rem]">
                Three layers.
                <span className="text-[rgb(var(--naya-blue))]"> One operating system.</span>
              </h2>

              <p className="max-w-lg text-sm leading-relaxed text-slate-700 sm:text-[0.95rem]">
                We do not lead with disconnected tactics. We organize the work around marketing,
                technology, and advisory so each layer supports the next.
              </p>

              <div className="flex flex-wrap gap-2">
                {[
                  "Clear scope",
                  "Structured delivery",
                  "Compounding value",
                ].map((item) => (
                  <span
                    key={item}
                    className="inline-flex cursor-default items-center rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[rgb(var(--naya-blue)/0.3)] hover:text-[rgb(var(--naya-blue))] hover:shadow-md"
                  >
                    {item}
                  </span>
                ))}
              </div>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <Link
                  href="/contact"
                  className="group inline-flex items-center justify-center gap-2 rounded-full bg-[rgb(var(--naya-navy))] px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(15,23,42,0.14)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-neutral-800 hover:shadow-[0_12px_24px_rgba(15,23,42,0.2)]"
                >
                  Book a Growth Audit
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/services"
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-950 hover:shadow-sm"
                >
                  See the Service Stack
                </Link>
              </div>
            </motion.div>

            <div className="grid gap-4 md:grid-cols-3">
              {serviceLayers.map((layer, index) => (
                <motion.div
                  key={layer.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={cn(
                    "group relative overflow-hidden rounded-[1.4rem] border p-5 shadow-[0_14px_36px_rgba(15,23,42,0.05)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_24px_48px_rgba(15,23,42,0.12)] cursor-default",
                    layer.frame,
                  )}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/0 transition-colors duration-500 group-hover:from-white/40 group-hover:to-transparent" aria-hidden="true" />
                  <div className="relative z-10">
                    <div
                      className={cn(
                        "inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] ring-1 transition-all duration-300 group-hover:shadow-[0_0_12px_rgba(37,99,235,0.15)] group-hover:scale-105",
                        layer.badge,
                      )}
                    >
                      {layer.label}
                    </div>

                    <h3 className="mt-5 text-lg font-semibold tracking-[-0.02em] text-slate-950 transition-colors duration-300 group-hover:text-[rgb(var(--naya-blue))]">
                      {layer.title}
                    </h3>

                    <p className="mt-2 text-sm leading-relaxed text-slate-700">
                      {layer.description}
                    </p>

                    <ul className="mt-6 space-y-3">
                      {layer.bullets.map((bullet) => (
                        <li key={bullet} className="group/item flex items-start gap-2.5 text-sm text-slate-700 transition-colors duration-300 hover:text-slate-950">
                          <span className="mt-1.5 flex h-1.5 w-1.5 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--naya-blue)/0.4)] transition-all duration-300 group-hover/item:scale-[1.8] group-hover/item:bg-[rgb(var(--naya-blue))]" aria-hidden="true" />
                          <span className="transition-transform duration-300 group-hover/item:translate-x-0.5">{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export const ProblemsSection = ServiceStackSection;

export function CtaSection() {
  return (
    <section className="section-y bg-[#f8fafc]">
      <div className="container-narrow text-center">
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-12 shadow-[0_24px_60px_rgb(15_23_42/_0.08)] md:p-16">
          <div
            className="glow-orb absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 bg-[rgb(var(--naya-sky)/0.08)]"
            aria-hidden="true"
          />
          <div className="relative">
            <p className="eyebrow mb-6 justify-center">Next step</p>
            <h2 className="text-fluid-xl mb-5 font-display font-black text-balance text-slate-900">
              If you need more than execution, <span className="gradient-brand">let&apos;s talk.</span>
            </h2>
            <p className="mx-auto mb-10 max-w-xl leading-relaxed text-slate-700">
              Whether you need growth support, cleaner workflows, practical AI adoption, or a more
              reliable operating layer behind your business, Naya can help map the right next step.
            </p>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link href="/contact" className="btn-primary btn-lg gap-2.5">
                Book a Growth Audit
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/services" className="btn-secondary btn-lg">
                See the Service Stack
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
