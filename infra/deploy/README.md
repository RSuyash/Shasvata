# Deployment Foundation

Production deployment expects GHCR images, a VPS checkout at `DEPLOY_TARGET_PATH`, Docker Compose v2+, and an external Traefik network named `proxy_net`.

Secrets must stay in the VPS environment or GitHub Actions secrets. Do not commit `.env` files.
