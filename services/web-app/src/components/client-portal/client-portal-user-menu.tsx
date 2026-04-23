"use client";

import Link from "next/link";
import type { PortalUserSummary } from "@/lib/landing-portal";
import { ROUTES } from "@/lib/routes";
import { AuthThemeToggle } from "@/components/landing-portal/auth-theme-toggle";
import { SignOutButton } from "@/components/landing-portal/sign-out-button";

export function ClientPortalUserMenu({ user }: { user: PortalUserSummary }) {
  return (
    <details className="group relative">
      <summary
        className="client-portal-tone-transition flex cursor-pointer list-none items-center gap-3 rounded-[18px] border px-3 py-3"
        style={{
          borderColor: "var(--portal-border)",
          background: "var(--portal-sidebar-active)",
        }}
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1ab07b] text-xs font-bold uppercase text-white shadow-sm">
          {user.fullName ? user.fullName[0] : user.email[0]}
        </div>
        <div className="min-w-0 flex-1">
          <p
            className="truncate text-[13px] font-semibold leading-tight"
            style={{ color: "var(--portal-sidebar-text)" }}
          >
            {user.fullName || "User"}
          </p>
          <p
            className="truncate text-[11px] leading-tight"
            style={{ color: "var(--portal-sidebar-muted)" }}
          >
            {user.email}
          </p>
        </div>
        <span
          className="material-symbols-outlined text-[18px]"
          style={{ color: "var(--portal-sidebar-muted)" }}
        >
          more_horiz
        </span>
      </summary>

      <div
        className="absolute bottom-[calc(100%+0.85rem)] left-0 z-50 min-w-[15rem] rounded-[22px] border p-2 shadow-[0_24px_80px_rgba(15,23,42,0.18)]"
        style={{
          borderColor: "var(--portal-border)",
          background: "var(--portal-card)",
        }}
      >
        <div className="space-y-1">
          <Link
            href={ROUTES.dashboard.settings}
            className="client-portal-tone-transition flex items-center gap-3 rounded-[16px] px-3 py-2.5 text-sm"
            style={{ color: "var(--portal-foreground)" }}
          >
            <span className="material-symbols-outlined text-[18px]">manage_accounts</span>
            Account settings
          </Link>
          <a
            href="https://shasvata.com/contact"
            target="_blank"
            rel="noreferrer"
            className="client-portal-tone-transition flex items-center gap-3 rounded-[16px] px-3 py-2.5 text-sm"
            style={{ color: "var(--portal-foreground)" }}
          >
            <span className="material-symbols-outlined text-[18px]">help</span>
            Contact support
          </a>
        </div>

        <div
          className="mt-2 space-y-2 border-t px-1 pt-3"
          style={{ borderColor: "var(--portal-border)" }}
        >
          <AuthThemeToggle
            variant="clientPortal"
            className="w-full justify-center px-3 py-2 text-[10px] tracking-[0.18em]"
          />
          <SignOutButton
            variant="clientPortalSubtle"
            className="w-full justify-center px-3 py-2 text-[10px] tracking-[0.18em]"
          />
        </div>
      </div>
    </details>
  );
}
