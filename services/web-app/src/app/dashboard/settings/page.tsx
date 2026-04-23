import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ClientPortalSectionCard } from "@/components/client-portal/client-portal-panels";
import { ClientPortalShell } from "@/components/client-portal/client-portal-shell";
import { SignOutButton } from "@/components/landing-portal/sign-out-button";
import { AuthThemeToggle } from "@/components/landing-portal/auth-theme-toggle";
import { fetchPortalSessionForApp } from "@/lib/landing-portal";
import { buildPortfolioNav } from "@/lib/portal-nav";
import { ROUTES, signInRedirect } from "@/lib/routes";
import Link from "next/link";

function serializeCookieHeader() {
  return cookies()
    .getAll()
    .map((entry) => `${entry.name}=${entry.value}`)
    .join("; ");
}

export default async function DashboardSettingsPage() {
  const cookieHeader = serializeCookieHeader();
  const session = await fetchPortalSessionForApp(cookieHeader);

  if (!session) {
    redirect(signInRedirect(ROUTES.dashboard.settings));
  }

  const user = session.portalUser;

  return (
    <ClientPortalShell
      user={user}
      sections={buildPortfolioNav(null)}
      pageTitle="Settings"
      pageDescription="Account and workspace preferences."
      eyebrowLabel="Settings"
    >
      <div className="space-y-5 portal-fade-in">
        {/* Account */}
        <ClientPortalSectionCard title="Account" subtitle="Identity and sign-in details.">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl bg-[var(--portal-surface-soft)] p-3.5">
              <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--portal-muted)]">Name</p>
              <p className="mt-1.5 text-sm font-semibold text-[var(--portal-foreground)]">{user.fullName || "Not set"}</p>
            </div>
            <div className="rounded-xl bg-[var(--portal-surface-soft)] p-3.5">
              <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--portal-muted)]">Email</p>
              <p className="mt-1.5 text-sm font-semibold text-[var(--portal-foreground)] break-all">{user.email}</p>
            </div>
            <div className="rounded-xl bg-[var(--portal-surface-soft)] p-3.5">
              <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--portal-muted)]">Company</p>
              <p className="mt-1.5 text-sm font-semibold text-[var(--portal-foreground)]">{user.companyName || "Not set"}</p>
            </div>
            <div className="rounded-xl bg-[var(--portal-surface-soft)] p-3.5">
              <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--portal-muted)]">Role</p>
              <p className="mt-1.5 text-sm font-semibold text-[var(--portal-foreground)]">{user.role}</p>
            </div>
          </div>
        </ClientPortalSectionCard>

        {/* Appearance + Security  */}
        <div className="grid gap-5 md:grid-cols-2">
          <ClientPortalSectionCard title="Appearance" subtitle="Theme preference.">
            <div className="flex items-center gap-3">
              <AuthThemeToggle variant="clientPortal" className="px-3.5 py-2 text-[10px] tracking-[0.14em]" />
              <p className="text-[12px] text-[var(--portal-muted)]">Toggle theme</p>
            </div>
          </ClientPortalSectionCard>

          <ClientPortalSectionCard title="Security" subtitle="Password and sign-in.">
            <div className="space-y-2">
              <Link
                href={ROUTES.auth.forgotPassword}
                className="flex items-center gap-3 rounded-xl bg-[var(--portal-surface-soft)] p-3.5 transition hover:bg-[var(--portal-elevated)]"
              >
                <span className="material-symbols-outlined text-[20px]" style={{ color: "var(--portal-badge-text)" }}>lock_reset</span>
                <div>
                  <p className="text-sm font-semibold text-[var(--portal-foreground)]">Reset password</p>
                  <p className="text-[11px] text-[var(--portal-muted)]">Send reset link to {user.email}</p>
                </div>
              </Link>
              <div className="flex items-center gap-3 rounded-xl bg-[var(--portal-surface-soft)] p-3.5">
                <span className="material-symbols-outlined text-[20px]" style={{ color: "var(--portal-tone-success-text)" }}>verified_user</span>
                <div>
                  <p className="text-sm font-semibold text-[var(--portal-foreground)]">Email verified</p>
                  <p className="text-[11px] text-[var(--portal-muted)]">Confirmed</p>
                </div>
              </div>
            </div>
          </ClientPortalSectionCard>
        </div>

        {/* Support + Session */}
        <div className="grid gap-5 md:grid-cols-2">
          <ClientPortalSectionCard title="Support" subtitle="Get help from our team.">
            <div className="space-y-2">
              <a
                href="mailto:support@shasvata.com"
                className="flex items-center gap-3 rounded-xl bg-[var(--portal-surface-soft)] p-3.5 transition hover:bg-[var(--portal-elevated)]"
              >
                <span className="material-symbols-outlined text-[20px]" style={{ color: "var(--portal-badge-text)" }}>mail</span>
                <div>
                  <p className="text-sm font-semibold text-[var(--portal-foreground)]">Email</p>
                  <p className="text-[11px] text-[var(--portal-muted)]">support@shasvata.com</p>
                </div>
              </a>
              <a
                href="https://wa.me/917757077775"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 rounded-xl bg-[var(--portal-surface-soft)] p-3.5 transition hover:bg-[var(--portal-elevated)]"
              >
                <span className="material-symbols-outlined text-[20px]" style={{ color: "var(--portal-badge-text)" }}>chat</span>
                <div>
                  <p className="text-sm font-semibold text-[var(--portal-foreground)]">WhatsApp</p>
                  <p className="text-[11px] text-[var(--portal-muted)]">Quick support</p>
                </div>
              </a>
              <div className="flex items-center gap-3 rounded-xl bg-[var(--portal-surface-soft)] p-3.5">
                <span className="material-symbols-outlined text-[20px]" style={{ color: "var(--portal-muted)" }}>schedule</span>
                <div>
                  <p className="text-sm font-semibold text-[var(--portal-foreground)]">Hours</p>
                  <p className="text-[11px] text-[var(--portal-muted)]">Mon — Sat, 10 AM — 7 PM IST</p>
                </div>
              </div>
            </div>
          </ClientPortalSectionCard>

          <ClientPortalSectionCard title="Session" subtitle="Manage your current session.">
            <div className="flex items-center gap-3">
              <SignOutButton variant="clientPortal" />
              <p className="text-[12px] text-[var(--portal-muted)]">End this session</p>
            </div>
          </ClientPortalSectionCard>
        </div>
      </div>
    </ClientPortalShell>
  );
}
