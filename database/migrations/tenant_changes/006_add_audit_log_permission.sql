-- Audit Log viewer (Phase: post-10 improvements). The Phase 1 permission seed never had an
-- `audit_logs` module. Adds `audit_logs.view` and grants it to Admin ONLY (the change history is
-- an admin tool). Mirrors the source-of-truth addition in database/seed/001_roles_permissions.sql.
--
-- Applied by MigrationRunnerService against tenant_template + every existing tenant; the runner
-- sets search_path before running this file, so table names are deliberately unqualified — do not
-- add a schema prefix or your own SET search_path line.

INSERT INTO permissions (module, action, code) VALUES
  ('audit_logs', 'view', 'audit_logs.view')
ON CONFLICT (code) DO NOTHING;

-- Admin only.
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.name = 'Admin' AND p.code = 'audit_logs.view'
ON CONFLICT DO NOTHING;
