"use client";

import { Fragment, useMemo, useState } from "react";
import { ProjectLead, buildLeadExportUrl } from "@/lib/landing-portal";

type MeetaloLeadsTableProps = {
  projectId: string;
  leads: ProjectLead[];
};

function buildLeadStatus(lead: ProjectLead) {
  const isNew = lead.notificationStatus === "RECEIVED";
  const isSyncing = lead.syncStatus === "PENDING";
  const isFailed =
    lead.notificationStatus === "NOTIFICATION_FAILED" ||
    lead.syncStatus === "FAILED";

  if (isFailed) {
    return {
      label: "Needs attention",
      background: "var(--portal-tone-warning-bg)",
      color: "var(--portal-tone-warning-text)",
    };
  }

  if (isSyncing) {
    return {
      label: "Syncing",
      background: "var(--portal-tone-blue-bg)",
      color: "var(--portal-tone-blue-text)",
    };
  }

  if (isNew) {
    return {
      label: "New lead",
      background: "var(--portal-tone-success-bg)",
      color: "var(--portal-tone-success-text)",
    };
  }

  return {
    label: "Ready",
    background: "var(--portal-tone-indigo-bg)",
    color: "var(--portal-tone-indigo-text)",
  };
}

function buildLeadSourceChip(sourcePage?: string | null) {
  if (!sourcePage) {
    return "Direct";
  }

  try {
    const url = new URL(sourcePage);
    const finalSegment = url.pathname.split("/").filter(Boolean).pop();
    return finalSegment ? finalSegment.replace(/[-_]/g, " ") : url.hostname;
  } catch {
    return "Source";
  }
}

