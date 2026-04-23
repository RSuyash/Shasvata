import express, { Router } from "express";
import { z } from "zod";
import {
  CommerceServiceError,
  createCheckoutSession,
  createCheckoutSessionFromBillingSnapshot,
  createCommerceCart,
  createQuoteRequest,
  getCheckoutSession,
  getCommerceCart,
  getCommerceCatalog,
  getPortalSummary,
} from "../services/commerce.js";
import { processCashfreeWebhook } from "../services/cashfree-webhook.js";

export const commerceRouter = Router();

const selectionSchema = z.object({
  slug: z.string().min(1),
  quantity: z.number().int().min(1).max(20).default(1),
});

const buyerSchema = z
  .object({
    email: z.string().email().optional(),
    fullName: z.string().min(1).max(120).optional(),
    companyName: z.string().min(1).max(160).optional(),
    phone: z.string().min(7).max(20).optional(),
  })
  .optional();

const createCartSchema = z.object({
  selections: z.array(selectionSchema).min(1),
  buyer: buyerSchema,
  couponCode: z.string().max(40).optional(),
  referralCode: z.string().max(40).optional(),
  notes: z.string().max(1000).optional(),
  sourcePage: z.string().max(200).optional(),
  sourceCta: z.string().max(120).optional(),
});

const quoteRequestSchema = z.object({
  brief: z.record(z.unknown()).optional(),
  sourcePage: z.string().max(200).optional(),
});

const checkoutSchema = z.object({
  returnUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

const snapshotCheckoutSchema = z.object({
  billingSnapshotId: z.string().min(1).max(120),
  returnUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

function handleError(err: unknown, res: express.Response) {
  if (err instanceof z.ZodError) {
    res.status(400).json({
      error: "Validation failed",
      issues: err.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
    return;
  }

  if (err instanceof CommerceServiceError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  console.error("[commerce] Unexpected error:", err);
  res.status(500).json({ error: "Commerce request failed" });
}

commerceRouter.get("/catalog", async (_req, res) => {
  try {
    res.json(await getCommerceCatalog());
  } catch (err) {
    handleError(err, res);
  }
});

commerceRouter.post("/carts", async (req, res) => {
  try {
    const input = createCartSchema.parse(req.body);
    const cart = await createCommerceCart(input);
    res.status(201).json(cart);
  } catch (err) {
    handleError(err, res);
  }
});

commerceRouter.get("/carts/:cartId", async (req, res) => {
  try {
    res.json(await getCommerceCart(req.params["cartId"] ?? ""));
  } catch (err) {
    handleError(err, res);
  }
});

commerceRouter.post("/carts/:cartId/quote-requests", async (req, res) => {
  try {
    const input = quoteRequestSchema.parse(req.body);
    const cart = await createQuoteRequest({
      cartId: req.params["cartId"] ?? "",
      brief: input.brief,
      sourcePage: input.sourcePage,
    });
    res.status(201).json(cart);
  } catch (err) {
    handleError(err, res);
  }
});

commerceRouter.post("/carts/:cartId/checkout-sessions", async (req, res) => {
  try {
    const input = checkoutSchema.parse(req.body);
    const session = await createCheckoutSession({
      cartId: req.params["cartId"] ?? "",
      returnUrl: input.returnUrl,
      cancelUrl: input.cancelUrl,
    });
    res.status(201).json(session);
  } catch (err) {
    handleError(err, res);
  }
});

commerceRouter.post("/checkout-sessions", async (req, res) => {
  try {
    const input = snapshotCheckoutSchema.parse(req.body);
    const session = await createCheckoutSessionFromBillingSnapshot({
      billingSnapshotId: input.billingSnapshotId,
      returnUrl: input.returnUrl,
      cancelUrl: input.cancelUrl,
    });
    res.status(201).json(session);
  } catch (err) {
    handleError(err, res);
  }
});

commerceRouter.get("/checkout-sessions/:sessionId", async (req, res) => {
  try {
    res.json(await getCheckoutSession(req.params["sessionId"] ?? ""));
  } catch (err) {
    handleError(err, res);
  }
});

commerceRouter.get("/portal/summary", async (req, res) => {
  try {
    const email = z.string().email().parse(req.query["email"]);
    res.json(await getPortalSummary(email));
  } catch (err) {
    handleError(err, res);
  }
});

commerceRouter.post("/webhooks/cashfree", async (req, res) => {
  try {
    const rawBody =
      (req as express.Request & { rawBody?: string }).rawBody ??
      (typeof req.body === "string" ? req.body : JSON.stringify(req.body ?? {}));

    const result = await processCashfreeWebhook({
      rawBody,
      headers: req.headers,
    });
    res.status(202).json(result);
  } catch (err) {
    handleError(err, res);
  }
});
