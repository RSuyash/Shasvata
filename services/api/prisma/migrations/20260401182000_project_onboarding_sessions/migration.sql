-- CreateEnum
CREATE TYPE "ProjectOnboardingStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'CONVERTED');

-- AlterEnum
ALTER TYPE "ProjectEventType" ADD VALUE 'ONBOARDING_SUBMITTED';

-- CreateTable
CREATE TABLE "ProjectOnboardingSession" (
    "id" TEXT NOT NULL,
    "portalUserId" TEXT NOT NULL,
    "cartId" TEXT NOT NULL,
    "checkoutSessionId" TEXT,
    "projectId" TEXT,
    "status" "ProjectOnboardingStatus" NOT NULL DEFAULT 'DRAFT',
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "packageSlug" TEXT,
    "packageLabel" TEXT,
    "buyerEmail" TEXT,
    "buyerFullName" TEXT,
    "buyerCompanyName" TEXT,
    "buyerPhone" TEXT,
    "selectedAddonSlugsJson" JSONB,
    "intakeJson" JSONB,
    "lastCompletedStep" TEXT,
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectOnboardingSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectOnboardingSession_cartId_key" ON "ProjectOnboardingSession"("cartId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectOnboardingSession_checkoutSessionId_key" ON "ProjectOnboardingSession"("checkoutSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectOnboardingSession_projectId_key" ON "ProjectOnboardingSession"("projectId");

-- CreateIndex
CREATE INDEX "ProjectOnboardingSession_portalUserId_status_updatedAt_idx" ON "ProjectOnboardingSession"("portalUserId", "status", "updatedAt");

-- CreateIndex
CREATE INDEX "ProjectOnboardingSession_projectId_updatedAt_idx" ON "ProjectOnboardingSession"("projectId", "updatedAt");

-- AddForeignKey
ALTER TABLE "ProjectOnboardingSession" ADD CONSTRAINT "ProjectOnboardingSession_portalUserId_fkey" FOREIGN KEY ("portalUserId") REFERENCES "PortalUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectOnboardingSession" ADD CONSTRAINT "ProjectOnboardingSession_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectOnboardingSession" ADD CONSTRAINT "ProjectOnboardingSession_checkoutSessionId_fkey" FOREIGN KEY ("checkoutSessionId") REFERENCES "CheckoutSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectOnboardingSession" ADD CONSTRAINT "ProjectOnboardingSession_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
