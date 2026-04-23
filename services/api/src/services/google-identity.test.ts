import { beforeEach, describe, expect, it, vi } from "vitest";

const { verifyIdTokenMock } = vi.hoisted(() => ({
  verifyIdTokenMock: vi.fn(),
}));

vi.mock("google-auth-library", () => ({
  OAuth2Client: vi.fn(() => ({
    verifyIdToken: verifyIdTokenMock,
  })),
}));

import { normalizeVerifiedGoogleIdentity, verifyGoogleIdToken } from "./google-identity.js";

describe("normalizeVerifiedGoogleIdentity", () => {
  beforeEach(() => {
    verifyIdTokenMock.mockReset();
    delete process.env["GOOGLE_WEB_CLIENT_ID"];
  });

  it("returns a normalized verified Google identity payload for auth flows", () => {
    const identity = normalizeVerifiedGoogleIdentity({
      sub: "google-sub-123",
      email: "User@Example.com",
      email_verified: true,
      name: "Ada Lovelace",
      given_name: "Ada",
      family_name: "Lovelace",
      picture: "https://example.com/avatar.png",
    });

    expect(identity).toEqual({
      subject: "google-sub-123",
      email: "user@example.com",
      emailVerified: true,
      fullName: "Ada Lovelace",
      givenName: "Ada",
      familyName: "Lovelace",
      pictureUrl: "https://example.com/avatar.png",
    });
  });

  it("rejects payloads without a verified email address", () => {
    expect(() =>
      normalizeVerifiedGoogleIdentity({
        sub: "google-sub-123",
        email: "user@example.com",
        email_verified: false,
      }),
    ).toThrow("Google account email is not verified.");
  });

  it("maps upstream verifier failures to an invalid Google ID token error", async () => {
    process.env["GOOGLE_WEB_CLIENT_ID"] = "google-web-client-id";
    verifyIdTokenMock.mockRejectedValue(new Error("Wrong number of segments in token"));

    await expect(
      verifyGoogleIdToken({
        idToken: "not-a-real-token",
      }),
    ).rejects.toThrow("Invalid Google ID token.");
  });
});
