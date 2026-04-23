import {
  BarChart3, Workflow, Database, LayoutDashboard, Bot, Repeat2,
} from "lucide-react";
import { whatWeHelpBuild } from "@/content/site";

const iconMap = { BarChart3, Workflow, Database, LayoutDashboard, Bot, Repeat2 };

export function WhatWeBuildSection() {
  return (
    <section className="section-y relative overflow-hidden bg-white">
      <div className="absolute inset-0 bg-grid opacity-[0.03]" aria-hidden="true" />
      <div className="container-naya">
        <div className="relative mb-14 max-w-2xl">
          <p className="eyebrow mb-4">Delivery Depth</p>
          <h2 className="text-fluid-xl mb-4 font-display font-black text-slate-950">
            What we help businesses{" "}
            <span className="gradient-brand">build</span>
          </h2>
          <p className="max-w-xl leading-relaxed text-slate-700">
            Naya does not only deliver outputs. We help design and implement the systems behind them —
            so every engagement creates lasting operational value.
          </p>
        </div>

        <div className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {whatWeHelpBuild.map((item) => {
            const Icon = iconMap[item.icon as keyof typeof iconMap];
            return (
              <div
                key={item.title}
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_12px_30px_rgb(15_23_42/_0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-[rgb(var(--naya-sky)/0.35)] hover:shadow-[0_18px_40px_rgb(15_23_42/_0.08)]"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[rgb(var(--naya-sky)/0.12)] text-[rgb(var(--naya-sky))] transition-colors group-hover:bg-[rgb(var(--naya-sky)/0.18)]">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 font-semibold tracking-tight text-slate-950">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-700">
                  {item.body}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
