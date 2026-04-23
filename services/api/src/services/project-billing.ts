import type { CatalogProjection } from "@prisma/client";
import type { LandingPlatformRepository } from "./landing-platform.js";
import type { ProjectBillingRepository } from "../repositories/project-billing.js";
import type { CommerceCatalogEntry } from "../domain/commerce.js";
import { evaluateBillingPreview } from "./billing-offers.js";
import { buildProjectBillingDetail } from "./billing-projection.js";
import { readErpBillingState } from "./erp-billing-adapter.js";
import { listAccessibleProjects } from "./landing-platform-runtime.js";
import type {
  CreateProjectBillingSnapshotInput,
  ProjectBillingCheckoutIdentityUpdateInput,
  ProjectBillingConfigUpdateInput,
  ProjectBillingConfigView,
  ProjectBillingContactRecord,
  ProjectBillingDetail,
  ProjectBillingPreview,
  ProjectBillingPreviewInput,
  SupersedeProjectBillingSnapshotInput,
  UpdateProjectBillingSnapshotLinkageInput,
  PortfolioBillingDetail,
  PortfolioBillingSummary,
  PortfolioProjectBilling,
} from "./project-billing-types.js";

type BillingAccessRepository = Pick<
  LandingPlatformRepository,
  "assertProjectAccess" | "findProjectById"
>;

function defaultBillingConfig(projectId: string): ProjectBillingConfigView {
  return {
    projectId,
    billingMode: "HYBRID",
    currency: "INR",
    allowCoupons: true,
    allowReferral: true,
    allowOperatorOverride: true,
    defaultDepositPercent: 50,
    defaultPaymentMode: "DEPOSIT",
    erpCustomerId: null,
    commercialOwnerUserId: null,
    checkoutPhone: null,
    notes: null,
    contacts: [],
    activeSnapshotId: null,
  };
}

function mapCatalogEntry(record: CatalogProjection): CommerceCatalogEntry {
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

function toContactView(contacts: ProjectBillingContactRecord[]) {
  return contacts.map((contact) => ({
    email: contact.email,
    label: contact.label,
    status: "ACTIVE" as const,
  }));
}

async function assertProjectAccess(
  accessRepository: BillingAccessRepository,
  input: { portalUserId: string; projectId: string },
) {
  const access = await accessRepository.assertProjectAccess(input);
  if (!access) {
    throw new Error("Project access denied.");
  }

  return access;
}

async function assertOperatorAccess(
  accessRepository: BillingAccessRepository,
  input: { portalUserId: string; projectId: string },
) {
  const access = await assertProjectAccess(accessRepository, input);
  if (
    access.portalUser.role !== "PLATFORM_ADMIN" &&
    access.portalUser.role !== "PLATFORM_OPERATOR"
  ) {
    throw new Error("Operator access required.");
  }

  return access;
}

async function assertBillingEditorAccess(
  accessRepository: BillingAccessRepository,
  input: { portalUserId: string; projectId: string },
) {
  const access = await assertProjectAccess(accessRepository, input);
  const isOperator =
    access.portalUser.role === "PLATFORM_ADMIN" ||
    access.portalUser.role === "PLATFORM_OPERATOR";

  if (!isOperator && access.membershipRole !== "OWNER") {
    throw new Error("Project owner access required.");
  }

  return access;
}

function normalizeBillingPhone(phone: string | null | undefined): string | null {
  const trimmed = phone?.trim() ?? "";
  if (!trimmed) {
    return null;
  }

  const digits = trimmed.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 15) {
    throw new Error("Billing phone must contain 10 to 15 digits.");
  }

  return digits;
}

