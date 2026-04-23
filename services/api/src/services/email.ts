import nodemailer from "nodemailer";
import { Resend } from "resend";
import type { LeadPayload } from "../domain/lead.js";

let resend: Resend | null = null;
let smtpTransport: nodemailer.Transporter | null = null;
const DEFAULT_LEAD_NOTIFICATION_FROM = "Shasvata Leads <notifications@shasvata.com>";
const DEFAULT_LEAD_NOTIFICATION_TO = "forms@shasvata.com";
const DEFAULT_LEAD_NOTIFICATION_REPLY_TO = "hello@shasvata.com";
const DEFAULT_LEAD_DASHBOARD_URL = "https://shasvata.com/app/projects";
const DEFAULT_LEAD_LOGO_URL = "https://shasvata.com/logo.png";

function getResend(): Resend | null {
  const apiKey = process.env["RESEND_API_KEY"]?.trim();
  if (!apiKey || apiKey === "REPLACE_ME") {
    return null;
  }

  if (!resend) {
    resend = new Resend(apiKey);
  }
  return resend;
}

function getSmtpTransport(): nodemailer.Transporter | null {
  const host = process.env["SMTP_HOST"]?.trim();
  const portValue = process.env["SMTP_PORT"]?.trim();
  const user = process.env["SMTP_USER"]?.trim();
  const password = process.env["SMTP_PASSWORD"]?.trim();

  if (!host || !portValue || !user || !password) {
    return null;
  }

  if (!smtpTransport) {
    const port = Number(portValue);
    smtpTransport = nodemailer.createTransport({
      host,
      port,
      secure:
        (process.env["SMTP_SECURE"]?.trim().toLowerCase() ?? "") === "true" || port === 465,
      auth: {
        user,
        pass: password,
      },
    });
  }

  return smtpTransport;
}

function getLeadNotificationSender(): string {
  return process.env["LEAD_NOTIFICATION_FROM"]?.trim() || DEFAULT_LEAD_NOTIFICATION_FROM;
}

function parseRecipients(value: string | null | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((recipient) => recipient.trim())
    .filter(Boolean);
}

function getLeadNotificationRecipients(projectRecipients?: string[]): string[] {
  const configured =
    process.env["LEAD_NOTIFICATION_TO"]?.trim() || DEFAULT_LEAD_NOTIFICATION_TO;
  const globalRecipients = parseRecipients(configured);
  const mergedRecipients = Array.from(
    new Set([...globalRecipients, ...(projectRecipients ?? []).map((recipient) => recipient.trim())]),
  ).filter(Boolean);

  return mergedRecipients.length > 0 ? mergedRecipients : [DEFAULT_LEAD_NOTIFICATION_TO];
}

function getLeadNotificationReplyTo(): string {
  return process.env["LEAD_NOTIFICATION_REPLY_TO"]?.trim() || DEFAULT_LEAD_NOTIFICATION_REPLY_TO;
}

function getLeadNotificationSuppressionPatterns(): string[] {
  return parseRecipients(process.env["LEAD_NOTIFICATION_SUPPRESS_EMAIL_PATTERNS"]);
}

export function shouldSuppressLeadNotification(email: string): boolean {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) {
    return false;
  }

  return getLeadNotificationSuppressionPatterns().some((pattern) => {
    const normalizedPattern = pattern.trim().toLowerCase();
    if (!normalizedPattern) {
      return false;
    }

    if (normalizedPattern.startsWith("@")) {
      return normalizedEmail.endsWith(normalizedPattern);
    }

    return normalizedEmail === normalizedPattern;
  });
}

function getLeadNotificationDashboardUrl(explicitDashboardUrl?: string): string {
  return (
    explicitDashboardUrl?.trim() ||
    process.env["LEAD_NOTIFICATION_DASHBOARD_URL"]?.trim() ||
    DEFAULT_LEAD_DASHBOARD_URL
  );
}

function getLeadNotificationEnvelopeFrom(): string | undefined {
  const configuredEnvelopeFrom = process.env["LEAD_NOTIFICATION_SMTP_ENVELOPE_FROM"]?.trim();
  if (configuredEnvelopeFrom) {
    return configuredEnvelopeFrom;
  }

  const smtpUser = process.env["SMTP_USER"]?.trim();
  return smtpUser || undefined;
}

