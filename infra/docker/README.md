# Docker Foundation

The local Compose stack runs Postgres, Redis, five app shells, two APIs, and the worker.

Use:

```bash
pnpm docker:build
docker compose up -d
pnpm smoke
```
