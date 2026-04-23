import { beforeEach, describe, expect, it, vi } from "vitest";

const sendMail = vi.fn();
const createTransport = vi.fn(() => ({
  sendMail,
}));
const resendSend = vi.fn();
const Resend = vi.fn().mockImplementation(() => ({
  emails: {
    send: resendSend,
  },
}));

vi.mock("nodemailer", () => ({
  default: {
    createTransport,
  },
}));

vi.mock("resend", () => ({
  Resend,
}));

describe("landing platform email transport", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();

    delete process.env["PORTAL_AUTH_FROM"];
    delete process.env["RESEND_API_KEY"];
    delete process.env["SMTP_HOST"];
    delete process.env["SMTP_PORT"];
    delete process.env["SMTP_SECURE"];
    delete process.env["SMTP_USER"];
    delete process.env["SMTP_PASSWORD"];
  });

  it("falls back to SMTP when RESEND_API_KEY is still a placeholder", async () => {
    process.env["RESEND_API_KEY"] = "REPLACE_ME";
    process.env["SMTP_HOST"] = "mail.shasvata.com";
    process.env["SMTP_PORT"] = "587";
    process.env["SMTP_SECURE"] = "false";
    process.env["SMTP_USER"] = "system@shasvata.com";
    process.env["SMTP_PASSWORD"] = "smtp-secret";

    const { sendPortalVerificationEmail } = await import("./landing-platform-email.js");

    await sendPortalVerificationEmail({
      email: "admin@shasvata.com",
      verificationUrl: "https://shasvata.com/app/auth/verify?selector=test&verifier=test",
    });

    expect(Resend).not.toHaveBeenCalled();
    expect(createTransport).toHaveBeenCalledOnce();
    expect(sendMail).toHaveBeenCalledOnce();
  });

  it("can send a portal payment confirmation email through SMTP", async () => {
    process.env["SMTP_HOST"] = "mail.shasvata.com";
    process.env["SMTP_PORT"] = "587";
    process.env["SMTP_SECURE"] = "false";
    process.env["SMTP_USER"] = "system@shasvata.com";
    process.env["SMTP_PASSWORD"] = "smtp-secret";

    const { sendPortalPaymentConfirmationEmail } = await import("./landing-platform-email.js");

    await sendPortalPaymentConfirmationEmail({
      email: "client@example.com",
      projectName: "Wagholi Highstreet",
      amountMinor: 479700,
      currency: "INR",
      billingUrl: "https://shasvata.com/app/dashboard/projects/project_demo/billing",
      providerOrderId: "naya_order_demo",
      paidAt: new Date("2026-04-08T12:00:00.000Z"),
    });

    expect(sendMail).toHaveBeenCalledOnce();
    expect(sendMail.mock.calls[0]?.[0]).toMatchObject({
      subject: "Payment received for Wagholi Highstreet",
      to: ["client@example.com"],
    });
  });
});
