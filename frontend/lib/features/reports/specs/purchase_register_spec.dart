import '../../../core/crud/column_spec.dart';
import '../../../core/crud/field_spec.dart';
import '../../../core/reports/report_spec.dart';
import '../report_format_helpers.dart';

const _statusValues = ['draft', 'approved', 'partially_paid', 'paid', 'cancelled'];
const _statusLabels = {
  'draft': 'Draft',
  'approved': 'Approved',
  'partially_paid': 'Partially paid',
  'paid': 'Paid',
  'cancelled': 'Cancelled',
};

final purchaseRegisterSpec = ReportSpec(
  resourcePath: 'reports/purchase-register',
  title: 'Purchase Register',
  rowRoute: (row) => '/purchase/purchase-invoices/${row['invoiceId']}',
  extraFilters: const [
    FieldSpec(key: 'supplierId', label: 'Supplier (all)', type: FieldType.dropdownFk, fkResource: 'suppliers'),
    FieldSpec(
      key: 'status',
      label: 'Status (excl. cancelled if blank)',
      type: FieldType.enumSelect,
      enumValues: _statusValues,
      enumLabels: _statusLabels,
    ),
  ],
  columns: [
    ColumnSpec(label: 'Invoice #', format: (r) => r['invoiceNumber']?.toString() ?? ''),
    ColumnSpec(label: 'Supplier', format: (r) => r['supplierName']?.toString() ?? ''),
    ColumnSpec(label: 'Date', format: (r) => dateOnly(r['invoiceDate'])),
    ColumnSpec(label: 'Subtotal', format: (r) => money(r['subtotal'])),
    ColumnSpec(label: 'Tax', format: (r) => money(r['taxAmount'])),
    ColumnSpec(label: 'Discount', format: (r) => money(r['discountAmount'])),
    ColumnSpec(label: 'Total', format: (r) => money(r['totalAmount'])),
    ColumnSpec(label: 'Paid', format: (r) => money(r['paidAmount'])),
    ColumnSpec(label: 'Status', format: (r) => r['status']?.toString() ?? ''),
  ],
);
