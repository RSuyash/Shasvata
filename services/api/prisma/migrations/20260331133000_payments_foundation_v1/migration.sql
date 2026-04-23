CREATE TYPE "ProjectBillingMode" AS ENUM ('CATALOG', 'NEGOTIATED', 'PROMO_ACTIVE', 'HYBRID');
CREATE TYPE "ProjectBillingPaymentMode" AS ENUM ('DEPOSIT', 'FULL');
CREATE TYPE "CommercialOfferScopeType" AS ENUM ('GLOBAL', 'PROJECT', 'SKU', 'CLIENT_SEGMENT', 'CHECKOUT');
CREATE TYPE "CommercialOfferDiscountType" AS ENUM ('PERCENT', 'FIXED_MINOR', 'DEPOSIT_OVERRIDE', 'PAY_NOW_INCENTIVE', 'BUNDLE');
CREATE TYPE "CommercialOfferStackingMode" AS ENUM ('EXCLUSIVE', 'STACKABLE', 'BEST_OF');
CREATE TYPE "BillingSnapshotSourceType" AS ENUM ('CART', 'OPERATOR_QUOTE', 'PROMO_PREVIEW', 'PROJECT_PLAN');
CREATE TYPE "BillingSnapshotStatus" AS ENUM ('DRAFT', 'ACTIVE', 'EXPIRED', 'SUPERSEDED', 'SYNCED_TO_ERP');

