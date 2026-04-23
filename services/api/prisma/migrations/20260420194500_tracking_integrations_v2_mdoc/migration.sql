ALTER TYPE "LeadSyncTargetKind" ADD VALUE IF NOT EXISTS 'MDOC_PUSH';

ALTER TYPE "ProjectLeadSyncStatus" ADD VALUE IF NOT EXISTS 'PARTIAL';

DO $$
BEGIN
  CREATE TYPE "LeadSyncDeliveryStatus" AS ENUM ('PENDING', 'SYNCED', 'FAILED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "ProjectSite"
ADD COLUMN "googleAdsTagId" TEXT,
ADD COLUMN "googleAdsLeadConversionLabel" TEXT;

CREATE TABLE "LeadSyncDeliveryAttempt" (
    "id" TEXT NOT NULL,
    "projectLeadId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "kind" "LeadSyncTargetKind" NOT NULL,
    "status" "LeadSyncDeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "responseCode" INTEGER,
    "responseBody" TEXT,
    "errorMessage" TEXT,
    "metadata" JSONB,
    "attemptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LeadSyncDeliveryAttempt_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "LeadSyncDeliveryAttempt_projectLeadId_attemptedAt_idx" ON "LeadSyncDeliveryAttempt"("projectLeadId", "attemptedAt");
CREATE INDEX "LeadSyncDeliveryAttempt_projectId_attemptedAt_idx" ON "LeadSyncDeliveryAttempt"("projectId", "attemptedAt");
CREATE INDEX "LeadSyncDeliveryAttempt_targetId_attemptedAt_idx" ON "LeadSyncDeliveryAttempt"("targetId", "attemptedAt");
CREATE INDEX "LeadSyncDeliveryAttempt_status_attemptedAt_idx" ON "LeadSyncDeliveryAttempt"("status", "attemptedAt");

ALTER TABLE "LeadSyncDeliveryAttempt"
ADD CONSTRAINT "LeadSyncDeliveryAttempt_projectLeadId_fkey"
FOREIGN KEY ("projectLeadId") REFERENCES "ProjectLead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LeadSyncDeliveryAttempt"
ADD CONSTRAINT "LeadSyncDeliveryAttempt_projectId_fkey"
FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LeadSyncDeliveryAttempt"
ADD CONSTRAINT "LeadSyncDeliveryAttempt_targetId_fkey"
FOREIGN KEY ("targetId") REFERENCES "LeadSyncTarget"("id") ON DELETE CASCADE ON UPDATE CASCADE;
