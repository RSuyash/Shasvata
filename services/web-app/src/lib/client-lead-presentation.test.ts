import { describe, expect, it } from "vitest";
import type { ProjectLead } from "./landing-portal";
import {
  buildLeadDownloadActions,
  buildLeadNeedLabel,
  buildLeadRowActions,
  buildLeadSourceLabel,
} from "./client-lead-presentation";

function makeLead(overrides: Partial<ProjectLead> = {}): ProjectLead {
  return {
    id: "lead-1",
    projectId: "project-1",
    sourceLeadId: null,
    fullName: "Aarya Singh",
    email: "aarya@example.com",
    phone: "+91-9876543210",
    companyName: "Agri Ops",
    message: "Interested in launch support.",
    consent: true,
    sourcePage: "https://wagholihighstreet.in/?utm_source=meta",
    sourceCta: "lead-wizard",
    utmSource: "meta",
    utmMedium: "paid-social",
    utmCampaign: "wagholi-q2",
    utmContent: null,
    utmTerm: null,
    gclid: null,
    gbraid: null,
    wbraid: null,
    sourceKind: "WEB_FORM",
    connectorId: null,
    sourceConnectorLabel: null,
    campaignId: null,
    campaignName: null,
    importBatchId: null,
    importBatchLabel: null,
    externalLeadId: null,
    capturedAt: null,
    notificationStatus: "NOTIFIED",
    notificationError: null,
    syncStatus: "SYNCED",
    syncError: null,
    visibilityState: "VISIBLE",
    hiddenAt: null,
    hiddenByPortalUserId: null,
    hiddenByUserEmail: null,
    hiddenByUserFullName: null,
    hiddenReasonCode: null,
    hiddenReasonNote: null,
    lastRestoredAt: null,
    lastRestoredByPortalUserId: null,
    lastRestoredByUserEmail: null,
    lastRestoredByUserFullName: null,
    sourceHost: "wagholihighstreet.in",
    serviceInterest: ["premium_shop"],
    budgetRange: "50_75_lakhs",
    timeline: "within_30_days",
    problemSummary: "Space: Premium Shop. Budget: 50-75 Lakhs.",
    interestLabel: "Premium Shop",
    budgetLabel: "50 75 Lakhs",
    touchpointLabel: "Lead Wizard",
    isInternalTest: false,
    auditEvents: [],
    createdAt: "2026-03-29T12:00:00.000Z",
    ...overrides,
  };
}

describe("client lead presentation", () => {
  it("builds a readable need label from the richest lead fields", () => {
    expect(buildLeadNeedLabel(makeLead())).toBe(
      "Premium Shop | 50 75 Lakhs | within_30_days",
    );
    expect(
      buildLeadNeedLabel(
        makeLead({
          interestLabel: null,
          budgetLabel: null,
          timeline: null,
        }),
      ),
    ).toBe("Space: Premium Shop. Budget: 50-75 Lakhs.");
  });

  it("builds a readable source label from touchpoint and UTM data", () => {
    expect(buildLeadSourceLabel(makeLead())).toBe(
      "Lead Wizard | meta | paid-social | wagholi-q2",
    );
    expect(
      buildLeadSourceLabel(
        makeLead({
          touchpointLabel: null,
          utmSource: null,
          utmMedium: null,
          utmCampaign: null,
        }),
      ),
    ).toBe("wagholihighstreet.in");
    expect(
      buildLeadSourceLabel(
        makeLead({
          sourceKind: "CSV_IMPORT",
          sourceConnectorLabel: "CSV Import",
          campaignName: "Spring Launch",
          touchpointLabel: null,
        }),
      ),
    ).toBe("Spring Launch | CSV Import");
  });

  it("exposes only actionable row actions that actually work today", () => {
    expect(buildLeadRowActions(makeLead())).toEqual([
      { label: "Email lead", href: "mailto:aarya@example.com" },
      { label: "Call lead", href: "tel:+91-9876543210" },
      {
        label: "Open source page",
        href: "https://wagholihighstreet.in/?utm_source=meta",
        external: true,
      },
    ]);
  });

  it("builds download actions for basic and full exports", () => {
    expect(buildLeadDownloadActions("project-1")).toEqual([
      {
        label: "Download Excel",
        href: "http://localhost:3001/api/landing/portal/projects/project-1/leads/export.xlsx",
      },
      {
        label: "Download Full Excel",
        href: "http://localhost:3001/api/landing/portal/projects/project-1/leads/export.xlsx?mode=full",
      },
      {
        label: "Download Full CSV",
        href: "http://localhost:3001/api/landing/portal/projects/project-1/leads/export.csv?mode=full",
      },
    ]);
  });
});
