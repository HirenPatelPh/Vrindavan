import '../../../core/crud/column_spec.dart';
import '../../../core/crud/entity_spec.dart';
import '../../../core/crud/field_spec.dart';
import '../../../core/crud/format_helpers.dart';

/// Has no `name` field (only `code`/`description`) and no `createdAt`/`updatedAt`.
/// GenericListScreen's row title falls back to `code` when `name` is absent.
final hsnCodeSpec = EntitySpec(
  resourcePath: 'hsn-codes',
  useDataGrid: true,
  pageSize: 12,
  title: 'HSN Codes',
  searchableKeys: const ['code', 'description'],
  listColumns: [
    ColumnSpec(label: 'Description', format: (r) => orDash(r['description'])),
    ColumnSpec(label: 'Status', format: activeLabel),
  ],
  formFields: const [
    FieldSpec(key: 'code', label: 'Code', type: FieldType.text, required: true, maxLength: 15),
    FieldSpec(key: 'description', label: 'Description', type: FieldType.longText),
    FieldSpec(key: 'defaultGstId', label: 'Default GST rate', type: FieldType.dropdownFk, fkResource: 'gst-rates'),
    FieldSpec(key: 'isActive', label: 'Active', type: FieldType.boolean, defaultValue: true),
  ],
);
