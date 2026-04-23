import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  exportProjectLeadsCsv,
  exportProjectLeadsXlsx,
  addProjectNotificationRecipient,
  consumeProjectInvite,
  createImportedProject,
  getProjectBillingDetail,
  updateProjectBillingCheckoutIdentity,
  listOperatorProjects,
  listProjectAccessSettings,
  listProjectLeadTombstones,
  recordProjectSitePublish,
  refreshImportedProjectSource,
  getPortalSession,
  getProjectDetail,
  hardDeleteProjectLeads,
  inviteProjectMember,
  listAccessibleProjects,
  listProjectLeads,
  readProjectInvite,
  removeProjectMember,
  removeProjectNotificationRecipient,
  revokePortalSession,
  revokeProjectInvite,
  revealProjectLead,
  resendProjectInvite,
  restoreProjectLeads,
  softDeleteProjectLeads,
  updateProjectTrackingSettings,
  verifyProjectDomain,
  updateProjectInvite,
  updateProjectMemberRole,
  upsertProjectMdocSyncTarget,
  testProjectMdocSyncTarget,
  upsertProjectDomain,
} = vi.hoisted(() => ({
  addProjectNotificationRecipient: vi.fn(),
  consumeProjectInvite: vi.fn(),
  createImportedProject: vi.fn(),
  getProjectBillingDetail: vi.fn(),
  updateProjectBillingCheckoutIdentity: vi.fn(),
  listOperatorProjects: vi.fn(),
  listProjectAccessSettings: vi.fn(),
  listProjectLeadTombstones: vi.fn(),
  recordProjectSitePublish: vi.fn(),
  refreshImportedProjectSource: vi.fn(),
  getPortalSession: vi.fn(),
  revokePortalSession: vi.fn(),
  listAccessibleProjects: vi.fn(),
  getProjectDetail: vi.fn(),
  hardDeleteProjectLeads: vi.fn(),
  listProjectLeads: vi.fn(),
  inviteProjectMember: vi.fn(),
  readProjectInvite: vi.fn(),
  removeProjectMember: vi.fn(),
  exportProjectLeadsCsv: vi.fn(),
  exportProjectLeadsXlsx: vi.fn(),
  removeProjectNotificationRecipient: vi.fn(),
  resendProjectInvite: vi.fn(),
  restoreProjectLeads: vi.fn(),
  revealProjectLead: vi.fn(),
  revokeProjectInvite: vi.fn(),
  softDeleteProjectLeads: vi.fn(),
  updateProjectTrackingSettings: vi.fn(),
  verifyProjectDomain: vi.fn(),
  updateProjectInvite: vi.fn(),
  updateProjectMemberRole: vi.fn(),
  upsertProjectMdocSyncTarget: vi.fn(),
  testProjectMdocSyncTarget: vi.fn(),
  upsertProjectDomain: vi.fn(),
}));

const {
  createProjectManualLead,
  importProjectLeadsCsv,
  listProjectAcquisitionCampaigns,
  listProjectAcquisitionConnectors,
  testProjectAcquisitionConnector,
  upsertProjectAcquisitionCampaign,
  upsertProjectAcquisitionConnector,
} = vi.hoisted(() => ({
  createProjectManualLead: vi.fn(),
  importProjectLeadsCsv: vi.fn(),
  listProjectAcquisitionCampaigns: vi.fn(),
  listProjectAcquisitionConnectors: vi.fn(),
  testProjectAcquisitionConnector: vi.fn(),
  upsertProjectAcquisitionCampaign: vi.fn(),
  upsertProjectAcquisitionConnector: vi.fn(),
}));

const {
  getProjectOnboardingSession,
  resolveProjectOnboardingSession,
  saveProjectOnboardingSession,
  submitProjectOnboardingSession,
} = vi.hoisted(() => ({
  getProjectOnboardingSession: vi.fn(),
  resolveProjectOnboardingSession: vi.fn(),
  saveProjectOnboardingSession: vi.fn(),
  submitProjectOnboardingSession: vi.fn(),
}));

vi.mock("../services/landing-platform-runtime.js", () => ({
  addProjectNotificationRecipient,
  createImportedProject,
  consumeProjectInvite,
  listOperatorProjects,
  listProjectAccessSettings,
  listProjectLeadTombstones,
  recordProjectSitePublish,
  refreshImportedProjectSource,
  getPortalSession,
  revokePortalSession,
  listAccessibleProjects,
  getProjectDetail,
  hardDeleteProjectLeads,
  listProjectLeads,
  inviteProjectMember,
  readProjectInvite,
  removeProjectMember,
  exportProjectLeadsCsv,
  exportProjectLeadsXlsx,
  removeProjectNotificationRecipient,
  resendProjectInvite,
  restoreProjectLeads,
  revealProjectLead,
  revokeProjectInvite,
  softDeleteProjectLeads,
  updateProjectTrackingSettings,
  verifyProjectDomain,
  updateProjectInvite,
  updateProjectMemberRole,
  upsertProjectMdocSyncTarget,
  testProjectMdocSyncTarget,
  upsertProjectDomain,
}));

vi.mock("../services/project-billing-runtime.js", () => ({
  getProjectBillingDetail,
  updateProjectBillingCheckoutIdentity,
}));

vi.mock("../services/acquisition-runtime.js", () => ({
  createProjectManualLead,
  importProjectLeadsCsv,
  listProjectAcquisitionCampaigns,
  listProjectAcquisitionConnectors,
  testProjectAcquisitionConnector,
  upsertProjectAcquisitionCampaign,
  upsertProjectAcquisitionConnector,
}));

vi.mock("../services/project-onboarding-runtime.js", () => ({
  getProjectOnboardingSession,
  resolveProjectOnboardingSession,
  saveProjectOnboardingSession,
  submitProjectOnboardingSession,
}));

import { portalRouter } from "./portal.js";

function createApp() {
  const app = express();
  app.use(express.json());
  app.use("/api/landing/portal", portalRouter);
  return app;
}

