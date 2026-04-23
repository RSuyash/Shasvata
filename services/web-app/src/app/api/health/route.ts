import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    status: "ok",
    service: "shasvata-web-app",
    timestamp: new Date().toISOString(),
  });
}
