import type { PortfolioBillingDetail, ProjectBillingDetail } from "./landing-portal";

type PortfolioBillingProjectRow = {
  projectId: string;
  projectName: string;
  status: ProjectBillingDetail["status"];
  totalMinor: number;
  dueNowMinor: number;
  paidMinor: number;
  outstandingMinor: number;
  canPayNow: boolean;
  hasSnapshot: boolean;
  paymentLabel: string;
  healthTone: ProjectBillingDetail["billingHealth"]["tone"];
  healthHeadline: string;
  healthDetail: string;
  blockerLabel: string | null;
  warningCount: number;
};

export type PortfolioBillingPresentation = {
  primaryPayProject: PortfolioBillingProjectRow | null;
  payableProjects: PortfolioBillingProjectRow[];
  attentionProjects: PortfolioBillingProjectRow[];
  settledProjects: PortfolioBillingProjectRow[];
  dormantProjects: PortfolioBillingProjectRow[];
  summaryLabel: string;
};

export type ProjectBillingHeroPresentation = {
  ctaLabel: string;
  helperText: string;
  showPayButton: boolean;
};

export type BillingHealthPresentation = {
  label: string;
  detail: string;
  tone: "success" | "warning" | "neutral";
  warnings: string[];
};

export type CheckoutReadinessPresentation = {
  label: string;
  detail: string;
  tone: "success" | "warning" | "neutral";
  blockers: string[];
  notes: string[];
};

function buildProjectRow(project: PortfolioBillingDetail["projects"][number]): PortfolioBillingProjectRow {
  const totalMinor = project.billing.activeSnapshot?.totalMinor ?? 0;
  const dueNowMinor = project.billing.paymentState.amountDueNowMinor;
  const paidMinor = project.billing.paymentState.amountPaidMinor;
  const outstandingMinor = project.billing.paymentState.outstandingMinor;
  const canPayNow = project.billing.actions.canPayNow && dueNowMinor > 0;

  const actionableBlocker =
    project.billing.checkoutReadiness.blockers.find(
      (blocker) => blocker.code !== "NOTHING_DUE",
    ) ?? null;

  return {
    projectId: project.projectId,
    projectName: project.projectName,
    status: project.billing.status,
    totalMinor,
    dueNowMinor,
    paidMinor,
    outstandingMinor,
    canPayNow,
    hasSnapshot: Boolean(project.billing.activeSnapshot),
    paymentLabel:
      paidMinor > 0 && outstandingMinor > 0
        ? "Pay remaining"
        : outstandingMinor > 0
          ? "Pay now"
          : "Settled",
    healthTone: project.billing.billingHealth.tone,
    healthHeadline: project.billing.billingHealth.headline,
    healthDetail: project.billing.billingHealth.detail,
    blockerLabel: actionableBlocker?.label ?? null,
    warningCount: project.billing.billingHealth.warnings.length,
  };
}

export function buildPortfolioBillingPresentation(
  portfolio: PortfolioBillingDetail,
): PortfolioBillingPresentation {
  const rows = portfolio.projects.map(buildProjectRow);

  const payableProjects = rows.filter((row) => row.canPayNow);
  const attentionProjects = rows.filter(
    (row) =>
      !row.canPayNow &&
      row.hasSnapshot &&
      (row.outstandingMinor > 0 || row.healthTone === "warning" || Boolean(row.blockerLabel)),
  );
  const settledProjects = rows.filter(
    (row) => row.hasSnapshot && !row.canPayNow && row.outstandingMinor <= 0,
  );
  const dormantProjects = rows.filter(
    (row) =>
      !payableProjects.includes(row) &&
      !attentionProjects.includes(row) &&
      !settledProjects.includes(row),
  );

  const primaryPayProject = payableProjects[0] ?? null;
  const payableLabel =
    payableProjects.length <= 0
      ? "No billing action required right now."
      : payableProjects.length === 1
        ? "One workspace is ready for payment."
        : `${payableProjects.length} workspaces are ready for payment.`;
  const summaryLabel =
    attentionProjects.length > 0 && payableProjects.length > 0
      ? `${payableLabel} ${attentionProjects.length} ${attentionProjects.length === 1 ? "workspace needs" : "workspaces need"} finance attention first.`
      : attentionProjects.length > 0
        ? `${attentionProjects.length} ${attentionProjects.length === 1 ? "workspace needs" : "workspaces need"} finance attention before payment can continue.`
        : payableLabel;

  return {
    primaryPayProject,
    payableProjects,
    attentionProjects,
    settledProjects,
    dormantProjects,
    summaryLabel,
  };
}

export function buildProjectBillingHeroPresentation(
  billing: ProjectBillingDetail,
): ProjectBillingHeroPresentation {
  if (!billing.activeSnapshot) {
    return {
      ctaLabel: "Awaiting billing snapshot",
      helperText:
        "A billing snapshot appears here once Naya finalizes the commercial package for this workspace.",
      showPayButton: false,
    };
  }

  if (billing.status === "PAID") {
    return {
      ctaLabel: "Payment settled",
      helperText:
        billing.billingHealth.detail,
      showPayButton: false,
    };
  }

  if (billing.checkoutReadiness.blockers.some((blocker) => blocker.code === "MISSING_CHECKOUT_PHONE")) {
    return {
      ctaLabel: "Add mobile number for checkout",
      helperText: billing.checkoutReadiness.blockers[0]?.label ?? billing.billingHealth.detail,
      showPayButton: true,
    };
  }

  return {
    ctaLabel:
      billing.paymentState.amountPaidMinor > 0 ? "Pay remaining balance" : "Pay now",
    helperText: billing.billingHealth.detail,
    showPayButton: billing.actions.canPayNow && billing.paymentState.amountDueNowMinor > 0,
  };
}

export function buildBillingHealthPresentation(
  billing: ProjectBillingDetail,
): BillingHealthPresentation {
  return {
    label: billing.billingHealth.headline,
    detail: billing.billingHealth.detail,
    tone: billing.billingHealth.tone,
    warnings: billing.billingHealth.warnings,
  };
}

export function buildCheckoutReadinessPresentation(
  billing: ProjectBillingDetail,
): CheckoutReadinessPresentation {
  if (billing.checkoutReadiness.ready) {
    return {
      label: "Checkout ready",
      detail:
        billing.checkoutReadiness.notes[0] ??
        "All key billing details are in place for payment.",
      tone: "success",
      blockers: [],
      notes: billing.checkoutReadiness.notes,
    };
  }

  if (billing.checkoutReadiness.blockers.length > 0) {
    return {
      label: "Action needed before payment",
      detail: billing.checkoutReadiness.blockers[0]?.label ?? "Billing needs attention.",
      tone: "warning",
      blockers: billing.checkoutReadiness.blockers.map((blocker) => blocker.label),
      notes: billing.checkoutReadiness.notes,
    };
  }

  return {
    label: "Billing review in progress",
    detail: billing.checkoutReadiness.notes[0] ?? "Billing is still being prepared.",
    tone: "neutral",
    blockers: [],
    notes: billing.checkoutReadiness.notes,
  };
}
