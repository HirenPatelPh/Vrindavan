#!/usr/bin/env python3
"""Populates realistic Purchase/Sales/Inventory transactional demo data for the tiles/marble/
sanitaryware/adhesive demo tenant seeded by demo_tiles_marble_data.sql.

Unlike that SQL file, this data is created through the real REST API (not raw INSERTs) so that
document numbering, tax computation, and stock-ledger postings are all guaranteed correct —
exactly what the app itself would produce.

Prerequisite: demo_tiles_marble_data.sql must already be applied to the target tenant schema.

Usage:
    python3 demo_transactional_data.py [--base-url http://localhost:3000/api]
                                        [--company-code acme]
                                        [--email admin@acme.example]
                                        [--password Password123!]
"""

import argparse
import json
import sys
import urllib.error
import urllib.request

parser = argparse.ArgumentParser()
parser.add_argument("--base-url", default="http://localhost:3000/api")
parser.add_argument("--company-code", default="acme")
parser.add_argument("--email", default="admin@acme.example")
parser.add_argument("--password", default="Password123!")
args = parser.parse_args()

BASE_URL = args.base_url
COMPANY_CODE = args.company_code


def call(method, path, token=None, body=None, ok_statuses=(200, 201, 204)):
    url = BASE_URL + path
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header("x-company-code", COMPANY_CODE)
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    if body is not None:
        req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req) as resp:
            raw = resp.read()
            if resp.status not in ok_statuses:
                print(f"  UNEXPECTED STATUS {resp.status} for {method} {path}")
            if not raw:
                return None
            return json.loads(raw).get("data")
    except urllib.error.HTTPError as e:
        err_body = e.read().decode()
        print(f"  ERROR {method} {path}: HTTP {e.code} {err_body}")
        return None


def login():
    data = call("POST", "/auth/login", body={"email": args.email, "password": args.password})
    if not data:
        print("Login failed, aborting.")
        sys.exit(1)
    return data["accessToken"]


TOKEN = login()
print("Logged in.")


def get_list(resource):
    return call("GET", f"/{resource}", TOKEN) or []


def by_code(items, code_key="code"):
    return {item[code_key]: item for item in items}


def by_key(items, key):
    return {item[key]: item for item in items}


print("Fetching reference data...")
warehouses = by_code(get_list("warehouses"))
suppliers = by_code(get_list("suppliers"))
customers = by_code(get_list("customers"))
products = by_key(get_list("products"), "sku")
gst_rates = by_key(get_list("gst-rates"), "name")

AMD = warehouses["AMD-WH"]["id"]
MRB = warehouses["MRB-WH"]["id"]
KGH = warehouses["KGH-WH"]["id"]
GST18 = gst_rates["GST 18%"]["id"]
GST12 = gst_rates["GST 12%"]["id"]

# --- Step 0: give every product a 1:1 product-unit variant (conversionFactor=1 against its own
# base unit) so Purchase/Sales lines have a productUnitId to reference. ---
print("Creating product-unit variants...")
product_unit_id = {}
for sku, p in products.items():
    existing = get_list(f"products/{p['id']}/units")
    if existing:
        product_unit_id[sku] = existing[0]["id"]
        continue
    pu = call(
        "POST",
        f"/products/{p['id']}/units",
        TOKEN,
        {
            "unitId": p["baseUnitId"],
            "conversionFactor": 1,
            "isBaseUnit": True,
            "purchasePrice": p["purchasePrice"],
            "sellingPrice": p["sellingPrice"],
        },
    )
    if pu:
        product_unit_id[sku] = pu["id"]
print(f"  {len(product_unit_id)} product-unit variants ready.")


def pu(sku):
    return product_unit_id[sku]


def pid(sku):
    return products[sku]["id"]


