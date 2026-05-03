# Environment Variables Runbook

Start from `.env.example`.

Required production groups:

- General app URLs
- Database credentials and `DATABASE_URL`
- Redis URL
- CORS origins
- Security placeholders replaced with strong secrets
- GHCR namespace
- Deploy host/path values

Never commit real secrets.
