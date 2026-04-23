import { describe, expect, it } from "vitest";
import {
  buildBillingHealthPresentation,
  buildCheckoutReadinessPresentation,
  buildPortfolioBillingPresentation,
  buildProjectBillingHeroPresentation,
} from "./billing-presentation";
import type { PortfolioBillingDetail, ProjectBillingDetail } from "./landing-portal";

function makeBillingDetail(overrides: Partial<ProjectBillingDetail> = {}): ProjectBillingDetail {
  return {
    projectId: "project_alpha",
    projectName: "Alpha",
    currency: "INR",
    checkoutPhone: null,
    status: "READY_TO_PAY",
    activeSnapshot: {
      id: "snapshot_alpha",
      sourceType: "PROJECT_PLAN",
      status: "ACTIVE",
      currency: "INR",
      subtotalMinor: 100000,
      discountMinor: 0,
      totalMinor: 100000,
      payableTodayMinor: 50000,
      remainingAfterTodayMinor: 50000,
      offerCodeApplied: null,
      couponCodeApplied: null,
      referralCodeApplied: null,
      operatorAdjustmentMinor: 0,
      validUntil: null,
      lines: [],
    },
    paymentState: {
      canPayNow: true,
      latestCheckoutStatus: null,
      latestPaymentSessionId: null,
      providerOrderId: null,
      amountDueNowMinor: 50000,
      amountPaidMinor: 0,
      outstandingMinor: 100000,
    },
    erpState: null,
    billingHealth: {
      sourceOfTruth: "SNAPSHOT",
      stage: "SNAPSHOT_ONLY",
      tone: "neutral",
      headline: "Snapshot is driving billing",
      detail: "ERP finance documents are not linked yet, so the workspace is still following the approved billing snapshot.",
      lastSyncedAt: "2026-04-08T08:00:00.000Z",
      warnings: [],
    },
    checkoutReadiness: {
      ready: false,
      blockers: [
        {
          code: "MISSING_CHECKOUT_PHONE",
          label: "Add the mobile number that should receive payment options.",
        },
      ],
      notes: [
        "Billing email falls back to the primary workspace owner until a billing contact is added.",
        "Checkout is still using the approved billing snapshot.",
      ],
    },
    contacts: [],
    timeline: [],
    actions: {
      canPayNow: true,
      payNowUrl: null,
      canDownloadQuote: false,
      canDownloadInvoice: false,
      canContactBilling: false,
    },
    ...overrides,
  };
}

