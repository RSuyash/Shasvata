import type { ProjectBillingDetail, ProjectDetail, ProjectLead } from "./landing-portal";
import { ROUTES } from "./routes";
import { formatCompactNumber, formatMoneyMinor, formatPortalDate } from "./utils";

type CommandCenterAction = {
  label: string;
  href: string;
  external?: boolean;
};

type CommandCenterCardTone = "success" | "warning" | "neutral" | "indigo";

type CommandCenterCard = {
  label: string;
  value: string;
  detail: string;
  href: string;
  tone: CommandCenterCardTone;
};

type CommandCenterTimelineItem = {
  label: string;
  detail: string;
  occurredAt: string;
  formattedAt: string;
  href: string;
};

export type ProjectCommandCenterModel = {
  hero: {
    eyebrow: string;
    summary: string;
    nextStepLabel: string;
    nextStepDetail: string;
    primaryAction: CommandCenterAction;
    quickActions: CommandCenterAction[];
    roleLabel: string;
    companyLabel: string;
    websiteLabel: string;
  };
  cards: {
    leads: CommandCenterCard;
    billing: CommandCenterCard;
    website: CommandCenterCard;
    tracking: CommandCenterCard;
  };
  delivery: {
    title: string;
    detail: string;
    primaryDomain: string;
    previewLabel: string;
    publishedSummary: string;
    domainSummary: string;
    lastUpdate: string;
  };
  billing: {
    title: string;
    detail: string;
    dueLabel: string;
    contactLabel: string;
    latestStateLabel: string;
    href: string;
  };
  collaboration: {
    title: string;
    detail: string;
    memberLabel: string;
    ownerLabel: string;
    href: string;
  };
  latestLead: ProjectLead | null;
  timeline: CommandCenterTimelineItem[];
};

function pickPrimarySite(project: ProjectDetail) {
  return (
    project.sites.find((site) => site.id === project.sourceSummary?.siteId) ||
    project.sites[0] ||
    null
  );
}

function formatList(items: string[]) {
  if (!items.length) {
    return "";
  }

  if (items.length === 1) {
    return items[0];
  }

  if (items.length === 2) {
    return `${items[0]} and ${items[1]}`;
  }

  return `${items.slice(0, -1).join(", ")}, and ${items.at(-1)}`;
}

function getTrackingProviders(project: ProjectDetail) {
  const site = pickPrimarySite(project);
  const providers: string[] = [];

  if (site?.ga4MeasurementId) {
    providers.push("GA4");
  }
  if (site?.googleAdsTagId) {
    providers.push("Google Ads");
  }
  if (site?.gtmContainerId) {
    providers.push("GTM");
  }
  if (site?.metaPixelId) {
    providers.push("Meta");
  }

  return providers;
}

const TOTAL_TRACKING_PROVIDERS = 4;

function getBillingDueNowMinor(
  project: ProjectDetail,
  billing?: ProjectBillingDetail,
) {
  return billing?.paymentState.amountDueNowMinor ?? project.billingSummary.totalPayableTodayMinor;
}

function getBillingOutstandingMinor(
  project: ProjectDetail,
  billing?: ProjectBillingDetail,
) {
  return billing?.paymentState.outstandingMinor ?? project.billingSummary.totalPayableTodayMinor;
}

function getBillingUpdatedAt(
  project: ProjectDetail,
  billing?: ProjectBillingDetail,
) {
  return billing?.billingHealth.lastSyncedAt ?? project.billingSummary.latestUpdatedAt;
}

function getBillingContactLabel(
  project: ProjectDetail,
  billing?: ProjectBillingDetail,
) {
  return (
    billing?.contacts[0]?.email ??
    project.billingSummary.billingContactEmails[0] ??
    "Billing contact not added yet"
  );
}

function getBillingStateLabel(
  project: ProjectDetail,
  billing?: ProjectBillingDetail,
) {
  return (
    billing?.paymentState.latestCheckoutStatus ??
    billing?.status ??
    project.billingSummary.latestCheckoutStatus ??
    project.billingSummary.latestCartStatus ??
    "No checkout started"
  );
}

function getBillingCardDetail(
  project: ProjectDetail,
  billing?: ProjectBillingDetail,
) {
  const dueNowMinor = getBillingDueNowMinor(project, billing);
  if (dueNowMinor <= 0) {
    return "No amount is due right now.";
  }

  if (billing?.checkoutReadiness.ready) {
    return "Ready for payment in the billing workspace.";
  }

  return (
    billing?.checkoutReadiness.blockers.find((blocker) => blocker.code !== "NOTHING_DUE")?.label ??
    "Billing needs review in the workspace."
  );
}

