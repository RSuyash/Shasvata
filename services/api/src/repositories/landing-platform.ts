import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import type {
  AccessibleProjectRecord,
  AuthCredentialRecord,
  LeadSyncDeliveryAttemptRecord,
  LeadSyncDeliveryStatus,
  LandingPlatformRepository,
  ProjectBillingRecord,
  MdocPushLeadSyncConfig,
  LandingProjectRecord,
  LeadSyncTargetRecord,
  MagicLinkRecord,
  PortalSessionAccessRecord,
  PortalSessionRecord,
  ProjectDomainRecord,
  ProjectInviteRecord,
  ProjectLeadAuditEventRecord,
  ProjectLeadDeletionTombstoneRecord,
  ProjectMemberRecord,
  ProjectNotificationRecipientRecord,
  ProjectProfileRecord,
  PortalUserRecord,
  ProjectAccessRecord,
  ProjectLeadRecord,
  ProjectLeadSyncStatus,
  ProjectSiteRecord,
} from "../services/landing-platform.js";

function mapPortalUser(record: {
  id: string;
  email: string;
  fullName: string | null;
  role: PortalUserRecord["role"];
  status: PortalUserRecord["status"];
  companyName: string | null;
  phone: string | null;
  emailVerifiedAt: Date | null;
}): PortalUserRecord {
  return {
    id: record.id,
    email: record.email,
    fullName: record.fullName,
    role: record.role,
    status: record.status,
    companyName: record.companyName,
    phone: record.phone,
    emailVerifiedAt: record.emailVerifiedAt,
  };
}

function mapProject(record: {
  id: string;
  slug: string;
  name: string;
  status: LandingProjectRecord["status"];
  publicLeadKey: string;
  primaryDomain: string | null;
  clientCompanyName: string | null;
  goLiveAt: Date | null;
}): LandingProjectRecord {
  return {
    id: record.id,
    slug: record.slug,
    name: record.name,
    status: record.status,
    publicLeadKey: record.publicLeadKey,
    primaryDomain: record.primaryDomain,
    clientCompanyName: record.clientCompanyName,
    goLiveAt: record.goLiveAt,
  };
}

function mapProjectProfile(record: {
  id: string;
  slug: string;
  name: string;
  status: LandingProjectRecord["status"];
  publicLeadKey: string;
  primaryDomain: string | null;
  clientCompanyName: string | null;
  goLiveAt: Date | null;
  description: string | null;
  notes: string | null;
}): ProjectProfileRecord {
  return {
    ...mapProject(record),
    description: record.description,
    notes: record.notes,
  };
}

function mapMagicLink(record: {
  id: string;
  portalUserId: string;
  email: string;
  selector: string;
  verifierHash: string;
  redirectPath: string;
  expiresAt: Date;
  consumedAt: Date | null;
}): MagicLinkRecord {
  return {
    id: record.id,
    portalUserId: record.portalUserId,
    email: record.email,
    selector: record.selector,
    verifierHash: record.verifierHash,
    redirectPath: record.redirectPath,
    expiresAt: record.expiresAt,
    consumedAt: record.consumedAt,
  };
}

function mapPortalSession(record: {
  id: string;
  portalUserId: string;
  expiresAt: Date;
}): PortalSessionRecord {
  return {
    id: record.id,
    portalUserId: record.portalUserId,
    expiresAt: record.expiresAt,
  };
}

function mapAuthCredential(record: {
  portalUserId: string;
  kind: AuthCredentialRecord["kind"];
  passwordHash: string | null;
  googleSubject: string | null;
  googleEmail: string | null;
}): AuthCredentialRecord {
  return {
    portalUserId: record.portalUserId,
    kind: record.kind,
    passwordHash: record.passwordHash,
    googleSubject: record.googleSubject,
    googleEmail: record.googleEmail,
  };
}

function mapEmailVerificationToken(record: {
  id: string;
  portalUserId: string;
  email: string;
  selector: string;
  verifierHash: string;
  expiresAt: Date;
  consumedAt: Date | null;
}) {
  return {
    id: record.id,
    portalUserId: record.portalUserId,
    email: record.email,
    selector: record.selector,
    verifierHash: record.verifierHash,
    expiresAt: record.expiresAt,
    consumedAt: record.consumedAt,
  };
}

function mapPasswordResetToken(record: {
  id: string;
  portalUserId: string;
  selector: string;
  verifierHash: string;
  expiresAt: Date;
  consumedAt: Date | null;
}) {
  return {
    id: record.id,
    portalUserId: record.portalUserId,
    selector: record.selector,
    verifierHash: record.verifierHash,
    expiresAt: record.expiresAt,
    consumedAt: record.consumedAt,
  };
}

function mapLeadSyncTarget(record: {
  id: string;
  projectId: string;
  kind: LeadSyncTargetRecord["kind"];
  status: LeadSyncTargetRecord["status"];
  label: string | null;
  config: unknown;
  deliveryAttempts?: Array<{
    id: string;
    projectLeadId: string;
    projectId: string;
    targetId: string;
    kind: LeadSyncTargetRecord["kind"];
    status: LeadSyncDeliveryStatus;
    responseCode: number | null;
    responseBody: string | null;
    errorMessage: string | null;
    metadata: Prisma.JsonValue | null;
    attemptedAt: Date;
    deliveredAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }>;
}): LeadSyncTargetRecord {
  const googleSheetsConfig = (record.config ?? {}) as {
    spreadsheetId?: string;
    sheetName?: string;
  };
  const mdocConfig = (record.config ?? {}) as Partial<MdocPushLeadSyncConfig>;

  return {
    id: record.id,
    projectId: record.projectId,
    kind: record.kind,
    status: record.status,
    label: record.label,
    config:
      record.kind === "MDOC_PUSH"
        ? {
            endpoint: String(mdocConfig.endpoint ?? ""),
            apiKey: String(mdocConfig.apiKey ?? ""),
            dataFrom: mdocConfig.dataFrom === "T" ? "T" : "E",
            source: String(mdocConfig.source ?? ""),
            fallbackSourceDetail: String(mdocConfig.fallbackSourceDetail ?? ""),
            sourceDetailRules:
              mdocConfig.sourceDetailRules && typeof mdocConfig.sourceDetailRules === "object"
                ? Object.fromEntries(
                    Object.entries(mdocConfig.sourceDetailRules).map(([key, value]) => [
                      key,
                      String(value),
                    ]),
                  )
                : undefined,
            staticDefaults:
              mdocConfig.staticDefaults && typeof mdocConfig.staticDefaults === "object"
                ? Object.fromEntries(
                    Object.entries(mdocConfig.staticDefaults).map(([key, value]) => [
                      key,
                      String(value),
                    ]),
                  )
                : undefined,
            enumMappings:
              mdocConfig.enumMappings && typeof mdocConfig.enumMappings === "object"
                ? (mdocConfig.enumMappings as MdocPushLeadSyncConfig["enumMappings"])
                : undefined,
          }
        : {
            spreadsheetId: String(googleSheetsConfig.spreadsheetId ?? ""),
            sheetName: String(googleSheetsConfig.sheetName ?? ""),
          },
    latestDeliveryAttempt: record.deliveryAttempts?.[0]
      ? mapLeadSyncDeliveryAttempt(record.deliveryAttempts[0])
      : null,
  };
}

