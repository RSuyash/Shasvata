import { describe, it, expect } from "vitest";
import { leadSchema } from "../domain/lead.js";

const validPayload = {
  fullName: "Riya Patel",
  email: "riya@acme.co",
  companyName: "Acme Corp",
  companyType: "startup" as const,
  serviceInterest: ["growth"],
  budgetRange: "50k-150k",
  timeline: "1-month",
  problemSummary: "Our marketing has no visibility into what is working.",
  consent: true as const,
};

describe("Lead schema validation", () => {
  it("accepts a valid payload", () => {
    const result = leadSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it("rejects short fullName", () => {
    const result = leadSchema.safeParse({ ...validPayload, fullName: "A" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = leadSchema.safeParse({ ...validPayload, email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("rejects empty serviceInterest", () => {
    const result = leadSchema.safeParse({ ...validPayload, serviceInterest: [] });
    expect(result.success).toBe(false);
  });

  it("rejects short problemSummary", () => {
    const result = leadSchema.safeParse({ ...validPayload, problemSummary: "short" });
    expect(result.success).toBe(false);
  });

  it("rejects missing consent", () => {
    const { consent, ...noConsent } = validPayload;
    expect(consent).toBe(true);
    const result = leadSchema.safeParse(noConsent);
    expect(result.success).toBe(false);
  });

  it("rejects false consent", () => {
    const result = leadSchema.safeParse({ ...validPayload, consent: false });
    expect(result.success).toBe(false);
  });

  it("accepts optional phone", () => {
    const result = leadSchema.safeParse({ ...validPayload, phone: "+91 98765 43210" });
    expect(result.success).toBe(true);
  });

  it("accepts missing websiteUrl", () => {
    const result = leadSchema.safeParse({ ...validPayload, websiteUrl: undefined });
    expect(result.success).toBe(true);
  });

  it("accepts empty string websiteUrl", () => {
    const result = leadSchema.safeParse({ ...validPayload, websiteUrl: "" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid companyType", () => {
    const result = leadSchema.safeParse({ ...validPayload, companyType: "invalid" });
    expect(result.success).toBe(false);
  });
});