async function resolveProjectBillingDetail(input: {
  accessRepository: BillingAccessRepository;
  billingRepository: ProjectBillingRepository;
  portalUserId: string;
  projectId: string;
}): Promise<ProjectBillingDetail> {
  const access = await assertProjectAccess(input.accessRepository, {
    portalUserId: input.portalUserId,
    projectId: input.projectId,
  });
  const [config, contacts, snapshot] = await Promise.all([
    input.billingRepository.getProjectBillingConfig(input.projectId),
    input.billingRepository.listProjectBillingContacts(input.projectId),
    input.billingRepository.getActiveBillingSnapshot(input.projectId),
  ]);
  const cartIdentity =
    snapshot?.cartId
      ? await input.billingRepository.getCartCheckoutIdentity(snapshot.cartId)
      : null;
  const documentLink = snapshot
    ? await input.billingRepository.getBillingDocumentLinkBySnapshotId(snapshot.id)
    : null;
  const checkout = documentLink?.checkoutSessionId
    ? await input.billingRepository.getCheckoutSession(documentLink.checkoutSessionId)
    : null;
  const erpState = await readErpBillingState({
    erpCustomerId: config?.erpCustomerId ?? null,
    documentLink,
  });

  return buildProjectBillingDetail({
    projectId: input.projectId,
    projectName: access.project.name,
    currency: snapshot?.currency ?? config?.currency ?? "INR",
    checkoutPhone: cartIdentity?.phone ?? config?.billingPhone ?? null,
    snapshot,
    checkout,
    documentLink,
    erpState,
    contacts: toContactView(contacts),
  });
}

