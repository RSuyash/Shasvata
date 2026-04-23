import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  createPortalMagicLink,
  createPortalSession,
  createProjectLead,
  createLeadSyncDeliveryAttempt,
  findLeadSyncTargets,
  findPortalUserByEmail,
  findProjectByPublicLeadKey,
  updateLeadSyncDeliveryAttempt,
  updateProjectLeadSyncState,
} = vi.hoisted(() => ({
  findPortalUserByEmail: vi.fn(),
  createPortalMagicLink: vi.fn(),
  createPortalSession: vi.fn(),
  findProjectByPublicLeadKey: vi.fn(),
  findLeadSyncTargets: vi.fn(),
  createProjectLead: vi.fn(),
  createLeadSyncDeliveryAttempt: vi.fn(),
  updateLeadSyncDeliveryAttempt: vi.fn(),
  updateProjectLeadSyncState: vi.fn(),
}));

const {
  appendLeadToGoogleSheet,
  pushLeadToMdoc,
  sendProjectGoLiveEmail,
  sendPortalMagicLinkEmail,
  sendPortalPasswordResetEmail,
  sendPortalVerificationEmail,
  verifyGoogleIdToken,
} = vi.hoisted(() => ({
  appendLeadToGoogleSheet: vi.fn(),
  pushLeadToMdoc: vi.fn(),
  sendProjectGoLiveEmail: vi.fn(),
  sendPortalMagicLinkEmail: vi.fn(),
  sendPortalPasswordResetEmail: vi.fn(),
  sendPortalVerificationEmail: vi.fn(),
  verifyGoogleIdToken: vi.fn(),
}));

vi.mock("../repositories/landing-platform.js", () => ({
  createLandingPlatformRepository: () => ({
    findPortalUserByEmail,
    findPortalUserById: vi.fn(),
    createMagicLink: createPortalMagicLink,
    consumeMagicLink: vi.fn(),
    createPortalSession,
    listProjectsForPortalUser: vi.fn(),
    findProjectByPublicLeadKey,
    listLeadSyncTargets: findLeadSyncTargets,
    createProjectLead,
    createLeadSyncDeliveryAttempt,
    updateLeadSyncDeliveryAttempt,
    updateProjectLeadSyncState,
    listProjectLeads: vi.fn(),
    assertProjectAccess: vi.fn(),
  }),
}));

vi.mock("./landing-platform-email.js", () => ({
  sendProjectGoLiveEmail,
  sendPortalMagicLinkEmail,
  sendPortalPasswordResetEmail,
  sendPortalVerificationEmail,
}));

vi.mock("./google-sheets.js", () => ({
  appendLeadToGoogleSheet,
}));

vi.mock("./mdoc-push.js", () => ({
  pushLeadToMdoc,
}));

vi.mock("./google-identity.js", () => ({
  verifyGoogleIdToken,
}));

import {
  requestPortalMagicLink,
  submitProjectLead,
} from "./landing-platform-runtime.js";

describe("landing platform runtime", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createLeadSyncDeliveryAttempt.mockImplementation(async (input) => ({
      id: "attempt_1",
      projectLeadId: input.projectLeadId,
      projectId: input.projectId,
      targetId: input.targetId,
      kind: input.kind,
      status: input.status,
      responseCode: null,
      responseBody: null,
      errorMessage: null,
      metadata: input.metadata ?? null,
      attemptedAt: input.attemptedAt,
      deliveredAt: null,
    }));
    updateLeadSyncDeliveryAttempt.mockImplementation(async (input) => ({
      id: input.attemptId,
      projectLeadId: "lead_1",
      projectId: "project_alpha",
      targetId: "sync_alpha",
      kind: "GOOGLE_SHEETS",
      status: input.status,
      responseCode: input.responseCode ?? null,
      responseBody: input.responseBody ?? null,
      errorMessage: input.errorMessage ?? null,
      metadata: input.metadata ?? null,
      attemptedAt: new Date("2026-03-26T00:00:00.000Z"),
      deliveredAt: input.deliveredAt ?? null,
    }));
    pushLeadToMdoc.mockResolvedValue({
      responseCode: 200,
      responseBody: "ok",
      metadata: null,
    });
  });

  it("creates a magic-link token and sends the email through the runtime adapters", async () => {
    findPortalUserByEmail.mockResolvedValue({
      id: "user_client",
      email: "client@example.com",
      fullName: "Client Owner",
      role: "CLIENT",
      status: "ACTIVE",
      companyName: "Estate Autopilots",
    });
    createPortalMagicLink.mockImplementation(async (input) => ({
      id: "magic_1",
      portalUserId: input.portalUserId,
      email: input.email,
      selector: input.selector,
      verifierHash: input.verifierHash,
      redirectPath: input.redirectPath,
      expiresAt: input.expiresAt,
      consumedAt: null,
    }));

    const result = await requestPortalMagicLink({
      email: "client@example.com",
      redirectPath: "/projects/project_alpha",
    });

    expect(result).toEqual({ accepted: true });
    expect(createPortalMagicLink).toHaveBeenCalledOnce();
    expect(sendPortalMagicLinkEmail).toHaveBeenCalledOnce();
  });

  it("stores the lead and marks sync as failed when the Google Sheets adapter throws", async () => {
    findProjectByPublicLeadKey.mockResolvedValue({
      id: "project_alpha",
      slug: "estate-autopilots-alpha",
      name: "Estate Autopilots Alpha",
      status: "ACTIVE",
      publicLeadKey: "lead_alpha",
      primaryDomain: "alpha.example.com",
    });
    findLeadSyncTargets.mockResolvedValue([
      {
        id: "sync_alpha",
        projectId: "project_alpha",
        kind: "GOOGLE_SHEETS",
        status: "ACTIVE",
        config: {
          spreadsheetId: "sheet_alpha",
          sheetName: "Leads",
        },
      },
    ]);
    createProjectLead.mockResolvedValue({
      id: "lead_1",
      projectId: "project_alpha",
      fullName: "Ada Lovelace",
      email: "ada@example.com",
      phone: "+91 90000 11111",
      companyName: "Estate Autopilots",
      message: "Need more qualified seller leads.",
      consent: true,
      syncStatus: "PENDING",
      syncError: null,
      createdAt: new Date("2026-03-26T00:00:00.000Z"),
    });
    updateProjectLeadSyncState.mockImplementation(async (input) => ({
      id: "lead_1",
      projectId: "project_alpha",
      fullName: "Ada Lovelace",
      email: "ada@example.com",
      phone: "+91 90000 11111",
      companyName: "Estate Autopilots",
      message: "Need more qualified seller leads.",
      consent: true,
      syncStatus: input.syncStatus,
      syncError: input.syncError ?? null,
      createdAt: new Date("2026-03-26T00:00:00.000Z"),
    }));
    appendLeadToGoogleSheet.mockRejectedValue(new Error("Sheets unavailable"));

    const lead = await submitProjectLead({
      publicLeadKey: "lead_alpha",
      originHost: "alpha.example.com",
      honeypot: "",
      payload: {
        fullName: "Ada Lovelace",
        email: "ada@example.com",
        phone: "+91 90000 11111",
        companyName: "Estate Autopilots",
        message: "Need more qualified seller leads.",
        consent: true,
      },
    });

    expect(lead.syncStatus).toBe("FAILED");
    expect(updateProjectLeadSyncState).toHaveBeenCalledWith(
      expect.objectContaining({
        projectLeadId: "lead_1",
        syncStatus: "FAILED",
      }),
    );
  });
});
