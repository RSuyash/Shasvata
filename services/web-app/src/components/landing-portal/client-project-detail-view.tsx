import Link from "next/link";
import { ClientPortalShell } from "@/components/client-portal/client-portal-shell";
import {
  formatPortalDate,
  type PortalUserSummary,
  type ProjectDetail,
  type ProjectLead,
} from "@/lib/landing-portal";
import {
  buildLeadNeedLabel,
  buildLeadSourceLabel,
} from "@/lib/client-lead-presentation";
import { buildProjectBreadcrumbs, buildProjectNav } from "@/lib/portal-nav";
import { ROUTES } from "@/lib/routes";

// ----------------------------------------------------------------------
// Precision UI Components (High Signal-to-Noise Ratio)
// ----------------------------------------------------------------------

function TerminalStatusPill({ label, tone }: { label: string; tone: "success" | "warning" | "neutral" | "indigo" | "blue" }) {
  const dotColors = {
    success: "bg-[#10B981]",
    warning: "bg-[#F59E0B]",
    neutral: "bg-[#64748B]",
    indigo: "bg-[#6366F1]",
    blue: "bg-[#3B82F6]",
  };

  return (
    <div className="flex items-center gap-1.5 rounded-[4px] border border-[var(--portal-border)] bg-[var(--portal-surface)] px-2 py-1 shadow-sm">
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
  detail: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="group flex flex-col justify-between rounded-[16px] border border-[var(--portal-border)] bg-[var(--portal-card)] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all hover:border-[var(--portal-accent-border)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
      <div className="flex items-start justify-between">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--portal-muted)]">
          {label}
        </p>
        <div className={`rounded-lg bg-[var(--portal-surface-soft)] p-2 text-[var(--portal-muted)] transition-colors group-hover:text-[var(--portal-foreground)] group-hover:bg-[var(--portal-surface)]`}>
          {icon}
        </div>
      </div>
      <div className="mt-6">
        <p className="font-mono text-3xl font-semibold tracking-tight text-[var(--portal-foreground)] tabular-nums truncate">
          {value}
        </p>
        <p className="mt-2 text-xs font-medium text-[var(--portal-muted)] truncate">
          {detail}
        </p>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Main Server Component
// ----------------------------------------------------------------------

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en-IN", {
    notation: value >= 1000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value);
}

