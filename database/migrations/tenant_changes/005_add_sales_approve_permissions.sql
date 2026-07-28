-- Phase 7 (Sales): the original Phase 1 permission seed's `approvable_modules` list covered
-- sales_orders and sales_returns, but not delivery_challans (`deliver` action) or
-- sales_invoices (`approve` action) — the same class of gap Phase 6 found and fixed for
-- goods_received_notes/purchase_invoices (see 004_add_purchase_approve_permissions.sql's
-- sibling fix). Both modules already exist in the seed's main `modules` list (so
-- view/create/edit/delete/export/print already exist and are already granted) — only the
-- `.approve` code is missing.
--
-- Unlike 004's fix, Warehouse Manager is deliberately excluded here: per the original seed,
-- Warehouse Manager only has view/export/print on sales modules (its full-access grant list is
-- org/inventory/purchase only), so it never had CRUD on these two modules to begin with. Sales
-- Person is included instead — the original seed already gives it full CRUD+approve on the
-- entire sales cycle via an unfiltered `p.module IN (...)` grant.
--
-- Applied by MigrationRunnerService against tenant_template + every existing tenant; the
-- runner sets search_path before running this file, so table names here are deliberately
-- unqualified — do not add a schema prefix or your own SET search_path line.

INSERT INTO permissions (module, action, code) VALUES
  ('delivery_challans', 'approve', 'delivery_challans.approve'),
  ('sales_invoices', 'approve', 'sales_invoices.approve')
ON CONFLICT (code) DO NOTHING;

-- Admin: everything.
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.name = 'Admin' AND p.code IN ('delivery_challans.approve', 'sales_invoices.approve')
ON CONFLICT DO NOTHING;

-- Manager: everything except delete (approve is not delete, so it passes).
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.name = 'Manager' AND p.code IN ('delivery_challans.approve', 'sales_invoices.approve')
ON CONFLICT DO NOTHING;

-- Sales Person: already had full CRUD+approve on the sales cycle in the original seed.
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.name = 'Sales Person' AND p.code IN ('delivery_challans.approve', 'sales_invoices.approve')
ON CONFLICT DO NOTHING;
