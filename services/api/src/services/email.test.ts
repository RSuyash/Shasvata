import { describe, expect, it } from "vitest";
import type { LeadPayload } from "../domain/lead.js";
import { buildLeadNotificationEmail, shouldSuppressLeadNotification } from "./email.js";

const lead: LeadPayload & { leadId: string } = {
  leadId: "lead_123",
  fullName: "Riya Patel",
  email: "riya@acme.co",
  phone: "+91 98765 43210",
  companyName: "Acme Corp",
  companyType: "startup",
  websiteUrl: "https://acme.co",
  serviceInterest: ["Growth Audit", "Automation & CRM Setup"],
  budgetRange: "75k-2.5L/month",
  timeline: "Within 30 days",
  problemSummary: "We have inbound demand, but no reliable operating layer behind lead handling.",
  consent: true,
  sourcePage: "/contact",
  sourceCta: "Book a Growth Audit",
  utmSource: "linkedin",
  utmMedium: "social",
  utmCampaign: "launch",
};

describe("buildLeadNotificationEmail", () => {
  it("routes operational lead notifications through system mailboxes instead of founder mailboxes", () => {
    const message = buildLeadNotificationEmail(lead);

    expect(message.from).toBe("Shasvata Leads <notifications@shasvata.com>");
    expect(message.replyTo).toBe("hello@shasvata.com");
    expect(message.to).toEqual(["forms@shasvata.com"]);
    expect(message.subject).toContain("New Lead");
    expect(message.html).toContain("Lead ID");
    expect(message.html).toContain("Growth Audit");
    expect(message.html).toContain("Lead received");
    expect(message.html).toContain("Open lead inbox");
    expect(message.html).toContain("https://shasvata.com/logo.png");
  });

  it("allows notification addresses to be overridden from env for rollout safety", () => {
    process.env["LEAD_NOTIFICATION_FROM"] = "Shasvata Ops <ops@shasvata.com>";
    process.env["LEAD_NOTIFICATION_TO"] = "suyash@shasvata.com,shivam@shasvata.com";
    process.env["LEAD_NOTIFICATION_REPLY_TO"] = "hello@shasvata.com";

    const message = buildLeadNotificationEmail(lead);

    expect(message.from).toBe("Shasvata Ops <ops@shasvata.com>");
    expect(message.to).toEqual(["suyash@shasvata.com", "shivam@shasvata.com"]);
    expect(message.replyTo).toBe("hello@shasvata.com");

    delete process.env["LEAD_NOTIFICATION_FROM"];
    delete process.env["LEAD_NOTIFICATION_TO"];
    delete process.env["LEAD_NOTIFICATION_REPLY_TO"];
  });

  it("adds project-specific recipients on top of the default Naya inbox for delivery safety", () => {
    process.env["LEAD_NOTIFICATION_TO"] = "forms@shasvata.com";

    const message = buildLeadNotificationEmail(lead, {
      recipients: ["builder@example.com", "sales@example.com", "forms@shasvata.com"],
    });

    expect(message.to).toEqual([
      "forms@shasvata.com",
      "builder@example.com",
      "sales@example.com",
    ]);

    delete process.env["LEAD_NOTIFICATION_TO"];
  });

  it("allows an explicit dashboard inbox URL override for client-specific notifications", () => {
    process.env["LEAD_NOTIFICATION_DASHBOARD_URL"] =
      "https://shasvata.com/app/projects/cmnas1dle0000o75tcdz2y2gy";

    const message = buildLeadNotificationEmail(lead);

    expect(message.html).toContain(
      "https://shasvata.com/app/projects/cmnas1dle0000o75tcdz2y2gy",
    );

    delete process.env["LEAD_NOTIFICATION_DASHBOARD_URL"];
  });

  it("prefers an explicit project dashboard URL when one is provided", () => {
    const message = buildLeadNotificationEmail(lead, {
      dashboardUrl: "https://shasvata.com/app/projects/project_wagholi",
    });

    expect(message.html).toContain("https://shasvata.com/app/projects/project_wagholi");
  });

  it("supports suffix-based suppression for synthetic monitoring leads", () => {
    process.env["LEAD_NOTIFICATION_SUPPRESS_EMAIL_PATTERNS"] =
      "@monitoring.shasvata.invalid,exact@example.com";

    expect(shouldSuppressLeadNotification("probe@monitoring.shasvata.invalid")).toBe(true);
    expect(shouldSuppressLeadNotification("exact@example.com")).toBe(true);
    expect(shouldSuppressLeadNotification("riya@acme.co")).toBe(false);

    delete process.env["LEAD_NOTIFICATION_SUPPRESS_EMAIL_PATTERNS"];
  });
});
