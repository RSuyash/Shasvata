import Link from "next/link";
import {
  ClientPortalDonutPanel,
  ClientPortalMiniBars,
  ClientPortalProgressRows,
  ClientPortalSectionCard,
  ClientPortalStatusPill,
} from "@/components/client-portal/client-portal-panels";
import { ROUTES } from "@/lib/routes";
import { formatMoneyMinor } from "@/lib/utils";
import {
  formatPortalDate,
  type AccessibleProject,
  type ProjectDetail,
} from "@/lib/landing-portal";
import type { ProjectsDashboardModel } from "@/lib/client-portal-dashboard";

export type ProjectStatusFilter = "all" | "active" | "draft" | "archived";

export type ProjectFilterOption = {
  label: string;
  value: ProjectStatusFilter;
  count: number;
};

type PortfolioProject = ProjectsDashboardModel["portfolio"][number];

type PortfolioCardEntry = {
  project: PortfolioProject;
  detail: ProjectDetail | null;
};

type ProjectsCommandCenterProps = {
  dashboard: ProjectsDashboardModel;
  portfolioCards: PortfolioCardEntry[];
  searchTerm: string;
  statusFilter: ProjectStatusFilter;
  filterOptions: ProjectFilterOption[];
  allProjectCount: number;
};

function getSyncTargetDisplayName(target: ProjectDetail["syncTargets"][number]) {
  if ("sheetName" in target.config) {
    return target.config.sheetName;
  }

  return target.label || "MDOC push";
}

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en-IN", {
    notation: value >= 1000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value);
}

function buildFilterHref(searchTerm: string, status: ProjectStatusFilter) {
  const params = new URLSearchParams();

  if (searchTerm) {
    params.set("q", searchTerm);
  }

  if (status !== "all") {
    params.set("status", status);
  }

  const query = params.toString();
  return query ? `${ROUTES.dashboard.projects}?${query}` : ROUTES.dashboard.projects;
}

function buildAvatarLabel(source: string) {
  const words = source
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!words.length) {
    return "NG";
  }

  return words
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2);
}

function getProjectLeadName(project: AccessibleProject, detail: ProjectDetail | null) {
  const activeOwner = detail?.members.find(
    (member) => member.status === "ACTIVE" && member.role === "OWNER",
  );
  const activeMember = detail?.members.find((member) => member.status === "ACTIVE");

  return (
    activeOwner?.fullName ||
    activeOwner?.email ||
    activeMember?.fullName ||
    activeMember?.email ||
    project.clientCompanyName ||
    project.name
  );
}

function getProjectLeadCaption(project: AccessibleProject, detail: ProjectDetail | null) {
  const activeOwner = detail?.members.find(
    (member) => member.status === "ACTIVE" && member.role === "OWNER",
  );
  const activeMember = detail?.members.find((member) => member.status === "ACTIVE");

  if (activeOwner) {
    return "Project owner";
  }

  if (activeMember) {
    return activeMember.role === "OWNER" ? "Project owner" : "Project collaborator";
  }

  return "No active members";
}

function getProjectLeadAvatar(project: AccessibleProject, detail: ProjectDetail | null) {
  return buildAvatarLabel(getProjectLeadName(project, detail));
}

function getProjectHealthTone(project: AccessibleProject, detail: ProjectDetail | null) {
  const dueNowMinor = detail?.billingSummary.totalPayableTodayMinor ?? 0;

  if (project.status === "ARCHIVED") {
    return "neutral" as const;
  }

  if (project.status === "DRAFT") {
    return "warning" as const;
  }

  if (dueNowMinor > 0) {
    return "warning" as const;
  }

  return "success" as const;
}

function getProjectHealthLabel(project: AccessibleProject, detail: ProjectDetail | null) {
  const dueNowMinor = detail?.billingSummary.totalPayableTodayMinor ?? 0;

  if (project.status === "ARCHIVED") {
    return "Archived";
  }

  if (project.status === "DRAFT") {
    return "Build pending";
  }

  if (dueNowMinor > 0) {
    return "Payment due";
  }

  return detail?.liveUrl || project.primaryDomain ? "Live" : "Awaiting launch";
}

