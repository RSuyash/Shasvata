import "dotenv/config";
import { prisma } from "../lib/prisma.js";
import { buildDefaultMdocPushConfig } from "../services/mdoc-push.js";

function readArg(flag: string): string | undefined {
  const index = process.argv.indexOf(flag);
  if (index < 0) {
    return undefined;
  }

  return process.argv[index + 1];
}

function hasArg(flag: string): boolean {
  return process.argv.includes(flag);
}

function readNullableArg(flag: string): string | null | undefined {
  if (!hasArg(flag)) {
    return undefined;
  }

  return readArg(flag)?.trim() || null;
}

async function main() {
  const operatorEmail = readArg("--operator-email")?.trim().toLowerCase();
  const projectId = readArg("--project-id")?.trim();
  const projectSlug = readArg("--project-slug")?.trim();
  const siteId = readArg("--site-id")?.trim();
  const ga4MeasurementId = readNullableArg("--ga4");
  const googleAdsTagId = readNullableArg("--google-ads");
  const googleAdsConversionMode =
    hasArg("--google-ads-mode")
      ? readArg("--google-ads-mode")?.trim().toUpperCase() === "GA4_IMPORTED"
        ? "GA4_IMPORTED"
        : "DIRECT_LABEL"
      : undefined;
  const googleAdsLeadConversionLabel = readNullableArg("--google-ads-label");
  const gtmContainerId = readNullableArg("--gtm");
  const metaPixelId = readNullableArg("--meta");
  const trackingNotes = readNullableArg("--notes");
  const mdocEndpoint = readArg("--mdoc-endpoint")?.trim();
  const mdocApiKey = readArg("--mdoc-api-key")?.trim();
  const mdocDataFrom = (readArg("--mdoc-data-from")?.trim().toUpperCase() as "T" | "E" | undefined) ?? "E";
  const mdocSource = readArg("--mdoc-source")?.trim() ?? "Digitals";
  const mdocFallbackSourceDetail = readArg("--mdoc-fallback-source-detail")?.trim() ?? "Website";
  const mdocLabel = readArg("--mdoc-label")?.trim() ?? "MDOC push";

  if (!operatorEmail || (!projectId && !projectSlug)) {
    throw new Error(
      "Usage: npm run tracking:bootstrap-project -- --operator-email <email> (--project-id <id> | --project-slug <slug>) [--site-id <id>] [--ga4 <measurement-id>] [--google-ads <aw-id>] [--google-ads-mode <DIRECT_LABEL|GA4_IMPORTED>] [--google-ads-label <label>] [--gtm <container-id>] [--meta <pixel-id>] [--notes <text>] [--mdoc-endpoint <url> --mdoc-api-key <key>]",
    );
  }

  const operator = await prisma.portalUser.findUnique({
    where: { email: operatorEmail },
  });

  if (!operator) {
    throw new Error(`Operator portal user not found for ${operatorEmail}`);
  }

  if (operator.role !== "PLATFORM_ADMIN" && operator.role !== "PLATFORM_OPERATOR") {
    throw new Error(`${operatorEmail} does not have operator access.`);
  }

  const project = projectId
    ? await prisma.project.findUnique({
        where: { id: projectId },
        include: {
          sites: {
            orderBy: { createdAt: "asc" },
          },
        },
      })
    : await prisma.project.findUnique({
        where: { slug: projectSlug },
        include: {
          sites: {
            orderBy: { createdAt: "asc" },
          },
        },
      });

  if (!project) {
    throw new Error("Target project not found.");
  }

  const targetSite =
    (siteId ? project.sites.find((site) => site.id === siteId) : project.sites[0]) ?? null;

  if (!targetSite) {
    throw new Error("No project site found to configure tracking.");
  }

  const trackingUpdate: {
    ga4MeasurementId?: string | null;
    googleAdsTagId?: string | null;
    googleAdsConversionMode?: "DIRECT_LABEL" | "GA4_IMPORTED";
    googleAdsLeadConversionLabel?: string | null;
    gtmContainerId?: string | null;
    metaPixelId?: string | null;
    trackingNotes?: string | null;
  } = {};

  if (ga4MeasurementId !== undefined) {
    trackingUpdate.ga4MeasurementId = ga4MeasurementId;
  }
  if (googleAdsTagId !== undefined) {
    trackingUpdate.googleAdsTagId = googleAdsTagId;
  }
  if (googleAdsConversionMode !== undefined) {
    trackingUpdate.googleAdsConversionMode = googleAdsConversionMode;
  }
  if (googleAdsLeadConversionLabel !== undefined) {
    trackingUpdate.googleAdsLeadConversionLabel = googleAdsLeadConversionLabel;
  }
  if (gtmContainerId !== undefined) {
    trackingUpdate.gtmContainerId = gtmContainerId;
  }
  if (metaPixelId !== undefined) {
    trackingUpdate.metaPixelId = metaPixelId;
  }
  if (trackingNotes !== undefined) {
    trackingUpdate.trackingNotes = trackingNotes;
  }

  const site = Object.keys(trackingUpdate).length
    ? await prisma.projectSite.update({
        where: { id: targetSite.id },
        data: trackingUpdate,
      })
    : targetSite;

  let mdocTarget = null;
  if (mdocEndpoint && mdocApiKey) {
    const existingTarget = await prisma.leadSyncTarget.findFirst({
      where: {
        projectId: project.id,
        kind: "MDOC_PUSH",
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    const config = buildDefaultMdocPushConfig({
      endpoint: mdocEndpoint,
      apiKey: mdocApiKey,
      dataFrom: mdocDataFrom,
      source: mdocSource,
      fallbackSourceDetail: mdocFallbackSourceDetail,
    });

    mdocTarget = existingTarget
      ? await prisma.leadSyncTarget.update({
          where: { id: existingTarget.id },
          data: {
            status: "ACTIVE",
            label: mdocLabel,
            config,
          },
        })
      : await prisma.leadSyncTarget.create({
          data: {
            projectId: project.id,
            kind: "MDOC_PUSH",
            status: "ACTIVE",
            label: mdocLabel,
            config,
          },
        });
  }

  console.log(
    JSON.stringify(
      {
        status: "ok",
        projectId: project.id,
        projectSlug: project.slug,
        siteId: site.id,
        siteSlug: site.slug,
        tracking: {
          ga4MeasurementId: site.ga4MeasurementId,
          googleAdsTagId: site.googleAdsTagId,
          googleAdsConversionMode: site.googleAdsConversionMode,
          googleAdsLeadConversionLabel: site.googleAdsLeadConversionLabel,
          gtmContainerId: site.gtmContainerId,
          metaPixelId: site.metaPixelId,
          trackingNotes: site.trackingNotes,
        },
        mdocTarget,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : "Unknown tracking bootstrap error.";
  console.error(message);
  process.exitCode = 1;
});
