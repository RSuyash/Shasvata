import type {
  AccessibleProject,
  PortalSessionResponse,
  PortalUserSummary,
  ProjectAccessSettings,
  ProjectBillingDetail,
  ProjectDetail,
  ProjectInvite,
  ProjectLead,
  ProjectLeadDeletionTombstone,
  ProjectMember,
  ProjectOnboardingSession,
  ProjectOnboardingSubmitResult,
  ProjectNotificationRecipient,
  ProjectSite,
  ProjectDomain,
  ProjectSyncTarget,
} from "./landing-portal";
import type { CheckoutSessionResponse } from "./commerce";

export const LOCAL_PORTAL_WORKBENCH_PERSONA_COOKIE = "ng_local_workbench_persona";
export const LOCAL_PORTAL_WORKBENCH_SIGNED_OUT_COOKIE = "ng_local_workbench_signed_out";

export type LocalWorkbenchPersona = "owner" | "viewer" | "operator";

type ProjectRecord = {
  id: string;
  slug: string;
  name: string;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  publicLeadKey: string | null;
  primaryDomain: string | null;
  clientCompanyName: string | null;
  description: string | null;
  notes: string | null;
  goLiveAt: string | null;
  previewUrl: string | null;
  liveUrl: string | null;
  sites: ProjectSite[];
  domains: ProjectDomain[];
  syncTargets: ProjectSyncTarget[];
  members: ProjectMember[];
  leadNotificationRecipients: ProjectNotificationRecipient[];
  billing: ProjectBillingDetail;
  activeLeads: ProjectLead[];
  hiddenLeads: ProjectLead[];
  tombstones: ProjectLeadDeletionTombstone[];
  invites: ProjectInvite[];
  accessibleBy: LocalWorkbenchPersona[];
};

type OnboardingRecord = {
  id: string;
  cartId: string;
  projectId: string | null;
  routeProjectId: string;
  packageLabel: string;
  packageSlug: string;
  selectedAddons: string[];
  buyer: {
    email: string;
    fullName: string;
    companyName: string;
    phone: string;
  };
  intake: Record<string, unknown>;
  lastCompletedStep: string | null;
  submittedAt: string | null;
  createdAt: string;
  updatedAt: string;
  summary: {
    currency: string;
    totalMinor: number;
    payableTodayMinor: number;
    remainingAfterTodayMinor: number;
  };
};

type WorkbenchMutationNotice = {
  kind: "SIMULATED";
  message: string;
};

const personaUsers: Record<LocalWorkbenchPersona, PortalUserSummary> = {
  owner: {
    id: "local-owner-user",
    email: "owner@topaz-towers.in",
    fullName: "Bipin Client Owner",
    role: "CLIENT",
    companyName: "Topaz Towers",
  },
  viewer: {
    id: "local-viewer-user",
    email: "viewer@topaz-towers.in",
    fullName: "Topaz Viewer",
    role: "CLIENT",
    companyName: "Topaz Towers",
  },
  operator: {
    id: "local-operator-user",
    email: "automation@shasvata.com",
    fullName: "Naya Operator",
    role: "PLATFORM_OPERATOR",
    companyName: "Shasvata",
  },
};

const workbenchProjectIds = {
  topaz: "cmnhqmbbu0000q6u9ms9l84zi",
  wagholi: "cmnas1dle0000o75tcdz2y2gy",
  serefy: "cmnwa9kup0000o5if72lf6ufe",
  omkar: "ri82ho5xeaqdx4f3dek84h09",
} as const;

