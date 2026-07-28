import '../../../core/crud/field_spec.dart';
import '../../../core/documents/document_spec.dart';

final purchaseInvoiceSpec = DocumentSpec(
  resourcePath: 'purchase/purchase-invoices',
  useDataGrid: true,
  pageSize: 12,
  title: 'Purchase Invoices',
  numberKey: 'invoiceNumber',
  approveRoute: 'approve',
  approveLabel: 'Approve',
  summaryFields: const ['subtotal', 'taxAmount', 'discountAmount', 'totalAmount', 'paidAmount'],
  headerFields: const [
    FieldSpec(key: 'supplierId', label: 'Supplier', type: FieldType.dropdownFk, required: true, fkResource: 'suppliers'),
    FieldSpec(key: 'grnId', label: 'GRN (optional)', type: FieldType.dropdownFk, fkResource: 'purchase/goods-received-notes', fkLabelKey: 'grnNumber'),
    FieldSpec(key: 'poId', label: 'Purchase order (optional)', type: FieldType.dropdownFk, fkResource: 'purchase/purchase-orders', fkLabelKey: 'poNumber'),
    FieldSpec(key: 'supplierInvoiceNumber', label: "Supplier's invoice number", type: FieldType.text, maxLength: 60),
    FieldSpec(key: 'invoiceDate', label: 'Invoice date', type: FieldType.date),
    FieldSpec(key: 'dueDate', label: 'Due date', type: FieldType.date),
    FieldSpec(key: 'discountAmount', label: 'Header discount', type: FieldType.decimal, defaultValue: 0),
  ],
  lineFields: const [
    FieldSpec(key: 'productId', label: 'Product', type: FieldType.dropdownFk, required: true, fkResource: 'products', fkCodeKey: 'sku'),
    FieldSpec(key: 'productUnitId', label: 'Unit', type: FieldType.dropdownFk, required: true, fkResource: 'products'),
    FieldSpec(key: 'batchId', label: 'Batch (optional)', type: FieldType.dropdownFk, fkResource: 'products'),
    FieldSpec(key: 'quantity', label: 'Quantity', type: FieldType.decimal, required: true),
    FieldSpec(key: 'rate', label: 'Rate', type: FieldType.decimal, required: true),
    FieldSpec(key: 'discountPercent', label: 'Discount %', type: FieldType.decimal, defaultValue: 0),
    FieldSpec(key: 'gstId', label: 'GST rate (optional)', type: FieldType.dropdownFk, fkResource: 'gst-rates'),
  ],
);
