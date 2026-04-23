import { getApiBaseUrl } from "./commerce";
import {
  createWorkbenchCheckoutSessionFromBillingSnapshot,
  getWorkbenchPortfolioBilling,
  getWorkbenchPortalSession,
  getWorkbenchProjectAccessSettings,
  getWorkbenchProjectBilling,
  getWorkbenchProjectDetail,
  getWorkbenchProjectLeadTombstones,
  getWorkbenchProjectLeads,
  getWorkbenchProjectOnboarding,
  getWorkbenchProjects,
  isLocalPortalWorkbenchClientEnabled,
  isLocalPortalWorkbenchEnabled,
  resolveWorkbenchProjectOnboardingFromCartId,
  saveWorkbenchProjectOnboarding,
  simulateWorkbenchHardDeleteProjectLeads,
  simulateWorkbenchInviteProjectMember,
  simulateWorkbenchRemoveProjectMember,
  simulateWorkbenchResendProjectInvite,
  simulateWorkbenchRestoreProjectLeads,
  simulateWorkbenchRevealProjectLead,
  simulateWorkbenchRevokeProjectInvite,
  simulateWorkbenchSoftDeleteProjectLeads,
  simulateWorkbenchUpdateProjectInvite,
  simulateWorkbenchUpdateProjectMemberRole,
  submitWorkbenchProjectOnboarding,
} from "./local-portal-workbench";

export type PortalUserSummary = {
  id: string;
  email: string;
  fullName: string | null;
  role: "PLATFORM_ADMIN" | "PLATFORM_OPERATOR" | "CLIENT";
  companyName: string | null;
};

export type PortalSessionResponse = {
  authenticated: true;
  portalUser: PortalUserSummary;
};

export type AccessibleProject = {
  id: string;
  slug: string;
  name: string;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  publicLeadKey: string | null;
  primaryDomain: string | null;
  clientCompanyName: string | null;
  goLiveAt: string | null;
  membershipRole: "OWNER" | "VIEWER";
};

export type ProjectLead = {
  id: string;
  projectId: string;
  sourceLeadId: string | null;
  fullName: string;
  email: string;
  phone: string | null;
  companyName: string | null;
  message: string | null;
  consent: boolean;
  sourcePage: string | null;
  sourceCta: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmTerm: string | null;
  gclid: string | null;
  gbraid: string | null;
  wbraid: string | null;
  sourceKind?:
    | "WEB_FORM"
    | "MANUAL_ENTRY"
    | "EVENT_IMPORT"
    | "CSV_IMPORT"
    | "META_LEAD_ADS"
    | "LINKEDIN_LEAD_GEN"
    | "GOOGLE_ADS"
    | null;
  connectorId?: string | null;
  sourceConnectorLabel?: string | null;
  campaignId?: string | null;
  campaignName?: string | null;
  importBatchId?: string | null;
  importBatchLabel?: string | null;
  externalLeadId?: string | null;
  capturedAt?: string | null;
  notificationStatus: "RECEIVED" | "NOTIFIED" | "NOTIFICATION_FAILED" | null;
  notificationError: string | null;
  syncStatus: "PENDING" | "SYNCED" | "PARTIAL" | "FAILED";
  syncError: string | null;
  visibilityState: "VISIBLE" | "HIDDEN";
  hiddenAt: string | null;
  hiddenByPortalUserId: string | null;
  hiddenByUserEmail: string | null;
  hiddenByUserFullName: string | null;
  hiddenReasonCode: string | null;
  hiddenReasonNote: string | null;
  lastRestoredAt: string | null;
  lastRestoredByPortalUserId: string | null;
  lastRestoredByUserEmail: string | null;
  lastRestoredByUserFullName: string | null;
  sourceHost: string | null;
  serviceInterest: string[];
  budgetRange: string | null;
  timeline: string | null;
  problemSummary: string | null;
  interestLabel: string | null;
  budgetLabel: string | null;
  touchpointLabel: string | null;
  isInternalTest: boolean;
  auditEvents: Array<{
    id: string;
    projectId: string;
    projectLeadId: string;
    actorUserId: string | null;
    actorUserEmail: string | null;
    actorUserFullName: string | null;
    type: "SOFT_DELETED" | "RESTORED" | "PII_REVEALED" | "HARD_DELETED";
    reasonCode: string | null;
    note: string | null;
    metadata: Record<string, unknown> | null;
    createdAt: string;
  }>;
  createdAt: string;
};

export type ProjectLeadDeletionTombstone = {
  id: string;
  projectId: string;
  deletedProjectLeadId: string;
  deletedSourceLeadId: string | null;
  deletedByUserId: string | null;
  deletedByUserEmail: string | null;
  deletedByUserFullName: string | null;
  reasonCode: string | null;
  note: string | null;
  createdAt: string;
};

