import 'package:flutter/material.dart';
import '../../../core/widgets/nav_card.dart';
import '../sales_registry.dart';
import '../specs/quotation_spec.dart';
import 'customer_payment_form_screen.dart';

const _icons = <String, IconData>{
  'sales/quotations': Icons.request_quote_outlined,
  'sales/sales-orders': Icons.point_of_sale_outlined,
  'sales/delivery-challans': Icons.local_shipping_outlined,
  'sales/sales-invoices': Icons.receipt_long_outlined,
  'sales/sales-returns': Icons.assignment_return_outlined,
  'sales/customer-payments': Icons.payments_outlined,
  'sales/outstanding-receivables': Icons.account_balance_wallet_outlined,
};

class _Link {
  const _Link({required this.title, required this.path, this.count = false});
  final String title;
  final String path;
  final bool count;
}

class _Group {
  const _Group({required this.title, required this.icon, required this.links});
  final String title;
  final IconData icon;
  final List<_Link> links;
}

/// Landing screen for the Sales nav destination — grouped [NavCard]s (icon + count badge),
/// matching the Master Data home. Outstanding Receivables carries no count badge (date/filter
/// report, not a plain list resource).
class SalesHomeScreen extends StatelessWidget {
  const SalesHomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final groups = [
      _Group(
        title: 'Documents',
        icon: Icons.description_outlined,
        links: [
          _Link(title: quotationSpec.title, path: quotationSpec.resourcePath, count: true),
          for (final spec in salesDocumentSpecs) _Link(title: spec.title, path: spec.resourcePath, count: true),
        ],
      ),
      const _Group(
        title: 'Payments',
        icon: Icons.payments_outlined,
        links: [_Link(title: 'Customer Payments', path: customerPaymentResourcePath, count: true)],
      ),
      const _Group(
        title: 'Reports',
        icon: Icons.bar_chart_outlined,
        links: [_Link(title: 'Outstanding Receivables', path: 'sales/outstanding-receivables')],
      ),
    ];

    return Scaffold(
      appBar: AppBar(title: const Text('Sales')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          for (final group in groups) ...[
            Padding(
              padding: const EdgeInsets.only(bottom: 12, top: 8),
              child: Row(
                children: [
                  Icon(group.icon, size: 20),
                  const SizedBox(width: 8),
                  Text(group.title, style: Theme.of(context).textTheme.titleMedium),
                ],
              ),
            ),
            Wrap(
              spacing: 12,
              runSpacing: 12,
              children: [
                for (final link in group.links)
                  NavCard(
                    icon: _icons[link.path] ?? Icons.folder_outlined,
                    title: link.title,
                    route: '/${link.path}',
                    countResourcePath: link.count ? link.path : null,
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