# ============================================================================================
# PURCHASE CYCLE — 10 Purchase Orders across all 10 suppliers, each -> GRN -> Invoice -> mostly
# paid (7 fully paid, 1 partial, 2 unpaid to populate Outstanding Payables), + 2 Purchase Returns
# ============================================================================================
print("\n=== Purchase cycle ===")
purchase_plan = [
    ("SUP-KAJ", AMD, [("KAJ-VIT-600-WHT", 100, 450.00, GST18)]),
    ("SUP-SOM", AMD, [("SOM-VIT-800-GRY", 60, 620.00, GST18)]),
    ("SUP-JHN", MRB, [("JHN-CWT-300-FLR", 150, 280.00, GST18)]),
    ("SUP-ORB", MRB, [("ORB-CFT-600-WOOD", 100, 350.00, GST18)]),
    ("SUP-AGL", AMD, [("AGL-POR-800-MRB", 30, 1200.00, GST18)]),
    ("SUP-PID", AMD, [("ROFF-ADH-20KG", 200, 320.00, GST18)]),
    ("SUP-MYK", AMD, [("MYK-ADH-20KG", 150, 380.00, GST18)]),
    ("SUP-HIN", AMD, [("HIN-WC-OP-WHT", 40, 3800.00, GST18)]),
    ("SUP-CERA", AMD, [("CERA-BASIN-CMP-WHT", 50, 950.00, GST18)]),
    ("SUP-BHM", AMD, [("BHM-MRB-MAKRANA-WHT", 15, 8000.00, GST12)]),
]

purchase_invoices = []  # (invoice_id, total_amount)
for i, (sup_code, wh, lines) in enumerate(purchase_plan, start=1):
    po_lines = [
        {"productId": pid(sku), "productUnitId": pu(sku), "quantity": qty, "rate": rate, "gstId": gst}
        for sku, qty, rate, gst in lines
    ]
    po = call("POST", "/purchase/purchase-orders", TOKEN, {"supplierId": suppliers[sup_code]["id"], "warehouseId": wh, "lines": po_lines})
    if not po:
        continue
    call("POST", f"/purchase/purchase-orders/{po['id']}/approve", TOKEN)

    grn_lines = [{"productId": pid(sku), "productUnitId": pu(sku), "quantity": qty, "rate": rate} for sku, qty, rate, _ in lines]
    grn = call("POST", "/purchase/goods-received-notes", TOKEN, {"poId": po["id"], "supplierId": suppliers[sup_code]["id"], "warehouseId": wh, "lines": grn_lines})
    if not grn:
        continue
    call("POST", f"/purchase/goods-received-notes/{grn['id']}/complete", TOKEN)

    inv_lines = [
        {"productId": pid(sku), "productUnitId": pu(sku), "quantity": qty, "rate": rate, "gstId": gst}
        for sku, qty, rate, gst in lines
    ]
    inv = call("POST", "/purchase/purchase-invoices", TOKEN, {"supplierId": suppliers[sup_code]["id"], "grnId": grn["id"], "lines": inv_lines})
    if not inv:
        continue
    inv = call("POST", f"/purchase/purchase-invoices/{inv['id']}/approve", TOKEN)
    purchase_invoices.append((inv["id"], suppliers[sup_code]["id"], inv["totalAmount"]))
    print(f"  PO {i}/10 ({sup_code}) -> GRN -> Invoice {inv['invoiceNumber']} (₹{inv['totalAmount']})")

# Payments: fully pay invoices 0-6 (7), partially pay invoice 7 (index 7), leave 8 & 9 unpaid.
for idx, (inv_id, sup_id, total) in enumerate(purchase_invoices):
    if idx < 7:
        amount = total
    elif idx == 7:
        amount = round(total * 0.4, 2)
    else:
        continue
    call(
        "POST",
        "/purchase/supplier-payments",
        TOKEN,
        {"supplierId": sup_id, "amount": amount, "paymentMode": "bank_transfer", "allocations": [{"purchaseInvoiceId": inv_id, "allocatedAmount": amount}]},
    )
print("  Supplier payments posted (7 full, 1 partial, 2 left outstanding).")

# 2 Purchase Returns
for sup_code, sku, qty, rate, reason in [
    ("SUP-KAJ", "KAJ-VIT-600-WHT", 5, 450.00, "Damaged in transit"),
    ("SUP-PID", "ROFF-ADH-20KG", 10, 320.00, "Excess stock"),
]:
    ret = call(
        "POST",
        "/purchase/purchase-returns",
        TOKEN,
        {"supplierId": suppliers[sup_code]["id"], "warehouseId": AMD, "reason": reason, "lines": [{"productId": pid(sku), "quantity": qty, "rate": rate}]},
    )
    if ret:
        call("POST", f"/purchase/purchase-returns/{ret['id']}/approve", TOKEN)