export type ProjectInvite = {
  id: string;
  projectId: string;
  email: string;
  fullName: string | null;
  role: "OWNER" | "VIEWER";
  invitedByPortalUserId: string;
  invitedByUserEmail: string | null;
  invitedByUserFullName: string | null;
  acceptedByPortalUserId: string | null;
  acceptedByUserEmail: string | null;
  acceptedByUserFullName: string | null;
  selector: string;
  verifierHash: string;
  status: "PENDING" | "ACCEPTED" | "REVOKED" | "EXPIRED";
  expiresAt: string;
  acceptedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProjectAccessSettings = {
  projectId: string;
  projectName: string;
  membershipRole: "OWNER" | "VIEWER";
  members: ProjectMember[];
  invites: ProjectInvite[];
};

export type ProjectInviteContext = {
  invite: ProjectInvite;
  project: {
    id: string;
    slug: string;
    name: string;
  };
};

export type ProjectSite = {
  id: string;
  projectId: string;
  slug: string;
  templateKey: string;
  themeKey: string | null;
  sourceProvider: "GIT_REPOSITORY" | null;
  repoUrl: string | null;
  repoBranch: string | null;
  repoRef: string | null;
  deployedCommit: string | null;
  runtimeProfile: "STATIC_ARTIFACT" | "ISOLATED_APP";
  operatorNotes: string | null;
  ga4MeasurementId: string | null;
  googleAdsTagId: string | null;
  googleAdsConversionMode: "DIRECT_LABEL" | "GA4_IMPORTED";
  googleAdsLeadConversionLabel: string | null;
  gtmContainerId: string | null;
  metaPixelId: string | null;
  trackingNotes: string | null;
  publishStatus: "DRAFT" | "PUBLISHED" | "FAILED";
  lastPublishedAt: string | null;
  previewHost: string | null;
  latestPreviewPath: string | null;
};

export type PublicTrackingRuntimeConfig = {
  resolvedHost: string | null;
  projectId: string | null;
  projectName: string | null;
  siteId: string | null;
  siteSlug: string | null;
  hostSource: "PRIMARY_DOMAIN" | "PREVIEW_HOST" | null;
  liveUrl: string | null;
  previewUrl: string | null;
  ga4MeasurementId: string | null;
  googleAdsTagId: string | null;
  googleAdsConversionMode: "DIRECT_LABEL" | "GA4_IMPORTED";
  googleAdsLeadConversionLabel: string | null;
  gtmContainerId: string | null;
  metaPixelId: string | null;
  injectGtm: boolean;
  injectGa4: boolean;
  injectGoogleAds: boolean;
  injectMetaPixel: boolean;
  suppressGa4PageView: boolean;
  leadEventTargets: {
    dataLayer: boolean;
    ga4: boolean;
    googleAds: boolean;
    metaPixel: boolean;
  };
  warnings: string[];
};

export type ProjectDomain = {
  id: string;
  projectId: string;
  siteId: string | null;
  host: string;
  status: "PENDING" | "ACTIVE" | "ERROR";
  isPrimary: boolean;
  dnsTarget: string | null;
  verifiedAt: string | null;
};

export type ProjectSyncTarget = {
  id: string;
  projectId: string;
  kind: "GOOGLE_SHEETS" | "MDOC_PUSH";
  status: "ACTIVE" | "INACTIVE";
  label?: string | null;
  config:
    | {
        spreadsheetId: string;
        sheetName: string;
      }
    | {
        endpoint: string;
        apiKey: string;
        dataFrom: "T" | "E";
        source: string;
        fallbackSourceDetail: string;
        sourceDetailRules?: Record<string, string>;
        staticDefaults?: Record<string, string>;
        enumMappings?: {
          preferences?: Record<string, string>;
          budgets?: Record<string, string>;
          buyingPurposes?: Record<string, string>;
          possessionReqs?: Record<string, string>;
          ageRanges?: Record<string, string>;
        };
      };
  latestDeliveryAttempt?: {
    id: string;
    projectLeadId: string;
    projectId: string;
    targetId: string;
    kind: "GOOGLE_SHEETS" | "MDOC_PUSH";
    status: "PENDING" | "SYNCED" | "FAILED";
    responseCode: number | null;
    responseBody: string | null;
    errorMessage: string | null;
    metadata: Record<string, unknown> | null;
    attemptedAt: string;
    deliveredAt: string | null;
    createdAt: string;
    updatedAt: string;
  } | null;
};

export type LeadSourceKind = NonNullable<ProjectLead["sourceKind"]>;

export type AcquisitionConnector = {
  id: string;
  projectId: string;
  kind: LeadSourceKind;
  status: "ACTIVE" | "INACTIVE" | "NEEDS_AUTH" | "ERROR";
  label: string;
  externalAccountId: string | null;
  config: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  lastCheckedAt: string | null;
  lastSyncAt: string | null;
  lastError: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AcquisitionCampaign = {
  id: string;
  projectId: string;
  connectorId: string | null;
  accountId: string | null;
  provider: LeadSourceKind;
  externalCampaignId: string | null;
  name: string;
  status: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};

export type LeadImportBatch = {
  id: string;
  projectId: string;
  connectorId: string | null;
  sourceKind: LeadSourceKind;
  status: "PENDING" | "IMPORTED" | "PARTIAL" | "FAILED";
  label: string | null;
  filename: string | null;
  totalRows: number;
  importedRows: number;
  failedRows: number;
  fieldMapping: Record<string, unknown> | null;
  errorSummary: string | null;
  createdByUserId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProjectAcquisitionSources = {
  connectors: AcquisitionConnector[];
  campaigns: AcquisitionCampaign[];
};

export type ProjectMember = {
  portalUserId: string;
  email: string;
  fullName: string | null;
  role: "OWNER" | "VIEWER";
  status: "PENDING" | "ACTIVE";
};

export type ProjectNotificationRecipient = {
  id: string;
  projectId: string;
  email: string;
  label: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProjectDetail = {
  id: string;
  slug: string;
  name: string;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  publicLeadKey: string | null;
  portalView: "CLIENT" | "OPERATOR";
  primaryDomain: string | null;
  clientCompanyName: string | null;
  description: string | null;
  notes: string | null;
  goLiveAt: string | null;
  membershipRole: "OWNER" | "VIEWER";
  leadCount: number;
  sites: ProjectSite[];
  domains: ProjectDomain[];
  syncTargets: ProjectSyncTarget[];
  members: ProjectMember[];
  leadNotificationRecipients: ProjectNotificationRecipient[];
  sourceSummary: {
    siteId: string;
    provider: "GIT_REPOSITORY" | null;
    repoUrl: string | null;
    repoBranch: string | null;
    repoRef: string | null;
    deployedCommit: string | null;
    runtimeProfile: "STATIC_ARTIFACT" | "ISOLATED_APP";
    operatorNotes: string | null;
    previewHost: string | null;
  } | null;
  previewUrl: string | null;
  liveUrl: string | null;
  billingSummary: {
    billingContactEmails: string[];
    cartCount: number;
    totalQuotedMinor: number;
    totalPayableTodayMinor: number;
    latestCartId: string | null;
    latestCartStatus: string | null;
    latestQuoteRequestStatus: string | null;
    latestCheckoutStatus: string | null;
    latestPaymentSessionId: string | null;
    latestProviderOrderId: string | null;
    latestErpQuotationId: string | null;
    latestErpSalesOrderId: string | null;
    latestErpCustomerId: string | null;
    latestUpdatedAt: string | null;
  };
};

export type ProjectBillingDetail = {
  projectId: string;
  projectName: string;
  currency: string;
  checkoutPhone: string | null;
  status: "NO_BILLING" | "DRAFT" | "READY_TO_PAY" | "PARTIALLY_PAID" | "PAID" | "UNAVAILABLE";
  activeSnapshot: {
    id: string;
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
    validUntil: string | null;
    lines: Array<{
      slug: string;
      itemCode: string;
      label: string;
      quantity: number;
      kind: "PACKAGE" | "ADDON" | "QUOTE_ONLY";
      billingModel: "FULL" | "ADVANCE";
      checkoutMode: "INSTANT" | "QUOTE_ONLY";
      unitPriceMinor: number;
      lineSubtotalMinor: number;
      lineDiscountMinor: number;
      lineTotalMinor: number;
      payableTodayMinor: number;
      remainingAfterTodayMinor: number;
    }>;
  } | null;
  paymentState: {
    canPayNow: boolean;
    latestCheckoutStatus: string | null;
    latestPaymentSessionId: string | null;
    providerOrderId: string | null;
    amountDueNowMinor: number;
    amountPaidMinor: number;
    outstandingMinor: number;
  };
  erpState: {
    erpCustomerId: string | null;
    quotationId: string | null;
    salesOrderId: string | null;
    invoiceId: string | null;
    paymentEntryIds: string[];
    latestInvoiceStatus: string | null;
    latestInvoiceOutstandingMinor: number | null;
    syncStatus: "MISSING" | "PARTIAL" | "SYNCED" | "FAILED";
  } | null;
  billingHealth: {
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
    lastSyncedAt: string | null;
    warnings: string[];
  };
  checkoutReadiness: {
    ready: boolean;
    blockers: Array<{
      code:
        | "MISSING_SNAPSHOT"
        | "MISSING_CHECKOUT_PHONE"
        | "SNAPSHOT_NOT_ACTIVE"
        | "NOTHING_DUE";
      label: string;
    }>;
    notes: string[];
  };
  contacts: Array<{
    email: string;
    label: string | null;
    status: "ACTIVE";
  }>;
  timeline: Array<{
    kind:
      | "SNAPSHOT_CREATED"
      | "QUOTE_CREATED"
      | "CHECKOUT_CREATED"
      | "PAYMENT_RECEIVED"
      | "INVOICE_LINKED"
      | "ERP_SYNCED";
    label: string;
    occurredAt: string | null;
    meta?: Record<string, unknown>;
  }>;
  actions: {
    canPayNow: boolean;
    payNowUrl: string | null;
    canDownloadQuote: boolean;
    canDownloadInvoice: boolean;
    canContactBilling: boolean;
  };
};

export type ProjectOnboardingSession = {
  id: string;
  cartId: string;
  checkoutSessionId: string | null;
  projectId: string | null;
  status: "DRAFT" | "SUBMITTED" | "CONVERTED";
  package: {
    slug: string;
    label: string;
  } | null;
  selectedAddons: string[];
  buyer: {
    email: string | null;
    fullName: string | null;
    companyName: string | null;
    phone: string | null;
  };
  summary: {
    currency: string;
    totalMinor: number;
    payableTodayMinor: number;
    remainingAfterTodayMinor: number;
  };
  intake: Record<string, unknown>;
  lastCompletedStep: string | null;
  submittedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProjectOnboardingSubmitResult = {
  session: ProjectOnboardingSession;
  project: {
    id: string;
    slug: string;
    name: string;
    status: string;
  };
  projectRoute: string;
};

export type PortfolioBillingDetail = {
  projects: Array<{
    projectId: string;
    projectName: string;
    projectSlug: string;
    billing: ProjectBillingDetail;
  }>;
  summary: {
    totalProjects: number;
    projectsWithBilling: number;
    totalQuotedMinor: number;
    totalPaidMinor: number;
    totalDueNowMinor: number;
    totalOutstandingMinor: number;
    statusBreakdown: Record<string, number>;
  };
};

type RequestOptions = RequestInit & {
  cookieHeader?: string;
};

function shouldUseLocalWorkbenchServer(): boolean {
  return isLocalPortalWorkbenchEnabled();
}

function shouldUseLocalWorkbenchClient(): boolean {
  return isLocalPortalWorkbenchClientEnabled();
}

function getPublicApiBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  return process.env.NODE_ENV === "production"
    ? "https://api.shasvata.com"
    : "http://localhost:3001";
}

function buildHeaders(
  headers: HeadersInit | undefined,
  cookieHeader?: string,
): Headers {
  const nextHeaders = new Headers(headers);
  if (cookieHeader) {
    nextHeaders.set("cookie", cookieHeader);
  }

  return nextHeaders;
}

async function readJson<T>(response: Response): Promise<T> {
  if (response.ok) {
    return (await response.json()) as T;
  }

  let message = "Landing portal request failed.";

  try {
    const payload = (await response.json()) as { error?: string };
    if (payload.error) {
      message = payload.error;
    }
  } catch {
    // Keep the default message when the response body is empty.
  }

  throw new Error(message);
}

async function fetchPortalJson<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...options,
    headers: buildHeaders(options.headers, options.cookieHeader),
    cache: "no-store",
  });

  return readJson<T>(response);
}

export async function requestPortalMagicLinkForApp(input: {
  email: string;
  redirectPath?: string;
}): Promise<{ accepted: true }> {
  const response = await fetch(`${getPublicApiBaseUrl()}/api/landing/auth/magic-links`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  return readJson<{ accepted: true }>(response);
}

export async function consumePortalMagicLinkForApp(input: {
  selector: string;
  verifier: string;
}): Promise<{
  authenticated: true;
  redirectPath: string;
  portalUser: {
    id: string;
    email: string;
  };
}> {
  const response = await fetch(
    `${getPublicApiBaseUrl()}/api/landing/auth/magic-links/consume`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    },
  );

  return readJson(response);
}

export async function signInWithPasswordForApp(input: {
  email: string;
  password: string;
  inviteSelector?: string;
  inviteVerifier?: string;
}): Promise<{
  authenticated: true;
  redirectPath?: string;
  portalUser: {
    id: string;
    email: string;
  };
}> {
  const response = await fetch(`${getPublicApiBaseUrl()}/api/landing/auth/sign-in`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  return readJson(response);
}

export async function signUpWithPasswordForApp(input: {
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  password: string;
  inviteSelector?: string;
  inviteVerifier?: string;
}): Promise<
  | { accepted: true }
  | {
      authenticated: true;
      redirectPath?: string;
      portalUser: {
        id: string;
        email: string;
      };
    }
> {
  const response = await fetch(`${getPublicApiBaseUrl()}/api/landing/auth/sign-up`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  return readJson<{ accepted: true }>(response);
}

export async function consumeEmailVerificationForApp(input: {
  selector: string;
  verifier: string;
}): Promise<{
  authenticated: true;
  portalUser: {
    id: string;
    email: string;
  };
}> {
  const response = await fetch(
    `${getPublicApiBaseUrl()}/api/landing/auth/verify-email/consume`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    },
  );

  return readJson(response);
}

export async function requestPasswordResetForApp(input: {
  email: string;
}): Promise<{ accepted: true }> {
  const response = await fetch(
    `${getPublicApiBaseUrl()}/api/landing/auth/password/forgot`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    },
  );

  return readJson<{ accepted: true }>(response);
}

export async function resetPasswordForApp(input: {
  selector: string;
  verifier: string;
  password: string;
}): Promise<{
  authenticated: true;
  portalUser: {
    id: string;
    email: string;
  };
}> {
  const response = await fetch(
    `${getPublicApiBaseUrl()}/api/landing/auth/password/reset`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    },
  );

  return readJson(response);
}

