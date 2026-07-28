import '../../../core/crud/field_spec.dart';
import '../../../core/documents/document_spec.dart';

final physicalVerificationSpec = DocumentSpec(
  resourcePath: 'inventory/physical-verifications',
  useDataGrid: true,
  pageSize: 12,
  title: 'Physical Verifications',
  numberKey: 'verificationNumber',
  approveRoute: 'complete',
  approveLabel: 'Complete',
  headerFields: const [
    FieldSpec(key: 'warehouseId', label: 'Warehouse', type: FieldType.dropdownFk, required: true, fkResource: 'warehouses'),
    FieldSpec(key: 'verificationDate', label: 'Verification date', type: FieldType.date),
  ],
  lineFields: const [
    FieldSpec(key: 'productId', label: 'Product', type: FieldType.dropdownFk, required: true, fkResource: 'products', fkCodeKey: 'sku'),
    FieldSpec(key: 'batchId', label: 'Batch (optional)', type: FieldType.dropdownFk, fkResource: 'products'),
    FieldSpec(key: 'rackId', label: 'Rack (optional)', type: FieldType.dropdownFk, fkResource: 'racks'),
    FieldSpec(key: 'locationId', label: 'Location (optional)', type: FieldType.dropdownFk, fkResource: 'locations'),
    FieldSpec(key: 'countedQuantity', label: 'Counted quantity', type: FieldType.decimal, required: true),
    FieldSpec(key: 'remarks', label: 'Remarks', type: FieldType.longText),
  ],
);
