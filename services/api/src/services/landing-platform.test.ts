import { describe, expect, it, vi } from "vitest";
import {
  createLandingPlatformService,
  type LandingProjectRecord,
  type LandingPlatformDependencies,
  type LandingPlatformRepository,
  type LeadSyncDeliveryAttemptRecord,
  type LeadSyncTargetRecord,
  type ProjectBillingRecord,
  type ProjectDomainRecord,
  type ProjectInviteRecord,
  type ProjectLeadAuditEventRecord,
  type ProjectLeadDeletionTombstoneRecord,
  type ProjectNotificationRecipientRecord,
  type ProjectSiteRecord,
} from "./landing-platform.js";

type BillingRecordFixture = ProjectBillingRecord & {
  projectId: string;
};

function createRepository(options?: {
  includePlatformAdmin?: boolean;
  includeClientPasswordCredential?: boolean;
}): LandingPlatformRepository & {
  findAuthCredentialByGoogleSubject: (googleSubject: string) => Promise<{
    portalUser: {
      id: string;
      email: string;
      fullName: string | null;
      role: "PLATFORM_ADMIN" | "PLATFORM_OPERATOR" | "CLIENT";
      status: "PENDING" | "ACTIVE";
      companyName: string | null;
      phone: string | null;
      emailVerifiedAt: Date | null;
    };
    credential: {
      portalUserId: string;
      kind: "PASSWORD" | "MAGIC_LINK_ONLY" | "GOOGLE_OIDC" | "PASSWORD_AND_GOOGLE";
      passwordHash: string | null;
      googleSubject: string | null;
      googleEmail: string | null;
    };
  } | null>;
  createEmailVerificationToken: (input: {
    portalUserId: string;
    email: string;
    selector: string;
    verifierHash: string;
    expiresAt: Date;
  }) => Promise<{
    id: string;
    portalUserId: string;
    email: string;
    selector: string;
    verifierHash: string;
    expiresAt: Date;
    consumedAt: Date | null;
  }>;
  consumeEmailVerificationToken: (input: {
    selector: string;
    verifierHash: string;
    now: Date;
  }) => Promise<{
    id: string;
    portalUserId: string;
    email: string;
    selector: string;
    verifierHash: string;
    expiresAt: Date;
    consumedAt: Date | null;
  } | null>;
  createPasswordResetToken: (input: {
    portalUserId: string;
    selector: string;
    verifierHash: string;
    expiresAt: Date;
  }) => Promise<{
    id: string;
    portalUserId: string;
    selector: string;
    verifierHash: string;
    expiresAt: Date;
    consumedAt: Date | null;
  }>;
  consumePasswordResetToken: (input: {
    selector: string;
    verifierHash: string;
    now: Date;
  }) => Promise<{
    id: string;
    portalUserId: string;
    selector: string;
    verifierHash: string;
    expiresAt: Date;
    consumedAt: Date | null;
  } | null>;
  updatePortalUser: (input: {
    portalUserId: string;
    fullName?: string | null;
    phone?: string | null;
    status?: "PENDING" | "ACTIVE";
    emailVerifiedAt?: Date | null;
  }) => Promise<{
    id: string;
    email: string;
    fullName: string | null;
    role: "PLATFORM_ADMIN" | "PLATFORM_OPERATOR" | "CLIENT";
    status: "PENDING" | "ACTIVE";
    companyName: string | null;
    phone: string | null;
    emailVerifiedAt: Date | null;
  }>;
  deletePortalSessionsForUser: (portalUserId: string) => Promise<void>;
} {
  const users: Array<{
    id: string;
    email: string;
    fullName: string | null;
    role: "PLATFORM_ADMIN" | "PLATFORM_OPERATOR" | "CLIENT";
    status: "PENDING" | "ACTIVE";
    companyName: string | null;
    phone: string | null;
    emailVerifiedAt: Date | null;
  }> = [
    ...(options?.includePlatformAdmin === false
      ? []
      : [
          {
            id: "user_admin",
            email: "admin@shasvata.com",
            fullName: "Naya Admin",
            role: "PLATFORM_ADMIN" as const,
            status: "ACTIVE" as const,
            companyName: "Shasvata",
            phone: null,
            emailVerifiedAt: new Date("2026-03-20T00:00:00.000Z"),
          },
        ]),
    {
      id: "user_client",
      email: "client@example.com",
      fullName: "Client Owner",
      role: "CLIENT" as const,
      status: "ACTIVE" as const,
      companyName: "Estate Autopilots",
      phone: "+91 90000 11111",
      emailVerifiedAt: new Date("2026-03-20T00:00:00.000Z"),
    },
    {
      id: "user_viewer",
      email: "viewer@example.com",
      fullName: "Client Viewer",
      role: "CLIENT" as const,
      status: "ACTIVE" as const,
      companyName: "Estate Autopilots",
      phone: null,
      emailVerifiedAt: new Date("2026-03-20T00:00:00.000Z"),
    },
    {
      id: "user_operator",
      email: "ops@shasvata.com",
      fullName: "Ops Lead",
      role: "PLATFORM_OPERATOR" as const,
      status: "ACTIVE" as const,
      companyName: "Shasvata",
      phone: null,
      emailVerifiedAt: new Date("2026-03-20T00:00:00.000Z"),
    },
  ];

  const projects: LandingProjectRecord[] = [
    {
      id: "project_alpha",
      slug: "estate-autopilots-alpha",
      name: "Estate Autopilots Alpha",
      status: "ACTIVE" as const,
      publicLeadKey: "lead_alpha",
      primaryDomain: "alpha.example.com",
      clientCompanyName: "Estate Autopilots",
      goLiveAt: null,
    },
    {
      id: "project_beta",
      slug: "estate-autopilots-beta",
      name: "Estate Autopilots Beta",
      status: "ACTIVE" as const,
      publicLeadKey: "lead_beta",
      primaryDomain: "beta.example.com",
      clientCompanyName: "Estate Autopilots",
      goLiveAt: null,
    },
  ];

  const memberships = [
    {
      portalUserId: "user_client",
      projectId: "project_alpha",
      role: "OWNER" as const,
    },
    {
      portalUserId: "user_viewer",
      projectId: "project_alpha",
      role: "VIEWER" as const,
    },
  ];

  const syncTargets: LeadSyncTargetRecord[] = [
    {
      id: "sync_alpha",
      projectId: "project_alpha",
      kind: "GOOGLE_SHEETS" as const,
      status: "ACTIVE" as const,
      label: "Client leads sheet",
      config: {
        spreadsheetId: "sheet_alpha",
        sheetName: "Leads",
      },
    },
  ];
  const leadSyncDeliveryAttempts: LeadSyncDeliveryAttemptRecord[] = [];

  const sites: ProjectSiteRecord[] = [
    {
      id: "site_alpha",
      projectId: "project_alpha",
      slug: "estate-autopilots-alpha",
      templateKey: "builder-leads-v1",
      themeKey: "estate-autopilots",
      sourceProvider: "GIT_REPOSITORY" as const,
      repoUrl: "https://github.com/naya/estate-autopilots-alpha",
      repoBranch: "main",
      repoRef: "refs/heads/main",
      deployedCommit: "abc123def456",
      runtimeProfile: "STATIC_ARTIFACT" as const,
      operatorNotes: "Imported from AI Studio output.",
      ga4MeasurementId: null,
      googleAdsTagId: null,
      googleAdsConversionMode: "DIRECT_LABEL" as const,
      googleAdsLeadConversionLabel: null,
      gtmContainerId: null,
      metaPixelId: null,
      trackingNotes: null,
      publishStatus: "PUBLISHED" as const,
      lastPublishedAt: new Date("2026-03-26T00:00:00.000Z"),
      previewHost: "estate-autopilots-alpha.preview.shasvata.com",
      latestPreviewPath: "https://estate-autopilots-alpha.preview.shasvata.com",
    },
  ];

  const domains: ProjectDomainRecord[] = [
    {
      id: "domain_alpha",
      projectId: "project_alpha",
      siteId: "site_alpha",
      host: "alpha.example.com",
      status: "ACTIVE" as const,
      isPrimary: true,
      dnsTarget: "landing.shasvata.com",
      verifiedAt: new Date("2026-03-26T00:00:00.000Z"),
    },
  ];

  const notificationRecipients: ProjectNotificationRecipientRecord[] = [
    {
      id: "recipient_alpha_1",
      projectId: "project_alpha",
      email: "builder@example.com",
      label: "Builder sales",
      createdAt: new Date("2026-03-29T12:00:00.000Z"),
      updatedAt: new Date("2026-03-29T12:00:00.000Z"),
    },
  ];

  const magicLinks: Array<{
    id: string;
    portalUserId: string;
    email: string;
    selector: string;
    verifierHash: string;
    redirectPath: string;
    expiresAt: Date;
    consumedAt: Date | null;
  }> = [];

  const sessions: Array<{
    id: string;
    portalUserId: string;
    expiresAt: Date;
  }> = [];
  const authCredentials: Array<{
    portalUserId: string;
    kind: "PASSWORD" | "MAGIC_LINK_ONLY" | "GOOGLE_OIDC" | "PASSWORD_AND_GOOGLE";
    passwordHash: string | null;
    googleSubject: string | null;
    googleEmail: string | null;
  }> =
    options?.includeClientPasswordCredential === false
      ? []
      : [
          {
            portalUserId: "user_client",
            kind: "PASSWORD" as const,
            passwordHash: "password-hash:client-password",
            googleSubject: null,
            googleEmail: null,
          },
        ];

  const emailVerificationTokens: Array<{
    id: string;
    portalUserId: string;
    email: string;
    selector: string;
    verifierHash: string;
    expiresAt: Date;
    consumedAt: Date | null;
  }> = [];

  const passwordResetTokens: Array<{
    id: string;
    portalUserId: string;
    selector: string;
    verifierHash: string;
    expiresAt: Date;
    consumedAt: Date | null;
  }> = [];

  const leads: Array<{
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
    notificationStatus: "RECEIVED" | "NOTIFIED" | "NOTIFICATION_FAILED" | null;
    notificationError: string | null;
    syncStatus: "PENDING" | "SYNCED" | "PARTIAL" | "FAILED";
    syncError: string | null;
    visibilityState: "VISIBLE" | "HIDDEN";
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
  }> = [];

  const leadAuditEvents: ProjectLeadAuditEventRecord[] = [];
  const leadTombstones: ProjectLeadDeletionTombstoneRecord[] = [];
  const projectInvites: ProjectInviteRecord[] = [];

  const billingRecords: BillingRecordFixture[] = [
    {
      id: "cart_alpha",
      projectId: "project_alpha",
      buyerEmail: "client@example.com",
      status: "PAID",
      flowMode: "SELF_SERVE",
      totalMinor: 8500000,
      payableTodayMinor: 4250000,
      remainingAfterTodayMinor: 4250000,
      erpQuotationId: "ERP-QUO-ALPHA",
      erpSalesOrderId: "ERP-SO-ALPHA",
      erpCustomerId: "ERP-CUST-ALPHA",
      quoteRequestStatus: null,
      latestCheckoutStatus: "PAID",
      latestPaymentSessionId: "ps_alpha",
      latestProviderOrderId: "order_alpha",
      updatedAt: new Date("2026-03-26T04:00:00.000Z"),
    },
  ];

  return {
    async findPortalUserByEmail(email) {
      return users.find((user) => user.email === email) ?? null;
    },
    async findPortalUserById(portalUserId) {
      return users.find((user) => user.id === portalUserId) ?? null;
    },
    async countPlatformAdmins() {
      return users.filter((user) => user.role === "PLATFORM_ADMIN").length;
    },
    async findAuthCredentialByEmail(email) {
      const portalUser = users.find((user) => user.email === email) ?? null;
      if (!portalUser) {
        return null;
      }

      const credential =
        authCredentials.find((entry) => entry.portalUserId === portalUser.id) ?? null;

      return credential ? { portalUser, credential } : null;
    },
    async findAuthCredentialByGoogleSubject(googleSubject) {
      const credential =
        authCredentials.find((entry) => entry.googleSubject === googleSubject) ?? null;
      if (!credential) {
        return null;
      }

      const portalUser = users.find((user) => user.id === credential.portalUserId) ?? null;
      return portalUser ? { portalUser, credential } : null;
    },
    async createPortalUser(input) {
      const record = {
        id: `user_${users.length + 1}`,
        email: input.email,
        fullName: input.fullName ?? null,
        role: input.role,
        status: input.status,
        companyName: input.companyName ?? null,
        phone: null,
        emailVerifiedAt: null,
      };
      users.push(record);
      return record;
    },
    async updatePortalUser(input) {
      const portalUser = users.find((entry) => entry.id === input.portalUserId);
      if (!portalUser) {
        throw new Error(`Portal user ${input.portalUserId} missing from test repository.`);
      }

      if (input.fullName !== undefined) {
        portalUser.fullName = input.fullName;
      }
      if (input.phone !== undefined) {
        portalUser.phone = input.phone;
      }
      if (input.status !== undefined) {
        portalUser.status = input.status;
      }
      if (input.emailVerifiedAt !== undefined) {
        portalUser.emailVerifiedAt = input.emailVerifiedAt;
      }

      return portalUser;
    },
    async upsertAuthCredential(input) {
      const existing = authCredentials.find((entry) => entry.portalUserId === input.portalUserId);
      if (existing) {
        existing.kind = input.kind;
        existing.passwordHash = input.passwordHash ?? null;
        if ("googleSubject" in input) {
          existing.googleSubject = input.googleSubject ?? null;
        }
        if ("googleEmail" in input) {
          existing.googleEmail = input.googleEmail ?? null;
        }
        return existing;
      }

      const record = {
        portalUserId: input.portalUserId,
        kind: input.kind,
        passwordHash: input.passwordHash ?? null,
        googleSubject: "googleSubject" in input ? input.googleSubject ?? null : null,
        googleEmail: "googleEmail" in input ? input.googleEmail ?? null : null,
      };
      authCredentials.push(record);
      return record;
    },
    async createMagicLink(input) {
      const record = {
        id: `magic_${magicLinks.length + 1}`,
        portalUserId: input.portalUserId,
        email: input.email,
        selector: input.selector,
        verifierHash: input.verifierHash,
        redirectPath: input.redirectPath,
        expiresAt: input.expiresAt,
        consumedAt: null,
      };
      magicLinks.push(record);
      return record;
    },
    async createEmailVerificationToken(input) {
      const record = {
        id: `verify_${emailVerificationTokens.length + 1}`,
        portalUserId: input.portalUserId,
        email: input.email,
        selector: input.selector,
        verifierHash: input.verifierHash,
        expiresAt: input.expiresAt,
        consumedAt: null,
      };
      emailVerificationTokens.push(record);
      return record;
    },
    async consumeEmailVerificationToken(input) {
      const match = emailVerificationTokens.find(
        (token) =>
          token.selector === input.selector &&
          token.verifierHash === input.verifierHash &&
          token.consumedAt === null,
      );

      if (!match || match.expiresAt <= input.now) {
        return null;
      }

      match.consumedAt = input.now;
      return match;
    },
    async createPasswordResetToken(input) {
      const record = {
        id: `reset_${passwordResetTokens.length + 1}`,
        portalUserId: input.portalUserId,
        selector: input.selector,
        verifierHash: input.verifierHash,
        expiresAt: input.expiresAt,
        consumedAt: null,
      };
      passwordResetTokens.push(record);
      return record;
    },
    async consumePasswordResetToken(input) {
      const match = passwordResetTokens.find(
        (token) =>
          token.selector === input.selector &&
          token.verifierHash === input.verifierHash &&
          token.consumedAt === null,
      );

      if (!match || match.expiresAt <= input.now) {
        return null;
      }

      match.consumedAt = input.now;
      return match;
    },
    async consumeMagicLink(input) {
      const match = magicLinks.find(
        (token) =>
          token.selector === input.selector &&
          token.verifierHash === input.verifierHash &&
          token.consumedAt === null,
      );

      if (!match || match.expiresAt <= input.now) {
        return null;
      }

      match.consumedAt = input.now;
      return match;
    },
    async createPortalSession(input) {
      const record = {
        id: `session_${sessions.length + 1}`,
        portalUserId: input.portalUserId,
        expiresAt: input.expiresAt,
      };
      sessions.push(record);
      return record;
    },
    async deletePortalSessionsForUser(portalUserId) {
      for (let index = sessions.length - 1; index >= 0; index -= 1) {
        if (sessions[index]?.portalUserId === portalUserId) {
          sessions.splice(index, 1);
        }
      }
    },
    async findPortalSession(input) {
      const session = sessions.find((entry) => entry.id === input.sessionId);
      if (!session || session.expiresAt <= input.now) {
        return null;
      }

      const portalUser = users.find((entry) => entry.id === session.portalUserId);
      if (!portalUser) {
        return null;
      }

      return {
        session,
        portalUser,
      };
    },
    async deletePortalSession(sessionId) {
      const index = sessions.findIndex((entry) => entry.id === sessionId);
      if (index >= 0) {
        sessions.splice(index, 1);
      }
    },
    async listProjectsForPortalUser(portalUser) {
      if (
        portalUser.role === "PLATFORM_ADMIN" ||
        portalUser.role === "PLATFORM_OPERATOR"
      ) {
        return projects.map((project) => ({
          ...project,
          membershipRole: "OWNER" as const,
        }));
      }

      return memberships
        .filter((membership) => membership.portalUserId === portalUser.id)
        .map((membership) => {
          const project = projects.find((entry) => entry.id === membership.projectId);
          if (!project) {
            throw new Error(`Project ${membership.projectId} missing from test repository.`);
          }

          return {
            ...project,
            membershipRole: membership.role,
          };
        });
    },
    async findProjectById(projectId) {
      const project = projects.find((entry) => entry.id === projectId);
      return project
        ? {
            ...project,
            description: "Lead generation landing page",
            notes: "Launch batch 1",
          }
        : null;
    },
    async findProjectByPublicLeadKey(publicLeadKey) {
      return projects.find((project) => project.publicLeadKey === publicLeadKey) ?? null;
    },
    async createImportedProject(input) {
      const project = {
        id: `project_${projects.length + 1}`,
        slug: input.slug,
        name: input.name,
        status: "DRAFT" as const,
        publicLeadKey: input.publicLeadKey,
        primaryDomain: input.desiredLiveDomain ?? null,
        clientCompanyName: input.clientCompanyName ?? null,
        goLiveAt: null,
      };
      projects.push(project);

      const site = {
        id: `site_${sites.length + 1}`,
        projectId: project.id,
        slug: input.slug,
        templateKey: "imported-repo-v1",
        themeKey: null,
        sourceProvider: "GIT_REPOSITORY" as const,
        repoUrl: input.repoUrl,
        repoBranch: input.repoBranch ?? null,
        repoRef: input.repoRef ?? null,
        deployedCommit: null,
        runtimeProfile: input.runtimeProfile,
        operatorNotes: input.operatorNotes ?? null,
        ga4MeasurementId: null,
        googleAdsTagId: null,
        googleAdsConversionMode: "DIRECT_LABEL" as const,
        googleAdsLeadConversionLabel: null,
        gtmContainerId: null,
        metaPixelId: null,
        trackingNotes: null,
        publishStatus: "DRAFT" as const,
        lastPublishedAt: null,
        previewHost: input.previewHost,
        latestPreviewPath: `https://${input.previewHost}`,
      };
      sites.push(site);

      const domain = input.desiredLiveDomain
        ? {
            id: `domain_${domains.length + 1}`,
            projectId: project.id,
            siteId: site.id,
            host: input.desiredLiveDomain,
            status: "PENDING" as const,
            isPrimary: true,
            dnsTarget: input.dnsTarget ?? null,
            verifiedAt: null,
          }
        : null;

      if (domain) {
        domains.push(domain);
      }

      return {
        project: {
          ...project,
          description: null,
          notes: input.operatorNotes ?? null,
        },
        site,
        domain,
      };
    },
    async listLeadSyncTargets(projectId) {
      return syncTargets.filter((target) => target.projectId === projectId);
    },
    async upsertLeadSyncTarget(input) {
      const existing = syncTargets.find(
        (target) => target.projectId === input.projectId && target.kind === input.kind,
      );

      if (existing) {
        existing.status = input.status;
        existing.label = input.label ?? null;
        existing.config = input.config;
        return existing;
      }

      const record: LeadSyncTargetRecord = {
        id: `sync_${syncTargets.length + 1}`,
        projectId: input.projectId,
        kind: input.kind,
        status: input.status,
        label: input.label ?? null,
        config: input.config,
      };
      syncTargets.push(record);
      return record;
    },
    async createLeadSyncDeliveryAttempt(input) {
      const record: LeadSyncDeliveryAttemptRecord = {
        id: `attempt_${leadSyncDeliveryAttempts.length + 1}`,
        projectLeadId: input.projectLeadId,
        projectId: input.projectId,
        targetId: input.targetId,
        kind: input.kind,
        status: input.status,
        responseCode: null,
        responseBody: null,
        errorMessage: null,
        metadata: input.metadata ?? null,
        attemptedAt: input.attemptedAt,
        deliveredAt: null,
        createdAt: input.attemptedAt,
        updatedAt: input.attemptedAt,
      };
      leadSyncDeliveryAttempts.push(record);
      return record;
    },
    async updateLeadSyncDeliveryAttempt(input) {
      const record = leadSyncDeliveryAttempts.find((entry) => entry.id === input.attemptId);
      if (!record) {
        throw new Error(`Lead sync attempt ${input.attemptId} missing from test repository.`);
      }

      record.status = input.status;
      if (input.responseCode !== undefined) {
        record.responseCode = input.responseCode;
      }
      if (input.responseBody !== undefined) {
        record.responseBody = input.responseBody;
      }
      if (input.errorMessage !== undefined) {
        record.errorMessage = input.errorMessage;
      }
      if (input.metadata !== undefined) {
        record.metadata = input.metadata ?? null;
      }
      if (input.deliveredAt !== undefined) {
        record.deliveredAt = input.deliveredAt;
      }
      record.updatedAt = input.deliveredAt ?? new Date("2026-03-26T00:00:00.000Z");

      return record;
    },
    async listProjectSites(projectId) {
      return sites.filter((site) => site.projectId === projectId);
    },
    async findProjectSite(input) {
      return (
        sites.find(
          (site) => site.projectId === input.projectId && site.id === input.siteId,
        ) ?? null
      );
    },
    async updateProjectSiteSource(input) {
      const site = sites.find(
        (entry) => entry.projectId === input.projectId && entry.id === input.siteId,
      );
      if (!site) {
        throw new Error(`Site ${input.siteId} missing from test repository.`);
      }

      if (input.repoUrl !== undefined) {
        site.repoUrl = input.repoUrl;
      }
      if (input.repoBranch !== undefined) {
        site.repoBranch = input.repoBranch;
      }
      if (input.repoRef !== undefined) {
        site.repoRef = input.repoRef;
      }
      if (input.deployedCommit !== undefined) {
        site.deployedCommit = input.deployedCommit;
      }
      if (input.runtimeProfile !== undefined) {
        site.runtimeProfile = input.runtimeProfile;
      }
      if (input.operatorNotes !== undefined) {
        site.operatorNotes = input.operatorNotes;
      }

      return site;
    },
    async updateProjectSiteTracking(input) {
      const site = sites.find(
        (entry) => entry.projectId === input.projectId && entry.id === input.siteId,
      );
      if (!site) {
        throw new Error(`Site ${input.siteId} missing from test repository.`);
      }

      if (input.ga4MeasurementId !== undefined) {
        site.ga4MeasurementId = input.ga4MeasurementId;
      }
      if (input.googleAdsTagId !== undefined) {
        site.googleAdsTagId = input.googleAdsTagId;
      }
      if (input.googleAdsConversionMode !== undefined) {
        site.googleAdsConversionMode = input.googleAdsConversionMode;
      }
      if (input.googleAdsLeadConversionLabel !== undefined) {
        site.googleAdsLeadConversionLabel = input.googleAdsLeadConversionLabel;
      }
      if (input.gtmContainerId !== undefined) {
        site.gtmContainerId = input.gtmContainerId;
      }
      if (input.metaPixelId !== undefined) {
        site.metaPixelId = input.metaPixelId;
      }
      if (input.trackingNotes !== undefined) {
        site.trackingNotes = input.trackingNotes;
      }

      return site;
    },
    async updateProjectSitePublishState(input) {
      const site = sites.find(
        (entry) => entry.projectId === input.projectId && entry.id === input.siteId,
      );
      if (!site) {
        throw new Error(`Site ${input.siteId} missing from test repository.`);
      }

      site.publishStatus = input.publishStatus;
      site.runtimeProfile = input.runtimeProfile;
      if (input.deployedCommit !== undefined) {
        site.deployedCommit = input.deployedCommit;
      }
      if (input.previewHost !== undefined && input.previewHost !== null) {
        site.previewHost = input.previewHost;
        site.latestPreviewPath = `https://${input.previewHost}`;
      }
      site.lastPublishedAt = input.lastPublishedAt;

      return site;
    },
    async listProjectDomains(projectId) {
      return domains.filter((domain) => domain.projectId === projectId);
    },
    async findProjectDomain(input) {
      return (
        domains.find(
          (domain) =>
            domain.projectId === input.projectId && domain.id === input.domainId,
        ) ?? null
      );
    },
    async upsertProjectDomain(input) {
      if (input.isPrimary) {
        for (const domain of domains) {
          if (domain.projectId === input.projectId) {
            domain.isPrimary = false;
          }
        }
      }

      let domain = domains.find((entry) => entry.host === input.host) ?? null;
      if (domain) {
        domain.projectId = input.projectId;
        domain.siteId = input.siteId ?? null;
        domain.isPrimary = input.isPrimary;
        domain.dnsTarget = input.dnsTarget ?? null;
      } else {
        domain = {
          id: `domain_${domains.length + 1}`,
          projectId: input.projectId,
          siteId: input.siteId ?? null,
          host: input.host,
          status: "PENDING" as const,
          isPrimary: input.isPrimary,
          dnsTarget: input.dnsTarget ?? null,
          verifiedAt: null,
        };
        domains.push(domain);
      }

      if (input.isPrimary) {
        const project = projects.find((entry) => entry.id === input.projectId);
        if (project) {
          project.primaryDomain = input.host;
        }
      }

      return domain;
    },
    async updateProjectDomainVerification(input) {
      const domain = domains.find(
        (entry) => entry.projectId === input.projectId && entry.id === input.domainId,
      );
      if (!domain) {
        throw new Error(`Domain ${input.domainId} missing from test repository.`);
      }

      domain.status = input.status;
      domain.verifiedAt = input.verifiedAt;
      return domain;
    },
    async listProjectMembers(projectId) {
      return memberships
        .filter((membership) => membership.projectId === projectId)
        .map((membership) => {
          const portalUser = users.find((entry) => entry.id === membership.portalUserId);
          if (!portalUser) {
            throw new Error(`Portal user ${membership.portalUserId} missing from test repository.`);
          }

          return {
            portalUserId: portalUser.id,
            email: portalUser.email,
            fullName: portalUser.fullName,
            role: membership.role,
            status: portalUser.status,
          };
        });
    },
    async listProjectNotificationRecipients(projectId) {
      return notificationRecipients
        .filter((recipient) => recipient.projectId === projectId)
        .map((recipient) => ({ ...recipient }));
    },
    async listProjectBillingRecords(projectId) {
      return billingRecords.filter((record) => record.projectId === projectId);
    },
    async upsertProjectNotificationRecipient(input) {
      const normalizedEmail = input.email.trim().toLowerCase();
      const existingRecipient = notificationRecipients.find(
        (recipient) =>
          recipient.projectId === input.projectId && recipient.email === normalizedEmail,
      );

      if (existingRecipient) {
        existingRecipient.label = input.label ?? existingRecipient.label;
        existingRecipient.updatedAt = input.createdAt;
        return { ...existingRecipient };
      }

      const nextRecipient = {
        id: `recipient_${notificationRecipients.length + 1}`,
        projectId: input.projectId,
        email: normalizedEmail,
        label: input.label ?? null,
        createdAt: input.createdAt,
        updatedAt: input.createdAt,
      };

      notificationRecipients.push(nextRecipient);
      return { ...nextRecipient };
    },
    async deleteProjectNotificationRecipient(input) {
      const index = notificationRecipients.findIndex(
        (recipient) =>
          recipient.projectId === input.projectId && recipient.id === input.recipientId,
      );

      if (index < 0) {
        return false;
      }

      notificationRecipients.splice(index, 1);
      return true;
    },
    async upsertProjectMember(input) {
      let portalUser = users.find((entry) => entry.email === input.email);
      if (!portalUser) {
        portalUser = {
          id: `user_${users.length + 1}`,
          email: input.email,
          fullName: input.fullName ?? null,
          role: "CLIENT" as const,
          status: "ACTIVE" as const,
          companyName: "Estate Autopilots",
          phone: null,
          emailVerifiedAt: new Date("2026-03-20T00:00:00.000Z"),
        };
        users.push(portalUser);
      }

      if (!portalUser) {
        throw new Error("Portal user upsert failed in test repository.");
      }

      if (input.fullName?.trim()) {
        portalUser.fullName = input.fullName.trim();
      }
      portalUser.status = "ACTIVE";

      const existingMembership = memberships.find(
        (membership) =>
          membership.projectId === input.projectId &&
          membership.portalUserId === portalUser.id,
      );

      if (existingMembership) {
        existingMembership.role = input.role;
      } else {
        memberships.push({
          projectId: input.projectId,
          portalUserId: portalUser.id,
          role: input.role,
        });
      }

      return {
        portalUserId: portalUser.id,
        email: portalUser.email,
        fullName: portalUser.fullName,
        role: input.role,
        status: portalUser.status,
      };
    },
    async updateProjectGoLive(input) {
      const project = projects.find((entry) => entry.id === input.projectId);
      if (!project) {
        throw new Error(`Project ${input.projectId} missing from test repository.`);
      }

      project.goLiveAt = input.goLiveAt;
      return {
        ...project,
        description: "Lead generation landing page",
        notes: "Launch batch 1",
      };
    },
    async createProjectLead(input) {
      const record = {
        id: `lead_${leads.length + 1}`,
        projectId: input.projectId,
        sourceLeadId: null,
        fullName: input.fullName,
        email: input.email,
        phone: input.phone ?? null,
        companyName: input.companyName ?? null,
        message: input.message ?? null,
        consent: input.consent,
        sourcePage: null,
        sourceCta: null,
        utmSource: null,
        utmMedium: null,
        utmCampaign: null,
        utmContent: null,
        utmTerm: null,
        gclid: null,
        gbraid: null,
        wbraid: null,
        notificationStatus: null,
        notificationError: null,
        syncStatus: "PENDING" as const,
        syncError: null,
        visibilityState: "VISIBLE" as const,
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
        sourceHost: null,
        serviceInterest: [],
        budgetRange: null,
        timeline: null,
        problemSummary: null,
        interestLabel: null,
        budgetLabel: null,
        touchpointLabel: null,
        isInternalTest: false,
        auditEvents: [],
        createdAt: input.createdAt,
      };
      leads.push(record);
      return record;
    },
    async updateProjectLeadSyncState(input) {
      const match = leads.find((lead) => lead.id === input.projectLeadId);
      if (!match) {
        throw new Error(`Lead ${input.projectLeadId} missing from test repository.`);
      }

      match.syncStatus = input.syncStatus;
      match.syncError = input.syncError ?? null;
      return match;
    },
    async listProjectLeads(projectId) {
      return leads
        .filter((lead) => lead.projectId === projectId)
        .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime());
    },
    async listProjectLeadTombstones(projectId) {
      return leadTombstones
        .filter((entry) => entry.projectId === projectId)
        .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime());
    },
    async softDeleteProjectLeads(input) {
      const actor = users.find((user) => user.id === input.actorUserId) ?? null;
      const updated: typeof leads = [];

      for (const lead of leads) {
        if (lead.projectId !== input.projectId || !input.leadIds.includes(lead.id)) {
          continue;
        }

        lead.visibilityState = "HIDDEN";
        lead.hiddenAt = input.occurredAt;
        lead.hiddenByPortalUserId = input.actorUserId;
        lead.hiddenByUserEmail = actor?.email ?? null;
        lead.hiddenByUserFullName = actor?.fullName ?? null;
        lead.hiddenReasonCode = input.reasonCode;
        lead.hiddenReasonNote = input.note ?? null;

        const event: ProjectLeadAuditEventRecord = {
          id: `lead_audit_${leadAuditEvents.length + 1}`,
          projectId: input.projectId,
          projectLeadId: lead.id,
          actorUserId: input.actorUserId,
          actorUserEmail: actor?.email ?? null,
          actorUserFullName: actor?.fullName ?? null,
          type: "SOFT_DELETED",
          reasonCode: input.reasonCode,
          note: input.note ?? null,
          metadata: null,
          createdAt: input.occurredAt,
        };
        leadAuditEvents.unshift(event);
        lead.auditEvents.unshift(event);
        updated.push(lead);
      }

      return updated;
    },
    async restoreProjectLeads(input) {
      const actor = users.find((user) => user.id === input.actorUserId) ?? null;
      const updated: typeof leads = [];

      for (const lead of leads) {
        if (lead.projectId !== input.projectId || !input.leadIds.includes(lead.id)) {
          continue;
        }

        lead.visibilityState = "VISIBLE";
        lead.hiddenAt = null;
        lead.hiddenByPortalUserId = null;
        lead.hiddenByUserEmail = null;
        lead.hiddenByUserFullName = null;
        lead.hiddenReasonCode = null;
        lead.hiddenReasonNote = null;
        lead.lastRestoredAt = input.occurredAt;
        lead.lastRestoredByPortalUserId = input.actorUserId;
        lead.lastRestoredByUserEmail = actor?.email ?? null;
        lead.lastRestoredByUserFullName = actor?.fullName ?? null;

        const event: ProjectLeadAuditEventRecord = {
          id: `lead_audit_${leadAuditEvents.length + 1}`,
          projectId: input.projectId,
          projectLeadId: lead.id,
          actorUserId: input.actorUserId,
          actorUserEmail: actor?.email ?? null,
          actorUserFullName: actor?.fullName ?? null,
          type: "RESTORED",
          reasonCode: null,
          note: input.note ?? null,
          metadata: null,
          createdAt: input.occurredAt,
        };
        leadAuditEvents.unshift(event);
        lead.auditEvents.unshift(event);
        updated.push(lead);
      }

      return updated;
    },
    async createProjectLeadRevealAuditEvent(input) {
      const actor = users.find((user) => user.id === input.actorUserId) ?? null;
      const event: ProjectLeadAuditEventRecord = {
        id: `lead_audit_${leadAuditEvents.length + 1}`,
        projectId: input.projectId,
        projectLeadId: input.projectLeadId,
        actorUserId: input.actorUserId,
        actorUserEmail: actor?.email ?? null,
        actorUserFullName: actor?.fullName ?? null,
        type: "PII_REVEALED",
        reasonCode: input.reasonCode,
        note: input.note ?? null,
        metadata: null,
        createdAt: input.occurredAt,
      };
      leadAuditEvents.unshift(event);
      const lead = leads.find((entry) => entry.id === input.projectLeadId);
      if (lead) {
        lead.auditEvents.unshift(event);
      }
      return event;
    },
    async hardDeleteProjectLeads(input) {
      const actor = users.find((user) => user.id === input.actorUserId) ?? null;
      const tombstones: ProjectLeadDeletionTombstoneRecord[] = [];

      for (const leadId of input.leadIds) {
        const index = leads.findIndex(
          (lead) => lead.projectId === input.projectId && lead.id === leadId,
        );
        if (index < 0) {
          continue;
        }

        const lead = leads[index];
        if (!lead) {
          continue;
        }
        const tombstone: ProjectLeadDeletionTombstoneRecord = {
          id: `lead_tombstone_${leadTombstones.length + tombstones.length + 1}`,
          projectId: input.projectId,
          deletedProjectLeadId: lead.id,
          deletedSourceLeadId: lead.sourceLeadId,
          deletedByUserId: input.actorUserId,
          deletedByUserEmail: actor?.email ?? null,
          deletedByUserFullName: actor?.fullName ?? null,
          reasonCode: input.reasonCode,
          note: input.note ?? null,
          createdAt: input.occurredAt,
        };
        tombstones.push(tombstone);
        leads.splice(index, 1);
      }

      for (const tombstone of tombstones) {
        leadTombstones.unshift(tombstone);
      }

      for (let index = leadAuditEvents.length - 1; index >= 0; index -= 1) {
        if (tombstones.some((entry) => entry.deletedProjectLeadId === leadAuditEvents[index]?.projectLeadId)) {
          leadAuditEvents.splice(index, 1);
        }
      }

      return tombstones;
    },
    async listProjectInvites(projectId) {
      return projectInvites
        .filter((invite) => invite.projectId === projectId)
        .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime());
    },
    async createProjectInvite(input) {
      for (const invite of projectInvites) {
        if (invite.projectId === input.projectId && invite.email === input.email && invite.status === "PENDING") {
          invite.status = "REVOKED";
          invite.revokedAt = input.occurredAt;
        }
      }

      const actor = users.find((user) => user.id === input.invitedByPortalUserId) ?? null;
      const invite: ProjectInviteRecord = {
        id: `invite_${projectInvites.length + 1}`,
        projectId: input.projectId,
        email: input.email,
        fullName: input.fullName ?? null,
        role: input.role,
        invitedByPortalUserId: input.invitedByPortalUserId,
        invitedByUserEmail: actor?.email ?? null,
        invitedByUserFullName: actor?.fullName ?? null,
        acceptedByPortalUserId: null,
        acceptedByUserEmail: null,
        acceptedByUserFullName: null,
        selector: input.selector,
        verifierHash: input.verifierHash,
        status: "PENDING",
        expiresAt: input.expiresAt,
        acceptedAt: null,
        revokedAt: null,
        createdAt: input.occurredAt,
        updatedAt: input.occurredAt,
      };
      projectInvites.unshift(invite);
      return invite;
    },
    async rotateProjectInvite(input) {
      const invite = projectInvites.find(
        (entry) => entry.id === input.inviteId && entry.projectId === input.projectId,
      );
      if (!invite) {
        return null;
      }

      for (const sibling of projectInvites) {
        if (
          sibling.projectId === input.projectId &&
          sibling.email === invite.email &&
          sibling.status === "PENDING" &&
          sibling.id !== invite.id
        ) {
          sibling.status = "REVOKED";
          sibling.revokedAt = input.occurredAt;
          sibling.updatedAt = input.occurredAt;
        }
      }

      invite.selector = input.selector;
      invite.verifierHash = input.verifierHash;
      invite.expiresAt = input.expiresAt;
      invite.status = "PENDING";
      invite.revokedAt = null;
      invite.updatedAt = input.occurredAt;
      return invite;
    },
    async updateProjectInviteRole(input) {
      const invite = projectInvites.find(
        (entry) =>
          entry.id === input.inviteId &&
          entry.projectId === input.projectId &&
          entry.status === "PENDING",
      );
      if (!invite) {
        return null;
      }

      invite.role = input.role;
      invite.updatedAt = new Date("2026-03-26T00:00:00.000Z");
      return invite;
    },
    async revokeProjectInvite(input) {
      const invite = projectInvites.find(
        (entry) =>
          entry.id === input.inviteId &&
          entry.projectId === input.projectId &&
          entry.status === "PENDING",
      );
      if (!invite) {
        return null;
      }

      invite.status = "REVOKED";
      invite.revokedAt = input.occurredAt;
      invite.updatedAt = input.occurredAt;
      return invite;
    },
    async findProjectInviteBySelector(selector) {
      return projectInvites.find((invite) => invite.selector === selector) ?? null;
    },
    async consumeProjectInvite(input) {
      const invite = projectInvites.find(
        (entry) =>
          entry.selector === input.selector &&
          entry.verifierHash === input.verifierHash &&
          entry.status === "PENDING",
      );
      if (!invite) {
        return null;
      }

      const portalUser = users.find((user) => user.id === input.portalUserId);
      if (!portalUser) {
        return null;
      }

      portalUser.status = "ACTIVE";
      portalUser.emailVerifiedAt = input.acceptedAt;

      const existingMembership = memberships.find(
        (entry) =>
          entry.projectId === invite.projectId &&
          entry.portalUserId === input.portalUserId,
      );
      if (existingMembership) {
        existingMembership.role = invite.role;
      } else {
        memberships.push({
          projectId: invite.projectId,
          portalUserId: input.portalUserId,
          role: invite.role,
        });
      }

      invite.status = "ACCEPTED";
      invite.acceptedAt = input.acceptedAt;
      invite.acceptedByPortalUserId = input.portalUserId;
      invite.acceptedByUserEmail = portalUser.email;
      invite.acceptedByUserFullName = portalUser.fullName;
      invite.updatedAt = input.acceptedAt;
      return invite;
    },
    async countProjectOwners(projectId) {
      return memberships.filter(
        (entry) => entry.projectId === projectId && entry.role === "OWNER",
      ).length;
    },
    async updateProjectMembershipRole(input) {
      const membership = memberships.find(
        (entry) =>
          entry.projectId === input.projectId &&
          entry.portalUserId === input.memberPortalUserId,
      );
      if (!membership) {
        return null;
      }

      membership.role = input.role;
      const portalUser = users.find((user) => user.id === membership.portalUserId);
      if (!portalUser) {
        return null;
      }

      return {
        portalUserId: portalUser.id,
        email: portalUser.email,
        fullName: portalUser.fullName,
        role: membership.role,
        status: portalUser.status,
      };
    },
    async removeProjectMembership(input) {
      const index = memberships.findIndex(
        (entry) =>
          entry.projectId === input.projectId &&
          entry.portalUserId === input.memberPortalUserId,
      );
      if (index < 0) {
        return false;
      }

      memberships.splice(index, 1);
      for (const invite of projectInvites) {
        if (invite.projectId === input.projectId && invite.email === users.find((user) => user.id === input.memberPortalUserId)?.email) {
          invite.status = "REVOKED";
          invite.revokedAt = new Date("2026-03-26T00:00:00.000Z");
        }
      }
      return true;
    },
    async assertProjectAccess(input) {
      const portalUser = users.find((user) => user.id === input.portalUserId);
      if (!portalUser) {
        return null;
      }

      if (
        portalUser.role === "PLATFORM_ADMIN" ||
        portalUser.role === "PLATFORM_OPERATOR"
      ) {
        const project = projects.find((entry) => entry.id === input.projectId);
        return project
          ? {
              portalUser,
              project,
              membershipRole: "OWNER" as const,
            }
          : null;
      }

      const membership = memberships.find(
        (entry) =>
          entry.portalUserId === input.portalUserId && entry.projectId === input.projectId,
      );
      if (!membership) {
        return null;
      }

      const project = projects.find((entry) => entry.id === input.projectId);
      return project
        ? {
            portalUser,
            project,
            membershipRole: membership.role,
          }
        : null;
    },
  };
}

