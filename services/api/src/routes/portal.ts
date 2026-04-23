import { Router, type NextFunction, type Request, type Response } from "express";
import {
  addProjectNotificationRecipient,
  consumeProjectInvite,
  createImportedProject,
  exportProjectLeadsCsv,
  exportProjectLeadsXlsx,
  getPortalSession,
  getProjectDetail,
  hardDeleteProjectLeads,
  inviteProjectMember,
  listProjectAccessSettings,
  listProjectLeadTombstones,
  listOperatorProjects,
  listAccessibleProjects,
  listProjectLeads,
  recordProjectSitePublish,
  resendProjectInvite,
  restoreProjectLeads,
  revealProjectLead,
  refreshImportedProjectSource,
  removeProjectNotificationRecipient,
  removeProjectMember,
  revokePortalSession,
  revokeProjectInvite,
  softDeleteProjectLeads,
  upsertProjectDomain,
  updateProjectInvite,
  updateProjectMemberRole,
  upsertProjectMdocSyncTarget,
  testProjectMdocSyncTarget,
  updateProjectTrackingSettings,
  verifyProjectDomain,
  readProjectInvite,
} from "../services/landing-platform-runtime.js";
import {
  getProjectBillingDetail,
  getPortfolioBillingDetail,
  updateProjectBillingCheckoutIdentity,
} from "../services/project-billing-runtime.js";
import {
  createProjectManualLead,
  importProjectLeadsCsv,
  listProjectAcquisitionCampaigns,
  listProjectAcquisitionConnectors,
  testProjectAcquisitionConnector,
  upsertProjectAcquisitionCampaign,
  upsertProjectAcquisitionConnector,
} from "../services/acquisition-runtime.js";
import {
  getProjectOnboardingSession,
  resolveProjectOnboardingSession,
  saveProjectOnboardingSession,
  submitProjectOnboardingSession,
} from "../services/project-onboarding-runtime.js";
import {
  PORTAL_SESSION_COOKIE,
  getPortalCookieOptions,
  readCookie,
} from "./portal-session-cookie.js";

type AuthenticatedPortalRequest = Request & {
  portalUser: {
    id: string;
    email: string;
    fullName: string | null;
    role: string;
    companyName: string | null;
  };
  portalSessionId: string;
};

function readRouteParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function readLeadExportMode(value: unknown): "basic" | "full" {
  return value === "full" ? "full" : "basic";
}

function readLeadTab(value: unknown): "active" | "hidden" {
  return value === "hidden" ? "hidden" : "active";
}