describe("portalRouter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requires a portal session cookie for authenticated portal routes", async () => {
    const response = await request(createApp()).get("/api/landing/portal/projects");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: "Portal session required." });
    expect(listAccessibleProjects).not.toHaveBeenCalled();
  });

  it("returns the current portal session profile", async () => {
    getPortalSession.mockResolvedValue({
      session: {
        id: "session_1",
        expiresAt: new Date("2026-04-25T00:00:00.000Z"),
      },
      portalUser: {
        id: "user_client",
        email: "client@example.com",
        fullName: "Client Owner",
        role: "CLIENT",
        companyName: "Estate Autopilots",
      },
    });

    const response = await request(createApp())
      .get("/api/landing/portal/session")
      .set("Cookie", ["ng_portal_session=session_1"]);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      authenticated: true,
      portalUser: {
        id: "user_client",
        email: "client@example.com",
        fullName: "Client Owner",
        role: "CLIENT",
        companyName: "Estate Autopilots",
      },
    });
  });

  it("returns only the projects available to the authenticated user", async () => {
    getPortalSession.mockResolvedValue({
      session: {
        id: "session_1",
        expiresAt: new Date("2026-04-25T00:00:00.000Z"),
      },
      portalUser: {
        id: "user_client",
        email: "client@example.com",
        fullName: "Client Owner",
        role: "CLIENT",
        companyName: "Estate Autopilots",
      },
    });
    listAccessibleProjects.mockResolvedValue([
      {
        id: "project_alpha",
        slug: "estate-autopilots-alpha",
        name: "Estate Autopilots Alpha",
        status: "ACTIVE",
        publicLeadKey: "lead_alpha",
        primaryDomain: "alpha.example.com",
        membershipRole: "OWNER",
      },
    ]);

    const response = await request(createApp())
      .get("/api/landing/portal/projects")
      .set("Cookie", ["ng_portal_session=session_1"]);

    expect(response.status).toBe(200);
    expect(response.body.projects).toHaveLength(1);
    expect(listAccessibleProjects).toHaveBeenCalledWith("user_client");
  });

  it("resolves a paid cart into an onboarding session for the authenticated client", async () => {
    getPortalSession.mockResolvedValue({
      session: {
        id: "session_1",
        expiresAt: new Date("2026-04-25T00:00:00.000Z"),
      },
      portalUser: {
        id: "user_client",
        email: "client@example.com",
        fullName: "Client Owner",
        role: "CLIENT",
        companyName: "Estate Autopilots",
      },
    });
    resolveProjectOnboardingSession.mockResolvedValue({
      id: "onboarding_1",
      cartId: "cart_paid",
      status: "DRAFT",
      summary: {
        currency: "INR",
        totalMinor: 479700,
        payableTodayMinor: 479700,
        remainingAfterTodayMinor: 0,
      },
      intake: {},
    });

    const response = await request(createApp())
      .post("/api/landing/portal/onboarding/resolve")
      .set("Cookie", ["ng_portal_session=session_1"])
      .send({
        cartId: "cart_paid",
      });

    expect(response.status).toBe(200);
    expect(response.body.session.id).toBe("onboarding_1");
    expect(resolveProjectOnboardingSession).toHaveBeenCalledWith({
      portalUserId: "user_client",
      cartId: "cart_paid",
    });
  });

  it("saves and submits onboarding sessions through the authenticated portal contract", async () => {
    getPortalSession.mockResolvedValue({
      session: {
        id: "session_1",
        expiresAt: new Date("2026-04-25T00:00:00.000Z"),
      },
      portalUser: {
        id: "user_client",
        email: "client@example.com",
        fullName: "Client Owner",
        role: "CLIENT",
        companyName: "Estate Autopilots",
      },
    });
    getProjectOnboardingSession.mockResolvedValue({
      id: "onboarding_1",
      cartId: "cart_paid",
      status: "DRAFT",
      intake: {
        projectName: "Wagholi Highstreet April Launch",
      },
      summary: {
        currency: "INR",
        totalMinor: 479700,
        payableTodayMinor: 479700,
        remainingAfterTodayMinor: 0,
      },
    });
    saveProjectOnboardingSession.mockResolvedValue({
      id: "onboarding_1",
      cartId: "cart_paid",
      status: "DRAFT",
      lastCompletedStep: "brand",
      intake: {
        projectName: "Wagholi Highstreet April Launch",
        launchGoal: "Capture qualified enquiries",
      },
      summary: {
        currency: "INR",
        totalMinor: 479700,
        payableTodayMinor: 479700,
        remainingAfterTodayMinor: 0,
      },
    });
    submitProjectOnboardingSession.mockResolvedValue({
      session: {
        id: "onboarding_1",
        cartId: "cart_paid",
        projectId: "project_1",
        status: "CONVERTED",
        intake: {
          projectName: "Wagholi Highstreet April Launch",
        },
        summary: {
          currency: "INR",
          totalMinor: 479700,
          payableTodayMinor: 479700,
          remainingAfterTodayMinor: 0,
        },
      },
      project: {
        id: "project_1",
        slug: "wagholi-highstreet-april-launch",
        name: "Wagholi Highstreet April Launch",
        status: "ACTIVE",
      },
      projectRoute: "/dashboard/projects/project_1",
    });

    const agent = request(createApp());

    const getResponse = await agent
      .get("/api/landing/portal/onboarding/onboarding_1")
      .set("Cookie", ["ng_portal_session=session_1"]);
    expect(getResponse.status).toBe(200);
    expect(getProjectOnboardingSession).toHaveBeenCalledWith({
      portalUserId: "user_client",
      sessionId: "onboarding_1",
    });

    const saveResponse = await agent
      .patch("/api/landing/portal/onboarding/onboarding_1")
      .set("Cookie", ["ng_portal_session=session_1"])
      .send({
        intake: {
          projectName: "Wagholi Highstreet April Launch",
          launchGoal: "Capture qualified enquiries",
        },
        lastCompletedStep: "brand",
      });
    expect(saveResponse.status).toBe(200);
    expect(saveProjectOnboardingSession).toHaveBeenCalledWith({
      portalUserId: "user_client",
      sessionId: "onboarding_1",
      intake: {
        projectName: "Wagholi Highstreet April Launch",
        launchGoal: "Capture qualified enquiries",
      },
      lastCompletedStep: "brand",
    });

    const submitResponse = await agent
      .post("/api/landing/portal/onboarding/onboarding_1/submit")
      .set("Cookie", ["ng_portal_session=session_1"]);
    expect(submitResponse.status).toBe(200);
    expect(submitResponse.body.projectRoute).toBe("/dashboard/projects/project_1");
    expect(submitProjectOnboardingSession).toHaveBeenCalledWith({
      portalUserId: "user_client",
      sessionId: "onboarding_1",
    });
  });

  it("returns project detail, lead rows, and csv export for the authenticated user", async () => {
    getPortalSession.mockResolvedValue({
      session: {
        id: "session_1",
        expiresAt: new Date("2026-04-25T00:00:00.000Z"),
      },
      portalUser: {
        id: "user_client",
        email: "client@example.com",
        fullName: "Client Owner",
        role: "CLIENT",
        companyName: "Estate Autopilots",
      },
    });
    getProjectDetail.mockResolvedValue({
      id: "project_alpha",
      slug: "estate-autopilots-alpha",
      name: "Estate Autopilots Alpha",
      status: "ACTIVE",
      publicLeadKey: "lead_alpha",
      primaryDomain: "alpha.example.com",
      description: "Lead generation landing page",
      notes: "Launch batch 1",
      membershipRole: "OWNER",
      leadCount: 1,
      sites: [
        {
          id: "site_alpha",
          slug: "estate-autopilots-alpha",
          templateKey: "builder-leads-v1",
          themeKey: "estate-autopilots",
          publishStatus: "PUBLISHED",
          lastPublishedAt: new Date("2026-03-26T00:00:00.000Z"),
          latestPreviewPath: "/preview/project_alpha",
        },
      ],
      domains: [
        {
          id: "domain_alpha",
          host: "alpha.example.com",
          status: "ACTIVE",
          isPrimary: true,
          dnsTarget: "landing.shasvata.com",
          verifiedAt: new Date("2026-03-26T00:00:00.000Z"),
        },
      ],
      syncTargets: [
        {
          id: "sync_alpha",
          projectId: "project_alpha",
          kind: "GOOGLE_SHEETS",
          status: "ACTIVE",
          label: "Client leads sheet",
          config: {
            spreadsheetId: "sheet_alpha",
            sheetName: "Leads",
          },
        },
      ],
      members: [
        {
          portalUserId: "user_client",
          email: "client@example.com",
          fullName: "Client Owner",
          role: "OWNER",
          status: "ACTIVE",
        },
      ],
      leadNotificationRecipients: [],
    });
    listProjectLeads.mockResolvedValue([
      {
        id: "lead_1",
        projectId: "project_alpha",
        fullName: "Ada Lovelace",
        email: "ada@example.com",
        phone: "+91 90000 11111",
        companyName: "Estate Autopilots",
        message: "Need more qualified seller leads.",
        consent: true,
        syncStatus: "SYNCED",
        syncError: null,
        createdAt: new Date("2026-03-26T00:00:00.000Z"),
      },
    ]);
    exportProjectLeadsCsv.mockResolvedValue(
      "full_name,email,phone,company_name,message,sync_status,created_at\nAda Lovelace,ada@example.com",
    );
    exportProjectLeadsXlsx.mockResolvedValue(Buffer.from("xlsx-binary"));

    const agent = request(createApp());

    const detailResponse = await agent
      .get("/api/landing/portal/projects/project_alpha")
      .set("Cookie", ["ng_portal_session=session_1"]);
    expect(detailResponse.status).toBe(200);
    expect(detailResponse.body.project.id).toBe("project_alpha");

    const leadsResponse = await agent
      .get("/api/landing/portal/projects/project_alpha/leads")
      .set("Cookie", ["ng_portal_session=session_1"]);
    expect(leadsResponse.status).toBe(200);
    expect(leadsResponse.body.leads).toHaveLength(1);

    const csvResponse = await agent
      .get("/api/landing/portal/projects/project_alpha/leads/export.csv")
      .set("Cookie", ["ng_portal_session=session_1"]);
    expect(csvResponse.status).toBe(200);
    expect(csvResponse.text).toContain("Ada Lovelace");
    expect(csvResponse.headers["content-type"]).toContain("text/csv");

    const xlsxResponse = await agent
      .get("/api/landing/portal/projects/project_alpha/leads/export.xlsx")
      .set("Cookie", ["ng_portal_session=session_1"]);
    expect(xlsxResponse.status).toBe(200);
    expect(xlsxResponse.headers["content-type"]).toContain(
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    expect(exportProjectLeadsXlsx).toHaveBeenCalledWith({
      portalUserId: "user_client",
      projectId: "project_alpha",
      mode: "basic",
    });
  });

  it("returns dedicated billing detail for the authenticated project user", async () => {
    getPortalSession.mockResolvedValue({
      session: {
        id: "session_1",
        expiresAt: new Date("2026-04-25T00:00:00.000Z"),
      },
      portalUser: {
        id: "user_client",
        email: "client@example.com",
        fullName: "Client Owner",
        role: "CLIENT",
        companyName: "Estate Autopilots",
      },
    });
    getProjectBillingDetail.mockResolvedValue({
      projectId: "project_alpha",
      projectName: "Estate Autopilots Alpha",
      currency: "INR",
      status: "READY_TO_PAY",
      activeSnapshot: {
        id: "snapshot_alpha",
        sourceType: "PROJECT_PLAN",
        status: "ACTIVE",
        currency: "INR",
        subtotalMinor: 8_500_000,
        discountMinor: 1_350_000,
        totalMinor: 7_150_000,
        payableTodayMinor: 3_575_000,
        remainingAfterTodayMinor: 3_575_000,
        offerCodeApplied: "NAYA10",
        couponCodeApplied: "NAYA10",
        referralCodeApplied: null,
        operatorAdjustmentMinor: 500_000,
        validUntil: "2026-04-05T00:00:00.000Z",
        lines: [
          {
            slug: "launchpad-website",
            itemCode: "NG-TECH-LAUNCHPAD",
            label: "Launchpad Website",
            quantity: 1,
            unitPriceMinor: 8_500_000,
            lineDiscountMinor: 1_350_000,
            lineTotalMinor: 7_150_000,
            payableTodayMinor: 3_575_000,
            remainingAfterTodayMinor: 3_575_000,
          },
        ],
      },
      paymentState: {
        canPayNow: true,
        latestCheckoutStatus: "CREATED",
        latestPaymentSessionId: "ps_alpha",
        providerOrderId: "order_alpha",
        amountDueNowMinor: 3_575_000,
        amountPaidMinor: 0,
        outstandingMinor: 7_150_000,
      },
      erpState: {
        erpCustomerId: "ERP-CUST-ALPHA",
        quotationId: "ERP-QUO-ALPHA",
        salesOrderId: "ERP-SO-ALPHA",
        invoiceId: null,
        paymentEntryIds: [],
        latestInvoiceStatus: null,
        latestInvoiceOutstandingMinor: null,
        syncStatus: "PARTIAL",
      },
      billingHealth: {
        sourceOfTruth: "SNAPSHOT",
        stage: "QUOTED",
        tone: "neutral",
        headline: "ERP quotation is linked",
        detail:
          "The quotation is visible in ERP, but billing is still following the active snapshot until order and invoice records are created.",
        lastSyncedAt: "2026-04-08T08:00:00.000Z",
        warnings: [],
      },
      checkoutReadiness: {
        ready: false,
        blockers: [
          {
            code: "MISSING_CHECKOUT_PHONE",
            label: "Add the mobile number that should receive payment options.",
          },
        ],
        notes: [
          "Billing confirmations route through billing@example.com.",
          "Checkout is still using the approved billing snapshot.",
        ],
      },
      contacts: [
        {
          email: "billing@example.com",
          label: "Billing owner",
          status: "ACTIVE",
        },
      ],
      checkoutPhone: null,
      timeline: [],
      actions: {
        canPayNow: true,
        payNowUrl: "https://payments.example.com/session",
        canDownloadQuote: true,
        canDownloadInvoice: false,
        canContactBilling: true,
      },
    });

    const response = await request(createApp())
      .get("/api/landing/portal/projects/project_alpha/billing")
      .set("Cookie", ["ng_portal_session=session_1"]);

    expect(response.status).toBe(200);
    expect(response.body.billing.projectId).toBe("project_alpha");
    expect(getProjectBillingDetail).toHaveBeenCalledWith({
      portalUserId: "user_client",
      projectId: "project_alpha",
    });
  });

  it("lets a project owner store the checkout phone used before payment", async () => {
    getPortalSession.mockResolvedValue({
      session: {
        id: "session_1",
        expiresAt: new Date("2026-04-25T00:00:00.000Z"),
      },
      portalUser: {
        id: "user_client",
        email: "client@example.com",
        fullName: "Client Owner",
        role: "CLIENT",
        companyName: "Estate Autopilots",
      },
    });
    updateProjectBillingCheckoutIdentity.mockResolvedValue({
      projectId: "project_alpha",
      billingMode: "HYBRID",
      currency: "INR",
      allowCoupons: true,
      allowReferral: true,
      allowOperatorOverride: true,
      defaultDepositPercent: 50,
      defaultPaymentMode: "DEPOSIT",
      erpCustomerId: null,
      commercialOwnerUserId: "user_client",
      notes: null,
      contacts: [],
      checkoutPhone: "919876543210",
      activeSnapshotId: "snapshot_alpha",
    });

    const response = await request(createApp())
      .patch("/api/landing/portal/projects/project_alpha/billing/checkout-identity")
      .set("Cookie", ["ng_portal_session=session_1"])
      .send({
        billingPhone: "+91 98765 43210",
      });

    expect(response.status).toBe(200);
    expect(response.body.config.checkoutPhone).toBe("919876543210");
    expect(updateProjectBillingCheckoutIdentity).toHaveBeenCalledWith({
      portalUserId: "user_client",
      projectId: "project_alpha",
      billingPhone: "+91 98765 43210",
    });
  });

  it("passes through the requested full export mode for csv and xlsx downloads", async () => {
    getPortalSession.mockResolvedValue({
      session: {
        id: "session_1",
        expiresAt: new Date("2026-04-25T00:00:00.000Z"),
      },
      portalUser: {
        id: "user_client",
        email: "client@example.com",
        fullName: "Client Owner",
        role: "CLIENT",
        companyName: "Estate Autopilots",
      },
    });
    exportProjectLeadsCsv.mockResolvedValue("created_at,full_name\n2026-03-29,Ada Lovelace");
    exportProjectLeadsXlsx.mockResolvedValue(Buffer.from("xlsx-binary"));

    const agent = request(createApp());

    const csvResponse = await agent
      .get("/api/landing/portal/projects/project_alpha/leads/export.csv?mode=full")
      .set("Cookie", ["ng_portal_session=session_1"]);
    expect(csvResponse.status).toBe(200);

    const xlsxResponse = await agent
      .get("/api/landing/portal/projects/project_alpha/leads/export.xlsx?mode=full")
      .set("Cookie", ["ng_portal_session=session_1"]);
    expect(xlsxResponse.status).toBe(200);

    expect(exportProjectLeadsCsv).toHaveBeenCalledWith({
      portalUserId: "user_client",
      projectId: "project_alpha",
      mode: "full",
    });
    expect(exportProjectLeadsXlsx).toHaveBeenCalledWith({
      portalUserId: "user_client",
      projectId: "project_alpha",
      mode: "full",
    });
  });

  it("clears the portal session cookie on sign-out", async () => {
    getPortalSession.mockResolvedValue({
      session: {
        id: "session_1",
        expiresAt: new Date("2026-04-25T00:00:00.000Z"),
      },
      portalUser: {
        id: "user_client",
        email: "client@example.com",
        fullName: "Client Owner",
        role: "CLIENT",
        companyName: "Estate Autopilots",
      },
    });

    const response = await request(createApp())
      .post("/api/landing/portal/sign-out")
      .set("Cookie", ["ng_portal_session=session_1"]);

    expect(response.status).toBe(204);
    expect(revokePortalSession).toHaveBeenCalledWith("session_1");
    expect(response.headers["set-cookie"]?.[0]).toContain("ng_portal_session=;");
  });

  it("lets a project owner invite another member into the project workspace", async () => {
    getPortalSession.mockResolvedValue({
      session: {
        id: "session_1",
        expiresAt: new Date("2026-04-25T00:00:00.000Z"),
      },
      portalUser: {
        id: "user_client",
        email: "client@example.com",
        fullName: "Client Owner",
        role: "CLIENT",
        companyName: "Estate Autopilots",
      },
    });
    inviteProjectMember.mockResolvedValue({
      id: "invite_1",
      projectId: "project_alpha",
      email: "viewer@example.com",
      fullName: "Client Viewer",
      role: "VIEWER",
      invitedByPortalUserId: "user_client",
      invitedByUserEmail: "client@example.com",
      invitedByUserFullName: "Client Owner",
      acceptedByPortalUserId: null,
      acceptedByUserEmail: null,
      acceptedByUserFullName: null,
      selector: "selector",
      verifierHash: "hash:verifier",
      status: "PENDING",
      expiresAt: new Date("2026-04-10T00:00:00.000Z"),
      acceptedAt: null,
      revokedAt: null,
      createdAt: new Date("2026-04-03T00:00:00.000Z"),
      updatedAt: new Date("2026-04-03T00:00:00.000Z"),
    });

    const response = await request(createApp())
      .post("/api/landing/portal/projects/project_alpha/members")
      .set("Cookie", ["ng_portal_session=session_1"])
      .send({
        email: "viewer@example.com",
        fullName: "Client Viewer",
        role: "VIEWER",
      });

    expect(response.status).toBe(201);
    expect(response.body.invite.email).toBe("viewer@example.com");
    expect(inviteProjectMember).toHaveBeenCalledWith({
      portalUserId: "user_client",
      projectId: "project_alpha",
      email: "viewer@example.com",
      fullName: "Client Viewer",
      role: "VIEWER",
    });
  });

  it("passes the lead tab and supports owner soft-delete actions", async () => {
    getPortalSession.mockResolvedValue({
      session: {
        id: "session_1",
        expiresAt: new Date("2026-04-25T00:00:00.000Z"),
      },
      portalUser: {
        id: "user_client",
        email: "client@example.com",
        fullName: "Client Owner",
        role: "CLIENT",
        companyName: "Estate Autopilots",
      },
    });
    listProjectLeads.mockResolvedValue([]);
    softDeleteProjectLeads.mockResolvedValue([
      {
        id: "lead_1",
        visibilityState: "HIDDEN",
      },
    ]);

    const app = createApp();

    const listResponse = await request(app)
      .get("/api/landing/portal/projects/project_alpha/leads?tab=hidden")
      .set("Cookie", ["ng_portal_session=session_1"]);

    expect(listResponse.status).toBe(200);
    expect(listProjectLeads).toHaveBeenCalledWith({
      portalUserId: "user_client",
      projectId: "project_alpha",
      tab: "hidden",
    });

    const deleteResponse = await request(app)
      .post("/api/landing/portal/projects/project_alpha/leads/soft-delete")
      .set("Cookie", ["ng_portal_session=session_1"])
      .send({
        leadIds: ["lead_1"],
        reasonCode: "DUPLICATE_LEAD",
      });

    expect(deleteResponse.status).toBe(200);
    expect(softDeleteProjectLeads).toHaveBeenCalledWith({
      portalUserId: "user_client",
      projectId: "project_alpha",
      leadIds: ["lead_1"],
      reasonCode: "DUPLICATE_LEAD",
      note: undefined,
    });
  });

  it("requires typed confirmation before hard delete", async () => {
    getPortalSession.mockResolvedValue({
      session: {
        id: "session_operator",
        expiresAt: new Date("2026-04-25T00:00:00.000Z"),
      },
      portalUser: {
        id: "user_operator",
        email: "ops@shasvata.com",
        fullName: "Ops Lead",
        role: "PLATFORM_OPERATOR",
        companyName: "Shasvata",
      },
    });

    const response = await request(createApp())
      .post("/api/landing/portal/projects/project_alpha/leads/hard-delete")
      .set("Cookie", ["ng_portal_session=session_operator"])
      .send({
        leadIds: ["lead_1"],
        reasonCode: "OPERATOR_CORRECTION",
        confirmation: "nope",
      });

    expect(response.status).toBe(400);
    expect(hardDeleteProjectLeads).not.toHaveBeenCalled();
  });

  it("lets a platform operator add and remove project lead alert recipients", async () => {
    getPortalSession.mockResolvedValue({
      session: {
        id: "session_operator",
        expiresAt: new Date("2026-04-25T00:00:00.000Z"),
      },
      portalUser: {
        id: "user_operator",
        email: "ops@shasvata.com",
        fullName: "Ops Lead",
        role: "PLATFORM_OPERATOR",
        companyName: "Shasvata",
      },
    });
    addProjectNotificationRecipient.mockResolvedValue({
      id: "recipient_1",
      projectId: "project_alpha",
      email: "builder@example.com",
      label: "Builder sales",
    });
    removeProjectNotificationRecipient.mockResolvedValue({
      removed: true,
    });

    const agent = request(createApp());

    const createResponse = await agent
      .post("/api/landing/portal/projects/project_alpha/notification-recipients")
      .set("Cookie", ["ng_portal_session=session_operator"])
      .send({
        email: "builder@example.com",
        label: "Builder sales",
      });

    expect(createResponse.status).toBe(201);
    expect(addProjectNotificationRecipient).toHaveBeenCalledWith({
      portalUserId: "user_operator",
      projectId: "project_alpha",
      email: "builder@example.com",
      label: "Builder sales",
    });

    const deleteResponse = await agent
      .delete("/api/landing/portal/projects/project_alpha/notification-recipients/recipient_1")
      .set("Cookie", ["ng_portal_session=session_operator"]);

    expect(deleteResponse.status).toBe(204);
    expect(removeProjectNotificationRecipient).toHaveBeenCalledWith({
      portalUserId: "user_operator",
      projectId: "project_alpha",
      recipientId: "recipient_1",
    });
  });

  it("updates project tracking settings including Google Ads fields", async () => {
    getPortalSession.mockResolvedValue({
      session: {
        id: "session_1",
        expiresAt: new Date("2026-04-25T00:00:00.000Z"),
      },
      portalUser: {
        id: "user_client",
        email: "client@example.com",
        fullName: "Client Owner",
        role: "CLIENT",
        companyName: "Estate Autopilots",
      },
    });
    updateProjectTrackingSettings.mockResolvedValue({
      id: "site_alpha",
      projectId: "project_alpha",
      slug: "estate-autopilots-alpha",
      templateKey: "builder-leads-v1",
      themeKey: "estate-autopilots",
      sourceProvider: "GIT_REPOSITORY",
      repoUrl: "https://github.com/naya/estate-autopilots-alpha",
      repoBranch: "main",
      repoRef: "refs/heads/main",
      deployedCommit: "abc123def456",
      runtimeProfile: "STATIC_ARTIFACT",
      operatorNotes: "Imported from AI Studio output.",
      ga4MeasurementId: "G-ALPHA1234",
      googleAdsTagId: "AW-18098571219",
      googleAdsConversionMode: "GA4_IMPORTED",
      googleAdsLeadConversionLabel: "topazLeadPrimary_01",
      gtmContainerId: "GTM-ALPHA12",
      metaPixelId: "123456789012345",
      trackingNotes: "Use /thank-you as the canonical conversion route.",
      publishStatus: "PUBLISHED",
      lastPublishedAt: "2026-03-26T00:00:00.000Z",
      previewHost: "estate-autopilots-alpha.preview.shasvata.com",
      latestPreviewPath: "https://estate-autopilots-alpha.preview.shasvata.com",
    });

    const response = await request(createApp())
      .patch("/api/landing/portal/projects/project_alpha/settings/tracking")
      .set("Cookie", ["ng_portal_session=session_1"])
      .send({
        ga4MeasurementId: "G-ALPHA1234",
        googleAdsTagId: "AW-18098571219",
        googleAdsConversionMode: "GA4_IMPORTED",
        googleAdsLeadConversionLabel: "topazLeadPrimary_01",
        gtmContainerId: "GTM-ALPHA12",
        metaPixelId: "123456789012345",
        trackingNotes: "Use /thank-you as the canonical conversion route.",
      });

    expect(response.status).toBe(200);
    expect(response.body.site.googleAdsTagId).toBe("AW-18098571219");
    expect(updateProjectTrackingSettings).toHaveBeenCalledWith({
      portalUserId: "user_client",
      projectId: "project_alpha",
      ga4MeasurementId: "G-ALPHA1234",
      googleAdsTagId: "AW-18098571219",
      googleAdsConversionMode: "GA4_IMPORTED",
      googleAdsLeadConversionLabel: "topazLeadPrimary_01",
      gtmContainerId: "GTM-ALPHA12",
      metaPixelId: "123456789012345",
      trackingNotes: "Use /thank-you as the canonical conversion route.",
    });
  });

  it("lets a platform operator upsert an MDOC sync target from project settings", async () => {
    getPortalSession.mockResolvedValue({
      session: {
        id: "session_operator",
        expiresAt: new Date("2026-04-25T00:00:00.000Z"),
      },
      portalUser: {
        id: "user_operator",
        email: "ops@shasvata.com",
        fullName: "Ops Lead",
        role: "PLATFORM_OPERATOR",
        companyName: "Shasvata",
      },
    });
    upsertProjectMdocSyncTarget.mockResolvedValue({
      id: "sync_mdoc",
      projectId: "project_alpha",
      kind: "MDOC_PUSH",
      status: "ACTIVE",
      label: "Topaz MDOC",
      config: {
        endpoint: "https://aakar.maksoftbox.com//MDocBoxAPI/MdocAddEnquiryORTeleCalling/",
        apiKey: "secret-key",
        dataFrom: "E",
        source: "Digitals",
        fallbackSourceDetail: "Website",
        sourceDetailRules: {
          google: "Google Ad",
        },
        staticDefaults: {
          City: "Pune",
        },
        enumMappings: {
          preferences: {
            "2 BHK": "2 BHK",
          },
        },
      },
    });

    const response = await request(createApp())
      .put("/api/landing/portal/projects/project_alpha/settings/sync-targets/mdoc")
      .set("Cookie", ["ng_portal_session=session_operator"])
      .send({
        label: "Topaz MDOC",
        endpoint: "https://aakar.maksoftbox.com//MDocBoxAPI/MdocAddEnquiryORTeleCalling/",
        apiKey: "secret-key",
        dataFrom: "E",
        source: "Digitals",
        fallbackSourceDetail: "Website",
        sourceDetailRules: {
          google: "Google Ad",
        },
        staticDefaults: {
          City: "Pune",
        },
        enumMappings: {
          preferences: {
            "2 BHK": "2 BHK",
          },
        },
      });

    expect(response.status).toBe(200);
    expect(response.body.target.kind).toBe("MDOC_PUSH");
    expect(upsertProjectMdocSyncTarget).toHaveBeenCalledWith({
      portalUserId: "user_operator",
      projectId: "project_alpha",
      status: "ACTIVE",
      label: "Topaz MDOC",
      endpoint: "https://aakar.maksoftbox.com//MDocBoxAPI/MdocAddEnquiryORTeleCalling/",
      apiKey: "secret-key",
      dataFrom: "E",
      source: "Digitals",
      fallbackSourceDetail: "Website",
      sourceDetailRules: {
        google: "Google Ad",
      },
      staticDefaults: {
        City: "Pune",
      },
      enumMappings: {
        preferences: {
          "2 BHK": "2 BHK",
        },
      },
    });
  });

  it("lets owners run an MDOC connectivity test from project settings", async () => {
    getPortalSession.mockResolvedValue({
      session: {
        id: "session_owner",
        expiresAt: new Date("2026-04-25T00:00:00.000Z"),
      },
      portalUser: {
        id: "user_owner",
        email: "owner@example.com",
        fullName: "Project Owner",
        role: "CLIENT",
        companyName: "Topaz",
      },
    });
    testProjectMdocSyncTarget.mockResolvedValue({
      responseCode: 200,
      responseBody: "{\"status\":\"success\"}",
      metadata: {
        sourceDetail: "Google Ad",
      },
      config: {
        endpoint: "https://aakar.maksoftbox.com//MDocBoxAPI/MdocAddEnquiryORTeleCalling/",
        apiKey: "secret-key",
        dataFrom: "E",
        source: "Digitals",
        fallbackSourceDetail: "Website",
      },
    });

    const response = await request(createApp())
      .post("/api/landing/portal/projects/project_alpha/settings/sync-targets/mdoc/test")
      .set("Cookie", ["ng_portal_session=session_owner"])
      .send({
        endpoint: "https://aakar.maksoftbox.com//MDocBoxAPI/MdocAddEnquiryORTeleCalling/",
        apiKey: "secret-key",
        dataFrom: "E",
        source: "Digitals",
        fallbackSourceDetail: "Website",
      });

    expect(response.status).toBe(200);
    expect(response.body.result.responseCode).toBe(200);
    expect(testProjectMdocSyncTarget).toHaveBeenCalledWith({
      portalUserId: "user_owner",
      projectId: "project_alpha",
      endpoint: "https://aakar.maksoftbox.com//MDocBoxAPI/MdocAddEnquiryORTeleCalling/",
      apiKey: "secret-key",
      dataFrom: "E",
      source: "Digitals",
      fallbackSourceDetail: "Website",
      sourceDetailRules: undefined,
      staticDefaults: undefined,
      enumMappings: undefined,
    });
  });

  it("returns acquisition source setup for a project owner", async () => {
    getPortalSession.mockResolvedValue({
      session: {
        id: "session_owner",
        expiresAt: new Date("2026-04-25T00:00:00.000Z"),
      },
      portalUser: {
        id: "user_owner",
        email: "owner@example.com",
        fullName: "Project Owner",
        role: "CLIENT",
        companyName: "Topaz",
      },
    });
    listProjectAcquisitionConnectors.mockResolvedValue([
      {
        id: "connector_meta",
        projectId: "project_alpha",
        kind: "META_LEAD_ADS",
        status: "NEEDS_AUTH",
        label: "Meta Lead Ads",
        lastCheckedAt: null,
        lastSyncAt: null,
        lastError: null,
      },
    ]);
    listProjectAcquisitionCampaigns.mockResolvedValue([
      {
        id: "campaign_1",
        projectId: "project_alpha",
        provider: "GOOGLE_ADS",
        name: "Spring Launch",
        utmSource: "google",
        utmCampaign: "spring-launch",
      },
    ]);

    const response = await request(createApp())
      .get("/api/landing/portal/projects/project_alpha/acquisition")
      .set("Cookie", ["ng_portal_session=session_owner"]);

    expect(response.status).toBe(200);
    expect(response.body.connectors).toHaveLength(1);
    expect(response.body.campaigns).toHaveLength(1);
    expect(listProjectAcquisitionConnectors).toHaveBeenCalledWith({
      portalUserId: "user_owner",
      projectId: "project_alpha",
    });
    expect(listProjectAcquisitionCampaigns).toHaveBeenCalledWith({
      portalUserId: "user_owner",
      projectId: "project_alpha",
    });
  });

  it("lets a project owner upsert acquisition connectors and campaigns", async () => {
    getPortalSession.mockResolvedValue({
      session: {
        id: "session_owner",
        expiresAt: new Date("2026-04-25T00:00:00.000Z"),
      },
      portalUser: {
        id: "user_owner",
        email: "owner@example.com",
        fullName: "Project Owner",
        role: "CLIENT",
        companyName: "Topaz",
      },
    });
    upsertProjectAcquisitionConnector.mockResolvedValue({
      id: "connector_linkedin",
      projectId: "project_alpha",
      kind: "LINKEDIN_LEAD_GEN",
      status: "NEEDS_AUTH",
      label: "LinkedIn Lead Gen",
    });
    upsertProjectAcquisitionCampaign.mockResolvedValue({
      id: "campaign_linkedin",
      projectId: "project_alpha",
      provider: "LINKEDIN_LEAD_GEN",
      name: "Broker Event Leads",
      utmSource: "linkedin",
      utmCampaign: "broker-event",
    });

    const agent = request(createApp());

    const connectorResponse = await agent
      .post("/api/landing/portal/projects/project_alpha/acquisition/connectors")
      .set("Cookie", ["ng_portal_session=session_owner"])
      .send({
        kind: "LINKEDIN_LEAD_GEN",
        label: "LinkedIn Lead Gen",
      });

    expect(connectorResponse.status).toBe(201);
    expect(upsertProjectAcquisitionConnector).toHaveBeenCalledWith({
      portalUserId: "user_owner",
      projectId: "project_alpha",
      connectorId: undefined,
      kind: "LINKEDIN_LEAD_GEN",
      status: undefined,
      label: "LinkedIn Lead Gen",
      externalAccountId: undefined,
      config: undefined,
      metadata: undefined,
    });

    const campaignResponse = await agent
      .post("/api/landing/portal/projects/project_alpha/acquisition/campaigns")
      .set("Cookie", ["ng_portal_session=session_owner"])
      .send({
        provider: "LINKEDIN_LEAD_GEN",
        name: "Broker Event Leads",
        utmSource: "linkedin",
        utmCampaign: "broker-event",
      });

    expect(campaignResponse.status).toBe(201);
    expect(upsertProjectAcquisitionCampaign).toHaveBeenCalledWith({
      portalUserId: "user_owner",
      projectId: "project_alpha",
      campaignId: undefined,
      connectorId: undefined,
      accountId: undefined,
      provider: "LINKEDIN_LEAD_GEN",
      externalCampaignId: undefined,
      name: "Broker Event Leads",
      status: undefined,
      utmSource: "linkedin",
      utmMedium: undefined,
      utmCampaign: "broker-event",
      metadata: undefined,
    });
  });

  it("lets a project owner import CSV and quick offline leads", async () => {
    getPortalSession.mockResolvedValue({
      session: {
        id: "session_owner",
        expiresAt: new Date("2026-04-25T00:00:00.000Z"),
      },
      portalUser: {
        id: "user_owner",
        email: "owner@example.com",
        fullName: "Project Owner",
        role: "CLIENT",
        companyName: "Topaz",
      },
    });
    importProjectLeadsCsv.mockResolvedValue({
      batch: {
        id: "batch_csv",
        importedRows: 1,
        failedRows: 0,
        status: "IMPORTED",
      },
      leads: [
        {
          id: "lead_csv",
          email: "csv@example.com",
        },
      ],
      errors: [],
    });
    createProjectManualLead.mockResolvedValue({
      id: "lead_manual",
      projectId: "project_alpha",
      sourceKind: "EVENT_IMPORT",
      fullName: "Event Lead",
      email: "event@example.com",
    });

    const agent = request(createApp());

    const csvResponse = await agent
      .post("/api/landing/portal/projects/project_alpha/acquisition/imports/csv")
      .set("Cookie", ["ng_portal_session=session_owner"])
      .send({
        csvText: "Name,Email\nCSV Lead,csv@example.com\n",
        fieldMapping: {
          fullName: "Name",
          email: "Email",
        },
        filename: "event-leads.csv",
      });

    expect(csvResponse.status).toBe(201);
    expect(importProjectLeadsCsv).toHaveBeenCalledWith({
      portalUserId: "user_owner",
      projectId: "project_alpha",
      connectorId: undefined,
      campaignId: undefined,
      csvText: "Name,Email\nCSV Lead,csv@example.com\n",
      fieldMapping: {
        fullName: "Name",
        email: "Email",
      },
      filename: "event-leads.csv",
      label: undefined,
      sourceKind: "CSV_IMPORT",
    });

    const manualResponse = await agent
      .post("/api/landing/portal/projects/project_alpha/acquisition/manual-leads")
      .set("Cookie", ["ng_portal_session=session_owner"])
      .send({
        sourceKind: "EVENT_IMPORT",
        fullName: "Event Lead",
        email: "event@example.com",
        eventName: "Channel Partner Expo",
      });

    expect(manualResponse.status).toBe(201);
    expect(createProjectManualLead).toHaveBeenCalledWith({
      portalUserId: "user_owner",
      projectId: "project_alpha",
      sourceKind: "EVENT_IMPORT",
      connectorId: undefined,
      campaignId: undefined,
      externalLeadId: undefined,
      capturedAt: undefined,
      eventName: "Channel Partner Expo",
      lead: {
        fullName: "Event Lead",
        email: "event@example.com",
        phone: undefined,
        companyName: undefined,
        message: undefined,
        consent: true,
        sourcePage: undefined,
        sourceCta: undefined,
        utmSource: undefined,
        utmMedium: undefined,
        utmCampaign: undefined,
      },
    });
  });

  it("lets owners test acquisition connector setup state", async () => {
    getPortalSession.mockResolvedValue({
      session: {
        id: "session_owner",
        expiresAt: new Date("2026-04-25T00:00:00.000Z"),
      },
      portalUser: {
        id: "user_owner",
        email: "owner@example.com",
        fullName: "Project Owner",
        role: "CLIENT",
        companyName: "Topaz",
      },
    });
    testProjectAcquisitionConnector.mockResolvedValue({
      ok: false,
      status: "NEEDS_AUTH",
      message: "Meta app credentials are not configured yet.",
    });

    const response = await request(createApp())
      .post("/api/landing/portal/projects/project_alpha/acquisition/connectors/connector_meta/test")
      .set("Cookie", ["ng_portal_session=session_owner"]);

    expect(response.status).toBe(200);
    expect(response.body.result.status).toBe("NEEDS_AUTH");
    expect(testProjectAcquisitionConnector).toHaveBeenCalledWith({
      portalUserId: "user_owner",
      projectId: "project_alpha",
      connectorId: "connector_meta",
    });
  });

  it("blocks operator control-plane endpoints for non-operator users", async () => {
    getPortalSession.mockResolvedValue({
      session: {
        id: "session_1",
        expiresAt: new Date("2026-04-25T00:00:00.000Z"),
      },
      portalUser: {
        id: "user_client",
        email: "client@example.com",
        fullName: "Client Owner",
        role: "CLIENT",
        companyName: "Estate Autopilots",
      },
    });

    const response = await request(createApp())
      .get("/api/landing/portal/ops/projects")
      .set("Cookie", ["ng_portal_session=session_1"]);

    expect(response.status).toBe(403);
    expect(response.body).toEqual({ error: "Operator access required." });
  });

  it("lets a platform operator create projects, attach domains, verify DNS, and record publish state", async () => {
    getPortalSession.mockResolvedValue({
      session: {
        id: "session_operator",
        expiresAt: new Date("2026-04-25T00:00:00.000Z"),
      },
      portalUser: {
        id: "user_operator",
        email: "ops@shasvata.com",
        fullName: "Ops Lead",
        role: "PLATFORM_OPERATOR",
        companyName: "Shasvata",
      },
    });
    listOperatorProjects.mockResolvedValue([
      {
        id: "project_alpha",
        slug: "estate-autopilots-alpha",
        name: "Estate Autopilots Alpha",
        status: "ACTIVE",
        publicLeadKey: "lead_alpha",
        primaryDomain: "alpha.example.com",
        membershipRole: "OWNER",
      },
    ]);
    createImportedProject.mockResolvedValue({
      project: {
        id: "project_wagholi",
        slug: "wagholi-highstreets",
      },
      site: {
        id: "site_wagholi",
        previewHost: "wagholi-highstreets.preview.shasvata.com",
      },
      domain: {
        id: "domain_wagholi",
        host: "wagholi.example.com",
        status: "PENDING",
      },
    });
    refreshImportedProjectSource.mockResolvedValue({
      id: "site_wagholi",
      deployedCommit: "abc123def456",
    });
    upsertProjectDomain.mockResolvedValue({
      id: "domain_wagholi",
      host: "wagholi.example.com",
      status: "PENDING",
      dnsTarget: "203.0.113.10",
    });
    verifyProjectDomain.mockResolvedValue({
      id: "domain_wagholi",
      status: "ACTIVE",
      verifiedAt: new Date("2026-03-28T09:55:00.000Z"),
    });
    recordProjectSitePublish.mockResolvedValue({
      project: {
        id: "project_wagholi",
        liveUrl: "https://wagholi.example.com",
        goLiveAt: new Date("2026-03-28T09:55:00.000Z"),
      },
      site: {
        id: "site_wagholi",
        publishStatus: "PUBLISHED",
      },
    });

    const agent = request(createApp());

    const listResponse = await agent
      .get("/api/landing/portal/ops/projects")
      .set("Cookie", ["ng_portal_session=session_operator"]);
    expect(listResponse.status).toBe(200);
    expect(listOperatorProjects).toHaveBeenCalledWith("user_operator");

    const createResponse = await agent
      .post("/api/landing/portal/ops/projects")
      .set("Cookie", ["ng_portal_session=session_operator"])
      .send({
        projectSlug: "wagholi-highstreets",
        projectName: "Wagholi Highstreets",
        repoUrl: "https://github.com/naya/wagholi-highstreets",
        desiredLiveDomain: "wagholi.example.com",
      });
    expect(createResponse.status).toBe(201);
    expect(createImportedProject).toHaveBeenCalledWith(
      expect.objectContaining({
        portalUserId: "user_operator",
        projectSlug: "wagholi-highstreets",
      }),
    );

    const refreshResponse = await agent
      .post("/api/landing/portal/ops/projects/project_wagholi/repo-sync")
      .set("Cookie", ["ng_portal_session=session_operator"])
      .send({
        siteId: "site_wagholi",
        deployedCommit: "abc123def456",
      });
    expect(refreshResponse.status).toBe(200);

    const domainResponse = await agent
      .post("/api/landing/portal/ops/projects/project_wagholi/domains")
      .set("Cookie", ["ng_portal_session=session_operator"])
      .send({
        siteId: "site_wagholi",
        host: "wagholi.example.com",
        isPrimary: true,
      });
    expect(domainResponse.status).toBe(201);

    const verifyResponse = await agent
      .post("/api/landing/portal/ops/projects/project_wagholi/domains/domain_wagholi/verify")
      .set("Cookie", ["ng_portal_session=session_operator"]);
    expect(verifyResponse.status).toBe(200);

    const publishResponse = await agent
      .post("/api/landing/portal/ops/projects/project_wagholi/sites/site_wagholi/publish")
      .set("Cookie", ["ng_portal_session=session_operator"])
      .send({
        publishStatus: "PUBLISHED",
        runtimeProfile: "STATIC_ARTIFACT",
        deployedCommit: "abc123def456",
        previewHost: "wagholi-highstreets.preview.shasvata.com",
      });
    expect(publishResponse.status).toBe(200);
    expect(recordProjectSitePublish).toHaveBeenCalledWith(
      expect.objectContaining({
        portalUserId: "user_operator",
        projectId: "project_wagholi",
        siteId: "site_wagholi",
      }),
    );
  });
});
