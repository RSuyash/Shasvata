#!/usr/bin/env bash
set -euo pipefail

BACKUP_ROOT="${NAYA_DB_BACKUP_DIR:-$HOME/backups/shasvata/postgres}"
POSTGRES_CONTAINER="${NAYA_DB_BACKUP_CONTAINER:-shasvata-postgres}"
POSTGRES_DB="${NAYA_DB_NAME:-naya_growth}"
POSTGRES_USER="${NAYA_DB_USER:-naya}"
RETENTION_DAYS="${NAYA_DB_BACKUP_RETENTION_DAYS:-14}"
LOCK_FILE="${BACKUP_ROOT}/.backup.lock"

mkdir -p "$BACKUP_ROOT"
chmod 700 "$HOME/backups" "$HOME/backups/shasvata" "$BACKUP_ROOT" 2>/dev/null || true

exec 9>"$LOCK_FILE"
if ! flock -n 9; then
  echo "Another backup run is already in progress." >&2
  exit 1
fi

timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
backup_file="${BACKUP_ROOT}/naya_growth_${timestamp}.sql.gz"
tmp_file="${backup_file}.tmp"

cleanup() {
  rm -f "$tmp_file"
}
trap cleanup EXIT

docker exec "$POSTGRES_CONTAINER" \
  pg_dump \
  -U "$POSTGRES_USER" \
  -d "$POSTGRES_DB" \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  | gzip -9 > "$tmp_file"

mv "$tmp_file" "$backup_file"
sha256sum "$backup_file" > "${backup_file}.sha256"
ln -sfn "$(basename "$backup_file")" "${BACKUP_ROOT}/latest.sql.gz"
ln -sfn "$(basename "${backup_file}.sha256")" "${BACKUP_ROOT}/latest.sql.gz.sha256"

find "$BACKUP_ROOT" -type f -name 'naya_growth_*.sql.gz' -mtime +"$RETENTION_DAYS" -delete
find "$BACKUP_ROOT" -type f -name 'naya_growth_*.sql.gz.sha256' -mtime +"$RETENTION_DAYS" -delete

echo "Backup completed: $backup_file"
