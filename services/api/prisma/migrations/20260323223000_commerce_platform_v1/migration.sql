-- CreateEnum
CREATE TYPE "CommerceItemKind" AS ENUM ('PACKAGE', 'ADDON', 'QUOTE_ONLY');

-- CreateEnum
CREATE TYPE "CommerceCheckoutMode" AS ENUM ('INSTANT', 'QUOTE_ONLY');

-- CreateEnum
CREATE TYPE "CommerceBillingModel" AS ENUM ('FULL', 'ADVANCE');

-- CreateEnum
CREATE TYPE "CommerceFlowMode" AS ENUM ('SELF_SERVE', 'QUOTE_REQUEST');

-- CreateEnum
CREATE TYPE "CartStatus" AS ENUM ('ACTIVE', 'QUOTE_REQUESTED', 'CHECKOUT_READY', 'CHECKOUT_PENDING', 'PAID', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "QuoteRequestStatus" AS ENUM ('SUBMITTED', 'ERP_SYNCED', 'PRICED', 'CLOSED');

-- CreateEnum
CREATE TYPE "CheckoutSessionStatus" AS ENUM ('CREATED', 'ACTION_REQUIRED', 'PAID', 'FAILED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('CASHFREE');

-- CreateEnum
CREATE TYPE "CashfreeEnvironment" AS ENUM ('MOCK', 'SANDBOX', 'PRODUCTION');

-- CreateEnum
CREATE TYPE "PaymentAttemptStatus" AS ENUM ('INITIATED', 'PENDING', 'SUCCEEDED', 'FAILED');

-- CreateEnum
CREATE TYPE "WebhookEventStatus" AS ENUM ('RECEIVED', 'VERIFIED', 'REJECTED', 'PROCESSED', 'FAILED');

-- CreateEnum
CREATE TYPE "PortalUserStatus" AS ENUM ('PENDING', 'ACTIVE');

-- CreateEnum
CREATE TYPE "ErpSyncStatus" AS ENUM ('PENDING', 'SYNCED', 'FAILED');

-- CreateTable
CREATE TABLE "PortalUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "fullName" TEXT,
    "companyName" TEXT,
    "phone" TEXT,
    "status" "PortalUserStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PortalUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerLink" (
    "id" TEXT NOT NULL,
    "portalUserId" TEXT NOT NULL,
    "erpCustomerId" TEXT,
    "erpContactId" TEXT,
    "erpPortalUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CatalogProjection" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "itemCode" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "description" TEXT,
    "domain" "ServiceDomain" NOT NULL,
    "categoryLabel" TEXT NOT NULL,
    "kind" "CommerceItemKind" NOT NULL,
    "checkoutMode" "CommerceCheckoutMode" NOT NULL,
    "billingModel" "CommerceBillingModel" NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "basePriceMinor" INTEGER,
    "defaultDepositPercent" INTEGER,
    "addonParentSlug" TEXT,
    "compatiblePackageSlugs" JSONB,
    "portalVisible" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "route" TEXT,
    "deliveryWindow" TEXT,
    "metadata" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CatalogProjection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cart" (
    "id" TEXT NOT NULL,
    "portalUserId" TEXT,
    "status" "CartStatus" NOT NULL DEFAULT 'ACTIVE',
    "flowMode" "CommerceFlowMode" NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "buyerEmail" TEXT,
    "buyerFullName" TEXT,
    "buyerCompanyName" TEXT,
    "buyerPhone" TEXT,
    "couponCode" TEXT,
    "referralCode" TEXT,
    "notes" TEXT,
    "sourcePage" TEXT,
    "sourceCta" TEXT,
    "subtotalMinor" INTEGER NOT NULL DEFAULT 0,
    "discountMinor" INTEGER NOT NULL DEFAULT 0,
    "totalMinor" INTEGER NOT NULL DEFAULT 0,
    "payableTodayMinor" INTEGER NOT NULL DEFAULT 0,
    "remainingAfterTodayMinor" INTEGER NOT NULL DEFAULT 0,
    "pricingSnapshot" JSONB,
    "erpQuotationId" TEXT,
    "erpSalesOrderId" TEXT,
    "erpCustomerId" TEXT,
    "erpSyncStatus" "ErpSyncStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CartItem" (
    "id" TEXT NOT NULL,
    "cartId" TEXT NOT NULL,
    "catalogSlug" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "label" TEXT NOT NULL,
    "itemCode" TEXT NOT NULL,
    "kind" "CommerceItemKind" NOT NULL,
    "checkoutMode" "CommerceCheckoutMode" NOT NULL,
    "billingModel" "CommerceBillingModel" NOT NULL,
    "unitPriceMinor" INTEGER,
    "lineSubtotalMinor" INTEGER NOT NULL DEFAULT 0,
    "lineDiscountMinor" INTEGER NOT NULL DEFAULT 0,
    "lineTotalMinor" INTEGER NOT NULL DEFAULT 0,
    "payableTodayMinor" INTEGER NOT NULL DEFAULT 0,
    "remainingAfterTodayMinor" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CartItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuoteRequest" (
    "id" TEXT NOT NULL,
    "cartId" TEXT NOT NULL,
    "status" "QuoteRequestStatus" NOT NULL DEFAULT 'SUBMITTED',
    "brief" JSONB,
    "sourcePage" TEXT,
    "erpLeadId" TEXT,
    "erpOpportunityId" TEXT,
    "erpQuotationId" TEXT,
    "erpSyncStatus" "ErpSyncStatus" NOT NULL DEFAULT 'PENDING',
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuoteRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CheckoutSession" (
    "id" TEXT NOT NULL,
    "cartId" TEXT NOT NULL,
    "status" "CheckoutSessionStatus" NOT NULL DEFAULT 'CREATED',
    "provider" "PaymentProvider" NOT NULL DEFAULT 'CASHFREE',
    "paymentSessionId" TEXT,
    "providerOrderId" TEXT,
    "hostedCheckoutUrl" TEXT,
    "amountMinor" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "returnUrl" TEXT,
    "cancelUrl" TEXT,
    "expiresAt" TIMESTAMP(3),
    "erpSalesOrderId" TEXT,
    "erpCustomerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CheckoutSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CashfreeOrder" (
    "id" TEXT NOT NULL,
    "checkoutSessionId" TEXT NOT NULL,
    "environment" "CashfreeEnvironment" NOT NULL DEFAULT 'MOCK',
    "cfOrderId" TEXT,
    "requestPayload" JSONB,
    "responsePayload" JSONB,
    "orderStatus" TEXT,
    "paymentSessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CashfreeOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentAttempt" (
    "id" TEXT NOT NULL,
    "checkoutSessionId" TEXT NOT NULL,
    "status" "PaymentAttemptStatus" NOT NULL DEFAULT 'INITIATED',
    "amountMinor" INTEGER NOT NULL,
    "providerPaymentId" TEXT,
    "providerOrderId" TEXT,
    "payload" JSONB,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookEvent" (
    "id" TEXT NOT NULL,
    "provider" "PaymentProvider" NOT NULL DEFAULT 'CASHFREE',
    "externalEventId" TEXT NOT NULL,
    "status" "WebhookEventStatus" NOT NULL DEFAULT 'RECEIVED',
    "signatureValid" BOOLEAN NOT NULL DEFAULT false,
    "headers" JSONB,
    "payload" JSONB,
    "errorMessage" TEXT,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "WebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ErpSyncState" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "status" "ErpSyncStatus" NOT NULL DEFAULT 'PENDING',
    "externalId" TEXT,
    "lastError" TEXT,
    "payload" JSONB,
    "syncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ErpSyncState_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PortalUser_email_key" ON "PortalUser"("email");

-- CreateIndex
CREATE INDEX "PortalUser_status_createdAt_idx" ON "PortalUser"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerLink_portalUserId_key" ON "CustomerLink"("portalUserId");

-- CreateIndex
CREATE UNIQUE INDEX "CatalogProjection_slug_key" ON "CatalogProjection"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "CatalogProjection_itemCode_key" ON "CatalogProjection"("itemCode");

-- CreateIndex
CREATE INDEX "CatalogProjection_domain_kind_sortOrder_idx" ON "CatalogProjection"("domain", "kind", "sortOrder");

-- CreateIndex
CREATE INDEX "CatalogProjection_checkoutMode_isActive_idx" ON "CatalogProjection"("checkoutMode", "isActive");

-- CreateIndex
CREATE INDEX "Cart_status_createdAt_idx" ON "Cart"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Cart_buyerEmail_createdAt_idx" ON "Cart"("buyerEmail", "createdAt");

-- CreateIndex
CREATE INDEX "Cart_portalUserId_status_idx" ON "Cart"("portalUserId", "status");

-- CreateIndex
CREATE INDEX "CartItem_cartId_createdAt_idx" ON "CartItem"("cartId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "QuoteRequest_cartId_key" ON "QuoteRequest"("cartId");

-- CreateIndex
CREATE INDEX "QuoteRequest_status_createdAt_idx" ON "QuoteRequest"("status", "createdAt");

-- CreateIndex
CREATE INDEX "CheckoutSession_cartId_status_createdAt_idx" ON "CheckoutSession"("cartId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "CheckoutSession_providerOrderId_idx" ON "CheckoutSession"("providerOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "CashfreeOrder_checkoutSessionId_key" ON "CashfreeOrder"("checkoutSessionId");

-- CreateIndex
CREATE INDEX "PaymentAttempt_checkoutSessionId_recordedAt_idx" ON "PaymentAttempt"("checkoutSessionId", "recordedAt");

-- CreateIndex
CREATE INDEX "PaymentAttempt_providerPaymentId_idx" ON "PaymentAttempt"("providerPaymentId");

-- CreateIndex
CREATE UNIQUE INDEX "WebhookEvent_externalEventId_key" ON "WebhookEvent"("externalEventId");

-- CreateIndex
CREATE INDEX "WebhookEvent_provider_receivedAt_idx" ON "WebhookEvent"("provider", "receivedAt");

-- CreateIndex
CREATE INDEX "WebhookEvent_status_receivedAt_idx" ON "WebhookEvent"("status", "receivedAt");

-- CreateIndex
CREATE INDEX "ErpSyncState_status_updatedAt_idx" ON "ErpSyncState"("status", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ErpSyncState_entityType_entityId_key" ON "ErpSyncState"("entityType", "entityId");

-- AddForeignKey
ALTER TABLE "CustomerLink" ADD CONSTRAINT "CustomerLink_portalUserId_fkey" FOREIGN KEY ("portalUserId") REFERENCES "PortalUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_portalUserId_fkey" FOREIGN KEY ("portalUserId") REFERENCES "PortalUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteRequest" ADD CONSTRAINT "QuoteRequest_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckoutSession" ADD CONSTRAINT "CheckoutSession_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashfreeOrder" ADD CONSTRAINT "CashfreeOrder_checkoutSessionId_fkey" FOREIGN KEY ("checkoutSessionId") REFERENCES "CheckoutSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentAttempt" ADD CONSTRAINT "PaymentAttempt_checkoutSessionId_fkey" FOREIGN KEY ("checkoutSessionId") REFERENCES "CheckoutSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

