import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ClientPortalShell } from "@/components/client-portal/client-portal-shell";
import { DashboardOverviewHome } from "@/components/landing-portal/dashboard-overview-home";
import { WelcomeView } from "@/components/landing-portal/welcome-view";
import { SignOutButton } from "@/components/landing-portal/sign-out-button";
import {
  buildDashboardOverview,
  buildProjectsDashboard,
} from "@/lib/client-portal-dashboard";
import {
  fetchPortfolioBillingForApp,
  fetchPortalSessionForApp,
  fetchProjectDetailForApp,
  fetchProjectsForApp,
} from "@/lib/landing-portal";
import { buildPortfolioNav } from "@/lib/portal-nav";
import { ROUTES, signInRedirect } from "@/lib/routes";

function serializeCookieHeader() {
  return cookies()
    .getAll()
    .map((entry) => `${entry.name}=${entry.value}`)
    .join("; ");
}

export default async function DashboardPage() {
  const cookieHeader = serializeCookieHeader();
  const session = await fetchPortalSessionForApp(cookieHeader);

  if (!session) {
    redirect(signInRedirect(ROUTES.dashboard.root));
  }

  try {
    const projects = await fetchProjectsForApp(cookieHeader);

    // New user with 0 projects → show welcome/onboarding view
    if (projects.length === 0) {
      return (
        <ClientPortalShell
          user={session.portalUser}
          sections={buildPortfolioNav("overview")}
          pageTitle="Welcome"
          pageDescription="Your workspace is ready. Let's get you set up."
          utilityLabel="Getting started"
          actions={<SignOutButton variant="clientPortal" />}
        >
          <WelcomeView user={session.portalUser} />
        </ClientPortalShell>
      );
    }

    const portfolio = buildProjectsDashboard(projects);
    const curatedProjects = portfolio.portfolio.slice(0, 3);
    const details = (
      await Promise.all(
        curatedProjects.map(async (project) => {
          try {
            return await fetchProjectDetailForApp({
              cookieHeader,
              projectId: project.id,
            });
          } catch (detailError) {
            console.error("Failed to load overview project detail", {
              projectId: project.id,
              detailError,
            });
            return null;
          }
        }),
      )
    ).filter((project): project is NonNullable<typeof project> => Boolean(project));

    let billingSummary: Awaited<
      ReturnType<typeof fetchPortfolioBillingForApp>
    >["summary"] | null = null;

    try {
      billingSummary = (await fetchPortfolioBillingForApp(cookieHeader)).summary;
    } catch (billingError) {
      console.error("Failed to load dashboard billing summary", {
        billingError,
      });
    }

    const overview = buildDashboardOverview({
      projects,
      details,
      billingSummary,
    });

    return (
      <ClientPortalShell
        user={session.portalUser}
        sections={buildPortfolioNav("overview")}
        pageTitle="Overview"
        pageDescription="A calm, premium home for the portal. Start from the surface that fits your next move instead of diving straight into a long project list."
        utilityLabel={session.portalUser.companyName || "Workspace home"}
        actions={<SignOutButton variant="clientPortal" />}
      >
        <DashboardOverviewHome user={session.portalUser} model={overview} />
      </ClientPortalShell>
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "The dashboard overview is temporarily unavailable.";

    return (
      <main className="client-portal-stage flex min-h-screen items-center justify-center px-6">
        <div className="client-portal-card max-w-2xl rounded-[32px] p-8">
          <p className="text-xs uppercase tracking-[0.28em] text-rose-500/80 dark:text-rose-200/70">
            Overview unavailable
          </p>
          <h1 className="mt-3 font-display text-3xl tracking-tight text-[var(--portal-foreground)]">
            We could not load the dashboard home right now.
          </h1>
          <p className="mt-4 text-sm leading-7 text-[var(--portal-muted)]">{message}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={ROUTES.dashboard.projects}
              className="inline-flex items-center rounded-full border border-[var(--portal-accent-border)] bg-[var(--portal-badge-bg)] px-4 py-2 text-sm font-semibold text-[var(--portal-badge-text)] transition hover:bg-[var(--portal-surface-soft)]"
            >
              Open projects
            </Link>
            <Link
              href={ROUTES.dashboard.billing}
              className="inline-flex items-center rounded-full border border-[var(--portal-border)] px-4 py-2 text-sm font-semibold text-[var(--portal-foreground)] transition hover:bg-[var(--portal-surface-soft)]"
            >
              Open billing
            </Link>
          </div>
        </div>
      </main>
    );
  }
}
