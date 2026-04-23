import type {
  BillingHealth,
  BillingCheckoutStateRecord,
  BillingContactView,
  BillingDocumentLinkRecord,
  BillingErpReadState,
  BillingPaymentState,
  BillingSnapshotRecord,
  BillingSnapshotView,
  BillingTimelineEvent,
  CheckoutReadiness,
  ProjectBillingDetail,
} from "./project-billing-types.js";

function toSnapshotView(snapshot: BillingSnapshotRecord | null): BillingSnapshotView | null {
  if (!snapshot) {
    return null;
  }

  return {
    id: snapshot.id,
    sourceType: snapshot.sourceType,
    status: snapshot.status,
    currency: snapshot.currency,
    subtotalMinor: snapshot.subtotalMinor,
    discountMinor: snapshot.discountMinor,
    totalMinor: snapshot.totalMinor,
    payableTodayMinor: snapshot.payableTodayMinor,
    remainingAfterTodayMinor: snapshot.remainingAfterTodayMinor,
    offerCodeApplied: snapshot.offerCodeApplied,
    couponCodeApplied: snapshot.couponCodeApplied,
    referralCodeApplied: snapshot.referralCodeApplied,
    operatorAdjustmentMinor: snapshot.operatorAdjustmentMinor,
    validUntil: snapshot.validUntil,
    lines: snapshot.snapshotJson.lines,
  };
}

function buildPaymentState(input: {
  snapshot: BillingSnapshotRecord | null;
  checkout: BillingCheckoutStateRecord | null;
  documentLink: BillingDocumentLinkRecord | null;
  erpState: BillingErpReadState | null;
}): BillingPaymentState {
  if (!input.snapshot) {
    return {
      canPayNow: false,
      latestCheckoutStatus: null,
      latestPaymentSessionId: null,
      providerOrderId: null,
      amountDueNowMinor: 0,
      amountPaidMinor: 0,
      outstandingMinor: 0,
    };
  }

  const invoiceOutstandingMinor =
    input.erpState?.latestInvoiceOutstandingMinor ?? null;
  const amountPaidMinor =
    invoiceOutstandingMinor !== null
      ? Math.max(0, input.snapshot.totalMinor - invoiceOutstandingMinor)
      : input.checkout?.status === "PAID"
        ? input.snapshot.payableTodayMinor
        : 0;
  const outstandingMinor =
    invoiceOutstandingMinor !== null
      ? invoiceOutstandingMinor
      : Math.max(0, input.snapshot.totalMinor - amountPaidMinor);
  const amountDueNowMinor =
    amountPaidMinor > 0
      ? outstandingMinor
      : Math.min(outstandingMinor, input.snapshot.payableTodayMinor || outstandingMinor);

  return {
    canPayNow: outstandingMinor > 0,
    latestCheckoutStatus: input.checkout?.status ?? null,
    latestPaymentSessionId:
      input.checkout?.paymentSessionId ??
      input.documentLink?.paymentSessionId ??
      null,
    providerOrderId:
      input.checkout?.providerOrderId ??
      input.documentLink?.providerOrderId ??
      null,
    amountDueNowMinor,
    amountPaidMinor,
    outstandingMinor,
  };
}

function buildStatus(input: {
  snapshot: BillingSnapshotRecord | null;
  paymentState: BillingPaymentState;
}): ProjectBillingDetail["status"] {
  if (!input.snapshot) {
    return "NO_BILLING";
  }

  if (input.snapshot.status === "DRAFT") {
    return "DRAFT";
  }

  if (input.paymentState.outstandingMinor <= 0) {
    return "PAID";
  }

  if (input.paymentState.amountPaidMinor > 0) {
    return "PARTIALLY_PAID";
  }

  return "READY_TO_PAY";
}