function readObject(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

function readLeadSourceKind(value: unknown, fallback: string): string {
  return value === "WEB_FORM" ||
    value === "MANUAL_ENTRY" ||
    value === "EVENT_IMPORT" ||
    value === "CSV_IMPORT" ||
    value === "META_LEAD_ADS" ||
    value === "LINKEDIN_LEAD_GEN" ||
    value === "GOOGLE_ADS"
    ? value
    : fallback;
}

function readConnectorStatus(value: unknown): string | undefined {
  return value === "ACTIVE" ||
    value === "INACTIVE" ||
    value === "NEEDS_AUTH" ||
    value === "ERROR"
    ? value
    : undefined;
}

function handlePortalError(error: unknown, res: Response) {
  if (error instanceof Error) {
    if (
      error.message === "Project access denied." ||
      error.message === "Project owner access required." ||
      error.message === "Operator access required."
    ) {
      res.status(403).json({ error: error.message });
      return;
    }

    if (
      error.message === "Landing project not found." ||
      error.message === "Project site not found." ||
      error.message === "Landing project domain not found." ||
      error.message === "Landing project notification recipient not found." ||
      error.message === "Onboarding session not found." ||
      error.message === "Project member not found." ||
      error.message === "Project lead not found." ||
      error.message === "Lead source connector not found." ||
      error.message === "Project invite not found."
    ) {
      res.status(404).json({ error: error.message });
      return;
    }

    if (
      error.message === "A paid cart is required before onboarding can begin." ||
      error.message === "At least one project owner is required."
    ) {
      res.status(409).json({ error: error.message });
      return;
    }

    if (
      error.message === "Lead hide reason is invalid." ||
      error.message === "Lead reveal reason is invalid." ||
      error.message === "Lead hard-delete reason is invalid." ||
      error.message === "Hard delete requires hidden leads only." ||
      error.message === "Billing phone must contain 10 to 15 digits." ||
      error.message === "GA4 measurement ID is invalid." ||
      error.message === "GTM container ID is invalid." ||
      error.message === "Meta Pixel ID is invalid." ||
      error.message === "MDOC endpoint is required." ||
      error.message === "MDOC endpoint is invalid." ||
      error.message === "MDOC API key is required." ||
      error.message === "MDOC API key is invalid." ||
      error.message === "MDOC source detail rules are invalid." ||
      error.message === "MDOC static defaults are invalid." ||
      error.message === "MDOC enum mappings are invalid." ||
      error.message === "MDOC label is too long." ||
      error.message === "MDOC source is too long." ||
      error.message === "MDOC fallback source detail is too long." ||
      error.message === "Campaign name is required." ||
      error.message === "Lead email is invalid." ||
      error.message === "Lead capturedAt is invalid." ||
      error.message === "Project invite email mismatch." ||
      error.message === "Project invite is invalid or expired."
    ) {
      res.status(400).json({ error: error.message });
      return;
    }

    if (error.message.startsWith("MDOC push failed (")) {
      res.status(502).json({ error: error.message });
      return;
    }
  }

  console.error("[landing-portal] Unexpected error:", error);
  res.status(500).json({ error: "Portal request failed." });
}

function requireOperator(
  req: Request,
  res: Response,
): req is AuthenticatedPortalRequest {
  const authenticatedRequest = req as AuthenticatedPortalRequest;
  if (
    authenticatedRequest.portalUser.role !== "PLATFORM_ADMIN" &&
    authenticatedRequest.portalUser.role !== "PLATFORM_OPERATOR"
  ) {
    res.status(403).json({ error: "Operator access required." });
    return false;
  }

  return true;
}

async function requirePortalSession(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const sessionId = readCookie(req.headers.cookie, PORTAL_SESSION_COOKIE);
  if (!sessionId) {
    res.status(401).json({ error: "Portal session required." });
    return;
  }

  try {
    const session = await getPortalSession(sessionId);
    if (!session) {
      res.clearCookie(PORTAL_SESSION_COOKIE, getPortalCookieOptions());
      res.status(401).json({ error: "Portal session required." });
      return;
    }

    const authenticatedRequest = req as AuthenticatedPortalRequest;
    authenticatedRequest.portalUser = {
      id: session.portalUser.id,
      email: session.portalUser.email,
      fullName: session.portalUser.fullName,
      role: session.portalUser.role,
      companyName: session.portalUser.companyName,
    };
    authenticatedRequest.portalSessionId = session.session.id;

    next();
  } catch (error) {
    handlePortalError(error, res);
  }
}

export const portalRouter = Router();

portalRouter.get("/session", requirePortalSession, async (req, res) => {
  const authenticatedRequest = req as AuthenticatedPortalRequest;

  res.status(200).json({
    authenticated: true,
    portalUser: authenticatedRequest.portalUser,
  });
});

portalRouter.post("/sign-out", requirePortalSession, async (req, res) => {
  const authenticatedRequest = req as AuthenticatedPortalRequest;

  await revokePortalSession(authenticatedRequest.portalSessionId);
  res.clearCookie(PORTAL_SESSION_COOKIE, getPortalCookieOptions());
  res.status(204).send();
});

portalRouter.get("/invites/:selector/:verifier", async (req, res) => {
  try {
    const invite = await readProjectInvite({
      selector: readRouteParam(req.params["selector"]),
      verifier: readRouteParam(req.params["verifier"]),
    });
    res.status(200).json(invite);
  } catch (error) {
    handlePortalError(error, res);
  }
});

portalRouter.post(
  "/invites/:selector/:verifier/consume",
  requirePortalSession,
  async (req, res) => {
    const authenticatedRequest = req as AuthenticatedPortalRequest;

    try {
      const invite = await consumeProjectInvite({
        selector: readRouteParam(req.params["selector"]),
        verifier: readRouteParam(req.params["verifier"]),
        portalUserId: authenticatedRequest.portalUser.id,
        email: authenticatedRequest.portalUser.email,
      });
      res.status(200).json({ invite });
    } catch (error) {
      handlePortalError(error, res);
    }
  },
);

portalRouter.post("/onboarding/resolve", requirePortalSession, async (req, res) => {
  const authenticatedRequest = req as AuthenticatedPortalRequest;

  try {
    const cartId = typeof req.body?.cartId === "string" ? req.body.cartId : "";
    const session = await resolveProjectOnboardingSession({
      portalUserId: authenticatedRequest.portalUser.id,
      cartId,
    });
    res.status(200).json({ session });
  } catch (error) {
    handlePortalError(error, res);
  }
});

portalRouter.get("/onboarding/:sessionId", requirePortalSession, async (req, res) => {
  const authenticatedRequest = req as AuthenticatedPortalRequest;

  try {
    const sessionId = readRouteParam(req.params["sessionId"]);
    const session = await getProjectOnboardingSession({
      portalUserId: authenticatedRequest.portalUser.id,
      sessionId,
    });
    res.status(200).json({ session });
  } catch (error) {
    handlePortalError(error, res);
  }
});

portalRouter.patch("/onboarding/:sessionId", requirePortalSession, async (req, res) => {
  const authenticatedRequest = req as AuthenticatedPortalRequest;

  try {
    const sessionId = readRouteParam(req.params["sessionId"]);
    const intake =
      req.body?.intake && typeof req.body.intake === "object" && !Array.isArray(req.body.intake)
        ? req.body.intake
        : {};
    const lastCompletedStep =
      typeof req.body?.lastCompletedStep === "string"
        ? req.body.lastCompletedStep
        : undefined;

    const session = await saveProjectOnboardingSession({
      portalUserId: authenticatedRequest.portalUser.id,
      sessionId,
      intake,
      lastCompletedStep,
    });
    res.status(200).json({ session });
  } catch (error) {
    handlePortalError(error, res);
  }
});

portalRouter.post(
  "/onboarding/:sessionId/submit",
  requirePortalSession,
  async (req, res) => {
    const authenticatedRequest = req as AuthenticatedPortalRequest;

    try {
      const sessionId = readRouteParam(req.params["sessionId"]);
      const result = await submitProjectOnboardingSession({
        portalUserId: authenticatedRequest.portalUser.id,
        sessionId,
      });
      res.status(200).json(result);
    } catch (error) {
      handlePortalError(error, res);
    }
  },
);

portalRouter.get("/projects", requirePortalSession, async (req, res) => {
  const authenticatedRequest = req as AuthenticatedPortalRequest;

  try {
    const projects = await listAccessibleProjects(authenticatedRequest.portalUser.id);
    res.status(200).json({ projects });
  } catch (error) {
    handlePortalError(error, res);
  }
});

portalRouter.get("/projects/:projectId", requirePortalSession, async (req, res) => {
  const authenticatedRequest = req as AuthenticatedPortalRequest;

  try {
    const projectId = readRouteParam(req.params["projectId"]);
    const project = await getProjectDetail({
      portalUserId: authenticatedRequest.portalUser.id,
      projectId,
    });
    res.status(200).json({ project });
  } catch (error) {
    handlePortalError(error, res);
  }
});

portalRouter.get(
  "/projects/:projectId/billing",
  requirePortalSession,
  async (req, res) => {
    const authenticatedRequest = req as AuthenticatedPortalRequest;

    try {
      const projectId = readRouteParam(req.params["projectId"]);
      const billing = await getProjectBillingDetail({
        portalUserId: authenticatedRequest.portalUser.id,
        projectId,
      });
      res.status(200).json({ billing });
    } catch (error) {
      handlePortalError(error, res);
    }
  },
);

portalRouter.patch(
  "/projects/:projectId/billing/checkout-identity",
  requirePortalSession,
  async (req, res) => {
    const authenticatedRequest = req as AuthenticatedPortalRequest;

    try {
      const config = await updateProjectBillingCheckoutIdentity({
        portalUserId: authenticatedRequest.portalUser.id,
        projectId: readRouteParam(req.params["projectId"]),
        billingPhone:
          typeof req.body?.billingPhone === "string" ? req.body.billingPhone : undefined,
      });
      res.status(200).json({ config });
    } catch (error) {
      handlePortalError(error, res);
    }
  },
);

portalRouter.get(
  "/billing",
  requirePortalSession,
  async (req, res) => {
    const authenticatedRequest = req as AuthenticatedPortalRequest;

    try {
      const portfolio = await getPortfolioBillingDetail({
        portalUserId: authenticatedRequest.portalUser.id,
      });
      res.status(200).json(portfolio);
    } catch (error) {
      handlePortalError(error, res);
    }
  },
);

portalRouter.get(
  "/projects/:projectId/leads",
  requirePortalSession,
  async (req, res) => {
    const authenticatedRequest = req as AuthenticatedPortalRequest;

    try {
      const projectId = readRouteParam(req.params["projectId"]);
      const leads = await listProjectLeads({
        portalUserId: authenticatedRequest.portalUser.id,
        projectId,
        tab: readLeadTab(req.query["tab"]),
      });
      res.status(200).json({ leads });
    } catch (error) {
      handlePortalError(error, res);
    }
  },
);

portalRouter.get(
  "/projects/:projectId/leads/tombstones",
  requirePortalSession,
  async (req, res) => {
    const authenticatedRequest = req as AuthenticatedPortalRequest;

    try {
      const projectId = readRouteParam(req.params["projectId"]);
      const tombstones = await listProjectLeadTombstones({
        portalUserId: authenticatedRequest.portalUser.id,
        projectId,
      });
      res.status(200).json({ tombstones });
    } catch (error) {
      handlePortalError(error, res);
    }
  },
);

portalRouter.post(
  "/projects/:projectId/leads/soft-delete",
  requirePortalSession,
  async (req, res) => {
    const authenticatedRequest = req as AuthenticatedPortalRequest;

    try {
      const leads = await softDeleteProjectLeads({
        portalUserId: authenticatedRequest.portalUser.id,
        projectId: readRouteParam(req.params["projectId"]),
        leadIds: Array.isArray(req.body?.leadIds)
          ? req.body.leadIds.filter((value: unknown): value is string => typeof value === "string")
          : [],
        reasonCode: typeof req.body?.reasonCode === "string" ? req.body.reasonCode : "",
        note: typeof req.body?.note === "string" ? req.body.note : undefined,
      });
      res.status(200).json({ leads });
    } catch (error) {
      handlePortalError(error, res);
    }
  },
);

portalRouter.post(
  "/projects/:projectId/leads/restore",
  requirePortalSession,
  async (req, res) => {
    const authenticatedRequest = req as AuthenticatedPortalRequest;

    try {
      const leads = await restoreProjectLeads({
        portalUserId: authenticatedRequest.portalUser.id,
        projectId: readRouteParam(req.params["projectId"]),
        leadIds: Array.isArray(req.body?.leadIds)
          ? req.body.leadIds.filter((value: unknown): value is string => typeof value === "string")
          : [],
        note: typeof req.body?.note === "string" ? req.body.note : undefined,
      });
      res.status(200).json({ leads });
    } catch (error) {
      handlePortalError(error, res);
    }
  },
);

portalRouter.post(
  "/projects/:projectId/leads/reveal",
  requirePortalSession,
  async (req, res) => {
    const authenticatedRequest = req as AuthenticatedPortalRequest;

    try {
      const result = await revealProjectLead({
        portalUserId: authenticatedRequest.portalUser.id,
        projectId: readRouteParam(req.params["projectId"]),
        leadId: typeof req.body?.leadId === "string" ? req.body.leadId : "",
        reasonCode: typeof req.body?.reasonCode === "string" ? req.body.reasonCode : "",
        note: typeof req.body?.note === "string" ? req.body.note : undefined,
      });
      res.status(200).json(result);
    } catch (error) {
      handlePortalError(error, res);
    }
  },
);

portalRouter.post(
  "/projects/:projectId/leads/hard-delete",
  requirePortalSession,
  async (req, res) => {
    const authenticatedRequest = req as AuthenticatedPortalRequest;

    try {
      if (String(req.body?.confirmation ?? "").trim().toLowerCase() !== "delete") {
        res.status(400).json({ error: "Hard delete confirmation is required." });
        return;
      }

      const tombstones = await hardDeleteProjectLeads({
        portalUserId: authenticatedRequest.portalUser.id,
        projectId: readRouteParam(req.params["projectId"]),
        leadIds: Array.isArray(req.body?.leadIds)
          ? req.body.leadIds.filter((value: unknown): value is string => typeof value === "string")
          : [],
        reasonCode: typeof req.body?.reasonCode === "string" ? req.body.reasonCode : "",
        note: typeof req.body?.note === "string" ? req.body.note : undefined,
      });
      res.status(200).json({ tombstones });
    } catch (error) {
      handlePortalError(error, res);
    }
  },
);

portalRouter.get(
  "/projects/:projectId/leads/export.csv",
  requirePortalSession,
  async (req, res) => {
    const authenticatedRequest = req as AuthenticatedPortalRequest;

    try {
      const projectId = readRouteParam(req.params["projectId"]);
      const mode = readLeadExportMode(req.query["mode"]);
      const csv = await exportProjectLeadsCsv({
        portalUserId: authenticatedRequest.portalUser.id,
        projectId,
        mode,
      });

      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=\"${projectId || "project"}-leads.csv\"`,
      );
      res.status(200).send(csv);
    } catch (error) {
      handlePortalError(error, res);
    }
  },
);

