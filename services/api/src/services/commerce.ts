import crypto from "node:crypto";
import {
  Cart,
  CartItem,
  CatalogProjection,
  CheckoutSession,
  CustomerLink,
  PortalUser,
  Prisma,
  QuoteRequest,
} from "@prisma/client/index";
import { prisma } from "../lib/prisma.js";
import {
  calculateCommerceDraft,
  type CommerceCatalogEntry,
  type CommerceDraft,
  type CommerceOffer,
  type CommerceSelection,
} from "../domain/commerce.js";
import {
  commerceCatalogSeeds,
  commerceOfferSeeds,
} from "../data/commerce-catalog.js";
import { CashfreeGatewayError, createCashfreeOrder } from "./cashfree-gateway.js";
import {
  createDraftQuotation,
  createQuoteRequestInErp,
  createSalesOrder,
  recordPaymentEntry,
  upsertPortalCustomer,
} from "./erp.js";
import { verifyCashfreeWebhookSignature } from "./cashfree.js";
import { sendPortalPaymentConfirmationEmail } from "./landing-platform-email.js";

type BuyerInput = {
  email?: string;
  fullName?: string;
  companyName?: string;
  phone?: string;
};

type CartSummary = {
  subtotalMinor: number;
  discountMinor: number;
  totalMinor: number;
  payableTodayMinor: number;
  remainingAfterTodayMinor: number;
};

type SerializedCart = {
  id: string;
  status: string;
  flowMode: string;
  currency: string;
  buyer: BuyerInput;
  couponCode: string | null;
  referralCode: string | null;
  summary: CartSummary;
  lines: Array<{
    slug: string;
    itemCode: string;
    label: string;
    kind: string;
    checkoutMode: string;
    billingModel: string;
    quantity: number;
    unitPriceMinor: number | null;
    lineTotalMinor: number;
    payableTodayMinor: number;
    remainingAfterTodayMinor: number;
  }>;
  appliedOfferCode: string | null;
  issues: string[];
  quoteRequest: {
    id: string;
    status: string;
    erpQuotationId: string | null;
  } | null;
  latestCheckoutSession: {
    id: string;
    status: string;
    providerOrderId: string | null;
    paymentSessionId: string | null;
    amountMinor: number;
  } | null;
  erp: {
    quotationId: string | null;
    salesOrderId: string | null;
    customerId: string | null;
    syncStatus: string;
  };
};

type CartWithRelations = Cart & {
  items: CartItem[];
  quoteRequest: QuoteRequest | null;
  checkoutSessions: Array<
    CheckoutSession & {
      cashfreeOrder?: {
        environment: "MOCK" | "SANDBOX" | "PRODUCTION";
      } | null;
    }
  >;
};

const cartInclude = {
  items: true,
  quoteRequest: true,
  checkoutSessions: {
    orderBy: { createdAt: "desc" },
    include: {
      cashfreeOrder: {
        select: {
          environment: true,
        },
      },
    },
  },
} satisfies Prisma.CartInclude;

export class CommerceServiceError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

function mapCashfreeOrderError(error: unknown): CommerceServiceError | null {
  if (!(error instanceof CashfreeGatewayError)) {
    return null;
  }

  const providerMessage = error.providerMessage?.trim() || "";
  if (/transactions are not enabled/i.test(providerMessage)) {
    return new CommerceServiceError(
      503,
      "Online payment is temporarily unavailable because Cashfree transactions are not enabled on this billing account yet. Please contact Naya to complete payment manually.",
    );
  }

  if (providerMessage) {
    return new CommerceServiceError(
      error.statusCode >= 500 ? 502 : 409,
      `Cashfree checkout could not be started: ${providerMessage}`,
    );
  }

  return new CommerceServiceError(
    error.statusCode >= 500 ? 502 : 409,
    "Cashfree checkout could not be started right now.",
  );
}

function toCatalogEntry(record: CatalogProjection): CommerceCatalogEntry {
  return {
    slug: record.slug,
    itemCode: record.itemCode,
    label: record.label,
    summary: record.summary,
    domain: record.domain,
    categoryLabel: record.categoryLabel,
    kind: record.kind,
    checkoutMode: record.checkoutMode,
    billingModel: record.billingModel,
    currency: record.currency,
    basePriceMinor: record.basePriceMinor,
    defaultDepositPercent: record.defaultDepositPercent,
    addonParentSlug: record.addonParentSlug ?? undefined,
    portalVisible: record.portalVisible,
    isFeatured: record.isFeatured,
    sortOrder: record.sortOrder,
  };
}

function getDraftFromCart(cart: CartWithRelations): CommerceDraft {
  const pricingSnapshot = cart.pricingSnapshot as (CommerceDraft & { appliedOffer?: CommerceOffer | null }) | null;

  if (pricingSnapshot) {
    return {
      ...pricingSnapshot,
      appliedOffer: pricingSnapshot.appliedOffer ?? null,
    };
  }

  return {
    flowMode: cart.flowMode,
    requiresHumanReview: cart.flowMode === "QUOTE_REQUEST",
    issues: [],
    currency: cart.currency,
    lines: cart.items.map((item) => ({
      slug: item.catalogSlug,
      itemCode: item.itemCode,
      label: item.label,
      kind: item.kind,
      checkoutMode: item.checkoutMode,
      billingModel: item.billingModel,
      quantity: item.quantity,
      unitPriceMinor: item.unitPriceMinor,
      lineSubtotalMinor: item.lineSubtotalMinor,
      lineDiscountMinor: item.lineDiscountMinor,
      lineTotalMinor: item.lineTotalMinor,
      payableTodayMinor: item.payableTodayMinor,
      remainingAfterTodayMinor: item.remainingAfterTodayMinor,
    })),
    subtotalMinor: cart.subtotalMinor,
    discountMinor: cart.discountMinor,
    totalMinor: cart.totalMinor,
    payableTodayMinor: cart.payableTodayMinor,
    remainingAfterTodayMinor: cart.remainingAfterTodayMinor,
    appliedOffer: null,
  };
}

