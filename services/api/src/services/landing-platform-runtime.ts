import crypto from "node:crypto";
import dns from "node:dns/promises";
import { createLandingPlatformRepository } from "../repositories/landing-platform.js";
import { appendLeadToGoogleSheet } from "./google-sheets.js";
import { pushLeadToMdoc } from "./mdoc-push.js";
import {
  AddProjectNotificationRecipientInput,
  BootstrapPlatformAdminInput,
  CreateImportedProjectInput,
  ConsumeEmailVerificationInput,
  ConsumeMagicLinkInput,
  ExportProjectLeadsCsvInput,
  ExportProjectLeadsXlsxInput,
  GoogleSignInInput,
  HardDeleteProjectLeadsInput,
  InviteProjectMemberInput,
  ListProjectAccessSettingsInput,
  ListProjectLeadTombstonesInput,
  ListProjectLeadsInput,
  PasswordSignInInput,
  PasswordResetInput,
  PasswordResetRequestInput,
  PasswordSignUpInput,
  ProjectPortalAccessInput,
  ReadProjectInviteInput,
  RemoveProjectNotificationRecipientInput,
  RemoveProjectMemberInput,
  RecordProjectSitePublishInput,
  RefreshImportedProjectSourceInput,
  RestoreProjectLeadsInput,
  RevealProjectLeadInput,
  RevokeProjectInviteInput,
  ResendProjectInviteInput,
  TestProjectMdocSyncTargetInput,
  SoftDeleteProjectLeadsInput,
  UpsertProjectDomainInput,
  UpdateProjectInviteInput,
  UpdateProjectMemberRoleInput,
  VerifyProjectDomainInput,
  createLandingPlatformService,
  ConsumeProjectInviteInput,
  RequestMagicLinkInput,
  SubmitProjectLeadInput,
  UpsertProjectMdocSyncTargetInput,
  UpdateProjectTrackingSettingsInput,
} from "./landing-platform.js";
import type {
  GoogleSheetsLeadSyncConfig,
  MdocPushLeadSyncConfig,
} from "./landing-platform.js";
import {
  sendProjectGoLiveEmail,
  sendPortalMagicLinkEmail,
  sendPortalPasswordResetEmail,
  sendPortalVerificationEmail,
} from "./landing-platform-email.js";
import { verifyGoogleIdToken } from "./google-identity.js";
import { hashPassword, verifyPassword } from "./passwords.js";
import { readPublicTrackingRuntimeConfig } from "./tracking-runtime.js";

