import type { BillingDocumentLinkRecord, BillingErpReadState } from "./project-billing-types.js";

function canReadErp(): boolean {
  return (
    process.env["ERP_SYNC_MODE"] === "live" &&
    Boolean(process.env["ERP_BASE_URL"]) &&
    Boolean(process.env["ERP_API_KEY"]) &&
    Boolean(process.env["ERP_API_SECRET"])
  );
}

function getErpHeaders(): Record<string, string> {
  const apiKey = process.env["ERP_API_KEY"];
  const apiSecret = process.env["ERP_API_SECRET"];

  if (!apiKey || !apiSecret) {
    throw new Error("ERP API credentials are missing.");
  }

  return {
    Authorization: `token ${apiKey}:${apiSecret}`,
    "Content-Type": "application/json",
  };
}

async function getErpResource<T>(
  doctype: string,
  name: string,
): Promise<T | null> {
  const baseUrl = process.env["ERP_BASE_URL"];
  if (!baseUrl) {
    return null;
  }

  const response = await fetch(
    `${baseUrl}/api/resource/${encodeURIComponent(doctype)}/${encodeURIComponent(name)}`,
    {
      headers: getErpHeaders(),
    },
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`ERP read failed for ${doctype} ${name}: ${response.status}`);
  }

  const payload = (await response.json()) as { data?: T };
  return payload.data ?? null;
}

function toMinorAmount(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  const normalized = Number(value);
  if (!Number.isFinite(normalized)) {
    return null;
  }

  return Math.round(normalized * 100);
}

export async function readErpBillingState(input: {
  erpCustomerId: string | null;
  documentLink: BillingDocumentLinkRecord | null;
}): Promise<BillingErpReadState | null> {
  const quotationId = input.documentLink?.erpQuotationId ?? null;
  const salesOrderId = input.documentLink?.erpSalesOrderId ?? null;
  const invoiceId = input.documentLink?.erpInvoiceId ?? null;
  const paymentEntryIds = input.documentLink?.erpPaymentEntryIds ?? [];
  const hasAnyErpPointer =
    Boolean(input.erpCustomerId) ||
    Boolean(quotationId) ||
    Boolean(salesOrderId) ||
    Boolean(invoiceId) ||
    paymentEntryIds.length > 0;

  if (!hasAnyErpPointer) {
    return null;
  }

  if (!canReadErp()) {
    return {
      erpCustomerId: input.erpCustomerId,
      quotationId,
      salesOrderId,
      invoiceId,
      paymentEntryIds,
      latestInvoiceStatus: null,
      latestInvoiceOutstandingMinor: null,
      syncStatus:
        quotationId || salesOrderId || invoiceId || paymentEntryIds.length > 0
          ? "PARTIAL"
          : "MISSING",
    };
  }

  try {
    const invoice =
      invoiceId
        ? await getErpResource<{
            status?: string;
            outstanding_amount?: number | string | null;
            docstatus?: number;
          }>("Sales Invoice", invoiceId)
        : null;

    return {
      erpCustomerId: input.erpCustomerId,
      quotationId,
      salesOrderId,
      invoiceId,
      paymentEntryIds,
      latestInvoiceStatus: invoice?.status ?? null,
      latestInvoiceOutstandingMinor: toMinorAmount(invoice?.outstanding_amount),
      syncStatus: "SYNCED",
    };
  } catch (error) {
    console.error("[erp-billing-adapter] Failed to read ERP billing state:", error);

    return {
      erpCustomerId: input.erpCustomerId,
      quotationId,
      salesOrderId,
      invoiceId,
      paymentEntryIds,
      latestInvoiceStatus: null,
      latestInvoiceOutstandingMinor: null,
      syncStatus: "FAILED",
    };
  }
}
