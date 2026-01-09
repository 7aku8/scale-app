#!/bin/bash
set -e

BACKUP_DIR="/opt/scale-app/backups"
DATE=$(date +%Y-%m-%d-%H%M%S)
RETENTION_DAYS=7

mkdir -p $BACKUP_DIR
export $(cat /opt/scale-app/.env | xargs)

docker exec scale-db pg_dump \
  -U $DB_USER \
  -d $DB_NAME \
  --no-owner \
  --no-acl \
  | gzip > $BACKUP_DIR/db-backup-$DATE.sql.gz

echo "Backup created: db-backup-$DATE.sql.gz"

find $BACKUP_DIR -name "db-backup-*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "Backups:"
ls -lh $BACKUP_DIR
