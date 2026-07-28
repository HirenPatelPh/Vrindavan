-- =====================================================================================
-- TENANT TEMPLATE: System (audit/notifications/approvals/doc numbering) +
-- AI/reporting support tables.
-- =====================================================================================
SET search_path TO tenant_template, public;

-- Generic change-history log, populated by tenant_template.trg_audit_log() attached to
-- key tables in functions/004_audit_functions.sql. Backs "Audit Log" special feature.
CREATE TABLE tenant_template.audit_logs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name  varchar(60) NOT NULL,
  record_id   uuid NOT NULL,
  action      varchar(10) NOT NULL CHECK (action IN ('insert','update','delete')),
  old_data    jsonb,
  new_data    jsonb,
  changed_by  uuid REFERENCES tenant_template.users(id) ON DELETE SET NULL,
  changed_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_logs_table_record ON tenant_template.audit_logs(table_name, record_id);
CREATE INDEX idx_audit_logs_changed_at ON tenant_template.audit_logs(changed_at);

-- User-facing activity feed ("Activity History" special feature) — one readable line per
-- significant action, distinct from the raw before/after audit_logs above.
CREATE TABLE tenant_template.activity_history (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid REFERENCES tenant_template.users(id) ON DELETE SET NULL,
  action       varchar(50) NOT NULL,          -- "created", "approved", "cancelled", ...
  entity_type  varchar(60) NOT NULL,          -- "sales_invoice", "purchase_order", ...
  entity_id    uuid NOT NULL,
  description  text NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_activity_history_entity ON tenant_template.activity_history(entity_type, entity_id);
CREATE INDEX idx_activity_history_user ON tenant_template.activity_history(user_id, created_at DESC);

CREATE TABLE tenant_template.notifications (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES tenant_template.users(id) ON DELETE CASCADE,  -- NULL = broadcast
  title           varchar(150) NOT NULL,
  message         text NOT NULL,
  type            varchar(30) NOT NULL CHECK (type IN
                    ('low_stock','order_approval','payment_due','reservation_expiry','system','other')),
  is_read         boolean NOT NULL DEFAULT false,
  reference_type  varchar(40),
  reference_id    uuid,
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_notifications_user_unread ON tenant_template.notifications(user_id) WHERE NOT is_read;

-- Configurable "Admin Approval Workflow": which document types require approval above
-- what amount, and which role approves them.
CREATE TABLE tenant_template.approval_workflows (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_type     varchar(40) NOT NULL,   -- 'purchase_order' | 'sales_order' | 'stock_adjustment' | ...
  min_amount        numeric(18,2),          -- NULL = always requires approval
  approver_role_id  uuid NOT NULL REFERENCES tenant_template.roles(id) ON DELETE RESTRICT,
  is_active         boolean NOT NULL DEFAULT true,
  UNIQUE (document_type, approver_role_id)
);

-- Sequential, financial-year-scoped document numbering (PO-2025-0001, INV-2025-0002, ...),
-- consumed by tenant_template.fn_next_document_number() (functions/002_document_numbering.sql).
CREATE TABLE tenant_template.document_number_sequences (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  financial_year_id  uuid NOT NULL REFERENCES tenant_template.financial_years(id) ON DELETE RESTRICT,
  document_type      varchar(40) NOT NULL,
  prefix             varchar(10) NOT NULL,
  last_number        integer NOT NULL DEFAULT 0 CHECK (last_number >= 0),
  UNIQUE (financial_year_id, document_type)
);

-- ---------- AI / reporting support --------------------------------------------------------
-- Nightly rollup of quantity/amount sold per product per warehouse per day. The AI module's
-- 30/60/90/180/365-day forecasts (moving average + weighted trend) are simple range-SUM
-- queries against this table rather than scanning sales_invoice_lines directly.
CREATE TABLE tenant_template.sales_daily_aggregates (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id     uuid NOT NULL REFERENCES tenant_template.products(id) ON DELETE CASCADE,
  warehouse_id   uuid NOT NULL REFERENCES tenant_template.warehouses(id) ON DELETE CASCADE,
  sale_date      date NOT NULL,
  quantity_sold  numeric(18,3) NOT NULL DEFAULT 0,
  sales_amount   numeric(18,2) NOT NULL DEFAULT 0,
  created_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, warehouse_id, sale_date)
);
CREATE INDEX idx_sales_daily_aggregates_date ON tenant_template.sales_daily_aggregates(sale_date);
CREATE INDEX idx_sales_daily_aggregates_product ON tenant_template.sales_daily_aggregates(product_id, sale_date);

-- Output of the heuristic reorder-quantity engine (Special Feature #3 / AI Features).
CREATE TABLE tenant_template.reorder_suggestions (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id              uuid NOT NULL REFERENCES tenant_template.products(id) ON DELETE CASCADE,
  warehouse_id            uuid NOT NULL REFERENCES tenant_template.warehouses(id) ON DELETE CASCADE,
  calculation_window_days smallint NOT NULL CHECK (calculation_window_days IN (30,60,90,180,365)),
  avg_daily_demand        numeric(18,4) NOT NULL DEFAULT 0,
  current_stock           numeric(18,3) NOT NULL DEFAULT 0,
  recommended_quantity    numeric(18,3) NOT NULL DEFAULT 0,
  status                  varchar(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','ordered','dismissed')),
  generated_at            timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_reorder_suggestions_product_wh ON tenant_template.reorder_suggestions(product_id, warehouse_id);
CREATE INDEX idx_reorder_suggestions_status ON tenant_template.reorder_suggestions(status) WHERE status = 'pending';
