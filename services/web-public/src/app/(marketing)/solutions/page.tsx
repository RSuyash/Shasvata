import type { Metadata } from "next";
import Link from "next/link";
import {
  Rocket, Megaphone, Settings2, Sparkles, ArrowUpRight,
  Puzzle, EyeOff, Users, HelpCircle, Timer, GitBranch, Activity,
  ArrowRight,
} from "lucide-react";
import { solutions, sharedProblems } from "@/content/site";

export const metadata: Metadata = {
  title: "Solutions",
  description:
    "See how Shasvata helps founders, operators, and businesses solve growth, systems, workflow, and AI adoption challenges.",
};

const iconMap = {
  Rocket, Megaphone, Settings2, Sparkles, ArrowUpRight,
  Puzzle, EyeOff, Users, HelpCircle, Timer, GitBranch, Activity,
};

export default function SolutionsPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-grid" aria-hidden="true" />
        <div className="glow-orb -z-10 absolute right-0 top-0 h-[350px] w-[350px] bg-[rgb(var(--naya-sky)/0.08)]" />
        <div className="container-naya">
          <p className="eyebrow mb-5">Who It's For</p>
          <h1 className="text-fluid-2xl font-display font-black mb-6 max-w-3xl text-balance">
            Solutions shaped around how businesses{" "}
            <span className="gradient-text-dark dark:gradient-text">actually get stuck.</span>
          </h1>
          <p className="max-w-2xl text-lg text-[hsl(var(--muted-foreground))] leading-relaxed">
            Different businesses use different language for the same underlying problems: scattered
            workflows, weak visibility, slow execution, fragile systems, and underused intelligence.
            Find your entry point below.
          </p>
        </div>
      </section>

      {/* Solution blocks */}
      <section className="section-y bg-[hsl(var(--background))]">
        <div className="container-naya space-y-6">
          {solutions.map((solution, i) => {
            const Icon = iconMap[solution.icon as keyof typeof iconMap];
            const isFlipped = i % 2 === 1;
            return (
              <div
                key={solution.id}
                className="group rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 md:p-10 transition-all duration-300 hover:border-[rgb(var(--naya-sky)/0.3)] hover:shadow-[var(--shadow-lg)]"
              >
                <div className={`flex flex-col gap-6 md:flex-row md:items-center md:gap-10 ${isFlipped ? "md:flex-row-reverse" : ""}`}>
                  {/* Icon block */}
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[rgb(var(--naya-sky)/0.1)] text-[rgb(var(--naya-sky))]">
                    <Icon className="h-8 w-8" />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-[rgb(var(--naya-sky))]">
                      0{i + 1}
                    </span>
                    <h2 className="mb-3 text-xl font-bold tracking-tight text-[hsl(var(--foreground))]">
                      {solution.headline}
                    </h2>
                    <p className="text-[hsl(var(--muted-foreground))] leading-relaxed mb-5 max-w-2xl">
                      {solution.body}
                    </p>
                    <Link
                      href={solution.href}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-[rgb(var(--naya-sky))] hover:gap-3 transition-all duration-200"
                    >
                      {solution.cta}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Shared problems */}
      <section className="section-y bg-[hsl(var(--muted)/0.3)]">
        <div className="container-naya">
          <div className="mb-12 max-w-2xl">
            <p className="eyebrow mb-4">Common Thread</p>
            <h2 className="text-fluid-xl font-display font-black mb-4">
              What these businesses usually{" "}
              <span className="gradient-text-dark dark:gradient-text">have in common</span>
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sharedProblems.map((problem) => {
              const Icon = iconMap[problem.icon as keyof typeof iconMap];
              return (
                <div
                  key={problem.label}
                  className="flex items-start gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4"
                >
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--naya-sky)/0.1)] text-[rgb(var(--naya-sky))]">
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className="text-sm text-[hsl(var(--muted-foreground))] leading-snug">
                    {problem.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-y bg-[hsl(var(--background))]">
        <div className="container-narrow text-center">
          <p className="eyebrow mb-5 justify-center">Next Step</p>
          <h2 className="text-fluid-xl font-display font-black mb-5 text-balance text-slate-950">
            Not sure where your problem fits?
          </h2>
          <p className="mx-auto mb-8 max-w-lg text-slate-700 leading-relaxed">
            That is normal. Most businesses describe symptoms first. We can help identify the
            system underneath the symptom.
          </p>
          <Link href="/contact" className="btn-primary btn-lg gap-2.5">
            Tell Us What You Need
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
