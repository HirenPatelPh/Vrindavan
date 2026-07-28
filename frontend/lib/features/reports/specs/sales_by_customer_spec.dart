import '../../../core/crud/column_spec.dart';
import '../../../core/reports/report_spec.dart';
import '../report_format_helpers.dart';

final salesByCustomerSpec = ReportSpec(
  resourcePath: 'reports/sales-by-customer',
  title: 'Sales by Customer',
  columns: [
    ColumnSpec(label: 'Customer', format: (r) => r['customerName']?.toString() ?? ''),
    ColumnSpec(label: 'Amount', format: (r) => money(r['totalAmount'])),
    ColumnSpec(label: 'Invoices', format: (r) => '${r['invoiceCount']}'),
  ],
);
