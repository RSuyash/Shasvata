import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ClientPortalKpiCard } from "@/components/client-portal/client-portal-kpi-card";
import {
  ClientPortalDonutPanel,
  ClientPortalMiniBars,
  ClientPortalProgressRows,
  ClientPortalSectionCard,
  ClientPortalStatusPill,
} from "@/components/client-portal/client-portal-panels";
import { ClientPortalShell } from "@/components/client-portal/client-portal-shell";
import { ClientProjectsOverview } from "@/components/landing-portal/client-projects-overview";
import { SignOutButton } from "@/components/landing-portal/sign-out-button";
import { buildProjectsDashboard } from "@/lib/client-portal-dashboard";
import { buildPortfolioNav } from "@/lib/portal-nav";
import { ROUTES, signInRedirect } from "@/lib/routes";
import {
  fetchPortalSessionForApp,
  fetchProjectDetailForApp,
  fetchProjectsForApp,
  formatPortalDate,
} from "@/lib/landing-portal";

function serializeCookieHeader() {
  return cookies()
    .getAll()
    .map((entry) => `${entry.name}=${entry.value}`)
    .join("; ");
}

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en-IN", {
    notation: value >= 1000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value);
}

function percent(part: number, total: number) {
  if (!total) {
    return 0;
  }

  return Math.round((part / total) * 100);
}

function statusTone(status: "DRAFT" | "ACTIVE" | "ARCHIVED") {
  switch (status) {
    case "ACTIVE":
      return "success" as const;
    case "ARCHIVED":
      return "neutral" as const;
    default:
      return "warning" as const;
  }
}

