export const PORTAL_SESSION_COOKIE = "ng_portal_session";

export function getPortalCookieOptions(expiresAt?: Date) {
  const domain = process.env["PORTAL_COOKIE_DOMAIN"]?.trim();
  const isProduction = process.env["NODE_ENV"] === "production";

  return {
    domain: domain || undefined,
    expires: expiresAt,
    httpOnly: true,
    path: "/",
    sameSite: "lax" as const,
    secure: isProduction,
  };
}

export function readCookie(headerValue: string | undefined, name: string): string | null {
  if (!headerValue) {
    return null;
  }

  const prefix = `${name}=`;
  for (const chunk of headerValue.split(";")) {
    const trimmed = chunk.trim();
    if (trimmed.startsWith(prefix)) {
      return decodeURIComponent(trimmed.slice(prefix.length));
    }
  }

  return null;
}