export function MeetaloLeadsTable({
  projectId,
  leads,
}: MeetaloLeadsTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLeads = useMemo(
    () =>
      leads.filter((lead) => {
        const query = searchQuery.trim().toLowerCase();

        if (!query) {
          return true;
        }

        return (
          lead.fullName.toLowerCase().includes(query) ||
          lead.email.toLowerCase().includes(query) ||
          (lead.phone || "").toLowerCase().includes(query)
        );
      }),
    [leads, searchQuery],
  );

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredLeads.length) {
      setSelectedIds(new Set());
      return;
    }

    setSelectedIds(new Set(filteredLeads.map((lead) => lead.id)));
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);

    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }

    setSelectedIds(next);
  };

  return (
    <section
      id="leads"
      className="client-portal-tone-transition col-span-full border-t pt-6"
      style={{
        borderColor: "var(--portal-header-border)",
      }}
    >
      <div className="mb-4 flex flex-col justify-between gap-4 px-2 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <div
            className="client-portal-tone-transition inline-flex items-center gap-1 rounded-full border p-1"
            style={{
              background: "var(--portal-control)",
              borderColor: "var(--portal-border)",
            }}
          >
            <button
              className="client-portal-tone-transition rounded-full px-4 py-1.5 text-[13px] font-semibold"
              style={{
                background: "var(--portal-elevated)",
                color: "var(--portal-foreground)",
                boxShadow: "var(--portal-elevated-shadow)",
              }}
            >
              List
            </button>
            <button
              className="rounded-full px-4 py-1.5 text-[13px] font-medium"
              style={{ color: "var(--portal-muted)" }}
            >
              Board
            </button>
            <button
              className="rounded-full px-4 py-1.5 text-[13px] font-medium"
              style={{ color: "var(--portal-muted)" }}
            >
              Pipeline
            </button>
          </div>

          <div
            className="hidden h-5 w-px sm:block"
            style={{ background: "var(--portal-border)" }}
          />

          <button
            className="hidden items-center gap-1.5 text-[13px] font-medium sm:flex"
            style={{ color: "var(--portal-muted)" }}
          >
            <span className="material-symbols-outlined text-[16px]">view_agenda</span>
            Group
            <span className="material-symbols-outlined text-[16px]">expand_more</span>
          </button>
        </div>

        <label className="relative block">
          <span
            className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px]"
            style={{ color: "var(--portal-sidebar-icon)" }}
          >
            search
          </span>
          <input
            type="text"
            placeholder="Search leads..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="client-portal-tone-transition w-full rounded-full border py-2 pl-9 pr-3 text-[13px] outline-none sm:w-[280px]"
            style={{
              borderColor: "var(--portal-border)",
              background: "var(--portal-elevated)",
              color: "var(--portal-foreground)",
              boxShadow: "var(--portal-elevated-shadow)",
            }}
          />
        </label>
      </div>

      <div
        className="client-portal-tone-transition overflow-hidden rounded-[30px] border"
        style={{
          borderColor: "var(--portal-border)",
          background: "var(--portal-card)",
          boxShadow: "var(--portal-shadow)",
        }}
      >
        <div className="overflow-x-auto">
          <table className="min-w-[1100px] w-full text-left text-sm">
            <thead>
              <tr
                className="client-portal-tone-transition border-b text-[11px] font-semibold uppercase tracking-[0.22em]"
                style={{
                  borderColor: "var(--portal-border)",
                  color: "var(--portal-muted)",
                  background:
                    "color-mix(in srgb, var(--portal-surface-soft) 80%, transparent)",
                }}
              >
                <th className="w-12 px-4 py-4 text-center">
                  <input
                    type="checkbox"
                    checked={
                      filteredLeads.length > 0 &&
                      selectedIds.size === filteredLeads.length
                    }
                    onChange={toggleSelectAll}
                    className="h-4 w-4 cursor-pointer rounded"
                    style={{ accentColor: "var(--portal-tone-indigo)" }}
                  />
                </th>
                <th className="px-3 py-4">Lead</th>
                <th className="px-3 py-4">Contact</th>
                <th className="px-3 py-4">Enquiry</th>
                <th className="px-3 py-4">Source</th>
                <th className="px-3 py-4">Submitted</th>
                <th className="px-3 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredLeads.length ? (
                filteredLeads.map((lead) => {
                  const isSelected = selectedIds.has(lead.id);
                  const isExpanded = expandedId === lead.id;
                  const leadStatus = buildLeadStatus(lead);
                  const sourceChip = buildLeadSourceChip(lead.sourcePage);

                  return (
                    <Fragment key={lead.id}>
                      <tr
                        className="client-portal-tone-transition cursor-pointer border-b"
                        style={{
                          borderColor: "var(--portal-border)",
                          background: isSelected
                            ? "var(--portal-badge-bg)"
                            : isExpanded
                              ? "var(--portal-surface-soft)"
                              : "transparent",
                        }}
                        onClick={(event) => {
                          const target = event.target as HTMLElement;
                          if (
                            target.closest("input") ||
                            target.closest("button") ||
                            target.closest("a")
                          ) {
                            return;
                          }

                          setExpandedId(isExpanded ? null : lead.id);
                        }}
                      >
                        <td className="px-4 py-4 text-center align-top">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(lead.id)}
                            onClick={(event) => event.stopPropagation()}
                            className="h-4 w-4 cursor-pointer rounded"
                            style={{ accentColor: "var(--portal-tone-indigo)" }}
                          />
                        </td>

                        <td className="px-3 py-4 align-top">
                          <div className="flex items-start gap-2">
                            <span
                              className={`material-symbols-outlined mt-0.5 text-[16px] transition-transform ${
                                isExpanded ? "rotate-90" : ""
                              }`}
                              style={{ color: "var(--portal-sidebar-icon)" }}
                            >
                              chevron_right
                            </span>
                            <div>
                              <p
                                className="text-[13px] font-semibold"
                                style={{ color: "var(--portal-foreground)" }}
                              >
                                {lead.fullName}
                              </p>
                              <p
                                className="mt-1 text-[12px]"
                                style={{ color: "var(--portal-muted)" }}
                              >
                                {lead.companyName || "No company provided"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-3 py-4 align-top">
                          <p
                            className="text-[13px] font-medium"
                            style={{ color: "var(--portal-foreground)" }}
                          >
                            {lead.email}
                          </p>
                          <p
                            className="mt-1 text-[12px]"
                            style={{ color: "var(--portal-muted)" }}
                          >
                            {lead.phone || "No phone"}
                          </p>
                        </td>

                        <td className="px-3 py-4 align-top">
                          <p
                            className="text-[13px] font-semibold"
                            style={{ color: "var(--portal-foreground)" }}
                          >
                            {lead.problemSummary || lead.message || "General enquiry"}
                          </p>
                          <div className="mt-2">
                            <span
                              className="inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold"
                              style={{
                                background: leadStatus.background,
                                color: leadStatus.color,
                              }}
                            >
                              {leadStatus.label}
                            </span>
                          </div>
                        </td>

                        <td className="px-3 py-4 align-top">
                          <span
                            className="inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]"
                            style={{
                              background: "var(--portal-tone-warning-bg)",
                              color: "var(--portal-tone-warning-text)",
                            }}
                          >
                            {sourceChip}
                          </span>
                          {lead.sourcePage ? (
                            <a
                              href={lead.sourcePage}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-2 block max-w-[240px] break-all text-[12px] leading-5"
                              style={{ color: "var(--portal-muted)" }}
                            >
                              {lead.sourcePage}
                            </a>
                          ) : (
                            <p
                              className="mt-2 text-[12px]"
                              style={{ color: "var(--portal-muted)" }}
                            >
                              Direct source
                            </p>
                          )}
                        </td>

                        <td
                          className="px-3 py-4 align-top text-[13px]"
                          style={{ color: "var(--portal-muted)" }}
                        >
                          {new Date(lead.createdAt).toLocaleString()}
                        </td>

                        <td className="px-3 py-4 align-top">
                          <div className="flex justify-end">
                            <details className="group relative">
                              <summary
                                className="client-portal-tone-transition flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-full border"
                                style={{
                                  borderColor: "var(--portal-border)",
                                  background: "var(--portal-elevated)",
                                  color: "var(--portal-foreground)",
                                }}
                              >
                                <span className="tracking-[0.22em]">...</span>
                              </summary>

                              <div
                                className="absolute right-0 top-12 z-20 min-w-[12rem] rounded-[22px] border p-2"
                                style={{
                                  borderColor: "var(--portal-border)",
                                  background: "var(--portal-elevated)",
                                  boxShadow: "var(--portal-elevated-shadow)",
                                }}
                              >
                                {lead.email ? (
                                  <a
                                    href={`mailto:${lead.email}`}
                                    className="block rounded-[16px] px-3 py-2.5 text-sm"
                                    style={{ color: "var(--portal-foreground)" }}
                                  >
                                    Email lead
                                  </a>
                                ) : null}
                                {lead.phone ? (
                                  <a
                                    href={`tel:${lead.phone}`}
                                    className="block rounded-[16px] px-3 py-2.5 text-sm"
                                    style={{ color: "var(--portal-foreground)" }}
                                  >
                                    Call lead
                                  </a>
                                ) : null}
                                {lead.sourcePage ? (
                                  <a
                                    href={lead.sourcePage}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="block rounded-[16px] px-3 py-2.5 text-sm"
                                    style={{ color: "var(--portal-foreground)" }}
                                  >
                                    Open source page
                                  </a>
                                ) : null}
                              </div>
                            </details>
                          </div>
                        </td>
                      </tr>

                      {isExpanded ? (
                        <tr
                          className="client-portal-tone-transition border-b"
                          style={{
                            borderColor: "var(--portal-border)",
                            background: "var(--portal-surface-soft)",
                          }}
                        >
                          <td />
                          <td colSpan={6} className="px-3 py-5">
                            <div className="grid gap-5 lg:grid-cols-3">
                              <div
                                className="rounded-[22px] border p-4"
                                style={{
                                  borderColor: "var(--portal-border)",
                                  background: "var(--portal-elevated)",
                                }}
                              >
                                <p
                                  className="text-[11px] font-semibold uppercase tracking-[0.22em]"
                                  style={{ color: "var(--portal-muted)" }}
                                >
                                  Message context
                                </p>
                                <p
                                  className="mt-3 text-[13px] leading-6"
                                  style={{ color: "var(--portal-foreground)" }}
                                >
                                  {lead.message || "No extra message provided."}
                                </p>
                              </div>

                              <div
                                className="rounded-[22px] border p-4"
                                style={{
                                  borderColor: "var(--portal-border)",
                                  background: "var(--portal-elevated)",
                                }}
                              >
                                <p
                                  className="text-[11px] font-semibold uppercase tracking-[0.22em]"
                                  style={{ color: "var(--portal-muted)" }}
                                >
                                  Marketing attribution
                                </p>
                                <div
                                  className="mt-3 space-y-2 text-[13px]"
                                  style={{ color: "var(--portal-muted)" }}
                                >
                                  <p>Source: {lead.utmSource || "n/a"}</p>
                                  <p>Medium: {lead.utmMedium || "n/a"}</p>
                                  <p>Campaign: {lead.utmCampaign || "n/a"}</p>
                                </div>
                              </div>

                              <div
                                className="rounded-[22px] border p-4"
                                style={{
                                  borderColor: "var(--portal-border)",
                                  background: "var(--portal-elevated)",
                                }}
                              >
                                <p
                                  className="text-[11px] font-semibold uppercase tracking-[0.22em]"
                                  style={{ color: "var(--portal-muted)" }}
                                >
                                  Lead record
                                </p>
                                <div
                                  className="mt-3 space-y-2 text-[13px]"
                                  style={{ color: "var(--portal-muted)" }}
                                >
                                  <p>Company: {lead.companyName || "n/a"}</p>
                                  <p>Sync status: {lead.syncStatus}</p>
                                  <p>Alert status: {lead.notificationStatus}</p>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-24 text-center"
                    style={{ color: "var(--portal-muted)" }}
                  >
                    <div className="flex flex-col items-center justify-center gap-3">
                      <span className="material-symbols-outlined text-5xl">inbox</span>
                      <p className="text-[14px] font-semibold">No leads found</p>
                      <p className="max-w-[240px] text-[12px] leading-6">
                        Try adjusting the search or wait for new submissions.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedIds.size > 0 ? (
        <div className="fixed bottom-10 left-1/2 z-[100] -translate-x-1/2 animate-in slide-in-from-bottom-5 duration-300">
          <div
            className="client-portal-tone-transition flex items-center gap-4 rounded-full border px-6 py-3 shadow-2xl"
            style={{
              borderColor: "var(--portal-border)",
              background: "var(--portal-elevated)",
              boxShadow: "var(--portal-elevated-shadow)",
            }}
          >
            <div
              className="flex items-center gap-2 border-r pr-4"
              style={{ borderColor: "var(--portal-border)" }}
            >
              <span
                className="tabular-nums text-[13px] font-bold"
                style={{ color: "var(--portal-foreground)" }}
              >
                {selectedIds.size}
              </span>
              <span
                className="text-[12px] font-medium"
                style={{ color: "var(--portal-muted)" }}
              >
                Selected
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                className="client-portal-tone-transition flex items-center gap-2 rounded-full px-4 py-1.5 text-[12px] font-bold"
                style={{
                  background: "var(--portal-control)",
                  color: "var(--portal-foreground)",
                }}
              >
                <span className="material-symbols-outlined text-[16px]">outgoing_mail</span>
                Engage
              </button>

              <details className="group relative">
                <summary
                  className="client-portal-tone-transition flex cursor-pointer list-none items-center gap-2 rounded-full border px-4 py-1.5 text-[12px] font-bold"
                  style={{
                    borderColor: "var(--portal-border)",
                    color: "var(--portal-foreground)",
                  }}
                >
                  <span className="material-symbols-outlined text-[16px]">download</span>
                  Download
                  <span className="material-symbols-outlined text-[16px]">expand_more</span>
                </summary>

                <div
                  className="absolute bottom-full right-0 mb-3 w-48 rounded-[22px] border p-2"
                  style={{
                    borderColor: "var(--portal-border)",
                    background: "var(--portal-elevated)",
                    boxShadow: "var(--portal-elevated-shadow)",
                  }}
                >
                  <a
                    href={buildLeadExportUrl(projectId, "csv")}
                    className="block rounded-[16px] px-3 py-2.5 text-sm"
                    style={{ color: "var(--portal-foreground)" }}
                  >
                    Download CSV
                  </a>
                  <a
                    href={buildLeadExportUrl(projectId, "xlsx")}
                    className="block rounded-[16px] px-3 py-2.5 text-sm"
                    style={{ color: "var(--portal-foreground)" }}
                  >
                    Download XLSX
                  </a>
                </div>
              </details>

              <button
                onClick={() => setSelectedIds(new Set())}
                className="client-portal-tone-transition flex h-8 w-8 items-center justify-center rounded-full"
                style={{ color: "var(--portal-muted)" }}
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