function getBillingPanelTitle(
  project: ProjectDetail,
  billing?: ProjectBillingDetail,
) {
  const dueNowMinor = getBillingDueNowMinor(project, billing);
  if (billing?.status === "PAID" || dueNowMinor <= 0) {
    return "Billing looks settled right now";
  }

  if (billing?.checkoutReadiness.ready) {
    return "Billing is ready for client action";
  }

  return "Billing needs one final step";
}

function getBillingPanelDetail(
  project: ProjectDetail,
  billing?: ProjectBillingDetail,
) {
  if (billing) {
    return (
      billing.checkoutReadiness.blockers.find((blocker) => blocker.code !== "NOTHING_DUE")?.label ??
      billing.billingHealth.detail
    );
  }

  return project.billingSummary.latestCartStatus || project.billingSummary.latestQuoteRequestStatus
    ? `Latest commercial state: ${project.billingSummary.latestCartStatus || project.billingSummary.latestQuoteRequestStatus}.`
    : "No active commercial state is visible yet.";
}

function buildPrimaryAction(
  project: ProjectDetail,
  leads: ProjectLead[],
  billing?: ProjectBillingDetail,
): {
  label: string;
  href: string;
  detail: string;
  external?: boolean;
} {
  const dueNowMinor = getBillingDueNowMinor(project, billing);
  if (dueNowMinor > 0) {
    return {
      label: "Review billing",
      href: ROUTES.dashboard.projectBilling(project.id),
      detail: billing?.checkoutReadiness.ready
        ? `${formatMoneyMinor(dueNowMinor)} is due now in the workspace.`
        : getBillingPanelDetail(project, billing),
    };
  }

  if (project.liveUrl) {
    return {
      label: "Open live site",
      href: project.liveUrl,
      external: true,
      detail: "The live page is the most important surface to review right now.",
    };
  }

  if (project.previewUrl) {
    return {
      label: "Open preview",
      href: project.previewUrl,
      external: true,
      detail: "The preview is ready for review before the final domain cutover.",
    };
  }

  if (leads.length > 0) {
    return {
      label: "Review leads",
      href: ROUTES.dashboard.projectLeads(project.id),
      detail: "New enquiries are already in the workspace and should be reviewed next.",
    };
  }

  return {
    label: "Open analytics",
    href: ROUTES.dashboard.projectAnalytics(project.id),
    detail: "Use analytics to verify host resolution and tracking readiness before launch.",
  };
}

