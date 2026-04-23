import crypto from "node:crypto";
import { describe, expect, it } from "vitest";
import { verifyCashfreeWebhookSignature } from "./cashfree.js";

describe("verifyCashfreeWebhookSignature", () => {
  it("accepts a signature generated from the raw payload and timestamp", () => {
    const timestamp = "1742763600000";
    const rawBody = JSON.stringify({
      type: "PAYMENT_SUCCESS_WEBHOOK",
      data: { order: { order_id: "order_demo_1" } },
    });
    const secret = "cashfree_secret_demo";
    const expected = crypto
      .createHmac("sha256", secret)
      .update(`${timestamp}${rawBody}`)
      .digest("base64");

    expect(
      verifyCashfreeWebhookSignature({
        rawBody,
        secret,
        timestamp,
        signature: expected,
      }),
    ).toBe(true);
  });

  it("rejects tampered payloads", () => {
    expect(
      verifyCashfreeWebhookSignature({
        rawBody: "{\"type\":\"PAYMENT_SUCCESS_WEBHOOK\"}",
        secret: "cashfree_secret_demo",
        timestamp: "1742763600000",
        signature: "not-a-real-signature",
      }),
    ).toBe(false);
  });
});
