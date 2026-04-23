import crypto from "node:crypto";

type CashfreeOrderInput = {
  orderId: string;
  amountMinor: number;
  currency: string;
  customer: {
    id: string;
    email: string;
    phone?: string | null;
    name?: string | null;
  };
  returnUrl?: string | null;
  cancelUrl?: string | null;
  expiresAt?: string | null;
  note?: string | null;
  tags?: Record<string, string>;
};

export type CashfreeOrderResult = {
  environment: "MOCK" | "SANDBOX" | "PRODUCTION";
  providerOrderId: string;
  cfOrderId: string;
  paymentSessionId: string;
  hostedCheckoutUrl: string | null;
  rawResponse: Record<string, unknown>;
};

export class CashfreeGatewayError extends Error {
  statusCode: number;
  providerCode: string | null;
  providerMessage: string | null;
  rawResponse: Record<string, unknown> | string | null;

  constructor(input: {
    statusCode: number;
    providerCode?: string | null;
    providerMessage?: string | null;
    rawResponse?: Record<string, unknown> | string | null;
  }) {
    super(
      input.providerMessage
        ? `Cashfree create order failed: ${input.providerMessage}`
        : `Cashfree create order failed: ${input.statusCode}`,
    );
    this.name = "CashfreeGatewayError";
    this.statusCode = input.statusCode;
    this.providerCode = input.providerCode ?? null;
    this.providerMessage = input.providerMessage ?? null;
    this.rawResponse = input.rawResponse ?? null;
  }
}

function getCashfreeMode(): "mock" | "sandbox" | "production" {
  const mode = process.env["CASHFREE_MODE"]?.toLowerCase();
  if (mode === "sandbox" || mode === "production") {
    return mode;
  }

  return "mock";
}

export async function createCashfreeOrder(
  input: CashfreeOrderInput,
): Promise<CashfreeOrderResult> {
  const mode = getCashfreeMode();
  if (
    mode === "mock" ||
    !process.env["CASHFREE_APP_ID"] ||
    !process.env["CASHFREE_SECRET_KEY"]
  ) {
    const mockToken = crypto.randomUUID();
    return {
      environment: "MOCK",
      providerOrderId: input.orderId,
      cfOrderId: `cf_mock_${mockToken}`,
      paymentSessionId: `ps_mock_${mockToken}`,
      hostedCheckoutUrl: null,
      rawResponse: {
        mock: true,
        order_id: input.orderId,
      },
    };
  }

  const baseUrl =
    mode === "production" ? "https://api.cashfree.com/pg/orders" : "https://sandbox.cashfree.com/pg/orders";

  const response = await fetch(baseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-version": process.env["CASHFREE_API_VERSION"] ?? "2023-08-01",
      "x-client-id": process.env["CASHFREE_APP_ID"],
      "x-client-secret": process.env["CASHFREE_SECRET_KEY"],
      "x-idempotency-key": crypto.randomUUID(),
    },
    body: JSON.stringify({
      order_id: input.orderId,
      order_amount: Number((input.amountMinor / 100).toFixed(2)),
      order_currency: input.currency,
      customer_details: {
        customer_id: input.customer.id,
        customer_email: input.customer.email,
        customer_phone: input.customer.phone ?? "9999999999",
        customer_name: input.customer.name ?? input.customer.email,
      },
      order_meta: {
        return_url: input.returnUrl ?? undefined,
        notify_url: process.env["CASHFREE_WEBHOOK_URL"] ?? undefined,
      },
      order_expiry_time: input.expiresAt ?? undefined,
      order_note: input.note ?? undefined,
      order_tags: input.tags ?? undefined,
    }),
  });

  if (!response.ok) {
    const responseText = await response.text();
    let providerPayload: Record<string, unknown> | null = null;

    if (responseText) {
      try {
        providerPayload = JSON.parse(responseText) as Record<string, unknown>;
      } catch {
        providerPayload = null;
      }
    }

    throw new CashfreeGatewayError({
      statusCode: response.status,
      providerCode:
        typeof providerPayload?.["code"] === "string" ? String(providerPayload["code"]) : null,
      providerMessage:
        typeof providerPayload?.["message"] === "string"
          ? String(providerPayload["message"])
          : responseText || null,
      rawResponse: providerPayload ?? (responseText || null),
    });
  }

  const payload = (await response.json()) as Record<string, unknown>;
  return {
    environment: mode === "production" ? "PRODUCTION" : "SANDBOX",
    providerOrderId: String(payload["order_id"] ?? input.orderId),
    cfOrderId: String(payload["cf_order_id"] ?? ""),
    paymentSessionId: String(payload["payment_session_id"] ?? ""),
    hostedCheckoutUrl: null,
    rawResponse: payload,
  };
}
