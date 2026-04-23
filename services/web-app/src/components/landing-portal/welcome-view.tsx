"use client";

import Link from "next/link";
import Image from "next/image";
import { ROUTES } from "@/lib/routes";
import type { PortalUserSummary } from "@/lib/landing-portal";

type WelcomeViewProps = {
  user: PortalUserSummary;
};

function WelcomeStep({
  number,
  title,
  description,
  href,
  linkLabel,
  completed,
}: {
  number: number;
  title: string;
  description: string;
  href: string;
  linkLabel: string;
  completed: boolean;
}) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-4 rounded-[22px] border p-5 transition hover:-translate-y-0.5 hover:shadow-lg"
      style={{
        borderColor: completed
          ? "var(--portal-accent-border)"
          : "var(--portal-border)",
        background: completed
          ? "var(--portal-badge-bg)"
          : "var(--portal-surface-soft)",
      }}
    >
      <div
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold"
        style={{
          background: completed
            ? "var(--portal-tone-success-bg)"
            : "var(--portal-control)",
          color: completed
            ? "var(--portal-tone-success-text)"
            : "var(--portal-foreground)",
        }}
      >
        {completed ? "✓" : number}
      </div>
      <div className="flex-1">
        <h3
          className="text-[15px] font-semibold"
          style={{ color: "var(--portal-foreground)" }}
        >
          {title}
        </h3>
        <p
          className="mt-1 text-sm leading-6"
          style={{ color: "var(--portal-muted)" }}
        >
          {description}
        </p>
        <span
          className="mt-3 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.18em]"
          style={{ color: "var(--portal-badge-text)" }}
        >
          {linkLabel}
          <span aria-hidden="true">→</span>
        </span>
      </div>
    </Link>
  );
}

