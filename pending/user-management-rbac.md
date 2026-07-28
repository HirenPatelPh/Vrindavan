# Pending: Tenant User Management + Role/Permission administration

**Status:** Batch 1 (backend) + Batch 2 (frontend) DONE + verified (2026-07-20). Batch 3
(optional: nav-hiding for other modules + force-logout) remains.
**Raised:** 2026-07-20
**Requested by:** tenant admin needs to create users, assign roles (Admin / Manager / Viewer /
etc.), and toggle per-module permissions on/off for each role.

## Progress

- ✅ **Batch 1 — backend `access` module** (`backend/src/modules/access/`): Users
  (`GET/POST /users`, `PATCH /users/:id`, `POST /users/:id/roles`, `POST
  /users/:id/reset-password`), Roles (`GET/POST /roles`, `PATCH/DELETE /roles/:id`), Permissions
  (`GET /permissions`, `GET/PUT /roles/:id/permissions`). Gated by the already-seeded `users.*` /
  `roles.*` permissions (no migration needed — Admin already has them). Guardrails built:
  can't deactivate/strip-admin-from self, can't remove the last active Admin, can't
  delete/rename built-in roles, can't edit the Admin role's permissions. Verified via curl:
  list users/roles/permissions, create user (must-change-password), assign role, toggle role
  permissions (`PUT /roles/:id/permissions` by codes), and all guardrails return clean 409s.
  Decisions taken: per-role model, changes apply on next login/refresh (no force-logout yet),
  guardrails on. `npx tsc --noEmit` clean.
