import '../../../core/crud/field_spec.dart';
import '../../../core/documents/document_spec.dart';

/// The one purchase document with plain base-unit lines — no `productUnitId` at all, unlike
/// PO/GRN/Purchase Invoice.
final purchaseReturnSpec = DocumentSpec(
  resourcePath: 'purchase/purchase-returns',
  useDataGrid: true,
  pageSize: 12,
  title: 'Purchase Returns',
  numberKey: 'returnNumber',
  approveRoute: 'approve',
  approveLabel: 'Approve',
  summaryFields: const ['totalAmount'],
  headerFields: const [
    FieldSpec(key: 'supplierId', label: 'Supplier', type: FieldType.dropdownFk, required: true, fkResource: 'suppliers'),
    FieldSpec(key: 'warehouseId', label: 'Warehouse', type: FieldType.dropdownFk, required: true, fkResource: 'warehouses'),
    FieldSpec(key: 'purchaseInvoiceId', label: 'Purchase invoice (optional)', type: FieldType.dropdownFk, fkResource: 'purchase/purchase-invoices', fkLabelKey: 'invoiceNumber'),
    FieldSpec(key: 'returnDate', label: 'Return date', type: FieldType.date),
    FieldSpec(key: 'reason', label: 'Reason', type: FieldType.longText),
  ],
  lineFields: const [
    FieldSpec(key: 'productId', label: 'Product', type: FieldType.dropdownFk, required: true, fkResource: 'products', fkCodeKey: 'sku'),
    FieldSpec(key: 'batchId', label: 'Batch (optional)', type: FieldType.dropdownFk, fkResource: 'products'),
    FieldSpec(key: 'quantity', label: 'Quantity', type: FieldType.decimal, required: true),
    FieldSpec(key: 'rate', label: 'Rate', type: FieldType.decimal, required: true),
  ],
);
