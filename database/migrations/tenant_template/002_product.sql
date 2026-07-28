-- =====================================================================================
-- TENANT TEMPLATE: Product catalog
-- =====================================================================================
SET search_path TO tenant_template, public;

CREATE TABLE tenant_template.products (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name                varchar(200) NOT NULL,
  sku                 varchar(50) NOT NULL UNIQUE,
  barcode             varchar(50) UNIQUE,
  qr_code             varchar(100) UNIQUE,
  category_id         uuid NOT NULL REFERENCES tenant_template.categories(id) ON DELETE RESTRICT,
  sub_category_id     uuid REFERENCES tenant_template.sub_categories(id) ON DELETE RESTRICT,
  brand_id            uuid REFERENCES tenant_template.brands(id) ON DELETE RESTRICT,
  hsn_id              uuid REFERENCES tenant_template.hsn_codes(id) ON DELETE RESTRICT,
  gst_id              uuid REFERENCES tenant_template.gst_rates(id) ON DELETE RESTRICT,
  base_unit_id        uuid NOT NULL REFERENCES tenant_template.units(id) ON DELETE RESTRICT,
  purchase_price      numeric(18,2) NOT NULL DEFAULT 0 CHECK (purchase_price >= 0),
  selling_price       numeric(18,2) NOT NULL DEFAULT 0 CHECK (selling_price >= 0),
  mrp                 numeric(18,2) CHECK (mrp >= 0),
  minimum_stock       numeric(18,3) NOT NULL DEFAULT 0 CHECK (minimum_stock >= 0),
  maximum_stock       numeric(18,3) CHECK (maximum_stock IS NULL OR maximum_stock >= minimum_stock),
  reorder_level       numeric(18,3) NOT NULL DEFAULT 0 CHECK (reorder_level >= 0),
  opening_stock       numeric(18,3) NOT NULL DEFAULT 0 CHECK (opening_stock >= 0),
  pieces_per_box      integer CHECK (pieces_per_box IS NULL OR pieces_per_box > 0),
  pieces_per_bag      integer CHECK (pieces_per_bag IS NULL OR pieces_per_bag > 0),
  weight              numeric(12,3),
  weight_unit         varchar(10),                 -- "kg", "g", "lb"
  dimension_length    numeric(12,3),
  dimension_width     numeric(12,3),
  dimension_height     numeric(12,3),
  dimension_unit      varchar(10),                 -- "cm", "in"
  has_batch_tracking  boolean NOT NULL DEFAULT false,
  has_expiry_tracking boolean NOT NULL DEFAULT false,
  remarks             text,
  is_active           boolean NOT NULL DEFAULT true,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_products_name_trgm ON tenant_template.products USING gin (name gin_trgm_ops);
CREATE INDEX idx_products_sku_trgm ON tenant_template.products USING gin (sku gin_trgm_ops);
CREATE INDEX idx_products_category ON tenant_template.products(category_id);
CREATE INDEX idx_products_brand ON tenant_template.products(brand_id);
CREATE INDEX idx_products_active ON tenant_template.products(is_active) WHERE is_active;
CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON tenant_template.products
  FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

-- Multiple images per product ("Image Gallery")
CREATE TABLE tenant_template.product_images (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  uuid NOT NULL REFERENCES tenant_template.products(id) ON DELETE CASCADE,
  image_url   text NOT NULL,
  is_primary  boolean NOT NULL DEFAULT false,
  sort_order  smallint NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_product_images_product ON tenant_template.product_images(product_id);
CREATE UNIQUE INDEX uq_product_images_primary ON tenant_template.product_images(product_id) WHERE is_primary;

-- Multiple selling/purchase units per product (e.g. Piece / Box / Bag), each with its own
-- conversion factor back to the product's base_unit_id, and optionally its own barcode/price.
CREATE TABLE tenant_template.product_units (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id         uuid NOT NULL REFERENCES tenant_template.products(id) ON DELETE CASCADE,
  unit_id            uuid NOT NULL REFERENCES tenant_template.units(id) ON DELETE RESTRICT,
  is_base_unit       boolean NOT NULL DEFAULT false,
  conversion_factor  numeric(18,6) NOT NULL CHECK (conversion_factor > 0),  -- 1 of this unit = factor * base_unit
  purchase_price     numeric(18,2) CHECK (purchase_price IS NULL OR purchase_price >= 0),
  selling_price      numeric(18,2) CHECK (selling_price IS NULL OR selling_price >= 0),
  barcode            varchar(50) UNIQUE,
  created_at         timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, unit_id)
);
CREATE INDEX idx_product_units_product ON tenant_template.product_units(product_id);
CREATE UNIQUE INDEX uq_product_units_base ON tenant_template.product_units(product_id) WHERE is_base_unit;

-- Batch / lot tracking (batch number, manufacturing + expiry date) per product.
CREATE TABLE tenant_template.product_batches (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id         uuid NOT NULL REFERENCES tenant_template.products(id) ON DELETE RESTRICT,
  batch_number       varchar(60) NOT NULL,
  lot_number         varchar(60),
  manufacturing_date date,
  expiry_date        date,
  created_at         timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, batch_number),
  CHECK (expiry_date IS NULL OR manufacturing_date IS NULL OR expiry_date > manufacturing_date)
);
CREATE INDEX idx_product_batches_product ON tenant_template.product_batches(product_id);
CREATE INDEX idx_product_batches_expiry ON tenant_template.product_batches(expiry_date);

