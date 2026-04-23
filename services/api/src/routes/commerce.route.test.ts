import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  CommerceServiceError,
  createCheckoutSessionFromBillingSnapshot,
  createCheckoutSession,
  createCommerceCart,
  getCommerceCatalog,
  processCashfreeWebhook,
} = vi.hoisted(() => ({
  CommerceServiceError: class CommerceServiceError extends Error {
    statusCode: number;

    constructor(statusCode: number, message: string) {
      super(message);
      this.statusCode = statusCode;
    }
  },
  getCommerceCatalog: vi.fn(),
  createCommerceCart: vi.fn(),
  createCheckoutSession: vi.fn(),
  createCheckoutSessionFromBillingSnapshot: vi.fn(),
  processCashfreeWebhook: vi.fn(),
}));

vi.mock("../services/commerce.js", () => ({
  CommerceServiceError,
  createCheckoutSessionFromBillingSnapshot,
  getCommerceCatalog,
  createCommerceCart,
  createCheckoutSession,
}));

vi.mock("../services/cashfree-webhook.js", () => ({
  processCashfreeWebhook,
}));

import { commerceRouter } from "./commerce.js";

function createApp() {
  const app = express();
  app.use(express.json());
  app.use("/api/commerce", commerceRouter);
  return app;
}

describe("commerceRouter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the projected catalog", async () => {
    getCommerceCatalog.mockResolvedValue({
      items: [{ slug: "growth-sprint" }],
      offers: [],
      lastSyncedAt: "2026-03-23T00:00:00.000Z",
    });

    const response = await request(createApp()).get("/api/commerce/catalog");

    expect(response.status).toBe(200);
    expect(response.body.items).toHaveLength(1);
    expect(getCommerceCatalog).toHaveBeenCalledTimes(1);
  });

  it("creates a cart and returns its pricing snapshot", async () => {
    createCommerceCart.mockResolvedValue({
      id: "cart_demo",
      flowMode: "SELF_SERVE",
      payableTodayMinor: 7800000,
    });

    const response = await request(createApp())
      .post("/api/commerce/carts")
      .send({
        selections: [
          { slug: "revops-foundation", quantity: 1 },
          { slug: "tracking-layer", quantity: 1 },
        ],
        buyer: {
          email: "hello@acme.co",
        },
      });

    expect(response.status).toBe(201);
    expect(response.body.id).toBe("cart_demo");
    expect(createCommerceCart).toHaveBeenCalledWith(
      expect.objectContaining({
        selections: expect.any(Array),
        buyer: expect.objectContaining({ email: "hello@acme.co" }),
      }),
    );
  });

  it("surfaces quote-mode checkout restrictions as 409 conflicts", async () => {
    createCheckoutSession.mockRejectedValue(
      new CommerceServiceError(409, "Quote-request carts cannot open a payment session."),
    );

    const response = await request(createApp())
      .post("/api/commerce/carts/cart_quote_1/checkout-sessions")
      .send({
        returnUrl: "https://shasvata.com/app/checkout/success",
        cancelUrl: "https://shasvata.com/app/checkout/cancel",
      });

    expect(response.status).toBe(409);
    expect(response.body.error).toMatch(/quote-request carts/i);
  });

  it("creates a checkout session from a billing snapshot", async () => {
    createCheckoutSessionFromBillingSnapshot.mockResolvedValue({
      id: "checkout_snapshot_1",
      status: "CREATED",
      provider: "CASHFREE",
      environment: "PRODUCTION",
      amountMinor: 3575000,
      currency: "INR",
      paymentSessionId: "ps_snapshot_1",
      providerOrderId: "order_snapshot_1",
      hostedCheckoutUrl: "https://payments.example.com/checkout/1",
      erp: {
        customerId: "ERP-CUST-ALPHA",
        quotationId: "ERP-QUO-ALPHA",
        salesOrderId: "ERP-SO-ALPHA",
      },
    });

    const response = await request(createApp())
      .post("/api/commerce/checkout-sessions")
      .send({
        billingSnapshotId: "snapshot_alpha",
        returnUrl: "https://shasvata.com/app/dashboard/projects/project_alpha/billing",
      });

    expect(response.status).toBe(201);
    expect(response.body.id).toBe("checkout_snapshot_1");
    expect(createCheckoutSessionFromBillingSnapshot).toHaveBeenCalledWith({
      billingSnapshotId: "snapshot_alpha",
      returnUrl: "https://shasvata.com/app/dashboard/projects/project_alpha/billing",
      cancelUrl: undefined,
    });
  });

  it("surfaces provider-disabled checkout errors as actionable responses", async () => {
    createCheckoutSessionFromBillingSnapshot.mockRejectedValue(
      new CommerceServiceError(
        503,
        "Online payment is temporarily unavailable because Cashfree transactions are not enabled on this billing account yet. Please contact Naya to complete payment manually.",
      ),
    );

    const response = await request(createApp())
      .post("/api/commerce/checkout-sessions")
      .send({
        billingSnapshotId: "snapshot_disabled",
        returnUrl: "https://shasvata.com/app/dashboard/projects/project_alpha/billing",
      });

    expect(response.status).toBe(503);
    expect(response.body.error).toMatch(/transactions are not enabled/i);
  });

  it("rejects invalid Cashfree webhook signatures", async () => {
    processCashfreeWebhook.mockRejectedValue(
      new CommerceServiceError(401, "Invalid Cashfree signature."),
    );

    const response = await request(createApp())
      .post("/api/commerce/webhooks/cashfree")
      .set("x-webhook-signature", "invalid")
      .set("x-webhook-timestamp", "1742763600000")
      .set("Content-Type", "application/json")
      .send(JSON.stringify({ type: "PAYMENT_SUCCESS_WEBHOOK" }));

    expect(response.status).toBe(401);
    expect(response.body.error).toMatch(/invalid cashfree signature/i);
  });
});
