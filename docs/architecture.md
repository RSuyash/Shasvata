You are working inside the GitHub repository:

RSuyash/Shasvata

Your task is to perform a clean foundation rebuild of the Shasvata repository.

This is NOT a UI redesign task.
This is NOT a marketing website polish task.
This is NOT a feature sprint.
This is a foundation architecture sprint.

The goal is to transform the current repo into a clean, scalable, Shasvata-native monorepo foundation that can later support:
1. Shasvata Intelligence
2. Shasvata Advisory
3. Shasvata Connect
4. Shasvata Impact
5. Shasvata Academy / Insights

Important naming rule:
Do NOT use `iccaa` in any folder name, package name, service name, database schema, code symbol, Docker image name, environment variable, or route namespace.
Use `intelligence` everywhere in code.
ICCAA may only exist later as a public-facing methodology/report name, not as a technical primitive.

The current repo may contain older Naya/GrowthOS/lead-infrastructure assumptions. Remove that identity drift completely. The rebuilt repository must be Shasvata-native.

Primary goal:
Create the complete local-development → GitHub CI/CD → Docker image → GHCR → VPS/live deployment foundation, with all apps and services interconnectable, health-checkable, testable, and documented.

Do not focus on final UI.
Only create minimal placeholder screens needed to prove each app boots, routes, and connects correctly.

====================================================================
NON-NEGOTIABLE PRINCIPLES
====================================================================

1. Use a monorepo.
2. Use pnpm workspaces.
3. Use Turborepo for orchestration.
4. Use TypeScript for frontend apps and platform services.
5. Use Python for intelligence/data/scoring primitives.
6. Use PostgreSQL as the primary database.
7. Use Redis for worker/job readiness, even if minimally wired.
8. Use Docker Compose for local and production-like development.
9. Keep deployment compatible with Traefik, GHCR, and VPS.
10. Every app/service must expose a health route.
11. Every app/service must have a Dockerfile.
12. Every app/service must have a clear env contract.
13. Every app/service must be buildable independently.
14. Root scripts must run lint, typecheck, test, build, dev, docker, and smoke checks.
15. Do not build final UI yet.
16. Do not build full scraping/LLM extraction yet.
17. Do not build full auth/payments yet.
18. Do not overengineer into heavy microservices.
19. Build clean primitives and boundaries first.
20. Document everything needed for a future developer or AI agent to continue safely.

====================================================================
SAFETY PROCEDURE
====================================================================

Before modifying the repository, create an archive branch from the current main state.

Run:

git checkout main
git pull origin main
git checkout -b archive/pre-shasvata-foundation
git push origin archive/pre-shasvata-foundation

Then create the implementation branch:

git checkout main
git checkout -b refactor/shasvata-foundation-v1

All changes must happen on:

refactor/shasvata-foundation-v1

Do not push directly to main.
Do not assume existing code should be preserved unless it cleanly fits the new architecture.
The rebuild may remove existing app code, but the archive branch must preserve the old state.

====================================================================
TARGET REPOSITORY STRUCTURE
====================================================================

Rebuild the repo into this structure:

shasvata/
  apps/
    www/
    insights/
    intelligence/
    app/
    admin/

  services/
    platform-api/
    intelligence-api/
    worker/

  packages/
    ui/
    tokens/
    config/
    types/
    schemas/
    charts/
    content/
    telemetry/

  python/
    shasvata_core/
      intelligence/
      sources/
      validation/
      scoring/
      extraction/
      normalization/
      exports/
    pipelines/
      ingest/
      extract/
      transform/
      score/
      publish/
    tests/

  db/
    migrations/
    seeds/
    fixtures/

  infra/
    docker/
    traefik/
    deploy/
    smoke/
    monitoring/

  scripts/
    setup/
    dev/
    db/
    smoke/
    deploy/

  docs/
    architecture/
    methodology/
    product/
    data-dictionary/
    runbooks/
    decisions/

  .github/
    workflows/

Root files:
  package.json
  pnpm-workspace.yaml
  turbo.json
  tsconfig.base.json
  eslint.config.js
  prettier.config.js
  .gitignore
  .env.example
  docker-compose.yml
  docker-compose.dev.yml
  docker-compose.prod.yml
  README.md

====================================================================
APP BOUNDARIES
====================================================================

Create these app shells.

--------------------------------------------------------------------
apps/www
--------------------------------------------------------------------

