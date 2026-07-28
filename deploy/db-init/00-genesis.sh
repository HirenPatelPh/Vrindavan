#!/bin/bash
# Applies the Vrindavan "genesis" schema to a BRAND-NEW Postgres data directory.
#
# The official postgres image runs everything in /docker-entrypoint-initdb.d ONCE, on first boot
# only (when the data volume is empty). That is exactly the right lifecycle for genesis DDL, which
# is not idempotent (plain CREATE TABLE, no IF NOT EXISTS) and must run exactly once.
#
# Order matters — later files assume earlier objects exist. This mirrors database/README.md's
# documented apply order (public -> tenant_template -> functions -> views). It does NOT seed any
# tenant: tenant_template stays structure-only, and real tenants are created (cloned + seeded) by
# the backend's signup flow. The `migrate` compose service runs AFTER this to baseline genesis and
# apply database/migrations/tenant_changes/*.sql.
set -euo pipefail

DB_DIR=/database
psql_run() {
	echo ">> applying $1"
	psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -f "$DB_DIR/$1"
}

psql_run migrations/public/001_extensions.sql
psql_run migrations/public/002_common_functions.sql
psql_run migrations/public/003_tenants.sql
psql_run migrations/public/004_register_tenant_function.sql

psql_run migrations/tenant_template/000_create_schema.sql
psql_run migrations/tenant_template/001_master_org.sql
psql_run migrations/tenant_template/002_product.sql
psql_run migrations/tenant_template/003_inventory.sql
psql_run migrations/tenant_template/004_purchase.sql
psql_run migrations/tenant_template/005_sales.sql
psql_run migrations/tenant_template/006_system_ai.sql

psql_run functions/001_document_numbering.sql
psql_run functions/002_stock_functions.sql
psql_run functions/003_audit_functions.sql

psql_run views/001_reporting_views.sql

echo ">> Genesis schema applied. tenant_template is ready to be cloned by tenant signup."