portalRouter.get(
  "/projects/:projectId/leads/export.xlsx",
  requirePortalSession,
  async (req, res) => {
    const authenticatedRequest = req as AuthenticatedPortalRequest;

    try {
      const projectId = readRouteParam(req.params["projectId"]);
      const mode = readLeadExportMode(req.query["mode"]);
      const workbook = await exportProjectLeadsXlsx({
        portalUserId: authenticatedRequest.portalUser.id,
        projectId,
        mode,
      });

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=\"${projectId || "project"}-leads.xlsx\"`,
      );
      res.status(200).send(workbook);
    } catch (error) {
      handlePortalError(error, res);
    }
  },
);

portalRouter.post(
  "/projects/:projectId/members",
  requirePortalSession,
  async (req, res) => {
    const authenticatedRequest = req as AuthenticatedPortalRequest;

    try {
      const projectId = readRouteParam(req.params["projectId"]);
      const email = typeof req.body?.email === "string" ? req.body.email : "";
      const fullName =
        typeof req.body?.fullName === "string" ? req.body.fullName : undefined;
      const role = req.body?.role === "OWNER" ? "OWNER" : "VIEWER";

      const invite = await inviteProjectMember({
        portalUserId: authenticatedRequest.portalUser.id,
        projectId,
        email,
        fullName,
        role,
      });

      res.status(201).json({ invite });
    } catch (error) {
      handlePortalError(error, res);
    }
  },
);

