# Database Foundation

PostgreSQL is organized into schemas:

- `core` - entities and reporting periods
- `source` - documents, citations, ingestion runs, extraction runs
- `intelligence` - metric definitions, values, methodology versions, score runs, scores, benchmarks
- `content` - articles, insights, reports
- `commerce` - products and entitlements
- `app` - saved entities, comparisons, and API keys
- `audit` - events, data changes, admin reviews

Initial migration: `db/migrations/001_foundation.sql`.

Seed data: `db/seeds/foundation.sql`.

Fixture data: `db/fixtures/intelligence`.