print("  2 Purchase Returns posted.")

# ============================================================================================
# INVENTORY — Stock Transfer (bring Morbi-sourced tiles into the central AMD warehouse) must
# run before the Sales cycle so those products are sellable from AMD-WH.
# ============================================================================================
print("\n=== Inventory: stock transfer (prerequisite for sales) ===")
t1 = call(
    "POST",
    "/inventory/stock-transfers",
    TOKEN,
    {
        "fromWarehouseId": MRB,
        "toWarehouseId": AMD,
        "lines": [
            {"productId": pid("JHN-CWT-300-FLR"), "quantity": 50},
            {"productId": pid("ORB-CFT-600-WOOD"), "quantity": 40},
        ],
    },
)
if t1:
    call("POST", f"/inventory/stock-transfers/{t1['id']}/approve", TOKEN)
    print("  Morbi -> Ahmedabad transfer completed.")

# ============================================================================================
# SALES CYCLE — 4 Quotations (2 converted to SO), 10 Sales Orders total, 8 Delivery Challans
# (7 delivered), 7 Sales Invoices approved, payments (5 full/1 partial/1 unpaid), 2 Sales Returns
# ============================================================================================
print("\n=== Sales cycle ===")

quotation_plan = [
    ("CUS-001", [("KAJ-VIT-600-WHT", 10, 650.00, GST18), ("SOM-VIT-800-GRY", 5, 890.00, GST18)], "convert"),
    ("CUS-002", [("HIN-WC-OP-WHT", 3, 5499.00, GST18), ("CERA-BASIN-CMP-WHT", 3, 1399.00, GST18)], "convert"),
    ("CUS-003", [("BHM-MRB-MAKRANA-WHT", 2, 11500.00, GST12)], "accept_only"),
    ("CUS-004", [("ROFF-ADH-20KG", 20, 450.00, GST18)], "send_only"),
]

converted_so_ids = []
for cust_code, lines, action in quotation_plan:
    q_lines = [{"productId": pid(sku), "productUnitId": pu(sku), "quantity": qty, "rate": rate, "gstId": gst} for sku, qty, rate, gst in lines]
    q = call("POST", "/sales/quotations", TOKEN, {"customerId": customers[cust_code]["id"], "lines": q_lines})
    if not q:
        continue
    call("POST", f"/sales/quotations/{q['id']}/send", TOKEN)
    if action == "send_only":
        continue
    call("POST", f"/sales/quotations/{q['id']}/accept", TOKEN)
    if action == "accept_only":
        continue
    so = call("POST", f"/sales/quotations/{q['id']}/convert-to-sales-order", TOKEN, {"warehouseId": AMD})
    if so:
        converted_so_ids.append(so["id"])
print(f"  4 Quotations created (2 converted to Sales Orders, 1 accepted, 1 sent).")

direct_so_plan = [
    ("CUS-005", [("AGL-POR-800-MRB", 5, 1699.00, GST18)]),
    ("CUS-006", [("MYK-ADH-20KG", 15, 520.00, GST18)]),
    ("CUS-007", [("JHN-CWT-300-FLR", 20, 399.00, GST18)]),
    ("CUS-008", [("ORB-CFT-600-WOOD", 15, 499.00, GST18)]),
    ("CUS-009", [("KAJ-VIT-600-WHT", 8, 650.00, GST18)]),
    ("CUS-010", [("CERA-BASIN-CMP-WHT", 4, 1399.00, GST18)]),
]
approved_so_ids = list(converted_so_ids)  # the 2 converted SOs still need their own approval
for cust_code, lines in direct_so_plan:
    so_lines = [{"productId": pid(sku), "productUnitId": pu(sku), "quantity": qty, "rate": rate, "gstId": gst} for sku, qty, rate, gst in lines]
    so = call("POST", "/sales/sales-orders", TOKEN, {"customerId": customers[cust_code]["id"], "warehouseId": AMD, "lines": so_lines})
    if so:
        approved_so_ids.append(so["id"])

