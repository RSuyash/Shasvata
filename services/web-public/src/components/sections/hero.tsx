import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { heroContent } from "@/content/site";

function SystemBadge() {
  return (
    <svg viewBox="0 0 220 36" className="system-badge-svg" aria-hidden="true">
      <rect className="system-badge-shell" x="1.5" y="1.5" width="217" height="33" rx="16.5" />

      <g transform="translate(14 11)">
        <path className="system-badge-stack" d="M 8,7 L 15,10.5 L 8,14 L 1,10.5 Z" />
        <path className="system-badge-stack" d="M 8,3.5 L 15,7 L 8,10.5 L 1,7 Z" />
        <path className="system-badge-stack" d="M 8,0 L 15,3.5 L 8,7 L 1,3.5 Z" />
      </g>

      <text className="system-badge-text" x="38" y="21.5">
        {heroContent.eyebrow.toUpperCase()}
      </text>
    </svg>
  );
}

export function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden bg-transparent text-[rgb(var(--naya-navy))]">
      <main className="relative z-10 mx-auto flex w-full max-w-[1200px] flex-col items-center px-6 pb-24 pt-28 md:pb-28 md:pt-36">
        <div className="gs-hero mb-6">
          <SystemBadge />
        </div>

        <h1 className="gs-hero mb-6 max-w-4xl text-center text-5xl font-bold tracking-[-0.03em] text-[rgb(var(--naya-navy))] drop-shadow-sm md:text-7xl lg:text-[5.5rem]">
          {heroContent.headline}
        </h1>

        <p className="gs-hero mb-10 inline-block max-w-2xl rounded-xl bg-white/65 px-4 py-2 text-center text-lg font-medium leading-relaxed text-slate-700 backdrop-blur-sm md:text-xl">
          {heroContent.subheadline}
        </p>

        <div className="gs-hero mb-6 flex flex-col gap-4 sm:flex-row">
          <Link
            href={heroContent.primaryCta.href}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[rgb(var(--naya-navy))] px-8 py-3.5 text-sm font-semibold tracking-wide text-white shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-neutral-800 hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)]"
          >
            {heroContent.primaryCta.label}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href={heroContent.secondaryCta.href}
            className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-8 py-3.5 text-sm font-semibold tracking-wide text-[rgb(var(--naya-navy))] transition-all duration-200 hover:border-gray-300 hover:bg-gray-50"
          >
            {heroContent.secondaryCta.label}
          </Link>
        </div>
      </main>
    </section>
  );
}

