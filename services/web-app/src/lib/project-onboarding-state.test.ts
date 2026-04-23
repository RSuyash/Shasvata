import { describe, expect, it } from "vitest";
import {
  coerceProjectOnboardingDraft,
  createEmptyProjectOnboardingDraft,
  serializeProjectOnboardingDraft,
} from "./project-onboarding-state";

describe("createEmptyProjectOnboardingDraft", () => {
  it("returns the baseline wizard shape for new onboarding sessions", () => {
    expect(createEmptyProjectOnboardingDraft()).toMatchObject({
      projectName: "",
      projectType: "",
      launchGoal: "",
      targetAudience: "",
      driveLink: "",
      referenceUrls: [],
      requestedSections: [],
      legalPagesReady: false,
      mahareraNumber: "",
    });
  });
});

describe("coerceProjectOnboardingDraft", () => {
  it("normalizes persisted onboarding intake into a typed draft", () => {
    const draft = coerceProjectOnboardingDraft({
      projectName: "Wagholi Highstreet April Launch",
      referenceUrls: ["https://example.com/one", "", "https://example.com/two"],
      requestedSections: ["Hero", "Amenities", "FAQ"],
      legalPagesReady: true,
      primaryColor: "#0F172A",
      supportNotes: "Need launch by mid April",
    });

    expect(draft.projectName).toBe("Wagholi Highstreet April Launch");
    expect(draft.referenceUrls).toEqual([
      "https://example.com/one",
      "https://example.com/two",
    ]);
    expect(draft.requestedSections).toEqual(["Hero", "Amenities", "FAQ"]);
    expect(draft.legalPagesReady).toBe(true);
    expect(draft.primaryColor).toBe("#0F172A");
  });
});

describe("serializeProjectOnboardingDraft", () => {
  it("removes empty list values before saving the onboarding draft", () => {
    const payload = serializeProjectOnboardingDraft({
      ...createEmptyProjectOnboardingDraft(),
      projectName: "Wagholi Highstreet April Launch",
      referenceUrls: ["https://example.com", "   ", ""],
      requestedSections: ["Hero", "", "FAQ"],
      legalPagesReady: true,
    });

    expect(payload.referenceUrls).toEqual(["https://example.com"]);
    expect(payload.requestedSections).toEqual(["Hero", "FAQ"]);
    expect(payload.legalPagesReady).toBe(true);
  });
});
