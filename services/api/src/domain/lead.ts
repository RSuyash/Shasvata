import { z } from "zod";

export const leadSchema = z.object({
  fullName: z.string().min(2).max(120),
  email: z.string().email().max(254),
  phone: z.string().max(30).optional(),
  companyName: z.string().min(1).max(200),
  companyType: z.enum(["startup", "sme", "brand", "enterprise", "freelancer", "other"]),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  serviceInterest: z.array(z.string()).min(1).max(10),
  budgetRange: z.string().min(1).max(50),
  timeline: z.string().min(1).max(50),
  problemSummary: z.string().min(10).max(2000),
  consent: z.literal(true),
  sourcePage: z.string().max(500).optional(),
  sourceCta: z.string().max(100).optional(),
  utmSource: z.string().max(200).optional(),
  utmMedium: z.string().max(200).optional(),
  utmCampaign: z.string().max(200).optional(),
  utmContent: z.string().max(200).optional(),
  utmTerm: z.string().max(200).optional(),
  gclid: z.string().max(200).optional(),
  gbraid: z.string().max(200).optional(),
  wbraid: z.string().max(200).optional(),
});

export type LeadPayload = z.infer<typeof leadSchema>;

export type LeadSubmissionInput = LeadPayload & {
  leadId: string;
};

export type LeadNotificationState = "RECEIVED" | "NOTIFIED" | "NOTIFICATION_FAILED";
