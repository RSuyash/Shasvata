import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  createProjectBillingSnapshot,
  getPortalSession,
  getProjectBillingConfig,
  previewProjectBillingOffer,
  supersedeProjectBillingSnapshot,
  updateProjectBillingConfig,
  updateProjectBillingSnapshotLinkage,
} = vi.hoisted(() => ({
  getPortalSession: vi.fn(),
  getProjectBillingConfig: vi.fn(),
  updateProjectBillingConfig: vi.fn(),
  previewProjectBillingOffer: vi.fn(),
  createProjectBillingSnapshot: vi.fn(),
  supersedeProjectBillingSnapshot: vi.fn(),
  updateProjectBillingSnapshotLinkage: vi.fn(),
}));

vi.mock("../services/project-billing-runtime.js", () => ({
  createProjectBillingSnapshot,
  getProjectBillingConfig,
  previewProjectBillingOffer,
  supersedeProjectBillingSnapshot,
  updateProjectBillingConfig,
  updateProjectBillingSnapshotLinkage,
}));

vi.mock("../services/landing-platform-runtime.js", () => ({
  getPortalSession,
}));

import { operatorRouter } from "./operator.js";

function createApp() {
  const app = express();
  app.use(express.json());
  app.use("/api/operator", operatorRouter);
  return app;
}

