import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ClientPortalShell } from "@/components/client-portal/client-portal-shell";
import {
  fetchPortalSessionForApp,
  fetchProjectDetailForApp,
  fetchPublicTrackingRuntimeConfigForApp,
  type ProjectSite,
  type PublicTrackingRuntimeConfig,
} from "@/lib/landing-portal";
import {
  buildProjectAnalyticsConversionSurface,
  buildProjectAnalyticsIntegrationSurface,
} from "@/lib/project-analytics-presentation";
import { buildProjectBreadcrumbs, buildProjectNav } from "@/lib/portal-nav";
import { ROUTES, signInRedirect } from "@/lib/routes";
import { buildTrackingDebugUrl } from "@/lib/tracking-debug";

function serializeCookieHeader() {
  return cookies()
    .getAll()
    .map((entry) => `${entry.name}=${entry.value}`)
    .join("; ");
}

function readHost(input: string | null | undefined): string | null {
  const value = input?.trim();
  if (!value) {
    return null;
  }

  try {
    const url = value.includes("://") ? new URL(value) : new URL(`https://${value}`);
    return url.hostname || null;
  } catch {
    return value.replace(/^https?:\/\//i, "").replace(/\/.*$/, "") || null;
  }
}

function providerCount(site: ProjectSite | null) {
  return [
    site?.ga4MeasurementId,
    site?.googleAdsTagId,
    site?.gtmContainerId,
    site?.metaPixelId,
  ].filter(Boolean).length;
}

function runtimeTone(runtime: PublicTrackingRuntimeConfig | null): "success" | "warning" | "neutral" {
  if (!runtime) {
    return "neutral";
  }
  if (runtime.siteId) {
    return runtime.warnings.length ? "warning" : "success";
  }
  return "neutral";
}

function runtimeLabel(runtime: PublicTrackingRuntimeConfig | null) {
  if (!runtime) {
    return "NOT CHECKED";
  }
  if (!runtime.siteId) {
    return "NOT RESOLVING";
  }
  return runtime.warnings.length ? "NEEDS REVIEW" : "RESOLVED";
}

function integrationTone(isReady: boolean): "success" | "warning" {
  return isReady ? "success" : "warning";
}

// ----------------------------------------------------------------------
// Precision UI Components
// ----------------------------------------------------------------------

function TerminalStatusPill({ label, tone }: { label: string; tone: "success" | "warning" | "neutral" | "indigo" | "blue" | "danger" }) {
  const dotColors = {
    success: "bg-[#10B981]",
    warning: "bg-[#F59E0B]",
    danger: "bg-[#EF4444]",
    neutral: "bg-[#64748B]",
    indigo: "bg-[#6366F1]",
    blue: "bg-[#3B82F6]",
  };

  return (
    <div className="flex items-center gap-1.5 rounded-[4px] border border-[var(--portal-border)] bg-[var(--portal-surface)] px-2 py-1 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dotColors[tone]}`} />
      <span className="text-[9px] font-bold leading-none tracking-[0.15em] text-[var(--portal-foreground)] uppercase truncate">
        {label}
      </span>
    </div>
  );
}

function TerminalMetricTile({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  detail: React.ReactNode;
  icon: React.ReactNode;
}) {
  return (
    <div className="group flex flex-col justify-between rounded-[16px] border border-[var(--portal-border)] bg-[var(--portal-card)] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all hover:border-[var(--portal-accent-border)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
      <div className="flex items-start justify-between">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--portal-muted)]">
          {label}
        </p>
        <div className="rounded-lg bg-[var(--portal-surface-soft)] p-2 text-[var(--portal-muted)] transition-colors group-hover:text-[var(--portal-foreground)] group-hover:bg-[var(--portal-surface)]">
          {icon}
        </div>
      </div>
      <div className="mt-6 flex flex-col items-start">
        {typeof value === 'string' || typeof value === 'number' ? (
          <p className="font-mono text-3xl font-semibold tracking-tight text-[var(--portal-foreground)] tabular-nums truncate max-w-full">
            {value}
          </p>
        ) : (
          value
        )}
        <div className="mt-2 text-xs font-medium text-[var(--portal-muted)] truncate max-w-full">
          {detail}
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Main Page
// ----------------------------------------------------------------------

export default async function DashboardProjectAnalyticsPage({
  params,
}: {
  params: { projectId: string };
}) {
  const cookieHeader = serializeCookieHeader();
  const session = await fetchPortalSessionForApp(cookieHeader);

  if (!session) {
    redirect(signInRedirect(ROUTES.dashboard.projectAnalytics(params.projectId)));
  }

  const project = await fetchProjectDetailForApp({
    cookieHeader,
    projectId: params.projectId,
  });

  const site =
    (project.sourceSummary
      ? project.sites.find((entry) => entry.id === project.sourceSummary?.siteId)
      : null) ??
    project.sites[0] ??
    null;

  const liveHost = readHost(project.liveUrl || project.primaryDomain);
  const previewHost = readHost(project.previewUrl || site?.previewHost || site?.latestPreviewPath);

  const [liveRuntime, previewRuntime] = await Promise.all([
    liveHost
      ? fetchPublicTrackingRuntimeConfigForApp({ host: liveHost }).catch(() => null)
      : Promise.resolve(null),
    previewHost
      ? fetchPublicTrackingRuntimeConfigForApp({ host: previewHost }).catch(() => null)
      : Promise.resolve(null),
  ]);

  const configuredProviders = providerCount(site);
  const breadcrumbs = buildProjectBreadcrumbs(project.id, project.name, "Analytics");
  const conversionSurface = buildProjectAnalyticsConversionSurface(project);
  const integrationSurface = buildProjectAnalyticsIntegrationSurface({
    site,
    syncTargets: project.syncTargets,
  });
  const liveRuntimeMatchesSite = Boolean(liveRuntime?.siteId && liveRuntime.siteId === site?.id);
  const previewRuntimeMatchesSite = Boolean(previewRuntime?.siteId && previewRuntime.siteId === site?.id);
  const runtimeIsReady = liveRuntimeMatchesSite || previewRuntimeMatchesSite;
  const liveDebugUrl = buildTrackingDebugUrl(project.liveUrl || (liveHost ? `https://${liveHost}` : null));
  const previewDebugUrl = buildTrackingDebugUrl(
    project.previewUrl || (previewHost ? `https://${previewHost}` : null),
  );
  const runtimeWarnings = Array.from(
    new Set([...(liveRuntime?.warnings ?? []), ...(previewRuntime?.warnings ?? []), ...integrationSurface.notes]),
  );
  const resolvedRuntime = liveRuntime?.siteId ? liveRuntime : previewRuntime?.siteId ? previewRuntime : null;
  const eventTargetRows = [
    {
      label: "Data Layer",
      ready: Boolean(resolvedRuntime?.leadEventTargets.dataLayer),
      detail: "GTM-ready event bus",
    },
    {
      label: "GA4",
      ready: Boolean(resolvedRuntime?.leadEventTargets.ga4),
      detail: "generate_lead signal",
    },
    {
      label: "Google Ads",
      ready: Boolean(resolvedRuntime?.leadEventTargets.googleAds),
      detail: "Primary lead goal",
    },
    {
      label: "Meta Pixel",
      ready: Boolean(resolvedRuntime?.leadEventTargets.metaPixel),
      detail: "Lead event forwarding",
    },
  ];
  const destinationHealth = integrationSurface.destinations.reduce(
    (acc, destination) => {
      if (destination.statusLabel === "SYNCED") {
        acc.synced += 1;
      } else if (destination.statusLabel === "FAILED") {
        acc.failed += 1;
      } else if (destination.statusLabel === "INACTIVE") {
        acc.inactive += 1;
      } else {
        acc.pending += 1;
      }
      return acc;
    },
    { synced: 0, failed: 0, pending: 0, inactive: 0 },
  );

  return (
    <ClientPortalShell
      user={session.portalUser}
      breadcrumbs={breadcrumbs}
      sections={buildProjectNav(project.id, {
        activeItem: "analytics",
        liveHref: project.liveUrl,
        projectName: project.name,
      })}
      pageTitle="Analytics & Tracking"
      pageDescription="Configure pixel tracking, verify host resolution, and test conversion events."
      eyebrowLabel="Project Data"
      actions={
        <>
          <Link
            href={ROUTES.dashboard.projectSettings(project.id)}
            className="inline-flex h-9 items-center justify-center rounded-lg bg-[var(--portal-surface-soft)] px-4 text-[11px] font-bold uppercase tracking-widest text-[var(--portal-foreground)] ring-1 ring-inset ring-[var(--portal-border)] transition-all hover:bg-[var(--portal-surface)] hover:ring-[var(--portal-accent-border)]"
          >
            Edit Settings
          </Link>
          {project.liveUrl ? (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 items-center justify-center rounded-lg bg-[var(--portal-foreground)] px-4 text-[11px] font-bold uppercase tracking-widest text-[var(--portal-surface)] transition-all hover:opacity-90 shadow-md"
            >
              Visit Live Site ↗
            </a>
          ) : null}
        </>
      }
    >
      <div className="mx-auto w-full max-w-[1400px] space-y-6 pb-24 pt-6 animate-in fade-in duration-500">
        
        {/* Header Region */}
        <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between border-b border-[var(--portal-border)] pb-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <TerminalStatusPill 
                label={runtimeIsReady ? "TRACKING: VERIFIED" : "TRACKING: PENDING"} 
                tone={runtimeIsReady ? "success" : "warning"} 
              />
              <TerminalStatusPill 
                label={`${configuredProviders} PROVIDERS`} 
                tone={configuredProviders > 0 ? "indigo" : "neutral"} 
              />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-[var(--portal-foreground)] sm:text-4xl">
              Analytics Hub
            </h1>
            <p className="text-sm font-medium text-[var(--portal-muted)] max-w-2xl leading-relaxed">
              Verify that your Meta Pixel, Google Analytics, Google Ads, and Tag Manager are wired correctly to capture live conversion events.
            </p>
          </div>
        </header>

        {/* 1. KPI Matrix */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <TerminalMetricTile
            label="Total Conversions"
            value={project.leadCount}
            detail="Tracked leads so far"
            icon={<span className="material-symbols-outlined text-[18px]">query_stats</span>}
          />
          <TerminalMetricTile
            label="Pixels Configured"
            value={configuredProviders}
            detail="GA4, GTM, or Meta"
            icon={<span className="material-symbols-outlined text-[18px]">hub</span>}
          />
          <TerminalMetricTile
            label="Live Tracking"
            value={<TerminalStatusPill label={runtimeLabel(liveRuntime)} tone={runtimeTone(liveRuntime)} />}
            detail="Production environment"
            icon={<span className="material-symbols-outlined text-[18px]">public</span>}
          />
          <TerminalMetricTile
            label="Preview Tracking"
            value={<TerminalStatusPill label={runtimeLabel(previewRuntime)} tone={runtimeTone(previewRuntime)} />}
            detail="Staging environment"
            icon={<span className="material-symbols-outlined text-[18px]">visibility</span>}
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-[16px] border border-[var(--portal-border)] bg-[var(--portal-card)] p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--portal-muted)]">
                  Event Target Health
                </p>
                <p className="mt-1 text-[11px] font-medium text-[var(--portal-muted)]">
                  Runtime readiness for each lead-event destination.
                </p>
              </div>
              <TerminalStatusPill
                label={resolvedRuntime ? "LIVE MATRIX" : "NO RUNTIME"}
                tone={resolvedRuntime ? "indigo" : "neutral"}
              />
            </div>
            <div className="mt-4 space-y-3">
              {eventTargetRows.map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between rounded-xl border border-[var(--portal-border)] bg-[var(--portal-surface-soft)] px-4 py-3"
                >
                  <div>
                    <p className="text-[12px] font-semibold text-[var(--portal-foreground)]">{row.label}</p>
                    <p className="text-[11px] font-medium text-[var(--portal-muted)]">{row.detail}</p>
                  </div>
                  <TerminalStatusPill
                    label={row.ready ? "READY" : "MISSING"}
                    tone={integrationTone(row.ready)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[16px] border border-[var(--portal-border)] bg-[var(--portal-card)] p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--portal-muted)]">
                  Delivery Destination Health
                </p>
                <p className="mt-1 text-[11px] font-medium text-[var(--portal-muted)]">
                  Real-time status split across configured destinations.
                </p>
              </div>
              <TerminalStatusPill
                label={`${integrationSurface.destinations.length} TARGETS`}
                tone={integrationSurface.destinations.length ? "success" : "neutral"}
              />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-[var(--portal-border)] bg-[var(--portal-surface-soft)] p-4">
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--portal-muted)]">Synced</p>
                <p className="mt-2 font-mono text-2xl font-semibold text-[var(--portal-foreground)]">{destinationHealth.synced}</p>
              </div>
              <div className="rounded-xl border border-[var(--portal-border)] bg-[var(--portal-surface-soft)] p-4">
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--portal-muted)]">Failed</p>
                <p className="mt-2 font-mono text-2xl font-semibold text-[var(--portal-foreground)]">{destinationHealth.failed}</p>
              </div>
              <div className="rounded-xl border border-[var(--portal-border)] bg-[var(--portal-surface-soft)] p-4">
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--portal-muted)]">Pending</p>
                <p className="mt-2 font-mono text-2xl font-semibold text-[var(--portal-foreground)]">{destinationHealth.pending}</p>
              </div>
              <div className="rounded-xl border border-[var(--portal-border)] bg-[var(--portal-surface-soft)] p-4">
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--portal-muted)]">Inactive</p>
                <p className="mt-2 font-mono text-2xl font-semibold text-[var(--portal-foreground)]">{destinationHealth.inactive}</p>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Main Tracking Config Bento Grid */}
        <section className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
          
          {/* Panel A: Configured IDs */}
          <div className="flex flex-col h-full rounded-[16px] border border-[var(--portal-border)] bg-[var(--portal-card)] shadow-sm">
            <div className="flex items-center justify-between border-b border-[var(--portal-border)] bg-[var(--portal-surface-soft)] px-6 py-5 rounded-t-[16px]">
              <div>
                <h3 className="text-sm font-bold text-[var(--portal-foreground)] tracking-tight">Active Tracking IDs</h3>
                <p className="mt-1 text-[11px] font-medium text-[var(--portal-muted)]">Source of truth for your tags</p>
              </div>
              <span className="material-symbols-outlined text-[20px] text-[var(--portal-muted)] opacity-50">data_object</span>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Data Rows */}
              <div className="space-y-4">
                {integrationSurface.providerRows.map((item, idx) => (
                  <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between rounded-xl border border-[var(--portal-border)] bg-[var(--portal-surface-soft)] p-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-md bg-[var(--portal-surface)] border border-[var(--portal-border)] p-1.5 flex items-center justify-center text-[var(--portal-muted)]">
                        <span className="material-symbols-outlined text-[14px]">{item.icon}</span>
                      </div>
                      <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--portal-foreground)]">{item.label}</p>
                    </div>
                    <div className="mt-3 md:mt-0 ml-10 md:ml-0 font-mono text-xs font-semibold">
                      {item.value ? (
                        <span className="text-[var(--portal-foreground)] block max-w-[200px] truncate" title={item.value}>{item.value}</span>
                      ) : (
                        <span className="text-[var(--portal-muted)] opacity-70">NOT CONFIGURED</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-[var(--portal-border)] bg-[var(--portal-surface-soft)] p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--portal-muted)]">
                      Google Ads Lead Goal
                    </p>
                    <p className="mt-2 text-[13px] font-semibold text-[var(--portal-foreground)]">
                      {integrationSurface.googleAdsGoal.modeLabel}
                    </p>
                    <p className="mt-1 text-[11px] font-medium leading-relaxed text-[var(--portal-muted)]">
                      {integrationSurface.googleAdsGoal.detail}
                    </p>
                  </div>
                  <TerminalStatusPill
                    label={integrationSurface.googleAdsGoal.statusLabel}
                    tone={integrationSurface.googleAdsGoal.tone}
                  />
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="rounded-lg border border-[var(--portal-border)] bg-[var(--portal-surface)] p-4">
                    <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--portal-muted)]">Ads Tag</p>
                    <p className="mt-2 font-mono text-xs font-semibold text-[var(--portal-foreground)] break-all">
                      {site?.googleAdsTagId || "Not configured"}
                    </p>
                  </div>
                  <div className="rounded-lg border border-[var(--portal-border)] bg-[var(--portal-surface)] p-4">
                    <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--portal-muted)]">
                      Direct send_to
                    </p>
                    <p className="mt-2 font-mono text-xs font-semibold text-[var(--portal-foreground)] break-all">
                      {integrationSurface.googleAdsGoal.directSendTo || "Not used in GA4 import mode"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Implementation Notes */}
              {site?.trackingNotes && (
                 <div className="border-t border-[var(--portal-border)] pt-5">
                   <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[var(--portal-muted)] mb-3">Implementation Notes</p>
                   <div className="rounded-lg bg-[var(--portal-surface-soft)] p-4 text-xs leading-relaxed text-[var(--portal-foreground)] border border-[var(--portal-border)]">
                     {site.trackingNotes}
                   </div>
                 </div>
              )}
            </div>
          </div>

          {/* Panel B: Host Resolution Network */}
          <div className="flex flex-col h-full rounded-[16px] border border-[var(--portal-border)] bg-[var(--portal-card)] shadow-sm">
            <div className="flex items-center justify-between border-b border-[var(--portal-border)] bg-[var(--portal-surface-soft)] px-6 py-5 rounded-t-[16px]">
              <div>
                <h3 className="text-sm font-bold text-[var(--portal-foreground)] tracking-tight">Host Resolution</h3>
                <p className="mt-1 text-[11px] font-medium text-[var(--portal-muted)]">Where the traffic is originating</p>
              </div>
              <span className="material-symbols-outlined text-[20px] text-[var(--portal-muted)] opacity-50">router</span>
            </div>

            <div className="p-6 space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {/* Live Host Card */}
                 <div className="rounded-xl border border-[var(--portal-border)] bg-[var(--portal-surface-soft)] p-5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                      <span className="material-symbols-outlined text-6xl">cell_tower</span>
                    </div>
                    <div className="flex justify-between items-start mb-4">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--portal-muted)]">Live Environment</p>
                      <TerminalStatusPill label={runtimeLabel(liveRuntime)} tone={runtimeTone(liveRuntime)} />
                    </div>
                    <p className="font-mono text-sm font-semibold truncate text-[var(--portal-foreground)]">{liveHost || "No domain bound"}</p>
                    
                    {liveRuntime?.siteId && (
                      <div className="mt-4 border-t border-[var(--portal-border)] pt-3 text-[11px] font-medium text-[var(--portal-muted)] flex flex-col gap-1">
                        <span>Target: <strong className="text-[var(--portal-foreground)]">{liveRuntime.projectName}</strong></span>
                        <span>Route: <strong className="text-[var(--portal-foreground)]">/{liveRuntime.siteSlug}</strong></span>
                      </div>
                    )}
                 </div>

                 {/* Preview Host Card */}
                 <div className="rounded-xl border border-[var(--portal-border)] bg-[var(--portal-surface-soft)] p-5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                      <span className="material-symbols-outlined text-6xl">science</span>
                    </div>
                    <div className="flex justify-between items-start mb-4">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--portal-muted)]">Preview Environment</p>
                      <TerminalStatusPill label={runtimeLabel(previewRuntime)} tone={runtimeTone(previewRuntime)} />
                    </div>
                    <p className="font-mono text-sm font-semibold truncate text-[var(--portal-foreground)]">{previewHost || "No preview link"}</p>
                    
                    {previewRuntime?.siteId && (
                      <div className="mt-4 border-t border-[var(--portal-border)] pt-3 text-[11px] font-medium text-[var(--portal-muted)] flex flex-col gap-1">
                        <span>Target: <strong className="text-[var(--portal-foreground)]">{previewRuntime.projectName}</strong></span>
                        <span>Route: <strong className="text-[var(--portal-foreground)]">/{previewRuntime.siteSlug}</strong></span>
                      </div>
                    )}
                 </div>
               </div>

               {/* System Warnings */}
               {runtimeWarnings.length ? (
                  <div className="rounded-[12px] border border-amber-500/30 bg-amber-500/5 p-4 flex gap-3 items-start">
                    <span className="material-symbols-outlined text-amber-600 text-[18px] mt-0.5">warning</span>
                    <div className="text-[11px] font-semibold text-amber-700/90 dark:text-amber-500/80 leading-relaxed max-w-2xl">
                      {runtimeWarnings.join(" ")}
                    </div>
                  </div>
               ) : null}
            </div>
          </div>
        </section>

        {/* 3. Deep-Dive Diagnostics (Full Width) */}
        <section className="flex flex-col rounded-[16px] border border-[var(--portal-border)] bg-[var(--portal-card)] shadow-sm overflow-hidden">
          <div className="border-b border-[var(--portal-border)] bg-[var(--portal-surface-soft)] px-6 py-5">
            <h3 className="text-sm font-bold text-[var(--portal-foreground)] tracking-tight">Setup Verification</h3>
            <p className="mt-1 text-[11px] font-medium text-[var(--portal-muted)]">A step-by-step diagnostic of your conversion tracking deployment.</p>
          </div>
          
          <div className="p-0">
             {/* The Pipeline */}
             <div className="flex flex-col divide-y divide-[var(--portal-border)]">
               
               {/* Step 1 */}
               <div className="grid md:grid-cols-12 items-center p-6 gap-6 hover:bg-[var(--portal-surface-soft)] transition-colors">
                 <div className="md:col-span-3 lg:col-span-2 flex items-center gap-3 text-[var(--portal-muted)]">
                   <span className="material-symbols-outlined">save</span>
                   <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--portal-foreground)]">1. Credentials</span>
                 </div>
                 <div className="md:col-span-7 lg:col-span-8 flex flex-col gap-1 text-[13px]">
                   <p className="font-semibold text-[var(--portal-foreground)]">IDs are stored in the project</p>
                   <p className="text-[var(--portal-muted)]">{configuredProviders ? `Saved on ${site?.slug || "this site"} and ready for injection.` : "No provider ID is saved yet, so there is nothing to track."}</p>
                 </div>
                 <div className="md:col-span-2 flex justify-end">
                   <TerminalStatusPill tone={configuredProviders ? "success" : "warning"} label={configuredProviders ? "VERIFIED" : "MISSING"} />
                 </div>
               </div>

               {/* Step 2 */}
               <div className="grid md:grid-cols-12 items-center p-6 gap-6 hover:bg-[var(--portal-surface-soft)] transition-colors">
                 <div className="md:col-span-3 lg:col-span-2 flex items-center gap-3 text-[var(--portal-muted)]">
                   <span className="material-symbols-outlined">dns</span>
                   <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--portal-foreground)]">2. Network</span>
                 </div>
                 <div className="md:col-span-7 lg:col-span-8 flex flex-col gap-1 text-[13px]">
                   <p className="font-semibold text-[var(--portal-foreground)]">Runtime resolves correctly</p>
                   <p className="text-[var(--portal-muted)]">{runtimeIsReady ? "The public endpoint is resolving this project site by host, routing traffic correctly." : "The host is not resolving to this project site yet. Tracking cannot start."}</p>
                 </div>
                 <div className="md:col-span-2 flex justify-end">
                   <TerminalStatusPill tone={runtimeIsReady ? "success" : "danger"} label={runtimeIsReady ? "VERIFIED" : "BLOCKED"} />
                 </div>
               </div>

               {/* Step 3 */}
               <div className="grid md:grid-cols-12 items-center p-6 gap-6 hover:bg-[var(--portal-surface-soft)] transition-colors">
                 <div className="md:col-span-3 lg:col-span-2 flex items-center gap-3 text-[var(--portal-muted)]">
                   <span className="material-symbols-outlined">checklist</span>
                   <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--portal-foreground)]">3. Injection</span>
                 </div>
                 <div className="md:col-span-7 lg:col-span-8 flex flex-col gap-1 text-[13px]">
                   <p className="font-semibold text-[var(--portal-foreground)]">Provider injection ready</p>
                   <p className="text-[var(--portal-muted)]">{(runtimeIsReady && (liveRuntime?.injectGa4 || liveRuntime?.injectGoogleAds || liveRuntime?.injectGtm || liveRuntime?.injectMetaPixel || previewRuntime?.injectGa4 || previewRuntime?.injectGoogleAds || previewRuntime?.injectGtm || previewRuntime?.injectMetaPixel)) ? "The site includes flags to load GA4, Google Ads, GTM, and Meta snippets." : "Provider injection is waiting for IDs to be added or host resolution."}</p>
                 </div>
                 <div className="md:col-span-2 flex justify-end">
                   <TerminalStatusPill tone={runtimeIsReady && configuredProviders ? "success" : "warning"} label={runtimeIsReady && configuredProviders ? "READY" : "PENDING"} />
                 </div>
               </div>

               {/* Step 4 */}
               <div className="grid md:grid-cols-12 items-center p-6 gap-6 hover:bg-[var(--portal-surface-soft)] transition-colors">
                 <div className="md:col-span-3 lg:col-span-2 flex items-center gap-3 text-[var(--portal-muted)]">
                   <span className="material-symbols-outlined">rule</span>
                   <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--portal-foreground)]">4. Client Tests</span>
                 </div>
                 <div className="md:col-span-7 lg:col-span-8 flex flex-col gap-1 text-[13px]">
                   <p className="font-semibold text-[var(--portal-foreground)]">Thank-you conversion route</p>
                   <p className="text-[var(--portal-muted)]">The landing runtime should redirect to /thank-you, then emit page-view and lead events exactly once from there.</p>
                 </div>
                 <div className="md:col-span-2 flex justify-end">
                   <TerminalStatusPill tone={runtimeIsReady && configuredProviders ? "indigo" : "neutral"} label={runtimeIsReady && configuredProviders ? "TEST NOW" : "SETUP REQ"} />
                 </div>
               </div>

               {/* Step 5 */}
               <div className="grid md:grid-cols-12 items-center p-6 gap-6 hover:bg-[var(--portal-surface-soft)] transition-colors">
                 <div className="md:col-span-3 lg:col-span-2 flex items-center gap-3 text-[var(--portal-muted)]">
                   <span className="material-symbols-outlined">move_to_inbox</span>
                   <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--portal-foreground)]">5. Delivery</span>
                 </div>
                 <div className="md:col-span-7 lg:col-span-8 flex flex-col gap-1 text-[13px]">
                   <p className="font-semibold text-[var(--portal-foreground)]">Downstream lead delivery</p>
                   <p className="text-[var(--portal-muted)]">
                     {integrationSurface.destinations.length
                       ? "Naya stores the lead first, then fans out to Google Sheets or CRM destinations like MDOC."
                       : "No downstream destination is active yet, so only Naya stores the lead today."}
                   </p>
                 </div>
                 <div className="md:col-span-2 flex justify-end">
                   <TerminalStatusPill
                     tone={integrationSurface.destinations.length ? "success" : "neutral"}
                     label={integrationSurface.destinations.length ? "WIRED" : "NAYA ONLY"}
                   />
                 </div>
               </div>

               {/* Step 6 */}
               <div className="grid md:grid-cols-12 items-center p-6 gap-6 hover:bg-[var(--portal-surface-soft)] transition-colors">
                 <div className="md:col-span-3 lg:col-span-2 flex items-center gap-3 text-[var(--portal-muted)]">
                   <span className="material-symbols-outlined">verified</span>
                   <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--portal-foreground)]">6. Final Auth</span>
                 </div>
                 <div className="md:col-span-7 lg:col-span-8 flex flex-col gap-1 text-[13px]">
                   <p className="font-semibold text-[var(--portal-foreground)]">Vendor-side confirmation</p>
                   <p className="text-[var(--portal-muted)]">Final proof happens in GA4 Realtime, GTM Preview, and Meta Test Events dashboards.</p>
                 </div>
                 <div className="md:col-span-2 flex justify-end">
                   <TerminalStatusPill tone="neutral" label="EXTERNAL" />
                 </div>
               </div>

             </div>
          </div>
        </section>

        {/* 4. Tracking Routes & Debug Terminal */}
        <section className="grid gap-6 xl:grid-cols-2">
           
           {/* Conversion Route Matrix */}
           <div className="flex flex-col h-full rounded-[16px] border border-[var(--portal-border)] bg-[var(--portal-card)] shadow-sm">
             <div className="border-b border-[var(--portal-border)] bg-[var(--portal-surface-soft)] px-6 py-5 rounded-t-[16px]">
               <h3 className="text-sm font-bold text-[var(--portal-foreground)] tracking-tight">Conversion Endpoints</h3>
               <p className="mt-1 text-[11px] font-medium text-[var(--portal-muted)]">Post-form submission redirection anchors</p>
             </div>
             
             <div className="flex-1 p-6 flex flex-col gap-5">
               <div className="rounded-xl border border-dashed border-[var(--portal-accent-border)] bg-[var(--portal-badge-bg)] p-5 text-center">
                 <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--portal-badge-text)] opacity-80">Campaign Goal URL</p>
                 <p className="mt-2 font-mono text-sm font-semibold text-[var(--portal-badge-text)] breakdown-all">
                   {conversionSurface.recommendedTrackingRoute || "Publish a site to expose /thank-you"}
                 </p>
               </div>

               <div className="space-y-4 pt-2">
                 <div className="flex flex-col gap-2 rounded-xl bg-[var(--portal-surface-soft)] p-4 border border-[var(--portal-border)]">
                   <div className="flex items-center justify-between">
                     <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--portal-muted)]">Live Target</p>
                     {conversionSurface.liveThankYouUrl && (
                        <a href={conversionSurface.liveThankYouUrl} target="_blank" rel="noreferrer" className="text-[10px] font-bold uppercase text-[var(--portal-foreground)] hover:underline">Test URL ↗</a>
                     )}
                   </div>
                   <p className="font-mono text-xs text-[var(--portal-foreground)] truncate opacity-80">{conversionSurface.liveThankYouUrl || "Not available structurally"}</p>
                 </div>

                 <div className="flex flex-col gap-2 rounded-xl bg-[var(--portal-surface-soft)] p-4 border border-[var(--portal-border)]">
                   <div className="flex items-center justify-between">
                     <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--portal-muted)]">Preview Target</p>
                     {conversionSurface.previewThankYouUrl && (
                        <a href={conversionSurface.previewThankYouUrl} target="_blank" rel="noreferrer" className="text-[10px] font-bold uppercase text-[var(--portal-foreground)] hover:underline">Test URL ↗</a>
                     )}
                   </div>
                   <p className="font-mono text-xs text-[var(--portal-foreground)] truncate opacity-80">{conversionSurface.previewThankYouUrl || "Not available structurally"}</p>
                 </div>
               </div>

               <div className="border-t border-[var(--portal-border)] pt-5">
                 <div className="flex items-center justify-between gap-3">
                   <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--portal-muted)]">
                     Delivery Destinations
                   </p>
                   <TerminalStatusPill
                     label={integrationSurface.destinations.length ? `${integrationSurface.destinations.length} ACTIVE` : "NONE"}
                     tone={integrationSurface.destinations.length ? "success" : "neutral"}
                   />
                 </div>
                 <div className="mt-3 space-y-3">
                   {integrationSurface.destinations.length ? (
                     integrationSurface.destinations.map((destination) => (
                       <div
                         key={destination.id}
                         className="rounded-xl border border-[var(--portal-border)] bg-[var(--portal-surface-soft)] p-4"
                       >
                         <div className="flex items-start justify-between gap-3">
                           <div>
                             <p className="text-[12px] font-semibold text-[var(--portal-foreground)]">
                               {destination.label}
                             </p>
                             <p className="mt-1 text-[11px] font-medium text-[var(--portal-muted)]">
                               {destination.detail}
                             </p>
                           </div>
                           <TerminalStatusPill label={destination.statusLabel} tone={destination.tone} />
                         </div>
                       </div>
                     ))
                   ) : (
                     <div className="rounded-xl border border-dashed border-[var(--portal-border)] bg-[var(--portal-surface-soft)] p-4 text-[11px] font-medium text-[var(--portal-muted)]">
                       Add a Google Sheets archive or CRM push target in project settings to get downstream delivery proof here.
                     </div>
                   )}
                 </div>
               </div>
             </div>
           </div>

           {/* Live Debug Command */}
           <div className="flex flex-col h-full rounded-[16px] border border-blue-500/20 bg-[var(--portal-card)] shadow-[0_4px_24px_rgba(59,130,246,0.05)]">
             <div className="border-b border-blue-500/10 bg-blue-500/5 px-6 py-5 rounded-t-[16px]">
               <h3 className="text-sm font-bold text-blue-600 dark:text-blue-400 tracking-tight flex items-center gap-2">
                 <span className="material-symbols-outlined text-[18px]">bug_report</span> Client Debug Interface
               </h3>
               <p className="mt-1 text-[11px] font-medium text-[var(--portal-muted)]">Launch surface in diagnostics mode</p>
             </div>
             
             <div className="flex-1 p-6 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-[16px] text-[var(--portal-muted)] mt-0.5">check_circle</span>
                    <p className="text-xs text-[var(--portal-muted)]">Verify exact IDs transmitted to the browser.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-[16px] text-[var(--portal-muted)] mt-0.5">network_wifi</span>
                    <p className="text-xs text-[var(--portal-muted)]">Observe page loads and event packets dynamically.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-[16px] text-[var(--portal-muted)] mt-0.5">terminal</span>
                    <p className="text-xs text-[var(--portal-muted)]">An active HUD will be rendered directly on the site, including the thank-you conversion handoff.</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-col xl:flex-row gap-3">
                  {liveDebugUrl ? (
                    <a
                      href={liveDebugUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-blue-700 shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[16px]">rocket_launch</span> Init Live Debug
                    </a>
                  ) : null}
                  {previewDebugUrl ? (
                    <a
                      href={previewDebugUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-xs font-bold uppercase tracking-widest text-blue-700 dark:text-blue-400 transition hover:bg-blue-500/20"
                    >
                      <span className="material-symbols-outlined text-[16px]">science</span> Init Preview Debug
                    </a>
                  ) : null}
                </div>
             </div>
           </div>

        </section>

      </div>
    </ClientPortalShell>
  );
}
