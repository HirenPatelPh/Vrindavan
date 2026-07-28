#!/usr/bin/env bash
# Provisions a brand-new tenant schema, cloned from `tenant_template`.
#
# Usage: ./provision_tenant.sh <company_code> <company_name> <company_email>
# Requires: DATABASE_URL env var (e.g. postgres://user:pass@host:5432/vrindavan)
#
# Strategy: clone tenant_template's full DDL (tables, constraints, indexes, functions,
# triggers, views) via `pg_dump --schema-only`, rename the schema with `sed`, then run
# the seed scripts against the new schema. This is deliberately simpler and more robust
# than hand-rolling constraint/trigger cloning in PL/pgSQL — pg_dump already knows how to
# emit correct, complete DDL for every object type.
set -euo pipefail

COMPANY_CODE="${1:?Usage: provision_tenant.sh <company_code> <company_name> <company_email>}"
COMPANY_NAME="${2:?company_name required}"
COMPANY_EMAIL="${3:?company_email required}"
: "${DATABASE_URL:?DATABASE_URL env var must be set}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "==> Registering tenant '$COMPANY_CODE' in public.tenants ..."
RESULT=$(psql "$DATABASE_URL" -t -A -F'|' -c \
  "SELECT tenant_id, schema_name FROM public.fn_register_tenant('$COMPANY_CODE', '$COMPANY_NAME', '$COMPANY_EMAIL');")
TENANT_ID=$(echo "$RESULT" | cut -d'|' -f1)
SCHEMA_NAME=$(echo "$RESULT" | cut -d'|' -f2)
echo "    tenant_id=$TENANT_ID schema_name=$SCHEMA_NAME"

log_step() {
  psql "$DATABASE_URL" -q -c \
    "INSERT INTO public.tenant_provisioning_log (tenant_id, step, status, message, finished_at)
     VALUES ('$TENANT_ID', '$1', '$2', '$3', now());"
}

echo "==> Cloning tenant_template -> $SCHEMA_NAME ..."
if pg_dump "$DATABASE_URL" --schema-only --schema=tenant_template --no-owner --no-privileges \
    | sed "s/tenant_template/$SCHEMA_NAME/g" \
    | psql "$DATABASE_URL" -q -v ON_ERROR_STOP=1; then
  log_step "clone_schema" "success" "cloned from tenant_template"
else
  log_step "clone_schema" "failed" "pg_dump/psql clone failed"
  exit 1
fi

echo "==> Seeding default data into $SCHEMA_NAME ..."
if psql "$DATABASE_URL" -q -v ON_ERROR_STOP=1 -v schema="$SCHEMA_NAME" -f "$SCRIPT_DIR/../seed/001_roles_permissions.sql" \
    && psql "$DATABASE_URL" -q -v ON_ERROR_STOP=1 -v schema="$SCHEMA_NAME" -f "$SCRIPT_DIR/../seed/002_units_tax.sql" \
    && psql "$DATABASE_URL" -q -v ON_ERROR_STOP=1 -v schema="$SCHEMA_NAME" -f "$SCRIPT_DIR/../seed/003_financial_year.sql"; then
  log_step "seed_data" "success" "roles/permissions/units/tax/financial_year seeded"
else
  log_step "seed_data" "failed" "seed scripts failed"
  exit 1
fi

echo "==> Activating tenant ..."
psql "$DATABASE_URL" -q -c "UPDATE public.tenants SET status = 'active' WHERE id = '$TENANT_ID';"
log_step "activate" "success" "tenant marked active"

echo "==> Done. Tenant '$COMPANY_CODE' is live in schema '$SCHEMA_NAME'."
