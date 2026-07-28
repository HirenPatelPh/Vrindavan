import '../../../core/crud/column_spec.dart';
import '../../../core/reports/report_spec.dart';
import '../report_format_helpers.dart';

final purchaseBySupplierSpec = ReportSpec(
  resourcePath: 'reports/purchase-by-supplier',
  title: 'Purchase by Supplier',
  columns: [
    ColumnSpec(label: 'Supplier', format: (r) => r['supplierName']?.toString() ?? ''),
    ColumnSpec(label: 'Amount', format: (r) => money(r['totalAmount'])),
    ColumnSpec(label: 'Invoices', format: (r) => '${r['invoiceCount']}'),
  ],
);