-- Additional/alternate barcodes per product (supplier-specific barcodes, per-unit barcodes,
-- re-labelled stock) beyond the single barcode/qr_code columns on products itself.
CREATE TABLE tenant_template.product_barcodes (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id       uuid NOT NULL REFERENCES tenant_template.products(id) ON DELETE CASCADE,
  product_unit_id  uuid REFERENCES tenant_template.product_units(id) ON DELETE CASCADE,
  barcode          varchar(50) NOT NULL UNIQUE,
  barcode_type     varchar(20) NOT NULL DEFAULT 'ean13' CHECK (barcode_type IN ('ean13','code128','qr','upc','other')),
  is_primary       boolean NOT NULL DEFAULT false,
  created_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_product_barcodes_product ON tenant_template.product_barcodes(product_id);

-- "Price History" special feature: append-only log, populated by trigger below whenever
-- products.purchase_price / selling_price changes.
CREATE TABLE tenant_template.product_price_history (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id   uuid NOT NULL REFERENCES tenant_template.products(id) ON DELETE CASCADE,
  price_type   varchar(10) NOT NULL CHECK (price_type IN ('purchase','selling','mrp')),
  old_price    numeric(18,2),
  new_price    numeric(18,2) NOT NULL,
  changed_by   uuid REFERENCES tenant_template.users(id) ON DELETE SET NULL,
  changed_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_product_price_history_product ON tenant_template.product_price_history(product_id, changed_at DESC);

CREATE OR REPLACE FUNCTION tenant_template.trg_track_price_history()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF NEW.purchase_price IS DISTINCT FROM OLD.purchase_price THEN
      INSERT INTO tenant_template.product_price_history (product_id, price_type, old_price, new_price)
      VALUES (NEW.id, 'purchase', OLD.purchase_price, NEW.purchase_price);
    END IF;
    IF NEW.selling_price IS DISTINCT FROM OLD.selling_price THEN
      INSERT INTO tenant_template.product_price_history (product_id, price_type, old_price, new_price)
      VALUES (NEW.id, 'selling', OLD.selling_price, NEW.selling_price);
    END IF;
    IF NEW.mrp IS DISTINCT FROM OLD.mrp THEN
      INSERT INTO tenant_template.product_price_history (product_id, price_type, old_price, new_price)
      VALUES (NEW.id, 'mrp', OLD.mrp, NEW.mrp);
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_products_price_history AFTER UPDATE ON tenant_template.products
  FOR EACH ROW EXECUTE FUNCTION tenant_template.trg_track_price_history();