export default async function ProjectsPage() {
  const cookieHeader = serializeCookieHeader();
  const session = await fetchPortalSessionForApp(cookieHeader);

  if (!session) {
    redirect(signInRedirect(ROUTES.dashboard.projects));
  }

  try {
    const projects = await fetchProjectsForApp(cookieHeader);
    const detailedProjects = (
      await Promise.all(
        projects.map(async (project) => {
          try {
            return await fetchProjectDetailForApp({
              cookieHeader,
              projectId: project.id,
            });
          } catch {
            return null;
          }
        }),
      )
    ).filter((project): project is NonNullable<typeof project> => Boolean(project));

    const dashboard = buildProjectsDashboard(projects);
    const detailedProjectById = new Map(
      detailedProjects.map((project) => [project.id, project]),
    );

    if (session.portalUser.role === "CLIENT") {
      return (
        <ClientProjectsOverview
          user={session.portalUser}
          projects={projects}
          details={detailedProjects}
        />
      );
    }

    const featuredDetail = dashboard.featuredProject
      ? detailedProjectById.get(dashboard.featuredProject.id) || null
      : null;
    const totalLeadCount = detailedProjects.reduce(
      (sum, project) => sum + project.leadCount,
      0,
    );
    const publishedSiteCount = detailedProjects.reduce(
      (sum, project) =>
        sum + project.sites.filter((site) => site.publishStatus === "PUBLISHED").length,
      0,
    );
    const activeDomainCount = detailedProjects.reduce(
      (sum, project) =>
        sum + project.domains.filter((domain) => domain.status === "ACTIVE").length,
      0,
    );
    const activeSyncCount = detailedProjects.reduce(
      (sum, project) =>
        sum + project.syncTargets.filter((target) => target.status === "ACTIVE").length,
      0,
    );
    const activeMemberCount = detailedProjects.reduce(
      (sum, project) =>
        sum + project.members.filter((member) => member.status === "ACTIVE").length,
      0,
    );
    const totalDomainCount = detailedProjects.reduce(
      (sum, project) => sum + project.domains.length,
      0,
    );
    const totalMemberCount = detailedProjects.reduce(
      (sum, project) => sum + project.members.length,
      0,
    );
    const deliveryColumns = dashboard.portfolio.slice(0, 3).map((project) => {
      const detail = detailedProjectById.get(project.id);
      const shortLabel = project.name.split(" ")[0] || project.name;

      return {
        label: shortLabel,
        valueLabel: `${formatCompactNumber(detail?.leadCount || 0)} leads`,
        stacks: [
          {
            value:
              detail?.sites.filter((site) => site.publishStatus === "PUBLISHED").length || 0,
            tone: "indigo" as const,
          },
          {
            value:
              detail?.domains.filter((domain) => domain.status === "ACTIVE").length || 0,
            tone: "blue" as const,
          },
          {
            value:
              detail?.members.filter((member) => member.status === "ACTIVE").length || 0,
            tone: "cyan" as const,
          },
        ],
      };
    });
    const syncRows = detailedProjects
      .flatMap((project) =>
        project.syncTargets.map((target) => ({
          id: target.id,
          projectName: project.name,
          label: target.label || target.kind,
          status: target.status,
          sheetName:
            "sheetName" in target.config
              ? target.config.sheetName
              : target.label || "MDOC push",
        })),
      )
      .slice(0, 5);
    const navSections = buildPortfolioNav("projects");

    return (
      <ClientPortalShell
        user={session.portalUser}
        sections={navSections}
        pageTitle="Client-ready visibility without the ERP feel."
        pageDescription={`Signed in as ${
          session.portalUser.fullName || session.portalUser.email
        }. This account dashboard turns your project portfolio into a premium workspace for reviews, delivery visibility, and client-safe operational insight.`}
        utilityLabel="Portfolio live view"
        actions={<SignOutButton variant="clientPortal" />}
      >
        <div className="space-y-6" id="overview">
          <section className="grid gap-4 xl:grid-cols-4">
            <ClientPortalKpiCard
              label="Accessible workspaces"
              value={formatCompactNumber(dashboard.metrics.workspaceCount)}
              detail={`${dashboard.metrics.activeWorkspaceCount} active, ${dashboard.metrics.archivedWorkspaceCount} archived`}
              change={`${dashboard.metrics.ownerWorkspaceCount} owner`}
              tone="indigo"
            />
            <ClientPortalKpiCard
              label="Lead intake"
              value={formatCompactNumber(totalLeadCount)}
              detail="Captured across the portfolio"
              change={`${formatCompactNumber(activeSyncCount)} active sync`}
              tone="blue"
            />
            <ClientPortalKpiCard
              label="Live delivery"
              value={formatCompactNumber(publishedSiteCount + activeDomainCount)}
              detail={`${publishedSiteCount} published sites + ${activeDomainCount} active domains`}
              tone="cyan"
            />
            <ClientPortalKpiCard
              label="Connected team"
              value={formatCompactNumber(activeMemberCount)}
              detail="Members currently active inside visible workspaces"
              tone="slate"
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.18fr_0.82fr]" id="delivery">
            <ClientPortalMiniBars
              title="Delivery momentum"
              subtitle="The strongest workspaces rise to the top: each column blends published assets, active domains, and member coverage."
              columns={deliveryColumns}
            />

            <div className="space-y-6">
              <ClientPortalSectionCard
                title="Featured workspace"
                subtitle="The portfolio spotlight prioritizes active work and brings the cleanest live surface forward."
              >
                {dashboard.featuredProject ? (
                  <div className="space-y-5">
                    <div className="flex flex-wrap items-center gap-3">
                      <ClientPortalStatusPill
                        label={dashboard.featuredProject.status}
                        tone={statusTone(dashboard.featuredProject.status)}
                      />
                      <ClientPortalStatusPill
                        label={dashboard.featuredProject.membershipRole}
                        tone="indigo"
                      />
                    </div>

                    <div>
                      <h2 className="font-display text-4xl tracking-[-0.06em] text-[var(--portal-foreground)]">
                        {dashboard.featuredProject.name}
                      </h2>
                      <p className="mt-2 text-sm text-[var(--portal-muted)]">
                        {featuredDetail?.description || dashboard.spotlight.detail}
                      </p>
                      <p className="mt-3 text-xs uppercase tracking-[0.22em] text-[var(--portal-muted)]">
                        {dashboard.featuredProject.clientCompanyName || "Client company pending"}
                      </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-4">
                      <div className="rounded-[22px] bg-[var(--portal-surface-soft)] p-4">
                        <p className="text-xs uppercase tracking-[0.22em] text-[var(--portal-muted)]">
                          Domain
                        </p>
                        <p className="mt-2 text-sm font-semibold text-[var(--portal-foreground)]">
                          {dashboard.featuredProject.primaryDomain || "Pending"}
                        </p>
                      </div>
                      <div className="rounded-[22px] bg-[var(--portal-surface-soft)] p-4">
                        <p className="text-xs uppercase tracking-[0.22em] text-[var(--portal-muted)]">
                          Leads
                        </p>
                        <p className="mt-2 text-sm font-semibold text-[var(--portal-foreground)]">
                          {formatCompactNumber(featuredDetail?.leadCount || 0)}
                        </p>
                      </div>
                      <div className="rounded-[22px] bg-[var(--portal-surface-soft)] p-4">
                        <p className="text-xs uppercase tracking-[0.22em] text-[var(--portal-muted)]">
                          Members
                        </p>
                        <p className="mt-2 text-sm font-semibold text-[var(--portal-foreground)]">
                          {formatCompactNumber(featuredDetail?.members.length || 0)}
                        </p>
                      </div>
                      <div className="rounded-[22px] bg-[var(--portal-surface-soft)] p-4">
                        <p className="text-xs uppercase tracking-[0.22em] text-[var(--portal-muted)]">
                          Go live
                        </p>
                        <p className="mt-2 text-sm font-semibold text-[var(--portal-foreground)]">
                          {formatPortalDate(dashboard.featuredProject.goLiveAt)}
                        </p>
                      </div>
                    </div>

                    <Link
                      href={ROUTES.dashboard.project(dashboard.featuredProject.id)}
                      className="inline-flex items-center justify-center rounded-full border border-[var(--portal-accent-border)] bg-[var(--portal-badge-bg)] px-5 py-3 text-sm font-semibold text-[var(--portal-badge-text)] transition hover:bg-[var(--portal-surface-soft)]"
                    >
                      Open workspace
                    </Link>
                  </div>
                ) : (
                  <div className="rounded-[24px] border border-dashed border-[var(--portal-border)] px-5 py-10 text-center text-[var(--portal-muted)]">
                    A workspace will appear here once access is assigned.
                  </div>
                )}
              </ClientPortalSectionCard>

              <ClientPortalProgressRows
                title="Operational coverage"
                rows={[
                  {
                    label: "Active workspace coverage",
                    value: `${dashboard.metrics.activeWorkspaceCount}/${Math.max(
                      dashboard.metrics.workspaceCount,
                      1,
                    )}`,
                    progress: percent(
                      dashboard.metrics.activeWorkspaceCount,
                      dashboard.metrics.workspaceCount,
                    ),
                    tone: "indigo",
                  },
                  {
                    label: "Domain activation",
                    value: `${activeDomainCount}/${Math.max(totalDomainCount, 1)}`,
                    progress: percent(activeDomainCount, totalDomainCount),
                    tone: "blue",
                  },
                  {
                    label: "Team readiness",
                    value: `${activeMemberCount}/${Math.max(totalMemberCount, 1)}`,
                    progress: percent(activeMemberCount, totalMemberCount),
                    tone: "cyan",
                  },
                ]}
              />
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.14fr_0.86fr]" id="portfolio">
            <ClientPortalSectionCard
              title="Workspace portfolio"
              subtitle="Each card keeps the language client-facing: status, live surface, member access, and captured lead volume."
            >
              {dashboard.portfolio.length ? (
                <div className="grid gap-4 xl:grid-cols-2">
                  {dashboard.portfolio.map((project) => {
                    const detail = detailedProjectById.get(project.id);

                    return (
                      <Link
                        key={project.id}
                        href={ROUTES.dashboard.project(project.id)}
                        className="group rounded-[28px] border border-[var(--portal-border)] bg-[var(--portal-surface-soft)] p-5 transition hover:-translate-y-0.5 hover:border-[var(--portal-accent-border)] hover:shadow-[0_18px_50px_rgba(83,71,206,0.12)]"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <ClientPortalStatusPill
                            label={project.status}
                            tone={statusTone(project.status)}
                          />
                          <ClientPortalStatusPill label={project.membershipRole} tone="indigo" />
                        </div>

                        <h3 className="mt-5 font-display text-3xl tracking-[-0.05em] text-[var(--portal-foreground)]">
                          {project.name}
                        </h3>
                        <p className="mt-2 text-sm text-[var(--portal-muted)]">
                          {project.domainLabel}
                        </p>
                        <p className="mt-2 text-xs uppercase tracking-[0.22em] text-[var(--portal-muted)]">
                          {project.clientCompanyName || "Client company pending"}
                        </p>

                        <div className="mt-5 grid grid-cols-3 gap-3">
                          <div className="rounded-[20px] bg-[var(--portal-surface)] p-3">
                            <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--portal-muted)]">
                              Leads
                            </p>
                            <p className="mt-2 text-sm font-semibold text-[var(--portal-foreground)]">
                              {formatCompactNumber(detail?.leadCount || 0)}
                            </p>
                          </div>
                          <div className="rounded-[20px] bg-[var(--portal-surface)] p-3">
                            <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--portal-muted)]">
                              Members
                            </p>
                            <p className="mt-2 text-sm font-semibold text-[var(--portal-foreground)]">
                              {formatCompactNumber(detail?.members.length || 0)}
                            </p>
                          </div>
                          <div className="rounded-[20px] bg-[var(--portal-surface)] p-3">
                            <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--portal-muted)]">
                              Syncs
                            </p>
                            <p className="mt-2 text-sm font-semibold text-[var(--portal-foreground)]">
                              {formatCompactNumber(detail?.syncTargets.length || 0)}
                            </p>
                          </div>
                        </div>

                        <p className="mt-3 text-xs text-[var(--portal-muted)]">
                          Go live {formatPortalDate(project.goLiveAt)}
                        </p>

                        <p className="mt-5 text-sm font-semibold text-[var(--portal-badge-text)] transition group-hover:text-[var(--portal-foreground)]">
                          Open workspace
                        </p>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-[28px] border border-dashed border-[var(--portal-border)] px-6 py-12 text-center">
                  <p className="text-sm text-[var(--portal-muted)]">
                    No projects are linked to this portal user yet.
                  </p>
                </div>
              )}
            </ClientPortalSectionCard>

            <div className="space-y-6" id="connected">
              <ClientPortalDonutPanel
                title="Portfolio composition"
                subtitle="This balances live surfaces, published delivery, and active automation coverage."
                segments={[
                  {
                    label: "Live domains",
                    value: activeDomainCount,
                    tone: "indigo",
                  },
                  {
                    label: "Published sites",
                    value: publishedSiteCount,
                    tone: "blue",
                  },
                  {
                    label: "Active sync targets",
                    value: activeSyncCount,
                    tone: "cyan",
                  },
                ]}
              />

              <ClientPortalSectionCard
                title="Connected systems"
                subtitle="A compact view of the active sync layer across visible projects."
              >
                {syncRows.length ? (
                  <div className="space-y-3">
                    {syncRows.map((row) => (
                      <div
                        key={row.id}
                        className="rounded-[22px] border border-[var(--portal-border)] bg-[var(--portal-surface-soft)] px-4 py-4"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold text-[var(--portal-foreground)]">
                              {row.label}
                            </p>
                            <p className="mt-1 text-sm text-[var(--portal-muted)]">
                              {row.projectName} • {row.sheetName}
                            </p>
                          </div>
                          <ClientPortalStatusPill
                            label={row.status}
                            tone={row.status === "ACTIVE" ? "success" : "neutral"}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-[24px] border border-dashed border-[var(--portal-border)] px-5 py-10 text-center text-[var(--portal-muted)]">
                    No connected sync targets are visible yet.
                  </div>
                )}
              </ClientPortalSectionCard>
            </div>
          </section>
        </div>
      </ClientPortalShell>
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "The landing workspace is temporarily unavailable.";

    return (
      <main className="client-portal-stage flex min-h-screen items-center justify-center px-6">
        <div className="client-portal-card max-w-2xl rounded-[32px] p-8">
          <p className="text-xs uppercase tracking-[0.28em] text-rose-500/80 dark:text-rose-200/70">
            Portal Unavailable
          </p>
          <h1 className="mt-3 font-display text-3xl tracking-tight text-[var(--portal-foreground)]">
            We could not load the project workspace right now.
          </h1>
          <p className="mt-4 text-sm leading-7 text-[var(--portal-muted)]">{message}</p>
        </div>
      </main>
    );
  }
}
