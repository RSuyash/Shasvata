"use client";

import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
  type ComponentPropsWithoutRef,
} from "react";
import {
  upsertProjectMdocSyncTargetForApp,
  testProjectMdocSyncTargetForApp,
  updateProjectTrackingSettingsForApp,
  type ProjectSite,
  type ProjectSyncTarget,
} from "@/lib/landing-portal";

// ── Types ──────────────────────────────────────────────────────────────────────

interface TrackingState {
  ga4MeasurementId: string;
  googleAdsTagId: string;
  googleAdsConversionMode: "DIRECT_LABEL" | "GA4_IMPORTED";
  googleAdsLeadConversionLabel: string;
  gtmContainerId: string;
  metaPixelId: string;
  trackingNotes: string;
}

interface MdocState {
  status: "ACTIVE" | "INACTIVE";
  label: string;
  endpoint: string;
  apiKey: string;
  dataFrom: "T" | "E";
  source: string;
  fallbackSourceDetail: string;
  sourceDetailRulesJson: string;
  staticDefaultsJson: string;
  enumMappingsJson: string;
}

interface EnumMappings {
  preferences: Record<string, string>;
  budgets: Record<string, string>;
  buyingPurposes: Record<string, string>;
  possessionReqs: Record<string, string>;
  ageRanges: Record<string, string>;
}

type SaveKey = "tracking" | "mdoc" | "mdocTest" | "notes" | null;
type Tab = "tracking" | "api" | "notes";

// ── Constants ──────────────────────────────────────────────────────────────────

const DEFAULT_MDOC_STATE: MdocState = {
  status: "ACTIVE",
  label: "MDOC push",
  endpoint: "",
  apiKey: "",
  dataFrom: "E",
  source: "Digitals",
  fallbackSourceDetail: "Website",
  sourceDetailRulesJson: "{}",
  staticDefaultsJson: "{}",
  enumMappingsJson: "{}",
};

const ENUM_MAPPING_KEYS = [
  "preferences",
  "budgets",
  "buyingPurposes",
  "possessionReqs",
  "ageRanges",
] as const;

// ── Pure Helpers ───────────────────────────────────────────────────────────────

function toTrackingState(site: ProjectSite | null): TrackingState {
  return {
    ga4MeasurementId: site?.ga4MeasurementId ?? "",
    googleAdsTagId: site?.googleAdsTagId ?? "",
    googleAdsConversionMode: site?.googleAdsConversionMode ?? "DIRECT_LABEL",
    googleAdsLeadConversionLabel: site?.googleAdsLeadConversionLabel ?? "",
    gtmContainerId: site?.gtmContainerId ?? "",
    metaPixelId: site?.metaPixelId ?? "",
    trackingNotes: site?.trackingNotes ?? "",
  };
}

function toMdocState(target: ProjectSyncTarget | null): MdocState {
  if (!target || target.kind !== "MDOC_PUSH" || !("endpoint" in target.config)) {
    return DEFAULT_MDOC_STATE;
  }

  const c = target.config;
  const fmt = (v: unknown) => JSON.stringify(v ?? {}, null, 2);

  return {
    status: target.status,
    label: target.label ?? "MDOC push",
    endpoint: c.endpoint ?? "",
    apiKey: c.apiKey ?? "",
    dataFrom: c.dataFrom ?? "E",
    source: c.source ?? "Digitals",
    fallbackSourceDetail: c.fallbackSourceDetail ?? "Website",
    sourceDetailRulesJson: fmt(c.sourceDetailRules),
    staticDefaultsJson: fmt(c.staticDefaults),
    enumMappingsJson: fmt(c.enumMappings),
  };
}

function parseJson(raw: string, label: string): unknown {
  const trimmed = raw.trim();
  if (!trimmed) return {};
  try {
    return JSON.parse(trimmed);
  } catch {
    throw new Error(`${label} must be valid JSON.`);
  }
}

