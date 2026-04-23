import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ClientPortalShell } from "@/components/client-portal/client-portal-shell";
import { ProjectAccessMembersView } from "@/components/landing-portal/project-access-members-view";
import { ProjectAcquisitionSourcesView } from "@/components/landing-portal/project-acquisition-sources-view";
import { ProjectNotificationSettingsView } from "@/components/landing-portal/project-notification-settings-view";
import { ProjectTrackingSettingsView } from "@/components/landing-portal/project-tracking-settings-view";
import {
  fetchPortalSessionForApp,
  fetchProjectAccessSettingsForApp,
  fetchProjectDetailForApp,
} from "@/lib/landing-portal";
import { buildProjectBreadcrumbs, buildProjectNav } from "@/lib/portal-nav";
import { ROUTES, signInRedirect } from "@/lib/routes";

function serializeCookieHeader() {
  return cookies()
    .getAll()
    .map((entry) => `${entry.name}=${entry.value}`)
    .join("; ");
}

function TerminalStatusPill({ label, tone }: { label: string; tone: "success" | "warning" | "neutral" | "indigo" | "blue" | "danger" }) {
  const styles = {
    success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    danger: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    neutral: "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20",
    indigo: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
    blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  };

  return (
    <div className={`inline-flex items-center px-2.5 py-1 rounded-full border text-[10px] font-bold tracking-wider uppercase transition-colors shadow-sm ${styles[tone]}`}>
      {label}
    </div>
  );
}

function TerminalMetricTile({ label, value, detail, icon }: { label: string; value: React.ReactNode; detail: React.ReactNode; icon: string }) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-[var(--portal-border)] bg-[var(--portal-card)] p-5 shadow-sm transition-all hover:border-[var(--portal-foreground)] hover:shadow-md">
      <div className="flex items-start justify-between mb-4">
        <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--portal-muted)]">{label}</p>
        <span className="material-symbols-outlined text-[20px] text-[var(--portal-muted)] transition-colors group-hover:text-[var(--portal-foreground)]">
          {icon}
        </span>
      </div>
      <div className="flex flex-col items-start gap-1 w-full overflow-hidden">
        {typeof value === 'string' || typeof value === 'number' ? (
          <p className="font-mono text-xl font-bold tracking-tight text-[var(--portal-foreground)] truncate max-w-full">{value}</p>
        ) : value}
        <div className="mt-1 text-xs font-medium text-[var(--portal-muted)] truncate max-w-full">{detail}</div>
      </div>
    </div>
  );
}

