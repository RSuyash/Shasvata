import { describe, expect, it } from "vitest";
import { buildApp } from "./app.js";

describe("platform API", () => {
  it("returns health status", async () => {
    const app = buildApp();
    const response = await app.inject({ method: "GET", url: "/health" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ ok: true, service: "platform-api" });
  });

  it("validates contact submissions", async () => {
    const app = buildApp();
    const response = await app.inject({
      method: "POST",
      url: "/v1/contact",
      payload: { name: "Suyash", email: "suyash@example.com", message: "Hello" }
    });

    expect(response.statusCode).toBe(202);
    expect(response.json()).toMatchObject({ accepted: true, type: "contact" });
  });
});