export function WelcomeView({ user }: WelcomeViewProps) {
  const firstName =
    user.fullName?.trim().split(/\s+/)[0] || "there";
  const hasName = Boolean(user.fullName?.trim());
  const hasCompany = Boolean(user.companyName?.trim());

  return (
    <div className="portal-fade-in space-y-6">
      {/* Welcome Hero */}
      <section
        className="relative overflow-hidden rounded-[36px] border p-6 lg:p-10"
        style={{
          borderColor: "var(--portal-border)",
          background: "var(--portal-hero-gradient)",
          boxShadow: "var(--portal-shadow)",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "var(--portal-hero-overlay)" }}
        />
        <div className="relative space-y-6">
          <div className="flex items-center gap-4">
            <Image
              src="/logo-icon.png"
              alt="Shasvata"
              width={48}
              height={48}
              className="rounded-xl"
            />
            <div>
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.24em]"
                style={{ color: "var(--portal-muted)" }}
              >
                Welcome to Shasvata
              </p>
              <h1
                className="mt-1 font-display text-4xl tracking-[-0.06em] sm:text-5xl lg:text-6xl"
                style={{ color: "var(--portal-foreground)" }}
              >
                Hello, {firstName}!
              </h1>
            </div>
          </div>

          <p
            className="max-w-2xl text-sm leading-7"
            style={{ color: "var(--portal-muted)" }}
          >
            Your workspace is ready. Complete the steps below to get the most out of your Shasvata portal — track projects, manage leads, review billing, and stay on top of delivery.
          </p>

          <div className="flex flex-wrap gap-3">
            <a
              href="mailto:support@shasvata.com?subject=Getting%20started%20with%20Shasvata"
              className="inline-flex items-center justify-center rounded-full border px-5 py-3 text-sm font-semibold transition hover:-translate-y-0.5"
              style={{
                borderColor: "var(--portal-accent-border)",
                background: "var(--portal-badge-bg)",
                color: "var(--portal-badge-text)",
              }}
            >
              Talk to our team
            </a>
            <Link
              href={ROUTES.dashboard.settings}
              className="inline-flex items-center justify-center rounded-full border px-5 py-3 text-sm font-semibold transition hover:opacity-80"
              style={{
                borderColor: "var(--portal-border)",
                background: "var(--portal-surface)",
                color: "var(--portal-foreground)",
              }}
            >
              Complete your profile
            </Link>
          </div>
        </div>
      </section>

      {/* Getting Started Steps */}
      <section
        className="portal-fade-in-delay-1 rounded-[28px] border p-6 lg:p-7"
        style={{
          borderColor: "var(--portal-border)",
          background: "var(--portal-card)",
          boxShadow: "var(--portal-shadow)",
        }}
      >
        <div>
          <p
            className="text-[14px] font-semibold tracking-tight"
            style={{ color: "var(--portal-foreground)" }}
          >
            Getting started
          </p>
          <p
            className="mt-1 max-w-2xl text-[13px] leading-relaxed"
            style={{ color: "var(--portal-muted)" }}
          >
            Complete these steps to set up your workspace.
          </p>
        </div>

        <div className="mt-6 grid gap-3 lg:grid-cols-2">
          <WelcomeStep
            number={1}
            title="Complete your profile"
            description="Add your full name and company to make collaboration easier."
            href={ROUTES.dashboard.settings}
            linkLabel="Go to settings"
            completed={hasName && hasCompany}
          />
          <WelcomeStep
            number={2}
            title="Explore the dashboard"
            description="Discover how to navigate projects, billing, and analytics from one place."
            href={ROUTES.dashboard.root}
            linkLabel="View dashboard"
            completed={false}
          />
          <WelcomeStep
            number={3}
            title="Contact our team"
            description="Let us know what you're building so we can set up your first project workspace."
            href="mailto:support@shasvata.com?subject=New%20project%20inquiry"
            linkLabel="Send email"
            completed={false}
          />
          <WelcomeStep
            number={4}
            title="Review billing & policies"
            description="Understand our terms, refund policy, and how billing works before getting started."
            href={ROUTES.dashboard.billing}
            linkLabel="View billing"
            completed={false}
          />
        </div>
      </section>

      {/* Quick Links */}
      <section className="portal-fade-in-delay-2 grid gap-4 sm:grid-cols-3">
        <a
          href="mailto:support@shasvata.com"
          className="rounded-[24px] border p-5 transition hover:-translate-y-0.5 hover:shadow-lg"
          style={{
            borderColor: "var(--portal-border)",
            background: "var(--portal-surface-soft)",
          }}
        >
          <span
            className="material-symbols-outlined text-[24px]"
            style={{ color: "var(--portal-badge-text)" }}
          >
            mail
          </span>
          <h3
            className="mt-3 text-sm font-semibold"
            style={{ color: "var(--portal-foreground)" }}
          >
            Email Support
          </h3>
          <p
            className="mt-1 text-xs leading-5"
            style={{ color: "var(--portal-muted)" }}
          >
            support@shasvata.com
          </p>
        </a>
        <a
          href="https://wa.me/917757077775"
          target="_blank"
          rel="noreferrer"
          className="rounded-[24px] border p-5 transition hover:-translate-y-0.5 hover:shadow-lg"
          style={{
            borderColor: "var(--portal-border)",
            background: "var(--portal-surface-soft)",
          }}
        >
          <span
            className="material-symbols-outlined text-[24px]"
            style={{ color: "var(--portal-badge-text)" }}
          >
            chat
          </span>
          <h3
            className="mt-3 text-sm font-semibold"
            style={{ color: "var(--portal-foreground)" }}
          >
            WhatsApp
          </h3>
          <p
            className="mt-1 text-xs leading-5"
            style={{ color: "var(--portal-muted)" }}
          >
            Quick support on WhatsApp
          </p>
        </a>
        <Link
          href={ROUTES.dashboard.settings}
          className="rounded-[24px] border p-5 transition hover:-translate-y-0.5 hover:shadow-lg"
          style={{
            borderColor: "var(--portal-border)",
            background: "var(--portal-surface-soft)",
          }}
        >
          <span
            className="material-symbols-outlined text-[24px]"
            style={{ color: "var(--portal-badge-text)" }}
          >
            settings
          </span>
          <h3
            className="mt-3 text-sm font-semibold"
            style={{ color: "var(--portal-foreground)" }}
          >
            Settings
          </h3>
          <p
            className="mt-1 text-xs leading-5"
            style={{ color: "var(--portal-muted)" }}
          >
            Profile, theme & preferences
          </p>
        </Link>
      </section>
    </div>
  );
}
