import '../crud/column_spec.dart';
import '../crud/field_spec.dart';

/// Declarative description of one of the 8 read-only report endpoints — all share the same
/// scaffolding (required `fromDate`/`toDate`, optional extra filters, a flat unpaginated result
/// array, already fully denormalized so no FK resolution is ever needed). See
/// `lib/features/reports/specs/` for the 8 concrete instances.
class ReportSpec {
  const ReportSpec({
    required this.resourcePath,
    required this.title,
    required this.columns,
    this.extraFilters = const [],
    this.rowRoute,
  });

  /// URL path segment and REST resource, e.g. `'reports/sales-register'`.
  final String resourcePath;

  final String title;

  /// Result-table columns, reusing the same `{label, format}` shape as the master-data list
  /// screens.
  final List<ColumnSpec> columns;

  /// Filters beyond the mandatory date range — e.g. `customerId`/`status` for the register
  /// reports. Empty for the other 6.
  final List<FieldSpec> extraFilters;

  /// Optional drill-down target for a tapped row, e.g. into the source Sales Invoice or Product
  /// detail screen. Null means rows aren't tappable.
  final String Function(Map<String, dynamic> row)? rowRoute;
}
