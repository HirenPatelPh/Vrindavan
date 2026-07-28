-- Reporting views. These back the Dashboard + Reports modules directly (Phase 2 backend
-- just SELECTs from them with filters/pagination, no business logic duplicated in Node).
SET search_path TO tenant_template, public;

CREATE VIEW tenant_template.v_current_stock AS
SELECT
  sb.id                                                AS stock_balance_id,
  p.id                                                  AS product_id,
  p.name                                                AS product_name,
  p.sku,
  w.id                                                  AS warehouse_id,
  w.name                                                AS warehouse_name,
  r.name                                                AS rack_name,
  l.name                                                AS location_name,
  pb.batch_number,
  pb.expiry_date,
  sb.quantity,
  sb.reserved_quantity,
  sb.blocked_quantity,
  (sb.quantity - sb.reserved_quantity - sb.blocked_quantity) AS available_quantity,
  sb.average_cost,
  (sb.quantity * sb.average_cost)                       AS stock_value
FROM tenant_template.stock_balances sb
JOIN tenant_template.products p ON p.id = sb.product_id
JOIN tenant_template.warehouses w ON w.id = sb.warehouse_id
LEFT JOIN tenant_template.racks r ON r.id = sb.rack_id
LEFT JOIN tenant_template.locations l ON l.id = sb.location_id
LEFT JOIN tenant_template.product_batches pb ON pb.id = sb.batch_id;

CREATE VIEW tenant_template.v_low_stock_items AS
SELECT
  p.id            AS product_id,
  p.name          AS product_name,
  p.sku,
  p.reorder_level,
  p.minimum_stock,
  COALESCE(SUM(sb.quantity), 0)  AS total_quantity,
  COALESCE(SUM(sb.quantity - sb.reserved_quantity - sb.blocked_quantity), 0) AS total_available
FROM tenant_template.products p
LEFT JOIN tenant_template.stock_balances sb ON sb.product_id = p.id
WHERE p.is_active
GROUP BY p.id, p.name, p.sku, p.reorder_level, p.minimum_stock
HAVING COALESCE(SUM(sb.quantity), 0) <= p.reorder_level;

-- Products with stock on hand but no sales at all in the last 90 days.
CREATE VIEW tenant_template.v_dead_stock AS
SELECT
  p.id           AS product_id,
  p.name         AS product_name,
  p.sku,
  COALESCE(SUM(sb.quantity), 0)              AS total_quantity,
  COALESCE(SUM(sb.quantity * sb.average_cost), 0) AS stock_value,
  MAX(sda.sale_date)                          AS last_sale_date
FROM tenant_template.products p
LEFT JOIN tenant_template.stock_balances sb ON sb.product_id = p.id
LEFT JOIN tenant_template.sales_daily_aggregates sda ON sda.product_id = p.id
WHERE p.is_active
GROUP BY p.id, p.name, p.sku
HAVING COALESCE(SUM(sb.quantity), 0) > 0
   AND (MAX(sda.sale_date) IS NULL OR MAX(sda.sale_date) < current_date - INTERVAL '90 days');

CREATE VIEW tenant_template.v_outstanding_receivables AS
SELECT
  si.id             AS sales_invoice_id,
  si.invoice_number,
  si.invoice_date,
  si.due_date,
  c.id              AS customer_id,
  c.name            AS customer_name,
  si.total_amount,
  si.paid_amount,
  (si.total_amount - si.paid_amount) AS outstanding_amount,
  GREATEST(current_date - si.due_date, 0) AS days_overdue
FROM tenant_template.sales_invoices si
JOIN tenant_template.customers c ON c.id = si.customer_id
WHERE si.status IN ('approved','partially_paid')
  AND si.total_amount > si.paid_amount;

CREATE VIEW tenant_template.v_outstanding_payables AS
SELECT
  pi.id             AS purchase_invoice_id,
  pi.invoice_number,
  pi.invoice_date,
  pi.due_date,
  s.id              AS supplier_id,
  s.name            AS supplier_name,
  pi.total_amount,
  pi.paid_amount,
  (pi.total_amount - pi.paid_amount) AS outstanding_amount,
  GREATEST(current_date - pi.due_date, 0) AS days_overdue
FROM tenant_template.purchase_invoices pi
JOIN tenant_template.suppliers s ON s.id = pi.supplier_id
WHERE pi.status IN ('approved','partially_paid')
  AND pi.total_amount > pi.paid_amount;

CREATE VIEW tenant_template.v_warehouse_stock_value AS
SELECT
  w.id    AS warehouse_id,
  w.name  AS warehouse_name,
  COALESCE(SUM(sb.quantity), 0)               AS total_quantity,
  COALESCE(SUM(sb.quantity * sb.average_cost), 0) AS total_stock_value
FROM tenant_template.warehouses w
LEFT JOIN tenant_template.stock_balances sb ON sb.warehouse_id = w.id
GROUP BY w.id, w.name;
