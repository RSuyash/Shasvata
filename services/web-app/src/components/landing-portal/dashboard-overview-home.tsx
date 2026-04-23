"use client";

import Link from "next/link";
import {
  ClientPortalSectionCard,
  ClientPortalStatusPill,
} from "@/components/client-portal/client-portal-panels";
import { PortalActionMenu } from "@/components/landing-portal/portal-action-menu";
import type { DashboardOverviewModel } from "@/lib/client-portal-dashboard";
import { formatPortalDate, type PortalUserSummary } from "@/lib/landing-portal";
import { ROUTES } from "@/lib/routes";

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en-IN", {
    notation: value >= 1000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatMoneyMinor(value: number) {
  const rupees = value / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(rupees);
}

// ----------------------------------------------------------------------
// Premium UI Components
// ----------------------------------------------------------------------

function MetricTile({
  label,
  value,
  detail,
  icon,
  alert = false,
  trend,
}: {
  label: string;
  value: string;
  detail: string;
  icon: React.ReactNode;
  alert?: boolean;
  trend?: { value: string; direction: "up" | "down" | "neutral" };
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border bg-[var(--portal-surface)] p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${alert
          ? "border-amber-200/50 shadow-[0_4px_20px_rgba(251,191,36,0.05)]"
          : "border-[var(--portal-border)] hover:border-[var(--portal-accent-border)]"
        }`}
    >
      <div className="flex items-start justify-between">
        <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--portal-muted)]">
          {label}
        </p>
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${alert
              ? "bg-amber-50 text-amber-600 group-hover:bg-amber-100"
              : "bg-[var(--portal-surface-soft)] text-[var(--portal-foreground)] group-hover:bg-[var(--portal-border)]"
            }`}
        >
          {icon}
        </div>
      </div>
      
      <div className="mt-4">
        <p
          className={`text-3xl font-black tracking-tight ${alert ? "text-amber-700" : "text-[var(--portal-foreground)]"
            }`}
        >
          {value}
        </p>
        
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          {trend ? (
            <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider ${
              trend.direction === "up" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" 
              : trend.direction === "down" ? "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400"
              : "bg-[var(--portal-surface-soft)] text-[var(--portal-muted)]"
            }`}>
              {trend.direction === "up" && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
              {trend.direction === "down" && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" /></svg>}
              {trend.value}
            </span>
          ) : null}
          <p className="text-xs font-medium text-[var(--portal-muted)]">
            {detail}
          </p>
        </div>
      </div>

      {/* Subtle bottom glow effect */}
      <div
        className={`absolute bottom-0 left-0 h-1 w-full opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${alert
            ? "bg-gradient-to-r from-amber-400 to-orange-500"
            : "bg-gradient-to-r from-blue-500 to-cyan-400"
          }`}
      />
    </div>
  );
}

function WorkspaceCard({
  workspace,
}: {
  workspace: DashboardOverviewModel["workspaces"][number];
}) {
  return (
    <div
      className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-transparent p-3 transition-all duration-200 hover:bg-[var(--portal-surface-soft)] hover:border-[var(--portal-border)] relative"
    >
      <div className="flex flex-1 min-w-0 items-center gap-4">
        <Link
          href={workspace.href}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg font-black text-white shadow-inner transition-transform duration-300 hover:scale-105"
          style={{ background: "linear-gradient(135deg, #6366f1, #06b6d4)" }}
        >
          {workspace.name[0]}
        </Link>
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <Link 
              href={workspace.href}
              className="truncate text-sm font-bold text-[var(--portal-foreground)] transition-colors hover:text-blue-500 focus:outline-none"
            >
              {workspace.name}
            </Link>
            <ClientPortalStatusPill
              label={workspace.status}
              tone={
                workspace.status === "ACTIVE"
                  ? "success"
                  : workspace.status === "ARCHIVED"
                    ? "neutral"
                    : "warning"
              }
            />
          </div>
          <p className="mt-0.5 text-xs font-medium text-[var(--portal-muted)]">
            {workspace.domainLabel}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6 sm:text-right shrink-0">
        <div className="hidden sm:block">
          <p className="text-xs font-bold text-[var(--portal-foreground)]">
            {formatCompactNumber(workspace.leadCount)}
          </p>
          <p className="text-[10px] uppercase tracking-wider text-[var(--portal-muted)] mt-0.5">
            Total Leads
          </p>
        </div>
        <div className="hidden md:block">
          <p className="text-xs font-bold text-[var(--portal-foreground)]">
            {formatPortalDate(workspace.lastUpdatedAt)}
          </p>
          <p className="text-[10px] uppercase tracking-wider text-[var(--portal-muted)] mt-0.5">
            Last Updated
          </p>
        </div>
        
        {/* Safe 3-Dot Interactive Menu Block */}
        <div className="relative z-10 flex h-8 items-center justify-center -mr-2">
          <PortalActionMenu
            items={[
              { label: "View Lead Inbox", href: `${workspace.href}/leads` },
              { label: "Manage Configuration", href: `${workspace.href}/configuration` },
              { label: "Visit live site", href: `https://${workspace.domainLabel}`, external: true }
            ]}
          />
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Main Dashboard
// ----------------------------------------------------------------------

export function DashboardOverviewHome({
  user,
  model,
}: {
  user: PortalUserSummary;
  model: DashboardOverviewModel;
}) {
  const firstName =
    user.fullName?.trim().split(/\s+/)[0] || user.companyName || "there";

  const totalDue = model.metrics.totalDueNowMinor;
  const isBillingAlert = totalDue > 0;

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Page Header & Actions - SaaS Style */}
      <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black tracking-tight text-[var(--portal-foreground)]">
              Overview
            </h1>
            <div className="ml-2 flex items-center gap-1.5 rounded-full border border-[var(--portal-accent-border)] bg-[var(--portal-badge-bg)] px-2.5 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--portal-tone-success)] animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--portal-badge-text)]">
                All systems operational
              </span>
            </div>
          </div>
          <p className="text-sm font-medium leading-relaxed text-[var(--portal-muted)] max-w-xl">
            Welcome back, {firstName}. Review your real-time analytics, manage live environments, and monitor your infrastructure health.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={ROUTES.dashboard.settings}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-[var(--portal-surface-soft)] px-4 text-xs font-bold uppercase tracking-wider text-[var(--portal-foreground)] transition hover:bg-[var(--portal-border)]"
          >
            Settings
          </Link>
          <Link
            href={ROUTES.dashboard.billing}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[var(--portal-surface-soft)] px-4 text-xs font-bold uppercase tracking-wider text-[var(--portal-foreground)] transition hover:bg-[var(--portal-border)]"
          >
            Billing
            {isBillingAlert && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] text-white">!</span>
            )}
          </Link>
          <Link
            href={ROUTES.dashboard.projects}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[var(--portal-foreground)] px-5 text-xs font-bold uppercase tracking-wider text-[var(--portal-background)] shadow-md transition hover:scale-105 hover:bg-[var(--portal-tone-blue)]"
          >
            Open Projects
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </header>

      {/* 2. Key Performance Indicators (KPIs) */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricTile
          label="Workspaces"
          value={formatCompactNumber(model.metrics.workspaceCount)}
          detail={`${model.metrics.activeWorkspaceCount} active`}
          trend={{ value: "Stable", direction: "up" }}
          icon={
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          }
        />
        <MetricTile
          label="Live Sites"
          value={formatCompactNumber(model.metrics.liveWorkspaceCount)}
          detail="Published & accessible"
          icon={
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
          }
        />
        <MetricTile
          label="Total Leads"
          value={formatCompactNumber(
            model.workspaces.reduce((s, w) => s + w.leadCount, 0)
          )}
          detail="Across all projects"
          trend={{ value: "+32 Active", direction: "up" }}
          icon={
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />
        <MetricTile
          label="Due Now"
          value={formatMoneyMinor(totalDue)}
          detail={
            model.metrics.projectsWithBilling > 0
              ? `${model.metrics.projectsWithBilling} billing workspace${model.metrics.projectsWithBilling === 1 ? "" : "s"
              }`
              : "No billing action needed"
          }
          alert={isBillingAlert}
          icon={
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          }
        />
      </section>

      {/* 3. Main Split View */}
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr] xl:grid-cols-[1.8fr_1fr]">
        {/* Workspaces List View */}
        <ClientPortalSectionCard
          title="Recent Workspaces"
          subtitle="Manage your environments and domains."
        >
          {model.workspaces.length ? (
            <div className="flex flex-col gap-2 mt-4">
              {model.workspaces.map((workspace) => (
                <WorkspaceCard key={workspace.id} workspace={workspace} />
              ))}
            </div>
          ) : (
            <div className="mt-8 flex flex-col items-center justify-center rounded-[2rem] border border-[var(--portal-border)] bg-[var(--portal-surface-soft)] py-16 px-6 text-center shadow-inner relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--portal-tone-indigo-bg)] via-transparent to-[var(--portal-tone-cyan-bg)] opacity-30 pointer-events-none" />
              <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--portal-card)] border border-[var(--portal-border)] text-[var(--portal-tone-blue)] shadow-xl mb-6 group-hover:scale-110 transition-transform duration-500">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <p className="relative z-10 text-xl font-bold tracking-tight text-[var(--portal-foreground)] mb-3">No workspaces found</p>
              <p className="relative z-10 max-w-md text-sm leading-relaxed text-[var(--portal-muted)] mb-8">
                Welcome to Shasvata! Launch your first managed infrastructure to generate leads, view metrics, and manage your live domains.
              </p>
              <Link
                href={ROUTES.dashboard.projects}
                className="relative z-10 inline-flex items-center gap-2 rounded-xl bg-[var(--portal-foreground)] px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-[var(--portal-background)] shadow-[0_12px_24px_rgba(0,0,0,0.15)] transition-all hover:scale-105 hover:bg-[var(--portal-tone-blue)] focus:outline-none"
              >
                Provision First Workspace
                <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
              </Link>
            </div>
          )}
        </ClientPortalSectionCard>

        {/* Spotlight - "Insights Engine" Style */}
        <ClientPortalSectionCard
          title="Spotlight"
          subtitle={model.spotlight.eyebrow || "System recommendations"}
          className="h-fit bg-gradient-to-b from-[var(--portal-card)] to-[var(--portal-surface-soft)]"
        >
          <div className="relative mt-2 overflow-hidden rounded-2xl border border-[var(--portal-border)] bg-[var(--portal-surface)] p-6 shadow-sm">
            {/* Subtle tech background pattern */}
            <div className="absolute -right-6 -top-6 opacity-[0.03] pointer-events-none">
              <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0L24 6l-12 6L0 6l12-6zm0 12l12 6-12 6-12-6 12-6z" />
              </svg>
            </div>

            <h3 className="relative z-10 text-xl font-bold tracking-tight text-[var(--portal-foreground)] leading-tight">
              {model.spotlight.title}
            </h3>
            <p className="relative z-10 mt-3 text-sm leading-relaxed text-[var(--portal-muted)]">
              {model.spotlight.detail}
            </p>

            <div className="relative z-10 mt-6 grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1 border-l-2 border-[var(--portal-tone-indigo)] pl-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--portal-muted)]">Current Access</span>
                <span className="text-sm font-semibold text-[var(--portal-foreground)] flex items-center gap-1.5">
                  <svg fill="currentColor" className="w-3.5 h-3.5 text-[var(--portal-tone-success)]" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd"/></svg>
                  {model.spotlight.roleLabel || "Pending"}
                </span>
              </div>
              <div className="flex flex-col gap-1 border-l-2 border-[var(--portal-tone-cyan)] pl-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--portal-muted)]">Owned Spaces</span>
                <span className="text-sm font-semibold text-[var(--portal-foreground)]">{formatCompactNumber(model.metrics.ownerWorkspaceCount)} Total</span>
              </div>
            </div>

            <div className="relative z-10 mt-8 flex flex-col gap-3 sm:flex-row">
              {model.spotlight.href && (
                <Link
                  href={model.spotlight.href}
                  className="flex flex-1 items-center justify-center rounded-lg bg-[var(--portal-foreground)] py-2.5 text-xs font-bold uppercase tracking-wider text-[var(--portal-background)] shadow-md transition hover:bg-opacity-90 hover:scale-[1.02]"
                >
                  Manage Project
                </Link>
              )}
              {model.spotlight.liveHref && (
                <a
                  href={model.spotlight.liveHref}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex flex-1 items-center justify-center rounded-lg border border-[var(--portal-border)] bg-[var(--portal-surface)] py-2.5 text-xs font-bold uppercase tracking-wider text-[var(--portal-foreground)] transition hover:border-[var(--portal-accent-border)] hover:bg-[var(--portal-surface-soft)]"
                >
                  Visit Live Site
                  <svg className="ml-2 h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
            </div>
            {model.spotlight.domainLabel && (
              <div className="mt-4 flex items-center justify-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[var(--portal-tone-success)]" />
                <p className="text-[11px] font-medium text-[var(--portal-muted)]">
                  Target: <span className="font-semibold text-[var(--portal-foreground)]">{model.spotlight.domainLabel}</span>
                </p>
              </div>
            )}
          </div>
        </ClientPortalSectionCard>
      </div>
    </div>
  );
}