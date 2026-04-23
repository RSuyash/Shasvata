"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight, Database, Layers, Network, Sparkles, Workflow } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ServiceTaxonomyNode } from "@/lib/service-taxonomy";

const domainIconMap = {
  MARKETING: Sparkles,
  TECH: Network,
  ADVISORY: Workflow,
} as const;

const categoryIconMap = {
  MARKETING: Layers,
  TECH: Database,
  ADVISORY: Workflow,
} as const;

const domainThemeMap = {
  MARKETING: {
    text: "text-sky-600",
    bg: "bg-sky-500",
    glow: "bg-sky-50",
    iconBg: "bg-sky-100 text-sky-600 group-hover/cat:bg-sky-500 group-hover/cat:text-white",
    badge: "bg-sky-50 text-sky-700 ring-sky-200/50",
  },
  TECH: {
    text: "text-[rgb(var(--naya-blue))]",
    bg: "bg-[rgb(var(--naya-blue))]",
    glow: "bg-[rgb(var(--naya-blue)/0.04)]",
    iconBg: "bg-[rgb(var(--naya-blue)/0.1)] text-[rgb(var(--naya-blue))] group-hover/cat:bg-[rgb(var(--naya-blue))] group-hover/cat:text-white",
    badge: "bg-[rgb(var(--naya-blue)/0.05)] text-[rgb(var(--naya-blue))] ring-[rgb(var(--naya-blue)/0.2)]",
  },
  ADVISORY: {
    text: "text-slate-700",
    bg: "bg-slate-700",
    glow: "bg-slate-100/50",
    iconBg: "bg-slate-100 text-slate-600 group-hover/cat:bg-slate-700 group-hover/cat:text-white",
    badge: "bg-slate-50 text-slate-700 ring-slate-200",
  }
} as const;

function countLeaves(node: ServiceTaxonomyNode): number {
  if (node.children.length === 0) return 1;
  return node.children.reduce((count, child) => count + countLeaves(child), 0);
}

function LeafRow({ label, href, domainTheme }: { label: string; href?: string | null; domainTheme: any }) {
  const content = (
    <>
      <span className="relative z-10 flex items-center gap-2.5 text-[12px] font-medium text-slate-600 transition-colors duration-300 group-hover/leaf:text-slate-950">
        <span className={cn("h-1 w-1 rounded-full transition-all duration-300 group-hover/leaf:scale-[1.5]", domainTheme.bg)} aria-hidden="true" />
        {label}
      </span>
      <ArrowRight className="relative z-10 h-3 w-3 text-slate-400 opacity-0 -translate-x-2 transition-all duration-300 group-hover/leaf:opacity-100 group-hover/leaf:translate-x-0 group-hover/leaf:text-slate-900" />
    </>
  );

  const baseClasses = "group/leaf relative flex w-full items-center justify-between rounded-lg px-2 py-1.5 transition-all duration-300 focus:outline-none hover:bg-slate-50/80";

  if (href) {
    return (
      <Link href={href} className={baseClasses}>
        <div className={cn("absolute inset-0 rounded-lg opacity-0 transition-opacity duration-300 group-hover/leaf:opacity-100", domainTheme.glow)} />
        {content}
      </Link>
    );
  }

  return (
    <div className={cn(baseClasses, "cursor-default")}>
      <div className={cn("absolute inset-0 rounded-lg opacity-0 transition-opacity duration-300 group-hover/leaf:opacity-100", domainTheme.glow)} />
      {content}
    </div>
  );
}

