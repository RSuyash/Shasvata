#!/usr/bin/env bash
set -euo pipefail

TARGET_REPO_DIR="${1:-${DEPLOY_REPO_DIR:-$HOME/apps/shasvata}}"
MAILCOW_RUNTIME_DIR="${MAILCOW_RUNTIME_DIR:-$HOME/apps/mailcow-runtime}"
MAILCOW_REPO_URL="${MAILCOW_REPO_URL:-https://github.com/mailcow/mailcow-dockerized}"
MAILCOW_MODE="${MAILCOW_MODE:-stage}"
DEPLOY_SHA="${DEPLOY_SHA:-}"
REPO_URL="${DEPLOY_REPO_URL:-https://github.com/RSuyash/Shasvata.git}"
REPO_GIT_TOKEN="${DEPLOY_REPO_GIT_TOKEN:-}"
CONTROL_PLANE_COMPOSE_FILE="comms-platform/control-plane/docker-compose.yml"
CONTROL_PLANE_ENV_FILE="comms-platform/control-plane/control-plane.env"

git_remote() {
  if [ -n "$REPO_GIT_TOKEN" ]; then
    local auth_header
    auth_header="$(printf 'x-access-token:%s' "$REPO_GIT_TOKEN" | base64 | tr -d '\n')"
    git -c "http.extraHeader=AUTHORIZATION: basic $auth_header" "$@"
  else
    git "$@"
  fi
}

require_file() {
  local file_path="$1"
  if [ ! -f "$file_path" ]; then
    echo "Missing required file: $file_path" >&2
    exit 1
  fi
}

bootstrap_runtime() {
  MAILCOW_REPO_URL="$MAILCOW_REPO_URL" bash comms-platform/scripts/bootstrap-mailcow.sh "$MAILCOW_RUNTIME_DIR"
}

validate_runtime_if_configured() {
  if [ ! -f "$MAILCOW_RUNTIME_DIR/docker-compose.yml" ]; then
    echo "Mailcow upstream compose is not present yet; runtime is staged but not configured."
    return 0
  fi

  if [ ! -f "$MAILCOW_RUNTIME_DIR/mailcow.conf" ]; then
    echo "Mailcow runtime is missing mailcow.conf. Run ./generate_config.sh in $MAILCOW_RUNTIME_DIR before cutover."
    return 0
  fi

  if [ ! -f "$MAILCOW_RUNTIME_DIR/docker-compose.override.yml" ]; then
    echo "Mailcow runtime is missing docker-compose.override.yml."
    echo "Copy docker-compose.override.naya.example.yml into place before cutover."
    return 0
  fi

  (
    cd "$MAILCOW_RUNTIME_DIR"
    docker compose config >/dev/null
  )
}

case "$MAILCOW_MODE" in
  stage|apply)
    ;;
  *)
    echo "MAILCOW_MODE must be 'stage' or 'apply'." >&2
    exit 1
    ;;
esac

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

if [ -n "$DEPLOY_SHA" ]; then
  if ! git cat-file -e "${DEPLOY_SHA}^{commit}" 2>/dev/null; then
    git_remote fetch origin "$DEPLOY_SHA" --depth=1 || true
  fi
  git checkout -B main "$DEPLOY_SHA"
else
  git checkout main
  git reset --hard origin/main
fi

bootstrap_runtime

if [ -f "$CONTROL_PLANE_ENV_FILE" ]; then
  docker compose --env-file "$CONTROL_PLANE_ENV_FILE" -f "$CONTROL_PLANE_COMPOSE_FILE" config >/dev/null
else
  echo "Control-plane env file not present yet at $CONTROL_PLANE_ENV_FILE; skipping control-plane compose validation."
fi

validate_runtime_if_configured

if [ "$MAILCOW_MODE" = "apply" ]; then
  require_file "$MAILCOW_RUNTIME_DIR/mailcow.conf"
  require_file "$MAILCOW_RUNTIME_DIR/docker-compose.override.yml"
  (
    cd "$MAILCOW_RUNTIME_DIR"
    docker compose pull
    docker compose up -d
  )
  echo "Mailcow runtime is up. Continue with explicit legacy shutdown and domain provisioning checks."
else
  echo "Mailcow runtime staged at $MAILCOW_RUNTIME_DIR."
  echo "No live cutover actions were executed because MAILCOW_MODE=stage."
fi
