import '../../../core/crud/field_spec.dart';
import '../../../core/documents/document_spec.dart';

final salesInvoiceSpec = DocumentSpec(
  resourcePath: 'sales/sales-invoices',
  useDataGrid: true,
  pageSize: 12,
  title: 'Sales Invoices',
  numberKey: 'invoiceNumber',
  approveRoute: 'approve',
  approveLabel: 'Approve',
  summaryFields: const ['subtotal', 'taxAmount', 'discountAmount', 'totalAmount', 'paidAmount'],
  headerFields: const [
    FieldSpec(key: 'customerId', label: 'Customer', type: FieldType.dropdownFk, required: true, fkResource: 'customers'),
    FieldSpec(key: 'dcId', label: 'Delivery challan (optional)', type: FieldType.dropdownFk, fkResource: 'sales/delivery-challans', fkLabelKey: 'dcNumber'),
    FieldSpec(key: 'soId', label: 'Sales order (optional)', type: FieldType.dropdownFk, fkResource: 'sales/sales-orders', fkLabelKey: 'soNumber'),
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
