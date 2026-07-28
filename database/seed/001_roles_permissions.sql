-- Seed data for a newly provisioned tenant schema. Run via:
--   psql "$DATABASE_URL" -v schema=tenant_acme -f seed/001_roles_permissions.sql
-- (the :"schema" psql variable is substituted before execution; defaults to tenant_template
-- if you're seeding the template itself for local testing.)
\if :{?schema}
\else
  \set schema tenant_template
\endif
SET search_path TO :"schema";

-- ---------- Full (module, action) permission matrix ---------------------------------------
DO $$
DECLARE
  modules text[] := ARRAY[
    'dashboard','branches','warehouses','racks','locations','categories','sub_categories',
    'brands','units','hsn_codes','gst_rates','taxes','products','suppliers','customers',
    'employees','transporters','users','roles',
    'stock_transfers','stock_adjustments','physical_verifications','damaged_stock','stock_returns',
    'purchase_orders','goods_received_notes','purchase_invoices','supplier_payments','purchase_returns',
    'quotations','sales_orders','delivery_challans','sales_invoices','customer_payments','sales_returns',
    'reports'
  ];
  approvable_modules text[] := ARRAY[
    'purchase_orders','sales_orders','stock_adjustments','stock_transfers',
    'purchase_returns','sales_returns','physical_verifications','damaged_stock','stock_returns',
    'goods_received_notes','purchase_invoices','delivery_challans','sales_invoices'
  ];
  m text;
BEGIN
  FOREACH m IN ARRAY modules LOOP
    INSERT INTO permissions (module, action, code) VALUES
      (m, 'view',   m || '.view'),
      (m, 'create', m || '.create'),
      (m, 'edit',   m || '.edit'),
      (m, 'delete', m || '.delete'),
      (m, 'export', m || '.export'),
      (m, 'print',  m || '.print')
    ON CONFLICT (code) DO NOTHING;
  END LOOP;

  FOREACH m IN ARRAY approvable_modules LOOP
    INSERT INTO permissions (module, action, code) VALUES (m, 'approve', m || '.approve')
    ON CONFLICT (code) DO NOTHING;
  END LOOP;
END;
$$;

-- ---------- Default roles ------------------------------------------------------------------
INSERT INTO roles (name, is_system_role, description) VALUES
  ('Admin',             true, 'Full access to every module and permission.'),
  ('Manager',           true, 'Full operational access; cannot delete records.'),
  ('Warehouse Manager', true, 'Full access to warehouse/inventory/purchase modules; view-only on sales.'),
  ('Sales Person',      true, 'Full access to sales-cycle modules; view-only elsewhere.'),
  ('Viewer',            true, 'Read-only access everywhere, including export and print.')
ON CONFLICT (name) DO NOTHING;

-- Admin: everything.
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p WHERE r.name = 'Admin'
ON CONFLICT DO NOTHING;

-- Manager: everything except 'delete'.
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.name = 'Manager' AND p.action <> 'delete'
ON CONFLICT DO NOTHING;

-- Warehouse Manager: full CRUD+approve+export+print on org/inventory/purchase modules,
-- view-only on sales & user-management modules.
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.name = 'Warehouse Manager' AND (
  p.module IN ('dashboard','branches','warehouses','racks','locations','categories','sub_categories',
               'brands','units','hsn_codes','gst_rates','taxes','products','suppliers','transporters',
               'stock_transfers','stock_adjustments','physical_verifications','damaged_stock','stock_returns',
               'purchase_orders','goods_received_notes','purchase_invoices','supplier_payments','purchase_returns',
               'reports')
  OR (p.module IN ('customers','quotations','sales_orders','delivery_challans','sales_invoices',
                    'customer_payments','sales_returns','users','roles') AND p.action IN ('view','export','print'))
)
ON CONFLICT DO NOTHING;

-- Sales Person: full CRUD+approve+export+print on the sales cycle + customers,
-- view-only elsewhere.
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.name = 'Sales Person' AND (
  p.module IN ('customers','quotations','sales_orders','delivery_challans','sales_invoices',
               'customer_payments','sales_returns')
  OR (p.action IN ('view','export','print'))
)
ON CONFLICT DO NOTHING;

-- Viewer: read-only everywhere (view/export/print), no create/edit/delete/approve.
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.name = 'Viewer' AND p.action IN ('view','export','print')
ON CONFLICT DO NOTHING;