function createDependencies(
  overrides: Partial<LandingPlatformDependencies> = {},
): LandingPlatformDependencies & {
  sendVerificationEmail: ReturnType<typeof vi.fn>;
  sendPasswordResetEmail: ReturnType<typeof vi.fn>;
  sendProjectGoLiveEmail: ReturnType<typeof vi.fn>;
  resolveDnsRecords: ReturnType<typeof vi.fn>;
  verifyGoogleIdToken: ReturnType<typeof vi.fn>;
} {
  return {
    now: () => new Date("2026-03-26T00:00:00.000Z"),
    randomToken: () => "selector.verifier",
    hashToken: (value) => `hash:${value}`,
    hashPassword: async (value) => `password-hash:${value}`,
    verifyPassword: async (value, passwordHash) => passwordHash === `password-hash:${value}`,
    sendMagicLinkEmail: vi.fn(async () => undefined),
    sendVerificationEmail: vi.fn(async () => undefined),
    sendPasswordResetEmail: vi.fn(async () => undefined),
    sendProjectGoLiveEmail: vi.fn(async () => undefined),
    appendLeadToGoogleSheet: vi.fn(async () => undefined),
    pushLeadToMdoc: vi.fn(async () => ({
      responseCode: 200,
      responseBody: "ok",
      metadata: null,
    })),
    resolveDnsRecords: vi.fn(async () => ({
      aRecords: [],
      cnameRecords: [],
    })),
    verifyGoogleIdToken: vi.fn(async () => ({
      subject: "google-sub-1",
      email: "google-user@example.com",
      emailVerified: true,
      fullName: "Google User",
      givenName: "Google",
      familyName: "User",
      pictureUrl: "https://example.com/avatar.png",
    })),
    ...overrides,
  } as LandingPlatformDependencies & {
    sendVerificationEmail: ReturnType<typeof vi.fn>;
    sendPasswordResetEmail: ReturnType<typeof vi.fn>;
    sendProjectGoLiveEmail: ReturnType<typeof vi.fn>;
    resolveDnsRecords: ReturnType<typeof vi.fn>;
    verifyGoogleIdToken: ReturnType<typeof vi.fn>;
  };
}

