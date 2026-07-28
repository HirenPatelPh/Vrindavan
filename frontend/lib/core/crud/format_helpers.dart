/// Shared list-column formatters — every one of the 14 master-data modules has an `isActive`
/// flag and various nullable string fields, so these are used across every EntitySpec's
/// `listColumns`.
String orDash(dynamic value) => (value == null || value.toString().isEmpty) ? '—' : value.toString();

String activeLabel(Map<String, dynamic> record) => (record['isActive'] as bool? ?? true) ? 'Active' : 'Inactive';
