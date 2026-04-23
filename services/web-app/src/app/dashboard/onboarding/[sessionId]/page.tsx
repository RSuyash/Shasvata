import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ProjectOnboardingWizard } from "@/components/commerce/project-onboarding-wizard";
import { ClientPortalShell } from "@/components/client-portal/client-portal-shell";
import { SignOutButton } from "@/components/landing-portal/sign-out-button";
import {
  fetchPortalSessionForApp,
  fetchProjectOnboardingForApp,
} from "@/lib/landing-portal";
import { buildPortfolioNav } from "@/lib/portal-nav";
import { ROUTES, signInRedirect } from "@/lib/routes";

function serializeCookieHeader() {
  return cookies()
    .getAll()
    .map((entry) => `${entry.name}=${entry.value}`)
    .join("; ");
}

export default async function ProjectOnboardingPage({
  params,
}: {
  params: { sessionId: string };
}) {
  const cookieHeader = serializeCookieHeader();
  const session = await fetchPortalSessionForApp(cookieHeader);
  const target = ROUTES.dashboard.onboarding(params.sessionId);

  if (!session) {
    redirect(signInRedirect(target));
  }

  const onboarding = await fetchProjectOnboardingForApp({
    sessionId: params.sessionId,
    cookieHeader,
  });

  return (
    <ClientPortalShell
      user={session.portalUser}
      sections={buildPortfolioNav("projects")}
      breadcrumbs={[
        {
          label: "Projects",
          href: ROUTES.dashboard.projects,
        },
        {
          label: "Onboarding",
        },
      ]}
      pageTitle="Finish your project brief"
      pageDescription="Payment is already collected. Use this wizard to hand over the exact launch brief, assets, compliance details, and section plan so the workspace can be created cleanly."
      utilityLabel="Post-payment onboarding"
      actions={
        <>
          <Link
            href={ROUTES.dashboard.products}
            className="inline-flex items-center justify-center rounded-full border border-[var(--portal-border)] bg-[var(--portal-surface)] px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--portal-foreground)] transition hover:border-[var(--portal-accent-border)] hover:bg-[var(--portal-badge-bg)]"
          >
            Storefront
          </Link>
          <Link
            href={ROUTES.dashboard.projects}
            className="inline-flex items-center justify-center rounded-full border border-[var(--portal-border)] bg-[var(--portal-surface-soft)] px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--portal-foreground)] transition hover:border-[var(--portal-accent-border)] hover:bg-[var(--portal-badge-bg)]"
          >
            Projects
          </Link>
          <SignOutButton variant="clientPortal" />
        </>
      }
    >
      <ProjectOnboardingWizard session={onboarding} />
    </ClientPortalShell>
  );
}
