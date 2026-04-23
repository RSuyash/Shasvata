"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import {
  ClientPortalSectionCard,
  ClientPortalStatusPill,
} from "@/components/client-portal/client-portal-panels";
import { ClientPortalShell } from "@/components/client-portal/client-portal-shell";
import {
  formatPortalDate,
  hardDeleteProjectLeadsForApp,
  restoreProjectLeadsForApp,
  revealProjectLeadForApp,
  softDeleteProjectLeadsForApp,
  type PortalUserSummary,
  type ProjectDetail,
  type ProjectLead,
  type ProjectLeadDeletionTombstone,
} from "@/lib/landing-portal";
import {
  buildLeadDownloadActions,
  buildLeadNeedLabel,
  buildLeadRowActionsWithOptions,
  buildLeadSourceLabel,
} from "@/lib/client-lead-presentation";
import { buildProjectBreadcrumbs, buildProjectNav } from "@/lib/portal-nav";
import { ROUTES } from "@/lib/routes";
import { PortalActionMenu } from "./portal-action-menu";

const CLIENT_HIDE_REASONS = [
  { code: "DUPLICATE_LEAD", label: "Duplicate lead" },
  { code: "TEST_OR_INTERNAL", label: "Test / internal lead" },
  { code: "WRONG_ENQUIRY", label: "Wrong enquiry" },
  { code: "ALREADY_HANDLED_OFFLINE", label: "Already handled offline" },
  { code: "NOT_RELEVANT", label: "Not relevant" },
  { code: "PRIVACY_CLEAN_UP", label: "Privacy clean-up" },
];

const OPERATOR_HIDE_REASONS = [
  { code: "SPAM_OR_JUNK", label: "Spam / junk" },
  { code: "DUPLICATE_ACROSS_SOURCES", label: "Duplicate across sources" },
  { code: "PRIVACY_REQUEST", label: "Privacy request" },
  { code: "INTERNAL_TEST_LEAD", label: "Internal test lead" },
  { code: "DATA_HYGIENE_CORRECTION", label: "Data hygiene correction" },
  { code: "SUPPORT_DIRECTED_CLEANUP", label: "Support-directed cleanup" },
];

const HARD_DELETE_REASONS = [
  { code: "PRIVACY_ERASURE_REQUEST", label: "Privacy erasure request" },
  { code: "ACCIDENTAL_TEST_DATA", label: "Accidental test data" },
  { code: "DUPLICATE_WITH_RAW_DATA_PURGE", label: "Duplicate with raw purge" },
  { code: "COMPLIANCE_CLEANUP", label: "Compliance cleanup" },
  { code: "OPERATOR_CORRECTION", label: "Operator correction" },
];

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en-IN", {
    notation: value >= 1000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value);
}

function humanizeReason(code: string | null) {
  if (!code) {
    return "No reason recorded";
  }

  return code
    .toLowerCase()
    .split("_")
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(" ");
}

type LeadTabKey = "active" | "hidden" | "deleted";

