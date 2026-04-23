import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ClientPortalShell } from "@/components/client-portal/client-portal-shell";
import { BillingPayNowButton } from "@/components/landing-portal/billing-pay-now-button";
import { ProjectBillingCheckoutIdentityForm } from "@/components/landing-portal/project-billing-checkout-identity-form";
import { SignOutButton } from "@/components/landing-portal/sign-out-button";
import {
  fetchProjectBillingForApp,
  fetchPortalSessionForApp,
  fetchProjectDetailForApp,
  formatPortalDate,
} from "@/lib/landing-portal";
import {
  buildBillingHealthPresentation,
  buildCheckoutReadinessPresentation,
  buildProjectBillingHeroPresentation,
} from "@/lib/billing-presentation";
import { buildProjectBreadcrumbs, buildProjectNav } from "@/lib/portal-nav";
import { ROUTES, signInRedirect } from "@/lib/routes";

// --- Utility Functions ---

function serializeCookieHeader() {
  return cookies()
    .getAll()
    .map((entry) => `${entry.name}=${entry.value}`)
    .join("; ");
}

function formatMoneyMinor(value: number): string {
  const rupees = value / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(rupees);
}

function billingStatusTone(status: string): "neutral" | "success" | "warning" | "indigo" {
  if (status === "PAID") return "success";
  if (status === "READY_TO_PAY" || status === "PARTIALLY_PAID") return "warning";
  if (status === "NO_BILLING") return "neutral";
  return "indigo";
}

function healthTone(
  tone: "success" | "warning" | "neutral",
): "success" | "warning" | "neutral" {
  return tone;
}

// ----------------------------------------------------------------------
// Precision UI Components (High Signal-to-Noise Ratio)
// ----------------------------------------------------------------------

function TerminalStatusPill({ label, tone }: { label: string; tone: "success" | "warning" | "neutral" | "indigo" }) {
  const dotColors = {
    success: "bg-[#10B981]",
    warning: "bg-[#F59E0B]",
    neutral: "bg-[#64748B]",
    indigo: "bg-[#6366F1]",
  };

  return (
    <div className="flex items-center gap-1.5 rounded-[4px] border border-[var(--portal-border)] bg-[var(--portal-surface)] px-2 py-1 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
      <span className={`h-1.5 w-1.5 rounded-full ${dotColors[tone]}`} />
      <span className="text-[9px] font-bold leading-none tracking-[0.15em] text-[var(--portal-foreground)] uppercase">
        {label}
      </span>
    </div>
  );
}

function TerminalFinanceTile({
  label,
  value,
  alert = false,
  success = false,
}: {
  label: string;
  value: string;
  alert?: boolean;
  success?: boolean;
}) {
  return (
    <div className={`flex flex-col justify-between rounded-[12px] border p-5 transition-all shadow-[0_1px_4px_rgba(0,0,0,0.02)] ${alert
        ? "border-amber-500/40 bg-amber-500/5"
        : success
          ? "border-emerald-500/30 bg-emerald-500/5"
          : "border-[var(--portal-border)] bg-[var(--portal-surface-soft)]"
      }`}>
      <p className={`text-[9px] font-bold uppercase tracking-[0.2em] ${alert ? "text-amber-600/90 dark:text-amber-500" : success ? "text-emerald-600/90 dark:text-emerald-500" : "text-[var(--portal-muted)]"}`}>
        {label}
      </p>
      <p className={`mt-4 font-mono text-3xl font-semibold tracking-tight tabular-nums ${alert ? "text-amber-600 dark:text-amber-500" : success ? "text-emerald-600 dark:text-emerald-500" : "text-[var(--portal-foreground)]"}`}>
        {value}
      </p>
    </div>
  );
}

// ----------------------------------------------------------------------
// Main Server Component
// ----------------------------------------------------------------------

