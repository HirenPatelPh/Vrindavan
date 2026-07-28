# Vrindavan — Live Client Demo Script

**A guided walkthrough for demoing the Inventory & Warehouse Management platform to a
prospective client** (framed around a tiles / marble & granite / sanitaryware / tile-adhesive
distribution business — the seeded demo data). Total runtime: **35–40 minutes** + Q&A.

---

## Before you start (presenter checklist)

- [ ] Backend running (`http://localhost:3000/api`), Postgres up, Flutter web running (`http://127.0.0.1:8080`)
- [ ] Login ready: company code `acme` / `admin@acme.example` / `Password123!`
- [ ] Browser window sized comfortably, zoom at 100%, other tabs/notifications closed
- [ ] **Do a dry run 15 minutes before the call** — click through the exact path below once.
      Web-based live demos can hiccup (slow network, a stale page). If anything misbehaves,
      fall back to *narrating over the pre-existing seeded data* instead of creating new records
      live — every module already has 10+ realistic records and several completed transactions,
      so you never *need* to create something live to prove a point. Live creation is for impact,
      not because it's the only evidence.
- [ ] Have this script open on a second screen/monitor, not the shared one.

**Narrative frame to open with:**
> "I'm going to show you this as if we've just onboarded your business. Let's say you're a
> distributor of tiles, marble, sanitaryware and adhesives — I'll walk the whole loop: setting
> up the company, configuring your catalog, and then a real purchase and a real sale, end to
> end, with reporting at the end. Everything you'll see is live — nothing is a mockup."

---

## 1. Tenant Onboarding (3–4 min)

**Show:** the signup screen (`/signup`).

**Talking points:**
- Every client gets their **own isolated workspace** the moment they sign up — company code,
  company name, and an admin account. No manual IT setup, no waiting on us to provision a server.
- This isn't "one shared database with a company filter" — under the hood, each tenant gets its
  **own database schema**. Data isolation is structural, not just an application-layer rule.
  That matters for security *and* for performance — one tenant's data volume never slows down
  another's.
- The moment you sign up, a full **role-based permission system** is already seeded — Admin,
  Manager, Warehouse Manager, Sales Person, Viewer — each with the right level of access out of
  the box. You don't have to configure permissions from scratch.

**What to click:** either do a real signup live (dramatic, but adds ~30 seconds and one more
live-dependency) *or* say "I already have a workspace set up for us" and log straight into the
`acme` demo tenant. **Recommendation: log straight in** — it's one less live step that can fail,
and you get to the substance faster.

**Future roadmap to mention here:** SSO/SAML for enterprise IT teams, a custom subdomain per
tenant, self-serve plan/billing tiers.

---

## 2. Master Data Setup (6–7 min)

**Show:** `/master` — the Master Data home screen, grouped into Organization / Catalog / Tax /
Parties.

**Talking points:**
- This is where your entire business structure lives: branches, warehouses down to rack/shelf
  level, your product categories and brands, tax codes, and every supplier/customer/employee/
  transporter you deal with.