export default async function ProjectSettingsPage({
  params,
  searchParams,
}: {
  params: { projectId: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const cookieHeader = serializeCookieHeader();
  const session = await fetchPortalSessionForApp(cookieHeader);

  if (!session) redirect(signInRedirect(ROUTES.dashboard.projectSettings(params.projectId)));

  const activeTab = typeof searchParams?.tab === "string" ? searchParams.tab : "access";

  try {
    const [project, settings] = await Promise.all([
      fetchProjectDetailForApp({ cookieHeader, projectId: params.projectId }),
      fetchProjectAccessSettingsForApp({ cookieHeader, projectId: params.projectId }),
    ]);

    if (project.portalView === "CLIENT" && project.membershipRole !== "OWNER") {
      redirect(ROUTES.dashboard.project(params.projectId));
    }

    const navSections = buildProjectNav(project.id, { activeItem: "settings", liveHref: project.liveUrl, projectName: project.name });
    const breadcrumbs = buildProjectBreadcrumbs(project.id, project.name, "Settings");
    const sourceSiteSlug = project.sourceSummary?.siteId ? project.sites.find((site) => site.id === project.sourceSummary?.siteId)?.slug ?? project.sites[0]?.slug ?? "Pending" : project.sites[0]?.slug ?? "Pending";
    const canManageIntegrations = session.portalUser.role === "PLATFORM_ADMIN" || session.portalUser.role === "PLATFORM_OPERATOR" || project.membershipRole === "OWNER";

    const settingsMenu = [
      { id: "access", label: "Team Access", icon: "group", desc: "Manage project members" },
      { id: "notifications", label: "Emails & Alerts", icon: "mark_email_unread", desc: "Lead notification routing" },
      { id: "integrations", label: "Integrations & APIs", icon: "hub", desc: "Analytics & CRM tracking", hidden: !canManageIntegrations },
      { id: "acquisition", label: "Acquisition Sources", icon: "travel_explore", desc: "Imports and ad-source connectors", hidden: !canManageIntegrations },
    ].filter(item => !item.hidden);

    return (
      <ClientPortalShell
        user={session.portalUser}
        sections={navSections}
        breadcrumbs={breadcrumbs}
        pageTitle="Project Settings"
        pageDescription="Advanced configuration for access control, lead routing, and tracking identification."
        eyebrowLabel="System Config"
        actions={
          <>
            <Link href={ROUTES.dashboard.projectAnalytics(project.id)} className="inline-flex h-9 items-center justify-center rounded-lg border border-[var(--portal-border)] bg-[var(--portal-surface)] px-4 text-[11px] font-bold uppercase tracking-widest text-[var(--portal-foreground)] transition-all hover:bg-[var(--portal-surface-soft)] shadow-sm">
              <span className="material-symbols-outlined text-[16px] mr-2">analytics</span> Analytics
            </Link>
            {project.liveUrl && (
              <a href={project.liveUrl} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center justify-center rounded-lg bg-[var(--portal-foreground)] px-4 text-[11px] font-bold uppercase tracking-widest text-[var(--portal-surface)] transition-all hover:opacity-90 shadow-sm">
                Visit Site ↗
              </a>
            )}
          </>
        }
      >
        <div className="mx-auto w-full max-w-6xl space-y-8 pb-24 pt-6 animate-in fade-in duration-500">

          {/* Top Context & Navigation Back */}
          <div className="flex flex-col gap-6 border-b border-[var(--portal-border)] pb-8">
            <Link href={ROUTES.dashboard.project(project.id)} className="inline-flex items-center text-xs font-semibold text-[var(--portal-muted)] hover:text-[var(--portal-foreground)] transition-colors w-fit group">
              <span className="material-symbols-outlined text-[16px] mr-1 transition-transform group-hover:-translate-x-1">arrow_back</span>
              Back to Project Dashboard
            </Link>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <TerminalStatusPill label={project.membershipRole === "OWNER" ? "OWNER ACCESS" : "VIEWER ACCESS"} tone={project.membershipRole === "OWNER" ? "success" : "neutral"} />
                  <TerminalStatusPill label={`${project.status} STATE`} tone={project.status === "ACTIVE" ? "indigo" : "warning"} />
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-[var(--portal-foreground)] sm:text-4xl">Settings</h1>
                <p className="text-sm text-[var(--portal-muted)] max-w-2xl">Manage your project's access, routing logic, tracking IDs, and notifications.</p>
              </div>
            </div>
          </div>

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <TerminalMetricTile label="Project Status" value={<TerminalStatusPill label={project.status} tone={project.status === "ACTIVE" ? "success" : project.status === "DRAFT" ? "warning" : "neutral"} />} detail="Current state" icon="cloud_done" />
            <TerminalMetricTile label="Your Role" value={project.membershipRole} detail="Your access level" icon="admin_panel_settings" />
            <TerminalMetricTile label="Live Domain" value={project.primaryDomain || "UNBOUND"} detail="Primary website URL" icon="dns" />
            <TerminalMetricTile label="Source Site" value={sourceSiteSlug} detail="Main layout" icon="account_tree" />
          </section>

          {/* Sticky Sidebar + Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8 lg:gap-12 mt-8 items-start">

            <aside className="sticky top-6 w-full z-10 bg-[var(--portal-background)] pt-2 pb-4 lg:py-0">
              <nav className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible scrollbar-hide">
                <div className="hidden lg:block mb-2 px-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--portal-muted)]">Configuration</p>
                </div>
                {settingsMenu.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <Link
                      key={item.id}
                      href={`?tab=${item.id}`}
                      scroll={false}
                      className={`relative flex items-center gap-3 p-3 rounded-xl transition-all whitespace-nowrap lg:whitespace-normal group overflow-hidden ${
                        isActive
                          ? "bg-[var(--portal-surface)] ring-1 ring-[var(--portal-border)] shadow-sm text-[var(--portal-foreground)]"
                          : "text-[var(--portal-muted)] hover:bg-[var(--portal-surface-soft)] hover:text-[var(--portal-foreground)]"
                      }`}
                    >
                      {/* Premium active state left-border indicator */}
                      {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--portal-foreground)] rounded-l-xl" />}

                      <span className={`material-symbols-outlined text-[20px] transition-transform ${isActive ? "scale-110 text-[var(--portal-foreground)]" : "group-hover:scale-110"}`}>{item.icon}</span>
                      <div>
                        <p className={`text-sm font-semibold ${isActive ? "text-[var(--portal-foreground)]" : "text-[var(--portal-muted)] group-hover:text-[var(--portal-foreground)]"}`}>{item.label}</p>
                        <p className="hidden lg:block text-[11px] mt-0.5 opacity-70">{item.desc}</p>
                      </div>
                    </Link>
                  );
                })}
              </nav>
            </aside>

            <main className="flex-1 min-w-0 bg-[var(--portal-card)] border border-[var(--portal-border)] rounded-2xl shadow-sm overflow-hidden">
              <div key={activeTab} className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                {activeTab === "access" && <ProjectAccessMembersView settings={settings} />}
                {activeTab === "notifications" && <ProjectNotificationSettingsView projectId={project.id} recipients={project.leadNotificationRecipients} />}
                {activeTab === "integrations" && <ProjectTrackingSettingsView projectId={project.id} liveUrl={project.liveUrl} previewUrl={project.previewUrl} canManageIntegrations={canManageIntegrations} syncTargets={project.syncTargets} site={project.sourceSummary ? project.sites.find((site) => site.id === project.sourceSummary?.siteId) ?? project.sites[0] ?? null : project.sites[0] ?? null} />}
                {activeTab === "acquisition" && <ProjectAcquisitionSourcesView projectId={project.id} />}
              </div>
            </main>

          </div>
        </div>
      </ClientPortalShell>
    );
  } catch (error) {
    console.error("[landing-portal] Failed to render project settings page:", error);
    redirect(ROUTES.dashboard.project(params.projectId));
  }
}
