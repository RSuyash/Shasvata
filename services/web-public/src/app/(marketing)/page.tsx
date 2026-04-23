import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";

const ShasvataHeroCanvas = dynamic(
  () => import("@/components/landing/shasvata-hero-canvas").then((mod) => mod.ShasvataHeroCanvas),
  { ssr: false },
);

const launchItems = [
  {
    label: "ICCAA",
    value: "Live now",
    detail: "Public intelligence surface for accountability-focused climate research.",
  },
  {
    label: "Workspace",
    value: "Ready on /app",
    detail: "Auth, client access, project operations, and platform controls are now under one Shasvata runtime.",
  },
  {
    label: "Direction",
    value: "Long horizon",
    detail: "Built for enduring sustainability systems rather than short-lived announcement pages.",
  },
];

export const metadata: Metadata = {
  title: "Shasvata | Long-Horizon Sustainability Intelligence",
  description:
    "Shasvata is the umbrella platform. ICCAA is the first public surface. The root site acts as the launch membrane for the larger sustainability intelligence stack.",
};

export default function MarketingHomePage() {
  return (
    <div className="relative isolate overflow-hidden bg-[#07100b] text-[#f4f0e8]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(149,214,160,0.24),_transparent_34%),linear-gradient(160deg,_rgba(255,255,255,0.03),_transparent_40%)]" />
      <div className="absolute inset-0 opacity-[0.16] [background-image:linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:72px_72px]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,16,11,0.16)_0%,rgba(7,16,11,0.72)_45%,#07100b_100%)]" />

      <section className="relative mx-auto flex min-h-screen w-full max-w-[1600px] flex-col px-6 py-8 sm:px-10 lg:px-14">
        <header className="relative z-20 flex items-center justify-between gap-6">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-sm font-semibold tracking-[0.35em] text-[#dff5d8]">
              S
            </div>
            <div>
              <p className="font-display text-2xl leading-none tracking-[0.12em] text-[#f7f1e5]">
                Shasvata
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.38em] text-[#b7c4b2]">
                long-horizon systems
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/app"
              className="inline-flex items-center rounded-full border border-white/12 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-[#e8e2d6] transition hover:border-white/25 hover:bg-white/6"
            >
              Workspace
            </Link>
            <Link
              href="https://iccaa.shasvata.com"
              className="inline-flex items-center rounded-full bg-[#d9f0d1] px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.28em] text-[#0b130d] transition hover:translate-y-[-1px] hover:bg-white"
            >
              Open ICCAA
            </Link>
          </div>
        </header>

        <div className="relative z-10 grid flex-1 items-center gap-14 py-16 lg:grid-cols-[1.08fr_0.92fr] lg:py-12">
          <div className="relative z-20 max-w-3xl">
            <div className="inline-flex items-center gap-3 rounded-full border border-[#d6edcf]/14 bg-white/5 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.34em] text-[#d5efd1]">
              <span className="h-2 w-2 rounded-full bg-[#b7f0b3] shadow-[0_0_16px_rgba(183,240,179,0.95)]" />
              Systems for accountable sustainability intelligence
            </div>

            <h1 className="mt-8 max-w-4xl font-display text-6xl leading-[0.92] tracking-[-0.04em] text-[#f7f1e5] sm:text-7xl lg:text-[6.4rem]">
              Build the quiet infrastructure behind
              <span className="ml-3 inline-block text-[#b6e3b4]">enduring climate work.</span>
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-8 text-[#c9d2c5] sm:text-lg">
              Shasvata is the umbrella platform. ICCAA is the first public surface. What launches here is not a
              brochure system, but a long-horizon operating layer for sustainability research, analytical products,
              and institution-grade intelligence.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="https://iccaa.shasvata.com"
                className="inline-flex min-w-[220px] items-center justify-center rounded-full bg-[#f0eadb] px-7 py-4 text-sm font-semibold uppercase tracking-[0.24em] text-[#08100a] transition hover:translate-y-[-1px] hover:bg-white"
              >
                Launch ICCAA
              </Link>
              <Link
                href="/app"
                className="inline-flex min-w-[220px] items-center justify-center rounded-full border border-[#f4f0e8]/16 bg-white/5 px-7 py-4 text-sm font-semibold uppercase tracking-[0.24em] text-[#f4f0e8] transition hover:border-[#f4f0e8]/26 hover:bg-white/8"
              >
                Enter Shasvata Workspace
              </Link>
            </div>

            <div className="mt-14 grid gap-4 sm:grid-cols-3">
              {launchItems.map((item) => (
                <div
                  key={item.label}
                  className="rounded-[1.75rem] border border-white/10 bg-white/[0.045] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.18)] backdrop-blur"
                >
                  <p className="text-[10px] uppercase tracking-[0.32em] text-[#aeb9aa]">{item.label}</p>
                  <p className="mt-3 text-xl font-semibold text-[#f6f1e7]">{item.value}</p>
                  <p className="mt-3 text-sm leading-6 text-[#b7c2b2]">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative min-h-[420px] lg:min-h-[720px]">
            <div className="absolute inset-0 rounded-[2.6rem] border border-white/10 bg-white/[0.025] shadow-[0_40px_160px_rgba(0,0,0,0.45)] backdrop-blur-xl" />
            <div className="absolute inset-5 overflow-hidden rounded-[2.2rem] border border-white/8 bg-[#08110c]">
              <ShasvataHeroCanvas />
              <div className="pointer-events-none absolute left-6 top-6 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-[10px] uppercase tracking-[0.34em] text-[#d6e9cf] backdrop-blur">
                living surface
              </div>
              <div className="pointer-events-none absolute bottom-6 left-6 right-6 rounded-[1.5rem] border border-white/10 bg-black/28 p-5 backdrop-blur-md">
                <p className="text-[10px] uppercase tracking-[0.3em] text-[#b6c1b3]">Release note</p>
                <p className="mt-3 text-lg leading-7 text-[#f5f0e6]">
                  The Shasvata root now acts as a minimal launch surface while ICCAA carries the first full analytical
                  runtime on its own domain.
                </p>
              </div>
            </div>
          </div>
        </div>

        <footer className="relative z-20 flex flex-col gap-4 border-t border-white/10 py-6 text-sm text-[#aeb8aa] sm:flex-row sm:items-center sm:justify-between">
          <p>Shasvata is being assembled as a durable platform for sustainability intelligence and research operations.</p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/privacy" className="transition hover:text-[#f7f1e5]">
              Privacy
            </Link>
            <Link href="/terms" className="transition hover:text-[#f7f1e5]">
              Terms
            </Link>
            <Link href="mailto:hello@shasvata.com" className="transition hover:text-[#f7f1e5]">
              hello@shasvata.com
            </Link>
          </div>
        </footer>
      </section>
    </div>
  );
}
