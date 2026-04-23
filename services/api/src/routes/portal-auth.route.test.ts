import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  consumeEmailVerification,
  consumePortalMagicLink,
  requestPasswordReset,
  requestPortalMagicLink,
  resetPassword,
  signInWithGoogle,
  signInWithPassword,
  signUpWithPassword,
} = vi.hoisted(() => ({
  consumeEmailVerification: vi.fn(),
  requestPortalMagicLink: vi.fn(),
  consumePortalMagicLink: vi.fn(),
  requestPasswordReset: vi.fn(),
  resetPassword: vi.fn(),
  signInWithGoogle: vi.fn(),
  signInWithPassword: vi.fn(),
  signUpWithPassword: vi.fn(),
}));

vi.mock("../services/landing-platform-runtime.js", () => ({
  consumeEmailVerification,
  requestPortalMagicLink,
  consumePortalMagicLink,
  requestPasswordReset,
  resetPassword,
  signInWithGoogle,
  signInWithPassword,
  signUpWithPassword,
}));

import { portalAuthRouter } from "./portal-auth.js";

function createApp() {
  const app = express();
  app.use(express.json());
  app.use("/api/landing/auth", portalAuthRouter);
  return app;
}

describe("portalAuthRouter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("accepts a magic-link request without exposing whether the email exists", async () => {
    requestPortalMagicLink.mockResolvedValue({ accepted: true });

    const response = await request(createApp())
      .post("/api/landing/auth/magic-links")
      .send({
        email: "client@example.com",
        redirectPath: "/projects/project_alpha",
      });

    expect(response.status).toBe(202);
    expect(response.body).toEqual({ accepted: true });
    expect(requestPortalMagicLink).toHaveBeenCalledWith({
      email: "client@example.com",
      redirectPath: "/projects/project_alpha",
    });
  });

  it("consumes a valid magic link and sets a portal session cookie", async () => {
    consumePortalMagicLink.mockResolvedValue({
      portalUser: {
        id: "user_client",
        email: "client@example.com",
      },
      session: {
        id: "session_1",
        expiresAt: new Date("2026-04-25T00:00:00.000Z"),
      },
      redirectPath: "/projects/project_alpha",
    });

    const response = await request(createApp())
      .post("/api/landing/auth/magic-links/consume")
      .send({
        selector: "selector",
        verifier: "verifier",
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      authenticated: true,
      redirectPath: "/projects/project_alpha",
      portalUser: {
        id: "user_client",
        email: "client@example.com",
      },
    });
    expect(response.headers["set-cookie"]?.[0]).toContain("ng_portal_session=session_1");
  });

  it("signs in with a valid password and sets a portal session cookie", async () => {
    signInWithPassword.mockResolvedValue({
      portalUser: {
        id: "user_client",
        email: "client@example.com",
      },
      session: {
        id: "session_2",
        expiresAt: new Date("2026-04-25T00:00:00.000Z"),
      },
    });

    const response = await request(createApp()).post("/api/landing/auth/sign-in").send({
      email: "client@example.com",
      password: "NayaPassword123!",
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      authenticated: true,
      portalUser: {
        id: "user_client",
        email: "client@example.com",
      },
    });
    expect(signInWithPassword).toHaveBeenCalledWith({
      email: "client@example.com",
      password: "NayaPassword123!",
    });
    expect(response.headers["set-cookie"]?.[0]).toContain("ng_portal_session=session_2");
  });

  it("passes invite metadata through password sign-in and returns the accepted project redirect", async () => {
    signInWithPassword.mockResolvedValue({
      portalUser: {
        id: "user_client",
        email: "client@example.com",
      },
      session: {
        id: "session_3",
        expiresAt: new Date("2026-04-25T00:00:00.000Z"),
      },
      redirectPath: "/dashboard/projects/project_alpha",
    });

    const response = await request(createApp()).post("/api/landing/auth/sign-in").send({
      email: "client@example.com",
      password: "NayaPassword123!",
      inviteSelector: "selector",
      inviteVerifier: "verifier",
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      authenticated: true,
      redirectPath: "/dashboard/projects/project_alpha",
      portalUser: {
        id: "user_client",
        email: "client@example.com",
      },
    });
    expect(signInWithPassword).toHaveBeenCalledWith({
      email: "client@example.com",
      password: "NayaPassword123!",
      inviteSelector: "selector",
      inviteVerifier: "verifier",
    });
  });

  it("returns 401 when password sign-in fails", async () => {
    signInWithPassword.mockRejectedValue(new Error("Invalid email or password."));

    const response = await request(createApp()).post("/api/landing/auth/sign-in").send({
      email: "client@example.com",
      password: "wrong-password",
    });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: "Invalid email or password.",
    });
  });

  it("creates a pending account from sign-up without leaking the password in the response", async () => {
    signUpWithPassword.mockResolvedValue({ accepted: true });

    const response = await request(createApp()).post("/api/landing/auth/sign-up").send({
      firstName: "Ada",
      lastName: "Lovelace",
      email: "ada@example.com",
      phone: "+91 99999 00000",
      password: "AdaSecure123!",
    });

    expect(response.status).toBe(202);
    expect(response.body).toEqual({ accepted: true });
    expect(signUpWithPassword).toHaveBeenCalledWith({
      firstName: "Ada",
      lastName: "Lovelace",
      email: "ada@example.com",
      phone: "+91 99999 00000",
      password: "AdaSecure123!",
    });
  });

  it("signs up an invited user, creates a session, and returns the project redirect", async () => {
    signUpWithPassword.mockResolvedValue({
      authenticated: true,
      portalUser: {
        id: "user_invited",
        email: "ada@example.com",
      },
      session: {
        id: "session_sign_up_invite",
        expiresAt: new Date("2026-04-25T00:00:00.000Z"),
      },
      redirectPath: "/dashboard/projects/project_alpha",
    });

    const response = await request(createApp()).post("/api/landing/auth/sign-up").send({
      firstName: "Ada",
      lastName: "Lovelace",
      email: "ada@example.com",
      phone: "+91 99999 00000",
      password: "AdaSecure123!",
      inviteSelector: "selector",
      inviteVerifier: "verifier",
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      authenticated: true,
      redirectPath: "/dashboard/projects/project_alpha",
      portalUser: {
        id: "user_invited",
        email: "ada@example.com",
      },
    });
    expect(response.headers["set-cookie"]?.[0]).toContain(
      "ng_portal_session=session_sign_up_invite",
    );
  });

  it("consumes a verification token, activates the account, and sets a session cookie", async () => {
    consumeEmailVerification.mockResolvedValue({
      portalUser: {
        id: "user_new",
        email: "ada@example.com",
      },
      session: {
        id: "session_verify",
        expiresAt: new Date("2026-04-25T00:00:00.000Z"),
      },
    });

    const response = await request(createApp())
      .post("/api/landing/auth/verify-email/consume")
      .send({
        selector: "selector",
        verifier: "verifier",
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      authenticated: true,
      portalUser: {
        id: "user_new",
        email: "ada@example.com",
      },
    });
    expect(response.headers["set-cookie"]?.[0]).toContain("ng_portal_session=session_verify");
  });

  it("accepts forgot-password requests without leaking account existence", async () => {
    requestPasswordReset.mockResolvedValue({ accepted: true });

    const response = await request(createApp()).post("/api/landing/auth/password/forgot").send({
      email: "client@example.com",
    });

    expect(response.status).toBe(202);
    expect(response.body).toEqual({ accepted: true });
    expect(requestPasswordReset).toHaveBeenCalledWith({
      email: "client@example.com",
    });
  });

  it("resets the password and creates a fresh session cookie", async () => {
    resetPassword.mockResolvedValue({
      portalUser: {
        id: "user_client",
        email: "client@example.com",
      },
      session: {
        id: "session_reset",
        expiresAt: new Date("2026-04-25T00:00:00.000Z"),
      },
    });

    const response = await request(createApp()).post("/api/landing/auth/password/reset").send({
      selector: "selector",
      verifier: "verifier",
      password: "NewPassword123!",
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      authenticated: true,
      portalUser: {
        id: "user_client",
        email: "client@example.com",
      },
    });
    expect(response.headers["set-cookie"]?.[0]).toContain("ng_portal_session=session_reset");
  });

  it("signs in with Google and sets the shared portal session cookie", async () => {
    signInWithGoogle.mockResolvedValue({
      portalUser: {
        id: "user_google",
        email: "google-user@example.com",
      },
      session: {
        id: "session_google",
        expiresAt: new Date("2026-04-25T00:00:00.000Z"),
      },
    });

    const response = await request(createApp()).post("/api/landing/auth/google").send({
      idToken: "google-id-token",
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      authenticated: true,
      portalUser: {
        id: "user_google",
        email: "google-user@example.com",
      },
    });
    expect(response.headers["set-cookie"]?.[0]).toContain("ng_portal_session=session_google");
  });

  it("passes invite metadata through Google sign-in and returns the accepted project redirect", async () => {
    signInWithGoogle.mockResolvedValue({
      portalUser: {
        id: "user_google",
        email: "google-user@example.com",
      },
      session: {
        id: "session_google_invite",
        expiresAt: new Date("2026-04-25T00:00:00.000Z"),
      },
      redirectPath: "/dashboard/projects/project_alpha",
    });

    const response = await request(createApp()).post("/api/landing/auth/google").send({
      idToken: "google-id-token",
      inviteSelector: "selector",
      inviteVerifier: "verifier",
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      authenticated: true,
      redirectPath: "/dashboard/projects/project_alpha",
      portalUser: {
        id: "user_google",
        email: "google-user@example.com",
      },
    });
  });

  it("returns 401 when Google sign-in rejects an invalid ID token", async () => {
    signInWithGoogle.mockRejectedValue(new Error("Invalid Google ID token."));

    const response = await request(createApp()).post("/api/landing/auth/google").send({
      idToken: "not-a-real-token",
    });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: "Invalid Google ID token.",
    });
  });
});
