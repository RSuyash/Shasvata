#!/usr/bin/env bash
set -euo pipefail

MONITOR_URL="${NAYA_LEAD_MONITOR_URL:-https://aakar-realities.preview.shasvata.com/api/lead}"
POSTGRES_CONTAINER="${NAYA_DB_BACKUP_CONTAINER:-shasvata-postgres}"
POSTGRES_DB="${NAYA_DB_NAME:-naya_growth}"
POSTGRES_USER="${NAYA_DB_USER:-naya}"
MONITOR_EMAIL_DOMAIN="${NAYA_LEAD_MONITOR_EMAIL_DOMAIN:-monitoring.shasvata.invalid}"
MONITOR_HOST="${NAYA_LEAD_MONITOR_HOST:-aakar-realities.preview.shasvata.com}"
LOCK_FILE="${HOME}/backups/shasvata/.lead-monitor.lock"

mkdir -p "$(dirname "$LOCK_FILE")"

exec 9>"$LOCK_FILE"
if ! flock -n 9; then
  echo "Another synthetic lead monitor run is already in progress." >&2
  exit 1
fi

stamp="$(date -u +%Y%m%dT%H%M%SZ)"
email="synthetic-lead-monitor+${stamp}@${MONITOR_EMAIL_DOMAIN}"
lead_id=""

cleanup() {
  if [ -z "$lead_id" ]; then
    return
  fi

  cleanup_sql=$(
    cat <<SQL
delete from "ProjectLead"
where "sourceSubmissionId" in (
  select id from "LeadSubmission" where "leadId" = '$lead_id'
);
delete from "LeadSubmission" where "leadId" = '$lead_id';
SQL
  )

  printf '%s\n' "$cleanup_sql" | docker exec -i "$POSTGRES_CONTAINER" psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -P pager=off >/dev/null 2>&1 || true
}
trap cleanup EXIT

payload="$(cat <<JSON
{
  "fullName": "Synthetic Lead Monitor",
  "email": "$email",
  "phone": "+919900000000",
  "companyName": "Shasvata Synthetic Monitor",
  "companyType": "other",
  "websiteUrl": "",
  "serviceInterest": ["topaz-towers-enquiry"],
  "budgetRange": "Synthetic monitor",
  "timeline": "Immediate",
  "problemSummary": "SYNTHETIC MONITOR - ignore. This checks the production lead pipeline end to end.",
  "consent": true,
  "sourcePage": "https://${MONITOR_HOST}/?synthetic-monitor=1",
  "sourceCta": "synthetic-monitor",
  "utmSource": "synthetic-monitor",
  "utmMedium": "cron",
  "utmCampaign": "prod-runtime"
}
JSON
)"

response="$(curl -fsS -X POST "$MONITOR_URL" -H "Content-Type: application/json" --data "$payload")"
lead_id="$(python3 -c 'import json,sys; print(json.load(sys.stdin)["leadId"])' <<<"$response")"

submission_count=""
notification_status=""
project_slug=""
origin_host=""

for _ in $(seq 1 15); do
  submission_row="$(printf "select count(*), coalesce(max(\"notificationStatus\")::text, '') from \"LeadSubmission\" where \"leadId\" = '%s';\n" "$lead_id" | docker exec -i "$POSTGRES_CONTAINER" psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -t -A -F '|' -P pager=off)"
  projection_row="$(printf "select coalesce(max(p.slug), ''), coalesce(max(pl.\"originHost\"), '') from \"ProjectLead\" pl join \"LeadSubmission\" ls on ls.id = pl.\"sourceSubmissionId\" join \"Project\" p on p.id = pl.\"projectId\" where ls.\"leadId\" = '%s';\n" "$lead_id" | docker exec -i "$POSTGRES_CONTAINER" psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -t -A -F '|' -P pager=off)"

  submission_count="${submission_row%%|*}"
  notification_status="${submission_row#*|}"
  project_slug="${projection_row%%|*}"
  origin_host="${projection_row#*|}"

  if [ "$submission_count" = "1" ] && [ "$notification_status" = "NOTIFIED" ] && [ -n "$project_slug" ] && [ -n "$origin_host" ]; then
    break
  fi

  sleep 2
done

if [ "$submission_count" != "1" ] || [ "$notification_status" != "NOTIFIED" ] || [ -z "$project_slug" ] || [ -z "$origin_host" ]; then
  echo "Synthetic lead monitor verification failed for $lead_id" >&2
  echo "submission_count=${submission_count:-missing}" >&2
  echo "notification_status=${notification_status:-missing}" >&2
  echo "project_slug=${project_slug:-missing}" >&2
  echo "origin_host=${origin_host:-missing}" >&2
  exit 1
fi

printf 'Synthetic lead monitor verified lead=%s project=%s host=%s status=%s\n' "$lead_id" "$project_slug" "$origin_host" "$notification_status"
