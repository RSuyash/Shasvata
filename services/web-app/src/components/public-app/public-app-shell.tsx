import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { ROUTES, signInRedirect } from "@/lib/routes";
import { publicAppIdentity, publicPageLinks } from "@/lib/public-app-site";
import { AuthThemeToggle } from "@/components/landing-portal/auth-theme-toggle";

export function PublicAppShell(props: {
  eyebrow: string;
  title: string;
  description: string;
  primaryAction?: {
    label: string;
    href: string;
  };
  secondaryAction?: {
    label: string;
    href: string;
  };
  children: ReactNode;
}) {
  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "radial-gradient(circle at top left, var(--public-bg-overlay-a), transparent 26%), radial-gradient(circle at top right, var(--public-bg-overlay-b), transparent 24%), var(--public-bg)",
        color: "var(--public-foreground)",
      }}
    >
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 pb-10 pt-6 md:px-8">
        <header
          className="sticky top-4 z-20 rounded-[28px] border px-5 py-4 backdrop-blur"
          style={{
            borderColor: "var(--public-surface-card-border)",
            background: "var(--public-surface)",
            boxShadow: "0 24px 60px rgba(15, 23, 42, 0.08)",
          }}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <Link
                href={ROUTES.public.home}
                className="inline-flex items-center gap-3"
                style={{ color: "var(--public-foreground)" }}
              >
                <Image
                  src="/logo-icon.png"
                  alt="Shasvata"
                  width={40}
                  height={40}
                  className="rounded-xl"
                />
                <span>
                  <span
                    className="block font-display text-2xl font-black tracking-[-0.06em]"
                    style={{ color: "var(--public-foreground)" }}
                  >
                    {publicAppIdentity.name}
                  </span>
                  <span
                    className="block text-[11px] font-semibold uppercase tracking-[0.35em]"
                    style={{ color: "var(--public-foreground-muted)" }}
                  >
                    {publicAppIdentity.workspaceLabel}
                  </span>
                </span>
              </Link>
            </div>

            <nav
              className="flex flex-wrap items-center gap-2 text-sm font-semibold"
              style={{ color: "var(--public-foreground-secondary)" }}
            >
              {publicPageLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-full px-3 py-2 transition hover:opacity-80"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex flex-wrap items-center gap-3">
              <AuthThemeToggle />
              <Link
                href={signInRedirect(ROUTES.dashboard.root)}
                className="rounded-full border px-4 py-2 text-sm font-semibold transition hover:opacity-80"
                style={{
                  borderColor: "var(--public-border)",
                  color: "var(--public-foreground-secondary)",
                }}
              >
                Sign in
              </Link>
              <Link
                href={ROUTES.auth.signIn}
                className="rounded-full px-4 py-2 text-sm font-semibold shadow-lg transition hover:-translate-y-0.5"
                style={{
                  background: "var(--public-button-primary-bg)",
                  color: "var(--public-button-primary-text)",
                }}
              >
                Get started
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1">
          <section className="grid gap-10 px-1 pb-12 pt-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div className="max-w-3xl">
              <p
                className="text-xs font-black uppercase tracking-[0.42em]"
                style={{ color: "var(--public-accent)" }}
              >
                {props.eyebrow}
              </p>
              <h1
                className="mt-5 font-display text-5xl font-black tracking-[-0.07em] md:text-7xl"
                style={{ color: "var(--public-foreground)" }}
              >
                {props.title}
              </h1>
              <p
                className="mt-6 max-w-2xl text-lg leading-8"
                style={{ color: "var(--public-foreground-secondary)" }}
              >
                {props.description}
              </p>
              {props.primaryAction || props.secondaryAction ? (
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  {props.primaryAction ? (
                    <Link
                      href={props.primaryAction.href}
                      className="rounded-full px-5 py-3 text-sm font-bold shadow-lg transition hover:-translate-y-0.5"
                      style={{
                        background:
                          "linear-gradient(135deg, #2046ff 0%, #2a6df6 48%, #14c8ff 100%)",
                        color: "#ffffff",
                      }}
                    >
                      {props.primaryAction.label}
                    </Link>
                  ) : null}
                  {props.secondaryAction ? (
                    <Link
                      href={props.secondaryAction.href}
                      className="rounded-full border px-5 py-3 text-sm font-bold transition hover:opacity-80"
                      style={{
                        borderColor: "var(--public-border)",
                        background: "var(--public-surface)",
                        color: "var(--public-foreground-secondary)",
                      }}
                    >
                      {props.secondaryAction.label}
                    </Link>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div
              className="rounded-[32px] border p-6 shadow-[0_28px_64px_rgba(15,23,42,0.08)]"
              style={{
                borderColor: "var(--public-surface-card-border)",
                background: "var(--public-hero-gradient)",
              }}
            >
              <p
                className="text-xs font-black uppercase tracking-[0.34em]"
                style={{ color: "var(--public-foreground-muted)" }}
              >
                Why this page exists
              </p>
              <div className="mt-4 grid gap-3">
                {[
                  "Clients can browse services, review policies, and verify pricing in INR before checkout.",
                  "The same app domain handles billing, project workspaces, and delivery visibility after sign-in.",
                  "This public surface keeps payment-provider and compliance review simple without exposing private workspace data.",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-[22px] border px-4 py-4 text-sm leading-6"
                    style={{
                      borderColor: "var(--public-border)",
                      background: "var(--public-surface)",
                      color: "var(--public-foreground-secondary)",
                    }}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <div className="space-y-10">{props.children}</div>
        </main>

        <footer
          className="mt-12 rounded-[28px] border px-6 py-6 text-sm backdrop-blur"
          style={{
            borderColor: "var(--public-border)",
            background: "var(--public-surface)",
            color: "var(--public-foreground-secondary)",
            boxShadow: "0 22px 54px rgba(15, 23, 42, 0.06)",
          }}
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p
                className="font-semibold"
                style={{ color: "var(--public-foreground)" }}
              >
                {publicAppIdentity.name}
              </p>
              <p className="mt-1">
                Billing, onboarding, and project visibility for Shasvata services.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <a
                href={`mailto:${publicAppIdentity.supportEmail}`}
                className="transition hover:opacity-70"
                style={{ color: "var(--public-foreground)" }}
              >
                {publicAppIdentity.supportEmail}
              </a>
              <a
                href={`https://wa.me/${publicAppIdentity.supportPhoneDigits}`}
                className="transition hover:opacity-70"
                style={{ color: "var(--public-foreground)" }}
              >
                WhatsApp support
              </a>
              <span>{publicAppIdentity.location}</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
