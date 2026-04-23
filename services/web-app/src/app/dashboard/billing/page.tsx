import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ClientPortalShell } from "@/components/client-portal/client-portal-shell";
import { fetchPortalSessionForApp } from "@/lib/landing-portal";
import { buildPortfolioNav } from "@/lib/portal-nav";
import { ROUTES, signInRedirect } from "@/lib/routes";
import {
  fetchPortfolioBillingForApp,
  formatPortalDate,
} from "@/lib/landing-portal";

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

function statusTone(status: string): "success" | "warning" | "neutral" | "indigo" {
  if (status === "PAID") return "success";
  if (status === "READY_TO_PAY" || status === "PARTIALLY_PAID") return "warning";
  if (status === "DRAFT") return "indigo";
  return "neutral";
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
    <div className="flex items-center gap-1.5 rounded-[4px] border border-[var(--portal-border)] bg-[var(--portal-surface)] px-2 py-1 shadow-sm">
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
  detail,
  alert = false,
  success = false,
}: {
  label: string;
  value: string;
  detail: string;
  alert?: boolean;
  success?: boolean;
}) {
  return (
    <div className={`group flex flex-col justify-between rounded-[16px] border p-6 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] ${
      alert 
        ? "border-amber-500/30 bg-amber-500/5 hover:border-amber-500/60" 
        : success 
          ? "border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/40"
          : "border-[var(--portal-border)] bg-[var(--portal-card)] hover:border-[var(--portal-accent-border)]"
    }`}>
      <div className="flex items-start justify-between">
        <p className={`text-[10px] font-bold uppercase tracking-widest ${alert ? "text-amber-600/80" : success ? "text-emerald-600/80" : "text-[var(--portal-muted)]"}`}>
          {label}
        </p>
      </div>
      <div className="mt-6">
        <p className={`font-mono text-3xl font-semibold tracking-tight tabular-nums ${alert ? "text-amber-600 dark:text-amber-500" : success ? "text-emerald-600 dark:text-emerald-500" : "text-[var(--portal-foreground)]"}`}>
          {value}
        </p>
        <p className={`mt-2 text-xs font-medium ${alert ? "text-amber-600/70" : success ? "text-emerald-600/70" : "text-[var(--portal-muted)]"}`}>
          {detail}
        </p>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Main Server Component
// ----------------------------------------------------------------------

export default async function BillingPage() {
  const cookieHeader = serializeCookieHeader();
  const session = await fetchPortalSessionForApp(cookieHeader);

  if (!session) {
    redirect(signInRedirect(ROUTES.dashboard.billing));
  }

  try {
    const portfolio = await fetchPortfolioBillingForApp(cookieHeader);
    const navSections = buildPortfolioNav("billing");
    const hasDueAmount = portfolio.summary.totalDueNowMinor > 0;

    return (
      <ClientPortalShell
        user={session.portalUser}
        sections={navSections}
        pageTitle="Billing & Finance"
        pageDescription="Financial overview across all deployed workspaces."
        eyebrowLabel="Ledger"
      >
        <div className="mx-auto w-full max-w-[1400px] space-y-8 pb-24 pt-6 animate-in fade-in duration-500">
          
          {/* 1. Header Area - Structural Alignment */}
          <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between border-b border-[var(--portal-border)] pb-8">
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.6)] animate-pulse ${hasDueAmount ? "bg-amber-500" : "bg-indigo-500"}`} />
                <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${hasDueAmount ? "text-amber-500" : "text-indigo-500"}`}>
                  Financial Ledger
                </span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-[var(--portal-foreground)] sm:text-4xl">
                System Finance.
              </h1>
              <p className="text-sm font-medium text-[var(--portal-muted)] max-w-2xl leading-relaxed">
                Comprehensive overview of your financial obligations, cleared payments, and outstanding balances across all active network nodes.
              </p>
            </div>
          </header>

          {/* 2. Top Level KPI Strip */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            <TerminalFinanceTile
              label="Total Quoted"
              value={formatMoneyMinor(portfolio.summary.totalQuotedMinor)}
              detail={`${portfolio.summary.projectsWithBilling} workspace${portfolio.summary.projectsWithBilling !== 1 ? "s" : ""} active`}
            />
            <TerminalFinanceTile
              label="Paid to Date"
              value={formatMoneyMinor(portfolio.summary.totalPaidMinor)}
              detail="Successfully cleared payments"
              success={portfolio.summary.totalPaidMinor > 0}
            />
            <TerminalFinanceTile
              label="Due Now"
              value={formatMoneyMinor(portfolio.summary.totalDueNowMinor)}
              detail={hasDueAmount ? "Immediate attention required" : "All current invoices settled"}
              alert={hasDueAmount}
            />
            <TerminalFinanceTile
              label="Outstanding"
              value={formatMoneyMinor(portfolio.summary.totalOutstandingMinor)}
              detail="Remaining scheduled balance"
            />
          </div>

          {/* 3. The Strict Ledger Data Grid */}
          <div className="flex flex-col overflow-hidden rounded-[16px] border border-[var(--portal-border)] bg-[var(--portal-card)] shadow-sm">
            <div className="flex items-center justify-between border-b border-[var(--portal-border)] bg-[var(--portal-surface-soft)] px-6 py-5">
              <div>
                <h2 className="text-sm font-bold tracking-tight text-[var(--portal-foreground)]">Workspace Ledger</h2>
                <p className="mt-1 text-[11px] font-medium text-[var(--portal-muted)]">Granular breakdown of {portfolio.projects.length} initialized contracts.</p>
              </div>
            </div>

            {portfolio.projects.length > 0 ? (
              <div className="flex flex-col">
                {/* Strict Matrix Header */}
                <div className="hidden md:grid grid-cols-12 gap-6 border-b border-[var(--portal-border)] bg-[var(--portal-surface)]/50 px-6 py-3">
                  <div className="col-span-4 text-[9px] font-bold uppercase tracking-widest text-[var(--portal-muted)]">Identity & Status</div>
                  <div className="col-span-2 text-right text-[9px] font-bold uppercase tracking-widest text-[var(--portal-muted)]">Total Quoted</div>
                  <div className="col-span-2 text-right text-[9px] font-bold uppercase tracking-widest text-[var(--portal-muted)]">Paid</div>
                  <div className="col-span-2 text-right text-[9px] font-bold uppercase tracking-widest text-[var(--portal-muted)]">Due Now</div>
                  <div className="col-span-2 text-right text-[9px] font-bold uppercase tracking-widest text-[var(--portal-muted)]">Action</div>
                </div>

                {/* Matrix Rows */}
                <div className="flex flex-col divide-y divide-[var(--portal-border)]">
                  {portfolio.projects.map((project) => {
                    const billing = project.billing;
                    const hasSnapshot = billing.activeSnapshot !== null;
                    const totalMinor = billing.activeSnapshot?.totalMinor ?? 0;
                    const dueNow = billing.paymentState.amountDueNowMinor;
                    const paid = billing.paymentState.amountPaidMinor;
                    const erpStatus = billing.erpState?.syncStatus ?? null;
                    const isDue = dueNow > 0;

                    return (
                      <div
                        key={project.projectId}
                        className={`group flex flex-col md:grid md:grid-cols-12 md:items-center gap-4 md:gap-6 px-6 py-5 transition-colors ${isDue ? 'hover:bg-amber-500/5' : 'hover:bg-[var(--portal-surface-soft)]'}`}
                      >
                        {/* Col 1-4: Identity & Status */}
                        <div className="col-span-12 md:col-span-4 flex items-center gap-4">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-slate-800 text-sm font-bold text-white shadow-inner ring-1 ring-white/10 dark:bg-white dark:text-slate-900 transition-transform group-hover:scale-105">
                            {project.projectName[0]}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-3">
                              <Link
                                href={ROUTES.dashboard.project(project.projectId)}
                                className="truncate text-sm font-bold text-[var(--portal-foreground)] transition-colors group-hover:text-indigo-500 dark:group-hover:text-indigo-400"
                              >
                                {project.projectName}
                              </Link>
                            </div>
                            <div className="mt-1.5 flex flex-wrap items-center gap-2">
                              <TerminalStatusPill
                                label={billing.status.replace(/_/g, " ")}
                                tone={statusTone(billing.status)}
                              />
                              {erpStatus && (
                                <TerminalStatusPill
                                  label={`ERP ${erpStatus}`}
                                  tone={erpStatus === "SYNCED" ? "success" : "neutral"}
                                />
                              )}
                            </div>
                          </div>
                        </div>

                        {hasSnapshot ? (
                          <>
                            {/* Col 5-6: Total */}
                            <div className="col-span-6 md:col-span-2 flex justify-between md:justify-end">
                              <span className="md:hidden text-[10px] font-bold uppercase tracking-widest text-[var(--portal-muted)]">Total</span>
                              <p className="font-mono text-sm font-semibold tabular-nums text-[var(--portal-foreground)]">
                                {formatMoneyMinor(totalMinor)}
                              </p>
                            </div>

                            {/* Col 7-8: Paid */}
                            <div className="col-span-6 md:col-span-2 flex justify-between md:justify-end">
                              <span className="md:hidden text-[10px] font-bold uppercase tracking-widest text-[var(--portal-muted)]">Paid</span>
                              <p className="font-mono text-sm font-medium tabular-nums text-[var(--portal-muted)] group-hover:text-[var(--portal-foreground)] transition-colors">
                                {formatMoneyMinor(paid)}
                              </p>
                            </div>

                            {/* Col 9-10: Due Now (Highlighted if > 0) */}
                            <div className="col-span-6 md:col-span-2 flex justify-between md:justify-end">
                              <span className="md:hidden text-[10px] font-bold uppercase tracking-widest text-[var(--portal-muted)]">Due Now</span>
                              <p className={`font-mono text-sm font-bold tabular-nums ${isDue ? "text-amber-600 dark:text-amber-500" : "text-[var(--portal-foreground)]"}`}>
                                {formatMoneyMinor(dueNow)}
                              </p>
                            </div>

                            {/* Col 11-12: Action */}
                            <div className="col-span-6 md:col-span-2 flex justify-end">
                              <Link
                                href={ROUTES.dashboard.projectBilling(project.projectId)}
                                className="inline-flex items-center justify-center rounded-lg border border-[var(--portal-border)] bg-[var(--portal-surface)] px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[var(--portal-foreground)] shadow-sm transition-all hover:border-[var(--portal-accent-border)] hover:bg-[var(--portal-surface-soft)]"
                              >
                                View Details
                              </Link>
                            </div>
                          </>
                        ) : (
                          <div className="col-span-12 md:col-span-8 flex items-center md:justify-end">
                            <p className="text-xs font-medium text-[var(--portal-muted)] opacity-60">
                              Awaiting billing snapshot initialization
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center text-[var(--portal-muted)] bg-[var(--portal-surface)]">
                <svg className="mb-4 h-10 w-10 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
                </svg>
                <p className="text-[13px] font-bold text-[var(--portal-foreground)]">Ledger Empty</p>
                <p className="mt-1 text-xs">Billing data will populate once a commercial package is finalized.</p>
              </div>
            )}
          </div>
        </div>
      </ClientPortalShell>
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Financial telemetry could not be loaded.";

    return (
      <main className="client-portal-stage flex min-h-screen items-center justify-center p-10">
        <div className="max-w-lg w-full rounded-[24px] border p-10 text-center shadow-2xl" style={{ background: "var(--portal-card)", borderColor: "var(--portal-border)" }}>
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 ring-1 ring-rose-500/20">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-rose-500">System Interruption</p>
          <h1 className="mt-3 text-2xl font-black tracking-tight text-[var(--portal-foreground)]">Ledger Load Failure</h1>
          <p className="mt-4 text-sm font-medium leading-relaxed text-[var(--portal-muted)]">{message}</p>
          
          <div className="mt-10 flex flex-col gap-3 sm:flex-row justify-center">
            <Link href={ROUTES.dashboard.root} className="inline-flex items-center justify-center rounded-xl bg-[var(--portal-foreground)] px-6 py-3 text-xs font-bold uppercase tracking-widest text-[var(--portal-surface)] transition-transform hover:scale-105 shadow-md">
              Return to Core
            </Link>
          </div>
        </div>
      </main>
    );
  }
}