function assertStringRecord(value: unknown, label: string): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be a JSON object.`);
  }
  const result: Record<string, string> = {};
  for (const [k, v] of Object.entries(value)) {
    if (typeof v !== "string") throw new Error(`${label} values must be strings.`);
    result[k.trim()] = v.trim();
  }
  return result;
}

function parseStringMapJson(json: string, label: string): Record<string, string> {
  return assertStringRecord(parseJson(json, label), label);
}

function parseEnumMappingsJson(json: string): EnumMappings {
  const root = parseJson(json, "MDOC enum mappings");
  if (!root || typeof root !== "object" || Array.isArray(root)) {
    throw new Error("MDOC enum mappings must be a JSON object.");
  }
  const obj = root as Record<string, unknown>;
  const out = {} as EnumMappings;
  for (const key of ENUM_MAPPING_KEYS) {
    out[key] = assertStringRecord(obj[key] ?? {}, `MDOC ${key} map`);
  }
  return out;
}

function appendPath(baseUrl: string | null, pathname: string): string | null {
  if (!baseUrl) return null;
  try {
    return new URL(pathname, baseUrl).toString();
  } catch {
    return null;
  }
}

function areTrackingFieldsEqual(a: TrackingState, b: TrackingState): boolean {
  return (
    a.ga4MeasurementId === b.ga4MeasurementId &&
    a.googleAdsTagId === b.googleAdsTagId &&
    a.googleAdsConversionMode === b.googleAdsConversionMode &&
    a.googleAdsLeadConversionLabel === b.googleAdsLeadConversionLabel &&
    a.gtmContainerId === b.gtmContainerId &&
    a.metaPixelId === b.metaPixelId
  );
}

function areMdocFieldsEqual(a: MdocState, b: MdocState): boolean {
  return (
    a.status === b.status &&
    a.label === b.label &&
    a.endpoint === b.endpoint &&
    a.apiKey === b.apiKey &&
    a.dataFrom === b.dataFrom &&
    a.source === b.source &&
    a.fallbackSourceDetail === b.fallbackSourceDetail &&
    a.sourceDetailRulesJson === b.sourceDetailRulesJson &&
    a.staticDefaultsJson === b.staticDefaultsJson &&
    a.enumMappingsJson === b.enumMappingsJson
  );
}

// ── UI Primitives ──────────────────────────────────────────────────────────────

function LoadingSpinner() {
  return (
    <svg
      className="animate-spin h-3.5 w-3.5"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-label="Loading"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

const BADGE_STYLES: Record<string, string> = {
  success:
    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  warning:
    "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  danger:
    "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  neutral:
    "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20",
};

function StatusBadge({
  label,
  tone,
}: {
  label: string;
  tone: "success" | "warning" | "neutral" | "danger";
}) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-bold tracking-wider uppercase ${BADGE_STYLES[tone]}`}
    >
      {label}
    </span>
  );
}

interface FormInputProps {
  label: string;
  hint?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  type?: ComponentPropsWithoutRef<"input">["type"];
  badge?: React.ReactNode;
}

function FormInput({
  label,
  hint,
  placeholder,
  value,
  onChange,
  type = "text",
  badge,
}: FormInputProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-[var(--portal-foreground)]">
          {label}
        </label>
        {badge}
      </div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-lg border border-[var(--portal-border)] bg-[var(--portal-surface)] px-3 text-sm font-mono text-[var(--portal-foreground)] placeholder-[var(--portal-muted)]/50 outline-none transition-all focus:border-[var(--portal-foreground)] focus:ring-1 focus:ring-[var(--portal-foreground)] shadow-sm"
      />
      {hint && (
        <p className="text-xs text-[var(--portal-muted)] mt-0.5">{hint}</p>
      )}
    </div>
  );
}

// ── Tab Panels ─────────────────────────────────────────────────────────────────

