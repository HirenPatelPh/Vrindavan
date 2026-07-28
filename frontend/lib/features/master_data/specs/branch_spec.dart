import '../../../core/crud/column_spec.dart';
import '../../../core/crud/entity_spec.dart';
import '../../../core/crud/field_spec.dart';
import '../../../core/crud/format_helpers.dart';

final branchSpec = EntitySpec(
  resourcePath: 'branches',
  useDataGrid: true,
  pageSize: 12,
  title: 'Branches',
  searchableKeys: const ['name', 'code', 'city'],
  listColumns: [
    ColumnSpec(label: 'Code', format: (r) => orDash(r['code'])),
    ColumnSpec(label: 'City', format: (r) => orDash(r['city'])),
    ColumnSpec(label: 'Status', format: activeLabel),
  ],
  formFields: const [
    FieldSpec(key: 'name', label: 'Name', type: FieldType.text, required: true, maxLength: 150),
    FieldSpec(key: 'code', label: 'Code', type: FieldType.text, required: true, maxLength: 30),
    FieldSpec(key: 'isHeadOffice', label: 'Head office', type: FieldType.boolean, defaultValue: false),
    FieldSpec(key: 'addressLine1', label: 'Address line 1', type: FieldType.text, maxLength: 200),
    FieldSpec(key: 'addressLine2', label: 'Address line 2', type: FieldType.text, maxLength: 200),
    FieldSpec(key: 'city', label: 'City', type: FieldType.text, maxLength: 100),
    FieldSpec(key: 'state', label: 'State', type: FieldType.text, maxLength: 100),
    FieldSpec(key: 'country', label: 'Country', type: FieldType.text, maxLength: 100),
    FieldSpec(key: 'pincode', label: 'Pincode', type: FieldType.text, maxLength: 20),
    FieldSpec(key: 'phone', label: 'Phone', type: FieldType.text, maxLength: 30),
    FieldSpec(key: 'email', label: 'Email', type: FieldType.email),
    FieldSpec(key: 'isActive', label: 'Active', type: FieldType.boolean, defaultValue: true),
  ],
);
