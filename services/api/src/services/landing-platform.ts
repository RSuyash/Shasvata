import ExcelJS from "exceljs";
import { buildDefaultMdocPushConfig } from "./mdoc-push.js";

export type PortalUserRole = "PLATFORM_ADMIN" | "PLATFORM_OPERATOR" | "CLIENT";
export type PortalUserStatus = "PENDING" | "ACTIVE";
export type ProjectStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";
export type ProjectMembershipRole = "OWNER" | "VIEWER";
export type ProjectSiteSourceProvider = "GIT_REPOSITORY";
export type ProjectSiteRuntimeProfile = "STATIC_ARTIFACT" | "ISOLATED_APP";
export type GoogleAdsConversionMode = "DIRECT_LABEL" | "GA4_IMPORTED";
export type LeadSyncKind = "GOOGLE_SHEETS" | "MDOC_PUSH";
export type LeadSyncTargetStatus = "ACTIVE" | "INACTIVE";
export type ProjectLeadSyncStatus = "PENDING" | "SYNCED" | "PARTIAL" | "FAILED";
export type LeadSyncDeliveryStatus = "PENDING" | "SYNCED" | "FAILED";
export type ProjectLeadVisibilityState = "VISIBLE" | "HIDDEN";
export type LeadSourceKind =
  | "WEB_FORM"
  | "MANUAL_ENTRY"
  | "EVENT_IMPORT"
  | "CSV_IMPORT"
  | "META_LEAD_ADS"
  | "LINKEDIN_LEAD_GEN"
  | "GOOGLE_ADS";
export type ProjectLeadAuditEventType =
  | "SOFT_DELETED"
  | "RESTORED"
  | "PII_REVEALED"
  | "HARD_DELETED";
export type ProjectInviteStatus = "PENDING" | "ACCEPTED" | "REVOKED" | "EXPIRED";
export type LeadNotificationStatus = "RECEIVED" | "NOTIFIED" | "NOTIFICATION_FAILED";
export type PortalWorkspaceView = "CLIENT" | "OPERATOR";
export type LeadExportMode = "basic" | "full";
export type ProjectLeadTab = "active" | "hidden";
export type AuthCredentialKind =
  | "PASSWORD"
  | "MAGIC_LINK_ONLY"
  | "GOOGLE_OIDC"
  | "PASSWORD_AND_GOOGLE";

export type PortalUserRecord = {
  id: string;
  email: string;
  fullName: string | null;
  role: PortalUserRole;
  status: PortalUserStatus;
  companyName: string | null;
  phone: string | null;
  emailVerifiedAt: Date | null;
};

export type LandingProjectRecord = {
  id: string;
  slug: string;
  name: string;
  status: ProjectStatus;
  publicLeadKey: string;
  primaryDomain: string | null;
  clientCompanyName: string | null;
  goLiveAt: Date | null;
};

export type AccessibleProjectRecord = LandingProjectRecord & {
  membershipRole: ProjectMembershipRole;
};

export type MagicLinkRecord = {
  id: string;
  portalUserId: string;
  email: string;
  selector: string;
  verifierHash: string;
  redirectPath: string;
  expiresAt: Date;
  consumedAt: Date | null;
};

export type PortalSessionRecord = {
  id: string;
  portalUserId: string;
  expiresAt: Date;
};

export type PortalSessionAccessRecord = {
  session: PortalSessionRecord;
  portalUser: PortalUserRecord;
};

export type AuthCredentialRecord = {
  portalUserId: string;
  kind: AuthCredentialKind;
  passwordHash: string | null;
  googleSubject: string | null;
  googleEmail: string | null;
};

export type EmailVerificationTokenRecord = {
  id: string;
  portalUserId: string;
  email: string;
  selector: string;
  verifierHash: string;
  expiresAt: Date;
  consumedAt: Date | null;
};

export type PasswordResetTokenRecord = {
  id: string;
  portalUserId: string;
  selector: string;
  verifierHash: string;
  expiresAt: Date;
  consumedAt: Date | null;
};

export type ProjectProfileRecord = LandingProjectRecord & {
  description: string | null;
  notes: string | null;
};

export type ProjectSiteRecord = {
  id: string;
  projectId: string;
  slug: string;
  templateKey: string;
  themeKey: string | null;
  sourceProvider: ProjectSiteSourceProvider | null;
  repoUrl: string | null;
  repoBranch: string | null;
  repoRef: string | null;
  deployedCommit: string | null;
  runtimeProfile: ProjectSiteRuntimeProfile;
  operatorNotes: string | null;
  ga4MeasurementId: string | null;
  googleAdsTagId: string | null;
  googleAdsConversionMode: GoogleAdsConversionMode;
  googleAdsLeadConversionLabel: string | null;
  gtmContainerId: string | null;
  metaPixelId: string | null;
  trackingNotes: string | null;
  publishStatus: "DRAFT" | "PUBLISHED" | "FAILED";
  lastPublishedAt: Date | null;
  previewHost: string | null;
  latestPreviewPath: string | null;
};

export type ProjectSourceSummaryRecord = {
  siteId: string;
  provider: ProjectSiteSourceProvider | null;
  repoUrl: string | null;
  repoBranch: string | null;
  repoRef: string | null;
  deployedCommit: string | null;
  runtimeProfile: ProjectSiteRuntimeProfile;
  operatorNotes: string | null;
  previewHost: string | null;
};

export type ProjectDomainRecord = {
  id: string;
  projectId: string;
  siteId: string | null;
  host: string;
  status: "PENDING" | "ACTIVE" | "ERROR";
  isPrimary: boolean;
  dnsTarget: string | null;
  verifiedAt: Date | null;
};

export type ProjectMemberRecord = {
  portalUserId: string;
  email: string;
  fullName: string | null;
  role: ProjectMembershipRole;
  status: PortalUserStatus;
};

