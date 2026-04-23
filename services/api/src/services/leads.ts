import { Prisma, type LeadStatus } from "@prisma/client";
import type { LeadSubmissionInput } from "../domain/lead.js";
import { prisma } from "../lib/prisma.js";
import { appendLeadToGoogleSheet } from "./google-sheets.js";
import { pushLeadToMdoc } from "./mdoc-push.js";

type ActiveLeadSyncTargetRecord = {
  id: string;
  projectId: string;
  kind: "GOOGLE_SHEETS" | "MDOC_PUSH";
  status: "ACTIVE" | "INACTIVE";
  label: string | null;
  config: Record<string, unknown>;
};

type SyncableProjectLeadRecord = {
  id: string;
  projectId: string;
  fullName: string;
  email: string;
  phone: string | null;
  companyName: string | null;
  message: string | null;
  consent: boolean;
  sourceLeadId: string | null;
  sourcePage: string | null;
  sourceCta: string | null;
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

function readPayloadObject(value: Prisma.JsonValue | null | undefined) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function readPayloadString(value: unknown) {
  return typeof value === "string" ? value : null;
}

function readPayloadStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((entry): entry is string => typeof entry === "string" && entry.trim().length > 0);
}

function buildPayloadSnapshot(lead: LeadSubmissionInput): Prisma.InputJsonValue {
  return {
    ...lead,
    phone: lead.phone ?? null,
    websiteUrl: lead.websiteUrl && lead.websiteUrl.length > 0 ? lead.websiteUrl : null,
    sourcePage: lead.sourcePage ?? null,
    sourceCta: lead.sourceCta ?? null,
    utmSource: lead.utmSource ?? null,
    utmMedium: lead.utmMedium ?? null,
    utmCampaign: lead.utmCampaign ?? null,
    utmContent: lead.utmContent ?? null,
    utmTerm: lead.utmTerm ?? null,
    gclid: lead.gclid ?? null,
    gbraid: lead.gbraid ?? null,
    wbraid: lead.wbraid ?? null,
  };
}

export type StoredLeadSubmissionRecord = {
  id: string;
  leadId: string;
  fullName: string;
  email: string;
  phone: string | null;
  companyName: string;
  problemSummary: string;
  consent: boolean;
  sourcePage: string | null;
  sourceCta: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmTerm: string | null;
  gclid: string | null;
  gbraid: string | null;
  wbraid: string | null;
  payload: Prisma.JsonValue;
  notificationStatus: LeadStatus;
  notificationError: string | null;
  createdAt: Date;
};

export type ProjectLeadProjectionRecord = {
  id: string;
  projectId: string;
};

export type ProjectLeadNotificationDelivery = {
  recipients: string[];
  dashboardUrl: string;
};

function hydrateStoredLeadSubmissionRecord<
  T extends {
    payload: Prisma.JsonValue;
  },
>(record: T) {
  const payload = readPayloadObject(record.payload);

  return {
    ...record,
    utmContent: readPayloadString(payload?.["utmContent"]),
    utmTerm: readPayloadString(payload?.["utmTerm"]),
    gclid: readPayloadString(payload?.["gclid"]),
    gbraid: readPayloadString(payload?.["gbraid"]),
    wbraid: readPayloadString(payload?.["wbraid"]),
  };
}

function normalizeSourceHost(value: string | null | undefined): string | null {
  if (!value?.trim()) {
    return null;
  }

  try {
    return new URL(value).host.trim().toLowerCase();
  } catch {
    return null;
  }
}

function buildDomainCandidates(host: string): string[] {
  const normalized = host.trim().toLowerCase();
  if (!normalized) {
    return [];
  }

  return Array.from(
    new Set([
      normalized,
      normalized.startsWith("www.") ? normalized.slice(4) : normalized,
    ]),
  ).filter(Boolean);
}

type ProjectHostMatch = {
  projectId: string;
  host: string;
};

function normalizeStoredHost(value: string | null | undefined): string | null {
  const normalized = value?.trim().toLowerCase() ?? "";
  return normalized || null;
}