export function createProjectBillingService(
  accessRepository: BillingAccessRepository,
  billingRepository: ProjectBillingRepository,
  dependencies?: {
    now?: () => Date;
  },
) {
  const now = dependencies?.now ?? (() => new Date());

  async function resolveConfigView(projectId: string): Promise<ProjectBillingConfigView> {
    const [config, contacts, activeSnapshot] = await Promise.all([
      billingRepository.getProjectBillingConfig(projectId),
      billingRepository.listProjectBillingContacts(projectId),
      billingRepository.getActiveBillingSnapshot(projectId),
    ]);

    const nextConfig = config
      ? {
          projectId,
          billingMode: config.billingMode,
          currency: config.currency,
          allowCoupons: config.allowCoupons,
          allowReferral: config.allowReferral,
          allowOperatorOverride: config.allowOperatorOverride,
          defaultDepositPercent: config.defaultDepositPercent,
          defaultPaymentMode: config.defaultPaymentMode,
          erpCustomerId: config.erpCustomerId,
          commercialOwnerUserId: config.commercialOwnerUserId,
          checkoutPhone: config.billingPhone,
          notes: config.notes,
          contacts: toContactView(contacts),
          activeSnapshotId: activeSnapshot?.id ?? null,
        }
      : defaultBillingConfig(projectId);

    if (!config) {
      nextConfig.contacts = toContactView(contacts);
      nextConfig.activeSnapshotId = activeSnapshot?.id ?? null;
    }

    return nextConfig;
  }

  async function getPreview(
    projectId: string,
    input: Omit<ProjectBillingPreviewInput, "portalUserId" | "projectId">,
  ): Promise<ProjectBillingPreview> {
    const [config, catalog, policies] = await Promise.all([
      billingRepository.getProjectBillingConfig(projectId),
      billingRepository.listCatalogEntries(),
      billingRepository.listOfferPolicies(projectId),
    ]);

    const effectiveConfig = config
      ? {
          currency: config.currency,
          allowCoupons: config.allowCoupons,
          allowReferral: config.allowReferral,
          allowOperatorOverride: config.allowOperatorOverride,
          defaultDepositPercent: config.defaultDepositPercent,
          defaultPaymentMode: config.defaultPaymentMode,
        }
      : {
          currency: "INR",
          allowCoupons: true,
          allowReferral: true,
          allowOperatorOverride: true,
          defaultDepositPercent: 50,
          defaultPaymentMode: "DEPOSIT" as const,
          billingPhone: null,
        };

    return evaluateBillingPreview({
      config: effectiveConfig,
      catalog: catalog.map(mapCatalogEntry),
      selections: input.selections,
      customLines: input.customLines,
      policies,
      couponCode: input.couponCode,
      referralCode: input.referralCode,
      operatorAdjustmentMinor: input.operatorAdjustmentMinor,
      paymentMode: input.paymentMode,
      projectId,
      now: now(),
    });
  }

  return {
    async getProjectBillingConfig(input: {
      portalUserId: string;
      projectId: string;
    }) {
      await assertOperatorAccess(accessRepository, input);
      return resolveConfigView(input.projectId);
    },

    async updateProjectBillingConfig(input: ProjectBillingConfigUpdateInput) {
      const access = await assertOperatorAccess(accessRepository, input);
      const current = await billingRepository.getProjectBillingConfig(input.projectId);

      const nextConfig = await billingRepository.upsertProjectBillingConfig({
        projectId: input.projectId,
        billingMode: input.billingMode ?? current?.billingMode ?? "HYBRID",
        currency: input.currency ?? current?.currency ?? "INR",
        allowCoupons: input.allowCoupons ?? current?.allowCoupons ?? true,
        allowReferral: input.allowReferral ?? current?.allowReferral ?? true,
        allowOperatorOverride:
          input.allowOperatorOverride ?? current?.allowOperatorOverride ?? true,
        defaultDepositPercent:
          input.defaultDepositPercent !== undefined
            ? input.defaultDepositPercent
            : current?.defaultDepositPercent ?? 50,
        defaultPaymentMode:
          input.defaultPaymentMode ?? current?.defaultPaymentMode ?? "DEPOSIT",
        erpCustomerId:
          input.erpCustomerId !== undefined
            ? input.erpCustomerId
            : current?.erpCustomerId ?? null,
        commercialOwnerUserId:
          input.commercialOwnerUserId !== undefined
            ? input.commercialOwnerUserId
            : current?.commercialOwnerUserId ?? access.portalUser.id,
        billingPhone:
          input.billingPhone !== undefined
            ? normalizeBillingPhone(input.billingPhone)
            : current?.billingPhone ?? null,
        notes: input.notes !== undefined ? input.notes : current?.notes ?? null,
      });

      const contacts =
        input.contacts !== undefined
          ? await billingRepository.replaceProjectBillingContacts({
              projectId: input.projectId,
              contacts: input.contacts.map((contact) => ({
                email: contact.email.trim().toLowerCase(),
                label: contact.label ?? null,
              })),
            })
          : await billingRepository.listProjectBillingContacts(input.projectId);

      const activeSnapshot = await billingRepository.getActiveBillingSnapshot(input.projectId);

      return {
        projectId: input.projectId,
        billingMode: nextConfig?.billingMode ?? "HYBRID",
        currency: nextConfig?.currency ?? "INR",
        allowCoupons: nextConfig?.allowCoupons ?? true,
        allowReferral: nextConfig?.allowReferral ?? true,
        allowOperatorOverride: nextConfig?.allowOperatorOverride ?? true,
        defaultDepositPercent: nextConfig?.defaultDepositPercent ?? 50,
        defaultPaymentMode: nextConfig?.defaultPaymentMode ?? "DEPOSIT",
        erpCustomerId: nextConfig?.erpCustomerId ?? null,
        commercialOwnerUserId: nextConfig?.commercialOwnerUserId ?? null,
        checkoutPhone: nextConfig?.billingPhone ?? null,
        notes: nextConfig?.notes ?? null,
        contacts: toContactView(contacts),
        activeSnapshotId: activeSnapshot?.id ?? null,
      } satisfies ProjectBillingConfigView;
    },

    async updateProjectBillingCheckoutIdentity(
      input: ProjectBillingCheckoutIdentityUpdateInput,
    ) {
      const access = await assertBillingEditorAccess(accessRepository, input);
      const current = await billingRepository.getProjectBillingConfig(input.projectId);

      const nextConfig = await billingRepository.upsertProjectBillingConfig({
        projectId: input.projectId,
        billingMode: current?.billingMode ?? "HYBRID",
        currency: current?.currency ?? "INR",
        allowCoupons: current?.allowCoupons ?? true,
        allowReferral: current?.allowReferral ?? true,
        allowOperatorOverride: current?.allowOperatorOverride ?? true,
        defaultDepositPercent: current?.defaultDepositPercent ?? 50,
        defaultPaymentMode: current?.defaultPaymentMode ?? "DEPOSIT",
        erpCustomerId: current?.erpCustomerId ?? null,
        commercialOwnerUserId: current?.commercialOwnerUserId ?? access.portalUser.id,
        billingPhone: normalizeBillingPhone(input.billingPhone),
        notes: current?.notes ?? null,
      });

      const contacts = await billingRepository.listProjectBillingContacts(input.projectId);
      const activeSnapshot = await billingRepository.getActiveBillingSnapshot(input.projectId);

      return {
        projectId: input.projectId,
        billingMode: nextConfig?.billingMode ?? "HYBRID",
        currency: nextConfig?.currency ?? "INR",
        allowCoupons: nextConfig?.allowCoupons ?? true,
        allowReferral: nextConfig?.allowReferral ?? true,
        allowOperatorOverride: nextConfig?.allowOperatorOverride ?? true,
        defaultDepositPercent: nextConfig?.defaultDepositPercent ?? 50,
        defaultPaymentMode: nextConfig?.defaultPaymentMode ?? "DEPOSIT",
        erpCustomerId: nextConfig?.erpCustomerId ?? null,
        commercialOwnerUserId: nextConfig?.commercialOwnerUserId ?? null,
        checkoutPhone: nextConfig?.billingPhone ?? null,
        notes: nextConfig?.notes ?? null,
        contacts: toContactView(contacts),
        activeSnapshotId: activeSnapshot?.id ?? null,
      } satisfies ProjectBillingConfigView;
    },

    async previewProjectBillingOffer(input: ProjectBillingPreviewInput) {
      await assertOperatorAccess(accessRepository, input);
      return getPreview(input.projectId, input);
    },

    async createProjectBillingSnapshot(input: CreateProjectBillingSnapshotInput) {
      const access = await assertOperatorAccess(accessRepository, input);
      const preview = await getPreview(input.projectId, input);
      const appliedPrimaryCode = preview.appliedOfferCodes[0] ?? null;

      const snapshot = await billingRepository.createActiveBillingSnapshot({
        projectId: input.projectId,
        sourceType: input.sourceType ?? "PROJECT_PLAN",
        currency: preview.currency,
        subtotalMinor: preview.subtotalMinor,
        discountMinor: preview.discountMinor,
        totalMinor: preview.totalMinor,
        payableTodayMinor: preview.payableTodayMinor,
        remainingAfterTodayMinor: preview.remainingAfterTodayMinor,
        offerCodeApplied: appliedPrimaryCode,
        couponCodeApplied: input.couponCode?.trim().toUpperCase() ?? null,
        referralCodeApplied: input.referralCode?.trim().toUpperCase() ?? null,
        operatorAdjustmentMinor: input.operatorAdjustmentMinor ?? 0,
        approvedByUserId: access.portalUser.id,
        approvalReason: input.approvalReason ?? null,
        validUntil: input.validUntil ?? null,
        snapshotJson: {
          paymentMode: preview.paymentMode,
          appliedOfferCodes: preview.appliedOfferCodes,
          issues: preview.issues,
          lines: preview.lines,
          pricingRationale: {
            couponCode: input.couponCode?.trim().toUpperCase() ?? null,
            referralCode: input.referralCode?.trim().toUpperCase() ?? null,
            operatorAdjustmentMinor: input.operatorAdjustmentMinor ?? 0,
          },
        },
      });

      return snapshot;
    },

    async supersedeProjectBillingSnapshot(input: SupersedeProjectBillingSnapshotInput) {
      await assertOperatorAccess(accessRepository, input);
      const snapshot = await billingRepository.findBillingSnapshot({
        projectId: input.projectId,
        snapshotId: input.snapshotId,
      });

      if (!snapshot) {
        throw new Error("Billing snapshot not found.");
      }

      return billingRepository.updateBillingSnapshot({
        snapshotId: input.snapshotId,
        status: "SUPERSEDED",
        approvalReason: input.reason ?? snapshot.approvalReason,
        validUntil: snapshot.validUntil,
      });
    },

    async updateProjectBillingSnapshotLinkage(input: UpdateProjectBillingSnapshotLinkageInput) {
      await assertOperatorAccess(accessRepository, input);
      const snapshot = await billingRepository.findBillingSnapshot({
        projectId: input.projectId,
        snapshotId: input.snapshotId,
      });

      if (!snapshot) {
        throw new Error("Billing snapshot not found.");
      }

      return billingRepository.upsertBillingDocumentLink({
        billingSnapshotId: input.snapshotId,
        erpQuotationId: input.erpQuotationId,
        erpSalesOrderId: input.erpSalesOrderId,
        erpInvoiceId: input.erpInvoiceId,
        erpPaymentEntryIds: input.erpPaymentEntryIds,
        quoteRequestId: input.quoteRequestId,
        checkoutSessionId: input.checkoutSessionId,
        providerOrderId: input.providerOrderId,
        paymentSessionId: input.paymentSessionId,
      });
    },

    async getProjectBillingDetail(input: {
      portalUserId: string;
      projectId: string;
    }): Promise<ProjectBillingDetail> {
      return resolveProjectBillingDetail({
        accessRepository,
        billingRepository,
        ...input,
      });
    },

    async getPortfolioBillingDetail(input: {
      portalUserId: string;
    }): Promise<PortfolioBillingDetail> {
      const projects = await listAccessibleProjects(input.portalUserId);

      async function resolveProjectBilling(project: {
        id: string;
        name: string;
        slug: string;
      }) {
        try {
          const billing = await resolveProjectBillingDetail({
            accessRepository,
            billingRepository,
            portalUserId: input.portalUserId,
            projectId: project.id,
          });

          return {
            projectId: project.id,
            projectName: project.name,
            projectSlug: project.slug,
            billing,
          };
        } catch {
          return null;
        }
      }

      const projectBillingResults = await Promise.allSettled(
        projects.map(resolveProjectBilling),
      );

      const projectBillingList: PortfolioProjectBilling[] = [];
      for (const result of projectBillingResults) {
        if (result.status === "fulfilled" && result.value) {
          projectBillingList.push(result.value);
        }
      }

      projectBillingList.sort((a, b) => {
        const statusOrder: Record<string, number> = {
          READY_TO_PAY: 0,
          PARTIALLY_PAID: 1,
          DRAFT: 2,
          PAID: 3,
          NO_BILLING: 4,
          UNAVAILABLE: 5,
        };
        const orderA = statusOrder[a.billing.status] ?? 99;
        const orderB = statusOrder[b.billing.status] ?? 99;
        if (orderA !== orderB) {
          return orderA - orderB;
        }
        return a.projectName.localeCompare(b.projectName);
      });

      const summary = buildPortfolioSummary(projects.length, projectBillingList);

      return {
        projects: projectBillingList,
        summary,
      };
    },
  };
}

function buildPortfolioSummary(
  totalProjects: number,
  projects: PortfolioProjectBilling[],
): PortfolioBillingSummary {
  const projectsWithBilling = projects.filter(
    (p) => p.billing.status !== "NO_BILLING",
  ).length;

  let totalQuotedMinor = 0;
  let totalPaidMinor = 0;
  let totalDueNowMinor = 0;
  let totalOutstandingMinor = 0;
  const statusBreakdown: Record<string, number> = {};

  for (const project of projects) {
    const billing = project.billing;
    if (billing.activeSnapshot) {
      totalQuotedMinor += billing.activeSnapshot.totalMinor;
      totalDueNowMinor += billing.paymentState.amountDueNowMinor;
      totalOutstandingMinor += billing.paymentState.outstandingMinor;
    }
    totalPaidMinor += billing.paymentState.amountPaidMinor;
    statusBreakdown[billing.status] = (statusBreakdown[billing.status] || 0) + 1;
  }

  return {
    totalProjects,
    projectsWithBilling,
    totalQuotedMinor,
    totalPaidMinor,
    totalDueNowMinor,
    totalOutstandingMinor,
    statusBreakdown,
  };
}

export type ProjectBillingService = ReturnType<typeof createProjectBillingService>;
