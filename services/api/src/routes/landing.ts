import { Router } from "express";
import {
  getPublicTrackingRuntimeConfig,
} from "../services/landing-platform-runtime.js";
import {
  recordInboundLeadWebhookEvent,
  submitPublicProjectLead,
} from "../services/acquisition-runtime.js";

export const landingRouter = Router();

function readOriginHost(originHeader: string | undefined): string | null {
  if (!originHeader) {
    return null;
  }

  try {
    return new URL(originHeader).hostname;
  } catch {
    return null;
  }
}

landingRouter.get("/runtime/tracking-config", async (req, res, next) => {
  try {
    const runtime = await getPublicTrackingRuntimeConfig({
      host:
        typeof req.query["host"] === "string"
          ? req.query["host"]
          : req.get("x-forwarded-host") ?? req.get("host") ?? undefined,
    });

    res.set("Cache-Control", "no-store");
    res.status(200).json(runtime);
  } catch (error) {
    next(error);
  }
});

landingRouter.post("/public/:publicLeadKey/leads", async (req, res, next) => {
  const body = req.body as Record<string, unknown>;
  const honeypot = String(body["website_url_extra"] ?? "");

  if (honeypot.trim()) {
    res.status(200).json({ success: true });
    return;
  }

  try {
    const lead = await submitPublicProjectLead({
      publicLeadKey: req.params["publicLeadKey"] ?? "",
      originHost: readOriginHost(req.get("origin") ?? undefined),
      honeypot,
      payload: {
        fullName: String(body["fullName"] ?? ""),
        email: String(body["email"] ?? ""),
        phone: String(body["phone"] ?? ""),
        companyName: String(body["companyName"] ?? ""),
        message: String(body["message"] ?? ""),
        consent: Boolean(body["consent"]),
      },
    });

    res.status(201).json({
      success: true,
      leadId: lead.id,
      syncStatus: lead.syncStatus,
    });
  } catch (error) {
    next(error);
  }
});

landingRouter.post("/webhooks/meta/leadgen", async (req, res, next) => {
  try {
    const body = req.body && typeof req.body === "object" ? req.body : {};
    const result = await recordInboundLeadWebhookEvent({
      provider: "META_LEAD_ADS",
      eventType: "leadgen",
      externalLeadId:
        typeof body["leadgen_id"] === "string"
          ? body["leadgen_id"]
          : typeof body["id"] === "string"
            ? body["id"]
            : undefined,
      payload: body as Record<string, unknown>,
    });

    res.status(result.accepted ? 202 : 200).json(result);
  } catch (error) {
    next(error);
  }
});

landingRouter.post("/webhooks/linkedin/leadgen", async (req, res, next) => {
  try {
    const body = req.body && typeof req.body === "object" ? req.body : {};
    const result = await recordInboundLeadWebhookEvent({
      provider: "LINKEDIN_LEAD_GEN",
      eventType: "leadgen",
      externalLeadId:
        typeof body["leadId"] === "string"
          ? body["leadId"]
          : typeof body["id"] === "string"
            ? body["id"]
            : undefined,
      payload: body as Record<string, unknown>,
    });

    res.status(result.accepted ? 202 : 200).json(result);
  } catch (error) {
    next(error);
  }
});
