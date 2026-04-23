"use client";

import Link from "next/link";
import { ClientPortalShell } from "@/components/client-portal/client-portal-shell";
import {
  formatPortalDate,
  type AccessibleProject,
  type PortalUserSummary,
  type ProjectDetail,
} from "@/lib/landing-portal";
import { buildPortfolioNav } from "@/lib/portal-nav";
import { ROUTES } from "@/lib/routes";
import { useEffect, useState } from "react";
import { SignOutButton } from "./sign-out-button";

// --- Utility Functions ---
function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en-IN", {
    notation: value >= 1000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value);
}

function getTimeOfDayGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

// ----------------------------------------------------------------------
// Elite UI Components (Strict Geometry & High Signal-to-Noise Ratio)
// ----------------------------------------------------------------------

/**
 * Ultra-minimalist status indicator.
 * Uses strict structural borders and semantic dots.
 */
function TerminalStatusPill({ label, tone }: { label: string; tone: "success" | "warning" | "neutral" }) {
  const dotColors = {
    success: "bg-[#10B981]", 
    warning: "bg-[#F59E0B]",
    neutral: "bg-[#64748B]",
  };

  return (
    <div className="flex items-center gap-1.5 rounded-[4px] border border-[var(--portal-border)] bg-[var(--portal-surface)] px-2 py-1 shadow-sm">
      <span className={`h-1.5 w-1.5 rounded-full ${dotColors[tone]}`} />
      <span className="text-[9px] font-bold leading-none tracking-[0.15em] text-[var(--portal-foreground)] uppercase">
        {label}
      </span>
    </div>
  );
}

/**
 * Metric Tile built on exact flexbox alignment.
 * Eliminates arbitrary glows for pure typographical hierarchy.
 */
function TerminalMetricTile({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: string | number;
  detail: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="group flex flex-col justify-between rounded-[16px] border border-[var(--portal-border)] bg-[var(--portal-card)] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all hover:border-[var(--portal-accent-border)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
      <div className="flex items-start justify-between">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--portal-muted)]">
          {label}
        </p>
        <div className="rounded-lg bg-[var(--portal-surface-soft)] p-2 text-[var(--portal-muted)] transition-colors group-hover:text-[var(--portal-foreground)]">
          {icon}
        </div>
      </div>
      <div className="mt-6">
        <p className="font-mono text-4xl font-semibold tracking-tight text-[var(--portal-foreground)] tabular-nums">
          {value}
        </p>
        <p className="mt-2 text-xs font-medium text-[var(--portal-muted)]">
          {detail}
        </p>
      </div>
    </div>
  );
}

/**
 * System Telemetry Matrix.
 * COMPLETELY OVERHAULED: Replaces the broken charts with a mathematically rigid grid.
 * Misalignment is structurally impossible here.
 */
