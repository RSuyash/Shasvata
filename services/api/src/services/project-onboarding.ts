type PaidCartRecord = {
  id: string;
  portalUserId: string | null;
  status: string;
  currency: string;
  buyerEmail: string | null;
  buyerFullName: string | null;
  buyerCompanyName: string | null;
  buyerPhone: string | null;
  totalMinor: number;
  payableTodayMinor: number;
  remainingAfterTodayMinor: number;
  items: Array<{
    catalogSlug: string;
    label: string;
    kind: string;
  }>;
  checkoutSessions: Array<{
    id: string;
    status: string;
  }>;
};

type StoredOnboardingSession = {
  id: string;
  portalUserId: string;
  cartId: string;
  checkoutSessionId: string | null;
  projectId: string | null;
  status: "DRAFT" | "SUBMITTED" | "CONVERTED";
  currency: string;
  packageSlug: string | null;
  packageLabel: string | null;
  buyerEmail: string | null;
  buyerFullName: string | null;
  buyerCompanyName: string | null;
  buyerPhone: string | null;
  selectedAddonSlugs: string[];
  intake: Record<string, unknown> | null;
  lastCompletedStep: string | null;
  submittedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  cart: {
    id: string;
    currency: string;
    totalMinor: number;
    payableTodayMinor: number;
    remainingAfterTodayMinor: number;
  };
};

type SubmitOnboardingResult = {
  session: StoredOnboardingSession;
  project: {
    id: string;
    slug: string;
    name: string;
    status: string;
  };
};

