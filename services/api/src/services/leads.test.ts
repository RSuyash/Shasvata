import { beforeEach, describe, expect, it, vi } from "vitest";

const { prisma } = vi.hoisted(() => ({
  prisma: {
    leadSubmission: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
    projectDomain: {
      findMany: vi.fn(),
    },
    projectSite: {
      findMany: vi.fn(),
    },
    project: {
      findUnique: vi.fn(),
    },
    projectLead: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      findFirst: vi.fn(),
    },
    leadSyncTarget: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
    leadSyncDeliveryAttempt: {
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

const { appendLeadToGoogleSheet, pushLeadToMdoc } = vi.hoisted(() => ({
  appendLeadToGoogleSheet: vi.fn(),
  pushLeadToMdoc: vi.fn(),
}));

vi.mock("../lib/prisma.js", () => ({
  prisma,
}));

vi.mock("./google-sheets.js", () => ({
  appendLeadToGoogleSheet,
}));

vi.mock("./mdoc-push.js", () => ({
  pushLeadToMdoc,
}));

import {
  backfillProjectedLeadsForProject,
  getProjectLeadNotificationDelivery,
  projectLeadSubmissionForPortal,
  saveLeadSubmission,
} from "./leads.js";

function createStoredLead(overrides: Partial<Awaited<ReturnType<typeof saveLeadSubmission>>> = {}) {
  return {
    id: "submission_1",
    leadId: "lead_123",
    fullName: "Riya Patel",
    email: "riya@example.com",
    phone: "+91 99999 11111",
    companyName: "Estate Autopilots",
    problemSummary: "Need higher-intent buyer leads.",
    consent: true,
    sourcePage: "https://wagholihighstreet.in/?utm_source=google",
    sourceCta: "hero-form",
    utmSource: "google",
    utmMedium: "cpc",
    utmCampaign: "wagholi-launch",
    utmContent: null,
    utmTerm: null,
    gclid: null,
    gbraid: null,
    wbraid: null,
    payload: {
      fullName: "Riya Patel",
      email: "riya@example.com",
    },
    notificationStatus: "RECEIVED" as const,
    notificationError: null,
    createdAt: new Date("2026-03-29T01:00:00.000Z"),
    ...overrides,
  };
}

describe("lead persistence and dashboard projection", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns the stored lead submission record after persistence", async () => {
    prisma.leadSubmission.create.mockResolvedValue(createStoredLead());

    const saved = await saveLeadSubmission({
      leadId: "lead_123",
      fullName: "Riya Patel",
      email: "riya@example.com",
      phone: "+91 99999 11111",
      companyName: "Estate Autopilots",
      companyType: "startup",
      websiteUrl: "",
      serviceInterest: ["lead-gen"],
      budgetRange: "50k-150k",
      timeline: "1-month",
      problemSummary: "Need higher-intent buyer leads.",
      consent: true,
      sourcePage: "https://wagholihighstreet.in/?utm_source=google",
      sourceCta: "hero-form",
      utmSource: "google",
      utmMedium: "cpc",
      utmCampaign: "wagholi-launch",
    });

    expect(saved.id).toBe("submission_1");
    expect(saved.sourcePage).toContain("wagholihighstreet.in");
  });

  it("projects a stored lead into the matching portal project once", async () => {
    prisma.projectLead.findUnique.mockResolvedValue(null);
    prisma.projectDomain.findMany.mockResolvedValue([
      {
        host: "wagholihighstreet.in",
        projectId: "project_wagholi",
      },
    ]);
    prisma.projectSite.findMany.mockResolvedValue([]);
    prisma.leadSyncTarget.count.mockResolvedValue(0);
    prisma.projectLead.create.mockResolvedValue({
      id: "project_lead_1",
      projectId: "project_wagholi",
    });

    const projected = await projectLeadSubmissionForPortal(createStoredLead());

    expect(projected).toEqual({
      id: "project_lead_1",
      projectId: "project_wagholi",
    });
    expect(prisma.projectLead.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          projectId: "project_wagholi",
          sourceSubmissionId: "submission_1",
          originHost: "wagholihighstreet.in",
          syncStatus: "SYNCED",
        }),
      }),
    );
  });

  it("syncs projected leads to multiple active destinations and records a partial result", async () => {
    prisma.projectLead.findUnique.mockResolvedValue(null);
    prisma.projectDomain.findMany.mockResolvedValue([
      {
        host: "topaz-towers.in",
        projectId: "project_topaz",
      },
    ]);
    prisma.projectSite.findMany.mockResolvedValue([]);
    prisma.leadSyncTarget.count.mockResolvedValue(2);
    prisma.projectLead.create.mockResolvedValue({
      id: "project_lead_topaz",
      projectId: "project_topaz",
    });
    prisma.projectLead.findFirst.mockResolvedValue({
      id: "project_lead_topaz",
      projectId: "project_topaz",
      fullName: "Riya Patel",
      email: "riya@example.com",
      phone: "+91 99999 11111",
      companyName: "Estate Autopilots",
      message: "Need higher-intent buyer leads.",
      consent: true,
      createdAt: new Date("2026-03-29T01:00:00.000Z"),
      sourceSubmission: {
        leadId: "lead_123",
        sourcePage: "https://topaz-towers.in/?utm_source=google",
        sourceCta: "hero-form",
        utmSource: "google",
        utmMedium: "cpc",
        utmCampaign: "topaz-launch",
        serviceInterest: ["topaz-2-bhk"],
        budgetRange: "₹60–70 Lakhs",
        timeline: "Immediate",
        problemSummary: "Need higher-intent buyer leads.",
        notificationStatus: "RECEIVED",
        notificationError: null,
        payload: {
          utmContent: "hero-copy-a",
          utmTerm: "topaz towers",
          gclid: "gclid-123",
        },
      },
    });
    prisma.project.findUnique.mockResolvedValue({
      id: "project_topaz",
      name: "Topaz Towers",
      primaryDomain: "topaz-towers.in",
      notificationRecipients: [],
    });
    prisma.leadSyncTarget.findMany.mockResolvedValue([
      {
        id: "sync_sheet",
        projectId: "project_topaz",
        kind: "GOOGLE_SHEETS",
        status: "ACTIVE",
        label: "Lead sheet",
        config: {
          spreadsheetId: "sheet_123",
          sheetName: "Leads",
        },
      },
      {
        id: "sync_mdoc",
        projectId: "project_topaz",
        kind: "MDOC_PUSH",
        status: "ACTIVE",
        label: "MDOC",
        config: {
          endpoint: "https://aakar.maksoftbox.com//MDocBoxAPI/MdocAddEnquiryORTeleCalling/",
          apiKey: "secret",
          dataFrom: "E",
          source: "Digitals",
          fallbackSourceDetail: "Website",
        },
      },
    ]);
    prisma.leadSyncDeliveryAttempt.create
      .mockResolvedValueOnce({
        id: "attempt_sheet",
        projectLeadId: "project_lead_topaz",
        projectId: "project_topaz",
        targetId: "sync_sheet",
        kind: "GOOGLE_SHEETS",
        status: "PENDING",
        responseCode: null,
        responseBody: null,
        errorMessage: null,
        metadata: null,
        attemptedAt: new Date("2026-03-29T01:00:00.000Z"),
        deliveredAt: null,
        createdAt: new Date("2026-03-29T01:00:00.000Z"),
        updatedAt: new Date("2026-03-29T01:00:00.000Z"),
      })
      .mockResolvedValueOnce({
        id: "attempt_mdoc",
        projectLeadId: "project_lead_topaz",
        projectId: "project_topaz",
        targetId: "sync_mdoc",
        kind: "MDOC_PUSH",
        status: "PENDING",
        responseCode: null,
        responseBody: null,
        errorMessage: null,
        metadata: null,
        attemptedAt: new Date("2026-03-29T01:00:00.000Z"),
        deliveredAt: null,
        createdAt: new Date("2026-03-29T01:00:00.000Z"),
        updatedAt: new Date("2026-03-29T01:00:00.000Z"),
      });
    prisma.leadSyncDeliveryAttempt.update.mockImplementation(async (input) => ({
      id: input.where.id,
      projectLeadId: "project_lead_topaz",
      projectId: "project_topaz",
      targetId: input.where.id === "attempt_sheet" ? "sync_sheet" : "sync_mdoc",
      kind: input.where.id === "attempt_sheet" ? "GOOGLE_SHEETS" : "MDOC_PUSH",
      status: input.data.status,
      responseCode: input.data.responseCode ?? null,
      responseBody: input.data.responseBody ?? null,
      errorMessage: input.data.errorMessage ?? null,
      metadata: input.data.metadata ?? null,
      attemptedAt: new Date("2026-03-29T01:00:00.000Z"),
      deliveredAt: input.data.deliveredAt ?? null,
      createdAt: new Date("2026-03-29T01:00:00.000Z"),
      updatedAt: new Date("2026-03-29T01:00:00.000Z"),
    }));
    prisma.projectLead.update.mockResolvedValue({
      id: "project_lead_topaz",
      projectId: "project_topaz",
    });
    appendLeadToGoogleSheet.mockResolvedValue(undefined);
    pushLeadToMdoc.mockRejectedValue(new Error("MDOC unavailable"));

    const projected = await projectLeadSubmissionForPortal(
      createStoredLead({
        sourcePage: "https://topaz-towers.in/?utm_source=google",
      }),
    );

    expect(projected).toEqual({
      id: "project_lead_topaz",
      projectId: "project_topaz",
    });
    expect(appendLeadToGoogleSheet).toHaveBeenCalledOnce();
    expect(pushLeadToMdoc).toHaveBeenCalledOnce();
    expect(prisma.projectLead.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "project_lead_topaz" },
        data: expect.objectContaining({
          syncStatus: "PARTIAL",
        }),
      }),
    );
    expect(prisma.leadSyncDeliveryAttempt.create).toHaveBeenCalledTimes(2);
    expect(prisma.leadSyncDeliveryAttempt.update).toHaveBeenCalledTimes(2);
  });

  it("projects a preview-host lead when the project has no custom domain yet", async () => {
    prisma.projectLead.findUnique.mockResolvedValue(null);
    prisma.projectDomain.findMany.mockResolvedValue([]);
    prisma.projectSite.findMany.mockResolvedValue([
      {
        previewHost: "aakar-realities.preview.shasvata.com",
        projectId: "project_aakar",
      },
    ]);
    prisma.leadSyncTarget.count.mockResolvedValue(0);
    prisma.projectLead.create.mockResolvedValue({
      id: "project_lead_preview",
      projectId: "project_aakar",
    });

    const projected = await projectLeadSubmissionForPortal(
      createStoredLead({
        sourcePage: "https://aakar-realities.preview.shasvata.com/?utm_source=meta",
      }),
    );

    expect(projected).toEqual({
      id: "project_lead_preview",
      projectId: "project_aakar",
    });
    expect(prisma.projectLead.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          projectId: "project_aakar",
          originHost: "aakar-realities.preview.shasvata.com",
        }),
      }),
    );
  });

  it("backfills only missing projected leads for a project", async () => {
    prisma.projectDomain.findMany
      .mockResolvedValueOnce([
        {
          host: "wagholihighstreet.in",
          projectId: "project_wagholi",
        },
      ])
      .mockResolvedValueOnce([
        {
          host: "wagholihighstreet.in",
          projectId: "project_wagholi",
        },
      ])
      .mockResolvedValueOnce([]);
    prisma.projectSite.findMany
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);
    prisma.leadSubmission.findMany.mockResolvedValue([
      createStoredLead(),
      createStoredLead({
        id: "submission_2",
        leadId: "lead_456",
        email: "second@example.com",
        sourcePage: "https://wagholihighstreet.in/?utm_source=meta",
      }),
    ]);
    prisma.projectLead.findUnique
      .mockResolvedValueOnce({
        id: "existing_projection",
        projectId: "project_wagholi",
      })
      .mockResolvedValueOnce(null);
    prisma.leadSyncTarget.count.mockResolvedValue(0);
    prisma.projectLead.create.mockResolvedValue({
      id: "project_lead_2",
      projectId: "project_wagholi",
    });

    const result = await backfillProjectedLeadsForProject("project_wagholi");

    expect(result).toEqual({
      projectId: "project_wagholi",
      created: 1,
      skipped: 1,
    });
    expect(prisma.projectLead.create).toHaveBeenCalledTimes(1);
  });

  it("backfills preview-host leads for a project without a custom domain", async () => {
    prisma.projectDomain.findMany.mockResolvedValue([]);
    prisma.projectSite.findMany.mockResolvedValue([
      {
        previewHost: "aakar-realities.preview.shasvata.com",
        projectId: "project_aakar",
      },
    ]);
    prisma.leadSubmission.findMany.mockResolvedValue([
      createStoredLead({
        id: "submission_preview",
        leadId: "lead_preview",
        email: "preview@example.com",
        sourcePage: "https://aakar-realities.preview.shasvata.com/?utm_source=meta",
      }),
    ]);
    prisma.projectLead.findUnique.mockResolvedValue(null);
    prisma.leadSyncTarget.count.mockResolvedValue(0);
    prisma.projectLead.create.mockResolvedValue({
      id: "project_lead_preview_2",
      projectId: "project_aakar",
    });

    const result = await backfillProjectedLeadsForProject("project_aakar");

    expect(result).toEqual({
      projectId: "project_aakar",
      created: 1,
      skipped: 0,
    });
    expect(prisma.projectLead.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          projectId: "project_aakar",
          originHost: "aakar-realities.preview.shasvata.com",
        }),
      }),
    );
  });

  it("builds a project-specific inbox link and recipient list for live lead alerts", async () => {
    prisma.project.findUnique.mockResolvedValue({
      id: "project_wagholi",
      notificationRecipients: [
        { email: "builder@example.com" },
        { email: "sales@example.com" },
      ],
    });

    const delivery = await getProjectLeadNotificationDelivery("project_wagholi");

    expect(delivery).toEqual({
      recipients: ["builder@example.com", "sales@example.com"],
      dashboardUrl: "https://shasvata.com/app/projects/project_wagholi",
    });
  });
});
