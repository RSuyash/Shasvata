import { OAuth2Client, type TokenPayload } from "google-auth-library";
import type { VerifiedGoogleIdentity } from "./landing-platform.js";

let googleClient: OAuth2Client | null = null;

function getGoogleClient() {
  if (!googleClient) {
    googleClient = new OAuth2Client();
  }

  return googleClient;
}

export function normalizeVerifiedGoogleIdentity(
  payload: Pick<
    TokenPayload,
    "sub" | "email" | "email_verified" | "name" | "given_name" | "family_name" | "picture"
  >,
): VerifiedGoogleIdentity {
  const subject = payload.sub?.trim();
  const email = payload.email?.trim().toLowerCase();

  if (!subject || !email) {
    throw new Error("Google identity payload is missing required fields.");
  }

  if (!payload.email_verified) {
    throw new Error("Google account email is not verified.");
  }

  return {
    subject,
    email,
    emailVerified: true,
    fullName: payload.name?.trim() || null,
    givenName: payload.given_name?.trim() || null,
    familyName: payload.family_name?.trim() || null,
    pictureUrl: payload.picture?.trim() || null,
  };
}

export async function verifyGoogleIdToken(input: {
  idToken: string;
  clientId?: string;
}): Promise<VerifiedGoogleIdentity> {
  const clientId = input.clientId?.trim() || process.env["GOOGLE_WEB_CLIENT_ID"]?.trim();
  if (!clientId) {
    throw new Error("GOOGLE_WEB_CLIENT_ID is not set.");
  }

  let ticket;
  try {
    ticket = await getGoogleClient().verifyIdToken({
      idToken: input.idToken,
      audience: clientId,
    });
  } catch {
    throw new Error("Invalid Google ID token.");
  }
  const payload = ticket.getPayload();

  if (!payload) {
    throw new Error("Invalid Google ID token.");
  }

  return normalizeVerifiedGoogleIdentity(payload);
}
