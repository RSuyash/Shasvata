import type { MdocPushLeadSyncConfig } from "./landing-platform.js";

const DEFAULT_MDOC_SOURCE_DETAIL_RULES = {
  google: "Google Ad",
  cpc: "Google Ad",
  facebook: "Facebook",
  fb: "Facebook",
  meta: "Facebook",
  instagram: "Instagram",
  youtube: "Youtube",
  linkedin: "Linkedin",
  whatsapp: "WhatsApp",
} satisfies Record<string, string>;

const DEFAULT_MDOC_PREFERENCE_VALUES = [
  "1 BHK",
  "1.5 BHK",
  "2 BHK",
  "2.5 BHK",
  "3 BHK",
  "3.5 BHK",
  "4 BHK",
  "5 BHK",
  "6 BHK",
  "8 BHK",
  "Office",
  "Shop",
  "Studio",
] as const;

const DEFAULT_MDOC_BUDGET_VALUES = [
  "15 to 20 Lacs",
  "20 to 25 Lacs",
  "25 to 30 Lacs",
  "30 to 35 Lacs",
  "35 to 40 Lacs",
  "40 to 45 Lacs",
  "45 to 50 Lacs",
  "50 to 55 Lacs",
  "55 to 60 Lacs",
  "60 to 65 Lacs",
  "65 to 70 Lacs",
  "70 to 75 Lacs",
  "75 to 80 Lacs",
  "80 to 85 Lacs",
  "85 to 90 Lacs",
  "90 to 95 Lacs",
  "95 to 1 Crore",
  "1 to 1.5 Crore",
  "1.5 to 2 Crore",
  "2 to 2.5 Crore",
  "2.5 to 3 Crore",
  "3 to 3.5 Crore",
  "3.5 to 4 Crore",
  "4 to 4.5 Crore",
  "4.5 to 5 Crore",
  "5 Crore Above",
] as const;

const DEFAULT_MDOC_POSSESSION_VALUES = [
  "Ready To Move",
  "6 Month",
  "Within 1 Yr.",
  "Within 1.5 Yrs.",
  "Within 2 Yrs.",
  "Within 3 Yrs.",
] as const;

const DEFAULT_MDOC_AGE_RANGE_VALUES = [
  "0-10",
  "10-15",
  "15-20",
  "20-25",
  "25-30",
  "30-35",
  "35-40",
  "40-45",
  "45-50",
  "50-55",
  "55-60",
  "60-65",
  "65-70",
  "70-75",
  "75-80",
  "80-85",
] as const;

function createIdentityMapping(values: readonly string[]) {
  return Object.fromEntries(values.map((value) => [value, value])) as Record<string, string>;
}

export function buildDefaultMdocPushConfig(input: {
  endpoint: string;
  apiKey: string;
  dataFrom?: "T" | "E";
  source?: string;
  fallbackSourceDetail?: string;
}): MdocPushLeadSyncConfig {
  return {
    endpoint: input.endpoint.trim(),
    apiKey: input.apiKey.trim(),
    dataFrom: input.dataFrom === "T" ? "T" : "E",
    source: input.source?.trim() || "Digitals",
    fallbackSourceDetail: input.fallbackSourceDetail?.trim() || "Website",
    sourceDetailRules: { ...DEFAULT_MDOC_SOURCE_DETAIL_RULES },
    staticDefaults: {},
    enumMappings: {
      preferences: createIdentityMapping(DEFAULT_MDOC_PREFERENCE_VALUES),
      budgets: createIdentityMapping(DEFAULT_MDOC_BUDGET_VALUES),
      buyingPurposes: {
        "End Use": "End Use",
        "End Use / Self Use": "End Use",
        Investor: "Investment",
        Investment: "Investment",
        Both: "Both",
      },
      possessionReqs: createIdentityMapping(DEFAULT_MDOC_POSSESSION_VALUES),
      ageRanges: createIdentityMapping(DEFAULT_MDOC_AGE_RANGE_VALUES),
    },
  };
}