export default async function DashboardProjectBillingPage({
  params,
}: {
  params: { projectId: string };
}) {
  const cookieHeader = serializeCookieHeader();
  const session = await fetchPortalSessionForApp(cookieHeader);

  if (!session) {
    redirect(signInRedirect(ROUTES.dashboard.projectBilling(params.projectId)));
  }

  const [project, billing] = await Promise.all([
    fetchProjectDetailForApp({
      cookieHeader,
      projectId: params.projectId,
    }),
    fetchProjectBillingForApp({
      cookieHeader,
      projectId: params.projectId,
    }),
  ]);

  const breadcrumbs = buildProjectBreadcrumbs(project.id, project.name, "Billing");
  const hero = buildProjectBillingHeroPresentation(billing);
  const health = buildBillingHealthPresentation(billing);
  const readiness = buildCheckoutReadinessPresentation(billing);
  const canEditCheckoutIdentity =
    session.portalUser.role === "PLATFORM_ADMIN" ||
    session.portalUser.role === "PLATFORM_OPERATOR" ||
    project.membershipRole === "OWNER";

  const isDue = billing.paymentState.amountDueNowMinor > 0;
  const isPaid = billing.paymentState.amountPaidMinor > 0;

  return (
    <ClientPortalShell
      user={session.portalUser}
      breadcrumbs={breadcrumbs}
      sections={buildProjectNav(project.id, {
        activeItem: "billing",
        liveHref: project.liveUrl,
      })}
      pageTitle={`${project.name} Billing`}
      pageDescription="A quieter billing room for this workspace: current amount, payment state, line items, and finance references."
      eyebrowLabel="Ledger Entry"
      actions={
        <>
          <Link
            href={ROUTES.dashboard.billing}
            className="inline-flex h-9 items-center justify-center rounded-lg bg-[var(--portal-surface-soft)] px-4 text-[10px] font-bold uppercase tracking-widest text-[var(--portal-foreground)] ring-1 ring-inset ring-[var(--portal-border)] transition-all hover:bg-[var(--portal-surface)] hover:ring-[var(--portal-accent-border)]"
          >
            Combined Ledger
          </Link>
          <Link
            href={ROUTES.dashboard.project(project.id)}
            className="inline-flex h-9 items-center justify-center rounded-lg bg-[var(--portal-surface-soft)] px-4 text-[10px] font-bold uppercase tracking-widest text-[var(--portal-foreground)] ring-1 ring-inset ring-[var(--portal-border)] transition-all hover:bg-[var(--portal-surface)] hover:ring-[var(--portal-accent-border)]"
          >
            Project Overview
          </Link>
          <SignOutButton variant="clientPortal" />
        </>
      }
    >
      <div className="mx-auto w-full max-w-[1400px] space-y-6 pb-24 pt-6 animate-in fade-in duration-500">

        {/* 1. Header Area */}
        <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between border-b border-[var(--portal-border)] pb-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <TerminalStatusPill
                label={billing.status.replace(/_/g, " ")}
                tone={billingStatusTone(billing.status)}
              />
              <TerminalStatusPill
                label={billing.billingHealth.sourceOfTruth === "ERP" ? "ERP-Linked" : "Snapshot-Led"}
                tone={healthTone(health.tone)}
              />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-[var(--portal-foreground)] sm:text-4xl">
              {project.name} Contract
            </h1>
            <p className="text-sm font-medium text-[var(--portal-muted)] max-w-2xl leading-relaxed">
              {hero.helperText}
            </p>
          </div>
        </header>

        {/* 2. KPI Matrix */}
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          <TerminalFinanceTile
            label="Package Value"
            value={formatMoneyMinor(billing.activeSnapshot?.totalMinor ?? 0)}
          />
          <TerminalFinanceTile
            label="Paid to Date"
            value={formatMoneyMinor(billing.paymentState.amountPaidMinor)}
            success={isPaid}
          />
          <TerminalFinanceTile
            label="Due Now"
            value={formatMoneyMinor(billing.paymentState.amountDueNowMinor)}
            alert={isDue}
          />
          <TerminalFinanceTile
            label="Outstanding"
            value={formatMoneyMinor(billing.paymentState.outstandingMinor)}
          />
        </div>

        {/* 3. Action Bar (Checkout Readiness) */}
        <div className={`relative overflow-hidden rounded-[16px] border p-6 sm:p-8 transition-shadow ${isDue
            ? "border-amber-500/40 shadow-[0_4px_24px_rgba(245,158,11,0.08)] bg-amber-500/5"
            : "border-[var(--portal-border)] shadow-sm bg-[var(--portal-card)]"
          }`}>
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isDue ? 'text-amber-600/90 dark:text-amber-500' : 'text-[var(--portal-muted)]'}`}>
                Current Next Step
              </p>
              <h2 className={`mt-2 text-2xl font-bold tracking-tight ${isDue ? 'text-amber-600 dark:text-amber-500' : 'text-[var(--portal-foreground)]'}`}>
                {readiness.label}
              </h2>
              <p className={`mt-1.5 text-sm font-medium ${isDue ? 'text-amber-600/80 dark:text-amber-500/80' : 'text-[var(--portal-muted)]'}`}>
                {readiness.detail}
              </p>

              {readiness.blockers.length > 0 && (
                <div className="mt-5 flex flex-col gap-2 border-l-2 border-amber-500 pl-4">
                  {readiness.blockers.map((blocker, i) => (
                    <p key={i} className="font-mono text-xs font-semibold text-amber-600/90 dark:text-amber-500/90">
                      <span className="mr-2">■</span>{blocker}
                    </p>
                  ))}
                </div>
              )}
            </div>

            <div className="flex shrink-0 flex-col items-start gap-3 sm:items-end">
              {billing.activeSnapshot && hero.showPayButton ? (
                <div className={!billing.actions.canPayNow ? "opacity-50 cursor-not-allowed grayscale" : ""}>
                  <BillingPayNowButton
                    billingSnapshotId={billing.activeSnapshot.id}
                    label={hero.ctaLabel}
                    disabled={!billing.actions.canPayNow}
                  />
                </div>
              ) : (
                <span className="inline-flex items-center justify-center rounded-xl border border-[var(--portal-border)] bg-[var(--portal-surface-soft)] px-6 py-3 text-[11px] font-bold uppercase tracking-widest text-[var(--portal-muted)]">
                  {hero.ctaLabel}
                </span>
              )}
              {billing.paymentState.latestCheckoutStatus && (
                <p className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--portal-muted)]">
                  Status: {billing.paymentState.latestCheckoutStatus}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 4. Line Items Ledger */}
        <div className="flex flex-col overflow-hidden rounded-[16px] border border-[var(--portal-border)] bg-[var(--portal-card)] shadow-sm">
          <div className="flex items-center justify-between border-b border-[var(--portal-border)] bg-[var(--portal-surface-soft)] px-6 py-5">
            <div>
              <h2 className="text-sm font-bold tracking-tight text-[var(--portal-foreground)]">Contracted Line Items</h2>
              <p className="mt-1 text-[11px] font-medium text-[var(--portal-muted)]">The active billing snapshot freezing the current commercial package.</p>
            </div>
          </div>

          <div className="flex flex-col">
            {billing.activeSnapshot && billing.activeSnapshot.lines.length > 0 ? (
              <>
                <div className="hidden md:grid grid-cols-12 gap-6 border-b border-[var(--portal-border)] bg-[var(--portal-surface)]/50 px-6 py-3">
                  <div className="col-span-5 text-[9px] font-bold uppercase tracking-widest text-[var(--portal-muted)]">Description & SKU</div>
                  <div className="col-span-2 text-right text-[9px] font-bold uppercase tracking-widest text-[var(--portal-muted)]">Qty / Model</div>
                  <div className="col-span-2 text-right text-[9px] font-bold uppercase tracking-widest text-[var(--portal-muted)]">Line Total</div>
                  <div className="col-span-3 text-right text-[9px] font-bold uppercase tracking-widest text-[var(--portal-muted)]">Payable Today</div>
                </div>

                <div className="flex flex-col divide-y divide-[var(--portal-border)]">
                  {billing.activeSnapshot.lines.map((line) => (
                    <div
                      key={`${line.itemCode}-${line.slug}`}
                      className="group flex flex-col md:grid md:grid-cols-12 md:items-center gap-4 md:gap-6 px-6 py-5 transition-colors hover:bg-[var(--portal-surface-soft)]"
                    >
                      <div className="col-span-12 md:col-span-5">
                        <p className="text-sm font-bold text-[var(--portal-foreground)]">{line.label}</p>
                        <p className="mt-1 font-mono text-[10px] text-[var(--portal-muted)] uppercase tracking-widest">
                          SKU: {line.itemCode}
                        </p>
                        {line.lineDiscountMinor > 0 && (
                          <p className="mt-2 inline-flex items-center rounded-[4px] bg-emerald-500/10 px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-emerald-600">
                            Discount {formatMoneyMinor(line.lineDiscountMinor)}
                          </p>
                        )}
                      </div>

                      <div className="col-span-6 md:col-span-2 flex justify-between md:justify-end md:flex-col md:text-right">
                        <span className="md:hidden text-[9px] font-bold uppercase tracking-widest text-[var(--portal-muted)]">Qty/Terms</span>
                        <p className="font-mono text-sm font-semibold tabular-nums text-[var(--portal-foreground)]">×{line.quantity}</p>
                        <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-[var(--portal-muted)]">
                          {line.billingModel === "ADVANCE" ? "Deposit" : "Full"}
                        </p>
                      </div>

                      <div className="col-span-6 md:col-span-2 flex justify-between md:justify-end">
                        <span className="md:hidden text-[9px] font-bold uppercase tracking-widest text-[var(--portal-muted)]">Line Total</span>
                        <p className="font-mono text-sm font-medium tabular-nums text-[var(--portal-muted)]">
                          {formatMoneyMinor(line.lineTotalMinor)}
                        </p>
                      </div>

                      <div className="col-span-12 md:col-span-3 flex justify-between md:justify-end md:flex-col md:text-right pt-3 md:pt-0 border-t border-[var(--portal-border)] md:border-0">
                        <span className="md:hidden text-[9px] font-bold uppercase tracking-widest text-[var(--portal-muted)]">Due Now</span>
                        <p className="font-mono text-sm font-bold tabular-nums text-[var(--portal-foreground)]">
                          {formatMoneyMinor(line.payableTodayMinor)}
                        </p>
                        {line.remainingAfterTodayMinor > 0 && (
                          <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-[var(--portal-muted)]">
                            Later: {formatMoneyMinor(line.remainingAfterTodayMinor)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center text-[var(--portal-muted)] bg-[var(--portal-surface)]">
                <svg className="mb-4 h-8 w-8 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--portal-foreground)]">Snapshot Unavailable</p>
                <p className="mt-2 text-xs font-medium">Line items will populate upon snapshot preparation.</p>
              </div>
            )}
          </div>
        </div>

        {/* 5. Diagnostic Data (Asymmetric 12-Column Bento Grid) */}
        {/* Fixed: This ensures the Identity Form has enough width so the "Save Phone" button never overflows */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">

          {/* Panel A: Contact / Identity (Col-span-5: Provides wide breathing room for the form) */}
          <div className="lg:col-span-5 rounded-[16px] border border-[var(--portal-border)] bg-[var(--portal-card)] p-6 shadow-sm overflow-hidden h-full">
            <div className="mb-6">
              <h3 className="text-sm font-bold tracking-tight text-[var(--portal-foreground)]">Billing Identity</h3>
              <p className="mt-1 text-[11px] font-medium text-[var(--portal-muted)]">Primary contact configuration for this node.</p>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[var(--portal-muted)]">Primary Email</p>
                <p className="mt-2 text-sm font-semibold text-[var(--portal-foreground)] truncate">
                  {billing.contacts[0]?.email ?? "Workspace owner default"}
                </p>
              </div>
              <div className="border-t border-[var(--portal-border)] pt-6">
                <ProjectBillingCheckoutIdentityForm
                  projectId={project.id}
                  currentPhone={billing.checkoutPhone}
                  billingEmail={billing.contacts[0]?.email ?? null}
                  canEdit={canEditCheckoutIdentity}
                />
              </div>
            </div>
          </div>

          {/* Panel B: System Health (Col-span-4) */}
          <div className="lg:col-span-4 rounded-[16px] border border-[var(--portal-border)] bg-[var(--portal-card)] p-6 shadow-sm h-full">
            <div className="mb-6">
              <h3 className="text-sm font-bold tracking-tight text-[var(--portal-foreground)]">Ledger Health</h3>
              <p className="mt-1 text-[11px] font-medium text-[var(--portal-muted)]">Diagnostic on billing sync status.</p>
            </div>

            <div className="space-y-5">
              <div className="flex flex-col gap-1.5">
                <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[var(--portal-muted)]">Status</p>
                <p className="text-sm font-semibold text-[var(--portal-foreground)]">{health.label}</p>
              </div>
              <div className="flex flex-col gap-1.5 border-t border-[var(--portal-border)] pt-5">
                <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[var(--portal-muted)]">Truth Anchor</p>
                <p className="text-sm font-semibold text-[var(--portal-foreground)]">
                  {billing.billingHealth.sourceOfTruth === "ERP" ? "ERP Finance Docs" : "Billing Snapshot"}
                </p>
              </div>
              <div className="flex flex-col gap-1.5 border-t border-[var(--portal-border)] pt-5">
                <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[var(--portal-muted)]">Last Sync</p>
                <p className="font-mono text-xs font-semibold text-[var(--portal-foreground)] tabular-nums">
                  {formatPortalDate(billing.billingHealth.lastSyncedAt)}
                </p>
              </div>

              {/* Fixed Diagnostic Warnings Layout */}
              {health.warnings.length > 0 && (
                <div className="rounded-[8px] border border-amber-500/30 bg-amber-500/5 p-4 mt-2">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-amber-600/90 dark:text-amber-500">Diagnostics</p>
                  <div className="mt-3 flex flex-col gap-2 text-xs font-medium text-amber-700/90 dark:text-amber-500/80">
                    {health.warnings.map((warning, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="shrink-0 mt-0.5 opacity-70">■</span>
                        <span className="leading-snug">{warning}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Panel C: Finance References (Col-span-3) */}
          <div className="lg:col-span-3 rounded-[16px] border border-[var(--portal-border)] bg-[var(--portal-card)] p-6 shadow-sm h-full">
            <div className="mb-6">
              <h3 className="text-sm font-bold tracking-tight text-[var(--portal-foreground)]">Tech Refs</h3>
              <p className="mt-1 text-[11px] font-medium text-[var(--portal-muted)]">Immutable system identifiers.</p>
            </div>

            <div className="space-y-6">
              {/* Fixed: Exact Grid Alignment for Key-Value Pairs */}
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[var(--portal-muted)] mb-3">Provider Link</p>
                <div className="grid grid-cols-[36px_1fr] gap-x-2 gap-y-1.5 font-mono text-xs font-medium text-[var(--portal-foreground)]">
                  <span className="text-[var(--portal-muted)]">ORD</span>
                  <span className="truncate" title={billing.paymentState.providerOrderId || "N/A"}>
                    {billing.paymentState.providerOrderId || "N/A"}
                  </span>
                </div>
              </div>

              <div className="border-t border-[var(--portal-border)] pt-5">
                <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[var(--portal-muted)] mb-3">ERP Chain</p>
                <div className="grid grid-cols-[36px_1fr] gap-x-2 gap-y-1.5 font-mono text-xs font-medium text-[var(--portal-foreground)]">
                  <span className="text-[var(--portal-muted)]">QUO</span>
                  <span className="truncate" title={billing.erpState?.quotationId || "N/A"}>
                    {billing.erpState?.quotationId || "N/A"}
                  </span>

                  <span className="text-[var(--portal-muted)]">SO</span>
                  <span className="truncate" title={billing.erpState?.salesOrderId || "N/A"}>
                    {billing.erpState?.salesOrderId || "N/A"}
                  </span>

                  <span className="text-[var(--portal-muted)]">INV</span>
                  <span className="truncate" title={billing.erpState?.invoiceId || "N/A"}>
                    {billing.erpState?.invoiceId || "N/A"}
                  </span>
                </div>
              </div>

              {billing.activeSnapshot && (
                <div className="border-t border-[var(--portal-border)] pt-5">
                  <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[var(--portal-muted)] mb-3">Applied Logic</p>
                  <div className="flex flex-col gap-2 items-start">
                    {billing.activeSnapshot.offerCodeApplied && (
                      <TerminalStatusPill label={`Offer: ${billing.activeSnapshot.offerCodeApplied}`} tone="indigo" />
                    )}
                    {billing.activeSnapshot.couponCodeApplied && (
                      <TerminalStatusPill label={`Coupon: ${billing.activeSnapshot.couponCodeApplied}`} tone="indigo" />
                    )}
                    {billing.activeSnapshot.referralCodeApplied && (
                      <TerminalStatusPill label={`Ref: ${billing.activeSnapshot.referralCodeApplied}`} tone="indigo" />
                    )}
                    {!billing.activeSnapshot.offerCodeApplied && !billing.activeSnapshot.couponCodeApplied && !billing.activeSnapshot.referralCodeApplied && (
                      <span className="text-xs font-medium text-[var(--portal-muted)]">Standard Pricing Matrix</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </ClientPortalShell>
  );
}