export function ServiceMapSection({ domains }: { domains: ServiceTaxonomyNode[] }) {
  return (
    <section className="relative isolate overflow-hidden bg-[#fafafa] py-20 lg:py-32">
      <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(15,23,42,0.06),transparent)]" aria-hidden="true" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.015)_1px,transparent_1px)] bg-[size:32px_32px]" aria-hidden="true" />

      <div className="container-naya relative z-10 max-w-7xl">
        <div className="mb-16 flex flex-col gap-6 border-b border-slate-200/60 pb-12 lg:mb-20 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-[rgb(var(--naya-blue))]" aria-hidden="true" />
              <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-600">
                Capability Directory
              </span>
            </div>
            <h2 className="text-4xl font-black tracking-[-0.03em] text-slate-950 sm:text-5xl">
              One operating system.<br className="hidden sm:block" />
              <span className="text-slate-400"> Many connected layers.</span>
            </h2>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="max-w-md hidden lg:block"
          >
            <p className="text-sm leading-relaxed text-slate-600">
              The database stores our service graph as a taxonomy with strict parent-child hierarchy.
              This directory surfaces that structural layer so you can navigate the business model at a glance.
            </p>
          </motion.div>
        </div>

        <div className="flex flex-col relative before:hidden lg:before:block before:absolute before:left-[300px] before:top-0 before:bottom-0 before:w-px before:bg-slate-200/60">
          {domains.map((domain, domainIndex) => {
            const Icon = domainIconMap[domain.domain];
            const theme = domainThemeMap[domain.domain];
            return (
              <motion.div
                key={domain.id}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-10%" }}
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
                }}
                className="group/section flex flex-col lg:flex-row gap-8 lg:gap-0 border-b border-slate-200/60 py-10 lg:py-16 last:border-0 last:pb-0 first:pt-2"
              >
                <motion.div 
                  variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } } }}
                  className="lg:w-[300px] lg:shrink-0 lg:pr-10 relative z-10"
                >
                  <div className="lg:sticky lg:top-32">
                    <div className={cn("inline-flex items-center rounded-full px-2.5 py-1 mb-5 text-[9px] font-bold uppercase tracking-[0.2em] ring-1 transition-transform duration-300 group-hover/section:scale-105", theme.badge)}>
                      {domain.label} Layer
                    </div>
                    <h3 className="mb-3 text-2xl font-black tracking-tight text-slate-950 transition-colors duration-300 group-hover/section:text-[rgb(var(--naya-blue))]">
                      {domain.summary ?? domain.label}
                    </h3>
                    <p className="mb-6 text-xs leading-relaxed text-slate-600">
                      {domain.description}
                    </p>
                    {domain.route && (
                      <Link 
                        href={domain.route} 
                        className="inline-flex items-center gap-1.5 text-[13px] font-bold text-slate-950 hover:text-[rgb(var(--naya-blue))] transition-colors"
                      >
                         Explore the layer <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    )}
                  </div>
                </motion.div>

                <motion.div 
                  variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
                  className="lg:flex-1 lg:pl-10 xl:pl-12 relative z-10"
                >
                  <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {domain.children.map((category, catIndex) => {
                      const CategoryIcon = categoryIconMap[domain.domain];
                      return (
                        <motion.div
                          key={category.id}
                          variants={{ 
                            hidden: { opacity: 0, y: 15 }, 
                            visible: { opacity: 1, y: 0, transition: { duration: 0.35, delay: catIndex * 0.08, ease: "easeOut" } } 
                          }}
                          className="group/cat relative flex flex-col overflow-hidden rounded-[1rem] border border-slate-200/80 bg-white/70 backdrop-blur-sm p-4 shadow-[0_2px_12px_rgba(15,23,42,0.02)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_8px_24px_rgba(15,23,42,0.05)] hover:border-slate-300"
                        >
                          <div className="mb-3 flex items-start gap-3">
                            <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-500", theme.iconBg)}>
                              <CategoryIcon className="h-4 w-4 transition-transform duration-500 group-hover/cat:scale-110" />
                            </div>
                            <div className="pt-0.5">
                              <h4 className="text-[13px] font-bold tracking-tight text-slate-900 group-hover/cat:text-[rgb(var(--naya-blue))] transition-colors duration-300 leading-snug">
                                {category.label}
                              </h4>
                            </div>
                          </div>

                          <div className="flex flex-col gap-0 border-t border-slate-100/80 pt-2.5 -mx-1 mt-auto">
                            {category.children.map((leaf) => (
                              <LeafRow key={leaf.id} label={leaf.label} href={leaf.route} domainTheme={theme} />
                            ))}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12 flex flex-col items-center justify-between gap-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:flex-row sm:p-8"
        >
          <div>
            <h4 className="text-base font-bold text-slate-950">Need the full capability matrix?</h4>
            <p className="mt-1 text-sm text-slate-600">
              Explore the master directory categorized by domain, capability, and specific solutions.
            </p>
          </div>
          <Link 
            href="/services" 
            className="group flex h-12 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[rgb(var(--naya-blue)/0.3)] hover:text-[rgb(var(--naya-blue))] hover:shadow-md"
          >
            Open Capabilities
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}