describe("buildPortfolioBillingPresentation", () => {
  it("chooses the first payable workspace as the primary payment target", () => {
    const portfolio: PortfolioBillingDetail = {
      summary: {
        totalProjects: 3,
        projectsWithBilling: 3,
        totalQuotedMinor: 400000,
        totalPaidMinor: 100000,
        totalDueNowMinor: 150000,
        totalOutstandingMinor: 300000,
        statusBreakdown: {},
      },
      projects: [
        {
          projectId: "project_alpha",
          projectName: "Alpha",
          projectSlug: "alpha",
          billing: makeBillingDetail(),
        },
        {
          projectId: "project_beta",
          projectName: "Beta",
          projectSlug: "beta",
          billing: makeBillingDetail({
            projectId: "project_beta",
            projectName: "Beta",
            paymentState: {
              canPayNow: true,
              latestCheckoutStatus: null,
              latestPaymentSessionId: null,
              providerOrderId: null,
              amountDueNowMinor: 75000,
              amountPaidMinor: 25000,
              outstandingMinor: 75000,
            },
          }),
        },
        {
          projectId: "project_gamma",
          projectName: "Gamma",
          projectSlug: "gamma",
          billing: makeBillingDetail({
            projectId: "project_gamma",
            projectName: "Gamma",
            status: "PAID",
            paymentState: {
              canPayNow: false,
              latestCheckoutStatus: "PAID",
              latestPaymentSessionId: "ps_paid",
              providerOrderId: "order_paid",
              amountDueNowMinor: 0,
              amountPaidMinor: 100000,
              outstandingMinor: 0,
            },
            actions: {
              canPayNow: false,
              payNowUrl: null,
              canDownloadQuote: true,
              canDownloadInvoice: true,
              canContactBilling: true,
            },
            contacts: [{ email: "billing@example.com", label: "Billing", status: "ACTIVE" }],
            checkoutReadiness: {
              ready: false,
              blockers: [
                {
                  code: "NOTHING_DUE",
                  label: "No payment is due right now.",
                },
              ],
              notes: ["Billing confirmations route through billing@example.com."],
            },
            billingHealth: {
              sourceOfTruth: "ERP",
              stage: "PAID",
              tone: "success",
              headline: "ERP marks this workspace as settled",
              detail: "Invoice ERP-INV-ALPHA is fully paid in ERP.",
              lastSyncedAt: "2026-04-08T08:00:00.000Z",
              warnings: [],
            },
          }),
        },
      ],
    };

    const presentation = buildPortfolioBillingPresentation(portfolio);

    expect(presentation.primaryPayProject?.projectId).toBe("project_alpha");
    expect(presentation.payableProjects).toHaveLength(2);
    expect(presentation.attentionProjects).toHaveLength(0);
    expect(presentation.settledProjects).toHaveLength(1);
    expect(presentation.summaryLabel).toBe("2 workspaces are ready for payment.");
  });

  it("returns a calm no-action summary when nothing is payable", () => {
    const portfolio: PortfolioBillingDetail = {
      summary: {
        totalProjects: 1,
        projectsWithBilling: 1,
        totalQuotedMinor: 100000,
        totalPaidMinor: 100000,
        totalDueNowMinor: 0,
        totalOutstandingMinor: 0,
        statusBreakdown: {},
      },
      projects: [
        {
          projectId: "project_paid",
          projectName: "Paid",
          projectSlug: "paid",
          billing: makeBillingDetail({
            status: "PAID",
            paymentState: {
              canPayNow: false,
              latestCheckoutStatus: "PAID",
              latestPaymentSessionId: "ps_paid",
              providerOrderId: "order_paid",
              amountDueNowMinor: 0,
              amountPaidMinor: 100000,
              outstandingMinor: 0,
            },
            actions: {
              canPayNow: false,
              payNowUrl: null,
              canDownloadQuote: true,
              canDownloadInvoice: true,
              canContactBilling: true,
            },
            checkoutReadiness: {
              ready: false,
              blockers: [
                {
                  code: "NOTHING_DUE",
                  label: "No payment is due right now.",
                },
              ],
              notes: ["Billing is settled."],
            },
            billingHealth: {
              sourceOfTruth: "ERP",
              stage: "PAID",
              tone: "success",
              headline: "ERP marks this workspace as settled",
              detail: "ERP shows no remaining outstanding balance for this workspace.",
              lastSyncedAt: "2026-04-08T08:00:00.000Z",
              warnings: [],
            },
          }),
        },
      ],
    };

    const presentation = buildPortfolioBillingPresentation(portfolio);

    expect(presentation.primaryPayProject).toBeNull();
    expect(presentation.summaryLabel).toBe("No billing action required right now.");
  });

  it("places blocked workspaces into the finance attention lane", () => {
    const blockedBilling = makeBillingDetail({
      status: "READY_TO_PAY",
      actions: {
        canPayNow: false,
        payNowUrl: null,
        canDownloadQuote: false,
        canDownloadInvoice: false,
        canContactBilling: false,
      },
      billingHealth: {
        sourceOfTruth: "SNAPSHOT",
        stage: "SYNC_BLOCKED",
        tone: "warning",
        headline: "ERP sync needs attention",
        detail: "Finance references exist, but the latest ERP state could not be refreshed.",
        lastSyncedAt: "2026-04-08T08:00:00.000Z",
        warnings: ["ERP finance sync could not be refreshed."],
      },
      checkoutReadiness: {
        ready: false,
        blockers: [
          {
            code: "MISSING_CHECKOUT_PHONE",
            label: "Add the mobile number that should receive payment options.",
          },
        ],
        notes: [],
      },
    });

    const portfolio: PortfolioBillingDetail = {
      summary: {
        totalProjects: 1,
        projectsWithBilling: 1,
        totalQuotedMinor: 100000,
        totalPaidMinor: 0,
        totalDueNowMinor: 50000,
        totalOutstandingMinor: 100000,
        statusBreakdown: {},
      },
      projects: [
        {
          projectId: "project_alpha",
          projectName: "Alpha",
          projectSlug: "alpha",
          billing: blockedBilling,
        },
      ],
    };

    const presentation = buildPortfolioBillingPresentation(portfolio);

    expect(presentation.payableProjects).toHaveLength(0);
    expect(presentation.attentionProjects).toHaveLength(1);
    expect(presentation.attentionProjects[0]?.blockerLabel).toContain("mobile number");
    expect(presentation.summaryLabel).toContain("needs finance attention");
  });
});

describe("buildProjectBillingHeroPresentation", () => {
  it("explains the owner-email fallback when no billing contact is configured", () => {
    const presentation = buildProjectBillingHeroPresentation(makeBillingDetail());

    expect(presentation.showPayButton).toBe(true);
    expect(presentation.ctaLabel).toBe("Add mobile number for checkout");
    expect(presentation.helperText).toContain("mobile number");
  });

  it("switches to a remaining-balance label once a partial payment exists", () => {
    const presentation = buildProjectBillingHeroPresentation(
      makeBillingDetail({
        checkoutPhone: "919876543210",
        status: "PARTIALLY_PAID",
        contacts: [{ email: "billing@example.com", label: "Billing", status: "ACTIVE" }],
        paymentState: {
          canPayNow: true,
          latestCheckoutStatus: "PAID_PARTIAL",
          latestPaymentSessionId: "ps_partial",
          providerOrderId: "order_partial",
          amountDueNowMinor: 25000,
          amountPaidMinor: 25000,
          outstandingMinor: 25000,
        },
        checkoutReadiness: {
          ready: true,
          blockers: [],
          notes: ["Billing confirmations route through billing@example.com."],
        },
      }),
    );

    expect(presentation.ctaLabel).toBe("Pay remaining balance");
    expect(presentation.helperText).toContain("approved billing snapshot");
  });
});

describe("billing support presentations", () => {
  it("summarizes ERP-linked health in client-safe language", () => {
    const presentation = buildBillingHealthPresentation(
      makeBillingDetail({
        billingHealth: {
          sourceOfTruth: "ERP",
          stage: "INVOICE_LINKED",
          tone: "success",
          headline: "ERP invoice is driving the current due amount",
          detail: "Outstanding is synced from invoice ERP-INV-ALPHA.",
          lastSyncedAt: "2026-04-08T08:00:00.000Z",
          warnings: [],
        },
      }),
    );

    expect(presentation.label).toContain("ERP invoice");
    expect(presentation.tone).toBe("success");
  });

  it("surfaces readiness blockers when checkout cannot proceed", () => {
    const presentation = buildCheckoutReadinessPresentation(makeBillingDetail());

    expect(presentation.label).toBe("Action needed before payment");
    expect(presentation.tone).toBe("warning");
    expect(presentation.blockers[0]).toContain("mobile number");
  });
});
