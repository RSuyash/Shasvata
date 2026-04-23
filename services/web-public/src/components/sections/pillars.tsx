import Link from "next/link";
import { TrendingUp, Layers, Cpu, ArrowRight } from "lucide-react";
import { pillars } from "@/content/site";
import { cn } from "@/lib/utils";

const iconMap = { TrendingUp, Layers, Cpu };

export function PillarsSection() {
  return (
    <section className="section-y relative overflow-hidden bg-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.06),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(37,99,235,0.04),transparent_28%)]" aria-hidden="true" />
      <div className="absolute inset-0 bg-grid opacity-[0.04]" aria-hidden="true" />
      <div className="container-naya">

        {/* Header */}
        <div className="relative mb-14 max-w-2xl">
          <p className="eyebrow mb-4">Three Pillars</p>
          <h2 className="text-fluid-xl mb-4 font-display font-black text-slate-950">
            Growth, infrastructure, {" "}
            <span className="gradient-brand">and intelligence</span>
          </h2>
          <p className="max-w-xl leading-relaxed text-slate-700">
            Most businesses do not need one more disconnected service. They need the operating
            system behind growth to be clearer, faster, and easier to repeat.
          </p>
        </div>

        {/* Pillar cards */}
        <div className="relative grid gap-6 md:grid-cols-3">
          {pillars.map((pillar, i) => {
            const Icon = iconMap[pillar.icon as keyof typeof iconMap];
            return (
              <Link
                key={pillar.id}
                href={pillar.href}
                className={cn(
                  "group relative rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_12px_32px_rgb(15_23_42/_0.04)] transition-all duration-300",
                  "hover:-translate-y-1 hover:border-[rgb(var(--naya-sky)/0.28)] hover:shadow-[0_20px_50px_rgb(15_23_42/_0.1)]",
                  i === 1
                    ? "bg-[linear-gradient(180deg,#fbfdff_0%,#eef6ff_100%)]"
                    : "bg-white",
                )}
              >
                {/* Number */}
                <span className={cn(
                  "absolute top-6 right-6 text-xs font-bold tracking-widest",
                  i === 1 ? "text-[rgb(var(--naya-sky))]" : "text-slate-500",
                )}>
                  0{i + 1}
                </span>

                {/* Icon */}
                <div className={cn(
                  "mb-6 flex h-12 w-12 items-center justify-center rounded-2xl",
                  i === 1
                    ? "bg-white text-[rgb(var(--naya-sky))] shadow-sm"
                    : "bg-[rgb(var(--naya-sky)/0.12)] text-[rgb(var(--naya-sky))]",
                )}>
                  <Icon className="h-6 w-6" />
                </div>

                <h3 className={cn(
                  "mb-3 text-xl font-bold tracking-tight",
                  "text-slate-950",
                )}>
                  {pillar.headline}
                </h3>

                <p className={cn(
                  "text-sm leading-relaxed",
                  "text-slate-700",
                )}>
                  {pillar.body}
                </p>

                <div className={cn(
                  "mt-6 flex items-center gap-1.5 text-xs font-semibold",
                  "text-[rgb(var(--naya-blue))]",
                )}>
                  Explore
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