export async function signInWithGoogleForApp(input: {
  idToken: string;
  inviteSelector?: string;
  inviteVerifier?: string;
}): Promise<{
  authenticated: true;
  redirectPath?: string;
  portalUser: {
    id: string;
    email: string;
  };
}> {
  const response = await fetch(`${getPublicApiBaseUrl()}/api/landing/auth/google`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  return readJson(response);
}

export async function signOutPortalSessionForApp(): Promise<void> {
  if (shouldUseLocalWorkbenchClient()) {
    const response = await fetch("/api/local-workbench", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "sign-out",
      }),
    });

    if (!response.ok) {
      await readJson(response);
    }

    return;
  }

  const response = await fetch(`${getPublicApiBaseUrl()}/api/landing/portal/sign-out`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok && response.status !== 401) {
    await readJson(response);
  }
}

export async function inviteProjectMemberForApp(input: {
  projectId: string;
  email: string;
  fullName?: string;
  role: "OWNER" | "VIEWER";
}): Promise<{ invite: ProjectInvite }> {
  if (shouldUseLocalWorkbenchClient()) {
    return simulateWorkbenchInviteProjectMember(input);
  }

  const response = await fetch(
    `${getPublicApiBaseUrl()}/api/landing/portal/projects/${encodeURIComponent(input.projectId)}/members`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: input.email,
        fullName: input.fullName,
        role: input.role,
      }),
    },
  );

  return readJson<{ invite: ProjectInvite }>(response);
}

