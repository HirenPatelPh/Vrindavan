import '../../../core/crud/column_spec.dart';
import '../../../core/crud/entity_spec.dart';
import '../../../core/crud/field_spec.dart';
import '../../../core/crud/format_helpers.dart';

/// `userId` (links an employee to a login account) is omitted from the form — it points at the
/// `users` table, which isn't one of the 14 master-data modules and has no list endpoint to
/// pick from generically; out of scope for this pass per the Phase 10b research.
final employeeSpec = EntitySpec(
  resourcePath: 'employees',
  useDataGrid: true,
  pageSize: 12,
  title: 'Employees',
  searchableKeys: const ['name', 'code', 'designation', 'department', 'email'],
  listColumns: [
    ColumnSpec(label: 'Designation', format: (r) => orDash(r['designation'])),
    ColumnSpec(label: 'Department', format: (r) => orDash(r['department'])),
    ColumnSpec(label: 'Status', format: activeLabel),
  ],
  formFields: const [
    FieldSpec(key: 'name', label: 'Name', type: FieldType.text, required: true, maxLength: 150),
    FieldSpec(key: 'code', label: 'Code', type: FieldType.text, required: true, maxLength: 30),
    FieldSpec(key: 'designation', label: 'Designation', type: FieldType.text, maxLength: 100),
    FieldSpec(key: 'department', label: 'Department', type: FieldType.text, maxLength: 100),
    FieldSpec(key: 'phone', label: 'Phone', type: FieldType.text, maxLength: 30),
    FieldSpec(key: 'email', label: 'Email', type: FieldType.email),
    FieldSpec(key: 'joiningDate', label: 'Joining date', type: FieldType.date),
    FieldSpec(key: 'isActive', label: 'Active', type: FieldType.boolean, defaultValue: true),
  ],
);
