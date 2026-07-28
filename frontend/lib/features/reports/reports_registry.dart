import '../../core/reports/report_spec.dart';
import 'specs/gst_input_summary_spec.dart';
import 'specs/gst_output_summary_spec.dart';
import 'specs/purchase_by_product_spec.dart';
import 'specs/purchase_by_supplier_spec.dart';
import 'specs/purchase_register_spec.dart';
import 'specs/sales_by_customer_spec.dart';
import 'specs/sales_by_product_spec.dart';
import 'specs/sales_register_spec.dart';

/// One group of related reports for navigation display — purely a UI grouping, mirrors the
/// `MasterDataGroup`/`*Home Screen` grouping pattern used by every other module.
class ReportGroup {
  const ReportGroup({required this.title, required this.specs});

  final String title;
  final List<ReportSpec> specs;
}

final reportGroups = <ReportGroup>[
  ReportGroup(title: 'Registers', specs: [salesRegisterSpec, purchaseRegisterSpec]),
  ReportGroup(
    title: 'Breakdowns',
    specs: [salesByProductSpec, purchaseByProductSpec, salesByCustomerSpec, purchaseBySupplierSpec],
  ),
  ReportGroup(title: 'GST', specs: [gstOutputSummarySpec, gstInputSummarySpec]),
];

/// All 8 `ReportSpec`s flattened, for the router's generated loop.
final reportSpecs = <ReportSpec>[for (final group in reportGroups) ...group.specs];
