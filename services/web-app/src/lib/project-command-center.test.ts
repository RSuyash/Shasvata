import { describe, expect, it } from "vitest";
import { buildProjectCommandCenter } from "./project-command-center";
import type { ProjectBillingDetail, ProjectDetail, ProjectLead } from "./landing-portal";
import { ROUTES } from "./routes";

function makeProjectDetail(overrides: Partial<ProjectDetail> = {}): ProjectDetail {
  return {
    id: "project-1",
    slug: "topaz-towers",
    name: "Topaz Towers",
    status: "ACTIVE",
    publicLeadKey: "lead_key_topaz",
    portalView: "CLIENT",
    primaryDomain: "topaz.example.com",
    clientCompanyName: "Aakar Realties",
    description: "Premium real-estate landing workspace.",
    notes: "Review the live build and keep billing clear for the client team.",
    goLiveAt: "2026-04-08T10:30:00.000Z",
    membershipRole: "OWNER",
    leadCount: 12,
    sites: [
      {
        id: "site-1",
        projectId: "project-1",
        slug: "topaz-main",
        templateKey: "luxury-real-estate",
        themeKey: "stone-sand",
        sourceProvider: "GIT_REPOSITORY",
        repoUrl: "https://github.com/RSuyash/aakar-realities",
        repoBranch: "production",
        repoRef: "refs/heads/production",
        deployedCommit: "abc123",
        runtimeProfile: "STATIC_ARTIFACT",
        operatorNotes: null,
        ga4MeasurementId: "G-TEST12345",
        googleAdsTagId: "AW-18098571219",
        googleAdsConversionMode: "GA4_IMPORTED",
        googleAdsLeadConversionLabel: "topazLeadPrimary_01",
        gtmContainerId: "GTM-TEST123",
        metaPixelId: null,
        trackingNotes: "Client only needs GA4 and GTM right now.",
        publishStatus: "PUBLISHED",
        lastPublishedAt: "2026-04-08T09:30:00.000Z",
        previewHost: "topaz.preview.shasvata.com",
        latestPreviewPath: "https://topaz.preview.shasvata.com",
      },
    ],
    domains: [
      {
        id: "domain-1",
        projectId: "project-1",
        siteId: "site-1",
        host: "topaz.example.com",
        status: "ACTIVE",
        isPrimary: true,
        dnsTarget: "cname.naya.app",
        verifiedAt: "2026-04-08T09:00:00.000Z",
      },
    ],
    syncTargets: [],
    members: [
      {
        portalUserId: "owner-1",
        email: "bipin@example.com",
        fullName: "Bipin",
        role: "OWNER",
        status: "ACTIVE",
      },
      {
        portalUserId: "viewer-1",
        email: "team@example.com",
        fullName: "Team Viewer",
        role: "VIEWER",
        status: "ACTIVE",
      },
    ],
    leadNotificationRecipients: [],
    sourceSummary: {
      siteId: "site-1",
      provider: "GIT_REPOSITORY",
      repoUrl: "https://github.com/RSuyash/aakar-realities",
      repoBranch: "production",
      repoRef: "refs/heads/production",
      deployedCommit: "abc123",
      runtimeProfile: "STATIC_ARTIFACT",
      operatorNotes: null,
      previewHost: "topaz.preview.shasvata.com",
    },
    previewUrl: "https://topaz.preview.shasvata.com",
    liveUrl: "https://topaz.example.com",
    billingSummary: {
      billingContactEmails: ["billing@topaz.example.com"],
      cartCount: 1,
      totalQuotedMinor: 1799900,
      totalPayableTodayMinor: 899900,
      latestCartId: "cart-1",
      latestCartStatus: "READY_TO_PAY",
      latestQuoteRequestStatus: "APPROVED",
      latestCheckoutStatus: "OPEN",
      latestPaymentSessionId: "ps-1",
      latestProviderOrderId: "order-1",
      latestErpQuotationId: "QTN-1",
      latestErpSalesOrderId: "SO-1",
      latestErpCustomerId: "CUST-1",
      latestUpdatedAt: "2026-04-09T09:00:00.000Z",
    },
    ...overrides,
  };
}

