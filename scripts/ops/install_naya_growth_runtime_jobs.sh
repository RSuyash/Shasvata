#!/usr/bin/env bash
set -euo pipefail

TARGET_REPO_DIR="${1:-$HOME/apps/shasvata}"
LOG_DIR="${NAYA_RUNTIME_LOG_DIR:-$HOME/logs/shasvata}"
CRON_BLOCK_NAME="NAYA_GROWTH_RUNTIME_JOBS"

mkdir -p "$LOG_DIR"
chmod 700 "$LOG_DIR" 2>/dev/null || true

printf -v target_repo_dir_q "%q" "$TARGET_REPO_DIR"
printf -v log_dir_q "%q" "$LOG_DIR"

tmp_cron="$(mktemp)"
current_cron="$(mktemp)"
trap 'rm -f "$tmp_cron" "$current_cron"' EXIT

crontab -l 2>/dev/null > "$current_cron" || true

awk -v begin="# BEGIN ${CRON_BLOCK_NAME}" -v end="# END ${CRON_BLOCK_NAME}" '
  $0 == begin { skip=1; next }
  $0 == end { skip=0; next }
  !skip { print }
' "$current_cron" > "$tmp_cron"

cat >> "$tmp_cron" <<EOF
# BEGIN ${CRON_BLOCK_NAME}
5 * * * * /bin/bash -lc 'mkdir -p ${log_dir_q} && cd ${target_repo_dir_q} && /bin/bash scripts/ops/backup_naya_growth_db.sh >> ${log_dir_q}/db-backup.log 2>&1'
35 2 * * * /bin/bash -lc 'mkdir -p ${log_dir_q} && cd ${target_repo_dir_q} && /bin/bash scripts/ops/verify_naya_growth_db_backup.sh >> ${log_dir_q}/db-backup-verify.log 2>&1'
*/15 * * * * /bin/bash -lc 'mkdir -p ${log_dir_q} && cd ${target_repo_dir_q} && /bin/bash scripts/ops/synthetic_lead_monitor.sh >> ${log_dir_q}/lead-monitor.log 2>&1'
# END ${CRON_BLOCK_NAME}
EOF

crontab "$tmp_cron"
echo "Installed runtime jobs into crontab."
