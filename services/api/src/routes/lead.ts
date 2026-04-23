import { Router, Request, Response, NextFunction } from "express";
import { rateLimit } from "express-rate-limit";
import { leadSchema } from "../domain/lead.js";
import {
  getProjectLeadNotificationDelivery,
  projectLeadSubmissionForPortal,
  saveLeadSubmission,
  updateLeadNotificationStatus,
} from "../services/leads.js";
import { notifyLeadSystem } from "../services/email.js";

export const leadRouter = Router();

// ─── Strict rate limit for lead submission ─────────────────
const leadLimiter = rateLimit({
  windowMs: Number(process.env["RATE_LIMIT_WINDOW_MS"] ?? 600_000), // 10 min default
  max: Number(process.env["RATE_LIMIT_MAX"] ?? 5),
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip ?? "unknown",
  message: { error: "Too many submissions. Please wait before trying again." },
});

// ─── Honeypot middleware ────────────────────────────────────
function honeypot(req: Request, res: Response, next: NextFunction) {
  const body = req.body as Record<string, unknown>;
  // If the honeypot field "website_url_extra" is filled, silently accept but don't process
  if (body["website_url_extra"]) {
    res.status(200).json({ success: true }); // fool bots
    return;
  }
  next();
}

// ─── POST /api/lead ────────────────────────────────────────
leadRouter.post("/lead", leadLimiter, honeypot, async (req, res) => {
  const parseResult = leadSchema.safeParse(req.body);

  if (!parseResult.success) {
    res.status(400).json({
      error: "Validation failed",
      issues: parseResult.error.issues.map((i) => ({
        field: i.path.join("."),
        message: i.message,
      })),
    });
    return;
  }

  const lead = parseResult.data;
  const leadId = `lead_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  let storedLead;
  let projectNotificationDelivery: {
    recipients: string[];
    dashboardUrl: string;
  } | null = null;
  try {
    storedLead = await saveLeadSubmission({ ...lead, leadId });
  } catch (err) {
    console.error("[postgres] Failed to save lead:", err);
    res.status(503).json({ error: "Lead capture temporarily unavailable" });
    return;
  }

  try {
    const projectedLead = await projectLeadSubmissionForPortal(storedLead);
    if (projectedLead?.projectId) {
      projectNotificationDelivery = await getProjectLeadNotificationDelivery(
        projectedLead.projectId,
      );
    }
  } catch (err) {
    console.error("[portal] Failed to project lead into the client dashboard:", err);
  }

  try {
    await notifyLeadSystem({ ...lead, leadId }, projectNotificationDelivery ?? undefined);
    await updateLeadNotificationStatus(leadId, "NOTIFIED");
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown notification error";
    console.error("[email] Failed to notify lead system:", err);
    try {
      await updateLeadNotificationStatus(leadId, "NOTIFICATION_FAILED", message);
    } catch (statusErr) {
      console.error("[postgres] Failed to update notification status:", statusErr);
    }
  }

  res.status(200).json({ success: true, leadId });
});
