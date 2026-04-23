import { describe, expect, it } from "vitest";
import {
  buildProjectBreadcrumbs,
  buildPortfolioNav,
  buildProjectNav,
  type ClientPortalNavSection,
} from "./portal-nav";

function firstSection(sections: ClientPortalNavSection[]) {
  return sections[0];
}

describe("buildPortfolioNav", () => {
  it("returns dashboard-scoped portfolio navigation with the home item active", () => {
    const sections = buildPortfolioNav("overview");

    expect(sections).toEqual([
      {
        label: "Workspace",
        items: [
          {
            label: "Overview",
            href: "/dashboard",
            icon: "grid_view",
            active: true,
            shortcut: "O",
          },
          {
            label: "All Projects",
            href: "/dashboard/projects",
            icon: "folder_open",
            active: false,
            shortcut: "P",
          },
          {
            label: "Billing",
            href: "/dashboard/billing",
            icon: "receipt_long",
            active: false,
            shortcut: "B",
          },
        ],
      },
    ]);
  });

  it("highlights projects as the active item", () => {
    const sections = buildPortfolioNav("projects");

    expect(sections[0].items[1]).toEqual({
      label: "All Projects",
      href: "/dashboard/projects",
      icon: "folder_open",
      active: true,
      shortcut: "P",
    });
  });

  it("highlights billing as the active item", () => {
    const sections = buildPortfolioNav("billing");

    expect(sections[0].items[2]).toEqual({
      label: "Billing",
      href: "/dashboard/billing",
      icon: "receipt_long",
      active: true,
      shortcut: "B",
    });
  });
});

describe("buildProjectNav", () => {
  it("returns project module navigation under the dashboard namespace", () => {
    const sections = buildProjectNav("project-123", {
      activeItem: "leads",
      liveHref: "https://wagholihighstreet.in",
    });

    expect(firstSection(sections)).toEqual({
      label: "Context",
      isBackNavigation: true,
      projectName: undefined,
      items: [
        {
          label: "Back to Workspace",
          href: "/dashboard/projects",
          icon: "folder_open",
          active: false,
        },
      ],
    });

    expect(sections[1]).toEqual({
      label: "Project Menu",
      items: [
        {
          label: "Overview",
          href: "/dashboard/projects/project-123",
          icon: "grid_view",
          active: false,
          shortcut: "1",
        },
        {
          label: "Leads Data",
          href: "/dashboard/projects/project-123/leads",
          icon: "person",
          active: true,
          shortcut: "2",
        },
        {
          label: "Billing",
          href: "/dashboard/projects/project-123/billing",
          icon: "receipt_long",
          active: false,
          shortcut: "3",
        },
        {
          label: "Analytics",
          href: "/dashboard/projects/project-123/analytics",
          icon: "insights",
          active: false,
          shortcut: "4",
        },
        {
          label: "Settings",
          href: "/dashboard/projects/project-123/settings",
          icon: "settings",
          active: false,
          shortcut: "5",
        },
        {
          label: "Live Website",
          href: "https://wagholihighstreet.in",
          icon: "public",
          active: false,
          external: true,
        },
      ],
    });
  });
});

describe("buildProjectBreadcrumbs", () => {
  it("builds a portfolio breadcrumb trail for project pages", () => {
    expect(
      buildProjectBreadcrumbs("project-123", "Wagholi Highstreet", "Billing"),
    ).toEqual([
      {
        label: "Projects",
        href: "/dashboard/projects",
      },
      {
        label: "Wagholi Highstreet",
        href: "/dashboard/projects/project-123",
      },
      {
        label: "Billing",
      },
    ]);
  });

  it("keeps the overview breadcrumb compact", () => {
    expect(
      buildProjectBreadcrumbs("project-123", "Wagholi Highstreet", "Overview"),
    ).toEqual([
      {
        label: "Projects",
        href: "/dashboard/projects",
      },
      {
        label: "Wagholi Highstreet",
      },
    ]);
  });
});
