# Shasvata

Growth infrastructure platform — marketing website, lead intake API, and client dashboard.

## Services

| Service | Path | Port | Domain |
|---------|------|------|--------|
| **web-public** | `services/web-public` | 3000 | `shasvata.com` |
| **api** | `services/api` | 3001 | `api.shasvata.com` |
| **web-app** | `services/web-app` | 3002 | `shasvata.com/app` |
| **iccaa-web** | `services/iccaa-web` | 8080 | `iccaa.shasvata.com` |

## Canonical Workspace Routes

The authenticated workspace now lives under the `/dashboard` namespace:

- `/dashboard`
- `/dashboard/projects`
- `/dashboard/projects/[projectId]`
- `/dashboard/projects/[projectId]/leads`
- `/dashboard/projects/[projectId]/billing`
- `/dashboard/projects/[projectId]/analytics`
- `/dashboard/settings`

Legacy `/projects` URLs are preserved as permanent redirects so existing links and bookmarks continue to work.

## Quick Start

```bash
# 1. Clone
git clone git@github.com:RSuyash/Shasvata.git
cd shasvata

# 2. Install dependencies
cd services/web-public && npm ci && cd ../..
cd services/api && npm ci && cd ../..
cd services/web-app && npm ci && cd ../..
cd services/iccaa-web && npm ci && cd ../..

# 3. Set up environment
cp .env.example .env
# Edit .env with your Notion API key, Resend key, etc.

# 4. Run locally
cd services/web-public && npm run dev   # http://localhost:3000
cd services/api && npm run dev          # http://localhost:3001
cd services/web-app && npm run dev      # http://localhost:3002/app
cd services/iccaa-web && npm run dev    # http://localhost:3003

# Or with Docker:
docker compose up --build
```

## Development Workflow

See [docs/ops/DEVELOPMENT_WORKFLOW.md](docs/ops/DEVELOPMENT_WORKFLOW.md).

- `main` is release-only — no direct commits
- Every change starts from a GitHub Issue
- Branch naming: `feat/<issue-number>-<name>`, `fix/<issue-number>-<name>`, etc.
- PRs require issue linkage and CI green before merge

## Deployment

Merge to `main` triggers automatic deployment:

1. PR builds Docker images → pushes to GHCR
2. Deploy workflow promotes images and SSH deploys to VPS
3. Post-deploy smoke checks validate all services

See [docs/architecture.md](docs/architecture.md) for infrastructure details.