export async function fetchProjectAccessSettingsForApp(input: {
  cookieHeader: string;
  projectId: string;
}): Promise<ProjectAccessSettings> {
  if (shouldUseLocalWorkbenchServer()) {
    return getWorkbenchProjectAccessSettings(input.projectId, input.cookieHeader);
  }

  const response = await fetchPortalJson<ProjectAccessSettings>(
    `/api/landing/portal/projects/${encodeURIComponent(input.projectId)}/settings/access`,
    {
      cookieHeader: input.cookieHeader,
    },
  );

  return response;
}

export async function resendProjectInviteForApp(input: {
  projectId: string;
  inviteId: string;
}): Promise<{ invite: ProjectInvite }> {
  if (shouldUseLocalWorkbenchClient()) {
    return simulateWorkbenchResendProjectInvite(input);
  }

  const response = await fetch(
    `${getPublicApiBaseUrl()}/api/landing/portal/projects/${encodeURIComponent(input.projectId)}/invites/${encodeURIComponent(input.inviteId)}/resend`,
    {
      method: "POST",
      credentials: "include",
    },
  );

  return readJson(response);
}

export async function updateProjectInviteForApp(input: {
  projectId: string;
  inviteId: string;
  role: "OWNER" | "VIEWER";
}): Promise<{ invite: ProjectInvite }> {
  if (shouldUseLocalWorkbenchClient()) {
    return simulateWorkbenchUpdateProjectInvite(input);
  }

  const response = await fetch(
    `${getPublicApiBaseUrl()}/api/landing/portal/projects/${encodeURIComponent(input.projectId)}/invites/${encodeURIComponent(input.inviteId)}`,
    {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        role: input.role,
      }),
    },
  );

  return readJson(response);
}

