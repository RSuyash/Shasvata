import { describe, expect, it } from "vitest";
import { buildProjectBillingDetail } from "./billing-projection.js";
import type {
  BillingCheckoutStateRecord,
  BillingDocumentLinkRecord,
  BillingErpReadState,
  BillingSnapshotRecord,
} from "./project-billing-types.js";

function makeSnapshot(
  overrides: Partial<BillingSnapshotRecord> = {},
): BillingSnapshotRecord {
  return {
    id: "snapshot_alpha",
    projectId: "project_alpha",
    cartId: "cart_alpha",
    sourceType: "PROJECT_PLAN",
    status: "ACTIVE",
    currency: "INR",
    subtotalMinor: 100_000,
    discountMinor: 0,
    totalMinor: 100_000,
    payableTodayMinor: 50_000,
    remainingAfterTodayMinor: 50_000,
    offerCodeApplied: null,
    couponCodeApplied: null,
    referralCodeApplied: null,
    operatorAdjustmentMinor: 0,
    approvedByUserId: "user_alpha",
    approvalReason: null,
    validUntil: new Date("2026-04-30T00:00:00.000Z"),
    snapshotJson: {
      paymentMode: "DEPOSIT",
      appliedOfferCodes: [],
      issues: [],
      lines: [],
    },
    createdAt: new Date("2026-04-08T08:00:00.000Z"),
    updatedAt: new Date("2026-04-08T08:00:00.000Z"),
    ...overrides,
  };
}

function makeCheckout(
  overrides: Partial<BillingCheckoutStateRecord> = {},
): BillingCheckoutStateRecord {
  return {
    id: "checkout_alpha",
    status: "CREATED",
    amountMinor: 50_000,
    currency: "INR",
    paymentSessionId: "ps_alpha",
    providerOrderId: "order_alpha",
    hostedCheckoutUrl: "https://payments.example.com/alpha",
    createdAt: new Date("2026-04-08T09:00:00.000Z"),
    updatedAt: new Date("2026-04-08T09:00:00.000Z"),
    ...overrides,
  };
}

function makeDocumentLink(
  overrides: Partial<BillingDocumentLinkRecord> = {},
): BillingDocumentLinkRecord {
  return {
    id: "link_alpha",
    billingSnapshotId: "snapshot_alpha",
    erpQuotationId: null,
    erpSalesOrderId: null,
    erpInvoiceId: null,
    erpPaymentEntryIds: [],
    quoteRequestId: null,
    checkoutSessionId: "checkout_alpha",
    providerOrderId: "order_alpha",
    paymentSessionId: "ps_alpha",
    createdAt: new Date("2026-04-08T09:00:00.000Z"),
    updatedAt: new Date("2026-04-08T09:00:00.000Z"),
    ...overrides,
  };
}

function makeErpState(
  overrides: Partial<BillingErpReadState> = {},
): BillingErpReadState {
  return {
    erpCustomerId: "ERP-CUST-ALPHA",
    quotationId: "ERP-QUO-ALPHA",
    salesOrderId: "ERP-SO-ALPHA",
    invoiceId: "ERP-INV-ALPHA",
    paymentEntryIds: [],
    latestInvoiceStatus: "Unpaid",
    latestInvoiceOutstandingMinor: 75_000,
    syncStatus: "SYNCED",
    ...overrides,
  };
}

describe("buildProjectBillingDetail", () => {
  it("treats the snapshot as the finance source when ERP is not linked", () => {
    const detail = buildProjectBillingDetail({
      projectId: "project_alpha",
      projectName: "Alpha",
      currency: "INR",
      checkoutPhone: "919876543210",
      snapshot: makeSnapshot(),
      checkout: makeCheckout(),
      documentLink: makeDocumentLink(),
      erpState: null,
      contacts: [],
    });

    expect(detail.billingHealth.sourceOfTruth).toBe("SNAPSHOT");
    expect(detail.billingHealth.stage).toBe("SNAPSHOT_ONLY");
    expect(detail.billingHealth.headline).toContain("Snapshot");
    expect(detail.checkoutReadiness.ready).toBe(true);
  });

  it("switches to ERP as the source of truth when invoice outstanding is readable", () => {
    const detail = buildProjectBillingDetail({
      projectId: "project_alpha",
      projectName: "Alpha",
      currency: "INR",
      checkoutPhone: "919876543210",
      snapshot: makeSnapshot(),
      checkout: makeCheckout(),
      documentLink: makeDocumentLink({
        erpQuotationId: "ERP-QUO-ALPHA",
        erpSalesOrderId: "ERP-SO-ALPHA",
        erpInvoiceId: "ERP-INV-ALPHA",
      }),
      erpState: makeErpState(),
      contacts: [{ email: "billing@example.com", label: "Billing", status: "ACTIVE" }],
    });

    expect(detail.billingHealth.sourceOfTruth).toBe("ERP");
    expect(detail.billingHealth.stage).toBe("INVOICE_LINKED");
    expect(detail.billingHealth.detail).toContain("ERP-INV-ALPHA");
    expect(detail.checkoutReadiness.notes).toContain(
      "The current due amount is synced from ERP finance state.",
    );
  });

  it("blocks checkout readiness when the payment phone is missing", () => {
    const detail = buildProjectBillingDetail({
      projectId: "project_alpha",
      projectName: "Alpha",
      currency: "INR",
      checkoutPhone: null,
      snapshot: makeSnapshot(),
      checkout: makeCheckout(),
      documentLink: makeDocumentLink(),
      erpState: null,
      contacts: [],
    });

    expect(detail.actions.canPayNow).toBe(false);
    expect(detail.checkoutReadiness.ready).toBe(false);
    expect(detail.checkoutReadiness.blockers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "MISSING_CHECKOUT_PHONE" }),
      ]),
    );
  });

  it("marks the billing health as sync blocked when ERP refresh fails", () => {
    const detail = buildProjectBillingDetail({
      projectId: "project_alpha",
      projectName: "Alpha",
      currency: "INR",
      checkoutPhone: "919876543210",
      snapshot: makeSnapshot(),
      checkout: makeCheckout({
        status: "PAID",
      }),
      documentLink: makeDocumentLink({
        erpQuotationId: "ERP-QUO-ALPHA",
        checkoutSessionId: "checkout_alpha",
      }),
      erpState: makeErpState({
        invoiceId: null,
        latestInvoiceOutstandingMinor: null,
        syncStatus: "FAILED",
      }),
      contacts: [],
    });

    expect(detail.billingHealth.stage).toBe("SYNC_BLOCKED");
    expect(detail.billingHealth.tone).toBe("warning");
    expect(detail.billingHealth.warnings).toContain(
      "ERP finance sync could not be refreshed.",
    );
    expect(detail.checkoutReadiness.notes).toContain(
      "ERP sync still needs attention, but the workspace billing record remains visible.",
    );
  });
});
