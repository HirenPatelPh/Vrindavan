import '../../../core/crud/column_spec.dart';
import '../../../core/crud/entity_spec.dart';
import '../../../core/crud/field_spec.dart';
import '../../../core/crud/format_helpers.dart';

/// No `createdAt`/`updatedAt` on this module's response DTO.
final gstRateSpec = EntitySpec(
  resourcePath: 'gst-rates',
  useDataGrid: true,
  pageSize: 12,
  title: 'GST Rates',
  searchableKeys: const ['name'],
  listColumns: [
    ColumnSpec(label: 'Total rate', format: (r) => '${r['totalRate']}%'),
    ColumnSpec(label: 'Status', format: activeLabel),
  ],
  formFields: const [
    FieldSpec(key: 'name', label: 'Name', type: FieldType.text, required: true, maxLength: 30),
    FieldSpec(key: 'totalRate', label: 'Total rate %', type: FieldType.decimal, required: true),
    FieldSpec(key: 'cgstRate', label: 'CGST %', type: FieldType.decimal, required: true),
    FieldSpec(key: 'sgstRate', label: 'SGST %', type: FieldType.decimal, required: true),
    FieldSpec(key: 'igstRate', label: 'IGST %', type: FieldType.decimal, required: true),
    FieldSpec(key: 'isActive', label: 'Active', type: FieldType.boolean, defaultValue: true),
  ],
);
