import { Prisma } from "@prisma/client";
import { Router, type NextFunction, type Request, type Response } from "express";
import { z } from "zod";
import { getPortalSession } from "../services/landing-platform-runtime.js";
import {
  createProjectBillingSnapshot,
  getProjectBillingConfig,
  previewProjectBillingOffer,
  supersedeProjectBillingSnapshot,
  updateProjectBillingConfig,
  updateProjectBillingSnapshotLinkage,
} from "../services/project-billing-runtime.js";
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

const contactSchema = z.object({
  email: z.string().email(),
  label: z.string().max(120).optional().nullable(),
});

const customLineSchema = z.object({
  slug: z.string().max(120).optional().nullable(),
  itemCode: z.string().min(1).max(120),
  label: z.string().min(1).max(200),
  quantity: z.number().int().min(1).max(100),
  unitPriceMinor: z.number().int().min(0),
  kind: z.enum(["PACKAGE", "ADDON", "QUOTE_ONLY"]).optional(),
  billingModel: z.enum(["FULL", "ADVANCE"]).optional(),
  checkoutMode: z.enum(["INSTANT", "QUOTE_ONLY"]).optional(),
  defaultDepositPercent: z.number().int().min(0).max(100).optional().nullable(),
});

const previewSchema = z.object({
  selections: z
    .array(
      z.object({
        slug: z.string().min(1).max(120),
        quantity: z.number().int().min(1).max(100),
      }),
    )
    .optional(),
  customLines: z.array(customLineSchema).optional(),
  couponCode: z.string().max(60).optional(),
  referralCode: z.string().max(60).optional(),
  operatorAdjustmentMinor: z.number().int().min(0).optional(),
  paymentMode: z.enum(["DEPOSIT", "FULL"]).optional(),
});

const updateConfigSchema = z.object({
  billingMode: z.enum(["CATALOG", "NEGOTIATED", "PROMO_ACTIVE", "HYBRID"]).optional(),
  currency: z.string().min(3).max(12).optional(),
  allowCoupons: z.boolean().optional(),
  allowReferral: z.boolean().optional(),
  allowOperatorOverride: z.boolean().optional(),
  defaultDepositPercent: z.number().int().min(0).max(100).optional().nullable(),
  defaultPaymentMode: z.enum(["DEPOSIT", "FULL"]).optional(),
  erpCustomerId: z.string().max(160).optional().nullable(),
  commercialOwnerUserId: z.string().max(120).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  contacts: z.array(contactSchema).optional(),
});

const createSnapshotSchema = previewSchema.extend({
  sourceType: z
    .enum(["CART", "OPERATOR_QUOTE", "PROMO_PREVIEW", "PROJECT_PLAN"])
    .optional(),
  approvalReason: z.string().max(2000).optional().nullable(),
  validUntil: z.string().datetime().optional().nullable(),
});

const supersedeSnapshotSchema = z.object({
  reason: z.string().max(2000).optional().nullable(),
});

const linkageSchema = z.object({
  erpQuotationId: z.string().max(160).optional().nullable(),
  erpSalesOrderId: z.string().max(160).optional().nullable(),
  erpInvoiceId: z.string().max(160).optional().nullable(),
  erpPaymentEntryIds: z.array(z.string().max(160)).optional(),
  quoteRequestId: z.string().max(120).optional().nullable(),
  checkoutSessionId: z.string().max(120).optional().nullable(),
  providerOrderId: z.string().max(160).optional().nullable(),
  paymentSessionId: z.string().max(160).optional().nullable(),
});

function readRouteParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function handleOperatorError(error: unknown, res: Response) {
  if (error instanceof z.ZodError) {
    res.status(400).json({
      error: "Validation failed.",
      issues: error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
    return;
  }

  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    res.status(409).json({
      error: "Another billing update was applied first. Refresh and try again.",
    });
    return;
  }

  if (error instanceof Error) {
    if (
      error.message === "Project access denied." ||
      error.message === "Operator access required."
    ) {
      res.status(403).json({ error: error.message });
      return;
    }

    if (error.message === "Billing snapshot not found.") {
      res.status(404).json({ error: error.message });
      return;
    }
  }

  console.error("[operator] Unexpected error:", error);
  res.status(500).json({ error: "Operator request failed." });
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
    handleOperatorError(error, res);
  }
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

export const operatorRouter = Router();

operatorRouter.get(
  "/projects/:projectId/billing-config",
  requirePortalSession,
  async (req, res) => {
    if (!requireOperator(req, res)) {
      return;
    }

    try {
      const projectId = readRouteParam(req.params["projectId"]);
      const config = await getProjectBillingConfig({
        portalUserId: req.portalUser.id,
        projectId,
      });
      res.status(200).json({ config });
    } catch (error) {
      handleOperatorError(error, res);
    }
  },
);

operatorRouter.patch(
  "/projects/:projectId/billing-config",
  requirePortalSession,
  async (req, res) => {
    if (!requireOperator(req, res)) {
      return;
    }

    try {
      const projectId = readRouteParam(req.params["projectId"]);
      const payload = updateConfigSchema.parse(req.body ?? {});
      const config = await updateProjectBillingConfig({
        portalUserId: req.portalUser.id,
        projectId,
        ...payload,
      });
      res.status(200).json({ config });
    } catch (error) {
      handleOperatorError(error, res);
    }
  },
);

operatorRouter.post(
  "/projects/:projectId/offers/preview",
  requirePortalSession,
  async (req, res) => {
    if (!requireOperator(req, res)) {
      return;
    }

    try {
      const projectId = readRouteParam(req.params["projectId"]);
      const payload = previewSchema.parse(req.body ?? {});
      const preview = await previewProjectBillingOffer({
        portalUserId: req.portalUser.id,
        projectId,
        ...payload,
      });
      res.status(200).json({ preview });
    } catch (error) {
      handleOperatorError(error, res);
    }
  },
);

operatorRouter.post(
  "/projects/:projectId/billing-snapshots",
  requirePortalSession,
  async (req, res) => {
    if (!requireOperator(req, res)) {
      return;
    }

    try {
      const projectId = readRouteParam(req.params["projectId"]);
      const payload = createSnapshotSchema.parse(req.body ?? {});
      const snapshot = await createProjectBillingSnapshot({
        portalUserId: req.portalUser.id,
        projectId,
        ...payload,
        validUntil: payload.validUntil ? new Date(payload.validUntil) : null,
      });
      res.status(201).json({ snapshot });
    } catch (error) {
      handleOperatorError(error, res);
    }
  },
);

operatorRouter.post(
  "/projects/:projectId/billing-snapshots/:snapshotId/supersede",
  requirePortalSession,
  async (req, res) => {
    if (!requireOperator(req, res)) {
      return;
    }

    try {
      const projectId = readRouteParam(req.params["projectId"]);
      const snapshotId = readRouteParam(req.params["snapshotId"]);
      const payload = supersedeSnapshotSchema.parse(req.body ?? {});
      const snapshot = await supersedeProjectBillingSnapshot({
        portalUserId: req.portalUser.id,
        projectId,
        snapshotId,
        reason: payload.reason ?? null,
      });
      res.status(200).json({ snapshot });
    } catch (error) {
      handleOperatorError(error, res);
    }
  },
);

operatorRouter.patch(
  "/projects/:projectId/billing-snapshots/:snapshotId/linkage",
  requirePortalSession,
  async (req, res) => {
    if (!requireOperator(req, res)) {
      return;
    }

    try {
      const projectId = readRouteParam(req.params["projectId"]);
      const snapshotId = readRouteParam(req.params["snapshotId"]);
      const payload = linkageSchema.parse(req.body ?? {});
      const linkage = await updateProjectBillingSnapshotLinkage({
        portalUserId: req.portalUser.id,
        projectId,
        snapshotId,
        ...payload,
      });
      res.status(200).json({ linkage });
    } catch (error) {
      handleOperatorError(error, res);
    }
  },
);