export function ClientProjectDetailView({
  user,
  project,
  leads,
}: {
  user: PortalUserSummary;
  project: ProjectDetail;
  leads: ProjectLead[];
}) {
  const latestLead = leads[0] ?? null;
  const navSections = buildProjectNav(project.id, {
    activeItem: "overview",
    liveHref: project.liveUrl,
    projectName: project.name,
  });
  const breadcrumbs = buildProjectBreadcrumbs(project.id, project.name, "Overview");

  // Determine site status details
  const isSetup = project.status !== "ACTIVE" && !project.liveUrl;
  const metricsDetailGoLive = isSetup ? "Pending Activation" : "Deployment Timestamp";

  return (
    <ClientPortalShell
      user={user}
      sections={navSections}
      breadcrumbs={breadcrumbs}
      pageTitle={`${project.name} Overview`}
      pageDescription="Project status, lead generation metrics, and live website details."
      eyebrowLabel="Project"
      actions={
        <>
          <Link
            href={ROUTES.dashboard.projectLeads(project.id)}
            className="inline-flex h-9 items-center justify-center rounded-lg bg-[var(--portal-surface-soft)] px-4 text-[11px] font-bold uppercase tracking-widest text-[var(--portal-foreground)] ring-1 ring-inset ring-[var(--portal-border)] transition-all hover:bg-[var(--portal-surface)] hover:ring-[var(--portal-accent-border)]"
          >
            View Leads
          </Link>
          {project.liveUrl ? (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 items-center justify-center rounded-lg bg-[var(--portal-foreground)] px-4 text-[11px] font-bold uppercase tracking-widest text-[var(--portal-surface)] transition-all hover:opacity-90 shadow-md"
            >
              Visit Website ↗
            </a>
          ) : null}
        </>
      }
    >
      <div className="mx-auto w-full max-w-[1400px] space-y-6 pb-24 pt-6 animate-in fade-in duration-500">
        
        {/* 1. Header Area - Structural Identity */}
        <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between border-b border-[var(--portal-border)] pb-6">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <TerminalStatusPill 
                label={project.liveUrl ? "STATUS: LIVE" : "STATUS: PENDING"} 
                tone={project.liveUrl ? "success" : "neutral"} 
              />
              <TerminalStatusPill 
                label={project.status === "ACTIVE" ? "PROJECT: ACTIVE" : "PROJECT: HOLD"} 
                tone={project.status === "ACTIVE" ? "indigo" : "warning"} 
              />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--portal-foreground)] sm:text-3xl mt-2">
              {project.name}
            </h1>
            <p className="text-sm font-medium text-[var(--portal-muted)] max-w-2xl leading-relaxed">
              Global overview of your project, generated leads, and live website metrics.
            </p>
          </div>
        </header>

        {/* 2. Top Level KPI Matrix */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <TerminalMetricTile
            label="Total Leads"
            value={formatCompactNumber(leads.length)}
            detail="Valid inquiries received"
            icon={<span className="material-symbols-outlined text-[18px]">person</span>}
          />
          <TerminalMetricTile
            label="Live Website"
            value={project.liveUrl ? "ONLINE" : "PENDING"}
            detail={project.liveUrl ? project.liveUrl.replace(/^https?:\/\//, "") : "Not published yet"}
            icon={<span className="material-symbols-outlined text-[18px]">dns</span>}
          />
          <TerminalMetricTile
            label="Launch Date"
            value={project.goLiveAt ? formatPortalDate(project.goLiveAt).split(',')[0] : "TBD"}
            detail={metricsDetailGoLive}
            icon={<span className="material-symbols-outlined text-[18px]">rocket_launch</span>}
          />
          <TerminalMetricTile
            label="Current Phase"
            value={project.status === "ACTIVE" ? "ACTIVE" : "CONFIG"}
            detail={`Project is currently ${project.status.toLowerCase()}`}
            icon={<span className="material-symbols-outlined text-[18px]">memory</span>}
          />
        </section>

        {/* 3. Deep Dive Bento Section */}
        <section className="grid gap-6 xl:grid-cols-2">
          
          {/* Panel A: Surface Details */}
          <div className="flex flex-col h-full rounded-[16px] border border-[var(--portal-border)] bg-[var(--portal-card)] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <div className="border-b border-[var(--portal-border)] bg-[var(--portal-surface-soft)] px-6 py-5 rounded-t-[16px]">
              <h3 className="text-sm font-bold text-[var(--portal-foreground)] tracking-tight">Website Details</h3>
              <p className="mt-1 text-[11px] font-medium text-[var(--portal-muted)]">Live links and project notes</p>
            </div>
            <div className="flex-1 p-6 space-y-6 flex flex-col justify-between">
              
              <div className="space-y-4">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--portal-muted)]">Live Website Link</p>
                  <div className="mt-2 flex items-center justify-between rounded-lg border border-[var(--portal-accent-border)] bg-[var(--portal-surface-soft)] px-4 py-3">
                    <p className="font-mono text-xs text-[var(--portal-foreground)] truncate max-w-[80%]">
                      {project.liveUrl || "Waiting for website to go live..."}
                    </p>
                    <TerminalStatusPill label={project.liveUrl ? "ONLINE" : "PENDING"} tone={project.liveUrl ? "success" : "neutral"} />
                  </div>
                </div>

                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--portal-muted)]">Project Notes</p>
                  <div className="mt-2 rounded-lg bg-[var(--portal-surface)] p-4 text-xs leading-relaxed text-[var(--portal-muted)] border border-[var(--portal-border)] min-h-[100px]">
                    {project.notes ? project.notes : <span className="opacity-50 italic">No notes provided for this project.</span>}
                  </div>
                </div>
              </div>

              <div className="border-t border-[var(--portal-border)] pt-4 flex items-center justify-between">
                <p className="text-[10px] uppercase font-bold text-[var(--portal-muted)]">Lead Management</p>
                <Link
                  href={ROUTES.dashboard.projectLeads(project.id)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[var(--portal-foreground)] px-4 py-2 text-[10px] font-bold tracking-widest text-[var(--portal-surface)] uppercase transition-all hover:scale-105"
                >
                  View All Leads
                  <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                </Link>
              </div>

            </div>
          </div>

          {/* Panel B: Latest Data Ping (Leads) */}
          <div className="flex flex-col h-full rounded-[16px] border border-[var(--portal-border)] bg-[var(--portal-card)] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <div className="border-b border-[var(--portal-border)] bg-[var(--portal-surface-soft)] px-6 py-5 rounded-t-[16px]">
              <h3 className="text-sm font-bold text-[var(--portal-foreground)] tracking-tight">Latest Inquiry</h3>
              <p className="mt-1 text-[11px] font-medium text-[var(--portal-muted)]">
                {latestLead ? `Received on ${formatPortalDate(latestLead.createdAt)}` : "Waiting to receive the first lead"}
              </p>
            </div>
            
            <div className="flex flex-1 flex-col p-6">
              {latestLead ? (
                <div className="space-y-6">
                  {/* Who */}
                  <div>
                    <h4 className="text-[9px] font-bold uppercase tracking-widest text-[var(--portal-muted)]">Contact Info</h4>
                    <div className="mt-2 flex flex-col md:flex-row md:items-center justify-between rounded-xl bg-[var(--portal-surface-soft)] p-4 border border-[var(--portal-border)]">
                      <div>
                        <p className="text-sm font-bold text-[var(--portal-foreground)]">{latestLead.fullName}</p>
                        <p className="mt-0.5 text-xs text-[var(--portal-muted)]">{latestLead.companyName || "No company provided"}</p>
                      </div>
                      <div className="mt-3 flex flex-col items-start md:items-end md:mt-0 font-mono text-[10px] text-[var(--portal-muted)]">
                        <span>{latestLead.email}</span>
                        <span>{latestLead.phone || "No phone provided"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Classification */}
                  <div>
                    <h4 className="text-[9px] font-bold uppercase tracking-widest text-[var(--portal-muted)]">Lead Details</h4>
                    <div className="mt-2 grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-3 rounded-lg border border-[var(--portal-border)] bg-[var(--portal-surface)] p-3">
                        <TerminalStatusPill label="Need" tone="blue" />
                        <span className="text-xs font-semibold text-[var(--portal-foreground)] truncate">{buildLeadNeedLabel(latestLead)}</span>
                      </div>
                      <div className="flex items-center gap-3 rounded-lg border border-[var(--portal-border)] bg-[var(--portal-surface)] p-3">
                        <TerminalStatusPill label="Source" tone="indigo" />
                        <span className="text-xs font-semibold text-[var(--portal-foreground)] truncate">{buildLeadSourceLabel(latestLead)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Body Payload */}
                  {(latestLead.problemSummary || latestLead.message) && (
                    <div>
                      <h4 className="text-[9px] font-bold uppercase tracking-widest text-[var(--portal-muted)]">Message</h4>
                      <div className="mt-2 rounded-xl border border-[var(--portal-border)] bg-[var(--portal-surface-soft)] p-4">
                        <p className="text-xs leading-relaxed text-[var(--portal-muted)] font-mono">
                          {">"} {latestLead.problemSummary || latestLead.message}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center text-center">
                  <div className="rounded-2xl border border-dashed border-[var(--portal-border)] bg-[var(--portal-surface-soft)] px-8 py-12 w-full">
                    <svg className="mb-4 h-10 w-10 mx-auto opacity-20 text-[var(--portal-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                    </svg>
                    <p className="text-sm font-bold text-[var(--portal-foreground)]">No Leads Yet</p>
                    <p className="mt-1 text-xs text-[var(--portal-muted)]">Waiting to receive the first inquiry.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

      </div>
    </ClientPortalShell>
  );
}