- Open **Organization → Branches**: show the 10 seeded branches, anchored in real locations —
  point out Morbi (Gujarat, India's ceramic tile hub) and Kishangarh (Rajasthan, the marble hub)
  alongside metro branches. *"We modeled this exactly the way a real distributor is structured —
  sourcing branches near manufacturers, a central warehouse, and regional branches near your
  customers."*
- Drill one level: **Warehouses → Racks → Locations** — show the hierarchy for the Morbi
  warehouse (2 racks, 3 shelf-locations each). *"You can track stock down to the exact shelf if
  you want that level of granularity, or just at the warehouse level if you don't — it's
  optional depth, not forced complexity."*
- Open **Catalog → Brands**: show the 18 seeded brands (Kajaria, Somany, Hindware, Pidilite/
  Roff, etc.) — *"your actual supplier brands, ready to tag every product against."*
- Open **Tax → HSN Codes** and **GST Rates**: *"GST rates and HSN codes are modeled as reusable
  master data, not hardcoded — tiles at 18%, marble/granite at 12%, all correctly mapped, so
  every invoice downstream computes tax automatically and correctly."*
- **Live click, ~1 min:** create one new record live — e.g. add a new Supplier or a new Branch.
  Fill the form, save, watch it appear instantly in the list. *"This is the same generic,
  consistent form across all 15 master-data types — learn it once, use it everywhere."*
- Point out the **search box** on any list, and — if you delete-test something — the **referential
  integrity protection**: try deleting a Branch that has a Warehouse under it and show the clean
  error instead of a crash. *"The system won't let you accidentally orphan your data."*

**Future enhancement callout (explicitly worth raising here):**
- **Bulk import via Excel/CSV** — for Products, Customers, Suppliers, and opening master data.
  *"If you're migrating from spreadsheets or another system with thousands of SKUs, you
  shouldn't have to type them in one by one — bulk import is next on our roadmap."*
- **Bulk export** — for backup, offline analysis, or handing data to your accountant.
- **Barcode/QR label printing** directly from the product screen.
- **Custom fields** — tenant-configurable extra attributes without a code change.
- Field-level **audit history** (who changed what, when) — the underlying audit-log
  infrastructure already exists at the database level; surfacing it in the UI is a near-term
  addition, not a rebuild.

---

## 3. Product Catalog (5 min)

**Show:** `/products` — list of the 19 seeded products spanning Tiles, Marble & Granite,
Sanitaryware, and Adhesives.

**Talking points:**
- Search/filter the list live — *"searchable by name or SKU instantly."*
- Click into one product with real depth — e.g. **Kajaria Vitrified Tile 600x600 Glossy White**.
  Walk its 5 tabs:
  - **Units** — *"tiles are bought in boxes but sometimes sold by the piece — the system tracks
    the conversion factor automatically, so your stock quantity and costing are always correct
    regardless of which unit a transaction uses."*
  - **Batches** — *"adhesives and waterproofing compounds have a shelf life — batch and expiry
    tracking is built in for exactly that category of product."*
  - **Images** — upload a product photo live if you want a quick visual moment.
  - **Price History** — *"every time a price changes, this tab fills in automatically — zero
    extra work, it's a database-level audit trail, not something a user has to remember to log."*
  - **Barcodes** — multiple barcodes per product, one marked primary.

**Future enhancement callout:** bulk price-list import/export, product variant matrices (size ×
finish × color combinations common in tiles), and a public catalog/e-commerce sync so your
website always reflects live stock and pricing.

---

## 4. Inventory Management (6–7 min)

**Show:** `/inventory` home — Documents / Stock Control / Reports groups.

**Talking points:**
- Open **Stock Balances**: *"a live, real-time view of exactly what you have, in which
  warehouse, at what value — computed from actual movements, not a manually maintained number."*
- Open **Stock Ledger**: *"and this is the full audit trail behind that number — every single
  movement, in or out, with the reason, timestamped, permanent."*
- **Live click:** create a **Stock Transfer** — move a small quantity of tiles from the Morbi
  warehouse to the central Ahmedabad warehouse. Approve it. Flip back to Stock Balances and show
  the quantity move in real time. *"That's the core loop — create a document, approve it, and
  your stock position updates instantly and correctly, down to the base unit."*
- Briefly name the other 6 movement types without demoing all of them live (time-box this):
  **Stock Adjustments** (cycle-count corrections), **Physical Verification** (a formal count
  with an automatic system-vs-counted variance), **Damaged Stock** (write-offs), **Stock
  Returns** (internal returns, e.g. from a job site), **Blocked Stock** (quality holds), and
  **Reserved Stock** (committed but not yet delivered — with an expiry, so it doesn't sit
  reserved forever). *"Different businesses need different subsets of these — they're all here,
  used or not."*

---

## 5. Purchase Cycle — Procure to Pay (6–7 min)

**Show:** `/purchase` home.

**Talking points, walking the already-seeded PINV-FY2627-00001 through 00010 as the backbone,
then doing ONE small live cycle for impact:**

- Open **Purchase Orders**: show the 10 seeded orders against real supplier brands (Kajaria,
  Pidilite, Hindware, Bhandari Marble...). Click into one, show the line items and computed
  total.
- **Live click, ~2–3 min:** create a small new Purchase Order (1–2 lines) → **Approve** it →
  create a **Goods Received Note** against it → **Complete** it (watch stock increase — flip to
  Stock Balances briefly to prove it) → create a **Purchase Invoice** referencing that GRN →
  **Approve** it → post a **Supplier Payment** against it (partial, on purpose).
- Open **Outstanding Payables**: *"and here's exactly what you owe, and to whom, computed live
  — no separate spreadsheet needed."*
- Mention **Purchase Returns** in passing (already have 2 seeded) — *"and if goods come back to
  the supplier, that's tracked with full traceability back to the original invoice too."*

**Talking point to land:** *"Notice the full document chain — Order, to Goods Received, to
Invoice, to Payment — every one links back to the one before it. If your accountant ever asks
'where did this stock number come from,' you can trace it all the way back."*

---

## 6. Sales Cycle — Quote to Cash (6–7 min)

**Show:** `/sales` home. This mirrors Purchase, with one extra step worth highlighting.

**Talking points:**
- Open **Quotations** — show one, and its lifecycle: **Send → Accept → Convert to Sales Order**.
  *"This is the piece Purchase doesn't have — a quotation costs you nothing to create, and the
  moment your customer accepts, one click converts it into a live Sales Order — no re-typing the
  line items."*
- **Live click, ~2–3 min:** create a quick Quotation for one of the seeded customers → Send →
  Accept → **Convert to Sales Order** (pick a warehouse) — *watch it jump straight to the new
  Sales Order's detail screen.* Approve it.
- Create a **Delivery Challan** against it → **Deliver** it (stock decreases — flip to Stock
  Balances again if you want the callback). Create the **Sales Invoice** → Approve. Post a
  **Customer Payment**.
- Open **Outstanding Receivables**: *"who owes you money, and how much, live."*
- Mention **Sales Returns**: *"and this one's worth calling out specifically — when a customer
  returns goods, the system brings the stock back in at your actual cost, not the price you sold
  it for. That protects your margin reporting from getting distorted by returns."*

---

## 7. Reports & Business Intelligence (4–5 min)

**Show:** `/reports` home, plus a quick look back at `/dashboard`.

**Talking points:**
- **Dashboard**: *"the first thing anyone sees when they log in — today's sales, today's
  purchases, stock value, pending orders, at a glance."*
- **Sales Register / Purchase Register**: *"every invoice in a date range, filterable by
  customer/supplier and status — this is your accountant's daily view."*
- **GST Output Summary / GST Input Summary**: *"grouped by GST slab, taxable value and tax
  amount computed automatically — this alone can save real hours every month at GST filing
  time."*
- **Sales by Product / Purchase by Product / Sales by Customer / Purchase by Supplier**: *"which
  products are actually moving, which customers matter most — the decisions a distributor
  actually needs to make."*

---

## 8. Wrap-up (2–3 min)

**Recap the full loop out loud:**
> "So in the last half hour you saw the entire lifecycle — a company onboarded itself in
> minutes, we configured a real product catalog with brands, categories and tax codes, we
> brought stock in through a real purchase cycle, sold it back out through a real sales cycle
> with a quotation up front, moved stock between warehouses, and closed with reporting that
> already answers the questions your accountant asks every month. Every number you saw was
> computed live from the transactions, not typed in separately."

**Roadmap teaser (near-term, honest — these are genuinely planned, not vaporware):**
- **AI-assisted reorder suggestions** — low-stock alerts and demand-based reorder points, so the
  system tells you what to buy before you run out, not after.
- **Bulk import/export** (Excel/CSV) for master data and products — the single most requested
  onboarding accelerator.
- **Mobile app** — the platform is built on a cross-platform framework from day one, so the same
  codebase already targets Android, iOS, Windows and macOS, not just the web browser you saw
  today. A native mobile app for warehouse staff (barcode scanning, stock counts on a phone) is
  a natural, low-risk next step — it's not a separate rebuild.

**Then open the floor for questions.**

---

## Anticipated questions & suggested answers

**"Is our data really isolated from your other clients?"**
Yes — structurally, not just logically. Each tenant is provisioned its own database schema at
signup, not a shared table with a company-ID filter. There's no code path that can accidentally
leak one tenant's data into another's queries.

**"We already have thousands of products in spreadsheets — how do we migrate?"**
Today that's a one-time guided data load we do with you. Bulk CSV/Excel import is on the
near-term roadmap specifically to make this self-serve.

**"Can we customize workflows or add fields specific to our business?"**
The core document workflows (draft → approve → etc.) are consistent by design — that
consistency is what makes the system reliable and fast to learn. Tenant-configurable custom
fields are on the roadmap for the data you want to track that we haven't modeled yet.

**"What happens if two people edit the same stock at once?"**
Every stock movement is posted through the same transactional posting logic with row-level
locking — there's no scenario where two simultaneous transactions can silently corrupt a stock
balance.

**"Does this work offline, e.g. in a warehouse with poor signal?"**
Not today for the web app. It's a genuine, common ask for warehouse floor use — worth discussing
as part of the mobile-app roadmap conversation above.

**"What does onboarding actually look like for us?"**
Company signup takes minutes. Master data setup (your branches, warehouses, product catalog,
suppliers, customers) is the real onboarding work — typically the first 1–2 weeks depending on
catalog size, faster once bulk import ships.

**"How is tax handled — is this GST-compliant for India?"**
Yes — GST rates and HSN codes are first-class master data, tax is computed automatically on
every line of every purchase/sales document from those codes, and the GST Output/Input Summary
reports are grouped exactly the way you'd need for filing.