function getProjectUpdateLabel(project: AccessibleProject, detail: ProjectDetail | null) {
  if (detail?.billingSummary.latestUpdatedAt) {
    return `Updated ${formatPortalDate(detail.billingSummary.latestUpdatedAt)}`;
  }

  if (project.goLiveAt) {
    return `Go live ${formatPortalDate(project.goLiveAt)}`;
  }

  return "Awaiting update";
}

function ProjectMetricTile({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  tone: "indigo" | "blue" | "cyan" | "warning";
}) {
  const toneMap = {
    indigo: {
      dot: "var(--portal-tone-indigo)",
      border: "var(--portal-tone-indigo-bg)",
    },
    blue: {
      dot: "var(--portal-tone-blue)",
      border: "var(--portal-tone-blue-bg)",
    },
    cyan: {
      dot: "var(--portal-tone-cyan)",
      border: "var(--portal-tone-cyan-bg)",
    },
    warning: {
      dot: "var(--portal-tone-warning)",
      border: "var(--portal-tone-warning-bg)",
    },
  } satisfies Record<typeof tone, { dot: string; border: string }>;

  const palette = toneMap[tone];

  return (
    <article
      className="client-portal-tone-transition rounded-[24px] border p-4 lg:p-5"
      style={{
        borderColor: palette.border,
        background:
          "linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(248, 250, 253, 0.98) 100%)",
        boxShadow: "var(--portal-shadow)",
      }}
    >
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: palette.dot }} />
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--portal-muted)]">
          {label}
        </p>
      </div>
      <p className="mt-4 text-[2rem] font-semibold tracking-[-0.06em] text-[var(--portal-foreground)] lg:text-[2.25rem]">
        {value}
      </p>
      <p className="mt-2 text-sm leading-6 text-[var(--portal-muted)]">{detail}</p>
    </article>
  );
}

