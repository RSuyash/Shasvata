#!/usr/bin/env bash
# Docs: docs/ops/DEVELOPMENT_WORKFLOW.md
set -euo pipefail

TARGET_REPO_DIR="${1:-${DEPLOY_REPO_DIR:-$HOME/apps/shasvata}}"
LEGACY_REPO_DIR="${LEGACY_REPO_DIR:-$HOME/apps/comms-platform}"
DEPLOY_TIMEOUT_SECONDS="${DEPLOY_TIMEOUT_SECONDS:-180}"
REPO_URL="${DEPLOY_REPO_URL:-https://github.com/RSuyash/Shasvata.git}"
REPO_GIT_TOKEN="${DEPLOY_REPO_GIT_TOKEN:-}"
COMPOSE_FILE="comms-platform/control-plane/docker-compose.yml"
ENV_FILE="comms-platform/control-plane/control-plane.env"

git_remote() {
  if [ -n "$REPO_GIT_TOKEN" ]; then
    local auth_header
    auth_header="$(printf 'x-access-token:%s' "$REPO_GIT_TOKEN" | base64 | tr -d '\n')"
    git -c "http.extraHeader=AUTHORIZATION: basic $auth_header" "$@"
  else
    git "$@"
  fi
}

require_env() {
  local name="$1"
  if [ -z "${!name:-}" ]; then
    echo "Required environment variable '$name' is not set." >&2
    exit 1
  fi
}

read_env_value_from_file() {
  local file_path="$1"
  local name="$2"
  awk -F= -v key="$name" '
    /^[[:space:]]*#/ || index($0, "=") == 0 { next }
    {
      current=$1
      sub(/^[[:space:]]+/, "", current)
      sub(/[[:space:]]+$/, "", current)
      if (current != key) {
        next
      }

      value=substr($0, index($0, "=") + 1)
      sub(/^[[:space:]]+/, "", value)
      sub(/[[:space:]]+$/, "", value)

      if ((value ~ /^".*"$/) || (value ~ /^'\''.*'\''$/)) {
        value=substr(value, 2, length(value) - 2)
      }

      print value
      exit
    }
  ' "$file_path"
}

read_env_value() {
  local name="$1"
  read_env_value_from_file "$ENV_FILE" "$name"
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
      echo "'$container_name' went unhealthy after ${attempt}s." >&2
      docker inspect --format '{{range .State.Health.Log}}{{.Output}}{{end}}' "$container_name" 2>/dev/null | tail -5 >&2
      return 1
    fi
    attempt=$((attempt + 5))
    sleep 5
  done
  echo "'$container_name' did not become healthy within ${timeout}s." >&2
  return 1
}

wait_for_command() {
  local description="$1"
  local timeout="${2:-$DEPLOY_TIMEOUT_SECONDS}"
  shift 2

  local attempt=0
  while [ "$attempt" -lt "$timeout" ]; do
    if "$@"; then
      echo "'$description' passed after ${attempt}s."
      return 0
    fi

    attempt=$((attempt + 5))
    sleep 5
  done

  echo "'$description' did not pass within ${timeout}s." >&2
  return 1
}

check_local_admin_ui() {
  curl -fsS -H 'Accept: text/html' -H "Authorization: Bearer $COMMS_ADMIN_TOKEN" http://127.0.0.1:3701/admin | grep -F 'Naya Comms Operator' >/dev/null
}

check_public_mailcow_ui() {
  curl -fsS https://mail.shasvata.com/ | grep -F 'mail UI' >/dev/null
}

require_env DEPLOY_SHA
require_env GHCR_USERNAME
require_env GHCR_TOKEN
require_env NG_COMMS_PLATFORM_IMAGE

if [ ! -d "$TARGET_REPO_DIR/.git" ] && [ -d "$LEGACY_REPO_DIR/.git" ]; then
  TARGET_REPO_DIR="$LEGACY_REPO_DIR"
fi

if [ ! -d "$TARGET_REPO_DIR/.git" ]; then
  mkdir -p "$(dirname "$TARGET_REPO_DIR")"
  git_remote clone "$REPO_URL" "$TARGET_REPO_DIR"
fi

cd "$TARGET_REPO_DIR"
if [ -f "$HOME/.ssh/id_github_naya" ]; then
  git config core.sshCommand 'ssh -i ~/.ssh/id_github_naya -o StrictHostKeyChecking=no'
fi
origin_url="$(git remote get-url origin 2>/dev/null || true)"
if [ -z "$origin_url" ]; then
  git remote add origin "$REPO_URL"
elif [ "$origin_url" != "$REPO_URL" ] && [ -n "$REPO_GIT_TOKEN" ]; then
  git remote set-url origin "$REPO_URL"
fi

git_remote fetch origin main
if ! git cat-file -e "${DEPLOY_SHA}^{commit}" 2>/dev/null; then
  git_remote fetch origin "$DEPLOY_SHA" --depth=1 || true
fi
git checkout -B main "$DEPLOY_SHA"

if [ ! -f "$ENV_FILE" ] && [ "$TARGET_REPO_DIR" != "$LEGACY_REPO_DIR" ] && [ -f "$LEGACY_REPO_DIR/$ENV_FILE" ]; then
  mkdir -p "$(dirname "$ENV_FILE")"
  cp "$LEGACY_REPO_DIR/$ENV_FILE" "$ENV_FILE"
fi

if [ "$TARGET_REPO_DIR" != "$LEGACY_REPO_DIR" ] && [ -d "$LEGACY_REPO_DIR/comms-platform/control-plane/data" ]; then
  if [ ! -d "comms-platform/control-plane/data" ] || [ -z "$(find "comms-platform/control-plane/data" -mindepth 1 -print -quit 2>/dev/null || true)" ]; then
    rm -rf "comms-platform/control-plane/data"
    mkdir -p "comms-platform/control-plane"
    cp -R "$LEGACY_REPO_DIR/comms-platform/control-plane/data" "comms-platform/control-plane/data"
  fi
fi

if [ ! -f "$COMPOSE_FILE" ]; then
  echo "Missing control-plane compose file: $COMPOSE_FILE" >&2
  exit 1
fi

if [ ! -f "$ENV_FILE" ]; then
  echo "Missing live control-plane env file: $ENV_FILE" >&2
  echo "Create it from comms-platform/control-plane/control-plane.env.example on the VPS first." >&2
  exit 1
fi

COMMS_ADMIN_TOKEN="$(read_env_value COMMS_ADMIN_TOKEN)"

require_env COMMS_ADMIN_TOKEN

export COMMS_ADMIN_TOKEN

export NG_COMMS_PLATFORM_IMAGE

export DOCKER_CONFIG
DOCKER_CONFIG="$(mktemp -d)"
trap 'rm -rf "$DOCKER_CONFIG"' EXIT

echo "$GHCR_TOKEN" | docker login ghcr.io -u "$GHCR_USERNAME" --password-stdin
docker compose -f "$COMPOSE_FILE" config >/dev/null
docker compose -f "$COMPOSE_FILE" pull control-plane
docker compose -f "$COMPOSE_FILE" up -d control-plane
wait_for_healthy "naya-comms-platform"
docker compose -f "$COMPOSE_FILE" ps
wait_for_command "local control-plane admin UI" 45 check_local_admin_ui
wait_for_command "public Mailcow UI" 60 check_public_mailcow_ui