const workbenchProjects: ProjectRecord[] = [
  {
    id: workbenchProjectIds.topaz,
    slug: "topaz-towers",
    name: "Topaz Towers",
    status: "ACTIVE",
    publicLeadKey: "lead_key_topaz_towers",
    primaryDomain: "topaz-towers.in",
    clientCompanyName: "Aakar Realties",
    description: "A premium residential launch workspace for Topaz Towers.",
    notes: "Keep billing, lead quality, and tracking proof visible to the client team.",
    goLiveAt: "2026-04-15T07:30:00.000Z",
    previewUrl: null,
    liveUrl: "https://topaz-towers.in",
    sites: [
      {
        id: "site-topaz-main",
        projectId: workbenchProjectIds.topaz,
        slug: "topaz-main",
        templateKey: "builder-premium",
        themeKey: "topaz",
        sourceProvider: "GIT_REPOSITORY",
        repoUrl: "https://github.com/RSuyash/aakar-realities",
        repoBranch: "production",
        repoRef: "refs/heads/production",
        deployedCommit: "2730d0768c9396f3d601314c0d34f8d2b2e2a010",
        runtimeProfile: "ISOLATED_APP",
        operatorNotes: "Shared thank-you route and inline map are live.",
        ga4MeasurementId: "G-TOPAZDEMO1",
        googleAdsTagId: "AW-18098571219",
        googleAdsConversionMode: "GA4_IMPORTED",
        googleAdsLeadConversionLabel: null,
        gtmContainerId: "GTM-TOPAZ01",
        metaPixelId: "123456789012345",
        trackingNotes: "Shared /thank-you route is the canonical conversion page for Topaz.",
        publishStatus: "PUBLISHED",
        lastPublishedAt: "2026-04-15T07:35:00.000Z",
        previewHost: null,
        latestPreviewPath: null,
      },
    ],
    domains: [
      {
        id: "domain-topaz-root",
        projectId: workbenchProjectIds.topaz,
        siteId: "site-topaz-main",
        host: "topaz-towers.in",
        status: "ACTIVE",
        isPrimary: true,
        dnsTarget: "93.127.199.24",
        verifiedAt: "2026-04-15T07:10:00.000Z",
      },
      {
        id: "domain-topaz-www",
        projectId: workbenchProjectIds.topaz,
        siteId: "site-topaz-main",
        host: "www.topaz-towers.in",
        status: "ACTIVE",
        isPrimary: false,
        dnsTarget: "93.127.199.24",
        verifiedAt: "2026-04-15T07:11:00.000Z",
      },
    ],
    syncTargets: [
      {
        id: "sync-topaz-sheet",
        projectId: workbenchProjectIds.topaz,
        kind: "GOOGLE_SHEETS",
        status: "ACTIVE",
        label: "Topaz Leads",
        config: {
          spreadsheetId: "sheet_topaz_demo",
          sheetName: "Leads",
        },
        latestDeliveryAttempt: {
          id: "attempt-topaz-sheet-1",
          projectLeadId: "lead-topaz-2",
          projectId: workbenchProjectIds.topaz,
          targetId: "sync-topaz-sheet",
          kind: "GOOGLE_SHEETS",
          status: "SYNCED",
          responseCode: 200,
          responseBody: "Appended",
          errorMessage: null,
          metadata: null,
          attemptedAt: "2026-04-17T15:45:05.000Z",
          deliveredAt: "2026-04-17T15:45:05.000Z",
          createdAt: "2026-04-17T15:45:05.000Z",
          updatedAt: "2026-04-17T15:45:05.000Z",
        },
      },
      {
        id: "sync-topaz-mdoc",
        projectId: workbenchProjectIds.topaz,
        kind: "MDOC_PUSH",
        status: "ACTIVE",
        label: "Topaz MDOC",
        config: {
          endpoint: "https://aakar.maksoftbox.com//MDocBoxAPI/MdocAddEnquiryORTeleCalling/",
          apiKey: "configured-in-prod",
          dataFrom: "E",
          source: "Digitals",
          fallbackSourceDetail: "Website",
        },
        latestDeliveryAttempt: {
          id: "attempt-topaz-mdoc-1",
          projectLeadId: "lead-topaz-2",
          projectId: workbenchProjectIds.topaz,
          targetId: "sync-topaz-mdoc",
          kind: "MDOC_PUSH",
          status: "SYNCED",
          responseCode: 200,
          responseBody: "{\"status\":\"success\",\"id\":\"101\"}",
          errorMessage: null,
          metadata: {
            sourceDetail: "Google Ad",
            mappingWarnings: [],
          },
          attemptedAt: "2026-04-17T15:45:07.000Z",
          deliveredAt: "2026-04-17T15:45:07.000Z",
          createdAt: "2026-04-17T15:45:07.000Z",
          updatedAt: "2026-04-17T15:45:07.000Z",
        },
      },
    ],
    members: [
      {
        portalUserId: "local-owner-user",
        email: "owner@topaz-towers.in",
        fullName: "Bipin Client Owner",
        role: "OWNER",
        status: "ACTIVE",
      },
      {
        portalUserId: "local-viewer-user",
        email: "viewer@topaz-towers.in",
        fullName: "Topaz Viewer",
        role: "VIEWER",
        status: "ACTIVE",
      },
      {
        portalUserId: "local-support-user",
        email: "growthnaya@gmail.com",
        fullName: "Shasvata",
        role: "OWNER",
        status: "ACTIVE",
      },
    ],
    leadNotificationRecipients: [
      {
        id: "recipient-topaz-owner",
        projectId: workbenchProjectIds.topaz,
        email: "bipin@topaz-towers.in",
        label: "Client owner",
        createdAt: "2026-04-10T09:00:00.000Z",
        updatedAt: "2026-04-10T09:00:00.000Z",
      },
    ],
    billing: {
      projectId: workbenchProjectIds.topaz,
      projectName: "Topaz Towers",
      currency: "INR",
      checkoutPhone: "+91 9922888895",
      status: "READY_TO_PAY",
      activeSnapshot: {
        id: "snapshot-topaz-ready",
        sourceType: "PROJECT_PLAN",
        status: "ACTIVE",
        currency: "INR",
        subtotalMinor: 299900,
        discountMinor: 0,
        totalMinor: 299900,
        payableTodayMinor: 299900,
        remainingAfterTodayMinor: 0,
        offerCodeApplied: null,
        couponCodeApplied: null,
        referralCodeApplied: null,
        operatorAdjustmentMinor: 0,
        validUntil: "2026-04-30T18:30:00.000Z",
        lines: [
          {
            slug: "landing-page-starter",
            itemCode: "NG-LP-STARTER",
            label: "Landing Page Starter",
            quantity: 1,
            kind: "PACKAGE",
            billingModel: "FULL",
            checkoutMode: "INSTANT",
            unitPriceMinor: 299900,
            lineSubtotalMinor: 299900,
            lineDiscountMinor: 0,
            lineTotalMinor: 299900,
            payableTodayMinor: 299900,
            remainingAfterTodayMinor: 0,
          },
        ],
      },
      paymentState: {
        canPayNow: true,
        latestCheckoutStatus: "READY",
        latestPaymentSessionId: null,
        providerOrderId: null,
        amountDueNowMinor: 299900,
        amountPaidMinor: 0,
        outstandingMinor: 299900,
      },
      erpState: {
        erpCustomerId: "ERP-CUST-TOPAZ",
        quotationId: "QUO-TOPAZ-2026-04",
        salesOrderId: "SO-TOPAZ-2026-04",
        invoiceId: null,
        paymentEntryIds: [],
        latestInvoiceStatus: null,
        latestInvoiceOutstandingMinor: null,
        syncStatus: "PARTIAL",
      },
      billingHealth: {
        sourceOfTruth: "SNAPSHOT",
        stage: "ORDER_LINKED",
        tone: "warning",
        headline: "Snapshot is ready for checkout",
        detail: "ERP quote and order are linked, but the invoice has not landed yet.",
        lastSyncedAt: "2026-04-15T07:04:00.000Z",
        warnings: ["Invoice chain is not complete yet."],
      },
      checkoutReadiness: {
        ready: true,
        blockers: [],
        notes: ["Client can pay the current due now amount from the billing workspace."],
      },
      contacts: [
        {
          email: "billing@aakarrealities.com",
          label: "Billing desk",
          status: "ACTIVE",
        },
        {
          email: "owner@topaz-towers.in",
          label: "Project owner",
          status: "ACTIVE",
        },
      ],
      timeline: [
        {
          kind: "SNAPSHOT_CREATED",
          label: "Commercial snapshot prepared",
          occurredAt: "2026-04-15T07:00:00.000Z",
        },
        {
          kind: "QUOTE_CREATED",
          label: "ERP quotation linked",
          occurredAt: "2026-04-15T07:04:00.000Z",
        },
      ],
      actions: {
        canPayNow: true,
        payNowUrl: null,
        canDownloadQuote: false,
        canDownloadInvoice: false,
        canContactBilling: true,
      },
    },
    activeLeads: [
      makeLead({
        id: "lead-topaz-1",
        projectId: workbenchProjectIds.topaz,
        fullName: "Rahul Deshmukh",
        email: "rahul.deshmukh@example.com",
        phone: "+91 98765 41021",
        companyName: "Family Buyer",
        message: "Please share possession timeline and site visit slots.",
        sourcePage: "https://topaz-towers.in/#inline-enquiry",
        sourceCta: "Inline enquiry",
        sourceHost: "topaz-towers.in",
        utmSource: "google",
        utmMedium: "cpc",
        utmCampaign: "topaz-launch-april",
        notificationStatus: "NOTIFIED",
        syncStatus: "SYNCED",
        interestLabel: "3 BHK (947–990 sq.ft)",
        budgetLabel: "₹85 Lakhs+",
        touchpointLabel: "Inline enquiry",
        createdAt: "2026-04-17T12:10:00.000Z",
      }),
      makeLead({
        id: "lead-topaz-2",
        projectId: workbenchProjectIds.topaz,
        fullName: "Sneha Pawar",
        email: "sneha.pawar@example.com",
        phone: "+91 99228 88895",
        companyName: null,
        message: "Need brochure and bank loan assistance details.",
        sourcePage: "https://topaz-towers.in/thank-you",
        sourceCta: "Wizard submit",
        sourceHost: "topaz-towers.in",
        utmSource: "meta",
        utmMedium: "paid-social",
        utmCampaign: "topaz-family-homes",
        notificationStatus: "NOTIFIED",
        syncStatus: "SYNCED",
        interestLabel: "2 BHK (702–789 sq.ft)",
        budgetLabel: "₹70–85 Lakhs",
        touchpointLabel: "Lead wizard",
        createdAt: "2026-04-17T15:45:00.000Z",
      }),
    ],
    hiddenLeads: [
      makeLead({
        id: "lead-topaz-hidden-1",
        projectId: workbenchProjectIds.topaz,
        fullName: "Portal Verification",
        email: "portal-check@example.com",
        phone: "+91 90000 00000",
        companyName: "Internal QA",
        message: "Synthetic verification lead.",
        sourcePage: "https://topaz-towers.in/?check=qa",
        sourceCta: "QA verify",
        sourceHost: "topaz-towers.in",
        notificationStatus: "NOTIFIED",
        syncStatus: "SYNCED",
        visibilityState: "HIDDEN",
        hiddenAt: "2026-04-16T09:10:00.000Z",
        hiddenByPortalUserId: "local-owner-user",
        hiddenByUserEmail: "owner@topaz-towers.in",
        hiddenByUserFullName: "Bipin Client Owner",
        hiddenReasonCode: "TEST_OR_INTERNAL",
        hiddenReasonNote: "Local verification entry",
        createdAt: "2026-04-16T09:02:00.000Z",
        auditEvents: [
          makeAuditEvent({
            id: "audit-topaz-hide-1",
            projectId: workbenchProjectIds.topaz,
            projectLeadId: "lead-topaz-hidden-1",
            actorUserId: "local-owner-user",
            actorUserEmail: "owner@topaz-towers.in",
            actorUserFullName: "Bipin Client Owner",
            type: "SOFT_DELETED",
            reasonCode: "TEST_OR_INTERNAL",
            note: "Local verification entry",
            createdAt: "2026-04-16T09:10:00.000Z",
          }),
        ],
      }),
    ],
    tombstones: [
      {
        id: "tombstone-topaz-1",
        projectId: workbenchProjectIds.topaz,
        deletedProjectLeadId: "lead-topaz-erasure-1",
        deletedSourceLeadId: "source-topaz-erasure-1",
        deletedByUserId: "local-operator-user",
        deletedByUserEmail: "automation@shasvata.com",
        deletedByUserFullName: "Naya Operator",
        reasonCode: "PRIVACY_ERASURE_REQUEST",
        note: "Customer requested deletion.",
        createdAt: "2026-04-16T14:20:00.000Z",
      },
    ],
    invites: [
      makeInvite({
        id: "invite-topaz-viewer",
        projectId: workbenchProjectIds.topaz,
        email: "sales.observer@topaz-towers.in",
        fullName: "Topaz Sales Observer",
        role: "VIEWER",
        invitedByPortalUserId: "local-owner-user",
        invitedByUserEmail: "owner@topaz-towers.in",
        invitedByUserFullName: "Bipin Client Owner",
        status: "PENDING",
        selector: "local_topaz_viewer",
        verifierHash: "hash_local_topaz_viewer",
        expiresAt: "2026-04-25T18:30:00.000Z",
        createdAt: "2026-04-18T09:00:00.000Z",
        updatedAt: "2026-04-18T09:00:00.000Z",
      }),
    ],
    accessibleBy: ["owner", "viewer", "operator"],
  },
  {
    id: workbenchProjectIds.wagholi,
    slug: "wagholi-highstreet",
    name: "Wagholi Highstreet",
    status: "ACTIVE",
    publicLeadKey: "lead_key_wagholi",
    primaryDomain: "wagholihighstreet.in",
    clientCompanyName: "GS Group",
    description: "Retail-focused commercial landing workspace with live thank-you route.",
    notes: "Hero trust box and thank-you flow already tuned for paid campaigns.",
    goLiveAt: "2026-04-12T08:45:00.000Z",
    previewUrl: null,
    liveUrl: "https://wagholihighstreet.in",
    sites: [
      {
        id: "site-wagholi-main",
        projectId: workbenchProjectIds.wagholi,
        slug: "wagholi-main",
        templateKey: "builder-premium",
        themeKey: "charcoal-gold",
        sourceProvider: "GIT_REPOSITORY",
        repoUrl: "https://github.com/RSuyash/ES-C1",
        repoBranch: "production",
        repoRef: "refs/heads/production",
        deployedCommit: "2ef657ab0585968dca66cdd6914d41e903e64151",
        runtimeProfile: "ISOLATED_APP",
        operatorNotes: "GS Group branding restored; thank-you route live.",
        ga4MeasurementId: "G-WAGHOLI01",
        googleAdsTagId: null,
        googleAdsConversionMode: "DIRECT_LABEL",
        googleAdsLeadConversionLabel: null,
        gtmContainerId: "GTM-WAGH01",
        metaPixelId: "234567890123456",
        trackingNotes: "Wizard and inline forms resolve to the shared Wagholi thank-you route.",
        publishStatus: "PUBLISHED",
        lastPublishedAt: "2026-04-17T05:20:00.000Z",
        previewHost: null,
        latestPreviewPath: null,
      },
    ],
    domains: [
      {
        id: "domain-wagholi-root",
        projectId: workbenchProjectIds.wagholi,
        siteId: "site-wagholi-main",
        host: "wagholihighstreet.in",
        status: "ACTIVE",
        isPrimary: true,
        dnsTarget: "93.127.199.24",
        verifiedAt: "2026-04-10T08:10:00.000Z",
      },
    ],
    syncTargets: [
      {
        id: "sync-wagholi-sheet",
        projectId: workbenchProjectIds.wagholi,
        kind: "GOOGLE_SHEETS",
        status: "ACTIVE",
        label: "Wagholi Leads",
        config: {
          spreadsheetId: "sheet_wagholi_demo",
          sheetName: "Leads",
        },
      },
    ],
    members: [
      {
        portalUserId: "local-owner-user",
        email: "owner@topaz-towers.in",
        fullName: "Bipin Client Owner",
        role: "OWNER",
        status: "ACTIVE",
      },
      {
        portalUserId: "local-viewer-user",
        email: "viewer@topaz-towers.in",
        fullName: "Topaz Viewer",
        role: "VIEWER",
        status: "ACTIVE",
      },
    ],
    leadNotificationRecipients: [
      {
        id: "recipient-wagholi-1",
        projectId: workbenchProjectIds.wagholi,
        email: "sales@wagholihighstreet.in",
        label: "Sales desk",
        createdAt: "2026-04-10T08:00:00.000Z",
        updatedAt: "2026-04-10T08:00:00.000Z",
      },
    ],
    billing: {
      projectId: workbenchProjectIds.wagholi,
      projectName: "Wagholi Highstreet",
      currency: "INR",
      checkoutPhone: "+91 7020455546",
      status: "PARTIALLY_PAID",
      activeSnapshot: {
        id: "snapshot-wagholi-growth",
        sourceType: "PROJECT_PLAN",
        status: "ACTIVE",
        currency: "INR",
        subtotalMinor: 1799900,
        discountMinor: 200000,
        totalMinor: 1599900,
        payableTodayMinor: 999900,
        remainingAfterTodayMinor: 600000,
        offerCodeApplied: "LAUNCH10",
        couponCodeApplied: null,
        referralCodeApplied: null,
        operatorAdjustmentMinor: 0,
        validUntil: "2026-04-29T18:30:00.000Z",
        lines: [
          {
            slug: "landing-page-growth",
            itemCode: "NG-LP-GROWTH",
            label: "Campaign Landing System",
            quantity: 1,
            kind: "PACKAGE",
            billingModel: "ADVANCE",
            checkoutMode: "INSTANT",
            unitPriceMinor: 1799900,
            lineSubtotalMinor: 1799900,
            lineDiscountMinor: 200000,
            lineTotalMinor: 1599900,
            payableTodayMinor: 999900,
            remainingAfterTodayMinor: 600000,
          },
        ],
      },
      paymentState: {
        canPayNow: true,
        latestCheckoutStatus: "PAID_PARTIAL",
        latestPaymentSessionId: "pay_wagholi_local_01",
        providerOrderId: "cf_order_wagholi_local_01",
        amountDueNowMinor: 600000,
        amountPaidMinor: 999900,
        outstandingMinor: 600000,
      },
      erpState: {
        erpCustomerId: "ERP-CUST-WAGHOLI",
        quotationId: "QUO-WAGHOLI-2026-04",
        salesOrderId: "SO-WAGHOLI-2026-04",
        invoiceId: "SINV-WAGHOLI-2026-04",
        paymentEntryIds: ["PAY-WAGHOLI-001"],
        latestInvoiceStatus: "PARTLY PAID",
        latestInvoiceOutstandingMinor: 600000,
        syncStatus: "SYNCED",
      },
      billingHealth: {
        sourceOfTruth: "ERP",
        stage: "INVOICE_LINKED",
        tone: "neutral",
        headline: "ERP and checkout are aligned",
        detail: "Advance is paid and the outstanding balance is ready for the next collection step.",
        lastSyncedAt: "2026-04-11T11:35:00.000Z",
        warnings: [],
      },
      checkoutReadiness: {
        ready: true,
        blockers: [],
        notes: ["The remaining outstanding amount can be collected from the current billing state."],
      },
      contacts: [
        {
          email: "billing@shasvata.com",
          label: "Naya billing",
          status: "ACTIVE",
        },
      ],
      timeline: [
        {
          kind: "SNAPSHOT_CREATED",
          label: "Commercial snapshot prepared",
          occurredAt: "2026-04-10T08:00:00.000Z",
        },
        {
          kind: "PAYMENT_RECEIVED",
          label: "Advance payment received",
          occurredAt: "2026-04-11T11:30:00.000Z",
        },
        {
          kind: "ERP_SYNCED",
          label: "ERP billing chain synced",
          occurredAt: "2026-04-11T11:35:00.000Z",
        },
      ],
      actions: {
        canPayNow: true,
        payNowUrl: null,
        canDownloadQuote: false,
        canDownloadInvoice: false,
        canContactBilling: true,
      },
    },
    activeLeads: [
      makeLead({
        id: "lead-wagholi-1",
        projectId: workbenchProjectIds.wagholi,
        fullName: "Karan Jadhav",
        email: "karan.jadhav@example.com",
        phone: "+91 98220 45678",
        companyName: "Retail Investor",
        message: "Need inventory list and early bird details.",
        sourcePage: "https://wagholihighstreet.in/",
        sourceCta: "Schedule a site visit",
        sourceHost: "wagholihighstreet.in",
        notificationStatus: "NOTIFIED",
        syncStatus: "SYNCED",
        interestLabel: "Showroom",
        budgetLabel: "₹1.10 Cr+",
        touchpointLabel: "Hero CTA",
        createdAt: "2026-04-17T11:20:00.000Z",
      }),
    ],
    hiddenLeads: [
      makeLead({
        id: "lead-wagholi-hidden-1",
        projectId: workbenchProjectIds.wagholi,
        fullName: "Internal Test Lead",
        email: "qa.wagholi@example.com",
        phone: "+91 90000 10000",
        companyName: "QA",
        message: "Internal test",
        sourcePage: "https://wagholihighstreet.in/?source=test",
        sourceCta: "Test",
        sourceHost: "wagholihighstreet.in",
        notificationStatus: "NOTIFIED",
        syncStatus: "SYNCED",
        visibilityState: "HIDDEN",
        hiddenAt: "2026-04-17T11:55:00.000Z",
        hiddenByPortalUserId: "local-owner-user",
        hiddenByUserEmail: "owner@topaz-towers.in",
        hiddenByUserFullName: "Bipin Client Owner",
        hiddenReasonCode: "TEST_OR_INTERNAL",
        hiddenReasonNote: "Do not count in reporting.",
        createdAt: "2026-04-17T11:50:00.000Z",
      }),
    ],
    tombstones: [],
    invites: [],
    accessibleBy: ["owner", "viewer", "operator"],
  },
  {
    id: workbenchProjectIds.serefy,
    slug: "serefy-innovations",
    name: "Serefy Innovations",
    status: "ACTIVE",
    publicLeadKey: "lead_key_serefy",
    primaryDomain: null,
    clientCompanyName: "SERE Smart Hatching",
    description: "Preview-based company website with live portal access.",
    notes: "Ideal sandbox example for preview-only projects without billing yet.",
    goLiveAt: null,
    previewUrl: "https://serefy-innovations.preview.shasvata.com",
    liveUrl: null,
    sites: [
      {
        id: "site-serefy-main",
        projectId: workbenchProjectIds.serefy,
        slug: "serefy-main",
        templateKey: "brand-corporate",
        themeKey: "sea-glass",
        sourceProvider: "GIT_REPOSITORY",
        repoUrl: "https://github.com/RSuyash/Serefy-Innovations",
        repoBranch: "production",
        repoRef: "refs/heads/production",
        deployedCommit: "preview-live-serefy",
        runtimeProfile: "ISOLATED_APP",
        operatorNotes: "Preview route only until client domain points to VPS.",
        ga4MeasurementId: null,
        googleAdsTagId: null,
        googleAdsConversionMode: "DIRECT_LABEL",
        googleAdsLeadConversionLabel: null,
        gtmContainerId: null,
        metaPixelId: null,
        trackingNotes: "Tracking not configured yet for the Serefy preview surface.",
        publishStatus: "PUBLISHED",
        lastPublishedAt: "2026-04-13T09:20:00.000Z",
        previewHost: "serefy-innovations.preview.shasvata.com",
        latestPreviewPath: "https://serefy-innovations.preview.shasvata.com",
      },
    ],
    domains: [],
    syncTargets: [
      {
        id: "sync-serefy-sheet",
        projectId: workbenchProjectIds.serefy,
        kind: "GOOGLE_SHEETS",
        status: "ACTIVE",
        label: "Serefy Leads",
        config: {
          spreadsheetId: "sheet_serefy_demo",
          sheetName: "Leads",
        },
      },
    ],
    members: [
      {
        portalUserId: "local-owner-user",
        email: "owner@topaz-towers.in",
        fullName: "Bipin Client Owner",
        role: "OWNER",
        status: "ACTIVE",
      },
      {
        portalUserId: "local-support-user",
        email: "growthnaya@gmail.com",
        fullName: "Shasvata",
        role: "OWNER",
        status: "ACTIVE",
      },
    ],
    leadNotificationRecipients: [
      {
        id: "recipient-serefy-1",
        projectId: workbenchProjectIds.serefy,
        email: "sweetygaikwad62@gmail.com",
        label: "Client owner",
        createdAt: "2026-04-13T09:00:00.000Z",
        updatedAt: "2026-04-13T09:00:00.000Z",
      },
    ],
    billing: {
      projectId: workbenchProjectIds.serefy,
      projectName: "Serefy Innovations",
      currency: "INR",
      checkoutPhone: null,
      status: "NO_BILLING",
      activeSnapshot: null,
      paymentState: {
        canPayNow: false,
        latestCheckoutStatus: null,
        latestPaymentSessionId: null,
        providerOrderId: null,
        amountDueNowMinor: 0,
        amountPaidMinor: 0,
        outstandingMinor: 0,
      },
      erpState: null,
      billingHealth: {
        sourceOfTruth: "SNAPSHOT",
        stage: "SNAPSHOT_ONLY",
        tone: "warning",
        headline: "No billing snapshot is available yet",
        detail: "This preview project is live, but finance has not prepared a commercial snapshot.",
        lastSyncedAt: null,
        warnings: ["No quote, order, or invoice is linked yet."],
      },
      checkoutReadiness: {
        ready: false,
        blockers: [{ code: "MISSING_SNAPSHOT", label: "Missing active billing snapshot" }],
        notes: ["Collect project brief and commercial approval before enabling checkout."],
      },
      contacts: [],
      timeline: [],
      actions: {
        canPayNow: false,
        payNowUrl: null,
        canDownloadQuote: false,
        canDownloadInvoice: false,
        canContactBilling: true,
      },
    },
    activeLeads: [
      makeLead({
        id: "lead-serefy-1",
        projectId: workbenchProjectIds.serefy,
        fullName: "Rahul Deshmukh",
        email: "rahul.deshmukh.sere.20260413@example.com",
        phone: "+91 93735 77961",
        companyName: "Poultry Integrator",
        message: "Need the automation brochure and a callback.",
        sourcePage: "https://serefy-innovations.preview.shasvata.com/",
        sourceCta: "Primary CTA",
        sourceHost: "serefy-innovations.preview.shasvata.com",
        notificationStatus: "NOTIFIED",
        syncStatus: "SYNCED",
        interestLabel: "Automation systems",
        budgetLabel: "Discuss scope",
        touchpointLabel: "Hero CTA",
        createdAt: "2026-04-13T10:45:00.000Z",
      }),
    ],
    hiddenLeads: [],
    tombstones: [],
    invites: [
      makeInvite({
        id: "invite-serefy-owner",
        projectId: workbenchProjectIds.serefy,
        email: "advisor@serefy.in",
        fullName: "Serefy Advisor",
        role: "OWNER",
        invitedByPortalUserId: "local-support-user",
        invitedByUserEmail: "growthnaya@gmail.com",
        invitedByUserFullName: "Shasvata",
        status: "PENDING",
        selector: "local_serefy_owner",
        verifierHash: "hash_local_serefy_owner",
        expiresAt: "2026-04-24T18:30:00.000Z",
        createdAt: "2026-04-18T10:00:00.000Z",
        updatedAt: "2026-04-18T10:00:00.000Z",
      }),
    ],
    accessibleBy: ["owner", "operator"],
  },
  {
    id: workbenchProjectIds.omkar,
    slug: "omkar-pawar",
    name: "Omkar Pawar",
    status: "ARCHIVED",
    publicLeadKey: "lead_key_omkar",
    primaryDomain: "omkarpawar.com",
    clientCompanyName: "Omkar Pawar",
    description: "Archived portfolio delivery kept around for design and CRM references.",
    notes: "Helpful for seeing archived workspace behavior locally.",
    goLiveAt: "2026-04-12T12:20:00.000Z",
    previewUrl: null,
    liveUrl: "https://omkarpawar.com",
    sites: [
      {
        id: "site-omkar-main",
        projectId: workbenchProjectIds.omkar,
        slug: "omkar-main",
        templateKey: "personal-brand",
        themeKey: "obsidian-bronze",
        sourceProvider: "GIT_REPOSITORY",
        repoUrl: "https://github.com/RSuyash/omkar-pawar",
        repoBranch: "production",
        repoRef: "refs/heads/production",
        deployedCommit: "486b658999eacef0c55f7d050e6bf8cb836df7a9",
        runtimeProfile: "ISOLATED_APP",
        operatorNotes: "Custom favicon, share card, and lead wizard live.",
        ga4MeasurementId: "G-OMKAR001",
        googleAdsTagId: null,
        googleAdsConversionMode: "DIRECT_LABEL",
        googleAdsLeadConversionLabel: null,
        gtmContainerId: null,
        metaPixelId: null,
        trackingNotes: "Omkar uses lightweight GA4 only in the workbench dataset.",
        publishStatus: "PUBLISHED",
        lastPublishedAt: "2026-04-12T12:22:00.000Z",
        previewHost: null,
        latestPreviewPath: null,
      },
    ],
    domains: [
      {
        id: "domain-omkar-root",
        projectId: workbenchProjectIds.omkar,
        siteId: "site-omkar-main",
        host: "omkarpawar.com",
        status: "ACTIVE",
        isPrimary: true,
        dnsTarget: "93.127.199.24",
        verifiedAt: "2026-04-12T12:10:00.000Z",
      },
    ],
    syncTargets: [],
    members: [
      {
        portalUserId: "local-support-user",
        email: "growthnaya@gmail.com",
        fullName: "Shasvata",
        role: "OWNER",
        status: "ACTIVE",
      },
    ],
    leadNotificationRecipients: [],
    billing: {
      projectId: workbenchProjectIds.omkar,
      projectName: "Omkar Pawar",
      currency: "INR",
      checkoutPhone: "+91 7020455546",
      status: "PAID",
      activeSnapshot: {
        id: "snapshot-omkar-paid",
        sourceType: "PROJECT_PLAN",
        status: "SYNCED_TO_ERP",
        currency: "INR",
        subtotalMinor: 1499900,
        discountMinor: 0,
        totalMinor: 1499900,
        payableTodayMinor: 1499900,
        remainingAfterTodayMinor: 0,
        offerCodeApplied: null,
        couponCodeApplied: null,
        referralCodeApplied: null,
        operatorAdjustmentMinor: 0,
        validUntil: null,
        lines: [
          {
            slug: "landing-page-growth",
            itemCode: "NG-LP-GROWTH",
            label: "Portfolio Website Build",
            quantity: 1,
            kind: "PACKAGE",
            billingModel: "FULL",
            checkoutMode: "INSTANT",
            unitPriceMinor: 1499900,
            lineSubtotalMinor: 1499900,
            lineDiscountMinor: 0,
            lineTotalMinor: 1499900,
            payableTodayMinor: 1499900,
            remainingAfterTodayMinor: 0,
          },
        ],
      },
      paymentState: {
        canPayNow: false,
        latestCheckoutStatus: "PAID",
        latestPaymentSessionId: "pay_omkar_001",
        providerOrderId: "cf_order_omkar_001",
        amountDueNowMinor: 0,
        amountPaidMinor: 1499900,
        outstandingMinor: 0,
      },
      erpState: {
        erpCustomerId: "ERP-CUST-OMKAR",
        quotationId: "QUO-OMKAR-2026-04",
        salesOrderId: "SO-OMKAR-2026-04",
        invoiceId: "SINV-OMKAR-2026-04",
        paymentEntryIds: ["PAY-OMKAR-001"],
        latestInvoiceStatus: "PAID",
        latestInvoiceOutstandingMinor: 0,
        syncStatus: "SYNCED",
      },
      billingHealth: {
        sourceOfTruth: "ERP",
        stage: "PAID",
        tone: "success",
        headline: "Payment is fully settled",
        detail: "The project is fully paid and the ERP chain is complete.",
        lastSyncedAt: "2026-04-08T13:25:00.000Z",
        warnings: [],
      },
      checkoutReadiness: {
        ready: false,
        blockers: [{ code: "NOTHING_DUE", label: "Nothing due right now" }],
        notes: ["No checkout action is needed because the project is already paid."],
      },
      contacts: [
        {
          email: "ompawar1407@gmail.com",
          label: "Client owner",
          status: "ACTIVE",
        },
      ],
      timeline: [
        {
          kind: "PAYMENT_RECEIVED",
          label: "Full payment collected",
          occurredAt: "2026-04-08T13:25:00.000Z",
        },
      ],
      actions: {
        canPayNow: false,
        payNowUrl: null,
        canDownloadQuote: false,
        canDownloadInvoice: false,
        canContactBilling: true,
      },
    },
    activeLeads: [],
    hiddenLeads: [],
    tombstones: [],
    invites: [],
    accessibleBy: ["owner", "operator"],
  },
];

