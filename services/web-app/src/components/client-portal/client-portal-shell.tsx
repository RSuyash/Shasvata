"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import type { PortalUserSummary } from "@/lib/landing-portal";
import {
  getLocalWorkbenchNotice,
  getWorkbenchPersonaForUserId,
  isLocalPortalWorkbenchEnabled,
} from "@/lib/local-portal-workbench";
import type { ClientPortalBreadcrumb, ClientPortalNavSection } from "@/lib/portal-nav";
import { LocalWorkbenchSwitcher } from "@/components/landing-portal/local-workbench-switcher";
import { ClientPortalNav } from "./client-portal-nav";
import { ClientPortalBreadcrumbs } from "./client-portal-breadcrumbs";

type ClientPortalShellProps = {
  user: PortalUserSummary;
  sections: ClientPortalNavSection[];
  pageTitle: string;
  pageDescription: string;
  eyebrowLabel?: string;
  utilityLabel?: string;
  breadcrumbs?: ClientPortalBreadcrumb[];
  actions?: ReactNode;
  customHeader?: ReactNode;
  children: ReactNode;
};

export function ClientPortalShell({
  user,
  sections,
  pageTitle,
  eyebrowLabel,
  utilityLabel,
  breadcrumbs,
  actions,
  customHeader,
  children,
}: ClientPortalShellProps) {
  const workbenchEnabled = isLocalPortalWorkbenchEnabled();
  const currentWorkbenchPersona = workbenchEnabled ? getWorkbenchPersonaForUserId(user.id) : null;
  const workbenchNotice = workbenchEnabled ? getLocalWorkbenchNotice() : null;

  return (
    <main className="min-h-screen bg-[var(--portal-background)] font-sans selection:bg-[var(--portal-foreground)] selection:text-[var(--portal-surface)]">
      <div className="flex w-full min-h-screen">

        {/* Desktop Sidebar */}
        <ClientPortalNav user={user} sections={sections} />

        <div className="flex-1 flex min-w-0 flex-col relative">

          {/* Frosted Glass Top Header */}
          {customHeader ? (
            customHeader
          ) : (
            <header className="sticky top-0 z-30 border-b border-[var(--portal-border)] bg-[var(--portal-background)]/80 backdrop-blur-xl transition-colors">
              <div className="mx-auto flex min-h-[72px] max-w-[1400px] flex-col justify-center gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between md:py-0 lg:px-8">
                <div className="min-w-0 flex flex-col justify-center">
                  {breadcrumbs?.length ? (
                    <div className="mb-1 hidden md:block">
                      <ClientPortalBreadcrumbs items={breadcrumbs} />
                    </div>
                  ) : null}
                  <div className="flex items-center gap-3">
                    <h1 className="truncate text-xl font-bold tracking-tight text-[var(--portal-foreground)]">
                      {pageTitle}
                    </h1>
                    {(eyebrowLabel || utilityLabel) && (
                      <span className="hidden sm:inline-flex items-center rounded-full border border-[var(--portal-border)] bg-[var(--portal-surface-soft)] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[var(--portal-muted)] shadow-sm">
                        {eyebrowLabel || utilityLabel}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-3">
                  {actions}
                </div>
              </div>
            </header>
          )}

          {/* Premium Mobile Navigation (Floating Pills) */}
          <div className="sticky top-[72px] z-20 w-full bg-gradient-to-b from-[var(--portal-background)] to-transparent pt-2 pb-4 lg:hidden">
            <div className="px-4">
              <div className="flex items-center gap-2 overflow-x-auto rounded-xl border border-[var(--portal-border)] bg-[var(--portal-surface)]/90 p-1.5 shadow-md backdrop-blur-md scrollbar-hide snap-x">
                {sections
                  .filter(sec => !sec.isBackNavigation) // Hide the back context block from mobile horizontal scroll
                  .flatMap((section) => section.items)
                  .map((item) => {
                    const isActive = item.active;
                    const className = `snap-start whitespace-nowrap rounded-lg px-4 py-2 text-[12px] font-bold tracking-wide transition-all ${
                      isActive
                        ? "bg-[var(--portal-foreground)] text-[var(--portal-surface)] shadow-sm"
                        : "text-[var(--portal-muted)] hover:bg-[var(--portal-surface-soft)] hover:text-[var(--portal-foreground)]"
                    }`;

                    return item.external ? (
                      <a key={item.href} href={item.href} target="_blank" rel="noreferrer" className={className}>
                        {item.label}
                      </a>
                    ) : (
                      <Link key={item.href} href={item.href} className={className}>
                        {item.label}
                      </Link>
                    );
                })}
              </div>
            </div>
          </div>

          {/* Main Stage Area */}
          <div className="flex-1 p-4 lg:p-8 overflow-x-hidden">
            <div className="mx-auto max-w-[1400px] animate-in fade-in duration-500">

              {/* Dev Tools Notice */}
              {workbenchEnabled && currentWorkbenchPersona && workbenchNotice && (
                <div className="mb-8 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 shadow-sm backdrop-blur-md">
                  <LocalWorkbenchSwitcher currentPersona={currentWorkbenchPersona} />
                  <p className="mt-2 text-xs font-medium text-amber-700 dark:text-amber-400">
                    {workbenchNotice.message}
                  </p>
                </div>
              )}

              {/* Page Content */}
              {children}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
