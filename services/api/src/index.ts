import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { rateLimit } from "express-rate-limit";
import { leadRouter } from "./routes/lead.js";
import { taxonomyRouter } from "./routes/taxonomy.js";
import { commerceRouter } from "./routes/commerce.js";
import { landingRouter } from "./routes/landing.js";
import { portalAuthRouter } from "./routes/portal-auth.js";
import { portalRouter } from "./routes/portal.js";
import { operatorRouter } from "./routes/operator.js";
import { pingDatabase } from "./services/leads.js";

const PORT = process.env["PORT"] ?? 3001;
const publicCorsMethods = ["GET", "POST", "OPTIONS"];
const credentialedCorsMethods = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"];

function createCorsMiddleware() {
  const origins = (process.env["CORS_ORIGINS"] ?? "http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return cors((req, callback) => {
    const request = req as express.Request;
    const requestOrigin = request.header("Origin");
    const isPublicLandingRoute = request.path.startsWith("/api/landing/public/");

    if (isPublicLandingRoute) {
      callback(null, {
        origin: requestOrigin || true,
        methods: publicCorsMethods,
        credentials: false,
      });
      return;
    }

    if (!requestOrigin || origins.includes(requestOrigin)) {
      callback(null, {
        origin: requestOrigin || true,
        methods: credentialedCorsMethods,
        credentials: true,
      });
      return;
    }

    callback(new Error(`CORS: ${requestOrigin} not allowed`));
  });
}

export function createApp() {
  const app = express();

  app.use(helmet());
  app.set("trust proxy", 1);

  app.use((_req, res, next) => {
    res.setHeader("X-Robots-Tag", "noindex, nofollow");
    next();
  });

  app.use(createCorsMiddleware());

  app.use(
    express.json({
      limit: "256kb",
      verify: (req, _res, buffer) => {
        (req as express.Request & { rawBody?: string }).rawBody = buffer.toString("utf8");
      },
    }),
  );
  app.use(express.urlencoded({ extended: false, limit: "64kb" }));

  app.use(
    morgan(process.env["NODE_ENV"] === "production" ? "combined" : "dev"),
  );

  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 2000,
      standardHeaders: true,
      legacyHeaders: false,
      message: { error: "Too many requests" },
    }),
  );

  app.get("/health", async (_req, res) => {
    try {
      await pingDatabase();
      res.json({
        status: "ok",
        service: "shasvata-api",
        database: "connected",
        version: "0.1.0",
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error("[health] Database check failed:", err);
      res.status(503).json({
        status: "degraded",
        service: "shasvata-api",
        database: "disconnected",
        version: "0.1.0",
        timestamp: new Date().toISOString(),
      });
    }
  });

  app.use("/api", leadRouter);
  app.use("/api", taxonomyRouter);
  app.use("/api/commerce", commerceRouter);
  app.use("/api/landing", landingRouter);
  app.use("/api/landing/auth", portalAuthRouter);
  app.use("/api/landing/portal", portalRouter);
  app.use("/api/operator", operatorRouter);

  app.use((_req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  app.use(
    (
      err: Error,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction,
    ) => {
      void _next;
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    },
  );

  return app;
}

const app = createApp();

if (process.env["NODE_ENV"] !== "test") {
  app.listen(PORT, () => {
    console.warn(`[shasvata-api] listening on :${PORT} (${process.env["NODE_ENV"] ?? "development"})`);
  });
}
