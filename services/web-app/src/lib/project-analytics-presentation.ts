import type { ProjectDetail, ProjectSite, ProjectSyncTarget } from "./landing-portal";

export type ProjectAnalyticsConversionSurface = {
  liveSiteUrl: string | null;
  previewSiteUrl: string | null;
  liveThankYouUrl: string | null;
  previewThankYouUrl: string | null;
  recommendedTrackingRoute: string | null;
  trackingNotes: string[];
};

export type ProjectAnalyticsProviderRow = {
  label: string;
  icon: string;
  value: string | null;
  statusLabel: string;
  tone: "success" | "warning" | "neutral";
  detail: string;
};

export type ProjectAnalyticsGoogleAdsGoalSurface = {
  statusLabel: string;
  tone: "success" | "warning" | "neutral";
  modeLabel: string;
  detail: string;
  directSendTo: string | null;
};

export type ProjectAnalyticsDestinationSurface = {
  id: string;
  label: string;
  kind: "GOOGLE_SHEETS" | "MDOC_PUSH";
  statusLabel: string;
  tone: "success" | "warning" | "neutral";
  detail: string;
};

export type ProjectAnalyticsIntegrationSurface = {
  providerRows: ProjectAnalyticsProviderRow[];
  googleAdsGoal: ProjectAnalyticsGoogleAdsGoalSurface;
  destinations: ProjectAnalyticsDestinationSurface[];
  notes: string[];
};

function appendPath(baseUrl: string | null, pathname: string): string | null {
  if (!baseUrl) {
    return null;
  }

  try {
    return new URL(pathname, baseUrl).toString();
  } catch {
    return null;
  }
}

export function buildProjectAnalyticsConversionSurface(
  project: Pick<ProjectDetail, "liveUrl" | "previewUrl" | "sites">,
): ProjectAnalyticsConversionSurface {
  const liveThankYouUrl = appendPath(project.liveUrl, "/thank-you");
  const previewThankYouUrl = appendPath(project.previewUrl, "/thank-you");
  const publishedSiteCount = project.sites.filter(
    (site) => site.publishStatus === "PUBLISHED",
  ).length;

  const trackingNotes: string[] = [];

  if (liveThankYouUrl) {
    trackingNotes.push(
      "Use the live thank-you route as the clean conversion destination for GA4, Meta, and GTM page-view tracking.",
    );
  }

  if (!liveThankYouUrl && previewThankYouUrl) {
    trackingNotes.push(
      "The preview thank-you route is available now while the live domain is still being finalized.",
    );
  }

  if (publishedSiteCount > 1) {
    trackingNotes.push(
      "This project has multiple published site surfaces, so keep the thank-you route consistent across every active host.",
    );
  }

  if (!trackingNotes.length) {
    trackingNotes.push(
      "Publish a site first so Naya can expose a stable thank-you route for campaign tracking.",
    );
  }

  return {
    liveSiteUrl: project.liveUrl,
    previewSiteUrl: project.previewUrl,
    liveThankYouUrl,
    previewThankYouUrl,
    recommendedTrackingRoute: liveThankYouUrl ?? previewThankYouUrl,
    trackingNotes,
  };
}

function formatAttemptKind(kind: ProjectSyncTarget["kind"]) {
  return kind === "MDOC_PUSH" ? "MDOC push" : "Google Sheets";
}

