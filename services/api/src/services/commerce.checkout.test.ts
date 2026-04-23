import { beforeEach, describe, expect, it, vi } from "vitest";

const prisma = vi.hoisted(() => ({
  cart: {
    findUnique: vi.fn(),
    update: vi.fn(),
    create: vi.fn(),
  },
  projectBillingContact: {
    upsert: vi.fn(),
  },
  checkoutSession: {
    create: vi.fn(),
  },
  customerLink: {
    upsert: vi.fn(),
  },
  erpSyncState: {
    upsert: vi.fn(),
  },
  billingSnapshot: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  billingDocumentLink: {
    upsert: vi.fn(),
  },
  $transaction: vi.fn(),
}));

const cashfreeGateway = vi.hoisted(() => ({
  createCashfreeOrder: vi.fn(),
  CashfreeGatewayError: class CashfreeGatewayError extends Error {
    statusCode: number;
    providerCode: string | null;
    providerMessage: string | null;

    constructor(input: {
      statusCode: number;
      providerCode?: string | null;
      providerMessage?: string | null;
    }) {
      super(input.providerMessage ?? `Cashfree request failed with status ${input.statusCode}.`);
      this.name = "CashfreeGatewayError";
      this.statusCode = input.statusCode;
      this.providerCode = input.providerCode ?? null;
      this.providerMessage = input.providerMessage ?? null;
    }
  },
}));

const erp = vi.hoisted(() => ({
  createDraftQuotation: vi.fn(),
  createQuoteRequestInErp: vi.fn(),
  createSalesOrder: vi.fn(),
  recordPaymentEntry: vi.fn(),
  upsertPortalCustomer: vi.fn(),
}));

vi.mock("../lib/prisma.js", () => ({
  prisma,
}));

vi.mock("./cashfree-gateway.js", () => cashfreeGateway);
vi.mock("./erp.js", () => erp);

import {
  createCheckoutSession,
  createCheckoutSessionFromBillingSnapshot,
} from "./commerce.js";

