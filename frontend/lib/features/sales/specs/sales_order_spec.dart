import '../../../core/crud/field_spec.dart';
import '../../../core/documents/document_spec.dart';

final salesOrderSpec = DocumentSpec(
  resourcePath: 'sales/sales-orders',
  useDataGrid: true,
  pageSize: 12,
  title: 'Sales Orders',
  numberKey: 'soNumber',
  approveRoute: 'approve',
  approveLabel: 'Approve',
  cancelRoute: 'cancel',
  cancelLabel: 'Cancel',
  cancelFromStatuses: const ['draft', 'approved'],
  summaryFields: const ['totalAmount'],
  headerFields: const [
    FieldSpec(key: 'customerId', label: 'Customer', type: FieldType.dropdownFk, required: true, fkResource: 'customers'),
    FieldSpec(key: 'warehouseId', label: 'Warehouse', type: FieldType.dropdownFk, required: true, fkResource: 'warehouses'),
    FieldSpec(key: 'soDate', label: 'SO date', type: FieldType.date),
    FieldSpec(key: 'expectedDeliveryDate', label: 'Expected delivery date', type: FieldType.date),
    FieldSpec(key: 'remarks', label: 'Remarks', type: FieldType.longText),
  ],
  lineFields: const [
    FieldSpec(key: 'productId', label: 'Product', type: FieldType.dropdownFk, required: true, fkResource: 'products', fkCodeKey: 'sku'),
    FieldSpec(key: 'productUnitId', label: 'Unit', type: FieldType.dropdownFk, required: true, fkResource: 'products'),
    FieldSpec(key: 'quantity', label: 'Quantity', type: FieldType.decimal, required: true),
    FieldSpec(key: 'rate', label: 'Rate', type: FieldType.decimal, required: true),
    FieldSpec(key: 'discountPercent', label: 'Discount %', type: FieldType.decimal, defaultValue: 0),
    FieldSpec(key: 'gstId', label: 'GST rate (optional)', type: FieldType.dropdownFk, fkResource: 'gst-rates'),
  ],
);
