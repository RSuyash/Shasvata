import { describe, expect, it } from "vitest";
import type { ProjectLead } from "./landing-portal";
import {
  buildLeadSourceMix,
  buildLeadTrend,
  buildLeadWorkspaceInsights,
} from "./leads-hq-presentation";

function makeLead(overrides: Partial<ProjectLead>): ProjectLead {
  return {
    id: overrides.id ?? "lead_1",
    projectId: overrides.projectId ?? "project_1",
    sourceLeadId: overrides.sourceLeadId ?? null,
    fullName: overrides.fullName ?? "Test Lead",
    email: overrides.email ?? "lead@example.com",
    phone: overrides.phone ?? "9876543210",
    companyName: overrides.companyName ?? "Example Co",
    message: overrides.message ?? null,
    consent: overrides.consent ?? true,
    sourcePage: overrides.sourcePage ?? null,
    sourceCta: overrides.sourceCta ?? null,
    utmSource: overrides.utmSource ?? null,
    utmMedium: overrides.utmMedium ?? null,
    utmCampaign: overrides.utmCampaign ?? null,
    utmContent: overrides.utmContent ?? null,
    utmTerm: overrides.utmTerm ?? null,
    gclid: overrides.gclid ?? null,
    gbraid: overrides.gbraid ?? null,
    wbraid: overrides.wbraid ?? null,
    sourceKind: overrides.sourceKind ?? "WEB_FORM",
    connectorId: overrides.connectorId ?? null,
    sourceConnectorLabel: overrides.sourceConnectorLabel ?? null,
    campaignId: overrides.campaignId ?? null,
    campaignName: overrides.campaignName ?? null,
    importBatchId: overrides.importBatchId ?? null,
    importBatchLabel: overrides.importBatchLabel ?? null,
    externalLeadId: overrides.externalLeadId ?? null,
    capturedAt: overrides.capturedAt ?? null,
    notificationStatus: overrides.notificationStatus ?? "NOTIFIED",
    notificationError: overrides.notificationError ?? null,
    syncStatus: overrides.syncStatus ?? "SYNCED",
    syncError: overrides.syncError ?? null,
    visibilityState: overrides.visibilityState ?? "VISIBLE",
    hiddenAt: overrides.hiddenAt ?? null,
    hiddenByPortalUserId: overrides.hiddenByPortalUserId ?? null,
    hiddenByUserEmail: overrides.hiddenByUserEmail ?? null,
    hiddenByUserFullName: overrides.hiddenByUserFullName ?? null,
    hiddenReasonCode: overrides.hiddenReasonCode ?? null,
    hiddenReasonNote: overrides.hiddenReasonNote ?? null,
    lastRestoredAt: overrides.lastRestoredAt ?? null,
    lastRestoredByPortalUserId: overrides.lastRestoredByPortalUserId ?? null,
    lastRestoredByUserEmail: overrides.lastRestoredByUserEmail ?? null,
    lastRestoredByUserFullName: overrides.lastRestoredByUserFullName ?? null,
    sourceHost: overrides.sourceHost ?? null,
    serviceInterest: overrides.serviceInterest ?? [],
    budgetRange: overrides.budgetRange ?? null,
    timeline: overrides.timeline ?? null,
    problemSummary: overrides.problemSummary ?? null,
    interestLabel: overrides.interestLabel ?? null,
    budgetLabel: overrides.budgetLabel ?? null,
    touchpointLabel: overrides.touchpointLabel ?? null,
    isInternalTest: overrides.isInternalTest ?? false,
    auditEvents: overrides.auditEvents ?? [],
    createdAt: overrides.createdAt ?? "2026-04-08T00:00:00.000Z",
  };
}

describe("leads hq presentation", () => {
  it("builds a seven-day trend from lead timestamps", () => {
    const leads = [
      makeLead({ id: "lead_1", createdAt: "2026-04-08T10:00:00.000Z" }),
      makeLead({ id: "lead_2", createdAt: "2026-04-08T12:00:00.000Z" }),
      makeLead({ id: "lead_3", createdAt: "2026-04-07T09:00:00.000Z" }),
    ];

    const trend = buildLeadTrend(leads, new Date("2026-04-08T18:00:00.000Z"));

    expect(trend).toHaveLength(7);
    expect(trend.at(-1)).toMatchObject({ label: "08 Apr", count: 2 });
    expect(trend.at(-2)).toMatchObject({ label: "07 Apr", count: 1 });
  });

  it("groups source mix by campaign and connector before legacy touchpoint fallback", () => {
    const leads = [
      makeLead({
        id: "lead_1",
        sourceKind: "META_LEAD_ADS",
        sourceConnectorLabel: "Meta Lead Ads",
        campaignName: "Broker Weekend",
        touchpointLabel: "Meta Ads",
      }),
      makeLead({
        id: "lead_2",
        sourceKind: "META_LEAD_ADS",
        sourceConnectorLabel: "Meta Lead Ads",
        campaignName: "Broker Weekend",
        touchpointLabel: "Meta Ads",
      }),
      makeLead({ id: "lead_3", utmSource: "google", utmMedium: "cpc" }),
      makeLead({ id: "lead_4", sourceHost: "topaz.example.com" }),
    ];

    const mix = buildLeadSourceMix(leads);

    expect(mix.slice(0, 3)).toEqual([
      { label: "Broker Weekend", count: 2, sharePercent: 50 },
      { label: "Google", count: 1, sharePercent: 25 },
      { label: "topaz.example.com", count: 1, sharePercent: 25 },
    ]);
  });

  it("summarizes workspace insights from lead states", () => {
    const leads = [
      makeLead({ id: "lead_1", syncStatus: "FAILED" }),
      makeLead({ id: "lead_2", notificationStatus: "NOTIFICATION_FAILED" }),
      makeLead({ id: "lead_3", isInternalTest: true }),
      makeLead({ id: "lead_4", budgetLabel: "₹35L+", timeline: "Immediate" }),
    ];

    expect(buildLeadWorkspaceInsights(leads)).toEqual({
      total: 4,
      syncAttentionCount: 1,
      deliveryAttentionCount: 1,
      internalTestCount: 1,
      highIntentCount: 1,
    });
  });
});
