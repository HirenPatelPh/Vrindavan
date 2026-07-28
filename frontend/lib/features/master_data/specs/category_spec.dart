import '../../../core/crud/column_spec.dart';
import '../../../core/crud/entity_spec.dart';
import '../../../core/crud/field_spec.dart';
import '../../../core/crud/format_helpers.dart';

final categorySpec = EntitySpec(
  resourcePath: 'categories',
  useDataGrid: true,
  pageSize: 12,
  title: 'Categories',
  searchableKeys: const ['name', 'code'],
  listColumns: [
    ColumnSpec(label: 'Code', format: (r) => orDash(r['code'])),
    ColumnSpec(label: 'Status', format: activeLabel),
  ],
  formFields: const [
    FieldSpec(key: 'name', label: 'Name', type: FieldType.text, required: true, maxLength: 100),
    FieldSpec(key: 'code', label: 'Code', type: FieldType.text, required: true, maxLength: 30),
    FieldSpec(key: 'isActive', label: 'Active', type: FieldType.boolean, defaultValue: true),
  ],
);
