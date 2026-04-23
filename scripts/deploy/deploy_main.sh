#!/usr/bin/env bash
# Docs: docs/ops/DEVELOPMENT_WORKFLOW.md
set -euo pipefail

TARGET_REPO_DIR="${1:-${DEPLOY_REPO_DIR:-$HOME/apps/shasvata}}"
DEPLOY_REPO_SLUG="${DEPLOY_REPO_SLUG:-${GITHUB_REPOSITORY:-RSuyash/Shasvata}}"
BASE_COMPOSE_FILE="docker-compose.yml"
PROD_COMPOSE_FILE="docker-compose.prod.yml"
COMPOSE_FILES=(-f "$BASE_COMPOSE_FILE" -f "$PROD_COMPOSE_FILE")
DEPLOY_TIMEOUT_SECONDS="${DEPLOY_TIMEOUT_SECONDS:-180}"

if [ ! -d "$TARGET_REPO_DIR/.git" ]; then
  echo "Target repo '$TARGET_REPO_DIR' is not a git repository." >&2
  exit 1
fi

require_env() {
  local name="$1"
  if [ -z "${!name:-}" ]; then
    echo "Required environment variable '$name' is not set." >&2
    exit 1
  fi
}

tighten_runtime_permissions() {
  local repo_dir="$1"

  chmod 750 "$repo_dir" 2>/dev/null || true

  while IFS= read -r -d '' env_file; do
    chmod 600 "$env_file" 2>/dev/null || true
  done < <(find "$repo_dir" -maxdepth 1 -type f \( -name '.env' -o -name '.env.*' -o -name '.env.bak*' \) -print0 2>/dev/null)

  while IFS= read -r -d '' compose_file; do
    chmod 640 "$compose_file" 2>/dev/null || true
  done < <(find "$repo_dir" -maxdepth 1 -type f \( -name 'docker-compose.yml' -o -name 'docker-compose.prod.yml' -o -name 'docker-compose*.yml.bak*' \) -print0 2>/dev/null)
}

safe_clean_repo_checkout() {
  git clean -fdx \
    -e .env \
    -e .env.* \
    -e .env.bak* \
    -e 'docker-compose*.yml.bak*'
}

wait_for_healthy() {
  local container_name="$1"
  local timeout="${2:-$DEPLOY_TIMEOUT_SECONDS}"
  local attempt=0
  echo "Waiting for '$container_name' to become healthy (timeout: ${timeout}s)..."
  while [ "$attempt" -lt "$timeout" ]; do
    local health
    health="$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' "$container_name" 2>/dev/null || true)"
    if [ "$health" = "healthy" ]; then
      echo "'$container_name' is healthy after ${attempt}s."
      return 0
    fi
    if [ "$health" = "unhealthy" ]; then
      echo "'$container_name' went unhealthy after ${attempt}s. Last healthcheck log:" >&2
      docker inspect --format '{{range .State.Health.Log}}{{.Output}}{{end}}' "$container_name" 2>/dev/null | tail -5 >&2
      return 1
    fi
    attempt=$((attempt + 5))
    sleep 5
  done
  echo "'$container_name' did not become healthy within ${timeout}s." >&2
  return 1
}

require_env DEPLOY_SHA
require_env DEPLOY_API
require_env DEPLOY_PUBLIC
require_env DEPLOY_APP
require_env DEPLOY_ICCAA
require_env GHCR_USERNAME
require_env GHCR_TOKEN

if [ "${DEPLOY_API}" = "true" ]; then require_env NG_API_IMAGE; fi
if [ "${DEPLOY_PUBLIC}" = "true" ]; then require_env NG_PUBLIC_IMAGE; fi
if [ "${DEPLOY_APP}" = "true" ]; then require_env NG_APP_IMAGE; fi
if [ "${DEPLOY_ICCAA}" = "true" ]; then require_env NG_ICCAA_IMAGE; fi

if [ ! -f "$TARGET_REPO_DIR/$BASE_COMPOSE_FILE" ]; then
  echo "Target repo '$TARGET_REPO_DIR' does not contain '$BASE_COMPOSE_FILE'." >&2
  exit 1
fi

if [ ! -f "$TARGET_REPO_DIR/$PROD_COMPOSE_FILE" ]; then
  echo "Target repo '$TARGET_REPO_DIR' does not contain '$PROD_COMPOSE_FILE'." >&2
  exit 1
fi

cd "$TARGET_REPO_DIR"

repo_sync_ok=1