export type ProjectOnboardingView = {
  id: string;
  cartId: string;
  checkoutSessionId: string | null;
  projectId: string | null;
  status: "DRAFT" | "SUBMITTED" | "CONVERTED";
  package: {
    slug: string;
    label: string;
  } | null;
  selectedAddons: string[];
  buyer: {
    email: string | null;
    fullName: string | null;
    companyName: string | null;
    phone: string | null;
  };
  summary: {
    currency: string;
    totalMinor: number;
    payableTodayMinor: number;
    remainingAfterTodayMinor: number;
  };
  intake: Record<string, unknown>;
  lastCompletedStep: string | null;
  submittedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProjectOnboardingSubmitResult = {
  session: ProjectOnboardingView;
  project: {
    id: string;
    slug: string;
    name: string;
    status: string;
  };
  projectRoute: string;
};

export type ProjectOnboardingRepository = {
  findPaidCartForPortalUser(input: {
    portalUserId: string;
    cartId: string;
  }): Promise<PaidCartRecord | null>;
  findOnboardingSessionByCartId(
    cartId: string,
  ): Promise<StoredOnboardingSession | null>;
  findOnboardingSessionForPortalUser(input: {
    portalUserId: string;
    sessionId: string;
  }): Promise<StoredOnboardingSession | null>;
  createOnboardingSession(input: {
    portalUserId: string;
    cartId: string;
    checkoutSessionId: string | null;
    currency: string;
    packageSlug: string | null;
    packageLabel: string | null;
    buyerEmail: string | null;
    buyerFullName: string | null;
    buyerCompanyName: string | null;
    buyerPhone: string | null;
    selectedAddonSlugs: string[];
    intake: Record<string, unknown>;
    lastCompletedStep: string;
    createdAt: Date;
  }): Promise<StoredOnboardingSession>;
  updateOnboardingSession(input: {
    sessionId: string;
    intake: Record<string, unknown>;
    lastCompletedStep: string | null;
  }): Promise<StoredOnboardingSession>;
  submitOnboardingSession(input: {
    sessionId: string;
    submittedAt: Date;
    projectName: string;
    projectSlug: string;
    projectDescription: string;
    projectNotes: string;
  }): Promise<SubmitOnboardingResult>;
};

function normalizeProjectSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function mapSessionView(record: StoredOnboardingSession): ProjectOnboardingView {
  return {
    id: record.id,
    cartId: record.cartId,
    checkoutSessionId: record.checkoutSessionId,
    projectId: record.projectId,
    status: record.status,
    package:
      record.packageSlug && record.packageLabel
        ? {
            slug: record.packageSlug,
            label: record.packageLabel,
          }
        : null,
    selectedAddons: record.selectedAddonSlugs,
    buyer: {
      email: record.buyerEmail,
      fullName: record.buyerFullName,
      companyName: record.buyerCompanyName,
      phone: record.buyerPhone,
    },
    summary: {
      currency: record.cart.currency,
      totalMinor: record.cart.totalMinor,
      payableTodayMinor: record.cart.payableTodayMinor,
      remainingAfterTodayMinor: record.cart.remainingAfterTodayMinor,
    },
    intake: record.intake ?? {},
    lastCompletedStep: record.lastCompletedStep,
    submittedAt: record.submittedAt?.toISOString() ?? null,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function buildProjectName(record: StoredOnboardingSession): string {
  const rawName =
    typeof record.intake?.["projectName"] === "string"
      ? record.intake["projectName"]
      : null;

  if (rawName?.trim()) {
    return rawName.trim();
  }

  if (record.buyerCompanyName?.trim()) {
    return `${record.buyerCompanyName.trim()} Landing Page`;
  }

  if (record.packageLabel?.trim()) {
    return `${record.packageLabel.trim()} Project`;
  }

  return `Shasvata Project ${record.cartId.slice(0, 6)}`;
}

function buildProjectDescription(record: StoredOnboardingSession): string {
  const packageLabel = record.packageLabel?.trim() || "Portal package";
  const company = record.buyerCompanyName?.trim() || "the client";
  return `${packageLabel} for ${company}`;
}

function buildProjectNotes(record: StoredOnboardingSession): string {
  const notes: string[] = [];

  if (typeof record.intake?.["launchGoal"] === "string" && record.intake["launchGoal"].trim()) {
    notes.push(record.intake["launchGoal"].trim());
  }

  if (record.selectedAddonSlugs.length) {
    notes.push(`Selected add-ons: ${record.selectedAddonSlugs.join(", ")}`);
  }

  if (record.buyerEmail) {
    notes.push(`Primary buyer: ${record.buyerEmail}`);
  }

  return notes.join("\n");
}

export function createProjectOnboardingService(
  repository: ProjectOnboardingRepository,
  dependencies?: {
    now?: () => Date;
  },
) {
  const now = dependencies?.now ?? (() => new Date());

  return {
    async resolveProjectOnboardingSession(input: {
      portalUserId: string;
      cartId: string;
    }): Promise<ProjectOnboardingView> {
      const cart = await repository.findPaidCartForPortalUser(input);
      if (!cart) {
        throw new Error("A paid cart is required before onboarding can begin.");
      }

      const existing = await repository.findOnboardingSessionByCartId(cart.id);
      if (existing) {
        return mapSessionView(existing);
      }

      const packageItem = cart.items.find((item) => item.kind === "PACKAGE") ?? null;
      const addonSlugs = cart.items
        .filter((item) => item.kind === "ADDON")
        .map((item) => item.catalogSlug);
      const paidCheckout = cart.checkoutSessions.find((session) => session.status === "PAID");

      const created = await repository.createOnboardingSession({
        portalUserId: input.portalUserId,
        cartId: cart.id,
        checkoutSessionId: paidCheckout?.id ?? cart.checkoutSessions[0]?.id ?? null,
        currency: cart.currency,
        packageSlug: packageItem?.catalogSlug ?? null,
        packageLabel: packageItem?.label ?? null,
        buyerEmail: cart.buyerEmail,
        buyerFullName: cart.buyerFullName,
        buyerCompanyName: cart.buyerCompanyName,
        buyerPhone: cart.buyerPhone,
        selectedAddonSlugs: addonSlugs,
        intake: {},
        lastCompletedStep: "overview",
        createdAt: now(),
      });

      return mapSessionView(created);
    },

    async getProjectOnboardingSession(input: {
      portalUserId: string;
      sessionId: string;
    }): Promise<ProjectOnboardingView> {
      const session = await repository.findOnboardingSessionForPortalUser(input);
      if (!session) {
        throw new Error("Onboarding session not found.");
      }

      return mapSessionView(session);
    },

    async saveProjectOnboardingSession(input: {
      portalUserId: string;
      sessionId: string;
      intake: Record<string, unknown>;
      lastCompletedStep?: string | null;
    }): Promise<ProjectOnboardingView> {
      const session = await repository.findOnboardingSessionForPortalUser(input);
      if (!session) {
        throw new Error("Onboarding session not found.");
      }

      if (session.projectId) {
        return mapSessionView(session);
      }

      const updated = await repository.updateOnboardingSession({
        sessionId: input.sessionId,
        intake: input.intake,
        lastCompletedStep: input.lastCompletedStep ?? session.lastCompletedStep,
      });

      return mapSessionView(updated);
    },

    async submitProjectOnboardingSession(input: {
      portalUserId: string;
      sessionId: string;
    }): Promise<ProjectOnboardingSubmitResult> {
      const session = await repository.findOnboardingSessionForPortalUser(input);
      if (!session) {
        throw new Error("Onboarding session not found.");
      }

      if (session.projectId) {
        const projectName = buildProjectName(session);
        const projectSlug = normalizeProjectSlug(projectName);
        return {
          session: mapSessionView(session),
          project: {
            id: session.projectId,
            slug: projectSlug,
            name: projectName,
            status: "ACTIVE",
          },
          projectRoute: `/dashboard/projects/${session.projectId}`,
        };
      }

      const projectName = buildProjectName(session);
      const projectSlug = normalizeProjectSlug(projectName);
      const submitted = await repository.submitOnboardingSession({
        sessionId: input.sessionId,
        submittedAt: now(),
        projectName,
        projectSlug,
        projectDescription: buildProjectDescription(session),
        projectNotes: buildProjectNotes(session),
      });

      return {
        session: mapSessionView(submitted.session),
        project: submitted.project,
        projectRoute: `/dashboard/projects/${submitted.project.id}`,
      };
    },
  };
}
