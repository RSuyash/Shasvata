#!/usr/bin/env bash
set -euo pipefail

shopt -s nullglob

secure_env_files() {
  local base_dir="$1"
  local file
  for file in "$base_dir"/.env "$base_dir"/.env.* "$base_dir"/.env.bak*; do
    [ -f "$file" ] || continue
    chmod 600 "$file" 2>/dev/null || true
  done
}

secure_compose_files() {
  local base_dir="$1"
  local file
  for file in "$base_dir"/docker-compose.yml "$base_dir"/docker-compose.prod.yml "$base_dir"/docker-compose*.yml.bak* "$base_dir"/docker-compose.override.yml; do
    [ -f "$file" ] || continue
    chmod 640 "$file" 2>/dev/null || true
  done
}

secure_directory() {
  local dir="$1"
  [ -d "$dir" ] || return 0
  chmod 750 "$dir" 2>/dev/null || true
}

for dir in \
  "$HOME/apps/shasvata" \
  "$HOME/apps/naya-erp" \
  "$HOME/apps/mailcow-runtime" \
  "$HOME/backups" \
  "$HOME/backups/shasvata" \
  "$HOME/backups/shasvata/postgres"
do
  secure_directory "$dir"
done

secure_env_files "$HOME/apps/shasvata"
secure_env_files "$HOME/apps/naya-erp"
secure_compose_files "$HOME/apps/shasvata"
secure_compose_files "$HOME/apps/naya-erp"

if [ -f "$HOME/apps/mailcow-runtime/mailcow.conf" ]; then
  chmod 600 "$HOME/apps/mailcow-runtime/mailcow.conf" 2>/dev/null || true
fi

if [ -f "$HOME/apps/mailcow-runtime/docker-compose.override.yml" ]; then
  chmod 640 "$HOME/apps/mailcow-runtime/docker-compose.override.yml" 2>/dev/null || true
fi

echo "Permissions tightened for runtime env and compose files."