if [ "${DEPLOY_SKIP_GIT_SYNC:-false}" = "true" ]; then
  echo "Skipping git sync because DEPLOY_SKIP_GIT_SYNC=true."
else
  if git remote set-url origin "git@github.com:${DEPLOY_REPO_SLUG}.git"; then
    git config core.sshCommand 'ssh -i ~/.ssh/id_github_naya -o IdentitiesOnly=yes -o StrictHostKeyChecking=no' || true

    dirty_worktree=0
    if ! git diff --quiet; then dirty_worktree=1; fi
    if ! git diff --cached --quiet; then dirty_worktree=1; fi
    if [ -n "$(git ls-files --others --exclude-standard)" ]; then dirty_worktree=1; fi

    if [ "$dirty_worktree" -eq 1 ]; then
      echo "Dirty working tree detected; stashing local changes before deploy."
      git stash push --include-untracked --message "ci-predeploy-$(date -u +%Y%m%dT%H%M%SZ)" || true
    fi

    if git fetch --prune origin main; then
      if ! git cat-file -e "${DEPLOY_SHA}^{commit}" 2>/dev/null; then
        git fetch --depth=1 origin "$DEPLOY_SHA" || true
      fi

      if git cat-file -e "${DEPLOY_SHA}^{commit}" 2>/dev/null; then
        if [ "$(git rev-parse HEAD)" != "$(git rev-parse "$DEPLOY_SHA")" ]; then
          backup_branch="backup/predeploy-$(date -u +%Y%m%dT%H%M%SZ)-$(git rev-parse --short HEAD)"
          git branch "$backup_branch" || true
        fi

        git checkout -B main "$DEPLOY_SHA"
        git reset --hard "$DEPLOY_SHA"
        safe_clean_repo_checkout
        git rev-parse --short HEAD
      else
        echo "Warning: deploy SHA '$DEPLOY_SHA' not available on VPS checkout. Continuing with current checked-out infra files." >&2
        repo_sync_ok=0
      fi
    else
      echo "Warning: git fetch failed on VPS checkout. Continuing with current checked-out infra files." >&2
      repo_sync_ok=0
    fi
  else
    echo "Warning: failed to set origin remote URL. Continuing with current checked-out infra files." >&2
    repo_sync_ok=0
  fi
fi

if [ "$repo_sync_ok" -eq 0 ]; then
  echo "Proceeding without git sync. Image-based deployment will continue using existing compose/scripts in '$TARGET_REPO_DIR'."
fi

tighten_runtime_permissions "$TARGET_REPO_DIR"

export NG_API_IMAGE
export NG_PUBLIC_IMAGE
export NG_APP_IMAGE
export NG_ICCAA_IMAGE

export DOCKER_CONFIG
DOCKER_CONFIG="$(mktemp -d)"
trap 'rm -rf "$DOCKER_CONFIG"' EXIT

echo "$GHCR_TOKEN" | docker login ghcr.io -u "$GHCR_USERNAME" --password-stdin

docker compose "${COMPOSE_FILES[@]}" config >/dev/null

if [ "${DEPLOY_API}" = "true" ]; then
  docker compose "${COMPOSE_FILES[@]}" up -d postgres
  wait_for_healthy "shasvata-postgres"
  docker compose "${COMPOSE_FILES[@]}" pull api
  docker compose "${COMPOSE_FILES[@]}" run --rm --no-deps api npm run db:migrate:deploy
  docker compose "${COMPOSE_FILES[@]}" up -d --no-build api
  wait_for_healthy "shasvata-api"
fi

if [ "${DEPLOY_PUBLIC}" = "true" ]; then
  docker compose "${COMPOSE_FILES[@]}" pull web-public
  docker compose "${COMPOSE_FILES[@]}" up -d --no-deps --no-build web-public
  wait_for_healthy "shasvata-web-public"
fi

if [ "${DEPLOY_APP}" = "true" ]; then
  docker compose "${COMPOSE_FILES[@]}" pull web-app
  docker compose "${COMPOSE_FILES[@]}" up -d --no-deps --no-build web-app
  wait_for_healthy "shasvata-web-app"
fi

if [ "${DEPLOY_ICCAA}" = "true" ]; then
  docker compose "${COMPOSE_FILES[@]}" pull iccaa-web
  docker compose "${COMPOSE_FILES[@]}" up -d --no-deps --no-build iccaa-web
  wait_for_healthy "shasvata-iccaa-web"
fi

docker compose "${COMPOSE_FILES[@]}" ps