function serializeCart(cart: CartWithRelations): SerializedCart {
  const draft = getDraftFromCart(cart);
  const latestCheckoutSession = cart.checkoutSessions[0] ?? null;

  return {
    id: cart.id,
    status: cart.status,
    flowMode: cart.flowMode,
    currency: cart.currency,
    buyer: {
      email: cart.buyerEmail ?? undefined,
      fullName: cart.buyerFullName ?? undefined,
      companyName: cart.buyerCompanyName ?? undefined,
      phone: cart.buyerPhone ?? undefined,
    },
    couponCode: cart.couponCode ?? null,
    referralCode: cart.referralCode ?? null,
    summary: {
      subtotalMinor: cart.subtotalMinor,
      discountMinor: cart.discountMinor,
      totalMinor: cart.totalMinor,
      payableTodayMinor: cart.payableTodayMinor,
      remainingAfterTodayMinor: cart.remainingAfterTodayMinor,
    },
    lines: draft.lines.map((line) => ({
      slug: line.slug,
      itemCode: line.itemCode,
      label: line.label,
      kind: line.kind,
      checkoutMode: line.checkoutMode,
      billingModel: line.billingModel,
      quantity: line.quantity,
      unitPriceMinor: line.unitPriceMinor,
      lineTotalMinor: line.lineTotalMinor,
      payableTodayMinor: line.payableTodayMinor,
      remainingAfterTodayMinor: line.remainingAfterTodayMinor,
    })),
    appliedOfferCode: draft.appliedOffer?.code ?? null,
    issues: draft.issues,
    quoteRequest: cart.quoteRequest
      ? {
          id: cart.quoteRequest.id,
          status: cart.quoteRequest.status,
          erpQuotationId: cart.quoteRequest.erpQuotationId ?? null,
        }
      : null,
    latestCheckoutSession: latestCheckoutSession
      ? {
          id: latestCheckoutSession.id,
          status: latestCheckoutSession.status,
          providerOrderId: latestCheckoutSession.providerOrderId ?? null,
          paymentSessionId: latestCheckoutSession.paymentSessionId ?? null,
          amountMinor: latestCheckoutSession.amountMinor,
        }
      : null,
    erp: {
      quotationId: cart.erpQuotationId ?? null,
      salesOrderId: cart.erpSalesOrderId ?? null,
      customerId: cart.erpCustomerId ?? null,
      syncStatus: cart.erpSyncStatus,
    },
  };
}

async function syncCommerceCatalogSeeds(): Promise<void> {
  await Promise.all(
    commerceCatalogSeeds.map((item) =>
      prisma.catalogProjection.upsert({
        where: { slug: item.slug },
        update: {
          itemCode: item.itemCode,
          label: item.label,
          summary: item.summary,
          description: item.description ?? null,
          domain: item.domain,
          categoryLabel: item.categoryLabel,
          kind: item.kind,
          checkoutMode: item.checkoutMode,
          billingModel: item.billingModel,
          currency: item.currency,
          basePriceMinor: item.basePriceMinor,
          defaultDepositPercent: item.defaultDepositPercent,
          addonParentSlug: item.addonParentSlug ?? null,
          compatiblePackageSlugs: item.compatiblePackageSlugs
            ? toJsonValue(item.compatiblePackageSlugs)
            : Prisma.JsonNull,
          portalVisible: item.portalVisible,
          isFeatured: item.isFeatured,
          route: item.route ?? null,
          deliveryWindow: item.deliveryWindow ?? null,
          metadata: item.metadata ? toJsonValue(item.metadata) : Prisma.JsonNull,
          isActive: true,
          sortOrder: item.sortOrder,
        },
        create: {
          slug: item.slug,
          itemCode: item.itemCode,
          label: item.label,
          summary: item.summary,
          description: item.description ?? null,
          domain: item.domain,
          categoryLabel: item.categoryLabel,
          kind: item.kind,
          checkoutMode: item.checkoutMode,
          billingModel: item.billingModel,
          currency: item.currency,
          basePriceMinor: item.basePriceMinor,
          defaultDepositPercent: item.defaultDepositPercent,
          addonParentSlug: item.addonParentSlug ?? null,
          compatiblePackageSlugs: item.compatiblePackageSlugs
            ? toJsonValue(item.compatiblePackageSlugs)
            : Prisma.JsonNull,
          portalVisible: item.portalVisible,
          isFeatured: item.isFeatured,
          route: item.route ?? null,
          deliveryWindow: item.deliveryWindow ?? null,
          metadata: item.metadata ? toJsonValue(item.metadata) : Prisma.JsonNull,
          isActive: true,
          sortOrder: item.sortOrder,
        },
      }),
    ),
  );
}

async function loadCatalogEntries(): Promise<CommerceCatalogEntry[]> {
  await syncCommerceCatalogSeeds();
  const items = await prisma.catalogProjection.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
  });

  return items.map(toCatalogEntry);
}

async function upsertPortalUser(
  tx: Prisma.TransactionClient,
  buyer: BuyerInput | undefined,
): Promise<(PortalUser & { customerLink: CustomerLink | null }) | null> {
  const email = buyer?.email?.trim().toLowerCase();
  if (!email) {
    return null;
  }

  const portalUser = await tx.portalUser.upsert({
    where: { email },
    update: {
      fullName: buyer?.fullName?.trim() || undefined,
      companyName: buyer?.companyName?.trim() || undefined,
      phone: buyer?.phone?.trim() || undefined,
    },
    create: {
      email,
      fullName: buyer?.fullName?.trim() || undefined,
      companyName: buyer?.companyName?.trim() || undefined,
      phone: buyer?.phone?.trim() || undefined,
    },
    include: { customerLink: true },
  });

  if (!portalUser.customerLink) {
    await tx.customerLink.create({
      data: {
        portalUserId: portalUser.id,
      },
    });

    return tx.portalUser.findUniqueOrThrow({
      where: { id: portalUser.id },
      include: { customerLink: true },
    });
  }

  return portalUser;
}

function toMajorCurrency(amountMinor: number): number {
  return Number((amountMinor / 100).toFixed(2));
}

