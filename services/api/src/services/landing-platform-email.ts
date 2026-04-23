import nodemailer from "nodemailer";
import { Resend } from "resend";

let resend: Resend | null = null;
let smtpTransport: nodemailer.Transporter | null = null;

const DEFAULT_FROM = "Shasvata Portal <notifications@shasvata.com>";

function getPortalSender(): string {
  return (
    process.env["PORTAL_AUTH_FROM"]?.trim() ||
    process.env["PORTAL_MAGIC_LINK_FROM"]?.trim() ||
    DEFAULT_FROM
  );
}

function isConfiguredResendKey(value: string | undefined): value is string {
  const normalized = value?.trim();
  return Boolean(normalized) && normalized !== "REPLACE_ME";
}

function getResend(): Resend | null {
  const apiKey = process.env["RESEND_API_KEY"]?.trim();
  if (!isConfiguredResendKey(apiKey)) {
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

async function sendPortalEmail(input: {
  to: string;
  subject: string;
  html: string;
}) {
  const message = {
    from: getPortalSender(),
    to: [input.to],
    subject: input.subject,
    html: input.html,
  };

  const resendClient = getResend();
  if (resendClient) {
    await resendClient.emails.send(message);
    return;
  }

  const smtp = getSmtpTransport();
  if (smtp) {
    await smtp.sendMail(message);
    return;
  }

  throw new Error("No auth email transport is configured. Set RESEND_API_KEY or SMTP_*.");
}

function buildEmailShell(input: {
  eyebrow: string;
  title: string;
  body: string;
  buttonLabel: string;
  buttonUrl: string;
  footnote: string;
}) {
  return `
<!DOCTYPE html>
<html>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f8fafc; color: #0f172a; margin: 0; padding: 24px;">
    <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 28px;">
      <p style="font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #64748b; margin: 0 0 12px;">${input.eyebrow}</p>
      <h1 style="font-size: 24px; margin: 0 0 12px;">${input.title}</h1>
      <p style="font-size: 15px; line-height: 1.6; margin: 0 0 20px;">
        ${input.body}
      </p>
      <a href="${input.buttonUrl}" style="display: inline-block; background: #0f172a; color: #ffffff; text-decoration: none; border-radius: 999px; padding: 12px 18px; font-weight: 700;">
        ${input.buttonLabel}
      </a>
      <p style="font-size: 12px; color: #64748b; margin: 24px 0 0;">
        ${input.footnote}<br />
        <a href="${input.buttonUrl}" style="color: #2563eb;">${input.buttonUrl}</a>
      </p>
    </div>
  </body>
</html>
  `;
}

function formatInrMinor(amountMinor: number, currency: string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amountMinor / 100);
}

export async function sendPortalMagicLinkEmail(input: {
  email: string;
  magicLinkUrl: string;
}): Promise<void> {
  await sendPortalEmail({
    to: input.email,
    subject: "Your Shasvata portal sign-in link",
    html: buildEmailShell({
      eyebrow: "Shasvata Portal",
      title: "Sign in to your project workspace",
      body: "Use the secure link below to open your portal session. This sign-in link expires automatically after a short time.",
      buttonLabel: "Open Naya Portal",
      buttonUrl: input.magicLinkUrl,
      footnote: "If the button does not work, open this URL directly:",
    }),
  });
}

export async function sendPortalVerificationEmail(input: {
  email: string;
  verificationUrl: string;
}): Promise<void> {
  await sendPortalEmail({
    to: input.email,
    subject: "Verify your Shasvata account",
    html: buildEmailShell({
      eyebrow: "Shasvata Account",
      title: "Verify your email address",
      body: "Confirm your email to activate your workspace access and finish setting up your Shasvata account.",
      buttonLabel: "Verify Email",
      buttonUrl: input.verificationUrl,
      footnote: "If the button does not work, open this verification URL directly:",
    }),
  });
}

export async function sendPortalPasswordResetEmail(input: {
  email: string;
  resetUrl: string;
}): Promise<void> {
  await sendPortalEmail({
    to: input.email,
    subject: "Reset your Shasvata password",
    html: buildEmailShell({
      eyebrow: "Shasvata Account",
      title: "Reset your password",
      body: "Use the secure link below to choose a new password for your Shasvata workspace account.",
      buttonLabel: "Reset Password",
      buttonUrl: input.resetUrl,
      footnote: "If the button does not work, open this password reset URL directly:",
    }),
  });
}

export async function sendProjectGoLiveEmail(input: {
  email: string;
  projectName: string;
  liveUrl: string;
  previewUrl: string | null;
  clientCompanyName: string | null;
  goLiveAt: Date;
}): Promise<void> {
  const formattedTime = new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(input.goLiveAt);

  await sendPortalEmail({
    to: input.email,
    subject: `${input.projectName} is now live`,
    html: buildEmailShell({
      eyebrow: "Shasvata Launch",
      title: `${input.projectName} is live`,
      body: `${
        input.clientCompanyName ? `${input.clientCompanyName}'s ` : ""
      }landing workspace is now live on the custom domain. Go-live was recorded at ${formattedTime} IST.${
        input.previewUrl ? ` Preview was available earlier at ${input.previewUrl}.` : ""
      }`,
      buttonLabel: "Open Live Site",
      buttonUrl: input.liveUrl,
      footnote: "If the button does not work, open this live URL directly:",
    }),
  });
}

export async function sendPortalPaymentConfirmationEmail(input: {
  email: string;
  projectName: string;
  amountMinor: number;
  currency: string;
  billingUrl: string;
  providerOrderId: string | null;
  paidAt: Date;
}): Promise<void> {
  const formattedTime = new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(input.paidAt);

  await sendPortalEmail({
    to: input.email,
    subject: `Payment received for ${input.projectName}`,
    html: buildEmailShell({
      eyebrow: "Shasvata Billing",
      title: "Payment confirmed",
      body: `We received ${formatInrMinor(input.amountMinor, input.currency)} for ${input.projectName} on ${formattedTime} IST.${
        input.providerOrderId ? ` Reference: ${input.providerOrderId}.` : ""
      } Your billing workspace will continue to reflect the latest status as finance records sync.`,
      buttonLabel: "Open Billing Workspace",
      buttonUrl: input.billingUrl,
      footnote: "If the button does not work, open this billing URL directly:",
    }),
  });
}