async function findProjectHostMatches(host: string): Promise<ProjectHostMatch[]> {
  const candidates = buildDomainCandidates(host);
  if (candidates.length === 0) {
    return [];
  }

  const [domains, sites] = await Promise.all([
    prisma.projectDomain.findMany({
      where: {
        host: {
          in: candidates,
        },
        project: {
          status: {
            in: ["DRAFT", "ACTIVE"],
          },
        },
      },
      select: {
        host: true,
        projectId: true,
      },
    }),
    prisma.projectSite.findMany({
      where: {
        previewHost: {
          in: candidates,
        },
        project: {
          status: {
            in: ["DRAFT", "ACTIVE"],
          },
        },
      },
      select: {
        previewHost: true,
        projectId: true,
      },
    }),
  ]);

  return [
    ...domains
      .map((domain) => ({
        projectId: domain.projectId,
        host: normalizeStoredHost(domain.host),
      }))
      .filter((match): match is ProjectHostMatch => Boolean(match.host)),
    ...sites
      .map((site) => ({
        projectId: site.projectId,
        host: normalizeStoredHost(site.previewHost),
      }))
      .filter((match): match is ProjectHostMatch => Boolean(match.host)),
  ];
}

function getPortalAppBaseUrl(): string {
  return (
    process.env["PORTAL_APP_URL"]?.trim() ||
    process.env["NEXT_PUBLIC_APP_URL"]?.trim() ||
    "https://shasvata.com/app"
  );
}

async function createProjectedLead(input: {
  lead: StoredLeadSubmissionRecord;
  projectId: string;
  originHost: string;
}): Promise<ProjectLeadProjectionRecord> {
  const activeSyncTargetCount = await prisma.leadSyncTarget.count({
    where: {
      projectId: input.projectId,
      status: "ACTIVE",
    },
  });

  const record = await prisma.projectLead.create({
    data: {
      projectId: input.projectId,
      sourceSubmissionId: input.lead.id,
      fullName: input.lead.fullName,
      email: input.lead.email,
      phone: input.lead.phone,
      companyName: input.lead.companyName,
      message: input.lead.problemSummary,
      consent: input.lead.consent,
      payload: (input.lead.payload ?? Prisma.JsonNull) as Prisma.InputJsonValue,
      originHost: input.originHost,
      syncStatus: activeSyncTargetCount > 0 ? "PENDING" : "SYNCED",
    },
    select: {
      id: true,
      projectId: true,
    },
  });

  return record;
}

function mapSyncableProjectLead(record: {
  id: string;
  projectId: string;
  fullName: string;
  email: string;
  phone: string | null;
  companyName: string | null;
  message: string | null;
  consent: boolean;
  createdAt: Date;
  sourceSubmission: {
    leadId: string;
    sourcePage: string | null;
    sourceCta: string | null;
    utmSource: string | null;
    utmMedium: string | null;
    utmCampaign: string | null;
    serviceInterest: Prisma.JsonValue | null;
    budgetRange: string | null;
    timeline: string | null;
    problemSummary: string | null;
    payload: Prisma.JsonValue | null;
  } | null;
}): SyncableProjectLeadRecord {
  const payload = readPayloadObject(record.sourceSubmission?.payload);

  return {
    id: record.id,
    projectId: record.projectId,
    fullName: record.fullName,
    email: record.email,
    phone: record.phone,
    companyName: record.companyName,
    message: record.message,
    consent: record.consent,
    sourceLeadId: record.sourceSubmission?.leadId ?? null,
    sourcePage: record.sourceSubmission?.sourcePage ?? null,
    sourceCta: record.sourceSubmission?.sourceCta ?? null,
    utmSource: record.sourceSubmission?.utmSource ?? null,
    utmMedium: record.sourceSubmission?.utmMedium ?? null,
    utmCampaign: record.sourceSubmission?.utmCampaign ?? null,
    utmContent: readPayloadString(payload?.["utmContent"]),
    utmTerm: readPayloadString(payload?.["utmTerm"]),
    gclid: readPayloadString(payload?.["gclid"]),
    gbraid: readPayloadString(payload?.["gbraid"]),
    wbraid: readPayloadString(payload?.["wbraid"]),
    serviceInterest: readPayloadStringArray(record.sourceSubmission?.serviceInterest),
    budgetRange: record.sourceSubmission?.budgetRange ?? null,
    timeline: record.sourceSubmission?.timeline ?? null,
    problemSummary: record.sourceSubmission?.problemSummary ?? null,
    createdAt: record.createdAt,
  };
}