Purpose:
Main public website for shasvata.com.

Current stage:
Minimal foundation shell only.

Required routes:
/
 /health
 /intelligence
 /advisory
 /connect
 /impact
 /academy
 /about
 /contact
 /legal/privacy
 /legal/terms

Required behavior:
- Next.js app.
- Uses shared UI package.
- Uses shared tokens package.
- Has a simple landing page stating:
  “Shasvata — Sustainability Intelligence Infrastructure”
- Shows links to Intelligence, Insights, App, and Admin placeholders.
- Has /health route returning JSON or simple text health status.
- No final visual polish required.

Package name:
@shasvata/www

--------------------------------------------------------------------
apps/insights
--------------------------------------------------------------------

Purpose:
Academy / Insights / research publishing surface.

Domain target:
insights.shasvata.com

Current stage:
Minimal content foundation only.

Required routes:
/
 /health
 /articles
 /glossary
 /methodology
 /regulatory-notes

Required behavior:
- Next.js app.
- Uses shared UI package.
- Uses shared content package.
- Include 2 sample MDX or JSON-backed article fixtures:
  1. “What is BRSR?”
  2. “Why source transparency matters in sustainability data”
- No CMS yet.
- Static content-first architecture.

Package name:
@shasvata/insights

--------------------------------------------------------------------
apps/intelligence
--------------------------------------------------------------------

Purpose:
Shasvata Intelligence public product surface.

Domain target:
intelligence.shasvata.com

Important:
Do not name this app ICCAA.
Do not use iccaa in package name, route names, service names, symbols, or env names.

Required routes:
/
 /health
 /explore
 /companies
 /companies/[slug]
 /sectors
 /sectors/[slug]
 /compare
 /reports
 /methodology
 /data
 /api-docs

Current stage:
Static fixture-backed product skeleton.

Required behavior:
- Next.js app.
- Uses shared UI package.
- Uses shared charts package.
- Uses shared schemas/types.
- Loads sample fixture data from db/fixtures/intelligence.
- Shows a minimal Intelligence home page with:
  - system status
  - sample company count
  - sample methodology version
  - links to explore, company, compare, methodology
- Company page should render sample metric values with confidence badges and source badges.
- No final dashboard design yet.
- No heavy chart polish yet.

Package name:
@shasvata/intelligence

--------------------------------------------------------------------
apps/app
--------------------------------------------------------------------

Purpose:
Authenticated user workspace shell.

Domain target:
app.shasvata.com

Current stage:
No real auth required yet. Use local mock shell.

Required routes:
/
 /health
 /dashboard
 /dashboard/saved
 /dashboard/reports
 /dashboard/api-keys
 /dashboard/settings

Required behavior:
- Next.js app.
- Shows placeholder workspace with “Authentication not implemented in foundation sprint.”
- Shows app-to-platform-api connectivity status if possible.
- No full auth, billing, or dashboard logic yet.

Package name:
@shasvata/app

--------------------------------------------------------------------
apps/admin
--------------------------------------------------------------------

Purpose:
Internal operator/admin console.

Domain target:
admin.shasvata.com

Current stage:
No real auth required yet. Use local mock shell with clear warning.

Required routes:
/
 /health
 /admin
 /admin/entities
 /admin/sources
 /admin/metrics
 /admin/score-runs
 /admin/reports

Required behavior:
- Next.js app.
- Shows placeholder admin console.
- Shows warning: “Foundation admin shell only. Secure auth must be enabled before production use.”
- Shows sample fixture counts.
- No production admin auth yet.

Package name:
@shasvata/admin

====================================================================
SERVICES
====================================================================

--------------------------------------------------------------------
services/platform-api
--------------------------------------------------------------------

Purpose:
General Shasvata platform API.

Responsibilities:
- health
- contact/advisory lead placeholders
- app workspace placeholders
- report/order/subscription placeholders
- API key placeholder structure
- no full auth/payments yet

Preferred stack:
TypeScript + Fastify + Zod.

Package name:
@shasvata/platform-api

Required endpoints:
GET /health
GET /v1/status
POST /v1/contact
POST /v1/advisory-leads
GET /v1/reports
GET /v1/me/mock

Required:
- Zod validation.
- Helmet/security basics.
- CORS with env-configurable allowed origins.
- structured JSON logs.
- Dockerfile.
- Typecheck.
- Minimal tests.

