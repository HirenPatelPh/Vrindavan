-- Demo master data + product catalog for a tiles / marble & granite / sanitaryware / tile
-- adhesive distribution business (India). NOT part of the automatic tenant-provisioning chain
-- (unlike 001_roles_permissions.sql/002_units_tax.sql/003_financial_year.sql) — this is opt-in
-- demo content for a specific tenant, run manually against an already-provisioned schema:
--
--   psql "$DATABASE_URL" -v schema=tenant_acme -f seed/demo_tiles_marble_data.sql
--
-- Idempotent: every INSERT uses ON CONFLICT DO NOTHING against each table's natural unique key
-- (code/sku/name), so re-running this script is safe and just no-ops on rows already present.
-- Brand/supplier names reference real, well-known Indian building-materials manufacturers for
-- realism (Kajaria, Somany, Pidilite, Hindware, etc.) — used only as reference labels, with no
-- fabricated identifiers (GSTIN/PAN left blank) attached to them. Customers/employees/
-- transporters are entirely fictional.
--
-- Assumes GST rates (GST 0/5/12/18/28%) and Units (Piece/Box/Bag/Carton/Dozen/Kilogram/Gram/
-- Litre/Millilitre) are already seeded — both ship with every tenant via 002_units_tax.sql.

\if :{?schema}
\else
  \set schema tenant_template
\endif
SET search_path TO :"schema";

BEGIN;

-- ============================================================================================
-- Categories (10)
-- ============================================================================================
INSERT INTO categories (name, code) VALUES
  ('Tiles',                             'TILES'),
  ('Marble & Granite',                  'MARBLE'),
  ('Sanitaryware',                      'SANITARY'),
  ('Adhesives & Grout',                 'ADHESIVE'),
  ('Bathroom Accessories',              'BATHACC'),
  ('Wall Panels & Cladding',            'WALLPANEL'),
  ('Waterproofing Chemicals',           'WATERPROOF'),
  ('Tile Trims & Profiles',             'TRIMS'),
  ('Natural Stone - Cobbles & Kerbs',   'NATSTONE'),
  ('Construction Chemicals',            'CONSTCHEM')
ON CONFLICT (code) DO NOTHING;

-- ============================================================================================
-- Sub-categories (11)
-- ============================================================================================
INSERT INTO sub_categories (category_id, name, code)
SELECT c.id, v.name, v.code
FROM (VALUES
  ('TILES',    'Vitrified Tiles',           'VIT'),
  ('TILES',    'Ceramic Wall Tiles',        'CWT'),
  ('TILES',    'Ceramic Floor Tiles',       'CFT'),
  ('TILES',    'Porcelain Tiles',           'PORC'),
  ('TILES',    'Outdoor & Parking Tiles',   'OUTDOOR'),
  ('MARBLE',   'Indian Marble',             'INDMARBLE'),
  ('MARBLE',   'Italian Marble',            'ITMARBLE'),
  ('MARBLE',   'Granite Slabs',             'GRANITE'),
  ('SANITARY', 'Water Closets',             'WC'),
  ('SANITARY', 'Wash Basins',               'BASIN'),
  ('SANITARY', 'Faucets & Fittings',        'FAUCET')
) AS v(cat_code, name, code)
JOIN categories c ON c.code = v.cat_code
ON CONFLICT (category_id, code) DO NOTHING;

-- ============================================================================================
-- Brands (18)
-- ============================================================================================
INSERT INTO brands (name, code) VALUES
  ('Kajaria',         'KAJ'),
  ('Somany',          'SOM'),
  ('Johnson',         'JHN'),
  ('Orientbell',      'ORB'),
  ('Nitco',           'NIT'),
  ('Asian Granito',   'AGL'),
  ('Simpolo',         'SIM'),
  ('RAK Ceramics',    'RAK'),
  ('Varmora',         'VAR'),
  ('Hindware',        'HIN'),
  ('Cera',            'CERA'),
  ('Parryware',       'PAR'),
  ('Jaquar',          'JAQ'),
  ('Roff',            'ROFF'),
  ('MYK Laticrete',   'MYK'),
  ('Fosroc',          'FOS'),
  ('Bhandari Marble', 'BHM'),
  ('RK Marbles',      'RKM')
ON CONFLICT (code) DO NOTHING;

