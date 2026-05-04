#!/usr/bin/env sh
set -eu

: "${DEPLOY_TARGET_PATH:?DEPLOY_TARGET_PATH is required}"
: "${GHCR_IMAGE_NAMESPACE:?GHCR_IMAGE_NAMESPACE is required}"
: "${IMAGE_TAG:?IMAGE_TAG is required}"

cd "$DEPLOY_TARGET_PATH"
git fetch origin main
git checkout main
git pull --ff-only origin main
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml ps