- ✅ **Batch 2 — frontend** (`frontend/lib/features/access/`): admin-only "Users & Access" nav
  destination (rail + drawer, shown only when the signed-in user's roles include `Admin`),
  `AccessHomeScreen` (Users + Roles & Permissions cards with counts), `UsersScreen` (list users,
  create user with temp password + role checkboxes, per-user menu: assign roles / reset password /
  activate-deactivate; guardrail 409s shown in an "Action failed" dialog), and
  `RolesPermissionsScreen` — the **module × action toggle matrix**: role dropdown, a
  DataTable of every module (rows) × view/create/edit/delete/approve/export/print (columns) with
  a `Switch` per existing `module.action`, "Save changes" → `PUT /roles/:id/permissions`. Admin
  role renders locked ("Admin always has full access"). "New role" creates custom roles. Added a
  `put()` method to `ApiClient`. Routes `/access`, `/access/users`, `/access/roles` wired in
  `app_router.dart`. `flutter analyze` clean; screens verified rendering in the browser against
  the live backend.
- ⬜ **Batch 3 (optional)**: permission-based nav hiding for the *other* modules (a Viewer
  shouldn't see Purchase if they lack `purchase.view`) + a force-logout action so permission
  changes apply immediately instead of on next sign-in.

---

## TL;DR

The full role-based access-control (RBAC) **database schema already exists** in every tenant and
enforcement is already wired. What's missing is the **management UI + a small set of admin
endpoints** to edit that data. No schema change is needed for the role-based model.

---

## What already exists (leverage — do NOT rebuild)

Tenant template (`database/migrations/tenant_template/001_master_org.sql`) already has the full
RBAC set:

- `roles` — `{id, name, is_system_role, description}`. Seeded with **5 system roles**: Admin,
  Manager, Warehouse Manager, Sales Person, Viewer (`is_system_role = true`, cannot be deleted).
- `permissions` — `{id, module, action, code}` where `action ∈ (view, create, edit, delete,
  approve, export, print)` and `code = "module.action"` (e.g. `sales_invoices.approve`). Seeded
  per module in `database/seed/001_roles_permissions.sql`.
- `role_permissions` — `(role_id, permission_id)` join. **This is exactly what the toggle matrix
  edits** — one row per enabled `module.action` for a role.
- `users` — `{id, name, email, phone, password_hash, avatar_url, is_active,
  must_change_password, last_login_at}`.
- `user_roles` — `(user_id, role_id)` join. A user inherits the union of their roles' permissions.

Enforcement is already done:
- Login (`auth.service.ts`) resolves `getRolesAndPermissions(userId)` and **bakes the permission
  code list into the JWT access token**.
- `PermissionsGuard` (`src/common/guards/permissions.guard.ts`) reads `request.user.permissions`
  from the token and blocks disallowed actions with a 403.
- Password hasher, JWT service, and console/SMTP email service already exist (from Phase 3).

So the *backend enforcement* is complete. The gap is purely **admin management of this data**.

---

## The model (key design point)

Permissions attach to **roles**, not directly to users:

- A **role** = a named bundle of `module.action` permissions (the toggle matrix edits this via
  `role_permissions`).
- A **user** is assigned one or more roles (`user_roles`) and inherits their permissions.

The requested "toggle button per module per role" is therefore a **per-role permission matrix**.
This matches the existing schema exactly — no DB change.

> Per-**user** custom permission overrides are NOT supported by the current schema (there is no
> `user_permissions` table, only `user_roles` + `role_permissions`). If per-user overrides are
> ever needed, that's a schema addition. Recommendation: stay role-based (which is what was
> asked — Manager / Viewer / Admin).

---

## Two new admin screens (new "Users & Access" nav section, admin-only)

### 1. Users
- List all tenant users (grid: name, email, role(s), active/inactive, last login).
- Create user: name, email, temporary password (or email-invite), pick role(s).
- Activate / deactivate.
- Reset password.
- Change assigned role(s).

Reuses the existing generic grid/form engine for the list + create form; role assignment is a
small multi-select.

### 2. Roles & Permissions (the centrepiece the user described)
- Pick a role (dropdown: the 5 system roles + any custom roles).
- Show a **module × action toggle grid**: rows = modules, columns = View / Create / Edit /
  Delete / Approve / Export / Print, each cell a toggle switch (green = allowed, gray = blocked).
- Toggling a cell enables/disables that `module.action` for the role.
- "Save changes" writes the full toggled set via `PUT /roles/:id/permissions`.
- System roles: either lock Admin (always full) or allow edit with guardrails (see below).
- Option to create a custom role (name + description, then set its toggles).

A visual mockup of this matrix was shown to the user on 2026-07-20 (role dropdown + module rows +
action-column toggles).

---

## Backend — new endpoints (one new "access"/"users" module)

All gated by a new `users.manage` (or `users.*`) permission, granted to Admin only via a
`tenant_changes` migration + the source-of-truth seed (`001_roles_permissions.sql`), following
the same seed-fix + migration pattern used for the purchase/sales/inventory permission additions
in earlier phases.

- **Users:** `GET /users`, `POST /users`, `PATCH /users/:id` (edit / activate / deactivate),
  `POST /users/:id/roles`, `POST /users/:id/reset-password`.
- **Roles:** `GET /roles`, `POST /roles` (custom), `PATCH /roles/:id`, `DELETE /roles/:id`
  (system roles blocked).
- **Permissions:** `GET /permissions` (reference list — drives the grid's rows/columns),
  `GET /roles/:id/permissions`, `PUT /roles/:id/permissions` (replace the role's permission set
  with the toggled selection, in one transaction).

All operate on tables that already exist. Follows the codebase's Clean Architecture per-resource
pattern (domain / application / infrastructure / presentation).

---

## Decisions to confirm before building

1. **When do permission changes take effect?**
   Permissions are baked into the JWT at login, so a toggle change applies on the affected user's
   **next login / token refresh**, not instantly.
   - Option A (recommended): accept next-login latency (normal for most apps).
   - Option B: add a "force sign-out affected users" action for immediacy (invalidate their
     refresh tokens).
   - Option C: switch `PermissionsGuard` to a per-request DB lookup (instant, but more DB load
     and a bigger change). Not recommended.

2. **Should the nav also hide blocked modules?**
   Today the backend blocks disallowed actions (403) but the frontend still shows every menu
   item. Cleaner UX: hide a module from the sidebar/home when the user lacks its `.view`
   permission (the token already carries the permission list, so this is frontend-only).
   - In scope? It's an enhancement, ~½ pass of extra frontend work.

3. **Guardrails (build regardless):**
   - Can't deactivate or delete yourself.
   - Can't remove the last Admin (tenant must always have one).
   - Can't delete system roles; editing Admin's permissions either locked or guarded so it can't
     be stripped below "manage users".

---

## Rough effort / phasing (batched + verified, like the pagination rollout)

- **Batch 1 — Backend Access module:** users/roles/permissions endpoints + `users.manage` seed +
  migration + guardrails. ~1 focused pass. Verify via curl.
- **Batch 2 — Frontend:** Users screen (reuses grid/form engine) + Roles & Permissions matrix
  screen (the one bespoke widget) + admin-only "Users & Access" nav section. ~1 pass. Verify in
  browser.
- **Batch 3 (optional):** permission-based nav hiding + force-logout action. ~½ pass.

---

## Notes / links

- Enforcement code: `backend/src/common/guards/permissions.guard.ts`,
  `backend/src/modules/auth/application/auth.service.ts` (token build),
  `backend/src/modules/auth/infrastructure/user.kysely-repository.ts`
  (`getRolesAndPermissions`).
- Schema: `database/migrations/tenant_template/001_master_org.sql` (roles/permissions/users).
- Seed: `database/seed/001_roles_permissions.sql`.
- The admin user for the demo tenant is `admin@acme.example` (company code `acme`), already an
  Admin — so it can be the first user manager once the screens exist.
