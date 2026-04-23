# Shasvata - Architecture

## System Overview

```text
Traefik (shared :80/:443)
├─ shasvata.com        -> web-public (Next.js)
├─ api.shasvata.com    -> api (Express)
└─ app.shasvata.com    -> web-app (Next.js)
                              ├─ PostgreSQL for application data
                              └─ Resend / SMTP for notifications
```

## Services

### web-public (Marketing Website)
- Tech: Next.js 14, TypeScript, Tailwind CSS, App Router
- Purpose: Public-facing marketing site
- Domain: `shasvata.com`
- Key patterns: Server Components, content-driven pages, standalone Docker output

### api (Lead Intake API)
- Tech: Express, TypeScript, Zod, PostgreSQL, Prisma
- Purpose: Lead intake, portal APIs, billing reads, notifications, project data
- Domain: `api.shasvata.com`
- Key patterns: Zod validation, honeypot spam protection, rate limiting, Postgres-first persistence

### web-app (Client Workspace Dashboard)
- Tech: Next.js 14, TypeScript, Tailwind CSS, App Router
- Purpose: Authenticated client and operator workspace for projects, leads, billing, analytics, and settings
- Domain: `app.shasvata.com`
- Canonical routes:
  - `/dashboard`
  - `/dashboard/projects`
  - `/dashboard/projects/[projectId]`
  - `/dashboard/projects/[projectId]/leads`
  - `/dashboard/projects/[projectId]/billing`
  - `/dashboard/projects/[projectId]/analytics`
  - `/dashboard/settings`
- Legacy compatibility:
  - `/projects`
  - `/projects/[projectId]`
  - `/projects/[projectId]/leads`
  redirect permanently to the canonical dashboard namespace

### comms-platform (Shared Mail Microservice)
- Tech: Mailcow runtime plus TypeScript control plane
- Purpose: Shared mailbox platform for Shasvata and related founder-owned domains
- Domains: `mail.shasvata.com`, `autoconfig.<tenant>`, `autodiscover.<tenant>`
- Key patterns: tenant/domain separation, audit trail, policy-safe routing

## Network Model

- `proxy_net` (external): Shared Docker network managed by Traefik
- `shasvata_internal_net` (bridge): Private network for app-to-app communication

## Container Registry

All Docker images are stored in GitHub Container Registry (GHCR):

| Image | Service |
|-------|---------|
| `ghcr.io/rsuyash/shasvata-api` | API |
| `ghcr.io/rsuyash/shasvata-web-public` | Marketing site |
| `ghcr.io/rsuyash/shasvata-web-app` | Client workspace dashboard |

Tags:
- `pr-<number>` for PR candidates
- `<sha>` for released builds
- `main` for latest production

## VPS Layout

```text
/home/naya/apps/shasvata/
├── .env
├── docker-compose.yml
├── docker-compose.prod.yml
├── services/
├── scripts/deploy/
└── docs/
```

Users:
- `nivi` - host admin, Docker operator, deploy user
- `naya` - app owner, no sudo, no Docker access

## CI/CD Pipeline

```text
PR opened
├─ pr-validate.yml       -> branch rules, tests, build checks
└─ pr-artifacts.yml      -> build Docker images, push PR-tagged GHCR artifacts

Merge to main
└─ deploy.yml            -> promote images, SSH deploy to VPS, smoke checks

Manual recovery
├─ deploy-catchup.yml
└─ deploy-fallback-ssh.yml
```

## Data Flow

### Public lead flow

```text
User submits form
-> web-public / landing page
-> POST /api/lead
-> api validation + spam checks
-> PostgreSQL
-> notification delivery
-> portal visibility + exports
```

### Authenticated workspace flow

```text
User signs in
-> app.shasvata.com
-> /dashboard/projects
-> project overview / leads / billing / analytics
-> api.shasvata.com portal endpoints
-> PostgreSQL-backed project data
```

## Expansion Path

- richer account settings and notification preferences
- deeper analytics modules
- session/cache support via Redis if needed
- reporting views or replicas as lead volume grows
- additional domains onboarded through the shared comms platform
