import '../../../core/crud/column_spec.dart';
import '../../../core/reports/report_spec.dart';
import '../report_format_helpers.dart';

final purchaseByProductSpec = ReportSpec(
  resourcePath: 'reports/purchase-by-product',
  title: 'Purchase by Product',
  rowRoute: (row) => '/products/${row['productId']}',
  columns: [
    ColumnSpec(label: 'Product', format: (r) => r['productName']?.toString() ?? ''),
    ColumnSpec(label: 'SKU', format: (r) => r['sku']?.toString() ?? ''),
    ColumnSpec(label: 'Quantity', format: (r) => '${r['totalQuantity']}'),
    ColumnSpec(label: 'Amount', format: (r) => money(r['totalAmount'])),
    ColumnSpec(label: 'Invoices', format: (r) => '${r['invoiceCount']}'),
  ],
);
