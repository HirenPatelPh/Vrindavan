-- =====================================================================================
-- TENANT TEMPLATE: Inventory
-- stock_ledger is the single append-only source of truth for every stock movement.
-- stock_balances is a denormalized summary kept in sync by trigger (see functions/ folder)
-- and is what every screen/report actually queries for "current stock".
-- All quantities are stored in the product's base unit (see product_units.conversion_factor).
-- =====================================================================================
SET search_path TO tenant_template, public;

CREATE TABLE tenant_template.stock_ledger (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id        uuid NOT NULL REFERENCES tenant_template.products(id) ON DELETE RESTRICT,
  warehouse_id      uuid NOT NULL REFERENCES tenant_template.warehouses(id) ON DELETE RESTRICT,
  rack_id           uuid REFERENCES tenant_template.racks(id) ON DELETE RESTRICT,
  location_id       uuid REFERENCES tenant_template.locations(id) ON DELETE RESTRICT,
  batch_id          uuid REFERENCES tenant_template.product_batches(id) ON DELETE RESTRICT,
  movement_type     varchar(40) NOT NULL CHECK (movement_type IN (
                      'opening_stock','purchase_in','sales_out','transfer_in','transfer_out',
                      'adjustment_in','adjustment_out','return_in','return_out',
                      'damage_out','verification_adjustment_in','verification_adjustment_out')),
                      -- NOTE: reservation/block are NOT physical movements — they never touch
                      -- stock_ledger, only stock_balances.reserved_quantity / blocked_quantity
                      -- (maintained by triggers on reserved_stock / blocked_stock_entries).
  qty_in            numeric(18,3) NOT NULL DEFAULT 0 CHECK (qty_in >= 0),
  qty_out           numeric(18,3) NOT NULL DEFAULT 0 CHECK (qty_out >= 0),
  unit_cost         numeric(18,4) NOT NULL DEFAULT 0 CHECK (unit_cost >= 0),  -- moving-average cost per base unit at time of posting
  reference_type    varchar(40) NOT NULL,   -- 'purchase_invoice' | 'sales_invoice' | 'stock_transfer' | 'stock_adjustment' | ...
  reference_id      uuid NOT NULL,
  reference_line_id uuid,
  remarks           text,
  created_by        uuid REFERENCES tenant_template.users(id) ON DELETE SET NULL,
  created_at        timestamptz NOT NULL DEFAULT now(),
  CHECK ((qty_in > 0 AND qty_out = 0) OR (qty_out > 0 AND qty_in = 0))
);
CREATE INDEX idx_stock_ledger_product_wh ON tenant_template.stock_ledger(product_id, warehouse_id);
CREATE INDEX idx_stock_ledger_reference ON tenant_template.stock_ledger(reference_type, reference_id);
CREATE INDEX idx_stock_ledger_created_at ON tenant_template.stock_ledger(created_at);
CREATE INDEX idx_stock_ledger_batch ON tenant_template.stock_ledger(batch_id) WHERE batch_id IS NOT NULL;

-- Current on-hand summary. Never written directly by application code — only by
-- tenant_template.trg_stock_ledger_to_balance() (see functions/003_stock_functions.sql).
CREATE TABLE tenant_template.stock_balances (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id         uuid NOT NULL REFERENCES tenant_template.products(id) ON DELETE RESTRICT,
  warehouse_id       uuid NOT NULL REFERENCES tenant_template.warehouses(id) ON DELETE RESTRICT,
  rack_id            uuid REFERENCES tenant_template.racks(id) ON DELETE RESTRICT,
  location_id        uuid REFERENCES tenant_template.locations(id) ON DELETE RESTRICT,
  batch_id           uuid REFERENCES tenant_template.product_batches(id) ON DELETE RESTRICT,
  quantity           numeric(18,3) NOT NULL DEFAULT 0,
  reserved_quantity  numeric(18,3) NOT NULL DEFAULT 0 CHECK (reserved_quantity >= 0),
  blocked_quantity   numeric(18,3) NOT NULL DEFAULT 0 CHECK (blocked_quantity >= 0),
  average_cost       numeric(18,4) NOT NULL DEFAULT 0,
  updated_at         timestamptz NOT NULL DEFAULT now(),
  CHECK (quantity >= 0),
  CHECK (reserved_quantity + blocked_quantity <= quantity)
);
-- NULL-safe uniqueness across the optional rack/location/batch dimensions.
CREATE UNIQUE INDEX uq_stock_balances_dimensions ON tenant_template.stock_balances (
  product_id, warehouse_id,
  COALESCE(rack_id, '00000000-0000-0000-0000-000000000000'),
  COALESCE(location_id, '00000000-0000-0000-0000-000000000000'),
  COALESCE(batch_id, '00000000-0000-0000-0000-000000000000')
);
CREATE INDEX idx_stock_balances_product ON tenant_template.stock_balances(product_id);
CREATE INDEX idx_stock_balances_warehouse ON tenant_template.stock_balances(warehouse_id);

