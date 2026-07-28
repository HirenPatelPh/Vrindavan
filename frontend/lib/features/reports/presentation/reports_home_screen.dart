import 'package:flutter/material.dart';
import '../../../core/widgets/nav_card.dart';
import '../reports_registry.dart';

const _icons = <String, IconData>{
  'reports/sales-register': Icons.menu_book_outlined,
  'reports/purchase-register': Icons.menu_book_outlined,
  'reports/sales-by-product': Icons.bar_chart_outlined,
  'reports/purchase-by-product': Icons.bar_chart_outlined,
  'reports/sales-by-customer': Icons.groups_outlined,
  'reports/purchase-by-supplier': Icons.local_shipping_outlined,
  'reports/gst-output-summary': Icons.receipt_long_outlined,
  'reports/gst-input-summary': Icons.receipt_long_outlined,
};

/// Landing screen for the Reports nav destination — grouped [NavCard]s (icon + label). Reports
/// need a date range to run, so they carry no count badge.
class ReportsHomeScreen extends StatelessWidget {
  const ReportsHomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Reports')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          for (final group in reportGroups) ...[
            Padding(
              padding: const EdgeInsets.only(bottom: 12, top: 8),
              child: Text(group.title, style: Theme.of(context).textTheme.titleMedium),
            ),
            Wrap(
              spacing: 12,
              runSpacing: 12,
              children: [
                for (final spec in group.specs)
                  NavCard(
                    icon: _icons[spec.resourcePath] ?? Icons.bar_chart_outlined,
                    title: spec.title,
                    route: '/${spec.resourcePath}',
                  ),
              ],
            ),
            const SizedBox(height: 24),
          ],
        ],
      ),
    );
  }
}
