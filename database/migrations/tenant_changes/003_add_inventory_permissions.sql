-- Phase 5c (Inventory): the original Phase 1 permission seed already covered the 5 document
-- types that go through a draft->approve workflow (stock_transfers, stock_adjustments,
-- physical_verifications, damaged_stock, stock_returns — including their `.approve` action,
-- since they were already in the seed's `approvable_modules` list). It never anticipated
-- Blocked Stock and Reserved Stock (direct-entry, no approval step — see
-- database/README.md's design conventions) or the read-only stock-balances/stock-ledger views.
--
-- Applied by MigrationRunnerService against tenant_template + every existing tenant; the
-- runner sets search_path before running this file, so table names here are deliberately
-- unqualified — do not add a schema prefix or your own SET search_path line.

INSERT INTO permissions (module, action, code)
SELECT m, a, m || '.' || a
FROM unnest(ARRAY['blocked_stock', 'reserved_stock']) AS m
CROSS JOIN unnest(ARRAY['view', 'create', 'edit', 'delete', 'export', 'print']) AS a
ON CONFLICT (code) DO NOTHING;

-- Backs GET /inventory/stock-balances, GET /inventory/stock-ledger (view/export/print) and
-- POST /inventory/products/:productId/post-opening-stock (create — a mutating action with no
-- natural home in any of the 7 document-type modules above).
INSERT INTO permissions (module, action, code) VALUES
  ('inventory', 'view', 'inventory.view'),
  ('inventory', 'create', 'inventory.create'),
  ('inventory', 'export', 'inventory.export'),
  ('inventory', 'print', 'inventory.print')
ON CONFLICT (code) DO NOTHING;

-- Admin: everything.
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.name = 'Admin' AND p.module IN ('blocked_stock', 'reserved_stock', 'inventory')
ON CONFLICT DO NOTHING;

-- Manager: everything except delete (mirrors "Manager: everything except delete" from the original seed).
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.name = 'Manager' AND p.module IN ('blocked_stock', 'reserved_stock', 'inventory') AND p.action <> 'delete'
ON CONFLICT DO NOTHING;

-- Warehouse Manager: full access — same warehouse-domain treatment as stock_transfers/
-- stock_adjustments/etc. already got in the original seed.
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.name = 'Warehouse Manager' AND p.module IN ('blocked_stock', 'reserved_stock', 'inventory')
ON CONFLICT DO NOTHING;

-- Sales Person, Viewer: view/export/print only (mirrors their existing view-only carve-outs
-- on modules outside their primary domain in the original seed).
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.name IN ('Sales Person', 'Viewer')
  AND p.module IN ('blocked_stock', 'reserved_stock', 'inventory')
  AND p.action IN ('view', 'export', 'print')
ON CONFLICT DO NOTHING;