describe("landing platform service", () => {
  it("creates and emails a magic link for an existing portal user", async () => {
    const repo = createRepository();
    const deps = createDependencies();
    const service = createLandingPlatformService(repo, deps);

    const result = await service.requestPortalMagicLink({
      email: "CLIENT@example.com",
      redirectPath: "/projects",
    });

    expect(result).toEqual({ accepted: true });
    expect(deps.sendMagicLinkEmail).toHaveBeenCalledOnce();
    expect(deps.sendMagicLinkEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "client@example.com",
        magicLinkUrl: expect.stringContaining("selector="),
      }),
    );
  });

  it("consumes a valid magic link and creates a portal session", async () => {
    const repo = createRepository();
    const deps = createDependencies();
    const service = createLandingPlatformService(repo, deps);

    await service.requestPortalMagicLink({
      email: "client@example.com",
      redirectPath: "/projects/project_alpha",
    });

    const session = await service.consumePortalMagicLink({
      selector: "selector",
      verifier: "verifier",
    });

    expect(session.portalUser.email).toBe("client@example.com");
    expect(session.session.id).toBe("session_1");
    expect(session.redirectPath).toBe("/projects/project_alpha");
  });

  it("signs in with a valid password credential and creates a portal session", async () => {
    const repo = createRepository();
    const deps = createDependencies();
    const service = createLandingPlatformService(repo, deps);

    const session = await service.signInWithPassword({
      email: "client@example.com",
      password: "client-password",
    });

    expect(session.portalUser.email).toBe("client@example.com");
    expect(session.session.id).toBe("session_1");
  });

  it("consumes a matching project invite during password sign-in and returns the project redirect", async () => {
    const repo = createRepository();
    const deps = createDependencies();
    const service = createLandingPlatformService(repo, deps);

    const invite = await service.inviteProjectMember({
      portalUserId: "user_operator",
      projectId: "project_beta",
      email: "client@example.com",
      role: "OWNER",
    });

    const session = await service.signInWithPassword({
      email: "client@example.com",
      password: "client-password",
      inviteSelector: invite.selector,
      inviteVerifier: "verifier",
    });

    expect(session.portalUser.email).toBe("client@example.com");
    expect(session.redirectPath).toBe("/dashboard/projects/project_beta");

    const access = await service.getProjectDetail({
      portalUserId: "user_client",
      projectId: "project_beta",
    });
    expect(access.membershipRole).toBe("OWNER");
  });

  it("rejects password sign-in when the portal user has no password credential", async () => {
    const repo = createRepository({ includeClientPasswordCredential: false });
    const deps = createDependencies();
    const service = createLandingPlatformService(repo, deps);

    await expect(
      service.signInWithPassword({
        email: "client@example.com",
        password: "client-password",
      }),
    ).rejects.toThrow("Invalid email or password.");
  });

  it("creates a pending account from password sign-up and sends a verification email", async () => {
    const repo = createRepository({ includePlatformAdmin: false });
    const deps = createDependencies();
    const service = createLandingPlatformService(repo, deps) as ReturnType<
      typeof createLandingPlatformService
    > & {
      signUpWithPassword: (input: {
        firstName: string;
        lastName: string;
        email: string;
        phone?: string;
        password: string;
      }) => Promise<{ accepted: true }>;
    };

    const result = await service.signUpWithPassword({
      firstName: "Ada",
      lastName: "Lovelace",
      email: "ada@example.com",
      phone: "+91 99999 00000",
      password: "AdaSecure123!",
    });

    expect(result).toEqual({ accepted: true });
    expect(deps.sendVerificationEmail).toHaveBeenCalledOnce();
  });

  it("activates and signs in an invited user during password sign-up without sending a verification email", async () => {
    const repo = createRepository({ includePlatformAdmin: false });
    const deps = createDependencies();
    const service = createLandingPlatformService(repo, deps);

    const invite = await service.inviteProjectMember({
      portalUserId: "user_client",
      projectId: "project_alpha",
      email: "bipin@example.com",
      fullName: "Bipin",
      role: "OWNER",
    });

    const result = await service.signUpWithPassword({
      firstName: "Bipin",
      lastName: "Patil",
      email: "bipin@example.com",
      phone: "+91 99999 11111",
      password: "BipinSecure123!",
      inviteSelector: invite.selector,
      inviteVerifier: "verifier",
    });

    expect("authenticated" in result && result.authenticated).toBe(true);
    if (!("authenticated" in result) || !result.authenticated) {
      throw new Error("Expected invite sign-up to authenticate immediately.");
    }

    expect(result).toMatchObject({
      authenticated: true,
      portalUser: {
        email: "bipin@example.com",
      },
      redirectPath: "/dashboard/projects/project_alpha",
    });
    expect(result.session.id).toBe("session_1");
    expect(deps.sendVerificationEmail).not.toHaveBeenCalled();

    const access = await service.getProjectDetail({
      portalUserId: result.portalUser.id,
      projectId: "project_alpha",
    });
    expect(access.membershipRole).toBe("OWNER");
  });

  it("rejects invite-aware sign-up when the exact invited email does not match", async () => {
    const repo = createRepository({ includePlatformAdmin: false });
    const deps = createDependencies();
    const service = createLandingPlatformService(repo, deps);

    const invite = await service.inviteProjectMember({
      portalUserId: "user_client",
      projectId: "project_alpha",
      email: "invited@example.com",
      role: "VIEWER",
    });

    await expect(
      service.signUpWithPassword({
        firstName: "Wrong",
        lastName: "Email",
        email: "different@example.com",
        password: "Different123!",
        inviteSelector: invite.selector,
        inviteVerifier: "verifier",
      }),
    ).rejects.toThrow("Project invite email mismatch.");
  });

  it("activates a pending user when the verification token is consumed and creates a session", async () => {
    const repo = createRepository({ includePlatformAdmin: false });
    const deps = createDependencies();
    const service = createLandingPlatformService(repo, deps) as ReturnType<
      typeof createLandingPlatformService
    > & {
      signUpWithPassword: (input: {
        firstName: string;
        lastName: string;
        email: string;
        password: string;
      }) => Promise<{ accepted: true }>;
      consumeEmailVerification: (input: {
        selector: string;
        verifier: string;
      }) => Promise<{
        portalUser: { email: string; status: "ACTIVE" };
        session: { id: string };
      }>;
    };

    await service.signUpWithPassword({
      firstName: "Ada",
      lastName: "Lovelace",
      email: "ada@example.com",
      password: "AdaSecure123!",
    });

    const verified = await service.consumeEmailVerification({
      selector: "selector",
      verifier: "verifier",
    });

    expect(verified.portalUser.email).toBe("ada@example.com");
    expect(verified.portalUser.status).toBe("ACTIVE");
    expect(verified.session.id).toBe("session_1");
  });

  it("accepts a forgot-password request without leaking account existence and sends reset mail for a real user", async () => {
    const repo = createRepository();
    const deps = createDependencies();
    const service = createLandingPlatformService(repo, deps) as ReturnType<
      typeof createLandingPlatformService
    > & {
      requestPasswordReset: (input: { email: string }) => Promise<{ accepted: true }>;
    };

    const result = await service.requestPasswordReset({
      email: "client@example.com",
    });

    expect(result).toEqual({ accepted: true });
    expect(deps.sendPasswordResetEmail).toHaveBeenCalledOnce();
  });

  it("replaces the stored password from a reset token and allows a fresh password sign-in", async () => {
    const repo = createRepository();
    const deps = createDependencies();
    const service = createLandingPlatformService(repo, deps) as ReturnType<
      typeof createLandingPlatformService
    > & {
      requestPasswordReset: (input: { email: string }) => Promise<{ accepted: true }>;
      resetPassword: (input: {
        selector: string;
        verifier: string;
        password: string;
      }) => Promise<{ session: { id: string } }>;
    };

    await service.requestPasswordReset({
      email: "client@example.com",
    });

    const reset = await service.resetPassword({
      selector: "selector",
      verifier: "verifier",
      password: "NewClientPassword123!",
    });

    const session = await service.signInWithPassword({
      email: "client@example.com",
      password: "NewClientPassword123!",
    });

    expect(reset.session.id).toBe("session_1");
    expect(session.session.id).toBe("session_2");
  });

  it("creates or reuses an active account from a verified Google identity and issues a session", async () => {
    const repo = createRepository({ includePlatformAdmin: false });
    const deps = createDependencies();
    const service = createLandingPlatformService(repo, deps) as ReturnType<
      typeof createLandingPlatformService
    > & {
      signInWithGoogle: (input: { idToken: string }) => Promise<{
        portalUser: { email: string };
        session: { id: string };
      }>;
    };

    const result = await service.signInWithGoogle({
      idToken: "google-id-token",
    });

    expect(result.portalUser.email).toBe("google-user@example.com");
    expect(result.session.id).toBe("session_1");
  });

  it("consumes a matching invite during Google sign-in and returns the project redirect", async () => {
    const repo = createRepository();
    const deps = createDependencies({
      verifyGoogleIdToken: vi.fn(async () => ({
        subject: "google-sub-viewer",
        email: "viewer@example.com",
        emailVerified: true,
        fullName: "Viewer From Google",
        givenName: "Viewer",
        familyName: "Google",
        pictureUrl: null,
      })),
    });
    const service = createLandingPlatformService(repo, deps);

    const invite = await service.inviteProjectMember({
      portalUserId: "user_client",
      projectId: "project_alpha",
      email: "viewer@example.com",
      role: "OWNER",
    });

    const result = await service.signInWithGoogle({
      idToken: "google-id-token",
      inviteSelector: invite.selector,
      inviteVerifier: "verifier",
    });

    expect(result.portalUser.email).toBe("viewer@example.com");
    expect(result.redirectPath).toBe("/dashboard/projects/project_alpha");
  });

  it("bootstraps the first platform admin and refuses a duplicate bootstrap", async () => {
    const repo = createRepository({ includePlatformAdmin: false });
    const deps = createDependencies();
    const service = createLandingPlatformService(repo, deps);

    const admin = await service.bootstrapPlatformAdmin({
      email: "founder@shasvata.com",
      password: "NayaAdmin123!",
      fullName: "Naya Founder",
    });

    expect(admin.portalUser.role).toBe("PLATFORM_ADMIN");
    expect(admin.portalUser.email).toBe("founder@shasvata.com");

    await expect(
      service.bootstrapPlatformAdmin({
        email: "second@shasvata.com",
        password: "SecondAdmin123!",
        fullName: "Second Admin",
      }),
    ).rejects.toThrow("Platform admin bootstrap is already complete.");
  });

  it("returns only accessible projects for a client user but all projects for a platform admin", async () => {
    const repo = createRepository();
    const deps = createDependencies();
    const service = createLandingPlatformService(repo, deps);

    const clientProjects = await service.listAccessibleProjects("user_client");
    const adminProjects = await service.listAccessibleProjects("user_admin");

    expect(clientProjects.map((project) => project.id)).toEqual(["project_alpha"]);
    expect(adminProjects.map((project) => project.id)).toEqual([
      "project_alpha",
      "project_beta",
    ]);
  });

  it("loads the active portal session profile for a signed-in user", async () => {
    const repo = createRepository();
    const deps = createDependencies();
    const service = createLandingPlatformService(repo, deps);

    await service.requestPortalMagicLink({
      email: "client@example.com",
      redirectPath: "/projects/project_alpha",
    });

    const consumed = await service.consumePortalMagicLink({
      selector: "selector",
      verifier: "verifier",
    });

    const session = await service.getPortalSession(consumed.session.id);

    expect(session?.portalUser.email).toBe("client@example.com");
    expect(session?.session.id).toBe("session_1");
  });

  it("stores a project lead first, then marks the lead as synced when all downstream targets succeed", async () => {
    const repo = createRepository();
    const deps = createDependencies();
    const service = createLandingPlatformService(repo, deps);
    vi.spyOn(repo, "listLeadSyncTargets").mockResolvedValue([
      {
        id: "sync_alpha",
        projectId: "project_alpha",
        kind: "GOOGLE_SHEETS",
        status: "ACTIVE",
        label: "Client leads sheet",
        config: {
          spreadsheetId: "sheet_alpha",
          sheetName: "Leads",
        },
      },
      {
        id: "sync_alpha_mdoc",
        projectId: "project_alpha",
        kind: "MDOC_PUSH",
        status: "ACTIVE",
        label: "Topaz MDOC",
        config: {
          endpoint: "https://aakar.maksoftbox.com//MDocBoxAPI/MdocAddEnquiryORTeleCalling/",
          apiKey: "api-key",
          dataFrom: "E",
          source: "Digitals",
          fallbackSourceDetail: "Website",
        },
      },
    ]);

    const lead = await service.submitProjectLead({
      publicLeadKey: "lead_alpha",
      originHost: "alpha.example.com",
      honeypot: "",
      payload: {
        fullName: "Ada Lovelace",
        email: "ada@example.com",
        phone: "+91 90000 11111",
        companyName: "Estate Autopilots",
        message: "Need more qualified seller leads.",
        consent: true,
      },
    });

    expect(lead.syncStatus).toBe("SYNCED");
    expect(deps.appendLeadToGoogleSheet).toHaveBeenCalledOnce();
    expect(deps.pushLeadToMdoc).toHaveBeenCalledOnce();
  });

  it("keeps the lead when one downstream target fails and marks sync status as partial", async () => {
    const repo = createRepository();
    const deps = createDependencies({
      pushLeadToMdoc: vi.fn(async () => {
        throw new Error("MDOC unavailable");
      }),
    });
    const service = createLandingPlatformService(repo, deps);
    vi.spyOn(repo, "listLeadSyncTargets").mockResolvedValue([
      {
        id: "sync_alpha",
        projectId: "project_alpha",
        kind: "GOOGLE_SHEETS",
        status: "ACTIVE",
        label: "Client leads sheet",
        config: {
          spreadsheetId: "sheet_alpha",
          sheetName: "Leads",
        },
      },
      {
        id: "sync_alpha_mdoc",
        projectId: "project_alpha",
        kind: "MDOC_PUSH",
        status: "ACTIVE",
        label: "Topaz MDOC",
        config: {
          endpoint: "https://aakar.maksoftbox.com//MDocBoxAPI/MdocAddEnquiryORTeleCalling/",
          apiKey: "api-key",
          dataFrom: "E",
          source: "Digitals",
          fallbackSourceDetail: "Website",
        },
      },
    ]);

    const lead = await service.submitProjectLead({
      publicLeadKey: "lead_alpha",
      originHost: "alpha.example.com",
      honeypot: "",
      payload: {
        fullName: "Grace Hopper",
        email: "grace@example.com",
        phone: "+91 98888 77777",
        companyName: "Estate Autopilots",
        message: "Need a fast launch this week.",
        consent: true,
      },
    });

    expect(lead.syncStatus).toBe("PARTIAL");
    expect(lead.syncError).toContain("MDOC unavailable");
    expect(deps.appendLeadToGoogleSheet).toHaveBeenCalledOnce();
    expect(deps.pushLeadToMdoc).toHaveBeenCalledOnce();
  });

  it("exports project leads as CSV only for an authorized portal user", async () => {
    const repo = createRepository();
    const deps = createDependencies();
    const service = createLandingPlatformService(repo, deps);

    await service.submitProjectLead({
      publicLeadKey: "lead_alpha",
      originHost: "alpha.example.com",
      honeypot: "",
      payload: {
        fullName: "Margaret Hamilton",
        email: "margaret@example.com",
        phone: "",
        companyName: "Apollo Estates",
        message: "Need a better Meta campaign page.",
        consent: true,
      },
    });

    const csv = await service.exportProjectLeadsCsv({
      portalUserId: "user_client",
      projectId: "project_alpha",
    });

    expect(csv).toContain(
      "created_at,full_name,phone,email,company_name,interest,budget,touchpoint,source_page",
    );
    expect(csv).toContain("Margaret Hamilton,,margaret@example.com,Apollo Estates");
  });

  it("filters internal smoke leads from the client view while preserving them for operators", async () => {
    const repo = createRepository();
    const deps = createDependencies();
    const service = createLandingPlatformService(repo, deps);

    await service.submitProjectLead({
      publicLeadKey: "lead_alpha",
      originHost: "alpha.example.com",
      honeypot: "",
      payload: {
        fullName: "Client Lead",
        email: "client-lead@example.com",
        phone: "",
        companyName: "Apollo Estates",
        message: "Need a better Meta campaign page.",
        consent: true,
      },
    });

    await service.submitProjectLead({
      publicLeadKey: "lead_alpha",
      originHost: "alpha.example.com",
      honeypot: "",
      payload: {
        fullName: "Portal Smoke Test",
        email: "portal-smoke@shasvata.com",
        phone: "",
        companyName: "Shasvata",
        message: "Smoke test for dashboard cleanup.",
        consent: true,
      },
    });

    await service.submitProjectLead({
      publicLeadKey: "lead_alpha",
      originHost: "alpha.example.com",
      honeypot: "",
      payload: {
        fullName: "Suyash Sadashiv Rahegaonkar",
        email: "rsuyash123@gmail.com",
        phone: "",
        companyName: "Test Lead",
        message: "Client preview verification.",
        consent: true,
      },
    });

    const clientDetail = await service.getProjectDetail({
      portalUserId: "user_client",
      projectId: "project_alpha",
    });
    const clientLeads = await service.listProjectLeads({
      portalUserId: "user_client",
      projectId: "project_alpha",
    });
    const operatorDetail = await service.getProjectDetail({
      portalUserId: "user_operator",
      projectId: "project_alpha",
    });
    const operatorLeads = await service.listProjectLeads({
      portalUserId: "user_operator",
      projectId: "project_alpha",
    });

    expect(clientDetail?.portalView).toBe("CLIENT");
    expect(clientDetail?.leadCount).toBe(1);
    expect(clientDetail?.leadNotificationRecipients).toEqual([
      expect.objectContaining({
        email: "builder@example.com",
        label: "Builder sales",
      }),
    ]);
    expect(clientLeads).toHaveLength(1);
    expect(clientLeads[0]?.email).toBe("client-lead@example.com");
    expect(operatorLeads).toHaveLength(3);
    expect(operatorLeads.some((lead) => lead.isInternalTest)).toBe(true);
    expect(operatorDetail?.leadNotificationRecipients).toEqual([
      expect.objectContaining({
        email: "builder@example.com",
        label: "Builder sales",
      }),
    ]);
  });

  it("exports project leads as an xlsx workbook for an authorized portal user", async () => {
    const repo = createRepository();
    const deps = createDependencies();
    const service = createLandingPlatformService(repo, deps);

    await service.submitProjectLead({
      publicLeadKey: "lead_alpha",
      originHost: "alpha.example.com",
      honeypot: "",
      payload: {
        fullName: "Margaret Hamilton",
        email: "margaret@example.com",
        phone: "",
        companyName: "Apollo Estates",
        message: "Need a better Meta campaign page.",
        consent: true,
      },
    });

    const workbook = await service.exportProjectLeadsXlsx({
      portalUserId: "user_client",
      projectId: "project_alpha",
    });

    expect(Buffer.isBuffer(workbook)).toBe(true);
    expect(workbook.subarray(0, 2).toString("utf8")).toBe("PK");
  });

  it("returns project detail and lead rows only for an authorized portal user", async () => {
    const repo = createRepository();
    const deps = createDependencies();
    const service = createLandingPlatformService(repo, deps);

    await service.submitProjectLead({
      publicLeadKey: "lead_alpha",
      originHost: "alpha.example.com",
      honeypot: "",
      payload: {
        fullName: "Margaret Hamilton",
        email: "margaret@example.com",
        phone: "",
        companyName: "Apollo Estates",
        message: "Need a better Meta campaign page.",
        consent: true,
      },
    });

    vi.spyOn(repo, "listLeadSyncTargets").mockResolvedValue([
      {
        id: "sync_alpha",
        projectId: "project_alpha",
        kind: "GOOGLE_SHEETS",
        status: "ACTIVE",
        label: "Client leads sheet",
        config: {
          spreadsheetId: "sheet_alpha",
          sheetName: "Leads",
        },
      },
      {
        id: "sync_alpha_mdoc",
        projectId: "project_alpha",
        kind: "MDOC_PUSH",
        status: "ACTIVE",
        label: "Topaz MDOC",
        config: {
          endpoint: "https://aakar.maksoftbox.com//MDocBoxAPI/MdocAddEnquiryORTeleCalling/",
          apiKey: "api-key",
          dataFrom: "E",
          source: "Digitals",
          fallbackSourceDetail: "Website",
        },
      },
    ]);

    const detail = await service.getProjectDetail({
      portalUserId: "user_client",
      projectId: "project_alpha",
    });
    const leads = await service.listProjectLeads({
      portalUserId: "user_client",
      projectId: "project_alpha",
    });

    expect(detail?.sites).toHaveLength(1);
    expect(detail?.domains[0]?.host).toBe("alpha.example.com");
    expect(detail?.portalView).toBe("CLIENT");
    expect(detail?.syncTargets).toHaveLength(2);
    expect(detail?.syncTargets[0]?.label).toBe("Client leads sheet");
    expect(detail?.syncTargets[1]?.label).toBe("Topaz MDOC");
    expect(detail?.leadNotificationRecipients).toEqual([
      expect.objectContaining({
        email: "builder@example.com",
        label: "Builder sales",
      }),
    ]);
    expect(detail?.publicLeadKey).toBeNull();
    expect(detail?.leadCount).toBe(1);
    expect(detail?.sourceSummary).toBeNull();
    expect(detail?.previewUrl).toBeNull();
    expect(detail?.liveUrl).toBe("https://alpha.example.com");
    expect(detail?.billingSummary.latestCartStatus).toBe("PAID");
    expect(leads).toHaveLength(1);
    expect(leads[0]?.email).toBe("margaret@example.com");
  });

  it("retains delivery metadata and diagnostic export columns for operator users", async () => {
    const repo = createRepository();
    const deps = createDependencies();
    const service = createLandingPlatformService(repo, deps);

    await service.submitProjectLead({
      publicLeadKey: "lead_alpha",
      originHost: "alpha.example.com",
      honeypot: "",
      payload: {
        fullName: "Operator View Lead",
        email: "operator-view@example.com",
        phone: "+91 90000 11111",
        companyName: "Apollo Estates",
        message: "Need a better Meta campaign page.",
        consent: true,
      },
    });

    const detail = await service.getProjectDetail({
      portalUserId: "user_operator",
      projectId: "project_alpha",
    });
    const csv = await service.exportProjectLeadsCsv({
      portalUserId: "user_operator",
      projectId: "project_alpha",
      mode: "full",
    });

    expect(detail?.portalView).toBe("OPERATOR");
    expect(detail?.publicLeadKey).toBe("lead_alpha");
    expect(detail?.syncTargets[0]?.label).toBe("Client leads sheet");
    expect(detail?.leadNotificationRecipients).toEqual([
      expect.objectContaining({
        email: "builder@example.com",
      }),
    ]);
    expect(detail?.sourceSummary?.repoUrl).toBe(
      "https://github.com/naya/estate-autopilots-alpha",
    );
    expect(detail?.previewUrl).toBe(
      "https://estate-autopilots-alpha.preview.shasvata.com",
    );
    expect(csv).toContain("alert_status");
    expect(csv).toContain("is_internal_test");
  });

  it("masks lead contact details for project viewers and blocks viewer exports", async () => {
    const repo = createRepository();
    const deps = createDependencies();
    const service = createLandingPlatformService(repo, deps);

    await service.submitProjectLead({
      publicLeadKey: "lead_alpha",
      originHost: "alpha.example.com",
      honeypot: "",
      payload: {
        fullName: "Viewer Test Lead",
        email: "viewer-test@example.com",
        phone: "+91 9988776655",
        companyName: "Apollo Estates",
        message: "Need a landing page refresh.",
        consent: true,
      },
    });

    const viewerLeads = await service.listProjectLeads({
      portalUserId: "user_viewer",
      projectId: "project_alpha",
    });

    expect(viewerLeads[0]?.email).toContain("***");
    expect(viewerLeads[0]?.phone).toContain("******");

    await expect(
      service.exportProjectLeadsCsv({
        portalUserId: "user_viewer",
        projectId: "project_alpha",
      }),
    ).rejects.toThrow("Project owner access required.");
  });

  it("lets a project owner soft-delete and restore leads through the project workspace state", async () => {
    const repo = createRepository();
    const deps = createDependencies();
    const service = createLandingPlatformService(repo, deps);

    const createdLead = await service.submitProjectLead({
      publicLeadKey: "lead_alpha",
      originHost: "alpha.example.com",
      honeypot: "",
      payload: {
        fullName: "Soft Delete Lead",
        email: "soft-delete@example.com",
        phone: "+91 9988776655",
        companyName: "Apollo Estates",
        message: "Need a landing page refresh.",
        consent: true,
      },
    });

    const hidden = await service.softDeleteProjectLeads({
      portalUserId: "user_client",
      projectId: "project_alpha",
      leadIds: [createdLead.id],
      reasonCode: "DUPLICATE_LEAD",
    });

    expect(hidden[0]?.visibilityState).toBe("HIDDEN");

    const activeLeads = await service.listProjectLeads({
      portalUserId: "user_client",
      projectId: "project_alpha",
      tab: "active",
    });
    const hiddenLeads = await service.listProjectLeads({
      portalUserId: "user_client",
      projectId: "project_alpha",
      tab: "hidden",
    });

    expect(activeLeads.some((lead) => lead.id === createdLead.id)).toBe(false);
    expect(hiddenLeads.some((lead) => lead.id === createdLead.id)).toBe(true);

    const restored = await service.restoreProjectLeads({
      portalUserId: "user_client",
      projectId: "project_alpha",
      leadIds: [createdLead.id],
    });

    expect(restored[0]?.visibilityState).toBe("VISIBLE");
  });

  it("lets operators reveal masked leads and hard-delete hidden leads into tombstones", async () => {
    const repo = createRepository();
    const deps = createDependencies();
    const service = createLandingPlatformService(repo, deps);

    const createdLead = await service.submitProjectLead({
      publicLeadKey: "lead_alpha",
      originHost: "alpha.example.com",
      honeypot: "",
      payload: {
        fullName: "Operator Delete Lead",
        email: "operator-delete@example.com",
        phone: "+91 9988776655",
        companyName: "Apollo Estates",
        message: "Need a landing page refresh.",
        consent: true,
      },
    });

    const revealed = await service.revealProjectLead({
      portalUserId: "user_operator",
      projectId: "project_alpha",
      leadId: createdLead.id,
      reasonCode: "CLIENT_SUPPORT",
    });

    expect(revealed.lead.email).toBe("operator-delete@example.com");
    expect(revealed.expiresAt).toBeInstanceOf(Date);

    await service.softDeleteProjectLeads({
      portalUserId: "user_operator",
      projectId: "project_alpha",
      leadIds: [createdLead.id],
      reasonCode: "DATA_HYGIENE_CORRECTION",
    });

    const tombstones = await service.hardDeleteProjectLeads({
      portalUserId: "user_operator",
      projectId: "project_alpha",
      leadIds: [createdLead.id],
      reasonCode: "OPERATOR_CORRECTION",
    });

    expect(tombstones[0]?.deletedProjectLeadId).toBe(createdLead.id);
    const deletedView = await service.listProjectLeadTombstones({
      portalUserId: "user_operator",
      projectId: "project_alpha",
    });
    expect(deletedView.some((entry) => entry.deletedProjectLeadId === createdLead.id)).toBe(true);
  });

  it("lets a platform operator create an imported project with preview host and pending live domain", async () => {
    const repo = createRepository();
    const deps = createDependencies();
    const service = createLandingPlatformService(repo, deps) as ReturnType<
      typeof createLandingPlatformService
    > & {
      createImportedProject: (input: {
        portalUserId: string;
        projectSlug: string;
        projectName: string;
        repoUrl: string;
        repoBranch?: string;
        repoRef?: string;
        clientCompany?: string;
        desiredLiveDomain?: string;
        operatorNotes?: string;
      }) => Promise<{
        project: {
          slug: string;
          primaryDomain: string | null;
          clientCompanyName: string | null;
        };
        site: {
          previewHost: string | null;
          repoUrl: string;
          runtimeProfile: "STATIC_ARTIFACT" | "ISOLATED_APP";
        };
        domain: {
          host: string;
          status: "PENDING" | "ACTIVE" | "ERROR";
          dnsTarget: string | null;
        } | null;
      }>;
    };

    const created = await service.createImportedProject({
      portalUserId: "user_operator",
      projectSlug: "wagholi-highstreets",
      projectName: "Wagholi Highstreets",
      repoUrl: "https://github.com/naya/wagholi-highstreets",
      repoBranch: "main",
      clientCompany: "Estate Autopilots",
      desiredLiveDomain: "wagholi.example.com",
      operatorNotes: "Imported from AI Studio output.",
    });

    expect(created.project.slug).toBe("wagholi-highstreets");
    expect(created.project.primaryDomain).toBe("wagholi.example.com");
    expect(created.project.clientCompanyName).toBe("Estate Autopilots");
    expect(created.site.previewHost).toBe("wagholi-highstreets.preview.shasvata.com");
    expect(created.site.repoUrl).toBe("https://github.com/naya/wagholi-highstreets");
    expect(created.site.runtimeProfile).toBe("STATIC_ARTIFACT");
    expect(created.domain).toEqual(
      expect.objectContaining({
        host: "wagholi.example.com",
        status: "PENDING",
      }),
    );
  });

  it("verifies a custom domain against the delivery target and sends go-live email after publish", async () => {
    const repo = createRepository();
    const deps = createDependencies({
      deliveryDnsTarget: "203.0.113.10",
      resolveDnsRecords: vi.fn(async () => ({
        aRecords: ["203.0.113.10"],
        cnameRecords: [],
      })),
      sendProjectGoLiveEmail: vi.fn(async () => undefined),
    });
    const service = createLandingPlatformService(repo, deps) as ReturnType<
      typeof createLandingPlatformService
    > & {
      verifyProjectDomain: (input: {
        portalUserId: string;
        projectId: string;
        domainId: string;
      }) => Promise<{
        status: "PENDING" | "ACTIVE" | "ERROR";
        verifiedAt: Date | null;
      }>;
      recordProjectSitePublish: (input: {
        portalUserId: string;
        projectId: string;
        siteId: string;
        publishStatus: "DRAFT" | "PUBLISHED" | "FAILED";
        runtimeProfile: "STATIC_ARTIFACT" | "ISOLATED_APP";
        deployedCommit?: string;
        previewHost?: string;
      }) => Promise<{
        project: { goLiveAt: Date | null; liveUrl: string | null };
        site: { publishStatus: "DRAFT" | "PUBLISHED" | "FAILED" };
      }>;
    };

    const verifiedDomain = await service.verifyProjectDomain({
      portalUserId: "user_operator",
      projectId: "project_alpha",
      domainId: "domain_alpha",
    });

    expect(verifiedDomain.status).toBe("ACTIVE");

    const published = await service.recordProjectSitePublish({
      portalUserId: "user_operator",
      projectId: "project_alpha",
      siteId: "site_alpha",
      publishStatus: "PUBLISHED",
      runtimeProfile: "STATIC_ARTIFACT",
      deployedCommit: "abc123def456",
      previewHost: "estate-autopilots-alpha.preview.shasvata.com",
    });

    expect(published.site.publishStatus).toBe("PUBLISHED");
    expect(published.project.liveUrl).toBe("https://alpha.example.com");
    expect(published.project.goLiveAt).toBeInstanceOf(Date);
    expect(deps.sendProjectGoLiveEmail).toHaveBeenCalledTimes(2);
  });

  it("lets a project owner create a pending project invite and triggers an invite email", async () => {
    const repo = createRepository();
    const deps = createDependencies();
    const service = createLandingPlatformService(repo, deps);

    const invite = await service.inviteProjectMember({
      portalUserId: "user_client",
      projectId: "project_alpha",
      email: "viewer-new@example.com",
      fullName: "New Viewer",
      role: "VIEWER",
    });

    expect(invite.email).toBe("viewer-new@example.com");
    expect(invite.role).toBe("VIEWER");
    expect(invite.status).toBe("PENDING");
    expect(deps.sendMagicLinkEmail).toHaveBeenCalledOnce();
  });

  it("lets a platform operator add and remove project lead alert recipients", async () => {
    const repo = createRepository();
    const deps = createDependencies();
    const service = createLandingPlatformService(repo, deps) as ReturnType<
      typeof createLandingPlatformService
    > & {
      addProjectNotificationRecipient: (input: {
        portalUserId: string;
        projectId: string;
        email: string;
        label?: string;
      }) => Promise<ProjectNotificationRecipientRecord>;
      removeProjectNotificationRecipient: (input: {
        portalUserId: string;
        projectId: string;
        recipientId: string;
      }) => Promise<{ removed: true }>;
    };

    const created = await service.addProjectNotificationRecipient({
      portalUserId: "user_operator",
      projectId: "project_alpha",
      email: "builder-owner@example.com",
      label: "Builder owner",
    });

    expect(created.email).toBe("builder-owner@example.com");
    expect(created.label).toBe("Builder owner");

    const removed = await service.removeProjectNotificationRecipient({
      portalUserId: "user_operator",
      projectId: "project_alpha",
      recipientId: created.id,
    });

    expect(removed).toEqual({ removed: true });
  });

  it("normalizes tracking IDs before saving them to the project site", async () => {
    const repo = createRepository();
    const deps = createDependencies();
    const service = createLandingPlatformService(repo, deps) as ReturnType<
      typeof createLandingPlatformService
    >;

    const site = await service.updateProjectTrackingSettings({
      portalUserId: "user_client",
      projectId: "project_alpha",
      ga4MeasurementId: "  g-alpha1234  ",
      googleAdsTagId: "  aw-18098571219  ",
      googleAdsConversionMode: "GA4_IMPORTED",
      googleAdsLeadConversionLabel: "  topazLeadPrimary_01  ",
      gtmContainerId: " gtm-alpha12 ",
      metaPixelId: " 1234-5678-9012 ",
      trackingNotes: "  route leads into the paid-campaign lane  ",
    });

    expect(site.ga4MeasurementId).toBe("G-ALPHA1234");
    expect(site.googleAdsTagId).toBe("AW-18098571219");
    expect(site.googleAdsConversionMode).toBe("GA4_IMPORTED");
    expect(site.googleAdsLeadConversionLabel).toBe("topazLeadPrimary_01");
    expect(site.gtmContainerId).toBe("GTM-ALPHA12");
    expect(site.metaPixelId).toBe("123456789012");
    expect(site.trackingNotes).toBe("route leads into the paid-campaign lane");
  });

  it("lets a project owner upsert an MDOC sync target with reusable defaults", async () => {
    const repo = createRepository();
    const deps = createDependencies();
    const service = createLandingPlatformService(repo, deps) as ReturnType<
      typeof createLandingPlatformService
    >;

    const target = await service.upsertProjectMdocSyncTarget({
      portalUserId: "user_client",
      projectId: "project_alpha",
      label: "Topaz MDOC",
      endpoint: "https://aakar.maksoftbox.com//MDocBoxAPI/MdocAddEnquiryORTeleCalling/",
      apiKey: "b6deae9a-f490-4c01-bb2a-f417ccc92960",
      dataFrom: "E",
      source: "Digitals",
      fallbackSourceDetail: "Website",
      sourceDetailRules: {
        website: "Website",
      },
      staticDefaults: {
        City: "Pune",
        State: "Maharashtra",
      },
      enumMappings: {
        budgets: {
          "70 to 75 Lacs": "70 to 75 Lacs",
        },
      },
    });

    expect(target.kind).toBe("MDOC_PUSH");
    expect(target.status).toBe("ACTIVE");
    expect(target.label).toBe("Topaz MDOC");
    expect(target.config).toMatchObject({
      endpoint: "https://aakar.maksoftbox.com//MDocBoxAPI/MdocAddEnquiryORTeleCalling/",
      apiKey: "b6deae9a-f490-4c01-bb2a-f417ccc92960",
      dataFrom: "E",
      source: "Digitals",
      fallbackSourceDetail: "Website",
    });
    expect("sourceDetailRules" in target.config && target.config.sourceDetailRules).toEqual(
      expect.objectContaining({
        google: "Google Ad",
        instagram: "Instagram",
        website: "Website",
      }),
    );
    expect("staticDefaults" in target.config && target.config.staticDefaults).toEqual(
      expect.objectContaining({
        City: "Pune",
        State: "Maharashtra",
      }),
    );
    expect("enumMappings" in target.config && target.config.enumMappings?.budgets).toEqual(
      expect.objectContaining({
        "70 to 75 Lacs": "70 to 75 Lacs",
      }),
    );
  });

  it("runs an MDOC connectivity test using the saved target config", async () => {
    const repo = createRepository();
    const deps = createDependencies();
    const service = createLandingPlatformService(repo, deps) as ReturnType<
      typeof createLandingPlatformService
    >;

    await service.upsertProjectMdocSyncTarget({
      portalUserId: "user_client",
      projectId: "project_alpha",
      label: "Topaz MDOC",
      endpoint: "https://aakar.maksoftbox.com//MDocBoxAPI/MdocAddEnquiryORTeleCalling/",
      apiKey: "b6deae9a-f490-4c01-bb2a-f417ccc92960",
      dataFrom: "E",
      source: "Digitals",
      fallbackSourceDetail: "Website",
    });

    const result = await service.testProjectMdocSyncTarget({
      portalUserId: "user_client",
      projectId: "project_alpha",
    });

    expect(result.responseCode).toBe(200);
    expect(deps.pushLeadToMdoc).toHaveBeenCalledOnce();
    expect(deps.pushLeadToMdoc).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({
          kind: "MDOC_PUSH",
          config: expect.objectContaining({
            endpoint: "https://aakar.maksoftbox.com//MDocBoxAPI/MdocAddEnquiryORTeleCalling/",
            apiKey: "b6deae9a-f490-4c01-bb2a-f417ccc92960",
          }),
        }),
      }),
    );
  });

  it("rejects invalid tracking IDs", async () => {
    const repo = createRepository();
    const deps = createDependencies();
    const service = createLandingPlatformService(repo, deps) as ReturnType<
      typeof createLandingPlatformService
    >;

    await expect(
      service.updateProjectTrackingSettings({
        portalUserId: "user_client",
        projectId: "project_alpha",
        ga4MeasurementId: "hello",
      }),
    ).rejects.toThrow("GA4 measurement ID is invalid.");

    await expect(
      service.updateProjectTrackingSettings({
        portalUserId: "user_client",
        projectId: "project_alpha",
        googleAdsTagId: "aw-bad",
      }),
    ).rejects.toThrow("Google Ads tag ID is invalid.");

    await expect(
      service.updateProjectTrackingSettings({
        portalUserId: "user_client",
        projectId: "project_alpha",
        googleAdsLeadConversionLabel: "bad label!",
      }),
    ).rejects.toThrow("Google Ads conversion label is invalid.");

    await expect(
      service.updateProjectTrackingSettings({
        portalUserId: "user_client",
        projectId: "project_alpha",
        gtmContainerId: "bad",
      }),
    ).rejects.toThrow("GTM container ID is invalid.");

    await expect(
      service.updateProjectTrackingSettings({
        portalUserId: "user_client",
        projectId: "project_alpha",
        metaPixelId: "12",
      }),
    ).rejects.toThrow("Meta Pixel ID is invalid.");
  });
});