portalRouter.get(
  "/projects/:projectId/settings/access",
  requirePortalSession,
  async (req, res) => {
    const authenticatedRequest = req as AuthenticatedPortalRequest;

    try {
      const access = await listProjectAccessSettings({
        portalUserId: authenticatedRequest.portalUser.id,
        projectId: readRouteParam(req.params["projectId"]),
      });
      res.status(200).json(access);
    } catch (error) {
      handlePortalError(error, res);
    }
  },
);

portalRouter.patch(
  "/projects/:projectId/settings/tracking",
  requirePortalSession,
  async (req, res) => {
    const authenticatedRequest = req as AuthenticatedPortalRequest;

    try {
      const site = await updateProjectTrackingSettings({
        portalUserId: authenticatedRequest.portalUser.id,
        projectId: readRouteParam(req.params["projectId"]),
        ga4MeasurementId:
          typeof req.body?.ga4MeasurementId === "string" ? req.body.ga4MeasurementId : undefined,
        googleAdsTagId:
          typeof req.body?.googleAdsTagId === "string" ? req.body.googleAdsTagId : undefined,
        googleAdsConversionMode:
          req.body?.googleAdsConversionMode === "GA4_IMPORTED"
            ? "GA4_IMPORTED"
            : req.body?.googleAdsConversionMode === "DIRECT_LABEL"
              ? "DIRECT_LABEL"
              : undefined,
        googleAdsLeadConversionLabel:
          typeof req.body?.googleAdsLeadConversionLabel === "string"
            ? req.body.googleAdsLeadConversionLabel
            : undefined,
        gtmContainerId:
          typeof req.body?.gtmContainerId === "string" ? req.body.gtmContainerId : undefined,
        metaPixelId:
          typeof req.body?.metaPixelId === "string" ? req.body.metaPixelId : undefined,
        trackingNotes:
          typeof req.body?.trackingNotes === "string" ? req.body.trackingNotes : undefined,
      });

      res.status(200).json({ site });
    } catch (error) {
      handlePortalError(error, res);
    }
  },
);

