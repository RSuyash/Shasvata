# Smoke Checks Runbook

Local:

```bash
pnpm smoke
```

Live:

```bash
SMOKE_TARGET=live pnpm smoke
```

Required checks:

- all app `/health` routes
- `platform-api /health`
- `platform-api /v1/status`
- `intelligence-api /health`
- `intelligence-api /v1/status`
- `intelligence-api /v1/companies`