function TrackingTab({
  values,
  savedValues,
  onFieldChange,
}: {
  values: TrackingState;
  savedValues: TrackingState;
  onFieldChange: <K extends keyof TrackingState>(
    key: K,
    value: TrackingState[K]
  ) => void;
}) {
  const badgeFor = (saved: string) =>
    saved ? (
      <StatusBadge label="Active" tone="success" />
    ) : (
      <StatusBadge label="Not Set" tone="neutral" />
    );

  return (
    <div className="space-y-6">
      {/* Google Ecosystem */}
      <div className="rounded-xl bg-[var(--portal-surface-soft)] p-6 space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--portal-surface)] border border-[var(--portal-border)] text-blue-600 dark:text-blue-400">
            <span className="material-symbols-outlined text-[18px]">
              analytics
            </span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--portal-foreground)]">
              Google Ecosystem
            </h3>
            <p className="text-xs text-[var(--portal-muted)]">
              Analytics, Tag Manager, and Ads routing
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <FormInput
            label="Google Analytics (GA4)"
            placeholder="G-XXXXXXXXXX"
            value={values.ga4MeasurementId}
            onChange={(v) => onFieldChange("ga4MeasurementId", v)}
            badge={badgeFor(savedValues.ga4MeasurementId)}
          />
          <FormInput
            label="Google Tag Manager"
            placeholder="GTM-XXXXXXX"
            value={values.gtmContainerId}
            onChange={(v) => onFieldChange("gtmContainerId", v)}
            badge={badgeFor(savedValues.gtmContainerId)}
          />
          <FormInput
            label="Google Ads Tag"
            placeholder="AW-12345678901"
            value={values.googleAdsTagId}
            onChange={(v) => onFieldChange("googleAdsTagId", v)}
            badge={badgeFor(savedValues.googleAdsTagId)}
          />

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-[var(--portal-foreground)] mb-1.5 block">
              Conversion Routing
            </label>
            <div className="flex p-1 rounded-lg border border-[var(--portal-border)] bg-[var(--portal-surface)]">
              {(["GA4_IMPORTED", "DIRECT_LABEL"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => onFieldChange("googleAdsConversionMode", mode)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    values.googleAdsConversionMode === mode
                      ? "bg-[var(--portal-foreground)] text-[var(--portal-surface)] shadow-sm"
                      : "text-[var(--portal-muted)] hover:text-[var(--portal-foreground)]"
                  }`}
                >
                  {mode === "GA4_IMPORTED" ? "GA4 Import" : "Direct Label"}
                </button>
              ))}
            </div>
            {values.googleAdsConversionMode === "DIRECT_LABEL" && (
              <input
                value={values.googleAdsLeadConversionLabel}
                onChange={(e) =>
                  onFieldChange("googleAdsLeadConversionLabel", e.target.value)
                }
                placeholder="e.g. topazLeadPrimary_01"
                className="h-10 w-full rounded-lg border border-[var(--portal-border)] bg-[var(--portal-surface)] px-3 mt-2 text-sm font-mono text-[var(--portal-foreground)] placeholder-[var(--portal-muted)]/50 outline-none focus:border-[var(--portal-foreground)] shadow-sm"
              />
            )}
          </div>
        </div>
      </div>

      {/* Meta Ecosystem */}
      <div className="rounded-xl bg-[var(--portal-surface-soft)] p-6 space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--portal-surface)] border border-[var(--portal-border)] text-indigo-600 dark:text-indigo-400">
            <span className="material-symbols-outlined text-[18px]">share</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--portal-foreground)]">
              Social Ecosystem
            </h3>
            <p className="text-xs text-[var(--portal-muted)]">
              Meta tracking pixels
            </p>
          </div>
        </div>
        <div className="max-w-md">
          <FormInput
            label="Meta Pixel ID"
            placeholder="123456789012345"
            value={values.metaPixelId}
            onChange={(v) => onFieldChange("metaPixelId", v)}
            badge={badgeFor(savedValues.metaPixelId)}
          />
        </div>
      </div>
    </div>
  );
}

function NotesTab({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Document special routing rules, ad campaign nuances, etc..."
      className="w-full min-h-[400px] bg-[var(--portal-surface-soft)] rounded-xl border border-[var(--portal-border)] p-5 text-sm leading-relaxed text-[var(--portal-foreground)] outline-none placeholder:text-[var(--portal-muted)]/50 focus:border-[var(--portal-foreground)] resize-none shadow-inner"
    />
  );
}

function ApiTab({
  mdocValues,
  savedMdocValues,
  thankYouUrl,
  latestDeliveryAttempt,
  canRunMdocTest,
  isPending,
  saveKey,
  mdocTestResult,
  showMdocAdvanced,
  onFieldChange,
  onToggleAdvanced,
  onRunTest,
  formatJsonField,
}: {
  mdocValues: MdocState;
  savedMdocValues: MdocState;
  thankYouUrl: string | null;
  latestDeliveryAttempt: {
    kind: string;
    status: string;
    attemptedAt: string;
  } | null;
  canRunMdocTest: boolean;
  isPending: boolean;
  saveKey: SaveKey;
  mdocTestResult: { responseCode: number | null; responseBody: string | null } | null;
  showMdocAdvanced: boolean;
  onFieldChange: <K extends keyof MdocState>(key: K, value: MdocState[K]) => void;
  onToggleAdvanced: () => void;
  onRunTest: () => void;
  formatJsonField: (field: keyof MdocState) => void;
}) {
  const deliveryTone =
    latestDeliveryAttempt?.status === "SYNCED"
      ? "success"
      : latestDeliveryAttempt?.status === "FAILED"
        ? "danger"
        : "warning";

  return (
    <div className="space-y-6">
      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoCard
          icon="route"
          label="Live Route"
          value={thankYouUrl ?? "Publish host to expose /thank-you"}
        />
        <div className="rounded-xl border border-[var(--portal-border)] bg-[var(--portal-surface-soft)] p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-[var(--portal-surface)] border border-[var(--portal-border)] flex items-center justify-center text-[var(--portal-muted)]">
            <span className="material-symbols-outlined text-[18px]">
              sync_alt
            </span>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--portal-muted)]">
              Delivery Log
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-sm font-medium text-[var(--portal-foreground)]">
                {latestDeliveryAttempt?.kind ?? "Awaiting leads"}
              </p>
              {latestDeliveryAttempt && (
                <StatusBadge
                  label={latestDeliveryAttempt.status}
                  tone={deliveryTone}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Connection Details */}
      <div className="rounded-xl border border-[var(--portal-border)] bg-[var(--portal-surface-soft)] p-6 space-y-8">
        <div className="flex justify-between items-center pb-4 border-b border-[var(--portal-border)]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-indigo-500">
              database
            </span>
            <h3 className="font-semibold text-[var(--portal-foreground)]">
              MDOC Connection Details
            </h3>
          </div>
          <div className="flex items-center gap-4">
            <StatusBadge
              label={savedMdocValues.status}
              tone={savedMdocValues.status === "ACTIVE" ? "success" : "neutral"}
            />
            <button
              onClick={onRunTest}
              disabled={!canRunMdocTest || isPending}
              className="h-8 inline-flex items-center justify-center px-4 rounded-md border border-[var(--portal-border)] bg-[var(--portal-surface)] text-[11px] font-bold uppercase tracking-wider text-[var(--portal-foreground)] hover:bg-[var(--portal-surface-soft)] transition-all shadow-sm disabled:opacity-50"
            >
              {isPending && saveKey === "mdocTest" ? (
                <LoadingSpinner />
              ) : (
                "Run Test"
              )}
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <FormInput
            label="Connection Name"
            placeholder="e.g. Topaz MDOC"
            value={mdocValues.label}
            onChange={(v) => onFieldChange("label", v)}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-[var(--portal-foreground)]">
              Status
            </label>
            <select
              value={mdocValues.status}
              onChange={(e) =>
                onFieldChange("status", e.currentTarget.value as MdocState["status"])
              }
              className="h-10 w-full rounded-lg border border-[var(--portal-border)] bg-[var(--portal-surface)] px-3 text-sm text-[var(--portal-foreground)] outline-none focus:border-[var(--portal-foreground)] shadow-sm"
            >
              <option value="ACTIVE">Active (Pushing Leads)</option>
              <option value="INACTIVE">Inactive (Paused)</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <FormInput
              label="Endpoint URL"
              placeholder="https://api.crm.com/v1/leads"
              value={mdocValues.endpoint}
              onChange={(v) => onFieldChange("endpoint", v)}
            />
          </div>
          <div className="md:col-span-2">
            <FormInput
              label="API Key"
              type="password"
              placeholder="Enter project API key"
              value={mdocValues.apiKey}
              onChange={(v) => onFieldChange("apiKey", v)}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 border-t border-[var(--portal-border)] pt-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-[var(--portal-foreground)]">
              Lead Bucket
            </label>
            <select
              value={mdocValues.dataFrom}
              onChange={(e) =>
                onFieldChange("dataFrom", e.currentTarget.value as MdocState["dataFrom"])
              }
              className="h-10 w-full rounded-lg border border-[var(--portal-border)] bg-[var(--portal-surface)] px-3 text-sm text-[var(--portal-foreground)] outline-none focus:border-[var(--portal-foreground)] shadow-sm"
            >
              <option value="E">Enquiry (E)</option>
              <option value="T">TeleCalling (T)</option>
            </select>
          </div>
          <FormInput
            label="Primary Source"
            placeholder="Digitals"
            value={mdocValues.source}
            onChange={(v) => onFieldChange("source", v)}
          />
          <FormInput
            label="Fallback Detail"
            placeholder="Website"
            value={mdocValues.fallbackSourceDetail}
            onChange={(v) => onFieldChange("fallbackSourceDetail", v)}
          />
        </div>

        {/* Advanced JSON Mapping */}
        <div className="border-t border-[var(--portal-border)] pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-semibold text-[var(--portal-foreground)]">
                Advanced JSON Mapping
              </h4>
              <p className="text-xs text-[var(--portal-muted)] mt-0.5">
                Auto-formats on blur.
              </p>
            </div>
            <button
              onClick={onToggleAdvanced}
              className="text-xs font-semibold text-[var(--portal-foreground)] bg-[var(--portal-surface)] px-3 py-1.5 rounded-md border border-[var(--portal-border)] hover:bg-[var(--portal-surface-soft)] shadow-sm"
            >
              {showMdocAdvanced ? "Hide Mapping" : "Reveal Mapping"}
            </button>
          </div>

          {showMdocAdvanced && (
            <div className="grid gap-4 md:grid-cols-3 animate-in slide-in-from-top-2">
              <JsonTextarea
                label="Source Rules"
                value={mdocValues.sourceDetailRulesJson}
                onChange={(v) => onFieldChange("sourceDetailRulesJson", v)}
                onBlur={() => formatJsonField("sourceDetailRulesJson")}
              />
              <JsonTextarea
                label="Static Defaults"
                value={mdocValues.staticDefaultsJson}
                onChange={(v) => onFieldChange("staticDefaultsJson", v)}
                onBlur={() => formatJsonField("staticDefaultsJson")}
              />
              <JsonTextarea
                label="Enum Mappings"
                value={mdocValues.enumMappingsJson}
                onChange={(v) => onFieldChange("enumMappingsJson", v)}
                onBlur={() => formatJsonField("enumMappingsJson")}
              />
            </div>
          )}
        </div>

        {mdocTestResult && (
          <div className="rounded-lg border border-[var(--portal-border)] bg-[var(--portal-surface)] p-4 animate-in fade-in">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-[16px] text-[var(--portal-muted)]">
                terminal
              </span>
              <p className="text-sm font-semibold text-[var(--portal-foreground)]">
                Test Response
              </p>
              <StatusBadge
                label={mdocTestResult.responseCode?.toString() ?? "Error"}
                tone={mdocTestResult.responseCode === 200 ? "success" : "danger"}
              />
            </div>
            <p className="font-mono text-xs text-[var(--portal-muted)] break-all p-2 rounded bg-[var(--portal-surface-soft)] border border-[var(--portal-border)] shadow-inner">
              {mdocTestResult.responseBody || "No response body returned."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Small helpers ──────────────────────────────────────────────────────────────

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--portal-border)] bg-[var(--portal-surface-soft)] p-4 flex items-center gap-4">
      <div className="h-10 w-10 rounded-full bg-[var(--portal-surface)] border border-[var(--portal-border)] flex items-center justify-center text-[var(--portal-muted)]">
        <span className="material-symbols-outlined text-[18px]">{icon}</span>
      </div>
      <div className="overflow-hidden">
        <p className="text-xs font-bold uppercase tracking-wider text-[var(--portal-muted)]">
          {label}
        </p>
        <p
          className="text-sm font-medium text-[var(--portal-foreground)] truncate mt-0.5"
          title={value}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function JsonTextarea({
  label,
  value,
  onChange,
  onBlur,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur: () => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-[var(--portal-foreground)]">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        rows={6}
        className="w-full rounded-lg border border-[var(--portal-border)] bg-[var(--portal-surface)] p-3 font-mono text-[11px] text-[var(--portal-foreground)] outline-none focus:border-[var(--portal-foreground)] shadow-inner"
        spellCheck={false}
      />
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function ProjectTrackingSettingsView({
  projectId,
  site,
  liveUrl,
  previewUrl,
  canManageIntegrations,
  syncTargets,
}: {
  projectId: string;
  site: ProjectSite | null;
  liveUrl: string | null;
  previewUrl: string | null;
  canManageIntegrations: boolean;
  syncTargets: ProjectSyncTarget[];
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("tracking");
  const [isPending, startTransition] = useTransition();

  // Tracking state
  const [savedValues, setSavedValues] = useState(() => toTrackingState(site));
  const [values, setValues] = useState(() => toTrackingState(site));

  // MDOC state
  const mdocTarget = useMemo(
    () => syncTargets.find((t) => t.kind === "MDOC_PUSH") ?? null,
    [syncTargets]
  );
  const [savedMdocValues, setSavedMdocValues] = useState(() =>
    toMdocState(mdocTarget)
  );
  const [mdocValues, setMdocValues] = useState(() => toMdocState(mdocTarget));

  // UI state
  const [saveKey, setSaveKey] = useState<SaveKey>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [mdocTestResult, setMdocTestResult] = useState<{
    responseCode: number | null;
    responseBody: string | null;
  } | null>(null);
  const [showMdocAdvanced, setShowMdocAdvanced] = useState(false);

  // ── Derived ────────────────────────────────────────────────────────────────

  const isTrackingDirty = !areTrackingFieldsEqual(values, savedValues);
  const isNotesDirty = values.trackingNotes !== savedValues.trackingNotes;
  const isMdocDirty = !areMdocFieldsEqual(mdocValues, savedMdocValues);

  const isCurrentTabDirty =
    (activeTab === "tracking" && isTrackingDirty) ||
    (activeTab === "api" && isMdocDirty) ||
    (activeTab === "notes" && isNotesDirty);

  const thankYouUrl = useMemo(
    () => appendPath(liveUrl ?? previewUrl, "/thank-you"),
    [liveUrl, previewUrl]
  );

  const latestDeliveryAttempt = useMemo(
    () =>
      syncTargets
        .map((t) => t.latestDeliveryAttempt)
        .filter(
          (a): a is NonNullable<ProjectSyncTarget["latestDeliveryAttempt"]> =>
            Boolean(a)
        )
        .sort(
          (a, b) => Date.parse(b.attemptedAt) - Date.parse(a.attemptedAt)
        )[0] ?? null,
    [syncTargets]
  );

  const effectiveMdocEndpoint =
    mdocValues.endpoint.trim() || savedMdocValues.endpoint.trim();
  const effectiveMdocApiKey =
    mdocValues.apiKey.trim() || savedMdocValues.apiKey.trim();
  const canRunMdocTest =
    Boolean(effectiveMdocEndpoint && effectiveMdocApiKey) && !isPending;

  // ── Callbacks ──────────────────────────────────────────────────────────────

  useEffect(() => {
    setConfirmDiscard(false);
  }, [activeTab]);

  const updateTrackingField = useCallback(
    <K extends keyof TrackingState>(key: K, value: TrackingState[K]) => {
      setValues((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const updateMdocField = useCallback(
    <K extends keyof MdocState>(key: K, value: MdocState[K]) => {
      setMdocValues((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const formatJsonField = useCallback(
    (field: keyof MdocState) => {
      try {
        const raw = mdocValues[field] as string;
        if (!raw.trim()) return;
        const parsed = JSON.parse(raw);
        setMdocValues((prev) => ({
          ...prev,
          [field]: JSON.stringify(parsed, null, 2),
        }));
      } catch {
        /* invalid JSON — leave as-is */
      }
    },
    [mdocValues]
  );

  const handleSaveCurrentTab = useCallback(() => {
    if (activeTab === "tracking") {
      runSaveTracking("tracking", "Tracking & Pixels saved.");
    } else if (activeTab === "notes") {
      runSaveTracking("notes", "Developer notes saved.");
    } else if (activeTab === "api") {
      runMdocSave();
    }
  }, [activeTab, values, mdocValues]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDiscardCurrentTab = useCallback(() => {
    if (!confirmDiscard) {
      setConfirmDiscard(true);
      return;
    }
    if (activeTab === "tracking") {
      setValues((prev) => ({
        ...savedValues,
        trackingNotes: prev.trackingNotes,
      }));
    } else if (activeTab === "notes") {
      setValues((prev) => ({
        ...prev,
        trackingNotes: savedValues.trackingNotes,
      }));
    } else if (activeTab === "api") {
      setMdocValues(savedMdocValues);
    }
    setConfirmDiscard(false);
  }, [activeTab, confirmDiscard, savedValues, savedMdocValues]);

  function runSaveTracking(
    key: "tracking" | "notes",
    successMessage: string
  ) {
    setStatus(null);
    setError(null);
    setSaveKey(key);
    startTransition(async () => {
      try {
        const response = await updateProjectTrackingSettingsForApp({
          projectId,
          ...values,
        });
        const next = toTrackingState(response.site);
        setSavedValues(next);
        setValues(next);
        setStatus(successMessage);
        router.refresh();
        setTimeout(() => setStatus(null), 3000);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Update failed.");
      } finally {
        setSaveKey(null);
      }
    });
  }

  function runMdocSave() {
    setStatus(null);
    setError(null);
    setSaveKey("mdoc");
    startTransition(async () => {
      try {
        const response = await upsertProjectMdocSyncTargetForApp({
          projectId,
          status: mdocValues.status,
          label: mdocValues.label,
          endpoint: mdocValues.endpoint,
          apiKey: mdocValues.apiKey,
          dataFrom: mdocValues.dataFrom,
          source: mdocValues.source,
          fallbackSourceDetail: mdocValues.fallbackSourceDetail,
          sourceDetailRules: parseStringMapJson(
            mdocValues.sourceDetailRulesJson,
            "MDOC rules"
          ),
          staticDefaults: parseStringMapJson(
            mdocValues.staticDefaultsJson,
            "MDOC defaults"
          ),
          enumMappings: parseEnumMappingsJson(mdocValues.enumMappingsJson),
        });
        const next = toMdocState(response.target);
        setSavedMdocValues(next);
        setMdocValues(next);
        setMdocTestResult(null);
        setStatus("CRM Integration saved successfully.");
        router.refresh();
        setTimeout(() => setStatus(null), 3000);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Update failed.");
      } finally {
        setSaveKey(null);
      }
    });
  }

  function runMdocTest() {
    setStatus(null);
    setError(null);
    setSaveKey("mdocTest");
    startTransition(async () => {
      try {
        const merged: MdocState = {
          ...savedMdocValues,
          ...mdocValues,
          endpoint: effectiveMdocEndpoint,
          apiKey: effectiveMdocApiKey,
        };
        const response = await testProjectMdocSyncTargetForApp({
          projectId,
          endpoint: merged.endpoint,
          apiKey: merged.apiKey,
          dataFrom: merged.dataFrom,
          source: merged.source,
          fallbackSourceDetail: merged.fallbackSourceDetail,
          sourceDetailRules: parseStringMapJson(
            merged.sourceDetailRulesJson,
            "rules"
          ),
          staticDefaults: parseStringMapJson(
            merged.staticDefaultsJson,
            "defaults"
          ),
          enumMappings: parseEnumMappingsJson(merged.enumMappingsJson),
        });
        setMdocTestResult({
          responseCode: response.result.responseCode,
          responseBody: response.result.responseBody,
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "MDOC test failed."
        );
      } finally {
        setSaveKey(null);
      }
    });
  }

  // ── Tabs config ────────────────────────────────────────────────────────────

  const tabs = useMemo(
    () =>
      [
        {
          id: "tracking" as const,
          label: "Tracking & Pixels",
          icon: "monitoring",
          hidden: false,
          dirty: isTrackingDirty,
        },
        {
          id: "api" as const,
          label: "CRM Integrations",
          icon: "api",
          hidden: !canManageIntegrations,
          dirty: isMdocDirty,
        },
        {
          id: "notes" as const,
          label: "Developer Notes",
          icon: "sticky_note_2",
          hidden: false,
          dirty: isNotesDirty,
        },
      ].filter((t) => !t.hidden),
    [isTrackingDirty, isMdocDirty, isNotesDirty, canManageIntegrations]
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  if (!site) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] text-center rounded-2xl border border-[var(--portal-border)] bg-[var(--portal-card)] shadow-sm">
        <span className="material-symbols-outlined text-[32px] text-[var(--portal-muted)] mb-3">
          construction
        </span>
        <h3 className="text-base font-semibold text-[var(--portal-foreground)]">
          Setup Required
        </h3>
        <p className="mt-1 text-sm text-[var(--portal-muted)] max-w-sm">
          Tracking configurations unlock after the project site is published.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Alert Banner */}
      {(status || error) && (
        <div
          className={`mb-6 flex items-center gap-3 p-4 rounded-xl border shadow-sm animate-in fade-in zoom-in-95 duration-200 ${
            error
              ? "bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-300"
              : "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300"
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">
            {error ? "error" : "check_circle"}
          </span>
          <p className="text-sm font-medium">{error ?? status}</p>
        </div>
      )}

      {/* Workspace Card */}
      <div className="rounded-xl border border-[var(--portal-border)] bg-[var(--portal-card)] shadow-sm flex flex-col overflow-hidden">
        {/* Header: Tabs + Save */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--portal-border)] bg-[var(--portal-surface-soft)]/50 px-6 pt-4 sm:pt-0 relative">
          <nav className="flex gap-6 overflow-x-auto scrollbar-hide sm:-mb-[1]">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 py-4 text-sm font-semibold transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "text-[var(--portal-foreground)] border-b-2 border-[var(--portal-foreground)]"
                    : "text-[var(--portal-muted)] hover:text-[var(--portal-foreground)] border-b-2 border-transparent"
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {tab.icon}
                </span>
                {tab.label}
                {tab.dirty && (
                  <span className="absolute top-3.5 right-[-8px] h-1.5 w-1.5 rounded-full bg-amber-500" />
                )}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3 pb-4 sm:pb-0 sm:py-3 min-h-[60px]">
            {isCurrentTabDirty ? (
              <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-300">
                <button
                  onClick={handleDiscardCurrentTab}
                  className={`text-[11px] font-bold uppercase tracking-widest transition-colors ${
                    confirmDiscard
                      ? "text-rose-500 hover:text-rose-600"
                      : "text-[var(--portal-muted)] hover:text-[var(--portal-foreground)]"
                  }`}
                >
                  {confirmDiscard ? "Click to confirm" : "Discard"}
                </button>
                <button
                  onClick={handleSaveCurrentTab}
                  disabled={isPending}
                  className="flex items-center gap-2 rounded-lg bg-[var(--portal-foreground)] px-5 py-2 text-[11px] font-bold uppercase tracking-widest text-[var(--portal-surface)] transition-all hover:opacity-90 shadow-sm disabled:opacity-50"
                >
                  {isPending ? (
                    <LoadingSpinner />
                  ) : (
                    `Save ${
                      activeTab === "api"
                        ? "CRM"
                        : activeTab === "notes"
                          ? "Notes"
                          : "Tracking"
                    }`
                  )}
                </button>
              </div>
            ) : (
              <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--portal-muted)] flex items-center gap-1.5 opacity-60">
                <span className="material-symbols-outlined text-[14px]">
                  check
                </span>
                Up to date
              </span>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="p-6 bg-[var(--portal-card)]">
          {activeTab === "tracking" && (
            <div className="animate-in fade-in duration-300">
              <TrackingTab
                values={values}
                savedValues={savedValues}
                onFieldChange={updateTrackingField}
              />
            </div>
          )}

          {activeTab === "api" && canManageIntegrations && (
            <div className="animate-in fade-in duration-300">
              <ApiTab
                mdocValues={mdocValues}
                savedMdocValues={savedMdocValues}
                thankYouUrl={thankYouUrl}
                latestDeliveryAttempt={latestDeliveryAttempt}
                canRunMdocTest={canRunMdocTest}
                isPending={isPending}
                saveKey={saveKey}
                mdocTestResult={mdocTestResult}
                showMdocAdvanced={showMdocAdvanced}
                onFieldChange={updateMdocField}
                onToggleAdvanced={() => setShowMdocAdvanced((v) => !v)}
                onRunTest={runMdocTest}
                formatJsonField={formatJsonField}
              />
            </div>
          )}

          {activeTab === "notes" && (
            <div className="animate-in fade-in duration-300">
              <NotesTab
                value={values.trackingNotes}
                onChange={(v) =>
                  setValues((prev) => ({ ...prev, trackingNotes: v }))
                }
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