--------------------------------------------------------------------
services/intelligence-api
--------------------------------------------------------------------

Purpose:
Data/intelligence API for Shasvata Intelligence.

Preferred stack:
Python + FastAPI + Pydantic + SQLAlchemy-ready structure.

Package/service name:
@shasvata/intelligence-api in Docker/docs, Python package can be shasvata_intelligence_api.

Required endpoints:
GET /health
GET /v1/status
GET /v1/companies
GET /v1/companies/{slug}
GET /v1/companies/{slug}/metrics
GET /v1/companies/{slug}/scores
GET /v1/sectors
GET /v1/sectors/{slug}
POST /v1/compare
GET /v1/methodology

Current stage:
Return fixture-backed data from db/fixtures/intelligence.
Do not require live DB for first foundation pass, but structure service so DB can be wired later.

Required:
- Pydantic models.
- clean app factory.
- settings loaded from env.
- Dockerfile.
- pytest health test.
- OpenAPI available by default through FastAPI.

--------------------------------------------------------------------
services/worker
--------------------------------------------------------------------

Purpose:
Background job worker foundation.

Current stage:
Minimal worker that boots, connects to Redis if configured, logs heartbeat, and exits cleanly on shutdown.

Responsibilities later:
- report generation
- email dispatch
- score recomputation
- source ingestion
- extraction jobs

Preferred stack:
TypeScript worker or Python worker is acceptable.
Choose the simpler integration for this repo, but document the choice.

Required:
- health/readiness script or endpoint if HTTP is used.
- Dockerfile.
- env contract.
- placeholder job registry.

====================================================================
PACKAGES
====================================================================

--------------------------------------------------------------------
packages/tokens
--------------------------------------------------------------------

Package name:
@shasvata/tokens

Must export:
- brand colors
- confidence grade metadata
- spacing scale
- typography tokens
- z-index tokens
- chart semantic tokens

Use these exact brand color primitives:

Deep Forest: #1B4332
Medium Green: #40916C
Light Green: #D8F3DC
Brass Gold: #C9A84C
Warm Ivory: #FDF8F0
Near Black: #1A1A1A
Stone Gray: #6B7280
White: #FFFFFF

Confidence grades:
A = Verified public/structured source
B = Official PDF/reviewed extraction
C = Voluntary/proxy/limited source
D = Missing/not publicly disclosed

--------------------------------------------------------------------
packages/ui
--------------------------------------------------------------------

Package name:
@shasvata/ui

Create minimal shared components:
- Button
- Card
- Badge
- PageShell
- HealthPanel
- EmptyState
- DataTable
- MetricCard
- ConfidenceBadge
- SourceBadge
- CitationPopover
- MethodologyCallout

No final styling required.
Use clean, accessible, simple components.
Must compile in all apps.

--------------------------------------------------------------------
packages/schemas
--------------------------------------------------------------------

Package name:
@shasvata/schemas

Use Zod.

Create schemas:
- EntitySchema
- ReportingPeriodSchema
- SourceDocumentSchema
- SourceCitationSchema
- MetricDefinitionSchema
- MetricValueSchema
- MethodologyVersionSchema
- ScoreRunSchema
- ScoreSchema
- InsightSchema
- ReportSchema
- ActionEventSchema

Export inferred TypeScript types.

--------------------------------------------------------------------
packages/types
--------------------------------------------------------------------

Package name:
@shasvata/types

Re-export shared types from schemas.
Add API response types:
- ApiHealthResponse
- PaginatedResponse
- IntelligenceCompanyResponse
- IntelligenceMetricResponse
- IntelligenceScoreResponse

--------------------------------------------------------------------
packages/charts
--------------------------------------------------------------------

Package name:
@shasvata/charts

Create placeholder chart wrappers:
- ChartShell
- MetricTrendPlaceholder
- SectorScatterPlaceholder
- CompareBarsPlaceholder
- ConfidenceHeatmapPlaceholder

No final chart visuals yet.
The goal is shared chart boundaries.

--------------------------------------------------------------------
packages/content
--------------------------------------------------------------------

Package name:
@shasvata/content

Create content model helpers:
- Article
- GlossaryTerm
- MethodologyPage
- RegulatoryNote

Include sample content fixtures for insights app.

--------------------------------------------------------------------
packages/config
--------------------------------------------------------------------