function ProjectPortfolioCard({
  project,
  detail,
}: {
  project: PortfolioProject;
  detail: ProjectDetail | null;
}) {
  const dueNowMinor = detail?.billingSummary.totalPayableTodayMinor ?? 0;
  const leadName = getProjectLeadName(project, detail);
  const leadAvatar = getProjectLeadAvatar(project, detail);
  const leadCaption = getProjectLeadCaption(project, detail);
  const healthTone = getProjectHealthTone(project, detail);
  const healthLabel = getProjectHealthLabel(project, detail);
  const memberCount = detail?.members.length ?? 0;
  const leadCount = detail?.leadCount ?? 0;

  return (
    <article className="group overflow-hidden rounded-[28px] border border-[var(--portal-border)] bg-[var(--portal-surface)] p-5 transition hover:-translate-y-0.5 hover:border-[var(--portal-accent-border)] hover:shadow-[0_24px_68px_rgba(15,23,42,0.12)]">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <ClientPortalStatusPill label={project.status} tone={project.status === "ACTIVE" ? "success" : project.status === "ARCHIVED" ? "neutral" : "warning"} />
            <ClientPortalStatusPill label={project.roleLabel} tone="indigo" />
            <ClientPortalStatusPill label={healthLabel} tone={healthTone} />
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--portal-muted)]">
              {project.clientCompanyName || "Client workspace"}
            </p>
            <h3 className="mt-2 font-display text-2xl tracking-[-0.05em] text-[var(--portal-foreground)] lg:text-[2.15rem]">
              {project.name}
            </h3>
            <p className="mt-2 text-sm leading-6 text-[var(--portal-muted)]">
              {project.domainLabel}
            </p>
          </div>
        </div>

        <div className="min-w-[11rem] rounded-[22px] border border-[var(--portal-border)] bg-[var(--portal-surface-soft)] p-4 text-right">
          <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--portal-muted)]">
            Due now
          </p>
          <p className="mt-2 text-xl font-semibold tracking-[-0.04em] text-[var(--portal-foreground)]">
            {formatMoneyMinor(dueNowMinor)}
          </p>
          <p className="mt-1 text-xs leading-5 text-[var(--portal-muted)]">
            {getProjectUpdateLabel(project, detail)}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-4">
        <div className="rounded-[20px] bg-[var(--portal-surface-soft)] p-3">
          <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--portal-muted)]">
            Project lead
          </p>
          <div className="mt-2 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--portal-tone-indigo-bg)] text-xs font-semibold text-[var(--portal-tone-indigo-text)]">
              {leadAvatar}
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--portal-foreground)]">{leadName}</p>
              <p className="text-xs leading-5 text-[var(--portal-muted)]">{leadCaption}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[20px] bg-[var(--portal-surface-soft)] p-3">
          <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--portal-muted)]">
            Leads
          </p>
          <p className="mt-3 text-[1.35rem] font-semibold tracking-[-0.04em] text-[var(--portal-foreground)]">
            {formatCompactNumber(leadCount)}
          </p>
        </div>

        <div className="rounded-[20px] bg-[var(--portal-surface-soft)] p-3">
          <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--portal-muted)]">
            Members
          </p>
          <p className="mt-3 text-[1.35rem] font-semibold tracking-[-0.04em] text-[var(--portal-foreground)]">
            {formatCompactNumber(memberCount)}
          </p>
        </div>

        <div className="rounded-[20px] bg-[var(--portal-surface-soft)] p-3">
          <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--portal-muted)]">
            Go live
          </p>
          <p className="mt-3 text-sm font-semibold text-[var(--portal-foreground)]">
            {formatPortalDate(project.goLiveAt)}
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          href={ROUTES.dashboard.project(project.id)}
          className="inline-flex items-center justify-center rounded-full border border-[var(--portal-accent-border)] bg-[var(--portal-badge-bg)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--portal-badge-text)] transition hover:bg-[var(--portal-surface-soft)]"
        >
          Overview
        </Link>
        <Link
          href={ROUTES.dashboard.projectLeads(project.id)}
          className="inline-flex items-center justify-center rounded-full border border-[var(--portal-border)] bg-[var(--portal-surface)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--portal-foreground)] transition hover:border-[var(--portal-accent-border)] hover:bg-[var(--portal-surface-soft)]"
        >
          Leads
        </Link>
        <Link
          href={ROUTES.dashboard.projectBilling(project.id)}
          className="inline-flex items-center justify-center rounded-full border border-[var(--portal-border)] bg-[var(--portal-surface)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--portal-foreground)] transition hover:border-[var(--portal-accent-border)] hover:bg-[var(--portal-surface-soft)]"
        >
          Billing
        </Link>
        {detail?.liveUrl ? (
          <a
            href={detail.liveUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-full border border-[var(--portal-border)] bg-[var(--portal-surface)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--portal-foreground)] transition hover:border-[var(--portal-accent-border)] hover:bg-[var(--portal-surface-soft)]"
          >
            Website
          </a>
        ) : project.primaryDomain ? (
          <a
            href={`https://${project.primaryDomain}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-full border border-[var(--portal-border)] bg-[var(--portal-surface)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--portal-foreground)] transition hover:border-[var(--portal-accent-border)] hover:bg-[var(--portal-surface-soft)]"
          >
            Website
          </a>
        ) : null}
      </div>
    </article>
  );
}

export function ProjectsCommandCenter({
  dashboard,
  portfolioCards,
  searchTerm,
  statusFilter,
  filterOptions,
  allProjectCount,
}: ProjectsCommandCenterProps) {
  const featuredProject = dashboard.featuredProject;
  const featuredDetail = featuredProject
    ? portfolioCards.find((entry) => entry.project.id === featuredProject.id)?.detail || null
    : null;
  const deliveryColumns = portfolioCards.slice(0, 3).map(({ project, detail }) => {
    const shortLabel = project.name.split(" ")[0] || project.name;

    return {
      label: shortLabel,
      valueLabel: `${formatCompactNumber(detail?.leadCount || 0)} leads`,
      stacks: [
        {
          value: detail?.sites.filter((site) => site.publishStatus === "PUBLISHED").length || 0,
          tone: "indigo" as const,
        },
        {
          value: detail?.domains.filter((domain) => domain.status === "ACTIVE").length || 0,
          tone: "blue" as const,
        },
        {
          value: detail?.members.filter((member) => member.status === "ACTIVE").length || 0,
          tone: "cyan" as const,
        },
      ],
    };
  });
  const syncRows = portfolioCards
    .flatMap(({ project, detail }) =>
      (detail?.syncTargets || []).map((target) => ({
        id: target.id,
        projectName: project.name,
        label: target.label || target.kind,
        status: target.status,
        sheetName: getSyncTargetDisplayName(target),
      })),
    )
    .slice(0, 5);
  const totalSyncTargetCount = portfolioCards.reduce(
    (sum, entry) => sum + (entry.detail?.syncTargets.length || 0),
    0,
  );
  const hiddenSyncTargetCount = Math.max(totalSyncTargetCount - syncRows.length, 0);
  const totalLeadCount = portfolioCards.reduce((sum, entry) => sum + (entry.detail?.leadCount || 0), 0);
  const publishedSiteCount = portfolioCards.reduce(
    (sum, entry) =>
      sum + (entry.detail?.sites.filter((site) => site.publishStatus === "PUBLISHED").length || 0),
    0,
  );
  const activeDomainCount = portfolioCards.reduce(
    (sum, entry) =>
      sum + (entry.detail?.domains.filter((domain) => domain.status === "ACTIVE").length || 0),
    0,
  );
  const activeSyncCount = portfolioCards.reduce(
    (sum, entry) =>
      sum + (entry.detail?.syncTargets.filter((target) => target.status === "ACTIVE").length || 0),
    0,
  );
  const activeMemberCount = portfolioCards.reduce(
    (sum, entry) =>
      sum + (entry.detail?.members.filter((member) => member.status === "ACTIVE").length || 0),
    0,
  );
  const totalDomainCount = portfolioCards.reduce(
    (sum, entry) => sum + (entry.detail?.domains.length || 0),
    0,
  );
  const totalMemberCount = portfolioCards.reduce(
    (sum, entry) => sum + (entry.detail?.members.length || 0),
    0,
  );
  const totalDueNowMinor = portfolioCards.reduce(
    (sum, entry) => sum + (entry.detail?.billingSummary.totalPayableTodayMinor || 0),
    0,
  );
  const portfolioCountText = `${portfolioCards.length} shown of ${allProjectCount}`;

  return (
    <div className="space-y-6" id="overview">
      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="relative overflow-hidden rounded-[34px] border border-[var(--portal-border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(246,249,252,0.96)_100%)] p-6 shadow-[0_30px_86px_rgba(15,23,42,0.1)] lg:p-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(42,109,246,0.12),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(21,183,183,0.08),transparent_24%)]" />
          <div className="relative flex h-full flex-col justify-between gap-6">
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <ClientPortalStatusPill label="Portfolio live view" tone="indigo" />
                <ClientPortalStatusPill label={portfolioCountText} tone="blue" />
                <ClientPortalStatusPill
                  label={`${dashboard.metrics.activeWorkspaceCount} active`}
                  tone="success"
                />
                {totalDueNowMinor > 0 ? (
                  <ClientPortalStatusPill
                    label={`Due now ${formatMoneyMinor(totalDueNowMinor)}`}
                    tone="warning"
                  />
                ) : null}
              </div>

              <div className="space-y-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--portal-muted)]">
                  Projects
                </p>
                <h1 className="max-w-3xl font-display text-4xl tracking-[-0.07em] text-[var(--portal-foreground)] sm:text-5xl lg:text-6xl">
                  Growth infrastructure portfolio
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-[var(--portal-muted)]">
                  Scan the active workspace first, then filter by status or search by domain,
                  client company, or project name. Billing freshness and connected systems stay
                  visible without turning the page into a filing cabinet.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Link
                href={
                  featuredProject
                    ? ROUTES.dashboard.project(featuredProject.id)
                    : ROUTES.dashboard.projects
                }
                className="inline-flex items-center justify-center rounded-full border border-[var(--portal-accent-border)] bg-[var(--portal-badge-bg)] px-5 py-3 text-sm font-semibold text-[var(--portal-badge-text)] transition hover:bg-[var(--portal-surface-soft)]"
              >
                Open featured workspace
              </Link>
              <a
                href="#portfolio"
                className="inline-flex items-center justify-center rounded-full border border-[var(--portal-border)] bg-[var(--portal-surface)] px-5 py-3 text-sm font-semibold text-[var(--portal-foreground)] transition hover:border-[var(--portal-accent-border)] hover:bg-[var(--portal-surface-soft)]"
              >
                Scan portfolio
              </a>
            </div>

            <form action={ROUTES.dashboard.projects} method="get" className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <input type="hidden" name="status" value={statusFilter === "all" ? "" : statusFilter} />
              <input
                name="q"
                value={searchTerm}
                placeholder="Search workspace, client company, or domain"
                className="h-12 rounded-full border border-[var(--portal-border)] bg-[var(--portal-surface)] px-4 text-sm text-[var(--portal-foreground)] outline-none transition placeholder:text-[var(--portal-muted)] focus:border-[var(--portal-accent-border)] focus:bg-white"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-full bg-[var(--portal-accent)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Search
              </button>
            </form>

            <div className="flex flex-wrap gap-2">
              {filterOptions.map((option) => {
                const active = statusFilter === option.value;

                return (
                  <Link
                    key={option.value}
                    href={buildFilterHref(searchTerm, option.value)}
                    className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition"
                    style={{
                      borderColor: active ? "var(--portal-accent-border)" : "var(--portal-border)",
                      background: active ? "var(--portal-badge-bg)" : "var(--portal-surface)",
                      color: active ? "var(--portal-badge-text)" : "var(--portal-foreground)",
                    }}
                  >
                    <span>{option.label}</span>
                    <span className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-bold tracking-[0.1em] text-[var(--portal-muted)]">
                      {formatCompactNumber(option.count)}
                    </span>
                  </Link>
                );
              })}
              {(searchTerm || statusFilter !== "all") ? (
                <Link
                  href={ROUTES.dashboard.projects}
                  className="inline-flex items-center rounded-full border border-[var(--portal-border)] bg-[var(--portal-surface-soft)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--portal-foreground)] transition hover:border-[var(--portal-accent-border)] hover:bg-[var(--portal-surface)]"
                >
                  Reset
                </Link>
              ) : null}
            </div>
          </div>
        </div>

        {deliveryColumns.length ? (
          <ClientPortalMiniBars
            title="Delivery momentum"
            subtitle="The strongest projects rise to the top: each column blends published surfaces, active domains, and active members."
            columns={deliveryColumns}
          />
        ) : (
          <ClientPortalSectionCard
            title="Delivery momentum"
            subtitle="No projects match the current search or filter. Clear the filters to reopen the portfolio."
            action={
              <Link
                href={ROUTES.dashboard.projects}
                className="inline-flex items-center rounded-full border border-[var(--portal-border)] bg-[var(--portal-surface)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--portal-foreground)] transition hover:border-[var(--portal-accent-border)] hover:bg-[var(--portal-surface-soft)]"
              >
                Reset filters
              </Link>
            }
          >
            <div className="rounded-[24px] border border-dashed border-[var(--portal-border)] px-5 py-10 text-center text-[var(--portal-muted)]">
              Search results are empty.
            </div>
          </ClientPortalSectionCard>
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ProjectMetricTile
          label="Workspaces"
          value={formatCompactNumber(dashboard.metrics.workspaceCount)}
          detail={`${dashboard.metrics.activeWorkspaceCount} active, ${dashboard.metrics.archivedWorkspaceCount} archived`}
          tone="indigo"
        />
        <ProjectMetricTile
          label="Due now"
          value={formatMoneyMinor(totalDueNowMinor)}
          detail={`${dashboard.metrics.ownerWorkspaceCount} owner workspace${dashboard.metrics.ownerWorkspaceCount === 1 ? "" : "s"}`}
          tone="warning"
        />
        <ProjectMetricTile
          label="Live surfaces"
          value={formatCompactNumber(publishedSiteCount + activeDomainCount)}
          detail={`${publishedSiteCount} published sites + ${activeDomainCount} active domains`}
          tone="blue"
        />
        <ProjectMetricTile
          label="Connected team"
          value={formatCompactNumber(activeMemberCount)}
          detail={`${activeSyncCount} active syncs across ${totalMemberCount} members`}
          tone="cyan"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]" id="delivery">
        <ClientPortalSectionCard
          title="Featured workspace"
          subtitle="The active project anchor keeps billing, go-live, and live-site state together without expanding the page into noise."
        >
          {featuredProject ? (
            <div className="space-y-6">
              <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <ClientPortalStatusPill
                      label={featuredProject.status}
                      tone={featuredProject.status === "ACTIVE" ? "success" : featuredProject.status === "ARCHIVED" ? "neutral" : "warning"}
                    />
                    <ClientPortalStatusPill
                      label={featuredProject.membershipRole}
                      tone="indigo"
                    />
                    <ClientPortalStatusPill
                      label={getProjectHealthLabel(featuredProject, featuredDetail)}
                      tone={getProjectHealthTone(featuredProject, featuredDetail)}
                    />
                  </div>

                  <div>
                    <h2 className="font-display text-4xl tracking-[-0.07em] text-[var(--portal-foreground)] lg:text-[3.25rem]">
                      {featuredProject.name}
                    </h2>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--portal-muted)]">
                      {featuredDetail?.description || dashboard.spotlight.detail}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.22em] text-[var(--portal-muted)]">
                      <span>{featuredProject.clientCompanyName || "Client company pending"}</span>
                      <span>•</span>
                      <span>{featuredProject.primaryDomain || "Primary domain pending"}</span>
                      <span>•</span>
                      <span>{featuredDetail?.liveUrl ? "Live surface ready" : "Live surface pending"}</span>
                    </div>
                  </div>
                </div>

                <div className="grid min-w-[16rem] gap-3 sm:grid-cols-2 xl:grid-cols-1">
                  <div className="rounded-[24px] border border-[var(--portal-border)] bg-[var(--portal-surface-soft)] p-4">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--portal-muted)]">
                      Due now
                    </p>
                    <p className="mt-2 text-[1.9rem] font-semibold tracking-[-0.06em] text-[var(--portal-foreground)]">
                      {formatMoneyMinor(featuredDetail?.billingSummary.totalPayableTodayMinor || 0)}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[var(--portal-muted)]">
                      Latest commercial snapshot
                    </p>
                  </div>
                  <div className="rounded-[24px] border border-[var(--portal-border)] bg-[var(--portal-surface-soft)] p-4">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--portal-muted)]">
                      Project lead
                    </p>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--portal-tone-indigo-bg)] text-xs font-semibold text-[var(--portal-tone-indigo-text)]">
                        {getProjectLeadAvatar(featuredProject, featuredDetail)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[var(--portal-foreground)]">
                          {getProjectLeadName(featuredProject, featuredDetail)}
                        </p>
                        <p className="text-xs leading-5 text-[var(--portal-muted)]">
                          {getProjectLeadCaption(featuredProject, featuredDetail)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-4">
                <div className="rounded-[22px] bg-[var(--portal-surface-soft)] p-4">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--portal-muted)]">
                    Domain
                  </p>
                  <p className="mt-2 text-sm font-semibold text-[var(--portal-foreground)]">
                    {featuredProject.primaryDomain || "Pending"}
                  </p>
                </div>
                <div className="rounded-[22px] bg-[var(--portal-surface-soft)] p-4">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--portal-muted)]">
                    Leads
                  </p>
                  <p className="mt-2 text-sm font-semibold text-[var(--portal-foreground)]">
                    {formatCompactNumber(featuredDetail?.leadCount || 0)}
                  </p>
                </div>
                <div className="rounded-[22px] bg-[var(--portal-surface-soft)] p-4">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--portal-muted)]">
                    Members
                  </p>
                  <p className="mt-2 text-sm font-semibold text-[var(--portal-foreground)]">
                    {formatCompactNumber(featuredDetail?.members.length || 0)}
                  </p>
                </div>
                <div className="rounded-[22px] bg-[var(--portal-surface-soft)] p-4">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--portal-muted)]">
                    Go live
                  </p>
                  <p className="mt-2 text-sm font-semibold text-[var(--portal-foreground)]">
                    {formatPortalDate(featuredProject.goLiveAt)}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  href={ROUTES.dashboard.project(featuredProject.id)}
                  className="inline-flex items-center justify-center rounded-full border border-[var(--portal-accent-border)] bg-[var(--portal-badge-bg)] px-5 py-3 text-sm font-semibold text-[var(--portal-badge-text)] transition hover:bg-[var(--portal-surface-soft)]"
                >
                  Overview
                </Link>
                <Link
                  href={ROUTES.dashboard.projectLeads(featuredProject.id)}
                  className="inline-flex items-center justify-center rounded-full border border-[var(--portal-border)] bg-[var(--portal-surface)] px-5 py-3 text-sm font-semibold text-[var(--portal-foreground)] transition hover:border-[var(--portal-accent-border)] hover:bg-[var(--portal-surface-soft)]"
                >
                  Leads
                </Link>
                <Link
                  href={ROUTES.dashboard.projectBilling(featuredProject.id)}
                  className="inline-flex items-center justify-center rounded-full border border-[var(--portal-border)] bg-[var(--portal-surface)] px-5 py-3 text-sm font-semibold text-[var(--portal-foreground)] transition hover:border-[var(--portal-accent-border)] hover:bg-[var(--portal-surface-soft)]"
                >
                  Billing
                </Link>
                {featuredDetail?.liveUrl ? (
                  <a
                    href={featuredDetail.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-full border border-[var(--portal-border)] bg-[var(--portal-surface)] px-5 py-3 text-sm font-semibold text-[var(--portal-foreground)] transition hover:border-[var(--portal-accent-border)] hover:bg-[var(--portal-surface-soft)]"
                  >
                    Website
                  </a>
                ) : featuredProject.primaryDomain ? (
                  <a
                    href={`https://${featuredProject.primaryDomain}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-full border border-[var(--portal-border)] bg-[var(--portal-surface)] px-5 py-3 text-sm font-semibold text-[var(--portal-foreground)] transition hover:border-[var(--portal-accent-border)] hover:bg-[var(--portal-surface-soft)]"
                  >
                    Website
                  </a>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="rounded-[24px] border border-dashed border-[var(--portal-border)] px-6 py-12 text-center text-[var(--portal-muted)]">
              No workspace matches the current filter. Clear the filters to bring the full portfolio back.
            </div>
          )}
        </ClientPortalSectionCard>

        <div className="space-y-6" id="connected">
          <ClientPortalDonutPanel
            title="Portfolio composition"
            subtitle="This balances live domains, published surfaces, and active sync coverage."
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

          <ClientPortalProgressRows
            title="Operational coverage"
            rows={[
              {
                label: "Active workspace coverage",
                value: `${dashboard.metrics.activeWorkspaceCount}/${Math.max(
                  dashboard.metrics.workspaceCount,
                  1,
                )}`,
                progress: Math.round(
                  (dashboard.metrics.activeWorkspaceCount /
                    Math.max(dashboard.metrics.workspaceCount, 1)) *
                    100,
                ),
                tone: "indigo",
              },
              {
                label: "Domain activation",
                value: `${activeDomainCount}/${Math.max(totalDomainCount, 1)}`,
                progress: Math.round((activeDomainCount / Math.max(totalDomainCount, 1)) * 100),
                tone: "blue",
              },
              {
                label: "Team readiness",
                value: `${activeMemberCount}/${Math.max(totalMemberCount, 1)}`,
                progress: Math.round((activeMemberCount / Math.max(totalMemberCount, 1)) * 100),
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
                {hiddenSyncTargetCount > 0 ? (
                  <p className="px-1 text-xs text-[var(--portal-muted)]">
                    +{formatCompactNumber(hiddenSyncTargetCount)} more sync target
                    {hiddenSyncTargetCount === 1 ? "" : "s"} hidden for brevity.
                  </p>
                ) : null}
              </div>
            ) : (
              <div className="rounded-[24px] border border-dashed border-[var(--portal-border)] px-5 py-10 text-center text-[var(--portal-muted)]">
                No connected sync targets are visible yet.
              </div>
            )}
          </ClientPortalSectionCard>
        </div>
      </section>

      <section className="space-y-4" id="portfolio">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--portal-muted)]">
              Project portfolio
            </p>
            <h2 className="mt-2 font-display text-3xl tracking-[-0.06em] text-[var(--portal-foreground)] lg:text-[2.35rem]">
              Scannable workspaces with quick access to details, billing, and the live surface.
            </h2>
          </div>
          <p className="text-sm text-[var(--portal-muted)]">{portfolioCountText}</p>
        </div>

        {portfolioCards.length ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {portfolioCards.map(({ project, detail }) => (
              <ProjectPortfolioCard key={project.id} project={project} detail={detail} />
            ))}
          </div>
        ) : (
          <div className="rounded-[28px] border border-dashed border-[var(--portal-border)] px-6 py-12 text-center">
            <p className="text-sm text-[var(--portal-muted)]">
              No projects match the current search or filter.
            </p>
            {(searchTerm || statusFilter !== "all") ? (
              <Link
                href={ROUTES.dashboard.projects}
                className="mt-4 inline-flex items-center justify-center rounded-full border border-[var(--portal-border)] bg-[var(--portal-surface)] px-5 py-3 text-sm font-semibold text-[var(--portal-foreground)] transition hover:border-[var(--portal-accent-border)] hover:bg-[var(--portal-surface-soft)]"
              >
                Clear filters
              </Link>
            ) : null}
          </div>
        )}
      </section>
    </div>
  );
}
