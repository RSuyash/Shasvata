# GitHub To VPS Deployment Runbook

1. Open a PR from a feature branch to `main`.
2. Wait for CI and Docker build checks.
3. Merge only after validation is green.
4. `deploy.yml` runs on `main`.
5. The VPS pulls the repository and GHCR images.
6. Compose restarts the changed runtime surfaces.
7. Run live smoke checks:

```bash
SMOKE_TARGET=live pnpm smoke
```

Use `ssh nivi` or `ssh shasvata` for VPS inspection if those hosts are configured locally.