portalRouter.put(
  "/projects/:projectId/settings/sync-targets/mdoc",
  requirePortalSession,
  async (req, res) => {
    const authenticatedRequest = req as AuthenticatedPortalRequest;

    try {
      const target = await upsertProjectMdocSyncTarget({
        portalUserId: authenticatedRequest.portalUser.id,
        projectId: readRouteParam(req.params["projectId"]),
        status: req.body?.status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
        label: typeof req.body?.label === "string" ? req.body.label : undefined,
        endpoint: typeof req.body?.endpoint === "string" ? req.body.endpoint : undefined,
        apiKey: typeof req.body?.apiKey === "string" ? req.body.apiKey : undefined,
        dataFrom: req.body?.dataFrom === "T" ? "T" : "E",
        source: typeof req.body?.source === "string" ? req.body.source : undefined,
        fallbackSourceDetail:
          typeof req.body?.fallbackSourceDetail === "string"
            ? req.body.fallbackSourceDetail
            : undefined,
        sourceDetailRules:
          req.body?.sourceDetailRules &&
          typeof req.body.sourceDetailRules === "object" &&
          !Array.isArray(req.body.sourceDetailRules)
            ? req.body.sourceDetailRules
            : undefined,
        staticDefaults:
          req.body?.staticDefaults &&
          typeof req.body.staticDefaults === "object" &&
          !Array.isArray(req.body.staticDefaults)
            ? req.body.staticDefaults
            : undefined,
        enumMappings:
          req.body?.enumMappings &&
          typeof req.body.enumMappings === "object" &&
          !Array.isArray(req.body.enumMappings)
            ? req.body.enumMappings
            : undefined,
      });

      res.status(200).json({ target });
    } catch (error) {
      handlePortalError(error, res);
    }
  },
);

portalRouter.post(
  "/projects/:projectId/settings/sync-targets/mdoc/test",
  requirePortalSession,
  async (req, res) => {
    const authenticatedRequest = req as AuthenticatedPortalRequest;

    try {
      const result = await testProjectMdocSyncTarget({
        portalUserId: authenticatedRequest.portalUser.id,
        projectId: readRouteParam(req.params["projectId"]),
        endpoint: typeof req.body?.endpoint === "string" ? req.body.endpoint : undefined,
        apiKey: typeof req.body?.apiKey === "string" ? req.body.apiKey : undefined,
        dataFrom: req.body?.dataFrom === "T" ? "T" : "E",
        source: typeof req.body?.source === "string" ? req.body.source : undefined,
        fallbackSourceDetail:
          typeof req.body?.fallbackSourceDetail === "string"
            ? req.body.fallbackSourceDetail
            : undefined,
        sourceDetailRules:
          req.body?.sourceDetailRules &&
          typeof req.body.sourceDetailRules === "object" &&
          !Array.isArray(req.body.sourceDetailRules)
            ? req.body.sourceDetailRules
            : undefined,
        staticDefaults:
          req.body?.staticDefaults &&
          typeof req.body.staticDefaults === "object" &&
          !Array.isArray(req.body.staticDefaults)
            ? req.body.staticDefaults
            : undefined,
        enumMappings:
          req.body?.enumMappings &&
          typeof req.body.enumMappings === "object" &&
          !Array.isArray(req.body.enumMappings)
            ? req.body.enumMappings
            : undefined,
      });

      res.status(200).json({ result });
    } catch (error) {
      handlePortalError(error, res);
    }
  },
);

portalRouter.get(
  "/projects/:projectId/acquisition",
  requirePortalSession,
  async (req, res) => {
    const authenticatedRequest = req as AuthenticatedPortalRequest;

    try {
      const projectId = readRouteParam(req.params["projectId"]);
      const [connectors, campaigns] = await Promise.all([
        listProjectAcquisitionConnectors({
          portalUserId: authenticatedRequest.portalUser.id,
          projectId,
        }),
        listProjectAcquisitionCampaigns({
          portalUserId: authenticatedRequest.portalUser.id,
          projectId,
        }),
      ]);

      res.status(200).json({ connectors, campaigns });
    } catch (error) {
      handlePortalError(error, res);
    }
  },
);

portalRouter.post(
  "/projects/:projectId/acquisition/connectors",
  requirePortalSession,
  async (req, res) => {
    const authenticatedRequest = req as AuthenticatedPortalRequest;

    try {
      const connector = await upsertProjectAcquisitionConnector({
        portalUserId: authenticatedRequest.portalUser.id,
        projectId: readRouteParam(req.params["projectId"]),
        connectorId: undefined,
        kind: readLeadSourceKind(req.body?.kind, "META_LEAD_ADS") as never,
        status: readConnectorStatus(req.body?.status) as never,
        label: typeof req.body?.label === "string" ? req.body.label : undefined,
        externalAccountId:
          typeof req.body?.externalAccountId === "string"
            ? req.body.externalAccountId
            : undefined,
        config: readObject(req.body?.config),
        metadata: readObject(req.body?.metadata),
      });

      res.status(201).json({ connector });
    } catch (error) {
      handlePortalError(error, res);
    }
  },
);

portalRouter.patch(
  "/projects/:projectId/acquisition/connectors/:connectorId",
  requirePortalSession,
  async (req, res) => {
    const authenticatedRequest = req as AuthenticatedPortalRequest;

    try {
      const connector = await upsertProjectAcquisitionConnector({
        portalUserId: authenticatedRequest.portalUser.id,
        projectId: readRouteParam(req.params["projectId"]),
        connectorId: readRouteParam(req.params["connectorId"]),
        kind: readLeadSourceKind(req.body?.kind, "META_LEAD_ADS") as never,
        status: readConnectorStatus(req.body?.status) as never,
        label: typeof req.body?.label === "string" ? req.body.label : undefined,
        externalAccountId:
          typeof req.body?.externalAccountId === "string"
            ? req.body.externalAccountId
            : undefined,
        config: readObject(req.body?.config),
        metadata: readObject(req.body?.metadata),
      });

      res.status(200).json({ connector });
    } catch (error) {
      handlePortalError(error, res);
    }
  },
);

