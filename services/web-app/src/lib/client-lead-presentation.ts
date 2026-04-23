import {
  buildLeadExportUrl,
  type ProjectLead,
} from "./landing-portal";

export type LeadActionLink = {
  label: string;
  href: string;
  external?: boolean;
};

export function buildLeadNeedLabel(lead: ProjectLead): string {
  const parts = [lead.interestLabel, lead.budgetLabel, lead.timeline].filter(Boolean);

  if (parts.length > 0) {
    return parts.join(" | ");
  }

  return lead.problemSummary || lead.message || "General property enquiry";
}

export function buildLeadSourceLabel(lead: ProjectLead): string {
  const sourceKindLabel = lead.sourceKind && lead.sourceKind !== "WEB_FORM"
    ? lead.sourceKind
        .toLowerCase()
        .split("_")
        .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
        .join(" ")
    : null;
  const acquisitionParts = [
    lead.campaignName,
    lead.sourceConnectorLabel,
    sourceKindLabel,
  ].filter((value): value is string => Boolean(value));
  const dedupedAcquisitionParts = acquisitionParts.filter(
    (value, index) =>
      acquisitionParts.findIndex(
        (candidate) => candidate.trim().toLowerCase() === value.trim().toLowerCase(),
      ) === index,
  );

  if (dedupedAcquisitionParts.length > 0) {
    return dedupedAcquisitionParts.join(" | ");
  }

  const parts = [lead.touchpointLabel, lead.utmSource, lead.utmMedium, lead.utmCampaign].filter(
    Boolean,
  );

  if (parts.length > 0) {
    return parts.join(" | ");
  }

  return lead.sourceHost || "Direct submission";
}

export function buildLeadRowActions(lead: ProjectLead): LeadActionLink[] {
  return buildLeadRowActionsWithOptions(lead, {
    includeContact: true,
  });
}

export function buildLeadRowActionsWithOptions(
  lead: ProjectLead,
  options: {
    includeContact?: boolean;
  } = {},
): LeadActionLink[] {
  const includeContact = options.includeContact ?? true;

  return [
    includeContact && lead.email
      ? {
          label: "Email lead",
          href: `mailto:${lead.email}`,
        }
      : null,
    includeContact && lead.phone
      ? {
          label: "Call lead",
          href: `tel:${lead.phone}`,
        }
      : null,
    lead.sourcePage
      ? {
          label: "Open source page",
          href: lead.sourcePage,
          external: true,
        }
      : null,
  ].filter((action): action is LeadActionLink => Boolean(action));
}

export function buildLeadDownloadActions(projectId: string): LeadActionLink[] {
  return [
    {
      label: "Download Excel",
      href: buildLeadExportUrl(projectId, "xlsx"),
    },
    {
      label: "Download Full Excel",
      href: buildLeadExportUrl(projectId, "xlsx", "full"),
    },
    {
      label: "Download Full CSV",
      href: buildLeadExportUrl(projectId, "csv", "full"),
    },
  ];
}
