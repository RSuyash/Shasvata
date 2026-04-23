import { NextRequest, NextResponse } from "next/server";
import {
  LOCAL_PORTAL_WORKBENCH_PERSONA_COOKIE,
  LOCAL_PORTAL_WORKBENCH_SIGNED_OUT_COOKIE,
  isLocalPortalWorkbenchEnabled,
} from "@/lib/local-portal-workbench";

function buildCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: false,
    path: "/",
  };
}

export async function POST(request: NextRequest) {
  if (!isLocalPortalWorkbenchEnabled()) {
    return NextResponse.json(
      { error: "Local portal workbench is disabled." },
      { status: 404 },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid workbench payload." }, { status: 400 });
  }

  if (
    typeof payload !== "object" ||
    payload === null ||
    !("intent" in payload) ||
    typeof payload.intent !== "string"
  ) {
    return NextResponse.json({ error: "Workbench intent is required." }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true });

  if (payload.intent === "set-persona") {
    if (
      !("persona" in payload) ||
      (payload.persona !== "owner" &&
        payload.persona !== "viewer" &&
        payload.persona !== "operator")
    ) {
      return NextResponse.json(
        { error: "Workbench persona must be owner, viewer, or operator." },
        { status: 400 },
      );
    }

    response.cookies.set(
      LOCAL_PORTAL_WORKBENCH_PERSONA_COOKIE,
      payload.persona,
      buildCookieOptions(),
    );
    response.cookies.delete(LOCAL_PORTAL_WORKBENCH_SIGNED_OUT_COOKIE);
    return response;
  }

  if (payload.intent === "sign-out") {
    response.cookies.delete(LOCAL_PORTAL_WORKBENCH_PERSONA_COOKIE);
    response.cookies.set(
      LOCAL_PORTAL_WORKBENCH_SIGNED_OUT_COOKIE,
      "1",
      buildCookieOptions(),
    );
    return response;
  }

  return NextResponse.json({ error: "Unknown workbench intent." }, { status: 400 });
}