const onboardingRecords: Record<string, OnboardingRecord> = {
  "onboarding-local-serefy": {
    id: "onboarding-local-serefy",
    cartId: "cart_local_serefy",
    projectId: null,
    routeProjectId: workbenchProjectIds.serefy,
    packageLabel: "Campaign Landing System",
    packageSlug: "landing-page-growth",
    selectedAddons: ["landing-page-copywriting", "landing-page-tracking"],
    buyer: {
      email: "sweetygaikwad62@gmail.com",
      fullName: "Sweety Gaikwad",
      companyName: "SERE Smart Hatching",
      phone: "+91 9373577961",
    },
    intake: {
      projectName: "Serefy Innovations Preview Launch",
      projectType: "business-service",
      launchGoal: "Generate qualified enquiries and profile the brand professionally.",
      targetAudience: "Poultry businesses and hatchery operators in Maharashtra.",
      referenceUrls: [
        "https://serefy-innovations.preview.shasvata.com",
      ],
      requestedSections: ["Hero", "Solutions", "About", "Contact"],
      legalPagesReady: true,
      businessAddress:
        "Madhukar Gaikwad, Indira Gandhi College Road, near Zone No. 5 Office, CIDCO, Nanded, Maharashtra 431603",
    },
    lastCompletedStep: "brand",
    submittedAt: null,
    createdAt: "2026-04-18T08:40:00.000Z",
    updatedAt: "2026-04-18T09:10:00.000Z",
    summary: {
      currency: "INR",
      totalMinor: 1799900,
      payableTodayMinor: 1799900,
      remainingAfterTodayMinor: 0,
    },
  },
};