-- ---------- Stock Transfer (warehouse / rack / location level) --------------------------
CREATE TABLE tenant_template.stock_transfers (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transfer_number   varchar(30) NOT NULL UNIQUE,
  transfer_date     date NOT NULL DEFAULT current_date,
  from_warehouse_id uuid NOT NULL REFERENCES tenant_template.warehouses(id) ON DELETE RESTRICT,
  to_warehouse_id   uuid NOT NULL REFERENCES tenant_template.warehouses(id) ON DELETE RESTRICT,
  status            varchar(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','in_transit','completed','cancelled')),
  remarks           text,
  created_by        uuid REFERENCES tenant_template.users(id) ON DELETE SET NULL,
  approved_by       uuid REFERENCES tenant_template.users(id) ON DELETE SET NULL,
  approved_at       timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_stock_transfers_updated_at BEFORE UPDATE ON tenant_template.stock_transfers
  FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

CREATE TABLE tenant_template.stock_transfer_lines (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transfer_id     uuid NOT NULL REFERENCES tenant_template.stock_transfers(id) ON DELETE CASCADE,
  product_id      uuid NOT NULL REFERENCES tenant_template.products(id) ON DELETE RESTRICT,
  batch_id        uuid REFERENCES tenant_template.product_batches(id) ON DELETE RESTRICT,
  from_rack_id    uuid REFERENCES tenant_template.racks(id) ON DELETE RESTRICT,
  from_location_id uuid REFERENCES tenant_template.locations(id) ON DELETE RESTRICT,
  to_rack_id      uuid REFERENCES tenant_template.racks(id) ON DELETE RESTRICT,
  to_location_id  uuid REFERENCES tenant_template.locations(id) ON DELETE RESTRICT,
  quantity        numeric(18,3) NOT NULL CHECK (quantity > 0)
);
CREATE INDEX idx_stock_transfer_lines_transfer ON tenant_template.stock_transfer_lines(transfer_id);

-- ---------- Stock Adjustment -------------------------------------------------------------
CREATE TABLE tenant_template.stock_adjustments (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  adjustment_number  varchar(30) NOT NULL UNIQUE,
  adjustment_date    date NOT NULL DEFAULT current_date,
  warehouse_id       uuid NOT NULL REFERENCES tenant_template.warehouses(id) ON DELETE RESTRICT,
  reason             text,
  status             varchar(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','approved','cancelled')),
  created_by         uuid REFERENCES tenant_template.users(id) ON DELETE SET NULL,
  approved_by        uuid REFERENCES tenant_template.users(id) ON DELETE SET NULL,
  approved_at        timestamptz,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_stock_adjustments_updated_at BEFORE UPDATE ON tenant_template.stock_adjustments
  FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

CREATE TABLE tenant_template.stock_adjustment_lines (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  adjustment_id      uuid NOT NULL REFERENCES tenant_template.stock_adjustments(id) ON DELETE CASCADE,
  product_id         uuid NOT NULL REFERENCES tenant_template.products(id) ON DELETE RESTRICT,
  batch_id           uuid REFERENCES tenant_template.product_batches(id) ON DELETE RESTRICT,
  rack_id            uuid REFERENCES tenant_template.racks(id) ON DELETE RESTRICT,
  location_id        uuid REFERENCES tenant_template.locations(id) ON DELETE RESTRICT,
  system_quantity    numeric(18,3) NOT NULL,
  adjusted_quantity  numeric(18,3) NOT NULL,
  remarks            text
);
CREATE INDEX idx_stock_adjustment_lines_adjustment ON tenant_template.stock_adjustment_lines(adjustment_id);

-- ---------- Physical Verification (stock count / cycle count) ---------------------------
CREATE TABLE tenant_template.physical_verifications (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  verification_number varchar(30) NOT NULL UNIQUE,
  verification_date   date NOT NULL DEFAULT current_date,
  warehouse_id         uuid NOT NULL REFERENCES tenant_template.warehouses(id) ON DELETE RESTRICT,
  status               varchar(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','in_progress','completed','cancelled')),
  created_by           uuid REFERENCES tenant_template.users(id) ON DELETE SET NULL,
  completed_at         timestamptz,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_physical_verifications_updated_at BEFORE UPDATE ON tenant_template.physical_verifications
  FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

CREATE TABLE tenant_template.physical_verification_lines (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  verification_id   uuid NOT NULL REFERENCES tenant_template.physical_verifications(id) ON DELETE CASCADE,
  product_id        uuid NOT NULL REFERENCES tenant_template.products(id) ON DELETE RESTRICT,
  batch_id          uuid REFERENCES tenant_template.product_batches(id) ON DELETE RESTRICT,
  rack_id           uuid REFERENCES tenant_template.racks(id) ON DELETE RESTRICT,
  location_id       uuid REFERENCES tenant_template.locations(id) ON DELETE RESTRICT,
  system_quantity   numeric(18,3) NOT NULL,
  counted_quantity  numeric(18,3) NOT NULL,
  difference        numeric(18,3) GENERATED ALWAYS AS (counted_quantity - system_quantity) STORED,
  remarks           text
);
CREATE INDEX idx_pv_lines_verification ON tenant_template.physical_verification_lines(verification_id);

-- ---------- Damaged Stock -----------------------------------------------------------------
CREATE TABLE tenant_template.damaged_stock (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  damage_number varchar(30) NOT NULL UNIQUE,
  damage_date   date NOT NULL DEFAULT current_date,
  warehouse_id  uuid NOT NULL REFERENCES tenant_template.warehouses(id) ON DELETE RESTRICT,
  reason        text,
  status        varchar(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','approved','cancelled')),
  created_by    uuid REFERENCES tenant_template.users(id) ON DELETE SET NULL,
  approved_by   uuid REFERENCES tenant_template.users(id) ON DELETE SET NULL,
  approved_at   timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_damaged_stock_updated_at BEFORE UPDATE ON tenant_template.damaged_stock
  FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

CREATE TABLE tenant_template.damaged_stock_lines (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  damage_id    uuid NOT NULL REFERENCES tenant_template.damaged_stock(id) ON DELETE CASCADE,
  product_id   uuid NOT NULL REFERENCES tenant_template.products(id) ON DELETE RESTRICT,
  batch_id     uuid REFERENCES tenant_template.product_batches(id) ON DELETE RESTRICT,
  rack_id      uuid REFERENCES tenant_template.racks(id) ON DELETE RESTRICT,
  location_id  uuid REFERENCES tenant_template.locations(id) ON DELETE RESTRICT,
  quantity     numeric(18,3) NOT NULL CHECK (quantity > 0),
  remarks      text
);
CREATE INDEX idx_damaged_stock_lines_damage ON tenant_template.damaged_stock_lines(damage_id);

-- ---------- Generic Stock Return (internal — distinct from customer/supplier returns,
-- which live in sales_returns / purchase_returns respectively) -----------------------------
CREATE TABLE tenant_template.stock_returns (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  return_number varchar(30) NOT NULL UNIQUE,
  return_date   date NOT NULL DEFAULT current_date,
  warehouse_id  uuid NOT NULL REFERENCES tenant_template.warehouses(id) ON DELETE RESTRICT,
  reason        text,
  status        varchar(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','approved','cancelled')),
  created_by    uuid REFERENCES tenant_template.users(id) ON DELETE SET NULL,
  approved_by   uuid REFERENCES tenant_template.users(id) ON DELETE SET NULL,
  approved_at   timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_stock_returns_updated_at BEFORE UPDATE ON tenant_template.stock_returns
  FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

CREATE TABLE tenant_template.stock_return_lines (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  return_id    uuid NOT NULL REFERENCES tenant_template.stock_returns(id) ON DELETE CASCADE,
  product_id   uuid NOT NULL REFERENCES tenant_template.products(id) ON DELETE RESTRICT,
  batch_id     uuid REFERENCES tenant_template.product_batches(id) ON DELETE RESTRICT,
  rack_id      uuid REFERENCES tenant_template.racks(id) ON DELETE RESTRICT,
  location_id  uuid REFERENCES tenant_template.locations(id) ON DELETE RESTRICT,
  quantity     numeric(18,3) NOT NULL CHECK (quantity > 0),
  remarks      text
);
CREATE INDEX idx_stock_return_lines_return ON tenant_template.stock_return_lines(return_id);

-- ---------- Blocked Stock (quality hold etc.) ---------------------------------------------
CREATE TABLE tenant_template.blocked_stock_entries (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id   uuid NOT NULL REFERENCES tenant_template.products(id) ON DELETE RESTRICT,
  warehouse_id uuid NOT NULL REFERENCES tenant_template.warehouses(id) ON DELETE RESTRICT,
  rack_id      uuid REFERENCES tenant_template.racks(id) ON DELETE RESTRICT,
  location_id  uuid REFERENCES tenant_template.locations(id) ON DELETE RESTRICT,
  batch_id     uuid REFERENCES tenant_template.product_batches(id) ON DELETE RESTRICT,
  quantity     numeric(18,3) NOT NULL CHECK (quantity > 0),
  reason       text NOT NULL,
  status       varchar(20) NOT NULL DEFAULT 'blocked' CHECK (status IN ('blocked','released')),
  blocked_by   uuid REFERENCES tenant_template.users(id) ON DELETE SET NULL,
  blocked_at   timestamptz NOT NULL DEFAULT now(),
  released_by  uuid REFERENCES tenant_template.users(id) ON DELETE SET NULL,
  released_at  timestamptz
);
CREATE INDEX idx_blocked_stock_product ON tenant_template.blocked_stock_entries(product_id, warehouse_id);

-- ---------- Reserved Stock (with expiry + auto-release) -----------------------------------
CREATE TABLE tenant_template.reserved_stock (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id     uuid NOT NULL REFERENCES tenant_template.products(id) ON DELETE RESTRICT,
  warehouse_id   uuid NOT NULL REFERENCES tenant_template.warehouses(id) ON DELETE RESTRICT,
  batch_id       uuid REFERENCES tenant_template.product_batches(id) ON DELETE RESTRICT,
  quantity       numeric(18,3) NOT NULL CHECK (quantity > 0),
  reference_type varchar(40) NOT NULL,     -- typically 'sales_order'
  reference_id   uuid NOT NULL,
  reserved_by    uuid REFERENCES tenant_template.users(id) ON DELETE SET NULL,
  reserved_at    timestamptz NOT NULL DEFAULT now(),
  expires_at     timestamptz NOT NULL,     -- "Reservation Expiry Date"
  status         varchar(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active','released','consumed','expired')),
  released_at    timestamptz
);
CREATE INDEX idx_reserved_stock_product_wh ON tenant_template.reserved_stock(product_id, warehouse_id);
CREATE INDEX idx_reserved_stock_expiry ON tenant_template.reserved_stock(expires_at) WHERE status = 'active';
CREATE INDEX idx_reserved_stock_reference ON tenant_template.reserved_stock(reference_type, reference_id);
