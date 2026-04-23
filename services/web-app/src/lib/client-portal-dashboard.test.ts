import { describe, expect, it } from "vitest";
import {
  buildDashboardOverview,
  buildProjectWorkspace,
  buildProjectsDashboard,
} from "./client-portal-dashboard";
import type {
  AccessibleProject,
  ProjectDetail,
  ProjectLead,
} from "./landing-portal";

function makeAccessibleProject(
  overrides: Partial<AccessibleProject> = {},
): AccessibleProject {
  return {
    id: "project-1",
    slug: "farmerlift-growth",
    name: "FarmerLift Growth",
    status: "ACTIVE",
    publicLeadKey: "lead_key_farmerlift",
    primaryDomain: "farmerlift.shasvata.com",
    clientCompanyName: "FarmerLift",
    goLiveAt: null,
    membershipRole: "OWNER",
    ...overrides,
  };
}

function makeProjectDetail(overrides: Partial<ProjectDetail> = {}): ProjectDetail {
  return {
    id: "project-1",
    slug: "farmerlift-growth",
    name: "FarmerLift Growth",
    status: "ACTIVE",
    publicLeadKey: "lead_key_farmerlift",
    portalView: "OPERATOR",
    primaryDomain: "farmerlift.shasvata.com",
    clientCompanyName: "FarmerLift",
    description: "Client-facing growth workspace.",
    notes: "Campaign launch in progress.",
    goLiveAt: null,
    membershipRole: "OWNER",
    leadCount: 14,
    sites: [
      {
        id: "site-1",
        projectId: "project-1",
        slug: "farmerlift-main",
        templateKey: "premium-launch",
        themeKey: "ice-indigo",
        sourceProvider: "GIT_REPOSITORY",
        repoUrl: "https://github.com/naya/farmerlift-main",
        repoBranch: "main",
        repoRef: "refs/heads/main",
        deployedCommit: "abc123",
        runtimeProfile: "STATIC_ARTIFACT",
        operatorNotes: "Primary imported site",
        ga4MeasurementId: null,
        googleAdsTagId: null,
        googleAdsConversionMode: "DIRECT_LABEL",
        googleAdsLeadConversionLabel: null,
        gtmContainerId: null,
        metaPixelId: null,
        trackingNotes: null,
        publishStatus: "PUBLISHED",
        lastPublishedAt: "2026-03-28T00:00:00.000Z",
        previewHost: "preview.naya/farmerlift-main",
        latestPreviewPath: "https://preview.naya/farmerlift-main",
      },
      {
        id: "site-2",
        projectId: "project-1",
        slug: "farmerlift-support",
        templateKey: "support",
        themeKey: "ice-indigo",
        sourceProvider: null,
        repoUrl: null,
        repoBranch: null,
        repoRef: null,
        deployedCommit: null,
        runtimeProfile: "STATIC_ARTIFACT",
        operatorNotes: null,
        ga4MeasurementId: null,
        googleAdsTagId: null,
        googleAdsConversionMode: "DIRECT_LABEL",
        googleAdsLeadConversionLabel: null,
        gtmContainerId: null,
        metaPixelId: null,
        trackingNotes: null,
        publishStatus: "DRAFT",
        lastPublishedAt: null,
        previewHost: null,
        latestPreviewPath: null,
      },
    ],
    domains: [
      {
        id: "domain-1",
        projectId: "project-1",
        siteId: "site-1",
        host: "farmerlift.com",
        status: "ACTIVE",
        isPrimary: true,
        dnsTarget: "cname.naya.app",
        verifiedAt: "2026-03-28T00:00:00.000Z",
      },
      {
        id: "domain-2",
        projectId: "project-1",
        siteId: "site-2",
        host: "support.farmerlift.com",
        status: "PENDING",
        isPrimary: false,
        dnsTarget: null,
        verifiedAt: null,
      },
    ],
    syncTargets: [
      {
        id: "sync-1",
        projectId: "project-1",
        kind: "GOOGLE_SHEETS",
        status: "ACTIVE",
        label: "FarmerLift Leads",
        config: {
          spreadsheetId: "sheet-1",
          sheetName: "Leads",
        },
      },
      {
        id: "sync-2",
        projectId: "project-1",
        kind: "GOOGLE_SHEETS",
        status: "INACTIVE",
        label: "Archive",
        config: {
          spreadsheetId: "sheet-2",
          sheetName: "Archive",
        },
      },
    ],
    leadNotificationRecipients: [],
    members: [
      {
        portalUserId: "member-1",
        email: "owner@farmerlift.com",
        fullName: "FarmerLift Owner",
        role: "OWNER",
        status: "ACTIVE",
      },
      {
        portalUserId: "member-2",
        email: "viewer@farmerlift.com",
        fullName: "FarmerLift Viewer",
        role: "VIEWER",
        status: "PENDING",
      },
    ],
    sourceSummary: {
      siteId: "site-1",
      provider: "GIT_REPOSITORY",
      repoUrl: "https://github.com/naya/farmerlift-main",
      repoBranch: "main",
      repoRef: "refs/heads/main",
      deployedCommit: "abc123",
      runtimeProfile: "STATIC_ARTIFACT",
      operatorNotes: "Primary imported site",
      previewHost: "preview.naya/farmerlift-main",
    },
    previewUrl: "https://preview.naya/farmerlift-main",
    liveUrl: "https://farmerlift.shasvata.com",
    billingSummary: {
      billingContactEmails: ["billing@farmerlift.com"],
      cartCount: 1,
      totalQuotedMinor: 8500000,
      totalPayableTodayMinor: 4250000,
      latestCartId: "cart-1",
      latestCartStatus: "PAID",
      latestQuoteRequestStatus: "APPROVED",
      latestCheckoutStatus: "PAID",
      latestPaymentSessionId: "ps-1",
      latestProviderOrderId: "order-1",
      latestErpQuotationId: "ERP-QUO-1",
      latestErpSalesOrderId: "ERP-SO-1",
      latestErpCustomerId: "ERP-CUST-1",
      latestUpdatedAt: "2026-03-28T00:00:00.000Z",
    },
    ...overrides,
  };
}

