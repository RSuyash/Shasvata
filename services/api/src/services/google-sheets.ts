import crypto from "node:crypto";
import type { GoogleSheetsLeadSyncConfig } from "./landing-platform.js";

type GoogleSheetsProjectContext = {
  name: string;
};

type GoogleSheetsLeadContext = {
  id: string;
  createdAt: Date;
  fullName: string;
  email: string;
  phone: string | null;
  companyName: string | null;
  message: string | null;
};

type GoogleSheetsTargetContext = {
  config: GoogleSheetsLeadSyncConfig;
};

type CachedAccessToken = {
  token: string;
  expiresAt: number;
} | null;

let cachedAccessToken: CachedAccessToken = null;

function base64UrlEncode(input: string | Buffer): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function getServiceAccountEmail(): string {
  const email = process.env["GOOGLE_SERVICE_ACCOUNT_EMAIL"]?.trim();
  if (!email) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_EMAIL is not set");
  }

  return email;
}

function getServiceAccountPrivateKey(): string {
  const key = process.env["GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY"]?.replace(/\\n/g, "\n");
  if (!key) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY is not set");
  }

  return key;
}

async function getGoogleAccessToken(): Promise<string> {
  const nowSeconds = Math.floor(Date.now() / 1000);
  if (cachedAccessToken && cachedAccessToken.expiresAt > Date.now() + 60_000) {
    return cachedAccessToken.token;
  }

  const header = base64UrlEncode(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64UrlEncode(
    JSON.stringify({
      iss: getServiceAccountEmail(),
      scope: "https://www.googleapis.com/auth/spreadsheets",
      aud: "https://oauth2.googleapis.com/token",
      exp: nowSeconds + 3600,
      iat: nowSeconds,
    }),
  );

  const signer = crypto.createSign("RSA-SHA256");
  signer.update(`${header}.${payload}`);
  signer.end();
  const signature = signer.sign(getServiceAccountPrivateKey());
  const assertion = `${header}.${payload}.${base64UrlEncode(signature)}`;

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });

  if (!response.ok) {
    throw new Error(`Google OAuth token request failed (${response.status}).`);
  }

  const data = (await response.json()) as {
    access_token?: string;
    expires_in?: number;
  };

  if (!data.access_token || !data.expires_in) {
    throw new Error("Google OAuth token response did not include an access token.");
  }

  cachedAccessToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return data.access_token;
}

export async function appendLeadToGoogleSheet(input: {
  target: GoogleSheetsTargetContext;
  project: GoogleSheetsProjectContext;
  lead: GoogleSheetsLeadContext;
}): Promise<void> {
  const spreadsheetId = input.target.config.spreadsheetId?.trim();
  const sheetName = input.target.config.sheetName?.trim();

  if (!spreadsheetId || !sheetName) {
    throw new Error("Lead sync target is missing spreadsheetId or sheetName.");
  }

  const accessToken = await getGoogleAccessToken();
  const range = encodeURIComponent(`${sheetName}!A:H`);

  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${range}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        values: [
          [
            input.lead.createdAt.toISOString(),
            input.project.name,
            input.lead.fullName,
            input.lead.email,
            input.lead.phone ?? "",
            input.lead.companyName ?? "",
            input.lead.message ?? "",
            input.lead.id,
          ],
        ],
      }),
    },
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Google Sheets append failed (${response.status}): ${errorBody || "Unknown error."}`,
    );
  }
}
