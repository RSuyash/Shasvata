import type {
  AccessibleProject,
  ProjectDetail,
  ProjectLead,
} from "./landing-portal";
import { ROUTES } from "./routes";

export type ProjectsDashboardMetricSet = {
  workspaceCount: number;
  activeWorkspaceCount: number;
  archivedWorkspaceCount: number;
  liveDomainCount: number;
  ownerWorkspaceCount: number;
};

export type ProjectsDashboardModel = {
  metrics: ProjectsDashboardMetricSet;
  featuredProject: AccessibleProject | null;
  spotlight: {
    title: string;
    eyebrow: string;
    detail: string;
  };
  portfolio: Array<
    AccessibleProject & {
      domainLabel: string;
      roleLabel: string;
      emphasis: "primary" | "secondary";
    }
  >;
};

export type DashboardOverviewMetricSet = {
  workspaceCount: number;
  activeWorkspaceCount: number;
  liveWorkspaceCount: number;
  ownerWorkspaceCount: number;
  totalDueNowMinor: number;
  projectsWithBilling: number;
};

export type DashboardOverviewWorkspaceCard = {
  id: string;
  name: string;
  href: string;
  liveHref: string | null;
  status: AccessibleProject["status"];
  roleLabel: string;
  domainLabel: string;
  clientCompanyName: string | null;
  leadCount: number;
  lastUpdatedAt: string | null;
};

export type DashboardOverviewModel = {
  metrics: DashboardOverviewMetricSet;
  spotlight: {
    title: string;
    eyebrow: string;
    detail: string;
    href: string | null;
    liveHref: string | null;
    roleLabel: string | null;
    domainLabel: string | null;
  };
  workspaces: DashboardOverviewWorkspaceCard[];
};

export type ProjectWorkspaceMetricSet = {
  publishedSiteCount: number;
  draftSiteCount: number;
  pendingDomainCount: number;
  activeDomainCount: number;
  syncedLeadCount: number;
  failedLeadCount: number;
  activeMemberCount: number;
};

export type ProjectWorkspaceModel = {
  metrics: ProjectWorkspaceMetricSet;
  primaryActionLabel: string;
  primaryActionHref: string | null;
  siteStatusCards: Array<{
    label: string;
    value: number;
  }>;
  domainStatusCards: Array<{
    label: string;
    value: number;
  }>;
  leadStatusCards: Array<{
    label: string;
    value: number;
  }>;
};

function sortProjects(projects: AccessibleProject[]): AccessibleProject[] {
  const statusRank: Record<AccessibleProject["status"], number> = {
    ACTIVE: 0,
    DRAFT: 1,
    ARCHIVED: 2,
  };

  return [...projects].sort((left, right) => {
    const rankDelta = statusRank[left.status] - statusRank[right.status];
    if (rankDelta !== 0) {
      return rankDelta;
    }

    return left.name.localeCompare(right.name);
  });
}

export function buildProjectsDashboard(
  projects: AccessibleProject[],
): ProjectsDashboardModel {
  const portfolio = sortProjects(projects);
  const featuredProject = portfolio[0] ?? null;

  return {
    metrics: {
      workspaceCount: projects.length,
      activeWorkspaceCount: projects.filter((project) => project.status === "ACTIVE").length,
      archivedWorkspaceCount: projects.filter((project) => project.status === "ARCHIVED").length,
      liveDomainCount: projects.filter((project) => project.primaryDomain).length,
      ownerWorkspaceCount: projects.filter((project) => project.membershipRole === "OWNER")
        .length,
    },
    featuredProject,
    spotlight: featuredProject
      ? {
          title: featuredProject.name,
          eyebrow: `${featuredProject.status} workspace`,
          detail: featuredProject.primaryDomain
            ? `Live on ${featuredProject.primaryDomain}`
            : "Primary domain pending",
        }
      : {
          title: "No workspace assigned yet",
          eyebrow: "Portfolio unavailable",
          detail: "A project will appear here when access is provisioned.",
        },
    portfolio: portfolio.map((project, index) => ({
      ...project,
      domainLabel: project.primaryDomain || "Primary domain pending",
      roleLabel: project.membershipRole === "OWNER" ? "Owner access" : "Viewer access",
      emphasis: index === 0 ? "primary" : "secondary",
    })),
  };
}