# One more left as draft, one more created then cancelled
so_draft = call("POST", "/sales/sales-orders", TOKEN, {"customerId": customers["CUS-001"]["id"], "warehouseId": AMD, "lines": [{"productId": pid("ROFF-ADH-20KG"), "productUnitId": pu("ROFF-ADH-20KG"), "quantity": 10, "rate": 450.00, "gstId": GST18}]})
so_to_cancel = call("POST", "/sales/sales-orders", TOKEN, {"customerId": customers["CUS-002"]["id"], "warehouseId": AMD, "lines": [{"productId": pid("BHM-MRB-MAKRANA-WHT"), "productUnitId": pu("BHM-MRB-MAKRANA-WHT"), "quantity": 1, "rate": 11500.00, "gstId": GST12}]})
if so_to_cancel:
    call("POST", f"/sales/sales-orders/{so_to_cancel['id']}/cancel", TOKEN)

for so_id in approved_so_ids:
    call("POST", f"/sales/sales-orders/{so_id}/approve", TOKEN)
print(f"  10 Sales Orders total ({len(approved_so_ids)} approved, 1 draft, 1 cancelled).")

# Delivery Challans: for each approved SO, fetch its lines and deliver in full; leave the last one undelivered
sales_invoices = []
for idx, so_id in enumerate(approved_so_ids):
    so = call("GET", f"/sales/sales-orders/{so_id}", TOKEN)
    if not so:
        continue
    dc_lines = [{"soLineId": line["id"], "productId": line["productId"], "productUnitId": line["productUnitId"], "quantity": line["quantity"]} for line in so["lines"]]
    dc = call("POST", "/sales/delivery-challans", TOKEN, {"soId": so_id, "customerId": so["customerId"], "warehouseId": AMD, "lines": dc_lines})
    if not dc:
        continue
    if idx == len(approved_so_ids) - 1:
        continue  # leave the last DC undelivered (draft)
    call("POST", f"/sales/delivery-challans/{dc['id']}/deliver", TOKEN)

    inv_lines = [{"productId": line["productId"], "productUnitId": line["productUnitId"], "quantity": line["quantity"], "rate": line["rate"], "gstId": line["gstId"]} for line in so["lines"]]
    inv = call("POST", "/sales/sales-invoices", TOKEN, {"customerId": so["customerId"], "dcId": dc["id"], "soId": so_id, "lines": inv_lines})
    if not inv:
        continue
    inv = call("POST", f"/sales/sales-invoices/{inv['id']}/approve", TOKEN)
    sales_invoices.append((inv["id"], so["customerId"], inv["totalAmount"]))
print(f"  {len(sales_invoices)} Delivery Challans delivered -> Sales Invoices approved (1 DC left undelivered).")

for idx, (inv_id, cust_id, total) in enumerate(sales_invoices):
    if idx < 5:
        amount = total
    elif idx == 5:
        amount = round(total * 0.5, 2)
    else:
        continue
    call(
        "POST",
        "/sales/customer-payments",
        TOKEN,
        {"customerId": cust_id, "amount": amount, "paymentMode": "upi", "allocations": [{"salesInvoiceId": inv_id, "allocatedAmount": amount}]},
    )
print("  Customer payments posted (5 full, 1 partial, 1 left outstanding).")

for cust_code, sku, qty, rate, reason in [
    ("CUS-001", "KAJ-VIT-600-WHT", 2, 650.00, "Wrong size ordered"),
    ("CUS-007", "JHN-CWT-300-FLR", 5, 399.00, "Customer changed design"),
]:
    ret = call(
        "POST",
        "/sales/sales-returns",
        TOKEN,
        {"customerId": customers[cust_code]["id"], "warehouseId": AMD, "reason": reason, "lines": [{"productId": pid(sku), "quantity": qty, "rate": rate}]},
    )
    if ret:
        call("POST", f"/sales/sales-returns/{ret['id']}/approve", TOKEN)
print("  2 Sales Returns posted.")

# ============================================================================================
# INVENTORY — remaining movement types (transfer already done above)
# ============================================================================================
print("\n=== Inventory: remaining movements ===")

