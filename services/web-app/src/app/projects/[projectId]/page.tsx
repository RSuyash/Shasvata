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
import { SignOutButton } from "@/components/landing-portal/sign-out-button";
import { ClientProjectDetailView } from "@/components/landing-portal/client-project-detail-view";
import { buildProjectWorkspace } from "@/lib/client-portal-dashboard";
import { buildProjectNav } from "@/lib/portal-nav";
import { ROUTES, signInRedirect } from "@/lib/routes";
import {
  buildLeadExportUrl,
  fetchPortalSessionForApp,
  fetchProjectBillingForApp,
  fetchProjectDetailForApp,
  fetchProjectLeadsForApp,
} from "@/lib/landing-portal";
import { formatCompactNumber, formatMoneyMinor, percent, formatPortalDate } from "@/lib/utils";
import { MeetaloKPIHeader, type MeetaloMetric } from "@/components/client-portal/meetalo-kpi-header";
import { MeetaloLeadsTable } from "@/components/client-portal/meetalo-leads-table";

function serializeCookieHeader() {
  return cookies()
    .getAll()
    .map((entry) => `${entry.name}=${entry.value}`)
    .join("; ");
}

// Optimization tones for downstream tags
function projectStatusTone(status: "DRAFT" | "ACTIVE" | "ARCHIVED") {
  switch (status) {
    case "ACTIVE":
      return "success" as const;
    case "ARCHIVED":
      return "neutral" as const;
    default:
      return "warning" as const;
  }
}

function domainTone(status: "PENDING" | "ACTIVE" | "ERROR") {
  switch (status) {
    case "ACTIVE":
      return "success" as const;
    case "ERROR":
      return "warning" as const;
    default:
      return "neutral" as const;
  }
}

function publishTone(status: "DRAFT" | "PUBLISHED" | "FAILED") {
  switch (status) {
    case "PUBLISHED":
      return "success" as const;
    case "FAILED":
      return "warning" as const;
    default:
      return "neutral" as const;
  }
}

