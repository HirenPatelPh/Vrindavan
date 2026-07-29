# Pending: Audit Log (who changed what, when) — Admin-viewable

**Status:** In progress (started 2026-07-30).
**Goal:** Every insert/update/delete on the important tables is recorded with **who** did it, and an
**Admin** can view/filter that history (e.g. "Manager XYZ updated Purchase Order PO-… on <date>",
with the before/after values).

---

## What already exists (Phase 1 — do NOT rebuild)

- **`audit_logs` table** (per tenant, `database/migrations/tenant_template/006_system_ai.sql`):
  `{ id, table_name, record_id, action(insert|update|delete), old_data jsonb, new_data jsonb,
  changed_by uuid → users(id), changed_at }`.
- **`trg_audit_log()` trigger** (`database/functions/003_audit_functions.sql`) attached to **22
  tables**: products, suppliers, customers, employees; all purchase headers (PO/GRN/invoice/
  payment/return); all sales headers (quotation/SO/DC/invoice/payment/return); inventory
  (adjustments/transfers/verifications/damaged/returns); roles; users. (`*_lines` child tables are
  intentionally excluded — their changes are implied by the header's audit row.)
- The trigger reads the acting user from **`current_setting('app.current_user_id')`**.

## The gap (why it's near-empty today)
The backend **never set `app.current_user_id`** per request, so `changed_by` has been **NULL** for
every change. Fixing that + a read API + a viewer *is* this feature.

---

## Design

### 1. Populate `changed_by` (the core fix)
- Add `userId?: string` to `AppClsStore` (`tenant-cls-store.ts`).
- `JwtAuthGuard` already sets `request.user = payload` + tenant CLS — also `cls.set('userId', payload.sub)`.
- `TenantConnectionInterceptor` (opens the one scoped connection + sets `search_path`) — right
  after that, set the acting user on the same connection so the trigger sees it:
  `SELECT set_config('app.current_user_id', <userId or ''>, false)`.
  - Session-level (`false`), re-applied every request, so a pooled connection never leaks a
    previous user (empty string when unauthenticated → trigger casts fail → NULL, which is fine).
- Result: from now on, every audited change stamps the real user. (History before this stays NULL.)

### 2. Permission (Admin-only)
- New permission **`audit_logs.view`**. Add to the seed source
  (`database/seed/001_roles_permissions.sql`) AND a `tenant_changes/00X_add_audit_permission.sql`
  migration granting it to **Admin only** (matches the inventory/purchase/sales permission-add
  pattern). Gate the controller with `@Permissions('audit_logs.view')`.

### 3. Read API (`backend/src/modules/audit`)
- `GET /audit-logs` — filters `tableName?`, `recordId?`, `action?`, `changedBy?`, `fromDate?`,
  `toDate?`, plus `page?`/`limit?` → `{ items, total, page, limit }` (newest first). Each item:
  `{ id, tableName, recordId, action, changedAt, changedByName, changedByEmail, oldData, newData }`
  (left-join `users` for the actor's name/email). Clean-architecture per-resource shape
  (domain/application/infrastructure/presentation) like the other modules.
- `GET /audit-logs/:id` — single entry with full old/new JSON (for the diff view).

### 4. Frontend — Admin-only "Audit Log" viewer
- New screen `features/audit/presentation/audit_log_screen.dart`: filter bar (table dropdown,
  action, date range, optional user), a paginated list (who · action · table · record · when),
  each row expandable to a **field-level old → new diff** (compare `oldData`/`newData` JSON keys).
- Nav: add an **Admin-only** "Audit Log" entry (alongside "Users & Access" — reuse the `isAdmin`
  gate already in `app_shell.dart`), route `/audit`.

---

## Task list

- [x] **B1** `AppClsStore.userId` + guard sets it + interceptor `set_config('app.current_user_id')`. ✅ verified
- [x] **B2** `audit_logs.view` permission: seed + tenant_changes migration (grant Admin). ✅ migrated to all 3 schemas
- [x] **B3** Audit module: domain/infra(kysely, filters+pagination, join users)/app/presentation. ✅
- [x] **B4** Wire `AuditModule` into `app.module.ts`; `tsc` clean. ✅
- [x] **F1** `audit_log_screen.dart` — filters (table/action/date) + paginated list + old→new diff. ✅ analyze clean
- [x] **F2** Router `/audit` + admin-only nav entry (rail + drawer). ✅
- [ ] **T1** Final browser check as Admin (needs re-login for the new permission in the token).

**Verified via curl (local acme):** after re-login, updating a product's `sellingPrice` produced an
audit row `update products by 'Admin' (admin@acme.example)` — `changed_by` is populated (a pre-fix
row still shows `by None`, confirming the wiring flipped on exactly when intended). `GET /audit-logs`
returns entries joined to the actor's name/email; gated by `audit_logs.view` (Admin-only). Backend
`tsc` clean, frontend `flutter analyze` clean.

> **Note for existing sessions:** the acting Admin must **log out and back in** once so the new
> `audit_logs.view` permission is baked into their access token; otherwise `/audit-logs` returns 403.

## Notes
- Scope: read-only viewer. No "revert to previous version" (could be a later enhancement).
- `old_data`/`new_data` are full row snapshots as JSON — the diff is computed client-side by
  comparing keys, so no backend diff logic needed.
- Links: `database/functions/003_audit_functions.sql`, `.../006_system_ai.sql` (table),
  `common/interceptors/tenant-connection.interceptor.ts`, `common/guards/jwt-auth.guard.ts`,
  `database/seed/001_roles_permissions.sql`.
