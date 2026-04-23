import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import type {
  ProjectOnboardingRepository,
} from "../services/project-onboarding.js";

const onboardingCartSummarySelect = {
  id: true,
  currency: true,
  totalMinor: true,
  payableTodayMinor: true,
  remainingAfterTodayMinor: true,
} satisfies Prisma.CartSelect;

const onboardingSessionInclude = {
  cart: {
    select: onboardingCartSummarySelect,
  },
} satisfies Prisma.ProjectOnboardingSessionInclude;

type ProjectOnboardingSessionRecord = Prisma.ProjectOnboardingSessionGetPayload<{
  include: typeof onboardingSessionInclude;
}>;

const paidCartInclude = {
  items: {
    select: {
      catalogSlug: true,
      label: true,
      kind: true,
    },
  },
  checkoutSessions: {
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      status: true,
    },
  },
} satisfies Prisma.CartInclude;

const submitSessionInclude = {
  cart: {
    include: {
      items: true,
      checkoutSessions: {
        orderBy: {
          createdAt: "desc",
        },
      },
      quoteRequest: true,
    },
  },
} satisfies Prisma.ProjectOnboardingSessionInclude;

type SubmitSessionRecord = Prisma.ProjectOnboardingSessionGetPayload<{
  include: typeof submitSessionInclude;
}>;

function mapSession(
  record: ProjectOnboardingSessionRecord | null,
): Awaited<ReturnType<ProjectOnboardingRepository["findOnboardingSessionByCartId"]>> {
  if (!record) {
    return null;
  }

  const selectedAddonSlugs = Array.isArray(record.selectedAddonSlugsJson)
    ? record.selectedAddonSlugsJson.filter(
        (value): value is string => typeof value === "string" && value.length > 0,
      )
    : [];

  const intake =
    record.intakeJson && typeof record.intakeJson === "object" && !Array.isArray(record.intakeJson)
      ? (record.intakeJson as Record<string, unknown>)
      : {};

  return {
    id: record.id,
    portalUserId: record.portalUserId,
    cartId: record.cartId,
    checkoutSessionId: record.checkoutSessionId ?? null,
    projectId: record.projectId ?? null,
    status: record.status,
    currency: record.currency,
    packageSlug: record.packageSlug ?? null,
    packageLabel: record.packageLabel ?? null,
    buyerEmail: record.buyerEmail ?? null,
    buyerFullName: record.buyerFullName ?? null,
    buyerCompanyName: record.buyerCompanyName ?? null,
    buyerPhone: record.buyerPhone ?? null,
    selectedAddonSlugs,
    intake,
    lastCompletedStep: record.lastCompletedStep ?? null,
    submittedAt: record.submittedAt ?? null,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    cart: {
      id: record.cart.id,
      currency: record.cart.currency,
      totalMinor: record.cart.totalMinor,
      payableTodayMinor: record.cart.payableTodayMinor,
      remainingAfterTodayMinor: record.cart.remainingAfterTodayMinor,
    },
  };
}

function buildPublicLeadKey(projectSlug: string): string {
  const normalized = projectSlug.replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  return `lead_${normalized}`;
}

async function resolveUniqueProjectSlug(
  tx: Prisma.TransactionClient,
  baseSlug: string,
): Promise<string> {
  const normalizedBase = baseSlug.trim().toLowerCase();
  let attempt = normalizedBase;
  let suffix = 2;

  while (true) {
    const existing = await tx.project.findUnique({
      where: { slug: attempt },
      select: { id: true },
    });

    if (!existing) {
      return attempt;
    }

    attempt = `${normalizedBase}-${suffix}`;
    suffix += 1;
  }
}

function extractAppliedOfferCodes(pricingSnapshot: Prisma.JsonValue | null): string[] {
  if (!pricingSnapshot || typeof pricingSnapshot !== "object" || Array.isArray(pricingSnapshot)) {
    return [];
  }

  const value = pricingSnapshot as {
    appliedOffer?: { code?: string | null } | null;
  };
  const code = value.appliedOffer?.code;
  return typeof code === "string" && code.trim() ? [code.trim()] : [];
}