Package name:
@shasvata/config

Shared config:
- eslint config if needed
- tsconfig helper if needed
- shared environment helpers
- app metadata constants

--------------------------------------------------------------------
packages/telemetry
--------------------------------------------------------------------

Package name:
@shasvata/telemetry

Minimal logging utilities:
- createLogger
- logEvent
- logError
- requestId helper

No external telemetry provider yet.

====================================================================
PYTHON CORE
====================================================================

Create:

python/shasvata_core/

Package purpose:
Reusable Python domain logic for Shasvata Intelligence.

Submodules:

python/shasvata_core/intelligence/
  models.py
  enums.py
  units.py
  constants.py

python/shasvata_core/sources/
  source_document.py
  source_tier.py
  citation.py
  hashing.py

python/shasvata_core/validation/
  ranges.py
  required_fields.py
  outliers.py
  confidence.py

python/shasvata_core/scoring/
  impact.py
  compensation.py
  credibility.py
  responsibility_ratio.py
  vbi.py
  versioning.py

python/shasvata_core/extraction/
  pdf_text.py
  pdf_tables.py
  brsr_templates.py
  llm_assist.py

python/shasvata_core/normalization/
  financial.py
  environmental.py
  sector_scaling.py

python/shasvata_core/exports/
  company_pdf.py
  csv_export.py
  json_export.py

Do not implement heavy extraction yet.
Create clean stubs with docstrings and TODOs where needed.

Implement basic scoring functions with tests:
- impact score placeholder formula
- compensation score placeholder formula
- credibility score placeholder formula
- responsibility ratio
- VBI
- confidence grade multiplier

Use Python 3.11+.

Add:
python/tests/test_scoring.py
python/tests/test_confidence.py

Add pyproject.toml inside python/ or root if appropriate.
Use pytest.

====================================================================
DATABASE FOUNDATION
====================================================================

Use PostgreSQL.

Create SQL migrations under:

db/migrations/

Use schema namespaces:

core
source
intelligence
content
commerce
app
audit

Create initial migration:

db/migrations/001_foundation.sql

It must create schemas:

CREATE SCHEMA IF NOT EXISTS core;
CREATE SCHEMA IF NOT EXISTS source;
CREATE SCHEMA IF NOT EXISTS intelligence;
CREATE SCHEMA IF NOT EXISTS content;
CREATE SCHEMA IF NOT EXISTS commerce;
CREATE SCHEMA IF NOT EXISTS app;
CREATE SCHEMA IF NOT EXISTS audit;

Create these foundational tables:

core.entities
core.reporting_periods

source.documents
source.citations
source.ingestion_runs
source.extraction_runs

intelligence.metric_definitions
intelligence.metric_values
intelligence.methodology_versions
intelligence.score_runs
intelligence.scores
intelligence.sector_benchmarks

content.articles
content.insights
content.reports

commerce.products
commerce.entitlements

app.saved_entities
app.saved_comparisons
app.api_keys

audit.events
audit.data_changes
audit.admin_reviews

Do not overbuild all columns.
But include:
- id
- slug/key where relevant
- status
- created_at
- updated_at
- JSON metadata where appropriate
- indexes for slug/key/entity_id/reporting_period_id

Add db/seeds/foundation.sql or JSON seed loader if easier.

Add fixtures:

db/fixtures/intelligence/companies.json
db/fixtures/intelligence/metrics.json
db/fixtures/intelligence/scores.json
db/fixtures/intelligence/sources.json
db/fixtures/intelligence/methodology.json

Include 3 sample companies only:
- Reliance Industries Limited
- Tata Steel Limited
- Infosys Limited

This is foundation data, not real final research data.
Mark all fixture values as sample/not final.

====================================================================
SOURCE-TO-SCORE LEDGER
====================================================================

Document and encode the core platform model:

Entity
  ↓
Source Document
  ↓
Source Citation
  ↓
Metric Definition
  ↓
Metric Value
  ↓
Confidence Grade
  ↓
Validation
  ↓
Score Run
  ↓
Score
  ↓
Insight
  ↓
Report / Dashboard / Advisory Action

Create document:

docs/architecture/source-to-score-ledger.md

It must explain:
- why every metric needs a source
- why every score needs a methodology version
- why confidence grades are first-class
- why manual review comes before automation
- how this supports Intelligence, Advisory, Connect, Impact, and Academy

