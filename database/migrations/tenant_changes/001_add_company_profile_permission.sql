-- Phase 3 (Auth): the original Phase 1 permission seed never anticipated a "Company Profile"
-- screen (PATCH /company/profile). Adds it as its own module with just view/edit actions
-- (no create/delete/approve/export/print — there's only ever one company profile per tenant).
--
-- Applied by MigrationRunnerService (backend/src/infrastructure/migrations/migration-runner.service.ts)
-- against tenant_template + every existing tenant; the runner sets search_path before running
-- this file, so table names here are deliberately unqualified — do not add a schema prefix or
-- your own SET search_path line.

INSERT INTO permissions (module, action, code) VALUES
  ('company_profile', 'view', 'company_profile.view'),
  ('company_profile', 'edit', 'company_profile.edit')
ON CONFLICT (code) DO NOTHING;

-- Admin: full access (mirrors database/seed/001_roles_permissions.sql's "Admin: everything").
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.name = 'Admin' AND p.module = 'company_profile'
ON CONFLICT DO NOTHING;

-- Manager: view + edit (mirrors "Manager: everything except delete" — there's no delete here anyway).
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.name = 'Manager' AND p.module = 'company_profile'
ON CONFLICT DO NOTHING;

-- Warehouse Manager, Sales Person, Viewer: view-only (mirrors their existing view-only carve-outs
-- on modules outside their primary domain in the original seed).
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.name IN ('Warehouse Manager', 'Sales Person', 'Viewer')
  AND p.module = 'company_profile' AND p.action = 'view'
ON CONFLICT DO NOTHING;
