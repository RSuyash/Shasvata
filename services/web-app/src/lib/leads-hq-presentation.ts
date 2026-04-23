import type { ProjectLead } from "./landing-portal";

export type LeadTrendPoint = {
  label: string;
  count: number;
};

export type LeadSourceMixItem = {
  label: string;
  count: number;
  sharePercent: number;
};

export type LeadWorkspaceInsights = {
  total: number;
  syncAttentionCount: number;
  deliveryAttentionCount: number;
  internalTestCount: number;
  highIntentCount: number;
};

function formatDayLabel(date: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  }).format(date);
}

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function resolveLeadSourceLabel(lead: ProjectLead): string {
  if (lead.campaignName?.trim()) {
    return lead.campaignName.trim();
  }

  if (lead.sourceConnectorLabel?.trim()) {
    return lead.sourceConnectorLabel.trim();
  }

  if (lead.sourceKind && lead.sourceKind !== "WEB_FORM") {
    return lead.sourceKind
      .toLowerCase()
      .split("_")
      .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
      .join(" ");
  }

  if (lead.touchpointLabel?.trim()) {
    return lead.touchpointLabel.trim();
  }

  if (lead.utmSource?.trim()) {
    return lead.utmSource.trim().replace(/\b\w/g, (char) => char.toUpperCase());
  }

  if (lead.sourceHost?.trim()) {
    return lead.sourceHost.trim();
  }

  return "Direct";
}

export function buildLeadTrend(leads: ProjectLead[], now = new Date()): LeadTrendPoint[] {
  const today = startOfUtcDay(now);
  const dayCounts = new Map<string, number>();

  for (const lead of leads) {
    const date = startOfUtcDay(new Date(lead.createdAt));
    const key = date.toISOString();
    dayCounts.set(key, (dayCounts.get(key) ?? 0) + 1);
  }

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setUTCDate(today.getUTCDate() - (6 - index));
    const key = date.toISOString();

    return {
      label: formatDayLabel(date),
      count: dayCounts.get(key) ?? 0,
    };
  });
}

export function buildLeadSourceMix(leads: ProjectLead[]): LeadSourceMixItem[] {
  const counts = new Map<string, number>();

  for (const lead of leads) {
    const label = resolveLeadSourceLabel(lead);
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }

  const total = leads.length || 1;
  return Array.from(counts.entries())
    .map(([label, count]) => ({
      label,
      count,
      sharePercent: Math.round((count / total) * 100),
    }))
    .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label));
}

export function buildLeadWorkspaceInsights(leads: ProjectLead[]): LeadWorkspaceInsights {
  return {
    total: leads.length,
    syncAttentionCount: leads.filter((lead) => lead.syncStatus === "FAILED").length,
    deliveryAttentionCount: leads.filter(
      (lead) => lead.notificationStatus === "NOTIFICATION_FAILED",
    ).length,
    internalTestCount: leads.filter((lead) => lead.isInternalTest).length,
    highIntentCount: leads.filter((lead) => {
      const budget = lead.budgetLabel?.toLowerCase() ?? "";
      const timeline = lead.timeline?.toLowerCase() ?? "";
      return budget.includes("₹") || budget.includes("l") || timeline.includes("immediate");
    }).length,
  };
}
