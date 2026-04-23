"use client";

import { Check } from "lucide-react";
import { trustStrip } from "@/content/site";

export function TrustStrip() {
  return (
    <section className="relative border-y border-slate-200 bg-[#f8fafc]">
      <div className="container-naya mx-auto px-4 py-12 lg:py-16">
        <div className="mx-auto max-w-5xl">
          <p className="text-center text-sm font-medium text-slate-700">
            {trustStrip.label}
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-8 md:gap-16">
            {trustStrip.metrics.map((metric) => (
              <div key={metric.label} className="text-center">
                <div className="text-2xl font-black text-slate-950 md:text-3xl">
                  {metric.value}
                </div>
                <div className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-700">
                  {metric.label}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {trustStrip.items.map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 rounded-lg border border-slate-100 bg-white px-4 py-3 shadow-sm"
              >
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-[rgb(var(--naya-blue))]" />
                <span className="text-sm text-slate-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
