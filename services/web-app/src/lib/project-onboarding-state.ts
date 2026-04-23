export type ProjectOnboardingDraft = {
  projectName: string;
  projectType: string;
  launchGoal: string;
  targetAudience: string;
  driveLink: string;
  referenceUrls: string[];
  brandTone: string;
  primaryColor: string;
  secondaryColor: string;
  heroHeading: string;
  heroSubheading: string;
  primaryCta: string;
  requestedSections: string[];
  extraPages: string;
  legalPagesReady: boolean;
  legalNotes: string;
  mahareraNumber: string;
  businessAddress: string;
  supportNotes: string;
};

function readString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function readStringList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((entry): entry is string => typeof entry === "string")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function createEmptyProjectOnboardingDraft(): ProjectOnboardingDraft {
  return {
    projectName: "",
    projectType: "",
    launchGoal: "",
    targetAudience: "",
    driveLink: "",
    referenceUrls: [],
    brandTone: "",
    primaryColor: "",
    secondaryColor: "",
    heroHeading: "",
    heroSubheading: "",
    primaryCta: "",
    requestedSections: [],
    extraPages: "",
    legalPagesReady: false,
    legalNotes: "",
    mahareraNumber: "",
    businessAddress: "",
    supportNotes: "",
  };
}

export function coerceProjectOnboardingDraft(
  value: Record<string, unknown> | null | undefined,
): ProjectOnboardingDraft {
  const empty = createEmptyProjectOnboardingDraft();
  const source = value ?? {};

  return {
    ...empty,
    projectName: readString(source["projectName"]),
    projectType: readString(source["projectType"]),
    launchGoal: readString(source["launchGoal"]),
    targetAudience: readString(source["targetAudience"]),
    driveLink: readString(source["driveLink"]),
    referenceUrls: readStringList(source["referenceUrls"]),
    brandTone: readString(source["brandTone"]),
    primaryColor: readString(source["primaryColor"]),
    secondaryColor: readString(source["secondaryColor"]),
    heroHeading: readString(source["heroHeading"]),
    heroSubheading: readString(source["heroSubheading"]),
    primaryCta: readString(source["primaryCta"]),
    requestedSections: readStringList(source["requestedSections"]),
    extraPages: readString(source["extraPages"]),
    legalPagesReady: source["legalPagesReady"] === true,
    legalNotes: readString(source["legalNotes"]),
    mahareraNumber: readString(source["mahareraNumber"]),
    businessAddress: readString(source["businessAddress"]),
    supportNotes: readString(source["supportNotes"]),
  };
}

export function serializeProjectOnboardingDraft(
  draft: ProjectOnboardingDraft,
): Record<string, unknown> {
  return {
    ...draft,
    projectName: draft.projectName.trim(),
    projectType: draft.projectType.trim(),
    launchGoal: draft.launchGoal.trim(),
    targetAudience: draft.targetAudience.trim(),
    driveLink: draft.driveLink.trim(),
    referenceUrls: draft.referenceUrls.map((entry) => entry.trim()).filter(Boolean),
    brandTone: draft.brandTone.trim(),
    primaryColor: draft.primaryColor.trim(),
    secondaryColor: draft.secondaryColor.trim(),
    heroHeading: draft.heroHeading.trim(),
    heroSubheading: draft.heroSubheading.trim(),
    primaryCta: draft.primaryCta.trim(),
    requestedSections: draft.requestedSections
      .map((entry) => entry.trim())
      .filter(Boolean),
    extraPages: draft.extraPages.trim(),
    legalNotes: draft.legalNotes.trim(),
    mahareraNumber: draft.mahareraNumber.trim(),
    businessAddress: draft.businessAddress.trim(),
    supportNotes: draft.supportNotes.trim(),
  };
}
