/// Shared column formatters for report tables — every report has at least one money column and
/// several have a date column, so these are used across all 8 `ReportSpec`s.
String money(dynamic value) => '₹${value ?? 0}';

String dateOnly(dynamic value) => value == null ? '—' : value.toString().split('T').first;
