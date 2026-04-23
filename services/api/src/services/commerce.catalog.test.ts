import { beforeEach, describe, expect, it, vi } from "vitest";

const prisma = vi.hoisted(() => ({
  catalogProjection: {
    count: vi.fn(),
    upsert: vi.fn(),
    findMany: vi.fn(),
  },
}));

vi.mock("../lib/prisma.js", () => ({
  prisma,
}));

import { getCommerceCatalog } from "./commerce.js";

describe("catalog seeding", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prisma.catalogProjection.count.mockResolvedValue(12);
    prisma.catalogProjection.findMany.mockResolvedValue([]);
  });

  it("keeps the seeded catalog synchronized even when projection rows already exist", async () => {
    await getCommerceCatalog();

    expect(prisma.catalogProjection.upsert).toHaveBeenCalled();
    expect(prisma.catalogProjection.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          slug: "landing-page-starter",
        },
      }),
    );
  });

  it("publishes the finalized three-tier landing system pricing and add-on catalog", async () => {
    await getCommerceCatalog();

    expect(prisma.catalogProjection.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          slug: "landing-page-growth",
        },
        update: expect.objectContaining({
          label: "Naya Campaign Landing System",
          basePriceMinor: 1_799_900,
          billingModel: "ADVANCE",
          defaultDepositPercent: 50,
          deliveryWindow: "5–7 business days",
        }),
      }),
    );

    expect(prisma.catalogProjection.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          slug: "landing-page-monthly-support",
        },
        update: expect.objectContaining({
          label: "Monthly Launch Support",
          checkoutMode: "QUOTE_ONLY",
          basePriceMinor: 650_000,
        }),
      }),
    );
  });
});
