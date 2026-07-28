import '../../../core/crud/column_spec.dart';
import '../../../core/crud/entity_spec.dart';
import '../../../core/crud/field_spec.dart';
import '../../../core/crud/format_helpers.dart';

/// Near-identical to [supplierSpec] — the backend's own Create DTOs share ~90% of their fields;
/// the one addition here is `creditLimit`.
final customerSpec = EntitySpec(
  resourcePath: 'customers',
  useDataGrid: true,
  pageSize: 12,
  title: 'Customers',
  searchableKeys: const ['name', 'code', 'phone', 'email', 'gstin'],
  listColumns: [
    ColumnSpec(label: 'Code', format: (r) => orDash(r['code'])),
    ColumnSpec(label: 'City', format: (r) => orDash(r['city'])),
    ColumnSpec(label: 'Phone', format: (r) => orDash(r['phone'])),
    ColumnSpec(label: 'Status', format: activeLabel),
  ],
  formFields: const [
    FieldSpec(key: 'name', label: 'Name', type: FieldType.text, required: true, maxLength: 200),
    FieldSpec(key: 'code', label: 'Code', type: FieldType.text, required: true, maxLength: 30),
    FieldSpec(key: 'contactPerson', label: 'Contact person', type: FieldType.text, maxLength: 150),
    FieldSpec(key: 'email', label: 'Email', type: FieldType.email),
    FieldSpec(key: 'phone', label: 'Phone', type: FieldType.text, maxLength: 30),
    FieldSpec(key: 'gstin', label: 'GSTIN', type: FieldType.text, maxLength: 20),
    FieldSpec(key: 'pan', label: 'PAN', type: FieldType.text, maxLength: 15),
    FieldSpec(key: 'addressLine1', label: 'Address line 1', type: FieldType.text, maxLength: 200),
    FieldSpec(key: 'addressLine2', label: 'Address line 2', type: FieldType.text, maxLength: 200),
    FieldSpec(key: 'city', label: 'City', type: FieldType.text, maxLength: 100),
    FieldSpec(key: 'state', label: 'State', type: FieldType.text, maxLength: 100),
    FieldSpec(key: 'country', label: 'Country', type: FieldType.text, maxLength: 100),
    FieldSpec(key: 'pincode', label: 'Pincode', type: FieldType.text, maxLength: 20),
    FieldSpec(key: 'creditLimit', label: 'Credit limit', type: FieldType.decimal, defaultValue: 0),
    FieldSpec(key: 'creditPeriodDays', label: 'Credit period (days)', type: FieldType.integer, defaultValue: 0),
    FieldSpec(key: 'openingBalance', label: 'Opening balance', type: FieldType.decimal, defaultValue: 0),
    FieldSpec(key: 'isBlocked', label: 'Blocked', type: FieldType.boolean, defaultValue: false),
    FieldSpec(key: 'blockedReason', label: 'Blocked reason', type: FieldType.longText),
    FieldSpec(key: 'isActive', label: 'Active', type: FieldType.boolean, defaultValue: true),
  ],
);
