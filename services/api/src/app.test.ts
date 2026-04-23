import request from "supertest";
import { describe, expect, it, vi } from "vitest";

vi.mock("./services/leads.js", () => ({
  pingDatabase: vi.fn(async () => undefined),
}));

import { createApp } from "./index.js";

describe("createApp CORS", () => {
  it("allows preflight requests for public landing lead capture from arbitrary origins", async () => {
    const app = createApp();

    const response = await request(app)
      .options("/api/landing/public/lead_alpha/leads")
      .set("Origin", "https://alpha.example.com")
      .set("Access-Control-Request-Method", "POST")
      .set("Access-Control-Request-Headers", "content-type");

    expect(response.status).toBe(204);
    expect(response.headers["access-control-allow-origin"]).toBe("https://alpha.example.com");
    expect(response.headers["access-control-allow-methods"]).toContain("POST");
  });

  it("allows credentialed auth preflight requests from the app subdomain", async () => {
    process.env["CORS_ORIGINS"] =
      "https://shasvata.com,https://www.shasvata.com,https://shasvata.com/app";

    const app = createApp();

    const response = await request(app)
      .options("/api/landing/auth/sign-in")
      .set("Origin", "https://shasvata.com/app")
      .set("Access-Control-Request-Method", "POST")
      .set("Access-Control-Request-Headers", "content-type");

    expect(response.status).toBe(204);
    expect(response.headers["access-control-allow-origin"]).toBe("https://shasvata.com/app");
    expect(response.headers["access-control-allow-credentials"]).toBe("true");

    delete process.env["CORS_ORIGINS"];
  });

  it("allows credentialed delete preflight requests from the app subdomain", async () => {
    process.env["CORS_ORIGINS"] =
      "https://shasvata.com,https://www.shasvata.com,https://shasvata.com/app";

    const app = createApp();

    const response = await request(app)
      .options(
        "/api/landing/portal/projects/cmnhqmbbu0000q6u9ms9l84zi/members/cmnatyckb0003oz01ybuwtjx4",
      )
      .set("Origin", "https://shasvata.com/app")
      .set("Access-Control-Request-Method", "DELETE")
      .set("Access-Control-Request-Headers", "content-type");

    expect(response.status).toBe(204);
    expect(response.headers["access-control-allow-origin"]).toBe("https://shasvata.com/app");
    expect(response.headers["access-control-allow-credentials"]).toBe("true");
    expect(response.headers["access-control-allow-methods"]).toContain("DELETE");

    delete process.env["CORS_ORIGINS"];
  });

  it("allows credentialed patch preflight requests from the app subdomain", async () => {
    process.env["CORS_ORIGINS"] =
      "https://shasvata.com,https://www.shasvata.com,https://shasvata.com/app";

    const app = createApp();

    const response = await request(app)
      .options("/api/landing/portal/projects/cmnhqmbbu0000q6u9ms9l84zi/billing/checkout-identity")
      .set("Origin", "https://shasvata.com/app")
      .set("Access-Control-Request-Method", "PATCH")
      .set("Access-Control-Request-Headers", "content-type");

    expect(response.status).toBe(204);
    expect(response.headers["access-control-allow-origin"]).toBe("https://shasvata.com/app");
    expect(response.headers["access-control-allow-credentials"]).toBe("true");
    expect(response.headers["access-control-allow-methods"]).toContain("PATCH");

    delete process.env["CORS_ORIGINS"];
  });

  it("marks the API as non-indexable at the HTTP layer", async () => {
    const app = createApp();

    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.headers["x-robots-tag"]).toBe("noindex, nofollow");
  });
});