function toJsonValue(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

function isReusableCheckoutSession(
  session: CartWithRelations["checkoutSessions"][number] | null | undefined,
): boolean {
  if (!session) {
    return false;
  }

  if (session.status !== "CREATED" && session.status !== "ACTION_REQUIRED") {
    return false;
  }

  if (!session.paymentSessionId && !session.hostedCheckoutUrl) {
    return false;
  }

  if (session.expiresAt && session.expiresAt.getTime() <= Date.now()) {
    return false;
  }

  return true;
}

function serializeCheckoutSessionResult(input: {
  session: CartWithRelations["checkoutSessions"][number];
  erp: {
    customerId: string | null;
    quotationId: string | null;
    salesOrderId: string | null;
  };
}): Record<string, unknown> {
  return {
    id: input.session.id,
    status: input.session.status,
    provider: input.session.provider,
    environment: input.session.cashfreeOrder?.environment ?? "MOCK",
    amountMinor: input.session.amountMinor,
    currency: input.session.currency,
    paymentSessionId: input.session.paymentSessionId,
    providerOrderId: input.session.providerOrderId,
    hostedCheckoutUrl: input.session.hostedCheckoutUrl,
    erp: input.erp,
  };
}

function buildCashfreeOrderId(cartId: string): string {
  return `naya_${cartId}_${Date.now().toString(36)}${crypto.randomBytes(3).toString("hex")}`;
}

async function resolveCheckoutBillingEmail(input: {
  project: {
    id: string;
    billingContacts: Array<{
      email: string;
    }>;
    memberships?: Array<{
      role: string;
      portalUser: {
        email: string;
        phone?: string | null;
        fullName?: string | null;
      };
    }>;
  };
}): Promise<string | null> {
  const explicitBillingEmail =
    input.project.billingContacts[0]?.email?.trim().toLowerCase() ?? null;
  if (explicitBillingEmail) {
    return explicitBillingEmail;
  }

  const ownerEmail =
    input.project.memberships
      ?.filter((membership) => membership.role === "OWNER")
      .map((membership) => membership.portalUser.email?.trim().toLowerCase() ?? null)
      .find((email): email is string => Boolean(email)) ?? null;

  if (!ownerEmail) {
    return null;
  }

  await prisma.projectBillingContact.upsert({
    where: {
      projectId_email: {
        projectId: input.project.id,
        email: ownerEmail,
      },
    },
    create: {
      projectId: input.project.id,
      email: ownerEmail,
      label: "Primary billing",
      isActive: true,
    },
    update: {
      label: "Primary billing",
      isActive: true,
    },
  });

  return ownerEmail;
}

function normalizeBuyerPhone(phone: string | null | undefined): string | null {
  const trimmed = phone?.trim();
  if (!trimmed) {
    return null;
  }

  const digits = trimmed.replace(/\D/g, "");
  if (digits.length >= 10 && digits.length <= 15) {
    return digits;
  }

  return trimmed;
}

function resolveCheckoutBillingPhone(input: {
  activeBillingEmail: string;
  project: {
    billingConfig?: {
      billingPhone?: string | null;
    } | null;
    memberships?: Array<{
      role: string;
      portalUser: {
        email: string;
        phone?: string | null;
      };
    }>;
  };
}): string | null {
  const configuredBillingPhone = normalizeBuyerPhone(
    input.project.billingConfig?.billingPhone,
  );
  if (configuredBillingPhone) {
    return configuredBillingPhone;
  }

  const normalizedBillingEmail = input.activeBillingEmail.trim().toLowerCase();
  const memberships = input.project.memberships ?? [];

  const ownerWithMatchingBillingEmail = memberships.find(
    (membership) =>
      membership.role === "OWNER" &&
      membership.portalUser.email?.trim().toLowerCase() === normalizedBillingEmail &&
      Boolean(normalizeBuyerPhone(membership.portalUser.phone)),
  );
  if (ownerWithMatchingBillingEmail) {
    return normalizeBuyerPhone(ownerWithMatchingBillingEmail.portalUser.phone);
  }

  const firstOwnerWithPhone = memberships.find(
    (membership) =>
      membership.role === "OWNER" && Boolean(normalizeBuyerPhone(membership.portalUser.phone)),
  );
  if (firstOwnerWithPhone) {
    return normalizeBuyerPhone(firstOwnerWithPhone.portalUser.phone);
  }

  const billingUserWithPhone = memberships.find(
    (membership) =>
      membership.portalUser.email?.trim().toLowerCase() === normalizedBillingEmail &&
      Boolean(normalizeBuyerPhone(membership.portalUser.phone)),
  );

  return normalizeBuyerPhone(billingUserWithPhone?.portalUser.phone);
}

function resolveCheckoutBillingFullName(input: {
  activeBillingEmail: string;
  project: {
    memberships?: Array<{
      role: string;
      portalUser: {
        email: string;
        fullName?: string | null;
      };
    }>;
  };
}): string | null {
  const normalizedBillingEmail = input.activeBillingEmail.trim().toLowerCase();
  const memberships = input.project.memberships ?? [];

  const ownerWithMatchingBillingEmail = memberships.find(
    (membership) =>
      membership.role === "OWNER" &&
      membership.portalUser.email?.trim().toLowerCase() === normalizedBillingEmail &&
      membership.portalUser.fullName?.trim(),
  );
  if (ownerWithMatchingBillingEmail?.portalUser.fullName?.trim()) {
    return ownerWithMatchingBillingEmail.portalUser.fullName.trim();
  }

  const firstOwnerWithName = memberships.find(
    (membership) => membership.role === "OWNER" && membership.portalUser.fullName?.trim(),
  );
  if (firstOwnerWithName?.portalUser.fullName?.trim()) {
    return firstOwnerWithName.portalUser.fullName.trim();
  }

  const billingUserWithName = memberships.find(
    (membership) =>
      membership.portalUser.email?.trim().toLowerCase() === normalizedBillingEmail &&
      membership.portalUser.fullName?.trim(),
  );

  return billingUserWithName?.portalUser.fullName?.trim() ?? null;
}

export async function getCommerceCatalog(): Promise<{
  items: Array<Record<string, unknown>>;
  offers: CommerceOffer[];
  lastSyncedAt: string | null;
}> {
  await syncCommerceCatalogSeeds();
  const items = await prisma.catalogProjection.findMany({
    where: { isActive: true, portalVisible: true },
    orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
  });

  return {
    items: items.map((item: CatalogProjection) => ({
      slug: item.slug,
      itemCode: item.itemCode,
      label: item.label,
      summary: item.summary,
      description: item.description,
      domain: item.domain,
      categoryLabel: item.categoryLabel,
      kind: item.kind,
      checkoutMode: item.checkoutMode,
      billingModel: item.billingModel,
      currency: item.currency,
      basePriceMinor: item.basePriceMinor,
      defaultDepositPercent: item.defaultDepositPercent,
      addonParentSlug: item.addonParentSlug,
      compatiblePackageSlugs: item.compatiblePackageSlugs,
      route: item.route,
      deliveryWindow: item.deliveryWindow,
      isFeatured: item.isFeatured,
    })),
    offers: commerceOfferSeeds,
    lastSyncedAt: items[0]?.updatedAt.toISOString() ?? null,
  };
}

export async function createCommerceCart(input: {
  selections: CommerceSelection[];
  buyer?: BuyerInput;
  couponCode?: string;
  referralCode?: string;
  notes?: string;
  sourcePage?: string;
  sourceCta?: string;
}): Promise<SerializedCart> {
  const catalog = await loadCatalogEntries();
  const discountCode = input.couponCode || input.referralCode;
  const draft = calculateCommerceDraft({
    catalog,
    offers: commerceOfferSeeds,
    selections: input.selections,
    couponCode: discountCode,
  });

  const cart = await prisma.$transaction(async (tx) => {
    const portalUser = await upsertPortalUser(tx, input.buyer);

    return tx.cart.create({
      data: {
        portalUserId: portalUser?.id,
        status: draft.flowMode === "SELF_SERVE" ? "CHECKOUT_READY" : "ACTIVE",
        flowMode: draft.flowMode,
        currency: draft.currency,
        buyerEmail: input.buyer?.email?.trim().toLowerCase() || null,
        buyerFullName: input.buyer?.fullName?.trim() || null,
        buyerCompanyName: input.buyer?.companyName?.trim() || null,
        buyerPhone: input.buyer?.phone?.trim() || null,
        couponCode: input.couponCode?.trim().toUpperCase() || null,
        referralCode: input.referralCode?.trim().toUpperCase() || null,
        notes: input.notes?.trim() || null,
        sourcePage: input.sourcePage?.trim() || null,
        sourceCta: input.sourceCta?.trim() || null,
        subtotalMinor: draft.subtotalMinor,
        discountMinor: draft.discountMinor,
        totalMinor: draft.totalMinor,
        payableTodayMinor: draft.payableTodayMinor,
        remainingAfterTodayMinor: draft.remainingAfterTodayMinor,
        pricingSnapshot: toJsonValue(draft),
        items: {
          create: draft.lines.map((line) => ({
            catalogSlug: line.slug,
            quantity: line.quantity,
            label: line.label,
            itemCode: line.itemCode,
            kind: line.kind,
            checkoutMode: line.checkoutMode,
            billingModel: line.billingModel,
            unitPriceMinor: line.unitPriceMinor,
            lineSubtotalMinor: line.lineSubtotalMinor,
            lineDiscountMinor: line.lineDiscountMinor,
            lineTotalMinor: line.lineTotalMinor,
            payableTodayMinor: line.payableTodayMinor,
            remainingAfterTodayMinor: line.remainingAfterTodayMinor,
          })),
        },
      },
      include: cartInclude,
    });
  });

  return serializeCart(cart as CartWithRelations);
}

export async function getCommerceCart(cartId: string): Promise<SerializedCart> {
  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    include: cartInclude,
  });

  if (!cart) {
    throw new CommerceServiceError(404, "Cart not found.");
  }

  return serializeCart(cart as CartWithRelations);
}