-- ============================================================================================
-- HSN Codes (10) — real Indian GST HSN codes for this trade, linked to a default GST slab
-- ============================================================================================
INSERT INTO hsn_codes (code, description, default_gst_id)
SELECT v.code, v.description, g.id
FROM (VALUES
  ('6907', 'Ceramic flooring/wall tiles, unglazed',                          'GST 18%'),
  ('6908', 'Ceramic flooring/wall tiles, glazed (vitrified)',                'GST 18%'),
  ('6910', 'Ceramic sinks, wash basins, water closets, cisterns',            'GST 18%'),
  ('2515', 'Marble, travertine, ecaussine - blocks/slabs, crude/trimmed',    'GST 12%'),
  ('2516', 'Granite, porphyry, basalt - blocks/slabs, crude/trimmed',        'GST 12%'),
  ('6802', 'Worked monumental or building stone (polished marble/granite)', 'GST 18%'),
  ('3214', 'Glaziers putty, grafting putty, mastics, tile adhesive/grout',   'GST 18%'),
  ('3824', 'Prepared waterproofing and binding compounds for cement',        'GST 18%'),
  ('8481', 'Taps, cocks, valves and similar appliances for pipes (faucets)', 'GST 18%'),
  ('6905', 'Ceramic pipes, conduits, roofing and trim components',           'GST 18%')
) AS v(code, description, gst_name)
JOIN gst_rates g ON g.name = v.gst_name
ON CONFLICT (code) DO NOTHING;

-- ============================================================================================
-- Taxes (10) — standalone reference table, not currently wired into any transactional flow
-- ============================================================================================
INSERT INTO taxes (name, tax_type, rate, is_active) VALUES
  ('Basic Customs Duty - Imported Marble',              'custom_duty', 20.00, true),
  ('Basic Customs Duty - Imported Sanitaryware',        'custom_duty', 10.00, true),
  ('Anti-Dumping Duty - Chinese Vitrified Tiles',       'custom_duty', 15.00, true),
  ('Green Cess - Rajasthan Mining',                     'cess',         2.00, true),
  ('Compensation Cess - Luxury Fittings',                'cess',         1.00, true),
  ('Swachh Bharat Cess (Legacy)',                        'cess',         0.00, false),
  ('Krishi Kalyan Cess (Legacy)',                        'cess',         0.00, false),
  ('TCS on Sale of Goods',                               'other',        0.10, true),
  ('VAT - Pre-GST (Legacy)',                             'vat',          0.00, false),
  ('Entry Tax - Rajasthan (Legacy)',                     'vat',          0.00, false)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================================
-- Employees (10)
-- ============================================================================================
INSERT INTO employees (name, code, designation, department, phone, email, joining_date) VALUES
  ('Ramesh Patel',   'EMP-001', 'Warehouse Manager',            'Operations',      '9825012345', 'ramesh.patel@acme.example',   '2021-04-01'),
  ('Suresh Kumar',   'EMP-002', 'Purchase Manager',             'Procurement',     '9825012346', 'suresh.kumar@acme.example',   '2020-06-15'),
  ('Priya Sharma',   'EMP-003', 'Sales Executive',              'Sales',           '9825012347', 'priya.sharma@acme.example',   '2022-01-10'),
  ('Amit Shah',      'EMP-004', 'Accountant',                   'Finance',         '9825012348', 'amit.shah@acme.example',      '2019-09-01'),
  ('Neha Verma',     'EMP-005', 'Showroom Manager',             'Sales',           '9825012349', 'neha.verma@acme.example',     '2021-11-20'),
  ('Vikram Singh',   'EMP-006', 'Store Supervisor',             'Operations',      '9825012350', 'vikram.singh@acme.example',   '2022-03-05'),
  ('Anita Desai',    'EMP-007', 'Business Development Manager', 'Sales',           '9825012351', 'anita.desai@acme.example',    '2020-02-14'),
  ('Rahul Joshi',    'EMP-008', 'Logistics Coordinator',        'Operations',      '9825012352', 'rahul.joshi@acme.example',    '2023-01-02'),
  ('Kavita Mehta',   'EMP-009', 'Inventory Analyst',            'Operations',      '9825012353', 'kavita.mehta@acme.example',   '2022-07-18'),
  ('Deepak Nair',    'EMP-010', 'HR Executive',                 'Human Resources', '9825012354', 'deepak.nair@acme.example',    '2021-08-30')
