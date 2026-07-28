import '../../../core/crud/field_spec.dart';
import '../../../core/documents/document_spec.dart';

final stockTransferSpec = DocumentSpec(
  resourcePath: 'inventory/stock-transfers',
  useDataGrid: true,
  pageSize: 12,
  title: 'Stock Transfers',
  numberKey: 'transferNumber',
  approveRoute: 'approve',
  approveLabel: 'Approve',
  headerFields: const [
    FieldSpec(key: 'fromWarehouseId', label: 'From warehouse', type: FieldType.dropdownFk, required: true, fkResource: 'warehouses'),
    FieldSpec(key: 'toWarehouseId', label: 'To warehouse', type: FieldType.dropdownFk, required: true, fkResource: 'warehouses'),
    FieldSpec(key: 'transferDate', label: 'Transfer date', type: FieldType.date),
    FieldSpec(key: 'remarks', label: 'Remarks', type: FieldType.longText),
  ],
  lineFields: const [
    FieldSpec(key: 'productId', label: 'Product', type: FieldType.dropdownFk, required: true, fkResource: 'products', fkCodeKey: 'sku'),
    FieldSpec(key: 'batchId', label: 'Batch (optional)', type: FieldType.dropdownFk, fkResource: 'products'),
    FieldSpec(key: 'fromRackId', label: 'From rack (optional)', type: FieldType.dropdownFk, fkResource: 'racks'),
    FieldSpec(key: 'fromLocationId', label: 'From location (optional)', type: FieldType.dropdownFk, fkResource: 'locations'),
    FieldSpec(key: 'toRackId', label: 'To rack (optional)', type: FieldType.dropdownFk, fkResource: 'racks'),
    FieldSpec(key: 'toLocationId', label: 'To location (optional)', type: FieldType.dropdownFk, fkResource: 'locations'),
    FieldSpec(key: 'quantity', label: 'Quantity', type: FieldType.decimal, required: true),
  ],
);