====================================================================
INFRASTRUCTURE
====================================================================

Create Dockerfiles for:

apps/www
apps/insights
apps/intelligence
apps/app
apps/admin
services/platform-api
services/intelligence-api
services/worker

Create docker-compose.yml with services:
- postgres
- redis
- platform-api
- intelligence-api
- worker
- www
- insights
- intelligence
- app
- admin

Create docker-compose.dev.yml for local development overrides.

Create docker-compose.prod.yml with production-friendly settings and Traefik labels.

Domain mapping target:

shasvata.com -> apps/www
insights.shasvata.com -> apps/insights
intelligence.shasvata.com -> apps/intelligence
app.shasvata.com -> apps/app
admin.shasvata.com -> apps/admin
api.shasvata.com -> services/platform-api
api.shasvata.com/intelligence or intelligence-api internal route -> services/intelligence-api

For production compose, include Traefik labels but make them clean and documented.
Do not hardcode secrets.

Required networks:
- shasvata_internal_net
- proxy_net external for production

Required volumes:
- postgres_data
- redis_data if needed

====================================================================
ENVIRONMENT VARIABLES
====================================================================

Create root .env.example.

Include:

# General
NODE_ENV=
APP_ENV=
PUBLIC_BASE_URL=
INSIGHTS_BASE_URL=
INTELLIGENCE_BASE_URL=
APP_BASE_URL=
ADMIN_BASE_URL=
PLATFORM_API_BASE_URL=
INTELLIGENCE_API_BASE_URL=

# Database
POSTGRES_DB=
POSTGRES_USER=
POSTGRES_PASSWORD=
DATABASE_URL=

# Redis
REDIS_URL=

# CORS
CORS_ORIGINS=

# Email placeholder
RESEND_API_KEY=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=

# Security placeholders
JWT_SECRET=
SESSION_SECRET=
API_KEY_SECRET=

# Deployment
GHCR_IMAGE_NAMESPACE=
DEPLOY_TARGET_HOST=
DEPLOY_TARGET_PATH=

No real secrets.

Each app/service must read env safely and fail clearly if required env is missing.

====================================================================
ROOT WORKSPACE CONFIG
====================================================================

Use pnpm.

Create pnpm-workspace.yaml:

packages:
  - "apps/*"
  - "services/*"
  - "packages/*"

Create root package.json with scripts:

dev
build
lint
typecheck
test
format
clean
docker:dev
docker:build
db:migrate
db:seed
smoke
python:test

Expected behavior:
- pnpm dev runs turbo dev
- pnpm build runs turbo build
- pnpm lint runs all lint tasks
- pnpm typecheck runs all typechecks
- pnpm test runs TS tests and can separately call Python tests
- pnpm smoke runs scripts/smoke checks

Create turbo.json with pipeline:
- dev
- build
- lint
- typecheck
- test
- clean

Use caching correctly.
Avoid overcomplication.

====================================================================
GITHUB ACTIONS
====================================================================

Create workflows:

.github/workflows/ci.yml
Purpose:
- install pnpm
- install dependencies
- lint
- typecheck
- test
- build

.github/workflows/docker-build.yml
Purpose:
- build Docker images for apps/services
- tag with sha
- push to GHCR
- can be triggered on PR or main
- use changed paths if practical, but correctness > cleverness

.github/workflows/deploy.yml
Purpose:
- trigger on push to main
- pull images on VPS
- run migrations
- restart services
- run smoke checks

.github/workflows/deploy-rollback.yml
Purpose:
- manual workflow_dispatch
- rollback to provided image tag or previous known tag
- document expected usage

Do not include real secrets.
Use GitHub Actions secrets placeholders:
- VPS_HOST
- VPS_USER
- VPS_SSH_KEY
- GHCR_TOKEN if needed

====================================================================
SMOKE CHECKS
====================================================================

Create scripts/smoke/smoke.sh or TypeScript smoke runner.

Smoke checks must verify:

Local or live URLs:
- www /health
- insights /health
- intelligence /health
- app /health
- admin /health
- platform-api /health
- intelligence-api /health

Also check:
- platform-api /v1/status
- intelligence-api /v1/status
- intelligence-api /v1/companies

Smoke script must exit non-zero on failure.

====================================================================
DOCUMENTATION
====================================================================

Replace README.md completely.

