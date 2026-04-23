type PortalCustomerInput = {
  email: string;
  fullName?: string | null;
  companyName?: string | null;
  phone?: string | null;
};

type ErpQuotationInput = {
  customerId: string;
  customerName: string;
  currency: string;
  lineItems: Array<{
    itemCode: string;
    itemName: string;
    quantity: number;
    rate: number;
  }>;
  notes?: string | null;
};

type ErpOrderInput = {
  quotationId: string;
  customerId: string;
  expiresAt?: string;
};

type ErpPaymentInput = {
  salesOrderId: string;
  customerId: string;
  amountMajor: number;
  currency: string;
  referenceId: string;
  note?: string;
};

type ErpQuoteRequestInput = {
  buyer: PortalCustomerInput;
  brief?: Record<string, unknown> | null;
  notes?: string | null;
};

type ErpPortalCustomerResult = {
  customerId: string;
  contactId: string;
  portalUserId?: string;
  customerName: string;
};

type ErpQuotationResult = {
  quotationId: string;
};

type ErpSalesOrderResult = {
  salesOrderId: string;
};

type ErpPaymentResult = {
  paymentEntryId: string;
};

type ErpQuoteRequestResult = {
  leadId: string;
  opportunityId: string;
  quotationId: string;
};

function getErpMode(): "mock" | "live" {
  return process.env["ERP_SYNC_MODE"] === "live" ? "live" : "mock";
}

function getErpHeaders(): Record<string, string> {
  const apiKey = process.env["ERP_API_KEY"];
  const apiSecret = process.env["ERP_API_SECRET"];

  if (!apiKey || !apiSecret) {
    throw new Error("ERP API credentials are missing.");
  }

  return {
    "Content-Type": "application/json",
    Authorization: `token ${apiKey}:${apiSecret}`,
  };
}

async function postErpResource<T>(doctype: string, payload: Record<string, unknown>): Promise<T> {
  const baseUrl = process.env["ERP_BASE_URL"];
  if (!baseUrl) {
    throw new Error("ERP_BASE_URL is missing.");
  }

  const response = await fetch(`${baseUrl}/api/resource/${encodeURIComponent(doctype)}`, {
    method: "POST",
    headers: getErpHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`ERP resource create failed for ${doctype}: ${response.status}`);
  }

  const json = (await response.json()) as { data?: T };
  if (!json.data) {
    throw new Error(`ERP resource create returned no data for ${doctype}.`);
  }

  return json.data;
}

export async function upsertPortalCustomer(input: PortalCustomerInput): Promise<ErpPortalCustomerResult> {
  if (getErpMode() === "mock") {
    const customerName = input.companyName?.trim() || input.fullName?.trim() || input.email;
    return {
      customerId: `ERP-CUST-${input.email.replace(/[^a-z0-9]/gi, "").toUpperCase()}`,
      contactId: `ERP-CONTACT-${Date.now()}`,
      portalUserId: `ERP-USER-${Date.now()}`,
      customerName,
    };
  }

  const customerName = input.companyName?.trim() || input.fullName?.trim() || input.email;
  const customer = await postErpResource<{ name: string }>("Customer", {
    customer_name: customerName,
    customer_type: "Company",
    territory: "India",
  });
  const contact = await postErpResource<{ name: string }>("Contact", {
    first_name: input.fullName?.trim() || customerName,
    email_ids: [{ email_id: input.email, is_primary: 1 }],
    phone_nos: input.phone ? [{ phone: input.phone, is_primary_mobile_no: 1 }] : [],
    links: [{ link_doctype: "Customer", link_name: customer.name }],
  });

  return {
    customerId: customer.name,
    contactId: contact.name,
    customerName,
  };
}

export async function createDraftQuotation(input: ErpQuotationInput): Promise<ErpQuotationResult> {
  if (getErpMode() === "mock") {
    return { quotationId: `ERP-QUO-${Date.now()}` };
  }

  const quotation = await postErpResource<{ name: string }>("Quotation", {
    party_name: input.customerId,
    customer_name: input.customerName,
    company: process.env["ERP_COMPANY"] ?? "Shasvata Private Limited",
    currency: input.currency,
    items: input.lineItems.map((item) => ({
      item_code: item.itemCode,
      item_name: item.itemName,
      qty: item.quantity,
      rate: item.rate,
    })),
    remarks: input.notes ?? undefined,
  });

  return { quotationId: quotation.name };
}

export async function createSalesOrder(input: ErpOrderInput): Promise<ErpSalesOrderResult> {
  if (getErpMode() === "mock") {
    return { salesOrderId: `ERP-SO-${Date.now()}` };
  }

  const salesOrder = await postErpResource<{ name: string }>("Sales Order", {
    customer: input.customerId,
    quotation: input.quotationId,
    delivery_date: input.expiresAt ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    company: process.env["ERP_COMPANY"] ?? "Shasvata Private Limited",
  });

  return { salesOrderId: salesOrder.name };
}

export async function recordPaymentEntry(input: ErpPaymentInput): Promise<ErpPaymentResult> {
  if (getErpMode() === "mock") {
    return { paymentEntryId: `ERP-PAY-${Date.now()}` };
  }

  const paymentEntry = await postErpResource<{ name: string }>("Payment Entry", {
    payment_type: "Receive",
    party_type: "Customer",
    party: input.customerId,
    paid_amount: input.amountMajor,
    received_amount: input.amountMajor,
    reference_no: input.referenceId,
    reference_date: new Date().toISOString().slice(0, 10),
    company: process.env["ERP_COMPANY"] ?? "Shasvata Private Limited",
    references: [
      {
        reference_doctype: "Sales Order",
        reference_name: input.salesOrderId,
        allocated_amount: input.amountMajor,
      },
    ],
    remarks: input.note ?? undefined,
  });

  return { paymentEntryId: paymentEntry.name };
}

export async function createQuoteRequestInErp(
  input: ErpQuoteRequestInput,
): Promise<ErpQuoteRequestResult> {
  if (getErpMode() === "mock") {
    return {
      leadId: `ERP-LEAD-${Date.now()}`,
      opportunityId: `ERP-OPP-${Date.now()}`,
      quotationId: `ERP-QUO-${Date.now()}`,
    };
  }

  const lead = await postErpResource<{ name: string }>("Lead", {
    lead_name: input.buyer.fullName ?? input.buyer.companyName ?? input.buyer.email,
    email_id: input.buyer.email,
    phone: input.buyer.phone ?? undefined,
    company_name: input.buyer.companyName ?? undefined,
    notes: input.notes ?? undefined,
  });

  const quotation = await postErpResource<{ name: string }>("Quotation", {
    party_name: input.buyer.companyName ?? input.buyer.email,
    order_type: "Sales",
    remarks: JSON.stringify(input.brief ?? {}),
  });

  return {
    leadId: lead.name,
    opportunityId: `ERP-OPP-${lead.name}`,
    quotationId: quotation.name,
  };
}
