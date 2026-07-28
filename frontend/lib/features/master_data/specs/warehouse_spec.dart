import '../../../core/crud/column_spec.dart';
import '../../../core/crud/entity_spec.dart';
import '../../../core/crud/field_spec.dart';
import '../../../core/crud/format_helpers.dart';

final warehouseSpec = EntitySpec(
  resourcePath: 'warehouses',
  useDataGrid: true,
  pageSize: 12,
  title: 'Warehouses',
  searchableKeys: const ['name', 'code', 'city'],
  listColumns: [
    ColumnSpec(label: 'Code', format: (r) => orDash(r['code'])),
    ColumnSpec(label: 'City', format: (r) => orDash(r['city'])),
    ColumnSpec(label: 'Status', format: activeLabel),
  ],
  formFields: const [
    FieldSpec(key: 'branchId', label: 'Branch', type: FieldType.dropdownFk, required: true, fkResource: 'branches'),
    FieldSpec(key: 'name', label: 'Name', type: FieldType.text, required: true, maxLength: 150),
    FieldSpec(key: 'code', label: 'Code', type: FieldType.text, required: true, maxLength: 30),
    FieldSpec(key: 'addressLine1', label: 'Address line 1', type: FieldType.text, maxLength: 200),
    FieldSpec(key: 'city', label: 'City', type: FieldType.text, maxLength: 100),
    FieldSpec(key: 'state', label: 'State', type: FieldType.text, maxLength: 100),
    FieldSpec(key: 'pincode', label: 'Pincode', type: FieldType.text, maxLength: 20),
    FieldSpec(key: 'managerId', label: 'Manager', type: FieldType.dropdownFk, fkResource: 'employees'),
    FieldSpec(key: 'isActive', label: 'Active', type: FieldType.boolean, defaultValue: true),
  ],
);
