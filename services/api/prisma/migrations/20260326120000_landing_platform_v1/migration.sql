-- CreateEnum
CREATE TYPE "PortalUserRole" AS ENUM ('PLATFORM_ADMIN', 'PLATFORM_OPERATOR', 'CLIENT');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ProjectMembershipRole" AS ENUM ('OWNER', 'VIEWER');

-- CreateEnum
CREATE TYPE "ProjectSitePublishStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'FAILED');

-- CreateEnum
CREATE TYPE "ProjectDomainStatus" AS ENUM ('PENDING', 'ACTIVE', 'ERROR');

-- CreateEnum
CREATE TYPE "LeadSyncTargetKind" AS ENUM ('GOOGLE_SHEETS');

-- CreateEnum
CREATE TYPE "LeadSyncTargetStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "ProjectLeadSyncStatus" AS ENUM ('PENDING', 'SYNCED', 'FAILED');

-- CreateEnum
CREATE TYPE "ProjectEventType" AS ENUM ('PUBLISH_REQUESTED', 'PUBLISHED', 'PUBLISH_FAILED', 'DOMAIN_ADDED', 'DOMAIN_VERIFIED');

-- AlterTable
ALTER TABLE "PortalUser"
ADD COLUMN "role" "PortalUserRole" NOT NULL DEFAULT 'CLIENT';

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "ProjectStatus" NOT NULL DEFAULT 'DRAFT',
    "publicLeadKey" TEXT NOT NULL,
    "primaryDomain" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectMembership" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "portalUserId" TEXT NOT NULL,
    "role" "ProjectMembershipRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectSite" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "templateKey" TEXT NOT NULL,
    "themeKey" TEXT,
    "publishStatus" "ProjectSitePublishStatus" NOT NULL DEFAULT 'DRAFT',
    "contentConfig" JSONB NOT NULL,
    "formConfig" JSONB,
    "lastPublishedAt" TIMESTAMP(3),
    "latestPreviewPath" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectSite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectDomain" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "siteId" TEXT,
    "host" TEXT NOT NULL,
    "status" "ProjectDomainStatus" NOT NULL DEFAULT 'PENDING',
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "dnsTarget" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectDomain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectLead" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "companyName" TEXT,
    "message" TEXT,
    "consent" BOOLEAN NOT NULL DEFAULT true,
    "payload" JSONB NOT NULL,
    "originHost" TEXT,
    "syncStatus" "ProjectLeadSyncStatus" NOT NULL DEFAULT 'PENDING',
    "syncError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectLead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadSyncTarget" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "kind" "LeadSyncTargetKind" NOT NULL,
    "status" "LeadSyncTargetStatus" NOT NULL DEFAULT 'ACTIVE',
    "label" TEXT,
    "config" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeadSyncTarget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectEvent" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "siteId" TEXT,
    "actorUserId" TEXT,
    "type" "ProjectEventType" NOT NULL,
    "status" TEXT,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortalMagicLink" (
    "id" TEXT NOT NULL,
    "portalUserId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "selector" TEXT NOT NULL,
    "verifierHash" TEXT NOT NULL,
    "redirectPath" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PortalMagicLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortalSession" (
    "id" TEXT NOT NULL,
    "portalUserId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "lastSeenAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PortalSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PortalUser_role_status_idx" ON "PortalUser"("role", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Project_publicLeadKey_key" ON "Project"("publicLeadKey");

-- CreateIndex
CREATE INDEX "Project_status_createdAt_idx" ON "Project"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectMembership_projectId_portalUserId_key" ON "ProjectMembership"("projectId", "portalUserId");

-- CreateIndex
CREATE INDEX "ProjectMembership_portalUserId_role_idx" ON "ProjectMembership"("portalUserId", "role");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectSite_slug_key" ON "ProjectSite"("slug");

-- CreateIndex
CREATE INDEX "ProjectSite_projectId_publishStatus_idx" ON "ProjectSite"("projectId", "publishStatus");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectDomain_host_key" ON "ProjectDomain"("host");

-- CreateIndex
CREATE INDEX "ProjectDomain_projectId_status_idx" ON "ProjectDomain"("projectId", "status");

-- CreateIndex
CREATE INDEX "ProjectLead_projectId_createdAt_idx" ON "ProjectLead"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "ProjectLead_email_createdAt_idx" ON "ProjectLead"("email", "createdAt");

-- CreateIndex
CREATE INDEX "LeadSyncTarget_projectId_status_idx" ON "LeadSyncTarget"("projectId", "status");

-- CreateIndex
CREATE INDEX "ProjectEvent_projectId_type_createdAt_idx" ON "ProjectEvent"("projectId", "type", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PortalMagicLink_selector_key" ON "PortalMagicLink"("selector");

-- CreateIndex
CREATE INDEX "PortalMagicLink_portalUserId_expiresAt_idx" ON "PortalMagicLink"("portalUserId", "expiresAt");

-- CreateIndex
CREATE INDEX "PortalMagicLink_email_expiresAt_idx" ON "PortalMagicLink"("email", "expiresAt");

-- CreateIndex
CREATE INDEX "PortalSession_portalUserId_expiresAt_idx" ON "PortalSession"("portalUserId", "expiresAt");

-- AddForeignKey
ALTER TABLE "ProjectMembership" ADD CONSTRAINT "ProjectMembership_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMembership" ADD CONSTRAINT "ProjectMembership_portalUserId_fkey" FOREIGN KEY ("portalUserId") REFERENCES "PortalUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectSite" ADD CONSTRAINT "ProjectSite_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectDomain" ADD CONSTRAINT "ProjectDomain_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectDomain" ADD CONSTRAINT "ProjectDomain_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "ProjectSite"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectLead" ADD CONSTRAINT "ProjectLead_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadSyncTarget" ADD CONSTRAINT "LeadSyncTarget_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectEvent" ADD CONSTRAINT "ProjectEvent_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectEvent" ADD CONSTRAINT "ProjectEvent_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "ProjectSite"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectEvent" ADD CONSTRAINT "ProjectEvent_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "PortalUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortalMagicLink" ADD CONSTRAINT "PortalMagicLink_portalUserId_fkey" FOREIGN KEY ("portalUserId") REFERENCES "PortalUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortalSession" ADD CONSTRAINT "PortalSession_portalUserId_fkey" FOREIGN KEY ("portalUserId") REFERENCES "PortalUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
