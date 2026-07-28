# ER Diagram — Product & Inventory (tenant schema)

`stock_ledger` is the append-only source of truth; `stock_balances` is the maintained
summary every screen actually reads from (see `functions/002_stock_functions.sql`).

```mermaid
erDiagram
    PRODUCTS ||--o{ PRODUCT_IMAGES : has
    PRODUCTS ||--o{ PRODUCT_UNITS : has
    PRODUCTS ||--o{ PRODUCT_BATCHES : has
    PRODUCTS ||--o{ PRODUCT_BARCODES : has
    PRODUCTS ||--o{ PRODUCT_PRICE_HISTORY : logs
    PRODUCTS }o--|| CATEGORIES : "belongs to"
    PRODUCTS }o--|| BRANDS : "belongs to"
    PRODUCTS }o--|| UNITS : "base unit"

    PRODUCTS ||--o{ STOCK_LEDGER : moves
    PRODUCTS ||--o{ STOCK_BALANCES : "on hand"
    WAREHOUSES ||--o{ STOCK_LEDGER : at
    WAREHOUSES ||--o{ STOCK_BALANCES : at
    PRODUCT_BATCHES ||--o{ STOCK_LEDGER : of
    PRODUCT_BATCHES ||--o{ STOCK_BALANCES : of

    STOCK_TRANSFERS ||--o{ STOCK_TRANSFER_LINES : has
    STOCK_ADJUSTMENTS ||--o{ STOCK_ADJUSTMENT_LINES : has
    PHYSICAL_VERIFICATIONS ||--o{ PHYSICAL_VERIFICATION_LINES : has
    DAMAGED_STOCK ||--o{ DAMAGED_STOCK_LINES : has
    STOCK_RETURNS ||--o{ STOCK_RETURN_LINES : has

    PRODUCTS ||--o{ RESERVED_STOCK : reserved
    PRODUCTS ||--o{ BLOCKED_STOCK_ENTRIES : blocked

    PRODUCTS {
        uuid id PK
        varchar sku UK
        varchar barcode UK
        uuid category_id FK
        uuid base_unit_id FK
        numeric reorder_level
        numeric minimum_stock
        integer pieces_per_box
        integer pieces_per_bag
        boolean has_batch_tracking
    }
    PRODUCT_UNITS {
        uuid id PK
        uuid product_id FK
        uuid unit_id FK
        numeric conversion_factor
        boolean is_base_unit
    }
    PRODUCT_BATCHES {
        uuid id PK
        uuid product_id FK
        varchar batch_number
        date expiry_date
    }
    STOCK_LEDGER {
        uuid id PK
        uuid product_id FK
        uuid warehouse_id FK
        uuid batch_id FK
        varchar movement_type
        numeric qty_in
        numeric qty_out
        numeric unit_cost
        varchar reference_type
        uuid reference_id
    }
    STOCK_BALANCES {
        uuid id PK
        uuid product_id FK
        uuid warehouse_id FK
        uuid batch_id FK
        numeric quantity
        numeric reserved_quantity
        numeric blocked_quantity
        numeric average_cost
    }
    RESERVED_STOCK {
        uuid id PK
        uuid product_id FK
        numeric quantity
        varchar reference_type
        timestamptz expires_at
        varchar status
    }
    BLOCKED_STOCK_ENTRIES {
        uuid id PK
        uuid product_id FK
        numeric quantity
        varchar status
    }
```
