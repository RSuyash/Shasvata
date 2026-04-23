import { prisma } from "../lib/prisma.js";

export type PublicTrackingRuntimeConfig = {
  resolvedHost: string | null;
  projectId: string | null;
  projectName: string | null;
  siteId: string | null;
  siteSlug: string | null;
  hostSource: "PRIMARY_DOMAIN" | "PREVIEW_HOST" | null;
  liveUrl: string | null;
  previewUrl: string | null;
  ga4MeasurementId: string | null;
  googleAdsTagId: string | null;
  googleAdsConversionMode: "DIRECT_LABEL" | "GA4_IMPORTED";
  googleAdsLeadConversionLabel: string | null;
  gtmContainerId: string | null;
  metaPixelId: string | null;
  injectGtm: boolean;
  injectGa4: boolean;
  injectGoogleAds: boolean;
  injectMetaPixel: boolean;
  suppressGa4PageView: boolean;
  leadEventTargets: {
    dataLayer: boolean;
    ga4: boolean;
    googleAds: boolean;
    metaPixel: boolean;
  };
  warnings: string[];
};

type RuntimeSiteRecord = {
  id: string;
  slug: string;
  previewHost: string | null;
  latestPreviewPath: string | null;
  ga4MeasurementId: string | null;
  googleAdsTagId: string | null;
  googleAdsConversionMode: "DIRECT_LABEL" | "GA4_IMPORTED";
  googleAdsLeadConversionLabel: string | null;
  gtmContainerId: string | null;
  metaPixelId: string | null;
};

function normalizeTrackingHost(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const url = trimmed.includes("://") ? new URL(trimmed) : new URL(`https://${trimmed}`);
    return url.hostname.trim().toLowerCase() || null;
  } catch {
    return trimmed
      .replace(/^https?:\/\//i, "")
      .replace(/\/.*$/, "")
      .replace(/:\d+$/, "")
      .trim()
      .toLowerCase() || null;
  }
}

function buildHostCandidates(host: string): string[] {
  return Array.from(
    new Set([host, host.startsWith("www.") ? host.slice(4) : `www.${host}`]),
  ).filter(Boolean);
}

function buildLiveUrl(host: string | null): string | null {
  return host ? `https://${host}` : null;
}

function buildTrackingWarnings(site: RuntimeSiteRecord | null): string[] {
  if (!site) {
    return ["No active project site matched this host."];
  }

  const warnings: string[] = [];
  if (!site.ga4MeasurementId && !site.googleAdsTagId && !site.gtmContainerId && !site.metaPixelId) {
    warnings.push("No tracking providers are configured for this site yet.");
  }
  if (site.gtmContainerId && !site.ga4MeasurementId) {
    warnings.push("GTM will load, but direct GA4 lead events are not configured.");
  }
  if (site.googleAdsTagId && !site.googleAdsLeadConversionLabel) {
    if (site.googleAdsConversionMode === "DIRECT_LABEL") {
      warnings.push("Google Ads is configured, but the primary lead conversion label is still missing.");
    }
  }
  if (site.googleAdsTagId && site.googleAdsConversionMode === "GA4_IMPORTED" && !site.ga4MeasurementId) {
    warnings.push("Google Ads is configured to import GA4 lead events, but GA4 is not configured yet.");
  }
  if (site.gtmContainerId && (site.ga4MeasurementId || site.googleAdsTagId)) {
    warnings.push("GTM and direct Google tags are both configured, so verify duplicate event firing before launch.");
  }

  return warnings;
}

