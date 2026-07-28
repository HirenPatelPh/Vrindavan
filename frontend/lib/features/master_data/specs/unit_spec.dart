import '../../../core/crud/column_spec.dart';
import '../../../core/crud/entity_spec.dart';
import '../../../core/crud/field_spec.dart';
import '../../../core/crud/format_helpers.dart';

/// The Phase 2 "prove the pattern" vertical slice (`backend/src/modules/units`) — predates the
/// 14-module master-data sweep but has the exact same uniform shape, and Products need it as an
/// FK target (base unit + per-product unit variants), so it gets a 15th spec here.
final unitSpec = EntitySpec(
  resourcePath: 'units',
  useDataGrid: true,
  pageSize: 12,
  title: 'Units',
  searchableKeys: const ['name', 'shortCode'],
  listColumns: [
    ColumnSpec(label: 'Short code', format: (r) => orDash(r['shortCode'])),
    ColumnSpec(label: 'Status', format: activeLabel),
  ],
  formFields: const [
    FieldSpec(key: 'name', label: 'Name', type: FieldType.text, required: true, maxLength: 50),
    FieldSpec(key: 'shortCode', label: 'Short code', type: FieldType.text, required: true, maxLength: 10),
    FieldSpec(key: 'isActive', label: 'Active', type: FieldType.boolean, defaultValue: true),
  ],
);