function escapeHtml(value: string | null | undefined): string {
  if (!value) {
    return "";
  }

  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderField(label: string, value: string | null | undefined, options?: { href?: string }) {
  if (!value) {
    return "";
  }

  const renderedValue = options?.href
    ? `<a href="${escapeHtml(options.href)}" style="color:#0f172a;text-decoration:none;">${escapeHtml(value)}</a>`
    : escapeHtml(value);

  return `
    <tr>
      <td style="padding:0 0 14px;vertical-align:top;">
        <div style="font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#64748b;margin-bottom:4px;">${escapeHtml(label)}</div>
        <div style="font-size:15px;line-height:1.55;color:#0f172a;">${renderedValue}</div>
      </td>
    </tr>
  `;
}

export function buildLeadNotificationEmail(
  lead: LeadPayload & { leadId: string },
  options?: {
    recipients?: string[];
    dashboardUrl?: string;
  },
) {
  const submittedAt = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  });
  const serviceInterestBadges = lead.serviceInterest
    .map(
      (service) =>
        `<span style="display:inline-block;margin:4px 6px 0 0;padding:6px 10px;border-radius:999px;background:#e0f2fe;color:#075985;font-size:12px;font-weight:600;">${escapeHtml(service)}</span>`,
    )
    .join("");
  const utmValue = lead.utmSource
    ? `${lead.utmSource}${lead.utmMedium ? ` / ${lead.utmMedium}` : ""}${lead.utmCampaign ? ` / ${lead.utmCampaign}` : ""}`
    : null;
  const dashboardUrl = getLeadNotificationDashboardUrl(options?.dashboardUrl);

  return {
    from: getLeadNotificationSender(),
    replyTo: getLeadNotificationReplyTo(),
    to: getLeadNotificationRecipients(options?.recipients),
    subject: `New Lead: ${lead.fullName} - ${lead.companyName}`,
    html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:24px;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#0f172a;">
  <div style="max-width:620px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:22px;overflow:hidden;box-shadow:0 12px 40px rgba(15,23,42,0.08);">
    <div style="padding:24px 28px 18px;background:linear-gradient(135deg,#0f172a 0%,#1d4ed8 100%);">
      <img src="${DEFAULT_LEAD_LOGO_URL}" alt="Shasvata" style="height:34px;width:auto;display:block;margin-bottom:18px;" />
      <div style="font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:rgba(255,255,255,0.72);margin-bottom:8px;">Shasvata Leads</div>
      <div style="font-size:28px;line-height:1.15;font-weight:700;color:#ffffff;">Lead received</div>
      <div style="margin-top:8px;font-size:14px;line-height:1.5;color:rgba(255,255,255,0.82);">
        ${escapeHtml(lead.fullName)} from ${escapeHtml(lead.companyName)} just submitted a new enquiry.
      </div>
      <div style="margin-top:14px;font-size:12px;color:rgba(255,255,255,0.72);">${escapeHtml(submittedAt)} IST</div>
    </div>

    <div style="padding:28px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;">
        ${renderField("Contact", lead.fullName)}
        ${renderField("Email", lead.email, { href: `mailto:${lead.email}` })}
        ${renderField("Phone / WhatsApp", lead.phone)}
        ${renderField("Company", `${lead.companyName} (${lead.companyType})`)}
        ${renderField("Website", lead.websiteUrl, lead.websiteUrl ? { href: lead.websiteUrl } : undefined)}
        ${renderField("Budget", lead.budgetRange)}
        ${renderField("Timeline", lead.timeline)}
        ${renderField("CTA", lead.sourceCta)}
        ${renderField("Source page", lead.sourcePage, lead.sourcePage ? { href: lead.sourcePage } : undefined)}
        ${renderField("UTM", utmValue)}
      </table>

      <div style="margin:8px 0 18px;">
        <div style="font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#64748b;margin-bottom:8px;">Service interest</div>
        <div>${serviceInterestBadges}</div>
      </div>

      <div style="margin:0 0 20px;padding:18px 18px 16px;border:1px solid #dbeafe;border-radius:16px;background:#eff6ff;">
        <div style="font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#1d4ed8;margin-bottom:8px;">Problem summary</div>
        <div style="font-size:14px;line-height:1.7;color:#1e293b;">${escapeHtml(lead.problemSummary)}</div>
      </div>

      <div style="display:flex;flex-wrap:wrap;gap:12px;margin:0 0 22px;">
        <a href="${escapeHtml(dashboardUrl)}" style="display:inline-block;padding:13px 18px;border-radius:999px;background:#0f172a;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;">
          Open lead inbox
        </a>
        <a href="mailto:${escapeHtml(lead.email)}?subject=Re:%20Your%20Naya%20Growth%20Enquiry" style="display:inline-block;padding:13px 18px;border-radius:999px;background:#eff6ff;color:#1d4ed8;text-decoration:none;font-size:14px;font-weight:700;">
          Reply to ${escapeHtml(lead.fullName.split(" ")[0] ?? lead.fullName)}
        </a>
      </div>

      <div style="padding-top:18px;border-top:1px solid #e2e8f0;font-size:12px;line-height:1.7;color:#64748b;">
        <div><strong style="color:#0f172a;">Lead ID:</strong> <span style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace;">${escapeHtml(lead.leadId)}</span></div>
        <div><strong style="color:#0f172a;">Storage:</strong> PostgreSQL lead archive</div>
        <div><strong style="color:#0f172a;">Reply-To:</strong> ${escapeHtml(getLeadNotificationReplyTo())}</div>
      </div>
    </div>
  </div>
</body>
</html>
    `,
  };
}

export async function notifyLeadSystem(
  lead: LeadPayload & { leadId: string },
  options?: {
    recipients?: string[];
    dashboardUrl?: string;
  },
): Promise<void> {
  if (shouldSuppressLeadNotification(lead.email)) {
    return;
  }

  const message = buildLeadNotificationEmail(lead, options);
  const resendClient = getResend();
  if (resendClient) {
    await resendClient.emails.send(message);
    return;
  }

  const smtp = getSmtpTransport();
  if (smtp) {
    const envelopeFrom = getLeadNotificationEnvelopeFrom();

    await smtp.sendMail({
      from: message.from,
      replyTo: message.replyTo,
      to: message.to,
      subject: message.subject,
      html: message.html,
      envelope: envelopeFrom
        ? {
            from: envelopeFrom,
            to: message.to,
          }
        : undefined,
    });
    return;
  }

  throw new Error("No lead email transport is configured. Set RESEND_API_KEY or SMTP_*.");
}

export async function notifyFounder(
  lead: LeadPayload & { leadId: string },
): Promise<void> {
  await notifyLeadSystem(lead);
}