portalRouter.post(
  "/projects/:projectId/acquisition/connectors/:connectorId/test",
  requirePortalSession,
  async (req, res) => {
    const authenticatedRequest = req as AuthenticatedPortalRequest;

    try {
      const result = await testProjectAcquisitionConnector({
        portalUserId: authenticatedRequest.portalUser.id,
        projectId: readRouteParam(req.params["projectId"]),
        connectorId: readRouteParam(req.params["connectorId"]),
      });

      res.status(200).json({ result });
    } catch (error) {
      handlePortalError(error, res);
    }
  },
);

portalRouter.post(
  "/projects/:projectId/acquisition/campaigns",
  requirePortalSession,
  async (req, res) => {
    const authenticatedRequest = req as AuthenticatedPortalRequest;

    try {
      const campaign = await upsertProjectAcquisitionCampaign({
        portalUserId: authenticatedRequest.portalUser.id,
        projectId: readRouteParam(req.params["projectId"]),
        campaignId: undefined,
        connectorId:
          typeof req.body?.connectorId === "string" ? req.body.connectorId : undefined,
        accountId: typeof req.body?.accountId === "string" ? req.body.accountId : undefined,
        provider: readLeadSourceKind(req.body?.provider, "GOOGLE_ADS") as never,
        externalCampaignId:
          typeof req.body?.externalCampaignId === "string"
            ? req.body.externalCampaignId
            : undefined,
        name: typeof req.body?.name === "string" ? req.body.name : "",
        status: typeof req.body?.status === "string" ? req.body.status : undefined,
        utmSource: typeof req.body?.utmSource === "string" ? req.body.utmSource : undefined,
        utmMedium: typeof req.body?.utmMedium === "string" ? req.body.utmMedium : undefined,
        utmCampaign:
          typeof req.body?.utmCampaign === "string" ? req.body.utmCampaign : undefined,
        metadata: readObject(req.body?.metadata),
      });

      res.status(201).json({ campaign });
    } catch (error) {
      handlePortalError(error, res);
    }
  },
);

portalRouter.patch(
  "/projects/:projectId/acquisition/campaigns/:campaignId",
  requirePortalSession,
  async (req, res) => {
    const authenticatedRequest = req as AuthenticatedPortalRequest;

    try {
      const campaign = await upsertProjectAcquisitionCampaign({
        portalUserId: authenticatedRequest.portalUser.id,
        projectId: readRouteParam(req.params["projectId"]),
        campaignId: readRouteParam(req.params["campaignId"]),
        connectorId:
          typeof req.body?.connectorId === "string" ? req.body.connectorId : undefined,
        accountId: typeof req.body?.accountId === "string" ? req.body.accountId : undefined,
        provider: readLeadSourceKind(req.body?.provider, "GOOGLE_ADS") as never,
        externalCampaignId:
          typeof req.body?.externalCampaignId === "string"
            ? req.body.externalCampaignId
            : undefined,
        name: typeof req.body?.name === "string" ? req.body.name : "",
        status: typeof req.body?.status === "string" ? req.body.status : undefined,
        utmSource: typeof req.body?.utmSource === "string" ? req.body.utmSource : undefined,
        utmMedium: typeof req.body?.utmMedium === "string" ? req.body.utmMedium : undefined,
        utmCampaign:
          typeof req.body?.utmCampaign === "string" ? req.body.utmCampaign : undefined,
        metadata: readObject(req.body?.metadata),
      });

      res.status(200).json({ campaign });
    } catch (error) {
      handlePortalError(error, res);
    }
  },
);

portalRouter.post(
  "/projects/:projectId/acquisition/imports/csv",
  requirePortalSession,
  async (req, res) => {
    const authenticatedRequest = req as AuthenticatedPortalRequest;

    try {
      const result = await importProjectLeadsCsv({
        portalUserId: authenticatedRequest.portalUser.id,
        projectId: readRouteParam(req.params["projectId"]),
        connectorId:
          typeof req.body?.connectorId === "string" ? req.body.connectorId : undefined,
        campaignId:
          typeof req.body?.campaignId === "string" ? req.body.campaignId : undefined,
        csvText: typeof req.body?.csvText === "string" ? req.body.csvText : "",
        fieldMapping: readObject(req.body?.fieldMapping) ?? {},
        filename: typeof req.body?.filename === "string" ? req.body.filename : undefined,
        label: typeof req.body?.label === "string" ? req.body.label : undefined,
        sourceKind: readLeadSourceKind(req.body?.sourceKind, "CSV_IMPORT") as never,
      });

      res.status(201).json(result);
    } catch (error) {
      handlePortalError(error, res);
    }
  },
);