function TerminalTelemetryMatrix({ projects, details }: { projects: AccessibleProject[], details: ProjectDetail[] }) {
  const detailById = new Map(details.map((project) => [project.id, project]));
  const topProjects = projects.slice(0, 5);

  return (
    <div className="flex h-full flex-col rounded-[16px] border border-[var(--portal-border)] bg-[var(--portal-card)] shadow-sm">
      <div className="border-b border-[var(--portal-border)] bg-[var(--portal-surface-soft)] px-6 py-5 rounded-t-[16px]">
        <h3 className="text-sm font-bold text-[var(--portal-foreground)] tracking-tight">System Momentum</h3>
        <p className="mt-1 text-[11px] font-medium text-[var(--portal-muted)]">Resource allocation per node</p>
      </div>
      
      <div className="flex flex-1 flex-col p-2">
        {/* Matrix Header */}
        <div className="grid grid-cols-[1fr_40px_40px_40px] gap-2 px-4 py-3 border-b border-[var(--portal-border)]/50">
          <div className="text-[9px] font-bold uppercase tracking-widest text-[var(--portal-muted)]">Node ID</div>
          <div className="text-center text-[9px] font-bold uppercase tracking-widest text-indigo-500" title="Sites">ST</div>
          <div className="text-center text-[9px] font-bold uppercase tracking-widest text-blue-500" title="Domains">DM</div>
          <div className="text-center text-[9px] font-bold uppercase tracking-widest text-cyan-500" title="Members">MB</div>
        </div>

        {/* Matrix Rows */}
        <div className="flex flex-col gap-1 mt-2">
          {topProjects.length ? topProjects.map((project) => {
            const d = detailById.get(project.id);
            const sites = d?.sites.filter(s => s.publishStatus === "PUBLISHED").length || 0;
            const domains = d?.domains.filter(dom => dom.status === "ACTIVE").length || 0;
            const members = d?.members.filter(m => m.status === "ACTIVE").length || 0;
            const totalLeads = d?.leadCount || 0;

            return (
              <div key={project.id} className="grid grid-cols-[1fr_40px_40px_40px] items-center gap-2 rounded-lg px-4 py-2.5 transition-colors hover:bg-[var(--portal-surface-soft)]">
                {/* Fixed Label Context */}
                <div className="min-w-0 pr-2">
                  <p className="truncate text-xs font-bold text-[var(--portal-foreground)]">
                    {project.name}
                  </p>
                  <p className="mt-0.5 truncate text-[10px] font-medium text-[var(--portal-muted)]">
                    {formatCompactNumber(totalLeads)} Leads
                  </p>
                </div>

                {/* Rigid Data Cells (Impossible to misalign) */}
                <div className={`flex h-7 w-full items-center justify-center rounded-[6px] text-xs font-mono font-bold tabular-nums ${sites > 0 ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'text-[var(--portal-muted)] opacity-50'}`}>
                  {sites}
                </div>
                <div className={`flex h-7 w-full items-center justify-center rounded-[6px] text-xs font-mono font-bold tabular-nums ${domains > 0 ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'text-[var(--portal-muted)] opacity-50'}`}>
                  {domains}
                </div>
                <div className={`flex h-7 w-full items-center justify-center rounded-[6px] text-xs font-mono font-bold tabular-nums ${members > 0 ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400' : 'text-[var(--portal-muted)] opacity-50'}`}>
                  {members}
                </div>
              </div>
            );
          }) : (
            <div className="flex flex-col items-center justify-center py-12 text-center text-[var(--portal-muted)] opacity-60">
              <svg className="mb-3 h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-[11px] font-semibold tracking-wider uppercase">Awaiting Telemetry</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Workspace Row using absolutely strict Grid sizing.
 * Columns are hard-locked ensuring perfect vertical scan lines for the user's eye.
 */
function TerminalProjectRow({
  project,
  detail,
}: {
  project: AccessibleProject;
  detail?: ProjectDetail;
}) {
  return (
    <Link
      href={ROUTES.dashboard.project(project.id)}
      className="group block border-b border-[var(--portal-border)] bg-[var(--portal-card)] px-6 py-5 transition-colors hover:bg-[var(--portal-surface-soft)] last:border-0"
    >
      <div className="grid grid-cols-12 items-center gap-6">
        
        {/* Col 1-5: Identity (Fixed width area) */}
        <div className="col-span-12 sm:col-span-5 flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-slate-800 text-sm font-bold text-white shadow-inner ring-1 ring-white/10 dark:bg-white dark:text-slate-900 transition-transform group-hover:scale-105">
            {project.name[0]}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <p className="truncate text-sm font-bold text-[var(--portal-foreground)]">
                {project.name}
              </p>
              <TerminalStatusPill
                label={project.status}
                tone={project.status === "ACTIVE" ? "success" : project.status === "ARCHIVED" ? "neutral" : "warning"}
              />
              {detail?.liveUrl && <TerminalStatusPill label="Live" tone="success" />}
            </div>
            <p className="mt-1 truncate text-[11px] font-medium text-[var(--portal-muted)] transition-colors group-hover:text-[var(--portal-foreground)]">
              {detail?.liveUrl || project.primaryDomain || "Domain pending configuration"}
            </p>
          </div>
        </div>

        {/* Col 6-8: Analytics (Right Aligned tabular data) */}
        <div className="col-span-4 sm:col-span-3 text-left sm:text-right">
          <p className="font-mono text-sm font-bold text-[var(--portal-foreground)] tabular-nums">
            {formatCompactNumber(detail?.leadCount || 0)}
          </p>
          <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-[var(--portal-muted)]">
            Total Leads
          </p>
        </div>

        {/* Col 9-11: Timestamps (Right Aligned tabular data) */}
        <div className="col-span-6 sm:col-span-3 text-left sm:text-right">
          <p className="font-mono text-sm font-medium text-[var(--portal-foreground)] tabular-nums">
            {formatPortalDate(detail?.billingSummary.latestUpdatedAt || project.goLiveAt)}
          </p>
          <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-[var(--portal-muted)]">
            Last Updated
          </p>
        </div>

        {/* Col 12: Interaction Indicator */}
        <div className="col-span-2 sm:col-span-1 flex justify-end">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--portal-muted)] transition-all group-hover:bg-[var(--portal-border)] group-hover:text-[var(--portal-foreground)]">
            <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

      </div>
    </Link>
  );
}

// ----------------------------------------------------------------------
// Main Projects View (The Dashboard Shell)
// ----------------------------------------------------------------------

export function ClientProjectsOverview({
  user,
  projects,
  details,
}: {
  user: PortalUserSummary;
  projects: AccessibleProject[];
  details: ProjectDetail[];
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const totalLeads = details.reduce((sum, project) => sum + project.leadCount, 0);
  const liveProjects = details.filter((project) => Boolean(project.liveUrl)).length;
  const navSections = buildPortfolioNav("projects");
  const greeting = mounted ? getTimeOfDayGreeting() : "Welcome back";
  const firstName = user.fullName?.trim().split(/\s+/)[0] || "Owner";

  return (
    <ClientPortalShell
      user={user}
      sections={navSections}
      pageTitle="Projects"
      pageDescription="All accessible workspaces at a glance."
      utilityLabel={user.companyName || "Client workspace"}
      actions={<SignOutButton variant="clientPortal" />}
    >
      {/* Grid System Foundation: 
        Strict 8pt vertical rhythm spacing. max-w-[1400px] constrains ultra-wide monitors. 
      */}
      <div className="mx-auto w-full max-w-[1400px] space-y-8 pb-24 pt-6 animate-in fade-in duration-500" id="projects">
        
        {/* 1. Header Area - Structural Alignment */}
        <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between border-b border-[var(--portal-border)] pb-8">
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)] animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-500">
                Workspace Portfolio
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-[var(--portal-foreground)] sm:text-4xl">
              {greeting}, {firstName}.
            </h1>
            <p className="text-sm font-medium text-[var(--portal-muted)] max-w-2xl leading-relaxed">
              Monitor your accessible projects, track domain deployments, and analyze live lead capital across your network infrastructure.
            </p>
          </div>
          
          {/* Quick System Status Strip */}
          <div className="flex items-center gap-6 rounded-[12px] border border-[var(--portal-border)] bg-[var(--portal-surface)] px-5 py-3 shadow-sm">
            <div className="flex flex-col items-start gap-1">
              <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--portal-muted)]">Active Network</span>
              <div className="flex items-center gap-2 font-mono text-sm font-bold text-[var(--portal-foreground)] tabular-nums">
                {projects.length} Nodes
              </div>
            </div>
            <div className="h-8 w-px bg-[var(--portal-border)]" />
            <div className="flex flex-col items-start gap-1">
              <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--portal-muted)]">Live Routing</span>
              <div className="flex items-center gap-2 font-mono text-sm font-bold text-[var(--portal-foreground)] tabular-nums">
                <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
                {liveProjects} Surfaces
              </div>
            </div>
          </div>
        </header>

        {/* 2. Top Level Metrics (3 Equal Columns) */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <TerminalMetricTile
            label="Total Projects"
            value={formatCompactNumber(projects.length)}
            detail="Accessible environments"
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
            }
          />
          <TerminalMetricTile
            label="Cumulative Leads"
            value={formatCompactNumber(totalLeads)}
            detail="Aggregated across network"
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            }
          />
          <TerminalMetricTile
            label="Live Deployments"
            value={formatCompactNumber(liveProjects)}
            detail="Public-facing surfaces"
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
              </svg>
            }
          />
        </div>

        {/* 3. Main Data Split (Strict 4/8 12-Column Grid) */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
          
          {/* Left Panel: Analytics (Takes 4 columns) */}
          <div className="lg:col-span-4 sticky top-24">
             <TerminalTelemetryMatrix projects={projects} details={details} />
          </div>

          {/* Right Panel: Data Grid (Takes 8 columns) */}
          <div className="lg:col-span-8">
            <div className="flex flex-col overflow-hidden rounded-[16px] border border-[var(--portal-border)] bg-[var(--portal-card)] shadow-sm">
              <div className="flex items-center justify-between border-b border-[var(--portal-border)] bg-[var(--portal-surface-soft)] px-6 py-5">
                <div>
                  <h2 className="text-sm font-bold tracking-tight text-[var(--portal-foreground)]">Workspace Directory</h2>
                  <p className="mt-1 text-[11px] font-medium text-[var(--portal-muted)]">Directory mapping of all {projects.length} initialized node projects.</p>
                </div>
              </div>
              
              <div className="flex flex-col">
                {projects.length ? (
                  projects.map((project) => (
                    <TerminalProjectRow 
                      key={project.id} 
                      project={project} 
                      detail={details.find(d => d.id === project.id)} 
                    />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center text-[var(--portal-muted)] bg-[var(--portal-surface)]">
                    <svg className="mb-4 h-10 w-10 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <p className="text-[13px] font-bold text-[var(--portal-foreground)]">System Directory Empty</p>
                    <p className="mt-1 text-xs">No workspace records initialized in the database.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </ClientPortalShell>
  );
}