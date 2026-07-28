import '../../../core/crud/field_spec.dart';
import '../../../core/documents/document_spec.dart';

/// The one sales document with plain base-unit lines — no `productUnitId` at all, unlike
/// Quotation/SO/DC/Sales Invoice. Approve posts `return_in` at live average cost falling back to
/// `purchasePrice`, never the line's own `rate` (which only feeds the display total).
final salesReturnSpec = DocumentSpec(
  resourcePath: 'sales/sales-returns',
  useDataGrid: true,
  pageSize: 12,
  title: 'Sales Returns',
  numberKey: 'returnNumber',
  approveRoute: 'approve',
  approveLabel: 'Approve',
  summaryFields: const ['totalAmount'],
  headerFields: const [
    FieldSpec(key: 'customerId', label: 'Customer', type: FieldType.dropdownFk, required: true, fkResource: 'customers'),
    FieldSpec(key: 'warehouseId', label: 'Warehouse', type: FieldType.dropdownFk, required: true, fkResource: 'warehouses'),
    FieldSpec(key: 'salesInvoiceId', label: 'Sales invoice (optional)', type: FieldType.dropdownFk, fkResource: 'sales/sales-invoices', fkLabelKey: 'invoiceNumber'),
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
