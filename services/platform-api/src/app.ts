import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import Fastify from "fastify";
import { z } from "zod";
import { readCorsOrigins, readEnv } from "./env.js";

const ContactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  message: z.string().min(1)
});

const AdvisoryLeadSchema = ContactSchema.extend({
  organization: z.string().min(1),
  interestArea: z.string().default("foundation")
});

export function buildApp() {
  const env = readEnv();
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === "test" ? "silent" : "info"
    }
  });

  app.register(helmet);
  app.register(cors, {
    origin: readCorsOrigins(env.CORS_ORIGINS)
  });

  app.get("/health", async () => ({
    ok: true,
    service: "platform-api",
    environment: env.APP_ENV,
    version: "0.1.0",
    timestamp: new Date().toISOString()
  }));

  app.get("/v1/status", async () => ({
    ok: true,
    service: "platform-api",
    capabilities: ["health", "contact", "advisory-leads", "reports", "mock-workspace"],
    database: "configured-later",
    redis: "configured-later"
  }));

  app.post("/v1/contact", async (request, reply) => {
    const body = ContactSchema.parse(request.body);
    return reply.code(202).send({
      accepted: true,
      type: "contact",
      contact: {
        name: body.name,
        email: body.email
      }
    });
  });

  app.post("/v1/advisory-leads", async (request, reply) => {
    const body = AdvisoryLeadSchema.parse(request.body);
    return reply.code(202).send({
      accepted: true,
      type: "advisory-lead",
      organization: body.organization,
      interestArea: body.interestArea
    });
  });

  app.get("/v1/reports", async () => ({
    items: [
      {
        id: "sample-report-1",
        title: "Sample sustainability intelligence report",
        status: "sample"
      }
    ],
    page: 1,
    pageSize: 10,
    total: 1
  }));

  app.get("/v1/me/mock", async () => ({
    id: "mock-user",
    name: "Foundation Workspace User",
    auth: "not-implemented"
  }));

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof z.ZodError) {
      return reply.code(400).send({
        error: "validation_error",
        issues: error.issues
      });
    }

    return reply.code(500).send({
      error: "internal_error",
      message: "Unexpected platform API error"
    });
  });

  return app;
}
