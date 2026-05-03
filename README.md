# Shasvata

Shasvata is sustainability intelligence infrastructure. This repository is the foundation monorepo for public surfaces, product shells, APIs, data primitives, scoring primitives, Docker infrastructure, and deployment workflows.

This is a foundation sprint, not final UI polish. The app screens are intentionally minimal placeholders that prove routing, health checks, fixture loading, and service boundaries.

## Monorepo Structure

- `apps/www` - public website for `shasvata.com`
- `apps/insights` - Academy / Insights publishing surface
- `apps/intelligence` - public Shasvata Intelligence product surface
- `apps/app` - authenticated workspace shell with mock auth only
- `apps/admin` - internal operator shell with mock auth only
- `services/platform-api` - TypeScript Fastify platform API
- `services/intelligence-api` - Python FastAPI intelligence API
- `services/worker` - Redis-ready background worker foundation
- `packages/*` - shared TypeScript primitives
- `python/shasvata_core` - reusable Python intelligence primitives
- `db` - migrations, seeds, and sample fixtures
- `infra` and `scripts` - Docker, Traefik, smoke, deployment, and local tooling

## Naming Rule

Do not use `iccaa` in folder names, package names, service names, database schemas, code symbols, Docker images, environment variables, or route namespaces. Use `intelligence` for technical primitives.

## Local Setup

```bash
pnpm install
python -m pip install -r services/intelligence-api/requirements.txt
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm python:test
```

## Docker Setup

```bash
cp .env.example .env
pnpm docker:build
docker compose up -d
pnpm smoke
```

## Health URLs

- `http://localhost:3000/health`
- `http://localhost:3001/health`
- `http://localhost:3002/health`
- `http://localhost:3003/health`
- `http://localhost:3004/health`
- `http://localhost:4000/health`
- `http://localhost:4100/health`

## CI/CD Overview

GitHub Actions runs lint, typecheck, tests, builds, Python tests, Docker image builds, GHCR publication on `main`, deploy, and manual rollback. Production Compose expects Traefik and an external `proxy_net`.

## Foundation Status

Implemented: monorepo wiring, route-complete shells, health routes, fixture-backed APIs, Dockerfiles, Compose, GHCR workflows, deployment skeleton, rollback skeleton, smoke checks, DB migration, sample fixtures, Python scoring tests, and docs.

Deferred: final UI, real auth, payments, full source ingestion, full extraction, LLM-assisted extraction, production admin authorization, and final methodology research.