function makeLead(overrides: Partial<ProjectLead> = {}): ProjectLead {
  return {
    id: "lead-1",
    projectId: "project-1",
    sourceLeadId: null,
    fullName: "Aarya Singh",
    email: "aarya@example.com",
    phone: "+91-9876543210",
    companyName: "Agri Ops",
    message: "Interested in launch support.",
    consent: true,
    sourcePage: null,
    sourceCta: null,
    utmSource: null,
    utmMedium: null,
    utmCampaign: null,
    utmContent: null,
    utmTerm: null,
    gclid: null,
    gbraid: null,
    wbraid: null,
    notificationStatus: null,
    notificationError: null,
    syncStatus: "SYNCED",
    syncError: null,
    visibilityState: "VISIBLE",
    hiddenAt: null,
    hiddenByPortalUserId: null,
    hiddenByUserEmail: null,
    hiddenByUserFullName: null,
    hiddenReasonCode: null,
    hiddenReasonNote: null,
    lastRestoredAt: null,
    lastRestoredByPortalUserId: null,
    lastRestoredByUserEmail: null,
    lastRestoredByUserFullName: null,
    sourceHost: null,
    serviceInterest: [],
    budgetRange: null,
    timeline: null,
    problemSummary: null,
    interestLabel: null,
    budgetLabel: null,
    touchpointLabel: null,
    isInternalTest: false,
    auditEvents: [],
    createdAt: "2026-03-28T00:00:00.000Z",
    ...overrides,
  };
}

describe("buildProjectsDashboard", () => {
  it("prefers an active project as the featured workspace", () => {
    const dashboard = buildProjectsDashboard([
      makeAccessibleProject({
        id: "archived",
        status: "ARCHIVED",
        name: "Archived Workspace",
        slug: "archived-workspace",
      }),
      makeAccessibleProject({
        id: "active",
        name: "Active Workspace",
        slug: "active-workspace",
      }),
      makeAccessibleProject({
        id: "draft",
        status: "DRAFT",
        name: "Draft Workspace",
        slug: "draft-workspace",
      }),
    ]);

    expect(dashboard.featuredProject?.id).toBe("active");
  });

  it("aggregates portfolio metrics across projects", () => {
    const dashboard = buildProjectsDashboard([
      makeAccessibleProject({
        id: "one",
        primaryDomain: "one.example.com",
        status: "ACTIVE",
      }),
      makeAccessibleProject({
        id: "two",
        primaryDomain: null,
        status: "DRAFT",
      }),
      makeAccessibleProject({
        id: "three",
        primaryDomain: "three.example.com",
        status: "ARCHIVED",
      }),
    ]);

    expect(dashboard.metrics.workspaceCount).toBe(3);
    expect(dashboard.metrics.liveDomainCount).toBe(2);
    expect(dashboard.metrics.activeWorkspaceCount).toBe(1);
    expect(dashboard.metrics.archivedWorkspaceCount).toBe(1);
  });
});

describe("buildDashboardOverview", () => {
  it("surfaces an active project as the spotlight and carries billing summary metrics", () => {
    const overview = buildDashboardOverview({
      projects: [
        makeAccessibleProject({
          id: "archived",
          status: "ARCHIVED",
          name: "Archived Workspace",
          slug: "archived-workspace",
        }),
        makeAccessibleProject({
          id: "active",
          name: "Active Workspace",
          slug: "active-workspace",
        }),
      ],
      details: [
        makeProjectDetail({
          id: "active",
          name: "Active Workspace",
          slug: "active-workspace",
          liveUrl: "https://active.example.com",
          leadCount: 24,
        }),
      ],
      billingSummary: {
        totalDueNowMinor: 2450000,
        projectsWithBilling: 1,
      },
    });

    expect(overview.spotlight.title).toBe("Active Workspace");
    expect(overview.metrics.totalDueNowMinor).toBe(2450000);
    expect(overview.workspaces[0]?.leadCount).toBe(24);
    expect(overview.workspaces[0]?.liveHref).toBe("https://active.example.com");
  });
});

describe("buildProjectWorkspace", () => {
  it("derives delivery, sync, and lead summaries from project data", () => {
    const workspace = buildProjectWorkspace(makeProjectDetail(), [
      makeLead(),
      makeLead({
        id: "lead-2",
        syncStatus: "FAILED",
        syncError: "Sheet unavailable.",
      }),
    ]);

    expect(workspace.metrics.publishedSiteCount).toBe(1);
    expect(workspace.metrics.pendingDomainCount).toBe(1);
    expect(workspace.metrics.syncedLeadCount).toBe(1);
    expect(workspace.metrics.failedLeadCount).toBe(1);
    expect(workspace.metrics.activeMemberCount).toBe(1);
    expect(workspace.primaryActionLabel).toBe("Open live site");
  });
});
