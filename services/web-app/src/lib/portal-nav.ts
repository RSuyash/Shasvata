import { ROUTES } from "./routes";

export type ClientPortalNavIcon =
  | "storefront"
  | "grid_view"
  | "folder_open"
  | "person"
  | "receipt_long"
  | "insights"
  | "settings"
  | "public";

export type ClientPortalNavItem = {
  label: string;
  href: string;
  icon: ClientPortalNavIcon;
  active?: boolean;
  badge?: string;
  external?: boolean;
  shortcut?: string; // NEW: Keyboard shortcut affordance
};

export type ClientPortalNavSection = {
  label: string;
  isBackNavigation?: boolean; // We use this flag to render the new Context Card
  projectName?: string; // NEW: Pass the project name here for the context card
  items: ClientPortalNavItem[];
};

export type ClientPortalBreadcrumb = {
  label: string;
  href?: string;
};

type PortfolioNavItemKey = "overview" | "projects" | "billing" | null;
type ProjectNavItemKey = "overview" | "leads" | "billing" | "analytics" | "settings";

export function buildPortfolioNav(
  activeItem: PortfolioNavItemKey = "overview",
): ClientPortalNavSection[] {
  return [
    {
      label: "Workspace",
      items: [
        { label: "Overview", href: ROUTES.dashboard.root, icon: "grid_view", active: activeItem === "overview", shortcut: "O" },
        { label: "All Projects", href: ROUTES.dashboard.projects, icon: "folder_open", active: activeItem === "projects", shortcut: "P" },
        { label: "Billing", href: ROUTES.dashboard.billing, icon: "receipt_long", active: activeItem === "billing", shortcut: "B" },
      ],
    },
  ];
}

export function buildProjectNav(
  projectId: string,
  options: {
    activeItem: ProjectNavItemKey;
    liveHref?: string | null;
    projectName?: string;
  },
): ClientPortalNavSection[] {
  return [
    {
      label: "Context",
      isBackNavigation: true,
      projectName: options.projectName,
      items: [
        { label: "Back to Workspace", href: ROUTES.dashboard.projects, icon: "folder_open", active: false },
      ],
    },
    {
      label: "Project Menu",
      items: [
        { label: "Overview", href: ROUTES.dashboard.project(projectId), icon: "grid_view", active: options.activeItem === "overview", shortcut: "1" },
        { label: "Leads Data", href: ROUTES.dashboard.projectLeads(projectId), icon: "person", active: options.activeItem === "leads", shortcut: "2" },
        { label: "Billing", href: ROUTES.dashboard.projectBilling(projectId), icon: "receipt_long", active: options.activeItem === "billing", shortcut: "3" },
        { label: "Analytics", href: ROUTES.dashboard.projectAnalytics(projectId), icon: "insights", active: options.activeItem === "analytics", shortcut: "4" },
        { label: "Settings", href: ROUTES.dashboard.projectSettings(projectId), icon: "settings", active: options.activeItem === "settings", shortcut: "5" },
        ...(options.liveHref
          ? [{ label: "Live Website", href: options.liveHref, icon: "public" as const, active: false, external: true }]
          : []),
      ],
    },
  ];
}

export function buildProjectBreadcrumbs(
  projectId: string,
  projectName: string,
  activeItem: "Overview" | "Leads" | "Billing" | "Analytics" | "Settings",
): ClientPortalBreadcrumb[] {
  if (activeItem === "Overview") return [{ label: "Projects", href: ROUTES.dashboard.projects }, { label: projectName }];
  return [
    { label: "Projects", href: ROUTES.dashboard.projects },
    { label: projectName, href: ROUTES.dashboard.project(projectId) },
    { label: activeItem },
  ];
}