export async function revokeProjectInviteForApp(input: {
  projectId: string;
  inviteId: string;
}): Promise<{ invite: ProjectInvite }> {
  if (shouldUseLocalWorkbenchClient()) {
    return simulateWorkbenchRevokeProjectInvite(input);
  }

  const response = await fetch(
    `${getPublicApiBaseUrl()}/api/landing/portal/projects/${encodeURIComponent(input.projectId)}/invites/${encodeURIComponent(input.inviteId)}`,
    {
      method: "DELETE",
      credentials: "include",
    },
  );

  return readJson(response);
}

export async function updateProjectMemberRoleForApp(input: {
  projectId: string;
  memberPortalUserId: string;
  role: "OWNER" | "VIEWER";
}): Promise<{ member: ProjectMember }> {
  if (shouldUseLocalWorkbenchClient()) {
    return simulateWorkbenchUpdateProjectMemberRole(input);
  }

  const response = await fetch(
    `${getPublicApiBaseUrl()}/api/landing/portal/projects/${encodeURIComponent(input.projectId)}/members/${encodeURIComponent(input.memberPortalUserId)}`,
    {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        role: input.role,
      }),
    },
  );

  return readJson(response);
}

export async function removeProjectMemberForApp(input: {
  projectId: string;
  memberPortalUserId: string;
}): Promise<{ removed: true }> {
  if (shouldUseLocalWorkbenchClient()) {
    return simulateWorkbenchRemoveProjectMember(input);
  }

  const response = await fetch(
    `${getPublicApiBaseUrl()}/api/landing/portal/projects/${encodeURIComponent(input.projectId)}/members/${encodeURIComponent(input.memberPortalUserId)}`,
    {
      method: "DELETE",
      credentials: "include",
    },
  );

  return readJson(response);
}

export async function softDeleteProjectLeadsForApp(input: {
  projectId: string;
  leadIds: string[];
  reasonCode: string;
  note?: string;
}): Promise<{ leads: ProjectLead[] }> {
  if (shouldUseLocalWorkbenchClient()) {
    return simulateWorkbenchSoftDeleteProjectLeads(input);
  }

  const response = await fetch(
    `${getPublicApiBaseUrl()}/api/landing/portal/projects/${encodeURIComponent(input.projectId)}/leads/soft-delete`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    },
  );

  return readJson(response);
}

export async function restoreProjectLeadsForApp(input: {
  projectId: string;
  leadIds: string[];
  note?: string;
}): Promise<{ leads: ProjectLead[] }> {
  if (shouldUseLocalWorkbenchClient()) {
    return simulateWorkbenchRestoreProjectLeads(input);
  }

  const response = await fetch(
    `${getPublicApiBaseUrl()}/api/landing/portal/projects/${encodeURIComponent(input.projectId)}/leads/restore`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    },
  );

  return readJson(response);
}

export async function revealProjectLeadForApp(input: {
  projectId: string;
  leadId: string;
  reasonCode: string;
  note?: string;
}): Promise<{ lead: ProjectLead; expiresAt: string }> {
  if (shouldUseLocalWorkbenchClient()) {
    return simulateWorkbenchRevealProjectLead(input);
  }

  const response = await fetch(
    `${getPublicApiBaseUrl()}/api/landing/portal/projects/${encodeURIComponent(input.projectId)}/leads/reveal`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    },
  );

  return readJson(response);
}

export async function hardDeleteProjectLeadsForApp(input: {
  projectId: string;
  leadIds: string[];
  reasonCode: string;
  confirmation: string;
  note?: string;
}): Promise<{ tombstones: ProjectLeadDeletionTombstone[] }> {
  if (shouldUseLocalWorkbenchClient()) {
    return simulateWorkbenchHardDeleteProjectLeads(input);
  }

  const response = await fetch(
    `${getPublicApiBaseUrl()}/api/landing/portal/projects/${encodeURIComponent(input.projectId)}/leads/hard-delete`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    },
  );

  return readJson(response);
}

export async function fetchProjectInviteForApp(input: {
  selector: string;
  verifier: string;
  cookieHeader?: string;
}): Promise<ProjectInviteContext> {
  return fetchPortalJson<ProjectInviteContext>(
    `/api/landing/portal/invites/${encodeURIComponent(input.selector)}/${encodeURIComponent(input.verifier)}`,
    {
      cookieHeader: input.cookieHeader,
    },
  );
}

export async function consumeProjectInviteForApp(input: {
  selector: string;
  verifier: string;
}): Promise<{ invite: ProjectInvite }> {
  const response = await fetch(
    `${getPublicApiBaseUrl()}/api/landing/portal/invites/${encodeURIComponent(input.selector)}/${encodeURIComponent(input.verifier)}/consume`,
    {
      method: "POST",
      credentials: "include",
    },
  );

  return readJson(response);
}

