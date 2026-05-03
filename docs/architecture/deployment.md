# Deployment Architecture

The deployment target is GHCR -> VPS -> Docker Compose -> Traefik.

Images are built for:

- `www`
- `insights`
- `intelligence`
- `app`
- `admin`
- `platform-api`
- `intelligence-api`
- `worker`

Production Compose uses `shasvata_internal_net` for private service traffic and external `proxy_net` for Traefik ingress.

Secrets are not committed. GitHub Actions expects VPS host/user/key secrets and the VPS expects production `.env` values.
