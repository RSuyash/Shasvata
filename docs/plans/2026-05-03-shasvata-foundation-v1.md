# Shasvata Foundation V1 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild the repository into a Shasvata-native monorepo foundation with apps, APIs, shared packages, Python intelligence primitives, database schema, Docker, CI/CD, smoke checks, and developer docs.

**Architecture:** Use pnpm workspaces and Turborepo to coordinate five Next.js app shells, two APIs, one worker, shared TypeScript packages, and Python domain modules. Keep runtime surfaces fixture-backed and health-checkable while preparing PostgreSQL, Redis, Docker Compose, Traefik labels, GHCR workflows, and VPS deployment scripts for the next production hardening sprint.

**Tech Stack:** TypeScript, Next.js, Fastify, Zod, Vitest, Python 3.11+, FastAPI, Pydantic, pytest, PostgreSQL, Redis, Docker Compose, Traefik, GitHub Actions, GHCR.

---

### Task 1: Repository Safety And Cleanup

**Files:**
- Preserve: `docs/architecture.md`
- Create: `docs/plans/2026-05-03-shasvata-foundation-v1.md`
- Remove old tracked runtime surfaces that do not fit the target architecture.

**Steps:**
1. Confirm branch safety procedure has created `archive/pre-shasvata-foundation`.
2. Work only on `refactor/shasvata-foundation-v1`.
3. Remove old Naya/GrowthOS/lead and legacy intelligence implementation paths.
4. Keep or rewrite only docs needed for the Shasvata foundation.

### Task 2: Root Workspace

**Files:**
- Create/replace: `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `tsconfig.base.json`, `eslint.config.js`, `prettier.config.js`, `.gitignore`, `.env.example`, `README.md`

**Steps:**
1. Add root scripts for `dev`, `build`, `lint`, `typecheck`, `test`, `format`, `clean`, `docker:dev`, `docker:build`, `db:migrate`, `db:seed`, `smoke`, and `python:test`.
2. Configure pnpm workspaces for `apps/*`, `services/*`, and `packages/*`.
3. Configure Turborepo tasks with cacheable build, lint, typecheck, test, and clean tasks.

### Task 3: Shared TypeScript Packages

**Files:**
- Create packages under `packages/tokens`, `packages/ui`, `packages/schemas`, `packages/types`, `packages/charts`, `packages/content`, `packages/config`, and `packages/telemetry`.

**Steps:**
1. Build packages as strict TypeScript libraries.
2. Add Zod schemas and inferred types.
3. Add shared UI, tokens, content fixtures, chart placeholders, config helpers, and telemetry helpers.
4. Add package-level `build`, `lint`, `typecheck`, `test`, and `clean` scripts.

### Task 4: App Shells

**Files:**
- Create apps under `apps/www`, `apps/insights`, `apps/intelligence`, `apps/app`, and `apps/admin`.

**Steps:**
1. Add Next.js app-router shells with required routes and `/health`.
2. Use shared UI/tokens/content/charts/types packages.
3. Keep all pages minimal, placeholder-driven, and route-complete.
4. Add Dockerfiles for all app shells.

### Task 5: Services

**Files:**
- Create `services/platform-api`, `services/intelligence-api`, and `services/worker`.

**Steps:**
1. Implement Fastify platform API with health/status/contact/advisory/report/mock-me endpoints and Zod validation.
2. Implement FastAPI intelligence API with fixture-backed companies, sectors, metrics, scores, compare, and methodology endpoints.
3. Implement a TypeScript Redis-ready worker with graceful shutdown and a health script.
4. Add tests and Dockerfiles.

### Task 6: Python Core And Database

**Files:**
- Create `python/shasvata_core/**`, `python/tests/**`, `python/pyproject.toml`, `db/migrations/001_foundation.sql`, `db/seeds/foundation.sql`, and `db/fixtures/intelligence/*.json`.

**Steps:**
1. Add domain stubs for intelligence, sources, validation, scoring, extraction, normalization, and exports.
2. Implement basic scoring and confidence functions with pytest coverage.
3. Add PostgreSQL schemas, foundational tables, indexes, seed data, and fixture JSON.

### Task 7: Infrastructure, CI/CD, And Smoke

**Files:**
- Create `docker-compose.yml`, `docker-compose.dev.yml`, `docker-compose.prod.yml`, `infra/**`, `scripts/**`, and `.github/workflows/*.yml`.

**Steps:**
1. Add local and production-like Compose files for Postgres, Redis, apps, services, and worker.
2. Add production Traefik labels and GHCR image naming without hardcoded secrets.
3. Add smoke checks for local/live health and API status endpoints.
4. Add CI, Docker build, deploy, and rollback workflows.

### Task 8: Documentation And Audit Report

**Files:**
- Create architecture, data dictionary, runbook, decision, and audit docs.

**Steps:**
1. Replace README with Shasvata foundation guidance.
2. Document app boundaries, service boundaries, source-to-score ledger, database, deployment, local development, smoke checks, rollback, and environment variables.
3. Add a final implementation audit report with validation evidence and known limitations.

### Task 9: Verification And PR

**Commands:**
- `pnpm install`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
- `python -m pip install -r services/intelligence-api/requirements.txt`
- `python -m pytest python/tests services/intelligence-api/tests`
- `docker compose build`
- `docker compose up -d postgres redis platform-api intelligence-api worker www insights intelligence app admin`
- `pnpm smoke`
- `git diff --check`

**Steps:**
1. Run local verification and fix failures from root cause evidence.
2. Push `refactor/shasvata-foundation-v1`.
3. Open PR titled `refactor: rebuild Shasvata foundation architecture`.
4. If credentials and infrastructure allow, inspect CI/deploy/VPS/live health. If not allowed by branch or secrets, document the precise blocker and current evidence.