const landingPlatformService = createLandingPlatformService(
  createLandingPlatformRepository(),
  {
    now: () => new Date(),
    randomToken: () => `${crypto.randomUUID()}.${crypto.randomUUID()}`,
    hashToken: (value) =>
      crypto.createHash("sha256").update(value).digest("hex"),
    hashPassword,
    verifyPassword,
    sendMagicLinkEmail: sendPortalMagicLinkEmail,
    sendVerificationEmail: sendPortalVerificationEmail,
    sendPasswordResetEmail: sendPortalPasswordResetEmail,
    sendProjectGoLiveEmail,
    verifyGoogleIdToken,
    appendLeadToGoogleSheet: async (input) => {
      if (input.target.kind !== "GOOGLE_SHEETS") {
        throw new Error("Google Sheets sync target configuration is invalid.");
      }

      await appendLeadToGoogleSheet({
        target: {
          config: input.target.config as GoogleSheetsLeadSyncConfig,
        },
        project: {
          name: input.project.name,
        },
        lead: {
          id: input.lead.id,
          createdAt: input.lead.createdAt,
          fullName: input.lead.fullName,
          email: input.lead.email,
          phone: input.lead.phone,
          companyName: input.lead.companyName,
          message: input.lead.message,
        },
      });
    },
    pushLeadToMdoc: async (input) => {
      if (input.target.kind !== "MDOC_PUSH") {
        throw new Error("MDOC sync target configuration is invalid.");
      }

      return pushLeadToMdoc({
        config: input.target.config as MdocPushLeadSyncConfig,
        project: {
          id: input.project.id,
          name: input.project.name,
        },
        lead: {
          id: input.lead.id,
          fullName: input.lead.fullName,
          email: input.lead.email,
          phone: input.lead.phone,
          message: input.lead.message,
          sourcePage: input.lead.sourcePage,
          utmSource: input.lead.utmSource,
          utmMedium: input.lead.utmMedium,
          utmCampaign: input.lead.utmCampaign,
          utmContent: input.lead.utmContent,
          utmTerm: input.lead.utmTerm,
          gclid: input.lead.gclid,
          gbraid: input.lead.gbraid,
          wbraid: input.lead.wbraid,
          serviceInterest: input.lead.serviceInterest,
          budgetRange: input.lead.budgetRange,
          timeline: input.lead.timeline,
          problemSummary: input.lead.problemSummary,
          createdAt: input.lead.createdAt,
        },
      });
    },
    resolveDnsRecords: async ({ host }) => {
      const [aRecords, cnameRecords] = await Promise.all([
        dns.resolve4(host).catch(() => []),
        dns.resolveCname(host).catch(() => []),
      ]);

      return {
        aRecords,
        cnameRecords,
      };
    },
    appBaseUrl:
      process.env["PORTAL_APP_URL"]?.trim() ||
      process.env["NEXT_PUBLIC_APP_URL"]?.trim() ||
      "https://shasvata.com/app",
    previewHostSuffix:
      process.env["LANDING_PREVIEW_HOST_SUFFIX"]?.trim() || "preview.shasvata.com",
    deliveryDnsTarget:
      process.env["LANDING_DELIVERY_DNS_TARGET"]?.trim() || "landing.shasvata.com",
  },
);

export async function requestPortalMagicLink(input: RequestMagicLinkInput) {
  return landingPlatformService.requestPortalMagicLink(input);
}

export async function consumePortalMagicLink(input: ConsumeMagicLinkInput) {
  return landingPlatformService.consumePortalMagicLink(input);
}

export async function signUpWithPassword(input: PasswordSignUpInput) {
  return landingPlatformService.signUpWithPassword(input);
}

export async function consumeEmailVerification(input: ConsumeEmailVerificationInput) {
  return landingPlatformService.consumeEmailVerification(input);
}

export async function signInWithPassword(input: PasswordSignInInput) {
  return landingPlatformService.signInWithPassword(input);
}

export async function requestPasswordReset(input: PasswordResetRequestInput) {
  return landingPlatformService.requestPasswordReset(input);
}

export async function resetPassword(input: PasswordResetInput) {
  return landingPlatformService.resetPassword(input);
}

export async function signInWithGoogle(input: GoogleSignInInput) {
  return landingPlatformService.signInWithGoogle(input);
}

export async function bootstrapPlatformAdmin(input: BootstrapPlatformAdminInput) {
  return landingPlatformService.bootstrapPlatformAdmin(input);
}

export async function listAccessibleProjects(portalUserId: string) {
  return landingPlatformService.listAccessibleProjects(portalUserId);
}

export async function listOperatorProjects(portalUserId: string) {
  return landingPlatformService.listOperatorProjects(portalUserId);
}

export async function getPortalSession(sessionId: string) {
  return landingPlatformService.getPortalSession(sessionId);
}

export async function revokePortalSession(sessionId: string) {
  return landingPlatformService.revokePortalSession(sessionId);
}

export async function getProjectDetail(input: ProjectPortalAccessInput) {
  return landingPlatformService.getProjectDetail(input);
}

export async function createImportedProject(input: CreateImportedProjectInput) {
  return landingPlatformService.createImportedProject(input);
}

export async function refreshImportedProjectSource(input: RefreshImportedProjectSourceInput) {
  return landingPlatformService.refreshImportedProjectSource(input);
}