export async function addProjectNotificationRecipientForApp(input: {
  projectId: string;
  email: string;
  label?: string;
}): Promise<{ recipient: ProjectNotificationRecipient }> {
  const response = await fetch(
    `${getPublicApiBaseUrl()}/api/landing/portal/projects/${encodeURIComponent(input.projectId)}/notification-recipients`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: input.email,
        label: input.label,
      }),
    },
  );

  return readJson<{ recipient: ProjectNotificationRecipient }>(response);
}

export async function removeProjectNotificationRecipientForApp(input: {
  projectId: string;
  recipientId: string;
}): Promise<void> {
  const response = await fetch(
    `${getPublicApiBaseUrl()}/api/landing/portal/projects/${encodeURIComponent(input.projectId)}/notification-recipients/${encodeURIComponent(input.recipientId)}`,
    {
      method: "DELETE",
      credentials: "include",
    },
  );

  if (!response.ok) {
    await readJson(response);
  }
}

export async function updateProjectTrackingSettingsForApp(input: {
  projectId: string;
  ga4MeasurementId?: string;
  googleAdsTagId?: string;
  googleAdsConversionMode?: "DIRECT_LABEL" | "GA4_IMPORTED";
  googleAdsLeadConversionLabel?: string;
  gtmContainerId?: string;
  metaPixelId?: string;
  trackingNotes?: string;
}): Promise<{ site: ProjectSite }> {
  const response = await fetch(
    `${getPublicApiBaseUrl()}/api/landing/portal/projects/${encodeURIComponent(input.projectId)}/settings/tracking`,
    {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ga4MeasurementId: input.ga4MeasurementId,
        googleAdsTagId: input.googleAdsTagId,
        googleAdsConversionMode: input.googleAdsConversionMode,
        googleAdsLeadConversionLabel: input.googleAdsLeadConversionLabel,
        gtmContainerId: input.gtmContainerId,
        metaPixelId: input.metaPixelId,
        trackingNotes: input.trackingNotes,
      }),
    },
  );

  return readJson<{ site: ProjectSite }>(response);
}

export async function upsertProjectMdocSyncTargetForApp(input: {
  projectId: string;
  status?: "ACTIVE" | "INACTIVE";
  label?: string;
  endpoint?: string;
  apiKey?: string;
  dataFrom?: "T" | "E";
  source?: string;
  fallbackSourceDetail?: string;
  sourceDetailRules?: Record<string, string>;
  staticDefaults?: Record<string, string>;
  enumMappings?: {
    preferences?: Record<string, string>;
    budgets?: Record<string, string>;
    buyingPurposes?: Record<string, string>;
    possessionReqs?: Record<string, string>;
    ageRanges?: Record<string, string>;
  };
}): Promise<{ target: ProjectSyncTarget }> {
  const response = await fetch(
    `${getPublicApiBaseUrl()}/api/landing/portal/projects/${encodeURIComponent(input.projectId)}/settings/sync-targets/mdoc`,
    {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    },
  );

  return readJson<{ target: ProjectSyncTarget }>(response);
}

export async function testProjectMdocSyncTargetForApp(input: {
  projectId: string;
  endpoint?: string;
  apiKey?: string;
  dataFrom?: "T" | "E";
  source?: string;
  fallbackSourceDetail?: string;
  sourceDetailRules?: Record<string, string>;
  staticDefaults?: Record<string, string>;
  enumMappings?: {
    preferences?: Record<string, string>;
    budgets?: Record<string, string>;
    buyingPurposes?: Record<string, string>;
    possessionReqs?: Record<string, string>;
    ageRanges?: Record<string, string>;
  };
}): Promise<{
  result: {
    responseCode: number | null;
    responseBody: string | null;
    metadata: Record<string, unknown> | null;
    config: ProjectSyncTarget["config"];
  };
}> {
  const response = await fetch(
    `${getPublicApiBaseUrl()}/api/landing/portal/projects/${encodeURIComponent(input.projectId)}/settings/sync-targets/mdoc/test`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    },
  );

  return readJson<{
    result: {
      responseCode: number | null;
      responseBody: string | null;
      metadata: Record<string, unknown> | null;
      config: ProjectSyncTarget["config"];
    };
  }>(response);
}

export async function fetchProjectAcquisitionSourcesForApp(input: {
  projectId: string;
  cookieHeader?: string;
}): Promise<ProjectAcquisitionSources> {
  if (input.cookieHeader) {
    return fetchPortalJson<ProjectAcquisitionSources>(
      `/api/landing/portal/projects/${encodeURIComponent(input.projectId)}/acquisition`,
      {
        cookieHeader: input.cookieHeader,
      },
    );
  }

  const response = await fetch(
    `${getPublicApiBaseUrl()}/api/landing/portal/projects/${encodeURIComponent(input.projectId)}/acquisition`,
    {
      credentials: "include",
      cache: "no-store",
    },
  );

  return readJson<ProjectAcquisitionSources>(response);
}

