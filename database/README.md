# Vrindavan — Database (Phase 1)

Normalized PostgreSQL schema for the multi-tenant Inventory & Warehouse Management SaaS.
This is the foundation for every later phase (NestJS entities, REST APIs, reports, AI
queries) — see `/Users/mac/.claude/plans/linked-hopping-plum.md` for the full roadmap.

## Multi-tenancy: schema-per-tenant

Every company (tenant) gets its own PostgreSQL schema containing a full, identical copy of
the business tables. A `public` schema holds only the tenant directory.

```
public                  <- tenant directory (shared, tiny)
  tenants
  tenant_provisioning_log

tenant_template          <- canonical structure, never serves live traffic
  branches, warehouses, racks, locations, ...
  products, stock_ledger, stock_balances, ...
  purchase_orders, sales_invoices, ...

tenant_acme               <- real tenant, cloned from tenant_template
tenant_globex              <- another real tenant, cloned from tenant_template
```

**Why schema-per-tenant** (vs. shared-schema + tenant_id, or database-per-tenant): stronger
data isolation than a shared `tenant_id` column (no risk of a missing `WHERE tenant_id = ?`
leaking data across companies), while staying far cheaper to operate than a full
database-per-tenant (one connection pool, one set of migrations to apply N times, one
backup job).

### Why `tenant_template` is a real schema, not just documentation

`tenant_template` is created and migrated like any other schema (see
`migrations/tenant_template/*.sql`). It is the single source of truth for tenant structure.
New tenants are provisioned by **cloning** it — `pg_dump --schema-only --schema=tenant_template
| sed 's/tenant_template/tenant_<code>/g' | psql` — rather than replaying every tenant
migration by hand. This is the standard, low-risk pattern for schema-per-tenant Postgres
SaaS: `pg_dump` already knows how to correctly emit every object type (tables, constraints,
indexes, triggers, functions, views) with zero hand-rolled cloning logic, and `sed` renaming
works uniformly across DDL headers *and* function bodies, since both are just text containing
the schema name.

### Provisioning a new tenant

```bash
export DATABASE_URL=postgres://user:pass@localhost:5432/vrindavan
./scripts/provision_tenant.sh acme "Acme Traders Pvt Ltd" admin@acme.example
```

This performs, in order (each step logged to `public.tenant_provisioning_log`):
1. `public.fn_register_tenant(...)` — inserts `public.tenants` row (status=`provisioning`), derives `schema_name = 'tenant_' || sanitized_code`.
2. Clone `tenant_template` -> the new schema (pg_dump/sed/psql).
3. Run `seed/001_roles_permissions.sql`, `seed/002_units_tax.sql`, `seed/003_financial_year.sql` against the new schema (each takes `-v schema=<name>`).
4. Flip `public.tenants.status` to `active`.

This will become an internal NestJS service call in Phase 2 (the "create company" signup
flow just shells out to / re-implements this script); it's a standalone, testable script now
so the database layer doesn't depend on the backend existing yet.

### Login flow (relevant to Phase 3 — Auth)

User supplies `company_code` + email + password → backend looks up `schema_name` from
`public.tenants` → sets `search_path` to that schema for the request → authenticates against
`<tenant_schema>.users`. JWT payload carries the resolved `schema_name` so every subsequent
request can set `search_path` without a second lookup.

## Applying migrations locally

Order matters — later files assume earlier tables/functions exist:

```bash
DB=vrindavan
psql "$DB" -f migrations/public/001_extensions.sql
psql "$DB" -f migrations/public/002_common_functions.sql
psql "$DB" -f migrations/public/003_tenants.sql
psql "$DB" -f migrations/public/004_register_tenant_function.sql

psql "$DB" -f migrations/tenant_template/000_create_schema.sql
psql "$DB" -f migrations/tenant_template/001_master_org.sql
psql "$DB" -f migrations/tenant_template/002_product.sql
psql "$DB" -f migrations/tenant_template/003_inventory.sql
psql "$DB" -f migrations/tenant_template/004_purchase.sql
psql "$DB" -f migrations/tenant_template/005_sales.sql
psql "$DB" -f migrations/tenant_template/006_system_ai.sql

psql "$DB" -f functions/001_document_numbering.sql
psql "$DB" -f functions/002_stock_functions.sql
psql "$DB" -f functions/003_audit_functions.sql

psql "$DB" -f views/001_reporting_views.sql
```

(Phase 2 will wrap this in a proper migration runner invoked from NestJS — this ordering is
what it needs to replicate.)

Then provision your first real tenant with `scripts/provision_tenant.sh`, or seed
`tenant_template` itself directly (omit `-v schema=...`, it defaults to `tenant_template`)
for local development/testing.

## Design conventions

- **Primary keys**: `uuid DEFAULT gen_random_uuid()` everywhere — deliberately not
  `bigserial`. Client apps (the Flutter mobile scanner flows, in particular) can generate
  IDs offline and sync later ("Offline Sync" special feature) without ID collisions.
- **Money**: `numeric(18,2)`. **Quantities**: `numeric(18,3)` (supports fractional units like
  weight-based stock). Never `float`/`double precision` for either.
- **Soft state, not soft delete**: masters use `is_active boolean`; transactional documents
  use a `status` enum (`draft`/`approved`/.../`cancelled`) via `CHECK`. Nothing is physically
  deleted once it participates in a stock or money movement — `ON DELETE RESTRICT` on those
  FKs enforces this. `ON DELETE CASCADE` is used only for true child rows (line items,
  images) that have no meaning without their parent.
- **`updated_at`**: every mutable table gets `trg_set_updated_at` (defined once, in `public`,
  reused by every tenant schema).
- **Stock is never written directly.** `stock_ledger` is append-only; `stock_balances`,
  `reserved_quantity`, and `blocked_quantity` are maintained exclusively by the triggers in
  `functions/002_stock_functions.sql`. Any code path that finds itself `UPDATE`-ing
  `stock_balances` directly is wrong.
- **Search**: `pg_trgm` GIN indexes on `products.name`/`sku`, `customers.name`,
  `suppliers.name` back the "Search Everywhere" / "Quick Product Finder" features with
  partial-match performance; exact-match lookups (`barcode`, `qr_code`) use plain unique
  B-tree indexes for the mobile scanner flow.
- **AI features are heuristics, not ML.** `sales_daily_aggregates` is a nightly rollup;
  the 30/60/90/180/365-day forecasts, ABC/XYZ classification, and reorder suggestions
  (Phase 9) are moving-average/Pareto SQL queries against it — no external model service.

## What's deliberately deferred to later phases

- The actual migration runner / ORM wiring, tenant-aware `search_path` middleware, and the
  scheduled jobs that call `fn_release_expired_reservations()` and refresh
  `sales_daily_aggregates` — all Phase 2 (NestJS).
- JWT issuance/verification, OTP delivery (email/SMS) — Phase 3 (Auth), tables already exist
  (`otp_codes`, `refresh_tokens`).
- "Automatic Financial Year" rollover (creating next year's `financial_years` row when the
  current one ends) — a scheduled job in Phase 2, not a DB trigger, so it can send
  notifications and require admin confirmation first.
