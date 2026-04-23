import { beforeEach, describe, expect, it, vi } from "vitest";
import { createProjectOnboardingService } from "./project-onboarding.js";

function buildPaidCart() {
  return {
    id: "cart_paid",
    portalUserId: "user_client",
    status: "PAID",
    currency: "INR",
    buyerEmail: "client@example.com",
    buyerFullName: "Client Owner",
    buyerCompanyName: "Estate Autopilots",
    buyerPhone: "+919999999999",
    totalMinor: 479700,
    payableTodayMinor: 479700,
    remainingAfterTodayMinor: 0,
    items: [
      {
        catalogSlug: "landing-page-growth",
        label: "Naya Campaign Landing System",
        kind: "PACKAGE",
      },
      {
        catalogSlug: "landing-page-tracking",
        label: "Tracking Setup",
        kind: "ADDON",
      },
    ],
    checkoutSessions: [
      {
        id: "checkout_paid",
        status: "PAID",
      },
    ],
  };
}

function buildSession() {
  return {
    id: "onboarding_1",
    portalUserId: "user_client",
    cartId: "cart_paid",
    checkoutSessionId: "checkout_paid",
    projectId: null,
    status: "DRAFT",
    currency: "INR",
    packageSlug: "landing-page-growth",
    packageLabel: "Naya Campaign Landing System",
    buyerEmail: "client@example.com",
    buyerFullName: "Client Owner",
    buyerCompanyName: "Estate Autopilots",
    buyerPhone: "+919999999999",
    selectedAddonSlugs: ["landing-page-tracking"],
    intake: {
      projectName: "Wagholi Highstreet April Launch",
      launchGoal: "Capture builder-qualified enquiries quickly",
    },
    lastCompletedStep: "content",
    submittedAt: null,
    createdAt: new Date("2026-04-01T10:00:00.000Z"),
    updatedAt: new Date("2026-04-01T10:05:00.000Z"),
    cart: {
      id: "cart_paid",
      currency: "INR",
      totalMinor: 479700,
      payableTodayMinor: 479700,
      remainingAfterTodayMinor: 0,
    },
  };
}

describe("createProjectOnboardingService", () => {
  const repository = {
    findPaidCartForPortalUser: vi.fn(),
    findOnboardingSessionByCartId: vi.fn(),
    findOnboardingSessionForPortalUser: vi.fn(),
    createOnboardingSession: vi.fn(),
    updateOnboardingSession: vi.fn(),
    submitOnboardingSession: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates an onboarding session from a paid self-serve cart and reuses the paid checkout context", async () => {
    repository.findPaidCartForPortalUser.mockResolvedValue(buildPaidCart());
    repository.findOnboardingSessionByCartId.mockResolvedValue(null);
    repository.createOnboardingSession.mockResolvedValue(buildSession());

    const service = createProjectOnboardingService(repository, {
      now: () => new Date("2026-04-01T10:10:00.000Z"),
    });

    const session = await service.resolveProjectOnboardingSession({
      portalUserId: "user_client",
      cartId: "cart_paid",
    });

    expect(repository.createOnboardingSession).toHaveBeenCalledWith({
      portalUserId: "user_client",
      cartId: "cart_paid",
      checkoutSessionId: "checkout_paid",
      currency: "INR",
      packageSlug: "landing-page-growth",
      packageLabel: "Naya Campaign Landing System",
      buyerEmail: "client@example.com",
      buyerFullName: "Client Owner",
      buyerCompanyName: "Estate Autopilots",
      buyerPhone: "+919999999999",
      selectedAddonSlugs: ["landing-page-tracking"],
      intake: {},
      lastCompletedStep: "overview",
      createdAt: new Date("2026-04-01T10:10:00.000Z"),
    });
    expect(session.package?.slug).toBe("landing-page-growth");
    expect(session.selectedAddons).toEqual(["landing-page-tracking"]);
    expect(session.summary.payableTodayMinor).toBe(479700);
  });

  it("rejects onboarding resolution when payment is not confirmed for the cart", async () => {
    repository.findPaidCartForPortalUser.mockResolvedValue(null);

    const service = createProjectOnboardingService(repository);

    await expect(
      service.resolveProjectOnboardingSession({
        portalUserId: "user_client",
        cartId: "cart_pending",
      }),
    ).rejects.toThrow("A paid cart is required before onboarding can begin.");
  });

  it("creates a real project route when onboarding is submitted", async () => {
    repository.findOnboardingSessionForPortalUser.mockResolvedValue(buildSession());
    repository.submitOnboardingSession.mockResolvedValue({
      session: {
        ...buildSession(),
        status: "CONVERTED",
        projectId: "project_1",
        submittedAt: new Date("2026-04-01T11:00:00.000Z"),
      },
      project: {
        id: "project_1",
        slug: "wagholi-highstreet-april-launch",
        name: "Wagholi Highstreet April Launch",
        status: "ACTIVE",
      },
    });

    const service = createProjectOnboardingService(repository, {
      now: () => new Date("2026-04-01T11:00:00.000Z"),
    });

    const result = await service.submitProjectOnboardingSession({
      portalUserId: "user_client",
      sessionId: "onboarding_1",
    });

    expect(repository.submitOnboardingSession).toHaveBeenCalledWith({
      sessionId: "onboarding_1",
      submittedAt: new Date("2026-04-01T11:00:00.000Z"),
      projectName: "Wagholi Highstreet April Launch",
      projectSlug: "wagholi-highstreet-april-launch",
      projectDescription: "Naya Campaign Landing System for Estate Autopilots",
      projectNotes: expect.stringContaining("Capture builder-qualified enquiries quickly"),
    });
    expect(result.projectRoute).toBe("/dashboard/projects/project_1");
    expect(result.project.name).toBe("Wagholi Highstreet April Launch");
  });
});
