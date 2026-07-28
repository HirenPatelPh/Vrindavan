#!/bin/bash
# Vrindavan backup: dumps the whole Postgres cluster (public directory + every tenant schema) and
# tars the product-image uploads, both gzip-compressed, into ./backups with dated filenames, and
# prunes anything older than RETENTION_DAYS.
#
# Run it from the deploy/ directory (where docker-compose.yml lives) so it can reach the running
# containers. Wire it to cron for a nightly run (see DEPLOYMENT.md).
#
# 3-2-1 REMINDER: this writes to the SAME box the DB runs on. That protects against app/DB
# corruption and fat-finger deletes, but NOT against losing the box. Add an offsite copy —
# uncomment the rclone block below to push ./backups to Google Drive (or any rclone remote).
set -euo pipefail

cd "$(dirname "$0")"

RETENTION_DAYS="${RETENTION_DAYS:-14}"
STAMP="$(date +%Y%m%d-%H%M%S)"
OUT_DIR="./backups"
mkdir -p "$OUT_DIR"

# Read POSTGRES_* / project name from .env if present (so filenames/credentials match compose).
if [ -f .env ]; then set -a; . ./.env; set +a; fi
PGUSER="${POSTGRES_USER:-vrindavan}"
PGDB="${POSTGRES_DB:-vrindavan}"

echo "==> Dumping database ($PGDB) ..."
# pg_dump the full logical database (all schemas: public + tenant_template + every tenant_*).
# --clean/--if-exists makes the dump safe to restore over an existing DB during a drill.
docker compose exec -T db pg_dump --username "$PGUSER" --clean --if-exists "$PGDB" \
	| gzip > "$OUT_DIR/db-$STAMP.sql.gz"
echo "    wrote $OUT_DIR/db-$STAMP.sql.gz"

echo "==> Archiving uploaded product images ..."
# Stream the uploads directory out of the backend container as a gzipped tar.
docker compose exec -T backend tar -C /app/backend -cf - uploads \
	| gzip > "$OUT_DIR/uploads-$STAMP.tar.gz"
echo "    wrote $OUT_DIR/uploads-$STAMP.tar.gz"

# --- Optional: encrypt at rest --------------------------------------------------------------
# Encrypt the DB dump before it leaves the box (recommended if pushing offsite). Needs gpg and a
# recipient key imported. Uncomment and set GPG_RECIPIENT.
# GPG_RECIPIENT="you@yourdomain.com"
# gpg --yes --encrypt --recipient "$GPG_RECIPIENT" "$OUT_DIR/db-$STAMP.sql.gz" \
#   && rm "$OUT_DIR/db-$STAMP.sql.gz"

# --- Optional: offsite copy to Google Drive (or any rclone remote) --------------------------
# One-time setup on the box:  rclone config   (create a remote named e.g. `gdrive`)
# RCLONE_REMOTE="gdrive:vrindavan-backups"
# rclone copy "$OUT_DIR/db-$STAMP.sql.gz"* "$RCLONE_REMOTE/" 2>/dev/null || true
# rclone copy "$OUT_DIR/uploads-$STAMP.tar.gz" "$RCLONE_REMOTE/" 2>/dev/null || true

echo "==> Pruning backups older than ${RETENTION_DAYS} days ..."
find "$OUT_DIR" -type f -name '*.gz*' -mtime "+${RETENTION_DAYS}" -print -delete || true

echo "==> Backup complete."
echo "    Restore drill (into a scratch DB) — see DEPLOYMENT.md, 'Restoring from a backup'."
