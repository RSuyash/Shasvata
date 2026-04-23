"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  createProjectManualLeadForApp,
  fetchProjectAcquisitionSourcesForApp,
  importProjectLeadsCsvForApp,
  testProjectAcquisitionConnectorForApp,
  upsertProjectAcquisitionCampaignForApp,
  type AcquisitionCampaign,
  type AcquisitionConnector,
  type LeadSourceKind,
} from "@/lib/landing-portal";

const DEFAULT_MAPPING = {
  fullName: "Name",
  email: "Email",
  phone: "Phone",
  companyName: "Company",
  message: "Message",
  utmSource: "UTM Source",
  utmCampaign: "Campaign",
  externalLeadId: "External Lead ID",
};

const PROVIDERS: Array<{ value: LeadSourceKind; label: string }> = [
  { value: "GOOGLE_ADS", label: "Google Ads" },
  { value: "META_LEAD_ADS", label: "Meta Lead Ads" },
  { value: "LINKEDIN_LEAD_GEN", label: "LinkedIn Lead Gen" },
  { value: "CSV_IMPORT", label: "CSV Import" },
  { value: "EVENT_IMPORT", label: "Event Import" },
];

function StatusBadge({ status }: { status: AcquisitionConnector["status"] }) {
  const tone =
    status === "ACTIVE"
      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
      : status === "ERROR"
        ? "border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400"
        : status === "NEEDS_AUTH"
          ? "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400"
          : "border-gray-500/20 bg-gray-500/10 text-gray-600 dark:text-gray-400";

  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${tone}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "email" | "tel";
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-semibold text-[var(--portal-foreground)]">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-10 rounded-lg border border-[var(--portal-border)] bg-[var(--portal-surface)] px-3 text-sm font-normal text-[var(--portal-foreground)] outline-none focus:border-[var(--portal-foreground)]"
      />
    </label>
  );
}

