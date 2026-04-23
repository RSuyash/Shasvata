-- CreateEnum
CREATE TYPE "LeadSourceKind" AS ENUM ('WEB_FORM', 'MANUAL_ENTRY', 'EVENT_IMPORT', 'CSV_IMPORT', 'META_LEAD_ADS', 'LINKEDIN_LEAD_GEN', 'GOOGLE_ADS');

-- CreateEnum
CREATE TYPE "LeadSourceConnectorStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'NEEDS_AUTH', 'ERROR');

-- CreateEnum
CREATE TYPE "IntegrationCredentialProvider" AS ENUM ('META', 'LINKEDIN', 'GOOGLE_ADS');

-- CreateEnum
CREATE TYPE "IntegrationCredentialStatus" AS ENUM ('ACTIVE', 'NEEDS_AUTH', 'REVOKED', 'ERROR');

-- CreateEnum
CREATE TYPE "LeadImportBatchStatus" AS ENUM ('PENDING', 'IMPORTED', 'PARTIAL', 'FAILED');

-- CreateEnum
CREATE TYPE "InboundLeadEventStatus" AS ENUM ('RECEIVED', 'PROCESSED', 'SKIPPED', 'FAILED');

-- AlterTable
ALTER TABLE "ProjectLead" ADD COLUMN "sourceKind" "LeadSourceKind" NOT NULL DEFAULT 'WEB_FORM',
ADD COLUMN "connectorId" TEXT,
ADD COLUMN "campaignId" TEXT,
ADD COLUMN "importBatchId" TEXT,
ADD COLUMN "externalLeadId" TEXT,
ADD COLUMN "capturedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "IntegrationCredential" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "provider" "IntegrationCredentialProvider" NOT NULL,
    "status" "IntegrationCredentialStatus" NOT NULL DEFAULT 'NEEDS_AUTH',
    "label" TEXT NOT NULL,
    "encryptedPayload" TEXT,
    "keyVersion" TEXT NOT NULL DEFAULT 'v1',
    "scopes" JSONB,
    "expiresAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntegrationCredential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadSourceConnector" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "kind" "LeadSourceKind" NOT NULL,
    "status" "LeadSourceConnectorStatus" NOT NULL DEFAULT 'NEEDS_AUTH',
    "label" TEXT NOT NULL,
    "credentialId" TEXT,
    "externalAccountId" TEXT,
    "config" JSONB,
    "metadata" JSONB,
    "lastCheckedAt" TIMESTAMP(3),
    "lastSyncAt" TIMESTAMP(3),
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeadSourceConnector_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcquisitionAccount" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "connectorId" TEXT,
    "provider" "LeadSourceKind" NOT NULL,
    "externalAccountId" TEXT,
    "name" TEXT NOT NULL,
    "status" TEXT,
    "config" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcquisitionAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcquisitionCampaign" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "connectorId" TEXT,
    "accountId" TEXT,
    "provider" "LeadSourceKind" NOT NULL,
    "externalCampaignId" TEXT,
    "name" TEXT NOT NULL,
    "status" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcquisitionCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadImportBatch" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "connectorId" TEXT,
    "sourceKind" "LeadSourceKind" NOT NULL,
    "status" "LeadImportBatchStatus" NOT NULL DEFAULT 'PENDING',
    "label" TEXT,
    "filename" TEXT,
    "totalRows" INTEGER NOT NULL DEFAULT 0,
    "importedRows" INTEGER NOT NULL DEFAULT 0,
    "failedRows" INTEGER NOT NULL DEFAULT 0,
    "fieldMapping" JSONB,
    "errorSummary" TEXT,
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeadImportBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InboundLeadEvent" (
    "id" TEXT NOT NULL,
    "projectId" TEXT,
    "connectorId" TEXT,
    "provider" "LeadSourceKind" NOT NULL,
    "eventType" TEXT NOT NULL,
    "externalLeadId" TEXT,
    "payload" JSONB NOT NULL,
    "status" "InboundLeadEventStatus" NOT NULL DEFAULT 'RECEIVED',
    "errorMessage" TEXT,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "projectLeadId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InboundLeadEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProjectLead_projectId_sourceKind_createdAt_idx" ON "ProjectLead"("projectId", "sourceKind", "createdAt");

-- CreateIndex
CREATE INDEX "ProjectLead_connectorId_idx" ON "ProjectLead"("connectorId");

-- CreateIndex
CREATE INDEX "ProjectLead_campaignId_idx" ON "ProjectLead"("campaignId");

-- CreateIndex
CREATE INDEX "ProjectLead_importBatchId_idx" ON "ProjectLead"("importBatchId");

-- CreateIndex
CREATE INDEX "ProjectLead_externalLeadId_idx" ON "ProjectLead"("externalLeadId");

-- CreateIndex
CREATE INDEX "IntegrationCredential_projectId_provider_status_idx" ON "IntegrationCredential"("projectId", "provider", "status");

-- CreateIndex
CREATE INDEX "LeadSourceConnector_projectId_kind_status_idx" ON "LeadSourceConnector"("projectId", "kind", "status");