ON CONFLICT (code) DO NOTHING;

-- ============================================================================================
-- Branches (10) — anchored in real Indian building-materials trade hubs
-- ============================================================================================
INSERT INTO branches (name, code, is_head_office, city, state, country, pincode, phone, email) VALUES
  ('Ahmedabad Head Office',          'AMD-HQ', true,  'Ahmedabad',  'Gujarat',        'India', '380001', '07926400001', 'ahmedabad@acme.example'),
  ('Morbi Ceramic Sourcing Branch',  'MRB',    false, 'Morbi',      'Gujarat',        'India', '363641', '02822240001', 'morbi@acme.example'),
  ('Kishangarh Marble Hub',          'KGH',    false, 'Kishangarh', 'Rajasthan',      'India', '305801', '01463240001', 'kishangarh@acme.example'),
  ('Mumbai Branch',                  'MUM',    false, 'Mumbai',     'Maharashtra',    'India', '400001', '02222400001', 'mumbai@acme.example'),
  ('Delhi NCR Branch',               'DEL',    false, 'New Delhi',  'Delhi',          'India', '110001', '01142400001', 'delhi@acme.example'),
  ('Bengaluru Branch',               'BLR',    false, 'Bengaluru',  'Karnataka',      'India', '560001', '08042400001', 'bengaluru@acme.example'),
  ('Hyderabad Branch',               'HYD',    false, 'Hyderabad',  'Telangana',      'India', '500001', '04042400001', 'hyderabad@acme.example'),
  ('Chennai Branch',                 'MAA',    false, 'Chennai',    'Tamil Nadu',     'India', '600001', '04442400001', 'chennai@acme.example'),
  ('Pune Branch',                    'PNQ',    false, 'Pune',       'Maharashtra',    'India', '411001', '02042400001', 'pune@acme.example'),
  ('Jaipur Branch',                  'JAI',    false, 'Jaipur',     'Rajasthan',      'India', '302001', '01414240001', 'jaipur@acme.example')
ON CONFLICT (code) DO NOTHING;

-- ============================================================================================
-- Warehouses (10) — one per branch; Morbi/Ahmedabad get a named manager
-- ============================================================================================
INSERT INTO warehouses (branch_id, manager_id, name, code, city, state, pincode)
SELECT b.id, e.id, v.name, v.code, v.city, v.state, v.pincode
FROM (VALUES
  ('AMD-HQ', 'Ahmedabad Central Warehouse', 'AMD-WH', 'Ahmedabad',  'Gujarat',     '380001', 'EMP-001'),
  ('MRB',    'Morbi Ceramic Warehouse',     'MRB-WH', 'Morbi',      'Gujarat',     '363641', 'EMP-006'),
  ('KGH',    'Kishangarh Marble Yard',      'KGH-WH', 'Kishangarh', 'Rajasthan',   '305801', NULL),
  ('MUM',    'Mumbai Warehouse',            'MUM-WH', 'Mumbai',     'Maharashtra', '400001', NULL),
  ('DEL',    'Delhi NCR Warehouse',         'DEL-WH', 'New Delhi',  'Delhi',       '110001', NULL),
  ('BLR',    'Bengaluru Warehouse',         'BLR-WH', 'Bengaluru',  'Karnataka',   '560001', NULL),
  ('HYD',    'Hyderabad Warehouse',         'HYD-WH', 'Hyderabad',  'Telangana',   '500001', NULL),
  ('MAA',    'Chennai Warehouse',           'MAA-WH', 'Chennai',    'Tamil Nadu',  '600001', NULL),
  ('PNQ',    'Pune Warehouse',              'PNQ-WH', 'Pune',       'Maharashtra', '411001', NULL),
  ('JAI',    'Jaipur Warehouse',            'JAI-WH', 'Jaipur',     'Rajasthan',   '302001', NULL)
) AS v(branch_code, name, code, city, state, pincode, mgr_code)
JOIN branches b ON b.code = v.branch_code
LEFT JOIN employees e ON e.code = v.mgr_code
ON CONFLICT (code) DO NOTHING;