function buildBillingHealth(input: {
  snapshot: BillingSnapshotRecord | null;
  checkout: BillingCheckoutStateRecord | null;
  documentLink: BillingDocumentLinkRecord | null;
  erpState: BillingErpReadState | null;
}): BillingHealth {
  if (!input.snapshot) {
    return {
      sourceOfTruth: "SNAPSHOT",
      stage: "SNAPSHOT_ONLY",
      tone: "neutral",
      headline: "Billing snapshot pending",
      detail:
        "Naya has not prepared the active commercial snapshot for this workspace yet.",
      lastSyncedAt: null,
      warnings: [],
    };
  }

  const lastSyncedAt = input.documentLink?.updatedAt ?? input.snapshot.updatedAt;
  const warnings: string[] = [];

  if (!input.erpState) {
    if (input.checkout?.status === "PAID") {
      warnings.push("Payment activity exists, but ERP finance documents are not linked yet.");
    }

    return {
      sourceOfTruth: "SNAPSHOT",
      stage: "SNAPSHOT_ONLY",
      tone: warnings.length ? "warning" : "neutral",
      headline: "Snapshot is driving billing",
      detail:
        "ERP finance documents are not linked yet, so the workspace is still following the approved billing snapshot.",
      lastSyncedAt,
      warnings,
    };
  }

  if (input.erpState.syncStatus === "FAILED") {
    warnings.push("ERP finance sync could not be refreshed.");

    return {
      sourceOfTruth: "SNAPSHOT",
      stage: "SYNC_BLOCKED",
      tone: "warning",
      headline: "ERP sync needs attention",
      detail:
        "Finance references exist, but the latest ERP state could not be refreshed. Checkout is still falling back to the approved billing snapshot.",
      lastSyncedAt,
      warnings,
    };
  }

  const hasInvoiceAmount = input.erpState.latestInvoiceOutstandingMinor !== null;
  const sourceOfTruth = hasInvoiceAmount ? "ERP" : "SNAPSHOT";
  const invoiceOutstandingMinor = input.erpState.latestInvoiceOutstandingMinor;

  if (
    invoiceOutstandingMinor !== null &&
    invoiceOutstandingMinor > input.snapshot.totalMinor
  ) {
    warnings.push("ERP invoice outstanding is higher than the active snapshot total.");
  }

  if (input.checkout?.status === "PAID" && !input.erpState.invoiceId) {
    warnings.push("Checkout shows payment activity, but an ERP invoice is not linked yet.");
  }

  if (invoiceOutstandingMinor !== null && invoiceOutstandingMinor <= 0) {
    return {
      sourceOfTruth: "ERP",
      stage: "PAID",
      tone: warnings.length ? "warning" : "success",
      headline: "ERP marks this workspace as settled",
      detail:
        input.erpState.invoiceId
          ? `Invoice ${input.erpState.invoiceId} is fully paid in ERP.`
          : "ERP shows no remaining outstanding balance for this workspace.",
      lastSyncedAt,
      warnings,
    };
  }

  if (input.erpState.invoiceId) {
    return {
      sourceOfTruth,
      stage: "INVOICE_LINKED",
      tone: warnings.length ? "warning" : hasInvoiceAmount ? "success" : "neutral",
      headline: hasInvoiceAmount
        ? "ERP invoice is driving the current due amount"
        : "Invoice is linked and waiting for a full ERP refresh",
      detail: hasInvoiceAmount
        ? `Outstanding is synced from invoice ${input.erpState.invoiceId}.`
        : `Invoice ${input.erpState.invoiceId} is linked, but the portal is still using the approved snapshot until ERP outstanding is readable.`,
      lastSyncedAt,
      warnings,
    };
  }

  if (input.erpState.salesOrderId) {
    return {
      sourceOfTruth,
      stage: "ORDER_LINKED",
      tone: "neutral",
      headline: "Sales order is linked",
      detail:
        "ERP sales order references are connected, while checkout still follows the approved billing snapshot until invoicing is ready.",
      lastSyncedAt,
      warnings,
    };
  }

  if (input.erpState.quotationId) {
    return {
      sourceOfTruth,
      stage: "QUOTED",
      tone: "neutral",
      headline: "ERP quotation is linked",
      detail:
        "The quotation is visible in ERP, but billing is still following the active snapshot until order and invoice records are created.",
      lastSyncedAt,
      warnings,
    };
  }

  return {
    sourceOfTruth,
    stage: "SNAPSHOT_ONLY",
    tone: warnings.length ? "warning" : "neutral",
    headline: "Snapshot is driving billing",
    detail:
      "ERP finance linking has started, but no usable commercial document is available yet.",
    lastSyncedAt,
    warnings,
  };
}

function buildCheckoutReadiness(input: {
  snapshot: BillingSnapshotRecord | null;
  checkoutPhone: string | null;
  paymentState: BillingPaymentState;
  contacts: BillingContactView[];
  billingHealth: BillingHealth;
}): CheckoutReadiness {
  const blockers: CheckoutReadiness["blockers"] = [];
  const notes: string[] = [];

  if (!input.snapshot) {
    blockers.push({
      code: "MISSING_SNAPSHOT",
      label: "Billing snapshot is not prepared yet.",
    });
  } else if (input.snapshot.status !== "ACTIVE" && input.snapshot.status !== "SYNCED_TO_ERP") {
    blockers.push({
      code: "SNAPSHOT_NOT_ACTIVE",
      label: "Billing snapshot is not active yet.",
    });
  }

  if (!input.checkoutPhone && input.paymentState.outstandingMinor > 0) {
    blockers.push({
      code: "MISSING_CHECKOUT_PHONE",
      label: "Add the mobile number that should receive payment options.",
    });
  }

  if (input.paymentState.outstandingMinor <= 0) {
    blockers.push({
      code: "NOTHING_DUE",
      label: "No payment is due right now.",
    });
  }

  if (input.contacts[0]?.email) {
    notes.push(`Billing confirmations route through ${input.contacts[0].email}.`);
  } else if (input.paymentState.outstandingMinor > 0) {
    notes.push("Billing email falls back to the primary workspace owner until a billing contact is added.");
  }

  if (input.billingHealth.sourceOfTruth === "ERP") {
    notes.push("The current due amount is synced from ERP finance state.");
  } else if (input.snapshot && input.paymentState.outstandingMinor > 0) {
    notes.push("Checkout is still using the approved billing snapshot.");
  }

  if (input.billingHealth.stage === "SYNC_BLOCKED") {
    notes.push("ERP sync still needs attention, but the workspace billing record remains visible.");
  }

  return {
    ready:
      blockers.length === 0 &&
      input.paymentState.canPayNow &&
      input.paymentState.amountDueNowMinor > 0,
    blockers,
    notes,
  };
}

