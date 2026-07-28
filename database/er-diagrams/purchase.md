# ER Diagram — Purchase cycle (tenant schema)

`Purchase Order -> Goods Received Note -> Purchase Invoice -> Supplier Payment`, plus
Purchase Return. Same header/line + document-number pattern used everywhere.

```mermaid
erDiagram
    SUPPLIERS ||--o{ PURCHASE_ORDERS : "ordered from"
    PURCHASE_ORDERS ||--o{ PURCHASE_ORDER_LINES : has
    PURCHASE_ORDERS ||--o{ GOODS_RECEIVED_NOTES : fulfilled_by
    GOODS_RECEIVED_NOTES ||--o{ GRN_LINES : has
    PURCHASE_ORDER_LINES ||--o{ GRN_LINES : receives
    GOODS_RECEIVED_NOTES ||--o{ PURCHASE_INVOICES : invoiced_by
    PURCHASE_INVOICES ||--o{ PURCHASE_INVOICE_LINES : has
    SUPPLIERS ||--o{ PURCHASE_INVOICES : billed_to
    SUPPLIERS ||--o{ SUPPLIER_PAYMENTS : "paid by"
    SUPPLIER_PAYMENTS ||--o{ SUPPLIER_PAYMENT_ALLOCATIONS : allocates
    PURCHASE_INVOICES ||--o{ SUPPLIER_PAYMENT_ALLOCATIONS : "paid against"
    SUPPLIERS ||--o{ PURCHASE_RETURNS : "returned to"
    PURCHASE_INVOICES ||--o{ PURCHASE_RETURNS : "against"
    PURCHASE_RETURNS ||--o{ PURCHASE_RETURN_LINES : has

    PURCHASE_ORDERS {
        uuid id PK
        varchar po_number UK
        uuid supplier_id FK
        uuid warehouse_id FK
        varchar status
        numeric total_amount
    }
    GOODS_RECEIVED_NOTES {
        uuid id PK
        varchar grn_number UK
        uuid po_id FK
        uuid supplier_id FK
    }
    PURCHASE_INVOICES {
        uuid id PK
        varchar invoice_number UK
        uuid grn_id FK
        uuid supplier_id FK
        numeric total_amount
        numeric paid_amount
        varchar status
    }
    SUPPLIER_PAYMENTS {
        uuid id PK
        varchar payment_number UK
        uuid supplier_id FK
        numeric amount
    }
    PURCHASE_RETURNS {
        uuid id PK
        varchar return_number UK
        uuid supplier_id FK
        uuid purchase_invoice_id FK
    }
```