function buildAggregateSyncState(results: Array<{ targetLabel: string; ok: boolean; message?: string }>) {
  if (results.length === 0) {
    return {
      syncStatus: "SYNCED" as const,
      syncError: null,
    };
  }

  const successCount = results.filter((entry) => entry.ok).length;
  if (successCount === results.length) {
    return {
      syncStatus: "SYNCED" as const,
      syncError: null,
    };
  }

  const errorSummary = results
    .filter((entry) => !entry.ok)
    .map((entry) => `${entry.targetLabel}: ${entry.message ?? "Unknown sync error."}`)
    .join(" | ");

  if (successCount > 0) {
    return {
      syncStatus: "PARTIAL" as const,
      syncError: errorSummary,
    };
  }

  return {
    syncStatus: "FAILED" as const,
    syncError: errorSummary || "All lead sync targets failed.",
  };
}

export async function syncProjectLeadDestinations(projectLeadId: string): Promise<void> {
  const leadRecord = await prisma.projectLead.findFirst({
    where: {
      id: projectLeadId,
    },
    select: {
      id: true,
      projectId: true,
      fullName: true,
      email: true,
      phone: true,
      companyName: true,
      message: true,
      consent: true,
      createdAt: true,
      sourceSubmission: {
        select: {
          leadId: true,
          sourcePage: true,
          sourceCta: true,
          utmSource: true,
          utmMedium: true,
          utmCampaign: true,
          serviceInterest: true,
          budgetRange: true,
          timeline: true,
          problemSummary: true,
          payload: true,
        },
      },
    },
  });

  if (!leadRecord) {
    return;
  }

  const [project, activeTargets] = await Promise.all([
    prisma.project.findUnique({
      where: { id: leadRecord.projectId },
      select: {
        id: true,
        name: true,
        primaryDomain: true,
      },
    }),
    prisma.leadSyncTarget.findMany({
      where: {
        projectId: leadRecord.projectId,
        status: "ACTIVE",
      },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        projectId: true,
        kind: true,
        status: true,
        label: true,
        config: true,
      },
    }),
  ]);

  if (!project) {
    return;
  }

  if (activeTargets.length === 0) {
    await prisma.projectLead.update({
      where: { id: projectLeadId },
      data: {
        syncStatus: "SYNCED",
        syncError: null,
      },
    });
    return;
  }

  const lead = mapSyncableProjectLead(leadRecord);
  const results: Array<{ targetLabel: string; ok: boolean; message?: string }> = [];

  for (const target of activeTargets as ActiveLeadSyncTargetRecord[]) {
    const attempt = await prisma.leadSyncDeliveryAttempt.create({
      data: {
        projectLeadId: lead.id,
        projectId: lead.projectId,
        targetId: target.id,
        kind: target.kind,
        status: "PENDING",
        attemptedAt: lead.createdAt,
      },
    });

    try {
      if (target.kind === "GOOGLE_SHEETS") {
        await appendLeadToGoogleSheet({
          target: {
            config: {
              spreadsheetId: String(target.config["spreadsheetId"] ?? ""),
              sheetName: String(target.config["sheetName"] ?? ""),
            },
          },
          project: {
            name: project.name,
          },
          lead,
        });

        await prisma.leadSyncDeliveryAttempt.update({
          where: { id: attempt.id },
          data: {
            status: "SYNCED",
            deliveredAt: new Date(),
          },
        });
      } else {
        const response = await pushLeadToMdoc({
          config: {
            endpoint: String(target.config["endpoint"] ?? ""),
            apiKey: String(target.config["apiKey"] ?? ""),
            dataFrom: target.config["dataFrom"] === "T" ? "T" : "E",
            source: String(target.config["source"] ?? ""),
            fallbackSourceDetail: String(target.config["fallbackSourceDetail"] ?? "Website"),
            sourceDetailRules:
              target.config["sourceDetailRules"] &&
              typeof target.config["sourceDetailRules"] === "object"
                ? Object.fromEntries(
                    Object.entries(target.config["sourceDetailRules"] as Record<string, unknown>).map(
                      ([key, value]) => [key, String(value)],
                    ),
                  )
                : undefined,
            staticDefaults:
              target.config["staticDefaults"] && typeof target.config["staticDefaults"] === "object"
                ? Object.fromEntries(
                    Object.entries(target.config["staticDefaults"] as Record<string, unknown>).map(
                      ([key, value]) => [key, String(value)],
                    ),
                  )
                : undefined,
            enumMappings:
              target.config["enumMappings"] && typeof target.config["enumMappings"] === "object"
                ? (target.config["enumMappings"] as {
                    preferences?: Record<string, string>;
                    budgets?: Record<string, string>;
                    buyingPurposes?: Record<string, string>;
                    possessionReqs?: Record<string, string>;
                    ageRanges?: Record<string, string>;
                  })
                : undefined,
          },
          project: {
            id: project.id,
            name: project.name,
          },
          lead,
        });

        await prisma.leadSyncDeliveryAttempt.update({
          where: { id: attempt.id },
          data: {
            status: "SYNCED",
            responseCode: response.responseCode,
            responseBody: response.responseBody,
            metadata:
              response.metadata === undefined
                ? undefined
                : ((response.metadata ?? Prisma.JsonNull) as Prisma.InputJsonValue),
            deliveredAt: new Date(),
          },
        });
      }

      results.push({
        targetLabel: target.label ?? target.kind,
        ok: true,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown lead sync error.";
      await prisma.leadSyncDeliveryAttempt.update({
        where: { id: attempt.id },
        data: {
          status: "FAILED",
          errorMessage: message,
          deliveredAt: null,
        },
      });
      results.push({
        targetLabel: target.label ?? target.kind,
        ok: false,
        message,
      });
    }
  }

  const aggregate = buildAggregateSyncState(results);
  await prisma.projectLead.update({
    where: { id: projectLeadId },
    data: {
      syncStatus: aggregate.syncStatus,
      syncError: aggregate.syncError,
    },
  });
}

export async function saveLeadSubmission(
  lead: LeadSubmissionInput,
): Promise<StoredLeadSubmissionRecord> {
  const payload = buildPayloadSnapshot(lead);
  const record = await prisma.leadSubmission.create({
    data: {
      leadId: lead.leadId,
      fullName: lead.fullName,
      email: lead.email,
      phone: lead.phone ?? null,
      companyName: lead.companyName,
      companyType: lead.companyType,
      websiteUrl: lead.websiteUrl && lead.websiteUrl.length > 0 ? lead.websiteUrl : null,
      serviceInterest: lead.serviceInterest,
      budgetRange: lead.budgetRange,
      timeline: lead.timeline,
      problemSummary: lead.problemSummary,
      consent: lead.consent,
      sourcePage: lead.sourcePage ?? null,
      sourceCta: lead.sourceCta ?? null,
      utmSource: lead.utmSource ?? null,
      utmMedium: lead.utmMedium ?? null,
      utmCampaign: lead.utmCampaign ?? null,
      payload,
      notificationStatus: "RECEIVED",
    },
    select: {
      id: true,
      leadId: true,
      fullName: true,
      email: true,
      phone: true,
      companyName: true,
      problemSummary: true,
      consent: true,
      sourcePage: true,
      sourceCta: true,
      utmSource: true,
      utmMedium: true,
      utmCampaign: true,
      payload: true,
      notificationStatus: true,
      notificationError: true,
      createdAt: true,
    },
  });

  return hydrateStoredLeadSubmissionRecord(record);
}

export async function projectLeadSubmissionForPortal(
  lead: StoredLeadSubmissionRecord,
): Promise<ProjectLeadProjectionRecord | null> {
  const existing = await prisma.projectLead.findUnique({
    where: {
      sourceSubmissionId: lead.id,
    },
    select: {
      id: true,
      projectId: true,
    },
  });

  if (existing) {
    return existing;
  }

  const host = normalizeSourceHost(lead.sourcePage);
  if (!host) {
    return null;
  }

  const hostMatches = await findProjectHostMatches(host);
  const matchedDomain =
    hostMatches.find((domain) => domain.host === host) ??
    hostMatches.find((domain) => domain.host === host.replace(/^www\./, "")) ??
    null;

  if (!matchedDomain) {
    return null;
  }

  const projectedLead = await createProjectedLead({
    lead,
    projectId: matchedDomain.projectId,
    originHost: host,
  });

  await syncProjectLeadDestinations(projectedLead.id);

  return projectedLead;
}

export async function backfillProjectedLeadsForProject(projectId: string): Promise<{
  projectId: string;
  created: number;
  skipped: number;
}> {
  const [domains, sites] = await Promise.all([
    prisma.projectDomain.findMany({
      where: {
        projectId,
      },
      select: {
        host: true,
      },
    }),
    prisma.projectSite.findMany({
      where: {
        projectId,
      },
      select: {
        previewHost: true,
      },
    }),
  ]);

  const hosts = Array.from(
    new Set(
      [
        ...domains.map((domain) => normalizeStoredHost(domain.host)),
        ...sites.map((site) => normalizeStoredHost(site.previewHost)),
      ].filter((host): host is string => Boolean(host)),
    ),
  );
  if (hosts.length === 0) {
    return {
      projectId,
      created: 0,
      skipped: 0,
    };
  }

  const leads = await prisma.leadSubmission.findMany({
    where: {
      OR: hosts.map((host) => ({
        sourcePage: {
          contains: host,
        },
      })),
    },
    orderBy: {
      createdAt: "asc",
    },
    select: {
      id: true,
      leadId: true,
      fullName: true,
      email: true,
      phone: true,
      companyName: true,
      problemSummary: true,
      consent: true,
      sourcePage: true,
      sourceCta: true,
      utmSource: true,
      utmMedium: true,
      utmCampaign: true,
      payload: true,
      notificationStatus: true,
      notificationError: true,
      createdAt: true,
    },
  });

  let created = 0;
  let skipped = 0;

  for (const lead of leads.map(hydrateStoredLeadSubmissionRecord)) {
    const host = normalizeSourceHost(lead.sourcePage);
    if (!host) {
      continue;
    }

    const matchesProject =
      hosts.includes(host) || (host.startsWith("www.") && hosts.includes(host.slice(4)));
    if (!matchesProject) {
      continue;
    }

    const existing = await prisma.projectLead.findUnique({
      where: {
        sourceSubmissionId: lead.id,
      },
      select: {
        id: true,
      },
    });

    if (existing) {
      skipped += 1;
      continue;
    }

    const projectedLead = await createProjectedLead({
      lead,
      projectId,
      originHost: host,
    });
    await syncProjectLeadDestinations(projectedLead.id);
    created += 1;
  }

  return {
    projectId,
    created,
    skipped,
  };
}

export async function getProjectLeadNotificationDelivery(
  projectId: string,
): Promise<ProjectLeadNotificationDelivery | null> {
  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
    },
    select: {
      id: true,
      notificationRecipients: {
        orderBy: [{ createdAt: "asc" }, { email: "asc" }],
        select: {
          email: true,
        },
      },
    },
  });

  if (!project) {
    return null;
  }

  return {
    recipients: project.notificationRecipients.map((recipient) => recipient.email),
    dashboardUrl: `${getPortalAppBaseUrl().replace(/\/$/, "")}/projects/${project.id}`,
  };
}

export async function updateLeadNotificationStatus(
  leadId: string,
  notificationStatus: LeadStatus,
  notificationError?: string,
): Promise<void> {
  await prisma.leadSubmission.update({
    where: { leadId },
    data: {
      notificationStatus,
      notificationError: notificationError?.trim() || null,
    },
  });
}

export async function pingDatabase(): Promise<void> {
  await prisma.$queryRaw`SELECT 1`;
}