export function buildProjectAnalyticsIntegrationSurface(input: {
  site: ProjectSite | null;
  syncTargets: ProjectSyncTarget[];
}): ProjectAnalyticsIntegrationSurface {
  const { site, syncTargets } = input;
  const providerRows: ProjectAnalyticsProviderRow[] = [
    {
      label: "Google Analytics (GA4)",
      icon: "analytics",
      value: site?.ga4MeasurementId ?? null,
      statusLabel: site?.ga4MeasurementId ? "LIVE" : "EMPTY",
      tone: site?.ga4MeasurementId ? "success" : "neutral",
      detail: site?.ga4MeasurementId
        ? "Page views and generate_lead events can be attributed in GA4."
        : "GA4 is not configured yet.",
    },
    {
      label: "Google Ads",
      icon: "ads_click",
      value: site?.googleAdsTagId ?? null,
      statusLabel: site?.googleAdsTagId ? "LIVE" : "EMPTY",
      tone: site?.googleAdsTagId ? "success" : "neutral",
      detail: site?.googleAdsTagId
        ? "The Ads tag is available for remarketing and conversion measurement."
        : "No Google Ads tag has been added yet.",
    },
    {
      label: "Google Tag Manager",
      icon: "account_tree",
      value: site?.gtmContainerId ?? null,
      statusLabel: site?.gtmContainerId ? "LIVE" : "EMPTY",
      tone: site?.gtmContainerId ? "success" : "neutral",
      detail: site?.gtmContainerId
        ? "GTM can own page-view and custom dataLayer pipelines."
        : "No GTM container is configured.",
    },
    {
      label: "Meta Pixel",
      icon: "share",
      value: site?.metaPixelId ?? null,
      statusLabel: site?.metaPixelId ? "LIVE" : "EMPTY",
      tone: site?.metaPixelId ? "success" : "neutral",
      detail: site?.metaPixelId
        ? "Meta Lead events can fire on the shared thank-you route."
        : "No Meta Pixel is configured.",
    },
  ];

  let googleAdsGoal: ProjectAnalyticsGoogleAdsGoalSurface;
  if (!site?.googleAdsTagId) {
    googleAdsGoal = {
      statusLabel: "NOT CONFIGURED",
      tone: "neutral",
      modeLabel: "No goal mode",
      detail: "Add a Google Ads tag first before wiring a primary lead goal.",
      directSendTo: null,
    };
  } else if (site.googleAdsConversionMode === "GA4_IMPORTED") {
    googleAdsGoal = {
      statusLabel: site.ga4MeasurementId ? "IMPORTED" : "GA4 NEEDED",
      tone: site.ga4MeasurementId ? "success" : "warning",
      modeLabel: "Imported from GA4",
      detail: site.ga4MeasurementId
        ? "Google Ads will rely on the GA4 generate_lead event from /thank-you."
        : "This goal mode needs a GA4 measurement ID before Google Ads can count the lead.",
      directSendTo: null,
    };
  } else if (site.googleAdsLeadConversionLabel) {
    googleAdsGoal = {
      statusLabel: "DIRECT LABEL",
      tone: "success",
      modeLabel: "Direct conversion label",
      detail: "The thank-you route can fire a dedicated Google Ads conversion event directly.",
      directSendTo: `${site.googleAdsTagId}/${site.googleAdsLeadConversionLabel}`,
    };
  } else {
    googleAdsGoal = {
      statusLabel: "LABEL MISSING",
      tone: "warning",
      modeLabel: "Direct conversion label",
      detail: "The Ads tag is present, but the primary lead conversion label is still missing.",
      directSendTo: null,
    };
  }

  const destinations = syncTargets.map<ProjectAnalyticsDestinationSurface>((target) => {
    const latestAttempt = target.latestDeliveryAttempt;
    const tone =
      target.status !== "ACTIVE"
        ? "neutral"
        : latestAttempt?.status === "FAILED"
          ? "warning"
          : latestAttempt?.status === "SYNCED"
            ? "success"
            : "neutral";

    return {
      id: target.id,
      label: target.label ?? formatAttemptKind(target.kind),
      kind: target.kind,
      statusLabel:
        target.status !== "ACTIVE"
          ? "INACTIVE"
          : latestAttempt?.status ?? "WAITING",
      tone,
      detail:
        target.status !== "ACTIVE"
          ? "This destination is configured but currently inactive."
          : latestAttempt
            ? `${formatAttemptKind(target.kind)} last attempted at ${new Date(latestAttempt.attemptedAt).toLocaleString("en-IN")}.`
            : "No live delivery attempt has been recorded yet.",
    };
  });

  const notes: string[] = [];
  if (googleAdsGoal.tone === "warning") {
    notes.push(googleAdsGoal.detail);
  }
  if (site?.gtmContainerId && (site.ga4MeasurementId || site.googleAdsTagId)) {
    notes.push("GTM and direct Google tags are both configured, so check for duplicate conversions before launch.");
  }
  if (!destinations.length) {
    notes.push("No downstream delivery destination is active yet, so Naya remains the only lead sink.");
  }

  return {
    providerRows,
    googleAdsGoal,
    destinations,
    notes,
  };
}
