import crypto from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";

const prisma = vi.hoisted(() => ({
  webhookEvent: {
    findUnique: vi.fn(),
    upsert: vi.fn(),
    update: vi.fn(),
  },
  checkoutSession: {
    findFirst: vi.fn(),
    update: vi.fn(),
  },
  paymentAttempt: {
    create: vi.fn(),
  },
  cart: {
    update: vi.fn(),
  },
  erpSyncState: {
    upsert: vi.fn(),
  },
  $transaction: vi.fn(async (operations: unknown[]) => Promise.all(operations)),
}));

const erp = vi.hoisted(() => ({
  createDraftQuotation: vi.fn(),
  createQuoteRequestInErp: vi.fn(),
  createSalesOrder: vi.fn(),
  recordPaymentEntry: vi.fn(),
  upsertPortalCustomer: vi.fn(),
}));

const billingEmail = vi.hoisted(() => ({
  sendPortalPaymentConfirmationEmail: vi.fn(),
}));

vi.mock("../lib/prisma.js", () => ({
  prisma,
}));

vi.mock("./erp.js", () => erp);
vi.mock("./landing-platform-email.js", () => billingEmail);

import {
  processCashfreeWebhook,
} from "./commerce.js";

function signWebhook(rawBody: string, secret: string, timestamp: string): string {
  return crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}${rawBody}`)
    .digest("base64");
}

describe("processCashfreeWebhook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env["CASHFREE_WEBHOOK_SECRET"];
    delete process.env["CASHFREE_MODE"];
    delete process.env["NODE_ENV"];
  });

  it("rejects non-mock webhook processing when the webhook secret is missing", async () => {
    process.env["CASHFREE_MODE"] = "production";

    await expect(
      processCashfreeWebhook({
        rawBody: JSON.stringify({
          type: "PAYMENT_SUCCESS_WEBHOOK",
          data: { order: { order_id: "order_demo_1" } },
        }),
        headers: {
          "x-webhook-timestamp": "1742763600000",
          "x-webhook-signature": "invalid",
        },
      }),
    ).rejects.toMatchObject({
      statusCode: 503,
      message: "Cashfree webhook secret is not configured.",
    });
  });

  it("treats an already processed webhook as idempotent and skips finance writes", async () => {
    const secret = "cashfree_secret_demo";
    const timestamp = "1742763600000";
    const rawBody = JSON.stringify({
      type: "PAYMENT_SUCCESS_WEBHOOK",
      data: {
        payment: { cf_payment_id: "payment_demo_1" },
        order: { order_id: "order_demo_1" },
      },
    });

    process.env["CASHFREE_MODE"] = "production";
    process.env["CASHFREE_WEBHOOK_SECRET"] = secret;
    prisma.webhookEvent.findUnique.mockResolvedValue({
      id: "event_demo_1",
      externalEventId: "PAYMENT_SUCCESS_WEBHOOK:payment_demo_1:order_demo_1",
      status: "PROCESSED",
    });

    const result = await processCashfreeWebhook({
      rawBody,
      headers: {
        "x-webhook-timestamp": timestamp,
        "x-webhook-signature": signWebhook(rawBody, secret, timestamp),
      },
    });

    expect(result).toEqual({ received: true });
    expect(prisma.webhookEvent.findUnique).toHaveBeenCalledWith({
      where: {
        externalEventId: "PAYMENT_SUCCESS_WEBHOOK:payment_demo_1:order_demo_1",
      },
    });
    expect(prisma.webhookEvent.upsert).not.toHaveBeenCalled();
    expect(erp.recordPaymentEntry).not.toHaveBeenCalled();
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("sends a payment confirmation email after a successful payment webhook", async () => {
    const secret = "cashfree_secret_demo";
    const timestamp = "1742763600000";
    const rawBody = JSON.stringify({
      type: "PAYMENT_SUCCESS_WEBHOOK",
      data: {
        payment: { cf_payment_id: "payment_demo_2" },
        order: { order_id: "order_demo_2" },
      },
    });

    process.env["CASHFREE_MODE"] = "production";
    process.env["CASHFREE_WEBHOOK_SECRET"] = secret;
    prisma.webhookEvent.findUnique.mockResolvedValue(null);
    prisma.webhookEvent.upsert.mockResolvedValue({});
    prisma.webhookEvent.update.mockResolvedValue({});
    prisma.checkoutSession.findFirst.mockResolvedValue({
      id: "checkout_demo_2",
      cartId: "cart_demo_2",
      amountMinor: 479700,
      currency: "INR",
      erpSalesOrderId: "ERP-SO-2",
      erpCustomerId: "ERP-CUST-2",
      providerOrderId: "order_demo_2",
      returnUrl: "https://shasvata.com/app/dashboard/projects/project_demo/billing",
      cart: {
        erpSalesOrderId: "ERP-SO-2",
        erpCustomerId: "ERP-CUST-2",
        buyerEmail: "client@example.com",
        buyerCompanyName: "Client Demo LLP",
      },
    });
    erp.recordPaymentEntry.mockResolvedValue({
      paymentEntryId: "ERP-PAY-2",
    });
    prisma.paymentAttempt.create.mockResolvedValue({});
    prisma.checkoutSession.update.mockResolvedValue({});
    prisma.cart.update.mockResolvedValue({});
    prisma.erpSyncState.upsert.mockResolvedValue({});
    billingEmail.sendPortalPaymentConfirmationEmail.mockResolvedValue(undefined);

    const result = await processCashfreeWebhook({
      rawBody,
      headers: {
        "x-webhook-timestamp": timestamp,
        "x-webhook-signature": signWebhook(rawBody, secret, timestamp),
      },
    });

    expect(result).toEqual({ received: true });
    expect(billingEmail.sendPortalPaymentConfirmationEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "client@example.com",
        amountMinor: 479700,
        billingUrl: "https://shasvata.com/app/dashboard/projects/project_demo/billing",
        providerOrderId: "order_demo_2",
      }),
    );
  });
});