function makeAuditEvent(
  overrides: Partial<ProjectLead["auditEvents"][number]> = {},
): ProjectLead["auditEvents"][number] {
  return {
    id: overrides.id ?? "audit-local-1",
    projectId: overrides.projectId ?? workbenchProjectIds.topaz,
    projectLeadId: overrides.projectLeadId ?? "lead-local-1",
    actorUserId: overrides.actorUserId ?? null,
    actorUserEmail: overrides.actorUserEmail ?? null,
    actorUserFullName: overrides.actorUserFullName ?? null,
    type: overrides.type ?? "SOFT_DELETED",
    reasonCode: overrides.reasonCode ?? null,
    note: overrides.note ?? null,
    metadata: overrides.metadata ?? null,
    createdAt: overrides.createdAt ?? "2026-04-18T08:00:00.000Z",
  };
}

function makeLead(overrides: Partial<ProjectLead> = {}): ProjectLead {
  return {
    id: overrides.id ?? "lead-local-1",
    projectId: overrides.projectId ?? workbenchProjectIds.topaz,
    sourceLeadId: overrides.sourceLeadId ?? null,
    fullName: overrides.fullName ?? "Local Lead",
    email: overrides.email ?? "local.lead@example.com",
    phone: overrides.phone ?? "+91 99999 99999",
    companyName: overrides.companyName ?? null,
    message: overrides.message ?? null,
    consent: overrides.consent ?? true,
    sourcePage: overrides.sourcePage ?? null,
    sourceCta: overrides.sourceCta ?? null,
    utmSource: overrides.utmSource ?? null,
    utmMedium: overrides.utmMedium ?? null,
    utmCampaign: overrides.utmCampaign ?? null,
    utmContent: overrides.utmContent ?? null,
    utmTerm: overrides.utmTerm ?? null,
    gclid: overrides.gclid ?? null,
    gbraid: overrides.gbraid ?? null,
    wbraid: overrides.wbraid ?? null,
    notificationStatus: overrides.notificationStatus ?? "RECEIVED",
    notificationError: overrides.notificationError ?? null,
    syncStatus: overrides.syncStatus ?? "PENDING",
    syncError: overrides.syncError ?? null,
    visibilityState: overrides.visibilityState ?? "VISIBLE",
    hiddenAt: overrides.hiddenAt ?? null,
    hiddenByPortalUserId: overrides.hiddenByPortalUserId ?? null,
    hiddenByUserEmail: overrides.hiddenByUserEmail ?? null,
    hiddenByUserFullName: overrides.hiddenByUserFullName ?? null,
    hiddenReasonCode: overrides.hiddenReasonCode ?? null,
    hiddenReasonNote: overrides.hiddenReasonNote ?? null,
    lastRestoredAt: overrides.lastRestoredAt ?? null,
    lastRestoredByPortalUserId: overrides.lastRestoredByPortalUserId ?? null,
    lastRestoredByUserEmail: overrides.lastRestoredByUserEmail ?? null,
    lastRestoredByUserFullName: overrides.lastRestoredByUserFullName ?? null,
    sourceHost: overrides.sourceHost ?? null,
    serviceInterest: overrides.serviceInterest ?? [],
    budgetRange: overrides.budgetRange ?? null,
    timeline: overrides.timeline ?? null,
    problemSummary: overrides.problemSummary ?? null,
    interestLabel: overrides.interestLabel ?? null,
    budgetLabel: overrides.budgetLabel ?? null,
    touchpointLabel: overrides.touchpointLabel ?? null,
    isInternalTest: overrides.isInternalTest ?? false,
    auditEvents: overrides.auditEvents ?? [],
    createdAt: overrides.createdAt ?? "2026-04-18T08:00:00.000Z",
  };
}

