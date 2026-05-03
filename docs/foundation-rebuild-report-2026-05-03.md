# Shasvata Foundation Rebuild Report

Date: 2026-05-03  
Branch: `refactor/shasvata-foundation-v1`  
Archive branch preserved: `archive/pre-shasvata-foundation`  
Live VPS target: `ssh nivi` / `srv1277938`  
Live checkout: `/home/nivi/apps/shasvata-foundation-v1`

## Executive Summary

The Shasvata repository has been rebuilt as a clean Shasvata-native foundation monorepo. The old Naya/GrowthOS/lead-infrastructure code and the old technical `iccaa` service have been removed from the active architecture. The new base is organized around apps, platform services, intelligence services, shared packages, Python scoring primitives, database migrations, Docker Compose, Traefik, GHCR-compatible images, CI/CD workflows, and developer runbooks.

The new production stack is live on the VPS under Docker Compose project `shasvata-prod` with ten running containers:

- `www`
- `insights`
- `intelligence`
- `app`
- `admin`
- `platform-api`
- `intelligence-api`
- `worker`
- `postgres`
- `redis`

Live public smoke checks are passing for the resolvable routes. The canonical `admin.shasvata.com` and `intelligence.shasvata.com` DNS records are not present yet, so temporary public fallbacks are live at `https://shasvata.com/admin` and `https://shasvata.com/intelligence`. The production Traefik routers for the canonical subdomains already exist and should start working once DNS A records point to the VPS.

## What Changed

The repository was rebuilt into the planned foundation structure:

- `apps/www`
- `apps/insights`
- `apps/intelligence`
- `apps/app`
- `apps/admin`
- `services/platform-api`
- `services/intelligence-api`
- `services/worker`
- `packages/ui`, `tokens`, `config`, `types`, `schemas`, `charts`, `content`, `telemetry`
- `python/shasvata_core`
- `db/migrations`, `db/seeds`, `db/fixtures`
- `infra/docker`, `infra/traefik`, `infra/deploy`, `infra/smoke`, `infra/monitoring`
- `scripts/setup`, `scripts/dev`, `scripts/db`, `scripts/smoke`, `scripts/deploy`
- `docs/architecture`, `docs/methodology`, `docs/product`, `docs/data-dictionary`, `docs/runbooks`, `docs/decisions`
- `.github/workflows`

The repo now has pnpm workspaces, Turborepo orchestration, TypeScript app/service foundations, Python intelligence primitives, Postgres schema namespaces, Redis worker readiness, Dockerfiles for every app/service, local and production Compose files, Traefik labels, CI validation, image build workflow, deployment workflow, rollback workflow, smoke scripts, and architecture/runbook documentation.

## Live Deployment State

Production is running from commit `e2494fd`.

Live image tags on the VPS:

- `ghcr.io/rsuyash/shasvata/www:e2494fd`
- `ghcr.io/rsuyash/shasvata/insights:e2494fd`
- `ghcr.io/rsuyash/shasvata/intelligence:e2494fd`
- `ghcr.io/rsuyash/shasvata/app:e2494fd`
- `ghcr.io/rsuyash/shasvata/admin:e2494fd`
- `ghcr.io/rsuyash/shasvata/platform-api:e2494fd`
- `ghcr.io/rsuyash/shasvata/intelligence-api:e2494fd`
- `ghcr.io/rsuyash/shasvata/worker:e2494fd`

The old Shasvata containers were stopped and removed without deleting old volumes. No running container with `iccaa` in its name remains.

## Live URLs Verified

These returned HTTP 200 from the local machine and/or the VPS:

- `https://shasvata.com/health`
- `https://shasvata.com/`
- `https://insights.shasvata.com/health`
- `https://app.shasvata.com/health`
- `https://shasvata.com/intelligence/health`
- `https://shasvata.com/admin/health`
- `https://api.shasvata.com/health`
- `https://api.shasvata.com/v1/status`
- `https://api.shasvata.com/intelligence/health`
- `https://api.shasvata.com/intelligence/v1/status`
- `https://api.shasvata.com/intelligence/v1/companies`

DNS follow-up required:

- `intelligence.shasvata.com` does not resolve yet.
- `admin.shasvata.com` does not resolve yet.

Add A records for both hosts to `93.127.199.24`. The Traefik routers are already configured.

## Verification Evidence

Local validation passed:

- `pnpm install`
- `pnpm lint` -> 21/21 Turborepo tasks successful
- `pnpm typecheck` -> 21/21 Turborepo tasks successful
- `pnpm test` -> 21/21 Turborepo tasks successful
- `pnpm python:test` -> 5 Python/API tests passed
- `pnpm build` -> 15/15 Turborepo build tasks successful
- `git diff --check`
- `docker compose config --quiet`
- `docker compose -f docker-compose.prod.yml config --quiet`

Remote VPS validation passed:

- `ssh nivi` available.
- Docker version: `28.2.2`.
- Docker Compose version: `v2.24.5`.
- Traefik container present.
- External Docker network `proxy_net` present.
- Remote Docker build completed with exit `0`.
- Branch-scoped Compose test stack passed all localhost smoke checks.
- Production Compose stack is running as `shasvata-prod`.
- Live HTTPS smoke checks passed for every resolvable public route.

GitHub PR validation passed:

- PR: `https://github.com/RSuyash/Shasvata/pull/1`
- `validate` workflow passed.
- Docker Build matrix passed for `www`, `insights`, `intelligence`, `app`, `admin`, `platform-api`, `intelligence-api`, and `worker`.

Local developer-machine Docker note:

- Windows Docker Desktop did not expose the local Linux engine during validation, so local `docker compose build` could not run on this machine.
- The same Docker build was run successfully on the VPS, which is the live Linux target.

## CI/CD And Deployment Foundation

GitHub workflows now include:

- CI: install, lint, typecheck, JS tests, build, Python tests.
- Docker Build: matrix build for all apps/services, with GHCR push on `main`.
- Deploy: waits for successful Docker Build workflow on `main`, then deploys the matching image tag on the VPS.
- Deploy Rollback: manual image-tag rollback workflow.

The production deploy script expects:

- `DEPLOY_TARGET_PATH`
- `GHCR_IMAGE_NAMESPACE`
- `IMAGE_TAG`

Secrets stay in GitHub Actions or the VPS `.env`; no production secrets were committed.

## Known External Follow-Ups

1. Add DNS records:
   - `admin.shasvata.com -> 93.127.199.24`
   - `intelligence.shasvata.com -> 93.127.199.24`

2. Merge the branch to `main` after review so GitHub Actions can publish canonical GHCR images with the final main SHA.

3. The VPS currently has GHCR login, but direct `docker push` from the VPS failed with:
   - `permission_denied: The token provided does not match expected scopes.`

   This does not block the live stack because images are already built and running locally on the VPS with GHCR-compatible tags. For future server-side pushes, update the VPS GHCR token with package write scope. The GitHub Actions image publish path is already configured with `packages: write`.

## Bottom Line

The foundational architecture is implemented, tested, Docker-built on the VPS, and live through Traefik for all resolvable routes. The repository now has the clean Shasvata-native architecture needed for future intelligence, advisory, connect, impact, and academy work without carrying the old technical identity drift forward.
