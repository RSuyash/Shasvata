import { beforeEach, describe, expect, it, vi } from "vitest";

const { prisma } = vi.hoisted(() => ({
  prisma: {
    projectDomain: {
      findMany: vi.fn(),
    },
    projectSite: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock("../lib/prisma.js", () => ({
  prisma,
}));

import { readPublicTrackingRuntimeConfig } from "./tracking-runtime.js";

describe("tracking runtime", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns Google Ads fields and warnings for an active primary-domain site", async () => {
    prisma.projectDomain.findMany.mockResolvedValue([
      {
        host: "topaz-towers.in",
        site: {
          id: "site_topaz",
          slug: "topaz-towers",
          previewHost: "aakar-realities.preview.shasvata.com",
          latestPreviewPath: "https://aakar-realities.preview.shasvata.com",
          ga4MeasurementId: "G-3LNQN1LVJT",
          googleAdsTagId: "AW-18098571219",
          googleAdsConversionMode: "DIRECT_LABEL",
          googleAdsLeadConversionLabel: null,
          gtmContainerId: "GTM-TOPAZ01",
          metaPixelId: "123456789012345",
        },
        project: {
          id: "project_topaz",
          name: "Topaz Towers",
          primaryDomain: "topaz-towers.in",
          sites: [],
        },
      },
    ]);
    prisma.projectSite.findMany.mockResolvedValue([]);

    const config = await readPublicTrackingRuntimeConfig({
      host: "topaz-towers.in",
    });

    expect(config).toMatchObject({
      resolvedHost: "topaz-towers.in",
      projectId: "project_topaz",
      siteId: "site_topaz",
      ga4MeasurementId: "G-3LNQN1LVJT",
      googleAdsTagId: "AW-18098571219",
      googleAdsConversionMode: "DIRECT_LABEL",
      googleAdsLeadConversionLabel: null,
      injectGa4: true,
      injectGoogleAds: true,
      injectGtm: true,
      leadEventTargets: {
        ga4: true,
        googleAds: false,
        metaPixel: true,
      },
    });
    expect(config.warnings).toEqual(
      expect.arrayContaining([
        "Google Ads is configured, but the primary lead conversion label is still missing.",
        "GTM and direct Google tags are both configured, so verify duplicate event firing before launch.",
      ]),
    );
  });

  it("treats GA4-imported Google Ads conversions as armed without a direct label", async () => {
    prisma.projectDomain.findMany.mockResolvedValue([
      {
        host: "topaz-towers.in",
        site: {
          id: "site_topaz",
          slug: "topaz-towers",
          previewHost: null,
          latestPreviewPath: null,
          ga4MeasurementId: "G-3LNQN1LVJT",
          googleAdsTagId: "AW-18098571219",
          googleAdsConversionMode: "GA4_IMPORTED",
          googleAdsLeadConversionLabel: null,
          gtmContainerId: null,
          metaPixelId: null,
        },
        project: {
          id: "project_topaz",
          name: "Topaz Towers",
          primaryDomain: "topaz-towers.in",
          sites: [],
        },
      },
    ]);
    prisma.projectSite.findMany.mockResolvedValue([]);

    const config = await readPublicTrackingRuntimeConfig({
      host: "topaz-towers.in",
    });

    expect(config.googleAdsConversionMode).toBe("GA4_IMPORTED");
    expect(config.leadEventTargets.googleAds).toBe(true);
    expect(config.warnings).toEqual([]);
  });

  it("returns a no-match warning when the host does not resolve to an active site", async () => {
    prisma.projectDomain.findMany.mockResolvedValue([]);
    prisma.projectSite.findMany.mockResolvedValue([]);

    const config = await readPublicTrackingRuntimeConfig({
      host: "unknown.example.com",
    });

    expect(config.siteId).toBeNull();
    expect(config.warnings).toEqual(["No active project site matched this host."]);
  });
});
