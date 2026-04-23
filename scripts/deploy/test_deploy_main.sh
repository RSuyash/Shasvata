#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SCRIPT_PATH="$ROOT_DIR/scripts/deploy/deploy_main.sh"

tmp_dir="$(mktemp -d)"
trap 'rm -rf "$tmp_dir"' EXIT

repo_dir="$tmp_dir/repo"
bin_dir="$tmp_dir/bin"
git_log="$tmp_dir/git.log"
script_under_test="$tmp_dir/deploy_main.sh"

mkdir -p "$repo_dir/.git" "$bin_dir"
touch "$repo_dir/docker-compose.yml" "$repo_dir/docker-compose.prod.yml"

tr -d '\r' < "$SCRIPT_PATH" > "$script_under_test"
chmod +x "$script_under_test"

cat > "$bin_dir/git" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
printf '%s\n' "$*" >> "$FAKE_GIT_LOG"

args=("$@")
command_index=0
while [ "$command_index" -lt "${#args[@]}" ] && [ "${args[$command_index]}" = "-c" ]; do
  command_index=$((command_index + 2))
done

command="${args[$command_index]:-}"

case "$command" in
  diff|remote|config|fetch|checkout|reset|clean|stash|branch)
    exit 0
    ;;
  ls-files)
    exit 0
    ;;
  cat-file)
    exit 0
    ;;
  rev-parse)
    target="${args[$((command_index + 1))]:-}"
    if [ "$target" = "HEAD" ]; then
      echo "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
    else
      echo "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"
    fi
    exit 0
    ;;
  *)
    exit 0
    ;;
esac
EOF
chmod +x "$bin_dir/git"

cat > "$bin_dir/docker" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
exit 0
EOF
chmod +x "$bin_dir/docker"

export PATH="$bin_dir:$PATH"
export FAKE_GIT_LOG="$git_log"
export DEPLOY_SHA="bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"
export DEPLOY_REPO_SLUG="RSuyash/Shasvata"
export DEPLOY_REPO_GIT_TOKEN="test-token"
export DEPLOY_API="false"
export DEPLOY_PUBLIC="false"
export DEPLOY_APP="false"
export GHCR_USERNAME="ci-user"
export GHCR_TOKEN="ci-token"
export NG_API_IMAGE="ghcr.io/rsuyash/shasvata-api:test"
export NG_PUBLIC_IMAGE="ghcr.io/rsuyash/shasvata-web-public:test"
export NG_APP_IMAGE="ghcr.io/rsuyash/shasvata-web-app:test"

bash "$script_under_test" "$repo_dir"

if ! grep -F 'fetch --prune origin main' "$git_log" >/dev/null; then
  echo "Expected deploy_main.sh to fetch origin/main during repo sync." >&2
  exit 1
fi

if ! grep -F 'checkout -B main bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb' "$git_log" >/dev/null; then
  echo "Expected deploy_main.sh to hard-sync the VPS checkout to the deploy SHA." >&2
  exit 1
fi

if ! grep -F 'reset --hard bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb' "$git_log" >/dev/null; then
  echo "Expected deploy_main.sh to reset hard to the deploy SHA." >&2
  exit 1
fi

if ! grep -F 'clean -fdx -e .env -e .env.* -e .env.bak* -e docker-compose*.yml.bak*' "$git_log" >/dev/null; then
  echo "Expected deploy_main.sh to preserve runtime env files and compose backups during git clean." >&2
  exit 1
fi

echo "deploy_main.sh repo sync test passed."