-- ============================================================================================
-- Racks (12) — Morbi (tiles) and Kishangarh (marble) get 2 racks each, others get 1
-- ============================================================================================
INSERT INTO racks (warehouse_id, name, code)
SELECT w.id, v.name, v.code
FROM (VALUES
  ('MRB-WH', 'Rack A - Vitrified Tiles', 'A'),
  ('MRB-WH', 'Rack B - Ceramic Tiles',   'B'),
  ('KGH-WH', 'Rack A - Marble Slabs',    'A'),
  ('KGH-WH', 'Rack B - Granite Slabs',   'B'),
  ('AMD-WH', 'Rack A',                   'A'),
  ('MUM-WH', 'Rack A',                   'A'),
  ('DEL-WH', 'Rack A',                   'A'),
  ('BLR-WH', 'Rack A',                   'A'),
  ('HYD-WH', 'Rack A',                   'A'),
  ('MAA-WH', 'Rack A',                   'A'),
  ('PNQ-WH', 'Rack A',                   'A'),
  ('JAI-WH', 'Rack A',                   'A')
) AS v(wh_code, name, code)
JOIN warehouses w ON w.code = v.wh_code
ON CONFLICT (warehouse_id, code) DO NOTHING;

-- ============================================================================================
-- Locations (12) — 3 shelves under each of the 4 Morbi/Kishangarh racks
-- ============================================================================================
INSERT INTO locations (rack_id, name, code)
SELECT r.id, v.loc_name, v.loc_code
FROM (VALUES
  ('MRB-WH', 'A', 'Shelf 1', 'L1'),
  ('MRB-WH', 'A', 'Shelf 2', 'L2'),
  ('MRB-WH', 'A', 'Shelf 3', 'L3'),
  ('MRB-WH', 'B', 'Shelf 1', 'L1'),
  ('MRB-WH', 'B', 'Shelf 2', 'L2'),
  ('MRB-WH', 'B', 'Shelf 3', 'L3'),
  ('KGH-WH', 'A', 'Shelf 1', 'L1'),
  ('KGH-WH', 'A', 'Shelf 2', 'L2'),
  ('KGH-WH', 'A', 'Shelf 3', 'L3'),
  ('KGH-WH', 'B', 'Shelf 1', 'L1'),
  ('KGH-WH', 'B', 'Shelf 2', 'L2'),
  ('KGH-WH', 'B', 'Shelf 3', 'L3')
) AS v(wh_code, rack_code, loc_name, loc_code)
JOIN warehouses w ON w.code = v.wh_code
JOIN racks r ON r.warehouse_id = w.id AND r.code = v.rack_code
ON CONFLICT (rack_id, code) DO NOTHING;

-- ============================================================================================
-- Suppliers (10) — the manufacturers themselves. GSTIN/PAN deliberately left blank (no
-- fabricated official identifiers attached to real company names).
-- ============================================================================================
INSERT INTO suppliers (name, code, contact_person, email, phone, city, state, country, pincode, credit_period_days) VALUES
  ('Kajaria Ceramics Ltd',        'SUP-KAJ',  'Rajeev Malhotra',       'sales@kajariaceramics.example', '01141234501', 'New Delhi',   'Delhi',          'India', '110020', 45),
  ('Somany Ceramics Ltd',         'SUP-SOM',  'Ashok Gupta',           'sales@somanyceramics.example',  '01141234502', 'Gurugram',    'Haryana',        'India', '122001', 45),
  ('H&R Johnson India Ltd',       'SUP-JHN',  'Manoj Rao',             'sales@hrjohnson.example',       '02241234503', 'Mumbai',      'Maharashtra',    'India', '400059', 30),
  ('Orientbell Ltd',              'SUP-ORB',  'Sanjay Bansal',         'sales@orientbell.example',      '01204234504', 'Noida',       'Uttar Pradesh',  'India', '201301', 30),
  ('Asian Granito India Ltd',     'SUP-AGL',  'Kiran Patel',           'sales@asiangranito.example',    '02764234505', 'Himatnagar',  'Gujarat',        'India', '383001', 45),
  ('Pidilite Industries Ltd',     'SUP-PID',  'Naresh Iyer',           'sales@pidilite.example',        '02224234506', 'Mumbai',      'Maharashtra',    'India', '400020', 30),
  ('MYK Laticrete India Pvt Ltd', 'SUP-MYK',  'Ravi Kumar',            'sales@myklaticrete.example',    '04024234507', 'Hyderabad',   'Telangana',      'India', '500032', 30),
  ('HSIL Ltd (Hindware)',         'SUP-HIN',  'Deepa Menon',           'sales@hindware.example',        '01274234508', 'Bahadurgarh', 'Haryana',        'India', '124507', 45),
  ('Cera Sanitaryware Ltd',       'SUP-CERA', 'Tapan Ghosh',           'sales@cera.example',             '03334234509', 'Kolkata',     'West Bengal',    'India', '700001', 45),
  ('Bhandari Marble Group',       'SUP-BHM',  'Om Prakash Bhandari',   'sales@bhandarimarble.example',  '01463234510', 'Kishangarh',  'Rajasthan',      'India', '305801', 60)
