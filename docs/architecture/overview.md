# Architecture Overview

Shasvata is a pnpm and Turborepo monorepo. TypeScript owns app shells, shared packages, platform services, and worker orchestration. Python owns intelligence/data/scoring primitives and the fixture-backed intelligence API.

The foundation keeps services small:

- Next.js apps prove routes, health checks, shared UI usage, and fixture connectivity.
- Fastify handles general platform API placeholders.
- FastAPI handles intelligence data access and OpenAPI.
- PostgreSQL is the durable system of record.
- Redis is present for worker readiness and future background jobs.

The source-to-score ledger is the main domain model. Every metric must remain traceable to a source, confidence grade, validation state, methodology version, score run, and downstream insight/report.
