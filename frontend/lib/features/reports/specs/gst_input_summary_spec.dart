import '../../../core/crud/column_spec.dart';
import '../../../core/reports/report_spec.dart';
import '../report_format_helpers.dart';

final gstInputSummarySpec = ReportSpec(
  resourcePath: 'reports/gst-input-summary',
  title: 'GST Input Summary',
  columns: [
    ColumnSpec(label: 'GST Rate', format: (r) => r['gstRateName']?.toString() ?? 'No GST'),
    ColumnSpec(label: 'Rate %', format: (r) => '${r['totalRate']}'),
    ColumnSpec(label: 'Taxable Value', format: (r) => money(r['taxableValue'])),
    ColumnSpec(label: 'Tax Amount', format: (r) => money(r['taxAmount'])),
    ColumnSpec(label: 'Invoices', format: (r) => '${r['invoiceCount']}'),
  ],
);
