import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CashfreeGatewayError, createCashfreeOrder } from "./cashfree-gateway.js";

describe("createCashfreeOrder", () => {
  beforeEach(() => {
    vi.stubEnv("CASHFREE_MODE", "production");
    vi.stubEnv("CASHFREE_APP_ID", "app_id_live");
    vi.stubEnv("CASHFREE_SECRET_KEY", "secret_live");
    vi.stubEnv("CASHFREE_API_VERSION", "2023-08-01");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("captures provider status and message when Cashfree rejects order creation", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          code: "request_failed",
          message: "transactions are not enabled for your payment gateway account",
          type: "invalid_request_error",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      createCashfreeOrder({
        orderId: "naya_demo_order",
        amountMinor: 299900,
        currency: "INR",
        customer: {
          id: "ERP-CUST-1",
          email: "billing@example.com",
          phone: "919876543210",
          name: "Billing Demo",
        },
        returnUrl: "https://shasvata.com/app/dashboard/projects/project_demo/billing",
      }),
    ).rejects.toMatchObject({
      name: "CashfreeGatewayError",
      statusCode: 400,
      providerCode: "request_failed",
      providerMessage: "transactions are not enabled for your payment gateway account",
    } satisfies Partial<CashfreeGatewayError>);
  });
});