function toSnapshotLines(cart: SubmitSessionRecord["cart"]) {
  return cart.items.map((item) => ({
    slug: item.catalogSlug,
    itemCode: item.itemCode,
    label: item.label,
    kind: item.kind,
    checkoutMode: item.checkoutMode,
    billingModel: item.billingModel,
    quantity: item.quantity,
    unitPriceMinor: item.unitPriceMinor ?? 0,
    lineSubtotalMinor: item.lineSubtotalMinor,
    lineDiscountMinor: item.lineDiscountMinor,
    lineTotalMinor: item.lineTotalMinor,
    payableTodayMinor: item.payableTodayMinor,
    remainingAfterTodayMinor: item.remainingAfterTodayMinor,
  }));
}

function toJsonValue(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

export function createProjectOnboardingRepository(): ProjectOnboardingRepository {
  return {
    async findPaidCartForPortalUser(input) {
      const record = await prisma.cart.findFirst({
        where: {
          id: input.cartId,
          portalUserId: input.portalUserId,
          OR: [
            { status: "PAID" },
            {
              checkoutSessions: {
                some: {
                  status: "PAID",
                },
              },
            },
          ],
        },
        include: paidCartInclude,
      });

      if (!record) {
        return null;
      }

      return {
        id: record.id,
        portalUserId: record.portalUserId,
        status: record.status,
        currency: record.currency,
        buyerEmail: record.buyerEmail ?? null,
        buyerFullName: record.buyerFullName ?? null,
        buyerCompanyName: record.buyerCompanyName ?? null,
        buyerPhone: record.buyerPhone ?? null,
        totalMinor: record.totalMinor,
        payableTodayMinor: record.payableTodayMinor,
        remainingAfterTodayMinor: record.remainingAfterTodayMinor,
        items: record.items.map((item) => ({
          catalogSlug: item.catalogSlug,
          label: item.label,
          kind: item.kind,
        })),
        checkoutSessions: record.checkoutSessions.map((session) => ({
          id: session.id,
          status: session.status,
        })),
      };
    },

    async findOnboardingSessionByCartId(cartId) {
      return mapSession(
        await prisma.projectOnboardingSession.findUnique({
          where: { cartId },
          include: onboardingSessionInclude,
        }),
      );
    },

    async findOnboardingSessionForPortalUser(input) {
      return mapSession(
        await prisma.projectOnboardingSession.findFirst({
          where: {
            id: input.sessionId,
            portalUserId: input.portalUserId,
          },
          include: onboardingSessionInclude,
        }),
      );
    },

    async createOnboardingSession(input) {
      return mapSession(
        await prisma.projectOnboardingSession.create({
          data: {
            portalUserId: input.portalUserId,
            cartId: input.cartId,
            checkoutSessionId: input.checkoutSessionId,
            currency: input.currency,
            packageSlug: input.packageSlug,
            packageLabel: input.packageLabel,
            buyerEmail: input.buyerEmail,
            buyerFullName: input.buyerFullName,
            buyerCompanyName: input.buyerCompanyName,
            buyerPhone: input.buyerPhone,
            selectedAddonSlugsJson: input.selectedAddonSlugs.length
              ? toJsonValue(input.selectedAddonSlugs)
              : Prisma.JsonNull,
            intakeJson: toJsonValue(input.intake),
            lastCompletedStep: input.lastCompletedStep,
            createdAt: input.createdAt,
          },
          include: onboardingSessionInclude,
        }),
      )!;
    },

    async updateOnboardingSession(input) {
      return mapSession(
        await prisma.projectOnboardingSession.update({
          where: { id: input.sessionId },
          data: {
            intakeJson: toJsonValue(input.intake),
            lastCompletedStep: input.lastCompletedStep,
          },
          include: onboardingSessionInclude,
        }),
      )!;
    },

    async submitOnboardingSession(input) {
      return prisma.$transaction(async (tx) => {
        const session = await tx.projectOnboardingSession.findUnique({
          where: { id: input.sessionId },
          include: submitSessionInclude,
        });

        if (!session) {
          throw new Error("Onboarding session not found.");
        }

        const projectSlug = await resolveUniqueProjectSlug(tx, input.projectSlug);
        const paymentMode =
          session.cart.remainingAfterTodayMinor > 0 ? "DEPOSIT" : "FULL";
        const defaultDepositPercent =
          session.cart.totalMinor > 0
            ? Math.round((session.cart.payableTodayMinor / session.cart.totalMinor) * 100)
            : null;

        const project = await tx.project.create({
          data: {
            slug: projectSlug,
            name: input.projectName,
            description: input.projectDescription,
            clientCompanyName: session.buyerCompanyName ?? null,
            status: "ACTIVE",
            publicLeadKey: buildPublicLeadKey(projectSlug),
            notes: input.projectNotes || null,
            memberships: {
              create: {
                portalUserId: session.portalUserId,
                role: "OWNER",
              },
            },
            sites: {
              create: {
                slug: projectSlug,
                templateKey: session.packageSlug ?? "landing-page-self-serve-v1",
                runtimeProfile: "STATIC_ARTIFACT",
                operatorNotes: "Submitted through the self-serve onboarding flow.",
                publishStatus: "DRAFT",
                contentConfig: toJsonValue(
                  session.intakeJson && typeof session.intakeJson === "object"
                    ? session.intakeJson
                    : {},
                ),
                formConfig: Prisma.JsonNull,
              },
            },
            billingConfig: {
              create: {
                billingMode: "HYBRID",
                currency: session.currency,
                allowCoupons: true,
                allowReferral: true,
                allowOperatorOverride: true,
                defaultDepositPercent,
                defaultPaymentMode: paymentMode,
                erpCustomerId: session.cart.erpCustomerId ?? null,
              },
            },
            billingContacts: session.buyerEmail
              ? {
                  create: {
                    email: session.buyerEmail,
                    label: "Primary billing",
                    isActive: true,
                  },
                }
              : undefined,
            events: {
              create: {
                actorUserId: session.portalUserId,
                type: "ONBOARDING_SUBMITTED",
                status: "SUBMITTED",
                payload: toJsonValue({
                  onboardingSessionId: session.id,
                  cartId: session.cartId,
                  packageSlug: session.packageSlug,
                  selectedAddonSlugs: session.selectedAddonSlugsJson,
                  intake: session.intakeJson,
                }),
                createdAt: input.submittedAt,
              },
            },
          },
          select: {
            id: true,
            slug: true,
            name: true,
            status: true,
          },
        });

        const snapshot = await tx.billingSnapshot.create({
          data: {
            projectId: project.id,
            cartId: session.cartId,
            sourceType: "CART",
            status: "ACTIVE",
            currency: session.currency,
            subtotalMinor: session.cart.subtotalMinor,
            discountMinor: session.cart.discountMinor,
            totalMinor: session.cart.totalMinor,
            payableTodayMinor: session.cart.payableTodayMinor,
            remainingAfterTodayMinor: session.cart.remainingAfterTodayMinor,
            offerCodeApplied: extractAppliedOfferCodes(session.cart.pricingSnapshot)[0] ?? null,
            couponCodeApplied: session.cart.couponCode ?? null,
            referralCodeApplied: session.cart.referralCode ?? null,
            operatorAdjustmentMinor: 0,
            snapshotJson: toJsonValue({
              paymentMode,
              appliedOfferCodes: extractAppliedOfferCodes(session.cart.pricingSnapshot),
              issues: [],
              lines: toSnapshotLines(session.cart),
              pricingRationale: {
                source: "PROJECT_ONBOARDING_SUBMIT",
                onboardingSessionId: session.id,
                cartId: session.cartId,
              },
            }),
          },
        });

        const checkoutSession =
          (session.checkoutSessionId
            ? session.cart.checkoutSessions.find(
                (record) => record.id === session.checkoutSessionId,
              )
            : null) ??
          session.cart.checkoutSessions.find((record) => record.status === "PAID") ??
          null;

        await tx.billingDocumentLink.create({
          data: {
            billingSnapshotId: snapshot.id,
            erpQuotationId: session.cart.erpQuotationId ?? null,
            erpSalesOrderId:
              checkoutSession?.erpSalesOrderId ?? session.cart.erpSalesOrderId ?? null,
            quoteRequestId: session.cart.quoteRequest?.id ?? null,
            checkoutSessionId: checkoutSession?.id ?? null,
            providerOrderId: checkoutSession?.providerOrderId ?? null,
            paymentSessionId: checkoutSession?.paymentSessionId ?? null,
          },
        });

        const updatedSession = await tx.projectOnboardingSession.update({
          where: { id: session.id },
          data: {
            status: "CONVERTED",
            projectId: project.id,
            submittedAt: input.submittedAt,
          },
          include: onboardingSessionInclude,
        });

        return {
          session: mapSession(updatedSession)!,
          project,
        };
      });
    },
  };
}
