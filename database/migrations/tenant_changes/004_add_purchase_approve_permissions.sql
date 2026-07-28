-- Phase 6 (Purchase): the original Phase 1 permission seed's `approvable_modules` list only
-- covered purchase_orders and purchase_returns. It never anticipated that Goods Received Notes
-- (`complete` action) and Purchase Invoices (`approve` action) would also need a `.approve`
-- permission code — the same class of gap Phase 5c found and fixed for `stock_returns` (see
-- 003_add_inventory_permissions.sql's sibling fix). Both modules already exist in the seed's
-- main `modules` list (so view/create/edit/delete/export/print already exist for them and are
-- already granted to every role per the original seed) — only the `.approve` code is missing.
--
-- Applied by MigrationRunnerService against tenant_template + every existing tenant; the
-- runner sets search_path before running this file, so table names here are deliberately
-- unqualified — do not add a schema prefix or your own SET search_path line.

INSERT INTO permissions (module, action, code) VALUES
  ('goods_received_notes', 'approve', 'goods_received_notes.approve'),
  ('purchase_invoices', 'approve', 'purchase_invoices.approve')
ON CONFLICT (code) DO NOTHING;

-- Admin: everything.
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.name = 'Admin' AND p.code IN ('goods_received_notes.approve', 'purchase_invoices.approve')
ON CONFLICT DO NOTHING;

-- Manager: everything except delete (approve is not delete, so it passes).
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.name = 'Manager' AND p.code IN ('goods_received_notes.approve', 'purchase_invoices.approve')
ON CONFLICT DO NOTHING;

-- Warehouse Manager: already had full access to both modules in the original seed.
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.name = 'Warehouse Manager' AND p.code IN ('goods_received_notes.approve', 'purchase_invoices.approve')
ON CONFLICT DO NOTHING;