type MdocProjectContext = {
  id: string;
  name: string;
};

type MdocLeadContext = {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  message: string | null;
  sourcePage: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmTerm: string | null;
  gclid: string | null;
  gbraid: string | null;
  wbraid: string | null;
  serviceInterest: string[];
  budgetRange: string | null;
  timeline: string | null;
  problemSummary: string | null;
  createdAt: Date;
};

type BuildMdocPayloadInput = {
  project: MdocProjectContext;
  lead: MdocLeadContext;
  config: MdocPushLeadSyncConfig;
};

type MdocPayloadMetadata = {
  mappingWarnings: string[];
  sourceDetail: string;
};

export type BuiltMdocPayload = {
  formBody: URLSearchParams;
  metadata: MdocPayloadMetadata;
};

function sanitizeNameToken(value: string) {
  return value.replace(/[^A-Za-z]/g, "").trim();
}

export function splitLeadName(fullName: string) {
  const tokens = fullName
    .split(/\s+/)
    .map(sanitizeNameToken)
    .filter(Boolean);

  if (tokens.length === 0) {
    return {
      firstName: "Lead",
      middleName: "",
      lastName: "",
    };
  }

  if (tokens.length === 1) {
    return {
      firstName: tokens[0]!,
      middleName: "",
      lastName: "",
    };
  }

  return {
    firstName: tokens[0]!,
    middleName: tokens.slice(1, -1).join(" "),
    lastName: tokens.at(-1) ?? "",
  };
}

function normalizeIndianMobile(value: string | null | undefined) {
  const digits = (value ?? "").replace(/\D/g, "");
  if (!digits) {
    return "";
  }

  if (digits.length === 10) {
    return digits;
  }

  if (digits.length === 12 && digits.startsWith("91")) {
    return digits.slice(2);
  }

  return digits.slice(-10);
}

function trimToLength(value: string | null | undefined, maxLength: number) {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) {
    return "";
  }

  return trimmed.length > maxLength ? trimmed.slice(0, maxLength) : trimmed;
}

function buildIndiaLocalDate(value: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(value);
}

function readQueryParam(sourcePage: string | null | undefined, key: string) {
  if (!sourcePage) {
    return null;
  }

  try {
    const url = new URL(sourcePage);
    return url.searchParams.get(key);
  } catch {
    return null;
  }
}

export function deriveMdocSourceDetail(input: {
  gclid?: string | null;
  gbraid?: string | null;
  wbraid?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  sourcePage?: string | null;
  sourceDetailRules?: Record<string, string>;
  fallbackSourceDetail: string;
}) {
  const explicitClickId =
    input.gclid?.trim() ||
    input.gbraid?.trim() ||
    input.wbraid?.trim() ||
    readQueryParam(input.sourcePage, "gclid") ||
    readQueryParam(input.sourcePage, "gbraid") ||
    readQueryParam(input.sourcePage, "wbraid");

  if (explicitClickId) {
    return "Google Ad";
  }

  const rawSource = `${input.utmSource ?? ""} ${input.utmMedium ?? ""}`.trim().toLowerCase();
  const configuredRules = Object.fromEntries(
    Object.entries(input.sourceDetailRules ?? {}).map(([key, value]) => [key.toLowerCase(), value]),
  );

  for (const [needle, destination] of Object.entries(configuredRules)) {
    if (needle && rawSource.includes(needle)) {
      return destination;
    }
  }

  const defaults: Array<[string, string]> = [
    ["linkedin", "Linkedin"],
    ["facebook", "Facebook"],
    ["fb", "Facebook"],
    ["meta", "Facebook"],
    ["instagram", "Instagram"],
    ["youtube", "Youtube"],
    ["whatsapp", "WhatsApp"],
    ["google", "Google Ad"],
  ];

  for (const [needle, destination] of defaults) {
    if (rawSource.includes(needle)) {
      return destination;
    }
  }

  return input.fallbackSourceDetail;
}