function mapLeadSyncDeliveryAttempt(record: {
  id: string;
  projectLeadId: string;
  projectId: string;
  targetId: string;
  kind: LeadSyncTargetRecord["kind"];
  status: LeadSyncDeliveryStatus;
  responseCode: number | null;
  responseBody: string | null;
  errorMessage: string | null;
  metadata: Prisma.JsonValue | null;
  attemptedAt: Date;
  deliveredAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): LeadSyncDeliveryAttemptRecord {
  return {
    id: record.id,
    projectLeadId: record.projectLeadId,
    projectId: record.projectId,
    targetId: record.targetId,
    kind: record.kind,
    status: record.status,
    responseCode: record.responseCode,
    responseBody: record.responseBody,
    errorMessage: record.errorMessage,
    metadata: readJsonObject(record.metadata),
    attemptedAt: record.attemptedAt,
    deliveredAt: record.deliveredAt,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

function mapProjectSite(record: {
  id: string;
  projectId: string;
  slug: string;
  templateKey: string;
  themeKey: string | null;
  sourceProvider: ProjectSiteRecord["sourceProvider"];
  repoUrl: string | null;
  repoBranch: string | null;
  repoRef: string | null;
  deployedCommit: string | null;
  runtimeProfile: ProjectSiteRecord["runtimeProfile"];
  operatorNotes: string | null;
  ga4MeasurementId: string | null;
  googleAdsTagId: string | null;
  googleAdsConversionMode: ProjectSiteRecord["googleAdsConversionMode"];
  googleAdsLeadConversionLabel: string | null;
  gtmContainerId: string | null;
  metaPixelId: string | null;
  trackingNotes: string | null;
  publishStatus: ProjectSiteRecord["publishStatus"];
  lastPublishedAt: Date | null;
  previewHost: string | null;
  latestPreviewPath: string | null;
}): ProjectSiteRecord {
  return {
    id: record.id,
    projectId: record.projectId,
    slug: record.slug,
    templateKey: record.templateKey,
    themeKey: record.themeKey,
    sourceProvider: record.sourceProvider,
    repoUrl: record.repoUrl,
    repoBranch: record.repoBranch,
    repoRef: record.repoRef,
    deployedCommit: record.deployedCommit,
    runtimeProfile: record.runtimeProfile,
    operatorNotes: record.operatorNotes,
    ga4MeasurementId: record.ga4MeasurementId,
    googleAdsTagId: record.googleAdsTagId,
    googleAdsConversionMode: record.googleAdsConversionMode,
    googleAdsLeadConversionLabel: record.googleAdsLeadConversionLabel,
    gtmContainerId: record.gtmContainerId,
    metaPixelId: record.metaPixelId,
    trackingNotes: record.trackingNotes,
    publishStatus: record.publishStatus,
    lastPublishedAt: record.lastPublishedAt,
    previewHost: record.previewHost,
    latestPreviewPath: record.latestPreviewPath,
  };
}

function mapProjectDomain(record: {
  id: string;
  projectId: string;
  siteId: string | null;
  host: string;
  status: ProjectDomainRecord["status"];
  isPrimary: boolean;
  dnsTarget: string | null;
  verifiedAt: Date | null;
}): ProjectDomainRecord {
  return {
    id: record.id,
    projectId: record.projectId,
    siteId: record.siteId,
    host: record.host,
    status: record.status,
    isPrimary: record.isPrimary,
    dnsTarget: record.dnsTarget,
    verifiedAt: record.verifiedAt,
  };
}

function mapProjectMember(record: {
  portalUserId: string;
  role: ProjectMemberRecord["role"];
  portalUser: {
    email: string;
    fullName: string | null;
    status: ProjectMemberRecord["status"];
  };
}): ProjectMemberRecord {
  return {
    portalUserId: record.portalUserId,
    email: record.portalUser.email,
    fullName: record.portalUser.fullName,
    role: record.role,
    status: record.portalUser.status,
  };
}

function mapProjectNotificationRecipient(record: {
  id: string;
  projectId: string;
  email: string;
  label: string | null;
  createdAt: Date;
  updatedAt: Date;
}): ProjectNotificationRecipientRecord {
  return {
    id: record.id,
    projectId: record.projectId,
    email: record.email,
    label: record.label,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

function readJsonObject(
  value: Prisma.JsonValue | null | undefined,
): Record<string, Prisma.JsonValue> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, Prisma.JsonValue>;
}

function readJsonStringArray(value: Prisma.JsonValue | null | undefined): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((entry): entry is string => typeof entry === "string")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function readJsonString(value: Prisma.JsonValue | null | undefined): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function readMetadataRecord(
  value: Prisma.JsonValue | null | undefined,
): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function humanizeLeadValue(value: string | null | undefined): string | null {
  if (!value?.trim()) {
    return null;
  }

  return value
    .trim()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function detectInternalLead(record: {
  email: string;
  sourcePage: string | null;
  sourceCta: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  problemSummary: string | null;
  message: string | null;
}): boolean {
  const email = record.email.trim().toLowerCase();
  const sourceBits = [
    record.sourcePage,
    record.sourceCta,
    record.utmSource,
    record.utmMedium,
    record.utmCampaign,
    record.problemSummary,
    record.message,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return (
    email.includes("smoke") ||
    email.includes("portal-smoke") ||
    email.includes("live-check") ||
    email.includes("qa") ||
    email.includes("rsuyash") ||
    email.endsWith("@shasvata.com") ||
    sourceBits.includes("portal-smoke") ||
    sourceBits.includes("livecheck") ||
    sourceBits.includes("rsuyash") ||
    sourceBits.includes("codex-email-test") ||
    sourceBits.includes("smoke test") ||
    sourceBits.includes("live form verification")
  );
}

function mapProjectLead(record: {
  id: string;
  projectId: string;
  sourceSubmissionId?: string | null;
  fullName: string;
  email: string;
  phone: string | null;
  companyName: string | null;
  message: string | null;
  consent: boolean;
  payload?: Prisma.JsonValue | null;
  originHost?: string | null;
  sourceKind?: ProjectLeadRecord["sourceKind"];
  connectorId?: string | null;
  campaignId?: string | null;
  importBatchId?: string | null;
  externalLeadId?: string | null;
  capturedAt?: Date | null;
  syncStatus: ProjectLeadRecord["syncStatus"];
  syncError: string | null;
  visibilityState?: ProjectLeadRecord["visibilityState"];
  hiddenAt?: Date | null;
  hiddenByPortalUserId?: string | null;
  hiddenReasonCode?: string | null;
  hiddenReasonNote?: string | null;
  lastRestoredAt?: Date | null;
  lastRestoredByPortalUserId?: string | null;
  createdAt: Date;
  hiddenByPortalUser?: {
    email: string;
    fullName: string | null;
  } | null;
  lastRestoredByPortalUser?: {
    email: string;
    fullName: string | null;
  } | null;
  sourceConnector?: {
    label: string;
  } | null;
  acquisitionCampaign?: {
    name: string;
  } | null;
  importBatch?: {
    id: string;
    label: string | null;
    filename: string | null;
  } | null;
  auditEvents?: Array<{
    id: string;
    projectId: string;
    projectLeadId: string;
    actorUserId: string | null;
    type: ProjectLeadAuditEventRecord["type"];
    reasonCode: string | null;
    note: string | null;
    metadata: Prisma.JsonValue | null;
    createdAt: Date;
    actorUser?: {
      email: string;
      fullName: string | null;
    } | null;
  }>;
  sourceSubmission?: {
    leadId: string;
    sourcePage: string | null;
    sourceCta: string | null;
    utmSource: string | null;
    utmMedium: string | null;
    utmCampaign: string | null;
    serviceInterest?: Prisma.JsonValue | null;
    budgetRange?: string | null;
    timeline?: string | null;
    problemSummary?: string | null;
    notificationStatus: ProjectLeadRecord["notificationStatus"];
    notificationError: string | null;
  } | null;
}): ProjectLeadRecord {
  const payload = readJsonObject(record.payload);
  const serviceInterestFromSource = readJsonStringArray(
    record.sourceSubmission?.serviceInterest,
  );
  const serviceInterest =
    serviceInterestFromSource.length > 0
      ? serviceInterestFromSource
      : readJsonStringArray(payload?.["serviceInterest"]);
  const budgetRange =
    record.sourceSubmission?.budgetRange ??
    readJsonString(payload?.["budgetRange"]);
  const timeline =
    record.sourceSubmission?.timeline ??
    readJsonString(payload?.["timeline"]);
  const problemSummary =
    record.sourceSubmission?.problemSummary ??
    readJsonString(payload?.["problemSummary"]) ??
    record.message;
  const sourcePage = record.sourceSubmission?.sourcePage ?? readJsonString(payload?.["sourcePage"]);
  const sourceCta = record.sourceSubmission?.sourceCta ?? readJsonString(payload?.["sourceCta"]);
  const utmSource = record.sourceSubmission?.utmSource ?? readJsonString(payload?.["utmSource"]);
  const utmMedium = record.sourceSubmission?.utmMedium ?? readJsonString(payload?.["utmMedium"]);
  const utmCampaign =
    record.sourceSubmission?.utmCampaign ?? readJsonString(payload?.["utmCampaign"]);
  const utmContent = readJsonString(payload?.["utmContent"]);
  const utmTerm = readJsonString(payload?.["utmTerm"]);
  const gclid = readJsonString(payload?.["gclid"]);
  const gbraid = readJsonString(payload?.["gbraid"]);
  const wbraid = readJsonString(payload?.["wbraid"]);
  const sourceHost =
    record.originHost ??
    readJsonString(payload?.["originHost"]) ??
    (sourcePage
      ? (() => {
          try {
            return new URL(sourcePage).host.trim().toLowerCase();
          } catch {
            return null;
          }
        })()
      : null);

  return {
    id: record.id,
    projectId: record.projectId,
    sourceLeadId: record.sourceSubmission?.leadId ?? null,
    fullName: record.fullName,
    email: record.email,
    phone: record.phone,
    companyName: record.companyName,
    message: record.message,
    consent: record.consent,
    sourcePage,
    sourceCta,
    utmSource,
    utmMedium,
    utmCampaign,
    utmContent,
    utmTerm,
    gclid,
    gbraid,
    wbraid,
    sourceKind: record.sourceKind ?? "WEB_FORM",
    connectorId: record.connectorId ?? null,
    sourceConnectorLabel: record.sourceConnector?.label ?? null,
    campaignId: record.campaignId ?? null,
    campaignName: record.acquisitionCampaign?.name ?? null,
    importBatchId: record.importBatchId ?? null,
    importBatchLabel: record.importBatch?.label ?? record.importBatch?.filename ?? null,
    externalLeadId: record.externalLeadId ?? null,
    capturedAt: record.capturedAt ?? null,
    notificationStatus: record.sourceSubmission?.notificationStatus ?? null,
    notificationError: record.sourceSubmission?.notificationError ?? null,
    syncStatus: record.syncStatus,
    syncError: record.syncError,
    visibilityState: record.visibilityState ?? "VISIBLE",
    hiddenAt: record.hiddenAt ?? null,
    hiddenByPortalUserId: record.hiddenByPortalUserId ?? null,
    hiddenByUserEmail: record.hiddenByPortalUser?.email ?? null,
    hiddenByUserFullName: record.hiddenByPortalUser?.fullName ?? null,
    hiddenReasonCode: record.hiddenReasonCode ?? null,
    hiddenReasonNote: record.hiddenReasonNote ?? null,
    lastRestoredAt: record.lastRestoredAt ?? null,
    lastRestoredByPortalUserId: record.lastRestoredByPortalUserId ?? null,
    lastRestoredByUserEmail: record.lastRestoredByPortalUser?.email ?? null,
    lastRestoredByUserFullName: record.lastRestoredByPortalUser?.fullName ?? null,
    sourceHost,
    serviceInterest,
    budgetRange,
    timeline,
    problemSummary,
    interestLabel: humanizeLeadValue(serviceInterest[0] ?? null),
    budgetLabel: humanizeLeadValue(budgetRange),
    touchpointLabel: humanizeLeadValue(sourceCta),
    isInternalTest: detectInternalLead({
      email: record.email,
      sourcePage,
      sourceCta,
      utmSource,
      utmMedium,
      utmCampaign,
      problemSummary,
      message: record.message,
    }),
    auditEvents: (record.auditEvents ?? []).map((event) => ({
      id: event.id,
      projectId: event.projectId,
      projectLeadId: event.projectLeadId,
      actorUserId: event.actorUserId,
      actorUserEmail: event.actorUser?.email ?? null,
      actorUserFullName: event.actorUser?.fullName ?? null,
      type: event.type,
      reasonCode: event.reasonCode ?? null,
      note: event.note ?? null,
      metadata: readMetadataRecord(event.metadata),
      createdAt: event.createdAt,
    })),
    createdAt: record.createdAt,
  };
}

function mapProjectLeadDeletionTombstone(record: {
  id: string;
  projectId: string;
  deletedProjectLeadId: string;
  deletedSourceLeadId: string | null;
  deletedByUserId: string | null;
  reasonCode: string | null;
  note: string | null;
  createdAt: Date;
  deletedByUser?: {
    email: string;
    fullName: string | null;
  } | null;
}): ProjectLeadDeletionTombstoneRecord {
  return {
    id: record.id,
    projectId: record.projectId,
    deletedProjectLeadId: record.deletedProjectLeadId,
    deletedSourceLeadId: record.deletedSourceLeadId,
    deletedByUserId: record.deletedByUserId,
    deletedByUserEmail: record.deletedByUser?.email ?? null,
    deletedByUserFullName: record.deletedByUser?.fullName ?? null,
    reasonCode: record.reasonCode ?? null,
    note: record.note ?? null,
    createdAt: record.createdAt,
  };
}

function mapProjectInvite(record: {
  id: string;
  projectId: string;
  email: string;
  fullName: string | null;
  role: ProjectInviteRecord["role"];
  invitedByPortalUserId: string;
  acceptedByPortalUserId: string | null;
  selector: string;
  verifierHash: string;
  status: ProjectInviteRecord["status"];
  expiresAt: Date;
  acceptedAt: Date | null;
  revokedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  invitedByPortalUser?: {
    email: string;
    fullName: string | null;
  } | null;
  acceptedByPortalUser?: {
    email: string;
    fullName: string | null;
  } | null;
}): ProjectInviteRecord {
  return {
    id: record.id,
    projectId: record.projectId,
    email: record.email,
    fullName: record.fullName,
    role: record.role,
    invitedByPortalUserId: record.invitedByPortalUserId,
    invitedByUserEmail: record.invitedByPortalUser?.email ?? null,
    invitedByUserFullName: record.invitedByPortalUser?.fullName ?? null,
    acceptedByPortalUserId: record.acceptedByPortalUserId,
    acceptedByUserEmail: record.acceptedByPortalUser?.email ?? null,
    acceptedByUserFullName: record.acceptedByPortalUser?.fullName ?? null,
    selector: record.selector,
    verifierHash: record.verifierHash,
    status: record.status,
    expiresAt: record.expiresAt,
    acceptedAt: record.acceptedAt,
    revokedAt: record.revokedAt,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

function mapProjectBillingRecord(record: {
  id: string;
  buyerEmail: string | null;
  status: string;
  flowMode: string;
  totalMinor: number;
  payableTodayMinor: number;
  remainingAfterTodayMinor: number;
  erpQuotationId: string | null;
  erpSalesOrderId: string | null;
  erpCustomerId: string | null;
  updatedAt: Date;
  quoteRequest: {
    status: string;
  } | null;
  checkoutSessions: Array<{
    status: string;
    paymentSessionId: string | null;
    providerOrderId: string | null;
  }>;
}): ProjectBillingRecord {
  const latestCheckout = record.checkoutSessions[0] ?? null;

  return {
    id: record.id,
    buyerEmail: record.buyerEmail,
    status: record.status,
    flowMode: record.flowMode,
    totalMinor: record.totalMinor,
    payableTodayMinor: record.payableTodayMinor,
    remainingAfterTodayMinor: record.remainingAfterTodayMinor,
    erpQuotationId: record.erpQuotationId,
    erpSalesOrderId: record.erpSalesOrderId,
    erpCustomerId: record.erpCustomerId,
    quoteRequestStatus: record.quoteRequest?.status ?? null,
    latestCheckoutStatus: latestCheckout?.status ?? null,
    latestPaymentSessionId: latestCheckout?.paymentSessionId ?? null,
    latestProviderOrderId: latestCheckout?.providerOrderId ?? null,
    updatedAt: record.updatedAt,
  };
}

export function createLandingPlatformRepository(): LandingPlatformRepository {
  return {
    async findPortalUserByEmail(email) {
      const record = await prisma.portalUser.findUnique({
        where: { email },
      });

      return record ? mapPortalUser(record) : null;
    },

    async findPortalUserById(portalUserId) {
      const record = await prisma.portalUser.findUnique({
        where: { id: portalUserId },
      });

      return record ? mapPortalUser(record) : null;
    },

    async countPlatformAdmins() {
      return prisma.portalUser.count({
        where: {
          role: "PLATFORM_ADMIN",
        },
      });
    },

    async findAuthCredentialByEmail(email) {
      const record = await prisma.portalUser.findUnique({
        where: { email },
        include: {
          authCredential: true,
        },
      });

      if (!record || !record.authCredential) {
        return null;
      }

      return {
        portalUser: mapPortalUser(record),
        credential: mapAuthCredential(record.authCredential),
      };
    },

    async findAuthCredentialByGoogleSubject(googleSubject) {
      const record = await prisma.authCredential.findUnique({
        where: { googleSubject },
        include: {
          portalUser: true,
        },
      });

      if (!record) {
        return null;
      }

      return {
        portalUser: mapPortalUser(record.portalUser),
        credential: mapAuthCredential(record),
      };
    },

    async createPortalUser(input) {
      const record = await prisma.portalUser.create({
        data: {
          email: input.email,
          fullName: input.fullName ?? null,
          role: input.role,
          status: input.status,
          companyName: input.companyName ?? null,
          phone: input.phone ?? null,
          emailVerifiedAt: input.emailVerifiedAt ?? null,
        },
      });

      return mapPortalUser(record);
    },

    async updatePortalUser(input) {
      const record = await prisma.portalUser.update({
        where: { id: input.portalUserId },
        data: {
          fullName: input.fullName,
          phone: input.phone,
          status: input.status,
          emailVerifiedAt: input.emailVerifiedAt,
        },
      });

      return mapPortalUser(record);
    },

    async upsertAuthCredential(input) {
      const passwordUpdatedAt = input.passwordHash ? new Date() : null;
      const record = await prisma.authCredential.upsert({
        where: {
          portalUserId: input.portalUserId,
        },
        update: {
          kind: input.kind,
          passwordHash: input.passwordHash ?? null,
          googleSubject: input.googleSubject ?? null,
          googleEmail: input.googleEmail ?? null,
          passwordUpdatedAt,
        },
        create: {
          portalUserId: input.portalUserId,
          kind: input.kind,
          passwordHash: input.passwordHash ?? null,
          googleSubject: input.googleSubject ?? null,
          googleEmail: input.googleEmail ?? null,
          passwordUpdatedAt,
        },
      });

      return mapAuthCredential(record);
    },

    async createEmailVerificationToken(input) {
      const record = await prisma.emailVerificationToken.create({
        data: {
          portalUserId: input.portalUserId,
          email: input.email,
          selector: input.selector,
          verifierHash: input.verifierHash,
          expiresAt: input.expiresAt,
        },
      });

      return mapEmailVerificationToken(record);
    },

    async consumeEmailVerificationToken(input) {
      return prisma.$transaction(async (tx) => {
        const existing = await tx.emailVerificationToken.findUnique({
          where: { selector: input.selector },
        });

        if (
          !existing ||
          existing.verifierHash !== input.verifierHash ||
          existing.consumedAt !== null ||
          existing.expiresAt <= input.now
        ) {
          return null;
        }

        const consumed = await tx.emailVerificationToken.update({
          where: { id: existing.id },
          data: { consumedAt: input.now },
        });

        return mapEmailVerificationToken(consumed);
      });
    },

    async createPasswordResetToken(input) {
      const record = await prisma.passwordResetToken.create({
        data: {
          portalUserId: input.portalUserId,
          selector: input.selector,
          verifierHash: input.verifierHash,
          expiresAt: input.expiresAt,
        },
      });

      return mapPasswordResetToken(record);
    },

    async consumePasswordResetToken(input) {
      return prisma.$transaction(async (tx) => {
        const existing = await tx.passwordResetToken.findUnique({
          where: { selector: input.selector },
        });

        if (
          !existing ||
          existing.verifierHash !== input.verifierHash ||
          existing.consumedAt !== null ||
          existing.expiresAt <= input.now
        ) {
          return null;
        }

        const consumed = await tx.passwordResetToken.update({
          where: { id: existing.id },
          data: { consumedAt: input.now },
        });

        return mapPasswordResetToken(consumed);
      });
    },

    async createMagicLink(input) {
      const record = await prisma.portalMagicLink.create({
        data: {
          portalUserId: input.portalUserId,
          email: input.email,
          selector: input.selector,
          verifierHash: input.verifierHash,
          redirectPath: input.redirectPath,
          expiresAt: input.expiresAt,
        },
      });

      return mapMagicLink(record);
    },

    async consumeMagicLink(input) {
      return prisma.$transaction(async (tx) => {
        const existing = await tx.portalMagicLink.findUnique({
          where: { selector: input.selector },
        });

        if (
          !existing ||
          existing.verifierHash !== input.verifierHash ||
          existing.consumedAt !== null ||
          existing.expiresAt <= input.now
        ) {
          return null;
        }

        const consumed = await tx.portalMagicLink.update({
          where: { id: existing.id },
          data: { consumedAt: input.now },
        });

        return mapMagicLink(consumed);
      });
    },

    async createPortalSession(input) {
      const record = await prisma.portalSession.create({
        data: {
          portalUserId: input.portalUserId,
          expiresAt: input.expiresAt,
        },
      });

      return mapPortalSession(record);
    },

    async findPortalSession(input) {
      const record = await prisma.portalSession.findUnique({
        where: { id: input.sessionId },
        include: {
          portalUser: true,
        },
      });

      if (!record || record.expiresAt <= input.now || record.portalUser.status !== "ACTIVE") {
        return null;
      }

      return {
        session: mapPortalSession(record),
        portalUser: mapPortalUser(record.portalUser),
      } satisfies PortalSessionAccessRecord;
    },

    async deletePortalSession(sessionId) {
      await prisma.portalSession.deleteMany({
        where: { id: sessionId },
      });
    },

    async deletePortalSessionsForUser(portalUserId) {
      await prisma.portalSession.deleteMany({
        where: { portalUserId },
      });
    },

    async listProjectsForPortalUser(portalUser) {
      if (portalUser.role === "PLATFORM_ADMIN" || portalUser.role === "PLATFORM_OPERATOR") {
        const records = await prisma.project.findMany({
          orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
        });

        return records.map(
          (record): AccessibleProjectRecord => ({
            ...mapProject(record),
            membershipRole: "OWNER",
          }),
        );
      }

      const records = await prisma.projectMembership.findMany({
        where: {
          portalUserId: portalUser.id,
        },
        include: {
          project: true,
        },
        orderBy: {
          updatedAt: "desc",
        },
      });

      return records.map(
        (record): AccessibleProjectRecord => ({
          ...mapProject(record.project),
          membershipRole: record.role,
        }),
      );
    },

    async findProjectById(projectId) {
      const record = await prisma.project.findUnique({
        where: { id: projectId },
      });

      return record ? mapProjectProfile(record) : null;
    },

    async findProjectByPublicLeadKey(publicLeadKey) {
      const record = await prisma.project.findUnique({
        where: { publicLeadKey },
      });

      return record ? mapProject(record) : null;
    },

    async createImportedProject(input) {
      return prisma.$transaction(async (tx) => {
        const project = await tx.project.create({
          data: {
            slug: input.slug,
            name: input.name,
            status: "DRAFT",
            publicLeadKey: input.publicLeadKey,
            primaryDomain: input.desiredLiveDomain ?? null,
            clientCompanyName: input.clientCompanyName ?? null,
            notes: input.operatorNotes ?? null,
            sites: {
              create: {
                slug: input.slug,
                templateKey: "imported-repo-v1",
                sourceProvider: "GIT_REPOSITORY",
                repoUrl: input.repoUrl,
                repoBranch: input.repoBranch ?? null,
                repoRef: input.repoRef ?? null,
                runtimeProfile: input.runtimeProfile,
                operatorNotes: input.operatorNotes ?? null,
                previewHost: input.previewHost,
                contentConfig: {},
                formConfig: Prisma.JsonNull,
              },
            },
          },
          include: {
            sites: true,
          },
        });

        let domainRecord = null;
        if (input.desiredLiveDomain) {
          domainRecord = await tx.projectDomain.create({
            data: {
              projectId: project.id,
              siteId: project.sites[0]?.id ?? null,
              host: input.desiredLiveDomain,
              status: "PENDING",
              isPrimary: true,
              dnsTarget: input.dnsTarget ?? null,
            },
          });

          await tx.projectEvent.create({
            data: {
              projectId: project.id,
              siteId: project.sites[0]?.id ?? null,
              actorUserId: input.actorUserId,
              type: "DOMAIN_ADDED",
              status: "PENDING",
              payload: {
                host: input.desiredLiveDomain,
                dnsTarget: input.dnsTarget ?? null,
              },
              createdAt: input.createdAt,
            },
          });
        }

        return {
          project: mapProjectProfile(project),
          site: mapProjectSite(project.sites[0]!),
          domain: domainRecord ? mapProjectDomain(domainRecord) : null,
        };
      });
    },

    async listLeadSyncTargets(projectId) {
      const records = await prisma.leadSyncTarget.findMany({
        where: { projectId },
        orderBy: { createdAt: "asc" },
        include: {
          deliveryAttempts: {
            orderBy: [{ attemptedAt: "desc" }, { createdAt: "desc" }],
            take: 1,
          },
        },
      });

      return records.map(mapLeadSyncTarget);
    },

    async upsertLeadSyncTarget(input) {
      const existing = await prisma.leadSyncTarget.findFirst({
        where: {
          projectId: input.projectId,
          kind: input.kind,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      const record = existing
        ? await prisma.leadSyncTarget.update({
            where: { id: existing.id },
            data: {
              status: input.status,
              label: input.label ?? null,
              config: input.config as Prisma.InputJsonValue,
            },
            include: {
              deliveryAttempts: {
                orderBy: [{ attemptedAt: "desc" }, { createdAt: "desc" }],
                take: 1,
              },
            },
          })
        : await prisma.leadSyncTarget.create({
            data: {
              projectId: input.projectId,
              kind: input.kind,
              status: input.status,
              label: input.label ?? null,
              config: input.config as Prisma.InputJsonValue,
            },
            include: {
              deliveryAttempts: {
                orderBy: [{ attemptedAt: "desc" }, { createdAt: "desc" }],
                take: 1,
              },
            },
          });

      return mapLeadSyncTarget(record);
    },

    async createLeadSyncDeliveryAttempt(input) {
      const record = await prisma.leadSyncDeliveryAttempt.create({
        data: {
          projectLeadId: input.projectLeadId,
          projectId: input.projectId,
          targetId: input.targetId,
          kind: input.kind,
          status: input.status,
          attemptedAt: input.attemptedAt,
          metadata: (input.metadata ?? Prisma.JsonNull) as Prisma.InputJsonValue,
        },
      });

      return mapLeadSyncDeliveryAttempt(record);
    },

    async updateLeadSyncDeliveryAttempt(input) {
      const record = await prisma.leadSyncDeliveryAttempt.update({
        where: { id: input.attemptId },
        data: {
          status: input.status,
          responseCode: input.responseCode ?? null,
          responseBody: input.responseBody ?? null,
          errorMessage: input.errorMessage ?? null,
          metadata:
            input.metadata === undefined
              ? undefined
              : ((input.metadata ?? Prisma.JsonNull) as Prisma.InputJsonValue),
          deliveredAt:
            input.deliveredAt === undefined ? undefined : input.deliveredAt,
        },
      });

      return mapLeadSyncDeliveryAttempt(record);
    },

    async listProjectSites(projectId) {
      const records = await prisma.projectSite.findMany({
        where: { projectId },
        orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      });

      return records.map(mapProjectSite);
    },

    async findProjectSite(input) {
      const record = await prisma.projectSite.findFirst({
        where: {
          id: input.siteId,
          projectId: input.projectId,
        },
      });

      return record ? mapProjectSite(record) : null;
    },

    async updateProjectSiteSource(input) {
      const record = await prisma.projectSite.update({
        where: { id: input.siteId },
        data: {
          repoUrl: input.repoUrl,
          repoBranch: input.repoBranch,
          repoRef: input.repoRef,
          deployedCommit: input.deployedCommit,
          runtimeProfile: input.runtimeProfile,
          operatorNotes: input.operatorNotes,
          sourceProvider:
            input.repoUrl || input.repoBranch || input.repoRef
              ? "GIT_REPOSITORY"
              : undefined,
        },
      });

      return mapProjectSite(record);
    },

    async updateProjectSiteTracking(input) {
      const record = await prisma.projectSite.update({
        where: { id: input.siteId },
        data: {
          ga4MeasurementId: input.ga4MeasurementId,
          googleAdsTagId: input.googleAdsTagId,
          googleAdsConversionMode: input.googleAdsConversionMode,
          googleAdsLeadConversionLabel: input.googleAdsLeadConversionLabel,
          gtmContainerId: input.gtmContainerId,
          metaPixelId: input.metaPixelId,
          trackingNotes: input.trackingNotes,
        },
      });

      return mapProjectSite(record);
    },

    async updateProjectSitePublishState(input) {
      const previewUrl = input.previewHost ? `https://${input.previewHost}` : null;
      const record = await prisma.projectSite.update({
        where: { id: input.siteId },
        data: {
          publishStatus: input.publishStatus,
          runtimeProfile: input.runtimeProfile,
          deployedCommit: input.deployedCommit,
          previewHost: input.previewHost ?? undefined,
          lastPublishedAt: input.lastPublishedAt,
          latestPreviewPath: previewUrl,
        },
      });

      return mapProjectSite(record);
    },

    async listProjectDomains(projectId) {
      const records = await prisma.projectDomain.findMany({
        where: { projectId },
        orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
      });

      return records.map(mapProjectDomain);
    },

    async findProjectDomain(input) {
      const record = await prisma.projectDomain.findFirst({
        where: {
          id: input.domainId,
          projectId: input.projectId,
        },
      });

      return record ? mapProjectDomain(record) : null;
    },

    async upsertProjectDomain(input) {
      return prisma.$transaction(async (tx) => {
        const existing = await tx.projectDomain.findUnique({
          where: { host: input.host },
        });

        if (input.isPrimary) {
          await tx.projectDomain.updateMany({
            where: { projectId: input.projectId },
            data: { isPrimary: false },
          });
        }

        const record = existing
          ? await tx.projectDomain.update({
              where: { id: existing.id },
              data: {
                projectId: input.projectId,
                siteId: input.siteId ?? null,
                status: existing.status,
                isPrimary: input.isPrimary,
                dnsTarget: input.dnsTarget ?? null,
              },
            })
          : await tx.projectDomain.create({
              data: {
                projectId: input.projectId,
                siteId: input.siteId ?? null,
                host: input.host,
                status: "PENDING",
                isPrimary: input.isPrimary,
                dnsTarget: input.dnsTarget ?? null,
                createdAt: input.createdAt,
              },
            });

        await tx.project.update({
          where: { id: input.projectId },
          data: {
            primaryDomain: input.isPrimary ? input.host : undefined,
          },
        });

        await tx.projectEvent.create({
          data: {
            projectId: input.projectId,
            siteId: input.siteId ?? null,
            actorUserId: input.actorUserId,
            type: "DOMAIN_ADDED",
            status: record.status,
            payload: {
              host: record.host,
              dnsTarget: record.dnsTarget,
              isPrimary: record.isPrimary,
            },
            createdAt: input.createdAt,
          },
        });

        return mapProjectDomain(record);
      });
    },

    async updateProjectDomainVerification(input) {
      return prisma.$transaction(async (tx) => {
        const record = await tx.projectDomain.update({
          where: { id: input.domainId },
          data: {
            status: input.status,
            verifiedAt: input.verifiedAt,
          },
        });

        await tx.projectEvent.create({
          data: {
            projectId: input.projectId,
            siteId: record.siteId ?? null,
            actorUserId: input.actorUserId,
            type: "DOMAIN_VERIFIED",
            status: input.status,
            payload: {
              host: record.host,
              verifiedAt: input.verifiedAt?.toISOString() ?? null,
            },
            createdAt: input.checkedAt,
          },
        });

        return mapProjectDomain(record);
      });
    },

    async listProjectMembers(projectId) {
      const records = await prisma.projectMembership.findMany({
        where: { projectId },
        include: {
          portalUser: true,
        },
        orderBy: [{ role: "asc" }, { createdAt: "asc" }],
      });

      return records.map(mapProjectMember);
    },

    async listProjectNotificationRecipients(projectId) {
      const records = await prisma.projectNotificationRecipient.findMany({
        where: { projectId },
        orderBy: [{ createdAt: "asc" }, { email: "asc" }],
      });

      return records.map(mapProjectNotificationRecipient);
    },

    async listProjectBillingRecords(projectId) {
      const memberships = await prisma.projectMembership.findMany({
        where: { projectId },
        include: {
          portalUser: true,
        },
      });

      const portalUserIds = memberships.map((membership) => membership.portalUserId);
      const memberEmails = memberships.map((membership) => membership.portalUser.email);

      if (portalUserIds.length === 0 && memberEmails.length === 0) {
        return [];
      }

      const records = await prisma.cart.findMany({
        where: {
          OR: [
            portalUserIds.length ? { portalUserId: { in: portalUserIds } } : undefined,
            memberEmails.length ? { buyerEmail: { in: memberEmails } } : undefined,
          ].filter(Boolean) as Prisma.CartWhereInput[],
        },
        include: {
          quoteRequest: true,
          checkoutSessions: {
            orderBy: {
              createdAt: "desc",
            },
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
      });

      return records.map(mapProjectBillingRecord);
    },

    async upsertProjectNotificationRecipient(input) {
      const record = await prisma.projectNotificationRecipient.upsert({
        where: {
          projectId_email: {
            projectId: input.projectId,
            email: input.email,
          },
        },
        update: {
          label: input.label ?? null,
        },
        create: {
          projectId: input.projectId,
          email: input.email,
          label: input.label ?? null,
          createdAt: input.createdAt,
        },
      });

      return mapProjectNotificationRecipient(record);
    },

    async deleteProjectNotificationRecipient(input) {
      const result = await prisma.projectNotificationRecipient.deleteMany({
        where: {
          id: input.recipientId,
          projectId: input.projectId,
        },
      });

      return result.count > 0;
    },

    async upsertProjectMember(input) {
      return prisma.$transaction(async (tx) => {
        const existingPortalUser = await tx.portalUser.findUnique({
          where: { email: input.email },
        });

        const portalUser = existingPortalUser
          ? await tx.portalUser.update({
              where: { id: existingPortalUser.id },
              data: {
                fullName: input.fullName ?? existingPortalUser.fullName,
                status: "ACTIVE",
              },
            })
          : await tx.portalUser.create({
              data: {
                email: input.email,
                fullName: input.fullName ?? null,
                role: "CLIENT",
                status: "ACTIVE",
                emailVerifiedAt: new Date(),
              },
            });

        const membership = await tx.projectMembership.upsert({
          where: {
            projectId_portalUserId: {
              projectId: input.projectId,
              portalUserId: portalUser.id,
            },
          },
          update: {
            role: input.role,
          },
          create: {
            projectId: input.projectId,
            portalUserId: portalUser.id,
            role: input.role,
          },
          include: {
            portalUser: true,
          },
        });

        return mapProjectMember(membership);
      });
    },

    async createProjectLead(input) {
      const record = await prisma.projectLead.create({
        data: {
          projectId: input.projectId,
          sourceSubmissionId: input.sourceSubmissionId ?? null,
          fullName: input.fullName,
          email: input.email,
          phone: input.phone ?? null,
          companyName: input.companyName ?? null,
          message: input.message ?? null,
          consent: input.consent,
          payload: {
            fullName: input.fullName,
            email: input.email,
            phone: input.phone ?? null,
            companyName: input.companyName ?? null,
            message: input.message ?? null,
            consent: input.consent,
          },
          createdAt: input.createdAt,
        },
        include: {
          sourceSubmission: {
            select: {
              leadId: true,
              sourcePage: true,
              sourceCta: true,
              utmSource: true,
              utmMedium: true,
              utmCampaign: true,
              serviceInterest: true,
              budgetRange: true,
              timeline: true,
              problemSummary: true,
              notificationStatus: true,
              notificationError: true,
            },
          },
        },
      });

      return mapProjectLead(record);
    },

    async updateProjectLeadSyncState(input) {
      const record = await prisma.projectLead.update({
        where: { id: input.projectLeadId },
        data: {
          syncStatus: input.syncStatus as ProjectLeadSyncStatus,
          syncError: input.syncError ?? null,
        },
        include: {
          sourceSubmission: {
            select: {
              leadId: true,
              sourcePage: true,
              sourceCta: true,
              utmSource: true,
              utmMedium: true,
              utmCampaign: true,
              serviceInterest: true,
              budgetRange: true,
              timeline: true,
              problemSummary: true,
              notificationStatus: true,
              notificationError: true,
            },
          },
        },
      });

      return mapProjectLead(record);
    },

    async listProjectLeads(projectId) {
      const records = await prisma.projectLead.findMany({
        where: { projectId },
        include: {
          hiddenByPortalUser: {
            select: {
              email: true,
              fullName: true,
            },
          },
          lastRestoredByPortalUser: {
            select: {
              email: true,
              fullName: true,
            },
          },
          sourceConnector: {
            select: {
              label: true,
            },
          },
          acquisitionCampaign: {
            select: {
              name: true,
            },
          },
          importBatch: {
            select: {
              id: true,
              label: true,
              filename: true,
            },
          },
          auditEvents: {
            include: {
              actorUser: {
                select: {
                  email: true,
                  fullName: true,
                },
              },
            },
            orderBy: [{ createdAt: "desc" }],
          },
          sourceSubmission: {
            select: {
              leadId: true,
              sourcePage: true,
              sourceCta: true,
              utmSource: true,
              utmMedium: true,
              utmCampaign: true,
              serviceInterest: true,
              budgetRange: true,
              timeline: true,
              problemSummary: true,
              notificationStatus: true,
              notificationError: true,
            },
          },
        },
        orderBy: [{ createdAt: "desc" }],
      });

      return records.map(mapProjectLead);
    },

    async listProjectLeadTombstones(projectId) {
      const records = await prisma.projectLeadDeletionTombstone.findMany({
        where: { projectId },
        include: {
          deletedByUser: {
            select: {
              email: true,
              fullName: true,
            },
          },
        },
        orderBy: [{ createdAt: "desc" }],
      });

      return records.map(mapProjectLeadDeletionTombstone);
    },

    async softDeleteProjectLeads(input) {
      return prisma.$transaction(async (tx) => {
        const leadIds = Array.from(new Set(input.leadIds.filter(Boolean)));
        if (leadIds.length === 0) {
          return [];
        }

        const existing = await tx.projectLead.findMany({
          where: {
            projectId: input.projectId,
            id: { in: leadIds },
          },
          select: { id: true },
        });
        const existingIds = existing.map((lead) => lead.id);
        if (existingIds.length === 0) {
          return [];
        }

        await tx.projectLead.updateMany({
          where: {
            projectId: input.projectId,
            id: { in: existingIds },
          },
          data: {
            visibilityState: "HIDDEN",
            hiddenAt: input.occurredAt,
            hiddenByPortalUserId: input.actorUserId,
            hiddenReasonCode: input.reasonCode,
            hiddenReasonNote: input.note ?? null,
          },
        });

        await tx.projectLeadAuditEvent.createMany({
          data: existingIds.map((leadId) => ({
            projectId: input.projectId,
            projectLeadId: leadId,
            actorUserId: input.actorUserId,
            type: "SOFT_DELETED",
            reasonCode: input.reasonCode,
            note: input.note ?? null,
            createdAt: input.occurredAt,
          })),
        });

        const updated = await tx.projectLead.findMany({
          where: {
            projectId: input.projectId,
            id: { in: existingIds },
          },
          include: {
            hiddenByPortalUser: {
              select: {
                email: true,
                fullName: true,
              },
            },
            lastRestoredByPortalUser: {
              select: {
                email: true,
                fullName: true,
              },
            },
            auditEvents: {
              include: {
                actorUser: {
                  select: {
                    email: true,
                    fullName: true,
                  },
                },
              },
              orderBy: [{ createdAt: "desc" }],
            },
            sourceSubmission: {
              select: {
                leadId: true,
                sourcePage: true,
                sourceCta: true,
                utmSource: true,
                utmMedium: true,
                utmCampaign: true,
                serviceInterest: true,
                budgetRange: true,
                timeline: true,
                problemSummary: true,
                notificationStatus: true,
                notificationError: true,
              },
            },
          },
          orderBy: [{ createdAt: "desc" }],
        });

        return updated.map(mapProjectLead);
      });
    },

    async restoreProjectLeads(input) {
      return prisma.$transaction(async (tx) => {
        const leadIds = Array.from(new Set(input.leadIds.filter(Boolean)));
        if (leadIds.length === 0) {
          return [];
        }

        const existing = await tx.projectLead.findMany({
          where: {
            projectId: input.projectId,
            id: { in: leadIds },
          },
          select: { id: true },
        });
        const existingIds = existing.map((lead) => lead.id);
        if (existingIds.length === 0) {
          return [];
        }

        await tx.projectLead.updateMany({
          where: {
            projectId: input.projectId,
            id: { in: existingIds },
          },
          data: {
            visibilityState: "VISIBLE",
            hiddenAt: null,
            hiddenByPortalUserId: null,
            hiddenReasonCode: null,
            hiddenReasonNote: null,
            lastRestoredAt: input.occurredAt,
            lastRestoredByPortalUserId: input.actorUserId,
          },
        });

        await tx.projectLeadAuditEvent.createMany({
          data: existingIds.map((leadId) => ({
            projectId: input.projectId,
            projectLeadId: leadId,
            actorUserId: input.actorUserId,
            type: "RESTORED",
            note: input.note ?? null,
            createdAt: input.occurredAt,
          })),
        });

        const updated = await tx.projectLead.findMany({
          where: {
            projectId: input.projectId,
            id: { in: existingIds },
          },
          include: {
            hiddenByPortalUser: {
              select: {
                email: true,
                fullName: true,
              },
            },
            lastRestoredByPortalUser: {
              select: {
                email: true,
                fullName: true,
              },
            },
            auditEvents: {
              include: {
                actorUser: {
                  select: {
                    email: true,
                    fullName: true,
                  },
                },
              },
              orderBy: [{ createdAt: "desc" }],
            },
            sourceSubmission: {
              select: {
                leadId: true,
                sourcePage: true,
                sourceCta: true,
                utmSource: true,
                utmMedium: true,
                utmCampaign: true,
                serviceInterest: true,
                budgetRange: true,
                timeline: true,
                problemSummary: true,
                notificationStatus: true,
                notificationError: true,
              },
            },
          },
          orderBy: [{ createdAt: "desc" }],
        });

        return updated.map(mapProjectLead);
      });
    },

    async createProjectLeadRevealAuditEvent(input) {
      const record = await prisma.projectLeadAuditEvent.create({
        data: {
          projectId: input.projectId,
          projectLeadId: input.projectLeadId,
          actorUserId: input.actorUserId,
          type: "PII_REVEALED",
          reasonCode: input.reasonCode,
          note: input.note ?? null,
          createdAt: input.occurredAt,
        },
        include: {
          actorUser: {
            select: {
              email: true,
              fullName: true,
            },
          },
        },
      });

      return {
        id: record.id,
        projectId: record.projectId,
        projectLeadId: record.projectLeadId,
        actorUserId: record.actorUserId,
        actorUserEmail: record.actorUser?.email ?? null,
        actorUserFullName: record.actorUser?.fullName ?? null,
        type: record.type,
        reasonCode: record.reasonCode ?? null,
        note: record.note ?? null,
        metadata: readMetadataRecord(record.metadata),
        createdAt: record.createdAt,
      };
    },

    async hardDeleteProjectLeads(input) {
      return prisma.$transaction(async (tx) => {
        const leadIds = Array.from(new Set(input.leadIds.filter(Boolean)));
        if (leadIds.length === 0) {
          return [];
        }

        const leads = await tx.projectLead.findMany({
          where: {
            projectId: input.projectId,
            id: { in: leadIds },
          },
          select: {
            id: true,
            sourceSubmissionId: true,
          },
        });

        if (leads.length === 0) {
          return [];
        }

        const tombstones = await Promise.all(
          leads.map((lead) =>
            tx.projectLeadDeletionTombstone.create({
              data: {
                projectId: input.projectId,
                deletedProjectLeadId: lead.id,
                deletedSourceLeadId: lead.sourceSubmissionId ?? null,
                deletedByUserId: input.actorUserId,
                reasonCode: input.reasonCode,
                note: input.note ?? null,
                createdAt: input.occurredAt,
              },
              include: {
                deletedByUser: {
                  select: {
                    email: true,
                    fullName: true,
                  },
                },
              },
            }),
          ),
        );

        await tx.projectLeadAuditEvent.deleteMany({
          where: {
            projectId: input.projectId,
            projectLeadId: { in: leads.map((lead) => lead.id) },
          },
        });

        await tx.projectLead.deleteMany({
          where: {
            projectId: input.projectId,
            id: { in: leads.map((lead) => lead.id) },
          },
        });

        const sourceSubmissionIds = leads
          .map((lead) => lead.sourceSubmissionId)
          .filter((value): value is string => Boolean(value));
        if (sourceSubmissionIds.length > 0) {
          await tx.leadSubmission.deleteMany({
            where: {
              id: { in: sourceSubmissionIds },
            },
          });
        }

        return tombstones.map(mapProjectLeadDeletionTombstone);
      });
    },

    async listProjectInvites(projectId) {
      const records = await prisma.projectInvite.findMany({
        where: { projectId },
        include: {
          invitedByPortalUser: {
            select: {
              email: true,
              fullName: true,
            },
          },
          acceptedByPortalUser: {
            select: {
              email: true,
              fullName: true,
            },
          },
        },
        orderBy: [{ createdAt: "desc" }],
      });

      return records.map(mapProjectInvite);
    },

    async createProjectInvite(input) {
      const record = await prisma.$transaction(async (tx) => {
        await tx.projectInvite.updateMany({
          where: {
            projectId: input.projectId,
            email: input.email,
            status: "PENDING",
          },
          data: {
            status: "REVOKED",
            revokedAt: input.occurredAt,
          },
        });

        return tx.projectInvite.create({
          data: {
            projectId: input.projectId,
            email: input.email,
            fullName: input.fullName ?? null,
            role: input.role,
            invitedByPortalUserId: input.invitedByPortalUserId,
            selector: input.selector,
            verifierHash: input.verifierHash,
            status: "PENDING",
            expiresAt: input.expiresAt,
            createdAt: input.occurredAt,
          },
          include: {
            invitedByPortalUser: {
              select: {
                email: true,
                fullName: true,
              },
            },
            acceptedByPortalUser: {
              select: {
                email: true,
                fullName: true,
              },
            },
          },
        });
      });

      return mapProjectInvite(record);
    },

    async rotateProjectInvite(input) {
      return prisma.$transaction(async (tx) => {
        const invite = await tx.projectInvite.findFirst({
          where: {
            id: input.inviteId,
            projectId: input.projectId,
          },
          select: {
            id: true,
            email: true,
          },
        });
        if (!invite) {
          return null;
        }

        await tx.projectInvite.updateMany({
          where: {
            projectId: input.projectId,
            email: invite.email,
            status: "PENDING",
            NOT: {
              id: input.inviteId,
            },
          },
          data: {
            status: "REVOKED",
            revokedAt: input.occurredAt,
          },
        });

        const record = await tx.projectInvite.update({
          where: { id: input.inviteId },
          data: {
            selector: input.selector,
            verifierHash: input.verifierHash,
            expiresAt: input.expiresAt,
            status: "PENDING",
            revokedAt: null,
          },
          include: {
            invitedByPortalUser: {
              select: {
                email: true,
                fullName: true,
              },
            },
            acceptedByPortalUser: {
              select: {
                email: true,
                fullName: true,
              },
            },
          },
        });

        return mapProjectInvite(record);
      });
    },

    async updateProjectInviteRole(input) {
      const record = await prisma.projectInvite.updateMany({
        where: {
          id: input.inviteId,
          projectId: input.projectId,
          status: "PENDING",
        },
        data: {
          role: input.role,
        },
      });

      if (record.count === 0) {
        return null;
      }

      const updated = await prisma.projectInvite.findUnique({
        where: { id: input.inviteId },
        include: {
          invitedByPortalUser: {
            select: {
              email: true,
              fullName: true,
            },
          },
          acceptedByPortalUser: {
            select: {
              email: true,
              fullName: true,
            },
          },
        },
      });

      return updated ? mapProjectInvite(updated) : null;
    },

    async revokeProjectInvite(input) {
      const record = await prisma.projectInvite.updateMany({
        where: {
          id: input.inviteId,
          projectId: input.projectId,
          status: "PENDING",
        },
        data: {
          status: "REVOKED",
          revokedAt: input.occurredAt,
        },
      });

      if (record.count === 0) {
        return null;
      }

      const updated = await prisma.projectInvite.findUnique({
        where: { id: input.inviteId },
        include: {
          invitedByPortalUser: {
            select: {
              email: true,
              fullName: true,
            },
          },
          acceptedByPortalUser: {
            select: {
              email: true,
              fullName: true,
            },
          },
        },
      });

      return updated ? mapProjectInvite(updated) : null;
    },

    async findProjectInviteBySelector(selector) {
      const record = await prisma.projectInvite.findUnique({
        where: { selector },
        include: {
          invitedByPortalUser: {
            select: {
              email: true,
              fullName: true,
            },
          },
          acceptedByPortalUser: {
            select: {
              email: true,
              fullName: true,
            },
          },
        },
      });

      return record ? mapProjectInvite(record) : null;
    },

    async consumeProjectInvite(input) {
      return prisma.$transaction(async (tx) => {
        const invite = await tx.projectInvite.findUnique({
          where: { selector: input.selector },
        });
        if (
          !invite ||
          invite.verifierHash !== input.verifierHash ||
          invite.status !== "PENDING"
        ) {
          return null;
        }

        await tx.portalUser.update({
          where: { id: input.portalUserId },
          data: {
            status: "ACTIVE",
            emailVerifiedAt: input.acceptedAt,
          },
        });

        await tx.projectMembership.upsert({
          where: {
            projectId_portalUserId: {
              projectId: invite.projectId,
              portalUserId: input.portalUserId,
            },
          },
          update: {
            role: invite.role,
          },
          create: {
            projectId: invite.projectId,
            portalUserId: input.portalUserId,
            role: invite.role,
          },
        });

        const updated = await tx.projectInvite.update({
          where: { id: invite.id },
          data: {
            status: "ACCEPTED",
            acceptedAt: input.acceptedAt,
            acceptedByPortalUserId: input.portalUserId,
          },
          include: {
            invitedByPortalUser: {
              select: {
                email: true,
                fullName: true,
              },
            },
            acceptedByPortalUser: {
              select: {
                email: true,
                fullName: true,
              },
            },
          },
        });

        return mapProjectInvite(updated);
      });
    },

    async countProjectOwners(projectId) {
      return prisma.projectMembership.count({
        where: {
          projectId,
          role: "OWNER",
        },
      });
    },

    async updateProjectMembershipRole(input) {
      const record = await prisma.projectMembership.updateMany({
        where: {
          projectId: input.projectId,
          portalUserId: input.memberPortalUserId,
        },
        data: {
          role: input.role,
        },
      });

      if (record.count === 0) {
        return null;
      }

      const updated = await prisma.projectMembership.findUnique({
        where: {
          projectId_portalUserId: {
            projectId: input.projectId,
            portalUserId: input.memberPortalUserId,
          },
        },
        include: {
          portalUser: true,
        },
      });

      return updated ? mapProjectMember(updated) : null;
    },

    async removeProjectMembership(input) {
      const result = await prisma.projectMembership.deleteMany({
        where: {
          projectId: input.projectId,
          portalUserId: input.memberPortalUserId,
        },
      });

      return result.count > 0;
    },

    async assertProjectAccess(input) {
      const portalUser = await prisma.portalUser.findUnique({
        where: { id: input.portalUserId },
      });

      if (!portalUser || portalUser.status !== "ACTIVE") {
        return null;
      }

      if (portalUser.role === "PLATFORM_ADMIN" || portalUser.role === "PLATFORM_OPERATOR") {
        const project = await prisma.project.findUnique({
          where: { id: input.projectId },
        });

        if (!project) {
          return null;
        }

        return {
          portalUser: mapPortalUser(portalUser),
          project: mapProject(project),
          membershipRole: "OWNER",
        } satisfies ProjectAccessRecord;
      }

      const membership = await prisma.projectMembership.findUnique({
        where: {
          projectId_portalUserId: {
            projectId: input.projectId,
            portalUserId: input.portalUserId,
          },
        },
        include: {
          portalUser: true,
          project: true,
        },
      });

      if (!membership) {
        return null;
      }

      return {
        portalUser: mapPortalUser(membership.portalUser),
        project: mapProject(membership.project),
        membershipRole: membership.role,
      } satisfies ProjectAccessRecord;
    },

    async updateProjectGoLive(input) {
      const record = await prisma.project.update({
        where: { id: input.projectId },
        data: {
          goLiveAt: input.goLiveAt,
        },
      });

      return mapProjectProfile(record);
    },
  };
}
