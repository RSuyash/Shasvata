import { describe, expect, it } from "vitest";
import { buildAuthRoute, ROUTES, signInRedirect } from "./routes";

describe("ROUTES", () => {
  it("defines the public app-domain routes used for compliance and whitelisting", () => {
    expect(ROUTES.public.home).toBe("/");
    expect(ROUTES.public.products).toBe("/products");
    expect(ROUTES.public.contact).toBe("/contact");
    expect(ROUTES.public.terms).toBe("/terms");
    expect(ROUTES.public.privacy).toBe("/privacy");
    expect(ROUTES.public.refunds).toBe("/refunds-cancellations");
  });

  it("defines the canonical dashboard routes", () => {
    expect(ROUTES.auth.signIn).toBe("/auth/sign-in");
    expect(ROUTES.dashboard.root).toBe("/dashboard");
    expect(ROUTES.dashboard.products).toBe("/dashboard/products");
    expect(ROUTES.dashboard.billing).toBe("/dashboard/billing");
    expect(ROUTES.dashboard.projects).toBe("/dashboard/projects");
    expect(ROUTES.dashboard.settings).toBe("/dashboard/settings");
    expect(ROUTES.dashboard.onboarding("onboarding_123")).toBe(
      "/dashboard/onboarding/onboarding_123",
    );
    expect(ROUTES.dashboard.project("project-123")).toBe(
      "/dashboard/projects/project-123",
    );
    expect(ROUTES.dashboard.projectLeads("project-123")).toBe(
      "/dashboard/projects/project-123/leads",
    );
    expect(ROUTES.dashboard.projectBilling("project-123")).toBe(
      "/dashboard/projects/project-123/billing",
    );
    expect(ROUTES.dashboard.projectAnalytics("project-123")).toBe(
      "/dashboard/projects/project-123/analytics",
    );
  });

  it("keeps the legacy projects entrypoint available for redirects", () => {
    expect(ROUTES.legacy.projects).toBe("/projects");
  });
});

describe("signInRedirect", () => {
  it("encodes the target path onto the sign-in route", () => {
    expect(signInRedirect(ROUTES.dashboard.projects)).toBe(
      "/auth/sign-in?redirect=%2Fdashboard%2Fprojects",
    );
  });
});

describe("buildAuthRoute", () => {
  it("preserves invite context while switching auth modes", () => {
    expect(
      buildAuthRoute({
        mode: "sign-up",
        redirect: ROUTES.auth.inviteAccept("selector", "verifier"),
        inviteSelector: "selector",
        inviteVerifier: "verifier",
        inviteEmail: "client@example.com",
      }),
    ).toBe(
      "/auth/sign-in?mode=sign-up&redirect=%2Finvite%2Fselector%2Fverifier&inviteSelector=selector&inviteVerifier=verifier&inviteEmail=client%40example.com",
    );
  });
});
