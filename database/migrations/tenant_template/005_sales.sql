-- =====================================================================================
-- TENANT TEMPLATE: Sales cycle
-- Quotation -> Sales Order -> Delivery Challan -> Sales Invoice -> Customer Payment
-- (+ Sales Return). Mirrors the purchase cycle's header/line + document-number pattern.
-- =====================================================================================
SET search_path TO tenant_template, public;

CREATE TABLE tenant_template.quotations (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_number  varchar(30) NOT NULL UNIQUE,
  quotation_date    date NOT NULL DEFAULT current_date,
  customer_id       uuid NOT NULL REFERENCES tenant_template.customers(id) ON DELETE RESTRICT,
  valid_until       date,
  status            varchar(20) NOT NULL DEFAULT 'draft' CHECK (status IN
                      ('draft','sent','accepted','rejected','expired','converted')),
  remarks           text,
  total_amount      numeric(18,2) NOT NULL DEFAULT 0,
  created_by        uuid REFERENCES tenant_template.users(id) ON DELETE SET NULL,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_quotations_customer ON tenant_template.quotations(customer_id);
CREATE TRIGGER trg_quotations_updated_at BEFORE UPDATE ON tenant_template.quotations
  FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

CREATE TABLE tenant_template.quotation_lines (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id      uuid NOT NULL REFERENCES tenant_template.quotations(id) ON DELETE CASCADE,
  product_id        uuid NOT NULL REFERENCES tenant_template.products(id) ON DELETE RESTRICT,
  product_unit_id   uuid NOT NULL REFERENCES tenant_template.product_units(id) ON DELETE RESTRICT,
  quantity          numeric(18,3) NOT NULL CHECK (quantity > 0),
  rate              numeric(18,2) NOT NULL CHECK (rate >= 0),
  discount_percent  numeric(5,2) NOT NULL DEFAULT 0,
  gst_id            uuid REFERENCES tenant_template.gst_rates(id) ON DELETE RESTRICT,
  line_total        numeric(18,2) NOT NULL DEFAULT 0
);
CREATE INDEX idx_quotation_lines_quotation ON tenant_template.quotation_lines(quotation_id);

CREATE TABLE tenant_template.sales_orders (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  so_number              varchar(30) NOT NULL UNIQUE,
  so_date                date NOT NULL DEFAULT current_date,
  customer_id            uuid NOT NULL REFERENCES tenant_template.customers(id) ON DELETE RESTRICT,
  quotation_id           uuid REFERENCES tenant_template.quotations(id) ON DELETE SET NULL,
  warehouse_id           uuid NOT NULL REFERENCES tenant_template.warehouses(id) ON DELETE RESTRICT,
  financial_year_id      uuid NOT NULL REFERENCES tenant_template.financial_years(id) ON DELETE RESTRICT,
  expected_delivery_date date,
  status                 varchar(25) NOT NULL DEFAULT 'draft' CHECK (status IN
                          ('draft','pending_approval','approved','partially_delivered','completed','cancelled')),
  remarks                text,
  total_amount           numeric(18,2) NOT NULL DEFAULT 0,
  created_by             uuid REFERENCES tenant_template.users(id) ON DELETE SET NULL,
  approved_by            uuid REFERENCES tenant_template.users(id) ON DELETE SET NULL,
  approved_at            timestamptz,
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_so_customer ON tenant_template.sales_orders(customer_id);
CREATE INDEX idx_so_status ON tenant_template.sales_orders(status);
CREATE TRIGGER trg_so_updated_at BEFORE UPDATE ON tenant_template.sales_orders
  FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

CREATE TABLE tenant_template.sales_order_lines (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  so_id              uuid NOT NULL REFERENCES tenant_template.sales_orders(id) ON DELETE CASCADE,
  product_id         uuid NOT NULL REFERENCES tenant_template.products(id) ON DELETE RESTRICT,
  product_unit_id    uuid NOT NULL REFERENCES tenant_template.product_units(id) ON DELETE RESTRICT,
  quantity           numeric(18,3) NOT NULL CHECK (quantity > 0),
  delivered_quantity numeric(18,3) NOT NULL DEFAULT 0 CHECK (delivered_quantity >= 0),
  rate               numeric(18,2) NOT NULL CHECK (rate >= 0),
  discount_percent   numeric(5,2) NOT NULL DEFAULT 0,
  gst_id             uuid REFERENCES tenant_template.gst_rates(id) ON DELETE RESTRICT,
  line_total         numeric(18,2) NOT NULL DEFAULT 0
);
CREATE INDEX idx_so_lines_so ON tenant_template.sales_order_lines(so_id);

CREATE TABLE tenant_template.delivery_challans (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dc_number      varchar(30) NOT NULL UNIQUE,
  dc_date        date NOT NULL DEFAULT current_date,
  so_id          uuid REFERENCES tenant_template.sales_orders(id) ON DELETE RESTRICT,
  customer_id    uuid NOT NULL REFERENCES tenant_template.customers(id) ON DELETE RESTRICT,
  warehouse_id   uuid NOT NULL REFERENCES tenant_template.warehouses(id) ON DELETE RESTRICT,
  transporter_id uuid REFERENCES tenant_template.transporters(id) ON DELETE SET NULL,
  status         varchar(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','dispatched','delivered','cancelled')),
  remarks        text,
  created_by     uuid REFERENCES tenant_template.users(id) ON DELETE SET NULL,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_dc_so ON tenant_template.delivery_challans(so_id);
CREATE INDEX idx_dc_customer ON tenant_template.delivery_challans(customer_id);
CREATE TRIGGER trg_dc_updated_at BEFORE UPDATE ON tenant_template.delivery_challans
  FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

CREATE TABLE tenant_template.delivery_challan_lines (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dc_id           uuid NOT NULL REFERENCES tenant_template.delivery_challans(id) ON DELETE CASCADE,
  so_line_id      uuid REFERENCES tenant_template.sales_order_lines(id) ON DELETE RESTRICT,
  product_id      uuid NOT NULL REFERENCES tenant_template.products(id) ON DELETE RESTRICT,
  product_unit_id uuid NOT NULL REFERENCES tenant_template.product_units(id) ON DELETE RESTRICT,
  batch_id        uuid REFERENCES tenant_template.product_batches(id) ON DELETE RESTRICT,
  quantity        numeric(18,3) NOT NULL CHECK (quantity > 0),
  remarks         text
);
CREATE INDEX idx_dc_lines_dc ON tenant_template.delivery_challan_lines(dc_id);

CREATE TABLE tenant_template.sales_invoices (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number    varchar(30) NOT NULL UNIQUE,
  invoice_date      date NOT NULL DEFAULT current_date,
  dc_id             uuid REFERENCES tenant_template.delivery_challans(id) ON DELETE RESTRICT,
  so_id             uuid REFERENCES tenant_template.sales_orders(id) ON DELETE RESTRICT,
  customer_id       uuid NOT NULL REFERENCES tenant_template.customers(id) ON DELETE RESTRICT,
  financial_year_id uuid NOT NULL REFERENCES tenant_template.financial_years(id) ON DELETE RESTRICT,
  due_date          date,
  status            varchar(20) NOT NULL DEFAULT 'draft' CHECK (status IN
                      ('draft','approved','partially_paid','paid','cancelled')),
  subtotal          numeric(18,2) NOT NULL DEFAULT 0,
  tax_amount        numeric(18,2) NOT NULL DEFAULT 0,
  discount_amount   numeric(18,2) NOT NULL DEFAULT 0,
  total_amount      numeric(18,2) NOT NULL DEFAULT 0,
  paid_amount       numeric(18,2) NOT NULL DEFAULT 0,
  created_by        uuid REFERENCES tenant_template.users(id) ON DELETE SET NULL,
  approved_by       uuid REFERENCES tenant_template.users(id) ON DELETE SET NULL,
  approved_at       timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  CHECK (paid_amount <= total_amount)
);
CREATE INDEX idx_sales_invoices_customer ON tenant_template.sales_invoices(customer_id);
CREATE INDEX idx_sales_invoices_status ON tenant_template.sales_invoices(status);
CREATE TRIGGER trg_sales_invoices_updated_at BEFORE UPDATE ON tenant_template.sales_invoices
  FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

CREATE TABLE tenant_template.sales_invoice_lines (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id        uuid NOT NULL REFERENCES tenant_template.sales_invoices(id) ON DELETE CASCADE,
  product_id        uuid NOT NULL REFERENCES tenant_template.products(id) ON DELETE RESTRICT,
  product_unit_id   uuid NOT NULL REFERENCES tenant_template.product_units(id) ON DELETE RESTRICT,
  batch_id          uuid REFERENCES tenant_template.product_batches(id) ON DELETE RESTRICT,
  quantity          numeric(18,3) NOT NULL CHECK (quantity > 0),
  rate              numeric(18,2) NOT NULL CHECK (rate >= 0),
  discount_percent  numeric(5,2) NOT NULL DEFAULT 0,
  gst_id            uuid REFERENCES tenant_template.gst_rates(id) ON DELETE RESTRICT,
  tax_amount        numeric(18,2) NOT NULL DEFAULT 0,
  line_total        numeric(18,2) NOT NULL DEFAULT 0
);
CREATE INDEX idx_sales_invoice_lines_invoice ON tenant_template.sales_invoice_lines(invoice_id);

CREATE TABLE tenant_template.customer_payments (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_number   varchar(30) NOT NULL UNIQUE,
  payment_date     date NOT NULL DEFAULT current_date,
  customer_id      uuid NOT NULL REFERENCES tenant_template.customers(id) ON DELETE RESTRICT,
  amount           numeric(18,2) NOT NULL CHECK (amount > 0),
  payment_mode     varchar(20) NOT NULL CHECK (payment_mode IN ('cash','bank_transfer','cheque','upi','card','other')),
  reference_number varchar(60),
  remarks          text,
  created_by       uuid REFERENCES tenant_template.users(id) ON DELETE SET NULL,
  created_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_customer_payments_customer ON tenant_template.customer_payments(customer_id);

CREATE TABLE tenant_template.customer_payment_allocations (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id        uuid NOT NULL REFERENCES tenant_template.customer_payments(id) ON DELETE CASCADE,
  sales_invoice_id  uuid NOT NULL REFERENCES tenant_template.sales_invoices(id) ON DELETE RESTRICT,
  allocated_amount  numeric(18,2) NOT NULL CHECK (allocated_amount > 0)
);
CREATE INDEX idx_customer_payment_allocations_payment ON tenant_template.customer_payment_allocations(payment_id);
CREATE INDEX idx_customer_payment_allocations_invoice ON tenant_template.customer_payment_allocations(sales_invoice_id);

CREATE TABLE tenant_template.sales_returns (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  return_number     varchar(30) NOT NULL UNIQUE,
  return_date       date NOT NULL DEFAULT current_date,
  customer_id       uuid NOT NULL REFERENCES tenant_template.customers(id) ON DELETE RESTRICT,
  sales_invoice_id  uuid REFERENCES tenant_template.sales_invoices(id) ON DELETE RESTRICT,
  warehouse_id      uuid NOT NULL REFERENCES tenant_template.warehouses(id) ON DELETE RESTRICT,
  reason            text,
  status            varchar(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','approved','cancelled')),
  total_amount      numeric(18,2) NOT NULL DEFAULT 0,
  created_by        uuid REFERENCES tenant_template.users(id) ON DELETE SET NULL,
  approved_by       uuid REFERENCES tenant_template.users(id) ON DELETE SET NULL,
  approved_at       timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_sales_returns_updated_at BEFORE UPDATE ON tenant_template.sales_returns
  FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

CREATE TABLE tenant_template.sales_return_lines (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  return_id   uuid NOT NULL REFERENCES tenant_template.sales_returns(id) ON DELETE CASCADE,
  product_id  uuid NOT NULL REFERENCES tenant_template.products(id) ON DELETE RESTRICT,
  batch_id    uuid REFERENCES tenant_template.product_batches(id) ON DELETE RESTRICT,
  quantity    numeric(18,3) NOT NULL CHECK (quantity > 0),
  rate        numeric(18,2) NOT NULL CHECK (rate >= 0),
  line_total  numeric(18,2) NOT NULL DEFAULT 0
);
CREATE INDEX idx_sales_return_lines_return ON tenant_template.sales_return_lines(return_id);