export async function createQuoteRequest(input: {
  cartId: string;
  brief?: Record<string, unknown>;
  sourcePage?: string;
}): Promise<SerializedCart> {
  const cart = await prisma.cart.findUnique({
    where: { id: input.cartId },
    include: {
      ...cartInclude,
      portalUser: { include: { customerLink: true } },
    },
  });

  if (!cart) {
    throw new CommerceServiceError(404, "Cart not found.");
  }

  if (cart.quoteRequest) {
    return serializeCart(cart as CartWithRelations);
  }

  const buyerEmail = cart.buyerEmail ?? cart.portalUser?.email;
  if (!buyerEmail) {
    throw new CommerceServiceError(400, "Buyer email is required before submitting a quote request.");
  }

  const erpResult = await createQuoteRequestInErp({
    buyer: {
      email: buyerEmail,
      fullName: cart.buyerFullName,
      companyName: cart.buyerCompanyName,
      phone: cart.buyerPhone,
    },
    brief: input.brief ?? null,
    notes: cart.notes,
  });

  const updatedCart = await prisma.$transaction(async (tx) => {
    await tx.quoteRequest.create({
      data: {
        cartId: cart.id,
        brief: input.brief ? toJsonValue(input.brief) : Prisma.JsonNull,
        sourcePage: input.sourcePage ?? cart.sourcePage,
        erpLeadId: erpResult.leadId,
        erpOpportunityId: erpResult.opportunityId,
        erpQuotationId: erpResult.quotationId,
        erpSyncStatus: "SYNCED",
      },
    });

    await tx.erpSyncState.upsert({
      where: {
        entityType_entityId: {
          entityType: "quote_request",
          entityId: cart.id,
        },
      },
      update: {
        status: "SYNCED",
        externalId: erpResult.quotationId,
        payload: toJsonValue(erpResult),
        syncedAt: new Date(),
      },
      create: {
        entityType: "quote_request",
        entityId: cart.id,
        status: "SYNCED",
        externalId: erpResult.quotationId,
        payload: toJsonValue(erpResult),
        syncedAt: new Date(),
      },
    });

    return tx.cart.update({
      where: { id: cart.id },
      data: {
        status: "QUOTE_REQUESTED",
        erpQuotationId: erpResult.quotationId,
        erpSyncStatus: "SYNCED",
      },
      include: cartInclude,
    });
  });

  return serializeCart(updatedCart as CartWithRelations);
}

