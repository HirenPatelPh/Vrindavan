import '../../../core/crud/column_spec.dart';
import '../../../core/crud/entity_spec.dart';
import '../../../core/crud/field_spec.dart';
import '../../../core/crud/format_helpers.dart';

final transporterSpec = EntitySpec(
  resourcePath: 'transporters',
  useDataGrid: true,
  pageSize: 12,
  title: 'Transporters',
  searchableKeys: const ['name', 'code', 'phone', 'vehicleNumber'],
  listColumns: [
    ColumnSpec(label: 'Code', format: (r) => orDash(r['code'])),
    ColumnSpec(label: 'Phone', format: (r) => orDash(r['phone'])),
    ColumnSpec(label: 'Vehicle no.', format: (r) => orDash(r['vehicleNumber'])),
    ColumnSpec(label: 'Status', format: activeLabel),
  ],
  formFields: const [
    FieldSpec(key: 'name', label: 'Name', type: FieldType.text, required: true, maxLength: 150),
    FieldSpec(key: 'code', label: 'Code', type: FieldType.text, required: true, maxLength: 30),
    FieldSpec(key: 'contactPerson', label: 'Contact person', type: FieldType.text, maxLength: 150),
    FieldSpec(key: 'phone', label: 'Phone', type: FieldType.text, maxLength: 30),
    FieldSpec(key: 'vehicleNumber', label: 'Vehicle number', type: FieldType.text, maxLength: 30),
    FieldSpec(key: 'gstNumber', label: 'GST number', type: FieldType.text, maxLength: 20),
    FieldSpec(key: 'isActive', label: 'Active', type: FieldType.boolean, defaultValue: true),
  ],
);