function buildRuntimeConfig(input: {
  resolvedHost: string | null;
  hostSource: "PRIMARY_DOMAIN" | "PREVIEW_HOST" | null;
  project:
    | {
        id: string;
        name: string;
        primaryDomain: string | null;
      }
    | null;
  site: RuntimeSiteRecord | null;
}): PublicTrackingRuntimeConfig {
  const injectGtm = Boolean(input.site?.gtmContainerId);
  const injectGa4 = Boolean(input.site?.ga4MeasurementId);
  const injectGoogleAds = Boolean(input.site?.googleAdsTagId);
  const injectMetaPixel = Boolean(input.site?.metaPixelId);

  return {
    resolvedHost: input.resolvedHost,
    projectId: input.project?.id ?? null,
    projectName: input.project?.name ?? null,
    siteId: input.site?.id ?? null,
    siteSlug: input.site?.slug ?? null,
    hostSource: input.hostSource,
    liveUrl: buildLiveUrl(input.project?.primaryDomain ?? null),
    previewUrl:
      input.site?.previewHost ? buildLiveUrl(input.site.previewHost) : input.site?.latestPreviewPath ?? null,
    ga4MeasurementId: input.site?.ga4MeasurementId ?? null,
    googleAdsTagId: input.site?.googleAdsTagId ?? null,
    googleAdsConversionMode: input.site?.googleAdsConversionMode ?? "DIRECT_LABEL",
    googleAdsLeadConversionLabel: input.site?.googleAdsLeadConversionLabel ?? null,
    gtmContainerId: input.site?.gtmContainerId ?? null,
    metaPixelId: input.site?.metaPixelId ?? null,
    injectGtm,
    injectGa4,
    injectGoogleAds,
    injectMetaPixel,
    suppressGa4PageView: injectGtm && injectGa4,
    leadEventTargets: {
      dataLayer: injectGtm,
      ga4: injectGa4,
      googleAds: Boolean(
        input.site?.googleAdsTagId &&
          (
            (input.site.googleAdsConversionMode === "DIRECT_LABEL" &&
              input.site.googleAdsLeadConversionLabel) ||
            (input.site.googleAdsConversionMode === "GA4_IMPORTED" &&
              input.site.ga4MeasurementId)
          ),
      ),
      metaPixel: injectMetaPixel,
    },
    warnings: buildTrackingWarnings(input.site),
  };
}

export async function readPublicTrackingRuntimeConfig(input: {
  host?: string | null;
}): Promise<PublicTrackingRuntimeConfig> {
  const resolvedHost = normalizeTrackingHost(input.host);
  if (!resolvedHost) {
    return buildRuntimeConfig({
      resolvedHost: null,
      hostSource: null,
      project: null,
      site: null,
    });
  }

  const candidates = buildHostCandidates(resolvedHost);

  const [matchingDomains, matchingSites] = await Promise.all([
    prisma.projectDomain.findMany({
      where: {
        host: {
          in: candidates,
        },
        project: {
          status: {
            in: ["DRAFT", "ACTIVE"],
          },
        },
      },
      select: {
        host: true,
        site: {
          select: {
            id: true,
            slug: true,
            previewHost: true,
            latestPreviewPath: true,
            ga4MeasurementId: true,
            googleAdsTagId: true,
            googleAdsConversionMode: true,
            googleAdsLeadConversionLabel: true,
            gtmContainerId: true,
            metaPixelId: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            primaryDomain: true,
            sites: {
              orderBy: {
                createdAt: "asc",
              },
              select: {
                id: true,
                slug: true,
                previewHost: true,
                latestPreviewPath: true,
                ga4MeasurementId: true,
                googleAdsTagId: true,
                googleAdsConversionMode: true,
                googleAdsLeadConversionLabel: true,
                gtmContainerId: true,
                metaPixelId: true,
              },
            },
          },
        },
      },
    }),
    prisma.projectSite.findMany({
      where: {
        previewHost: {
          in: candidates,
        },
        project: {
          status: {
            in: ["DRAFT", "ACTIVE"],
          },
        },
      },
      select: {
        previewHost: true,
        id: true,
        slug: true,
        latestPreviewPath: true,
        ga4MeasurementId: true,
        googleAdsTagId: true,
        googleAdsConversionMode: true,
        googleAdsLeadConversionLabel: true,
        gtmContainerId: true,
        metaPixelId: true,
        project: {
          select: {
            id: true,
            name: true,
            primaryDomain: true,
          },
        },
      },
    }),
  ]);

  const matchingDomain =
    matchingDomains.find((entry) => entry.host.toLowerCase() === resolvedHost) ??
    matchingDomains.find((entry) => entry.host.toLowerCase() === resolvedHost.replace(/^www\./, "")) ??
    null;

  if (matchingDomain) {
    const fallbackSite = matchingDomain.project.sites[0] ?? null;
    return buildRuntimeConfig({
      resolvedHost,
      hostSource: "PRIMARY_DOMAIN",
      project: matchingDomain.project,
      site: matchingDomain.site ?? fallbackSite,
    });
  }

  const matchingPreviewSite =
    matchingSites.find((entry) => entry.previewHost?.toLowerCase() === resolvedHost) ??
    matchingSites.find(
      (entry) => entry.previewHost?.toLowerCase() === resolvedHost.replace(/^www\./, ""),
    ) ??
    null;

  if (matchingPreviewSite) {
    return buildRuntimeConfig({
      resolvedHost,
      hostSource: "PREVIEW_HOST",
      project: matchingPreviewSite.project,
      site: matchingPreviewSite,
    });
  }

  return buildRuntimeConfig({
    resolvedHost,
    hostSource: null,
    project: null,
    site: null,
  });
}
