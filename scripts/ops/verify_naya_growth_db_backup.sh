#!/usr/bin/env bash
set -euo pipefail

BACKUP_ROOT="${NAYA_DB_BACKUP_DIR:-$HOME/backups/shasvata/postgres}"
POSTGRES_CONTAINER="${NAYA_DB_BACKUP_CONTAINER:-shasvata-postgres}"
POSTGRES_USER="${NAYA_DB_USER:-naya}"
RESTORE_DB="naya_growth_restore_verify_$(date -u +%Y%m%d%H%M%S)"
LOCK_FILE="${BACKUP_ROOT}/.restore-verify.lock"

latest_backup="${BACKUP_ROOT}/latest.sql.gz"

if [ ! -L "$latest_backup" ] && [ ! -f "$latest_backup" ]; then
  echo "No latest backup found at $latest_backup" >&2
  exit 1
fi

resolved_backup="$(readlink -f "$latest_backup" 2>/dev/null || printf '%s\n' "$latest_backup")"
if [ ! -f "$resolved_backup" ]; then
  echo "Resolved backup file does not exist: $resolved_backup" >&2
  exit 1
fi

if [ -f "${resolved_backup}.sha256" ]; then
  (cd "$(dirname "$resolved_backup")" && sha256sum -c "$(basename "${resolved_backup}.sha256")")
fi

exec 9>"$LOCK_FILE"
if ! flock -n 9; then
  echo "Another restore verification run is already in progress." >&2
  exit 1
fi

cleanup() {
  docker exec "$POSTGRES_CONTAINER" dropdb -U "$POSTGRES_USER" --if-exists "$RESTORE_DB" >/dev/null 2>&1 || true
}
trap cleanup EXIT

docker exec "$POSTGRES_CONTAINER" createdb -U "$POSTGRES_USER" "$RESTORE_DB"
gunzip -c "$resolved_backup" | docker exec -i "$POSTGRES_CONTAINER" psql -U "$POSTGRES_USER" -d "$RESTORE_DB" >/dev/null

verification_sql=$'select count(*) as project_count from "Project";\nselect count(*) as portal_user_count from "PortalUser";\nselect count(*) as lead_submission_count from "LeadSubmission";\nselect count(*) as project_lead_count from "ProjectLead";'
printf '%s\n' "$verification_sql" | docker exec -i "$POSTGRES_CONTAINER" psql -U "$POSTGRES_USER" -d "$RESTORE_DB" -P pager=off

echo "Restore verification succeeded for $resolved_backup"
