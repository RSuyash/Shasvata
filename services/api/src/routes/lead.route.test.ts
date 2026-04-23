import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  saveLeadSubmission,
  projectLeadSubmissionForPortal,
  getProjectLeadNotificationDelivery,
  updateLeadNotificationStatus,
  notifyLeadSystem,
} = vi.hoisted(() => ({
  saveLeadSubmission: vi.fn(),
  projectLeadSubmissionForPortal: vi.fn(),
  getProjectLeadNotificationDelivery: vi.fn(),
  updateLeadNotificationStatus: vi.fn(),
  notifyLeadSystem: vi.fn(),
}));

vi.mock("../services/leads.js", () => ({
  saveLeadSubmission,
  projectLeadSubmissionForPortal,
  getProjectLeadNotificationDelivery,
  updateLeadNotificationStatus,
}));

vi.mock("../services/email.js", () => ({
  notifyLeadSystem,
}));

import { leadRouter } from "./lead.js";

const validPayload = {
  fullName: "Riya Patel",
  email: "riya@acme.co",
  companyName: "Acme Corp",
  companyType: "startup" as const,
  serviceInterest: ["growth"],
  budgetRange: "50k-150k",
  timeline: "1-month",
  problemSummary: "Our marketing has no visibility into what is working.",
  consent: true as const,
};

function createStoredLeadRecord() {
  return {
    id: "submission_1",
    leadId: "lead_123",
    fullName: validPayload.fullName,
    email: validPayload.email,
    phone: null,
    companyName: validPayload.companyName,
    problemSummary: validPayload.problemSummary,
    consent: validPayload.consent,
    sourcePage: "https://wagholihighstreet.in/?utm_source=google",
    sourceCta: "hero-form",
    utmSource: "google",
    utmMedium: "cpc",
    utmCampaign: "wagholi-launch",
    payload: validPayload,
    notificationStatus: "RECEIVED" as const,
    notificationError: null,
    createdAt: new Date("2026-03-29T01:00:00.000Z"),
  };
}

function createApp() {
  const app = express();
  app.use(express.json());
  app.use("/api", leadRouter);
  return app;
}

describe("POST /api/lead", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("saves the lead and routes notifications through the system mailbox flow", async () => {
    saveLeadSubmission.mockResolvedValue(createStoredLeadRecord());
    projectLeadSubmissionForPortal.mockResolvedValue(null);
    getProjectLeadNotificationDelivery.mockResolvedValue(null);
    notifyLeadSystem.mockResolvedValue(undefined);
    updateLeadNotificationStatus.mockResolvedValue(undefined);

    const response = await request(createApp())
      .post("/api/lead")
      .send(validPayload);

    expect(response.status).toBe(200);
    expect(saveLeadSubmission).toHaveBeenCalledTimes(1);
    expect(projectLeadSubmissionForPortal).toHaveBeenCalledTimes(1);
    expect(notifyLeadSystem).toHaveBeenCalledTimes(1);
    expect(updateLeadNotificationStatus).toHaveBeenCalledWith(
      expect.stringMatching(/^lead_/),
      "NOTIFIED",
    );
  });

  it("routes project-matched leads to project-specific recipients with a project inbox link", async () => {
    saveLeadSubmission.mockResolvedValue(createStoredLeadRecord());
    projectLeadSubmissionForPortal.mockResolvedValue({
      id: "project_lead_1",
      projectId: "project_wagholi",
    });
    getProjectLeadNotificationDelivery.mockResolvedValue({
      recipients: ["builder@example.com", "sales@example.com"],
      dashboardUrl: "https://shasvata.com/app/projects/project_wagholi",
    });
    notifyLeadSystem.mockResolvedValue(undefined);
    updateLeadNotificationStatus.mockResolvedValue(undefined);

    const response = await request(createApp())
      .post("/api/lead")
      .send(validPayload);

    expect(response.status).toBe(200);
    expect(getProjectLeadNotificationDelivery).toHaveBeenCalledWith("project_wagholi");
    expect(notifyLeadSystem).toHaveBeenCalledWith(
      expect.objectContaining({
        leadId: expect.stringMatching(/^lead_/),
      }),
      {
        recipients: ["builder@example.com", "sales@example.com"],
        dashboardUrl: "https://shasvata.com/app/projects/project_wagholi",
      },
    );
  });

  it("marks notification failures without failing the lead submission", async () => {
    saveLeadSubmission.mockResolvedValue(createStoredLeadRecord());
    projectLeadSubmissionForPortal.mockResolvedValue(null);
    getProjectLeadNotificationDelivery.mockResolvedValue(null);
    notifyLeadSystem.mockRejectedValue(new Error("SMTP unavailable"));
    updateLeadNotificationStatus.mockResolvedValue(undefined);

    const response = await request(createApp())
      .post("/api/lead")
      .send(validPayload);

    expect(response.status).toBe(200);
    expect(notifyLeadSystem).toHaveBeenCalledTimes(1);
    expect(updateLeadNotificationStatus).toHaveBeenCalledWith(
      expect.stringMatching(/^lead_/),
      "NOTIFICATION_FAILED",
      "SMTP unavailable",
    );
  });

  it("keeps the lead successful even when portal projection fails", async () => {
    saveLeadSubmission.mockResolvedValue(createStoredLeadRecord());
    projectLeadSubmissionForPortal.mockRejectedValue(new Error("Projection unavailable"));
    getProjectLeadNotificationDelivery.mockResolvedValue(null);
    notifyLeadSystem.mockResolvedValue(undefined);
    updateLeadNotificationStatus.mockResolvedValue(undefined);

    const response = await request(createApp())
      .post("/api/lead")
      .send(validPayload);

    expect(response.status).toBe(200);
    expect(saveLeadSubmission).toHaveBeenCalledTimes(1);
    expect(projectLeadSubmissionForPortal).toHaveBeenCalledTimes(1);
    expect(notifyLeadSystem).toHaveBeenCalledTimes(1);
  });

  it("returns 503 and skips notifications when persistence fails", async () => {
    saveLeadSubmission.mockRejectedValue(new Error("DB unavailable"));

    const response = await request(createApp())
      .post("/api/lead")
      .send(validPayload);

    expect(response.status).toBe(503);
    expect(projectLeadSubmissionForPortal).not.toHaveBeenCalled();
    expect(notifyLeadSystem).not.toHaveBeenCalled();
    expect(updateLeadNotificationStatus).not.toHaveBeenCalled();
  });
});
