"use client";

import Link from "next/link";
import Image from "next/image";
import type { PortalUserSummary } from "@/lib/landing-portal";
import { AuthThemeToggle } from "@/components/landing-portal/auth-theme-toggle";
import { SignOutButton } from "@/components/landing-portal/sign-out-button";
import type { ClientPortalNavSection } from "@/lib/portal-nav";
import { ROUTES } from "@/lib/routes";

type ClientPortalNavProps = {
  user: PortalUserSummary;
  sections: ClientPortalNavSection[];
};

export function ClientPortalNav({ user, sections }: ClientPortalNavProps) {
  return (
    <aside className="sticky top-0 z-40 hidden h-screen w-[280px] flex-shrink-0 flex-col border-r bg-[var(--portal-background)] transition-all lg:flex" style={{ borderColor: "var(--portal-border)" }}>

      {/* Brand & Global Search */}
      <div className="px-5 pt-6 pb-4">
        <Link href={ROUTES.dashboard.root} className="flex items-center gap-3 transition-opacity hover:opacity-80 mb-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--portal-foreground)] text-[var(--portal-surface)] shadow-md">
            <Image src="/logo-icon.png" alt="Shasvata" width={20} height={20} className="invert dark:invert-0" />
          </div>
          <span className="text-[16px] font-bold tracking-tight text-[var(--portal-foreground)]">
            Shasvata
          </span>
        </Link>

        {/* Global Search Affordance */}
        <button className="flex w-full items-center justify-between rounded-lg border border-[var(--portal-border)] bg-[var(--portal-surface)] px-3 py-2 text-sm text-[var(--portal-muted)] shadow-sm transition-all hover:border-[var(--portal-accent-border)] hover:bg-[var(--portal-surface-soft)]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">search</span>
            <span className="font-medium">Search...</span>
          </div>
          <kbd className="hidden rounded bg-[var(--portal-surface-soft)] px-1.5 py-0.5 text-[10px] font-sans font-bold text-[var(--portal-muted)] sm:inline-block">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-6 overflow-y-auto px-4 pb-6 scrollbar-hide">
        {sections.map((section, idx) => {

          // PREMIUM UX FEATURE: Render 'Back Navigation' as a structural Context Card
          if (section.isBackNavigation) {
            const backItem = section.items[0];
            return (
              <div key="context-card" className="mb-6 rounded-xl border border-[var(--portal-border)] bg-[var(--portal-surface-soft)] p-3 shadow-sm">
                <Link href={backItem.href} className="group flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-[var(--portal-muted)] hover:text-[var(--portal-foreground)] transition-colors mb-2">
                  <span className="material-symbols-outlined text-[14px] transition-transform group-hover:-translate-x-0.5">arrow_back</span>
                  {backItem.label}
                </Link>
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--portal-border)] bg-[var(--portal-surface)] shadow-sm">
                    <span className="material-symbols-outlined text-[16px] text-[var(--portal-foreground)]">account_tree</span>
                  </div>
                  <p className="text-sm font-bold text-[var(--portal-foreground)] truncate">
                    {section.projectName || "Project Workspace"}
                  </p>
                </div>
              </div>
            );
          }

          // Standard Navigation Sections
          return (
            <div key={section.label || idx}>
              <p className="px-2 pb-2 text-[11px] font-bold uppercase tracking-widest text-[var(--portal-muted)] opacity-80">
                {section.label}
              </p>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = item.active;

                  const inner = (
                    <>
                      <span className="material-symbols-outlined text-[18px] shrink-0 transition-transform group-hover:scale-110" style={{ fontVariationSettings: isActive ? "'FILL' 1, 'wght' 600" : "'FILL' 0, 'wght' 400" }}>
                        {item.icon}
                      </span>
                      <span className="truncate">{item.label}</span>

                      {/* Interactive Badges & Shortcuts */}
                      {item.badge ? (
                        <span className="ml-auto rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                          {item.badge}
                        </span>
                      ) : item.shortcut ? (
                        <kbd className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity rounded px-1.5 py-0.5 text-[10px] font-sans font-bold text-[var(--portal-muted)]">
                          ⌘{item.shortcut}
                        </kbd>
                      ) : item.external ? (
                        <span className="material-symbols-outlined ml-auto text-[14px] opacity-50">open_in_new</span>
                      ) : null}
                    </>
                  );

                  const baseCls = "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-200 overflow-hidden";
                  const activeCls = "bg-[var(--portal-surface-soft)] text-[var(--portal-foreground)] font-semibold shadow-sm ring-1 ring-[var(--portal-border)]";
                  const inactiveCls = "text-[var(--portal-muted)] hover:bg-[var(--portal-surface-soft)] hover:text-[var(--portal-foreground)]";

                  return item.external ? (
                    <a key={item.href} href={item.href} target="_blank" rel="noreferrer" className={`${baseCls} ${inactiveCls}`}>
                      {inner}
                    </a>
                  ) : (
                    <Link key={item.href} href={item.href} className={`${baseCls} ${isActive ? activeCls : inactiveCls}`}>
                      {isActive && <div className="absolute left-0 top-1 bottom-1 w-1 bg-[var(--portal-foreground)] rounded-r-full" />}
                      {inner}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer Area */}
      <div className="border-t border-[var(--portal-border)] bg-[var(--portal-surface-soft)] p-4">
        {/* User Card */}
        <div className="flex items-center gap-3 rounded-xl border border-[var(--portal-border)] bg-[var(--portal-surface)] px-3 py-2.5 shadow-sm transition-all hover:border-[var(--portal-accent-border)] cursor-pointer group">
          <div className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold uppercase text-white shadow-inner bg-gradient-to-br from-indigo-500 to-blue-500">
            {user.fullName ? user.fullName[0] : user.email[0]}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-[var(--portal-foreground)] group-hover:text-blue-500 transition-colors">
              {user.fullName || "Workspace User"}
            </p>
            <p className="truncate text-[11px] font-medium text-[var(--portal-muted)]">
              {user.email}
            </p>
          </div>
        </div>

        {/* Utilities */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <AuthThemeToggle variant="clientPortal" className="justify-center rounded-lg border border-[var(--portal-border)] bg-[var(--portal-surface)] py-2 text-[10px] tracking-wider hover:bg-[var(--portal-surface-soft)]" />
          <SignOutButton variant="clientPortalSubtle" className="w-full justify-center rounded-lg border border-[var(--portal-border)] bg-[var(--portal-surface)] py-2 text-[10px] tracking-wider hover:bg-rose-500/10 hover:text-rose-600 hover:border-rose-500/20" />
        </div>
      </div>
    </aside>
  );
}