export async function upsertProjectDomain(input: UpsertProjectDomainInput) {
  return landingPlatformService.upsertProjectDomain(input);
}

export async function verifyProjectDomain(input: VerifyProjectDomainInput) {
  return landingPlatformService.verifyProjectDomain(input);
}

export async function recordProjectSitePublish(input: RecordProjectSitePublishInput) {
  return landingPlatformService.recordProjectSitePublish(input);
}

export async function inviteProjectMember(input: InviteProjectMemberInput) {
  return landingPlatformService.inviteProjectMember(input);
}

export async function addProjectNotificationRecipient(
  input: AddProjectNotificationRecipientInput,
) {
  return landingPlatformService.addProjectNotificationRecipient(input);
}

export async function removeProjectNotificationRecipient(
  input: RemoveProjectNotificationRecipientInput,
) {
  return landingPlatformService.removeProjectNotificationRecipient(input);
}

export async function submitProjectLead(input: SubmitProjectLeadInput) {
  return landingPlatformService.submitProjectLead(input);
}

export async function upsertProjectMdocSyncTarget(
  input: UpsertProjectMdocSyncTargetInput,
) {
  return landingPlatformService.upsertProjectMdocSyncTarget(input);
}

export async function testProjectMdocSyncTarget(
  input: TestProjectMdocSyncTargetInput,
) {
  return landingPlatformService.testProjectMdocSyncTarget(input);
}

export async function getPublicTrackingRuntimeConfig(input: {
  host?: string | null;
}) {
  return readPublicTrackingRuntimeConfig(input);
}

export async function listProjectLeads(input: ListProjectLeadsInput) {
  return landingPlatformService.listProjectLeads(input);
}

export async function exportProjectLeadsCsv(input: ExportProjectLeadsCsvInput) {
  return landingPlatformService.exportProjectLeadsCsv(input);
}

export async function exportProjectLeadsXlsx(input: ExportProjectLeadsXlsxInput) {
  return landingPlatformService.exportProjectLeadsXlsx(input);
}

export async function listProjectLeadTombstones(input: ListProjectLeadTombstonesInput) {
  return landingPlatformService.listProjectLeadTombstones(input);
}

export async function softDeleteProjectLeads(input: SoftDeleteProjectLeadsInput) {
  return landingPlatformService.softDeleteProjectLeads(input);
}

export async function restoreProjectLeads(input: RestoreProjectLeadsInput) {
  return landingPlatformService.restoreProjectLeads(input);
}

export async function revealProjectLead(input: RevealProjectLeadInput) {
  return landingPlatformService.revealProjectLead(input);
}

export async function hardDeleteProjectLeads(input: HardDeleteProjectLeadsInput) {
  return landingPlatformService.hardDeleteProjectLeads(input);
}

export async function listProjectAccessSettings(input: ListProjectAccessSettingsInput) {
  return landingPlatformService.listProjectAccessSettings(input);
}

export async function updateProjectTrackingSettings(input: UpdateProjectTrackingSettingsInput) {
  return landingPlatformService.updateProjectTrackingSettings(input);
}

export async function resendProjectInvite(input: ResendProjectInviteInput) {
  return landingPlatformService.resendProjectInvite(input);
}

export async function updateProjectInvite(input: UpdateProjectInviteInput) {
  return landingPlatformService.updateProjectInvite(input);
}

export async function revokeProjectInvite(input: RevokeProjectInviteInput) {
  return landingPlatformService.revokeProjectInvite(input);
}

export async function updateProjectMemberRole(input: UpdateProjectMemberRoleInput) {
  return landingPlatformService.updateProjectMemberRole(input);
}

export async function removeProjectMember(input: RemoveProjectMemberInput) {
  return landingPlatformService.removeProjectMember(input);
}

export async function readProjectInvite(input: ReadProjectInviteInput) {
  return landingPlatformService.readProjectInvite(input);
}

export async function consumeProjectInvite(input: ConsumeProjectInviteInput) {
  return landingPlatformService.consumeProjectInvite(input);
}