export function ProjectAcquisitionSourcesView({ projectId }: { projectId: string }) {
  const [isPending, startTransition] = useTransition();
  const [connectors, setConnectors] = useState<AcquisitionConnector[]>([]);
  const [campaigns, setCampaigns] = useState<AcquisitionCampaign[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [csvText, setCsvText] = useState("");
  const [csvCampaignId, setCsvCampaignId] = useState("");
  const [fieldMapping, setFieldMapping] = useState(DEFAULT_MAPPING);
  const [manualMode, setManualMode] = useState<"MANUAL_ENTRY" | "EVENT_IMPORT">(
    "EVENT_IMPORT",
  );
  const [manualLead, setManualLead] = useState({
    fullName: "",
    email: "",
    phone: "",
    companyName: "",
    message: "",
    eventName: "",
    campaignId: "",
  });
  const [campaignForm, setCampaignForm] = useState({
    provider: "GOOGLE_ADS" as LeadSourceKind,
    name: "",
    externalCampaignId: "",
    utmSource: "",
    utmMedium: "",
    utmCampaign: "",
  });

  const connectorSummary = useMemo(() => {
    const active = connectors.filter((connector) => connector.status === "ACTIVE").length;
    const needsAuth = connectors.filter((connector) => connector.status === "NEEDS_AUTH").length;
    return { active, needsAuth };
  }, [connectors]);

  function reload() {
    startTransition(async () => {
      try {
        const data = await fetchProjectAcquisitionSourcesForApp({ projectId });
        setConnectors(data.connectors);
        setCampaigns(data.campaigns);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load acquisition sources.");
      }
    });
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  function run(task: () => Promise<string>) {
    setStatus(null);
    setError(null);
    startTransition(async () => {
      try {
        const message = await task();
        setStatus(message);
        reload();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Acquisition action failed.");
      }
    });
  }

  return (
    <div className="space-y-6 p-6">
      {(status || error) && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm font-medium ${
            error
              ? "border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300"
              : "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
          }`}
        >
          {error ?? status}
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-[var(--portal-border)] bg-[var(--portal-surface-soft)] p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--portal-muted)]">
            Active Sources
          </p>
          <p className="mt-2 text-2xl font-bold text-[var(--portal-foreground)]">
            {connectorSummary.active}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--portal-border)] bg-[var(--portal-surface-soft)] p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--portal-muted)]">
            Needs Auth
          </p>
          <p className="mt-2 text-2xl font-bold text-[var(--portal-foreground)]">
            {connectorSummary.needsAuth}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--portal-border)] bg-[var(--portal-surface-soft)] p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--portal-muted)]">
            Campaign Maps
          </p>
          <p className="mt-2 text-2xl font-bold text-[var(--portal-foreground)]">
            {campaigns.length}
          </p>
        </div>
      </section>

      <section className="rounded-xl border border-[var(--portal-border)] bg-[var(--portal-surface-soft)] p-5">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-[var(--portal-foreground)]">
              Connector Health
            </h3>
            <p className="text-xs text-[var(--portal-muted)]">
              External platforms stay in setup state until approved credentials exist.
            </p>
          </div>
          <button
            type="button"
            onClick={reload}
            disabled={isPending}
            className="h-8 rounded-md border border-[var(--portal-border)] bg-[var(--portal-surface)] px-3 text-[11px] font-bold uppercase tracking-wider text-[var(--portal-foreground)] disabled:opacity-50"
          >
            Refresh
          </button>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {connectors.map((connector) => (
            <div
              key={connector.id}
              className="rounded-lg border border-[var(--portal-border)] bg-[var(--portal-surface)] p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[var(--portal-foreground)]">
                    {connector.label}
                  </p>
                  <p className="mt-1 text-xs text-[var(--portal-muted)]">
                    {connector.kind.replace(/_/g, " ")}
                  </p>
                </div>
                <StatusBadge status={connector.status} />
              </div>
              {connector.lastError ? (
                <p className="mt-3 text-xs text-amber-600 dark:text-amber-400">
                  {connector.lastError}
                </p>
              ) : null}
              <button
                type="button"
                onClick={() =>
                  run(async () => {
                    const result = await testProjectAcquisitionConnectorForApp({
                      projectId,
                      connectorId: connector.id,
                    });
                    return result.result.message;
                  })
                }
                disabled={isPending}
                className="mt-4 h-8 w-full rounded-md bg-[var(--portal-foreground)] px-3 text-[11px] font-bold uppercase tracking-wider text-[var(--portal-surface)] disabled:opacity-50"
              >
                Test
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-[var(--portal-border)] bg-[var(--portal-surface-soft)] p-5">
          <h3 className="text-sm font-bold text-[var(--portal-foreground)]">
            CSV Import
          </h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Input
              label="Name column"
              value={fieldMapping.fullName}
              onChange={(value) => setFieldMapping((current) => ({ ...current, fullName: value }))}
            />
            <Input
              label="Email column"
              value={fieldMapping.email}
              onChange={(value) => setFieldMapping((current) => ({ ...current, email: value }))}
            />
            <Input
              label="Phone column"
              value={fieldMapping.phone}
              onChange={(value) => setFieldMapping((current) => ({ ...current, phone: value }))}
            />
            <Input
              label="Campaign column"
              value={fieldMapping.utmCampaign}
              onChange={(value) =>
                setFieldMapping((current) => ({ ...current, utmCampaign: value }))
              }
            />
          </div>
          <label className="mt-4 flex flex-col gap-1.5 text-sm font-semibold text-[var(--portal-foreground)]">
            Campaign map
            <select
              value={csvCampaignId}
              onChange={(event) => setCsvCampaignId(event.target.value)}
              className="h-10 rounded-lg border border-[var(--portal-border)] bg-[var(--portal-surface)] px-3 text-sm text-[var(--portal-foreground)] outline-none"
            >
              <option value="">Auto-match</option>
              {campaigns.map((campaign) => (
                <option key={campaign.id} value={campaign.id}>
                  {campaign.name}
                </option>
              ))}
            </select>
          </label>
          <textarea
            value={csvText}
            onChange={(event) => setCsvText(event.target.value)}
            placeholder="Name,Email,Phone,Campaign&#10;Aarya Singh,aarya@example.com,+91 98765 43210,Spring Launch"
            className="mt-4 min-h-[180px] w-full rounded-lg border border-[var(--portal-border)] bg-[var(--portal-surface)] p-3 font-mono text-xs text-[var(--portal-foreground)] outline-none"
          />
          <button
            type="button"
            disabled={isPending || !csvText.trim()}
            onClick={() =>
              run(async () => {
                const result = await importProjectLeadsCsvForApp({
                  projectId,
                  csvText,
                  campaignId: csvCampaignId || undefined,
                  fieldMapping,
                });
                setCsvText("");
                return `Imported ${result.batch.importedRows} rows; ${result.batch.failedRows} failed.`;
              })
            }
            className="mt-4 h-10 rounded-lg bg-[var(--portal-foreground)] px-4 text-xs font-bold uppercase tracking-wider text-[var(--portal-surface)] disabled:opacity-50"
          >
            Import CSV
          </button>
        </div>

        <div className="rounded-xl border border-[var(--portal-border)] bg-[var(--portal-surface-soft)] p-5">
          <h3 className="text-sm font-bold text-[var(--portal-foreground)]">
            Quick Capture
          </h3>
          <div className="mt-4 flex rounded-lg border border-[var(--portal-border)] bg-[var(--portal-surface)] p-1">
            {(["EVENT_IMPORT", "MANUAL_ENTRY"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setManualMode(mode)}
                className={`flex-1 rounded-md py-2 text-xs font-bold uppercase tracking-wider ${
                  manualMode === mode
                    ? "bg-[var(--portal-foreground)] text-[var(--portal-surface)]"
                    : "text-[var(--portal-muted)]"
                }`}
              >
                {mode === "EVENT_IMPORT" ? "Event" : "Manual"}
              </button>
            ))}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Input
              label="Full name"
              value={manualLead.fullName}
              onChange={(value) => setManualLead((current) => ({ ...current, fullName: value }))}
            />
            <Input
              label="Email"
              type="email"
              value={manualLead.email}
              onChange={(value) => setManualLead((current) => ({ ...current, email: value }))}
            />
            <Input
              label="Phone"
              type="tel"
              value={manualLead.phone}
              onChange={(value) => setManualLead((current) => ({ ...current, phone: value }))}
            />
            <Input
              label="Event"
              value={manualLead.eventName}
              onChange={(value) => setManualLead((current) => ({ ...current, eventName: value }))}
            />
          </div>
          <label className="mt-3 flex flex-col gap-1.5 text-sm font-semibold text-[var(--portal-foreground)]">
            Campaign map
            <select
              value={manualLead.campaignId}
              onChange={(event) =>
                setManualLead((current) => ({ ...current, campaignId: event.target.value }))
              }
              className="h-10 rounded-lg border border-[var(--portal-border)] bg-[var(--portal-surface)] px-3 text-sm text-[var(--portal-foreground)] outline-none"
            >
              <option value="">Auto-match</option>
              {campaigns.map((campaign) => (
                <option key={campaign.id} value={campaign.id}>
                  {campaign.name}
                </option>
              ))}
            </select>
          </label>
          <textarea
            value={manualLead.message}
            onChange={(event) =>
              setManualLead((current) => ({ ...current, message: event.target.value }))
            }
            placeholder="Lead notes"
            className="mt-3 min-h-[92px] w-full rounded-lg border border-[var(--portal-border)] bg-[var(--portal-surface)] p-3 text-sm text-[var(--portal-foreground)] outline-none"
          />
          <button
            type="button"
            disabled={isPending || !manualLead.email.trim()}
            onClick={() =>
              run(async () => {
                await createProjectManualLeadForApp({
                  projectId,
                  sourceKind: manualMode,
                  campaignId: manualLead.campaignId || undefined,
                  fullName: manualLead.fullName,
                  email: manualLead.email,
                  phone: manualLead.phone,
                  companyName: manualLead.companyName,
                  message: manualLead.message,
                  eventName: manualLead.eventName,
                });
                setManualLead({
                  fullName: "",
                  email: "",
                  phone: "",
                  companyName: "",
                  message: "",
                  eventName: "",
                  campaignId: "",
                });
                return "Lead captured and queued for downstream sync.";
              })
            }
            className="mt-4 h-10 rounded-lg bg-[var(--portal-foreground)] px-4 text-xs font-bold uppercase tracking-wider text-[var(--portal-surface)] disabled:opacity-50"
          >
            Capture Lead
          </button>
        </div>
      </section>

      <section className="rounded-xl border border-[var(--portal-border)] bg-[var(--portal-surface-soft)] p-5">
        <h3 className="text-sm font-bold text-[var(--portal-foreground)]">
          Campaign Mapping
        </h3>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <label className="flex flex-col gap-1.5 text-sm font-semibold text-[var(--portal-foreground)]">
            Provider
            <select
              value={campaignForm.provider}
              onChange={(event) =>
                setCampaignForm((current) => ({
                  ...current,
                  provider: event.target.value as LeadSourceKind,
                }))
              }
              className="h-10 rounded-lg border border-[var(--portal-border)] bg-[var(--portal-surface)] px-3 text-sm text-[var(--portal-foreground)] outline-none"
            >
              {PROVIDERS.map((provider) => (
                <option key={provider.value} value={provider.value}>
                  {provider.label}
                </option>
              ))}
            </select>
          </label>
          <Input
            label="Campaign name"
            value={campaignForm.name}
            onChange={(value) => setCampaignForm((current) => ({ ...current, name: value }))}
          />
          <Input
            label="External ID"
            value={campaignForm.externalCampaignId}
            onChange={(value) =>
              setCampaignForm((current) => ({ ...current, externalCampaignId: value }))
            }
          />
          <Input
            label="UTM source"
            value={campaignForm.utmSource}
            onChange={(value) =>
              setCampaignForm((current) => ({ ...current, utmSource: value }))
            }
          />
          <Input
            label="UTM medium"
            value={campaignForm.utmMedium}
            onChange={(value) =>
              setCampaignForm((current) => ({ ...current, utmMedium: value }))
            }
          />
          <Input
            label="UTM campaign"
            value={campaignForm.utmCampaign}
            onChange={(value) =>
              setCampaignForm((current) => ({ ...current, utmCampaign: value }))
            }
          />
        </div>
        <button
          type="button"
          disabled={isPending || !campaignForm.name.trim()}
          onClick={() =>
            run(async () => {
              await upsertProjectAcquisitionCampaignForApp({
                projectId,
                ...campaignForm,
              });
              setCampaignForm({
                provider: "GOOGLE_ADS",
                name: "",
                externalCampaignId: "",
                utmSource: "",
                utmMedium: "",
                utmCampaign: "",
              });
              return "Campaign mapping saved.";
            })
          }
          className="mt-4 h-10 rounded-lg bg-[var(--portal-foreground)] px-4 text-xs font-bold uppercase tracking-wider text-[var(--portal-surface)] disabled:opacity-50"
        >
          Save Campaign
        </button>
      </section>
    </div>
  );
}