function mapExactValue(
  fieldName: string,
  inputValue: string | null | undefined,
  mapping: Record<string, string> | undefined,
  warnings: string[],
) {
  const normalized = inputValue?.trim();
  if (!normalized) {
    return "";
  }

  if (!mapping) {
    warnings.push(fieldName);
    return "";
  }

  const mapped = mapping[normalized];
  if (!mapped) {
    warnings.push(fieldName);
    return "";
  }

  return mapped;
}

function buildSourceDescription(lead: MdocLeadContext) {
  return trimToLength(
    [
      lead.utmSource ? `src=${lead.utmSource}` : null,
      lead.utmMedium ? `med=${lead.utmMedium}` : null,
      lead.utmCampaign ? `cmp=${lead.utmCampaign}` : null,
      lead.utmContent ? `cnt=${lead.utmContent}` : null,
      lead.utmTerm ? `term=${lead.utmTerm}` : null,
    ]
      .filter(Boolean)
      .join(" | "),
    255,
  );
}

function buildRemark(lead: MdocLeadContext) {
  return trimToLength(
    [lead.problemSummary ?? lead.message ?? "", `Naya Lead ID: ${lead.id}`]
      .filter(Boolean)
      .join(" | "),
    500,
  );
}

export function buildMdocPayload(input: BuildMdocPayloadInput): BuiltMdocPayload {
  const mappingWarnings: string[] = [];
  const { firstName, middleName, lastName } = splitLeadName(input.lead.fullName);
  const sourceDetail = deriveMdocSourceDetail({
    gclid: input.lead.gclid,
    gbraid: input.lead.gbraid,
    wbraid: input.lead.wbraid,
    utmSource: input.lead.utmSource,
    utmMedium: input.lead.utmMedium,
    sourcePage: input.lead.sourcePage,
    sourceDetailRules: input.config.sourceDetailRules,
    fallbackSourceDetail: input.config.fallbackSourceDetail,
  });

  const formBody = new URLSearchParams();
  const push = (key: string, value: string | null | undefined) => {
    formBody.set(key, value?.trim() ?? "");
  };

  push("DataFrom", input.config.dataFrom);
  push("ApiKey", input.config.apiKey);
  push("EnquiryDate", buildIndiaLocalDate(input.lead.createdAt));
  push("Salutation", input.config.staticDefaults?.["Salutation"] ?? "");
  push("FirstName", firstName);
  push("MiddleName", middleName);
  push("LastName", lastName);
  push("DOB", input.config.staticDefaults?.["DOB"] ?? "");
  push("AgeRange", mapExactValue("ageRange", input.config.staticDefaults?.["AgeRange"], input.config.enumMappings?.ageRanges, mappingWarnings));
  push("PanNo", input.config.staticDefaults?.["PanNo"] ?? "");
  push("MobileNo", normalizeIndianMobile(input.lead.phone));
  push("WhatsAppNo", normalizeIndianMobile(input.config.staticDefaults?.["WhatsAppNo"] ?? input.lead.phone));
  push("AlternativeMobileNo", input.config.staticDefaults?.["AlternativeMobileNo"] ?? "");
  push("Email", trimToLength(input.lead.email, 254));
  push("Source", input.config.source);
  push("SourceDetail", sourceDetail);
  push("SourceDescription", buildSourceDescription(input.lead));
  push("Remark", buildRemark(input.lead));
  push(
    "Preferences",
    mapExactValue(
      "preferences",
      input.lead.serviceInterest[0] ?? null,
      input.config.enumMappings?.preferences,
      mappingWarnings,
    ),
  );
  push(
    "Budget",
    mapExactValue(
      "budgetRange",
      input.lead.budgetRange,
      input.config.enumMappings?.budgets,
      mappingWarnings,
    ),
  );
  push(
    "PossessionReq",
    mapExactValue(
      "timeline",
      input.lead.timeline,
      input.config.enumMappings?.possessionReqs,
      mappingWarnings,
    ),
  );
  push(
    "BuyingPurpose",
    mapExactValue(
      "buyingPurpose",
      input.config.staticDefaults?.["BuyingPurpose"] ?? "",
      input.config.enumMappings?.buyingPurposes,
      mappingWarnings,
    ),
  );
  push("BookingPlanWithin", input.config.staticDefaults?.["BookingPlanWithin"] ?? "");
  push("PreferredBankForLoan", input.config.staticDefaults?.["PreferredBankForLoan"] ?? "");
  push("PreferredLocation", input.config.staticDefaults?.["PreferredLocation"] ?? "");
  push("CurrentLivingPlace", input.config.staticDefaults?.["CurrentLivingPlace"] ?? "");
  push("NativePlace", input.config.staticDefaults?.["NativePlace"] ?? "");
  push("Industry", input.config.staticDefaults?.["Industry"] ?? "");
  push("CompanyName", input.config.staticDefaults?.["CompanyName"] ?? "");
  push("Country", input.config.staticDefaults?.["Country"] ?? "");
  push("State", input.config.staticDefaults?.["State"] ?? "");
  push("City", input.config.staticDefaults?.["City"] ?? "");
  push("PinCode", input.config.staticDefaults?.["PinCode"] ?? "");
  push("DigitalAgencyName", input.config.staticDefaults?.["DigitalAgencyName"] ?? "");

  for (let index = 1; index <= 10; index += 1) {
    push(`Udf${index}`, input.config.staticDefaults?.[`Udf${index}`] ?? "");
  }

  push("UtmCampaignSource", input.lead.utmSource ?? "");
  push("UtmCampaignName", input.lead.utmCampaign ?? "");
  push("UtmCampaignId", input.config.staticDefaults?.["UtmCampaignId"] ?? "");
  push("UtmCampaignAdId", input.config.staticDefaults?.["UtmCampaignAdId"] ?? "");
  push("UtmCampaignAdsetId", input.config.staticDefaults?.["UtmCampaignAdsetId"] ?? "");
  push("UtmCampaignMedium", input.lead.utmMedium ?? "");
  push("UtmCampaignContent", input.lead.utmContent ?? "");
  push("UtmCampaignTerm", input.lead.utmTerm ?? "");
  push("UtmCampaignCountry", input.config.staticDefaults?.["UtmCampaignCountry"] ?? "");
  push("UtmCampaignState", input.config.staticDefaults?.["UtmCampaignState"] ?? "");
  push("UtmCampaignCity", input.config.staticDefaults?.["UtmCampaignCity"] ?? "");
  push("UtmCampaignPincode", input.config.staticDefaults?.["UtmCampaignPincode"] ?? "");
  push("UtmAdGroup", input.config.staticDefaults?.["UtmAdGroup"] ?? "");
  push("UtmProjectId", input.project.id);
  push("UtmDevice", input.config.staticDefaults?.["UtmDevice"] ?? "");
  push("UtmDeviceModel", input.config.staticDefaults?.["UtmDeviceModel"] ?? "");
  push("UtmExtensionId", input.config.staticDefaults?.["UtmExtensionId"] ?? "");

  return {
    formBody,
    metadata: {
      mappingWarnings: Array.from(new Set(mappingWarnings)),
      sourceDetail,
    },
  };
}

export async function pushLeadToMdoc(input: BuildMdocPayloadInput & { endpoint?: string }) {
  const payload = buildMdocPayload(input);
  const response = await fetch(input.endpoint ?? input.config.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: payload.formBody,
  });

  const responseBody = await response.text();
  if (!response.ok) {
    throw new Error(
      `MDOC push failed (${response.status}): ${responseBody || "Unknown error."}`,
    );
  }

  return {
    responseCode: response.status,
    responseBody,
    metadata: payload.metadata,
  };
}
