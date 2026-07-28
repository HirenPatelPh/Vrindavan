import '../../../core/crud/column_spec.dart';
import '../../../core/crud/entity_spec.dart';
import '../../../core/crud/field_spec.dart';
import '../../../core/crud/format_helpers.dart';

/// The only master-data module with a true backend enum (`taxType`), and no
/// `createdAt`/`updatedAt`.
const _taxTypeValues = ['gst', 'vat', 'cess', 'custom_duty', 'other'];
const _taxTypeLabels = {
  'gst': 'GST',
  'vat': 'VAT',
  'cess': 'Cess',
  'custom_duty': 'Custom duty',
  'other': 'Other',
};

final taxSpec = EntitySpec(
  resourcePath: 'taxes',
  useDataGrid: true,
  pageSize: 12,
  title: 'Taxes',
  searchableKeys: const ['name'],
  listColumns: [
    ColumnSpec(label: 'Type', format: (r) => _taxTypeLabels[r['taxType']] ?? orDash(r['taxType'])),
    ColumnSpec(label: 'Rate', format: (r) => '${r['rate']}%'),
    ColumnSpec(label: 'Status', format: activeLabel),
  ],
  formFields: const [
    FieldSpec(key: 'name', label: 'Name', type: FieldType.text, required: true, maxLength: 50),
    FieldSpec(
      key: 'taxType',
      label: 'Tax type',
      type: FieldType.enumSelect,
      required: true,
      enumValues: _taxTypeValues,
      enumLabels: _taxTypeLabels,
    ),
    FieldSpec(key: 'rate', label: 'Rate %', type: FieldType.decimal, required: true),
    FieldSpec(key: 'isActive', label: 'Active', type: FieldType.boolean, defaultValue: true),
  ],
);