portalRouter.post(
  "/projects/:projectId/acquisition/manual-leads",
  requirePortalSession,
  async (req, res) => {
    const authenticatedRequest = req as AuthenticatedPortalRequest;

    try {
      const lead = await createProjectManualLead({
        portalUserId: authenticatedRequest.portalUser.id,
        projectId: readRouteParam(req.params["projectId"]),
        sourceKind: readLeadSourceKind(req.body?.sourceKind, "MANUAL_ENTRY") as never,
        connectorId:
          typeof req.body?.connectorId === "string" ? req.body.connectorId : undefined,
        campaignId:
          typeof req.body?.campaignId === "string" ? req.body.campaignId : undefined,
        externalLeadId:
          typeof req.body?.externalLeadId === "string" ? req.body.externalLeadId : undefined,
        capturedAt:
          typeof req.body?.capturedAt === "string" ? req.body.capturedAt : undefined,
        eventName: typeof req.body?.eventName === "string" ? req.body.eventName : undefined,
        lead: {
          fullName: typeof req.body?.fullName === "string" ? req.body.fullName : undefined,
          email: typeof req.body?.email === "string" ? req.body.email : "",
          phone: typeof req.body?.phone === "string" ? req.body.phone : undefined,
          companyName:
            typeof req.body?.companyName === "string" ? req.body.companyName : undefined,
          message: typeof req.body?.message === "string" ? req.body.message : undefined,
          consent: typeof req.body?.consent === "boolean" ? req.body.consent : true,
          sourcePage:
            typeof req.body?.sourcePage === "string" ? req.body.sourcePage : undefined,
          sourceCta: typeof req.body?.sourceCta === "string" ? req.body.sourceCta : undefined,
          utmSource:
            typeof req.body?.utmSource === "string" ? req.body.utmSource : undefined,
          utmMedium:
            typeof req.body?.utmMedium === "string" ? req.body.utmMedium : undefined,
          utmCampaign:
            typeof req.body?.utmCampaign === "string" ? req.body.utmCampaign : undefined,
        },
      });

      res.status(201).json({ lead });
    } catch (error) {
      handlePortalError(error, res);
    }
  },
);

portalRouter.post(
  "/projects/:projectId/invites/:inviteId/resend",
  requirePortalSession,
  async (req, res) => {
    const authenticatedRequest = req as AuthenticatedPortalRequest;

    try {
      const invite = await resendProjectInvite({
        portalUserId: authenticatedRequest.portalUser.id,
        projectId: readRouteParam(req.params["projectId"]),
        inviteId: readRouteParam(req.params["inviteId"]),
      });
      res.status(200).json({ invite });
    } catch (error) {
      handlePortalError(error, res);
    }
  },
);

portalRouter.patch(
  "/projects/:projectId/invites/:inviteId",
  requirePortalSession,
  async (req, res) => {
    const authenticatedRequest = req as AuthenticatedPortalRequest;

    try {
      const invite = await updateProjectInvite({
        portalUserId: authenticatedRequest.portalUser.id,
        projectId: readRouteParam(req.params["projectId"]),
        inviteId: readRouteParam(req.params["inviteId"]),
        role: req.body?.role === "OWNER" ? "OWNER" : "VIEWER",
      });
      res.status(200).json({ invite });
    } catch (error) {
      handlePortalError(error, res);
    }
  },
);

portalRouter.delete(
  "/projects/:projectId/invites/:inviteId",
  requirePortalSession,
  async (req, res) => {
    const authenticatedRequest = req as AuthenticatedPortalRequest;

    try {
      const invite = await revokeProjectInvite({
        portalUserId: authenticatedRequest.portalUser.id,
        projectId: readRouteParam(req.params["projectId"]),
        inviteId: readRouteParam(req.params["inviteId"]),
      });
      res.status(200).json({ invite });
    } catch (error) {
      handlePortalError(error, res);
    }
  },
);

portalRouter.patch(
  "/projects/:projectId/members/:memberPortalUserId",
  requirePortalSession,
  async (req, res) => {
    const authenticatedRequest = req as AuthenticatedPortalRequest;

    try {
      const member = await updateProjectMemberRole({
        portalUserId: authenticatedRequest.portalUser.id,
        projectId: readRouteParam(req.params["projectId"]),
        memberPortalUserId: readRouteParam(req.params["memberPortalUserId"]),
        role: req.body?.role === "OWNER" ? "OWNER" : "VIEWER",
      });
      res.status(200).json({ member });
    } catch (error) {
      handlePortalError(error, res);
    }
  },
);

portalRouter.delete(
  "/projects/:projectId/members/:memberPortalUserId",
  requirePortalSession,
  async (req, res) => {
    const authenticatedRequest = req as AuthenticatedPortalRequest;

    try {
      const result = await removeProjectMember({
        portalUserId: authenticatedRequest.portalUser.id,
        projectId: readRouteParam(req.params["projectId"]),
        memberPortalUserId: readRouteParam(req.params["memberPortalUserId"]),
      });
      res.status(200).json(result);
    } catch (error) {
      handlePortalError(error, res);
    }
  },
);

portalRouter.post(
  "/projects/:projectId/notification-recipients",
  requirePortalSession,
  async (req, res) => {
    const authenticatedRequest = req as AuthenticatedPortalRequest;

    try {
      const recipient = await addProjectNotificationRecipient({
        portalUserId: authenticatedRequest.portalUser.id,
        projectId: readRouteParam(req.params["projectId"]),
        email: typeof req.body?.email === "string" ? req.body.email : "",
        label: typeof req.body?.label === "string" ? req.body.label : undefined,
      });

      res.status(201).json({ recipient });
    } catch (error) {
      handlePortalError(error, res);
    }
  },
);

portalRouter.delete(
  "/projects/:projectId/notification-recipients/:recipientId",
  requirePortalSession,
  async (req, res) => {
    const authenticatedRequest = req as AuthenticatedPortalRequest;

    try {
      await removeProjectNotificationRecipient({
        portalUserId: authenticatedRequest.portalUser.id,
        projectId: readRouteParam(req.params["projectId"]),
        recipientId: readRouteParam(req.params["recipientId"]),
      });

      res.status(204).send();
    } catch (error) {
      handlePortalError(error, res);
    }
  },
);