export async function createCheckoutSession(input: {
  cartId: string;
  returnUrl?: string;
  cancelUrl?: string;
  forceFreshCheckout?: boolean;
}): Promise<Record<string, unknown>> {
  const cart = await prisma.cart.findUnique({
    where: { id: input.cartId },
    include: {
      ...cartInclude,
      portalUser: { include: { customerLink: true } },
    },
  });

  if (!cart) {
    throw new CommerceServiceError(404, "Cart not found.");
  }

  if (cart.flowMode === "QUOTE_REQUEST") {
    throw new CommerceServiceError(409, "Quote-request carts cannot open a payment session.");
  }

  const draft = getDraftFromCart(cart as CartWithRelations);
  const buyerEmail = cart.buyerEmail ?? cart.portalUser?.email;
  const buyerFullName = cart.buyerFullName ?? cart.portalUser?.fullName ?? null;
  const buyerPhone = normalizeBuyerPhone(cart.buyerPhone ?? cart.portalUser?.phone ?? null);
  if (!buyerEmail) {
    throw new CommerceServiceError(400, "Buyer email is required before checkout.");
  }
  if (!buyerPhone) {
    throw new CommerceServiceError(409, "Billing phone is required before checkout.");
  }

  const existingCheckoutSession = cart.checkoutSessions.find((session) =>
    isReusableCheckoutSession(session),
  );
  if (!input.forceFreshCheckout && existingCheckoutSession) {
    return serializeCheckoutSessionResult({
      session: existingCheckoutSession,
      erp: {
        customerId: existingCheckoutSession.erpCustomerId ?? cart.erpCustomerId ?? null,
        quotationId: cart.erpQuotationId ?? null,
        salesOrderId: existingCheckoutSession.erpSalesOrderId ?? cart.erpSalesOrderId ?? null,
      },
    });
  }

  const erpCustomer = await upsertPortalCustomer({
    email: buyerEmail,
    fullName: buyerFullName,
    companyName: cart.buyerCompanyName,
    phone: buyerPhone,
  });

  let cashfreeOrder;
  try {
    cashfreeOrder = await createCashfreeOrder({
      orderId: buildCashfreeOrderId(cart.id),
      amountMinor: cart.payableTodayMinor,
      currency: cart.currency,
      customer: {
        id: erpCustomer.customerId,
        email: buyerEmail,
        phone: buyerPhone,
        name: buyerFullName ?? erpCustomer.customerName,
      },
      returnUrl: input.returnUrl ?? null,
      cancelUrl: input.cancelUrl ?? null,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      note: `Shasvata cart ${cart.id}`,
      tags: {
        cart_id: cart.id,
        flow_mode: cart.flowMode,
      },
    });
  } catch (error) {
    const mappedError = mapCashfreeOrderError(error);
    if (mappedError) {
      throw mappedError;
    }
    throw error;
  }

  const quotation = await createDraftQuotation({
    customerId: erpCustomer.customerId,
    customerName: erpCustomer.customerName,
    currency: cart.currency,
    lineItems: draft.lines
      .filter((line) => line.unitPriceMinor !== null)
      .map((line) => ({
        itemCode: line.itemCode,
        itemName: line.label,
        quantity: line.quantity,
        rate: toMajorCurrency(line.unitPriceMinor ?? 0),
      })),
    notes: cart.notes,
  });

  const salesOrder = await createSalesOrder({
    quotationId: quotation.quotationId,
    customerId: erpCustomer.customerId,
  });

  const session = await prisma.$transaction(async (tx) => {
    if (cart.portalUserId) {
      await tx.customerLink.upsert({
        where: { portalUserId: cart.portalUserId },
        update: {
          erpCustomerId: erpCustomer.customerId,
          erpContactId: erpCustomer.contactId,
          erpPortalUserId: erpCustomer.portalUserId ?? null,
        },
        create: {
          portalUserId: cart.portalUserId,
          erpCustomerId: erpCustomer.customerId,
          erpContactId: erpCustomer.contactId,
          erpPortalUserId: erpCustomer.portalUserId ?? null,
        },
      });
    }

    await tx.erpSyncState.upsert({
      where: {
        entityType_entityId: {
          entityType: "checkout",
          entityId: cart.id,
        },
      },
      update: {
        status: "SYNCED",
        externalId: salesOrder.salesOrderId,
        payload: toJsonValue({
          customerId: erpCustomer.customerId,
          quotationId: quotation.quotationId,
          salesOrderId: salesOrder.salesOrderId,
        }),
        syncedAt: new Date(),
      },
      create: {
        entityType: "checkout",
        entityId: cart.id,
        status: "SYNCED",
        externalId: salesOrder.salesOrderId,
        payload: toJsonValue({
          customerId: erpCustomer.customerId,
          quotationId: quotation.quotationId,
          salesOrderId: salesOrder.salesOrderId,
        }),
        syncedAt: new Date(),
      },
    });

    await tx.cart.update({
      where: { id: cart.id },
      data: {
        status: "CHECKOUT_PENDING",
        erpCustomerId: erpCustomer.customerId,
        erpQuotationId: quotation.quotationId,
        erpSalesOrderId: salesOrder.salesOrderId,
        erpSyncStatus: "SYNCED",
      },
    });

    return tx.checkoutSession.create({
      data: {
        cartId: cart.id,
        status: cashfreeOrder.environment === "MOCK" ? "ACTION_REQUIRED" : "CREATED",
        paymentSessionId: cashfreeOrder.paymentSessionId,
        providerOrderId: cashfreeOrder.providerOrderId,
        hostedCheckoutUrl: cashfreeOrder.hostedCheckoutUrl,
        amountMinor: cart.payableTodayMinor,
        currency: cart.currency,
        returnUrl: input.returnUrl ?? null,
        cancelUrl: input.cancelUrl ?? null,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
        erpSalesOrderId: salesOrder.salesOrderId,
        erpCustomerId: erpCustomer.customerId,
        cashfreeOrder: {
          create: {
            environment: cashfreeOrder.environment,
            cfOrderId: cashfreeOrder.cfOrderId,
            requestPayload: toJsonValue({
              cartId: cart.id,
              amountMinor: cart.payableTodayMinor,
            }),
            responsePayload: toJsonValue(cashfreeOrder.rawResponse),
            orderStatus: "ACTIVE",
            paymentSessionId: cashfreeOrder.paymentSessionId,
          },
        },
        paymentAttempts: {
          create: {
            status: "INITIATED",
            amountMinor: cart.payableTodayMinor,
            providerOrderId: cashfreeOrder.providerOrderId,
            payload: toJsonValue({
              environment: cashfreeOrder.environment,
            }),
          },
        },
      },
    });
  });

  return {
    id: session.id,
    status: session.status,
    provider: session.provider,
    environment: cashfreeOrder.environment,
    amountMinor: session.amountMinor,
    currency: session.currency,
    paymentSessionId: session.paymentSessionId,
    providerOrderId: session.providerOrderId,
    hostedCheckoutUrl: session.hostedCheckoutUrl,
    erp: {
      customerId: erpCustomer.customerId,
      quotationId: quotation.quotationId,
      salesOrderId: salesOrder.salesOrderId,
    },
  };
}

