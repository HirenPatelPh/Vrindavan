# Pending: Subdomain-per-tenant portals (`<code>.enrix.in`)

**Status:** In progress (started 2026-07-29).
**Goal:** Open each company's portal from its own subdomain — `vrindavan.enrix.in` → Vrindavan,
`mahindra.enrix.in` → Mahindra — with no "Company code" typed at login. One app instance, one
build, serves all tenants. Later, optionally attach full custom domains (`vrindavan.in`).

---

## Why this is small (leverage what already exists)

- **`public.tenants.company_code` is already the subdomain label** (schema comment literally says
  "login key / subdomain, e.g. acme"). `vrindavan.enrix.in` → label `vrindavan` → existing
  `company_code` → `tenant_vrindavan`. **No new mapping table needed for the MVP.**
- **`public.tenants` already has branding**: `company_name`, `logo_url`, `primary_color`. The
  login screen can show the right company with **no schema change**.
- **Tenant resolution is already centralised** in `TenantContextMiddleware`
  (`backend/src/infrastructure/database/tenant-context/tenant-context.middleware.ts`) — it
  resolves from the `x-company-code` header today; we add a Host-header fallback next to it.
- **Data isolation already done** (schema-per-tenant + `search_path`). A `vrindavan.enrix.in`
  user physically cannot see `mahindra` data. This feature only changes *how the tenant is
  named*, not isolation.

---

## Design

### 1. Backend — resolve tenant from the subdomain
- New env: `BASE_DOMAIN=enrix.in` (config + Joi validation, default empty = disabled).
- `TenantContextMiddleware`: if there is **no `x-company-code` header**, and the request `Host`
  is `<label>.<BASE_DOMAIN>`, use `<label>` as the company code and run the existing
  `resolveFromHeader` logic. The header still wins when present (keeps local dev + refresh flow
  working). Reserved labels (`www`, `api`, `app`, `admin`) are ignored.
- New **public** endpoint `GET /api/tenant-info` (`@Public`): resolves the company from the
  request Host (or `?host=` for testing) and returns
  `{ companyCode, companyName, logoUrl, primaryColor }`. Drives the branded login screen.
  Returns 404 if the subdomain isn't an active tenant.

### 2. Frontend — same-origin API + branded login
- **`AppConfig.apiBaseUrl`**: if a compile-time `--dart-define=API_BASE_URL` is set (local dev),
  use it; otherwise derive **same-origin** from `Uri.base.origin + '/api'`. Result: **one build
  serves every subdomain** (`vrindavan.enrix.in` calls `vrindavan.enrix.in/api`). No per-tenant
  build.
- **Login screen**: on load, call `/tenant-info`. If it resolves (we're on a tenant subdomain):
  show the company name/logo, **hide the "Company code" field**, and use the resolved code as the
  `x-company-code` on login. If it doesn't resolve (localhost, bare `enrix.in`): keep the
  company-code field (local dev + fallback).
- Optional (branding polish): tint the app with `primaryColor`, show `logo_url` on the login +
  app bar.

### 3. Deploy — Caddy multi-subdomain + wildcard DNS
- **DNS**: one wildcard `*.enrix.in` A record → server IP (covers every tenant, add tenants with
  zero DNS work).
- **Caddy**: serve the app for `*.enrix.in`, proxy `/api` `/uploads` `/health` to backend. TLS
  via **on-demand** (issue a cert per subdomain on first hit, gated by an `ask` endpoint that
  only allows active tenants) OR a **wildcard cert** (`*.enrix.in` via DNS-01 if the DNS provider
  is Caddy-supported). On-demand is simpler (no DNS-API plugin) and is the default here.
  - `ask` endpoint: `GET /api/tls-check?domain=<host>` → 200 if `<label>` is an active tenant,
    else 403. Prevents cert issuance for non-tenant subdomains.
- **web build**: stop baking `API_BASE_URL` (leave empty) so the app uses same-origin.
- Bare `enrix.in`: redirect to a marketing/login-picker later (out of scope for MVP; can 404 or
  show the generic login with the code field).

---

## Task list / effort (~1.5–2 dev-days for MVP)

- [x] **B1** `BASE_DOMAIN` env (config + Joi).                                     ✅ done
- [x] **B2** Middleware: Host-subdomain → company_code fallback resolution.        ✅ done (verified: subdomain-only login works)
- [x] **B3** `GET /api/tenant-info` public endpoint (name/logo/color from Host).   ✅ done (verified via curl)
- [x] **B4** `GET /api/tls-check` public endpoint (Caddy on-demand ask).           ✅ done (200 tenant / 403 random)
- [x] **F1** `AppConfig` same-origin API base (compile-override else `Uri.base`).  ✅ done (analyze clean)
- [x] **F2** Branded login: fetch tenant-info, hide code field, show name/logo.    ✅ done (analyze clean)
- [x] **D1** Caddyfile `*.enrix.in` + on-demand TLS + ask; empty API_BASE_URL.     ✅ done (config, untested w/o DNS)
- [ ] **D2** DNS wildcard `*.enrix.in` → IP; `.env` `BASE_DOMAIN=enrix.in` +       ⬜ ops (needs enrix.in DNS)
       `SITE_ADDRESS=*.enrix.in, enrix.in` + empty `API_BASE_URL`; rebuild web.
- [ ] **T1** End-to-end on real subdomains: two portals, isolation, per-host TLS.  ⬜ after D2

**Verified locally (curl, BASE_DOMAIN=enrix.in):** `tenant-info` resolves branding from Host and
`?host=`; unknown/`localhost` → 404; `tls-check` 200 for a tenant / 403 for random; **login with
no `x-company-code` header succeeds** when `Host: acme.enrix.in` (middleware subdomain path), and
still requires the header when there's neither header nor subdomain. Backend `tsc` clean; frontend
`flutter analyze` clean.

## Later (custom-domain attach — ~+1 day, additive, nothing wasted)
- `tenant_domains` table (tenant_id, domain, verified); middleware also resolves full custom
  domains via it; `tls-check` also allows verified custom domains; a domain-verification (TXT)
  + admin UI. All the B/F work above is reused unchanged.

---

## Local-dev testing without real DNS
Map fake subdomains to localhost via `/etc/hosts`:
```
127.0.0.1  acme.enrix.local  mahindra.enrix.local
```
Set `BASE_DOMAIN=enrix.local`, run the frontend on those hosts (or use `?host=` on tenant-info),
and confirm resolution + branded login before touching real DNS.

## Notes / links
- Middleware: `backend/src/infrastructure/database/tenant-context/tenant-context.middleware.ts`
- Tenants table (has company_name/logo_url/primary_color): `database/migrations/public/003_tenants.sql`
- Frontend config: `frontend/lib/core/config/app_config.dart`; header inject:
  `frontend/lib/core/api/api_client.dart` (line ~49); login: `features/auth/presentation/login_screen.dart`
- Deploy: `deploy/Caddyfile`, `deploy/web.Dockerfile`, `deploy/docker-compose.yml`