describe("checkout session creation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prisma.$transaction.mockImplementation(async (input: unknown) => {
      if (typeof input === "function") {
        return input({
          cart: {
            create: prisma.cart.create,
            update: prisma.cart.update,
          },
          billingSnapshot: {
            update: prisma.billingSnapshot.update,
          },
          checkoutSession: {
            create: prisma.checkoutSession.create,
          },
          customerLink: {
            upsert: prisma.customerLink.upsert,
          },
          erpSyncState: {
            upsert: prisma.erpSyncState.upsert,
          },
        });
      }

      return Promise.all(input as Promise<unknown>[]);
    });
  });

  it("falls back to a project owner email when no explicit billing contact exists", async () => {
    prisma.billingSnapshot.findUnique.mockResolvedValue({
      id: "snapshot_owner_fallback",
      projectId: "project_demo",
      status: "ACTIVE",
      cartId: "cart_owner_fallback",
      currency: "INR",
      subtotalMinor: 479700,
      discountMinor: 0,
      totalMinor: 479700,
      payableTodayMinor: 479700,
      remainingAfterTodayMinor: 0,
      couponCodeApplied: null,
      referralCodeApplied: null,
      offerCodeApplied: null,
      approvalReason: null,
      snapshotJson: {
        lines: [],
      },
      project: {
        id: "project_demo",
        name: "Project Demo",
        clientCompanyName: "Client Demo LLP",
        billingContacts: [],
        memberships: [
          {
            role: "VIEWER",
            portalUser: {
              email: "viewer@example.com",
            },
          },
          {
            role: "OWNER",
            portalUser: {
              email: "owner@example.com",
            },
          },
        ],
      },
      documentLink: null,
    });
    prisma.projectBillingContact.upsert.mockResolvedValue({
      id: "billing_contact_owner",
      email: "owner@example.com",
    });
    prisma.cart.findUnique.mockResolvedValue({
      id: "cart_owner_fallback",
      flowMode: "SELF_SERVE",
      currency: "INR",
      buyerEmail: "owner@example.com",
      buyerFullName: "Client Owner",
      buyerPhone: "+919999999999",
      buyerCompanyName: "Client Demo LLP",
      notes: null,
      payableTodayMinor: 479700,
      erpCustomerId: "ERP-CUST-1",
      erpQuotationId: "ERP-QUO-1",
      erpSalesOrderId: "ERP-SO-1",
      status: "CHECKOUT_PENDING",
      portalUserId: null,
      pricingSnapshot: null,
      items: [],
      quoteRequest: null,
      portalUser: null,
      checkoutSessions: [
        {
          id: "checkout_existing",
          status: "CREATED",
          provider: "CASHFREE",
          paymentSessionId: "ps_existing",
          providerOrderId: "naya_cart_demo_existing",
          hostedCheckoutUrl: null,
          amountMinor: 479700,
          currency: "INR",
          expiresAt: new Date("2099-03-31T12:00:00.000Z"),
          erpSalesOrderId: "ERP-SO-1",
          erpCustomerId: "ERP-CUST-1",
          cashfreeOrder: {
            environment: "PRODUCTION",
          },
        },
      ],
    });
    prisma.billingDocumentLink.upsert.mockResolvedValue({});

    const session = await createCheckoutSessionFromBillingSnapshot({
      billingSnapshotId: "snapshot_owner_fallback",
      returnUrl: "https://shasvata.com/app/dashboard/projects/project_demo/billing",
      cancelUrl: "https://shasvata.com/app/dashboard/projects/project_demo/billing",
    });

    expect(prisma.projectBillingContact.upsert).toHaveBeenCalledWith({
      where: {
        projectId_email: {
          projectId: "project_demo",
          email: "owner@example.com",
        },
      },
      create: {
        projectId: "project_demo",
        email: "owner@example.com",
        label: "Primary billing",
        isActive: true,
      },
      update: {
        isActive: true,
        label: "Primary billing",
      },
    });
    expect(session).toMatchObject({
      id: "checkout_existing",
      providerOrderId: "naya_cart_demo_existing",
      paymentSessionId: "ps_existing",
    });
  });

  it("reuses an existing active checkout session instead of creating a duplicate provider order", async () => {
    erp.upsertPortalCustomer.mockResolvedValue({
      customerId: "ERP-CUST-1",
      customerName: "Client Demo LLP",
      contactId: "ERP-CONTACT-1",
      portalUserId: null,
    });
    erp.createDraftQuotation.mockResolvedValue({
      quotationId: "ERP-QUO-1",
    });
    erp.createSalesOrder.mockResolvedValue({
      salesOrderId: "ERP-SO-1",
    });
    prisma.customerLink.upsert.mockResolvedValue({});
    prisma.erpSyncState.upsert.mockResolvedValue({});
    prisma.cart.update.mockResolvedValue({});
    prisma.checkoutSession.create.mockResolvedValue({
      id: "checkout_created_unexpectedly",
      status: "CREATED",
      provider: "CASHFREE",
      amountMinor: 479700,
      currency: "INR",
      paymentSessionId: "ps_created_unexpectedly",
      providerOrderId: "naya_cart_demo_new",
      hostedCheckoutUrl: null,
    });
    prisma.cart.findUnique.mockResolvedValue({
      id: "cart_demo",
      flowMode: "SELF_SERVE",
      currency: "INR",
      buyerEmail: "client@example.com",
      buyerFullName: "Client Demo",
      buyerPhone: "+919999999999",
      buyerCompanyName: "Client Demo LLP",
      notes: null,
      payableTodayMinor: 479700,
      erpCustomerId: "ERP-CUST-1",
      erpQuotationId: "ERP-QUO-1",
      erpSalesOrderId: "ERP-SO-1",
      status: "CHECKOUT_PENDING",
      portalUserId: null,
      pricingSnapshot: null,
      items: [
        {
          catalogSlug: "landing-page",
          quantity: 1,
          label: "Landing Page",
          itemCode: "NG-LP",
          kind: "PACKAGE",
          checkoutMode: "INSTANT",
          billingModel: "FULL",
          unitPriceMinor: 479700,
          lineSubtotalMinor: 479700,
          lineDiscountMinor: 0,
          lineTotalMinor: 479700,
          payableTodayMinor: 479700,
          remainingAfterTodayMinor: 0,
        },
      ],
      quoteRequest: null,
      portalUser: null,
      checkoutSessions: [
        {
          id: "checkout_existing",
          status: "CREATED",
          provider: "CASHFREE",
          paymentSessionId: "ps_existing",
          providerOrderId: "naya_cart_demo_existing",
          hostedCheckoutUrl: null,
          amountMinor: 479700,
          currency: "INR",
          expiresAt: new Date("2099-03-31T12:00:00.000Z"),
          erpSalesOrderId: "ERP-SO-1",
          erpCustomerId: "ERP-CUST-1",
          cashfreeOrder: {
            environment: "PRODUCTION",
          },
        },
      ],
    });
    cashfreeGateway.createCashfreeOrder.mockResolvedValue({
      environment: "PRODUCTION",
      providerOrderId: "naya_cart_demo_new",
      cfOrderId: "cf_order_demo_new",
      paymentSessionId: "ps_created_unexpectedly",
      hostedCheckoutUrl: null,
      rawResponse: {},
    });

    const session = await createCheckoutSession({
      cartId: "cart_demo",
      returnUrl: "https://shasvata.com/app/dashboard/projects/project_demo/billing",
      cancelUrl: "https://shasvata.com/app/dashboard/projects/project_demo/billing",
    });

    expect(session).toMatchObject({
      id: "checkout_existing",
      status: "CREATED",
      provider: "CASHFREE",
      environment: "PRODUCTION",
      paymentSessionId: "ps_existing",
      providerOrderId: "naya_cart_demo_existing",
      erp: {
        customerId: "ERP-CUST-1",
        quotationId: "ERP-QUO-1",
        salesOrderId: "ERP-SO-1",
      },
    });
    expect(cashfreeGateway.createCashfreeOrder).not.toHaveBeenCalled();
    expect(erp.upsertPortalCustomer).not.toHaveBeenCalled();
  });

  it("creates a unique provider order id for a fresh checkout session", async () => {
    prisma.cart.findUnique.mockResolvedValue({
      id: "cart_demo",
      flowMode: "SELF_SERVE",
      currency: "INR",
      buyerEmail: "client@example.com",
      buyerFullName: "Client Demo",
      buyerPhone: "+919999999999",
      buyerCompanyName: "Client Demo LLP",
      notes: null,
      payableTodayMinor: 479700,
      erpCustomerId: null,
      erpQuotationId: null,
      erpSalesOrderId: null,
      status: "CHECKOUT_READY",
      portalUserId: null,
      pricingSnapshot: {
        flowMode: "SELF_SERVE",
        requiresHumanReview: false,
        issues: [],
        currency: "INR",
        lines: [
          {
            slug: "landing-page",
            itemCode: "NG-LP",
            label: "Landing Page",
            kind: "PACKAGE",
            checkoutMode: "INSTANT",
            billingModel: "FULL",
            quantity: 1,
            unitPriceMinor: 479700,
            lineSubtotalMinor: 479700,
            lineDiscountMinor: 0,
            lineTotalMinor: 479700,
            payableTodayMinor: 479700,
            remainingAfterTodayMinor: 0,
          },
        ],
        subtotalMinor: 479700,
        discountMinor: 0,
        totalMinor: 479700,
        payableTodayMinor: 479700,
        remainingAfterTodayMinor: 0,
        appliedOffer: null,
      },
      items: [],
      quoteRequest: null,
      portalUser: null,
      checkoutSessions: [],
    });
    erp.upsertPortalCustomer.mockResolvedValue({
      customerId: "ERP-CUST-2",
      customerName: "Client Demo LLP",
      contactId: "ERP-CONTACT-2",
      portalUserId: null,
    });
    erp.createDraftQuotation.mockResolvedValue({
      quotationId: "ERP-QUO-2",
    });
    erp.createSalesOrder.mockResolvedValue({
      salesOrderId: "ERP-SO-2",
    });
    cashfreeGateway.createCashfreeOrder.mockResolvedValue({
      environment: "PRODUCTION",
      providerOrderId: "naya_cart_demo_fresh",
      cfOrderId: "cf_order_demo",
      paymentSessionId: "ps_fresh",
      hostedCheckoutUrl: null,
      rawResponse: {},
    });
    prisma.customerLink.upsert.mockResolvedValue({});
    prisma.erpSyncState.upsert.mockResolvedValue({});
    prisma.cart.update.mockResolvedValue({});
    prisma.checkoutSession.create.mockResolvedValue({
      id: "checkout_fresh",
      status: "CREATED",
      provider: "CASHFREE",
      amountMinor: 479700,
      currency: "INR",
      paymentSessionId: "ps_fresh",
      providerOrderId: "naya_cart_demo_fresh",
      hostedCheckoutUrl: null,
    });

    await createCheckoutSession({
      cartId: "cart_demo",
      returnUrl: "https://shasvata.com/app/dashboard/projects/project_demo/billing",
      cancelUrl: "https://shasvata.com/app/dashboard/projects/project_demo/billing",
    });

    expect(cashfreeGateway.createCashfreeOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        orderId: expect.stringMatching(/^naya_cart_demo_/),
      }),
    );
    expect(cashfreeGateway.createCashfreeOrder).not.toHaveBeenCalledWith(
      expect.objectContaining({
        orderId: "naya_cart_demo",
      }),
    );
  });

  it("reuses the existing checkout session when a billing snapshot is opened again", async () => {
    prisma.billingSnapshot.findUnique.mockResolvedValue({
      id: "snapshot_demo",
      status: "ACTIVE",
      cartId: "cart_demo",
      currency: "INR",
      subtotalMinor: 479700,
      discountMinor: 0,
      totalMinor: 479700,
      payableTodayMinor: 479700,
      remainingAfterTodayMinor: 0,
      couponCodeApplied: null,
      referralCodeApplied: null,
      offerCodeApplied: null,
      approvalReason: null,
      snapshotJson: {
        lines: [],
      },
      project: {
        name: "Project Demo",
        clientCompanyName: "Client Demo LLP",
        billingContacts: [
          {
            email: "client@example.com",
          },
        ],
      },
      documentLink: null,
    });
    prisma.cart.findUnique.mockResolvedValue({
      id: "cart_demo",
      flowMode: "SELF_SERVE",
      currency: "INR",
      buyerEmail: "client@example.com",
      buyerFullName: "Client Demo",
      buyerPhone: "+919999999999",
      buyerCompanyName: "Client Demo LLP",
      notes: null,
      payableTodayMinor: 479700,
      erpCustomerId: "ERP-CUST-1",
      erpQuotationId: "ERP-QUO-1",
      erpSalesOrderId: "ERP-SO-1",
      status: "CHECKOUT_PENDING",
      portalUserId: null,
      pricingSnapshot: null,
      items: [],
      quoteRequest: null,
      portalUser: null,
      checkoutSessions: [
        {
          id: "checkout_existing",
          status: "CREATED",
          provider: "CASHFREE",
          paymentSessionId: "ps_existing",
          providerOrderId: "naya_cart_demo_existing",
          hostedCheckoutUrl: null,
          amountMinor: 479700,
          currency: "INR",
          expiresAt: new Date("2099-03-31T12:00:00.000Z"),
          erpSalesOrderId: "ERP-SO-1",
          erpCustomerId: "ERP-CUST-1",
          cashfreeOrder: {
            environment: "PRODUCTION",
          },
        },
      ],
    });
    prisma.billingDocumentLink.upsert.mockResolvedValue({});

    const session = await createCheckoutSessionFromBillingSnapshot({
      billingSnapshotId: "snapshot_demo",
      returnUrl: "https://shasvata.com/app/dashboard/projects/project_demo/billing",
      cancelUrl: "https://shasvata.com/app/dashboard/projects/project_demo/billing",
    });

    expect(session).toMatchObject({
      id: "checkout_existing",
      providerOrderId: "naya_cart_demo_existing",
      paymentSessionId: "ps_existing",
    });
    expect(cashfreeGateway.createCashfreeOrder).not.toHaveBeenCalled();
    expect(prisma.billingDocumentLink.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: expect.objectContaining({
          checkoutSessionId: "checkout_existing",
          providerOrderId: "naya_cart_demo_existing",
          paymentSessionId: "ps_existing",
        }),
      }),
    );
  });

  it("uses the project owner phone when creating a checkout cart from a billing snapshot", async () => {
    prisma.billingSnapshot.findUnique.mockResolvedValue({
      id: "snapshot_phone_owner",
      projectId: "project_phone_owner",
      status: "ACTIVE",
      cartId: null,
      currency: "INR",
      subtotalMinor: 1799900,
      discountMinor: 0,
      totalMinor: 1799900,
      payableTodayMinor: 899950,
      remainingAfterTodayMinor: 899950,
      couponCodeApplied: null,
      referralCodeApplied: null,
      offerCodeApplied: null,
      approvalReason: null,
      snapshotJson: {
        lines: [],
      },
      project: {
        id: "project_phone_owner",
        name: "Topaz Towers",
        clientCompanyName: "Aakar Realties",
        billingContacts: [],
        memberships: [
          {
            role: "OWNER",
            portalUser: {
              email: "bipin@example.com",
              phone: "+919876543210",
              fullName: "Bipin",
            },
          },
        ],
      },
      documentLink: null,
    });
    prisma.projectBillingContact.upsert.mockResolvedValue({
      id: "billing_contact_phone_owner",
      email: "bipin@example.com",
    });
    prisma.cart.create.mockResolvedValue({
      id: "cart_phone_owner",
    });
    prisma.billingSnapshot.update.mockResolvedValue({});
    prisma.cart.findUnique.mockResolvedValue({
      id: "cart_phone_owner",
      flowMode: "SELF_SERVE",
      currency: "INR",
      buyerEmail: "bipin@example.com",
      buyerFullName: null,
      buyerPhone: "+919876543210",
      buyerCompanyName: "Aakar Realties",
      notes: null,
      payableTodayMinor: 899950,
      erpCustomerId: null,
      erpQuotationId: null,
      erpSalesOrderId: null,
      status: "CHECKOUT_READY",
      portalUserId: null,
      pricingSnapshot: {
        flowMode: "SELF_SERVE",
        requiresHumanReview: false,
        issues: [],
        currency: "INR",
        lines: [],
        subtotalMinor: 1799900,
        discountMinor: 0,
        totalMinor: 1799900,
        payableTodayMinor: 899950,
        remainingAfterTodayMinor: 899950,
        appliedOffer: null,
      },
      items: [],
      quoteRequest: null,
      portalUser: null,
      checkoutSessions: [],
    });
    erp.upsertPortalCustomer.mockResolvedValue({
      customerId: "ERP-CUST-3",
      customerName: "Bipin",
      contactId: "ERP-CONTACT-3",
      portalUserId: null,
    });
    erp.createDraftQuotation.mockResolvedValue({
      quotationId: "ERP-QUO-3",
    });
    erp.createSalesOrder.mockResolvedValue({
      salesOrderId: "ERP-SO-3",
    });
    cashfreeGateway.createCashfreeOrder.mockResolvedValue({
      environment: "PRODUCTION",
      providerOrderId: "naya_cart_phone_owner_fresh",
      cfOrderId: "cf_order_phone_owner",
      paymentSessionId: "ps_phone_owner",
      hostedCheckoutUrl: null,
      rawResponse: {},
    });
    prisma.customerLink.upsert.mockResolvedValue({});
    prisma.erpSyncState.upsert.mockResolvedValue({});
    prisma.cart.update.mockResolvedValue({});
    prisma.checkoutSession.create.mockResolvedValue({
      id: "checkout_phone_owner",
      status: "CREATED",
      provider: "CASHFREE",
      amountMinor: 899950,
      currency: "INR",
      paymentSessionId: "ps_phone_owner",
      providerOrderId: "naya_cart_phone_owner_fresh",
      hostedCheckoutUrl: null,
    });
    prisma.billingDocumentLink.upsert.mockResolvedValue({});

    await createCheckoutSessionFromBillingSnapshot({
      billingSnapshotId: "snapshot_phone_owner",
      returnUrl: "https://shasvata.com/app/dashboard/projects/project_phone_owner/billing",
      cancelUrl: "https://shasvata.com/app/dashboard/projects/project_phone_owner/billing",
    });

    expect(prisma.cart.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          buyerEmail: "bipin@example.com",
          buyerPhone: "919876543210",
        }),
      }),
    );
    expect(cashfreeGateway.createCashfreeOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        customer: expect.objectContaining({
          email: "bipin@example.com",
          phone: "919876543210",
        }),
      }),
    );
  });

  it("fails billing snapshot checkout when no real buyer phone can be resolved", async () => {
    prisma.billingSnapshot.findUnique.mockResolvedValue({
      id: "snapshot_missing_phone",
      projectId: "project_missing_phone",
      status: "ACTIVE",
      cartId: null,
      currency: "INR",
      subtotalMinor: 479700,
      discountMinor: 0,
      totalMinor: 479700,
      payableTodayMinor: 479700,
      remainingAfterTodayMinor: 0,
      couponCodeApplied: null,
      referralCodeApplied: null,
      offerCodeApplied: null,
      approvalReason: null,
      snapshotJson: {
        lines: [],
      },
      project: {
        id: "project_missing_phone",
        name: "Project Missing Phone",
        clientCompanyName: "Client Demo LLP",
        billingContacts: [],
        memberships: [
          {
            role: "OWNER",
            portalUser: {
              email: "owner@example.com",
              phone: null,
              fullName: "Owner Without Phone",
            },
          },
        ],
      },
      documentLink: null,
    });
    prisma.projectBillingContact.upsert.mockResolvedValue({
      id: "billing_contact_missing_phone",
      email: "owner@example.com",
    });

    await expect(
      createCheckoutSessionFromBillingSnapshot({
        billingSnapshotId: "snapshot_missing_phone",
        returnUrl: "https://shasvata.com/app/dashboard/projects/project_missing_phone/billing",
        cancelUrl: "https://shasvata.com/app/dashboard/projects/project_missing_phone/billing",
      }),
    ).rejects.toThrow("Billing phone is required before checkout.");

    expect(prisma.cart.create).not.toHaveBeenCalled();
    expect(cashfreeGateway.createCashfreeOrder).not.toHaveBeenCalled();
  });

  it("hydrates an existing billing cart with the configured checkout phone before creating cashfree checkout", async () => {
    prisma.billingSnapshot.findUnique.mockResolvedValue({
      id: "snapshot_existing_cart_phone",
      projectId: "project_existing_cart_phone",
      status: "ACTIVE",
      cartId: "cart_existing_phone",
      currency: "INR",
      subtotalMinor: 299900,
      discountMinor: 0,
      totalMinor: 299900,
      payableTodayMinor: 299900,
      remainingAfterTodayMinor: 0,
      couponCodeApplied: null,
      referralCodeApplied: null,
      offerCodeApplied: null,
      approvalReason: null,
      snapshotJson: {
        lines: [],
      },
      project: {
        id: "project_existing_cart_phone",
        name: "Wagholi Highstreet",
        clientCompanyName: "Vikriya Solutions LLP",
        billingConfig: {
          billingPhone: "+91 98765 43210",
        },
        billingContacts: [
          {
            email: "billing@example.com",
          },
        ],
        memberships: [
          {
            role: "OWNER",
            portalUser: {
              email: "owner@example.com",
              phone: null,
              fullName: "Bipin",
            },
          },
        ],
      },
      documentLink: null,
    });
    prisma.cart.findUnique
      .mockResolvedValueOnce({
        id: "cart_existing_phone",
        flowMode: "SELF_SERVE",
        currency: "INR",
        buyerEmail: "billing@example.com",
        buyerFullName: null,
        buyerPhone: null,
        buyerCompanyName: "Vikriya Solutions LLP",
        notes: null,
        payableTodayMinor: 299900,
        erpCustomerId: null,
        erpQuotationId: null,
        erpSalesOrderId: null,
        status: "CHECKOUT_PENDING",
        portalUserId: null,
        pricingSnapshot: null,
        items: [],
        quoteRequest: null,
        portalUser: null,
        checkoutSessions: [],
      })
      .mockResolvedValueOnce({
        id: "cart_existing_phone",
        flowMode: "SELF_SERVE",
        currency: "INR",
        buyerEmail: "billing@example.com",
        buyerFullName: "Bipin",
        buyerPhone: "919876543210",
        buyerCompanyName: "Vikriya Solutions LLP",
        notes: null,
        payableTodayMinor: 299900,
        erpCustomerId: null,
        erpQuotationId: null,
        erpSalesOrderId: null,
        status: "CHECKOUT_PENDING",
        portalUserId: null,
        pricingSnapshot: {
          flowMode: "SELF_SERVE",
          requiresHumanReview: false,
          issues: [],
          currency: "INR",
          lines: [],
          subtotalMinor: 299900,
          discountMinor: 0,
          totalMinor: 299900,
          payableTodayMinor: 299900,
          remainingAfterTodayMinor: 0,
          appliedOffer: null,
        },
        items: [],
        quoteRequest: null,
        portalUser: null,
        checkoutSessions: [],
      });
    prisma.cart.update.mockResolvedValue({});
    erp.upsertPortalCustomer.mockResolvedValue({
      customerId: "ERP-CUST-4",
      customerName: "Bipin",
      contactId: "ERP-CONTACT-4",
      portalUserId: null,
    });
    erp.createDraftQuotation.mockResolvedValue({
      quotationId: "ERP-QUO-4",
    });
    erp.createSalesOrder.mockResolvedValue({
      salesOrderId: "ERP-SO-4",
    });
    cashfreeGateway.createCashfreeOrder.mockResolvedValue({
      environment: "PRODUCTION",
      providerOrderId: "naya_cart_existing_phone_fresh",
      cfOrderId: "cf_order_existing_phone",
      paymentSessionId: "ps_existing_phone",
      hostedCheckoutUrl: null,
      rawResponse: {},
    });
    prisma.customerLink.upsert.mockResolvedValue({});
    prisma.erpSyncState.upsert.mockResolvedValue({});
    prisma.checkoutSession.create.mockResolvedValue({
      id: "checkout_existing_phone",
      status: "CREATED",
      provider: "CASHFREE",
      amountMinor: 299900,
      currency: "INR",
      paymentSessionId: "ps_existing_phone",
      providerOrderId: "naya_cart_existing_phone_fresh",
      hostedCheckoutUrl: null,
    });
    prisma.billingDocumentLink.upsert.mockResolvedValue({});

    await createCheckoutSessionFromBillingSnapshot({
      billingSnapshotId: "snapshot_existing_cart_phone",
      returnUrl: "https://shasvata.com/app/dashboard/projects/project_existing_cart_phone/billing",
      cancelUrl: "https://shasvata.com/app/dashboard/projects/project_existing_cart_phone/billing",
    });

    expect(prisma.cart.update).toHaveBeenCalledWith({
      where: {
        id: "cart_existing_phone",
      },
      data: {
        buyerPhone: "919876543210",
        buyerFullName: "Bipin",
      },
    });
    expect(cashfreeGateway.createCashfreeOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        customer: expect.objectContaining({
          phone: "919876543210",
        }),
      }),
    );
  });

  it("turns provider-disabled Cashfree failures into actionable checkout errors", async () => {
    prisma.billingSnapshot.findUnique.mockResolvedValue({
      id: "snapshot_cashfree_disabled",
      projectId: "project_cashfree_disabled",
      status: "ACTIVE",
      cartId: "cart_cashfree_disabled",
      currency: "INR",
      subtotalMinor: 299900,
      discountMinor: 0,
      totalMinor: 299900,
      payableTodayMinor: 299900,
      remainingAfterTodayMinor: 0,
      couponCodeApplied: null,
      referralCodeApplied: null,
      offerCodeApplied: null,
      approvalReason: null,
      snapshotJson: {
        lines: [],
      },
      project: {
        id: "project_cashfree_disabled",
        name: "Wagholi Highstreet",
        clientCompanyName: "Vikriya Solutions LLP",
        billingConfig: {
          billingPhone: "919876543210",
        },
        billingContacts: [
          {
            email: "growthnaya@gmail.com",
          },
        ],
        memberships: [
          {
            role: "OWNER",
            portalUser: {
              email: "growthnaya@gmail.com",
              phone: "919876543210",
              fullName: "Suyash",
            },
          },
        ],
      },
      documentLink: null,
    });
    prisma.cart.findUnique.mockResolvedValue({
      id: "cart_cashfree_disabled",
      flowMode: "SELF_SERVE",
      currency: "INR",
      buyerEmail: "growthnaya@gmail.com",
      buyerFullName: "Suyash",
      buyerPhone: "919876543210",
      buyerCompanyName: "Vikriya Solutions LLP",
      notes: null,
      payableTodayMinor: 299900,
      erpCustomerId: null,
      erpQuotationId: null,
      erpSalesOrderId: null,
      status: "CHECKOUT_PENDING",
      portalUserId: null,
      pricingSnapshot: {
        flowMode: "SELF_SERVE",
        requiresHumanReview: false,
        issues: [],
        currency: "INR",
        lines: [],
        subtotalMinor: 299900,
        discountMinor: 0,
        totalMinor: 299900,
        payableTodayMinor: 299900,
        remainingAfterTodayMinor: 0,
        appliedOffer: null,
      },
      items: [],
      quoteRequest: null,
      portalUser: null,
      checkoutSessions: [],
    });
    erp.upsertPortalCustomer.mockResolvedValue({
      customerId: "ERP-CUST-5",
      customerName: "Suyash",
      contactId: "ERP-CONTACT-5",
      portalUserId: null,
    });
    erp.createDraftQuotation.mockResolvedValue({
      quotationId: "ERP-QUO-5",
    });
    erp.createSalesOrder.mockResolvedValue({
      salesOrderId: "ERP-SO-5",
    });
    cashfreeGateway.createCashfreeOrder.mockRejectedValue(
      new cashfreeGateway.CashfreeGatewayError({
        statusCode: 400,
        providerCode: "request_failed",
        providerMessage:
          "transactions are not enabled for your payment gateway account",
      }),
    );

    await expect(
      createCheckoutSessionFromBillingSnapshot({
        billingSnapshotId: "snapshot_cashfree_disabled",
        returnUrl: "https://shasvata.com/app/dashboard/projects/project_cashfree_disabled/billing",
        cancelUrl: "https://shasvata.com/app/dashboard/projects/project_cashfree_disabled/billing",
      }),
    ).rejects.toMatchObject({
      statusCode: 503,
      message:
        "Online payment is temporarily unavailable because Cashfree transactions are not enabled on this billing account yet. Please contact Naya to complete payment manually.",
    });

    expect(erp.createDraftQuotation).not.toHaveBeenCalled();
    expect(erp.createSalesOrder).not.toHaveBeenCalled();
    expect(prisma.checkoutSession.create).not.toHaveBeenCalled();
  });
});