for from_wh, to_wh, sku, qty in [(AMD, MRB, "SOM-VIT-800-GRY", 10), (AMD, KGH, "ROFF-ADH-20KG", 20)]:
    t = call("POST", "/inventory/stock-transfers", TOKEN, {"fromWarehouseId": from_wh, "toWarehouseId": to_wh, "lines": [{"productId": pid(sku), "quantity": qty}]})
    if t:
        call("POST", f"/inventory/stock-transfers/{t['id']}/approve", TOKEN)
print("  3 Stock Transfers total completed.")

for sku, adjusted_qty, reason in [("KAJ-VIT-600-WHT", 93, "Cycle count correction"), ("HIN-WC-OP-WHT", 38, "Recount after audit"), ("MYK-ADH-20KG", 145, "Bag count correction")]:
    adj = call("POST", "/inventory/stock-adjustments", TOKEN, {"warehouseId": AMD, "reason": reason, "lines": [{"productId": pid(sku), "adjustedQuantity": adjusted_qty}]})
    if adj:
        call("POST", f"/inventory/stock-adjustments/{adj['id']}/approve", TOKEN)
print("  3 Stock Adjustments completed.")

for sku, counted_qty in [("SOM-VIT-800-GRY", 58), ("CERA-BASIN-CMP-WHT", 49), ("AGL-POR-800-MRB", 29)]:
    pv = call("POST", "/inventory/physical-verifications", TOKEN, {"warehouseId": AMD, "lines": [{"productId": pid(sku), "countedQuantity": counted_qty}]})
    if pv:
        call("POST", f"/inventory/physical-verifications/{pv['id']}/complete", TOKEN)
print("  3 Physical Verifications completed.")

for sku, qty, reason in [("KAJ-VIT-600-WHT", 2, "Cracked during handling"), ("BHM-MRB-MAKRANA-WHT", 1, "Chipped edge"), ("HIN-WC-OP-WHT", 1, "Hairline crack found")]:
    d = call("POST", "/inventory/damaged-stock", TOKEN, {"warehouseId": AMD, "reason": reason, "lines": [{"productId": pid(sku), "quantity": qty}]})
    if d:
        call("POST", f"/inventory/damaged-stock/{d['id']}/approve", TOKEN)
print("  3 Damaged Stock entries completed.")

for sku, qty, reason in [("ROFF-ADH-20KG", 5, "Returned from job site, unused"), ("JHN-CWT-300-FLR", 10, "Returned from cancelled installation")]:
    sr = call("POST", "/inventory/stock-returns", TOKEN, {"warehouseId": AMD, "reason": reason, "lines": [{"productId": pid(sku), "quantity": qty}]})
    if sr:
        call("POST", f"/inventory/stock-returns/{sr['id']}/approve", TOKEN)
print("  2 internal Stock Returns completed.")

blocked_ids = []
for sku, qty, reason in [("AGL-POR-800-MRB", 2, "Reserved for quality inspection"), ("BHM-MRB-MAKRANA-WHT", 1, "Held for customer approval sample"), ("CERA-BASIN-CMP-WHT", 2, "Quality hold - awaiting QC")]:
    b = call("POST", "/inventory/blocked-stock", TOKEN, {"productId": pid(sku), "warehouseId": AMD, "quantity": qty, "reason": reason})
    if b:
        blocked_ids.append(b["id"])
for b_id in blocked_ids[:2]:
    call("POST", f"/inventory/blocked-stock/{b_id}/release", TOKEN)
print(f"  3 Blocked Stock entries created (2 released, 1 left blocked).")

reserved_ids = []
for sku, qty, ref_type in [("KAJ-VIT-600-WHT", 5, "sales_order"), ("MYK-ADH-20KG", 10, "quotation"), ("SOM-VIT-800-GRY", 3, "sales_order")]:
    r = call(
        "POST",
        "/inventory/reserved-stock",
        TOKEN,
        {"productId": pid(sku), "warehouseId": AMD, "quantity": qty, "referenceType": ref_type, "referenceId": pid(sku), "expiresAt": "2026-12-31T00:00:00.000Z"},
    )
    if r:
        reserved_ids.append(r["id"])
for r_id in reserved_ids[:2]:
    call("POST", f"/inventory/reserved-stock/{r_id}/release", TOKEN)
print(f"  3 Reserved Stock entries created (2 released, 1 left active).")

print("\nDone.")
