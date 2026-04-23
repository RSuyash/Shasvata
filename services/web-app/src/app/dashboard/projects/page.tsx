import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ClientPortalShell } from "@/components/client-portal/client-portal-shell";
import {
  ProjectsCommandCenter,
  type ProjectFilterOption,
  type ProjectStatusFilter,
} from "@/components/client-portal/projects-command-center";
import { ClientProjectsOverview } from "@/components/landing-portal/client-projects-overview";
import { SignOutButton } from "@/components/landing-portal/sign-out-button";
import { buildProjectsDashboard } from "@/lib/client-portal-dashboard";
import { buildPortfolioNav } from "@/lib/portal-nav";
import { ROUTES, signInRedirect } from "@/lib/routes";
import {
  fetchPortalSessionForApp,
  fetchProjectDetailForApp,
  fetchProjectsForApp,
} from "@/lib/landing-portal";

type ProjectSearchParams = {
  q?: string | string[];
  status?: string | string[];
};

type PortalProject = Awaited<ReturnType<typeof fetchProjectsForApp>>[number];

function serializeCookieHeader() {
  return cookies()
    .getAll()
    .map((entry) => `${entry.name}=${entry.value}`)
    .join("; ");
}

function readQueryValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] || "";
  }

  return value || "";
}

function normalizeStatusFilter(value: string): ProjectStatusFilter {
  const normalized = value.toLowerCase();

  if (normalized === "active" || normalized === "draft" || normalized === "archived") {
    return normalized;
  }

  return "all";
}

function projectMatchesSearch(project: PortalProject, searchTerm: string) {
  if (!searchTerm) {
    return true;
  }

  const haystack = [
    project.name,
    project.clientCompanyName,
    project.primaryDomain,
    project.membershipRole,
    project.status,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(searchTerm.toLowerCase());
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams?: ProjectSearchParams;
}) {
  const cookieHeader = serializeCookieHeader();
  const session = await fetchPortalSessionForApp(cookieHeader);

  if (!session) {
    redirect(signInRedirect(ROUTES.dashboard.projects));
  }

  try {
    const projects = await fetchProjectsForApp(cookieHeader);
    const searchTerm = readQueryValue(searchParams?.q).trim();
    const statusFilter = normalizeStatusFilter(readQueryValue(searchParams?.status));

    const filteredProjects = projects.filter((project) => {
      const matchesStatus =
        statusFilter === "all" ? true : project.status.toLowerCase() === statusFilter;

      return matchesStatus && projectMatchesSearch(project, searchTerm);
    });

    const detailedProjects = (
      await Promise.all(
        filteredProjects.map(async (project) => {
          try {
            return await fetchProjectDetailForApp({
              cookieHeader,
              projectId: project.id,
            });
          } catch (detailError) {
            console.error("Failed to load project detail", {
              projectId: project.id,
              detailError,
            });
            return null;
          }
        }),
      )
    ).filter((project): project is NonNullable<typeof project> => Boolean(project));

    const dashboard = buildProjectsDashboard(filteredProjects);
    const detailedProjectById = new Map(
      detailedProjects.map((project) => [project.id, project]),
    );

    if (session.portalUser.role === "CLIENT") {
      return (
        <ClientProjectsOverview
          user={session.portalUser}
          projects={filteredProjects}
          details={detailedProjects}
        />
      );
    }

    const filterOptions: ProjectFilterOption[] = [
      {
        label: "All",
        value: "all",
        count: projects.length,
      },
      {
        label: "Active",
        value: "active",
        count: projects.filter((project) => project.status === "ACTIVE").length,
      },
      {
        label: "Draft",
        value: "draft",
        count: projects.filter((project) => project.status === "DRAFT").length,
      },
      {
        label: "Archived",
        value: "archived",
        count: projects.filter((project) => project.status === "ARCHIVED").length,
      },
    ];

    const portfolioCards = dashboard.portfolio.map((project) => ({
      project,
      detail: detailedProjectById.get(project.id) || null,
    }));

    const navSections = buildPortfolioNav("projects");

    return (
      <ClientPortalShell
        user={session.portalUser}
        sections={navSections}
        pageTitle="Projects"
        pageDescription={`Signed in as ${
          session.portalUser.fullName || session.portalUser.email
        }. Scan the live portfolio, filter by state, and jump straight into leads, billing, or the connected surface.`}
        utilityLabel="Portfolio live view"
        actions={<SignOutButton variant="clientPortal" />}
      >
        <ProjectsCommandCenter
          dashboard={dashboard}
          portfolioCards={portfolioCards}
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          filterOptions={filterOptions}
          allProjectCount={projects.length}
        />
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