function makeInvite(overrides: Partial<ProjectInvite> = {}): ProjectInvite {
  return {
    id: overrides.id ?? "invite-local-1",
    projectId: overrides.projectId ?? workbenchProjectIds.topaz,
    email: overrides.email ?? "invite@example.com",
    fullName: overrides.fullName ?? null,
    role: overrides.role ?? "VIEWER",
    invitedByPortalUserId: overrides.invitedByPortalUserId ?? "local-owner-user",
    invitedByUserEmail: overrides.invitedByUserEmail ?? "owner@topaz-towers.in",
    invitedByUserFullName: overrides.invitedByUserFullName ?? "Bipin Client Owner",
    acceptedByPortalUserId: overrides.acceptedByPortalUserId ?? null,
    acceptedByUserEmail: overrides.acceptedByUserEmail ?? null,
    acceptedByUserFullName: overrides.acceptedByUserFullName ?? null,
    selector: overrides.selector ?? "local_invite_selector",
    verifierHash: overrides.verifierHash ?? "local_invite_hash",
    status: overrides.status ?? "PENDING",
    expiresAt: overrides.expiresAt ?? "2026-04-25T18:30:00.000Z",
    acceptedAt: overrides.acceptedAt ?? null,
    revokedAt: overrides.revokedAt ?? null,
    createdAt: overrides.createdAt ?? "2026-04-18T08:00:00.000Z",
    updatedAt: overrides.updatedAt ?? "2026-04-18T08:00:00.000Z",
  };
}