function makeLead(overrides: Partial<ProjectLead> = {}): ProjectLead {
  return {
    id: "lead-1",
    projectId: "project-1",
    sourceLeadId: "submission-1",
    fullName: "Ananya Mehta",
    email: "ananya@example.com",
    phone: "+91 9876543210",
    companyName: "Investor Circle",
    message: "Need a call back about the launch offer.",
    consent: true,
    sourcePage: "https://topaz.example.com",
    sourceCta: "Hero form",
    utmSource: "google",
    utmMedium: "cpc",
    utmCampaign: "launch-phase-1",
    utmContent: null,
    utmTerm: null,
    gclid: null,
    gbraid: null,
    wbraid: null,
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
    sourceHost: "topaz.example.com",
    serviceInterest: ["landing-page"],
    budgetRange: "premium",
    timeline: "this-month",
    problemSummary: "Wants complete campaign-ready launch page.",
    interestLabel: "Landing page",
    budgetLabel: "Premium",
    touchpointLabel: "Hero form",
    isInternalTest: false,
    auditEvents: [],
    createdAt: "2026-04-10T06:30:00.000Z",
    ...overrides,
  };
}

function makeProjectBillingDetail(
  overrides: Partial<ProjectBillingDetail> = {},
): ProjectBillingDetail {
  return {
    projectId: "project-1",
    projectName: "Topaz Towers",
    currency: "INR",
    checkoutPhone: "919876543210",
    status: "READY_TO_PAY",
    activeSnapshot: {
      id: "snapshot-1",
      sourceType: "PROJECT_PLAN",
      status: "ACTIVE",
      currency: "INR",
      subtotalMinor: 299900,
      discountMinor: 0,
      totalMinor: 299900,
      payableTodayMinor: 299900,
      remainingAfterTodayMinor: 0,
      offerCodeApplied: null,
      couponCodeApplied: null,
      referralCodeApplied: null,
      operatorAdjustmentMinor: 0,
      validUntil: null,
      lines: [],
    },
    paymentState: {
      canPayNow: true,
      latestCheckoutStatus: "CREATED",
      latestPaymentSessionId: "ps-1",
      providerOrderId: "order-1",
      amountDueNowMinor: 299900,
      amountPaidMinor: 0,
      outstandingMinor: 299900,
    },
    erpState: null,
    billingHealth: {
      sourceOfTruth: "SNAPSHOT",
      stage: "SNAPSHOT_ONLY",
      tone: "neutral",
      headline: "Snapshot is driving billing",
      detail:
        "ERP finance documents are not linked yet, so the workspace is still following the approved billing snapshot.",
      lastSyncedAt: "2026-04-09T09:30:00.000Z",
      warnings: [],
    },
    checkoutReadiness: {
      ready: true,
      blockers: [],
      notes: ["Checkout is still using the approved billing snapshot."],
    },
    contacts: [
      {
        email: "bipin@example.com",
        label: "Primary billing",
        status: "ACTIVE",
      },
    ],
    timeline: [],
    actions: {
      canPayNow: true,
      payNowUrl: null,
      canDownloadQuote: false,
      canDownloadInvoice: false,
      canContactBilling: true,
    },
    ...overrides,
  };
}