export async function createCheckoutSessionFromBillingSnapshot(input: {
  billingSnapshotId: string;
  returnUrl?: string;
  cancelUrl?: string;
}): Promise<Record<string, unknown>> {
  const snapshot = await prisma.billingSnapshot.findUnique({
    where: { id: input.billingSnapshotId },
    include: {
      project: {
        include: {
          billingConfig: {
            select: {
              billingPhone: true,
            },
          },
          billingContacts: {
            where: {
              isActive: true,
            },
            orderBy: [{ createdAt: "asc" }, { email: "asc" }],
          },
          memberships: {
            include: {
              portalUser: {
                select: {
                  email: true,
                  phone: true,
                  fullName: true,
                },
              },
            },
            orderBy: [{ createdAt: "asc" }],
          },
        },
      },
      documentLink: true,
    },
  });

  if (!snapshot) {
    throw new CommerceServiceError(404, "Billing snapshot not found.");
  }

  if (snapshot.status !== "ACTIVE" && snapshot.status !== "DRAFT") {
    throw new CommerceServiceError(409, "Billing snapshot is not checkout-ready.");
  }

  const activeBillingEmail = await resolveCheckoutBillingEmail({
    project: snapshot.project,
  });
  if (!activeBillingEmail) {
    throw new CommerceServiceError(409, "Billing contact is required before checkout.");
  }

  const snapshotJson = (snapshot.snapshotJson ?? {}) as {
    paymentMode?: "DEPOSIT" | "FULL";
    appliedOfferCodes?: string[];
    issues?: string[];
    lines?: Array<{
      slug: string;
      itemCode: string;
      label: string;
      quantity: number;
      kind: string;
      checkoutMode: string;
      billingModel: string;
      unitPriceMinor: number | null;
      lineSubtotalMinor: number;
      lineDiscountMinor: number;
      lineTotalMinor: number;
      payableTodayMinor: number;
      remainingAfterTodayMinor: number;
    }>;
  };

  let cartId = snapshot.cartId;
  let forceFreshCheckout = false;
  if (!cartId) {
    const activeBillingPhone = resolveCheckoutBillingPhone({
      activeBillingEmail,
      project: snapshot.project,
    });
    const activeBillingFullName = resolveCheckoutBillingFullName({
      activeBillingEmail,
      project: snapshot.project,
    });
    if (!activeBillingPhone) {
      throw new CommerceServiceError(409, "Billing phone is required before checkout.");
    }

    const cart = await prisma.$transaction(async (tx) => {
      const createdCart = await tx.cart.create({
        data: {
          status: "CHECKOUT_READY",
          flowMode: "SELF_SERVE",
          currency: snapshot.currency,
          buyerEmail: activeBillingEmail,
          buyerFullName: activeBillingFullName,
          buyerCompanyName: snapshot.project.clientCompanyName?.trim() || snapshot.project.name,
          buyerPhone: activeBillingPhone,
          couponCode: snapshot.couponCodeApplied ?? null,
          referralCode: snapshot.referralCodeApplied ?? null,
          notes: snapshot.approvalReason ?? null,
          subtotalMinor: snapshot.subtotalMinor,
          discountMinor: snapshot.discountMinor,
          totalMinor: snapshot.totalMinor,
          payableTodayMinor: snapshot.payableTodayMinor,
          remainingAfterTodayMinor: snapshot.remainingAfterTodayMinor,
          pricingSnapshot: toJsonValue({
            flowMode: "SELF_SERVE",
            requiresHumanReview: false,
            issues: snapshotJson.issues ?? [],
            currency: snapshot.currency,
            lines: snapshotJson.lines ?? [],
            subtotalMinor: snapshot.subtotalMinor,
            discountMinor: snapshot.discountMinor,
            totalMinor: snapshot.totalMinor,
            payableTodayMinor: snapshot.payableTodayMinor,
            remainingAfterTodayMinor: snapshot.remainingAfterTodayMinor,
            appliedOffer: snapshot.offerCodeApplied
              ? {
                  code: snapshot.offerCodeApplied,
                  label: snapshot.offerCodeApplied,
                  discountType: "FIXED",
                  discountValue: snapshot.discountMinor,
                  minimumOrderMinor: 0,
                }
              : null,
          }),
          items: {
            create: (snapshotJson.lines ?? []).map((line) => ({
              catalogSlug: line.slug,
              quantity: line.quantity,
              label: line.label,
              itemCode: line.itemCode,
              kind: line.kind as CartItem["kind"],
              checkoutMode: line.checkoutMode as CartItem["checkoutMode"],
              billingModel: line.billingModel as CartItem["billingModel"],
              unitPriceMinor: line.unitPriceMinor,
              lineSubtotalMinor: line.lineSubtotalMinor,
              lineDiscountMinor: line.lineDiscountMinor,
              lineTotalMinor: line.lineTotalMinor,
              payableTodayMinor: line.payableTodayMinor,
              remainingAfterTodayMinor: line.remainingAfterTodayMinor,
            })),
          },
        },
      });

      await tx.billingSnapshot.update({
        where: { id: snapshot.id },
        data: {
          cartId: createdCart.id,
        },
      });

      return createdCart;
    });

    cartId = cart.id;
  } else {
    const activeBillingFullName = resolveCheckoutBillingFullName({
      activeBillingEmail,
      project: snapshot.project,
    });

    const existingCart = await prisma.cart.findUnique({
      where: { id: cartId },
      include: {
        ...cartInclude,
        portalUser: { include: { customerLink: true } },
      },
    });

    if (!existingCart) {
      throw new CommerceServiceError(404, "Cart not found.");
    }

    const activeBillingPhone = resolveCheckoutBillingPhone({
      activeBillingEmail,
      project: snapshot.project,
    });
    const normalizedExistingPhone = normalizeBuyerPhone(existingCart.buyerPhone);
    const effectiveBillingPhone =
      activeBillingPhone ??
      normalizeBuyerPhone(existingCart.portalUser?.phone ?? null) ??
      normalizedExistingPhone;
    if (!effectiveBillingPhone) {
      throw new CommerceServiceError(409, "Billing phone is required before checkout.");
    }

    const needsPhoneHydration = normalizedExistingPhone !== effectiveBillingPhone;
    const needsNameHydration =
      Boolean(activeBillingFullName) &&
      (!existingCart.buyerFullName ||
        existingCart.buyerFullName.trim() !== activeBillingFullName);

    if (needsPhoneHydration || needsNameHydration) {
      await prisma.cart.update({
        where: {
          id: cartId,
        },
        data: {
          ...(needsPhoneHydration ? { buyerPhone: effectiveBillingPhone } : {}),
          ...(needsNameHydration ? { buyerFullName: activeBillingFullName } : {}),
        },
      });
      forceFreshCheckout = true;
    }
  }

  const session = await createCheckoutSession({
    cartId,
    returnUrl: input.returnUrl,
    cancelUrl: input.cancelUrl,
    forceFreshCheckout,
  });

  const sessionErp = (session["erp"] as Record<string, unknown> | undefined) ?? undefined;

  await prisma.billingDocumentLink.upsert({
    where: {
      billingSnapshotId: snapshot.id,
    },
    create: {
      billingSnapshotId: snapshot.id,
      checkoutSessionId: String(session["id"]),
      providerOrderId:
        typeof session["providerOrderId"] === "string" ? session["providerOrderId"] : null,
      paymentSessionId:
        typeof session["paymentSessionId"] === "string" ? session["paymentSessionId"] : null,
      erpQuotationId:
        typeof sessionErp?.["quotationId"] === "string" ? sessionErp["quotationId"] : null,
      erpSalesOrderId:
        typeof sessionErp?.["salesOrderId"] === "string" ? sessionErp["salesOrderId"] : null,
    },
    update: {
      checkoutSessionId: String(session["id"]),
      providerOrderId:
        typeof session["providerOrderId"] === "string" ? session["providerOrderId"] : null,
      paymentSessionId:
        typeof session["paymentSessionId"] === "string" ? session["paymentSessionId"] : null,
      erpQuotationId:
        typeof sessionErp?.["quotationId"] === "string" ? sessionErp["quotationId"] : null,
      erpSalesOrderId:
        typeof sessionErp?.["salesOrderId"] === "string" ? sessionErp["salesOrderId"] : null,
    },
  });

  return session;
}