function readCookieValue(cookieHeader: string | undefined, name: string): string | null {
  if (!cookieHeader) {
    return null;
  }

  const segments = cookieHeader.split(";");
  for (const segment of segments) {
    const [rawKey, ...rawValue] = segment.trim().split("=");
    if (rawKey === name) {
      return rawValue.join("=") || null;
    }
  }

  return null;
}

function resolveProjectRecord(projectId: string): ProjectRecord {
  const project = workbenchProjects.find((entry) => entry.id === projectId);
  if (!project) {
    throw new Error(`Workbench project ${projectId} is not seeded.`);
  }

  return project;
}

function resolveAccessibleProjects(persona: LocalWorkbenchPersona): ProjectRecord[] {
  return workbenchProjects.filter((project) => project.accessibleBy.includes(persona));
}

function resolveMembershipRole(
  persona: LocalWorkbenchPersona,
  project: ProjectRecord,
): "OWNER" | "VIEWER" {
  if (persona === "viewer") {
    return "VIEWER";
  }

  if (project.members.some((member) => member.portalUserId === personaUsers.owner.id)) {
    return "OWNER";
  }

  return "OWNER";
}

function maskEmail(email: string): string {
  const [localPart, domainPart] = email.split("@");
  if (!localPart || !domainPart) {
    return "•••";
  }

  const visible = localPart.slice(0, Math.min(2, localPart.length));
  return `${visible}•••@${domainPart}`;
}

function maskPhone(phone: string | null): string | null {
  if (!phone) {
    return null;
  }

  const digits = phone.replace(/\D/g, "");
  if (digits.length < 6) {
    return "•••";
  }

  return `${phone.slice(0, 4)} ••• ${digits.slice(-2)}`;
}

function toAccessibleProject(
  project: ProjectRecord,
  persona: LocalWorkbenchPersona,
): AccessibleProject {
  return {
    id: project.id,
    slug: project.slug,
    name: project.name,
    status: project.status,
    publicLeadKey: project.publicLeadKey,
    primaryDomain: project.primaryDomain,
    clientCompanyName: project.clientCompanyName,
    goLiveAt: project.goLiveAt,
    membershipRole: resolveMembershipRole(persona, project),
  };
}

function toProjectDetail(project: ProjectRecord, persona: LocalWorkbenchPersona): ProjectDetail {
  return {
    id: project.id,
    slug: project.slug,
    name: project.name,
    status: project.status,
    publicLeadKey: project.publicLeadKey,
    portalView: persona === "operator" ? "OPERATOR" : "CLIENT",
    primaryDomain: project.primaryDomain,
    clientCompanyName: project.clientCompanyName,
    description: project.description,
    notes: project.notes,
    goLiveAt: project.goLiveAt,
    membershipRole: resolveMembershipRole(persona, project),
    leadCount: project.activeLeads.length,
    sites: project.sites,
    domains: project.domains,
    syncTargets: project.syncTargets,
    members: project.members,
    leadNotificationRecipients: project.leadNotificationRecipients,
    sourceSummary:
      project.sites[0]
        ? {
            siteId: project.sites[0].id,
            provider: project.sites[0].sourceProvider,
            repoUrl: project.sites[0].repoUrl,
            repoBranch: project.sites[0].repoBranch,
            repoRef: project.sites[0].repoRef,
            deployedCommit: project.sites[0].deployedCommit,
            runtimeProfile: project.sites[0].runtimeProfile,
            operatorNotes: project.sites[0].operatorNotes,
            previewHost: project.sites[0].previewHost,
          }
        : null,
    previewUrl: project.previewUrl,
    liveUrl: project.liveUrl,
    billingSummary: {
      billingContactEmails: project.billing.contacts.map((contact) => contact.email),
      cartCount: project.billing.activeSnapshot ? 1 : 0,
      totalQuotedMinor: project.billing.activeSnapshot?.totalMinor ?? 0,
      totalPayableTodayMinor: project.billing.paymentState.amountDueNowMinor,
      latestCartId: project.billing.activeSnapshot?.id ?? null,
      latestCartStatus: project.billing.status,
      latestQuoteRequestStatus: project.billing.erpState?.quotationId ? "READY" : null,
      latestCheckoutStatus: project.billing.paymentState.latestCheckoutStatus,
      latestPaymentSessionId: project.billing.paymentState.latestPaymentSessionId,
      latestProviderOrderId: project.billing.paymentState.providerOrderId,
      latestErpQuotationId: project.billing.erpState?.quotationId ?? null,
      latestErpSalesOrderId: project.billing.erpState?.salesOrderId ?? null,
      latestErpCustomerId: project.billing.erpState?.erpCustomerId ?? null,
      latestUpdatedAt: project.billing.timeline[project.billing.timeline.length - 1]?.occurredAt ?? null,
    },
  };
}

