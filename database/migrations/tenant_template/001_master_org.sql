-- =====================================================================================
-- TENANT TEMPLATE: Master / Organization data
-- Org structure (branches -> warehouses -> racks -> locations), RBAC (roles/permissions),
-- users, catalog masters (categories/brands/units/tax), and trading-partner masters.
-- =====================================================================================
SET search_path TO tenant_template, public;

-- ---------- Financial years -----------------------------------------------------------
CREATE TABLE tenant_template.financial_years (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        varchar(20) NOT NULL,         -- e.g. "FY 2025-26"
  start_date  date NOT NULL,
  end_date    date NOT NULL,
  is_current  boolean NOT NULL DEFAULT false,
  is_closed   boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_fy_dates CHECK (end_date > start_date)
);
CREATE UNIQUE INDEX uq_financial_years_current ON tenant_template.financial_years (is_current) WHERE is_current;
CREATE TRIGGER trg_fy_updated_at BEFORE UPDATE ON tenant_template.financial_years
  FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

-- ---------- RBAC: roles / permissions ---------------------------------------------------
CREATE TABLE tenant_template.roles (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name           varchar(50) NOT NULL UNIQUE,   -- Admin, Manager, Warehouse Manager, Sales Person, Viewer, + custom
  is_system_role boolean NOT NULL DEFAULT false, -- true for the 5 built-in roles: cannot be deleted
  description    text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_roles_updated_at BEFORE UPDATE ON tenant_template.roles
  FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

-- One row per (module, action) — the full permission matrix. Every screen in the plan
-- ("Every screen should have permissions: Create/Edit/Delete/Approve/Export/Print") maps
-- to a module code here (e.g. module='sales_invoices').
CREATE TABLE tenant_template.permissions (
  id       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module   varchar(60) NOT NULL,
  action   varchar(20) NOT NULL CHECK (action IN ('view','create','edit','delete','approve','export','print')),
  code     varchar(90) NOT NULL UNIQUE,   -- "module.action", e.g. "sales_invoices.approve"
  UNIQUE (module, action)
);

CREATE TABLE tenant_template.role_permissions (
  role_id       uuid NOT NULL REFERENCES tenant_template.roles(id) ON DELETE CASCADE,
  permission_id uuid NOT NULL REFERENCES tenant_template.permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- ---------- Users -------------------------------------------------------------------
CREATE TABLE tenant_template.users (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  varchar(150) NOT NULL,
  email                 varchar(200) NOT NULL UNIQUE,
  phone                 varchar(30),
  password_hash         text NOT NULL,
  avatar_url            text,
  is_active             boolean NOT NULL DEFAULT true,
  must_change_password  boolean NOT NULL DEFAULT false,
  last_login_at         timestamptz,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON tenant_template.users
  FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

CREATE TABLE tenant_template.user_roles (
  user_id uuid NOT NULL REFERENCES tenant_template.users(id) ON DELETE CASCADE,
  role_id uuid NOT NULL REFERENCES tenant_template.roles(id) ON DELETE RESTRICT,
  PRIMARY KEY (user_id, role_id)
);

-- OTP + refresh token storage (login OTP verification, forgot/change password, JWT refresh rotation)
CREATE TABLE tenant_template.otp_codes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES tenant_template.users(id) ON DELETE CASCADE,
  purpose     varchar(30) NOT NULL CHECK (purpose IN ('login','forgot_password','change_password')),
  code_hash   text NOT NULL,
  expires_at  timestamptz NOT NULL,
  consumed_at timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_otp_codes_user ON tenant_template.otp_codes(user_id, purpose);

CREATE TABLE tenant_template.refresh_tokens (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES tenant_template.users(id) ON DELETE CASCADE,
  token_hash  text NOT NULL UNIQUE,
  expires_at  timestamptz NOT NULL,
  revoked_at  timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_refresh_tokens_user ON tenant_template.refresh_tokens(user_id);

-- ---------- Org structure: branches -> warehouses -> racks -> locations ------------------
CREATE TABLE tenant_template.branches (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            varchar(150) NOT NULL,
  code            varchar(30) NOT NULL UNIQUE,
  is_head_office  boolean NOT NULL DEFAULT false,
  address_line1   varchar(200), address_line2 varchar(200),
  city            varchar(100), state varchar(100), country varchar(100), pincode varchar(20),
  phone           varchar(30), email varchar(200),
  is_active       boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_branches_updated_at BEFORE UPDATE ON tenant_template.branches
  FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

CREATE TABLE tenant_template.warehouses (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id   uuid NOT NULL REFERENCES tenant_template.branches(id) ON DELETE RESTRICT,
  name        varchar(150) NOT NULL,
  code        varchar(30) NOT NULL UNIQUE,
  address_line1 varchar(200), city varchar(100), state varchar(100), pincode varchar(20),
  manager_id  uuid,  -- FK to employees, added after employees table exists (see below)
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_warehouses_branch ON tenant_template.warehouses(branch_id);
CREATE TRIGGER trg_warehouses_updated_at BEFORE UPDATE ON tenant_template.warehouses
  FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

CREATE TABLE tenant_template.racks (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  warehouse_id  uuid NOT NULL REFERENCES tenant_template.warehouses(id) ON DELETE RESTRICT,
  name          varchar(100) NOT NULL,
  code          varchar(30) NOT NULL,
  is_active     boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (warehouse_id, code)
);
CREATE INDEX idx_racks_warehouse ON tenant_template.racks(warehouse_id);
CREATE TRIGGER trg_racks_updated_at BEFORE UPDATE ON tenant_template.racks
  FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

CREATE TABLE tenant_template.locations (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rack_id     uuid NOT NULL REFERENCES tenant_template.racks(id) ON DELETE RESTRICT,
  name        varchar(100) NOT NULL,        -- bin/shelf label, e.g. "A1-03"
  code        varchar(30) NOT NULL,
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (rack_id, code)
);
CREATE INDEX idx_locations_rack ON tenant_template.locations(rack_id);
CREATE TRIGGER trg_locations_updated_at BEFORE UPDATE ON tenant_template.locations
  FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

-- ---------- Catalog masters: categories / brands / units / tax --------------------------
CREATE TABLE tenant_template.categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        varchar(100) NOT NULL,
  code        varchar(30) NOT NULL UNIQUE,
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_categories_updated_at BEFORE UPDATE ON tenant_template.categories
  FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

CREATE TABLE tenant_template.sub_categories (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id  uuid NOT NULL REFERENCES tenant_template.categories(id) ON DELETE RESTRICT,
  name         varchar(100) NOT NULL,
  code         varchar(30) NOT NULL,
  is_active    boolean NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (category_id, code)
);
CREATE INDEX idx_sub_categories_category ON tenant_template.sub_categories(category_id);
CREATE TRIGGER trg_sub_categories_updated_at BEFORE UPDATE ON tenant_template.sub_categories
  FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

CREATE TABLE tenant_template.brands (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        varchar(100) NOT NULL,
  code        varchar(30) NOT NULL UNIQUE,
  logo_url    text,
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_brands_updated_at BEFORE UPDATE ON tenant_template.brands
  FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

CREATE TABLE tenant_template.units (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        varchar(50) NOT NULL,          -- "Piece", "Box", "Kilogram"
  short_code  varchar(10) NOT NULL UNIQUE,   -- "PCS", "BOX", "KG"
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_units_updated_at BEFORE UPDATE ON tenant_template.units
  FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

-- Generic fallback conversions between units of the same dimension (e.g. 1 BOX = 12 PCS).
-- Product-specific overrides (this product's box holds 24 pcs, not the generic 12) live on
-- product_units (see 002_product.sql) and take precedence when present.
CREATE TABLE tenant_template.unit_conversions (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_unit_id        uuid NOT NULL REFERENCES tenant_template.units(id) ON DELETE RESTRICT,
  to_unit_id          uuid NOT NULL REFERENCES tenant_template.units(id) ON DELETE RESTRICT,
  conversion_factor   numeric(18,6) NOT NULL CHECK (conversion_factor > 0),  -- 1 from_unit = factor * to_unit
  created_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE (from_unit_id, to_unit_id),
  CHECK (from_unit_id <> to_unit_id)
);

CREATE TABLE tenant_template.gst_rates (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        varchar(30) NOT NULL UNIQUE,      -- "GST 18%"
  total_rate  numeric(5,2) NOT NULL CHECK (total_rate >= 0),
  cgst_rate   numeric(5,2) NOT NULL CHECK (cgst_rate >= 0),
  sgst_rate   numeric(5,2) NOT NULL CHECK (sgst_rate >= 0),
  igst_rate   numeric(5,2) NOT NULL CHECK (igst_rate >= 0),
  is_active   boolean NOT NULL DEFAULT true,
  CHECK (cgst_rate + sgst_rate = igst_rate)
);

CREATE TABLE tenant_template.hsn_codes (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code            varchar(15) NOT NULL UNIQUE,
  description     text,
  default_gst_id  uuid REFERENCES tenant_template.gst_rates(id) ON DELETE SET NULL,
  is_active       boolean NOT NULL DEFAULT true
);

CREATE TABLE tenant_template.taxes (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name      varchar(50) NOT NULL UNIQUE,
  tax_type  varchar(20) NOT NULL CHECK (tax_type IN ('gst','vat','cess','custom_duty','other')),
  rate      numeric(5,2) NOT NULL CHECK (rate >= 0),
  is_active boolean NOT NULL DEFAULT true
);

-- ---------- Trading partners: suppliers / customers / employees / transport --------------
CREATE TABLE tenant_template.suppliers (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name               varchar(200) NOT NULL,
  code               varchar(30) NOT NULL UNIQUE,
  contact_person     varchar(150),
  email              varchar(200),
  phone              varchar(30),
  gstin              varchar(20),
  pan                varchar(15),
  address_line1      varchar(200), address_line2 varchar(200),
  city               varchar(100), state varchar(100), country varchar(100), pincode varchar(20),
  credit_period_days integer NOT NULL DEFAULT 0,
  opening_balance    numeric(18,2) NOT NULL DEFAULT 0,
  is_blocked         boolean NOT NULL DEFAULT false,   -- "Supplier Name Blocking"
  blocked_reason     text,
  is_active          boolean NOT NULL DEFAULT true,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_suppliers_name_trgm ON tenant_template.suppliers USING gin (name gin_trgm_ops);
CREATE TRIGGER trg_suppliers_updated_at BEFORE UPDATE ON tenant_template.suppliers
  FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

CREATE TABLE tenant_template.customers (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name               varchar(200) NOT NULL,
  code               varchar(30) NOT NULL UNIQUE,
  contact_person     varchar(150),
  email              varchar(200),
  phone              varchar(30),
  gstin              varchar(20),
  pan                varchar(15),
  address_line1      varchar(200), address_line2 varchar(200),
  city               varchar(100), state varchar(100), country varchar(100), pincode varchar(20),
  credit_limit       numeric(18,2) NOT NULL DEFAULT 0,
  credit_period_days integer NOT NULL DEFAULT 0,
  opening_balance    numeric(18,2) NOT NULL DEFAULT 0,
  is_blocked         boolean NOT NULL DEFAULT false,   -- "Customer Name Blocking"
  blocked_reason     text,
  is_active          boolean NOT NULL DEFAULT true,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_customers_name_trgm ON tenant_template.customers USING gin (name gin_trgm_ops);
CREATE TRIGGER trg_customers_updated_at BEFORE UPDATE ON tenant_template.customers
  FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

CREATE TABLE tenant_template.employees (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid REFERENCES tenant_template.users(id) ON DELETE SET NULL,
  name           varchar(150) NOT NULL,
  code           varchar(30) NOT NULL UNIQUE,
  designation    varchar(100),
  department     varchar(100),
  phone          varchar(30),
  email          varchar(200),
  joining_date   date,
  is_active      boolean NOT NULL DEFAULT true,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_employees_updated_at BEFORE UPDATE ON tenant_template.employees
  FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

ALTER TABLE tenant_template.warehouses
  ADD CONSTRAINT fk_warehouses_manager FOREIGN KEY (manager_id)
  REFERENCES tenant_template.employees(id) ON DELETE SET NULL;

CREATE TABLE tenant_template.transporters (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name           varchar(150) NOT NULL,
  code           varchar(30) NOT NULL UNIQUE,
  contact_person varchar(150),
  phone          varchar(30),
  vehicle_number varchar(30),
  gst_number     varchar(20),
  is_active      boolean NOT NULL DEFAULT true,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_transporters_updated_at BEFORE UPDATE ON tenant_template.transporters
  FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();
