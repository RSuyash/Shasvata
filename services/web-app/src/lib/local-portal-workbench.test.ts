import { describe, expect, it } from "vitest";
import {
  LOCAL_PORTAL_WORKBENCH_PERSONA_COOKIE,
  LOCAL_PORTAL_WORKBENCH_SIGNED_OUT_COOKIE,
  createWorkbenchCheckoutSessionFromBillingSnapshot,
  getWorkbenchPortfolioBilling,
  getWorkbenchPortalSession,
  getWorkbenchProjectBilling,
  getWorkbenchProjectDetail,
  getWorkbenchProjectLeads,
  getWorkbenchProjects,
  getWorkbenchProjectOnboarding,
  isLocalPortalWorkbenchClientEnabled,
  isLocalPortalWorkbenchEnabled,
  readLocalPortalWorkbenchPersona,
  submitWorkbenchProjectOnboarding,
} from "./local-portal-workbench";

describe("local portal workbench env guards", () => {
  it("is enabled by default in local development", () => {
    expect(isLocalPortalWorkbenchEnabled()).toBe(true);
    expect(isLocalPortalWorkbenchClientEnabled()).toBe(true);
  });

  it("respects explicit signed-out state from cookies", () => {
    const session = getWorkbenchPortalSession(
      `${LOCAL_PORTAL_WORKBENCH_SIGNED_OUT_COOKIE}=1`,
    );

    expect(session).toBeNull();
  });
});

describe("readLocalPortalWorkbenchPersona", () => {
  it("defaults to the owner persona when no cookie is set", () => {
    expect(readLocalPortalWorkbenchPersona()).toBe("owner");
  });

  it("reads the requested persona from cookies", () => {
    expect(
      readLocalPortalWorkbenchPersona(
        `${LOCAL_PORTAL_WORKBENCH_PERSONA_COOKIE}=operator`,
      ),
    ).toBe("operator");
  });
});

describe("getWorkbenchPortalSession", () => {
  it("returns a client owner session by default", () => {
    const session = getWorkbenchPortalSession();

    expect(session?.portalUser.email).toBe("owner@topaz-towers.in");
    expect(session?.portalUser.role).toBe("CLIENT");
  });

  it("returns the operator session when requested", () => {
    const session = getWorkbenchPortalSession(
      `${LOCAL_PORTAL_WORKBENCH_PERSONA_COOKIE}=operator`,
    );

    expect(session?.portalUser.email).toBe("automation@shasvata.com");
    expect(session?.portalUser.role).toBe("PLATFORM_OPERATOR");
  });
});

describe("getWorkbenchProjects", () => {
  it("shows owner-level access for the default persona", () => {
    const projects = getWorkbenchProjects();

    expect(projects.length).toBeGreaterThanOrEqual(4);
    expect(projects[0]?.membershipRole).toBe("OWNER");
  });

  it("limits the viewer persona to viewer memberships", () => {
    const projects = getWorkbenchProjects(
      `${LOCAL_PORTAL_WORKBENCH_PERSONA_COOKIE}=viewer`,
    );

    expect(projects.length).toBeGreaterThan(0);
    expect(projects.every((project) => project.membershipRole === "VIEWER")).toBe(true);
  });
});

describe("getWorkbenchProjectDetail", () => {
  it("keeps billing summary aligned with the billing workspace data", () => {
    const detail = getWorkbenchProjectDetail("cmnhqmbbu0000q6u9ms9l84zi");
    const billing = getWorkbenchProjectBilling("cmnhqmbbu0000q6u9ms9l84zi");

    expect(detail.billingSummary.totalQuotedMinor).toBe(
      billing.activeSnapshot?.totalMinor ?? 0,
    );
    expect(detail.billingSummary.totalPayableTodayMinor).toBe(
      billing.paymentState.amountDueNowMinor,
    );
  });

  it("switches projects into operator mode for operator personas", () => {
    const detail = getWorkbenchProjectDetail(
      "cmnhqmbbu0000q6u9ms9l84zi",
      `${LOCAL_PORTAL_WORKBENCH_PERSONA_COOKIE}=operator`,
    );

    expect(detail.portalView).toBe("OPERATOR");
    expect(detail.membershipRole).toBe("OWNER");
  });
});

describe("getWorkbenchProjectLeads", () => {
  it("masks contact details for viewer personas", () => {
    const leads = getWorkbenchProjectLeads("cmnhqmbbu0000q6u9ms9l84zi", {
      cookieHeader: `${LOCAL_PORTAL_WORKBENCH_PERSONA_COOKIE}=viewer`,
      tab: "active",
    });

    expect(leads[0]?.email).toContain("•••");
    expect(leads[0]?.phone).toContain("•••");
  });

  it("preserves hidden lead data for owners", () => {
    const leads = getWorkbenchProjectLeads("cmnhqmbbu0000q6u9ms9l84zi", {
      tab: "hidden",
    });

    expect(leads.length).toBeGreaterThan(0);
    expect(leads[0]?.visibilityState).toBe("HIDDEN");
  });
});

describe("getWorkbenchPortfolioBilling", () => {
  it("aggregates billing across accessible projects", () => {
    const portfolio = getWorkbenchPortfolioBilling();

    expect(portfolio.summary.totalProjects).toBe(portfolio.projects.length);
    expect(portfolio.summary.totalDueNowMinor).toBeGreaterThan(0);
    expect(portfolio.summary.statusBreakdown.READY_TO_PAY).toBeGreaterThanOrEqual(1);
  });
});

describe("workbench commerce and onboarding helpers", () => {
  it("creates a simulated checkout session for billing iterations", () => {
    const session = createWorkbenchCheckoutSessionFromBillingSnapshot({
      billingSnapshotId: "snapshot-topaz-ready",
      returnUrl: "http://localhost:3002/dashboard/projects/cmnhqmbbu0000q6u9ms9l84zi/billing",
      cancelUrl: "http://localhost:3002/dashboard/projects/cmnhqmbbu0000q6u9ms9l84zi/billing",
    });

    expect(session.environment).toBe("MOCK");
    expect(session.amountMinor).toBe(299900);
    expect(session.providerOrderId).toContain("snapshot-topaz-ready");
  });

  it("returns a seeded onboarding session and project route", () => {
    const onboarding = getWorkbenchProjectOnboarding("onboarding-local-serefy");
    const result = submitWorkbenchProjectOnboarding("onboarding-local-serefy");

    expect(onboarding.status).toBe("DRAFT");
    expect(result.projectRoute).toBe(
      "/dashboard/projects/cmnwa9kup0000o5if72lf6ufe",
    );
    expect(result.project.id).toBe("cmnwa9kup0000o5if72lf6ufe");
  });
});
