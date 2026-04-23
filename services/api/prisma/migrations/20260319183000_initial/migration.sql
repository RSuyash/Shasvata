CREATE TYPE "LeadStatus" AS ENUM ('RECEIVED', 'NOTIFIED', 'NOTIFICATION_FAILED');

CREATE TABLE "LeadSubmission" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "companyName" TEXT NOT NULL,
    "companyType" TEXT NOT NULL,
    "websiteUrl" TEXT,
    "serviceInterest" JSONB NOT NULL,
    "budgetRange" TEXT NOT NULL,
    "timeline" TEXT NOT NULL,
    "problemSummary" TEXT NOT NULL,
    "consent" BOOLEAN NOT NULL DEFAULT true,
    "sourcePage" TEXT,
    "sourceCta" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "payload" JSONB NOT NULL,
    "notificationStatus" "LeadStatus" NOT NULL DEFAULT 'RECEIVED',
    "notificationError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeadSubmission_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "LeadSubmission_leadId_key" ON "LeadSubmission"("leadId");
CREATE INDEX "LeadSubmission_email_idx" ON "LeadSubmission"("email");
CREATE INDEX "LeadSubmission_companyName_idx" ON "LeadSubmission"("companyName");
CREATE INDEX "LeadSubmission_createdAt_idx" ON "LeadSubmission"("createdAt");