export async function upsertProjectAcquisitionConnectorForApp(input: {
  projectId: string;
  connectorId?: string;
  kind: LeadSourceKind;
  status?: "ACTIVE" | "INACTIVE" | "NEEDS_AUTH" | "ERROR";
  label?: string;
  externalAccountId?: string;
  config?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}): Promise<{ connector: AcquisitionConnector }> {
  const path = input.connectorId
    ? `/api/landing/portal/projects/${encodeURIComponent(input.projectId)}/acquisition/connectors/${encodeURIComponent(input.connectorId)}`
    : `/api/landing/portal/projects/${encodeURIComponent(input.projectId)}/acquisition/connectors`;
  const response = await fetch(`${getPublicApiBaseUrl()}${path}`, {
    method: input.connectorId ? "PATCH" : "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  return readJson<{ connector: AcquisitionConnector }>(response);
}

export async function upsertProjectAcquisitionCampaignForApp(input: {
  projectId: string;
  campaignId?: string;
  connectorId?: string;
  accountId?: string;
  provider: LeadSourceKind;
  externalCampaignId?: string;
  name: string;
  status?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  metadata?: Record<string, unknown>;
}): Promise<{ campaign: AcquisitionCampaign }> {
  const path = input.campaignId
    ? `/api/landing/portal/projects/${encodeURIComponent(input.projectId)}/acquisition/campaigns/${encodeURIComponent(input.campaignId)}`
    : `/api/landing/portal/projects/${encodeURIComponent(input.projectId)}/acquisition/campaigns`;
  const response = await fetch(`${getPublicApiBaseUrl()}${path}`, {
    method: input.campaignId ? "PATCH" : "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  return readJson<{ campaign: AcquisitionCampaign }>(response);
}

export async function importProjectLeadsCsvForApp(input: {
  projectId: string;
  connectorId?: string;
  campaignId?: string;
  csvText: string;
  fieldMapping: Record<string, string>;
  filename?: string;
  label?: string;
  sourceKind?: LeadSourceKind;
}): Promise<{
  batch: LeadImportBatch;
  leads: ProjectLead[];
  errors: Array<{ rowNumber: number; error: string }>;
}> {
  const response = await fetch(
    `${getPublicApiBaseUrl()}/api/landing/portal/projects/${encodeURIComponent(input.projectId)}/acquisition/imports/csv`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    },
  );

  return readJson(response);
}

export async function createProjectManualLeadForApp(input: {
  projectId: string;
  sourceKind?: "MANUAL_ENTRY" | "EVENT_IMPORT";
  connectorId?: string;
  campaignId?: string;
  externalLeadId?: string;
  capturedAt?: string;
  eventName?: string;
  fullName?: string;
  email: string;
  phone?: string;
  companyName?: string;
  message?: string;
  consent?: boolean;
  sourcePage?: string;
  sourceCta?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}): Promise<{ lead: ProjectLead }> {
  const response = await fetch(
    `${getPublicApiBaseUrl()}/api/landing/portal/projects/${encodeURIComponent(input.projectId)}/acquisition/manual-leads`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    },
  );

  return readJson(response);
}

export async function testProjectAcquisitionConnectorForApp(input: {
  projectId: string;
  connectorId: string;
}): Promise<{
  result: {
    ok: boolean;
    status: "ACTIVE" | "INACTIVE" | "NEEDS_AUTH" | "ERROR";
    message: string;
  };
}> {
  const response = await fetch(
    `${getPublicApiBaseUrl()}/api/landing/portal/projects/${encodeURIComponent(input.projectId)}/acquisition/connectors/${encodeURIComponent(input.connectorId)}/test`,
    {
      method: "POST",
      credentials: "include",
    },
  );

  return readJson(response);
}

export async function fetchPublicTrackingRuntimeConfigForApp(input: {
  host: string;
  cookieHeader?: string;
}): Promise<PublicTrackingRuntimeConfig> {
  const host = input.host.trim();
  const query = new URLSearchParams({ host });

  return fetchPortalJson<PublicTrackingRuntimeConfig>(
    `/api/landing/runtime/tracking-config?${query.toString()}`,
    {
      cookieHeader: input.cookieHeader,
    },
  );
}

export async function fetchPortalSessionForApp(
  cookieHeader?: string,
): Promise<PortalSessionResponse | null> {
  if (shouldUseLocalWorkbenchServer()) {
    return getWorkbenchPortalSession(cookieHeader);
  }

  if (!cookieHeader) {
    return null;
  }

  const response = await fetch(`${getApiBaseUrl()}/api/landing/portal/session`, {
    headers: buildHeaders(undefined, cookieHeader),
    cache: "no-store",
  });

  if (response.status === 401) {
    return null;
  }

  return readJson<PortalSessionResponse>(response);
}

export async function fetchProjectsForApp(cookieHeader: string): Promise<AccessibleProject[]> {
  if (shouldUseLocalWorkbenchServer()) {
    return getWorkbenchProjects(cookieHeader);
  }

  const response = await fetchPortalJson<{ projects: AccessibleProject[] }>(
    "/api/landing/portal/projects",
    {
      cookieHeader,
    },
  );

  return response.projects;
}

export async function fetchProjectDetailForApp(input: {
  cookieHeader: string;
  projectId: string;
}): Promise<ProjectDetail> {
  if (shouldUseLocalWorkbenchServer()) {
    return getWorkbenchProjectDetail(input.projectId, input.cookieHeader);
  }

  const response = await fetchPortalJson<{ project: ProjectDetail }>(
    `/api/landing/portal/projects/${encodeURIComponent(input.projectId)}`,
    {
      cookieHeader: input.cookieHeader,
    },
  );

  return response.project;
}

export async function fetchProjectLeadsForApp(input: {
  cookieHeader: string;
  projectId: string;
  tab?: "active" | "hidden";
}): Promise<ProjectLead[]> {
  if (shouldUseLocalWorkbenchServer()) {
    return getWorkbenchProjectLeads(input.projectId, {
      cookieHeader: input.cookieHeader,
      tab: input.tab,
    });
  }

  const response = await fetchPortalJson<{ leads: ProjectLead[] }>(
    `/api/landing/portal/projects/${encodeURIComponent(input.projectId)}/leads?tab=${encodeURIComponent(input.tab ?? "active")}`,
    {
      cookieHeader: input.cookieHeader,
    },
  );

  return response.leads;
}

export async function fetchProjectLeadTombstonesForApp(input: {
  cookieHeader: string;
  projectId: string;
}): Promise<ProjectLeadDeletionTombstone[]> {
  if (shouldUseLocalWorkbenchServer()) {
    return getWorkbenchProjectLeadTombstones(input.projectId);
  }

  const response = await fetchPortalJson<{ tombstones: ProjectLeadDeletionTombstone[] }>(
    `/api/landing/portal/projects/${encodeURIComponent(input.projectId)}/leads/tombstones`,
    {
      cookieHeader: input.cookieHeader,
    },
  );

  return response.tombstones;
}

export async function fetchProjectBillingForApp(input: {
  cookieHeader: string;
  projectId: string;
}): Promise<ProjectBillingDetail> {
  if (shouldUseLocalWorkbenchServer()) {
    return getWorkbenchProjectBilling(input.projectId);
  }

  const response = await fetchPortalJson<{ billing: ProjectBillingDetail }>(
    `/api/landing/portal/projects/${encodeURIComponent(input.projectId)}/billing`,
    {
      cookieHeader: input.cookieHeader,
    },
  );

  return response.billing;
}

export async function updateProjectBillingCheckoutIdentityForApp(input: {
  projectId: string;
  billingPhone?: string | null;
}): Promise<{ config: { checkoutPhone: string | null } }> {
  const response = await fetch(
    `${getPublicApiBaseUrl()}/api/landing/portal/projects/${encodeURIComponent(input.projectId)}/billing/checkout-identity`,
    {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        billingPhone: input.billingPhone,
      }),
    },
  );

  return readJson(response);
}