export async function getCheckoutSession(sessionId: string): Promise<Record<string, unknown>> {
  const session = await prisma.checkoutSession.findUnique({
    where: { id: sessionId },
    include: {
      cashfreeOrder: true,
      paymentAttempts: {
        orderBy: { recordedAt: "desc" },
      },
    },
  });

  if (!session) {
    throw new CommerceServiceError(404, "Checkout session not found.");
  }

  return {
    id: session.id,
    status: session.status,
    amountMinor: session.amountMinor,
    currency: session.currency,
    paymentSessionId: session.paymentSessionId,
    providerOrderId: session.providerOrderId,
    attempts: session.paymentAttempts,
    cashfreeOrder: session.cashfreeOrder,
  };
}

function normalizeHeader(headers: Headers | Record<string, string | string[] | undefined>, key: string): string {
  if (headers instanceof Headers) {
    return headers.get(key) ?? "";
  }

  const value = headers[key];
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function extractExternalEventId(payload: Record<string, unknown>): string {
  const paymentId = String(
    (payload["data"] as Record<string, unknown> | undefined)?.["payment"] &&
      ((payload["data"] as Record<string, unknown>).payment as Record<string, unknown>)["cf_payment_id"],
  );
  const orderId = String(
    (payload["data"] as Record<string, unknown> | undefined)?.["order"] &&
      ((payload["data"] as Record<string, unknown>).order as Record<string, unknown>)["order_id"],
  );
  const eventType = String(payload["type"] ?? payload["event_type"] ?? "unknown");

  return [eventType, paymentId, orderId].filter(Boolean).join(":");
}

function extractProviderOrderId(payload: Record<string, unknown>): string {
  return String(
    ((payload["data"] as Record<string, unknown> | undefined)?.["order"] as Record<string, unknown> | undefined)?.["order_id"] ??
      payload["order_id"] ??
      "",
  );
}

export async function processCashfreeWebhook(input: {
  rawBody: string;
  headers: Headers | Record<string, string | string[] | undefined>;
}): Promise<{ received: true }> {
  const timestamp = normalizeHeader(input.headers, "x-webhook-timestamp");
  const signature = normalizeHeader(input.headers, "x-webhook-signature");
  const secret = process.env["CASHFREE_WEBHOOK_SECRET"];
  const cashfreeMode = process.env["CASHFREE_MODE"]?.toLowerCase() ?? "mock";
  if (!secret && cashfreeMode !== "mock" && process.env["NODE_ENV"] !== "test") {
    throw new CommerceServiceError(
      503,
      "Cashfree webhook secret is not configured.",
    );
  }
  const payload = JSON.parse(input.rawBody) as Record<string, unknown>;
  const externalEventId = extractExternalEventId(payload);
  const effectiveSecret = secret ?? "cashfree_dev_secret";

  const signatureValid = verifyCashfreeWebhookSignature({
    rawBody: input.rawBody,
    secret: effectiveSecret,
    timestamp,
    signature,
  });

  if (signatureValid) {
    const existingEvent = await prisma.webhookEvent.findUnique({
      where: { externalEventId },
    });

    if (existingEvent?.status === "PROCESSED") {
      return { received: true };
    }
  }

  await prisma.webhookEvent.upsert({
    where: { externalEventId },
    update: {
      signatureValid,
      headers: toJsonValue(
        input.headers instanceof Headers ? Object.fromEntries(input.headers.entries()) : input.headers,
      ),
      payload: toJsonValue(payload),
      status: signatureValid ? "VERIFIED" : "REJECTED",
      errorMessage: signatureValid ? null : "Invalid Cashfree signature.",
      processedAt: signatureValid ? null : new Date(),
    },
    create: {
      externalEventId,
      signatureValid,
      headers: toJsonValue(
        input.headers instanceof Headers ? Object.fromEntries(input.headers.entries()) : input.headers,
      ),
      payload: toJsonValue(payload),
      status: signatureValid ? "VERIFIED" : "REJECTED",
      errorMessage: signatureValid ? null : "Invalid Cashfree signature.",
      processedAt: signatureValid ? null : new Date(),
    },
  });

  if (!signatureValid) {
    throw new CommerceServiceError(401, "Invalid Cashfree signature.");
  }

  const providerOrderId = extractProviderOrderId(payload);
  const eventType = String(payload["type"] ?? payload["event_type"] ?? "");
  const session = await prisma.checkoutSession.findFirst({
    where: {
      providerOrderId,
    },
    include: {
      cart: true,
      billingDocumentLinks: {
        include: {
          billingSnapshot: {
            include: {
              project: true,
            },
          },
        },
      },
    },
  });

  if (!session) {
    throw new CommerceServiceError(404, "Checkout session not found for webhook order.");
  }

  if (eventType.includes("SUCCESS") || eventType.includes("PAID")) {
    const paidAt = new Date();
    const paymentId = String(
      ((payload["data"] as Record<string, unknown> | undefined)?.["payment"] as Record<string, unknown> | undefined)?.["cf_payment_id"] ??
        crypto.randomUUID(),
    );

    const paymentEntry = await recordPaymentEntry({
      salesOrderId: session.erpSalesOrderId ?? session.cart.erpSalesOrderId ?? providerOrderId,
      customerId: session.erpCustomerId ?? session.cart.erpCustomerId ?? "ERP-CUSTOMER-UNKNOWN",
      amountMajor: toMajorCurrency(session.amountMinor),
      currency: session.currency,
      referenceId: paymentId,
      note: "Cashfree payment success",
    });

    await prisma.$transaction([
      prisma.paymentAttempt.create({
        data: {
          checkoutSessionId: session.id,
          status: "SUCCEEDED",
          amountMinor: session.amountMinor,
          providerPaymentId: paymentId,
          providerOrderId,
          payload: toJsonValue(payload),
        },
      }),
      prisma.checkoutSession.update({
        where: { id: session.id },
        data: {
          status: "PAID",
        },
      }),
      prisma.cart.update({
        where: { id: session.cartId },
        data: {
          status: "PAID",
        },
      }),
      prisma.erpSyncState.upsert({
        where: {
          entityType_entityId: {
            entityType: "payment",
            entityId: session.id,
          },
        },
        update: {
          status: "SYNCED",
          externalId: paymentEntry.paymentEntryId,
          payload: toJsonValue(payload),
          syncedAt: paidAt,
        },
        create: {
          entityType: "payment",
          entityId: session.id,
          status: "SYNCED",
          externalId: paymentEntry.paymentEntryId,
          payload: toJsonValue(payload),
          syncedAt: paidAt,
        },
      }),
      prisma.webhookEvent.update({
        where: { externalEventId },
        data: {
          status: "PROCESSED",
          processedAt: paidAt,
        },
      }),
    ]);

    const confirmationEmail = session.cart.buyerEmail?.trim().toLowerCase() ?? null;
    const primaryBillingDocumentLink = Array.isArray(session.billingDocumentLinks)
      ? session.billingDocumentLinks[0]
      : null;
    const projectName =
      primaryBillingDocumentLink?.billingSnapshot.project.name ??
      session.cart.buyerCompanyName ??
      "your project";
    const billingUrl =
      session.returnUrl?.trim() ||
      "https://shasvata.com/app/dashboard/billing";

    if (confirmationEmail) {
      try {
        await sendPortalPaymentConfirmationEmail({
          email: confirmationEmail,
          projectName,
          amountMinor: session.amountMinor,
          currency: session.currency,
          billingUrl,
          providerOrderId,
          paidAt,
        });
      } catch (error) {
        console.error("[cashfree-webhook] payment confirmation email failed", {
          sessionId: session.id,
          providerOrderId,
          confirmationEmail,
          error,
        });
      }
    }

    return { received: true };
  }

  await prisma.$transaction([
    prisma.paymentAttempt.create({
      data: {
        checkoutSessionId: session.id,
        status: "FAILED",
        amountMinor: session.amountMinor,
        providerOrderId,
        payload: toJsonValue(payload),
      },
    }),
    prisma.checkoutSession.update({
      where: { id: session.id },
      data: {
        status: "FAILED",
      },
    }),
    prisma.webhookEvent.update({
      where: { externalEventId },
      data: {
        status: "PROCESSED",
        processedAt: new Date(),
      },
    }),
  ]);

  return { received: true };
}

export async function getPortalSummary(email: string): Promise<Record<string, unknown>> {
  const normalizedEmail = email.trim().toLowerCase();
  const portalUser = await prisma.portalUser.findUnique({
    where: { email: normalizedEmail },
    include: {
      customerLink: true,
      carts: {
        include: cartInclude,
        orderBy: { updatedAt: "desc" },
      },
    },
  });

  if (!portalUser) {
    return {
      email: normalizedEmail,
      portalUser: null,
      carts: [],
    };
  }

  return {
    email: normalizedEmail,
    portalUser: {
      id: portalUser.id,
      status: portalUser.status,
      companyName: portalUser.companyName,
      erpCustomerId: portalUser.customerLink?.erpCustomerId ?? null,
    },
    carts: portalUser.carts.map((cart: CartWithRelations) => serializeCart(cart)),
  };
}