describe("operatorRouter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requires a portal session cookie", async () => {
    const response = await request(createApp()).get(
      "/api/operator/projects/project_alpha/billing-config",
    );

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: "Portal session required." });
  });

  it("rejects non-operator users", async () => {
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
      .get("/api/operator/projects/project_alpha/billing-config")
      .set("Cookie", ["ng_portal_session=session_1"]);

    expect(response.status).toBe(403);
    expect(response.body).toEqual({ error: "Operator access required." });
  });

  it("lets an operator manage project billing config and snapshots", async () => {
    getPortalSession.mockResolvedValue({
      session: {
        id: "session_1",
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
    getProjectBillingConfig.mockResolvedValue({
      projectId: "project_alpha",
      billingMode: "HYBRID",
      currency: "INR",
      allowCoupons: true,
      allowReferral: true,
      allowOperatorOverride: true,
      defaultDepositPercent: 50,
      defaultPaymentMode: "DEPOSIT",
      erpCustomerId: "ERP-CUST-ALPHA",
      commercialOwnerUserId: "user_operator",
      notes: "Pilot workspace",
      contacts: [{ email: "billing@example.com", label: "Billing owner", status: "ACTIVE" }],
      activeSnapshotId: null,
    });
    updateProjectBillingConfig.mockResolvedValue({
      projectId: "project_alpha",
      billingMode: "HYBRID",
      currency: "INR",
      allowCoupons: true,
      allowReferral: true,
      allowOperatorOverride: true,
      defaultDepositPercent: 40,
      defaultPaymentMode: "DEPOSIT",
      erpCustomerId: "ERP-CUST-ALPHA",
      commercialOwnerUserId: "user_operator",
      notes: "Pilot workspace",
      contacts: [{ email: "billing@example.com", label: "Billing owner", status: "ACTIVE" }],
      activeSnapshotId: null,
    });
    previewProjectBillingOffer.mockResolvedValue({
      currency: "INR",
      subtotalMinor: 8_500_000,
      discountMinor: 1_350_000,
      totalMinor: 7_150_000,
      payableTodayMinor: 3_575_000,
      remainingAfterTodayMinor: 3_575_000,
      paymentMode: "DEPOSIT",
      lines: [],
      appliedOfferCodes: ["NAYA10"],
      issues: [],
    });
    createProjectBillingSnapshot.mockResolvedValue({
      id: "snapshot_alpha",
      projectId: "project_alpha",
      status: "ACTIVE",
      totalMinor: 7_150_000,
    });
    supersedeProjectBillingSnapshot.mockResolvedValue({
      id: "snapshot_beta",
      projectId: "project_alpha",
      status: "SUPERSEDED",
    });
    updateProjectBillingSnapshotLinkage.mockResolvedValue({
      billingSnapshotId: "snapshot_alpha",
      erpQuotationId: "ERP-QUO-ALPHA",
      erpSalesOrderId: "ERP-SO-ALPHA",
      erpInvoiceId: "ERP-INV-ALPHA",
    });

    const agent = request(createApp());

    const configResponse = await agent
      .get("/api/operator/projects/project_alpha/billing-config")
      .set("Cookie", ["ng_portal_session=session_1"]);
    expect(configResponse.status).toBe(200);

    const updateResponse = await agent
      .patch("/api/operator/projects/project_alpha/billing-config")
      .set("Cookie", ["ng_portal_session=session_1"])
      .send({
        defaultDepositPercent: 40,
        contacts: [{ email: "billing@example.com", label: "Billing owner" }],
      });
    expect(updateResponse.status).toBe(200);

    const previewResponse = await agent
      .post("/api/operator/projects/project_alpha/offers/preview")
      .set("Cookie", ["ng_portal_session=session_1"])
      .send({
        customLines: [
          {
            itemCode: "NG-TECH-LAUNCHPAD",
            label: "Launchpad Website",
            quantity: 1,
            unitPriceMinor: 8_500_000,
          },
        ],
        couponCode: "NAYA10",
        operatorAdjustmentMinor: 500_000,
      });
    expect(previewResponse.status).toBe(200);

    const snapshotResponse = await agent
      .post("/api/operator/projects/project_alpha/billing-snapshots")
      .set("Cookie", ["ng_portal_session=session_1"])
      .send({
        sourceType: "PROJECT_PLAN",
        customLines: [
          {
            itemCode: "NG-TECH-LAUNCHPAD",
            label: "Launchpad Website",
            quantity: 1,
            unitPriceMinor: 8_500_000,
          },
        ],
        couponCode: "NAYA10",
      });
    expect(snapshotResponse.status).toBe(201);

    const supersedeResponse = await agent
      .post("/api/operator/projects/project_alpha/billing-snapshots/snapshot_alpha/supersede")
      .set("Cookie", ["ng_portal_session=session_1"])
      .send({ reason: "Negotiated v2" });
    expect(supersedeResponse.status).toBe(200);

    const linkageResponse = await agent
      .patch("/api/operator/projects/project_alpha/billing-snapshots/snapshot_alpha/linkage")
      .set("Cookie", ["ng_portal_session=session_1"])
      .send({
        erpQuotationId: "ERP-QUO-ALPHA",
        erpSalesOrderId: "ERP-SO-ALPHA",
        erpInvoiceId: "ERP-INV-ALPHA",
      });
    expect(linkageResponse.status).toBe(200);

    expect(getProjectBillingConfig).toHaveBeenCalledWith({
      portalUserId: "user_operator",
      projectId: "project_alpha",
    });
    expect(updateProjectBillingConfig).toHaveBeenCalledWith(
      expect.objectContaining({
        portalUserId: "user_operator",
        projectId: "project_alpha",
      }),
    );
    expect(previewProjectBillingOffer).toHaveBeenCalledWith(
      expect.objectContaining({
        portalUserId: "user_operator",
        projectId: "project_alpha",
      }),
    );
    expect(createProjectBillingSnapshot).toHaveBeenCalledWith(
      expect.objectContaining({
        portalUserId: "user_operator",
        projectId: "project_alpha",
      }),
    );
    expect(supersedeProjectBillingSnapshot).toHaveBeenCalledWith({
      portalUserId: "user_operator",
      projectId: "project_alpha",
      snapshotId: "snapshot_alpha",
      reason: "Negotiated v2",
    });
    expect(updateProjectBillingSnapshotLinkage).toHaveBeenCalledWith({
      portalUserId: "user_operator",
      projectId: "project_alpha",
      snapshotId: "snapshot_alpha",
      erpQuotationId: "ERP-QUO-ALPHA",
      erpSalesOrderId: "ERP-SO-ALPHA",
      erpInvoiceId: "ERP-INV-ALPHA",
      erpPaymentEntryIds: undefined,
      providerOrderId: undefined,
      paymentSessionId: undefined,
      checkoutSessionId: undefined,
      quoteRequestId: undefined,
    });
  });
});