describe("buildProjectCommandCenter", () => {
  it("prioritizes billing when money is due now", () => {
    const model = buildProjectCommandCenter(makeProjectDetail(), [makeLead()]);

    expect(model.hero.nextStepLabel).toBe("Review billing");
    expect(model.hero.primaryAction).toMatchObject({
      href: ROUTES.dashboard.projectBilling("project-1"),
      label: "Review billing",
    });
    expect(model.cards.billing.value).toBe("₹8,999.00");
  });

  it("falls back to the live site when there is no payment due", () => {
    const project = makeProjectDetail({
      billingSummary: {
        ...makeProjectDetail().billingSummary,
        totalPayableTodayMinor: 0,
        latestCartStatus: "PAID",
      },
    });

    const model = buildProjectCommandCenter(project, [makeLead()]);

    expect(model.hero.primaryAction).toMatchObject({
      href: "https://topaz.example.com",
      label: "Open live site",
    });
    expect(model.hero.nextStepLabel).toBe("Open live site");
  });

  it("reports tracking readiness from stored provider IDs", () => {
    const model = buildProjectCommandCenter(makeProjectDetail(), [makeLead()]);

    expect(model.cards.tracking.value).toBe("3 of 4");
    expect(model.cards.tracking.detail).toContain("GA4, Google Ads, and GTM");
    expect(model.cards.tracking.href).toBe(ROUTES.dashboard.projectAnalytics("project-1"));
  });

  it("builds a recent timeline sorted by newest activity first", () => {
    const model = buildProjectCommandCenter(makeProjectDetail(), [makeLead()]);

    expect(model.timeline.map((item) => item.label)).toEqual([
      "Latest lead captured",
      "Billing updated",
      "Go-live updated",
    ]);
  });

  it("uses leads as the next step when billing is clear and no site is live", () => {
    const project = makeProjectDetail({
      liveUrl: null,
      primaryDomain: null,
      previewUrl: null,
      sites: [
        {
          ...makeProjectDetail().sites[0],
          latestPreviewPath: null,
          previewHost: null,
          publishStatus: "DRAFT",
        },
      ],
      domains: [],
      billingSummary: {
        ...makeProjectDetail().billingSummary,
        totalPayableTodayMinor: 0,
        latestCartStatus: "PAID",
      },
    });

    const model = buildProjectCommandCenter(project, [makeLead()]);

    expect(model.hero.primaryAction).toMatchObject({
      href: ROUTES.dashboard.projectLeads("project-1"),
      label: "Review leads",
    });
  });

  it("prefers canonical billing detail over stale project aggregates", () => {
    const project = makeProjectDetail({
      billingSummary: {
        ...makeProjectDetail().billingSummary,
        totalQuotedMinor: 9589500,
        totalPayableTodayMinor: 9589500,
        billingContactEmails: ["stale-billing@example.com"],
        latestCheckoutStatus: "OPEN",
        latestCartStatus: "READY_TO_PAY",
        latestUpdatedAt: "2026-04-01T09:00:00.000Z",
      },
    });

    const billing = makeProjectBillingDetail({
      activeSnapshot: {
        ...makeProjectBillingDetail().activeSnapshot!,
        totalMinor: 299900,
        payableTodayMinor: 299900,
      },
      paymentState: {
        ...makeProjectBillingDetail().paymentState,
        amountDueNowMinor: 299900,
        outstandingMinor: 299900,
      },
      contacts: [
        {
          email: "bipin@example.com",
          label: "Primary billing",
          status: "ACTIVE",
        },
      ],
      billingHealth: {
        ...makeProjectBillingDetail().billingHealth,
        lastSyncedAt: "2026-04-09T09:30:00.000Z",
      },
    });

    const model = buildProjectCommandCenter(project, [makeLead()], billing);

    expect(model.hero.nextStepLabel).toBe("Review billing");
    expect(model.cards.billing.value).toBe("₹2,999.00");
    expect(model.cards.billing.detail).toBe("Ready for payment in the billing workspace.");
    expect(model.billing.dueLabel).toBe("₹2,999.00");
    expect(model.billing.contactLabel).toBe("bipin@example.com");
    expect(model.timeline.find((item) => item.label === "Billing updated")?.detail).toContain(
      "₹2,999.00",
    );
  });
});