export function buildDashboardOverview(input: {
  projects: AccessibleProject[];
  details: ProjectDetail[];
  billingSummary?: {
    totalDueNowMinor: number;
    projectsWithBilling: number;
  } | null;
}): DashboardOverviewModel {
  const dashboard = buildProjectsDashboard(input.projects);
  const detailById = new Map(input.details.map((project) => [project.id, project]));
  const workspaces = dashboard.portfolio.slice(0, 3).map((project) => {
    const detail = detailById.get(project.id);
    const liveHref =
      detail?.liveUrl || (project.primaryDomain ? `https://${project.primaryDomain}` : null);

    return {
      id: project.id,
      name: project.name,
      href: ROUTES.dashboard.project(project.id),
      liveHref,
      status: project.status,
      roleLabel: project.roleLabel,
      domainLabel: liveHref || project.domainLabel,
      clientCompanyName: project.clientCompanyName,
      leadCount: detail?.leadCount || 0,
      lastUpdatedAt:
        detail?.billingSummary.latestUpdatedAt || detail?.goLiveAt || project.goLiveAt || null,
    };
  });

  const spotlightWorkspace = workspaces[0] || null;

  return {
    metrics: {
      workspaceCount: dashboard.metrics.workspaceCount,
      activeWorkspaceCount: dashboard.metrics.activeWorkspaceCount,
      liveWorkspaceCount: dashboard.metrics.liveDomainCount,
      ownerWorkspaceCount: dashboard.metrics.ownerWorkspaceCount,
      totalDueNowMinor: input.billingSummary?.totalDueNowMinor || 0,
      projectsWithBilling: input.billingSummary?.projectsWithBilling || 0,
    },
    spotlight: spotlightWorkspace
      ? {
          title: spotlightWorkspace.name,
          eyebrow: `${spotlightWorkspace.status.toLowerCase()} workspace`,
          detail: spotlightWorkspace.liveHref
            ? "Live surface ready to review."
            : "Open the workspace to continue delivery, billing, or collaboration.",
          href: spotlightWorkspace.href,
          liveHref: spotlightWorkspace.liveHref,
          roleLabel: spotlightWorkspace.roleLabel,
          domainLabel: spotlightWorkspace.domainLabel,
        }
      : {
          title: "No workspace assigned yet",
          eyebrow: "Workspace home",
          detail: "A project will appear here once access is provisioned for this account.",
          href: null,
          liveHref: null,
          roleLabel: null,
          domainLabel: null,
        },
    workspaces,
  };
}

export function buildProjectWorkspace(
  project: ProjectDetail,
  leads: ProjectLead[],
): ProjectWorkspaceModel {
  const publishedSiteCount = project.sites.filter((site) => site.publishStatus === "PUBLISHED")
    .length;
  const draftSiteCount = project.sites.filter((site) => site.publishStatus === "DRAFT").length;
  const pendingDomainCount = project.domains.filter((domain) => domain.status === "PENDING")
    .length;
  const activeDomainCount = project.domains.filter((domain) => domain.status === "ACTIVE").length;
  const syncedLeadCount = leads.filter((lead) => lead.syncStatus === "SYNCED").length;
  const failedLeadCount = leads.filter((lead) => lead.syncStatus === "FAILED").length;
  const activeMemberCount = project.members.filter((member) => member.status === "ACTIVE").length;

  return {
    metrics: {
      publishedSiteCount,
      draftSiteCount,
      pendingDomainCount,
      activeDomainCount,
      syncedLeadCount,
      failedLeadCount,
      activeMemberCount,
    },
    primaryActionLabel: project.primaryDomain ? "Open live site" : "Preview workspace",
    primaryActionHref: project.primaryDomain
      ? `https://${project.primaryDomain}`
      : project.sites[0]?.latestPreviewPath || null,
    siteStatusCards: [
      { label: "Published", value: publishedSiteCount },
      { label: "Draft", value: draftSiteCount },
      { label: "Total sites", value: project.sites.length },
    ],
    domainStatusCards: [
      { label: "Active", value: activeDomainCount },
      { label: "Pending", value: pendingDomainCount },
      { label: "Total domains", value: project.domains.length },
    ],
    leadStatusCards: [
      { label: "Synced", value: syncedLeadCount },
      { label: "Attention", value: failedLeadCount },
      { label: "Captured", value: leads.length },
    ],
  };
}
