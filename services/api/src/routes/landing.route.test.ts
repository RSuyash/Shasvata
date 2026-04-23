import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  getPublicTrackingRuntimeConfig,
  recordInboundLeadWebhookEvent,
  submitPublicProjectLead,
} = vi.hoisted(() => ({
  getPublicTrackingRuntimeConfig: vi.fn(),
  recordInboundLeadWebhookEvent: vi.fn(),
  submitPublicProjectLead: vi.fn(),
}));

vi.mock("../services/landing-platform-runtime.js", () => ({
  getPublicTrackingRuntimeConfig,
}));

vi.mock("../services/acquisition-runtime.js", () => ({
  recordInboundLeadWebhookEvent,
  submitPublicProjectLead,
}));

import { landingRouter } from "./landing.js";

function createApp() {
  const app = express();
  app.use(express.json());
  app.use("/api/landing", landingRouter);
  return app;
}

describe("landingRouter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns public tracking runtime config for the resolved host", async () => {
    getPublicTrackingRuntimeConfig.mockResolvedValue({
      resolvedHost: "wagholihighstreet.in",
      projectId: "project_alpha",
      projectName: "Wagholi Highstreet",
      siteId: "site_alpha",
      siteSlug: "wagholi-highstreet",
      hostSource: "PRIMARY_DOMAIN",
      liveUrl: "https://wagholihighstreet.in",
      previewUrl: "https://wagholi-highstreet.preview.shasvata.com",
      ga4MeasurementId: "G-ALPHA123",
      googleAdsTagId: "AW-18098571219",
      googleAdsConversionMode: "DIRECT_LABEL",
      googleAdsLeadConversionLabel: "topazLeadPrimary_01",
      gtmContainerId: "GTM-ALPHA12",
      metaPixelId: "123456789012345",
      injectGtm: true,
      injectGa4: true,
      injectGoogleAds: true,
      injectMetaPixel: true,
      suppressGa4PageView: true,
      leadEventTargets: {
        dataLayer: true,
        ga4: true,
        googleAds: true,
        metaPixel: true,
      },
      warnings: [],
    });

    const response = await request(createApp())
      .get("/api/landing/runtime/tracking-config")
      .query({ host: "wagholihighstreet.in" });

    expect(response.status).toBe(200);
    expect(response.body.projectName).toBe("Wagholi Highstreet");
    expect(getPublicTrackingRuntimeConfig).toHaveBeenCalledWith({
      host: "wagholihighstreet.in",
    });
  });

  it("submits a public project lead through the landing platform service", async () => {
    submitPublicProjectLead.mockResolvedValue({
      id: "lead_1",
      projectId: "project_alpha",
      syncStatus: "SYNCED",
    });

    const response = await request(createApp())
      .post("/api/landing/public/lead_alpha/leads")
      .set("Origin", "https://alpha.example.com")
      .send({
        fullName: "Ada Lovelace",
        email: "ada@example.com",
        phone: "+91 90000 11111",
        companyName: "Estate Autopilots",
        message: "Need more qualified seller leads.",
        consent: true,
        website_url_extra: "",
      });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      success: true,
      leadId: "lead_1",
      syncStatus: "SYNCED",
    });
    expect(submitPublicProjectLead).toHaveBeenCalledWith({
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
  });

  it("returns a silent success for honeypot submissions", async () => {
    const response = await request(createApp())
      .post("/api/landing/public/lead_alpha/leads")
      .set("Origin", "https://alpha.example.com")
      .send({
        fullName: "Spam Bot",
        email: "bot@example.com",
        phone: "",
        companyName: "",
        message: "spam",
        consent: true,
        website_url_extra: "filled",
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ success: true });
    expect(submitPublicProjectLead).not.toHaveBeenCalled();
  });

  it("keeps Meta and LinkedIn webhooks dormant until connectors are active", async () => {
    recordInboundLeadWebhookEvent.mockResolvedValue({
      accepted: false,
      status: "NEEDS_AUTH",
      message: "META LEAD ADS webhook is not enabled for an active connector.",
    });

    const response = await request(createApp())
      .post("/api/landing/webhooks/meta/leadgen")
      .send({
        leadgen_id: "meta_lead_1",
      });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("NEEDS_AUTH");
    expect(recordInboundLeadWebhookEvent).toHaveBeenCalledWith({
      provider: "META_LEAD_ADS",
      eventType: "leadgen",
      externalLeadId: "meta_lead_1",
      payload: {
        leadgen_id: "meta_lead_1",
      },
    });
  });
});
