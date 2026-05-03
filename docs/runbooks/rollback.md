# Rollback Runbook

Use `.github/workflows/deploy-rollback.yml` with a known image tag.

Expected inputs:

- `image_tag` - SHA or stable tag to restore.

After rollback:

1. Inspect Compose status on the VPS.
2. Run live smoke checks.
3. Create a follow-up issue describing the incident and recovery evidence.