export function ClientProjectLeadsView({
  user,
  project,
  activeLeads,
  hiddenLeads,
  tombstones,
}: {
  user: PortalUserSummary;
  project: ProjectDetail;
  activeLeads: ProjectLead[];
  hiddenLeads: ProjectLead[];
  tombstones: ProjectLeadDeletionTombstone[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<LeadTabKey>("active");
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [hideReasonCode, setHideReasonCode] = useState(
    project.portalView === "OPERATOR" ? "DATA_HYGIENE_CORRECTION" : "DUPLICATE_LEAD",
  );
  const [sourceFilter, setSourceFilter] = useState("ALL");
  
  // UX UI: Custom Modal State instead of window.prompt
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [hardDeleteReasonCode, setHardDeleteReasonCode] = useState("OPERATOR_CORRECTION");
  
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [revealedContacts, setRevealedContacts] = useState<
    Record<string, { email: string; phone: string | null }>
  >({});

  const isOperator = project.portalView === "OPERATOR";
  const isOwner = project.membershipRole === "OWNER";
  const canManageVisibleLeads = isOperator || isOwner;
  const canSeeHidden = isOperator || isOwner;
  const canSeeDeleted = isOperator;
  const canExport = isOperator || isOwner;

  const navSections = buildProjectNav(project.id, {
    activeItem: "leads",
    liveHref: project.liveUrl,
  });
  const breadcrumbs = buildProjectBreadcrumbs(project.id, project.name, "Leads");
  const tabLeads = activeTab === "hidden" ? hiddenLeads : activeLeads;
  const sourceOptions = useMemo(
    () =>
      Array.from(new Set(tabLeads.map((lead) => buildLeadSourceLabel(lead))))
        .filter(Boolean)
        .sort((left, right) => left.localeCompare(right)),
    [tabLeads],
  );
  const currentLeads = useMemo(
    () =>
      sourceFilter === "ALL"
        ? tabLeads
        : tabLeads.filter((lead) => buildLeadSourceLabel(lead) === sourceFilter),
    [sourceFilter, tabLeads],
  );
  const latestLead = activeLeads[0] ?? null;
  const hideReasons = isOperator ? OPERATOR_HIDE_REASONS : CLIENT_HIDE_REASONS;
  const downloadActions = canExport ? buildLeadDownloadActions(project.id) : [];
  const leadIdsInCurrentTab = useMemo(() => currentLeads.map((lead) => lead.id), [currentLeads]);

  function switchTab(nextTab: LeadTabKey) {
    setActiveTab(nextTab);
    setSourceFilter("ALL");
    setSelectedLeadIds([]);
    setStatusMessage(null);
    setErrorMessage(null);
  }

  function toggleLeadSelection(leadId: string, checked: boolean) {
    setSelectedLeadIds((current) =>
      checked ? Array.from(new Set([...current, leadId])) : current.filter((id) => id !== leadId),
    );
  }

  function toggleSelectAll(checked: boolean) {
    setSelectedLeadIds(checked ? leadIdsInCurrentTab : []);
  }

  async function runLeadMutation(task: () => Promise<void>) {
    setStatusMessage(null);
    setErrorMessage(null);

    startTransition(async () => {
      try {
        await task();
        setSelectedLeadIds([]);
        setIsDeleteModalOpen(false); // Close modal on success
        setDeleteConfirmText("");
        router.refresh();
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Lead action failed. Please try again.",
        );
      }
    });
  }

  const allSelected =
    leadIdsInCurrentTab.length > 0 &&
    leadIdsInCurrentTab.every((leadId) => selectedLeadIds.includes(leadId));

  return (
    <ClientPortalShell
      user={user}
      sections={navSections}
      breadcrumbs={breadcrumbs}
      pageTitle={`${project.name} leads`}
      pageDescription="Manage, review, and track all captured client inquiries."
      eyebrowLabel="Lead inbox"
      actions={
        <>
          <Link
            href={ROUTES.dashboard.projects}
            className="inline-flex items-center justify-center rounded-full border border-[var(--portal-border)] bg-[var(--portal-surface)] px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--portal-foreground)] transition hover:border-[var(--portal-accent-border)] hover:bg-[var(--portal-badge-bg)] hover:text-[var(--portal-badge-text)]"
          >
            Projects
          </Link>
          {canExport ? <PortalActionMenu items={downloadActions} triggerLabel="Export" /> : null}
          <Link
            href={ROUTES.dashboard.project(project.id)}
            className="inline-flex items-center justify-center rounded-full border border-[var(--portal-border)] bg-[var(--portal-surface-soft)] px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--portal-foreground)] transition hover:border-[var(--portal-accent-border)] hover:bg-[var(--portal-badge-bg)] hover:text-[var(--portal-badge-text)]"
          >
            Overview
          </Link>
          {project.liveUrl ? (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-full border border-[var(--portal-border)] bg-[var(--portal-surface-soft)] px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--portal-foreground)] transition hover:border-[var(--portal-accent-border)] hover:bg-[var(--portal-badge-bg)] hover:text-[var(--portal-badge-text)]"
            >
              Open website
            </a>
          ) : null}
        </>
      }
    >
      <div className="space-y-6 relative pb-24">
        {/* Metric Cards - Enhanced Hover & Spacing */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="group rounded-3xl border border-[var(--portal-border)] bg-[var(--portal-elevated)] p-5 transition-shadow hover:shadow-lg">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--portal-muted)]">
              Visible leads
            </p>
            <p className="mt-3 text-3xl font-bold tracking-[-0.04em] text-[var(--portal-foreground)]">
              {formatCompactNumber(activeLeads.length)}
            </p>
          </div>
          <div className="group rounded-3xl border border-[var(--portal-border)] bg-[var(--portal-elevated)] p-5 transition-shadow hover:shadow-lg">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--portal-muted)]">
              Latest enquiry
            </p>
            <p className="mt-3 text-sm font-semibold text-[var(--portal-foreground)] truncate">
              {latestLead ? latestLead.fullName : "No leads yet"}
            </p>
            <p className="mt-1 text-xs text-[var(--portal-muted)]">
              {latestLead ? formatPortalDate(latestLead.createdAt) : "Waiting for first enquiry"}
            </p>
          </div>
          <div className="group rounded-3xl border border-[var(--portal-border)] bg-[var(--portal-elevated)] p-5 transition-shadow hover:shadow-lg">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--portal-muted)]">
              Hidden leads
            </p>
            <p className="mt-3 text-3xl font-bold tracking-[-0.04em] text-[var(--portal-foreground)]">
              {canSeeHidden ? formatCompactNumber(hiddenLeads.length) : "—"}
            </p>
          </div>
          <div className="group rounded-3xl border border-[var(--portal-border)] bg-[var(--portal-elevated)] p-5 transition-shadow hover:shadow-lg">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--portal-muted)]">
              Live delivery
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <ClientPortalStatusPill
                label={project.liveUrl ? "LIVE" : "PENDING"}
                tone={project.liveUrl ? "success" : "neutral"}
              />
              <ClientPortalStatusPill
                label={project.status}
                tone={project.status === "ACTIVE" ? "indigo" : "neutral"}
              />
            </div>
          </div>
        </section>

        <ClientPortalSectionCard
          title="Lead Directory"
          className="min-h-[500px]" // Prevent layout shift
        >
          {/* Tabs */}
          <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-[var(--portal-border)] pb-4">
            <button
              type="button"
              onClick={() => switchTab("active")}
              className={`rounded-full px-5 py-2 text-xs font-bold uppercase tracking-[0.18em] transition-all duration-200 ${
                activeTab === "active"
                  ? "bg-[var(--portal-foreground)] text-[var(--portal-surface)] shadow-md"
                  : "bg-transparent text-[var(--portal-muted)] hover:bg-[var(--portal-surface-soft)] hover:text-[var(--portal-foreground)]"
              }`}
            >
              Active
            </button>
            {canSeeHidden && (
              <button
                type="button"
                onClick={() => switchTab("hidden")}
                className={`rounded-full px-5 py-2 text-xs font-bold uppercase tracking-[0.18em] transition-all duration-200 ${
                  activeTab === "hidden"
                    ? "bg-[var(--portal-foreground)] text-[var(--portal-surface)] shadow-md"
                    : "bg-transparent text-[var(--portal-muted)] hover:bg-[var(--portal-surface-soft)] hover:text-[var(--portal-foreground)]"
                }`}
              >
                Hidden
              </button>
            )}
            {canSeeDeleted && (
              <button
                type="button"
                onClick={() => switchTab("deleted")}
                className={`rounded-full px-5 py-2 text-xs font-bold uppercase tracking-[0.18em] transition-all duration-200 ${
                  activeTab === "deleted"
                    ? "bg-[var(--portal-tone-warning-bg)] text-[var(--portal-tone-warning-text)] shadow-md"
                    : "bg-transparent text-[var(--portal-muted)] hover:bg-[var(--portal-surface-soft)] hover:text-[var(--portal-tone-warning-text)]"
                }`}
              >
                Deleted
              </button>
            )}
            {activeTab !== "deleted" && sourceOptions.length > 1 ? (
              <select
                value={sourceFilter}
                onChange={(event) => {
                  setSourceFilter(event.target.value);
                  setSelectedLeadIds([]);
                }}
                className="ml-auto h-9 rounded-full border border-[var(--portal-border)] bg-[var(--portal-surface)] px-3 text-xs font-semibold text-[var(--portal-foreground)] outline-none"
              >
                <option value="ALL">All sources</option>
                {sourceOptions.map((source) => (
                  <option key={source} value={source}>
                    {source}
                  </option>
                ))}
              </select>
            ) : null}
          </div>

          {/* Feedback Messages */}
          {statusMessage && (
            <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50/50 px-5 py-4 text-sm font-medium text-emerald-800 animate-in fade-in slide-in-from-top-2">
              ✓ {statusMessage}
            </div>
          )}
          {errorMessage && (
            <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50/50 px-5 py-4 text-sm font-medium text-rose-800 animate-in fade-in slide-in-from-top-2">
              ⚠ {errorMessage}
            </div>
          )}

          {/* Main Table Content */}
          <div className="w-full overflow-x-auto rounded-2xl border border-[var(--portal-border)] bg-[var(--portal-surface)]">
            {activeTab === "deleted" ? (
              tombstones.length ? (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--portal-border)] bg-[var(--portal-surface-soft)] text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--portal-muted)]">
                      <th className="p-4 whitespace-nowrap">Deleted lead ID</th>
                      <th className="p-4 whitespace-nowrap">Deleted by</th>
                      <th className="p-4">Reason</th>
                      <th className="p-4 whitespace-nowrap">Deleted at</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--portal-border)]">
                    {tombstones.map((entry) => (
                      <tr key={entry.id} className="transition-colors hover:bg-[var(--portal-surface-soft)]">
                        <td className="p-4 text-sm font-medium text-[var(--portal-foreground)]">
                          {entry.deletedProjectLeadId}
                        </td>
                        <td className="p-4 text-sm text-[var(--portal-muted)]">
                          {entry.deletedByUserFullName || entry.deletedByUserEmail || "Unknown"}
                        </td>
                        <td className="p-4 text-sm text-[var(--portal-muted)]">
                          <span className="inline-flex rounded-md bg-[var(--portal-border)] px-2 py-1 text-[11px] font-semibold">
                            {humanizeReason(entry.reasonCode)}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-[var(--portal-muted)]">
                          {formatPortalDate(entry.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="flex flex-col items-center justify-center py-24 text-[var(--portal-muted)]">
                  <svg className="h-12 w-12 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <p>No deleted tombstones for this project yet.</p>
                </div>
              )
            ) : currentLeads.length ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--portal-border)] bg-[var(--portal-surface-soft)] text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--portal-muted)]">
                    {canManageVisibleLeads && (
                      <th className="p-4 w-12 text-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-[var(--portal-border)] text-[var(--portal-foreground)] focus:ring-[var(--portal-foreground)] cursor-pointer"
                          checked={allSelected}
                          onChange={(event) => toggleSelectAll(event.target.checked)}
                          title="Select all"
                        />
                      </th>
                    )}
                    <th className="p-4">Lead Info</th>
                    <th className="p-4">Contact</th>
                    <th className="p-4">Enquiry Details</th>
                    <th className="p-4">Source Proof</th>
                    {activeTab === "hidden" && <th className="p-4">Hidden By</th>}
                    <th className="p-4 whitespace-nowrap">Submitted</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--portal-border)]">
                  {currentLeads.map((lead) => {
                    const revealed = revealedContacts[lead.id];
                    const displayLead = {
                      ...lead,
                      email: revealed?.email ?? lead.email,
                      phone: revealed?.phone ?? lead.phone,
                    };
                    const canUseContactLinks = project.membershipRole === "OWNER" || Boolean(revealed);
                    const actions = buildLeadRowActionsWithOptions(displayLead, {
                      includeContact: canUseContactLinks,
                    });

                    return (
                      <tr key={lead.id} className="transition-colors hover:bg-[var(--portal-surface-soft)] group">
                        {canManageVisibleLeads && (
                          <td className="p-4 align-top text-center">
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-[var(--portal-border)] text-[var(--portal-foreground)] focus:ring-[var(--portal-foreground)] cursor-pointer"
                              checked={selectedLeadIds.includes(lead.id)}
                              onChange={(event) => toggleLeadSelection(lead.id, event.target.checked)}
                            />
                          </td>
                        )}
                        <td className="p-4 align-top">
                          <p className="font-semibold text-[var(--portal-foreground)]">{lead.fullName}</p>
                          <p className="mt-1 text-sm text-[var(--portal-muted)]">
                            {lead.companyName || "No company"}
                          </p>
                        </td>
                        <td className="p-4 align-top">
                          <div className="flex flex-col gap-1">
                            <span className="text-sm font-medium text-[var(--portal-foreground)]">{displayLead.email}</span>
                            <span className="text-sm text-[var(--portal-muted)]">{displayLead.phone || "No phone"}</span>
                            {revealed && (
                              <span className="mt-1 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-600 animate-pulse">
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                                Temp Reveal
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 align-top max-w-xs">
                          <div className="inline-block mb-2">
                            <ClientPortalStatusPill label={buildLeadNeedLabel(lead)} tone="blue" />
                          </div>
                          {(lead.problemSummary || lead.message) && (
                            <p className="text-xs leading-relaxed text-[var(--portal-muted)] line-clamp-3 group-hover:line-clamp-none transition-all" title={lead.problemSummary || lead.message!}>
                              {lead.problemSummary || lead.message}
                            </p>
                          )}
                          <div className="mt-2 text-[10px] font-medium text-[var(--portal-muted)]">
                            Source: {buildLeadSourceLabel(lead)}
                          </div>
                        </td>
                        <td className="p-4 align-top min-w-[220px]">
                          <div className="space-y-2">
                            <div>
                              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--portal-muted)]">
                                {lead.sourceKind?.replace(/_/g, " ") ?? "Web Form"}
                              </p>
                              <p className="mt-1 text-sm font-semibold text-[var(--portal-foreground)]">
                                {lead.campaignName ||
                                  lead.sourceConnectorLabel ||
                                  buildLeadSourceLabel(lead)}
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {lead.importBatchLabel ? (
                                <span className="rounded-md bg-[var(--portal-surface-soft)] px-2 py-1 text-[10px] font-semibold text-[var(--portal-muted)]">
                                  Batch: {lead.importBatchLabel}
                                </span>
                              ) : null}
                              {lead.externalLeadId ? (
                                <span className="rounded-md bg-[var(--portal-surface-soft)] px-2 py-1 text-[10px] font-semibold text-[var(--portal-muted)]">
                                  External: {lead.externalLeadId}
                                </span>
                              ) : null}
                              {lead.capturedAt ? (
                                <span className="rounded-md bg-[var(--portal-surface-soft)] px-2 py-1 text-[10px] font-semibold text-[var(--portal-muted)]">
                                  Captured {formatPortalDate(lead.capturedAt)}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </td>
                        {activeTab === "hidden" && (
                          <td className="p-4 align-top">
                            <p className="text-xs font-medium text-[var(--portal-foreground)]">
                              {lead.hiddenByUserFullName || "Unknown"}
                            </p>
                            <p className="mt-1 text-xs text-[var(--portal-muted)]">{humanizeReason(lead.hiddenReasonCode)}</p>
                          </td>
                        )}
                        <td className="p-4 align-top text-sm text-[var(--portal-muted)] whitespace-nowrap">
                          {formatPortalDate(lead.createdAt)}
                        </td>
                        <td className="p-4 align-top text-right">
                          <div className="flex justify-end gap-2">
                            {isOperator && !revealed && (
                              <button
                                type="button"
                                onClick={() =>
                                  runLeadMutation(async () => {
                                    const result = await revealProjectLeadForApp({
                                      projectId: project.id,
                                      leadId: lead.id,
                                      reasonCode: "CLIENT_SUPPORT",
                                    });

                                    setRevealedContacts((current) => ({
                                      ...current,
                                      [lead.id]: {
                                        email: result.lead.email,
                                        phone: result.lead.phone,
                                      },
                                    }));

                                    const expiryMs = new Date(result.expiresAt).getTime() - Date.now();
                                    if (expiryMs > 0) {
                                      window.setTimeout(() => {
                                        setRevealedContacts((current) => {
                                          const next = { ...current };
                                          delete next[lead.id];
                                          return next;
                                        });
                                      }, expiryMs);
                                    }
                                    setStatusMessage("Contact revealed for 5 minutes.");
                                  })
                                }
                                className="rounded-lg bg-[var(--portal-surface-soft)] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--portal-foreground)] hover:bg-[var(--portal-border)] transition-colors"
                              >
                                Reveal
                              </button>
                            )}
                            <PortalActionMenu items={actions} triggerLabel="⋮" />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-[var(--portal-muted)]">
                <svg className="h-12 w-12 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p>
                  {activeTab === "hidden"
                    ? "No hidden leads are stored for this project."
                    : "No client-visible leads have been stored for this project yet."}
                </p>
              </div>
            )}
          </div>
        </ClientPortalSectionCard>

        {/* Floating Bulk Action Bar (Contextual UI) */}
        {activeTab !== "deleted" && canManageVisibleLeads && selectedLeadIds.length > 0 && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 rounded-full border border-[var(--portal-border)] bg-[var(--portal-surface)]/95 px-6 py-3 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-8">
            <span className="text-sm font-semibold text-[var(--portal-foreground)] border-r border-[var(--portal-border)] pr-4">
              {selectedLeadIds.length} selected
            </span>
            
            {activeTab === "active" ? (
              <>
                <select
                  value={hideReasonCode}
                  onChange={(event) => setHideReasonCode(event.target.value)}
                  className="bg-transparent text-sm font-medium text-[var(--portal-foreground)] outline-none cursor-pointer"
                >
                  {hideReasons.map((r) => <option key={r.code} value={r.code}>{r.label}</option>)}
                </select>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() =>
                    runLeadMutation(async () => {
                      await softDeleteProjectLeadsForApp({
                        projectId: project.id,
                        leadIds: selectedLeadIds,
                        reasonCode: hideReasonCode,
                      });
                      setStatusMessage(`Moved ${selectedLeadIds.length} leads to Hidden.`);
                    })
                  }
                  className="rounded-full bg-[var(--portal-foreground)] px-5 py-2 text-xs font-bold uppercase tracking-[0.15em] text-[var(--portal-surface)] transition hover:opacity-90 disabled:opacity-50"
                >
                  Hide Selected
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() =>
                    runLeadMutation(async () => {
                      await restoreProjectLeadsForApp({
                        projectId: project.id,
                        leadIds: selectedLeadIds,
                      });
                      setStatusMessage(`Restored ${selectedLeadIds.length} leads.`);
                    })
                  }
                  className="rounded-full bg-[var(--portal-foreground)] px-5 py-2 text-xs font-bold uppercase tracking-[0.15em] text-[var(--portal-surface)] transition hover:opacity-90 disabled:opacity-50"
                >
                  Restore
                </button>
                {isOperator && (
                  <button
                    type="button"
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="rounded-full bg-rose-600 px-5 py-2 text-xs font-bold uppercase tracking-[0.15em] text-white transition hover:bg-rose-700"
                  >
                    Hard Delete
                  </button>
                )}
              </>
            )}
            
            <button 
              onClick={() => setSelectedLeadIds([])}
              className="ml-2 text-[var(--portal-muted)] hover:text-[var(--portal-foreground)] transition-colors p-1"
              title="Clear selection"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        )}

        {/* Custom Delete Modal Overlay instead of window.prompt */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-md rounded-3xl border border-[var(--portal-border)] bg-[var(--portal-surface)] p-8 shadow-2xl animate-in zoom-in-95">
              <h3 className="text-xl font-bold text-rose-600 mb-2">Permanent Data Deletion</h3>
              <p className="text-sm text-[var(--portal-muted)] mb-6">
                You are about to permanently erase {selectedLeadIds.length} lead(s). This action cannot be undone and purges raw data.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--portal-muted)] mb-1.5">Reason for deletion</label>
                  <select
                    value={hardDeleteReasonCode}
                    onChange={(event) => setHardDeleteReasonCode(event.target.value)}
                    className="w-full rounded-xl border border-[var(--portal-border)] bg-[var(--portal-surface-soft)] px-4 py-3 text-sm font-medium text-[var(--portal-foreground)] outline-none focus:border-[var(--portal-foreground)]"
                  >
                    {HARD_DELETE_REASONS.map((r) => <option key={r.code} value={r.code}>{r.label}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--portal-muted)] mb-1.5">
                    Type <strong>delete</strong> to confirm
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="delete"
                    className="w-full rounded-xl border border-[var(--portal-border)] bg-[var(--portal-surface-soft)] px-4 py-3 text-sm text-[var(--portal-foreground)] outline-none focus:border-[var(--portal-foreground)]"
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setDeleteConfirmText("");
                  }}
                  className="rounded-full px-5 py-2.5 text-sm font-bold text-[var(--portal-muted)] hover:bg-[var(--portal-surface-soft)] hover:text-[var(--portal-foreground)] transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deleteConfirmText !== "delete" || isPending}
                  onClick={() => {
                    void runLeadMutation(async () => {
                      await hardDeleteProjectLeadsForApp({
                        projectId: project.id,
                        leadIds: selectedLeadIds,
                        reasonCode: hardDeleteReasonCode,
                        confirmation: deleteConfirmText,
                      });
                      setStatusMessage(`${selectedLeadIds.length} leads permanently deleted.`);
                    });
                  }}
                  className="rounded-full bg-rose-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isPending ? "Deleting..." : "Permanently Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ClientPortalShell>
  );
}
