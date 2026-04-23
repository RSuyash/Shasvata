-- CreateEnum
CREATE TYPE "ProjectLeadVisibilityState" AS ENUM ('VISIBLE', 'HIDDEN');

-- CreateEnum
CREATE TYPE "ProjectLeadAuditEventType" AS ENUM ('SOFT_DELETED', 'RESTORED', 'PII_REVEALED', 'HARD_DELETED');

-- CreateEnum
CREATE TYPE "ProjectInviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REVOKED', 'EXPIRED');

-- AlterTable
ALTER TABLE "ProjectLead"
ADD COLUMN "visibilityState" "ProjectLeadVisibilityState" NOT NULL DEFAULT 'VISIBLE',
ADD COLUMN "hiddenAt" TIMESTAMP(3),
ADD COLUMN "hiddenByPortalUserId" TEXT,
ADD COLUMN "hiddenReasonCode" TEXT,
ADD COLUMN "hiddenReasonNote" TEXT,
ADD COLUMN "lastRestoredAt" TIMESTAMP(3),
ADD COLUMN "lastRestoredByPortalUserId" TEXT;

-- CreateTable
CREATE TABLE "ProjectLeadAuditEvent" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "projectLeadId" TEXT NOT NULL,
    "actorUserId" TEXT,
    "type" "ProjectLeadAuditEventType" NOT NULL,
    "reasonCode" TEXT,
    "note" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectLeadAuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectLeadDeletionTombstone" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "deletedProjectLeadId" TEXT NOT NULL,
    "deletedSourceLeadId" TEXT,
    "deletedByUserId" TEXT,
    "reasonCode" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectLeadDeletionTombstone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectInvite" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "fullName" TEXT,
    "role" "ProjectMembershipRole" NOT NULL,
    "invitedByPortalUserId" TEXT NOT NULL,
    "acceptedByPortalUserId" TEXT,
    "selector" TEXT NOT NULL,
    "verifierHash" TEXT NOT NULL,
    "status" "ProjectInviteStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectInvite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProjectLead_projectId_visibilityState_createdAt_idx" ON "ProjectLead"("projectId", "visibilityState", "createdAt");

-- CreateIndex
CREATE INDEX "ProjectLead_hiddenByPortalUserId_idx" ON "ProjectLead"("hiddenByPortalUserId");

-- CreateIndex
CREATE INDEX "ProjectLead_lastRestoredByPortalUserId_idx" ON "ProjectLead"("lastRestoredByPortalUserId");

-- CreateIndex
CREATE INDEX "ProjectLeadAuditEvent_projectId_type_createdAt_idx" ON "ProjectLeadAuditEvent"("projectId", "type", "createdAt");

-- CreateIndex
CREATE INDEX "ProjectLeadAuditEvent_projectLeadId_createdAt_idx" ON "ProjectLeadAuditEvent"("projectLeadId", "createdAt");

-- CreateIndex
CREATE INDEX "ProjectLeadAuditEvent_actorUserId_createdAt_idx" ON "ProjectLeadAuditEvent"("actorUserId", "createdAt");

-- CreateIndex
CREATE INDEX "ProjectLeadDeletionTombstone_projectId_createdAt_idx" ON "ProjectLeadDeletionTombstone"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "ProjectLeadDeletionTombstone_deletedByUserId_createdAt_idx" ON "ProjectLeadDeletionTombstone"("deletedByUserId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectInvite_selector_key" ON "ProjectInvite"("selector");

-- CreateIndex
CREATE INDEX "ProjectInvite_projectId_email_status_idx" ON "ProjectInvite"("projectId", "email", "status");

-- CreateIndex
CREATE INDEX "ProjectInvite_invitedByPortalUserId_createdAt_idx" ON "ProjectInvite"("invitedByPortalUserId", "createdAt");

-- CreateIndex
CREATE INDEX "ProjectInvite_acceptedByPortalUserId_createdAt_idx" ON "ProjectInvite"("acceptedByPortalUserId", "createdAt");

-- AddForeignKey
ALTER TABLE "ProjectLead" ADD CONSTRAINT "ProjectLead_hiddenByPortalUserId_fkey" FOREIGN KEY ("hiddenByPortalUserId") REFERENCES "PortalUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectLead" ADD CONSTRAINT "ProjectLead_lastRestoredByPortalUserId_fkey" FOREIGN KEY ("lastRestoredByPortalUserId") REFERENCES "PortalUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectLeadAuditEvent" ADD CONSTRAINT "ProjectLeadAuditEvent_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectLeadAuditEvent" ADD CONSTRAINT "ProjectLeadAuditEvent_projectLeadId_fkey" FOREIGN KEY ("projectLeadId") REFERENCES "ProjectLead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectLeadAuditEvent" ADD CONSTRAINT "ProjectLeadAuditEvent_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "PortalUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectLeadDeletionTombstone" ADD CONSTRAINT "ProjectLeadDeletionTombstone_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectLeadDeletionTombstone" ADD CONSTRAINT "ProjectLeadDeletionTombstone_deletedByUserId_fkey" FOREIGN KEY ("deletedByUserId") REFERENCES "PortalUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectInvite" ADD CONSTRAINT "ProjectInvite_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectInvite" ADD CONSTRAINT "ProjectInvite_invitedByPortalUserId_fkey" FOREIGN KEY ("invitedByPortalUserId") REFERENCES "PortalUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectInvite" ADD CONSTRAINT "ProjectInvite_acceptedByPortalUserId_fkey" FOREIGN KEY ("acceptedByPortalUserId") REFERENCES "PortalUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
