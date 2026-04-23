import type { BillingPreviewLine, BillingPreviewResult } from "./billing-offers.js";

export type ProjectBillingContactRecord = {
  id: string;
  projectId: string;
  email: string;
  label: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type ProjectBillingConfigRecord = {
  id: string;
  projectId: string;
  billingMode: "CATALOG" | "NEGOTIATED" | "PROMO_ACTIVE" | "HYBRID";
  currency: string;
  allowCoupons: boolean;
  allowReferral: boolean;
  allowOperatorOverride: boolean;
  defaultDepositPercent: number | null;
  defaultPaymentMode: "DEPOSIT" | "FULL";
  erpCustomerId: string | null;
  commercialOwnerUserId: string | null;
  billingPhone: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type BillingSnapshotLineRecord = BillingPreviewLine;

export type BillingSnapshotRecord = {
  id: string;
  projectId: string;
  cartId: string | null;
  sourceType: "CART" | "OPERATOR_QUOTE" | "PROMO_PREVIEW" | "PROJECT_PLAN";
  status: "DRAFT" | "ACTIVE" | "EXPIRED" | "SUPERSEDED" | "SYNCED_TO_ERP";
  currency: string;
  subtotalMinor: number;
  discountMinor: number;
  totalMinor: number;
  payableTodayMinor: number;
  remainingAfterTodayMinor: number;
  offerCodeApplied: string | null;
  couponCodeApplied: string | null;
  referralCodeApplied: string | null;
  operatorAdjustmentMinor: number;
  approvedByUserId: string | null;
  approvalReason: string | null;
  validUntil: Date | null;
  snapshotJson: {
    paymentMode: "DEPOSIT" | "FULL";
    appliedOfferCodes: string[];
    issues: string[];
    lines: BillingSnapshotLineRecord[];
    pricingRationale?: Record<string, unknown>;
  };
  createdAt: Date;
  updatedAt: Date;
};

export type BillingDocumentLinkRecord = {
  id: string;
  billingSnapshotId: string;
  erpQuotationId: string | null;
  erpSalesOrderId: string | null;
  erpInvoiceId: string | null;
  erpPaymentEntryIds: string[];
  quoteRequestId: string | null;
  checkoutSessionId: string | null;
  providerOrderId: string | null;
  paymentSessionId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type BillingCheckoutStateRecord = {
  id: string;
  status: string;
  amountMinor: number;
  currency: string;
  paymentSessionId: string | null;
  providerOrderId: string | null;
  hostedCheckoutUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type BillingErpReadState = {
  erpCustomerId: string | null;
  quotationId: string | null;
  salesOrderId: string | null;
  invoiceId: string | null;
  paymentEntryIds: string[];
  latestInvoiceStatus: string | null;
  latestInvoiceOutstandingMinor: number | null;
  syncStatus: "MISSING" | "PARTIAL" | "SYNCED" | "FAILED";
};

export type BillingHealth = {
  sourceOfTruth: "SNAPSHOT" | "ERP";
  stage:
    | "SNAPSHOT_ONLY"
    | "QUOTED"
    | "ORDER_LINKED"
    | "INVOICE_LINKED"
    | "PAID"
    | "SYNC_BLOCKED";
  tone: "neutral" | "warning" | "success";
  headline: string;
  detail: string;
  lastSyncedAt: Date | null;
  warnings: string[];
};

export type CheckoutReadinessBlocker = {
  code:
    | "MISSING_SNAPSHOT"
    | "MISSING_CHECKOUT_PHONE"
    | "SNAPSHOT_NOT_ACTIVE"
    | "NOTHING_DUE";
  label: string;
};

export type CheckoutReadiness = {
  ready: boolean;
  blockers: CheckoutReadinessBlocker[];
  notes: string[];
};

export type BillingLineItemView = BillingSnapshotLineRecord;

export type BillingSnapshotView = {
  id: string;
  sourceType: BillingSnapshotRecord["sourceType"];
  status: BillingSnapshotRecord["status"];
  currency: string;
  subtotalMinor: number;
  discountMinor: number;
  totalMinor: number;
  payableTodayMinor: number;
  remainingAfterTodayMinor: number;
  offerCodeApplied: string | null;
  couponCodeApplied: string | null;
  referralCodeApplied: string | null;
  operatorAdjustmentMinor: number;
  validUntil: Date | null;
  lines: BillingLineItemView[];
};

export type BillingPaymentState = {
  canPayNow: boolean;
  latestCheckoutStatus: string | null;
  latestPaymentSessionId: string | null;
  providerOrderId: string | null;
  amountDueNowMinor: number;
  amountPaidMinor: number;
  outstandingMinor: number;
};

export type BillingContactView = {
  email: string;
  label: string | null;
  status: "ACTIVE";
};

export type BillingTimelineEvent = {
  kind:
    | "SNAPSHOT_CREATED"
    | "QUOTE_CREATED"
    | "CHECKOUT_CREATED"
    | "PAYMENT_RECEIVED"
    | "INVOICE_LINKED"
    | "ERP_SYNCED";
  label: string;
  occurredAt: Date | null;
  meta?: Record<string, unknown>;
};

export type ProjectBillingDetail = {
  projectId: string;
  projectName: string;
  currency: string;
  checkoutPhone: string | null;
  status:
    | "NO_BILLING"
    | "DRAFT"
    | "READY_TO_PAY"
    | "PARTIALLY_PAID"
    | "PAID"
    | "UNAVAILABLE";
  activeSnapshot: BillingSnapshotView | null;
  paymentState: BillingPaymentState;
  erpState: BillingErpReadState | null;
  billingHealth: BillingHealth;
  checkoutReadiness: CheckoutReadiness;
  contacts: BillingContactView[];
  timeline: BillingTimelineEvent[];
  actions: {
    canPayNow: boolean;
    payNowUrl: string | null;
    canDownloadQuote: boolean;
    canDownloadInvoice: boolean;
    canContactBilling: boolean;
  };
};

export type ProjectBillingConfigView = {
  projectId: string;
  billingMode: ProjectBillingConfigRecord["billingMode"];
  currency: string;
  allowCoupons: boolean;
  allowReferral: boolean;
  allowOperatorOverride: boolean;
  defaultDepositPercent: number | null;
  defaultPaymentMode: ProjectBillingConfigRecord["defaultPaymentMode"];
  erpCustomerId: string | null;
  commercialOwnerUserId: string | null;
  checkoutPhone: string | null;
  notes: string | null;
  contacts: BillingContactView[];
  activeSnapshotId: string | null;
};

export type ProjectBillingConfigUpdateInput = {
  portalUserId: string;
  projectId: string;
  billingMode?: ProjectBillingConfigRecord["billingMode"];
  currency?: string;
  allowCoupons?: boolean;
  allowReferral?: boolean;
  allowOperatorOverride?: boolean;
  defaultDepositPercent?: number | null;
  defaultPaymentMode?: ProjectBillingConfigRecord["defaultPaymentMode"];
  erpCustomerId?: string | null;
  commercialOwnerUserId?: string | null;
  billingPhone?: string | null;
  notes?: string | null;
  contacts?: Array<{
    email: string;
    label?: string | null;
  }>;
};

export type ProjectBillingCheckoutIdentityUpdateInput = {
  portalUserId: string;
  projectId: string;
  billingPhone?: string | null;
};

export type ProjectBillingPreviewInput = {
  portalUserId: string;
  projectId: string;
  selections?: Array<{
    slug: string;
    quantity: number;
  }>;
  customLines?: Array<{
    slug?: string | null;
    itemCode: string;
    label: string;
    quantity: number;
    unitPriceMinor: number;
    kind?: "PACKAGE" | "ADDON" | "QUOTE_ONLY";
    billingModel?: "FULL" | "ADVANCE";
    checkoutMode?: "INSTANT" | "QUOTE_ONLY";
    defaultDepositPercent?: number | null;
  }>;
  couponCode?: string;
  referralCode?: string;
  operatorAdjustmentMinor?: number;
  paymentMode?: "DEPOSIT" | "FULL";
};

export type ProjectBillingPreview = BillingPreviewResult;

export type CreateProjectBillingSnapshotInput = ProjectBillingPreviewInput & {
  sourceType?: BillingSnapshotRecord["sourceType"];
  approvalReason?: string | null;
  validUntil?: Date | null;
};

export type SupersedeProjectBillingSnapshotInput = {
  portalUserId: string;
  projectId: string;
  snapshotId: string;
  reason?: string | null;
};

export type UpdateProjectBillingSnapshotLinkageInput = {
  portalUserId: string;
  projectId: string;
  snapshotId: string;
  erpQuotationId?: string | null;
  erpSalesOrderId?: string | null;
  erpInvoiceId?: string | null;
  erpPaymentEntryIds?: string[];
  quoteRequestId?: string | null;
  checkoutSessionId?: string | null;
  providerOrderId?: string | null;
  paymentSessionId?: string | null;
};

export type PortfolioProjectBilling = {
  projectId: string;
  projectName: string;
  projectSlug: string;
  billing: ProjectBillingDetail;
};

export type PortfolioBillingSummary = {
  totalProjects: number;
  projectsWithBilling: number;
  totalQuotedMinor: number;
  totalPaidMinor: number;
  totalDueNowMinor: number;
  totalOutstandingMinor: number;
  statusBreakdown: Record<string, number>;
};

export type PortfolioBillingDetail = {
  projects: PortfolioProjectBilling[];
  summary: PortfolioBillingSummary;
};