function toProjectLead(
  lead: ProjectLead,
  persona: LocalWorkbenchPersona,
): ProjectLead {
  if (persona !== "viewer") {
    return lead;
  }

  return {
    ...lead,
    email: maskEmail(lead.email),
    phone: maskPhone(lead.phone),
  };
}

export function isLocalPortalWorkbenchEnabled(): boolean {
  return process.env.NODE_ENV !== "production" && process.env.NAYA_PORTAL_WORKBENCH !== "0";
}

export function isLocalPortalWorkbenchClientEnabled(): boolean {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.NEXT_PUBLIC_NAYA_PORTAL_WORKBENCH !== "0"
  );
}

export function readLocalPortalWorkbenchPersona(
  cookieHeader?: string,
): LocalWorkbenchPersona {
  const rawValue = readCookieValue(cookieHeader, LOCAL_PORTAL_WORKBENCH_PERSONA_COOKIE);
  if (rawValue === "viewer" || rawValue === "operator" || rawValue === "owner") {
    return rawValue;
  }

  return "owner";
}

export function isLocalPortalWorkbenchSignedOut(cookieHeader?: string): boolean {
  return (
    readCookieValue(cookieHeader, LOCAL_PORTAL_WORKBENCH_SIGNED_OUT_COOKIE) === "1"
  );
}

export function getWorkbenchPortalSession(
  cookieHeader?: string,
): PortalSessionResponse | null {
  if (isLocalPortalWorkbenchSignedOut(cookieHeader)) {
    return null;
  }

  const persona = readLocalPortalWorkbenchPersona(cookieHeader);
  return {
    authenticated: true,
    portalUser: personaUsers[persona],
  };
}

export function getWorkbenchProjects(cookieHeader?: string): AccessibleProject[] {
  const persona = readLocalPortalWorkbenchPersona(cookieHeader);

  return resolveAccessibleProjects(persona).map((project) =>
    toAccessibleProject(project, persona),
  );
}

export function getWorkbenchProjectDetail(
  projectId: string,
  cookieHeader?: string,
): ProjectDetail {
  const persona = readLocalPortalWorkbenchPersona(cookieHeader);
  const project = resolveProjectRecord(projectId);
  if (!project.accessibleBy.includes(persona)) {
    throw new Error("Project not available in the local workbench persona.");
  }

  return toProjectDetail(project, persona);
}

export function getWorkbenchProjectAccessSettings(
  projectId: string,
  cookieHeader?: string,
): ProjectAccessSettings {
  const persona = readLocalPortalWorkbenchPersona(cookieHeader);
  const project = resolveProjectRecord(projectId);

  return {
    projectId: project.id,
    projectName: project.name,
    membershipRole: resolveMembershipRole(persona, project),
    members: project.members,
    invites: project.invites,
  };
}

export function getWorkbenchProjectLeads(
  projectId: string,
  input: {
    cookieHeader?: string;
    tab?: "active" | "hidden";
  } = {},
): ProjectLead[] {
  const persona = readLocalPortalWorkbenchPersona(input.cookieHeader);
  const project = resolveProjectRecord(projectId);
  const tab = input.tab ?? "active";
  const leads = tab === "hidden" ? project.hiddenLeads : project.activeLeads;

  return leads.map((lead) => toProjectLead(lead, persona));
}

export function getWorkbenchProjectLeadTombstones(
  projectId: string,
): ProjectLeadDeletionTombstone[] {
  return resolveProjectRecord(projectId).tombstones;
}

export function getWorkbenchProjectBilling(
  projectId: string,
): ProjectBillingDetail {
  return resolveProjectRecord(projectId).billing;
}

export function getWorkbenchPortfolioBilling(cookieHeader?: string): {
  projects: Array<{
    projectId: string;
    projectName: string;
    projectSlug: string;
    billing: ProjectBillingDetail;
  }>;
  summary: {
    totalProjects: number;
    projectsWithBilling: number;
    totalQuotedMinor: number;
    totalPaidMinor: number;
    totalDueNowMinor: number;
    totalOutstandingMinor: number;
    statusBreakdown: Record<string, number>;
  };
} {
  const persona = readLocalPortalWorkbenchPersona(cookieHeader);
  const projects = resolveAccessibleProjects(persona).map((project) => ({
    projectId: project.id,
    projectName: project.name,
    projectSlug: project.slug,
    billing: project.billing,
  }));

  const summary = projects.reduce(
    (accumulator, project) => {
      accumulator.totalProjects += 1;
      if (project.billing.activeSnapshot) {
        accumulator.projectsWithBilling += 1;
        accumulator.totalQuotedMinor += project.billing.activeSnapshot.totalMinor;
      }
      accumulator.totalPaidMinor += project.billing.paymentState.amountPaidMinor;
      accumulator.totalDueNowMinor += project.billing.paymentState.amountDueNowMinor;
      accumulator.totalOutstandingMinor += project.billing.paymentState.outstandingMinor;
      accumulator.statusBreakdown[project.billing.status] =
        (accumulator.statusBreakdown[project.billing.status] ?? 0) + 1;

      return accumulator;
    },
    {
      totalProjects: 0,
      projectsWithBilling: 0,
      totalQuotedMinor: 0,
      totalPaidMinor: 0,
      totalDueNowMinor: 0,
      totalOutstandingMinor: 0,
      statusBreakdown: {} as Record<string, number>,
    },
  );

  return { projects, summary };
}

export function resolveWorkbenchProjectOnboardingFromCartId(
  cartId: string,
): ProjectOnboardingSession {
  const record = Object.values(onboardingRecords).find((entry) => entry.cartId === cartId);
  if (!record) {
    throw new Error(`Workbench onboarding cart ${cartId} is not seeded.`);
  }

  return toProjectOnboardingSession(record);
}

export function getWorkbenchProjectOnboarding(
  sessionId: string,
): ProjectOnboardingSession {
  const record = onboardingRecords[sessionId];
  if (!record) {
    throw new Error(`Workbench onboarding session ${sessionId} is not seeded.`);
  }

  return toProjectOnboardingSession(record);
}