export function buildProjectCommandCenter(
  project: ProjectDetail,
  leads: ProjectLead[],
  billing?: ProjectBillingDetail,
): ProjectCommandCenterModel {
  const latestLead = leads[0] ?? null;
  const primarySite = pickPrimarySite(project);
  const publishedSiteCount = project.sites.filter((site) => site.publishStatus === "PUBLISHED")
    .length;
  const activeDomainCount = project.domains.filter((domain) => domain.status === "ACTIVE").length;
  const ownerCount = project.members.filter((member) => member.role === "OWNER").length;
  const activeMemberCount = project.members.filter((member) => member.status === "ACTIVE").length;
  const trackingProviders = getTrackingProviders(project);
  const primaryAction = buildPrimaryAction(project, leads, billing);
  const dueNowMinor = getBillingDueNowMinor(project, billing);
  const outstandingMinor = getBillingOutstandingMinor(project, billing);
  const billingUpdatedAt = getBillingUpdatedAt(project, billing);
  const quickActions = [
    {
      label: "Leads",
      href: ROUTES.dashboard.projectLeads(project.id),
    },
    {
      label: "Billing",
      href: ROUTES.dashboard.projectBilling(project.id),
    },
    {
      label: "Analytics",
      href: ROUTES.dashboard.projectAnalytics(project.id),
    },
    ...(project.liveUrl
      ? [
          {
            label: "Website",
            href: project.liveUrl,
            external: true,
          },
        ]
      : []),
  ].filter(
    (action, index, all) =>
      !(action.href === primaryAction.href && action.label === primaryAction.label) &&
      all.findIndex(
        (candidate) => candidate.href === action.href && candidate.label === action.label,
      ) === index,
  );

  const timeline = [
    latestLead
      ? {
          label: "Latest lead captured",
          detail: `${latestLead.fullName} came in from ${latestLead.sourceHost || "the live page"}.`,
          occurredAt: latestLead.createdAt,
          href: ROUTES.dashboard.projectLeads(project.id),
        }
      : null,
    billingUpdatedAt
      ? {
          label: "Billing updated",
          detail:
            dueNowMinor > 0
              ? `${formatMoneyMinor(dueNowMinor)} is currently due.`
              : "The commercial record is updated and no amount is due right now.",
          occurredAt: billingUpdatedAt,
          href: ROUTES.dashboard.projectBilling(project.id),
        }
      : null,
    project.goLiveAt
      ? {
          label: "Go-live updated",
          detail: project.liveUrl
            ? "The live website has a current go-live timestamp."
            : "A delivery update was recorded for this project.",
          occurredAt: project.goLiveAt,
          href: project.liveUrl || ROUTES.dashboard.project(project.id),
        }
      : null,
  ]
    .filter(Boolean)
    .sort((left, right) => {
      return new Date(right!.occurredAt).getTime() - new Date(left!.occurredAt).getTime();
    })
    .map((item) => ({
      ...item!,
      formattedAt: formatPortalDate(item!.occurredAt),
    }));

  return {
    hero: {
      eyebrow: project.membershipRole === "OWNER" ? "Owner workspace" : "Viewer workspace",
      summary: project.description || "A calmer command center for delivery, billing, and lead flow.",
      nextStepLabel: primaryAction.label,
      nextStepDetail: primaryAction.detail,
      primaryAction,
      quickActions,
      roleLabel: project.membershipRole === "OWNER" ? "Owner access" : "Viewer access",
      companyLabel: project.clientCompanyName || "Client company pending",
      websiteLabel: project.liveUrl || project.previewUrl || "Website not published yet",
    },
    cards: {
      leads: {
        label: "Lead pulse",
        value: formatCompactNumber(leads.length),
        detail: latestLead
          ? `Latest from ${latestLead.fullName} on ${formatPortalDate(latestLead.createdAt)}`
          : "No visible enquiries have been captured yet.",
        href: ROUTES.dashboard.projectLeads(project.id),
        tone: leads.length > 0 ? "indigo" : "neutral",
      },
      billing: {
        label: "Billing state",
        value:
          dueNowMinor > 0
            ? formatMoneyMinor(dueNowMinor)
            : "Paid / clear",
        detail: getBillingCardDetail(project, billing),
        href: ROUTES.dashboard.projectBilling(project.id),
        tone: dueNowMinor > 0 ? "warning" : "success",
      },
      website: {
        label: "Website readiness",
        value: project.liveUrl ? "Live" : project.previewUrl ? "Preview" : "In progress",
        detail: `${publishedSiteCount} published site${publishedSiteCount === 1 ? "" : "s"} and ${activeDomainCount} active domain${activeDomainCount === 1 ? "" : "s"}.`,
        href: project.liveUrl || project.previewUrl || ROUTES.dashboard.project(project.id),
        tone: project.liveUrl ? "success" : project.previewUrl ? "indigo" : "neutral",
      },
      tracking: {
        label: "Tracking setup",
        value: `${trackingProviders.length} of ${TOTAL_TRACKING_PROVIDERS}`,
        detail: trackingProviders.length
          ? `${formatList(trackingProviders)} ${trackingProviders.length === 1 ? "is" : "are"} saved for this site.`
          : "No tracking IDs are saved yet.",
        href: ROUTES.dashboard.projectAnalytics(project.id),
        tone: trackingProviders.length > 0 ? "indigo" : "neutral",
      },
    },
    delivery: {
      title: project.liveUrl ? "Live delivery is active" : project.previewUrl ? "Preview is ready" : "Delivery is still taking shape",
      detail: project.notes || "Use this panel to review domain, publication, and preview readiness in one place.",
      primaryDomain: project.primaryDomain || "Primary domain pending",
      previewLabel: project.previewUrl || primarySite?.latestPreviewPath || "No preview link yet",
      publishedSummary: `${publishedSiteCount} of ${Math.max(project.sites.length, 1)} site${project.sites.length === 1 ? "" : "s"} published`,
      domainSummary: `${activeDomainCount} of ${Math.max(project.domains.length, 1)} domain${project.domains.length === 1 ? "" : "s"} active`,
      lastUpdate: formatPortalDate(project.goLiveAt),
    },
    billing: {
      title: getBillingPanelTitle(project, billing),
      detail: getBillingPanelDetail(project, billing),
      dueLabel:
        dueNowMinor > 0
          ? formatMoneyMinor(dueNowMinor)
          : outstandingMinor > 0
            ? formatMoneyMinor(outstandingMinor)
            : "Nothing due now",
      contactLabel: getBillingContactLabel(project, billing),
      latestStateLabel: getBillingStateLabel(project, billing),
      href: ROUTES.dashboard.projectBilling(project.id),
    },
    collaboration: {
      title: ownerCount > 1 ? "Multiple owners can coordinate here" : "Access is still tightly scoped",
      detail:
        activeMemberCount > 1
          ? `${activeMemberCount} active members can review this workspace.`
          : "Only one active member is visible in this workspace right now.",
      memberLabel: `${activeMemberCount} active member${activeMemberCount === 1 ? "" : "s"}`,
      ownerLabel: `${ownerCount} owner${ownerCount === 1 ? "" : "s"}`,
      href: ROUTES.dashboard.projectSettings(project.id),
    },
    latestLead,
    timeline,
  };
}
