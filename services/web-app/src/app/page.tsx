import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PublicAppShell } from "@/components/public-app/public-app-shell";
import { fetchPortalSessionForApp } from "@/lib/landing-portal";
import { ROUTES } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Shasvata App | Client Workspace",
  description:
    "Sign in to your Shasvata workspace for project visibility, launch tracking, lead sync, and billing.",
  robots: { index: true, follow: true },
};

function serializeCookieHeader() {
  return cookies()
    .getAll()
    .map((entry) => `${entry.name}=${entry.value}`)
    .join("; ");
}

export default async function Home() {
  const session = await fetchPortalSessionForApp(serializeCookieHeader());

  if (session) {
    redirect(ROUTES.dashboard.root);
  }

  return (
    <PublicAppShell
      eyebrow="Client workspace"
      title="Your projects, billing, and delivery — all in one place."
      description="Sign in to your Shasvata workspace to track active projects, review billing, manage leads, and access delivery updates."
      primaryAction={{
        label: "Sign in to workspace",
        href: ROUTES.auth.signIn,
      }}
      secondaryAction={{
        label: "Contact us",
        href: ROUTES.public.contact,
      }}
    >
      <section className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
        <div
          className="rounded-[30px] border p-6"
          style={{
            borderColor: "var(--public-surface-card-border)",
            background: "var(--public-hero-gradient)",
            boxShadow: "0 24px 58px rgba(15, 23, 42, 0.08)",
          }}
        >
          <p
            className="text-xs font-black uppercase tracking-[0.24em]"
            style={{ color: "var(--public-foreground-muted)" }}
          >
            How the flow works
          </p>
          <div className="mt-4 grid gap-3">
            {[
              "1. Sign in or create your workspace account.",
              "2. View your active projects and delivery progress.",
              "3. Track leads, review billing, and manage payments.",
              "4. Access your live website and delivery updates anytime.",
            ].map((step) => (
              <div
                key={step}
                className="rounded-[22px] border px-4 py-4 text-sm leading-6"
                style={{
                  borderColor: "var(--public-border)",
                  background: "var(--public-surface)",
                  color: "var(--public-foreground-secondary)",
                }}
              >
                {step}
              </div>
            ))}
          </div>
        </div>

        <div
          className="rounded-[30px] border p-6"
          style={{
            borderColor: "var(--public-surface-card-border)",
            background: "var(--public-surface-card)",
            boxShadow: "0 24px 58px rgba(15, 23, 42, 0.08)",
          }}
        >
          <p
            className="text-xs font-black uppercase tracking-[0.24em]"
            style={{ color: "var(--public-foreground-muted)" }}
          >
            Resources
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {[
              {
                title: "Contact us",
                body: "Billing, support, and business contact information for client and payment-provider review.",
                href: ROUTES.public.contact,
              },
              {
                title: "Terms and privacy",
                body: "Commercial usage terms and privacy handling are kept visible on the app domain.",
                href: ROUTES.public.terms,
              },
              {
                title: "Refunds and cancellations",
                body: "A dedicated refund and cancellation policy for payment review.",
                href: ROUTES.public.refunds,
              },
              {
                title: "Privacy policy",
                body: "How we handle your data and protect your information.",
                href: ROUTES.public.privacy,
              },
            ].map((card) => (
              <Link
                key={card.title}
                href={card.href}
                className="rounded-[22px] border px-5 py-5 transition hover:-translate-y-0.5"
                style={{
                  borderColor: "var(--public-border)",
                  background: "var(--public-surface)",
                  color: "var(--public-foreground-secondary)",
                }}
              >
                <p
                  className="text-lg font-semibold"
                  style={{ color: "var(--public-foreground)" }}
                >
                  {card.title}
                </p>
                <p className="mt-2 text-sm leading-7">{card.body}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </PublicAppShell>
  );
}