New README must include:
- What Shasvata is
- What this repo is
- Monorepo structure
- Apps and domains
- Services
- Local setup
- Docker setup
- Environment setup
- CI/CD overview
- Deployment overview
- Health checks
- Naming rules
- “Do not use iccaa in codebase” rule
- Foundation sprint status

Create docs:

docs/architecture/overview.md
docs/architecture/app-boundaries.md
docs/architecture/service-boundaries.md
docs/architecture/source-to-score-ledger.md
docs/architecture/database.md
docs/architecture/deployment.md

docs/data-dictionary/foundation.md
docs/data-dictionary/confidence-grades.md
docs/data-dictionary/metric-definitions.md

docs/runbooks/local-development.md
docs/runbooks/github-to-vps-deployment.md
docs/runbooks/smoke-checks.md
docs/runbooks/rollback.md
docs/runbooks/environment-variables.md

docs/decisions/ADR-0001-monorepo.md
docs/decisions/ADR-0002-intelligence-not-iccaa.md
docs/decisions/ADR-0003-source-to-score-ledger.md
docs/decisions/ADR-0004-typescript-platform-python-intelligence.md
docs/decisions/ADR-0005-postgres-schema-namespaces.md

====================================================================
ACCEPTANCE CRITERIA
====================================================================

The implementation is acceptable only when all are true:

1. There is no `iccaa` folder, package, service, env variable, Docker image, or code symbol.
2. The repository uses pnpm workspaces.
3. The repository uses Turborepo.
4. The apps folder contains:
   - www
   - insights
   - intelligence
   - app
   - admin
5. The services folder contains:
   - platform-api
   - intelligence-api
   - worker
6. The packages folder contains:
   - ui
   - tokens
   - config
   - types
   - schemas
   - charts
   - content
   - telemetry
7. Python foundation exists under python/shasvata_core.
8. DB migrations exist under db/migrations.
9. Docker Compose can build the full stack.
10. Every app/service has a health route.
11. Root pnpm build passes.
12. Root pnpm typecheck passes.
13. Root pnpm lint passes or is intentionally documented if partial.
14. Python tests pass.
15. Smoke checks pass locally.
16. README is rewritten for the new architecture.
17. Architecture docs exist.
18. CI workflows exist.
19. Deployment workflow exists.
20. Rollback workflow exists.
21. .env.example exists and is complete.
22. No Naya/GrowthOS package naming remains.
23. No old lead/project platform language is the primary repo identity.
24. Minimal placeholder UI exists only to prove routing and connectivity.
25. The foundation is ready for future UI/product implementation.

====================================================================
DO NOT DO
====================================================================

Do not build final homepage visuals.
Do not spend time on animations.
Do not implement full auth.
Do not implement payments.
Do not implement full scraping.
Do not implement full LLM extraction.
Do not implement complex dashboards.
Do not create separate repositories.
Do not rename the repo itself.
Do not use ICCAA in code.
Do not hardcode secrets.
Do not delete the old repo state without archive branch.
Do not leave broken package names.
Do not leave local dev requiring five separate npm installs.
Do not make the intelligence system depend on old lead/project models.
Do not merge to main.

====================================================================
IMPLEMENTATION STYLE
====================================================================

Prefer boring, reliable, explicit code.

Use:
- strict TypeScript
- clear package names
- small modules
- typed schemas
- explicit env validation
- simple health checks
- simple Dockerfiles
- clear docs
- clean folder boundaries

Avoid:
- magical abstractions
- premature microservices
- final design work
- untyped JSON everywhere
- hidden coupling between apps
- unclear ownership
- copied duplicate UI
- Naya/GrowthOS leftovers

====================================================================
FINAL OUTPUT REQUIRED FROM YOU
====================================================================

After implementation, provide:

1. Summary of changed structure.
2. List of apps created.
3. List of services created.
4. List of packages created.
5. List of Python modules created.
6. List of database migrations created.
7. List of GitHub workflows created.
8. Exact commands to run locally.
9. Exact commands to run Docker locally.
10. Exact health URLs to check.
11. Any known limitations.
12. Next recommended implementation sprint.

Open a pull request from:

refactor/shasvata-foundation-v1

to:

main

PR title:
refactor: rebuild Shasvata foundation architecture

PR body must include:
- what changed
- what was intentionally not built
- validation performed
- smoke check results
- follow-up tasks

End of task.