ON CONFLICT (code) DO NOTHING;

-- ============================================================================================
-- Customers (10) — fictional trade/retail/contractor customers
-- ============================================================================================
INSERT INTO customers (name, code, contact_person, email, phone, city, state, country, pincode, credit_limit, credit_period_days) VALUES
  ('Shree Balaji Builders & Developers', 'CUS-001', 'Mahesh Agarwal',  'info@balajibuilders.example',       '9998800001', 'Ahmedabad', 'Gujarat',     'India', '380015', 500000,  30),
  ('Modern Home Interiors',              'CUS-002', 'Ritu Kapoor',     'contact@modernhomeinteriors.example','9998800002', 'Mumbai',    'Maharashtra', 'India', '400050', 300000,  15),
  ('Sunrise Constructions Pvt Ltd',      'CUS-003', 'Vinod Chawla',    'sales@sunriseconstructions.example',  '9998800003', 'Pune',      'Maharashtra', 'India', '411045', 750000,  45),
  ('Elegant Spaces Interior Designers',  'CUS-004', 'Pooja Reddy',     'hello@elegantspaces.example',        '9998800004', 'Hyderabad', 'Telangana',   'India', '500034', 200000,  15),
  ('Metro Infra Developers',             'CUS-005', 'Ajay Bhatia',     'projects@metroinfra.example',        '9998800005', 'New Delhi', 'Delhi',       'India', '110016', 1000000, 60),
  ('Royal Tile Gallery',                 'CUS-006', 'Harish Vora',     'orders@royaltilegallery.example',    '9998800006', 'Surat',     'Gujarat',     'India', '395007', 250000,  30),
  ('Dream Home Decor Studio',            'CUS-007', 'Sneha Pillai',    'studio@dreamhomedecor.example',      '9998800007', 'Bengaluru', 'Karnataka',   'India', '560068', 180000,  15),
  ('Skyline Builders & Developers',      'CUS-008', 'Rakesh Malhotra', 'info@skylinebuilders.example',       '9998800008', 'Chennai',   'Tamil Nadu',  'India', '600028', 600000,  45),
  ('Comfort Living Interiors',           'CUS-009', 'Divya Nambiar',   'sales@comfortliving.example',        '9998800009', 'Kochi',     'Kerala',      'India', '682016', 150000,  15),
  ('Prestige Realty Ventures',           'CUS-010', 'Arvind Saxena',   'ventures@prestigerealty.example',    '9998800010', 'Jaipur',    'Rajasthan',   'India', '302015', 400000,  30)
ON CONFLICT (code) DO NOTHING;

-- ============================================================================================
-- Transporters (10) — fictional, flavored toward heavy/fragile-goods logistics
-- ============================================================================================
INSERT INTO transporters (name, code, contact_person, phone, vehicle_number) VALUES
  ('Balaji Tile Carriers',        'TRN-001', 'Jitendra Rathi',   '9825500001', 'GJ-07-AB-1234'),
  ('Safe Marble Logistics',       'TRN-002', 'Mukesh Sharma',    '9825500002', 'RJ-14-CD-5678'),
  ('Gujarat Ceramic Transport Co','TRN-003', 'Bhavesh Patel',    '9825500003', 'GJ-05-EF-9012'),
  ('Rajasthan Stone Movers',      'TRN-004', 'Om Singh Rathore', '9825500004', 'RJ-27-GH-3456'),
  ('Speedway Goods Carriers',     'TRN-005', 'Anil Yadav',       '9825500005', 'MH-04-IJ-7890'),
  ('National Heavy Freight Ltd',  'TRN-006', 'Karan Malhotra',   '9825500006', 'DL-01-KL-2345'),
  ('Metro City Logistics',        'TRN-007', 'Faisal Khan',      '9825500007', 'KA-05-MN-6789'),
  ('Swift Cargo Movers',          'TRN-008', 'Ganesh Iyer',      '9825500008', 'TN-09-OP-0123'),
  ('Sunrise Roadways',            'TRN-009', 'Praveen Reddy',    '9825500009', 'TS-08-QR-4567'),
  ('Reliable Transport Co',       'TRN-010', 'Sameer Joshi',     '9825500010', 'MH-12-ST-8901')