-- CreateIndex
CREATE INDEX "LeadSourceConnector_credentialId_idx" ON "LeadSourceConnector"("credentialId");

-- CreateIndex
CREATE INDEX "AcquisitionAccount_projectId_provider_idx" ON "AcquisitionAccount"("projectId", "provider");

-- CreateIndex
CREATE INDEX "AcquisitionAccount_connectorId_idx" ON "AcquisitionAccount"("connectorId");

-- CreateIndex
CREATE UNIQUE INDEX "AcquisitionAccount_projectId_provider_externalAccountId_key" ON "AcquisitionAccount"("projectId", "provider", "externalAccountId");

-- CreateIndex
CREATE INDEX "AcquisitionCampaign_projectId_provider_idx" ON "AcquisitionCampaign"("projectId", "provider");

-- CreateIndex
CREATE INDEX "AcquisitionCampaign_projectId_utmSource_utmCampaign_idx" ON "AcquisitionCampaign"("projectId", "utmSource", "utmCampaign");

-- CreateIndex
CREATE INDEX "AcquisitionCampaign_connectorId_idx" ON "AcquisitionCampaign"("connectorId");

-- CreateIndex
CREATE INDEX "AcquisitionCampaign_accountId_idx" ON "AcquisitionCampaign"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "AcquisitionCampaign_projectId_provider_externalCampaignId_key" ON "AcquisitionCampaign"("projectId", "provider", "externalCampaignId");

-- CreateIndex
CREATE INDEX "LeadImportBatch_projectId_sourceKind_createdAt_idx" ON "LeadImportBatch"("projectId", "sourceKind", "createdAt");

-- CreateIndex
CREATE INDEX "LeadImportBatch_connectorId_idx" ON "LeadImportBatch"("connectorId");

-- CreateIndex
CREATE INDEX "LeadImportBatch_createdByUserId_idx" ON "LeadImportBatch"("createdByUserId");

-- CreateIndex
CREATE INDEX "InboundLeadEvent_projectId_receivedAt_idx" ON "InboundLeadEvent"("projectId", "receivedAt");

-- CreateIndex
CREATE INDEX "InboundLeadEvent_connectorId_receivedAt_idx" ON "InboundLeadEvent"("connectorId", "receivedAt");

-- CreateIndex
CREATE INDEX "InboundLeadEvent_provider_externalLeadId_idx" ON "InboundLeadEvent"("provider", "externalLeadId");

-- CreateIndex
CREATE INDEX "InboundLeadEvent_status_receivedAt_idx" ON "InboundLeadEvent"("status", "receivedAt");

-- CreateIndex
CREATE INDEX "InboundLeadEvent_projectLeadId_idx" ON "InboundLeadEvent"("projectLeadId");

-- AddForeignKey
ALTER TABLE "ProjectLead" ADD CONSTRAINT "ProjectLead_connectorId_fkey" FOREIGN KEY ("connectorId") REFERENCES "LeadSourceConnector"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectLead" ADD CONSTRAINT "ProjectLead_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "AcquisitionCampaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectLead" ADD CONSTRAINT "ProjectLead_importBatchId_fkey" FOREIGN KEY ("importBatchId") REFERENCES "LeadImportBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrationCredential" ADD CONSTRAINT "IntegrationCredential_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadSourceConnector" ADD CONSTRAINT "LeadSourceConnector_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadSourceConnector" ADD CONSTRAINT "LeadSourceConnector_credentialId_fkey" FOREIGN KEY ("credentialId") REFERENCES "IntegrationCredential"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcquisitionAccount" ADD CONSTRAINT "AcquisitionAccount_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcquisitionAccount" ADD CONSTRAINT "AcquisitionAccount_connectorId_fkey" FOREIGN KEY ("connectorId") REFERENCES "LeadSourceConnector"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcquisitionCampaign" ADD CONSTRAINT "AcquisitionCampaign_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcquisitionCampaign" ADD CONSTRAINT "AcquisitionCampaign_connectorId_fkey" FOREIGN KEY ("connectorId") REFERENCES "LeadSourceConnector"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcquisitionCampaign" ADD CONSTRAINT "AcquisitionCampaign_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "AcquisitionAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadImportBatch" ADD CONSTRAINT "LeadImportBatch_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadImportBatch" ADD CONSTRAINT "LeadImportBatch_connectorId_fkey" FOREIGN KEY ("connectorId") REFERENCES "LeadSourceConnector"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InboundLeadEvent" ADD CONSTRAINT "InboundLeadEvent_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InboundLeadEvent" ADD CONSTRAINT "InboundLeadEvent_connectorId_fkey" FOREIGN KEY ("connectorId") REFERENCES "LeadSourceConnector"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InboundLeadEvent" ADD CONSTRAINT "InboundLeadEvent_projectLeadId_fkey" FOREIGN KEY ("projectLeadId") REFERENCES "ProjectLead"("id") ON DELETE SET NULL ON UPDATE CASCADE;