export async function resolveProjectOnboardingForApp(input: {
  cartId: string;
  cookieHeader?: string;
}): Promise<ProjectOnboardingSession> {
  if (shouldUseLocalWorkbenchServer() || shouldUseLocalWorkbenchClient()) {
    return resolveWorkbenchProjectOnboardingFromCartId(input.cartId);
  }

  if (input.cookieHeader) {
    const response = await fetchPortalJson<{ session: ProjectOnboardingSession }>(
      "/api/landing/portal/onboarding/resolve",
      {
        method: "POST",
        cookieHeader: input.cookieHeader,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cartId: input.cartId,
        }),
      },
    );

    return response.session;
  }

  const response = await fetch(
    `${getPublicApiBaseUrl()}/api/landing/portal/onboarding/resolve`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cartId: input.cartId,
      }),
    },
  );

  return readJson<{ session: ProjectOnboardingSession }>(response).then(
    (payload) => payload.session,
  );
}

export async function fetchProjectOnboardingForApp(input: {
  sessionId: string;
  cookieHeader?: string;
}): Promise<ProjectOnboardingSession> {
  if (shouldUseLocalWorkbenchServer() || shouldUseLocalWorkbenchClient()) {
    return getWorkbenchProjectOnboarding(input.sessionId);
  }

  if (input.cookieHeader) {
    const response = await fetchPortalJson<{ session: ProjectOnboardingSession }>(
      `/api/landing/portal/onboarding/${encodeURIComponent(input.sessionId)}`,
      {
        cookieHeader: input.cookieHeader,
      },
    );

    return response.session;
  }

  const response = await fetch(
    `${getPublicApiBaseUrl()}/api/landing/portal/onboarding/${encodeURIComponent(input.sessionId)}`,
    {
      credentials: "include",
      cache: "no-store",
    },
  );

  return readJson<{ session: ProjectOnboardingSession }>(response).then(
    (payload) => payload.session,
  );
}

export async function saveProjectOnboardingForApp(input: {
  sessionId: string;
  intake: Record<string, unknown>;
  lastCompletedStep?: string | null;
}): Promise<ProjectOnboardingSession> {
  if (shouldUseLocalWorkbenchClient()) {
    return saveWorkbenchProjectOnboarding(input);
  }

  const response = await fetch(
    `${getPublicApiBaseUrl()}/api/landing/portal/onboarding/${encodeURIComponent(input.sessionId)}`,
    {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intake: input.intake,
        lastCompletedStep: input.lastCompletedStep,
      }),
    },
  );

  return readJson<{ session: ProjectOnboardingSession }>(response).then(
    (payload) => payload.session,
  );
}

export async function submitProjectOnboardingForApp(
  sessionId: string,
): Promise<ProjectOnboardingSubmitResult> {
  if (shouldUseLocalWorkbenchClient()) {
    return submitWorkbenchProjectOnboarding(sessionId);
  }

  const response = await fetch(
    `${getPublicApiBaseUrl()}/api/landing/portal/onboarding/${encodeURIComponent(sessionId)}/submit`,
    {
      method: "POST",
      credentials: "include",
    },
  );

  return readJson<ProjectOnboardingSubmitResult>(response);
}

export function buildLeadExportUrl(
  projectId: string,
  format: "csv" | "xlsx" = "csv",
  mode: "basic" | "full" = "basic",
): string {
  const params = new URLSearchParams();
  if (mode !== "basic") {
    params.set("mode", mode);
  }

  const query = params.toString();
  return `${getPublicApiBaseUrl()}/api/landing/portal/projects/${encodeURIComponent(projectId)}/leads/export.${format}${query ? `?${query}` : ""}`;
}

export function formatPortalDate(value: string | null): string {
  if (!value) {
    return "Not yet";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export async function fetchPortfolioBillingForApp(
  cookieHeader: string,
): Promise<PortfolioBillingDetail> {
  if (shouldUseLocalWorkbenchServer()) {
    return getWorkbenchPortfolioBilling(cookieHeader);
  }
  const response = await fetchPortalJson<PortfolioBillingDetail>("/api/landing/portal/billing", {
      cookieHeader,
  });

  return response;
}
