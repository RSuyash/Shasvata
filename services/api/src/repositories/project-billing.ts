import type { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import type {
  BillingCheckoutStateRecord,
  BillingDocumentLinkRecord,
  BillingSnapshotRecord,
  ProjectBillingConfigRecord,
  ProjectBillingContactRecord,
} from "../services/project-billing-types.js";

function mapBillingConfig(
  record: Awaited<ReturnType<typeof prisma.projectBillingConfig.findUnique>>,
): ProjectBillingConfigRecord | null {
  if (!record) {
    return null;
  }

  return {
    id: record.id,
    projectId: record.projectId,
    billingMode: record.billingMode,
    currency: record.currency,
    allowCoupons: record.allowCoupons,
    allowReferral: record.allowReferral,
    allowOperatorOverride: record.allowOperatorOverride,
    defaultDepositPercent: record.defaultDepositPercent,
    defaultPaymentMode: record.defaultPaymentMode,
    erpCustomerId: record.erpCustomerId ?? null,
    commercialOwnerUserId: record.commercialOwnerUserId ?? null,
    billingPhone: record.billingPhone ?? null,
    notes: record.notes ?? null,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

function mapBillingContact(
  record: Awaited<ReturnType<typeof prisma.projectBillingContact.findFirst>>,
): ProjectBillingContactRecord | null {
  if (!record) {
    return null;
  }

  return {
    id: record.id,
    projectId: record.projectId,
    email: record.email,
    label: record.label ?? null,
    isActive: record.isActive,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

function mapBillingSnapshot(
  record: Awaited<ReturnType<typeof prisma.billingSnapshot.findUnique>>,
): BillingSnapshotRecord | null {
  if (!record) {
    return null;
  }

  const snapshotJson = (record.snapshotJson ?? {}) as {
    paymentMode?: "DEPOSIT" | "FULL";
    appliedOfferCodes?: string[];
    issues?: string[];
    lines?: BillingSnapshotRecord["snapshotJson"]["lines"];
    pricingRationale?: Record<string, unknown>;
  };

  return {
    id: record.id,
    projectId: record.projectId,
    cartId: record.cartId ?? null,
    sourceType: record.sourceType,
    status: record.status,
    currency: record.currency,
    subtotalMinor: record.subtotalMinor,
    discountMinor: record.discountMinor,
    totalMinor: record.totalMinor,
    payableTodayMinor: record.payableTodayMinor,
    remainingAfterTodayMinor: record.remainingAfterTodayMinor,
    offerCodeApplied: record.offerCodeApplied ?? null,
    couponCodeApplied: record.couponCodeApplied ?? null,
    referralCodeApplied: record.referralCodeApplied ?? null,
    operatorAdjustmentMinor: record.operatorAdjustmentMinor,
    approvedByUserId: record.approvedByUserId ?? null,
    approvalReason: record.approvalReason ?? null,
    validUntil: record.validUntil ?? null,
    snapshotJson: {
      paymentMode: snapshotJson.paymentMode ?? "DEPOSIT",
      appliedOfferCodes: snapshotJson.appliedOfferCodes ?? [],
      issues: snapshotJson.issues ?? [],
      lines: snapshotJson.lines ?? [],
      pricingRationale: snapshotJson.pricingRationale,
    },
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

function mapBillingDocumentLink(
  record: Awaited<ReturnType<typeof prisma.billingDocumentLink.findUnique>>,
): BillingDocumentLinkRecord | null {
  if (!record) {
    return null;
  }

  return {
    id: record.id,
    billingSnapshotId: record.billingSnapshotId,
    erpQuotationId: record.erpQuotationId ?? null,
    erpSalesOrderId: record.erpSalesOrderId ?? null,
    erpInvoiceId: record.erpInvoiceId ?? null,
    erpPaymentEntryIds: Array.isArray(record.erpPaymentEntryIdsJson)
      ? (record.erpPaymentEntryIdsJson as string[])
      : [],
    quoteRequestId: record.quoteRequestId ?? null,
    checkoutSessionId: record.checkoutSessionId ?? null,
    providerOrderId: record.providerOrderId ?? null,
    paymentSessionId: record.paymentSessionId ?? null,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

function mapCheckoutSession(
  record: Awaited<ReturnType<typeof prisma.checkoutSession.findUnique>>,
): BillingCheckoutStateRecord | null {
  if (!record) {
    return null;
  }

  return {
    id: record.id,
    status: record.status,
    amountMinor: record.amountMinor,
    currency: record.currency,
    paymentSessionId: record.paymentSessionId ?? null,
    providerOrderId: record.providerOrderId ?? null,
    hostedCheckoutUrl: record.hostedCheckoutUrl ?? null,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export function createProjectBillingRepository() {
  return {
    async listCatalogEntries() {
      return prisma.catalogProjection.findMany({
        where: {
          isActive: true,
        },
        orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
      });
    },

    async getProjectBillingConfig(projectId: string) {
      return mapBillingConfig(
        await prisma.projectBillingConfig.findUnique({
          where: { projectId },
        }),
      );
    },

    async upsertProjectBillingConfig(input: {
      projectId: string;
      billingMode: ProjectBillingConfigRecord["billingMode"];
      currency: string;
      allowCoupons: boolean;
      allowReferral: boolean;
      allowOperatorOverride: boolean;
      defaultDepositPercent: number | null;
      defaultPaymentMode: ProjectBillingConfigRecord["defaultPaymentMode"];
      erpCustomerId: string | null;
      commercialOwnerUserId: string | null;
      billingPhone: string | null;
      notes: string | null;
    }) {
      return mapBillingConfig(
        await prisma.projectBillingConfig.upsert({
          where: { projectId: input.projectId },
          create: {
            projectId: input.projectId,
            billingMode: input.billingMode,
            currency: input.currency,
            allowCoupons: input.allowCoupons,
            allowReferral: input.allowReferral,
            allowOperatorOverride: input.allowOperatorOverride,
            defaultDepositPercent: input.defaultDepositPercent,
            defaultPaymentMode: input.defaultPaymentMode,
            erpCustomerId: input.erpCustomerId,
            commercialOwnerUserId: input.commercialOwnerUserId,
            billingPhone: input.billingPhone,
            notes: input.notes,
          },
          update: {
            billingMode: input.billingMode,
            currency: input.currency,
            allowCoupons: input.allowCoupons,
            allowReferral: input.allowReferral,
            allowOperatorOverride: input.allowOperatorOverride,
            defaultDepositPercent: input.defaultDepositPercent,
            defaultPaymentMode: input.defaultPaymentMode,
            erpCustomerId: input.erpCustomerId,
            commercialOwnerUserId: input.commercialOwnerUserId,
            billingPhone: input.billingPhone,
            notes: input.notes,
          },
        }),
      );
    },

    async replaceProjectBillingContacts(input: {
      projectId: string;
      contacts: Array<{ email: string; label?: string | null }>;
    }) {
      await prisma.$transaction([
        prisma.projectBillingContact.deleteMany({
          where: { projectId: input.projectId },
        }),
        ...(input.contacts.length
          ? [
              prisma.projectBillingContact.createMany({
                data: input.contacts.map((contact) => ({
                  projectId: input.projectId,
                  email: contact.email,
                  label: contact.label ?? null,
                  isActive: true,
                })),
              }),
            ]
          : []),
      ]);

      return this.listProjectBillingContacts(input.projectId);
    },

    async listProjectBillingContacts(projectId: string) {
      const records = await prisma.projectBillingContact.findMany({
        where: {
          projectId,
          isActive: true,
        },
        orderBy: [{ createdAt: "asc" }, { email: "asc" }],
      });

      return records
        .map(mapBillingContact)
        .filter((record): record is ProjectBillingContactRecord => Boolean(record));
    },

    async listOfferPolicies(projectId: string) {
      return prisma.commercialOfferPolicy.findMany({
        where: {
          OR: [{ scopeType: "GLOBAL" }, { scopeProjectId: projectId }],
        },
        orderBy: [{ updatedAt: "desc" }, { code: "asc" }],
      });
    },

    async createBillingSnapshot(input: {
      projectId: string;
      cartId?: string | null;
      sourceType: BillingSnapshotRecord["sourceType"];
      status: BillingSnapshotRecord["status"];
      currency: string;
      subtotalMinor: number;
      discountMinor: number;
      totalMinor: number;
      payableTodayMinor: number;
      remainingAfterTodayMinor: number;
      offerCodeApplied?: string | null;
      couponCodeApplied?: string | null;
      referralCodeApplied?: string | null;
      operatorAdjustmentMinor?: number;
      approvedByUserId?: string | null;
      approvalReason?: string | null;
      validUntil?: Date | null;
      snapshotJson: Prisma.InputJsonValue;
    }) {
      return mapBillingSnapshot(
        await prisma.billingSnapshot.create({
          data: {
            projectId: input.projectId,
            cartId: input.cartId ?? null,
            sourceType: input.sourceType,
            status: input.status,
            currency: input.currency,
            subtotalMinor: input.subtotalMinor,
            discountMinor: input.discountMinor,
            totalMinor: input.totalMinor,
            payableTodayMinor: input.payableTodayMinor,
            remainingAfterTodayMinor: input.remainingAfterTodayMinor,
            offerCodeApplied: input.offerCodeApplied ?? null,
            couponCodeApplied: input.couponCodeApplied ?? null,
            referralCodeApplied: input.referralCodeApplied ?? null,
            operatorAdjustmentMinor: input.operatorAdjustmentMinor ?? 0,
            approvedByUserId: input.approvedByUserId ?? null,
            approvalReason: input.approvalReason ?? null,
            validUntil: input.validUntil ?? null,
            snapshotJson: input.snapshotJson,
          },
        }),
      );
    },

    async createActiveBillingSnapshot(input: {
      projectId: string;
      cartId?: string | null;
      sourceType: BillingSnapshotRecord["sourceType"];
      currency: string;
      subtotalMinor: number;
      discountMinor: number;
      totalMinor: number;
      payableTodayMinor: number;
      remainingAfterTodayMinor: number;
      offerCodeApplied?: string | null;
      couponCodeApplied?: string | null;
      referralCodeApplied?: string | null;
      operatorAdjustmentMinor?: number;
      approvedByUserId?: string | null;
      approvalReason?: string | null;
      validUntil?: Date | null;
      snapshotJson: Prisma.InputJsonValue;
    }) {
      return mapBillingSnapshot(
        await prisma.$transaction(async (tx) => {
          await tx.billingSnapshot.updateMany({
            where: {
              projectId: input.projectId,
              status: "ACTIVE",
            },
            data: {
              status: "SUPERSEDED",
            },
          });

          return tx.billingSnapshot.create({
            data: {
              projectId: input.projectId,
              cartId: input.cartId ?? null,
              sourceType: input.sourceType,
              status: "ACTIVE",
              currency: input.currency,
              subtotalMinor: input.subtotalMinor,
              discountMinor: input.discountMinor,
              totalMinor: input.totalMinor,
              payableTodayMinor: input.payableTodayMinor,
              remainingAfterTodayMinor: input.remainingAfterTodayMinor,
              offerCodeApplied: input.offerCodeApplied ?? null,
              couponCodeApplied: input.couponCodeApplied ?? null,
              referralCodeApplied: input.referralCodeApplied ?? null,
              operatorAdjustmentMinor: input.operatorAdjustmentMinor ?? 0,
              approvedByUserId: input.approvedByUserId ?? null,
              approvalReason: input.approvalReason ?? null,
              validUntil: input.validUntil ?? null,
              snapshotJson: input.snapshotJson,
            },
          });
        }),
      );
    },

    async getActiveBillingSnapshot(projectId: string) {
      return mapBillingSnapshot(
        await prisma.billingSnapshot.findFirst({
          where: {
            projectId,
            status: "ACTIVE",
          },
          orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
        }),
      );
    },

    async findBillingSnapshot(input: {
      projectId: string;
      snapshotId: string;
    }) {
      return mapBillingSnapshot(
        await prisma.billingSnapshot.findFirst({
          where: {
            projectId: input.projectId,
            id: input.snapshotId,
          },
        }),
      );
    },
    async updateBillingSnapshot(input: {
      snapshotId: string;
      status?: BillingSnapshotRecord["status"];
      approvalReason?: string | null;
      validUntil?: Date | null;
    }) {
      return mapBillingSnapshot(
        await prisma.billingSnapshot.update({
          where: { id: input.snapshotId },
          data: {
            status: input.status,
            approvalReason: input.approvalReason,
            validUntil: input.validUntil,
          },
        }),
      );
    },

    async getBillingDocumentLinkBySnapshotId(snapshotId: string) {
      return mapBillingDocumentLink(
        await prisma.billingDocumentLink.findUnique({
          where: {
            billingSnapshotId: snapshotId,
          },
        }),
      );
    },

    async upsertBillingDocumentLink(input: {
      billingSnapshotId: string;
      erpQuotationId?: string | null;
      erpSalesOrderId?: string | null;
      erpInvoiceId?: string | null;
      erpPaymentEntryIds?: string[];
      quoteRequestId?: string | null;
      checkoutSessionId?: string | null;
      providerOrderId?: string | null;
      paymentSessionId?: string | null;
    }) {
      return mapBillingDocumentLink(
        await prisma.billingDocumentLink.upsert({
          where: {
            billingSnapshotId: input.billingSnapshotId,
          },
          create: {
            billingSnapshotId: input.billingSnapshotId,
            erpQuotationId: input.erpQuotationId ?? null,
            erpSalesOrderId: input.erpSalesOrderId ?? null,
            erpInvoiceId: input.erpInvoiceId ?? null,
            erpPaymentEntryIdsJson: input.erpPaymentEntryIds ?? [],
            quoteRequestId: input.quoteRequestId ?? null,
            checkoutSessionId: input.checkoutSessionId ?? null,
            providerOrderId: input.providerOrderId ?? null,
            paymentSessionId: input.paymentSessionId ?? null,
          },
          update: {
            erpQuotationId:
              input.erpQuotationId !== undefined ? input.erpQuotationId : undefined,
            erpSalesOrderId:
              input.erpSalesOrderId !== undefined ? input.erpSalesOrderId : undefined,
            erpInvoiceId: input.erpInvoiceId !== undefined ? input.erpInvoiceId : undefined,
            erpPaymentEntryIdsJson:
              input.erpPaymentEntryIds !== undefined ? input.erpPaymentEntryIds : undefined,
            quoteRequestId:
              input.quoteRequestId !== undefined ? input.quoteRequestId : undefined,
            checkoutSessionId:
              input.checkoutSessionId !== undefined ? input.checkoutSessionId : undefined,
            providerOrderId:
              input.providerOrderId !== undefined ? input.providerOrderId : undefined,
            paymentSessionId:
              input.paymentSessionId !== undefined ? input.paymentSessionId : undefined,
          },
        }),
      );
    },

    async getCheckoutSession(checkoutSessionId: string) {
      return mapCheckoutSession(
        await prisma.checkoutSession.findUnique({
          where: { id: checkoutSessionId },
        }),
      );
    },

    async getCartCheckoutIdentity(cartId: string) {
      const cart = await prisma.cart.findUnique({
        where: { id: cartId },
        select: {
          buyerEmail: true,
          buyerFullName: true,
          buyerPhone: true,
        },
      });

      if (!cart) {
        return null;
      }

      return {
        email: cart.buyerEmail ?? null,
        fullName: cart.buyerFullName ?? null,
        phone: cart.buyerPhone ?? null,
      };
    },
  };
}

export type ProjectBillingRepository = ReturnType<typeof createProjectBillingRepository>;