export type ProjectNotificationRecipientRecord = {
  id: string;
  projectId: string;
  email: string;
  label: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type GoogleSheetsLeadSyncConfig = {
  spreadsheetId: string;
  sheetName: string;
};

export type MdocPushEnumMappings = {
  preferences?: Record<string, string>;
  budgets?: Record<string, string>;
  buyingPurposes?: Record<string, string>;
  possessionReqs?: Record<string, string>;
  ageRanges?: Record<string, string>;
};

export type MdocPushLeadSyncConfig = {
  endpoint: string;
  apiKey: string;
  dataFrom: "T" | "E";
  source: string;
  fallbackSourceDetail: string;
  sourceDetailRules?: Record<string, string>;
  staticDefaults?: Record<string, string>;
  enumMappings?: MdocPushEnumMappings;
};

export type LeadSyncDeliveryAttemptRecord = {
  id: string;
  projectLeadId: string;
  projectId: string;
  targetId: string;
  kind: LeadSyncKind;
  status: LeadSyncDeliveryStatus;
  responseCode: number | null;
  responseBody: string | null;
  errorMessage: string | null;
  metadata: Record<string, unknown> | null;
  attemptedAt: Date;
  deliveredAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type LeadSyncTargetRecord = {
  id: string;
  projectId: string;
  kind: LeadSyncKind;
  status: LeadSyncTargetStatus;
  label?: string | null;
  config: GoogleSheetsLeadSyncConfig | MdocPushLeadSyncConfig;
  latestDeliveryAttempt?: LeadSyncDeliveryAttemptRecord | null;
};

export type ProjectLeadAuditEventRecord = {
  id: string;
  projectId: string;
  projectLeadId: string;
  actorUserId: string | null;
  actorUserEmail: string | null;
  actorUserFullName: string | null;
  type: ProjectLeadAuditEventType;
  reasonCode: string | null;
  note: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
};

export type ProjectLeadDeletionTombstoneRecord = {
  id: string;
  projectId: string;
  deletedProjectLeadId: string;
  deletedSourceLeadId: string | null;
  deletedByUserId: string | null;
  deletedByUserEmail: string | null;
  deletedByUserFullName: string | null;
  reasonCode: string | null;
  note: string | null;
  createdAt: Date;
};

export type ProjectLeadRecord = {
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
  sourceKind?: LeadSourceKind | null;
  connectorId?: string | null;
  sourceConnectorLabel?: string | null;
  campaignId?: string | null;
  campaignName?: string | null;
  importBatchId?: string | null;
  importBatchLabel?: string | null;
  externalLeadId?: string | null;
  capturedAt?: Date | null;
  notificationStatus: LeadNotificationStatus | null;
  notificationError: string | null;
  syncStatus: ProjectLeadSyncStatus;
  syncError: string | null;
  visibilityState: ProjectLeadVisibilityState;
  hiddenAt: Date | null;
  hiddenByPortalUserId: string | null;
  hiddenByUserEmail: string | null;
  hiddenByUserFullName: string | null;
  hiddenReasonCode: string | null;
  hiddenReasonNote: string | null;
  lastRestoredAt: Date | null;
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
  auditEvents: ProjectLeadAuditEventRecord[];
  createdAt: Date;
};

export type ProjectInviteRecord = {
  id: string;
  projectId: string;
  email: string;
  fullName: string | null;
  role: ProjectMembershipRole;
  invitedByPortalUserId: string;
  invitedByUserEmail: string | null;
  invitedByUserFullName: string | null;
  acceptedByPortalUserId: string | null;
  acceptedByUserEmail: string | null;
  acceptedByUserFullName: string | null;
  selector: string;
  verifierHash: string;
  status: ProjectInviteStatus;
  expiresAt: Date;
  acceptedAt: Date | null;
  revokedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ProjectBillingRecord = {
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
  quoteRequestStatus: string | null;
  latestCheckoutStatus: string | null;
  latestPaymentSessionId: string | null;
  latestProviderOrderId: string | null;
  updatedAt: Date;
};

export type ProjectBillingSummaryRecord = {
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
  latestUpdatedAt: Date | null;
};

export type ProjectAccessRecord = {
  portalUser: PortalUserRecord;
  project: LandingProjectRecord;
  membershipRole: ProjectMembershipRole;
};

export type ProjectDetailRecord = Omit<ProjectProfileRecord, "publicLeadKey"> & {
  publicLeadKey: string | null;
  portalView: PortalWorkspaceView;
  membershipRole: ProjectMembershipRole;
  leadCount: number;
  sites: ProjectSiteRecord[];
  domains: ProjectDomainRecord[];
  syncTargets: LeadSyncTargetRecord[];
  members: ProjectMemberRecord[];
  leadNotificationRecipients: ProjectNotificationRecipientRecord[];
  sourceSummary: ProjectSourceSummaryRecord | null;
  previewUrl: string | null;
  liveUrl: string | null;
  billingSummary: ProjectBillingSummaryRecord;
};

export type CreateImportedProjectInput = {
  portalUserId: string;
  projectSlug: string;
  projectName: string;
  repoUrl: string;
  repoBranch?: string;
  repoRef?: string;
  clientCompany?: string;
  desiredLiveDomain?: string;
  operatorNotes?: string;
};

export type RefreshImportedProjectSourceInput = {
  portalUserId: string;
  projectId: string;
  siteId: string;
  repoUrl?: string;
  repoBranch?: string;
  repoRef?: string;
  deployedCommit?: string;
  runtimeProfile?: ProjectSiteRuntimeProfile;
  operatorNotes?: string;
};

export type UpsertProjectDomainInput = {
  portalUserId: string;
  projectId: string;
  siteId?: string;
  host: string;
  isPrimary?: boolean;
};

export type VerifyProjectDomainInput = {
  portalUserId: string;
  projectId: string;
  domainId: string;
};

export type RecordProjectSitePublishInput = {
  portalUserId: string;
  projectId: string;
  siteId: string;
  publishStatus: ProjectSiteRecord["publishStatus"];
  runtimeProfile: ProjectSiteRuntimeProfile;
  deployedCommit?: string;
  previewHost?: string;
};

export type RequestMagicLinkInput = {
  email: string;
  redirectPath?: string;
};

export type ConsumeMagicLinkInput = {
  selector: string;
  verifier: string;
};

export type PasswordSignInInput = {
  email: string;
  password: string;
  inviteSelector?: string;
  inviteVerifier?: string;
};

export type PasswordSignUpInput = {
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  password: string;
  inviteSelector?: string;
  inviteVerifier?: string;
};

export type ConsumeEmailVerificationInput = {
  selector: string;
  verifier: string;
};

export type PasswordResetRequestInput = {
  email: string;
};

export type PasswordResetInput = {
  selector: string;
  verifier: string;
  password: string;
};

export type GoogleSignInInput = {
  idToken: string;
  inviteSelector?: string;
  inviteVerifier?: string;
};

export type BootstrapPlatformAdminInput = {
  email: string;
  password: string;
  fullName?: string;
};

export type SubmitProjectLeadInput = {
  publicLeadKey: string;
  originHost: string | null;
  honeypot: string;
  payload: {
    fullName: string;
    email: string;
    phone?: string;
    companyName?: string;
    message?: string;
    consent: boolean;
  };
};

export type ExportProjectLeadsCsvInput = {
  portalUserId: string;
  projectId: string;
  mode?: LeadExportMode;
};

export type ExportProjectLeadsXlsxInput = ExportProjectLeadsCsvInput;

export type ProjectPortalAccessInput = {
  portalUserId: string;
  projectId: string;
};

export type ListProjectLeadsInput = ProjectPortalAccessInput & {
  tab?: ProjectLeadTab;
};

export type InviteProjectMemberInput = {
  portalUserId: string;
  projectId: string;
  email: string;
  fullName?: string;
  role: ProjectMembershipRole;
};

export type SoftDeleteProjectLeadsInput = ProjectPortalAccessInput & {
  leadIds: string[];
  reasonCode: string;
  note?: string;
};

export type RestoreProjectLeadsInput = ProjectPortalAccessInput & {
  leadIds: string[];
  note?: string;
};

export type RevealProjectLeadInput = ProjectPortalAccessInput & {
  leadId: string;
  reasonCode: string;
  note?: string;
};

export type HardDeleteProjectLeadsInput = ProjectPortalAccessInput & {
  leadIds: string[];
  reasonCode: string;
  note?: string;
};

export type ListProjectLeadTombstonesInput = ProjectPortalAccessInput;

export type ListProjectAccessSettingsInput = ProjectPortalAccessInput;

export type UpdateProjectMemberRoleInput = ProjectPortalAccessInput & {
  memberPortalUserId: string;
  role: ProjectMembershipRole;
};

export type RemoveProjectMemberInput = ProjectPortalAccessInput & {
  memberPortalUserId: string;
};

export type ResendProjectInviteInput = ProjectPortalAccessInput & {
  inviteId: string;
};

export type UpdateProjectInviteInput = ProjectPortalAccessInput & {
  inviteId: string;
  role: ProjectMembershipRole;
};

export type RevokeProjectInviteInput = ProjectPortalAccessInput & {
  inviteId: string;
};

export type ReadProjectInviteInput = {
  selector: string;
  verifier: string;
};

export type ConsumeProjectInviteInput = {
  selector: string;
  verifier: string;
  portalUserId: string;
  email: string;
};

export type AddProjectNotificationRecipientInput = {
  portalUserId: string;
  projectId: string;
  email: string;
  label?: string;
};

export type RemoveProjectNotificationRecipientInput = {
  portalUserId: string;
  projectId: string;
  recipientId: string;
};

export type UpdateProjectTrackingSettingsInput = {
  portalUserId: string;
  projectId: string;
  ga4MeasurementId?: string | null;
  googleAdsTagId?: string | null;
  googleAdsConversionMode?: GoogleAdsConversionMode | null;
  googleAdsLeadConversionLabel?: string | null;
  gtmContainerId?: string | null;
  metaPixelId?: string | null;
  trackingNotes?: string | null;
};

export type UpsertProjectMdocSyncTargetInput = {
  portalUserId: string;
  projectId: string;
  status?: LeadSyncTargetStatus;
  label?: string | null;
  endpoint?: string | null;
  apiKey?: string | null;
  dataFrom?: "T" | "E";
  source?: string | null;
  fallbackSourceDetail?: string | null;
  sourceDetailRules?: Record<string, string> | null;
  staticDefaults?: Record<string, string> | null;
  enumMappings?: MdocPushEnumMappings | null;
};

export type TestProjectMdocSyncTargetInput = {
  portalUserId: string;
  projectId: string;
  endpoint?: string | null;
  apiKey?: string | null;
  dataFrom?: "T" | "E";
  source?: string | null;
  fallbackSourceDetail?: string | null;
  sourceDetailRules?: Record<string, string> | null;
  staticDefaults?: Record<string, string> | null;
  enumMappings?: MdocPushEnumMappings | null;
};

export type VerifiedGoogleIdentity = {
  subject: string;
  email: string;
  emailVerified: boolean;
  fullName: string | null;
  givenName: string | null;
  familyName: string | null;
  pictureUrl: string | null;
};

export interface LandingPlatformRepository {
  findPortalUserByEmail(email: string): Promise<PortalUserRecord | null>;
  findPortalUserById(portalUserId: string): Promise<PortalUserRecord | null>;
  countPlatformAdmins(): Promise<number>;
  findAuthCredentialByEmail(email: string): Promise<{
    portalUser: PortalUserRecord;
    credential: AuthCredentialRecord;
  } | null>;
  findAuthCredentialByGoogleSubject(googleSubject: string): Promise<{
    portalUser: PortalUserRecord;
    credential: AuthCredentialRecord;
  } | null>;
  createPortalUser(input: {
    email: string;
    fullName?: string | null;
    role: PortalUserRole;
    status: PortalUserStatus;
    companyName?: string | null;
    phone?: string | null;
    emailVerifiedAt?: Date | null;
  }): Promise<PortalUserRecord>;
  updatePortalUser(input: {
    portalUserId: string;
    fullName?: string | null;
    phone?: string | null;
    status?: PortalUserStatus;
    emailVerifiedAt?: Date | null;
  }): Promise<PortalUserRecord>;
  upsertAuthCredential(input: {
    portalUserId: string;
    kind: AuthCredentialKind;
    passwordHash?: string | null;
    googleSubject?: string | null;
    googleEmail?: string | null;
  }): Promise<AuthCredentialRecord>;
  createEmailVerificationToken(input: {
    portalUserId: string;
    email: string;
    selector: string;
    verifierHash: string;
    expiresAt: Date;
  }): Promise<EmailVerificationTokenRecord>;
  consumeEmailVerificationToken(input: {
    selector: string;
    verifierHash: string;
    now: Date;
  }): Promise<EmailVerificationTokenRecord | null>;
  createPasswordResetToken(input: {
    portalUserId: string;
    selector: string;
    verifierHash: string;
    expiresAt: Date;
  }): Promise<PasswordResetTokenRecord>;
  consumePasswordResetToken(input: {
    selector: string;
    verifierHash: string;
    now: Date;
  }): Promise<PasswordResetTokenRecord | null>;
  createMagicLink(input: {
    portalUserId: string;
    email: string;
    selector: string;
    verifierHash: string;
    redirectPath: string;
    expiresAt: Date;
  }): Promise<MagicLinkRecord>;
  consumeMagicLink(input: {
    selector: string;
    verifierHash: string;
    now: Date;
  }): Promise<MagicLinkRecord | null>;
  createPortalSession(input: {
    portalUserId: string;
    expiresAt: Date;
  }): Promise<PortalSessionRecord>;
  findPortalSession(input: {
    sessionId: string;
    now: Date;
  }): Promise<PortalSessionAccessRecord | null>;
  deletePortalSession(sessionId: string): Promise<void>;
  deletePortalSessionsForUser(portalUserId: string): Promise<void>;
  listProjectsForPortalUser(portalUser: PortalUserRecord): Promise<AccessibleProjectRecord[]>;
  findProjectById(projectId: string): Promise<ProjectProfileRecord | null>;
  findProjectByPublicLeadKey(publicLeadKey: string): Promise<LandingProjectRecord | null>;
  createImportedProject(input: {
    slug: string;
    name: string;
    publicLeadKey: string;
    clientCompanyName?: string | null;
    repoUrl: string;
    repoBranch?: string | null;
    repoRef?: string | null;
    runtimeProfile: ProjectSiteRuntimeProfile;
    operatorNotes?: string | null;
    previewHost: string;
    desiredLiveDomain?: string | null;
    dnsTarget?: string | null;
    actorUserId: string;
    createdAt: Date;
  }): Promise<{
    project: ProjectProfileRecord;
    site: ProjectSiteRecord;
    domain: ProjectDomainRecord | null;
  }>;
  listProjectSites(projectId: string): Promise<ProjectSiteRecord[]>;
  listProjectDomains(projectId: string): Promise<ProjectDomainRecord[]>;
  findProjectSite(input: {
    projectId: string;
    siteId: string;
  }): Promise<ProjectSiteRecord | null>;
  updateProjectSiteSource(input: {
    projectId: string;
    siteId: string;
    repoUrl?: string | null;
    repoBranch?: string | null;
    repoRef?: string | null;
    deployedCommit?: string | null;
    runtimeProfile?: ProjectSiteRuntimeProfile;
    operatorNotes?: string | null;
  }): Promise<ProjectSiteRecord>;
  updateProjectSiteTracking(input: {
    projectId: string;
    siteId: string;
    ga4MeasurementId?: string | null;
    googleAdsTagId?: string | null;
    googleAdsConversionMode?: GoogleAdsConversionMode;
    googleAdsLeadConversionLabel?: string | null;
    gtmContainerId?: string | null;
    metaPixelId?: string | null;
    trackingNotes?: string | null;
  }): Promise<ProjectSiteRecord>;
  updateProjectSitePublishState(input: {
    projectId: string;
    siteId: string;
    publishStatus: ProjectSiteRecord["publishStatus"];
    runtimeProfile: ProjectSiteRuntimeProfile;
    deployedCommit?: string | null;
    previewHost?: string | null;
    lastPublishedAt: Date;
  }): Promise<ProjectSiteRecord>;
  findProjectDomain(input: {
    projectId: string;
    domainId: string;
  }): Promise<ProjectDomainRecord | null>;
  upsertProjectDomain(input: {
    projectId: string;
    siteId?: string | null;
    host: string;
    isPrimary: boolean;
    dnsTarget?: string | null;
    actorUserId: string;
    createdAt: Date;
  }): Promise<ProjectDomainRecord>;
  updateProjectDomainVerification(input: {
    projectId: string;
    domainId: string;
    status: ProjectDomainRecord["status"];
    verifiedAt: Date | null;
    actorUserId: string;
    checkedAt: Date;
  }): Promise<ProjectDomainRecord>;
  listProjectMembers(projectId: string): Promise<ProjectMemberRecord[]>;
  listProjectNotificationRecipients(projectId: string): Promise<ProjectNotificationRecipientRecord[]>;
  listProjectBillingRecords(projectId: string): Promise<ProjectBillingRecord[]>;
  upsertProjectMember(input: {
    projectId: string;
    email: string;
    fullName?: string;
    role: ProjectMembershipRole;
  }): Promise<ProjectMemberRecord>;
  upsertProjectNotificationRecipient(input: {
    projectId: string;
    email: string;
    label?: string | null;
    createdAt: Date;
  }): Promise<ProjectNotificationRecipientRecord>;
  deleteProjectNotificationRecipient(input: {
    projectId: string;
    recipientId: string;
  }): Promise<boolean>;
  updateProjectGoLive(input: {
    projectId: string;
    goLiveAt: Date;
  }): Promise<ProjectProfileRecord>;
  listLeadSyncTargets(projectId: string): Promise<LeadSyncTargetRecord[]>;
  upsertLeadSyncTarget(input: {
    projectId: string;
    kind: LeadSyncKind;
    status: LeadSyncTargetStatus;
    label?: string | null;
    config: GoogleSheetsLeadSyncConfig | MdocPushLeadSyncConfig;
  }): Promise<LeadSyncTargetRecord>;
  createLeadSyncDeliveryAttempt(input: {
    projectLeadId: string;
    projectId: string;
    targetId: string;
    kind: LeadSyncKind;
    status: LeadSyncDeliveryStatus;
    attemptedAt: Date;
    metadata?: Record<string, unknown> | null;
  }): Promise<LeadSyncDeliveryAttemptRecord>;
  updateLeadSyncDeliveryAttempt(input: {
    attemptId: string;
    status: LeadSyncDeliveryStatus;
    responseCode?: number | null;
    responseBody?: string | null;
    errorMessage?: string | null;
    metadata?: Record<string, unknown> | null;
    deliveredAt?: Date | null;
  }): Promise<LeadSyncDeliveryAttemptRecord>;
  createProjectLead(input: {
    projectId: string;
    sourceSubmissionId?: string | null;
    fullName: string;
    email: string;
    phone?: string;
    companyName?: string;
    message?: string;
    consent: boolean;
    createdAt: Date;
  }): Promise<ProjectLeadRecord>;
  updateProjectLeadSyncState(input: {
    projectLeadId: string;
    syncStatus: ProjectLeadSyncStatus;
    syncError?: string | null;
  }): Promise<ProjectLeadRecord>;
  listProjectLeads(projectId: string): Promise<ProjectLeadRecord[]>;
  listProjectLeadTombstones(projectId: string): Promise<ProjectLeadDeletionTombstoneRecord[]>;
  softDeleteProjectLeads(input: {
    projectId: string;
    leadIds: string[];
    actorUserId: string;
    reasonCode: string;
    note?: string | null;
    occurredAt: Date;
  }): Promise<ProjectLeadRecord[]>;
  restoreProjectLeads(input: {
    projectId: string;
    leadIds: string[];
    actorUserId: string;
    note?: string | null;
    occurredAt: Date;
  }): Promise<ProjectLeadRecord[]>;
  createProjectLeadRevealAuditEvent(input: {
    projectId: string;
    projectLeadId: string;
    actorUserId: string;
    reasonCode: string;
    note?: string | null;
    occurredAt: Date;
  }): Promise<ProjectLeadAuditEventRecord>;
  hardDeleteProjectLeads(input: {
    projectId: string;
    leadIds: string[];
    actorUserId: string;
    reasonCode: string;
    note?: string | null;
    occurredAt: Date;
  }): Promise<ProjectLeadDeletionTombstoneRecord[]>;
  listProjectInvites(projectId: string): Promise<ProjectInviteRecord[]>;
  createProjectInvite(input: {
    projectId: string;
    email: string;
    fullName?: string | null;
    role: ProjectMembershipRole;
    invitedByPortalUserId: string;
    selector: string;
    verifierHash: string;
    expiresAt: Date;
    occurredAt: Date;
  }): Promise<ProjectInviteRecord>;
  rotateProjectInvite(input: {
    projectId: string;
    inviteId: string;
    actorUserId: string;
    selector: string;
    verifierHash: string;
    expiresAt: Date;
    occurredAt: Date;
  }): Promise<ProjectInviteRecord | null>;
  updateProjectInviteRole(input: {
    projectId: string;
    inviteId: string;
    role: ProjectMembershipRole;
  }): Promise<ProjectInviteRecord | null>;
  revokeProjectInvite(input: {
    projectId: string;
    inviteId: string;
    actorUserId: string;
    occurredAt: Date;
  }): Promise<ProjectInviteRecord | null>;
  findProjectInviteBySelector(selector: string): Promise<ProjectInviteRecord | null>;
  consumeProjectInvite(input: {
    selector: string;
    verifierHash: string;
    portalUserId: string;
    acceptedAt: Date;
  }): Promise<ProjectInviteRecord | null>;
  countProjectOwners(projectId: string): Promise<number>;
  updateProjectMembershipRole(input: {
    projectId: string;
    memberPortalUserId: string;
    role: ProjectMembershipRole;
  }): Promise<ProjectMemberRecord | null>;
  removeProjectMembership(input: {
    projectId: string;
    memberPortalUserId: string;
  }): Promise<boolean>;
  assertProjectAccess(input: {
    portalUserId: string;
    projectId: string;
  }): Promise<ProjectAccessRecord | null>;
}

export interface LandingPlatformDependencies {
  now(): Date;
  randomToken(): string;
  hashToken(value: string): string;
  hashPassword(value: string): Promise<string>;
  verifyPassword(value: string, passwordHash: string): Promise<boolean>;
  sendMagicLinkEmail(input: {
    email: string;
    magicLinkUrl: string;
  }): Promise<void>;
  sendVerificationEmail(input: {
    email: string;
    verificationUrl: string;
  }): Promise<void>;
  sendPasswordResetEmail(input: {
    email: string;
    resetUrl: string;
  }): Promise<void>;
  sendProjectGoLiveEmail(input: {
    email: string;
    projectName: string;
    liveUrl: string;
    previewUrl: string | null;
    clientCompanyName: string | null;
    goLiveAt: Date;
  }): Promise<void>;
  verifyGoogleIdToken(input: { idToken: string }): Promise<VerifiedGoogleIdentity>;
  appendLeadToGoogleSheet(input: {
    target: LeadSyncTargetRecord;
    project: LandingProjectRecord;
    lead: ProjectLeadRecord;
  }): Promise<void>;
  pushLeadToMdoc(input: {
    target: LeadSyncTargetRecord;
    project: LandingProjectRecord;
    lead: ProjectLeadRecord;
  }): Promise<{
    responseCode: number | null;
    responseBody: string | null;
    metadata?: Record<string, unknown> | null;
  }>;
  resolveDnsRecords?(input: {
    host: string;
  }): Promise<{
    aRecords: string[];
    cnameRecords: string[];
  }>;
  appBaseUrl?: string;
  previewHostSuffix?: string;
  deliveryDnsTarget?: string;
  magicLinkTtlMs?: number;
  emailVerificationTtlMs?: number;
  passwordResetTtlMs?: number;
  sessionTtlMs?: number;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function normalizeGa4MeasurementId(value: string | null | undefined): string | null {
  const normalized = value?.trim().toUpperCase() ?? "";
  if (!normalized) {
    return null;
  }

  if (!/^G-[A-Z0-9]{6,}$/.test(normalized)) {
    throw new Error("GA4 measurement ID is invalid.");
  }

  return normalized;
}

function normalizeGtmContainerId(value: string | null | undefined): string | null {
  const normalized = value?.trim().toUpperCase() ?? "";
  if (!normalized) {
    return null;
  }

  if (!/^GTM-[A-Z0-9]{5,}$/.test(normalized)) {
    throw new Error("GTM container ID is invalid.");
  }

  return normalized;
}

function normalizeMetaPixelId(value: string | null | undefined): string | null {
  const normalized = value?.replace(/\D/g, "") ?? "";
  if (!normalized) {
    return null;
  }

  if (normalized.length < 8 || normalized.length > 20) {
    throw new Error("Meta Pixel ID is invalid.");
  }

  return normalized;
}

function normalizeGoogleAdsTagId(value: string | null | undefined): string | null {
  const normalized = value?.trim().toUpperCase() ?? "";
  if (!normalized) {
    return null;
  }

  if (!/^AW-\d{6,20}$/.test(normalized)) {
    throw new Error("Google Ads tag ID is invalid.");
  }

  return normalized;
}

function normalizeGoogleAdsConversionMode(
  value: GoogleAdsConversionMode | null | undefined,
): GoogleAdsConversionMode {
  return value === "GA4_IMPORTED" ? "GA4_IMPORTED" : "DIRECT_LABEL";
}

function normalizeGoogleAdsLeadConversionLabel(value: string | null | undefined): string | null {
  const normalized = value?.trim() ?? "";
  if (!normalized) {
    return null;
  }

  if (!/^[A-Za-z0-9_-]{4,120}$/.test(normalized)) {
    throw new Error("Google Ads conversion label is invalid.");
  }

  return normalized;
}

function normalizeLeadSyncTargetStatus(value: LeadSyncTargetStatus | null | undefined): LeadSyncTargetStatus {
  return value === "INACTIVE" ? "INACTIVE" : "ACTIVE";
}

function normalizeMdocEndpoint(value: string | null | undefined): string {
  const normalized = value?.trim() ?? "";
  if (!normalized) {
    throw new Error("MDOC endpoint is required.");
  }

  try {
    const url = new URL(normalized);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error("MDOC endpoint is invalid.");
    }
  } catch {
    throw new Error("MDOC endpoint is invalid.");
  }

  return normalized;
}

function normalizeMdocApiKey(value: string | null | undefined): string {
  const normalized = value?.trim() ?? "";
  if (!normalized) {
    throw new Error("MDOC API key is required.");
  }

  if (!/^[A-Za-z0-9-]{16,128}$/.test(normalized)) {
    throw new Error("MDOC API key is invalid.");
  }

  return normalized;
}

function normalizeCompactLabel(
  value: string | null | undefined,
  fallback: string,
  fieldName: string,
): string {
  const normalized = value?.trim() ?? "";
  if (!normalized) {
    return fallback;
  }

  if (normalized.length > 80) {
    throw new Error(`${fieldName} is too long.`);
  }

  return normalized;
}

function normalizeMdocStringMap(
  value: Record<string, string> | null | undefined,
  fieldName: string,
): Record<string, string> | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${fieldName} is invalid.`);
  }

  const normalizedEntries: Array<[string, string]> = [];
  for (const [rawKey, rawValue] of Object.entries(value)) {
    if (typeof rawValue !== "string") {
      throw new Error(`${fieldName} is invalid.`);
    }

    const key = rawKey.trim();
    const mappedValue = rawValue.trim();
    if (!key || !mappedValue) {
      continue;
    }

    if (key.length > 80 || mappedValue.length > 120) {
      throw new Error(`${fieldName} is invalid.`);
    }

    normalizedEntries.push([key, mappedValue]);
  }

  return Object.fromEntries(normalizedEntries);
}

function normalizeMdocEnumMappings(
  value: MdocPushEnumMappings | null | undefined,
): MdocPushEnumMappings | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== "object" || Array.isArray(value)) {
    throw new Error("MDOC enum mappings are invalid.");
  }

  return {
    preferences: normalizeMdocStringMap(value.preferences, "MDOC enum mappings are invalid."),
    budgets: normalizeMdocStringMap(value.budgets, "MDOC enum mappings are invalid."),
    buyingPurposes: normalizeMdocStringMap(value.buyingPurposes, "MDOC enum mappings are invalid."),
    possessionReqs: normalizeMdocStringMap(value.possessionReqs, "MDOC enum mappings are invalid."),
    ageRanges: normalizeMdocStringMap(value.ageRanges, "MDOC enum mappings are invalid."),
  };
}

function readExistingMdocConfig(target: LeadSyncTargetRecord | null): MdocPushLeadSyncConfig | null {
  if (!target || target.kind !== "MDOC_PUSH") {
    return null;
  }

  if (!("endpoint" in target.config) || !("apiKey" in target.config)) {
    return null;
  }

  return target.config;
}

function mergeMdocConfig(input: {
  endpoint: string;
  apiKey: string;
  dataFrom: "T" | "E";
  source: string;
  fallbackSourceDetail: string;
  existingConfig: MdocPushLeadSyncConfig | null;
  sourceDetailRules?: Record<string, string>;
  staticDefaults?: Record<string, string>;
  enumMappings?: MdocPushEnumMappings;
}): MdocPushLeadSyncConfig {
  const defaultConfig = buildDefaultMdocPushConfig({
    endpoint: input.endpoint,
    apiKey: input.apiKey,
    dataFrom: input.dataFrom,
    source: input.source,
    fallbackSourceDetail: input.fallbackSourceDetail,
  });

  const mergedEnumMappings: MdocPushEnumMappings = {
    preferences: {
      ...(defaultConfig.enumMappings?.preferences ?? {}),
      ...(
        input.enumMappings?.preferences === undefined
          ? (input.existingConfig?.enumMappings?.preferences ?? {})
          : input.enumMappings.preferences
      ),
    },
    budgets: {
      ...(defaultConfig.enumMappings?.budgets ?? {}),
      ...(
        input.enumMappings?.budgets === undefined
          ? (input.existingConfig?.enumMappings?.budgets ?? {})
          : input.enumMappings.budgets
      ),
    },
    buyingPurposes: {
      ...(defaultConfig.enumMappings?.buyingPurposes ?? {}),
      ...(
        input.enumMappings?.buyingPurposes === undefined
          ? (input.existingConfig?.enumMappings?.buyingPurposes ?? {})
          : input.enumMappings.buyingPurposes
      ),
    },
    possessionReqs: {
      ...(defaultConfig.enumMappings?.possessionReqs ?? {}),
      ...(
        input.enumMappings?.possessionReqs === undefined
          ? (input.existingConfig?.enumMappings?.possessionReqs ?? {})
          : input.enumMappings.possessionReqs
      ),
    },
    ageRanges: {
      ...(defaultConfig.enumMappings?.ageRanges ?? {}),
      ...(
        input.enumMappings?.ageRanges === undefined
          ? (input.existingConfig?.enumMappings?.ageRanges ?? {})
          : input.enumMappings.ageRanges
      ),
    },
  };

  return {
    ...defaultConfig,
    sourceDetailRules: {
      ...(defaultConfig.sourceDetailRules ?? {}),
      ...(input.sourceDetailRules === undefined
        ? (input.existingConfig?.sourceDetailRules ?? {})
        : input.sourceDetailRules),
    },
    staticDefaults: {
      ...(defaultConfig.staticDefaults ?? {}),
      ...(input.staticDefaults === undefined
        ? (input.existingConfig?.staticDefaults ?? {})
        : input.staticDefaults),
    },
    enumMappings: mergedEnumMappings,
  };
}

function normalizeFullName(input: { firstName?: string; lastName?: string; fullName?: string | null }) {
  if (input.fullName !== undefined) {
    return input.fullName?.trim() || null;
  }

  const fullName = [input.firstName?.trim(), input.lastName?.trim()]
    .filter(Boolean)
    .join(" ")
    .trim();
  return fullName || null;
}

function normalizeRedirectPath(redirectPath?: string): string {
  if (!redirectPath || !redirectPath.trim()) {
    return "/projects";
  }

  const normalized = redirectPath.trim();
  return normalized.startsWith("/") ? normalized : `/${normalized}`;
}

function buildProjectDashboardPath(projectId: string): string {
  return `/dashboard/projects/${encodeURIComponent(projectId)}`;
}

function csvEscape(value: string | null): string {
  if (!value) {
    return "";
  }

  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, "\"\"")}"`;
  }

  return value;
}

function humanizeLeadToken(value: string | null | undefined): string | null {
  if (!value?.trim()) {
    return null;
  }

  return value
    .trim()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function detectInternalTestLead(lead: ProjectLeadRecord): boolean {
  const email = lead.email.trim().toLowerCase();
  const sourceBits = [
    lead.sourcePage,
    lead.sourceCta,
    lead.utmSource,
    lead.utmMedium,
    lead.utmCampaign,
    lead.problemSummary,
    lead.message,
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
    sourceBits.includes("utm_medium=qa") ||
    sourceBits.includes("codex-email-test") ||
    sourceBits.includes("smoke test") ||
    sourceBits.includes("live form verification")
  );
}

function buildPortalWorkspaceView(role: PortalUserRole): PortalWorkspaceView {
  return role === "CLIENT" ? "CLIENT" : "OPERATOR";
}

const CLIENT_SOFT_DELETE_REASONS = new Set([
  "DUPLICATE_LEAD",
  "TEST_OR_INTERNAL",
  "WRONG_ENQUIRY",
  "ALREADY_HANDLED_OFFLINE",
  "NOT_RELEVANT",
  "PRIVACY_CLEAN_UP",
]);

const OPERATOR_SOFT_DELETE_REASONS = new Set([
  "SPAM_OR_JUNK",
  "DUPLICATE_ACROSS_SOURCES",
  "PRIVACY_REQUEST",
  "INTERNAL_TEST_LEAD",
  "DATA_HYGIENE_CORRECTION",
  "SUPPORT_DIRECTED_CLEANUP",
]);

const HARD_DELETE_REASONS = new Set([
  "PRIVACY_ERASURE_REQUEST",
  "ACCIDENTAL_TEST_DATA",
  "DUPLICATE_WITH_RAW_DATA_PURGE",
  "COMPLIANCE_CLEANUP",
  "OPERATOR_CORRECTION",
]);

const PII_REVEAL_REASONS = new Set([
  "CLIENT_SUPPORT",
  "LEAD_DELIVERY_DEBUGGING",
  "ASSIGNMENT_FOLLOW_UP_VERIFICATION",
  "DATA_CORRECTION",
  "COMPLIANCE_REQUEST",
]);

function maskLeadEmail(email: string): string {
  const normalized = email.trim();
  const atIndex = normalized.indexOf("@");
  if (atIndex <= 1) {
    return normalized;
  }

  const local = normalized.slice(0, atIndex);
  const domain = normalized.slice(atIndex);
  return `${local.slice(0, 2)}***${domain}`;
}

function maskLeadPhone(phone: string | null): string | null {
  if (!phone) {
    return null;
  }

  const digits = phone.replace(/\D/g, "");
  if (digits.length < 6) {
    return phone;
  }

  return `${digits.slice(0, 2)}******${digits.slice(-2)}`;
}

function maskProjectLeadContact(lead: ProjectLeadRecord): ProjectLeadRecord {
  return {
    ...lead,
    email: maskLeadEmail(lead.email),
    phone: maskLeadPhone(lead.phone),
  };
}

function isOperatorRole(role: PortalUserRole): boolean {
  return role === "PLATFORM_ADMIN" || role === "PLATFORM_OPERATOR";
}

function canManageProjectAsOwner(access: ProjectAccessRecord): boolean {
  return isOperatorRole(access.portalUser.role) || access.membershipRole === "OWNER";
}

function validateReasonCode(
  allowedReasons: ReadonlySet<string>,
  reasonCode: string,
  fallbackMessage: string,
) {
  if (!allowedReasons.has(reasonCode.trim().toUpperCase())) {
    throw new Error(fallbackMessage);
  }
}

function annotateProjectLead(lead: ProjectLeadRecord): ProjectLeadRecord {
  const isInternalTest = lead.isInternalTest || detectInternalTestLead(lead);

  return {
    ...lead,
    isInternalTest,
    interestLabel: lead.interestLabel ?? humanizeLeadToken(lead.serviceInterest[0]),
    budgetLabel: lead.budgetLabel ?? humanizeLeadToken(lead.budgetRange),
    touchpointLabel: lead.touchpointLabel ?? humanizeLeadToken(lead.sourceCta),
  };
}

function buildVisibleProjectLeads(input: {
  portalUserRole: PortalUserRole;
  membershipRole: ProjectMembershipRole;
  portalView: PortalWorkspaceView;
  tab?: ProjectLeadTab;
  leads: ProjectLeadRecord[];
}): ProjectLeadRecord[] {
  const normalizedTab = input.tab === "hidden" ? "hidden" : "active";
  const leads = input.leads
    .map(annotateProjectLead)
    .filter((lead) =>
      normalizedTab === "hidden"
        ? lead.visibilityState === "HIDDEN"
        : lead.visibilityState !== "HIDDEN",
    );

  if (input.portalView === "OPERATOR") {
    return leads.map(maskProjectLeadContact);
  }

  const withoutInternalTests = leads.filter((lead) => !lead.isInternalTest);
  if (normalizedTab === "hidden" && input.membershipRole !== "OWNER") {
    throw new Error("Project owner access required.");
  }

  if (input.membershipRole === "VIEWER") {
    return withoutInternalTests.map(maskProjectLeadContact);
  }

  return withoutInternalTests;
}

function buildLeadExportRows(input: {
  leads: ProjectLeadRecord[];
  mode: LeadExportMode;
  portalView: PortalWorkspaceView;
}) {
  if (input.mode === "basic") {
    return input.leads.map((lead) => ({
      createdAt: lead.createdAt.toISOString(),
      fullName: lead.fullName,
      phone: lead.phone,
      email: lead.email,
      companyName: lead.companyName,
      interest: lead.interestLabel,
      budget: lead.budgetLabel,
      touchpoint: lead.touchpointLabel,
      sourcePage: lead.sourcePage,
    }));
  }

  return input.leads.map((lead) => ({
    createdAt: lead.createdAt.toISOString(),
    fullName: lead.fullName,
    phone: lead.phone,
    email: lead.email,
    companyName: lead.companyName,
    interest: lead.interestLabel,
    budget: lead.budgetLabel,
    timeline: lead.timeline,
    touchpoint: lead.touchpointLabel,
    sourceKind: lead.sourceKind,
    sourceConnector: lead.sourceConnectorLabel,
    campaign: lead.campaignName,
    importBatch: lead.importBatchLabel,
    externalLeadId: lead.externalLeadId,
    capturedAt: lead.capturedAt?.toISOString() ?? null,
    sourcePage: lead.sourcePage,
    sourceHost: lead.sourceHost,
    sourceCta: lead.sourceCta,
    utmSource: lead.utmSource,
    utmMedium: lead.utmMedium,
    utmCampaign: lead.utmCampaign,
    summary: lead.problemSummary ?? lead.message,
    serviceInterest: lead.serviceInterest.join(", "),
    consent: lead.consent ? "Yes" : "No",
    ...(input.portalView === "OPERATOR"
      ? {
          alertStatus: lead.notificationStatus,
          alertError: lead.notificationError,
          syncStatus: lead.syncStatus,
          syncError: lead.syncError,
          isInternalTest: lead.isInternalTest ? "Yes" : "No",
        }
      : {}),
  }));
}

function normalizeProjectSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeDomainHost(value: string | undefined | null): string | null {
  const normalized = value?.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/+$/, "");
  return normalized || null;
}

function buildPublicLeadKey(projectSlug: string): string {
  const normalized = projectSlug.replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  return `lead_${normalized}`;
}

function buildPreviewHost(projectSlug: string, previewHostSuffix: string): string {
  return `${projectSlug}.${previewHostSuffix.replace(/^\.+/, "").trim().toLowerCase()}`;
}

function buildProjectPreviewUrl(site: ProjectSiteRecord | null): string | null {
  if (!site) {
    return null;
  }

  if (site.previewHost) {
    return `https://${site.previewHost}`;
  }

  return site.latestPreviewPath;
}

function buildProjectLiveUrl(project: LandingProjectRecord): string | null {
  return project.primaryDomain ? `https://${project.primaryDomain}` : null;
}

function summarizeBilling(
  records: ProjectBillingRecord[],
  members: ProjectMemberRecord[],
): ProjectBillingSummaryRecord {
  const latestRecord = [...records].sort(
    (left, right) => right.updatedAt.getTime() - left.updatedAt.getTime(),
  )[0];

  return {
    billingContactEmails: members.map((member) => member.email),
    cartCount: records.length,
    totalQuotedMinor: records.reduce((sum, record) => sum + record.totalMinor, 0),
    totalPayableTodayMinor: records.reduce(
      (sum, record) => sum + record.payableTodayMinor,
      0,
    ),
    latestCartId: latestRecord?.id ?? null,
    latestCartStatus: latestRecord?.status ?? null,
    latestQuoteRequestStatus: latestRecord?.quoteRequestStatus ?? null,
    latestCheckoutStatus: latestRecord?.latestCheckoutStatus ?? null,
    latestPaymentSessionId: latestRecord?.latestPaymentSessionId ?? null,
    latestProviderOrderId: latestRecord?.latestProviderOrderId ?? null,
    latestErpQuotationId: latestRecord?.erpQuotationId ?? null,
    latestErpSalesOrderId: latestRecord?.erpSalesOrderId ?? null,
    latestErpCustomerId: latestRecord?.erpCustomerId ?? null,
    latestUpdatedAt: latestRecord?.updatedAt ?? null,
  };
}

export function createLandingPlatformService(
  repository: LandingPlatformRepository,
  dependencies: LandingPlatformDependencies,
) {
  const magicLinkTtlMs = dependencies.magicLinkTtlMs ?? 15 * 60 * 1000;
  const emailVerificationTtlMs = dependencies.emailVerificationTtlMs ?? 24 * 60 * 60 * 1000;
  const passwordResetTtlMs = dependencies.passwordResetTtlMs ?? 60 * 60 * 1000;
  const sessionTtlMs = dependencies.sessionTtlMs ?? 30 * 24 * 60 * 60 * 1000;
  const appBaseUrl = dependencies.appBaseUrl ?? "https://shasvata.com/app";
  const previewHostSuffix = dependencies.previewHostSuffix ?? "preview.shasvata.com";
  const deliveryDnsTarget =
    normalizeDomainHost(dependencies.deliveryDnsTarget) ?? "landing.shasvata.com";
  const resolveDnsRecords =
    dependencies.resolveDnsRecords ??
    (async () => ({
      aRecords: [],
      cnameRecords: [],
    }));

  async function createSessionForPortalUser(portalUserId: string) {
    return repository.createPortalSession({
      portalUserId,
      expiresAt: new Date(dependencies.now().getTime() + sessionTtlMs),
    });
  }

  function createTokenPair() {
    const token = dependencies.randomToken();
    const [selector, verifier] = token.split(".", 2);
    if (!selector || !verifier) {
      throw new Error("randomToken() must return <selector>.<verifier>.");
    }

    return {
      selector,
      verifier,
      verifierHash: dependencies.hashToken(verifier),
    };
  }

  function buildAuthUrl(pathname: string, params: Record<string, string>) {
    const url = new URL(appBaseUrl);
    const basePath = url.pathname.replace(/\/+$/, "");
    const relativePath = pathname.startsWith("/") ? pathname : `/${pathname}`;
    url.pathname = `${basePath}${relativePath}`;
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
    return url.toString();
  }

  async function requirePendingProjectInvite(selector?: string, verifier?: string) {
    if (!selector && !verifier) {
      return null;
    }

    if (!selector || !verifier) {
      throw new Error("Project invite is invalid or expired.");
    }

    const invite = await repository.findProjectInviteBySelector(selector);
    if (
      !invite ||
      invite.verifierHash !== dependencies.hashToken(verifier) ||
      invite.status !== "PENDING" ||
      invite.expiresAt.getTime() <= dependencies.now().getTime()
    ) {
      throw new Error("Project invite is invalid or expired.");
    }

    return invite;
  }

  async function consumeInviteForPortalUser(input: {
    portalUserId: string;
    email: string;
    inviteSelector?: string;
    inviteVerifier?: string;
  }) {
    const invite = await requirePendingProjectInvite(
      input.inviteSelector,
      input.inviteVerifier,
    );
    if (!invite) {
      return null;
    }

    if (normalizeEmail(input.email) !== invite.email) {
      throw new Error("Project invite email mismatch.");
    }

    const consumed = await repository.consumeProjectInvite({
      selector: invite.selector,
      verifierHash: invite.verifierHash,
      portalUserId: input.portalUserId,
      acceptedAt: dependencies.now(),
    });

    if (!consumed) {
      throw new Error("Project invite is invalid or expired.");
    }

    return {
      invite: consumed,
      redirectPath: buildProjectDashboardPath(consumed.projectId),
    };
  }

  async function activatePortalUser(portalUserId: string) {
    return repository.updatePortalUser({
      portalUserId,
      status: "ACTIVE",
      emailVerifiedAt: dependencies.now(),
    });
  }

  function resolveGoogleCredentialKind(credential: AuthCredentialRecord | null): AuthCredentialKind {
    if (credential?.passwordHash) {
      return "PASSWORD_AND_GOOGLE";
    }

    return "GOOGLE_OIDC";
  }

  function resolvePasswordCredentialKind(credential: AuthCredentialRecord | null): AuthCredentialKind {
    if (
      credential?.kind === "GOOGLE_OIDC" ||
      credential?.kind === "PASSWORD_AND_GOOGLE" ||
      credential?.googleSubject
    ) {
      return "PASSWORD_AND_GOOGLE";
    }

    return "PASSWORD";
  }

  async function issueMagicLink(input: RequestMagicLinkInput) {
    const email = normalizeEmail(input.email);
    const portalUser = await repository.findPortalUserByEmail(email);

    if (!portalUser || portalUser.status !== "ACTIVE") {
      return { accepted: true as const };
    }

    const { selector, verifier, verifierHash } = createTokenPair();

    const redirectPath = normalizeRedirectPath(input.redirectPath);
    const expiresAt = new Date(dependencies.now().getTime() + magicLinkTtlMs);
    await repository.createMagicLink({
      portalUserId: portalUser.id,
      email,
      selector,
      verifierHash,
      redirectPath,
      expiresAt,
    });

    await dependencies.sendMagicLinkEmail({
      email,
      magicLinkUrl: buildAuthUrl("/auth/verify", {
        selector,
        verifier,
        redirect: redirectPath,
      }),
    });

    return { accepted: true as const };
  }

  async function requireOperatorUser(portalUserId: string) {
    const portalUser = await repository.findPortalUserById(portalUserId);
    if (
      !portalUser ||
      portalUser.status !== "ACTIVE" ||
      (portalUser.role !== "PLATFORM_ADMIN" && portalUser.role !== "PLATFORM_OPERATOR")
    ) {
      throw new Error("Operator access required.");
    }

    return portalUser;
  }

  return {
    async requestPortalMagicLink(input: RequestMagicLinkInput) {
      return issueMagicLink(input);
    },

    async signUpWithPassword(input: PasswordSignUpInput) {
      const email = normalizeEmail(input.email);
      const password = input.password.trim();
      const fullName = normalizeFullName({
        firstName: input.firstName,
        lastName: input.lastName,
      });
      const pendingInvite = await requirePendingProjectInvite(
        input.inviteSelector,
        input.inviteVerifier,
      );

      if (!input.firstName.trim() || !email || !password) {
        throw new Error("First name, email, and password are required.");
      }

      if (pendingInvite && email !== pendingInvite.email) {
        throw new Error("Project invite email mismatch.");
      }

      const existingUser = await repository.findPortalUserByEmail(email);
      if (existingUser) {
        throw new Error("An account with this email already exists.");
      }

      const portalUser = await repository.createPortalUser({
        email,
        fullName,
        phone: input.phone?.trim() || null,
        role: "CLIENT",
        status: "PENDING",
      });

      await repository.upsertAuthCredential({
        portalUserId: portalUser.id,
        kind: "PASSWORD",
        passwordHash: await dependencies.hashPassword(password),
      });

      if (pendingInvite) {
        const acceptedInvite = await consumeInviteForPortalUser({
          portalUserId: portalUser.id,
          email,
          inviteSelector: pendingInvite.selector,
          inviteVerifier: input.inviteVerifier,
        });
        const activePortalUser = await repository.findPortalUserById(portalUser.id);
        if (!acceptedInvite || !activePortalUser || activePortalUser.status !== "ACTIVE") {
          throw new Error("Project invite is invalid or expired.");
        }

        const session = await createSessionForPortalUser(activePortalUser.id);
        return {
          authenticated: true as const,
          portalUser: activePortalUser,
          session,
          redirectPath: acceptedInvite.redirectPath,
        };
      }

      const { selector, verifier, verifierHash } = createTokenPair();
      await repository.createEmailVerificationToken({
        portalUserId: portalUser.id,
        email,
        selector,
        verifierHash,
        expiresAt: new Date(dependencies.now().getTime() + emailVerificationTtlMs),
      });

      await dependencies.sendVerificationEmail({
        email,
        verificationUrl: buildAuthUrl("/auth/verify-email", {
          selector,
          verifier,
        }),
      });

      return { accepted: true as const };
    },

    async consumeEmailVerification(input: ConsumeEmailVerificationInput) {
      const consumed = await repository.consumeEmailVerificationToken({
        selector: input.selector,
        verifierHash: dependencies.hashToken(input.verifier),
        now: dependencies.now(),
      });

      if (!consumed) {
        throw new Error("Email verification link is invalid or expired.");
      }

      const portalUser = await activatePortalUser(consumed.portalUserId);
      const session = await createSessionForPortalUser(portalUser.id);

      return {
        portalUser,
        session,
      };
    },

    async consumePortalMagicLink(input: ConsumeMagicLinkInput) {
      const consumed = await repository.consumeMagicLink({
        selector: input.selector,
        verifierHash: dependencies.hashToken(input.verifier),
        now: dependencies.now(),
      });

      if (!consumed) {
        throw new Error("Magic link is invalid or expired.");
      }

      const portalUser = await repository.findPortalUserById(consumed.portalUserId);
      if (!portalUser || portalUser.status !== "ACTIVE") {
        throw new Error("Portal user is not active.");
      }

      const session = await createSessionForPortalUser(portalUser.id);

      return {
        portalUser,
        session,
        redirectPath: consumed.redirectPath,
      };
    },

    async signInWithPassword(input: PasswordSignInInput) {
      const email = normalizeEmail(input.email);
      const password = input.password;
      const signInError = new Error("Invalid email or password.");

      if (!email || !password.trim()) {
        throw signInError;
      }

      const candidate = await repository.findAuthCredentialByEmail(email);
      if (
        !candidate ||
        candidate.portalUser.status !== "ACTIVE" ||
        !candidate.credential.passwordHash
      ) {
        throw signInError;
      }

      const validPassword = await dependencies.verifyPassword(
        password,
        candidate.credential.passwordHash,
      );
      if (!validPassword) {
        throw signInError;
      }

      const acceptedInvite = await consumeInviteForPortalUser({
        portalUserId: candidate.portalUser.id,
        email: candidate.portalUser.email,
        inviteSelector: input.inviteSelector,
        inviteVerifier: input.inviteVerifier,
      });
      const session = await createSessionForPortalUser(candidate.portalUser.id);
      return {
        portalUser: candidate.portalUser,
        session,
        redirectPath: acceptedInvite?.redirectPath,
      };
    },

    async requestPasswordReset(input: PasswordResetRequestInput) {
      const email = normalizeEmail(input.email);
      const portalUser = await repository.findPortalUserByEmail(email);

      if (!portalUser || portalUser.status !== "ACTIVE") {
        return { accepted: true as const };
      }

      const { selector, verifier, verifierHash } = createTokenPair();
      await repository.createPasswordResetToken({
        portalUserId: portalUser.id,
        selector,
        verifierHash,
        expiresAt: new Date(dependencies.now().getTime() + passwordResetTtlMs),
      });

      await dependencies.sendPasswordResetEmail({
        email,
        resetUrl: buildAuthUrl("/auth/reset-password", {
          selector,
          verifier,
        }),
      });

      return { accepted: true as const };
    },

    async resetPassword(input: PasswordResetInput) {
      const password = input.password.trim();
      if (!password) {
        throw new Error("A new password is required.");
      }

      const consumed = await repository.consumePasswordResetToken({
        selector: input.selector,
        verifierHash: dependencies.hashToken(input.verifier),
        now: dependencies.now(),
      });

      if (!consumed) {
        throw new Error("Password reset link is invalid or expired.");
      }

      const portalUser = await repository.findPortalUserById(consumed.portalUserId);
      if (!portalUser) {
        throw new Error("Portal user is not active.");
      }

      const candidate = await repository.findAuthCredentialByEmail(portalUser.email);
      await repository.upsertAuthCredential({
        portalUserId: portalUser.id,
        kind: resolvePasswordCredentialKind(candidate?.credential ?? null),
        passwordHash: await dependencies.hashPassword(password),
        googleSubject: candidate?.credential.googleSubject ?? null,
        googleEmail: candidate?.credential.googleEmail ?? null,
      });

      await repository.deletePortalSessionsForUser(portalUser.id);
      const activePortalUser =
        portalUser.status === "ACTIVE" ? portalUser : await activatePortalUser(portalUser.id);
      const session = await createSessionForPortalUser(activePortalUser.id);

      return {
        portalUser: activePortalUser,
        session,
      };
    },

    async signInWithGoogle(input: GoogleSignInInput) {
      const googleIdentity = await dependencies.verifyGoogleIdToken({
        idToken: input.idToken,
      });

      if (!googleIdentity.emailVerified) {
        throw new Error("Google account email is not verified.");
      }

      const existingBySubject = await repository.findAuthCredentialByGoogleSubject(
        googleIdentity.subject,
      );

      if (existingBySubject) {
        const portalUser =
          existingBySubject.portalUser.status === "ACTIVE"
            ? existingBySubject.portalUser
            : await activatePortalUser(existingBySubject.portalUser.id);
        const session = await createSessionForPortalUser(portalUser.id);
        return {
          portalUser,
          session,
        };
      }

      const email = normalizeEmail(googleIdentity.email);
      const candidateByEmail = await repository.findAuthCredentialByEmail(email);
      let portalUser = await repository.findPortalUserByEmail(email);

      if (!portalUser) {
        portalUser = await repository.createPortalUser({
          email,
          fullName: normalizeFullName({ fullName: googleIdentity.fullName }),
          role: "CLIENT",
          status: "ACTIVE",
          emailVerifiedAt: dependencies.now(),
        });
      } else if (portalUser.status !== "ACTIVE" || !portalUser.emailVerifiedAt) {
        portalUser = await repository.updatePortalUser({
          portalUserId: portalUser.id,
          fullName: portalUser.fullName ?? normalizeFullName({ fullName: googleIdentity.fullName }),
          status: "ACTIVE",
          emailVerifiedAt: dependencies.now(),
        });
      }

      await repository.upsertAuthCredential({
        portalUserId: portalUser.id,
        kind: resolveGoogleCredentialKind(candidateByEmail?.credential ?? null),
        passwordHash: candidateByEmail?.credential.passwordHash ?? null,
        googleSubject: googleIdentity.subject,
        googleEmail: email,
      });

      const acceptedInvite = await consumeInviteForPortalUser({
        portalUserId: portalUser.id,
        email: portalUser.email,
        inviteSelector: input.inviteSelector,
        inviteVerifier: input.inviteVerifier,
      });
      const session = await createSessionForPortalUser(portalUser.id);
      return {
        portalUser,
        session,
        redirectPath: acceptedInvite?.redirectPath,
      };
    },

    async bootstrapPlatformAdmin(input: BootstrapPlatformAdminInput) {
      if ((await repository.countPlatformAdmins()) > 0) {
        throw new Error("Platform admin bootstrap is already complete.");
      }

      const email = normalizeEmail(input.email);
      const password = input.password;
      if (!email || !password.trim()) {
        throw new Error("Admin email and password are required.");
      }

      const portalUser = await repository.createPortalUser({
        email,
        fullName: input.fullName?.trim() || null,
        role: "PLATFORM_ADMIN",
        status: "ACTIVE",
        companyName: "Shasvata",
        emailVerifiedAt: dependencies.now(),
      });

      await repository.upsertAuthCredential({
        portalUserId: portalUser.id,
        kind: "PASSWORD",
        passwordHash: await dependencies.hashPassword(password),
      });

      const session = await createSessionForPortalUser(portalUser.id);
      return {
        portalUser,
        session,
      };
    },

    async getPortalSession(sessionId: string) {
      const normalized = sessionId.trim();
      if (!normalized) {
        return null;
      }

      return repository.findPortalSession({
        sessionId: normalized,
        now: dependencies.now(),
      });
    },

    async revokePortalSession(sessionId: string) {
      const normalized = sessionId.trim();
      if (!normalized) {
        return { revoked: true as const };
      }

      await repository.deletePortalSession(normalized);
      return { revoked: true as const };
    },

    async listAccessibleProjects(portalUserId: string) {
      const portalUser = await repository.findPortalUserById(portalUserId);
      if (!portalUser || portalUser.status !== "ACTIVE") {
        return [];
      }

      return repository.listProjectsForPortalUser(portalUser);
    },

    async listOperatorProjects(portalUserId: string) {
      const portalUser = await requireOperatorUser(portalUserId);
      return repository.listProjectsForPortalUser(portalUser);
    },

    async getProjectDetail(input: ProjectPortalAccessInput) {
      const access = await repository.assertProjectAccess(input);
      if (!access) {
        throw new Error("Project access denied.");
      }

      const portalView = buildPortalWorkspaceView(access.portalUser.role);

      const [project, sites, domains, syncTargets, members, notificationRecipients, leads, billingRecords] =
        await Promise.all([
        repository.findProjectById(access.project.id),
        repository.listProjectSites(access.project.id),
        repository.listProjectDomains(access.project.id),
        repository.listLeadSyncTargets(access.project.id),
        repository.listProjectMembers(access.project.id),
        repository.listProjectNotificationRecipients(access.project.id),
        repository.listProjectLeads(access.project.id),
        repository.listProjectBillingRecords(access.project.id),
      ]);

      if (!project) {
        throw new Error("Landing project not found.");
      }

      const sourceSite = sites.find((site) => Boolean(site.repoUrl)) ?? sites[0] ?? null;
      const previewUrl = portalView === "OPERATOR" ? buildProjectPreviewUrl(sourceSite) : null;
      const liveUrl = buildProjectLiveUrl(project);
      const visibleLeads = buildVisibleProjectLeads({
        portalUserRole: access.portalUser.role,
        membershipRole: access.membershipRole,
        portalView,
        tab: "active",
        leads,
      });
      const canViewDeliverySettings =
        portalView === "OPERATOR" || access.membershipRole === "OWNER";

      return {
        ...project,
        publicLeadKey: portalView === "OPERATOR" ? project.publicLeadKey : null,
        portalView,
        membershipRole: access.membershipRole,
        leadCount: visibleLeads.length,
        sites,
        domains,
        syncTargets: canViewDeliverySettings ? syncTargets : [],
        members,
        leadNotificationRecipients: canViewDeliverySettings ? notificationRecipients : [],
        sourceSummary:
          portalView === "OPERATOR" && sourceSite
          ? {
              siteId: sourceSite.id,
              provider: sourceSite.sourceProvider,
              repoUrl: sourceSite.repoUrl,
              repoBranch: sourceSite.repoBranch,
              repoRef: sourceSite.repoRef,
              deployedCommit: sourceSite.deployedCommit,
              runtimeProfile: sourceSite.runtimeProfile,
              operatorNotes: sourceSite.operatorNotes,
              previewHost: sourceSite.previewHost,
            }
          : null,
        previewUrl,
        liveUrl,
        billingSummary: summarizeBilling(billingRecords, members),
      } satisfies ProjectDetailRecord;
    },

    async createImportedProject(input: CreateImportedProjectInput) {
      await requireOperatorUser(input.portalUserId);

      const projectSlug = normalizeProjectSlug(input.projectSlug);
      if (!projectSlug || !input.projectName.trim() || !input.repoUrl.trim()) {
        throw new Error("Project slug, project name, and repo URL are required.");
      }

      return repository.createImportedProject({
        slug: projectSlug,
        name: input.projectName.trim(),
        publicLeadKey: buildPublicLeadKey(projectSlug),
        clientCompanyName: input.clientCompany?.trim() || null,
        repoUrl: input.repoUrl.trim(),
        repoBranch: input.repoBranch?.trim() || null,
        repoRef: input.repoRef?.trim() || null,
        runtimeProfile: "STATIC_ARTIFACT",
        operatorNotes: input.operatorNotes?.trim() || null,
        previewHost: buildPreviewHost(projectSlug, previewHostSuffix),
        desiredLiveDomain: normalizeDomainHost(input.desiredLiveDomain),
        dnsTarget: deliveryDnsTarget,
        actorUserId: input.portalUserId,
        createdAt: dependencies.now(),
      });
    },

    async refreshImportedProjectSource(input: RefreshImportedProjectSourceInput) {
      await requireOperatorUser(input.portalUserId);

      return repository.updateProjectSiteSource({
        projectId: input.projectId,
        siteId: input.siteId,
        repoUrl:
          input.repoUrl === undefined ? undefined : (input.repoUrl.trim() || null),
        repoBranch:
          input.repoBranch === undefined ? undefined : (input.repoBranch.trim() || null),
        repoRef: input.repoRef === undefined ? undefined : (input.repoRef.trim() || null),
        deployedCommit:
          input.deployedCommit === undefined
            ? undefined
            : (input.deployedCommit.trim() || null),
        runtimeProfile: input.runtimeProfile,
        operatorNotes:
          input.operatorNotes === undefined
            ? undefined
            : (input.operatorNotes.trim() || null),
      });
    },

    async upsertProjectDomain(input: UpsertProjectDomainInput) {
      await requireOperatorUser(input.portalUserId);

      const host = normalizeDomainHost(input.host);
      if (!host) {
        throw new Error("A valid domain host is required.");
      }

      return repository.upsertProjectDomain({
        projectId: input.projectId,
        siteId: input.siteId ?? null,
        host,
        isPrimary: Boolean(input.isPrimary),
        dnsTarget: deliveryDnsTarget,
        actorUserId: input.portalUserId,
        createdAt: dependencies.now(),
      });
    },

    async verifyProjectDomain(input: VerifyProjectDomainInput) {
      await requireOperatorUser(input.portalUserId);

      const domain = await repository.findProjectDomain({
        projectId: input.projectId,
        domainId: input.domainId,
      });
      if (!domain) {
        throw new Error("Landing project domain not found.");
      }

      const records = await resolveDnsRecords({ host: domain.host });
      const normalizedTarget = deliveryDnsTarget.toLowerCase();
      const matchesTarget =
        records.aRecords.map((entry) => entry.toLowerCase()).includes(normalizedTarget) ||
        records.cnameRecords.map((entry) => entry.toLowerCase()).includes(normalizedTarget);

      return repository.updateProjectDomainVerification({
        projectId: input.projectId,
        domainId: input.domainId,
        status: matchesTarget ? "ACTIVE" : "ERROR",
        verifiedAt: matchesTarget ? dependencies.now() : null,
        actorUserId: input.portalUserId,
        checkedAt: dependencies.now(),
      });
    },

    async recordProjectSitePublish(input: RecordProjectSitePublishInput) {
      await requireOperatorUser(input.portalUserId);

      const site = await repository.updateProjectSitePublishState({
        projectId: input.projectId,
        siteId: input.siteId,
        publishStatus: input.publishStatus,
        runtimeProfile: input.runtimeProfile,
        deployedCommit: input.deployedCommit?.trim() || null,
        previewHost: input.previewHost?.trim().toLowerCase() || null,
        lastPublishedAt: dependencies.now(),
      });

      const project = await repository.findProjectById(input.projectId);
      if (!project) {
        throw new Error("Landing project not found.");
      }

      const members = await repository.listProjectMembers(input.projectId);
      const domains = await repository.listProjectDomains(input.projectId);
      const liveUrl = buildProjectLiveUrl(project);
      const previewUrl = buildProjectPreviewUrl(site);

      let nextProject = project;
      const liveDomainActive = domains.some(
        (domain) => domain.host === project.primaryDomain && domain.status === "ACTIVE",
      );

      if (
        input.publishStatus === "PUBLISHED" &&
        liveUrl &&
        liveDomainActive &&
        !project.goLiveAt
      ) {
        nextProject = await repository.updateProjectGoLive({
          projectId: input.projectId,
          goLiveAt: dependencies.now(),
        });

        for (const member of members) {
          await dependencies.sendProjectGoLiveEmail({
            email: member.email,
            projectName: nextProject.name,
            liveUrl,
            previewUrl,
            clientCompanyName: nextProject.clientCompanyName,
            goLiveAt: nextProject.goLiveAt ?? dependencies.now(),
          });
        }
      }

      return {
        project: {
          id: nextProject.id,
          liveUrl,
          goLiveAt: nextProject.goLiveAt,
        },
        site,
      };
    },

    async inviteProjectMember(input: InviteProjectMemberInput) {
      const access = await repository.assertProjectAccess({
        portalUserId: input.portalUserId,
        projectId: input.projectId,
      });
      if (!access) {
        throw new Error("Project access denied.");
      }

      if (!canManageProjectAsOwner(access)) {
        throw new Error("Project owner access required.");
      }

      const email = normalizeEmail(input.email);
      const { selector, verifier, verifierHash } = createTokenPair();
      const invite = await repository.createProjectInvite({
        projectId: input.projectId,
        email,
        fullName: input.fullName?.trim() || null,
        role: input.role,
        invitedByPortalUserId: input.portalUserId,
        selector,
        verifierHash,
        expiresAt: new Date(dependencies.now().getTime() + 7 * 24 * 60 * 60 * 1000),
        occurredAt: dependencies.now(),
      });

      await dependencies.sendMagicLinkEmail({
        email,
        magicLinkUrl: buildAuthUrl(`/invite/${selector}/${verifier}`, {}),
      });

      return invite;
    },

    async listProjectAccessSettings(input: ListProjectAccessSettingsInput) {
      const access = await repository.assertProjectAccess(input);
      if (!access) {
        throw new Error("Project access denied.");
      }

      if (!canManageProjectAsOwner(access)) {
        throw new Error("Project owner access required.");
      }

      const [project, members, invites] = await Promise.all([
        repository.findProjectById(access.project.id),
        repository.listProjectMembers(access.project.id),
        repository.listProjectInvites(access.project.id),
      ]);

      if (!project) {
        throw new Error("Landing project not found.");
      }

      return {
        projectId: project.id,
        projectName: project.name,
        membershipRole: access.membershipRole,
        members,
        invites,
      };
    },

    async updateProjectTrackingSettings(input: UpdateProjectTrackingSettingsInput) {
      const access = await repository.assertProjectAccess(input);
      if (!access) {
        throw new Error("Project access denied.");
      }

      if (!canManageProjectAsOwner(access)) {
        throw new Error("Project owner access required.");
      }

      const sites = await repository.listProjectSites(access.project.id);
      const primarySite = sites[0];
      if (!primarySite) {
        throw new Error("Project site not found.");
      }

      return repository.updateProjectSiteTracking({
        projectId: input.projectId,
        siteId: primarySite.id,
        ga4MeasurementId:
          input.ga4MeasurementId === undefined
            ? undefined
            : normalizeGa4MeasurementId(input.ga4MeasurementId),
        googleAdsTagId:
          input.googleAdsTagId === undefined
            ? undefined
            : normalizeGoogleAdsTagId(input.googleAdsTagId),
        googleAdsConversionMode:
          input.googleAdsConversionMode === undefined
            ? undefined
            : normalizeGoogleAdsConversionMode(input.googleAdsConversionMode),
        googleAdsLeadConversionLabel:
          input.googleAdsLeadConversionLabel === undefined
            ? undefined
            : normalizeGoogleAdsLeadConversionLabel(input.googleAdsLeadConversionLabel),
        gtmContainerId:
          input.gtmContainerId === undefined
            ? undefined
            : normalizeGtmContainerId(input.gtmContainerId),
        metaPixelId:
          input.metaPixelId === undefined
            ? undefined
            : normalizeMetaPixelId(input.metaPixelId),
        trackingNotes:
          input.trackingNotes === undefined ? undefined : input.trackingNotes?.trim() || null,
      });
    },

    async upsertProjectMdocSyncTarget(input: UpsertProjectMdocSyncTargetInput) {
      const access = await repository.assertProjectAccess(input);
      if (!access) {
        throw new Error("Project access denied.");
      }

      if (!canManageProjectAsOwner(access)) {
        throw new Error("Project owner access required.");
      }

      const existingTarget = (
        await repository.listLeadSyncTargets(input.projectId)
      ).find((target) => target.kind === "MDOC_PUSH") ?? null;
      const existingConfig = readExistingMdocConfig(existingTarget);
      const endpoint = normalizeMdocEndpoint(input.endpoint);
      const apiKey = normalizeMdocApiKey(input.apiKey);
      const status = normalizeLeadSyncTargetStatus(input.status);
      const label = normalizeCompactLabel(input.label, "MDOC push", "MDOC label");
      const source = normalizeCompactLabel(input.source, "Digitals", "MDOC source");
      const fallbackSourceDetail = normalizeCompactLabel(
        input.fallbackSourceDetail,
        "Website",
        "MDOC fallback source detail",
      );
      const sourceDetailRules = normalizeMdocStringMap(
        input.sourceDetailRules,
        "MDOC source detail rules are invalid.",
      );
      const staticDefaults = normalizeMdocStringMap(
        input.staticDefaults,
        "MDOC static defaults are invalid.",
      );
      const enumMappings = normalizeMdocEnumMappings(input.enumMappings);

      return repository.upsertLeadSyncTarget({
        projectId: input.projectId,
        kind: "MDOC_PUSH",
        status,
        label,
        config: mergeMdocConfig({
          endpoint,
          apiKey,
          dataFrom: input.dataFrom === "T" ? "T" : "E",
          source,
          fallbackSourceDetail,
          existingConfig,
          sourceDetailRules,
          staticDefaults,
          enumMappings,
        }),
      });
    },

    async testProjectMdocSyncTarget(input: TestProjectMdocSyncTargetInput) {
      const access = await repository.assertProjectAccess(input);
      if (!access) {
        throw new Error("Project access denied.");
      }

      if (!canManageProjectAsOwner(access)) {
        throw new Error("Project owner access required.");
      }

      const existingTarget = (
        await repository.listLeadSyncTargets(input.projectId)
      ).find((target) => target.kind === "MDOC_PUSH") ?? null;
      const existingConfig = readExistingMdocConfig(existingTarget);

      const endpoint = normalizeMdocEndpoint(input.endpoint ?? existingConfig?.endpoint ?? null);
      const apiKey = normalizeMdocApiKey(input.apiKey ?? existingConfig?.apiKey ?? null);
      const source = normalizeCompactLabel(
        input.source ?? existingConfig?.source ?? null,
        "Digitals",
        "MDOC source",
      );
      const fallbackSourceDetail = normalizeCompactLabel(
        input.fallbackSourceDetail ?? existingConfig?.fallbackSourceDetail ?? null,
        "Website",
        "MDOC fallback source detail",
      );
      const sourceDetailRules = normalizeMdocStringMap(
        input.sourceDetailRules,
        "MDOC source detail rules are invalid.",
      );
      const staticDefaults = normalizeMdocStringMap(
        input.staticDefaults,
        "MDOC static defaults are invalid.",
      );
      const enumMappings = normalizeMdocEnumMappings(input.enumMappings);

      const config = mergeMdocConfig({
        endpoint,
        apiKey,
        dataFrom: input.dataFrom === "T" ? "T" : existingConfig?.dataFrom === "T" ? "T" : "E",
        source,
        fallbackSourceDetail,
        existingConfig,
        sourceDetailRules,
        staticDefaults,
        enumMappings,
      });

      const occurredAt = dependencies.now();
      const testTarget: LeadSyncTargetRecord = {
        id: existingTarget?.id ?? `mdoc_target_${input.projectId}`,
        projectId: access.project.id,
        kind: "MDOC_PUSH",
        status: existingTarget?.status ?? "ACTIVE",
        label: existingTarget?.label ?? "MDOC push",
        config,
      };
      const testProject: LandingProjectRecord = {
        id: access.project.id,
        slug: access.project.slug,
        name: access.project.name,
        status: access.project.status,
        publicLeadKey: access.project.publicLeadKey,
        primaryDomain: access.project.primaryDomain,
        clientCompanyName: access.project.clientCompanyName,
        goLiveAt: access.project.goLiveAt,
      };
      const testLead: ProjectLeadRecord = {
        id: `mdoc_test_${occurredAt.getTime()}`,
        projectId: access.project.id,
        sourceLeadId: null,
        fullName: "Naya Integration Test Lead",
        email: "integrations-test@shasvata.com",
        phone: "9999999999",
        companyName: access.project.clientCompanyName,
        message: "MDOC connectivity test trigger from the project settings panel.",
        consent: true,
        sourcePage: access.project.primaryDomain
          ? `https://${access.project.primaryDomain}/thank-you`
          : null,
        sourceCta: "mdoc-test",
        utmSource: "google",
        utmMedium: "cpc",
        utmCampaign: "naya_mdoc_test",
        utmContent: "settings_panel",
        utmTerm: "topaz",
        gclid: "naya-test-gclid",
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
        notificationStatus: "RECEIVED",
        notificationError: null,
        syncStatus: "PENDING",
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
        sourceHost: access.project.primaryDomain,
        serviceInterest: ["2 BHK"],
        budgetRange: "70 to 75 Lacs",
        timeline: "6 Month",
        problemSummary: "Synthetic lead generated to verify MDOC push settings.",
        interestLabel: null,
        budgetLabel: null,
        touchpointLabel: null,
        isInternalTest: true,
        auditEvents: [],
        createdAt: occurredAt,
      };
      const result = await dependencies.pushLeadToMdoc({
        target: testTarget,
        project: testProject,
        lead: testLead,
      });

      return {
        config,
        responseCode: result.responseCode ?? null,
        responseBody: result.responseBody ?? null,
        metadata: result.metadata ?? null,
      };
    },

    async resendProjectInvite(input: ResendProjectInviteInput) {
      const access = await repository.assertProjectAccess(input);
      if (!access) {
        throw new Error("Project access denied.");
      }

      if (!canManageProjectAsOwner(access)) {
        throw new Error("Project owner access required.");
      }

      const { selector, verifier, verifierHash } = createTokenPair();
      const invite = await repository.rotateProjectInvite({
        projectId: input.projectId,
        inviteId: input.inviteId,
        actorUserId: input.portalUserId,
        selector,
        verifierHash,
        expiresAt: new Date(dependencies.now().getTime() + 7 * 24 * 60 * 60 * 1000),
        occurredAt: dependencies.now(),
      });

      if (!invite) {
        throw new Error("Project invite not found.");
      }

      await dependencies.sendMagicLinkEmail({
        email: invite.email,
        magicLinkUrl: buildAuthUrl(`/invite/${selector}/${verifier}`, {}),
      });

      return invite;
    },

    async updateProjectInvite(input: UpdateProjectInviteInput) {
      const access = await repository.assertProjectAccess(input);
      if (!access) {
        throw new Error("Project access denied.");
      }

      if (!canManageProjectAsOwner(access)) {
        throw new Error("Project owner access required.");
      }

      const invite = await repository.updateProjectInviteRole({
        projectId: input.projectId,
        inviteId: input.inviteId,
        role: input.role,
      });

      if (!invite) {
        throw new Error("Project invite not found.");
      }

      return invite;
    },

    async revokeProjectInvite(input: RevokeProjectInviteInput) {
      const access = await repository.assertProjectAccess(input);
      if (!access) {
        throw new Error("Project access denied.");
      }

      if (!canManageProjectAsOwner(access)) {
        throw new Error("Project owner access required.");
      }

      const invite = await repository.revokeProjectInvite({
        projectId: input.projectId,
        inviteId: input.inviteId,
        actorUserId: input.portalUserId,
        occurredAt: dependencies.now(),
      });

      if (!invite) {
        throw new Error("Project invite not found.");
      }

      return invite;
    },

    async updateProjectMemberRole(input: UpdateProjectMemberRoleInput) {
      const access = await repository.assertProjectAccess(input);
      if (!access) {
        throw new Error("Project access denied.");
      }

      if (!canManageProjectAsOwner(access)) {
        throw new Error("Project owner access required.");
      }

      const currentMembers = await repository.listProjectMembers(input.projectId);
      const targetMember = currentMembers.find(
        (member) => member.portalUserId === input.memberPortalUserId,
      );

      if (!targetMember) {
        throw new Error("Project member not found.");
      }

      if (targetMember.role === "OWNER" && input.role !== "OWNER") {
        const ownerCount = await repository.countProjectOwners(input.projectId);
        if (ownerCount <= 1) {
          throw new Error("At least one project owner is required.");
        }
      }

      const updated = await repository.updateProjectMembershipRole({
        projectId: input.projectId,
        memberPortalUserId: input.memberPortalUserId,
        role: input.role,
      });

      if (!updated) {
        throw new Error("Project member not found.");
      }

      return updated;
    },

    async removeProjectMember(input: RemoveProjectMemberInput) {
      const access = await repository.assertProjectAccess(input);
      if (!access) {
        throw new Error("Project access denied.");
      }

      if (!canManageProjectAsOwner(access)) {
        throw new Error("Project owner access required.");
      }

      const currentMembers = await repository.listProjectMembers(input.projectId);
      const targetMember = currentMembers.find(
        (member) => member.portalUserId === input.memberPortalUserId,
      );

      if (!targetMember) {
        throw new Error("Project member not found.");
      }

      if (targetMember.role === "OWNER") {
        const ownerCount = await repository.countProjectOwners(input.projectId);
        if (ownerCount <= 1) {
          throw new Error("At least one project owner is required.");
        }
      }

      const removed = await repository.removeProjectMembership({
        projectId: input.projectId,
        memberPortalUserId: input.memberPortalUserId,
      });

      if (!removed) {
        throw new Error("Project member not found.");
      }

      return { removed: true as const };
    },

    async addProjectNotificationRecipient(input: AddProjectNotificationRecipientInput) {
      const access = await repository.assertProjectAccess(input);
      if (!access) {
        throw new Error("Project access denied.");
      }

      if (!canManageProjectAsOwner(access)) {
        throw new Error("Project owner access required.");
      }

      return repository.upsertProjectNotificationRecipient({
        projectId: input.projectId,
        email: normalizeEmail(input.email),
        label: input.label?.trim() || null,
        createdAt: dependencies.now(),
      });
    },

    async removeProjectNotificationRecipient(input: RemoveProjectNotificationRecipientInput) {
      const access = await repository.assertProjectAccess(input);
      if (!access) {
        throw new Error("Project access denied.");
      }

      if (!canManageProjectAsOwner(access)) {
        throw new Error("Project owner access required.");
      }

      const removed = await repository.deleteProjectNotificationRecipient({
        projectId: input.projectId,
        recipientId: input.recipientId,
      });

      if (!removed) {
        throw new Error("Landing project notification recipient not found.");
      }

      return { removed: true as const };
    },

    async submitProjectLead(input: SubmitProjectLeadInput) {
      if (input.honeypot.trim()) {
        throw new Error("Lead skipped by honeypot.");
      }

      const project = await repository.findProjectByPublicLeadKey(input.publicLeadKey);
      if (!project) {
        throw new Error("Landing project not found.");
      }

      const allowedHost = project.primaryDomain?.trim().toLowerCase();
      const requestHost = input.originHost?.trim().toLowerCase() ?? null;
      if (allowedHost && requestHost && allowedHost !== requestHost) {
        throw new Error("Origin host does not match project domain.");
      }

      const createdLead = await repository.createProjectLead({
        projectId: project.id,
        fullName: input.payload.fullName.trim(),
        email: normalizeEmail(input.payload.email),
        phone: input.payload.phone?.trim(),
        companyName: input.payload.companyName?.trim(),
        message: input.payload.message?.trim(),
        consent: input.payload.consent,
        createdAt: dependencies.now(),
      });

      const activeTargets = (await repository.listLeadSyncTargets(project.id)).filter(
        (target) => target.status === "ACTIVE",
      );

      if (activeTargets.length === 0) {
        return createdLead;
      }

      const failureMessages: string[] = [];
      let successfulTargets = 0;

      for (const target of activeTargets) {
        const attempt = await repository.createLeadSyncDeliveryAttempt({
          projectLeadId: createdLead.id,
          projectId: project.id,
          targetId: target.id,
          kind: target.kind,
          status: "PENDING",
          attemptedAt: dependencies.now(),
        });

        try {
          let responseCode: number | null = null;
          let responseBody: string | null = null;
          let metadata: Record<string, unknown> | null = null;

          if (target.kind === "GOOGLE_SHEETS") {
            await dependencies.appendLeadToGoogleSheet({
              target,
              project,
              lead: createdLead,
            });
          } else {
            const delivery = await dependencies.pushLeadToMdoc({
              target,
              project,
              lead: createdLead,
            });
            responseCode = delivery.responseCode;
            responseBody = delivery.responseBody;
            metadata = delivery.metadata ?? null;
          }

          await repository.updateLeadSyncDeliveryAttempt({
            attemptId: attempt.id,
            status: "SYNCED",
            responseCode,
            responseBody,
            errorMessage: null,
            metadata,
            deliveredAt: dependencies.now(),
          });
          successfulTargets += 1;
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unknown lead sync error.";
          failureMessages.push(`${target.label || target.kind}: ${message}`);
          await repository.updateLeadSyncDeliveryAttempt({
            attemptId: attempt.id,
            status: "FAILED",
            responseCode: null,
            responseBody: null,
            errorMessage: message,
            metadata: null,
            deliveredAt: null,
          });
        }
      }

      const syncStatus: ProjectLeadSyncStatus =
        successfulTargets === activeTargets.length
          ? "SYNCED"
          : successfulTargets > 0
            ? "PARTIAL"
            : "FAILED";

      return repository.updateProjectLeadSyncState({
        projectLeadId: createdLead.id,
        syncStatus,
        syncError: failureMessages.length ? failureMessages.join(" | ") : null,
      });
    },

    async listProjectLeads(input: ListProjectLeadsInput) {
      const access = await repository.assertProjectAccess(input);
      if (!access) {
        throw new Error("Project access denied.");
      }

      const leads = await repository.listProjectLeads(access.project.id);
      return buildVisibleProjectLeads({
        portalUserRole: access.portalUser.role,
        membershipRole: access.membershipRole,
        portalView: buildPortalWorkspaceView(access.portalUser.role),
        tab: input.tab ?? "active",
        leads,
      });
    },

    async listProjectLeadTombstones(input: ListProjectLeadTombstonesInput) {
      const access = await repository.assertProjectAccess(input);
      if (!access) {
        throw new Error("Project access denied.");
      }

      if (!isOperatorRole(access.portalUser.role)) {
        throw new Error("Operator access required.");
      }

      return repository.listProjectLeadTombstones(access.project.id);
    },

    async softDeleteProjectLeads(input: SoftDeleteProjectLeadsInput) {
      const access = await repository.assertProjectAccess(input);
      if (!access) {
        throw new Error("Project access denied.");
      }

      const isOperator = isOperatorRole(access.portalUser.role);
      if (!isOperator && access.membershipRole !== "OWNER") {
        throw new Error("Project owner access required.");
      }

      validateReasonCode(
        isOperator ? OPERATOR_SOFT_DELETE_REASONS : CLIENT_SOFT_DELETE_REASONS,
        input.reasonCode,
        "Lead hide reason is invalid.",
      );

      return repository.softDeleteProjectLeads({
        projectId: input.projectId,
        leadIds: input.leadIds,
        actorUserId: input.portalUserId,
        reasonCode: input.reasonCode.trim().toUpperCase(),
        note: input.note?.trim() || null,
        occurredAt: dependencies.now(),
      });
    },

    async restoreProjectLeads(input: RestoreProjectLeadsInput) {
      const access = await repository.assertProjectAccess(input);
      if (!access) {
        throw new Error("Project access denied.");
      }

      const isOperator = isOperatorRole(access.portalUser.role);
      if (!isOperator && access.membershipRole !== "OWNER") {
        throw new Error("Project owner access required.");
      }

      return repository.restoreProjectLeads({
        projectId: input.projectId,
        leadIds: input.leadIds,
        actorUserId: input.portalUserId,
        note: input.note?.trim() || null,
        occurredAt: dependencies.now(),
      });
    },

    async revealProjectLead(input: RevealProjectLeadInput) {
      const access = await repository.assertProjectAccess(input);
      if (!access) {
        throw new Error("Project access denied.");
      }

      if (!isOperatorRole(access.portalUser.role)) {
        throw new Error("Operator access required.");
      }

      validateReasonCode(
        PII_REVEAL_REASONS,
        input.reasonCode,
        "Lead reveal reason is invalid.",
      );

      const leads = await repository.listProjectLeads(input.projectId);
      const lead = leads.find((entry) => entry.id === input.leadId);
      if (!lead) {
        throw new Error("Project lead not found.");
      }

      await repository.createProjectLeadRevealAuditEvent({
        projectId: input.projectId,
        projectLeadId: input.leadId,
        actorUserId: input.portalUserId,
        reasonCode: input.reasonCode.trim().toUpperCase(),
        note: input.note?.trim() || null,
        occurredAt: dependencies.now(),
      });

      return {
        lead: annotateProjectLead(lead),
        expiresAt: new Date(dependencies.now().getTime() + 5 * 60 * 1000),
      };
    },

    async hardDeleteProjectLeads(input: HardDeleteProjectLeadsInput) {
      const access = await repository.assertProjectAccess(input);
      if (!access) {
        throw new Error("Project access denied.");
      }

      if (!isOperatorRole(access.portalUser.role)) {
        throw new Error("Operator access required.");
      }

      validateReasonCode(
        HARD_DELETE_REASONS,
        input.reasonCode,
        "Lead hard-delete reason is invalid.",
      );

      const leads = await repository.listProjectLeads(input.projectId);
      const targetLeads = leads.filter((lead) => input.leadIds.includes(lead.id));
      if (targetLeads.length !== input.leadIds.length) {
        throw new Error("Project lead not found.");
      }

      if (targetLeads.some((lead) => lead.visibilityState !== "HIDDEN")) {
        throw new Error("Hard delete requires hidden leads only.");
      }

      return repository.hardDeleteProjectLeads({
        projectId: input.projectId,
        leadIds: input.leadIds,
        actorUserId: input.portalUserId,
        reasonCode: input.reasonCode.trim().toUpperCase(),
        note: input.note?.trim() || null,
        occurredAt: dependencies.now(),
      });
    },

    async exportProjectLeadsCsv(input: ExportProjectLeadsCsvInput) {
      const access = await repository.assertProjectAccess(input);
      if (!access) {
        throw new Error("Project access denied.");
      }

      if (access.portalUser.role === "CLIENT" && access.membershipRole === "VIEWER") {
        throw new Error("Project owner access required.");
      }

      const portalView = buildPortalWorkspaceView(access.portalUser.role);
      const visibleLeads = buildVisibleProjectLeads({
        portalUserRole: access.portalUser.role,
        membershipRole: access.membershipRole,
        portalView,
        tab: "active",
        leads: await repository.listProjectLeads(access.project.id),
      });
      const rows = buildLeadExportRows({
        leads: visibleLeads,
        mode: input.mode ?? "basic",
        portalView,
      });

      if (rows.length === 0) {
        return "";
      }

      const columns = Object.keys(rows[0] ?? {});
      const header = columns
        .map((column) => column.replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase())
        .join(",");
      const csvRows = rows.map((lead) =>
        columns
          .map((column) => csvEscape(String(lead[column as keyof typeof lead] ?? "")))
          .join(","),
      );

      return [header, ...csvRows].join("\n");
    },

    async exportProjectLeadsXlsx(input: ExportProjectLeadsXlsxInput) {
      const access = await repository.assertProjectAccess(input);
      if (!access) {
        throw new Error("Project access denied.");
      }

      if (access.portalUser.role === "CLIENT" && access.membershipRole === "VIEWER") {
        throw new Error("Project owner access required.");
      }

      const portalView = buildPortalWorkspaceView(access.portalUser.role);
      const leads = buildVisibleProjectLeads({
        portalUserRole: access.portalUser.role,
        membershipRole: access.membershipRole,
        portalView,
        tab: "active",
        leads: await repository.listProjectLeads(access.project.id),
      });
      const workbook = new ExcelJS.Workbook();
      const sheetName = input.mode === "full" ? "Full Leads" : "Leads";
      const worksheet = workbook.addWorksheet(sheetName);
      const rows = buildLeadExportRows({
        leads,
        mode: input.mode ?? "basic",
        portalView,
      });
      const columns = Object.keys(rows[0] ?? {}).map((column) => ({
        header: column.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/\b\w/g, (char) => char.toUpperCase()),
        key: column,
        width: Math.max(18, column.length + 8),
      }));

      worksheet.columns = columns;

      for (const row of rows) {
        worksheet.addRow(row);
      }

      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true };
      worksheet.views = [{ state: "frozen", ySplit: 1 }];
      worksheet.autoFilter = {
        from: "A1",
        to: "N1",
      };

      const buffer = await workbook.xlsx.writeBuffer();
      return Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
    },

    async readProjectInvite(input: ReadProjectInviteInput) {
      const invite = await requirePendingProjectInvite(input.selector, input.verifier);
      if (!invite) {
        throw new Error("Project invite is invalid or expired.");
      }

      const project = await repository.findProjectById(invite.projectId);
      if (!project) {
        throw new Error("Landing project not found.");
      }

      return {
        invite,
        project: {
          id: project.id,
          slug: project.slug,
          name: project.name,
        },
      };
    },

    async consumeProjectInvite(input: ConsumeProjectInviteInput) {
      const invite = await requirePendingProjectInvite(input.selector, input.verifier);
      if (!invite) {
        throw new Error("Project invite is invalid or expired.");
      }

      if (normalizeEmail(input.email) !== invite.email) {
        throw new Error("Project invite email mismatch.");
      }

      const consumed = await repository.consumeProjectInvite({
        selector: invite.selector,
        verifierHash: invite.verifierHash,
        portalUserId: input.portalUserId,
        acceptedAt: dependencies.now(),
      });

      if (!consumed) {
        throw new Error("Project invite is invalid or expired.");
      }

      return consumed;
    },
  };
}
