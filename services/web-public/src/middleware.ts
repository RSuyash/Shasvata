import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const PUBLIC_LAUNCH_PATHS = new Set([
  "/",
  "/privacy",
  "/terms",
  "/robots.txt",
  "/sitemap.xml",
  "/site.webmanifest",
]);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    PUBLIC_LAUNCH_PATHS.has(pathname) ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/icon") ||
    pathname.startsWith("/logo") ||
    pathname.startsWith("/og-default") ||
    /\.[a-z0-9]+$/i.test(pathname)
  ) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = "/";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/:path*"],
};