function buildTimeline(input: {
  snapshot: BillingSnapshotRecord | null;
  documentLink: BillingDocumentLinkRecord | null;
  checkout: BillingCheckoutStateRecord | null;
  erpState: BillingErpReadState | null;
}): BillingTimelineEvent[] {
  const events: BillingTimelineEvent[] = [];

  if (input.snapshot) {
    events.push({
      kind: "SNAPSHOT_CREATED",
      label: "Commercial snapshot created",
      occurredAt: input.snapshot.createdAt,
      meta: {
        sourceType: input.snapshot.sourceType,
        status: input.snapshot.status,
      },
    });
  }

  if (input.documentLink?.erpQuotationId) {
    events.push({
      kind: "QUOTE_CREATED",
      label: "ERP quotation linked",
      occurredAt: input.documentLink.updatedAt,
      meta: {
        quotationId: input.documentLink.erpQuotationId,
      },
    });
  }

  if (input.checkout) {
    events.push({
      kind: "CHECKOUT_CREATED",
      label: "Checkout session created",
      occurredAt: input.checkout.createdAt,
      meta: {
        checkoutSessionId: input.checkout.id,
        checkoutStatus: input.checkout.status,
      },
    });
  }

  if (input.checkout?.status === "PAID") {
    events.push({
      kind: "PAYMENT_RECEIVED",
      label: "Payment received",
      occurredAt: input.checkout.updatedAt,
      meta: {
        providerOrderId: input.checkout.providerOrderId,
      },
    });
  }

  if (input.documentLink?.erpInvoiceId) {
    events.push({
      kind: "INVOICE_LINKED",
      label: "ERP invoice linked",
      occurredAt: input.documentLink.updatedAt,
      meta: {
        invoiceId: input.documentLink.erpInvoiceId,
      },
    });
  }

  if (input.erpState?.syncStatus === "SYNCED") {
    events.push({
      kind: "ERP_SYNCED",
      label: "ERP finance state synced",
      occurredAt: input.documentLink?.updatedAt ?? null,
      meta: {
        quotationId: input.erpState.quotationId,
        salesOrderId: input.erpState.salesOrderId,
        invoiceId: input.erpState.invoiceId,
      },
    });
  }

  return events;
}

export function buildProjectBillingDetail(input: {
  projectId: string;
  projectName: string;
  currency: string;
  checkoutPhone: string | null;
  snapshot: BillingSnapshotRecord | null;
  checkout: BillingCheckoutStateRecord | null;
  documentLink: BillingDocumentLinkRecord | null;
  erpState: BillingErpReadState | null;
  contacts: BillingContactView[];
}): ProjectBillingDetail {
  const paymentState = buildPaymentState({
    snapshot: input.snapshot,
    checkout: input.checkout,
    documentLink: input.documentLink,
    erpState: input.erpState,
  });
  const billingHealth = buildBillingHealth({
    snapshot: input.snapshot,
    checkout: input.checkout,
    documentLink: input.documentLink,
    erpState: input.erpState,
  });
  const checkoutReadiness = buildCheckoutReadiness({
    snapshot: input.snapshot,
    checkoutPhone: input.checkoutPhone,
    paymentState,
    contacts: input.contacts,
    billingHealth,
  });
  const status = buildStatus({
    snapshot: input.snapshot,
    paymentState,
  });

  return {
    projectId: input.projectId,
    projectName: input.projectName,
    currency: input.currency,
    checkoutPhone: input.checkoutPhone,
    status,
    activeSnapshot: toSnapshotView(input.snapshot),
    paymentState,
    erpState: input.erpState,
    billingHealth,
    checkoutReadiness,
    contacts: input.contacts,
    timeline: buildTimeline({
      snapshot: input.snapshot,
      documentLink: input.documentLink,
      checkout: input.checkout,
      erpState: input.erpState,
    }),
    actions: {
      canPayNow: checkoutReadiness.ready,
      payNowUrl:
        checkoutReadiness.ready &&
        input.checkout?.status !== "PAID"
          ? input.checkout?.hostedCheckoutUrl ?? null
          : null,
      canDownloadQuote: Boolean(input.erpState?.quotationId),
      canDownloadInvoice: Boolean(input.erpState?.invoiceId),
      canContactBilling: input.contacts.length > 0,
    },
  };
}
