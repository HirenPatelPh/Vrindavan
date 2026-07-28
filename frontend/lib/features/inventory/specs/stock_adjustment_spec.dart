import '../../../core/crud/field_spec.dart';
import '../../../core/documents/document_spec.dart';

final stockAdjustmentSpec = DocumentSpec(
  resourcePath: 'inventory/stock-adjustments',
  useDataGrid: true,
  pageSize: 12,
  title: 'Stock Adjustments',
  numberKey: 'adjustmentNumber',
  approveRoute: 'approve',
  approveLabel: 'Approve',
  headerFields: const [
    FieldSpec(key: 'warehouseId', label: 'Warehouse', type: FieldType.dropdownFk, required: true, fkResource: 'warehouses'),
    FieldSpec(key: 'adjustmentDate', label: 'Adjustment date', type: FieldType.date),
    FieldSpec(key: 'reason', label: 'Reason', type: FieldType.longText),
  ],
  lineFields: const [
    FieldSpec(key: 'productId', label: 'Product', type: FieldType.dropdownFk, required: true, fkResource: 'products', fkCodeKey: 'sku'),
    FieldSpec(key: 'batchId', label: 'Batch (optional)', type: FieldType.dropdownFk, fkResource: 'products'),
    FieldSpec(key: 'rackId', label: 'Rack (optional)', type: FieldType.dropdownFk, fkResource: 'racks'),
    FieldSpec(key: 'locationId', label: 'Location (optional)', type: FieldType.dropdownFk, fkResource: 'locations'),
    FieldSpec(key: 'adjustedQuantity', label: 'Adjusted quantity', type: FieldType.decimal, required: true),
    FieldSpec(key: 'remarks', label: 'Remarks', type: FieldType.longText),
  ],
);
