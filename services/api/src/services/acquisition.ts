import crypto from "node:crypto";
import { Prisma, type LeadSourceConnectorStatus, type LeadSourceKind } from "@prisma/client";
import { parse } from "csv-parse/sync";
import { prisma } from "../lib/prisma.js";
import { syncProjectLeadDestinations } from "./leads.js";

const LEAD_SOURCE_KINDS = [
  "WEB_FORM",
  "MANUAL_ENTRY",
  "EVENT_IMPORT",
  "CSV_IMPORT",
  "META_LEAD_ADS",
  "LINKEDIN_LEAD_GEN",
  "GOOGLE_ADS",
] as const;

const EXTERNAL_CONNECTOR_DEFAULTS: Array<{
  kind: LeadSourceKind;
  label: string;
}> = [
  { kind: "META_LEAD_ADS", label: "Meta Lead Ads" },
  { kind: "LINKEDIN_LEAD_GEN", label: "LinkedIn Lead Gen Forms" },
  { kind: "GOOGLE_ADS", label: "Google Ads Campaign Sync" },
];

const acquisitionLeadInclude = {
  sourceConnector: {
    select: {
      label: true,
    },
  },
  acquisitionCampaign: {
    select: {
      name: true,
    },
  },
  importBatch: {
    select: {
      id: true,
      label: true,
      filename: true,
    },
  },
} satisfies Prisma.ProjectLeadInclude;

type AcquisitionLeadRecord = Prisma.ProjectLeadGetPayload<{
  include: typeof acquisitionLeadInclude;
}>;

type PortalProjectAccess = {
  portalUser: {
    id: string;
    role: "PLATFORM_ADMIN" | "PLATFORM_OPERATOR" | "CLIENT";
  };
  project: {
    id: string;
    name: string;
    primaryDomain: string | null;
  };
};

export type CsvFieldMapping = Partial<{
  fullName: string;
  email: string;
  phone: string;
  companyName: string;
  message: string;
  sourcePage: string;
  sourceCta: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  externalLeadId: string;
  capturedAt: string;
}>;

export type ParsedCsvLeadRow =
  | {
      rowNumber: number;
      lead: ParsedCsvLead;
    }
  | {
      rowNumber: number;
      error: string;
    };

export type ParsedCsvLead = {
  fullName?: string;
  email: string;
  phone?: string;
  companyName?: string;
  message?: string;
  sourcePage?: string;
  sourceCta?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  externalLeadId?: string;
  capturedAt?: string;
};

export type AcquisitionCampaignMatchCandidate = {
  id: string;
  utmSource?: string | null;
  utmCampaign?: string | null;
  externalCampaignId?: string | null;
};

export type InboundLeadInput = {
  projectId: string;
  sourceKind: LeadSourceKind;
  connectorId?: string | null;
  campaignId?: string | null;
  importBatchId?: string | null;
  externalLeadId?: string | null;
  capturedAt?: string | Date | null;
  eventName?: string | null;
  lead: {
    fullName?: string | null;
    email: string;
    phone?: string | null;
    companyName?: string | null;
    message?: string | null;
    consent?: boolean | null;
    sourcePage?: string | null;
    sourceCta?: string | null;
    utmSource?: string | null;
    utmMedium?: string | null;
    utmCampaign?: string | null;
  };
  rawPayload?: Record<string, unknown> | null;
};

function normalizeText(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function normalizeNullableText(value: unknown): string | null {
  return normalizeText(value) ?? null;
}

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function isOperatorRole(role: PortalProjectAccess["portalUser"]["role"]): boolean {
  return role === "PLATFORM_ADMIN" || role === "PLATFORM_OPERATOR";
}

function normalizeComparable(value: string | null | undefined): string {
  return value?.trim().toLowerCase() ?? "";
}

function readMappedValue(
  record: Record<string, unknown>,
  mapping: CsvFieldMapping,
  field: keyof CsvFieldMapping,
): string | undefined {
  const column = mapping[field];
  if (!column) {
    return undefined;
  }

  return normalizeText(record[column]);
}

function normalizeSourceKind(value: unknown, fallback: LeadSourceKind): LeadSourceKind {
  return LEAD_SOURCE_KINDS.includes(value as LeadSourceKind)
    ? (value as LeadSourceKind)
    : fallback;
}

function normalizeConnectorStatus(value: unknown): LeadSourceConnectorStatus | undefined {
  return value === "ACTIVE" || value === "INACTIVE" || value === "NEEDS_AUTH" || value === "ERROR"
    ? value
    : undefined;
}

function deriveEncryptionKey(secret: string): Buffer {
  return crypto.createHash("sha256").update(secret).digest();
}

function readIntegrationEncryptionKey(explicitKey?: string): string {
  const value = explicitKey ?? process.env["NAYA_INTEGRATION_ENCRYPTION_KEY"];
  if (!value?.trim()) {
    throw new Error("NAYA_INTEGRATION_ENCRYPTION_KEY is required.");
  }

  return value.trim();
}

function parseCapturedAt(value: string | Date | null | undefined): Date | null {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Lead capturedAt is invalid.");
  }

  return date;
}

