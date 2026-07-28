-- Seed default units and GST rates for a newly provisioned tenant schema. Run via:
--   psql "$DATABASE_URL" -v schema=tenant_acme -f seed/002_units_tax.sql
\if :{?schema}
\else
  \set schema tenant_template
\endif
SET search_path TO :"schema";

INSERT INTO units (name, short_code) VALUES
  ('Piece',      'PCS'),
  ('Box',        'BOX'),
  ('Bag',        'BAG'),
  ('Carton',     'CTN'),
  ('Dozen',      'DZN'),
  ('Kilogram',   'KG'),
  ('Gram',       'GM'),
  ('Litre',      'LTR'),
  ('Millilitre', 'ML')
ON CONFLICT (short_code) DO NOTHING;

INSERT INTO unit_conversions (from_unit_id, to_unit_id, conversion_factor)
SELECT dz.id, pc.id, 12 FROM units dz, units pc WHERE dz.short_code = 'DZN' AND pc.short_code = 'PCS'
ON CONFLICT DO NOTHING;
INSERT INTO unit_conversions (from_unit_id, to_unit_id, conversion_factor)
SELECT kg.id, gm.id, 1000 FROM units kg, units gm WHERE kg.short_code = 'KG' AND gm.short_code = 'GM'
ON CONFLICT DO NOTHING;
INSERT INTO unit_conversions (from_unit_id, to_unit_id, conversion_factor)
SELECT lt.id, ml.id, 1000 FROM units lt, units ml WHERE lt.short_code = 'LTR' AND ml.short_code = 'ML'
ON CONFLICT DO NOTHING;

-- GST slabs (India). igst = cgst + sgst for intra-state vs inter-state invoicing.
INSERT INTO gst_rates (name, total_rate, cgst_rate, sgst_rate, igst_rate) VALUES
  ('GST 0%',  0,  0,   0,   0),
  ('GST 5%',  5,  2.5, 2.5, 5),
  ('GST 12%', 12, 6,   6,   12),
  ('GST 18%', 18, 9,   9,   18),
  ('GST 28%', 28, 14,  14,  28)
ON CONFLICT (name) DO NOTHING;