CREATE TABLE "ProjectBillingConfig" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "billingMode" "ProjectBillingMode" NOT NULL DEFAULT 'HYBRID',
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "allowCoupons" BOOLEAN NOT NULL DEFAULT true,
    "allowReferral" BOOLEAN NOT NULL DEFAULT true,
    "allowOperatorOverride" BOOLEAN NOT NULL DEFAULT true,
    "defaultDepositPercent" INTEGER DEFAULT 50,
    "defaultPaymentMode" "ProjectBillingPaymentMode" NOT NULL DEFAULT 'DEPOSIT',
    "erpCustomerId" TEXT,
    "commercialOwnerUserId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectBillingConfig_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProjectBillingContact" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "label" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectBillingContact_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CommercialOfferPolicy" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "scopeType" "CommercialOfferScopeType" NOT NULL,
    "scopeProjectId" TEXT,
    "discountType" "CommercialOfferDiscountType" NOT NULL,
    "discountValue" INTEGER NOT NULL,
    "couponCode" TEXT,
    "referralCode" TEXT,
    "stackingMode" "CommercialOfferStackingMode" NOT NULL DEFAULT 'EXCLUSIVE',
    "minSubtotalMinor" INTEGER,
    "maxDiscountMinor" INTEGER,
    "validFrom" TIMESTAMP(3),
    "validUntil" TIMESTAMP(3),
    "usageLimit" INTEGER,
    "requiresOperatorApproval" BOOLEAN NOT NULL DEFAULT false,
    "marketingLabel" TEXT,
    "internalReason" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommercialOfferPolicy_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BillingSnapshot" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "cartId" TEXT,
    "sourceType" "BillingSnapshotSourceType" NOT NULL,
    "status" "BillingSnapshotStatus" NOT NULL DEFAULT 'DRAFT',
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "subtotalMinor" INTEGER NOT NULL DEFAULT 0,
    "discountMinor" INTEGER NOT NULL DEFAULT 0,
    "totalMinor" INTEGER NOT NULL DEFAULT 0,
    "payableTodayMinor" INTEGER NOT NULL DEFAULT 0,
    "remainingAfterTodayMinor" INTEGER NOT NULL DEFAULT 0,
    "offerCodeApplied" TEXT,
    "couponCodeApplied" TEXT,
    "referralCodeApplied" TEXT,
    "operatorAdjustmentMinor" INTEGER NOT NULL DEFAULT 0,
    "approvedByUserId" TEXT,
    "approvalReason" TEXT,
    "validUntil" TIMESTAMP(3),
    "snapshotJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BillingSnapshot_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BillingDocumentLink" (
    "id" TEXT NOT NULL,
    "billingSnapshotId" TEXT NOT NULL,
    "erpQuotationId" TEXT,
    "erpSalesOrderId" TEXT,
    "erpInvoiceId" TEXT,
    "erpPaymentEntryIdsJson" JSONB,
    "quoteRequestId" TEXT,
    "checkoutSessionId" TEXT,
    "providerOrderId" TEXT,
    "paymentSessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BillingDocumentLink_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ProjectBillingConfig_projectId_key" ON "ProjectBillingConfig"("projectId");
CREATE INDEX "ProjectBillingConfig_billingMode_updatedAt_idx" ON "ProjectBillingConfig"("billingMode", "updatedAt");

CREATE UNIQUE INDEX "ProjectBillingContact_projectId_email_key" ON "ProjectBillingContact"("projectId", "email");
CREATE INDEX "ProjectBillingContact_projectId_isActive_idx" ON "ProjectBillingContact"("projectId", "isActive");

CREATE UNIQUE INDEX "CommercialOfferPolicy_code_key" ON "CommercialOfferPolicy"("code");
CREATE INDEX "CommercialOfferPolicy_scopeType_isActive_updatedAt_idx" ON "CommercialOfferPolicy"("scopeType", "isActive", "updatedAt");
CREATE INDEX "CommercialOfferPolicy_scopeProjectId_isActive_idx" ON "CommercialOfferPolicy"("scopeProjectId", "isActive");
CREATE INDEX "CommercialOfferPolicy_couponCode_isActive_idx" ON "CommercialOfferPolicy"("couponCode", "isActive");
CREATE INDEX "CommercialOfferPolicy_referralCode_isActive_idx" ON "CommercialOfferPolicy"("referralCode", "isActive");

CREATE INDEX "BillingSnapshot_projectId_status_updatedAt_idx" ON "BillingSnapshot"("projectId", "status", "updatedAt");
CREATE INDEX "BillingSnapshot_projectId_validUntil_idx" ON "BillingSnapshot"("projectId", "validUntil");
CREATE INDEX "BillingSnapshot_cartId_createdAt_idx" ON "BillingSnapshot"("cartId", "createdAt");
CREATE UNIQUE INDEX "BillingSnapshot_projectId_active_key" ON "BillingSnapshot"("projectId") WHERE "status" = 'ACTIVE';

CREATE UNIQUE INDEX "BillingDocumentLink_billingSnapshotId_key" ON "BillingDocumentLink"("billingSnapshotId");
CREATE UNIQUE INDEX "BillingDocumentLink_quoteRequestId_key" ON "BillingDocumentLink"("quoteRequestId");
CREATE UNIQUE INDEX "BillingDocumentLink_checkoutSessionId_key" ON "BillingDocumentLink"("checkoutSessionId");
CREATE INDEX "BillingDocumentLink_erpQuotationId_idx" ON "BillingDocumentLink"("erpQuotationId");
CREATE INDEX "BillingDocumentLink_erpSalesOrderId_idx" ON "BillingDocumentLink"("erpSalesOrderId");
CREATE INDEX "BillingDocumentLink_erpInvoiceId_idx" ON "BillingDocumentLink"("erpInvoiceId");
CREATE INDEX "BillingDocumentLink_providerOrderId_idx" ON "BillingDocumentLink"("providerOrderId");

ALTER TABLE "ProjectBillingConfig"
ADD CONSTRAINT "ProjectBillingConfig_projectId_fkey"
FOREIGN KEY ("projectId") REFERENCES "Project"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "ProjectBillingConfig"
ADD CONSTRAINT "ProjectBillingConfig_commercialOwnerUserId_fkey"
FOREIGN KEY ("commercialOwnerUserId") REFERENCES "PortalUser"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

ALTER TABLE "ProjectBillingContact"
ADD CONSTRAINT "ProjectBillingContact_projectId_fkey"
FOREIGN KEY ("projectId") REFERENCES "Project"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "CommercialOfferPolicy"
ADD CONSTRAINT "CommercialOfferPolicy_scopeProjectId_fkey"
FOREIGN KEY ("scopeProjectId") REFERENCES "Project"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "BillingSnapshot"
ADD CONSTRAINT "BillingSnapshot_projectId_fkey"
FOREIGN KEY ("projectId") REFERENCES "Project"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "BillingSnapshot"
ADD CONSTRAINT "BillingSnapshot_cartId_fkey"
FOREIGN KEY ("cartId") REFERENCES "Cart"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

ALTER TABLE "BillingSnapshot"
ADD CONSTRAINT "BillingSnapshot_approvedByUserId_fkey"
FOREIGN KEY ("approvedByUserId") REFERENCES "PortalUser"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

ALTER TABLE "BillingDocumentLink"
ADD CONSTRAINT "BillingDocumentLink_billingSnapshotId_fkey"
FOREIGN KEY ("billingSnapshotId") REFERENCES "BillingSnapshot"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "BillingDocumentLink"
ADD CONSTRAINT "BillingDocumentLink_quoteRequestId_fkey"
FOREIGN KEY ("quoteRequestId") REFERENCES "QuoteRequest"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

ALTER TABLE "BillingDocumentLink"
ADD CONSTRAINT "BillingDocumentLink_checkoutSessionId_fkey"
FOREIGN KEY ("checkoutSessionId") REFERENCES "CheckoutSession"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;