function getOriginHost(sourcePage: string | null): string | null {
  if (!sourcePage) {
    return null;
  }

  try {
    return new URL(sourcePage).host.trim().toLowerCase();
  } catch {
    return null;
  }
}

function toJsonRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function mapConnector(record: {
  id: string;
  projectId: string;
  kind: LeadSourceKind;
  status: LeadSourceConnectorStatus;
  label: string;
  externalAccountId: string | null;
  config: Prisma.JsonValue | null;
  metadata: Prisma.JsonValue | null;
  lastCheckedAt: Date | null;
  lastSyncAt: Date | null;
  lastError: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: record.id,
    projectId: record.projectId,
    kind: record.kind,
    status: record.status,
    label: record.label,
    externalAccountId: record.externalAccountId,
    config: toJsonRecord(record.config),
    metadata: toJsonRecord(record.metadata),
    lastCheckedAt: record.lastCheckedAt,
    lastSyncAt: record.lastSyncAt,
    lastError: record.lastError,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

function mapCampaign(record: {
  id: string;
  projectId: string;
  connectorId: string | null;
  accountId: string | null;
  provider: LeadSourceKind;
  externalCampaignId: string | null;
  name: string;
  status: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  metadata: Prisma.JsonValue | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: record.id,
    projectId: record.projectId,
    connectorId: record.connectorId,
    accountId: record.accountId,
    provider: record.provider,
    externalCampaignId: record.externalCampaignId,
    name: record.name,
    status: record.status,
    utmSource: record.utmSource,
    utmMedium: record.utmMedium,
    utmCampaign: record.utmCampaign,
    metadata: toJsonRecord(record.metadata),
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

function mapImportBatch(record: {
  id: string;
  projectId: string;
  connectorId: string | null;
  sourceKind: LeadSourceKind;
  status: "PENDING" | "IMPORTED" | "PARTIAL" | "FAILED";
  label: string | null;
  filename: string | null;
  totalRows: number;
  importedRows: number;
  failedRows: number;
  fieldMapping: Prisma.JsonValue | null;
  errorSummary: string | null;
  createdByUserId: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: record.id,
    projectId: record.projectId,
    connectorId: record.connectorId,
    sourceKind: record.sourceKind,
    status: record.status,
    label: record.label,
    filename: record.filename,
    totalRows: record.totalRows,
    importedRows: record.importedRows,
    failedRows: record.failedRows,
    fieldMapping: toJsonRecord(record.fieldMapping),
    errorSummary: record.errorSummary,
    createdByUserId: record.createdByUserId,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

function mapProjectLead(record: AcquisitionLeadRecord) {
  return {
    id: record.id,
    projectId: record.projectId,
    sourceLeadId: record.sourceSubmissionId,
    fullName: record.fullName,
    email: record.email,
    phone: record.phone,
    companyName: record.companyName,
    message: record.message,
    consent: record.consent,
    sourceKind: record.sourceKind,
    connectorId: record.connectorId,
    sourceConnectorLabel: record.sourceConnector?.label ?? null,
    campaignId: record.campaignId,
    campaignName: record.acquisitionCampaign?.name ?? null,
    importBatchId: record.importBatchId,
    importBatchLabel: record.importBatch?.label ?? record.importBatch?.filename ?? null,
    externalLeadId: record.externalLeadId,
    capturedAt: record.capturedAt,
    syncStatus: record.syncStatus,
    syncError: record.syncError,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

async function requireProjectOwnerAccess(input: {
  portalUserId: string;
  projectId: string;
}): Promise<PortalProjectAccess> {
  const [portalUser, project] = await Promise.all([
    prisma.portalUser.findUnique({
      where: { id: input.portalUserId },
      select: {
        id: true,
        role: true,
      },
    }),
    prisma.project.findUnique({
      where: { id: input.projectId },
      select: {
        id: true,
        name: true,
        primaryDomain: true,
      },
    }),
  ]);

  if (!portalUser) {
    throw new Error("Project access denied.");
  }

  if (!project) {
    throw new Error("Landing project not found.");
  }

  if (isOperatorRole(portalUser.role)) {
    return { portalUser, project };
  }

  const membership = await prisma.projectMembership.findUnique({
    where: {
      projectId_portalUserId: {
        projectId: project.id,
        portalUserId: portalUser.id,
      },
    },
    select: {
      role: true,
    },
  });

  if (!membership) {
    throw new Error("Project access denied.");
  }

  if (membership.role !== "OWNER") {
    throw new Error("Project owner access required.");
  }

  return { portalUser, project };
}

async function ensureDefaultConnectors(projectId: string) {
  const existing = await prisma.leadSourceConnector.findMany({
    where: {
      projectId,
      kind: {
        in: EXTERNAL_CONNECTOR_DEFAULTS.map((connector) => connector.kind),
      },
    },
    select: {
      kind: true,
    },
  });
  const existingKinds = new Set(existing.map((connector) => connector.kind));

  await Promise.all(
    EXTERNAL_CONNECTOR_DEFAULTS.filter(
      (connector) => !existingKinds.has(connector.kind),
    ).map((connector) =>
      prisma.leadSourceConnector.create({
        data: {
          projectId,
          kind: connector.kind,
          status: "NEEDS_AUTH",
          label: connector.label,
          config: {
            setupState: "NEEDS_AUTH",
            featureFlag: "credential_ready",
          },
        },
      }),
    ),
  );
}

async function hydrateLead(projectLeadId: string) {
  const record = await prisma.projectLead.findUnique({
    where: { id: projectLeadId },
    include: acquisitionLeadInclude,
  });

  return record ? mapProjectLead(record) : null;
}

export function encryptIntegrationPayload(
  payload: Record<string, unknown>,
  explicitKey?: string,
): string {
  const key = deriveEncryptionKey(readIntegrationEncryptionKey(explicitKey));
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(JSON.stringify(payload), "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return [
    "v1",
    iv.toString("base64url"),
    tag.toString("base64url"),
    ciphertext.toString("base64url"),
  ].join(":");
}

export function decryptIntegrationPayload(
  encryptedPayload: string,
  explicitKey?: string,
): Record<string, unknown> {
  const [version, ivText, tagText, ciphertextText] = encryptedPayload.split(":");
  if (version !== "v1" || !ivText || !tagText || !ciphertextText) {
    throw new Error("Encrypted integration payload is invalid.");
  }

  const key = deriveEncryptionKey(readIntegrationEncryptionKey(explicitKey));
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    key,
    Buffer.from(ivText, "base64url"),
  );
  decipher.setAuthTag(Buffer.from(tagText, "base64url"));
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(ciphertextText, "base64url")),
    decipher.final(),
  ]).toString("utf8");
  const parsed = JSON.parse(plaintext) as unknown;

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Encrypted integration payload must decode to an object.");
  }

  return parsed as Record<string, unknown>;
}

export function parseLeadCsvRows(input: {
  csvText: string;
  mapping: CsvFieldMapping;
}): ParsedCsvLeadRow[] {
  const records = parse(input.csvText, {
    bom: true,
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as Array<Record<string, unknown>>;

  return records.map((record, index) => {
    const rowNumber = index + 2;
    const email = readMappedValue(record, input.mapping, "email");
    if (!email) {
      return {
        rowNumber,
        error: "Email is required.",
      };
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return {
        rowNumber,
        error: "Email is invalid.",
      };
    }

    const fullName = readMappedValue(record, input.mapping, "fullName");
    const lead: ParsedCsvLead = {
      ...(fullName ? { fullName } : {}),
      email: normalizeEmail(email),
    };
    const optionalFields = [
      "phone",
      "companyName",
      "message",
      "sourcePage",
      "sourceCta",
      "utmSource",
      "utmMedium",
      "utmCampaign",
      "externalLeadId",
      "capturedAt",
    ] as const;

    for (const field of optionalFields) {
      const value = readMappedValue(record, input.mapping, field);
      if (value) {
        lead[field] = value;
      }
    }

    return { rowNumber, lead };
  });
}

export function resolveCampaignAutoMatch(input: {
  campaigns: AcquisitionCampaignMatchCandidate[];
  utmSource?: string | null;
  utmCampaign?: string | null;
  externalCampaignId?: string | null;
}): string | null {
  const utmSource = normalizeComparable(input.utmSource);
  const utmCampaign = normalizeComparable(input.utmCampaign);
  if (utmSource && utmCampaign) {
    const utmMatch = input.campaigns.find(
      (campaign) =>
        normalizeComparable(campaign.utmSource) === utmSource &&
        normalizeComparable(campaign.utmCampaign) === utmCampaign,
    );
    if (utmMatch) {
      return utmMatch.id;
    }
  }

  const externalCampaignId = normalizeComparable(input.externalCampaignId);
  if (externalCampaignId) {
    const externalMatch = input.campaigns.find(
      (campaign) =>
        normalizeComparable(campaign.externalCampaignId) === externalCampaignId,
    );
    if (externalMatch) {
      return externalMatch.id;
    }
  }

  return null;
}

export async function ingestInboundLead(input: InboundLeadInput) {
  const sourceKind = normalizeSourceKind(input.sourceKind, "MANUAL_ENTRY");
  const email = normalizeEmail(input.lead.email);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Lead email is invalid.");
  }

  const externalLeadId = normalizeNullableText(input.externalLeadId);
  if (externalLeadId) {
    const existing = await prisma.projectLead.findFirst({
      where: {
        projectId: input.projectId,
        sourceKind,
        externalLeadId,
      },
      include: acquisitionLeadInclude,
    });
    if (existing) {
      return mapProjectLead(existing);
    }
  }

  const campaigns = await prisma.acquisitionCampaign.findMany({
    where: { projectId: input.projectId },
    select: {
      id: true,
      utmSource: true,
      utmCampaign: true,
      externalCampaignId: true,
    },
  });
  const externalCampaignId = normalizeNullableText(
    input.rawPayload?.["externalCampaignId"] ?? input.rawPayload?.["campaignId"],
  );
  const matchedCampaignId =
    input.campaignId ??
    resolveCampaignAutoMatch({
      campaigns,
      utmSource: input.lead.utmSource,
      utmCampaign: input.lead.utmCampaign,
      externalCampaignId,
    });
  const capturedAt = parseCapturedAt(input.capturedAt);
  const sourcePage = normalizeNullableText(input.lead.sourcePage);
  const sourceCta =
    normalizeNullableText(input.lead.sourceCta) ??
    normalizeNullableText(input.eventName) ??
    sourceKind.replace(/_/g, " ");
  const message =
    normalizeNullableText(input.lead.message) ?? `${sourceKind.replace(/_/g, " ")} lead`;
  const fullName =
    normalizeNullableText(input.lead.fullName) ??
    email.split("@")[0]?.replace(/[._-]+/g, " ") ??
    "Imported Lead";
  const companyName = normalizeNullableText(input.lead.companyName) ?? "Imported lead";
  const now = new Date();
  const activeSyncTargetCount = await prisma.leadSyncTarget.count({
    where: {
      projectId: input.projectId,
      status: "ACTIVE",
    },
  });
  const leadId = `acq_${crypto.randomUUID()}`;
  const payload = {
    sourceKind,
    connectorId: input.connectorId ?? null,
    campaignId: matchedCampaignId ?? null,
    importBatchId: input.importBatchId ?? null,
    externalLeadId,
    capturedAt: capturedAt?.toISOString() ?? null,
    eventName: normalizeNullableText(input.eventName),
    rawPayload: input.rawPayload ?? null,
    fullName,
    email,
    phone: normalizeNullableText(input.lead.phone),
    companyName,
    message,
    sourcePage,
    sourceCta,
    utmSource: normalizeNullableText(input.lead.utmSource),
    utmMedium: normalizeNullableText(input.lead.utmMedium),
    utmCampaign: normalizeNullableText(input.lead.utmCampaign),
  } as Prisma.InputJsonObject;

  const created = await prisma.$transaction(async (tx) => {
    const submission = await tx.leadSubmission.create({
      data: {
        leadId,
        fullName,
        email,
        phone: normalizeNullableText(input.lead.phone),
        companyName,
        companyType: "acquisition",
        websiteUrl: null,
        serviceInterest: ["Acquisition lead"],
        budgetRange: "Not specified",
        timeline: "Not specified",
        problemSummary: message,
        consent: input.lead.consent ?? true,
        sourcePage,
        sourceCta,
        utmSource: normalizeNullableText(input.lead.utmSource),
        utmMedium: normalizeNullableText(input.lead.utmMedium),
        utmCampaign: normalizeNullableText(input.lead.utmCampaign),
        payload,
        notificationStatus: "RECEIVED",
      },
      select: {
        id: true,
      },
    });

    return tx.projectLead.create({
      data: {
        projectId: input.projectId,
        sourceSubmissionId: submission.id,
        fullName,
        email,
        phone: normalizeNullableText(input.lead.phone),
        companyName,
        message,
        consent: input.lead.consent ?? true,
        payload,
        originHost: getOriginHost(sourcePage) ?? `acquisition:${sourceKind.toLowerCase()}`,
        sourceKind,
        connectorId: input.connectorId ?? null,
        campaignId: matchedCampaignId ?? null,
        importBatchId: input.importBatchId ?? null,
        externalLeadId,
        capturedAt,
        syncStatus: activeSyncTargetCount > 0 ? "PENDING" : "SYNCED",
        createdAt: now,
      },
      select: {
        id: true,
      },
    });
  });

  if (activeSyncTargetCount > 0) {
    await syncProjectLeadDestinations(created.id);
  }

  const hydrated = await hydrateLead(created.id);
  if (!hydrated) {
    throw new Error("Project lead not found.");
  }

  return hydrated;
}

export async function listProjectAcquisitionConnectors(input: {
  portalUserId: string;
  projectId: string;
}) {
  const access = await requireProjectOwnerAccess(input);
  await ensureDefaultConnectors(access.project.id);
  const connectors = await prisma.leadSourceConnector.findMany({
    where: { projectId: access.project.id },
    orderBy: [{ createdAt: "asc" }],
  });

  return connectors.map(mapConnector);
}

export async function upsertProjectAcquisitionConnector(input: {
  portalUserId: string;
  projectId: string;
  connectorId?: string;
  kind: LeadSourceKind;
  status?: LeadSourceConnectorStatus;
  label?: string;
  externalAccountId?: string | null;
  config?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}) {
  const access = await requireProjectOwnerAccess(input);
  const kind = normalizeSourceKind(input.kind, "META_LEAD_ADS");
  const status =
    normalizeConnectorStatus(input.status) ??
    (kind === "CSV_IMPORT" || kind === "MANUAL_ENTRY" || kind === "EVENT_IMPORT"
      ? "ACTIVE"
      : "NEEDS_AUTH");
  const label =
    normalizeText(input.label) ??
    EXTERNAL_CONNECTOR_DEFAULTS.find((connector) => connector.kind === kind)?.label ??
    kind.replace(/_/g, " ");

  const data = {
    kind,
    status,
    label,
    externalAccountId: normalizeNullableText(input.externalAccountId),
    config: (input.config ?? Prisma.JsonNull) as Prisma.InputJsonValue,
    metadata: (input.metadata ?? Prisma.JsonNull) as Prisma.InputJsonValue,
  };

  const record = input.connectorId
    ? await prisma.leadSourceConnector.update({
        where: {
          id: input.connectorId,
          projectId: access.project.id,
        },
        data,
      })
    : await prisma.leadSourceConnector.create({
        data: {
          projectId: access.project.id,
          ...data,
        },
      });

  return mapConnector(record);
}

export async function listProjectAcquisitionCampaigns(input: {
  portalUserId: string;
  projectId: string;
}) {
  const access = await requireProjectOwnerAccess(input);
  const campaigns = await prisma.acquisitionCampaign.findMany({
    where: { projectId: access.project.id },
    orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
  });

  return campaigns.map(mapCampaign);
}

export async function upsertProjectAcquisitionCampaign(input: {
  portalUserId: string;
  projectId: string;
  campaignId?: string;
  connectorId?: string | null;
  accountId?: string | null;
  provider: LeadSourceKind;
  externalCampaignId?: string | null;
  name: string;
  status?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  metadata?: Record<string, unknown>;
}) {
  const access = await requireProjectOwnerAccess(input);
  const provider = normalizeSourceKind(input.provider, "GOOGLE_ADS");
  const name = normalizeText(input.name);
  if (!name) {
    throw new Error("Campaign name is required.");
  }

  const data = {
    connectorId: normalizeNullableText(input.connectorId),
    accountId: normalizeNullableText(input.accountId),
    provider,
    externalCampaignId: normalizeNullableText(input.externalCampaignId),
    name,
    status: normalizeNullableText(input.status),
    utmSource: normalizeNullableText(input.utmSource),
    utmMedium: normalizeNullableText(input.utmMedium),
    utmCampaign: normalizeNullableText(input.utmCampaign),
    metadata: (input.metadata ?? Prisma.JsonNull) as Prisma.InputJsonValue,
  };

  const record = input.campaignId
    ? await prisma.acquisitionCampaign.update({
        where: {
          id: input.campaignId,
          projectId: access.project.id,
        },
        data,
      })
    : await prisma.acquisitionCampaign.create({
        data: {
          projectId: access.project.id,
          ...data,
        },
      });

  return mapCampaign(record);
}

export async function importProjectLeadsCsv(input: {
  portalUserId: string;
  projectId: string;
  connectorId?: string | null;
  campaignId?: string | null;
  csvText: string;
  fieldMapping: CsvFieldMapping;
  filename?: string | null;
  label?: string | null;
  sourceKind?: LeadSourceKind;
}) {
  const access = await requireProjectOwnerAccess(input);
  const parsedRows = parseLeadCsvRows({
    csvText: input.csvText,
    mapping: input.fieldMapping,
  });
  const batch = await prisma.leadImportBatch.create({
    data: {
      projectId: access.project.id,
      connectorId: normalizeNullableText(input.connectorId),
      sourceKind: normalizeSourceKind(input.sourceKind, "CSV_IMPORT"),
      status: "PENDING",
      label: normalizeNullableText(input.label),
      filename: normalizeNullableText(input.filename),
      totalRows: parsedRows.length,
      fieldMapping: input.fieldMapping as Prisma.InputJsonValue,
      createdByUserId: access.portalUser.id,
    },
  });

  const leads = [];
  const errors: Array<{ rowNumber: number; error: string }> = [];

  for (const row of parsedRows) {
    if ("error" in row) {
      errors.push({
        rowNumber: row.rowNumber,
        error: row.error,
      });
      continue;
    }

    try {
      const lead = await ingestInboundLead({
        projectId: access.project.id,
        sourceKind: "CSV_IMPORT",
        connectorId: input.connectorId,
        campaignId: input.campaignId,
        importBatchId: batch.id,
        externalLeadId: row.lead.externalLeadId,
        capturedAt: row.lead.capturedAt,
        lead: {
          fullName: row.lead.fullName,
          email: row.lead.email,
          phone: row.lead.phone,
          companyName: row.lead.companyName,
          message: row.lead.message,
          consent: true,
          sourcePage: row.lead.sourcePage,
          sourceCta: row.lead.sourceCta,
          utmSource: row.lead.utmSource,
          utmMedium: row.lead.utmMedium,
          utmCampaign: row.lead.utmCampaign,
        },
        rawPayload: row.lead,
      });
      leads.push(lead);
    } catch (error) {
      errors.push({
        rowNumber: row.rowNumber,
        error: error instanceof Error ? error.message : "Lead import failed.",
      });
    }
  }

  const importedRows = leads.length;
  const failedRows = errors.length;
  const status =
    importedRows > 0 && failedRows === 0
      ? "IMPORTED"
      : importedRows > 0
        ? "PARTIAL"
        : "FAILED";
  const updatedBatch = await prisma.leadImportBatch.update({
    where: { id: batch.id },
    data: {
      importedRows,
      failedRows,
      status,
      errorSummary:
        errors.length > 0
          ? errors.map((entry) => `Row ${entry.rowNumber}: ${entry.error}`).join(" | ")
          : null,
    },
  });

  return {
    batch: mapImportBatch(updatedBatch),
    leads,
    errors,
  };
}

export async function createProjectManualLead(input: {
  portalUserId: string;
  projectId: string;
  sourceKind?: LeadSourceKind;
  connectorId?: string | null;
  campaignId?: string | null;
  externalLeadId?: string | null;
  capturedAt?: string | Date | null;
  eventName?: string | null;
  lead: InboundLeadInput["lead"];
}) {
  const access = await requireProjectOwnerAccess(input);
  const sourceKind = normalizeSourceKind(input.sourceKind, "MANUAL_ENTRY");
  return ingestInboundLead({
    projectId: access.project.id,
    sourceKind:
      sourceKind === "EVENT_IMPORT" || sourceKind === "MANUAL_ENTRY"
        ? sourceKind
        : "MANUAL_ENTRY",
    connectorId: input.connectorId,
    campaignId: input.campaignId,
    externalLeadId: input.externalLeadId,
    capturedAt: input.capturedAt,
    eventName: input.eventName,
    lead: input.lead,
  });
}

export async function submitPublicProjectLead(input: {
  publicLeadKey: string;
  originHost: string | null;
  honeypot: string;
  payload: {
    fullName: string;
    email: string;
    phone?: string;
    companyName?: string;
    message?: string;
    consent: boolean;
  };
}) {
  if (input.honeypot.trim()) {
    throw new Error("Lead skipped by honeypot.");
  }

  const project = await prisma.project.findUnique({
    where: { publicLeadKey: input.publicLeadKey },
    select: {
      id: true,
      primaryDomain: true,
    },
  });
  if (!project) {
    throw new Error("Landing project not found.");
  }

  const allowedHost = project.primaryDomain?.trim().toLowerCase();
  const requestHost = input.originHost?.trim().toLowerCase() ?? null;
  if (allowedHost && requestHost && allowedHost !== requestHost) {
    throw new Error("Origin host does not match project domain.");
  }

  return ingestInboundLead({
    projectId: project.id,
    sourceKind: "WEB_FORM",
    lead: {
      fullName: input.payload.fullName,
      email: input.payload.email,
      phone: input.payload.phone,
      companyName: input.payload.companyName,
      message: input.payload.message,
      consent: input.payload.consent,
      sourcePage: requestHost ? `https://${requestHost}` : null,
      sourceCta: "Public landing form",
    },
    rawPayload: input.payload,
  });
}

export async function testProjectAcquisitionConnector(input: {
  portalUserId: string;
  projectId: string;
  connectorId: string;
}) {
  const access = await requireProjectOwnerAccess(input);
  const connector = await prisma.leadSourceConnector.findFirst({
    where: {
      id: input.connectorId,
      projectId: access.project.id,
    },
    select: {
      id: true,
      kind: true,
      status: true,
      credentialId: true,
    },
  });

  if (!connector) {
    throw new Error("Lead source connector not found.");
  }

  const result =
    connector.status === "ACTIVE" && connector.credentialId
      ? {
          ok: true,
          status: connector.status,
          message: "Connector is active and has credential metadata.",
        }
      : {
          ok: false,
          status: connector.status === "ACTIVE" ? "NEEDS_AUTH" : connector.status,
          message: `${connector.kind.replace(/_/g, " ")} credentials are not configured yet.`,
        };

  await prisma.leadSourceConnector.update({
    where: {
      id: connector.id,
    },
    data: {
      lastCheckedAt: new Date(),
      lastError: result.ok ? null : result.message,
    },
  });

  return result;
}

export async function recordInboundLeadWebhookEvent(input: {
  provider: LeadSourceKind;
  eventType: string;
  externalLeadId?: string | null;
  payload: Record<string, unknown>;
}) {
  const provider = normalizeSourceKind(input.provider, "META_LEAD_ADS");
  const connector = await prisma.leadSourceConnector.findFirst({
    where: {
      kind: provider,
      status: "ACTIVE",
    },
    orderBy: [{ updatedAt: "desc" }],
    select: {
      id: true,
      projectId: true,
    },
  });

  if (!connector) {
    return {
      accepted: false as const,
      status: "NEEDS_AUTH" as const,
      message: `${provider.replace(/_/g, " ")} webhook is not enabled for an active connector.`,
    };
  }

  const event = await prisma.inboundLeadEvent.create({
    data: {
      projectId: connector.projectId,
      connectorId: connector.id,
      provider,
      eventType: input.eventType,
      externalLeadId: normalizeNullableText(input.externalLeadId),
      payload: input.payload as Prisma.InputJsonValue,
      status: "RECEIVED",
    },
  });

  return {
    accepted: true as const,
    status: event.status,
    eventId: event.id,
  };
}