portalRouter.get("/ops/projects", requirePortalSession, async (req, res) => {
  if (!requireOperator(req, res)) {
    return;
  }

  const authenticatedRequest = req as AuthenticatedPortalRequest;

  try {
    const projects = await listOperatorProjects(authenticatedRequest.portalUser.id);
    res.status(200).json({ projects });
  } catch (error) {
    handlePortalError(error, res);
  }
});

portalRouter.post("/ops/projects", requirePortalSession, async (req, res) => {
  if (!requireOperator(req, res)) {
    return;
  }

  const authenticatedRequest = req as AuthenticatedPortalRequest;

  try {
    const created = await createImportedProject({
      portalUserId: authenticatedRequest.portalUser.id,
      projectSlug: typeof req.body?.projectSlug === "string" ? req.body.projectSlug : "",
      projectName: typeof req.body?.projectName === "string" ? req.body.projectName : "",
      repoUrl: typeof req.body?.repoUrl === "string" ? req.body.repoUrl : "",
      repoBranch:
        typeof req.body?.repoBranch === "string" ? req.body.repoBranch : undefined,
      repoRef: typeof req.body?.repoRef === "string" ? req.body.repoRef : undefined,
      clientCompany:
        typeof req.body?.clientCompany === "string" ? req.body.clientCompany : undefined,
      desiredLiveDomain:
        typeof req.body?.desiredLiveDomain === "string"
          ? req.body.desiredLiveDomain
          : undefined,
      operatorNotes:
        typeof req.body?.operatorNotes === "string" ? req.body.operatorNotes : undefined,
    });

    res.status(201).json(created);
  } catch (error) {
    handlePortalError(error, res);
  }
});

portalRouter.post(
  "/ops/projects/:projectId/repo-sync",
  requirePortalSession,
  async (req, res) => {
    if (!requireOperator(req, res)) {
      return;
    }

    const authenticatedRequest = req as AuthenticatedPortalRequest;

    try {
      const site = await refreshImportedProjectSource({
        portalUserId: authenticatedRequest.portalUser.id,
        projectId: readRouteParam(req.params["projectId"]),
        siteId: typeof req.body?.siteId === "string" ? req.body.siteId : "",
        repoUrl: typeof req.body?.repoUrl === "string" ? req.body.repoUrl : undefined,
        repoBranch:
          typeof req.body?.repoBranch === "string" ? req.body.repoBranch : undefined,
        repoRef: typeof req.body?.repoRef === "string" ? req.body.repoRef : undefined,
        deployedCommit:
          typeof req.body?.deployedCommit === "string"
            ? req.body.deployedCommit
            : undefined,
        runtimeProfile:
          req.body?.runtimeProfile === "ISOLATED_APP" ? "ISOLATED_APP" : undefined,
        operatorNotes:
          typeof req.body?.operatorNotes === "string" ? req.body.operatorNotes : undefined,
      });

      res.status(200).json({ site });
    } catch (error) {
      handlePortalError(error, res);
    }
  },
);

portalRouter.post(
  "/ops/projects/:projectId/domains",
  requirePortalSession,
  async (req, res) => {
    if (!requireOperator(req, res)) {
      return;
    }

    const authenticatedRequest = req as AuthenticatedPortalRequest;

    try {
      const domain = await upsertProjectDomain({
        portalUserId: authenticatedRequest.portalUser.id,
        projectId: readRouteParam(req.params["projectId"]),
        siteId: typeof req.body?.siteId === "string" ? req.body.siteId : undefined,
        host: typeof req.body?.host === "string" ? req.body.host : "",
        isPrimary: Boolean(req.body?.isPrimary),
      });

      res.status(201).json({ domain });
    } catch (error) {
      handlePortalError(error, res);
    }
  },
);

portalRouter.post(
  "/ops/projects/:projectId/domains/:domainId/verify",
  requirePortalSession,
  async (req, res) => {
    if (!requireOperator(req, res)) {
      return;
    }

    const authenticatedRequest = req as AuthenticatedPortalRequest;

    try {
      const domain = await verifyProjectDomain({
        portalUserId: authenticatedRequest.portalUser.id,
        projectId: readRouteParam(req.params["projectId"]),
        domainId: readRouteParam(req.params["domainId"]),
      });

      res.status(200).json({ domain });
    } catch (error) {
      handlePortalError(error, res);
    }
  },
);

portalRouter.post(
  "/ops/projects/:projectId/sites/:siteId/publish",
  requirePortalSession,
  async (req, res) => {
    if (!requireOperator(req, res)) {
      return;
    }

    const authenticatedRequest = req as AuthenticatedPortalRequest;

    try {
      const publishStatus =
        req.body?.publishStatus === "FAILED"
          ? "FAILED"
          : req.body?.publishStatus === "PUBLISHED"
            ? "PUBLISHED"
            : "DRAFT";
      const runtimeProfile =
        req.body?.runtimeProfile === "ISOLATED_APP" ? "ISOLATED_APP" : "STATIC_ARTIFACT";

      const result = await recordProjectSitePublish({
        portalUserId: authenticatedRequest.portalUser.id,
        projectId: readRouteParam(req.params["projectId"]),
        siteId: readRouteParam(req.params["siteId"]),
        publishStatus,
        runtimeProfile,
        deployedCommit:
          typeof req.body?.deployedCommit === "string"
            ? req.body.deployedCommit
            : undefined,
        previewHost:
          typeof req.body?.previewHost === "string" ? req.body.previewHost : undefined,
      });

      res.status(200).json(result);
    } catch (error) {
      handlePortalError(error, res);
    }
  },
);