function toProjectOnboardingSession(record: OnboardingRecord): ProjectOnboardingSession {
  return {
    id: record.id,
    cartId: record.cartId,
    checkoutSessionId: null,
    projectId: record.projectId,
    status: record.projectId ? "CONVERTED" : "DRAFT",
    package: {
      slug: record.packageSlug,
      label: record.packageLabel,
    },
    selectedAddons: record.selectedAddons,
    buyer: record.buyer,
    summary: record.summary,
    intake: record.intake,
    lastCompletedStep: record.lastCompletedStep,
    submittedAt: record.submittedAt,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export function saveWorkbenchProjectOnboarding(input: {
  sessionId: string;
  intake: Record<string, unknown>;
  lastCompletedStep?: string | null;
}): ProjectOnboardingSession {
  const current = getWorkbenchProjectOnboarding(input.sessionId);

  return {
    ...current,
    intake: input.intake,
    lastCompletedStep: input.lastCompletedStep ?? current.lastCompletedStep,
    updatedAt: new Date().toISOString(),
  };
}

export function submitWorkbenchProjectOnboarding(
  sessionId: string,
): ProjectOnboardingSubmitResult {
  const record = onboardingRecords[sessionId];
  if (!record) {
    throw new Error(`Workbench onboarding session ${sessionId} is not seeded.`);
  }

  const project = resolveProjectRecord(record.routeProjectId);

  return {
    session: {
      ...toProjectOnboardingSession(record),
      projectId: project.id,
      status: "CONVERTED",
      submittedAt: new Date().toISOString(),
    },
    project: {
      id: project.id,
      slug: project.slug,
      name: project.name,
      status: project.status,
    },
    projectRoute: `/dashboard/projects/${project.id}`,
  };
}

export function createWorkbenchCheckoutSessionFromBillingSnapshot(input: {
  billingSnapshotId: string;
  returnUrl?: string;
  cancelUrl?: string;
}): CheckoutSessionResponse {
  const project = workbenchProjects.find(
    (entry) => entry.billing.activeSnapshot?.id === input.billingSnapshotId,
  );

  if (!project?.billing.activeSnapshot) {
    throw new Error("Workbench billing snapshot is not seeded.");
  }

  return {
    id: `workbench-checkout-${input.billingSnapshotId}`,
    status: "READY",
    provider: "LOCAL_WORKBENCH",
    environment: "MOCK",
    amountMinor: project.billing.paymentState.amountDueNowMinor,
    currency: project.billing.currency,
    paymentSessionId: `payment_session_${input.billingSnapshotId}`,
    providerOrderId: `provider_order_${input.billingSnapshotId}`,
    hostedCheckoutUrl: input.returnUrl ?? input.cancelUrl ?? null,
    erp: {
      customerId: project.billing.erpState?.erpCustomerId ?? "WORKBENCH-CUSTOMER",
      quotationId: project.billing.erpState?.quotationId ?? "WORKBENCH-QUOTATION",
      salesOrderId: project.billing.erpState?.salesOrderId ?? "WORKBENCH-SALES-ORDER",
    },
  };
}

export function simulateWorkbenchInviteProjectMember(input: {
  projectId: string;
  email: string;
  fullName?: string;
  role: "OWNER" | "VIEWER";
}): { invite: ProjectInvite } {
  return {
    invite: makeInvite({
      id: `invite-local-${Date.now()}`,
      projectId: input.projectId,
      email: input.email,
      fullName: input.fullName ?? null,
      role: input.role,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }),
  };
}

export function simulateWorkbenchResendProjectInvite(input: {
  projectId: string;
  inviteId: string;
}): { invite: ProjectInvite } {
  const project = resolveProjectRecord(input.projectId);
  const invite = project.invites.find((entry) => entry.id === input.inviteId);
  if (!invite) {
    throw new Error("Workbench invite not found.");
  }

  return {
    invite: {
      ...invite,
      updatedAt: new Date().toISOString(),
    },
  };
}

export function simulateWorkbenchUpdateProjectInvite(input: {
  projectId: string;
  inviteId: string;
  role: "OWNER" | "VIEWER";
}): { invite: ProjectInvite } {
  const project = resolveProjectRecord(input.projectId);
  const invite = project.invites.find((entry) => entry.id === input.inviteId);
  if (!invite) {
    throw new Error("Workbench invite not found.");
  }

  return {
    invite: {
      ...invite,
      role: input.role,
      updatedAt: new Date().toISOString(),
    },
  };
}

export function simulateWorkbenchRevokeProjectInvite(input: {
  projectId: string;
  inviteId: string;
}): { invite: ProjectInvite } {
  const project = resolveProjectRecord(input.projectId);
  const invite = project.invites.find((entry) => entry.id === input.inviteId);
  if (!invite) {
    throw new Error("Workbench invite not found.");
  }

  return {
    invite: {
      ...invite,
      status: "REVOKED",
      revokedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  };
}

export function simulateWorkbenchUpdateProjectMemberRole(input: {
  projectId: string;
  memberPortalUserId: string;
  role: "OWNER" | "VIEWER";
}): { member: ProjectMember } {
  const project = resolveProjectRecord(input.projectId);
  const member = project.members.find(
    (entry) => entry.portalUserId === input.memberPortalUserId,
  );
  if (!member) {
    throw new Error("Workbench member not found.");
  }

  return {
    member: {
      ...member,
      role: input.role,
    },
  };
}

export function simulateWorkbenchRemoveProjectMember(input: {
  projectId: string;
  memberPortalUserId: string;
}): { removed: true } {
  const project = resolveProjectRecord(input.projectId);
  const exists = project.members.some(
    (entry) => entry.portalUserId === input.memberPortalUserId,
  );
  if (!exists) {
    throw new Error("Workbench member not found.");
  }

  return { removed: true };
}

export function simulateWorkbenchSoftDeleteProjectLeads(input: {
  projectId: string;
  leadIds: string[];
  reasonCode: string;
  note?: string;
}): { leads: ProjectLead[] } {
  const project = resolveProjectRecord(input.projectId);
  const now = new Date().toISOString();

  return {
    leads: project.activeLeads
      .filter((lead) => input.leadIds.includes(lead.id))
      .map((lead) => ({
        ...lead,
        visibilityState: "HIDDEN",
        hiddenAt: now,
        hiddenByPortalUserId: personaUsers.owner.id,
        hiddenByUserEmail: personaUsers.owner.email,
        hiddenByUserFullName: personaUsers.owner.fullName,
        hiddenReasonCode: input.reasonCode,
        hiddenReasonNote: input.note ?? null,
      })),
  };
}

export function simulateWorkbenchRestoreProjectLeads(input: {
  projectId: string;
  leadIds: string[];
  note?: string;
}): { leads: ProjectLead[] } {
  const project = resolveProjectRecord(input.projectId);
  const now = new Date().toISOString();

  return {
    leads: project.hiddenLeads
      .filter((lead) => input.leadIds.includes(lead.id))
      .map((lead) => ({
        ...lead,
        visibilityState: "VISIBLE",
        hiddenAt: null,
        hiddenByPortalUserId: null,
        hiddenByUserEmail: null,
        hiddenByUserFullName: null,
        hiddenReasonCode: null,
        hiddenReasonNote: null,
        lastRestoredAt: now,
        lastRestoredByPortalUserId: personaUsers.owner.id,
        lastRestoredByUserEmail: personaUsers.owner.email,
        lastRestoredByUserFullName: personaUsers.owner.fullName,
        auditEvents: [
          ...lead.auditEvents,
          makeAuditEvent({
            id: `audit-restore-${lead.id}`,
            projectId: lead.projectId,
            projectLeadId: lead.id,
            actorUserId: personaUsers.owner.id,
            actorUserEmail: personaUsers.owner.email,
            actorUserFullName: personaUsers.owner.fullName,
            type: "RESTORED",
            reasonCode: null,
            note: input.note ?? null,
            createdAt: now,
          }),
        ],
      })),
  };
}

export function simulateWorkbenchRevealProjectLead(input: {
  projectId: string;
  leadId: string;
}): { lead: ProjectLead; expiresAt: string } {
  const project = resolveProjectRecord(input.projectId);
  const lead =
    project.activeLeads.find((entry) => entry.id === input.leadId) ??
    project.hiddenLeads.find((entry) => entry.id === input.leadId);

  if (!lead) {
    throw new Error("Workbench lead not found.");
  }

  return {
    lead,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
  };
}

export function simulateWorkbenchHardDeleteProjectLeads(input: {
  projectId: string;
  leadIds: string[];
  reasonCode: string;
  note?: string;
}): { tombstones: ProjectLeadDeletionTombstone[] } {
  const now = new Date().toISOString();

  return {
    tombstones: input.leadIds.map((leadId) => ({
      id: `tombstone-${leadId}`,
      projectId: input.projectId,
      deletedProjectLeadId: leadId,
      deletedSourceLeadId: null,
      deletedByUserId: personaUsers.operator.id,
      deletedByUserEmail: personaUsers.operator.email,
      deletedByUserFullName: personaUsers.operator.fullName,
      reasonCode: input.reasonCode,
      note: input.note ?? null,
      createdAt: now,
    })),
  };
}

export function getLocalWorkbenchNotice(): WorkbenchMutationNotice {
  return {
    kind: "SIMULATED",
    message:
      "Local workbench mode uses seeded project data and simulated mutations so UI iteration stays fast and safe.",
  };
}

export function getWorkbenchPersonaLabel(persona: LocalWorkbenchPersona): string {
  switch (persona) {
    case "operator":
      return "Operator";
    case "viewer":
      return "Viewer";
    default:
      return "Owner";
  }
}

export function getWorkbenchPersonaForUserId(
  userId: string,
): LocalWorkbenchPersona | null {
  for (const [persona, user] of Object.entries(personaUsers) as Array<
    [LocalWorkbenchPersona, PortalUserSummary]
  >) {
    if (user.id === userId) {
      return persona;
    }
  }

  return null;
}
