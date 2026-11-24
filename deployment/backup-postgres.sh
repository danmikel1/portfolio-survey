#!/usr/bin/env bash
set -euo pipefail

# Logical PostgreSQL backup script for TrueNAS SCALE cron task
# Stores compressed custom-format dumps with rolling retention.

CONTAINER_NAME="${POSTGRES_CONTAINER:-portfolio-survey-postgres}"
BACKUP_DIR="${BACKUP_DIR:-/mnt/ssd-storage/apps/portfolio-survey/backups}"
POSTGRES_USER="${POSTGRES_USER:-survey_app}"
POSTGRES_DB="${POSTGRES_DB:-portfolio_survey}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"

if [ ! -d "$BACKUP_DIR" ]; then
  echo "ERROR: Backup directory does not exist: $BACKUP_DIR" >&2
  echo "Create the dataset in TrueNAS Storage -> Datasets first." >&2
  exit 1
fi

TIMESTAMP="$(date -u +"%Y%m%dT%H%M%SZ")"
DUMP_FILE="${BACKUP_DIR}/portfolio_survey_${TIMESTAMP}.dump"

docker exec "$CONTAINER_NAME" \
  pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --format=custom --compress=9 --no-owner --no-privileges \
  > "$DUMP_FILE"

chmod 600 "$DUMP_FILE"
echo "Backup written: $DUMP_FILE ($(du -h "$DUMP_FILE" | cut -f1))"

# Prune backups older than RETENTION_DAYS
find "$BACKUP_DIR" -type f -name "portfolio_survey_*.dump" -mtime "+${RETENTION_DAYS}" -delete
echo "Pruned dumps older than ${RETENTION_DAYS} days."
