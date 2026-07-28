/// Describes one column on a [GenericListScreen] table/list row.
class ColumnSpec {
  const ColumnSpec({required this.label, required this.format});

  final String label;
  final String Function(Map<String, dynamic> record) format;
}