ON CONFLICT (code) DO NOTHING;

-- ============================================================================================
-- Products (19) — spread across all 4 core categories, real brand/HSN/GST associations.
-- opening_stock deliberately left at 0 (default): posting real opening stock is a stateful
-- action (POST /inventory/products/:id/post-opening-stock) with a one-time-only guarantee,
-- better done through the app/API than implied here by a raw column value.
-- ============================================================================================
INSERT INTO products (
  name, sku, category_id, sub_category_id, brand_id, hsn_id, gst_id, base_unit_id,
  purchase_price, selling_price, mrp, minimum_stock, reorder_level, pieces_per_box, has_expiry_tracking, remarks
)
SELECT
  v.name, v.sku, cat.id, subcat.id, br.id, hsn.id, gst.id, u.id,
  v.purchase_price, v.selling_price, v.mrp, v.min_stock, v.reorder, v.ppb, v.expiry, v.remarks
FROM (VALUES
  ('Kajaria Vitrified Tile 600x600 Glossy White',       'KAJ-VIT-600-WHT',    'TILES',    'VIT',       'KAJ',  '6908', 'GST 18%', 'BOX', 450.00,  650.00,  750.00,  20, 40, 4,    false, 'Glossy finish, 600x600mm, premium vitrified tile'),
  ('Somany Vitrified Tile 800x800 Matt Grey',           'SOM-VIT-800-GRY',    'TILES',    'VIT',       'SOM',  '6908', 'GST 18%', 'BOX', 620.00,  890.00,  999.00,  15, 30, 2,    false, 'Matt finish, 800x800mm'),
  ('Johnson Ceramic Wall Tile 300x450 Floral',          'JHN-CWT-300-FLR',    'TILES',    'CWT',       'JHN',  '6907', 'GST 18%', 'BOX', 280.00,  399.00,  450.00,  25, 50, 8,    false, 'Floral design wall tile, 300x450mm'),
  ('Orientbell Ceramic Floor Tile 600x600 Wood Finish', 'ORB-CFT-600-WOOD',   'TILES',    'CFT',       'ORB',  '6907', 'GST 18%', 'BOX', 350.00,  499.00,  560.00,  20, 40, 4,    false, 'Wood-look finish floor tile'),
  ('Asian Granito Porcelain Tile 800x1600 Marble Look', 'AGL-POR-800-MRB',    'TILES',    'PORC',      'AGL',  '6908', 'GST 18%', 'BOX', 1200.00, 1699.00, 1899.00, 10, 20, 1,    false, 'Large format porcelain, marble-look'),
  ('Nitco Outdoor Parking Tile 300x300 Anti-Skid',      'NIT-OUT-300-SKD',    'TILES',    'OUTDOOR',   'NIT',  '6907', 'GST 18%', 'BOX', 220.00,  320.00,  360.00,  25, 50, 10,   false, 'Anti-skid, heavy-duty outdoor/parking tile'),
  ('Simpolo Vitrified Tile 1200x1200 Polished',         'SIM-VIT-1200-POL',   'TILES',    'VIT',       'SIM',  '6908', 'GST 18%', 'BOX', 1800.00, 2499.00, 2799.00, 8,  15, 1,    false, 'Large format polished vitrified tile'),
  ('RAK Ceramic Wall Tile 250x375 Glossy',              'RAK-CWT-250-GLS',    'TILES',    'CWT',       'RAK',  '6907', 'GST 18%', 'BOX', 195.00,  280.00,  320.00,  25, 50, 10,   false, 'Glossy wall tile, 250x375mm'),
  ('Varmora Vitrified Tile 600x1200 Rustic',            'VAR-VIT-600-RUS',    'TILES',    'VIT',       'VAR',  '6908', 'GST 18%', 'BOX', 550.00,  780.00,  880.00,  15, 30, 2,    false, 'Rustic finish, 600x1200mm'),
  ('Bhandari White Makrana Marble Slab',                'BHM-MRB-MAKRANA-WHT','MARBLE',   'INDMARBLE', 'BHM',  '2515', 'GST 12%', 'BOX', 8000.00, 11500.00,12999.00,5,  10, NULL, false, 'Premium white Makrana marble slab lot'),
  ('RK Marbles Italian Statuario Marble Slab',          'RKM-MRB-ITL-STATU',  'MARBLE',   'ITMARBLE',  'RKM',  '2515', 'GST 12%', 'BOX', 25000.00,34999.00,38999.00,2,  5,  NULL, false, 'Imported Italian Statuario marble slab lot'),
  ('Bhandari Black Granite Slab',                       'BHM-GRN-BLK',        'MARBLE',   'GRANITE',   'BHM',  '2516', 'GST 12%', 'BOX', 6000.00, 8999.00, 9999.00, 5,  10, NULL, false, 'Polished black granite slab lot'),
  ('Hindware One-Piece Water Closet',                   'HIN-WC-OP-WHT',      'SANITARY', 'WC',        'HIN',  '6910', 'GST 18%', 'PCS', 3800.00, 5499.00, 5999.00, 10, 20, NULL, false, 'One-piece floor-mounted water closet, white'),
  ('Cera Wash Basin Compact White',                     'CERA-BASIN-CMP-WHT', 'SANITARY', 'BASIN',     'CERA', '6910', 'GST 18%', 'PCS', 950.00,  1399.00, 1599.00, 15, 30, NULL, false, 'Compact wall-mounted wash basin, white'),
  ('Parryware Wall Hung Water Closet',                  'PAR-WC-WH-WHT',      'SANITARY', 'WC',        'PAR',  '6910', 'GST 18%', 'PCS', 4200.00, 5999.00, 6499.00, 8,  15, NULL, false, 'Wall-hung water closet, white'),
  ('Jaquar Single Lever Basin Mixer Faucet',             'JAQ-FAU-MIXER-CHR',  'SANITARY', 'FAUCET',    'JAQ',  '8481', 'GST 18%', 'PCS', 1800.00, 2599.00, 2899.00, 15, 30, NULL, false, 'Chrome-finish single lever basin mixer'),
  ('Roff Tile Adhesive 20kg',                           'ROFF-ADH-20KG',      'ADHESIVE', NULL,        'ROFF', '3214', 'GST 18%', 'BAG', 320.00,  450.00,  499.00,  30, 60, NULL, true,  'High-strength tile adhesive, 20kg bag'),
  ('MYK Laticrete Tile Adhesive 20kg',                  'MYK-ADH-20KG',       'ADHESIVE', NULL,        'MYK',  '3214', 'GST 18%', 'BAG', 380.00,  520.00,  575.00,  30, 60, NULL, true,  'Premium polymer-modified tile adhesive, 20kg bag'),
  ('Fosroc Waterproofing Compound 20kg',                'FOS-WP-20KG',        'WATERPROOF', NULL,      'FOS',  '3824', 'GST 18%', 'BAG', 650.00,  899.00,  999.00,  20, 40, NULL, true,  'Cementitious waterproofing compound, 20kg bag')
) AS v(name, sku, cat_code, subcat_code, brand_code, hsn_code, gst_name, unit_code, purchase_price, selling_price, mrp, min_stock, reorder, ppb, expiry, remarks)
JOIN categories cat ON cat.code = v.cat_code
LEFT JOIN sub_categories subcat ON subcat.code = v.subcat_code AND subcat.category_id = cat.id
JOIN brands br ON br.code = v.brand_code
JOIN hsn_codes hsn ON hsn.code = v.hsn_code
JOIN gst_rates gst ON gst.name = v.gst_name
JOIN units u ON u.short_code = v.unit_code
ON CONFLICT (sku) DO NOTHING;

COMMIT;
