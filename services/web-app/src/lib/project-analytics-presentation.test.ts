import { describe, expect, it } from "vitest";

import {
  buildProjectAnalyticsConversionSurface,
  buildProjectAnalyticsIntegrationSurface,
} from "./project-analytics-presentation";

describe("buildProjectAnalyticsConversionSurface", () => {
  it("prefers the live thank-you route when the site is live", () => {
    const surface = buildProjectAnalyticsConversionSurface({
      liveUrl: "https://wagholihighstreet.in",
      previewUrl: "https://wagholi.preview.shasvata.com",
      sites: [
        {
          id: "site_1",
          projectId: "project_1",
          slug: "wagholi",
          templateKey: "landing",
          themeKey: null,
          sourceProvider: "GIT_REPOSITORY",
          repoUrl: null,
          repoBranch: null,
          repoRef: null,
          deployedCommit: null,
          runtimeProfile: "ISOLATED_APP",
          operatorNotes: null,
          publishStatus: "PUBLISHED",
          lastPublishedAt: null,
          previewHost: "wagholi.preview.shasvata.com",
          latestPreviewPath: "https://wagholi.preview.shasvata.com",
          ga4MeasurementId: null,
          googleAdsTagId: null,
          googleAdsConversionMode: "DIRECT_LABEL",
          googleAdsLeadConversionLabel: null,
          gtmContainerId: null,
          metaPixelId: null,
          trackingNotes: null,
        },
      ],
    });

    expect(surface.liveThankYouUrl).toBe("https://wagholihighstreet.in/thank-you");
    expect(surface.previewThankYouUrl).toBe(
      "https://wagholi.preview.shasvata.com/thank-you",
    );
    expect(surface.recommendedTrackingRoute).toBe(
      "https://wagholihighstreet.in/thank-you",
    );
  });

  it("falls back to the preview thank-you route when live is unavailable", () => {
    const surface = buildProjectAnalyticsConversionSurface({
      liveUrl: null,
      previewUrl: "https://aakar-realities.preview.shasvata.com",
      sites: [],
    });

    expect(surface.previewThankYouUrl).toBe(
      "https://aakar-realities.preview.shasvata.com/thank-you",
    );
    expect(surface.recommendedTrackingRoute).toBe(
      "https://aakar-realities.preview.shasvata.com/thank-you",
    );
    expect(surface.trackingNotes[0]).toMatch(/preview thank-you route/i);
  });

  it("treats GA4-imported Google Ads goals as ready without a direct label", () => {
    const surface = buildProjectAnalyticsIntegrationSurface({
      site: {
        id: "site_1",
        projectId: "project_1",
        slug: "topaz",
        templateKey: "landing",
        themeKey: null,
        sourceProvider: "GIT_REPOSITORY",
        repoUrl: null,
        repoBranch: null,
        repoRef: null,
        deployedCommit: null,
        runtimeProfile: "ISOLATED_APP",
        operatorNotes: null,
        publishStatus: "PUBLISHED",
        lastPublishedAt: null,
        previewHost: "topaz.preview.shasvata.com",
        latestPreviewPath: "https://topaz.preview.shasvata.com",
        ga4MeasurementId: "G-3LNQN1LVJT",
        googleAdsTagId: "AW-18098571219",
        googleAdsConversionMode: "GA4_IMPORTED",
        googleAdsLeadConversionLabel: null,
        gtmContainerId: null,
        metaPixelId: null,
        trackingNotes: null,
      },
      syncTargets: [
        {
          id: "sync_mdoc",
          projectId: "project_1",
          kind: "MDOC_PUSH",
          status: "ACTIVE",
          label: "Topaz MDOC",
          config: {
            endpoint: "https://aakar.maksoftbox.com",
            apiKey: "key",
            dataFrom: "E",
            source: "Digitals",
            fallbackSourceDetail: "Website",
          },
          latestDeliveryAttempt: null,
        },
      ],
    });

    expect(surface.googleAdsGoal.statusLabel).toBe("IMPORTED");
    expect(surface.googleAdsGoal.directSendTo).toBeNull();
    expect(surface.destinations[0]?.statusLabel).toBe("WAITING");
  });
});
