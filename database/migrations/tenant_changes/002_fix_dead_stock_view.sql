-- Fixes two bugs in v_dead_stock, found while building Phase 4 (Dashboard):
--
-- 1. It joined sales_daily_aggregates to determine last-sale-date, but that table is Phase 9
--    (AI) rollup infrastructure with no populating job yet — it's always empty right now, so
--    MAX(sda.sale_date) was always NULL and every in-stock product was flagged "dead"
--    regardless of real sales activity. Switched to sales_invoice_lines/sales_invoices
--    directly, the same live-data source the rest of the dashboard uses.
-- 2. It LEFT JOINed two separate "many" relations (stock_balances and the sales rollup) to
--    products in one GROUP BY, without pre-aggregating either side first — a classic SQL
--    fan-out: a product with, say, 2 warehouse stock_balances rows and 3 sales rows would
--    produce 2x3=6 joined rows, and SUM(sb.quantity) would count each stock row 3x too many.
--    Fixed by pre-aggregating each side in its own subquery before joining.
--
-- Applied by MigrationRunnerService against tenant_template + every existing tenant; the
-- runner sets search_path before running this file, so names here are deliberately
-- unqualified — do not add a schema prefix or your own SET search_path line.

CREATE OR REPLACE VIEW v_dead_stock AS
SELECT
  p.id   AS product_id,
  p.name AS product_name,
  p.sku,
  COALESCE(stock.total_quantity, 0) AS total_quantity,
  COALESCE(stock.stock_value, 0)    AS stock_value,
  sales.last_sale_date
FROM products p
LEFT JOIN (
  SELECT product_id,
         SUM(quantity)                 AS total_quantity,
         SUM(quantity * average_cost)  AS stock_value
  FROM stock_balances
  GROUP BY product_id
) stock ON stock.product_id = p.id
LEFT JOIN (
  SELECT sil.product_id, MAX(si.invoice_date) AS last_sale_date
  FROM sales_invoice_lines sil
  JOIN sales_invoices si ON si.id = sil.invoice_id AND si.status <> 'cancelled'
  GROUP BY sil.product_id
) sales ON sales.product_id = p.id
WHERE p.is_active
  AND COALESCE(stock.total_quantity, 0) > 0
  AND (sales.last_sale_date IS NULL OR sales.last_sale_date < current_date - INTERVAL '90 days');
