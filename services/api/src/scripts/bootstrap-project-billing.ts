import "dotenv/config";
import { prisma } from "../lib/prisma.js";
import {
  createProjectBillingSnapshot,
  updateProjectBillingConfig,
  updateProjectBillingSnapshotLinkage,
} from "../services/project-billing-runtime.js";

function readArg(flag: string): string | undefined {
  const index = process.argv.indexOf(flag);
  if (index < 0) {
    return undefined;
  }

  return process.argv[index + 1];
}

function readJsonArg<T>(flag: string): T | undefined {
  const rawValue = readArg(flag);
  if (!rawValue?.trim()) {
    return undefined;
  }

  return JSON.parse(rawValue) as T;
}

async function main() {
  const operatorEmail = readArg("--operator-email")?.trim().toLowerCase();
  const projectId = readArg("--project-id")?.trim();
  const projectSlug = readArg("--project-slug")?.trim();
  const billingMode = readArg("--billing-mode")?.trim() as
    | "CATALOG"
    | "NEGOTIATED"
    | "PROMO_ACTIVE"
    | "HYBRID"
    | undefined;
  const defaultPaymentMode = readArg("--payment-mode")?.trim() as
    | "DEPOSIT"
    | "FULL"
    | undefined;
  const defaultDepositPercentRaw = readArg("--default-deposit-percent");
  const erpCustomerId = readArg("--erp-customer-id")?.trim() ?? null;
  const notes = readArg("--notes")?.trim() ?? null;
  const approvalReason = readArg("--approval-reason")?.trim() ?? null;
  const couponCode = readArg("--coupon-code")?.trim();
  const referralCode = readArg("--referral-code")?.trim();
  const operatorAdjustmentMinorRaw = readArg("--operator-adjustment-minor");
  const erpQuotationId = readArg("--erp-quotation-id")?.trim() ?? null;
  const erpSalesOrderId = readArg("--erp-sales-order-id")?.trim() ?? null;
  const erpInvoiceId = readArg("--erp-invoice-id")?.trim() ?? null;
  const contacts = readJsonArg<Array<{ email: string; label?: string | null }>>(
    "--contacts-json",
  ) ?? [];
  const customLines = readJsonArg<
    Array<{
      slug?: string | null;
      itemCode: string;
      label: string;
      quantity: number;
      unitPriceMinor: number;
      kind?: "PACKAGE" | "ADDON" | "QUOTE_ONLY";
      billingModel?: "FULL" | "ADVANCE";
      checkoutMode?: "INSTANT" | "QUOTE_ONLY";
      defaultDepositPercent?: number | null;
    }>
  >("--lines-json");

  if (!operatorEmail || (!projectId && !projectSlug) || !customLines?.length) {
    throw new Error(
      "Usage: npm run billing:bootstrap-project -- --operator-email <email> (--project-id <id> | --project-slug <slug>) --lines-json '<json>' [--contacts-json '<json>'] [--billing-mode HYBRID] [--payment-mode DEPOSIT] [--default-deposit-percent 50] [--coupon-code NAYA10] [--operator-adjustment-minor 500000] [--erp-customer-id <id>] [--erp-quotation-id <id>] [--erp-sales-order-id <id>] [--erp-invoice-id <id>] [--approval-reason <text>] [--notes <text>]",
    );
  }

  const operator = await prisma.portalUser.findUnique({
    where: { email: operatorEmail },
  });

  if (!operator) {
    throw new Error(`Operator portal user not found for ${operatorEmail}`);
  }

  if (operator.role !== "PLATFORM_ADMIN" && operator.role !== "PLATFORM_OPERATOR") {
    throw new Error(`${operatorEmail} does not have operator access.`);
  }

  const project = projectId
    ? await prisma.project.findUnique({ where: { id: projectId } })
    : await prisma.project.findUnique({ where: { slug: projectSlug } });

  if (!project) {
    throw new Error("Target project not found.");
  }

  const config = await updateProjectBillingConfig({
    portalUserId: operator.id,
    projectId: project.id,
    billingMode: billingMode ?? "HYBRID",
    defaultPaymentMode: defaultPaymentMode ?? "DEPOSIT",
    defaultDepositPercent:
      defaultDepositPercentRaw !== undefined
        ? Number(defaultDepositPercentRaw)
        : 50,
    erpCustomerId,
    notes,
    contacts,
  });

  const snapshot = await createProjectBillingSnapshot({
    portalUserId: operator.id,
    projectId: project.id,
    sourceType: "PROJECT_PLAN",
    customLines,
    couponCode,
    referralCode,
    operatorAdjustmentMinor:
      operatorAdjustmentMinorRaw !== undefined
        ? Number(operatorAdjustmentMinorRaw)
        : undefined,
    paymentMode: defaultPaymentMode ?? "DEPOSIT",
    approvalReason,
  });

  const linkage =
    erpQuotationId || erpSalesOrderId || erpInvoiceId
      ? await updateProjectBillingSnapshotLinkage({
          portalUserId: operator.id,
          projectId: project.id,
          snapshotId: snapshot?.id ?? "",
          erpQuotationId,
          erpSalesOrderId,
          erpInvoiceId,
        })
      : null;

  console.log(
    JSON.stringify(
      {
        status: "ok",
        projectId: project.id,
        projectSlug: project.slug,
        config,
        snapshot,
        linkage,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : "Unknown billing bootstrap error.";
  console.error(message);
  process.exitCode = 1;
});
