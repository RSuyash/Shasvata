export function GET() {
  return Response.json({
    ok: true,
    service: "insights",
    environment: process.env.APP_ENV || "local",
    version: "0.1.0",
    timestamp: new Date().toISOString()
  });
}