export default async function ProjectDetailPage({
  params,
}: {
  params: { projectId: string };
}) {
  const cookieHeader = serializeCookieHeader();
  const session = await fetchPortalSessionForApp(cookieHeader);

  if (!session) {
    redirect(signInRedirect(ROUTES.dashboard.project(params.projectId)));
  }

  try {
    const [project, leads, billing] = await Promise.all([
      fetchProjectDetailForApp({
        cookieHeader,
        projectId: params.projectId,
      }),
      fetchProjectLeadsForApp({
        cookieHeader,
        projectId: params.projectId,
      }),
      fetchProjectBillingForApp({
        cookieHeader,
        projectId: params.projectId,
      }),
    ]);

    const workspace = buildProjectWorkspace(project, leads);
    const activeSyncCount = project.syncTargets.filter((target) => target.status === "ACTIVE")
      .length;
    const pendingLeadCount =
      leads.length - workspace.metrics.syncedLeadCount - workspace.metrics.failedLeadCount;

    const isAdmin = session.portalUser.role === "PLATFORM_ADMIN" || session.portalUser.role === "PLATFORM_OPERATOR";

    if (project.portalView === "CLIENT") {
      return (
        <ClientProjectDetailView
          user={session.portalUser}
          project={project}
          leads={leads}
        />
      );
    }

    const navSections = buildProjectNav(project.id, {
      activeItem: "overview",
      liveHref: workspace.primaryActionHref || project.liveUrl,
    });

    const kpiMetrics: MeetaloMetric[] = [
      {
        label: "Visible leads",
        value: formatCompactNumber(leads.length),
        trend: { value: percent(workspace.metrics.syncedLeadCount, leads.length), isUp: true },
      },
      {
        label: "Synced leads",
        value: workspace.metrics.syncedLeadCount,
      },
      {
        label: "Needs attention",
        value: workspace.metrics.failedLeadCount + pendingLeadCount,
      },
      {
        label: "Quoted value",
        value: formatMoneyMinor(billing.activeSnapshot?.totalMinor ?? 0),
      },
    ];

    if (isAdmin) {
      kpiMetrics.push(
        { label: "Conversion Rate", value: `${percent(workspace.metrics.syncedLeadCount, leads.length)}%` },
        { label: "Project ID", value: `${project.id.split("-")[0]}...` },
      );
    }

    return (
      <ClientPortalShell
        user={session.portalUser}
        sections={navSections}
        pageTitle={project.name}
        pageDescription={
          project.description ||
          "A premium client workspace for delivery visibility, commercial review, and lead operations."
        }
        utilityLabel={project.slug}
        actions={
          <>
            {workspace.primaryActionHref ? (
              <a
                href={workspace.primaryActionHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-lg bg-[#1ab07b] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#169d6c] shadow-sm"
              >
                {workspace.primaryActionLabel}
              </a>
            ) : null}
            <SignOutButton variant="clientPortal" />
          </>
        }
      >
        <div className="space-y-12">
          {/* Top contiguous metrics header */}
          <MeetaloKPIHeader metrics={kpiMetrics} />

          <section className="grid gap-6 xl:grid-cols-[1.18fr_0.82fr]" id="delivery">
            <ClientPortalMiniBars
              title="Delivery matrix"
              subtitle="The workspace is expressed as a clean client pulse: assets, routing, and intake health."
              columns={[
                {
                  label: "Sites",
                  valueLabel: `${project.sites.length} total`,
                  stacks: [
                    { value: workspace.metrics.publishedSiteCount, tone: "indigo" },
                    { value: workspace.metrics.draftSiteCount, tone: "blue" },
                    { value: project.sites.filter((site) => site.publishStatus === "FAILED").length, tone: "cyan" },
                  ],
                },
                {
                  label: "Domains",
                  valueLabel: `${project.domains.length} total`,
                  stacks: [
                    { value: workspace.metrics.activeDomainCount, tone: "cyan" },
                    { value: workspace.metrics.pendingDomainCount, tone: "blue" },
                    { value: project.domains.filter((domain) => domain.status === "ERROR").length, tone: "indigo" },
                  ],
                },
                {
                  label: "Leads",
                  valueLabel: `${leads.length} total`,
                  stacks: [
                    { value: workspace.metrics.syncedLeadCount, tone: "indigo" },
                    { value: pendingLeadCount, tone: "blue" },
                    { value: workspace.metrics.failedLeadCount, tone: "cyan" },
                  ],
                },
              ]}
            />

            <div className="space-y-6">
              <ClientPortalDonutPanel
                title="Workspace mix"
                subtitle="A concise blend of the strongest signals in the current project."
                segments={[
                  { label: "Published sites", value: workspace.metrics.publishedSiteCount, tone: "indigo" },
                  { label: "Active domains", value: workspace.metrics.activeDomainCount, tone: "blue" },
                  { label: "Synced leads", value: workspace.metrics.syncedLeadCount, tone: "cyan" },
                ]}
              />

              <ClientPortalProgressRows
                title="Operational health"
                rows={[
                  {
                    label: "Publication readiness",
                    value: `${workspace.metrics.publishedSiteCount}/${Math.max(project.sites.length, 1)}`,
                    progress: percent(workspace.metrics.publishedSiteCount, project.sites.length),
                    tone: "indigo",
                  },
                  {
                    label: "Domain activation",
                    value: `${workspace.metrics.activeDomainCount}/${Math.max(project.domains.length, 1)}`,
                    progress: percent(workspace.metrics.activeDomainCount, project.domains.length),
                    tone: "blue",
                  },
                  {
                    label: "Member activation",
                    value: `${workspace.metrics.activeMemberCount}/${Math.max(project.members.length, 1)}`,
                    progress: percent(workspace.metrics.activeMemberCount, project.members.length),
                    tone: "cyan",
                  },
                ]}
              />
            </div>
          </section>

          {isAdmin && (
            <section id="admin-only" className="grid gap-6 xl:grid-cols-2">
              <ClientPortalSectionCard
                title="Internal context"
                subtitle="Operator-level notes and identifiers not visible to standard client members."
              >
                <div className="rounded-xl border border-orange-100 bg-orange-50/20 p-5">
                   <p className="text-xs font-bold uppercase tracking-widest text-[#d97706]/70">Operator notes</p>
                   <p className="mt-3 text-sm text-[#92400e] leading-relaxed italic">
                     {project.notes || "No internal context recorded."}
                   </p>
                </div>

                <div className="mt-6 flex flex-col gap-3">
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-[12px] font-semibold text-gray-500">Project UUID</span>
                    <span className="text-[12px] font-bold text-gray-900 tabular-nums">{project.id}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-[12px] font-semibold text-gray-500">Public Lead Key</span>
                    <span className="text-[12px] font-bold text-gray-900 tabular-nums">{project.publicLeadKey}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-[12px] font-semibold text-gray-500">Slug Reference</span>
                    <span className="text-[12px] font-bold text-gray-900 tabular-nums">{project.slug}</span>
                  </div>
                </div>
              </ClientPortalSectionCard>

              <ClientPortalSectionCard
                title="Operational controls"
                subtitle="Force triggering delivery actions or re-syncing downstream targets."
              >
                <div className="grid grid-cols-2 gap-4">
                  <button className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-white p-6 hover:bg-gray-50 transition-all group shadow-sm">
                    <span className="material-symbols-outlined text-gray-400 group-hover:text-gray-900 transition-colors">sync_problem</span>
                    <span className="text-[12px] font-bold text-gray-900">Re-sync Leads</span>
                  </button>
                  <button className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-white p-6 hover:bg-gray-50 transition-all group shadow-sm">
                    <span className="material-symbols-outlined text-gray-400 group-hover:text-gray-900 transition-colors">publish</span>
                    <span className="text-[12px] font-bold text-gray-900">Force Deploy</span>
                  </button>
                  <button className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-white p-6 hover:bg-gray-50 transition-all group shadow-sm">
                    <span className="material-symbols-outlined text-gray-400 group-hover:text-gray-900 transition-colors">history</span>
                    <span className="text-[12px] font-bold text-gray-900">Audit Logs</span>
                  </button>
                  <button className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-white p-6 hover:bg-gray-50 transition-all group shadow-sm">
                    <span className="material-symbols-outlined text-gray-400 group-hover:text-gray-900 transition-colors">settings</span>
                    <span className="text-[12px] font-bold text-gray-900">Config JSON</span>
                  </button>
                </div>
              </ClientPortalSectionCard>
            </section>
          )}

          <MeetaloLeadsTable projectId={params.projectId} leads={leads} />

          <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]" id="members">
            <ClientPortalSectionCard
              title="Workspace access"
              subtitle="Management visibility and invitation flow stay in one place."
            >
              <div className="space-y-3">
                {project.members.map((member) => (
                  <div
                    key={member.portalUserId}
                    className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50/50 px-4 py-4"
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {member.fullName || member.email}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        {member.email}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                       <ClientPortalStatusPill label={member.role} tone="indigo" />
                       <ClientPortalStatusPill
                         label={member.status}
                         tone={member.status === "ACTIVE" ? "success" : "neutral"}
                       />
                    </div>
                  </div>
                ))}
              </div>

              {project.membershipRole === "OWNER" ? (
                <Link
                  href={ROUTES.dashboard.projectSettings(project.id)}
                  className="mt-4 inline-flex items-center justify-center rounded-full border border-[var(--portal-accent-border)] bg-[var(--portal-badge-bg)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--portal-badge-text)] transition hover:bg-[var(--portal-surface)]"
                >
                  Manage access & members
                </Link>
              ) : null}
            </ClientPortalSectionCard>

            <ClientPortalSectionCard
              title="Workspace narrative"
              subtitle="This is the premium client layer: headline context and project details."
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Primary domain</p>
                  <p className="mt-3 text-sm font-bold text-gray-900">{project.primaryDomain || "Pending"}</p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Go live</p>
                  <p className="mt-3 text-sm font-bold text-gray-900">{formatPortalDate(project.goLiveAt)}</p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Client company</p>
                  <p className="mt-3 text-sm font-bold text-gray-900">{project.clientCompanyName || "Pending"}</p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Status</p>
                  <div className="mt-3">
                    <ClientPortalStatusPill label={project.status} tone={projectStatusTone(project.status)} />
                  </div>
                </div>
              </div>
            </ClientPortalSectionCard>
          </section>

          <section id="billing" className="mb-10">
            <ClientPortalSectionCard
              title="Billing summary"
              subtitle="Commercial references stay read-only here so the workspace remains client-safe."
            >
              {billing.activeSnapshot ? (
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Total quoted</p>
                    <p className="mt-3 text-2xl font-bold text-gray-900">{formatMoneyMinor(billing.activeSnapshot.totalMinor)}</p>
                  </div>
                  <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Payable today</p>
                    <p className="mt-3 text-2xl font-bold text-gray-900">{formatMoneyMinor(billing.paymentState.amountDueNowMinor)}</p>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 px-6 py-12 text-center text-sm font-medium text-gray-400">
                  No billing records have been linked yet.
                </div>
              )}
            </ClientPortalSectionCard>
          </section>
        </div>
      </ClientPortalShell>
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "The workspace could not be loaded.";
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 p-10">
        <div className="max-w-md rounded-2xl bg-white p-8 shadow-xl text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-rose-500">Unavailable</p>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Workspace Load Error</h1>
          <p className="mt-4 text-sm text-gray-500 leading-relaxed">{message}</p>
          <Link href={ROUTES.dashboard.projects} className="mt-8 inline-block rounded-full bg-gray-900 px-6 py-2.5 text-xs font-bold text-white uppercase tracking-widest hover:bg-gray-800 transition-colors">
            Return to Dashboard
          </Link>
        </div>
      </main>
    );
  }
}
